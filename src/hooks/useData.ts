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
        console.log('--- [SISTEMA] Disparando buscas em paralelo... ---');
        setIsLoading(true);

        // 1. BUSCA DE LOJAS (Não bloqueante)
        console.log('[JOBS] Iniciando busca de LOJAS...');
        supabase.from('stores').select('*')
            .then(({ data, error }) => {
                if (error) {
                    console.error("[ERRO] Falha ao ler LOJAS:", error);
                    setConnectionError(true);
                } else if (data) {
                    console.log(`[SUCESSO] LOJAS encontradas: ${data.length}`);
                    setStores(data.map(s => ({
                        ...s,
                        ownerId: s.owner_id || s.id_do_proprietario || s.id_do_proprietário,
                        deliveryFee: s.delivery_fee || s.taxa_entrega
                    })));
                } else {
                    console.warn("[AVISO] LOJAS retornou vazio.");
                }
            })
            .catch(err => console.error("[CRÍTICO] Falha total na requisição de LOJAS:", err));

        // 2. BUSCA DE PRODUTOS (Não bloqueante)
        console.log('[JOBS] Iniciando busca de PRODUTOS...');
        supabase.from('products').select('*')
            .then(({ data, error }) => {
                if (error) console.error("[ERRO] Falha ao ler PRODUTOS:", error);
                else if (data) {
                    console.log(`[SUCESSO] PRODUTOS encontrados: ${data.length}`);
                    setProducts(data.map(p => ({ ...p, storeId: p.store_id || p.id_da_loja })));
                }
            })
            .catch(err => console.error("[CRÍTICO] Falha total na requisição de PRODUTOS:", err));

        // 3. OUTROS (Serviços, Cultural, Pedidos)
        supabase.from('services').select('*').then(({ data }) => {
            if (data) setServices(data.map(s => ({ ...s, providerId: s.provider_id, priceEstimate: s.price_estimate })));
        });

        supabase.from('cultural_items').select('*').then(({ data }) => {
            if (data) setCulturalItems(data);
        });

        supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            if (data) setOrders(data.map(o => ({ ...o, storeId: o.store_id, createdAt: o.created_at })));
        });

        // Liberação do Loader após um tempo seguro para permitir renderização inicial
        setTimeout(() => {
            setIsLoading(false);
            console.log('--- [SISTEMA] Liberação de tela concluída (Timeout Seguro). ---');
        }, 3000);

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
