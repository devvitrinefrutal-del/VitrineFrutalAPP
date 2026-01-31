import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 overflow-hidden ${className}`}>
            <img src="/pwa-192x192.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
    );
};
