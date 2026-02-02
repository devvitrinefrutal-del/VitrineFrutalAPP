import React from 'react';
import { ArrowLeft, Star, Store as StoreIcon, MapPin } from 'lucide-react';
import { Store, Product, StoreRating } from '../../types';
import { ProductCard } from '../components/business/ProductCard';

interface StoreDetailsPageProps {
    store: Store;
    products: Product[];
    allRatings: StoreRating[];
    onBack: () => void;
    onAddToCart: (product: Product) => void;
}

export const StoreDetailsPage: React.FC<StoreDetailsPageProps> = ({
    store,
    products,
    allRatings,
    onBack,
    onAddToCart
}) => {
    const storeRatings = allRatings.filter(r => r.storeId === store.id);
    const avgRating = storeRatings.length > 0 ? storeRatings.reduce((s, r) => s + r.rating, 0) / storeRatings.length : 0;

    return (
        <div className="space-y-10 animate-in fade-in pb-20">
            <button
                onClick={onBack}
                className="text-green-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                Explorar Outras Lojas
            </button>

            <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <img src={store.image} alt={store.name} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg" />
                <div>
                    <h2 className="text-4xl font-black text-black tracking-tighter uppercase">
                        {store.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-orange-500 font-black text-[10px] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                            <Star size={12} fill="currentColor" /> {avgRating > 0 ? avgRating.toFixed(1) : 'Sem avaliações'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                            <StoreIcon size={16} className="text-orange-500" /> {store.category}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-gray-500 font-medium text-xs">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{store.address} - {store.neighborhood}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        className="h-full"
                    />
                ))}
            </div>
        </div>
    );
};
