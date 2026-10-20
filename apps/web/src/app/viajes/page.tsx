import { AppShell } from "@/components/layout/AppShell";
import { TripsBoard } from "@/components/trips/TripsBoard";

export default function ViajesPage() {
  return (
    <AppShell searchPlaceholder="Buscar viajes o viajeros...">
      <TripsBoard />
    </AppShell>
  );
}
