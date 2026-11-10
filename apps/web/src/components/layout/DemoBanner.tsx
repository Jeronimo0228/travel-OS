"use client";

import { useSession } from "@/components/auth/SessionProvider";

const DEMO_EMAIL_SUFFIX = "@demo.travelos.local";

/** Aviso visible cuando se navega con la cuenta de la agencia demo (solo lectura). */
export function DemoBanner() {
  const { user } = useSession();
  if (!user?.email.endsWith(DEMO_EMAIL_SUFFIX)) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Estás en la <strong>demo de Travel OS</strong>: agencia ficticia, solo lectura (puedes probar el
      cotizador). ¿Te interesa para tu agencia?{" "}
      <a className="font-semibold underline" href="https://wa.me/573015761939?text=Hola%20PDP%2C%20vi%20la%20demo%20de%20Travel%20OS%20y%20me%20interesa." target="_blank" rel="noopener noreferrer">
        Escríbenos por WhatsApp
      </a>
      .
    </div>
  );
}
