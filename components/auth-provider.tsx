"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DbUser } from "@/lib/db/queries";
import { LoginModal } from "./login-modal";

type AuthContextValue = {
  user: DbUser | null;
  authenticated: boolean;
  loading: boolean;
  dbConfigured: boolean;
  serverOsuConfigured: boolean;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [serverOsuConfigured, setServerOsuConfigured] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const fetchAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setDbConfigured(Boolean(data.dbConfigured));
        setServerOsuConfigured(Boolean(data.serverOsuConfigured));
      }
    } catch (err) {
      console.error("Auth status fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const login = useCallback((returnTo?: string) => {
    const dest = returnTo || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    window.location.assign(`${origin}/api/auth/login?returnTo=${encodeURIComponent(dest)}`);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authenticated: Boolean(user),
      loading,
      dbConfigured,
      serverOsuConfigured,
      login,
      logout,
      openLoginModal,
      closeLoginModal,
      refreshAuth: fetchAuth,
    }),
    [user, loading, dbConfigured, serverOsuConfigured, login, logout, openLoginModal, closeLoginModal, fetchAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginModalOpen ? <LoginModal onClose={closeLoginModal} /> : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
