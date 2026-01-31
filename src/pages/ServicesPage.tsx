import React from 'react';
import { Service } from '../../types';
import { ServiceCard } from '../components/business/ServiceCard';

interface ServicesPageProps {
    services: Service[];
    onSelectService: (service: Service) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, onSelectService }) => {
    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <h2 className="text-3xl font-black text-black tracking-tighter uppercase tracking-widest text-sm">
                Prestadores em Frutal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onClick={onSelectService}
                    />
                ))}
            </div>
        </div>
    );
};
