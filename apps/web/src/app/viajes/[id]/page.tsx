import { AppShell } from "@/components/layout/AppShell";
import { TripWorkspace } from "@/components/trips/TripWorkspace";

export default async function ViajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <TripWorkspace id={id} />
    </AppShell>
  );
}
