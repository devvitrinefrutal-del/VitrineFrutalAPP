-- Atualiza a função para ativar CLIENTES automaticamente no cadastro
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
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'CLIENTE') = 'CLIENTE' THEN true
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'CLIENTE') = 'DEV' THEN true
      ELSE false 
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

-- Ativa todos os clientes atuais que ficaram bloqueados indevidamente
UPDATE public.profiles 
SET is_active = true 
WHERE role = 'CLIENTE' OR role = 'DEV';
