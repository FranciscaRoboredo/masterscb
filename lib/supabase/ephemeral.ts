import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * A Supabase client scoped to a single server-side call, with no cookie
 * storage at all. Used to create/invite an athlete account from the
 * backoffice without touching the coach's own session cookies.
 */
export function createEphemeralClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op: never persist this client's session anywhere
        },
      },
    }
  );
}
