import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Store as StoreIcon, Heart,
    User as UserIcon, Plus, Edit2, Trash2, Calendar, MapPin, DollarSign, Image as ImageIcon,
    CheckCircle, X
} from 'lucide-react';
import { User, Store, Product, Service, CulturalItem, Order } from '../../types';
import { OrderManager } from '../components/business/OrderManager';
import { ProductModal } from '../components/modals/ProductModal';
import { Modal } from '../components/ui/Modal';
import { MultiImageInput } from '../components/ui/MultiImageInput';

interface DashboardPageProps {
    user: User;
    currentStore: Store | null;
    products: Product[];
    services: Service[];
    culturalItems: CulturalItem[];
    orders: Order[];
    activeTab: string; // The parent activeTab
    onLogout: () => void;
    actions: any; // Return type of useAdminActions
    showError: (msg: string) => void;
    stores: Store[]; // Need full list for some checks?
    fetchStoreProducts: (storeId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
    user, currentStore, products, services, culturalItems, orders, activeTab,
    onLogout, actions, showError, stores, fetchStoreProducts
}) => {
    // Internal Navigation State
    const [section, setSection] = useState('OVERVIEW');

    // Sync with parent activeTab
    useEffect(() => {
        if (activeTab === 'MY_ORDERS') setSection('MY_ORDERS');
        else if (activeTab === 'PRODUCTS') setSection('PRODUCTS');
        else if (activeTab === 'STOCK') setSection('STOCK');
        else if (activeTab === 'DASHBOARD') setSection('OVERVIEW');
    }, [activeTab]);

    // Financial Sync Trigger & Products Load
    useEffect(() => {
        if (user.role === 'LOJISTA' && currentStore) {
            actions.syncFinancials(currentStore);
            fetchStoreProducts(currentStore.id);
        }
    }, [currentStore?.id]);

    // Modals State
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [showStoreModal, setShowStoreModal] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(currentStore); // Init with current

    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [showCulturalModal, setShowCulturalModal] = useState(false);
    const [editingCulturalItem, setEditingCulturalItem] = useState<CulturalItem | null>(null);

    // Auxiliary State for non-extracted modals (Store/Service/Cultural)
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [showFinanceModal, setShowFinanceModal] = useState(false);
    const [financeType, setFinanceType] = useState<'DAILY' | 'MONTHLY'>('DAILY');

    // Common Handlers for generic modals (Store/Service/Cultural)
    // ProductModal handles itself mostly via onSave prop, but Store/Service generic modals handled here inline for now

    const handleSaveStoreWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const fd = new FormData(e.currentTarget);
        const success = await actions.saveStore(fd, modalImages[0] || null, currentStore);
        setIsSaving(false);
        if (success) setShowStoreModal(false);
    };

    const handleSaveServiceWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const fd = new FormData(e.currentTarget);
        const success = await actions.saveService(fd, modalImages, editingService);
        setIsSaving(false);
        if (success) setShowServiceModal(false);
    };

    const handleSaveFinanceAdj = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const fd = new FormData(e.currentTarget);
        const value = parseFloat(fd.get('adjustment') as string) || 0;

        const updateData = new FormData();
        if (financeType === 'DAILY') {
            updateData.set('dailyRevenueAdj', value.toString());
        } else {
            updateData.set('monthlyRevenueAdj', value.toString());
        }

        const success = await actions.saveStore(updateData, null, currentStore);
        setIsSaving(false);
        if (success) setShowFinanceModal(false);
    };

    const handleSaveCulturalWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const fd = new FormData(e.currentTarget);
        const success = await actions.saveCulturalItem(fd, modalImages, editingCulturalItem);
        setIsSaving(false);
        if (success) setShowCulturalModal(false);
    };

    // Handlers needed for list actions
    const handleDeleteProduct = async (id: string) => {
        if (confirm('Tem certeza? Ação irreversível.')) {
            await actions.deleteProduct(id, currentStore?.id);
        }
    };

    const [isSendingDigest, setIsSendingDigest] = useState(false);
    const handleSendDigestNow = async () => {
        if (!confirm('Deseja disparar o Resumão Cultural para todos os clientes agora?')) return;

        setIsSendingDigest(true);
        try {
            const { supabase } = await import('../../supabaseClient');
            const { data, error } = await supabase.functions.invoke('cultural-digest');

            if (error) throw error;

            if (data?.message === "No new items found") {
                alert('Nenhuma novidade encontrada nos últimos 7 dias. Nada foi enviado.');
            } else if (data?.message === "No subscribers found") {
                alert('Nenhum cliente cadastrado para receber.');
            } else {
                alert('Newsletter disparada com sucesso!');
            }
        } catch (err: any) {
            console.error(err);
            alert('Erro ao disparar: ' + err.message);
        } finally {
            setIsSendingDigest(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-24 animate-in fade-in">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mb-4 flex items-center justify-center text-gray-400 overflow-hidden">
                        {user.role === 'LOJISTA' && currentStore?.image ? (
                            <img src={currentStore.image} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={32} />
                        )}
                    </div>
                    <h3 className="font-black text-black uppercase tracking-tight mb-1">{user.name}</h3>
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.role}</span>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                    {user.role === 'LOJISTA' && (
                        <>
                            <NavBtn active={section === 'OVERVIEW'} icon={<LayoutDashboard size={20} />} label="Visão Geral" onClick={() => setSection('OVERVIEW')} />
                            <NavBtn active={section === 'PRODUCTS'} icon={<Package size={20} />} label="Produtos" onClick={() => setSection('PRODUCTS')} />
                            <NavBtn active={section === 'STOCK'} icon={<ShoppingBag size={20} />} label="Estoque" onClick={() => setSection('STOCK')} />
                            <NavBtn active={section === 'SETTINGS'} icon={<Settings size={20} />} label="Configurar Loja" onClick={() => { setModalImages(currentStore?.image ? [currentStore.image] : []); setShowStoreModal(true); }} />
                        </>
                    )}
                    {user.role === 'CLIENTE' && (
                        <>
                            <NavBtn active={section === 'MY_ORDERS'} icon={<ShoppingBag size={20} />} label="Meus Pedidos" onClick={() => setSection('MY_ORDERS')} />
                            <NavBtn active={section === 'PROFILE'} icon={<UserIcon size={20} />} label="Meus Dados" onClick={() => setSection('PROFILE')} />
                        </>
                    )}
                    {user.role === 'PRESTADOR' && (
                        <>
                            <NavBtn active={section === 'SERVICES'} icon={<Package size={20} />} label="Meus Serviços" onClick={() => setSection('SERVICES')} />
                            <NavBtn active={section === 'PROFILE'} icon={<Settings size={20} />} label="Meus Dados" onClick={() => setSection('PROFILE')} />
                        </>
                    )}
                    {user.role === 'DEV' && (
                        <>
                            <NavBtn active={section === 'OVERVIEW'} icon={<LayoutDashboard size={20} />} label="Admin Geral" onClick={() => setSection('OVERVIEW')} />
                            <NavBtn active={section === 'STORES'} icon={<StoreIcon size={20} />} label="Lojas" onClick={() => setSection('STORES')} />
                            <NavBtn active={section === 'SERVICES'} icon={<Package size={20} />} label="Serviços" onClick={() => setSection('SERVICES')} />
                            <NavBtn active={section === 'CULTURAL'} icon={<Calendar size={20} />} label="Giro Cultural" onClick={() => setSection('CULTURAL')} />
                            <NavBtn active={section === 'PROFILE'} icon={<UserIcon size={20} />} label="Meus Dados" onClick={() => setSection('PROFILE')} />
                        </>
                    )}

                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black uppercase text-[10px] tracking-widest mt-4">
                        <LogOut size={20} /> Sair do Sistema
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">

                {/* DEV: OVERVIEW */}
                {user.role === 'DEV' && section === 'OVERVIEW' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Total Lojas</h4>
                            <p className="text-3xl font-black text-black">{stores.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Total Produtos</h4>
                            <p className="text-3xl font-black text-black">{products.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Total Serviços</h4>
                            <p className="text-3xl font-black text-black">{services.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Total Pedidos</h4>
                            <p className="text-3xl font-black text-black">{orders.length}</p>
                        </div>
                    </div>
                )}

                {/* LOJISTA: OVERVIEW */}
                {user.role === 'LOJISTA' && section === 'OVERVIEW' && (
                    <div className="space-y-6">
                        <div className="bg-green-600 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Painel de Vendas</h2>
                                <p className="text-green-100 font-medium opacity-80 max-w-md">Gerencie seus pedidos em tempo real. Mantenha o status atualizado para o cliente.</p>
                            </div>
                            <Package className="absolute -bottom-4 -right-4 text-green-500 opacity-50" size={150} />
                        </div>
                        <OrderManager
                            orders={orders}
                            currentStore={currentStore!}
                            onUpdateStatus={actions.updateOrderStatus}
                        />
                    </div>
                )}

                {/* LOJISTA: PRODUCTS */}
                {user.role === 'LOJISTA' && section === 'PRODUCTS' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Meu Acervo</h3>
                            <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-lg hover:bg-orange-600 transition-all uppercase tracking-[0.2em]">
                                <Plus size={16} /> Novo Item
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.filter(p => p.storeId === currentStore?.id).map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col group">
                                    <div className="overflow-hidden rounded-2xl mb-4 aspect-square relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Tem certeza que deseja excluir este produto?')) {
                                                        actions.deleteProduct(p.id, p.storeId);
                                                    }
                                                }}
                                                className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                                                title="Excluir produto"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-orange-500 hover:text-orange-600"><Edit2 size={12} /></button>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-black truncate mb-1 text-[10px] uppercase tracking-tighter">{p.name}</h4>
                                    <div className="mt-auto flex justify-between items-center">
                                        <span className="text-sm font-black text-green-600">R$ {p.price.toFixed(2)}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Qtd: {p.stock}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* LOJISTA: STOCK (Simplified Table) */}
                {user.role === 'LOJISTA' && section === 'STOCK' && (
                    <div className="space-y-6">
                        {/* Finance Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
                                    <ShoppingBag size={12} className="text-orange-500" /> Inventário Total
                                </h4>
                                <p className="text-2xl font-black text-black">
                                    R$ {products.filter(p => p.storeId === currentStore?.id)
                                        .reduce((acc, p) => acc + (p.price * p.stock), 0)
                                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative group">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
                                    <DollarSign size={12} className="text-green-500" /> Faturado Hoje
                                </h4>
                                <p className="text-2xl font-black text-green-600">
                                    R$ {(() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        const ordersToday = orders.filter(o =>
                                            o.storeId === currentStore?.id &&
                                            o.status === 'ENTREGUE' &&
                                            o.createdAt.startsWith(today)
                                        );
                                        const revenue = ordersToday.reduce((acc, o) => acc + o.total, 0);
                                        return (revenue + (currentStore?.dailyRevenueAdj || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                    })()}
                                </p>
                                <button
                                    onClick={() => { setFinanceType('DAILY'); setShowFinanceModal(true); }}
                                    className="absolute top-4 right-4 text-[8px] font-black uppercase text-gray-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-2 py-1 rounded-md"
                                >
                                    Corrigir
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative group">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
                                    <Calendar size={12} className="text-blue-500" /> Faturado no Mês
                                </h4>
                                <p className="text-2xl font-black text-blue-600">
                                    R$ {(() => {
                                        const now = new Date();
                                        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                                        const ordersMonth = orders.filter(o =>
                                            o.storeId === currentStore?.id &&
                                            o.status === 'ENTREGUE' &&
                                            o.createdAt.startsWith(month)
                                        );
                                        const revenue = ordersMonth.reduce((acc, o) => acc + o.total, 0);
                                        // INTERCONEXÃO: O ajuste mensal total inclui o ajuste de Hoje
                                        const totalAdj = (currentStore?.monthlyRevenueAdj || 0) + (currentStore?.dailyRevenueAdj || 0);
                                        return (revenue + totalAdj).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                    })()}
                                </p>
                                <button
                                    onClick={() => { setFinanceType('MONTHLY'); setShowFinanceModal(true); }}
                                    className="absolute top-4 right-4 text-[8px] font-black uppercase text-gray-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-2 py-1 rounded-md"
                                >
                                    Corrigir
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                            <h3 className="text-lg font-black text-black mb-6 tracking-widest text-xs uppercase">Inventário Detalhado</h3>
                            {/* Table simplified for brevity, similar to original but cleaner */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                                            <th className="pb-4">Produto</th>
                                            <th className="pb-4 text-center">Preço</th>
                                            <th className="pb-4 text-center">Vendas</th>
                                            <th className="pb-4 text-center">Estoque</th>
                                            <th className="pb-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.filter(p => p.storeId === currentStore?.id).map(p => (
                                            <tr key={p.id} className="group hover:bg-gray-50">
                                                <td className="py-4 font-black text-xs uppercase">{p.name}</td>
                                                <td className="py-4 text-center text-xs font-bold">R$ {p.price.toFixed(2)}</td>
                                                <td className="py-4 text-center">
                                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        {orders
                                                            .filter(o => o.storeId === currentStore?.id && o.status !== 'CANCELADO' && o.createdAt.startsWith(new Date().toLocaleDateString('sv-SE')))
                                                            .reduce((acc, o) => acc + (o.items.find(i => i.productId === p.id)?.quantity || 0), 0)
                                                        } vendidos
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center text-xs font-bold">{p.stock}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                        {p.stock < 5 ? 'Baixo' : 'Ok'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLIENTE: MY ORDERS */}
                {user.role === 'CLIENTE' && section === 'MY_ORDERS' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mb-6">
                            <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Meus Pedidos</h3>
                        </div>
                        {orders.filter(o => o.customerId === user.id).length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-[3rem]">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Nenhum pedido realizado</p>
                            </div>
                        ) : (
                            orders.filter(o => o.customerId === user.id).map(o => (
                                <div key={o.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-black text-xs uppercase tracking-tighter mb-1">Pedido #{o.id.slice(0, 8)}</p>
                                            <p className="text-[9px] text-gray-400 font-bold">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${o.status === 'ENTREGUE' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {o.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 border-t border-gray-50 pt-4">
                                        {o.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-[10px] font-medium text-gray-600">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs font-black text-black pt-2 border-t border-gray-50 mt-2">
                                            <span>Total</span>
                                            <span>R$ {o.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* DEV: STORES */}
                {user.role === 'DEV' && section === 'STORES' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Gerenciar Lojas</h3>
                            <button onClick={() => { setEditingStore(null); setModalImages([]); setShowStoreModal(true); }} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-lg hover:bg-orange-600 transition-all uppercase tracking-[0.2em]">
                                <Plus size={16} /> Nova Loja
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stores.map(s => (
                                <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-6 items-center">
                                    <img src={s.image} className="w-20 h-20 rounded-2xl object-cover" />
                                    <div className="flex-1">
                                        <h4 className="font-black text-black uppercase tracking-tight text-sm">{s.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{s.category}</p>
                                        <button onClick={() => { setEditingStore(s); setModalImages(s.image ? [s.image] : []); setShowStoreModal(true); }} className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                                            <Edit2 size={12} /> Editar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PRESTADOR/DEV: SERVICES */}
                {(user.role === 'PRESTADOR' || user.role === 'DEV') && section === 'SERVICES' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Meus Serviços</h3>
                            <button onClick={() => { setEditingService(null); setModalImages([]); setShowServiceModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all uppercase tracking-[0.2em]">
                                <Plus size={16} /> Adicionar
                            </button>
                        </div>
                        {/* List services logic similar to products but simpler */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.filter(s => user.role === 'DEV' || s.providerId === user.id).map(s => (
                                <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-6 items-center">
                                    <img src={s.image} className="w-20 h-20 rounded-2xl object-cover" />
                                    <div className="flex-1">
                                        <h4 className="font-black text-black uppercase tracking-tight text-sm">{s.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{s.type}</p>
                                        <button onClick={() => { setEditingService(s); setModalImages(s.images || [s.image]); setShowServiceModal(true); }} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                                            <Edit2 size={12} /> Editar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DEV: CULTURAL */}
                {user.role === 'DEV' && section === 'CULTURAL' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-black text-black tracking-tight uppercase tracking-widest text-xs">Giro Cultural</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle de eventos da cidade</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    onClick={handleSendDigestNow}
                                    disabled={isSendingDigest}
                                    className="bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-sm hover:bg-emerald-50 transition-all uppercase tracking-[0.2em] disabled:opacity-50"
                                >
                                    {isSendingDigest ? 'Enviando...' : 'Disparar Newsletter'}
                                </button>
                                <button onClick={() => { setEditingCulturalItem(null); setModalImages([]); setShowCulturalModal(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-[0.2em]">
                                    <Plus size={16} /> Novo Evento
                                </button>
                            </div>
                        </div>

                        {/* List Content */}
                        <div className="grid grid-cols-1 gap-6">
                            {culturalItems.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                                    <img src={item.image} className="w-24 h-24 rounded-2xl object-cover" />
                                    <div className="flex-1">
                                        <h4 className="font-black text-black uppercase tracking-tight text-lg">{item.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.date}</p>
                                    </div>
                                    <button onClick={() => { setEditingCulturalItem(item); setModalImages(item.images || [item.image]); setShowCulturalModal(true); }} className="p-3 bg-gray-50 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROFILE SECTION (Common for all) */}
                {section === 'PROFILE' && (
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                                <UserIcon size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black tracking-tight uppercase">Meus Dados</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mantenha suas informações de contato atualizadas</p>
                            </div>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSaving(true);
                                const fd = new FormData(e.currentTarget);
                                await actions.updateProfile(fd, currentStore, null);
                                setIsSaving(false);
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Nome Completo</label>
                                <input name="name" required defaultValue={user.name} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 ring-orange-100 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">E-mail</label>
                                <input name="email" required readOnly defaultValue={user.email} className="w-full p-4 bg-gray-200 rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Telefone / WhatsApp</label>
                                <input name="phone" required defaultValue={user.phone} placeholder="(34) 9 9999-9999" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 ring-orange-100 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Documento (CPF/CNPJ)</label>
                                <input name="document" defaultValue={user.document} placeholder="000.000.000-00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 ring-orange-100 transition-all" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Endereço de Entrega</label>
                                <textarea name="address" required defaultValue={user.address} placeholder="Rua, Número, Bairro, Frutal-MG" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 ring-orange-100 transition-all h-32 resize-none" />
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button
                                    disabled={isSaving}
                                    className="w-full md:w-auto px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* MODALS */}

            <ProductModal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                product={editingProduct}
                onSave={(fd, imgs) => actions.saveProduct(fd, imgs, editingProduct, currentStore?.id)}
                showError={showError}
            />

            {/* Store Modal (Inline for now) */}
            <Modal isOpen={showStoreModal} onClose={() => setShowStoreModal(false)} title="Configurar Loja">
                <form onSubmit={handleSaveStoreWrapper} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Nome da Loja</label>
                        <input name="name" required defaultValue={currentStore?.name} placeholder="Nome da Loja" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 ring-orange-100 transition-all text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Categoria</label>
                            <select name="category" required defaultValue={currentStore?.category} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm appearance-none focus:ring-2 ring-orange-100 transition-all">
                                <option value="">Escolha...</option>
                                <option value="Moda e Acessórios">Moda e Acessórios</option>
                                <option value="Casa e Decoração">Casa e Decoração</option>
                                <option value="Tecnologia e Eletrônicos">Tecnologia e Eletrônicos</option>
                                <option value="Beleza e Cuidados Pessoais">Beleza e Cuidados Pessoais</option>
                                <option value="Construção e Ferramentas">Construção e Ferramentas</option>
                                <option value="Saúde e Bem-Estar">Saúde e Bem-Estar</option>
                                <option value="Agro e Pet">Agro e Pet</option>
                                <option value="Veículos e Autopeças">Veículos e Autopeças</option>
                                <option value="Papelaria e Presentes">Papelaria e Presentes</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Bairro</label>
                            <select name="neighborhood" required defaultValue={currentStore?.neighborhood} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm appearance-none focus:ring-2 ring-orange-100 transition-all">
                                <option value="">Escolha...</option>
                                <optgroup label="Centro e Arredores">
                                    <option value="Centro">Centro</option>
                                    <option value="Caju">Caju</option>
                                    <option value="XV de Novembro">XV de Novembro</option>
                                    <option value="Estudantil">Estudantil</option>
                                </optgroup>
                                <optgroup label="Tradicionais">
                                    <option value="Nossa Senhora do Carmo">Nossa Senhora do Carmo</option>
                                    <option value="Nossa Senhora Aparecida">Nossa Senhora Aparecida</option>
                                    <option value="Princesa Isabel I e II">Princesa Isabel I e II</option>
                                    <option value="Santos Dumont">Santos Dumont</option>
                                    <option value="Progresso">Progresso</option>
                                    <option value="Alto Boa Vista">Alto Boa Vista</option>
                                    <option value="Eldorado">Eldorado</option>
                                    <option value="Vila Esperança">Vila Esperança</option>
                                </optgroup>
                                <optgroup label="Novos Loteamentos">
                                    <option value="Cidade Jardim">Cidade Jardim</option>
                                    <option value="Jardim do Bosque I e II">Jardim do Bosque I e II</option>
                                    <option value="Jardim das Laranjeiras">Jardim das Laranjeiras</option>
                                    <option value="Jardim das Palmeiras">Jardim das Palmeiras</option>
                                    <option value="Jardim Brasil">Jardim Brasil</option>
                                    <option value="Jardim das Esmeraldas">Jardim das Esmeraldas</option>
                                    <option value="Jardins dos Ipês">Jardins dos Ipês</option>
                                    <option value="Morada dos Ipês">Morada dos Ipês</option>
                                    <option value="Ipê Amarelo">Ipê Amarelo</option>
                                </optgroup>
                                <optgroup label="Expansões e Conjuntos">
                                    <option value="Frutal II e III">Frutal II e III</option>
                                    <option value="Novo Horizonte">Novo Horizonte</option>
                                    <option value="Nova Frutal">Nova Frutal</option>
                                    <option value="Waldemar Marchi I e II">Waldemar Marchi I e II</option>
                                    <option value="Paralelo XX">Paralelo XX</option>
                                    <option value="Alceu Queiroz">Alceu Queiroz</option>
                                    <option value="Residencial das Américas">Residencial das Américas</option>
                                    <option value="Residencial Parque das Acácias">Residencial Parque das Acácias</option>
                                </optgroup>
                                <optgroup label="Áreas Nobres">
                                    <option value="Granville Casa Blanca">Granville Casa Blanca</option>
                                    <option value="Villa Florence">Villa Florence</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">WhatsApp</label>
                            <input name="whatsapp" required defaultValue={currentStore?.whatsapp} placeholder="WhatsApp" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-100 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Delivery</label>
                            <select name="hasDelivery" required defaultValue={currentStore?.hasDelivery?.toString()} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm appearance-none focus:ring-2 ring-orange-100 transition-all">
                                <option value="true">Sim, entregamos</option>
                                <option value="false">Não fazemos entrega</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Latitude (GPS)</label>
                            <input name="latitude" type="number" step="0.000001" defaultValue={currentStore?.latitude} placeholder="Ex: -20.228" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-100 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Longitude (GPS)</label>
                            <input name="longitude" type="number" step="0.000001" defaultValue={currentStore?.longitude} placeholder="Ex: -48.941" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-100 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Taxa de Entrega (R$)</label>
                            <input name="deliveryFee" type="number" step="0.50" defaultValue={currentStore?.deliveryFee} placeholder="Taxa Entrega" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-100 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">E-mail</label>
                            <input name="email" required defaultValue={currentStore?.email} placeholder="E-mail" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-orange-100 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Endereço Completo</label>
                        <textarea name="address" required defaultValue={currentStore?.address} placeholder="Endereço Completo" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold h-24 resize-none text-sm focus:ring-2 ring-orange-100 transition-all" />
                    </div>

                    <MultiImageInput max={1} initialImages={modalImages} onImagesChange={setModalImages} showError={showError} />

                    <button className="w-full py-5 bg-orange-500 text-white font-black rounded-[2rem] uppercase tracking-widest text-[10px] shadow-xl shadow-orange-100 active:scale-95 transition-all">
                        Salvar Configurações
                    </button>
                </form>
            </Modal>

            {/* Service Modal (Inline) */}
            <Modal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)} title="Serviço">
                <form onSubmit={handleSaveServiceWrapper} className="space-y-4">
                    <input name="name" required defaultValue={editingService?.name} placeholder="Nome do Serviço" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                    <input name="type" required defaultValue={editingService?.type} placeholder="Tipo (ex: Encanador)" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="priceEstimate" required defaultValue={editingService?.priceEstimate} placeholder="Estimativa de Preço" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                        <input name="email" required defaultValue={editingService?.email} placeholder="E-mail Profissional" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                    </div>
                    <textarea name="description" required defaultValue={editingService?.description} placeholder="Descrição" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold h-24 resize-none" />
                    <MultiImageInput max={3} initialImages={modalImages} onImagesChange={setModalImages} showError={showError} />
                    <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Salvar Serviço</button>
                </form>
            </Modal>

            {/* Cultural Modal (Inline) */}
            <Modal isOpen={showCulturalModal} onClose={() => setShowCulturalModal(false)} title="Evento Cultural">
                <form onSubmit={handleSaveCulturalWrapper} className="space-y-4">
                    <input name="title" required defaultValue={editingCulturalItem?.title} placeholder="Título do Evento" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="type" required defaultValue={editingCulturalItem?.type} placeholder="Tipo" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                        <input name="date" required defaultValue={editingCulturalItem?.date} placeholder="Data" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                    </div>
                    <textarea name="description" required defaultValue={editingCulturalItem?.description} placeholder="Descrição Detalhada" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold h-24 resize-none" />
                    <MultiImageInput max={5} initialImages={modalImages} onImagesChange={setModalImages} showError={showError} />
                    <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Salvar Evento</button>
                </form>
            </Modal>

            {/* Finance Adjustment Modal */}
            <Modal isOpen={showFinanceModal} onClose={() => setShowFinanceModal(false)} title={`Ajuste de Faturamento ${financeType === 'DAILY' ? 'Diário' : 'Mensal'}`}>
                <form onSubmit={handleSaveFinanceAdj} className="space-y-6">
                    <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                        <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-2 text-center">Instruções</p>
                        <p className="text-[11px] font-medium text-orange-800 leading-relaxed text-center">
                            Use este campo para somar ou subtrair valores extras do faturamento exibido. <br />
                            Exemplo: Se vendeu 100 reais por fora, digite **100**. Se quer remover 50, digite **-50**.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Valor do Ajuste (R$)</label>
                        <input
                            name="adjustment"
                            type="number"
                            step="0.01"
                            autoFocus
                            defaultValue={financeType === 'DAILY' ? currentStore?.dailyRevenueAdj : currentStore?.monthlyRevenueAdj}
                            placeholder="0,00"
                            className="w-full p-6 bg-gray-50 rounded-2xl outline-none font-black text-2xl text-center focus:ring-2 ring-orange-200 transition-all"
                        />
                    </div>

                    <button disabled={isSaving} className="w-full py-4 bg-black text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                        {isSaving ? 'Gravando...' : 'Confirmar Ajuste'}
                    </button>
                </form>
            </Modal>

            {/* MODALS END */}
        </div >
    );
};

const NavBtn = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-orange-500 text-white shadow-lg font-black' : 'text-gray-400 hover:bg-gray-50 hover:text-black font-bold'} uppercase text-[10px] tracking-widest`}>
        {icon} {label}
    </button>
);
