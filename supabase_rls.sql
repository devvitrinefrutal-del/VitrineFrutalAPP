-- SCRIPT DE SEGURANÇA (RLS) - VITRINE FRUTAL (VERSÃO ULTRA-ROBUSTA)

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_ratings ENABLE ROW LEVEL SECURITY;

-- 2. LIMPEZA TOTAL DE POLÍTICAS ANTIGAS (Garantir que não haja duplicidade)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. POLÍTICAS DE LEITURA (Públicas)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Read Cultural" ON public.cultural_items FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

-- 4. POLÍTICAS DE ACESSO TOTAL PARA O DESENVOLVEDOR (Baseado no E-mail do JWT)
-- Esta regra é a mais poderosa e garante que o seu e-mail sempre tenha acesso.
CREATE POLICY "Dev Full Access Profiles" ON public.profiles FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');
CREATE POLICY "Dev Full Access Stores" ON public.stores FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');
CREATE POLICY "Dev Full Access Products" ON public.products FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');
CREATE POLICY "Dev Full Access Services" ON public.services FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');
CREATE POLICY "Dev Full Access Cultural" ON public.cultural_items FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');
CREATE POLICY "Dev Full Access Orders" ON public.orders FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');

-- 5. POLÍTICAS PARA USUÁRIOS COMUNS (Lojistas/Clientes)
-- Perfis: Usuário pode criar e editar o seu próprio
CREATE POLICY "User Manage Own Profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Lojas e Produtos: Apenas o dono
CREATE POLICY "Owner Manage Store" ON public.stores FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner Manage Product" ON public.products FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()));

-- Pedidos: Apenas clientes autenticados podem criar. Lojistas vêem pedidos de suas lojas
CREATE POLICY "Client Insert Order" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Involved Parties Read Order" ON public.orders FOR SELECT TO authenticated USING (client_id = auth.uid() OR EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()));
CREATE POLICY "Store Update Order Status" ON public.orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()));

-- Avaliações: Clientes criam, todos podem ler, ninguém pode editar/deletar
CREATE POLICY "Client Insert Rating" ON public.store_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Public Read Ratings" ON public.store_ratings FOR SELECT USING (true);
CREATE POLICY "Dev Full Access Ratings" ON public.store_ratings FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'devvitrinefrutal@gmail.com');

-- 6. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON public.store_ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON public.store_ratings(order_id);
