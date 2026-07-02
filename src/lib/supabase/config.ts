// Public Supabase connection values.
//
// Both of these are safe to expose: the URL is public, and the publishable
// ("anon") key is designed for the browser — it ships in the client bundle
// and all access is governed by Row Level Security in the database. Env vars
// take precedence so other environments/projects can override them.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ircrirnzghxmewatalaa.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_DoodDl36lu7tbP0HJA-PoQ_-GU0iX_n";
