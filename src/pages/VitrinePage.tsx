import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, ChevronRight } from 'lucide-react';
import { Store, Product, StoreRating } from '../../types';
import { Logo } from '../components/ui/Logo';
import { ProductCard } from '../components/business/ProductCard';
import { StoreCard } from '../components/business/StoreCard';

interface VitrinePageProps {
    stores: Store[];
    products: Product[];
    allRatings: StoreRating[];
    onSelectStore: (store: Store) => void;
    onAddToCart: (product: Product) => void;
    searchGlobal: (query: string) => Promise<any[]>;
}

export const VitrinePage: React.FC<VitrinePageProps> = ({
    stores,
    products,
    allRatings,
    onSelectStore,
    onAddToCart,
    searchGlobal
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });

    const categories = [
        { name: 'Todas', icon: '🏪' },
        { name: 'Moda e Acessórios', icon: '👕' },
        { name: 'Casa e Decoração', icon: '🏠' },
        { name: 'Tecnologia e Eletrônicos', icon: '💻' },
        { name: 'Beleza e Cuidados Pessoais', icon: '💄' },
        { name: 'Construção e Ferramentas', icon: '🏗️' },
        { name: 'Saúde e Bem-Estar', icon: '💊' },
        { name: 'Agro e Pet', icon: '🐾' },
        { name: 'Veículos e Autopeças', icon: '🚗' },
        { name: 'Papelaria e Presentes', icon: '🎁' }
    ];

    const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
    const [onlyDelivery, setOnlyDelivery] = useState(false);

    const neighborhoods = [
        'Todos',
        'Centro', 'Caju', 'XV de Novembro', 'Estudantil',
        'Nossa Senhora do Carmo', 'Nossa Senhora Aparecida', 'Princesa Isabel I e II', 'Santos Dumont', 'Progresso', 'Alto Boa Vista', 'Eldorado', 'Vila Esperança',
        'Cidade Jardim', 'Jardim do Bosque I e II', 'Jardim das Laranjeiras', 'Jardim das Palmeiras', 'Jardim Brasil', 'Jardim das Esmeraldas', 'Jardins dos Ipês', 'Morada dos Ipês', 'Ipê Amarelo',
        'Frutal II e III', 'Novo Horizonte', 'Nova Frutal', 'Waldemar Marchi I e II', 'Paralelo XX', 'Alceu Queiroz', 'Residencial das Américas', 'Residencial Parque das Acácias',
        'Granville Casa Blanca', 'Villa Florence'
    ];

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length >= 3) {
            setIsSearching(true);
            await searchGlobal(val);
            setIsSearching(false);
        }
    };

    // Filter Logic - Local for stores, global search already happened for products
    const filteredProducts = products.filter(p => {
        const store = stores.find(s => s.id === p.storeId);
        if (!store) return false;

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice = priceRange.min ? p.price >= parseFloat(priceRange.min) : true;
        const matchesMaxPrice = priceRange.max ? p.price <= parseFloat(priceRange.max) : true;

        const matchesCategory = selectedCategory === 'Todas' || store.category === selectedCategory;
        const matchesNeighborhood = selectedNeighborhood === 'Todos' || store.neighborhood === selectedNeighborhood;
        const matchesDelivery = !onlyDelivery || store.hasDelivery;

        return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesCategory && matchesNeighborhood && matchesDelivery;
    });

    const filteredStores = stores.filter(s => {
        const matchesCategory = selectedCategory === 'Todas' || s.category === selectedCategory;
        const matchesNeighborhood = selectedNeighborhood === 'Todos' || s.neighborhood === selectedNeighborhood;
        const matchesDelivery = !onlyDelivery || s.hasDelivery;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesNeighborhood && matchesDelivery && matchesSearch;
    });

    const hasActiveFilters = searchQuery.length > 0 || priceRange.min !== '' || priceRange.max !== '' || selectedCategory !== 'Todas' || selectedNeighborhood !== 'Todos' || onlyDelivery;

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

                    <div className="w-full max-w-2xl bg-white p-2 rounded-2xl flex flex-col md:flex-row shadow-2xl shadow-green-900/50 relative z-20 gap-2">
                        <div className="flex-1 flex items-center px-4 gap-3">
                            <Search className="text-gray-400" size={20} />
                            <input
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="O que você procura hoje?"
                                className="w-full py-3 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${hasActiveFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <Filter size={16} /> Filtros
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-xl animate-in slide-in-from-top-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-2">Bairro</label>
                                    <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm appearance-none">
                                        {neighborhoods.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-2">Preço Máximo</label>
                                    <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" placeholder="R$ Máximo" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={onlyDelivery} onChange={(e) => setOnlyDelivery(e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-orange-500 focus:ring-orange-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Apenas quem faz Delivery</span>
                                </label>
                                <button onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); setSelectedNeighborhood('Todos'); setOnlyDelivery(false); setPriceRange({ min: '', max: '' }); setShowFilters(false); }} className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors">
                                    Limpar Tudo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modern Categories Bar */}
            {!searchQuery && (
                <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-4 px-4 scroll-smooth">
                    {categories.map(cat => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`flex flex-col items-center gap-2 group min-w-[100px] transition-all`}
                        >
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-sm transition-all border ${selectedCategory === cat.name ? 'bg-orange-500 border-orange-400 text-white scale-110 shadow-orange-100' : 'bg-white border-gray-100 group-hover:border-orange-200'}`}>
                                {cat.icon}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-tight transition-colors ${selectedCategory === cat.name ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {cat.name.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {searchQuery.length > 0 ? (
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
                        {filteredStores.length > 0 ? (
                            filteredStores.map((store) => (
                                <StoreCard
                                    key={store.id}
                                    store={store}
                                    ratings={allRatings}
                                    onClick={onSelectStore}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem]">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Nenhuma loja encontrada nesta categoria</p>
                            </div>
                        )}
                    </div>
                </div >
            )}
        </div >
    );
};
