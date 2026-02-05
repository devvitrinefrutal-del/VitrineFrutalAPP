-- SCRIPT DE LIMPEZA E TESTE (OPCIONAL)

-- Se você quiser resetar o usuário que está dando erro para testar do zero o novo fluxo:
-- Substitua 'email_do_usuario@exemplo.com' pelo e-mail problemático.

/*
DELETE FROM auth.users WHERE email = 'email_do_usuario@exemplo.com';
DELETE FROM public.profiles WHERE email = 'email_do_usuario@exemplo.com';
*/

-- Para aprovar um lojista manualmente após ele se cadastrar:
/*
UPDATE public.profiles 
SET is_active = true 
WHERE email = 'email_do_lojista@exemplo.com';
*/

-- VERIFICAÇÃO:
-- 1. Rode o script update_auth_flow.sql no editor SQL do Supabase.
-- 2. Limpe o cache do seu navegador ou deslogue do App.
-- 3. Tente se cadastrar novamente.
-- 4. Veja se o perfil é criado no banco automaticamente com is_active = false.
-- 5. Aprove via SQL e tente logar.
