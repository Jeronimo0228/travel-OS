"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { OPEN_ASSISTANT_EVENT } from "./AiAssistantWidget";

export const CRM_SEARCH_EVENT = "travelos:crm-search";
import { Avatar } from "@/components/shared/Avatar";
import { useSession } from "@/components/auth/SessionProvider";
import { RemindersBell } from "./RemindersBell";

type TopbarProps = {
  searchPlaceholder?: string;
};

export function Topbar({
  searchPlaceholder = "Buscar prospectos por nombre, correo o destino...",
}: TopbarProps) {
  const { user, logout } = useSession();
  const router = useRouter();
  const displayName = user?.name ?? "Invitado";
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (window.location.pathname === "/crm") {
      window.dispatchEvent(new CustomEvent(CRM_SEARCH_EVENT, { detail: term }));
    }
    router.push(term ? `/crm?q=${encodeURIComponent(term)}` : "/crm");
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="bg-surface-container-lowest sticky top-0 z-40 border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-3 sm:px-container-margin w-full gap-2">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-controls="app-sidebar"
          onClick={() => window.dispatchEvent(new Event("travelos:toggle-nav"))}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low shrink-0"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <form
          role="search"
          onSubmit={handleSearch}
          className="hidden sm:block relative w-full max-w-md focus-within:ring-2 focus-within:ring-secondary-container rounded-lg overflow-hidden"
        >
          <label className="sr-only" htmlFor="topbar-search">
            {searchPlaceholder}
          </label>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            id="topbar-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            placeholder={searchPlaceholder}
            className="w-full bg-surface-container-low border-none pl-10 pr-4 py-2 font-body-custom text-body-sm outline-none rounded-full"
          />
        </form>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          type="button"
          aria-label="Análisis IA: abrir el asistente"
          onClick={() => window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT))}
          className="flex items-center gap-2 min-h-11 px-3 sm:px-4 py-2 bg-gradient-to-r from-secondary to-tertiary-fixed-dim text-white rounded-full font-body-custom text-label-md shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container transition-transform"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="hidden sm:inline">Análisis IA</span>
        </button>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-2 sm:pl-4">
          <RemindersBell />
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
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
