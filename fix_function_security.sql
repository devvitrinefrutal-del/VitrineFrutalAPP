-- CORREÇÃO DE SEGURANÇA INTELIGENTE (Auto-detectar assinatura)
-- Este script localiza a função process_order_stock (seja trigger ou RPC) e aplica a correção de search_path.

DO $$
DECLARE
    func_args text;
    func_name text := 'process_order_stock';
BEGIN
    -- Busca os argumentos da função (ex: "" para trigger, "jsonb" para RPC)
    SELECT pg_get_function_identity_arguments(p.oid)
    INTO func_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = func_name
    AND n.nspname = 'public';

    -- Se encontrou, aplica a correção
    IF func_args IS NOT NULL THEN
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', func_name, func_args);
        RAISE NOTICE 'SUCESSO: search_path corrigido para public.%I(%)', func_name, func_args;
    ELSE
        RAISE WARNING 'AVISO: Função % não encontrada no schema public. Verifique se o nome está correto.', func_name;
    END IF;
END $$;
