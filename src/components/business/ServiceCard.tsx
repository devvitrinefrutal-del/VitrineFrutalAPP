import React from 'react';
import { DollarSign, ChevronRight } from 'lucide-react';
import { Service } from '../../../types';

interface ServiceCardProps {
    service: Service;
    onClick: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
    return (
        <div
            onClick={() => onClick(service)}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-8 hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98]"
        >
            <img
                src={service.image}
                alt={service.name}
                className="w-40 h-40 rounded-[2.5rem] object-cover shadow-xl group-hover:rotate-2 transition-transform"
            />
            <div className="flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-2xl font-black text-black leading-none mb-1 uppercase tracking-tighter">
                        {service.name}
                    </h3>
                    <p className="text-[10px] text-orange-500 font-black uppercase mb-2 tracking-widest">
                        {service.type}
                    </p>
                </div>
                <p className="text-xs text-gray-500 mb-6 line-clamp-3 font-medium leading-relaxed">
                    {service.description}
                </p>
                <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                        <DollarSign size={12} className="text-green-500" /> {service.priceEstimate}
                    </div>
                    <div className="font-black text-blue-600 text-[10px] flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-[0.2em]">
                        Ver Detalhes <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};
