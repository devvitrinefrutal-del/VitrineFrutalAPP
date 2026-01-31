import React from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { CulturalItem } from '../../types';

interface CulturalDetailPageProps {
    item: CulturalItem;
    onBack: () => void;
}

export const CulturalDetailPage: React.FC<CulturalDetailPageProps> = ({ item, onBack }) => {
    return (
        <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto pb-20">
            <button
                onClick={onBack}
                className="text-purple-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                Voltar ao Giro
            </button>
            <div className="bg-white rounded-[4rem] overflow-hidden border border-gray-100 shadow-sm">
                <img src={item.image} alt={item.title} className="w-full aspect-video object-cover" />
                <div className="p-10 md:p-20 space-y-10">
                    <div className="flex items-center gap-6">
                        <span className="px-6 py-2 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {item.type}
                        </span>
                        <span className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={14} className="text-purple-500" /> {item.date}
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                        {item.title}
                    </h2>
                    <p className="text-xl text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                        {item.description}
                    </p>
                    {item.images && item.images.length > 0 && (
                        <div className="pt-10 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                                Galeria de Fotos
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {item.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Galeria ${idx}`}
                                        className="w-full aspect-square object-cover rounded-3xl shadow-sm hover:scale-105 transition-transform"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
