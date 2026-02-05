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
        const password = (formData.get('password') as string || '').trim();

        console.log('--- [AUTH] Iniciando login... ---');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('[AUTH] Erro signInWithPassword detalhado:', {
                    message: error.message,
                    status: (error as any).status,
                    code: (error as any).code
                });
                showError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message);
                return;
            }

            if (!data.user) {
                console.error('[AUTH] Login bem-sucedido mas data.user é nulo');
                showError('Erro interno no servidor de autenticação.');
                return;
            }

            console.log(`[AUTH] Logado como ${data.user.email} (ID: ${data.user.id}). Buscando perfil...`);
            const profile = await fetchProfile(data.user.id);

            if (profile) {
                console.log(`[AUTH] Perfil encontrado: ${profile.name} (Papel: ${profile.role}, Ativo: ${profile.is_active})`);
                const needsApproval = ['LOJISTA', 'PRESTADOR'].includes(profile.role);
                if (needsApproval && profile.is_active === false) {
                    console.warn(`[AUTH] Acesso negado: Perfil ${profile.role} inativo.`);
                    await supabase.auth.signOut();
                    showError('Sua conta está aguardando aprovação do administrador.');
                    return;
                }
                setCurrentUser(profile);
                setShowAuthModal(false);
                showSuccess('Login realizado!');
            } else {
                console.error(`[AUTH] PERIGO: Perfil não encontrado na tabela public.profiles para o UID: ${data.user.id}`);
                showError('Perfil não encontrado. Tente novamente em alguns segundos ou contate o suporte.');
            }
        } catch (err: any) {
            console.error('[AUTH] Erro fatal inesperado no login:', err);
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
