import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, ChevronRight } from 'lucide-react';
import { Store, Product, StoreRating } from '../types';
import { Logo } from '../components/ui/Logo';
import { ProductCard } from '../components/business/ProductCard';
import { StoreCard } from '../components/business/StoreCard';

interface VitrinePageProps {
    stores: Store[];
    products: Product[];
    allRatings: StoreRating[];
    onSelectStore: (store: Store) => void;
    onAddToCart: (product: Product) => void;
}

export const VitrinePage: React.FC<VitrinePageProps> = ({
    stores,
    products,
    allRatings,
    onSelectStore,
    onAddToCart
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice = priceRange.min ? p.price >= parseFloat(priceRange.min) : true;
        const matchesMaxPrice = priceRange.max ? p.price <= parseFloat(priceRange.max) : true;
        return matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    const hasActiveFilters = searchQuery.length > 0 || priceRange.min !== '' || priceRange.max !== '';

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            {/* Hero Header with Search */}
            <div className="relative w-full py-12 px-6 md:py-20 overflow-hidden rounded-[3rem] shadow-2xl group border-4 border-white bg-green-800">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-60 mix-blend-luminosity"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1594833211511-0985f957017c?w=1600&q=80")' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-green-800/60"></div>

                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="text-center space-y-2">
                        <div className="inline-block p-3 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl mb-4">
                            <Logo />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                            Vitrine<span className="text-orange-400">Frutal</span>
                        </h1>
                        <p className="text-sm md:text-lg font-black text-white/80 tracking-widest uppercase">
                            "Se tem em Frutal, está na vitrine"
                        </p>
                    </div>

                    <div className="w-full max-w-2xl bg-white p-2 rounded-2xl flex shadow-2xl shadow-green-900/50 relative z-20">
                        <div className="flex-1 flex items-center px-4 gap-3">
                            <Search className="text-gray-400" size={20} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="O que você procura hoje?"
                                className="w-full py-3 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all ${hasActiveFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Filter size={16} /> Filtros
                        </button>
                    </div>

                    {showFilters && (
                        <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-xl animate-in slide-in-from-top-4 flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 w-full grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-2">Preço Mín.</label>
                                    <input type="number" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" placeholder="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-2">Preço Máx.</label>
                                    <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" placeholder="R$ Máximo" />
                                </div>
                            </div>
                            <button onClick={() => { setSearchQuery(''); setPriceRange({ min: '', max: '' }); setShowFilters(false); }} className="w-full md:w-auto px-6 py-4 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors">
                                Limpar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {hasActiveFilters ? (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-black tracking-tighter uppercase tracking-widest">
                            Resultados da Busca <span className="text-gray-400 text-sm ml-2">({filteredProducts.length} itens)</span>
                        </h2>
                    </div>
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(p => {
                                const store = stores.find(s => s.id === p.storeId);
                                return (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        storeName={store?.name}
                                        onAddToCart={onAddToCart}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nenhum produto encontrado</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-black tracking-tighter uppercase tracking-widest text-[10px]">Estabelecimentos Parceiros</h2>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-orange-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Frutal • MG</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                        {stores.map((store) => (
                            <StoreCard
                                key={store.id}
                                store={store}
                                ratings={allRatings}
                                onClick={onSelectStore}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
