import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AiAssistantWidget } from "./AiAssistantWidget";
import { TenantBrandingProvider } from "@/components/branding/TenantBrandingProvider";

type AppShellProps = {
  children: ReactNode;
  searchPlaceholder?: string;
};

export function AppShell({ children, searchPlaceholder }: AppShellProps) {
  return (
    <TenantBrandingProvider>
      <div className="min-h-screen bg-surface">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-lg focus:font-body-custom focus:text-label-md"
        >
          Saltar al contenido
        </a>
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <Topbar searchPlaceholder={searchPlaceholder} />
          <main
            id="main-content"
            className="p-container-margin flex flex-col gap-6"
          >
            {children}
          </main>
        </div>
        <AiAssistantWidget />
      </div>
    </TenantBrandingProvider>
  );
}
