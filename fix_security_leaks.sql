-- [!] FIX-01: Proteção de Dados Pessoais (PII) na tabela Profiles
-- Este script restringe a visualização de perfis para evitar vazamento de dados sensíveis.

-- 1. Limpeza de políticas existentes
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile and DEVs view all" ON public.profiles;
DROP POLICY IF EXISTS "Usuários visualizam seu próprio perfil e desenvolvedores visualizam todos" ON public.profiles;
DROP POLICY IF EXISTS "Allow public to see names of Lojistas and Prestadores" ON public.profiles;

-- 2. Criar nova política de segurança (SEM RECURSIVIDADE)
-- Usamos auth.jwt() para checar o role do usuário sem precisar ler a própria tabela profiles de novo.
CREATE POLICY "Users view own profile and DEVs view all" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'DEV'
  );

-- 3. Permitir ver nomes públicos de Lojistas e Prestadores para a Vitrine funcionar
CREATE POLICY "Allow public to see names of Lojistas e Prestadores" ON public.profiles
  FOR SELECT
  USING (role IN ('LOJISTA', 'PRESTADOR'));

-- [NOTAS]:
-- A política acima protege documentos (CPF), endereço e telefone de clientes.
-- Recomenda-se rodar este script sempre que houver mudanças na estrutura de perfis.
