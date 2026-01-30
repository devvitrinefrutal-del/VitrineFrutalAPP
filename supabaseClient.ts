console.log('--- supabaseClient.ts carregando ---');
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase config check:', {
    url: supabaseUrl ? supabaseUrl.slice(0, 15) + '...' : 'Vazio',
    key: supabaseAnonKey ? supabaseAnonKey.slice(0, 5) + '...' + supabaseAnonKey.slice(-5) : 'Vazio',
    meta: import.meta.env
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL ou Anon Key não encontradas! Verifique o arquivo .env ou as variáveis da Vercel.');
}

// Evitar crash se as chaves estiverem vazias
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
