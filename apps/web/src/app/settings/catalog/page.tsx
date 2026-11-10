import { CatalogEditor } from "@/components/catalog/CatalogEditor";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = { title: "Catálogo" };

export default function CatalogSettingsPage() {
  return (
    <AppShell>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">Catálogo de la agencia</h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Hoteles y actividades con sus precios. El cotizador con IA solo arma alternativas con lo que está aquí.
        </p>
      </div>
      <CatalogEditor />
    </AppShell>
  );
}
