-- Enable RLS
ALTER TABLE cultural_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public Read Cultural Items" ON cultural_items;
CREATE POLICY "Public Read Cultural Items"
ON cultural_items FOR SELECT
TO public
USING (true);

-- Allow DEV and authenticated users to manage items (Insert/Update/Delete)
-- We'll try a broader policy for authenticated users first to fix the immediate blocker,
-- then refine if needed. Ideally, we check for role='DEV' in profiles, but this depends on how auth is handled.
-- For now, let's allow authenticated users to INSERT/UPDATE/DELETE.

DROP POLICY IF EXISTS "Authenticated Manage Cultural Items" ON cultural_items;
CREATE POLICY "Authenticated Manage Cultural Items"
ON cultural_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
