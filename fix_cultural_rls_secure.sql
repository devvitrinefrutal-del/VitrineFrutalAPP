-- CORREÇÃO DE SEGURANÇA (RLS) PARA GIRO CULTURAL
-- Restringe a gestão de itens culturais apenas para usuários com perfil 'DEV'

-- 1. Remove a política permissiva antiga
DROP POLICY IF EXISTS "Authenticated Manage Cultural Items" ON cultural_items;

-- 2. Cria a nova política restrita
CREATE POLICY "Authenticated Manage Cultural Items"
ON cultural_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'DEV'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'DEV'
  )
);

-- 3. Garante leitura pública (caso não exista)
DROP POLICY IF EXISTS "Public Read Cultural Items" ON cultural_items;
CREATE POLICY "Public Read Cultural Items"
ON cultural_items FOR SELECT
TO public
USING (true);
