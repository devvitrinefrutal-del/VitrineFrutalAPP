-- [!] FIX-01: Proteção de Dados Pessoais (PII) na tabela Profiles
-- Este script restringe a visualização de perfis para evitar vazamento de dados sensíveis.

-- 1. Limpeza de políticas existentes (para evitar erro de "já existe")
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile and DEVs view all" ON public.profiles;
DROP POLICY IF EXISTS "Usuários visualizam seu próprio perfil e desenvolvedores visualizam todos" ON public.profiles;
DROP POLICY IF EXISTS "Allow public to see names of Lojistas and Prestadores" ON public.profiles;
DROP POLICY IF EXISTS "Permitir ver nomes de Lojistas e Prestadores" ON public.profiles;

-- 2. Criar nova política de segurança (Privacidade Total)
-- Usuário vê seu próprio perfil, e DEVs veem tudo.
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

-- 3. Criar política para permitir que o público veja dados BÁSICOS (Nomes)
-- Isso é necessário para que a Vitrine funcione (ver nome da loja/vendedor)
CREATE POLICY "Allow public to see names of Lojistas and Prestadores" ON public.profiles
  FOR SELECT
  USING (role IN ('LOJISTA', 'PRESTADOR'));

-- [NOTAS]:
-- A política acima protege documentos (CPF), endereço e telefone de clientes.
-- Recomenda-se rodar este script sempre que houver mudanças na estrutura de perfis.
