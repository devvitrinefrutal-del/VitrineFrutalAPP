import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CulturalItem } from '../../types';
import { getOptimizedImageUrl } from '../utils/storageUtils';

interface CulturalDetailPageProps {
    item: CulturalItem;
    onBack: () => void;
}

export const CulturalDetailPage: React.FC<CulturalDetailPageProps> = ({ item, onBack }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const allImages = item.images && item.images.length > 0
        ? item.images
        : [item.image];

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (diff > 50) nextImage();
        if (diff < -50) prevImage();
        setTouchStart(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto pb-20">
            <button
                onClick={onBack}
                className="text-emerald-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                Voltar ao Giro
            </button>
            <div className="bg-white rounded-[4rem] overflow-hidden border border-gray-100 shadow-sm">
                {/* Carousel Area */}
                <div
                    className="relative aspect-video overflow-hidden bg-gray-50 touch-pan-y group"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={getOptimizedImageUrl(allImages[currentImageIndex], { width: 1200, quality: 75 })}
                        alt={item.title}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur rounded-[1.5rem] shadow-lg text-black lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-white z-10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur rounded-[1.5rem] shadow-lg text-black lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-white z-10"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                                        className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'w-8 bg-emerald-500 shadow-lg' : 'w-2 bg-white/50 backdrop-blur hover:bg-white/80'}`}
                                        aria-label={`Ir para imagem ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-10 md:p-20 space-y-10">
                    <div className="flex items-center gap-6">
                        <span className="px-6 py-2 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {item.type}
                        </span>
                        <span className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={14} className="text-emerald-500" /> {item.date}
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                        {item.title}
                    </h2>
                    <p className="text-xl text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                        {item.description}
                    </p>

                    {/* Mini thumbnails for gallery selection if multiple images */}
                    {allImages.length > 1 && (
                        <div className="pt-10 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                                Galeria de Fotos ({allImages.length})
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-emerald-500 scale-110 shadow-lg z-10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img
                                            src={getOptimizedImageUrl(img, { width: 200, quality: 60 })}
                                            alt={`Miniatura ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
