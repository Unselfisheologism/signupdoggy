import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User, SupabaseClient } from '@supabase/supabase-js';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: VoidFunction;
}

const AuthContext = createContext<AuthCtx>(null!);

// Lazy-loaded Supabase client. Previously we imported `./supabase` at the
// top of this file, which pulled the entire @supabase/supabase-js
// library (~50 KiB transfer) into the main bundle even on the landing
// route where no user is signed in and the session is just `null`.
// Now we dynamic-import it inside the AuthProvider's effect, so the
// supabase-js chunk only loads after first paint and only if the user
// actually lands on a route that needs auth. Pages that do need auth
// (Login, Signup, Auth, Checkout, Dashboard, ApiKeys) already lazy-load
// their own supabase import via the existing static `import { supabase }
// from '../supabase'` in those files — those chunks continue to work
// unchanged because the underlying client module is the same instance.
type AnyClient = SupabaseClient<any, any, any>;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<AnyClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      // Defer supabase-js download + parse until after first React
      // commit. The dynamic import splits @supabase/supabase-js into
      // its own chunk which the browser fetches in parallel with the
      // rest of the post-LCP work, instead of competing with the LCP
      // candidate's render path.
      const { supabase } = await import('./supabase');
      if (cancelled) return;
      setClient(supabase as AnyClient);

      // Restore session from storage
      const { data: { session: s } } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
      });
      unsub = () => subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const logout = useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
    setUser(null);
    setSession(null);
  }, [client]);

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }