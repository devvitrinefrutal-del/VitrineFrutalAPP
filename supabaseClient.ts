import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase config:', {
    url: supabaseUrl ? 'OK (Length: ' + supabaseUrl.length + ')' : 'Vazio',
    key: supabaseAnonKey ? 'OK (Length: ' + supabaseAnonKey.length + ')' : 'Vazio'
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL ou Anon Key não encontradas! Verifique o arquivo .env ou as variáveis da Vercel.');
}

// Evitar crash se as chaves estiverem vazias
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
