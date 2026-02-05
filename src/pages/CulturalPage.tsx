import React, { useState } from 'react';
import { ArrowRight, Newspaper, Calendar } from 'lucide-react';
import { CulturalItem, NewsItem } from '../../types';
import { getOptimizedImageUrl } from '../utils/storageUtils';

interface CulturalPageProps {
    items: CulturalItem[];
    news: NewsItem[];
    onSelectItem: (item: CulturalItem) => void;
}

export const CulturalPage: React.FC<CulturalPageProps> = ({ items, news, onSelectItem }) => {
    return (
        <div className="space-y-12 animate-in fade-in pb-20">
            {/* Seção 1: Mini Jornal (Notícias) */}
            {news && news.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Newspaper size={20} />
                        </div>
                        <h2 className="text-xl font-black text-black tracking-tighter uppercase">Mini Jornal</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((n) => (
                            <div key={n.id} className="bg-gray-50 rounded-[2.5rem] p-6 hover:bg-emerald-50 transition-all group flex flex-col gap-4">
                                <div className="aspect-video overflow-hidden rounded-[2rem] bg-gray-200">
                                    {n.image && (
                                        <img
                                            src={getOptimizedImageUrl(n.image, { width: 500, quality: 60 })}
                                            alt={n.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                                        {n.category}
                                    </span>
                                    <h3 className="text-lg font-black text-gray-900 mt-2 line-clamp-2 leading-tight uppercase tracking-tighter">
                                        {n.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs mt-2 line-clamp-3 font-medium leading-relaxed">
                                        {n.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seção 2: Giro da Cidade (Eventos) */}
            <div className="space-y-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6">
                    <div>
                        <span className="text-orange-500 font-black uppercase tracking-widest text-[10px] mb-2 block">Vitrine Cultural</span>
                        <h2 className="text-3xl font-black text-black tracking-tighter uppercase leading-none">
                            Giro da Cidade
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row cursor-pointer transition-all hover:shadow-xl group"
                        >
                            <div className="md:w-1/2 overflow-hidden aspect-video relative">
                                <img
                                    src={getOptimizedImageUrl(item.image, { width: 800, quality: 70 })}
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
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum evento no momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
