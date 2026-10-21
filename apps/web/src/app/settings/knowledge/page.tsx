import { AppShell } from "@/components/layout/AppShell";
import { KnowledgeForm } from "@/components/knowledge/KnowledgeForm";

export default function KnowledgeSettingsPage() {
  return (
    <AppShell searchPlaceholder="Buscar en configuración...">
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">
          Base de conocimiento IA
        </h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Tono, políticas y preguntas frecuentes de tu agencia para que la IA responda como ustedes.
        </p>
      </div>
      <KnowledgeForm />
    </AppShell>
  );
}
