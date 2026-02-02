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

    const [isLoading, setIsLoading] = useState(false); // Inicia como false para não travar a UI
    const [connectionError, setConnectionError] = useState(false);

    const fetchData = useCallback(async () => {
        console.log('--- [SISTEMA] Iniciando busca ultra-resiliente... ---');

        // Timeout de segurança para garantir que a UI libere em 3 segundos
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
            console.warn('--- [SISTEMA] Timeout de segurança atingido. Liberando tela. ---');
        }, 3000);

        try {
            // 1. Busca Independente de Lojas
            supabase.from('stores').select('*').then(({ data, error }) => {
                if (error) console.error("Falha Lojas:", error);
                else if (data) {
                    console.log(`Lojas: ${data.length}`);
                    setStores(data.map(s => ({ ...s, ownerId: s.owner_id, deliveryFee: s.delivery_fee })));
                }
            });

            // 2. Busca Independente de Produtos
            supabase.from('products').select('*').then(({ data, error }) => {
                if (error) console.error("Falha Produtos:", error);
                else if (data) {
                    console.log(`Produtos: ${data.length}`);
                    setProducts(data.map(p => ({ ...p, storeId: p.store_id })));
                }
            });

            // 3. Busca Independente de Serviços
            supabase.from('services').select('*').then(({ data, error }) => {
                if (data) setServices(data.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate })));
            });

            // 4. Busca Independente de Cultural
            supabase.from('cultural_items').select('*').then(({ data }) => {
                if (data) setCulturalItems(data);
            });

            // 5. Busca Independente de Avaliações
            supabase.from('store_ratings').select('*').then(({ data }) => {
                if (data) setStoreRatings(data.map(r => ({ ...r, storeId: r.store_id, orderId: r.order_id, clientId: r.client_id, createdAt: r.created_at })));
            });

            // 6. Busca Independente de Pedidos (Mais provável de falhar se o SQL não rodou ok)
            supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
                if (error) console.warn("Aviso: Falha ao ler pedidos (Verifique SQL):", error.message);
                else if (data) {
                    console.log(`Pedidos: ${data.length}`);
                    setOrders(data.map(o => ({
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
            });

        } catch (err: any) {
            console.error("Erro crítico no fluxo useData:", err);
            setConnectionError(true);
        } finally {
            // O isLoading será liberado pelo timeout ou podemos liberar aqui se for muito rápido
            // Mas vamos deixar o timeout gerenciar a primeira renderização para evitar pulos
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Libera após o primeiro ciclo de microtask para garantir que a UI monte
        const t = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(t);
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
