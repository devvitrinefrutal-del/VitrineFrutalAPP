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

    const fetchData = useCallback(async () => {
        console.log('--- [DIAGNÓSTICO] Iniciando teste de conexão... ---');

        // 1. Teste de Conectividade Bruta (Fetch)
        fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
            headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY }
        })
            .then(r => console.log('--- [DIAGNÓSTICO] Resposta bruta do Supabase:', r.status))
            .catch(e => console.error('--- [DIAGNÓSTICO] Falha total de rede:', e));

        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
            console.warn('--- [SISTEMA] Timeout atingido. Forçando renderização. ---');
        }, 8000); // Aumentado para 8s para dar chance a conexões lentas

        try {
            // Busca de Lojas
            supabase.from('stores').select('*').then(({ data, error }) => {
                if (error) console.error("Erro TB Lojas:", error);
                else {
                    console.log(`Lojas ok: ${data?.length}`);
                    if (data) setStores(data.map(s => ({ ...s, ownerId: s.owner_id, deliveryFee: s.delivery_fee })));
                }
            });

            // Busca de Produtos
            supabase.from('products').select('*').then(({ data, error }) => {
                if (error) console.error("Erro TB Produtos:", error);
                else if (data) setProducts(data.map(p => ({ ...p, storeId: p.store_id })));
            });

            // Outras buscas... (simplificadas para diagnóstico)
            supabase.from('services').select('*').then(({ data }) => data && setServices(data.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate }))));
            supabase.from('cultural_items').select('*').then(({ data }) => data && setCulturalItems(data));
            supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
                if (error) console.warn("Erro TB Pedidos (SQL?):", error.message);
                else if (data) setOrders(data.map(o => ({ ...o, storeId: o.store_id, clientId: o.client_id, customerName: o.customer_name, customerPhone: o.customer_phone, customerAddress: o.customer_address, deliveryMethod: o.delivery_method, deliveryFee: o.delivery_fee, dispatchedAt: o.dispatched_at, createdAt: o.created_at })));
            });

        } catch (err: any) {
            console.error("Erro fatal:", err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const t = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(t);
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
