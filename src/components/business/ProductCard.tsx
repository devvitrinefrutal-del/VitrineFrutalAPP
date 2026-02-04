import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../../../types';

interface ProductCardProps {
    product: Product;
    storeName?: string;
    onAddToCart: (product: Product) => void;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    storeName,
    onAddToCart,
    className = ''
}) => {
    return (
        <div className={`bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all ${className}`}>
            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {storeName && (
                    <div className="absolute bottom-2 left-2 px-3 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm text-[8px] font-black uppercase tracking-widest text-black/70">
                        {storeName}
                    </div>
                )}
            </div>
            <h4 className="font-black text-black text-sm leading-tight uppercase tracking-tighter mb-1 line-clamp-2 min-h-[2.5em]">
                {product.name}
            </h4>
            <div className="flex justify-between items-end mt-auto">
                <span className="text-lg font-black text-green-600">
                    R$ {product.price.toFixed(2)}
                </span>
                <button
                    disabled={product.stock <= 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    className={`p-2 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1 ${product.stock <= 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-orange-500 shadow-gray-200'
                        }`}
                    title={product.stock <= 0 ? "Produto sem estoque" : "Adicionar ao carrinho"}
                >
                    {product.stock <= 0 ? (
                        <span className="text-[8px] font-black uppercase px-2">Sem estoque</span>
                    ) : (
                        <Plus size={16} />
                    )}
                </button>
            </div>
        </div>
    );
};
