import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dehjilvkbkctgwfwmmgu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bd3h6vaef45uI8Gximh9GQ_pOMwxouA";
const AUTH_STORAGE_KEY = "qqq-auth";
const FALLBACK_SITE_ORIGIN = "https://anonweb.top";

function getCanonicalOrOgUrl() {
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  if (canonical) return canonical;
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content");
  return ogUrl || "";
}

function safeUrlParse(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getAppPageKey() {
  const path = String(window.location.pathname || "");
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1].toLowerCase() : "index.html";
}

function getStableSiteOrigin() {
  const fromMeta = getCanonicalOrOgUrl();
  const parsed = fromMeta ? safeUrlParse(fromMeta) : null;
  if (parsed && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
    return parsed.origin;
  }

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return window.location.origin;
  }

  // file:// or other non-http(s) environments: use canonical meta, else production host
  return FALLBACK_SITE_ORIGIN;
}

function getStablePathnameAndSearch() {
  const fromMeta = getCanonicalOrOgUrl();
  const metaParsed = fromMeta ? safeUrlParse(fromMeta) : null;
  if (metaParsed && (metaParsed.protocol === "http:" || metaParsed.protocol === "https:")) {
    // Keep static pages aligned with the deployed site even when opened locally
    return `${metaParsed.pathname}${metaParsed.search}`;
  }

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return `${window.location.pathname}${window.location.search}`;
  }

  // file://: pathname is an OS file path, so use file name only
  const file = getAppPageKey();
  return file && file !== "/" ? `/${file}` : "/index.html";
}

export function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: AUTH_STORAGE_KEY
    }
  });
}

export function getRedirectTo() {
  const origin = getStableSiteOrigin();
  const path = getStablePathnameAndSearch();
  return `${origin}${path}`;
}

export async function getCurrentUser(supabase) {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user || null;
}
