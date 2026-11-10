import { AppShell } from "@/components/layout/AppShell";
import { NetworkHub } from "@/components/network/NetworkHub";

export const metadata = { title: "Red mayorista" };

export default function NetworkPage() {
  return (
    <AppShell>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">Red mayorista</h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Programas de tus mayoristas con tarifa neta y comisión, cupos en tiempo real y reservas. Si operas como mayorista, publica tus programas para tu red de agencias.
        </p>
      </div>
      <NetworkHub />
    </AppShell>
  );
}
