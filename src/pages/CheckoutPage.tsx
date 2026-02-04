import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, MapPin, Truck, Building2, DollarSign, CreditCard, ShoppingBag, Send } from 'lucide-react';
import { User, Store } from '../../types';
import { CartItem } from '../hooks/useCart';

interface CheckoutPageProps {
    cart: CartItem[];
    user: User | null;
    store: Store | null;
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemoveFromCart: (productId: string) => void;
    onClearCart: () => void;
    onBack: () => void;
    onFinalize: (data: any) => Promise<boolean>;
    isFinishing: boolean;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
    cart,
    user,
    store,
    onUpdateQuantity,
    onRemoveFromCart,
    onClearCart,
    onBack,
    onFinalize,
    isFinishing
}) => {
    const [deliveryMethod, setDeliveryMethod] = useState<'ENTREGA' | 'RETIRADA'>('ENTREGA');
    const [address, setAddress] = useState(user?.address || '');
    const [paymentMethod, setPaymentMethod] = useState('PIX');
    const [observation, setObservation] = useState('');
    const [changeFor, setChangeFor] = useState('');

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = (deliveryMethod === 'ENTREGA' && store?.deliveryFee) ? store.deliveryFee : 0;
    const finalTotal = cartTotal + deliveryFee;

    const handleFinish = () => {
        onFinalize({
            deliveryMethod,
            customerAddress: address,
            deliveryFee,
            observation,
            paymentMethod,
            changeFor,
            storeId: store?.id
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="bg-white p-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Sua Sacola</h2>
            </div>

            {store && (
                <div className="flex items-center gap-4 bg-orange-500 p-6 rounded-[2rem] text-white shadow-lg shadow-orange-100 border-2 border-orange-400 animate-in slide-in-from-left-4">
                    <img src={store.image} alt={store.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" />
                    <div>
                        <h3 className="font-black text-lg leading-none uppercase tracking-tighter">{store.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1 flex items-center gap-2">
                            <Building2 size={12} /> {store.category}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="font-black text-lg uppercase tracking-widest flex items-center gap-2">
                                <ShoppingBag size={20} className="text-orange-500" /> Itens
                            </h3>
                            <button
                                onClick={() => { if (confirm('Esvaziar toda a sacola?')) onClearCart(); }}
                                className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={14} /> Limpar Sacola
                            </button>
                        </div>

                        {cart.map((item) => (
                            <div key={item.productId} className="flex gap-6 border-b border-gray-100 pb-6 mb-6 last:mb-0 last:pb-0 last:border-0 relative">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="pr-8">
                                        <h4 className="font-black text-black leading-tight uppercase tracking-tighter mb-1">{item.name}</h4>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Unitário: R$ {item.price.toFixed(2)}</p>
                                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Disponível em Estoque: {item.stock}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center bg-gray-50 rounded-xl p-1">
                                            <button onClick={() => onUpdateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black hover:shadow-sm rounded-lg transition-all font-bold">-</button>
                                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black hover:shadow-sm rounded-lg transition-all font-bold">+</button>
                                        </div>
                                        <span className="font-black text-green-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveFromCart(item.productId)} className="absolute top-0 right-0 p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all z-10 cursor-pointer shadow-sm">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
                        <h3 className="font-black text-lg uppercase tracking-widest flex items-center gap-2">
                            <Truck size={20} className="text-orange-500" /> Entrega
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDeliveryMethod('ENTREGA')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'ENTREGA' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                            >
                                <Truck size={24} />
                                <span className="font-black text-[10px] uppercase tracking-widest">Delivery</span>
                            </button>
                            <button
                                onClick={() => setDeliveryMethod('RETIRADA')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'RETIRADA' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                            >
                                <Building2 size={24} />
                                <span className="font-black text-[10px] uppercase tracking-widest">Retirada</span>
                            </button>
                        </div>

                        {deliveryMethod === 'ENTREGA' && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                <div className="flex gap-2 p-4 bg-blue-50 text-blue-600 rounded-2xl text-xs font-medium">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <p>Confira seu endereço para não haver erros na entrega.</p>
                                </div>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Endereço completo (Rua, Número, Bairro, Referência)"
                                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-black focus:ring-2 focus:ring-orange-200 min-h-[100px] resize-none"
                                />
                            </div>
                        )}

                        {deliveryMethod === 'RETIRADA' && store && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                <div className="flex flex-col gap-3 p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                                    <div className="flex items-center gap-2 text-orange-600">
                                        <MapPin size={18} />
                                        <span className="font-black text-[10px] uppercase tracking-widest">Endereço de Retirada</span>
                                    </div>
                                    <p className="font-bold text-black text-sm pr-4">
                                        {store.address} - {store.neighborhood}
                                    </p>
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest italic">
                                        * Retire seu pedido diretamente com o lojista.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Observações do Pedido</label>
                            <input
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                placeholder="Escreva aqui suas observações (opcional)"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-black focus:ring-2 focus:ring-orange-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="font-black text-lg uppercase tracking-widest flex items-center gap-2 mb-6">
                            <DollarSign size={20} className="text-green-500" /> Pagamento
                        </h3>
                        <div className="space-y-3 mb-6">
                            {['PIX', 'DINHEIRO', 'CARTAO'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${paymentMethod === method ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                                >
                                    <span className="font-black text-[10px] uppercase tracking-widest">
                                        {method === 'CARTAO' ? 'Cartão Crédito/Débito' : method}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {paymentMethod === 'DINHEIRO' && (
                            <div className="mb-6 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Troco para quanto?</label>
                                <input
                                    type="number"
                                    value={changeFor}
                                    onChange={(e) => setChangeFor(e.target.value)}
                                    placeholder="R$ 0,00"
                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold"
                                />
                            </div>
                        )}

                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Entrega</span>
                                <span>{deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 text-xl font-black text-gray-900">
                                <span>Total</span>
                                <span>R$ {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            disabled={isFinishing}
                            className="w-full mt-8 py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isFinishing ? 'Processando...' : <><Send size={18} /> Enviar Pedido via WhatsApp</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
