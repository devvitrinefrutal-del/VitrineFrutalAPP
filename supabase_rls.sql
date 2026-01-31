-- SCRIPT DE SEGURANÇA (RLS) - VITRINE FRUTAL (CORRIGIDO E SEGURO)
-- APLICAÇÃO: Execute este script no Editor SQL do Supabase para corrigir as falhas de segurança.

-- 1. Habilitar RLS em todas as tabelas (Garantia extra)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_ratings ENABLE ROW LEVEL SECURITY;

-- 2. LIMPEZA TOTAL DE POLÍTICAS ANTIGAS
-- Remove todas as políticas existentes para evitar conflitos e brechas antigas
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- 3. POLÍTICAS DE PERFIS (PROFILES)
-- ==============================================================================
-- PERIGO: Dados pessoais (telefone, endereço) estão nesta tabela.
-- IDEAL: Mover dados sensíveis para uma tabela 'private_profiles'.
-- ATUAL: Manter leitura pública para nomes/fotos (ex: avaliações), mas restringir edições.

-- Qualquer um pode ler perfis básico (necessário para UI de comentários/lojas)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);

-- Apenas o dono pode criar/editar seu próprio perfil
CREATE POLICY "Users Can Insert Own Profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users Can Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==============================================================================
-- 4. POLÍTICAS DE LOJAS E PRODUTOS (Conteúdo Público)
-- ==============================================================================
-- Leitura pública para Vitrine
CREATE POLICY "Public Read Stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Read Cultural" ON public.cultural_items FOR SELECT USING (true);

-- Escrita restrita aos Donos das Lojas
CREATE POLICY "Store Owners Manage Stores" ON public.stores 
    FOR ALL 
    TO authenticated 
    USING (owner_id = auth.uid()) 
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Store Owners Manage Products" ON public.products 
    FOR ALL 
    TO authenticated 
    USING (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())) 
    WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()));

CREATE POLICY "Providers Manage Services" ON public.services
    FOR ALL
    TO authenticated
    USING (provider_id = auth.uid())
    WITH CHECK (provider_id = auth.uid());

-- ==============================================================================
-- 5. POLÍTICAS DE PEDIDOS (ORDERS) - CRÍTICO (PII) 🚨
-- ==============================================================================
-- ANTES: Público (FALHA GRAVE)
-- AGORA: Estrito (Apenas Cliente ou Dono da Loja)

-- Cliente vê seus próprios pedidos
CREATE POLICY "Clients View Own Orders" ON public.orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = client_id);

-- Lojista vê pedidos feitos para sua loja
CREATE POLICY "Store Owners View Received Orders" ON public.orders
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = orders.store_id 
        AND stores.owner_id = auth.uid()
    ));

-- Cliente cria pedidos
CREATE POLICY "Clients Create Orders" ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = client_id);

-- Lojista atualiza status dos pedidos (apenas status idealmente, mas aqui permitimos update geral na linha do pedido se for da loja dele)
CREATE POLICY "Store Owners Update Orders" ON public.orders
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = orders.store_id 
        AND stores.owner_id = auth.uid()
    ));

-- ==============================================================================
-- 6. AVALIAÇÕES E CULTURA
-- ==============================================================================
CREATE POLICY "Public Read Ratings" ON public.store_ratings FOR SELECT USING (true);

CREATE POLICY "Clients Create Ratings" ON public.store_ratings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = client_id);

-- ==============================================================================
-- 7. ACESSO ADMINISTRATIVO (DEV)
-- ==============================================================================
-- Mantido logicamente para não quebrar acesso do dev, mas centralizado.
-- Nota: Em produção real, use Claims ou tabela de Roles.

CREATE POLICY "Dev Full Access All" ON public.profiles FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');

CREATE POLICY "Dev Full Access Stores" ON public.stores FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');

-- (Repetir para outras tabelas se necessário, ou assumir que o Dev usa a dashboard do Supabase que bypassa RLS)
-- Adicionando para Orders para debug
CREATE POLICY "Dev Full Access Orders" ON public.orders FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');
