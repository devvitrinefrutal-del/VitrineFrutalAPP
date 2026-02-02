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
        console.log('--- [PASSO 1] Iniciando busca... ---');
        setIsLoading(true);

        try {
            // BUSCA DE LOJAS
            console.log('--- [PASSO 2] Solicitando LOJAS ao Supabase... ---');
            const { data: sD, error: sE } = await supabase.from('stores').select('*');

            if (sE) {
                console.error("--- [PASSO 2.1] ERRO AO BUSCAR LOJAS:", sE);
                setConnectionError(true);
            } else {
                console.log("--- [PASSO 2.2] LOJAS RECEBIDAS (Bruto):", sD);
                if (sD && sD.length > 0) {
                    setStores(sD.map(s => ({
                        ...s,
                        ownerId: s.owner_id || s.id_do_proprietario || s.id_do_proprietário,
                        deliveryFee: s.delivery_fee || s.taxa_entrega
                    })));
                } else {
                    console.warn("--- [PASSO 2.3] Apenas lista vazia retornada para LOJAS.");
                }
            }

            // BUSCA DE PRODUTOS
            console.log('--- [PASSO 3] Solicitando PRODUTOS... ---');
            const { data: pD, error: pE } = await supabase.from('products').select('*');
            if (pE) console.error("ERRO PRODUTOS:", pE);
            else if (pD) setProducts(pD.map(p => ({ ...p, storeId: p.store_id || p.id_da_loja })));

            // OUTROS (Serviços, Cultural, Pedidos)
            console.log('--- [PASSO 4] Solicitando demais tabelas... ---');
            supabase.from('services').select('*').then(({ data }) => data && setServices(data.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate }))));
            supabase.from('cultural_items').select('*').then(({ data }) => data && setCulturalItems(data));
            supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => data && setOrders(data.map(o => ({ ...o, storeId: o.store_id, createdAt: o.created_at }))));

        } catch (err: any) {
            console.error("--- [ERRO FATAL] ---", err);
        } finally {
            console.log('--- [PASSO FINAL] Finalizando carregamento. ---');
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchData();

        // Failsafe de 5 segundos para nunca travar o usuário
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(timeout);
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
