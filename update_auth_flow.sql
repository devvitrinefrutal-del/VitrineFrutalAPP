-- SCRIPT DE ATUALIZAÇÃO: FLUXO DE APROVAÇÃO DE LOJISTAS

-- 1. Adicionar coluna is_active à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- 2. Atualizar perfil DEV para sempre estar ativo
UPDATE public.profiles 
SET is_active = true 
WHERE role = 'DEV';

-- 3. Função para gerenciar novos usuários automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, is_active)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'CLIENTE'),
    CASE 
      WHEN new.email = 'devvitrinefrutal@gmail.com' THEN true 
      ELSE false -- Todos começam inativos, DEV aprova manualmente
    END
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger para o Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Comentário Informativo
COMMENT ON COLUMN public.profiles.is_active IS 'Indica se a conta do lojista/usuário foi aprovada pelo administrador.';
