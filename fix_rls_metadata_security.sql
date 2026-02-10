-- [!] SEGURANÇA: Correção de Vulnerabilidade metadata insegura (user_metadata)
-- Este script substitui a checagem via JWT metadata por uma função segura no banco de dados.

BEGIN;

-- 1. Criar função com SECURITY DEFINER (Roda com privilégios de superuser para evitar recursividade)
-- SET search_path garante que a função sempre use o schema public de forma segura.
CREATE OR REPLACE FUNCTION public.is_dev()
RETURNS BOOLEAN AS $$
DECLARE
  is_dev_user BOOLEAN;
BEGIN
  -- Usamos COALESCE para garantir que SEMPRE retorne um booleano, prevenindo erros
  SELECT (role = 'DEV') INTO is_dev_user
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_dev_user, false);
EXCEPTION WHEN OTHERS THEN
  -- Em caso de qualquer erro (ex: migração pendente), retorna false e não quebra a consulta do usuário
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Atualizar a política na tabela profiles
-- Primeiro limpamos as versões anteriores para garantir uma aplicação limpa
DROP POLICY IF EXISTS "Users view own profile and DEVs view all" ON public.profiles;

-- Criamos a política estrita e segura
CREATE POLICY "Users view own profile and DEVs view all" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Regra de ouro: O usuário autenticado sempre consegue ver seus próprios dados básicos.
    -- Isso garante que o login e carregamento de perfil nunca falhem.
    auth.uid() = id 
    OR 
    -- Regra administrativa: Desenvolvedores podem ver todos os perfis.
    public.is_dev()
  );

COMMIT;

-- [NOTAS]:
-- - user_metadata da API Auth é editável pelo cliente e inseguro para RLS.
-- - Esta função utiliza o 'role' persistido no banco de dados (public.profiles).
-- - Execute este script no SQL Editor do Supabase.
