import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User, UserRole } from '../../types';

export function useAuth(showSuccess: (msg: string) => void, showError: (msg: string) => void) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [authMode, setAuthMode] = useState<'SELECTION' | 'LOGIN' | 'REGISTER' | 'RECOVER' | 'UPDATE_PASSWORD'>('SELECTION');
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

    const fetchProfile = async (userId: string): Promise<User | null> => {
        try {
            const query = supabase.from('profiles').select('*').eq('id', userId).single();
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));

            const { data, error } = await Promise.race([query, timeout]) as any;

            if (error) return null;
            return data as User;
        } catch (e) {
            return null;
        }
    };

    // Supabase Auth Listener
    useEffect(() => {
        // Check URL for recovery hash manually as fallback
        if (window.location.hash.includes('type=recovery')) {
            console.log('[AUTH] Hash de recuperação detectado manualmente!');
            setAuthMode('UPDATE_PASSWORD');
            setShowAuthModal(true);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AUTH EVENTO] ${event}`, session?.user?.email);

            if (event === 'PASSWORD_RECOVERY') {
                console.log('[AUTH] Recuperação detectada! Abrindo modal...');
                setAuthMode('UPDATE_PASSWORD');
                setShowAuthModal(true);
            }

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

        console.log('[SISTEMA] Tentando login...');

        try {
            const loginPromise = supabase.auth.signInWithPassword({ email, password });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000));

            const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

            if (error) {
                showError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message);
                return;
            }

            if (!data?.user) {
                showError('Usuário não encontrado.');
                return;
            }

            const profile = await fetchProfile(data.user.id);

            if (profile) {
                const needsApproval = ['LOJISTA', 'PRESTADOR'].includes(profile.role);
                if (needsApproval && profile.is_active === false) {
                    await supabase.auth.signOut();
                    showError('Aguardando aprovação.');
                    return;
                }
                setCurrentUser(profile);
                setShowAuthModal(false);
                showSuccess('Bem-vindo!');
            } else {
                showError('Perfil não encontrado.');
            }
        } catch (err: any) {
            console.error('[AUTH] Falha:', err.message);
            showError('A conexão falhou ou demorou demais. Tente novamente.');
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

    const recoverPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/`,
            });
            if (error) {
                showError(error.message);
                return;
            }
            showSuccess('E-mail de recuperação enviado!');
            setAuthMode('LOGIN');
        } catch (err: any) {
            showError('Erro ao enviar e-mail de recuperação.');
        }
    };

    const updatePassword = async (formData: FormData) => {
        const password = formData.get('password') as string;
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                showError(error.message);
                return;
            }
            showSuccess('Senha atualizada com sucesso!');
            setAuthMode('LOGIN');
        } catch (err: any) {
            showError('Erro ao atualizar senha.');
        }
    };

    return {
        currentUser, rememberMe, setRememberMe, authMode, setAuthMode,
        showAuthModal, setShowAuthModal, login, logout, register,
        recoverPassword, updatePassword
    };
}
