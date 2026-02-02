import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { CartItem } from './useCart';
import { User, Order, Product } from '../../types';

export function useCheckout(
    cart: CartItem[],
    user: User | null,
    clearCart: () => void,
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
    showSuccess: (msg: string) => void,
    showError: (msg: string) => void
) {
    const [isFinishing, setIsFinishing] = useState(false);
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);

    const handleFinalizePurchase = async ({
        deliveryMethod,
        customerAddress,
        deliveryFee,
        observation,
        paymentMethod,
        storeId,
        changeFor
    }: {
        deliveryMethod: 'ENTREGA' | 'RETIRADA';
        customerAddress: string;
        deliveryFee: number;
        observation: string;
        paymentMethod: string;
        storeId: string;
        changeFor?: string;
    }) => {
        if (!user) {
            showError('Faça login para finalizar o pedido.');
            return false;
        }
        if (cart.length === 0) return false;

        console.log('--- [DEBUG] Início handleFinalizePurchase ---');
        console.log('Dados recebidos:', { deliveryMethod, customerAddress, deliveryFee, observation, paymentMethod, changeFor, storeId });

        setIsFinishing(true);
        try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const itemsPayload = cart.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const totalItems = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const finalTotal = totalItems + (deliveryMethod === 'ENTREGA' ? deliveryFee : 0);

            const newOrderDB = {
                store_id: storeId,
                customer_id: user.id,
                customer_name: user.name,
                customer_phone: user.phone || 'Não informado',
                customer_address: deliveryMethod === 'ENTREGA' ? (customerAddress || user.address) : 'Retirada na Loja',
                delivery_method: deliveryMethod,
                delivery_fee: deliveryMethod === 'ENTREGA' ? deliveryFee : 0,
                status: 'PENDENTE',
                total: finalTotal,
                items: itemsPayload,
                payment_method: paymentMethod,
                observation: observation
            };

            console.log('Payload para DB:', newOrderDB);

            // 1. Inserir Pedido via Fetch Nativo (Resiliente)
            const orderResponse = await fetch(`${url}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(newOrderDB)
            });

            if (!orderResponse.ok) throw new Error('Falha ao registrar pedido no banco.');
            const orderData = await orderResponse.json();
            console.log('Pedido criado:', orderData);

            // 2. Atualizar Estoque (Fetch Nativo)
            console.log('Atualizando estoque...');
            for (const item of cart) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await fetch(`${url}/rest/v1/products?id=eq.${item.productId}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ stock: newStock })
                    });
                    setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: newStock } : p));
                }
            }

            // 3. Buscar Info da Loja (Fetch Nativo) para WhatsApp
            const storeResponse = await fetch(`${url}/rest/v1/stores?id=eq.${storeId}&select=whatsapp,name`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            const storeDataList = await storeResponse.json();
            const storeData = storeDataList[0];
            const storePhone = storeData?.whatsapp || '';
            const storeName = storeData?.name || 'Loja';

            // 4. Build WhatsApp Message
            const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
            const deliveryTxt = deliveryMethod === 'ENTREGA' ? `🚚 *Entrega:* ${newOrderDB.customer_address}\n💰 *Taxa:* R$ ${deliveryFee.toFixed(2)}` : '🏪 *Retirada na Loja*';
            const observationTxt = observation ? `\n📝 *OBS:* ${observation}` : '';
            const paymentTxt = `💳 *Pagamento:* ${paymentMethod}${changeFor ? ` (Troco para R$ ${changeFor})` : ''}`;

            const message = window.encodeURIComponent(
                `*🛍️ NOVO PEDIDO - ${storeName}*\n\n` +
                `*Cliente:* ${user.name}\n` +
                `*WhatsApp:* ${user.phone || 'Não informado'}\n\n` +
                `*ITENS:*\n${itemsList}\n\n` +
                `${deliveryTxt}\n` +
                `${paymentTxt}\n` +
                `${observationTxt}\n\n` +
                `*TOTAL: R$ ${finalTotal.toFixed(2)}*`
            );

            // 5. Finalizar UI
            console.log('Processo finalizado com sucesso.');
            setShowOrderSuccess(true);
            clearCart();

            // Redirect to WhatsApp
            if (storePhone) {
                const cleanPhone = storePhone.replace(/\D/g, '');
                // Prefixo 55 para Brasil se não tiver
                const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
                window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
            }

            return true;
        } catch (error: any) {
            console.error('Erro no catch:', error);
            showError('Erro ao processar pedido: ' + error.message);
            return false;
        } finally {
            setIsFinishing(false);
        }
    };

    return {
        handleFinalizePurchase,
        isFinishing,
        showOrderSuccess,
        setShowOrderSuccess
    };
}
