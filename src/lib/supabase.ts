import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseKey, publicSupabaseUrl, serviceSupabaseKey } from "@/lib/env";

let cached: SupabaseClient | null = null;

export function serverClient(): SupabaseClient {
  if (!cached) {
    cached = createClient(publicSupabaseUrl(), serviceSupabaseKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cached;
}

export function browserClient(): SupabaseClient {
  return createClient(publicSupabaseUrl(), publicSupabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
