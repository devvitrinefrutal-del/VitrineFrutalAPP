import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "font-black rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100",
        secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-green-100",
        danger: "bg-red-50 text-red-500 hover:bg-red-100",
        outline: "bg-white border-2 border-slate-100 text-slate-600 hover:border-orange-500 hover:text-orange-500",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-50",
    };

    const sizes = {
        sm: "px-3 py-2 text-[9px]",
        md: "px-5 py-3 text-[10px]",
        lg: "px-6 py-4 text-xs",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : icon}
            {children}
        </button>
    );
};
