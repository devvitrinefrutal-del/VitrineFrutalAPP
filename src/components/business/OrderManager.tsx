import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, DollarSign, MessageCircle } from 'lucide-react';
import { Order, Store } from '../../../types';

interface OrderManagerProps {
    orders: Order[];
    currentStore: Store;
    onUpdateStatus: (orderId: string, newStatus: string) => void;
    onUpdateDeliveryFee?: (orderId: string, fee: number) => void;
}

const OrderCol = ({ title, list, color, onSelectOrder }: { title: string, list: Order[], color: string, onSelectOrder: (o: Order) => void }) => (
    <div className={`space-y-4 min-w-[300px] flex-1 bg-${color}-50/50 p-6 rounded-[2.5rem] border border-${color}-100`}>
        <div className={`flex items-center gap-3 mb-6 bg-${color}-100 w-fit px-4 py-2 rounded-xl`}>
            <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`}></div>
            <h3 className={`font-black text-${color}-700 tracking-widest text-[10px] uppercase`}>{title} <span className="opacity-50 ml-1">({list.length})</span></h3>
        </div>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {list.length === 0 && <div className="text-center py-10 text-gray-400 text-[10px] font-black uppercase tracking-widest opacity-50">Sem pedidos</div>}
            {list.map(order => (
                <div key={order.id} onClick={() => onSelectOrder(order)} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group active:scale-95">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-black text-black text-xs uppercase tracking-tighter mb-1">{order.customerName}</p>
                            <p className="text-[9px] text-gray-400 font-bold">#{order.id.slice(0, 8)}</p>
                        </div>
                        <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="space-y-2 mb-4 border-t border-b border-gray-50 py-3">
                        {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex justify-between text-[10px] font-medium text-gray-500">
                                <span>{item.quantity}x {item.name}</span>
                            </div>
                        ))}
                        {order.items.length > 2 && <p className="text-[9px] text-gray-400 italic font-bold">...e mais {order.items.length - 2} itens</p>}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black text-${color}-600 bg-${color}-50 px-3 py-1 rounded-lg uppercase tracking-widest`}>{(order.total || 0).toFixed(2)} R$</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const OrderManager: React.FC<OrderManagerProps> = ({ orders, currentStore, onUpdateStatus }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const storeOrders = orders.filter(o => o.storeId === currentStore.id);

    if (selectedOrder) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Pedido #{selectedOrder.id.slice(0, 8)}</h2>
                        <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 font-bold transition-all transform hover:rotate-90">✕</button>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</p>
                            <p className="font-black text-lg text-black uppercase tracking-tighter">{selectedOrder.customerName}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <MessageCircle size={14} className="text-green-500" /> {selectedOrder.customerPhone || 'Não informado'}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrega ({selectedOrder.deliveryMethod})</p>
                            <div className="flex items-start gap-2 text-xs font-medium text-gray-600 leading-relaxed bg-white p-3 rounded-xl shadow-sm">
                                <MapPin size={14} className="mt-0.5 text-orange-500 shrink-0" />
                                {selectedOrder.customerAddress}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Itens do Pedido</p>
                        {selectedOrder.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-xs font-black text-gray-600">{item.quantity}x</span>
                                    <div>
                                        <p className="font-black text-xs text-black uppercase tracking-tight">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">Unit: R$ {item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <span className="font-black text-sm text-black">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {selectedOrder.observation && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-8 flex gap-3 text-yellow-800 text-xs font-medium">
                            <span className="font-black uppercase tracking-widest shrink-0">Obs:</span>
                            {selectedOrder.observation}
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
                        <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>R$ {(selectedOrder.total - (selectedOrder.deliveryFee || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                            <span>Taxa de Entrega</span>
                            <span>R$ {selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-black uppercase tracking-tighter pt-4">
                            <span>Total</span>
                            <span className="text-green-600">R$ {selectedOrder.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-xl text-xs font-bold text-gray-600 justify-center">
                            <DollarSign size={14} /> Método: {selectedOrder.paymentMethod || 'Não informado'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {selectedOrder.status === 'PENDENTE' && (
                            <button onClick={() => { onUpdateStatus(selectedOrder.id, 'PREPARANDO'); setSelectedOrder(null); }} className="col-span-2 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <Package size={18} /> Iniciar Preparo
                            </button>
                        )}
                        {selectedOrder.status === 'PREPARANDO' && (
                            <button onClick={() => { onUpdateStatus(selectedOrder.id, 'EM_ROTA'); setSelectedOrder(null); }} className="col-span-2 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <Truck size={18} /> Despachar Entrega
                            </button>
                        )}
                        {selectedOrder.status === 'EM_ROTA' && (
                            <button onClick={() => { onUpdateStatus(selectedOrder.id, 'ENTREGUE'); setSelectedOrder(null); }} className="col-span-2 py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <CheckCircle size={18} /> Confirmar Entrega
                            </button>
                        )}
                        {(selectedOrder.status !== 'ENTREGUE' && selectedOrder.status !== 'CANCELADO') && (
                            <button onClick={() => { onUpdateStatus(selectedOrder.id, 'CANCELADO'); setSelectedOrder(null); }} className="col-span-2 py-4 bg-gray-100 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-200">
                                <XCircle size={18} /> Cancelar Pedido
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max pb-4">
                <OrderCol
                    title="Novos Pedidos"
                    list={storeOrders.filter(o => o.status === 'PENDENTE')}
                    color="orange"
                    onSelectOrder={setSelectedOrder}
                />
                <OrderCol
                    title="Em Preparo"
                    list={storeOrders.filter(o => o.status === 'PREPARANDO')}
                    color="yellow"
                    onSelectOrder={setSelectedOrder}
                />
                <OrderCol
                    title="Saiu para Entrega"
                    list={storeOrders.filter(o => o.status === 'EM_ROTA')}
                    color="blue"
                    onSelectOrder={setSelectedOrder}
                />
                <OrderCol
                    title="Concluídos"
                    list={storeOrders.filter(o => o.status === 'ENTREGUE')}
                    color="green"
                    onSelectOrder={setSelectedOrder}
                />
                <OrderCol
                    title="Cancelados"
                    list={storeOrders.filter(o => o.status === 'CANCELADO')}
                    color="red"
                    onSelectOrder={setSelectedOrder}
                />
            </div>
        </div>
    );
};
