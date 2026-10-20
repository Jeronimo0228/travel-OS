import { AppShell } from "@/components/layout/AppShell";
import { QuoteCanvas } from "@/components/quotes/QuoteCanvas";
import { QuoterChat } from "@/components/quotes/QuoterChat";
import { QuoterStoreProvider } from "@/components/quotes/QuoterStoreProvider";

export default function CotizadorPage() {
  return (
    <AppShell searchPlaceholder="Buscar cotizaciones, clientes...">
      <QuoterStoreProvider>
        <div className="grid grid-cols-1 gap-6 lg:h-[calc(100vh-112px)] lg:grid-cols-5">
          <div className="h-[70vh] min-h-0 lg:col-span-2 lg:h-full">
            <QuoterChat />
          </div>
          <div className="min-h-0 lg:col-span-3 lg:h-full">
            <QuoteCanvas />
          </div>
        </div>
      </QuoterStoreProvider>
    </AppShell>
  );
}
