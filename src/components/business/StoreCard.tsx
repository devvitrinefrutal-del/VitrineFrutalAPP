import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { Store, StoreRating } from '../../../types';

interface StoreCardProps {
    store: Store;
    ratings: StoreRating[];
    onClick: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, ratings, onClick }) => {
    const storeRatings = ratings.filter(r => r.storeId === store.id);
    const avgRating = storeRatings.length > 0 ? storeRatings.reduce((s, r) => s + r.rating, 0) / storeRatings.length : 0;

    return (
        <div
            onClick={() => onClick(store)}
            className="group cursor-pointer bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row h-full active:scale-[0.98] transition-all hover:shadow-2xl"
        >
            <div className="w-full sm:w-1/2 aspect-video sm:aspect-square overflow-hidden relative">
                <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {avgRating > 0 && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-2 border border-white">
                        <Star size={14} className="text-orange-500" fill="currentColor" />
                        <span className="text-[11px] font-black text-black">{avgRating.toFixed(1)}</span>
                        <span className="text-[9px] text-gray-400 font-bold">({storeRatings.length})</span>
                    </div>
                )}
            </div>
            <div className="p-10 flex flex-col justify-center flex-1">
                <h3 className="font-black text-3xl text-black group-hover:text-green-600 transition-colors uppercase tracking-tighter leading-none mb-2">
                    {store.name}
                </h3>
                <p className="text-gray-400 text-[10px] mb-6 font-black uppercase tracking-[0.2em]">
                    {store.category}
                </p>
                <div className="mt-auto font-black text-green-600 text-[10px] flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-[0.2em]">
                    Ver Coleção Completa <ChevronRight size={18} />
                </div>
            </div>
        </div>
    );
};
