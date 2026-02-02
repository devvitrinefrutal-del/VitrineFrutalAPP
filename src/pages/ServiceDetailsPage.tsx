import React from 'react';
import { ArrowLeft, MessageCircle, MapPin, DollarSign } from 'lucide-react';
import { Service } from '../../types';

interface ServiceDetailsPageProps {
    service: Service;
    onBack: () => void;
}

export const ServiceDetailsPage: React.FC<ServiceDetailsPageProps> = ({ service, onBack }) => {
    const handleWhatsApp = () => {
        const message = `Olá ${service.name}, vi seu perfil no Vitrine Frutal e gostaria de saber mais sobre seus serviços.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${service.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
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
                <img
                    src={service.image}
                    alt={service.name}
                    className="w-full aspect-video object-cover"
                />

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

                    {service.images && service.images.length > 0 && (
                        <div className="pt-10 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                                Trabalhos Realizados
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {service.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Trabalho ${idx}`}
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
