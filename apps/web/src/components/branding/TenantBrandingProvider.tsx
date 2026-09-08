"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getAgencyBranding } from "@/lib/agency";
import { ApiError } from "@/lib/api-client";

const STORAGE_KEY = "travelos.tenant-branding";

export type TenantBranding = {
  primaryColor: string | null;
  logoUrl: string | null;
};

const DEFAULT_BRANDING: TenantBranding = {
  primaryColor: null,
  logoUrl: null,
};

function readFromStorage(): TenantBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_BRANDING, ...JSON.parse(raw) } : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}

type TenantBrandingContextValue = {
  branding: TenantBranding;
  setBranding: (branding: TenantBranding) => void;
  refreshBranding: () => Promise<void>;
};

const TenantBrandingContext = createContext<TenantBrandingContextValue | null>(
  null,
);

export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBrandingState] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBrandingState(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    getAgencyBranding()
      .then((agency) => {
        if (cancelled) return;
        setBrandingState({
          primaryColor: agency.primaryColor,
          logoUrl: agency.logoUrl,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        if (!(error instanceof ApiError)) {
          console.warn("No se pudo cargar branding del tenant", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
  }, [branding, hydrated]);

  async function refreshBranding() {
    const agency = await getAgencyBranding();
    setBrandingState({
      primaryColor: agency.primaryColor,
      logoUrl: agency.logoUrl,
    });
  }

  const style: CSSProperties | undefined = branding.primaryColor
    ? ({ "--color-primary": branding.primaryColor } as CSSProperties)
    : undefined;

  return (
    <TenantBrandingContext.Provider
      value={{ branding, setBranding: setBrandingState, refreshBranding }}
    >
      <div style={style}>{children}</div>
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  const ctx = useContext(TenantBrandingContext);
  if (!ctx) {
    throw new Error(
      "useTenantBranding must be used within a TenantBrandingProvider",
    );
  }
  return ctx;
}
