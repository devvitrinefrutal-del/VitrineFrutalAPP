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

    // Helper for profile fetch using the official client (respects RLS)
    const fetchProfile = async (userId: string): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error('[AUTH] Erro ao buscar perfil:', error.message);
                }
                return null;
            }
            return data as User;
        } catch (e) {
            console.error('[AUTH] Erro inesperado ao buscar perfil:', e);
            return null;
        }
    };

    // Supabase Auth Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                if (profile) setCurrentUser(profile);
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
            console.error('Erro ao sair:', e);
        }
        localStorage.removeItem('vitrine_user');
        setCurrentUser(null);
        setRememberMe(false);
        showSuccess('Você saiu.');
        window.location.href = '/';
    };

    const login = async (formData: FormData) => {
        const email = (formData.get('email') as string || '').trim().toLowerCase();
        const password = (formData.get('password') as string || '');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                showError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message);
                return;
            }

            if (!data.user) return;

            const profile = await fetchProfile(data.user.id);

            if (profile) {
                const needsApproval = ['LOJISTA', 'PRESTADOR'].includes(profile.role);
                if (needsApproval && profile.is_active === false) {
                    await supabase.auth.signOut();
                    showError('Sua conta está aguardando aprovação.');
                    return;
                }
                setCurrentUser(profile);
                setShowAuthModal(false);
                showSuccess('Bem-vindo!');
            } else {
                showError('Perfil não encontrado.');
            }
        } catch (err) {
            console.error('[AUTH] Erro fatal:', err);
            showError('Erro de conexão no login.');
        }
    };

    const register = async (formData: FormData, selectedRole: UserRole) => {
        const email = (formData.get('email') as string).trim().toLowerCase();
        const password = (formData.get('password') as string);
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
                console.log(`[AUTH] Registro concluído para ${email}. Perfil CLIENTE será criado via trigger.`);
                showSuccess('Conta de cliente criada! Você já pode entrar.');
                setShowAuthModal(false);
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
