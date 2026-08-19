import { AppShell } from "@/components/layout/AppShell";
import { BrandingForm } from "@/components/branding/BrandingForm";

export default function BrandingSettingsPage() {
  return (
    <AppShell searchPlaceholder="Buscar en configuración...">
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">
          Marca de la Agencia
        </h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Personaliza el color primario y el logo que verán tus asesores.
        </p>
      </div>

      <BrandingForm />
    </AppShell>
  );
}
