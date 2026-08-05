import { AppShell } from "@/components/layout/AppShell";
import { CoPilotPanel } from "@/components/crm/CoPilotPanel";
import { SalesFunnel } from "@/components/crm/SalesFunnel";
import { ClientsTable } from "@/components/crm/ClientsTable";

export default function CrmPage() {
  return (
    <AppShell searchPlaceholder="Buscar prospectos, reservas o análisis de IA...">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-headline-xl text-primary mb-1">
            Gestión de Relaciones con el Cliente
          </h2>
          <p className="font-body-custom text-body-md text-on-surface-variant">
            Monitoreo inteligente de flujo de ventas y priorización
            automatizada de prospectos.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-custom text-label-md flex items-center gap-2 hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            Filtros
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            Añadir Prospecto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <CoPilotPanel />
        <SalesFunnel />
        <ClientsTable />
      </div>
    </AppShell>
  );
}
