"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CreateLeadInput, UpdateLeadInput, leadStages } from "@travelos/shared";
import {
  listLeads,
  createLead as createLeadRequest,
  updateLead as updateLeadRequest,
  assignLead as assignLeadRequest,
  deleteLead as deleteLeadRequest,
  type Lead,
} from "@/lib/leads";
import { ApiError } from "@/lib/api-client";

type CrmStoreValue = {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  assigneeFilter: string | null;
  setAssigneeFilter: (assigneeId: string | null) => void;
  addLead: (input: CreateLeadInput) => Promise<void>;
  updateLead: (id: string, input: UpdateLeadInput) => Promise<void>;
  updateStage: (id: string, stage: (typeof leadStages)[number]) => Promise<void>;
  assignLead: (id: string, assigneeId: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  refetch: () => void;
};

const CrmStoreContext = createContext<CrmStoreValue | null>(null);

export function CrmStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    listLeads({
      take: 100,
      ...(assigneeFilter ? { assigneeId: assigneeFilter } : {}),
    })
      .then((result) => {
        if (!cancelled) setLeads(result.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "No se pudieron cargar los prospectos.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, assigneeFilter]);

  const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

  const addLead = useCallback(async (input: CreateLeadInput) => {
    const lead = await createLeadRequest(input);
    setLeads((prev) => [lead, ...prev]);
  }, []);

  const updateLead = useCallback(async (id: string, input: UpdateLeadInput) => {
    const lead = await updateLeadRequest(id, input);
    setLeads((prev) => prev.map((item) => (item.id === id ? lead : item)));
  }, []);

  const updateStage = useCallback(
    async (id: string, stage: (typeof leadStages)[number]) => {
      const lead = await updateLeadRequest(id, { stage });
      setLeads((prev) => prev.map((item) => (item.id === id ? lead : item)));
    },
    [],
  );

  const assignLead = useCallback(async (id: string, assigneeId: string) => {
    const lead = await assignLeadRequest(id, assigneeId);
    setLeads((prev) => prev.map((item) => (item.id === id ? lead : item)));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await deleteLeadRequest(id);
    setLeads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <CrmStoreContext.Provider
      value={{
        leads,
        loading,
        error,
        assigneeFilter,
        setAssigneeFilter,
        addLead,
        updateLead,
        updateStage,
        assignLead,
        deleteLead,
        refetch,
      }}
    >
      {children}
    </CrmStoreContext.Provider>
  );
}

export function useCrmStore() {
  const ctx = useContext(CrmStoreContext);
  if (!ctx) {
    throw new Error("useCrmStore must be used within a CrmStoreProvider");
  }
  return ctx;
}
