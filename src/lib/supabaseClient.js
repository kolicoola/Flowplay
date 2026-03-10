import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasRawConfig = Boolean(supabaseUrl && supabaseAnonKey);
const hasValidSupabaseUrl =
  typeof supabaseUrl === "string" &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);
const hasLikelyValidAnonKey = typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 20;
const hasSupabaseConfig = hasRawConfig && hasValidSupabaseUrl && hasLikelyValidAnonKey;

if (!hasSupabaseConfig) {
  // Keep this explicit so auth issues are visible during setup.
  // eslint-disable-next-line no-console
  console.error("Missing Supabase config: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const isSupabaseConfigured = hasSupabaseConfig;
export const supabaseConfigError =
  "Auth is not configured correctly. In GitHub Actions secrets set VITE_SUPABASE_URL to your Supabase Project URL (https://...supabase.co) and VITE_SUPABASE_ANON_KEY to your anon public key.";

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;



if (typeof window !== "undefined") window.supabase = supabase;
