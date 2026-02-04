-- CORREÇÃO DEFINITIVA DE PERMISSÕES (RLS) - MINI JORNAL
-- Execute este script no SQL Editor do Supabase para corrigir o erro "row-level security policy".

-- 1. Garante que a segurança está ativada na tabela correta
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- 2. Limpa todas as políticas antigas dessa tabela para evitar conflitos
DROP POLICY IF EXISTS "As notícias são públicas" ON public.news_items;
DROP POLICY IF EXISTS "DEVs gerenciam notícias" ON public.news_items;
DROP POLICY IF EXISTS "Devs via email" ON public.news_items;
DROP POLICY IF EXISTS "Dev Lucas" ON public.news_items;

-- 3. CRIA AS NOVAS POLÍTICAS

-- A) LEITURA: Todo mundo pode ler (Público, Logado ou Não)
CREATE POLICY "As notícias são públicas" 
ON public.news_items 
FOR SELECT 
USING (true);

-- B) ESCRITA (Criar/Editar/Apagar): Verifica se o usuário tem cargo 'DEV' no perfil
CREATE POLICY "DEVs gerenciam notícias" 
ON public.news_items 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'DEV'
    )
);

-- C) ESCRITA (Backup): Garante acesso EXCLUSIVO ao e-mail correto
CREATE POLICY "Devs via email" 
ON public.news_items 
FOR ALL 
TO authenticated 
USING (
    auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com'
);
