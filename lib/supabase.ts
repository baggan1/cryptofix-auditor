import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
// Use Service Role Key if available (better for backend bypassing RLS), fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Lead capture will fail.');
}

// Create client or a dummy fallback to prevent build failures when env variables are absent
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : {
      from: () => ({
        insert: async () => ({ error: new Error('Supabase credentials missing') }),
        select: async () => ({ error: new Error('Supabase credentials missing'), data: [] })
      })
    } as any;
