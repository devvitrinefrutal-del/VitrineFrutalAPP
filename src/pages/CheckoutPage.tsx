import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, MapPin, Truck, Building2, DollarSign, CreditCard, ShoppingBag, Send } from 'lucide-react';
import { User, Store } from '../types';
import { CartItem } from '../hooks/useCart';

interface CheckoutPageProps {
    cart: CartItem[];
    user: User | null;
    store: Store | null;
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemoveFromCart: (productId: string) => void;
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
                <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Seu Carrinho</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        {cart.map((item) => (
                            <div key={item.productId} className="flex gap-6 border-b border-gray-100 pb-6 mb-6 last:mb-0 last:pb-0 last:border-0 relative">
                                <img src={item.image} className="w-24 h-24 rounded-2xl object-cover" />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="pr-8">
                                        <h4 className="font-black text-black leading-tight uppercase tracking-tighter mb-1">{item.name}</h4>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Unitário: R$ {item.price.toFixed(2)}</p>
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
                                <button onClick={() => onRemoveFromCart(item.productId)} className="absolute top-0 right-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Observações do Pedido</label>
                            <input
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                placeholder="Ex: Tirar cebola, campainha estragada..."
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
                                    {method === 'PIX' && <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-md font-bold">-5% OFF</span>}
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
                            {paymentMethod === 'PIX' && (
                                <div className="flex justify-between text-[11px] font-bold text-green-500 uppercase tracking-widest">
                                    <span>Desconto PIX</span>
                                    <span>- R$ {(cartTotal * 0.05).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-4 text-xl font-black text-gray-900">
                                <span>Total</span>
                                <span>R$ {(paymentMethod === 'PIX' ? finalTotal - (cartTotal * 0.05) : finalTotal).toFixed(2)}</span>
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
