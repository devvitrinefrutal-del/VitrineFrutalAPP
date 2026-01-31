import { useState } from 'react';
import { Product, Store } from '../types';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    storeId: string;
}

export function useCart(stores: Store[]) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product, showSuccess: (msg: string) => void) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
                storeId: product.storeId
            }];
        });
        showSuccess(`${product.name} no carrinho!`);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string, showSuccess: (msg: string) => void) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
        showSuccess('Removido do carrinho.');
    };

    const clearCart = (showSuccess?: (msg: string) => void) => {
        setCart([]);
        if (showSuccess) showSuccess('Carrinho esvaziado.');
    };

    const cartItemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartStoreId = cart.length > 0 ? cart[0].storeId : null;
    const currentCheckoutStore = stores.find(s => s.id === cartStoreId);

    const getDeliveryFee = (method: 'ENTREGA' | 'RETIRADA') => {
        return (method === 'ENTREGA' && currentCheckoutStore) ? (currentCheckoutStore.deliveryFee || 0) : 0;
    };

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartItemsTotal,
        cartStoreId,
        currentCheckoutStore,
        getDeliveryFee
    };
}
