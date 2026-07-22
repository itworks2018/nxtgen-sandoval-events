import { createClient } from "@supabase/supabase-js";

// Set these in your Vercel project's environment variables:
//   VITE_SUPABASE_URL       e.g. https://xxxxxxxxxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY  the "Publishable key" from Supabase Project Settings > API Keys
// Both are safe to expose in the browser — they are not secrets.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
