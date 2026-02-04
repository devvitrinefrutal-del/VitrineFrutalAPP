import { useState, useEffect } from 'react';
import { Product } from '../../types';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    storeId: string;
    stock: number;
}

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('vitrine_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('vitrine_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product) => {
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
                storeId: product.storeId,
                stock: product.stock
            }];
        });
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

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total
    };
}
