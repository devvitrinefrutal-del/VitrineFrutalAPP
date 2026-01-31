import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL ou Anon Key não encontradas! Verifique o arquivo .env ou as variáveis da Vercel.');
} else {
    console.log('--- [DEBUG] Supabase Configurado ---');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key (primeiros 10 chars):', supabaseAnonKey.substring(0, 10) + '...');
}

// Evitar crash se as chaves estiverem vazias
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
