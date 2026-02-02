import React from 'react';
import { ShoppingBag, Briefcase, Globe, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
    user: any;
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${active
            ? 'text-orange-600'
            : 'text-gray-400'
            }`}
    >
        <div className={`p-1 rounded-xl ${active ? 'bg-orange-50' : ''}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, user }) => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-2 flex justify-around items-center z-[100] safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <NavButton
                active={activeTab === 'VITRINE'}
                onClick={() => onTabChange('VITRINE')}
                icon={<ShoppingBag />}
                label="Vitrine"
            />
            <NavButton
                active={activeTab === 'SERVICOS'}
                onClick={() => onTabChange('SERVICOS')}
                icon={<Briefcase />}
                label="Serviços"
            />
            <NavButton
                active={activeTab === 'CULTURAL'}
                onClick={() => onTabChange('CULTURAL')}
                icon={<Globe />}
                label="Cultura"
            />
            <NavButton
                active={activeTab === 'DASHBOARD'}
                onClick={() => onTabChange(user ? 'DASHBOARD' : 'AUTH')}
                icon={<UserIcon />}
                label={user ? 'Painel' : 'Entrar'}
            />
        </nav>
    );
};
