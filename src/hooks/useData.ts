import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Store, Product, Service, CulturalItem, Order, StoreRating } from '../types';

export function useData(showError: (msg: string) => void) {
    const [stores, setStores] = useState<Store[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [culturalItems, setCulturalItems] = useState<CulturalItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [storeRatings, setStoreRatings] = useState<StoreRating[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: storesData, error: storesError } = await supabase.from('stores').select('*');
            if (storesError) throw storesError;
            if (storesData) setStores(storesData.map(s => ({ ...s, ownerId: s.owner_id, deliveryFee: s.delivery_fee })));

            const { data: productsData } = await supabase.from('products').select('*');
            if (productsData) setProducts(productsData.map(p => ({ ...p, storeId: p.store_id })));

            const { data: servicesData } = await supabase.from('services').select('*');
            if (servicesData) setServices(servicesData.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate })));

            const { data: culturalData } = await supabase.from('cultural_items').select('*');
            if (culturalData) setCulturalItems(culturalData);

            const { data: ratingsData } = await supabase.from('store_ratings').select('*');
            if (ratingsData) setStoreRatings(ratingsData.map(r => ({ ...r, storeId: r.store_id, orderId: r.order_id, clientId: r.client_id, createdAt: r.created_at })));

            // Orders fetch might be restricted by RLS, so this might return empty for non-auth users, which is fine
            const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (ordersData) {
                setOrders(ordersData.map(o => ({
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

            setConnectionError(false);
        } catch (err: any) {
            console.error("Erro ao buscar dados:", err);
            setConnectionError(true);
            showError('Erro de conexão com o servidor.');
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchData();

        // Auto-refresh mechanism or realtime subscription could go here
        const handleOnline = () => { setConnectionError(false); fetchData(); };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [fetchData]);

    return {
        stores,
        products,
        services,
        culturalItems,
        orders,
        storeRatings,
        isLoading,
        connectionError,
        setStores,
        setProducts,
        setServices,
        setOrders,
        setStoreRatings,
        refreshData: fetchData
    };
}
