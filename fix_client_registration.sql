-- AJUSTE DE GATILHO: PERMITIR CADASTRO AUTOMÁTICO DE CLIENTES

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
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'CLIENTE') = 'CLIENTE' THEN true -- Clientes entram ativos!
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
