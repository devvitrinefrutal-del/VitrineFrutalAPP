import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User, UserRole } from '../../types';

export function useAuth(showSuccess: (msg: string) => void, showError: (msg: string) => void) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [authMode, setAuthMode] = useState<'SELECTION' | 'LOGIN' | 'REGISTER'>('SELECTION');
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Restore session
    useEffect(() => {
        const savedUser = localStorage.getItem('vitrine_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setCurrentUser(user);
                setRememberMe(true);
            } catch (e) {
                localStorage.removeItem('vitrine_user');
            }
        }
    }, []);

    // Sync session
    useEffect(() => {
        if (currentUser && rememberMe) {
            localStorage.setItem('vitrine_user', JSON.stringify(currentUser));
        } else if (!currentUser) {
            localStorage.removeItem('vitrine_user');
        }
    }, [currentUser, rememberMe]);

    // Helper for native profile fetch
    const fetchProfileNativo = async (userId: string) => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        try {
            const res = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=*`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            const data = await res.json();
            return data[0] || null;
        } catch (e) {
            console.error('[AUTH] Erro ao buscar perfil nativo:', e);
            return null;
        }
    };

    // Supabase Auth Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchProfileNativo(session.user.id);
                if (profile) {
                    setCurrentUser(profile);
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Erro ao sair do Supabase:', e);
        }
        localStorage.removeItem('vitrine_user');
        setCurrentUser(null);
        setRememberMe(false);
        showSuccess('Você saiu.');
        window.location.href = '/';
    };

    const login = async (formData: FormData) => {
        const email = (formData.get('email') as string || '').trim().toLowerCase();
        const password = (formData.get('password') as string || '').trim();

        console.log('--- [AUTH] Iniciando login... ---');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('[AUTH] Erro Auth:', error.message);
                showError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message);
                return;
            }

            console.log('[AUTH] Logado com sucesso! Buscando perfil...');
            const profile = await fetchProfileNativo(data.user.id);

            if (profile) {
                const needsApproval = ['LOJISTA', 'PRESTADOR'].includes(profile.role);
                if (needsApproval && profile.is_active === false) {
                    await supabase.auth.signOut();
                    showError('Sua conta está aguardando aprovação do administrador.');
                    return;
                }
                setCurrentUser(profile);
                setShowAuthModal(false);
                showSuccess('Login realizado!');
            } else {
                showError('Perfil não encontrado. Tente novamente.');
            }
        } catch (err: any) {
            console.error('[AUTH] Erro fatal no login:', err);
            showError('Erro de conexão no login.');
        }
    };

    const register = async (formData: FormData, selectedRole: UserRole) => {
        const email = (formData.get('email') as string).trim().toLowerCase();
        const password = (formData.get('password') as string).trim();
        const name = formData.get('name') as string;

        try {
            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: {
                    data: {
                        full_name: name,
                        role: selectedRole
                    }
                }
            });

            if (error) {
                showError(error.message);
                return;
            }

            if (data.user) {
                if (selectedRole === 'CLIENTE') {
                    showSuccess('Conta de cliente criada! Você já pode entrar.');
                } else {
                    showSuccess('Conta criada! Aguarde a aprovação do administrador para acessar.');
                }
                setShowAuthModal(false);
                // Opcional: Se quiser logar automaticamente clientes (que não precisam de aprovação)
                // Mas no seu caso, melhor manter o padrão de aprovação se todos caem no is_active=false
            }
        } catch (err: any) {
            showError('Erro ao registrar.');
        }
    };

    return {
        currentUser, rememberMe, setRememberMe, authMode, setAuthMode,
        showAuthModal, setShowAuthModal, login, logout, register
    };
}
