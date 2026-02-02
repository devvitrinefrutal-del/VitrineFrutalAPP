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
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        console.log('--- [DIAGNÓSTICO CRÍTICO] ---');
        console.log('URL DO BANCO:', supabaseUrl);

        setIsLoading(true);

        try {
            // Teste 1: Buscar do catálogo de tabelas para ver se 'stores' existe
            const { data: tables, error: tErr } = await supabase.from('stores').select('count', { count: 'exact', head: true });
            console.log('Teste de existência da tabela "stores":', { count: tables, error: tErr });

            // Busca de Lojas com log do JSON bruto
            const { data: sD, error: sE } = await supabase.from('stores').select('*');
            if (sE) console.error("ERRO LOJAS:", sE);
            else {
                console.log("DADOS BRUTOS LOJAS:", sD);
                if (sD) setStores(sD.map(s => ({ ...s, ownerId: s.owner_id || s.id_do_proprietário, deliveryFee: s.delivery_fee || s.taxa_entrega })));
            }

            // Busca de Produtos
            const { data: pD, error: pE } = await supabase.from('products').select('*');
            if (pE) console.error("ERRO PRODUTOS:", pE);
            else if (pD) setProducts(pD.map(p => ({ ...p, storeId: p.store_id || p.id_da_loja })));

            // Outras buscas... (mantendo a independência)
            supabase.from('services').select('*').then(({ data }) => data && setServices(data.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate }))));
            supabase.from('cultural_items').select('*').then(({ data }) => data && setCulturalItems(data));
            supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => data && setOrders(data.map(o => ({ ...o, storeId: o.store_id, createdAt: o.created_at }))));

        } catch (err: any) {
            console.error("ERRO NO FETCHDATA:", err);
            setConnectionError(true);
        } finally {
            setIsLoading(false);
        }
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
