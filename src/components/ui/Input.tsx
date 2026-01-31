import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all ${icon ? 'pl-11 pr-4 py-3.5' : 'px-4 py-3.5'
                        } ${error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-[10px] font-bold text-red-500 pl-1">{error}</span>
            )}
        </div>
    );
};
