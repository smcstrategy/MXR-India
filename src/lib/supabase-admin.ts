import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn('[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set. Admin features will not work.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey ?? '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
