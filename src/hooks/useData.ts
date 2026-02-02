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
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('--- [SISTEMA] Iniciando Carregamento Resiliente V5 ---');
        setIsLoading(true);

        const fetchTable = async (table: string) => {
            try {
                const response = await fetch(`${url}/rest/v1/${table}?select=*`, {
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                return await response.json();
            } catch (err) {
                console.error(`[ERRO NATIVO] Tabela ${table}:`, err);
                return null;
            }
        };

        // Carregamento em paralelo usando Fetch Nativo (Bypassing SDK Hang)
        // Carregamento em paralelo otimizado: Produtos não são mais carregados globalmente por padrão
        const [storesData, servicesData, culturalData, ordersData] = await Promise.all([
            fetchTable('stores'),
            fetchTable('services'),
            fetchTable('cultural_items'),
            fetchTable('orders')
        ]);

        if (storesData) {
            setStores(storesData.map((s: any) => ({
                ...s,
                ownerId: s.owner_id,
                neighborhood: s.neighborhood,
                hasDelivery: s.has_delivery,
                latitude: s.latitude,
                longitude: s.longitude
            })));
        }

        if (servicesData) {
            setServices(servicesData.map((s: any) => ({
                ...s,
                providerId: s.provider_id,
                priceEstimate: s.price_estimate,
                dailyRevenueAdj: s.daily_revenue_adj || 0,
                monthlyRevenueAdj: s.monthly_revenue_adj || 0,
                lastFinanceUpdate: s.last_finance_update
            })));
        }

        if (culturalData) setCulturalItems(culturalData);

        if (ordersData) {
            setOrders(ordersData.map((o: any) => ({
                ...o,
                storeId: o.store_id,
                createdAt: o.created_at
            })));
        }

        setIsLoading(false);
    }, []);

    const fetchStoreProducts = async (storeId: string) => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        try {
            const response = await fetch(`${url}/rest/v1/products?store_id=eq.${storeId}&select=*`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar produtos');
            const data = await response.json();
            const mapped = data.map((p: any) => ({ ...p, storeId: p.store_id }));

            // Atualiza global state mas apenas com estes itens (ou faz merge inteligente)
            setProducts(prev => {
                const filtered = prev.filter(p => p.storeId !== storeId);
                return [...filtered, ...mapped];
            });
            return mapped;
        } catch (err) {
            console.error('[ERRO PRODUCTS]', err);
            return [];
        }
    };

    const searchGlobal = async (query: string) => {
        if (query.length < 3) return [];
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        try {
            const response = await fetch(`${url}/rest/v1/products?name=ilike.*${query}*&select=*,stores(name)`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            if (!response.ok) throw new Error('Busca falhou');
            const data = await response.json();
            const mapped = data.map((p: any) => ({ ...p, storeId: p.store_id, storeName: p.stores?.name }));
            setProducts(mapped);
            return mapped;
        } catch (err) {
            console.error('[ERRO SEARCH]', err);
            return [];
        }
    };

    useEffect(() => {
        fetchData();

        // --- REALTIME: Notificações Internas ---
        // Escuta novos pedidos em tempo real para o dashboard
        const channel = supabase
            .channel('orders_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('--- [REALTIME] Novo pedido detectado! ---', payload);
                    const newOrder = payload.new as any;
                    setOrders(prev => [
                        { ...newOrder, storeId: newOrder.store_id, createdAt: newOrder.created_at },
                        ...prev
                    ]);
                    // Notificação sonora opcional ou toast pode ser disparado aqui
                }
            )
            .subscribe();

        // Failsafe redundante
        const t = setTimeout(() => setIsLoading(false), 8000);
        return () => {
            clearTimeout(t);
            supabase.removeChannel(channel);
        }
    }, [fetchData]);

    return {
        stores, products, services, culturalItems, orders,
        ratings: storeRatings,
        loading: isLoading,
        connectionError,
        setStores, setProducts, setServices, setCulturalItems, setOrders, setStoreRatings,
        refreshData: fetchData,
        fetchStoreProducts,
        searchGlobal
    };
}
