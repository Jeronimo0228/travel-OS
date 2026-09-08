"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CoPilotPanel } from "@/components/crm/CoPilotPanel";
import { SalesFunnel } from "@/components/crm/SalesFunnel";
import { ClientsTable } from "@/components/crm/ClientsTable";
import { CrmFilters, type StageFilter } from "@/components/crm/CrmFilters";
import { LeadFormDialog } from "@/components/crm/LeadFormDialog";
import { CrmStoreProvider, useCrmStore } from "@/components/crm/CrmStoreProvider";
import { useSession } from "@/components/auth/SessionProvider";
import type { Lead } from "@/lib/leads";
import { listAgencyUsers, type AgencyUser } from "@/lib/users";

function CrmContent() {
  const { user } = useSession();
  const {
    leads,
    loading,
    error,
    refetch,
    assigneeFilter,
    setAssigneeFilter,
  } = useCrmStore();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [advisors, setAdvisors] = useState<AgencyUser[]>([]);

  const canManageAssignees =
    user?.role === "ADMIN" || user?.role === "GERENTE";

  useEffect(() => {
    if (!canManageAssignees) return;
    let cancelled = false;
    listAgencyUsers()
      .then((users) => {
        if (!cancelled) {
          setAdvisors(users.filter((item) => item.role === "ASESOR"));
        }
      })
      .catch(() => {
        if (!cancelled) setAdvisors([]);
      });
    return () => {
      cancelled = true;
    };
  }, [canManageAssignees]);

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

  function openEditDialog(lead: Lead) {
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
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
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
        assigneeId={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        advisors={advisors}
        canFilterAssignee={canManageAssignees}
      />

      <div className="grid grid-cols-12 gap-6">
        <CoPilotPanel />
        <SalesFunnel />
        <ClientsTable
          leads={filteredLeads}
          loading={loading}
          error={error}
          onRetry={refetch}
          onEdit={openEditDialog}
          advisors={advisors}
          canAssign={canManageAssignees}
        />
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
