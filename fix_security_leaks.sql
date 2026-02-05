-- [!] FIX-01: Proteção de Dados Pessoais (PII) na tabela Profiles
-- Este script restringe a visualização de perfis para evitar vazamento de dados sensíveis.

-- 1. Remover a política antiga insegura
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;

-- 2. Criar nova política: 
-- Qualquer pessoa pode ver informações BÁSICAS (apenas se necessário pelo app)
-- Mas aqui vamos ser conservadores: Usuário vê seu próprio perfil, e DEVs veem tudo.
CREATE POLICY "Users view own profile and DEVs view all" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'DEV'
    )
  );

-- 3. (Opcional) Se o app precisar que clientes vejam o NOME de Lojistas/Prestadores:
-- Adicione esta política específica:
CREATE POLICY "Allow public to see names of Lojistas and Prestadores" ON public.profiles
  FOR SELECT
  USING (role IN ('LOJISTA', 'PRESTADOR'));

-- [OBSERVAÇÃO]: A política acima ainda expõe phone/address/document de Lojistas.
-- O ideal seria uma VIEW para dados públicos ou restringir campos no SELECT do app.
-- Como medida emergencial, a política 2 é a mais segura.
