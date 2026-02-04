-- CORREÇÃO DE SEGURANÇA (RLS) PARA NOTÍCIAS

-- 1. Garante que o RLS está ativado
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 2. Limpa políticas antigas para evitar duplicidade (erros de "policy already exists")
DROP POLICY IF EXISTS "As notícias são públicas" ON news_items;
DROP POLICY IF EXISTS "DEVs gerenciam notícias" ON news_items;

-- 3. Cria as políticas novamente

-- Permite que QUALQUER UM (mesmo sem login) leia as notícias
CREATE POLICY "As notícias são públicas" 
ON news_items FOR SELECT 
USING (true);

-- Permite que APENAS usuários com perfil 'DEV' criem, editem ou apaguem
CREATE POLICY "DEVs gerenciam notícias" 
ON news_items FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'DEV'
  )
);
