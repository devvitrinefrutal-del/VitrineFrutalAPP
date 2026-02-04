-- SCRIPT PARA IMPLEMENTAÇÃO DO MINI JORNAL (NOTÍCIAS)

-- 1. Criar a tabela de notícias
CREATE TABLE news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Cidade', 'Comércio', 'Utilidade Pública')),
  content TEXT NOT NULL,
  image TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso
-- Todos podem ver as notícias
CREATE POLICY "As notícias são públicas" ON news_items
  FOR SELECT USING (true);

-- Apenas DEVs podem gerenciar as notícias (inserção, atualização, deleção)
CREATE POLICY "DEVs gerenciam notícias" ON news_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'DEV'
    )
  );
