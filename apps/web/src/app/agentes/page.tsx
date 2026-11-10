import { AgentsCenter } from "@/components/agents/AgentsCenter";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = { title: "Centro de Agentes" };

export default function AgentesPage() {
  return (
    <AppShell>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">Centro de Agentes</h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Los tres agentes de IA de Travel OS, qué hace cada uno y los controles que los mantienen seguros.
        </p>
      </div>
      <AgentsCenter />
    </AppShell>
  );
}
