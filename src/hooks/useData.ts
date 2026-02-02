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

    const [isLoading, setIsLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);

    const fetchData = useCallback(async () => {
        console.log('--- [DEBUG] Iniciando fetchData otimizado ---');
        setIsLoading(true);
        setConnectionError(false);

        try {
            // Executa todas as buscas em paralelo para máxima performance
            const [
                storesRes,
                productsRes,
                servicesRes,
                culturalRes,
                ratingsRes,
                ordersRes
            ] = await Promise.all([
                supabase.from('stores').select('*'),
                supabase.from('products').select('*'),
                supabase.from('services').select('*'),
                supabase.from('cultural_items').select('*'),
                supabase.from('store_ratings').select('*'),
                supabase.from('orders').select('*').order('created_at', { ascending: false })
            ]);

            // Verifica erros críticos (Lojas e Produtos são essenciais)
            if (storesRes.error) throw storesRes.error;

            // Processa Lojas
            if (storesRes.data) {
                setStores(storesRes.data.map(s => ({
                    ...s,
                    ownerId: s.owner_id,
                    deliveryFee: s.delivery_fee
                })));
            }

            // Processa Produtos
            if (productsRes.data) {
                setProducts(productsRes.data.map(p => ({
                    ...p,
                    storeId: p.store_id
                })));
            }

            // Processa Serviços
            if (servicesRes.data) {
                setServices(servicesRes.data.map(s => ({
                    ...s,
                    providerId: s.provider_id,
                    priceEstimate: s.price_estimate
                })));
            }

            // Processa Itens Culturais
            if (culturalRes.data) {
                setCulturalItems(culturalRes.data);
            }

            // Processa Avaliações
            if (ratingsRes.data) {
                setStoreRatings(ratingsRes.data.map(r => ({
                    ...r,
                    storeId: r.store_id,
                    orderId: r.order_id,
                    clientId: r.client_id,
                    createdAt: r.created_at
                })));
            }

            // Processa Pedidos
            if (ordersRes.data) {
                setOrders(ordersRes.data.map(o => ({
                    ...o,
                    storeId: o.store_id,
                    clientId: o.client_id,
                    customerName: o.customer_name,
                    customerPhone: o.customer_phone,
                    customerAddress: o.customer_address,
                    deliveryMethod: o.delivery_method,
                    deliveryFee: o.delivery_fee,
                    paymentMethod: o.payment_method,
                    observation: o.observation,
                    dispatchedAt: o.dispatched_at,
                    createdAt: o.created_at
                })));
            }

            console.log('--- [DEBUG] Dados carregados com sucesso! ---');
        } catch (err: any) {
            console.error("Erro crítico ao buscar dados do Supabase:", err);
            setConnectionError(true);
            showError('Erro de conexão: Verifique se o banco está ativo.');
        } finally {
            console.log('--- [DEBUG] Finalizando estado de carregamento ---');
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchData();
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
