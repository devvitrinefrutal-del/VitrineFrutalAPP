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
        console.log('--- [DEBUG] Início fetchData ---');
        setIsLoading(true);
        setConnectionError(false);
        try {
            console.log('Buscando lojas...');
            const { data: storesD, error: storesE } = await supabase.from('stores').select('*');
            if (storesE) throw storesE;
            if (storesD) setStores(storesD.map(s => ({ ...s, ownerId: s.owner_id, deliveryFee: s.delivery_fee })));

            console.log('Buscando produtos...');
            const { data: productsD } = await supabase.from('products').select('*');
            if (productsD) setProducts(productsD.map(p => ({ ...p, storeId: p.store_id })));

            console.log('Buscando serviços...');
            const { data: servicesD } = await supabase.from('services').select('*');
            if (servicesD) setServices(servicesD.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate })));

            console.log('Buscando cultural...');
            const { data: cultD } = await supabase.from('cultural_items').select('*');
            if (cultD) setCulturalItems(cultD);

            console.log('Buscando avaliações...');
            const { data: ratD } = await supabase.from('store_ratings').select('*');
            if (ratD) setStoreRatings(ratD.map(r => ({ ...r, storeId: r.store_id, orderId: r.order_id, clientId: r.client_id, createdAt: r.created_at })));

            console.log('Buscando pedidos...');
            const { data: ordD } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (ordD) {
                setOrders(ordD.map(o => ({
                    ...o,
                    storeId: o.store_id,
                    clientId: o.client_id,
                    customerName: o.customer_name,
                    customerPhone: o.customer_phone,
                    customerAddress: o.customer_address,
                    deliveryMethod: o.delivery_method,
                    deliveryFee: o.delivery_fee,
                    dispatchedAt: o.dispatched_at,
                    createdAt: o.created_at
                })));
            }
            console.log('--- [DEBUG] Sucesso total ---');
        } catch (err: any) {
            console.error("Erro no fetchData:", err);
            setConnectionError(true);
            showError('Erro ao carregar dados: ' + err.message);
        } finally {
            console.log('--- [DEBUG] Fim fetchData ---');
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchData();

        // Failsafe: Se em 5 segundos não carregar, libera a tela
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [fetchData]);

    return {
        stores,
        products,
        services,
        culturalItems,
        orders,
        ratings: storeRatings,
        loading: isLoading,
        connectionError,
        setStores,
        setProducts,
        setServices,
        setCulturalItems,
        setOrders,
        setStoreRatings,
        refreshData: fetchData
    };
}
