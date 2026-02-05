-- CORREÇÃO DE SEGURANÇA EM MASSA (Auto-detectar assinatura)
-- Este script percorre uma lista de funções e aplica a correção search_path=public.

DO $$
DECLARE
    target_func text;
    func_args text;
    func_names text[] := ARRAY['process_order_stock', 'process_order_stock_sync'];
BEGIN
    FOREACH target_func IN ARRAY func_names
    LOOP
        -- Busca os argumentos da função atual
        SELECT pg_get_function_identity_arguments(p.oid)
        INTO func_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = target_func
        AND n.nspname = 'public';

        -- Se encontrou, aplica a correção
        IF func_args IS NOT NULL THEN
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', target_func, func_args);
            RAISE NOTICE 'SUCESSO: search_path corrigido para public.%I(%)', target_func, func_args;
        ELSE
            RAISE WARNING 'AVISO: Função % não encontrada no schema public.', target_func;
        END IF;
        
        -- Reset variables for next iteration
        func_args := NULL;
    END LOOP;
END $$;
