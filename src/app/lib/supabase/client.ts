import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  client = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
