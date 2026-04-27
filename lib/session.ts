import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

/**
 * Returns the current Supabase user (if any), normalised for app usage.
 * Reads from the session cookie via @supabase/ssr.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (user.email ? user.email.split("@")[0] : null);
  const image =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: name || null,
    image: image || null,
  };
}

/** Returns the user, or null if unauthenticated. Use in route handlers. */
export async function requireUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}

/** Backwards-compatible alias for code that previously called this helper. */
export async function getCurrentSession() {
  const user = await getCurrentUser();
  return user ? { user } : null;
}
