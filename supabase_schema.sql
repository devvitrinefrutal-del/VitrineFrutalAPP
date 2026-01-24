-- SCRIPT DE INICIALIZAÇÃO VITRINE FRUTAL

-- 1. Tabela de Perfis (Vinculada ao Auth do Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('DEV', 'LOJISTA', 'PRESTADOR', 'CLIENTE')),
  phone TEXT,
  document TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabela de Lojas
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  image TEXT,
  address TEXT,
  rating DECIMAL DEFAULT 5.0,
  whatsapp TEXT,
  email TEXT,
  cnpj TEXT,
  delivery_fee DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  description TEXT,
  image TEXT,
  images TEXT[],
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de Serviços
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  price_estimate TEXT,
  image TEXT,
  whatsapp TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela de Giro Cultural
CREATE TABLE cultural_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  description TEXT,
  date TEXT,
  image TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabela de Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  delivery_method TEXT,
  delivery_fee DECIMAL,
  total DECIMAL,
  status TEXT DEFAULT 'PENDENTE',
  items JSONB, -- Array de itens comprados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS) - Opcional para início rápido, mas recomendado
-- Por enquanto, vamos manter público para facilitar sua primeira conexão.
