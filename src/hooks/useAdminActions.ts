import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Store, Product, Service, CulturalItem, Order } from '../../types';

interface InternalSetters {
    setStores: React.Dispatch<React.SetStateAction<Store[]>>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    setCulturalItems: React.Dispatch<React.SetStateAction<CulturalItem[]>>;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export function useAdminActions(
    setters: InternalSetters,
    user: User | null,
    showSuccess: (msg: string) => void,
    showError: (msg: string) => void
) {
    const normalizeWhatsApp = (phone: string) => phone.replace(/\D/g, '');

    const updateProfile = async (formData: FormData, currentStore: Store | null, uploadedStoreLogo: string | null) => {
        if (!user) return;
        const deliveryFee = parseFloat(formData.get('deliveryFee') as string) || 0;

        const updatedUser: User = {
            ...user,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            document: formData.get('document') as string,
            address: formData.get('address') as string,
        };

        try {
            if (user.role === 'LOJISTA') {
                if (currentStore?.id) {
                    const { error } = await supabase.from('stores')
                        .update({
                            name: updatedUser.name,
                            delivery_fee: deliveryFee,
                            image: uploadedStoreLogo || undefined
                        })
                        .eq('id', currentStore.id);

                    if (error) throw error;

                    setters.setStores(prev => prev.map(s =>
                        s.id === currentStore.id
                            ? { ...s, deliveryFee, image: uploadedStoreLogo || s.image, name: updatedUser.name }
                            : s
                    ));
                } else {
                    const newStore: any = {
                        owner_id: user.id,
                        name: updatedUser.name,
                        category: 'Geral',
                        image: uploadedStoreLogo || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
                        address: updatedUser.address || 'Frutal, MG',
                        whatsapp: updatedUser.phone || '34988888888',
                        email: updatedUser.email,
                        cnpj: updatedUser.document || '00.000.000/0001-00',
                        delivery_fee: deliveryFee
                    };
                    const { data, error } = await supabase.from('stores').insert([newStore]).select();
                    if (error) throw error;

                    if (data && data[0]) {
                        const savedStore = { ...data[0], deliveryFee: data[0].delivery_fee, ownerId: data[0].owner_id };
                        setters.setStores(prev => [...prev, savedStore]);
                        updatedUser.storeId = savedStore.id;
                    }
                }
            } else {
                // Just update profile in DB for non-LOJISTA? OR assume profile update is separate?
                // The original code mixed store update with profile update.
                // We should update the profile table too basically
                const { error } = await supabase.from('profiles').update({
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    document: updatedUser.document,
                    address: updatedUser.address
                }).eq('id', user.id);
                if (error) throw error;
            }

            setters.setCurrentUser(updatedUser);
            showSuccess('Perfil atualizado!');
            return true;
        } catch (error: any) {
            showError('Erro ao atualizar: ' + error.message);
            return false;
        }
    };

    const saveProduct = async (formData: FormData, images: string[], editingProduct: Product | null, storeId: string) => {
        try {
            const data: any = {
                name: formData.get('name') as string,
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                description: formData.get('description') as string,
                image: images[0] || editingProduct?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
                images: images,
                store_id: storeId
            };

            if (editingProduct) {
                const { error } = await supabase.from('products').update(data).eq('id', editingProduct.id);
                if (error) throw error;

                setters.setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data, storeId: data.store_id } : p));
            } else {
                const { data: saved, error } = await supabase.from('products').insert([data]).select();
                if (error) throw error;
                if (saved) {
                    setters.setProducts(prev => [...prev, { ...saved[0], storeId: saved[0].store_id }]);
                }
            }
            showSuccess('Produto salvo!');
            return true;
        } catch (error: any) {
            showError('Erro ao salvar produto: ' + error.message);
            return false;
        }
    };

    const saveStore = async (formData: FormData, image: string | null, editingStore: Store | null) => {
        console.log('--- [SISTEMA] Iniciando saveStore... ---');
        try {
            const rawEmail = formData.get('email');
            const rawWhatsapp = formData.get('whatsapp');
            const rawName = formData.get('name');
            const rawCategory = formData.get('category');
            const rawAddress = formData.get('address');
            const rawDeliveryFee = formData.get('deliveryFee');

            console.log('[DEBUG saveStore] Campos Brutos:', {
                rawEmail, rawWhatsapp, rawName, rawCategory, rawAddress, rawDeliveryFee
            });

            const data: any = {
                name: (rawName as string || '').toString(),
                category: (rawCategory as string || '').toString(),
                whatsapp: normalizeWhatsApp(rawWhatsapp as string || ''),
                address: (rawAddress as string || '').toString(),
                cnpj: (formData.get('cnpj') as string || '').toString(),
                email: (rawEmail as string || '').toString().trim().toLowerCase(),
                delivery_fee: parseFloat(rawDeliveryFee as string) || 0,
                daily_revenue_adj: parseFloat(formData.get('dailyRevenueAdj') as string) || editingStore?.dailyRevenueAdj || 0,
                monthly_revenue_adj: parseFloat(formData.get('monthlyRevenueAdj') as string) || editingStore?.monthlyRevenueAdj || 0,
                image: image || editingStore?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            };

            console.log('[DEBUG saveStore] Dados Processados:', data);

            if (editingStore) {
                const { error } = await supabase.from('stores').update(data).eq('id', editingStore.id);
                if (error) throw error;

                setters.setStores(prev => prev.map(s => s.id === editingStore.id ? {
                    ...s,
                    ...data,
                    deliveryFee: data.delivery_fee,
                    dailyRevenueAdj: data.daily_revenue_adj,
                    monthlyRevenueAdj: data.monthly_revenue_adj
                } : s));
                showSuccess('Loja atualizada!');
            } else {
                const { data: saved, error } = await supabase.from('stores').insert([data]).select();
                if (error) throw error;
                if (saved) {
                    setters.setStores(prev => [...prev, { ...saved[0], deliveryFee: saved[0].delivery_fee, ownerId: saved[0].owner_id }]);
                }
                showSuccess('Nova loja criada!');
            }
            return true;
        } catch (error: any) {
            showError('Erro ao salvar loja: ' + error.message);
            return false;
        }
    };

    const saveService = async (formData: FormData, images: string[], editingService: Service | null) => {
        console.log('--- [SISTEMA] Iniciando saveService... ---');
        try {
            const rawEmail = formData.get('email');
            const data: any = {
                name: formData.get('name') as string,
                type: formData.get('type') as string,
                whatsapp: normalizeWhatsApp(formData.get('whatsapp') as string || ''),
                address: formData.get('address') as string,
                email: (rawEmail as string || '').toString().trim().toLowerCase(),
                description: formData.get('description') as string,
                price_estimate: formData.get('priceEstimate') as string,
                image: images[0] || editingService?.image || 'https://images.unsplash.com/photo-1581578731522-745d05ad9a2d?w=400&h=300&fit=crop',
                images: images.length > 0 ? images : (editingService?.images || [])
            };

            if (user?.role === 'PRESTADOR') {
                const activeId = editingService?.id; // Or user.serviceId, assuming editingService is passed correctly
                if (activeId) {
                    const { error } = await supabase.from('services').update(data).eq('id', activeId);
                    if (error) throw error;
                    setters.setServices(prev => prev.map(s => s.id === activeId ? { ...s, ...data, priceEstimate: data.price_estimate } : s));
                    showSuccess('Serviço atualizado!');
                } else {
                    const { data: saved, error } = await supabase.from('services').insert([{ ...data, provider_id: user.id }]).select();
                    if (error) throw error;
                    if (saved) {
                        setters.setServices(prev => [...prev, { ...saved[0], priceEstimate: saved[0].price_estimate, providerId: saved[0].provider_id }]);
                        if (user) setters.setCurrentUser({ ...user, serviceId: saved[0].id });
                    }
                    showSuccess('Serviço criado!');
                }
            } else if (user?.role === 'DEV') {
                if (editingService) {
                    const { error } = await supabase.from('services').update(data).eq('id', editingService.id);
                    if (error) throw error;
                    setters.setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...data, priceEstimate: data.price_estimate } : s));
                    showSuccess('Serviço atualizado!');
                } else {
                    const { data: saved, error } = await supabase.from('services').insert([data]).select();
                    if (error) throw error;
                    if (saved) {
                        setters.setServices(prev => [...prev, { ...saved[0], priceEstimate: saved[0].price_estimate, providerId: 'manual' }]);
                    }
                    showSuccess('Serviço criado pelo Admin!');
                }
            }

            return true;
        } catch (error: any) {
            showError('Erro ao salvar serviço: ' + error.message);
            return false;
        }
    };

    const saveCulturalItem = async (formData: FormData, images: string[], editingItem: CulturalItem | null) => {
        try {
            const data: any = {
                title: formData.get('title') as string,
                type: formData.get('type') as string,
                date: formData.get('date') as string,
                description: formData.get('description') as string,
                image: images[0] || editingItem?.image || 'https://images.unsplash.com/photo-1514525253361-bee8718a340b?w=800',
                images: images.length > 0 ? images : (editingItem?.images || [])
            };

            const jsonStr = JSON.stringify(data);
            if (jsonStr.length > 6 * 1024 * 1024) {
                showError('Imagens muito grandes. Reduza o tamanho.');
                return false;
            }

            if (editingItem) {
                const { error } = await supabase.from('cultural_items').update(data).eq('id', editingItem.id);
                if (error) throw error;
                setters.setCulturalItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
                showSuccess('Item cultural atualizado!');
            } else {
                const { data: saved, error } = await supabase.from('cultural_items').insert([data]).select();
                if (error) throw error;
                if (saved) setters.setCulturalItems(prev => [...prev, saved[0]]);
                showSuccess('Item cultural criado!');
            }
            return true;
        } catch (error: any) {
            showError('Erro ao salvar item cultural: ' + error.message);
            return false;
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
            if (error) throw error;

            setters.setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            showSuccess(`Pedido atualizado para ${newStatus}`);
            return true;
        } catch (error: any) {
            showError('Erro ao atualizar status: ' + error.message);
            return false;
        }
    };

    // updateManagerDeliveryFee logic... simpler inline usually but let's include
    const updateOrderDeliveryFee = (orderId: string, fee: number) => {
        setters.setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryFee: fee } : o));
        showSuccess('Taxa de entrega atualizada localmente (salvamento automático pendente)');
    };

    return {
        updateProfile,
        saveProduct,
        saveStore,
        saveService,
        saveCulturalItem,
        updateOrderStatus,
        updateOrderDeliveryFee
    };
}
