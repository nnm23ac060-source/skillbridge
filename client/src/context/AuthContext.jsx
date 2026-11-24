import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

/**
 * AuthProvider — single source of truth for the current user.
 * On boot, validates any stored token against GET /auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  /* Boot: validate stored session */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem('sb_token');
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data.data.user);
      } catch {
        localStorage.removeItem('sb_token');
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Session expired (interceptor fired) */
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('sb:session-expired', onExpired);
    return () => window.removeEventListener('sb:session-expired', onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sb_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('sb_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sb_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((next) => {
    setUser((prev) => ({ ...prev, ...next }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
