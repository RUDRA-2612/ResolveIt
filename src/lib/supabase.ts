import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdazcxjrrrubyekyqnbl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tBtBsw3bBWJD0jMIPLNE8A_mCqLejij';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
        '⚠️ Supabase credentials missing from .env! Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart Vite.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);