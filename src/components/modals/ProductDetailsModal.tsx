import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../../../types';
import { Modal } from '../ui/Modal';

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onAddToCart: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
    isOpen,
    onClose,
    product,
    onAddToCart
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!product) return null;

    const allImages = product.images && product.images.length > 0
        ? product.images
        : [product.image];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col gap-6 -mt-8">
                {/* Carousel Area */}
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 group">
                    <img
                        src={allImages[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-500 hover:text-white"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-500 hover:text-white"
                            >
                                <ChevronRight size={20} />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {allImages.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-orange-500' : 'bg-white/50 backdrop-blur'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Info Area */}
                <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-2xl font-black text-black uppercase tracking-tighter leading-tight">
                            {product.name}
                        </h3>
                        <span className="text-2xl font-black text-green-600 shrink-0">
                            R$ {product.price.toFixed(2)}
                        </span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-2">Descrição</p>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            {product.description || 'Nenhuma descrição disponível para este produto.'}
                        </p>
                    </div>

                    {product.stock > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {product.stock} unidades disponíveis em estoque
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    onAddToCart(product);
                                    onClose();
                                }}
                                className="w-full py-5 bg-orange-500 text-white font-black rounded-3xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-orange-100 hover:bg-orange-600 active:scale-[0.98] transition-all"
                            >
                                <ShoppingBag size={20} /> Adicionar à Sacola
                            </button>
                        </div>
                    ) : (
                        <div className="py-5 px-8 bg-red-50 text-red-500 rounded-3xl text-center border border-red-100">
                            <p className="text-xs font-black uppercase tracking-widest">Produto sem estoque no momento</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
