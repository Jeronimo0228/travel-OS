import { AppShell } from "./AppShell";
import { EmptyState } from "@/components/crm/EmptyState";

type ComingSoonPageProps = {
  title: string;
  icon: string;
  description: string;
};

export function ComingSoonPage({ title, icon, description }: ComingSoonPageProps) {
  return (
    <AppShell searchPlaceholder={`Buscar en ${title.toLowerCase()}...`}>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">
          {title}
        </h2>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
        <EmptyState icon={icon} title="Aún no disponible" description={description} />
      </div>
    </AppShell>
  );
}
