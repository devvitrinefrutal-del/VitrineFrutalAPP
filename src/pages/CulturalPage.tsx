import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CulturalItem } from '../types';

interface CulturalPageProps {
    items: CulturalItem[];
    onSelectItem: (item: CulturalItem) => void;
}

export const CulturalPage: React.FC<CulturalPageProps> = ({ items, onSelectItem }) => {
    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <h2 className="text-3xl font-black text-black tracking-tighter uppercase tracking-widest text-sm">
                O Giro da Cidade
            </h2>
            <div className="grid grid-cols-1 gap-10">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row cursor-pointer transition-all hover:shadow-xl group"
                    >
                        <div className="md:w-1/2 overflow-hidden aspect-video">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="p-10 md:w-1/2 flex flex-col justify-center">
                            <span className="text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                {item.type}
                            </span>
                            <h3 className="text-4xl font-black text-black mb-6 leading-none tracking-tighter uppercase">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 mb-8 line-clamp-2 font-medium leading-relaxed">
                                {item.description}
                            </p>
                            <div className="flex items-center gap-2 font-black text-purple-600 text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                Ver Detalhes do Evento <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
