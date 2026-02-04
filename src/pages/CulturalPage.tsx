import React, { useState } from 'react';
import { ArrowRight, Newspaper, Calendar } from 'lucide-react';
import { CulturalItem, NewsItem } from '../../types';

interface CulturalPageProps {
    items: CulturalItem[];
    news: NewsItem[];
    onSelectItem: (item: CulturalItem) => void;
}

export const CulturalPage: React.FC<CulturalPageProps> = ({ items, news, onSelectItem }) => {
    const [activeTab, setActiveTab] = useState<'AGENDA' | 'NOTICIAS'>('AGENDA');

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-6">
                <div>
                    <span className="text-orange-500 font-black uppercase tracking-widest text-[10px] mb-2 block">Vitrine Cultural</span>
                    <h2 className="text-3xl font-black text-black tracking-tighter uppercase leading-none">
                        {activeTab === 'AGENDA' ? 'Giro da Cidade' : 'Mini Jornal'}
                    </h2>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('AGENDA')}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'AGENDA' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Calendar size={14} /> Agenda
                    </button>
                    <button
                        onClick={() => setActiveTab('NOTICIAS')}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'NOTICIAS' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Newspaper size={14} /> Notícias
                    </button>
                </div>
            </div>

            {activeTab === 'AGENDA' ? (
                <div className="grid grid-cols-1 gap-10">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row cursor-pointer transition-all hover:shadow-xl group"
                        >
                            <div className="md:w-1/2 overflow-hidden aspect-video relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black">
                                    {item.date}
                                </div>
                            </div>
                            <div className="p-10 md:w-1/2 flex flex-col justify-center">
                                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    {item.type}
                                </span>
                                <h3 className="text-4xl font-black text-black mb-6 leading-none tracking-tighter uppercase">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 mb-8 line-clamp-2 font-medium leading-relaxed">
                                    {item.description}
                                </p>
                                <div className="flex items-center gap-2 font-black text-emerald-600 text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                    Ver Detalhes do Evento <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum evento programado.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
                            <div className="w-full h-48 rounded-[1.5rem] overflow-hidden mb-6">
                                <img src={item.image} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex gap-2 mb-3">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.category}</span>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-black text-black leading-tight mb-3 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-4 mb-4 flex-1">
                                    {item.content}
                                </p>
                                <button className="w-full py-3 bg-gray-50 hover:bg-black hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900">
                                    Ler Completo
                                </button>
                            </div>
                        </div>
                    ))}
                    {news.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma notícia encontrada.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
