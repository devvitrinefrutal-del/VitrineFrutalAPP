import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose?: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [onClose, duration]);

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${type === 'success'
                    ? 'bg-green-600/90 border-green-400'
                    : 'bg-red-600/90 border-red-400'
                } text-white`}>
                {type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                <span className="font-bold text-sm tracking-tight">{message}</span>
            </div>
        </div>
    );
};
