import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import classroomConfig from '../config/supabase.json';

// Chave publishable: é pública e identifica o app; as permissões vêm do RLS.
// O projeto da atividade já está configurado. O .env é opcional para outro banco.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || classroomConfig.url;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || classroomConfig.publishableKey;

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
