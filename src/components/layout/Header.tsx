import React from 'react';
import { ShoppingBag, Briefcase, Globe, ShoppingCart, User as UserIcon, LogOut, AlertCircle } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { User } from '../../../types';

interface HeaderProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
    cartCount: number;
    user: User | null;
    onLogout: () => void;
    onAuth: (mode: 'LOGIN' | 'REGISTER') => void;
    connectionError: boolean;
}

const HeaderNavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active
            ? 'bg-orange-50 text-orange-600 font-bold'
            : 'text-gray-500 hover:bg-gray-50 font-medium'
            }`}
    >
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
    </button>
);

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    onTabChange,
    cartCount,
    user,
    onLogout,
    onAuth,
    connectionError
}) => {
    return (
        <>
            {connectionError && (
                <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-3 text-center font-bold text-xs uppercase tracking-widest shadow-xl flex justify-center items-center gap-3">
                    <AlertCircle size={18} />
                    <span>Sem conexão com o servidor. Verifique sua internet.</span>
                    <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] hover:bg-gray-100 transition-colors">
                        Tentar Reconectar
                    </button>
                </div>
            )}

            <header className="glass-effect sticky top-0 z-[100] px-4 md:px-8 py-3 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('VITRINE')}>
                        <Logo />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-800 hidden sm:inline uppercase">
                        Vitrine<span className="text-orange-500">Frutal</span>
                    </span>
                    <div
                        className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-500 animate-pulse' : 'bg-green-500'} ml-1`}
                        title={connectionError ? 'Sem conexão com banco' : 'Conectado ao Supabase'}
                    />
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    <HeaderNavButton
                        active={activeTab === 'VITRINE'}
                        onClick={() => onTabChange('VITRINE')}
                        icon={<ShoppingBag size={18} />}
                        label="Vitrine"
                    />
                    <HeaderNavButton
                        active={activeTab === 'SERVICOS'}
                        onClick={() => onTabChange('SERVICOS')}
                        icon={<Briefcase size={18} />}
                        label="Serviços"
                    />
                    <HeaderNavButton
                        active={activeTab === 'CULTURAL'}
                        onClick={() => onTabChange('CULTURAL')}
                        icon={<Globe size={18} />}
                        label="Giro Cultural"
                    />
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onTabChange('CHECKOUT')}
                        className={`relative p-2.5 mr-1 sm:mr-2 bg-white border rounded-xl transition-all ${activeTab === 'CHECKOUT'
                            ? 'border-orange-500 text-orange-500 shadow-lg shadow-orange-50'
                            : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => onTabChange('DASHBOARD')}
                                className={`flex items-center gap-2 p-2 px-3 rounded-xl transition-colors ${activeTab === 'DASHBOARD'
                                    ? 'bg-green-100 text-green-700 font-bold'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <UserIcon size={20} />
                                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Painel</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => onAuth('REGISTER')}
                                className="px-3 sm:px-5 py-2.5 text-green-600 font-black hover:bg-green-50 rounded-xl transition-all text-[9px] sm:text-[10px] uppercase tracking-widest"
                            >
                                Cadastre-se
                            </button>
                            <button
                                onClick={() => onAuth('LOGIN')}
                                className="px-4 sm:px-5 py-2.5 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 shadow-md text-[9px] sm:text-[10px] uppercase tracking-widest transition-all"
                            >
                                Entrar
                            </button>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};
