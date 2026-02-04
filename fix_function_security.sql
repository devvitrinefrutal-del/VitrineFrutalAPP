-- CORREÇÃO DE SEGURANÇA NA FUNÇÃO DE ESTOQUE
-- Define o search_path como 'public' para evitar sequestro de função

ALTER FUNCTION public.process_order_stock(JSONB) SET search_path = public;
