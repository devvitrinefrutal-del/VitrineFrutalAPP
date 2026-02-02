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

        console.log('--- [REDES] Iniciando teste de conectividade bruta... ---');

        // TESTE DE CONEXÃO DIRETA (Sem o SDK do Supabase)
        fetch(`${url}/rest/v1/stores?select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        })
            .then(r => console.log('--- [REDES] Resposta direta da API (Status):', r.status))
            .catch(e => console.error('--- [REDES] Falha crítica de REDE (Fetch):', e));

        setIsLoading(true);

        // BUSCA VIA SDK
        supabase.from('stores').select('*').then(({ data, error }) => {
            if (error) console.error("[SDK] Erro Lojas:", error);
            else {
                console.log(`[SDK] Lojas recebidas: ${data?.length || 0}`);
                if (data) setStores(data.map(s => ({ ...s, ownerId: s.owner_id || s.id_do_proprietario, deliveryFee: s.total_entrega || s.delivery_fee })));
            }
        });

        supabase.from('products').select('*').then(({ data, error }) => {
            if (data) setProducts(data.map(p => ({ ...p, storeId: p.store_id || p.id_da_loja })));
        });

        // Timeout para não travar a tela
        setTimeout(() => setIsLoading(false), 4000);
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
