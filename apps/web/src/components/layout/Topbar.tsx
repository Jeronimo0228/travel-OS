"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { useSession } from "@/components/auth/SessionProvider";

type TopbarProps = {
  searchPlaceholder?: string;
};

export function Topbar({
  searchPlaceholder = "Buscar itinerarios, agentes o insights...",
}: TopbarProps) {
  const { user, logout } = useSession();
  const router = useRouter();
  const displayName = user?.name ?? "Invitado";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="bg-surface-container-lowest sticky top-0 z-40 border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-container-margin w-full">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-secondary-container rounded-lg overflow-hidden">
          <label className="sr-only" htmlFor="topbar-search">
            {searchPlaceholder}
          </label>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            id="topbar-search"
            type="text"
            placeholder={searchPlaceholder}
            className="w-full bg-surface-container-low border-none pl-10 pr-4 py-2 font-body-custom text-body-sm outline-none rounded-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-tertiary-fixed-dim text-white rounded-full font-body-custom text-label-md shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container transition-transform"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          Análisis IA
        </button>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button
            type="button"
            aria-label="Notificaciones"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert-coral rounded-full" />
          </button>
          <div
            title={user ? `${user.name} · ${user.role}` : undefined}
            aria-label={`Perfil de ${displayName}`}
            className="rounded-full border-2 border-white"
          >
            <Avatar name={displayName} />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
