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
import { mockLeads, mockTasks, type MockLead, type Task } from "./mock-data";

const LEADS_STORAGE_KEY = "travelos.crm.leads";
const TASKS_STORAGE_KEY = "travelos.crm.tasks";

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

type CrmStoreValue = {
  leads: MockLead[];
  tasks: Task[];
  addLead: (input: CreateLeadInput) => void;
  updateLead: (id: string, input: UpdateLeadInput) => void;
  updateStage: (id: string, stage: (typeof leadStages)[number]) => void;
  addTask: (task: Omit<Task, "id" | "done">) => void;
  toggleTask: (id: string) => void;
};

const CrmStoreContext = createContext<CrmStoreValue | null>(null);

export function CrmStoreProvider({ children }: { children: ReactNode }) {
  // Start from the same defaults the server renders, then load whatever is
  // persisted in localStorage after mount — reading storage during the
  // initial render would make the client's first paint diverge from the
  // server-rendered HTML and trigger a hydration mismatch.
  const [leads, setLeads] = useState<MockLead[]>(mockLeads);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLeads(readFromStorage(LEADS_STORAGE_KEY, mockLeads));
    setTasks(readFromStorage(TASKS_STORAGE_KEY, mockTasks));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  }, [leads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const addLead = useCallback((input: CreateLeadInput) => {
    setLeads((prev) => [
      {
        id: makeId("lead"),
        tripType: input.destination ?? "Sin definir",
        sentimentScore: 70,
        sentiment: "neutral",
        nextAction: "Contactar prospecto",
        ...input,
      },
      ...prev,
    ]);
  }, []);

  const updateLead = useCallback((id: string, input: UpdateLeadInput) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...input } : lead)),
    );
  }, []);

  const updateStage = useCallback(
    (id: string, stage: (typeof leadStages)[number]) => {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, stage } : lead)),
      );
    },
    [],
  );

  const addTask = useCallback((task: Omit<Task, "id" | "done">) => {
    setTasks((prev) => [{ ...task, id: makeId("task"), done: false }, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }, []);

  return (
    <CrmStoreContext.Provider
      value={{ leads, tasks, addLead, updateLead, updateStage, addTask, toggleTask }}
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
