import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AiAssistantWidget } from "./AiAssistantWidget";

type AppShellProps = {
  children: ReactNode;
  searchPlaceholder?: string;
};

export function AppShell({ children, searchPlaceholder }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar searchPlaceholder={searchPlaceholder} />
        <main className="p-container-margin flex flex-col gap-6">
          {children}
        </main>
      </div>
      <AiAssistantWidget />
    </div>
  );
}
