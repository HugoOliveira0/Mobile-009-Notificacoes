import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Sem configuração, o app abre e informa o que falta, sem tentar se conectar.
const isConfigured =
  Boolean(supabaseUrl && supabaseKey) &&
  /^https:\/\/[^/\s]+\/?$/.test(supabaseUrl) &&
  !supabaseUrl.includes('SEU_PROJETO') &&
  !supabaseKey.includes('SUA_CHAVE');

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;
