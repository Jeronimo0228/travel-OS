"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { useTenantBranding } from "@/components/branding/TenantBrandingProvider";

export function Sidebar() {
  const pathname = usePathname();
  const { branding } = useTenantBranding();

  return (
    <nav className="bg-primary dark:bg-tertiary-container h-full w-64 flex flex-col fixed left-0 top-0 border-r border-outline-variant py-6 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt="Logo de la agencia"
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          )}
        </div>
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-primary">
            TravelOS AI
          </h1>
          <p className="font-body-custom text-label-sm text-on-primary-container opacity-80">
            S.O. de Agencia
          </p>
        </div>
      </div>

      <div className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "bg-secondary text-on-secondary rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-transform scale-95"
                  : "text-on-primary-container hover:bg-primary-container/50 rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-3 transition-colors duration-200"
              }
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-body-custom text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 px-2 border-t border-on-primary/10">
        <button
          type="button"
          className="w-full bg-gradient-to-r from-secondary to-tertiary-fixed-dim text-white font-body-custom text-label-md py-3 px-4 mb-4 rounded-lg shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Itinerario
        </button>
        <Link
          href="/settings/branding"
          className="text-on-primary-container hover:bg-primary-container/50 rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-2 transition-colors duration-200"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-custom text-label-md">Configuración</span>
        </Link>
        <a
          href="#"
          className="text-on-primary-container hover:bg-primary-container/50 rounded-lg mx-2 my-1 flex items-center gap-3 px-4 py-2 transition-colors duration-200"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-custom text-label-md">Soporte</span>
        </a>
      </div>
    </nav>
  );
}
