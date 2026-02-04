import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client or null during build if env vars are missing
    // In production/runtime, these should be present
    return null as any;
  }

  return createBrowserClient(url, key);
}
