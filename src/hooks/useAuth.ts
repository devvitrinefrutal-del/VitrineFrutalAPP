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
    // Now with retries to handle database trigger delays (max 3 attempts)
    const fetchProfile = async (userId: string, retries = 3): Promise<User | null> => {
        for (let i = 0; i < retries; i++) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (data) return data as User;

                if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                    console.error('[AUTH] Erro ao buscar perfil:', error.message);
                }
            } catch (e) {
                console.error('[AUTH] Erro inesperado ao buscar perfil:', e);
            }

            // Wait 1 second before retrying if not found
            if (i < retries - 1) {
                console.log(`[AUTH] Perfil não encontrado. Tentando novamente em 1s... (Tentativa ${i + 2}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return null;
    };

    // Supabase Auth Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
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
        const password = (formData.get('password') as string || '');

        console.log('--- [DEBUG AUTH] 1. Iniciando login... ---');
        console.log(`[DEBUG AUTH] 2. Email: ${email}`);

        try {
            // Failsafe timeout 15s
            const loginPromise = supabase.auth.signInWithPassword({ email, password });
            const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 15000)
            );

            console.log('[DEBUG AUTH] 3. Chamando Supabase Auth...');

            // Race between actual login and 15s timeout
            const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

            console.log('[DEBUG AUTH] 4. Supabase respondeu!');

            if (error) {
                console.error('[DEBUG AUTH] 5. Erro no login:', error.message);
                showError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message);
                return;
            }

            if (!data.user) {
                console.error('[DEBUG AUTH] 6. Usuário nulo após login');
                showError('Erro interno: Usuário não retornado.');
                return;
            }

            console.log(`[DEBUG AUTH] 7. Logado! Buscando perfil para ID: ${data.user.id}`);
            const profile = await fetchProfile(data.user.id);

            if (profile) {
                console.log(`[DEBUG AUTH] 8. Perfil carregado: ${profile.role}`);
                const needsApproval = ['LOJISTA', 'PRESTADOR'].includes(profile.role);
                if (needsApproval && profile.is_active === false) {
                    console.warn(`[DEBUG AUTH] Negado: Inativo.`);
                    await supabase.auth.signOut();
                    showError('Sua conta está aguardando aprovação.');
                    return;
                }
                setCurrentUser(profile);
                setShowAuthModal(false);
                showSuccess('Bem-vindo!');
            } else {
                console.error(`[DEBUG AUTH] 9. Perfil NÃO existe no banco.`);
                showError('Perfil não encontrado no banco de dados.');
            }
        } catch (err: any) {
            console.error('[DEBUG AUTH] Erro Crítico:', err);
            if (err.message === 'TIMEOUT_EXCEEDED') {
                showError('A conexão com o servidor demorou muito. Verifique sua internet.');
            } else {
                showError('Erro inesperado no sistema de login.');
            }
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
