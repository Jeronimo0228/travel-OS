import { AppShell } from "@/components/layout/AppShell";
import { TeamManager } from "@/components/team/TeamManager";

export const metadata = { title: "Usuarios" };

export default function UsersSettingsPage() {
  return (
    <AppShell>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">Usuarios y permisos</h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Invita a tu equipo, cambia roles y desactiva a quien ya no trabaja contigo. Desactivar cierra sus sesiones al instante.
        </p>
      </div>
      <TeamManager />
    </AppShell>
  );
}
