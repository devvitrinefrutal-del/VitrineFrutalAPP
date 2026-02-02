import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Store, Product, Service, CulturalItem, Order, StoreRating } from '../../types';

export function useData(showError: (msg: string) => void) {
    const [stores, setStores] = useState<Store[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [culturalItems, setCulturalItems] = useState<CulturalItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [storeRatings, setStoreRatings] = useState<StoreRating[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [connectionError, setConnectionError] = useState(false);

    const fetchData = useCallback(() => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('--- [REDES] Iniciando Diagnóstico de Supabase... ---');
        console.log('[REDES] URL Alvo:', url);

        // TESTE 1: Ping via Fetch Nativo (Ignora o SDK)
        fetch(`${url}/rest/v1/`, { method: 'OPTIONS' })
            .then(r => console.log('--- [REDES] Resposta OPTIONS ok (Server está vivo):', r.status))
            .catch(e => console.error('--- [REDES] Falha de OPTIONS (Servidor Offline ou Bloqueado):', e));

        setIsLoading(true);

        // BUSCA DE LOJAS (Tentando capturar qualquer sinal)
        console.log('[DETETIVE] Pedindo lojas...');
        supabase.from('stores').select('*').then(({ data, error }) => {
            if (error) {
                console.error("[DETETIVE] Erro retornado pelo SDK:", error);
            } else {
                console.log(`[DETETIVE] Resposta recebida! Quantidade: ${data?.length || 0}`);
                if (data) setStores(data.map(s => ({
                    ...s,
                    ownerId: s.owner_id || s.id_do_proprietario || s.id_do_proprietário,
                    deliveryFee: s.delivery_fee || s.taxa_entrega
                })));
            }
        }).catch(err => console.error("[DETETIVE] Catch fatal no SDK:", err));

        // Timeout para liberar a tela e permitir navegar (Debug)
        setTimeout(() => {
            setIsLoading(false);
            console.warn('--- [REDES] O carregamento "desistiu" de esperar o Supabase após 5s. ---');
        }, 5000);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        stores, products, services, culturalItems, orders,
        ratings: storeRatings,
        loading: isLoading,
        connectionError,
        setStores, setProducts, setServices, setCulturalItems, setOrders, setStoreRatings,
        refreshData: fetchData
    };
}
