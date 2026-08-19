"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CoPilotPanel } from "@/components/crm/CoPilotPanel";
import { SalesFunnel } from "@/components/crm/SalesFunnel";
import { ClientsTable } from "@/components/crm/ClientsTable";
import { TasksPanel } from "@/components/crm/TasksPanel";
import { CrmFilters, type StageFilter } from "@/components/crm/CrmFilters";
import { LeadFormDialog } from "@/components/crm/LeadFormDialog";
import { CrmStoreProvider, useCrmStore } from "@/components/crm/CrmStoreProvider";
import type { MockLead } from "@/components/crm/mock-data";

function CrmContent() {
  const { leads } = useCrmStore();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<MockLead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStage = stageFilter === "ALL" || lead.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [leads, search, stageFilter]);

  function openCreateDialog() {
    setEditingLead(null);
    setDialogOpen(true);
  }

  function openEditDialog(lead: MockLead) {
    setEditingLead(lead);
    setDialogOpen(true);
  }

  return (
    <>
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
            onClick={openCreateDialog}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            Añadir Prospecto
          </button>
        </div>
      </div>

      <CrmFilters
        search={search}
        onSearchChange={setSearch}
        stage={stageFilter}
        onStageChange={setStageFilter}
      />

      <div className="grid grid-cols-12 gap-6">
        <CoPilotPanel />
        <SalesFunnel />
        <ClientsTable leads={filteredLeads} onEdit={openEditDialog} />
        <TasksPanel />
      </div>

      <LeadFormDialog
        open={dialogOpen}
        lead={editingLead}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

export default function CrmPage() {
  return (
    <AppShell searchPlaceholder="Buscar prospectos, reservas o análisis de IA...">
      <CrmStoreProvider>
        <CrmContent />
      </CrmStoreProvider>
    </AppShell>
  );
}
