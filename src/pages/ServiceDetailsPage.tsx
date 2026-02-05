import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Service } from '../../types';
import { getOptimizedImageUrl } from '../utils/storageUtils';

interface ServiceDetailsPageProps {
    service: Service;
    onBack: () => void;
}

export const ServiceDetailsPage: React.FC<ServiceDetailsPageProps> = ({ service, onBack }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleWhatsApp = () => {
        const message = `Olá ${service.name}, vi seu perfil no Vitrine Frutal e gostaria de saber mais sobre seus serviços.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${service.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
    };

    const allImages = service.images && service.images.length > 0
        ? service.images
        : [service.image];

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
                className="text-blue-600 font-black flex items-center gap-2 group uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                Voltar aos Serviços
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
                        alt={service.name}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur rounded-[1.5rem] shadow-lg text-black lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-blue-500 hover:text-white z-10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur rounded-[1.5rem] shadow-lg text-black lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-blue-500 hover:text-white z-10"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                                        className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'w-8 bg-blue-500 shadow-lg' : 'w-2 bg-white/50 backdrop-blur hover:bg-white/80'}`}
                                        aria-label={`Ir para imagem ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-10 md:p-20 space-y-10">
                    <div className="flex flex-wrap items-center gap-6">
                        <span className="px-6 py-2 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {service.type}
                        </span>
                        {service.priceEstimate && (
                            <span className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <DollarSign size={14} className="text-green-500" /> {service.priceEstimate}
                            </span>
                        )}
                        {service.address && (
                            <span className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <MapPin size={14} className="text-blue-500" /> {service.address}
                            </span>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                            {service.name}
                        </h2>
                        <p className="text-xl text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                            {service.description}
                        </p>
                    </div>

                    <button
                        onClick={handleWhatsApp}
                        className="w-full md:w-auto px-12 py-6 bg-green-600 text-white font-black rounded-[2rem] hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-100"
                    >
                        <MessageCircle size={24} /> Falar no WhatsApp
                    </button>

                    {allImages.length > 1 && (
                        <div className="pt-10 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                                Trabalhos Realizados ({allImages.length})
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-blue-500 scale-110 shadow-lg z-10' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
