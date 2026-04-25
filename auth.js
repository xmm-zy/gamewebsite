import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dehjilvkbkctgwfwmmgu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bd3h6vaef45uI8Gximh9GQ_pOMwxouA";
const AUTH_STORAGE_KEY = "qqq-auth";

export function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: AUTH_STORAGE_KEY
    }
  });
}

export function getRedirectTo() {
  return `${window.location.origin}${window.location.pathname}`;
}

export async function getCurrentUser(supabase) {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user || null;
}
