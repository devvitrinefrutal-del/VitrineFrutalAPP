-- MASTER FIX: CORREÇÃO DE LOGIN E PERFIS (VITRINE FRUTAL)
-- Este script garante que todos os perfis sejam criados corretamente e que o gatilho funcione sempre.

-- 1. Garantir que as colunas necessárias existem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Recriar a função de gerenciamento de novos usuários com segurança total
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
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'CLIENTE') = 'CLIENTE' THEN true -- Clientes sempre ativos
      ELSE false -- Lojistas e Prestadores aguardam aprovação
    END
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recriar o Gatilho (Trigger) para garantir que ele esteja ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. CORREÇÃO RETROATIVA: Criar perfis para usuários que já existem mas não possuem perfil
INSERT INTO public.profiles (id, name, email, role, is_active)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''), 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'CLIENTE'),
    CASE 
      WHEN email = 'devvitrinefrutal@gmail.com' THEN true 
      WHEN COALESCE(raw_user_meta_data->>'role', 'CLIENTE') = 'CLIENTE' THEN true 
      ELSE false 
    END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Ativar todos os clientes que porventura estejam desativados
UPDATE public.profiles 
SET is_active = true 
WHERE (role = 'CLIENTE' OR role = 'DEV') AND is_active = false;
