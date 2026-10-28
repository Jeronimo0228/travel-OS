"use client";

import type { ReactNode } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { LandingPage } from "./LandingPage";

/**
 * La raíz muestra la landing pública a visitantes y el tablero a quien tiene sesión.
 * El primer render (servidor) siempre es la landing, así el HTML es indexable.
 */
export function HomeGate({ dashboard }: { dashboard: ReactNode }) {
  const { user, hydrated } = useSession();
  if (hydrated && user) return <>{dashboard}</>;
  return <LandingPage />;
}
