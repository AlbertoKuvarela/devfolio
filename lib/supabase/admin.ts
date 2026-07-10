import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

// Service-role client for trusted server-side contexts only (cron jobs,
// webhooks, API routes that must bypass RLS). Never import this from
// client components or expose the key to the browser.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
