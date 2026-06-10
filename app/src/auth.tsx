import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, type User } from './api';

interface AuthCtx {
  user: User | null;
  token: string | null;
  setAuth: (u: User, t: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('rg_token');
    if (t) {
      setToken(t);
      getMe(t).then(u => { setUser(u); setLoading(false); }).catch(() => { localStorage.removeItem('rg_token'); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const setAuth = useCallback((u: User, t: string) => {
    localStorage.setItem('rg_token', t);
    setUser(u);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rg_token');
    setUser(null);
    setToken(null);
  }, []);

  return <AuthContext.Provider value={{ user, token, setAuth, logout, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
