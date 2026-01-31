import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    maxWidth = 'max-w-lg'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`bg-white w-full ${maxWidth} rounded-[3rem] p-8 sm:p-10 shadow-2xl relative animate-in zoom-in duration-500 overflow-y-auto max-h-[90vh] no-scrollbar ${className}`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 sm:top-10 sm:right-10 p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-[1.5rem] transition-all shadow-sm z-10"
                >
                    <X size={24} />
                </button>
                {title && (
                    <div className="mb-8 sm:mb-10 text-2xl font-black text-black flex items-center gap-3 tracking-tighter uppercase relative z-0">
                        {title}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};
