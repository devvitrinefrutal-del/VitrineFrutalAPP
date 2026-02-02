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
        console.log('--- [SISTEMA] Iniciando busca de dados... ---');
        setIsLoading(true);
        setConnectionError(false);

        try {
            // 1. Lojas (Essencial)
            console.log('Buscando lojas...');
            const { data: sD, error: sE } = await supabase.from('stores').select('*');
            if (sE) {
                console.error("Erro ao carregar lojas:", sE);
                setConnectionError(true);
            } else {
                console.log(`Lojas encontradas: ${sD?.length || 0}`);
                if (sD) setStores(sD.map(s => ({ ...s, ownerId: s.owner_id, deliveryFee: s.delivery_fee })));
            }

            // 2. Produtos (Essencial)
            console.log('Buscando produtos...');
            const { data: pD, error: pE } = await supabase.from('products').select('*');
            if (pE) console.error("Erro ao carregar produtos:", pE);
            else if (pD) {
                console.log(`Produtos encontrados: ${pD.length}`);
                setProducts(pD.map(p => ({ ...p, storeId: p.store_id })));
            }

            // 3. Serviços
            const { data: svcD } = await supabase.from('services').select('*');
            if (svcD) setServices(svcD.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate })));

            // 4. Cultural
            const { data: cultD } = await supabase.from('cultural_items').select('*');
            if (cultD) setCulturalItems(cultD);

            // 5. Avaliações
            const { data: ratD } = await supabase.from('store_ratings').select('*');
            if (ratD) setStoreRatings(ratD.map(r => ({ ...r, storeId: r.store_id, orderId: r.order_id, clientId: r.client_id, createdAt: r.created_at })));

            // 6. Pedidos (Pode falhar se o SQL não foi rodado)
            console.log('Buscando pedidos...');
            const { data: ordD, error: ordE } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (ordE) {
                console.warn("Aviso: Não foi possível carregar pedidos (provavelmente as colunas novas faltam no DB):", ordE.message);
            } else if (ordD) {
                console.log(`Pedidos encontrados: ${ordD.length}`);
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

            console.log('--- [SISTEMA] Busca de dados finalizada ---');
        } catch (err: any) {
            console.error("Erro inesperado no fluxo de dados:", err);
            showError('Erro de conexão crítica: ' + err.message);
        } finally {
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
