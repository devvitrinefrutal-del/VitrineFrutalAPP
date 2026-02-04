import React, { useState } from 'react';
import { UserCircle, ShieldCheck, User as UserIcon, Eye, EyeOff, CheckCircle2, Plus, Store as StoreIcon } from 'lucide-react';
import { User, UserRole } from '../../types';

interface AuthPageProps {
    onLogin: (formData: FormData) => void;
    onRegister: (formData: FormData, role: UserRole) => void;
    onClose: () => void;
}

const RoleCard = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center text-center p-4 bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-2xl transition-all group active:scale-95">
        <div className="mb-2 p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-tighter">{title}</h3>
    </button>
);

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, onClose }) => {
    const [authMode, setAuthMode] = useState<'SELECTION' | 'LOGIN' | 'REGISTER'>('SELECTION');
    const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENTE');
    const [showEmail, setShowEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (authMode === 'LOGIN') {
            onLogin(fd);
        } else {
            onRegister(fd, selectedRole);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90">✕</button>

                {authMode === 'SELECTION' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase tracking-widest text-sm">Entrar no Sistema</h2>
                            <p className="text-gray-500 font-medium">Selecione seu perfil de acesso</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <RoleCard icon={<UserCircle className="text-green-500" size={24} />} title="Cliente" onClick={() => { setSelectedRole('CLIENTE'); setAuthMode('LOGIN'); }} />
                            <RoleCard icon={<StoreIcon className="text-orange-500" size={24} />} title="Lojista" onClick={() => { setSelectedRole('LOJISTA'); setAuthMode('LOGIN'); }} />
                            <RoleCard icon={<ShieldCheck className="text-teal-500" size={24} />} title="DEV" onClick={() => { setSelectedRole('DEV'); setAuthMode('LOGIN'); }} />
                        </div>
                        <div className="pt-4 text-center border-t border-gray-100">
                            <button
                                onClick={() => { setAuthMode('REGISTER'); setSelectedRole('CLIENTE'); }}
                                className="text-green-600 font-black uppercase tracking-widest text-[10px] hover:underline"
                            >
                                Novo por aqui? Criar conta de Cliente
                            </button>
                        </div>
                    </div>
                )}

                {authMode === 'LOGIN' && (
                    <div className="space-y-6">
                        <button onClick={() => setAuthMode('SELECTION')} className="text-orange-600 font-bold text-sm">← Voltar</button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><UserIcon size={20} /></div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tracking-widest text-sm">Acesso {selectedRole}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="relative group">
                                <input required name="email" type={showEmail ? "text" : "email"} placeholder="E-mail" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-orange-200 transition-all pr-12" />
                                <button type="button" onClick={() => setShowEmail(!showEmail)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                                    {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative group">
                                <input required name="password" type={showPassword ? "text" : "password"} placeholder="Senha" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-orange-200 transition-all pr-12" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <label className="flex items-center gap-3 px-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="peer hidden"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-200 rounded-lg transition-all peer-checked:bg-orange-500 peer-checked:border-orange-500 group-hover:border-orange-300"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white scale-0 transition-transform peer-checked:scale-100">
                                        <CheckCircle2 size={14} />
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-700 transition-colors">Manter conectado neste dispositivo</span>
                            </label>

                            <button type="submit" className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 shadow-xl transition-all uppercase tracking-widest text-xs">Entrar agora</button>
                        </form>
                        <div className="pt-4 text-center border-t border-gray-100">
                            <button
                                onClick={() => setAuthMode('REGISTER')}
                                className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-orange-600"
                            >
                                Não tem uma conta? <span className="text-orange-500 underline">Cadastre-se aqui</span>
                            </button>
                        </div>
                    </div>
                )}

                {authMode === 'REGISTER' && (
                    <div className="space-y-6">
                        <button onClick={() => setAuthMode('SELECTION')} className="text-green-600 font-bold text-sm hover:underline">← Voltar</button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600"><Plus size={20} /></div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tracking-widest text-sm">Novo Cadastro</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input required name="name" type="text" placeholder="Seu nome completo" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-green-200 transition-all" />

                            <div className="relative group">
                                <input required name="email" type={showEmail ? "text" : "email"} placeholder="Seu melhor e-mail" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-green-200 transition-all pr-12" />
                                <button type="button" onClick={() => setShowEmail(!showEmail)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                                    {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative group">
                                <input required name="password" type={showPassword ? "text" : "password"} placeholder="Crie uma senha segura" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-semibold text-black focus:ring-2 focus:ring-green-200 transition-all pr-12" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium px-2 uppercase tracking-widest">Cadastro exclusivo para clientes e usuários da plataforma.</p>
                            <button type="submit" className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl transition-all mt-4 uppercase tracking-widest text-xs">Concluir Registro</button>
                        </form>
                        <div className="pt-4 text-center border-t border-gray-100">
                            <button
                                onClick={() => setAuthMode('LOGIN')}
                                className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-green-600"
                            >
                                Já possui conta? <span className="text-green-500 underline">Faça login aqui</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
