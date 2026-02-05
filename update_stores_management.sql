-- SCRIPT DE ATUALIZAÇÃO: GESTÃO DE LOJAS (PAUSAR/EXCLUIR)

-- 1. Adicionar coluna is_active à tabela stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Comentário Informativo
COMMENT ON COLUMN public.stores.is_active IS 'Indica se a loja está ativa e visível na vitrine.';
