import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  // Keep this explicit so auth issues are visible during setup.
  // eslint-disable-next-line no-console
  console.error("Missing Supabase config: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const isSupabaseConfigured = hasSupabaseConfig;
export const supabaseConfigError =
  "Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in GitHub Actions secrets.";

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
