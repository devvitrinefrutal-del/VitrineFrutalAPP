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
                client_id: user.id,
                customer_name: user.name,
                customer_phone: user.phone || 'Não informado',
                customer_address: deliveryMethod === 'ENTREGA' ? (customerAddress || user.address) : 'Retirada na Loja',
                delivery_method: deliveryMethod,
                delivery_fee: deliveryMethod === 'ENTREGA' ? deliveryFee : 0,
                status: 'PENDENTE',
                total: finalTotal,
                items: itemsPayload,
                payment_method: paymentMethod, // Now saving payment method
                observation: observation // Now saving observation
            };

            console.log('Payload para DB:', newOrderDB);

            const { data, error } = await supabase.from('orders').insert([newOrderDB]).select();

            if (error) {
                console.error('Erro Supabase:', error);
                throw error;
            }

            console.log('Pedido criado:', data);

            // 1. Otimistic Stock Update
            console.log('Atualizando estoque...');
            for (const item of cart) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
                    setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: newStock } : p));
                }
            }

            // 2. Fetch Store Info for WhatsApp number
            const { data: storeData } = await supabase.from('stores').select('whatsapp, name').eq('id', storeId).single();
            const storePhone = storeData?.whatsapp || '';
            const storeName = storeData?.name || 'Loja';

            // 3. Build WhatsApp Message
            const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
            const deliveryTxt = deliveryMethod === 'ENTREGA' ? `🚚 *Entrega:* ${customerAddress}\n💰 *Taxa:* R$ ${deliveryFee.toFixed(2)}` : '🏪 *Retirada na Loja*';
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

            // 4. Finalize
            console.log('Processo finalizado com sucesso.');
            setShowOrderSuccess(true);
            clearCart();

            // Redirect to WhatsApp
            if (storePhone) {
                setTimeout(() => {
                    const cleanPhone = storePhone.replace(/\D/g, '');
                    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
                }, 1000);
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
