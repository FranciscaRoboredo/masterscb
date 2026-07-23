import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Implicit flow: the invite is initiated server-side (coach's backoffice)
    // and completed in a different browser (the athlete's), so there's no
    // shared PKCE code verifier to validate against. The magic-link email
    // carries the session directly instead.
    { auth: { flowType: "implicit" } }
  );
}
