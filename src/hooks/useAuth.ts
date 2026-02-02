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

    // Supabase Auth Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Only fetch if strictly necessary to avoid loops, but here we need role updates
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profile) {
                    // Check for auto-links
                    const { data: storeMatch } = await supabase.from('stores').select('id').eq('email', session.user.email).maybeSingle();
                    const { data: serviceMatch } = await supabase.from('services').select('id').eq('email', session.user.email).maybeSingle();

                    const enrichedProfile = {
                        ...profile,
                        storeId: profile.role === 'LOJISTA' ? storeMatch?.id : undefined,
                        serviceId: profile.role === 'PRESTADOR' ? serviceMatch?.id : undefined
                    };
                    setCurrentUser(enrichedProfile);
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
        window.location.href = '/'; // Força um reset limpo da aplicação
    };

    const login = async (formData: FormData) => {
        const email = (formData.get('email') as string).trim().toLowerCase();
        const password = (formData.get('password') as string).trim();
        const isAuthorizedDev = email === 'devvitrinefrutal@gmail.com';

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            showError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message);
            return;
        }

        // Logic for profile/dev check...
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

        // DEV Logic injection
        if (isAuthorizedDev && (!profile || profile.role !== 'DEV')) {
            // Auto-promote or create DEV
            // Simplified for hook... implementation details handled in backend/listener mostly, 
            // but here we mimic App.tsx explicitly for safety
            if (!profile) {
                const newDev = { id: data.user.id, name: 'Desenvolvedor Master', email, role: 'DEV', phone: '', document: '', address: '' };
                await supabase.from('profiles').insert([newDev]);
                profile = newDev;
            } else {
                await supabase.from('profiles').update({ role: 'DEV' }).eq('id', data.user.id);
                profile.role = 'DEV';
            }
        }

        if (profile) {
            if (profile.role === 'DEV' && !isAuthorizedDev) {
                showError('Acesso Negado: Não é DEV autorizado.');
                await supabase.auth.signOut();
                return;
            }

            // Link Stores logic
            const { data: storeMatch } = await supabase.from('stores').select('id, owner_id').eq('email', email).maybeSingle();
            const { data: serviceMatch } = await supabase.from('services').select('id, provider_id').eq('email', email).maybeSingle();

            if (storeMatch && !storeMatch.owner_id) {
                await supabase.from('profiles').update({ role: 'LOJISTA' }).eq('id', profile.id);
                await supabase.from('stores').update({ owner_id: profile.id }).eq('id', storeMatch.id);
                profile.role = 'LOJISTA';
                profile.storeId = storeMatch.id;
                showSuccess('Sua loja foi vinculada!');
            } else if (serviceMatch && !serviceMatch.provider_id) {
                await supabase.from('profiles').update({ role: 'PRESTADOR' }).eq('id', profile.id);
                await supabase.from('services').update({ provider_id: profile.id }).eq('id', serviceMatch.id);
                profile.role = 'PRESTADOR';
                profile.serviceId = serviceMatch.id;
                showSuccess('Seu perfil profissional foi vinculado!');
            } else if (profile.role === 'LOJISTA' && storeMatch) {
                profile.storeId = storeMatch.id;
            } else if (profile.role === 'PRESTADOR' && serviceMatch) {
                profile.serviceId = serviceMatch.id;
            }

            setCurrentUser(profile);
            setShowAuthModal(false);
            showSuccess('Login realizado!');
        } else {
            // Create Default Client
            const newUser: User = {
                id: data.user.id,
                name: (formData.get('name') as string) || 'Usuário',
                email,
                role: 'CLIENTE',
                phone: '', document: '', address: ''
            };
            const { error: insErr } = await supabase.from('profiles').insert([newUser]);
            if (!insErr) {
                setCurrentUser(newUser);
                setShowAuthModal(false);
                showSuccess('Login realizado (novo perfil)');
            } else {
                showError('Erro ao criar perfil.' + insErr.message);
            }
        }
    };

    const register = async (formData: FormData, selectedRole: UserRole) => {
        const email = (formData.get('email') as string).trim().toLowerCase();
        const password = (formData.get('password') as string).trim();
        const name = formData.get('name') as string;
        const isAuthorizedDev = email === 'devvitrinefrutal@gmail.com';

        // Validation logic...
        // Simplification: Direct Supabase call

        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name, role: selectedRole } }
        });

        if (error) { showError(error.message); return; }

        if (data.user) {
            // Insert profile logic
            const newUser = {
                id: data.user.id,
                name, email,
                role: isAuthorizedDev ? 'DEV' : selectedRole,
                phone: '', document: '', address: ''
            };

            await supabase.from('profiles').insert([newUser]);
            setCurrentUser(newUser as User);
            setShowAuthModal(false);
            showSuccess('Conta criada!');
        }
    };

    return {
        currentUser,
        rememberMe,
        setRememberMe,
        authMode,
        setAuthMode,
        showAuthModal,
        setShowAuthModal,
        login,
        logout,
        register
    };
}
