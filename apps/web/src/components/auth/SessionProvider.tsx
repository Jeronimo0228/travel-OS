"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { logout as apiLogout, type SessionUser } from "@/lib/auth";

const STORAGE_KEY = "travelos.session.user";

function readStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

type SessionContextValue = {
  user: SessionUser | null;
  hydrated: boolean;
  setUser: (user: SessionUser) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Match the server's default render first (no user), then load whatever
  // is persisted after mount — same hydration-safety rule used elsewhere
  // (CrmStoreProvider, TenantBrandingProvider).
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUserState(readStoredUser());
    setHydrated(true);
  }, []);

  function setUser(next: SessionUser) {
    setUserState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      setUserState(null);
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <SessionContext.Provider value={{ user, hydrated, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}

// UX convenience only — the real access boundary is the httpOnly cookie
// enforced by the API. This just avoids showing shell UI to a visitor with
// no locally-known session.
export function RequireSession({ children }: { children: ReactNode }) {
  const { user, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  return <>{children}</>;
}
