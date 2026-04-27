"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

function normalize(user: User | null | undefined): SessionUser | null {
  if (!user) return null;
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

export function useSupabaseSession(): {
  user: SessionUser | null;
  session: Session | null;
  isPending: boolean;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(normalize(data.session?.user ?? null));
      setIsPending(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(normalize(s?.user ?? null));
      setIsPending(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, session, isPending };
}
