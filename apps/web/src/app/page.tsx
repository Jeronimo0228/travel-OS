import { AppShell } from "@/components/layout/AppShell";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";

export default function HomePage() {
  return (
    <AppShell>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">
          Comando de Inteligencia
        </h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Ventas, conversión, viajes y seguimiento de tu agencia en tiempo real.
        </p>
      </div>
      <ManagerDashboard />
    </AppShell>
  );
}
