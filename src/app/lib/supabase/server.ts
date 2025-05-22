import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export function createClient() {
  const supabase = createServerComponentClient({ cookies });
  return supabase;
}
