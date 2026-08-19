import { leadStages, type CreateLeadInput } from "@travelos/shared";

export type Sentiment = "satisfecho" | "neutral" | "urgente";

export type MockLead = CreateLeadInput & {
  id: string;
  tripType: string;
  sentimentScore: number;
  sentiment: Sentiment;
  nextAction: string;
};

export const mockLeads: MockLead[] = [
  {
    id: "lead-1",
    name: "Elena Vance",
    destination: "Kenia",
    notes: "Individuo de Alto Patrimonio",
    stage: "COTIZANDO",
    tripType: "Safari de Lujo (Kenia)",
    sentimentScore: 98,
    sentiment: "satisfecho",
    nextAction: "Enviar Borrador Itinerario",
  },
  {
    id: "lead-2",
    name: "Marcus Thorne",
    destination: "Bora Bora",
    notes: "Corporativo Recurrente",
    stage: "PROSPECTO",
    tripType: "Escapada a Bora Bora",
    sentimentScore: 42,
    sentiment: "urgente",
    nextAction: "Llamada de Retención Necesaria",
  },
  {
    id: "lead-3",
    name: "Sarah Jenkins",
    destination: "Alpes",
    notes: "Prospecto por Referencia",
    stage: "GANADO",
    tripType: "Semana de Esquí Alpino",
    sentimentScore: 76,
    sentiment: "neutral",
    nextAction: "Pago Recibido",
  },
];

export const stageBadge: Record<(typeof leadStages)[number], string> = {
  PROSPECTO: "Prospecto",
  COTIZANDO: "Cotizando",
  CIERRE: "En Cierre",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export const funnelStageOrder: Array<{
  stage: (typeof leadStages)[number];
  label: string;
}> = [
  { stage: "PROSPECTO", label: "Prospectos" },
  { stage: "COTIZANDO", label: "Cotizando" },
  { stage: "CIERRE", label: "Cierre" },
  { stage: "GANADO", label: "Ganados" },
];

export type Task = {
  id: string;
  leadId: string;
  title: string;
  dueDate: string; // ISO yyyy-mm-dd
  done: boolean;
};

export const mockTasks: Task[] = [
  {
    id: "task-1",
    leadId: "lead-1",
    title: "Enviar borrador de itinerario a Elena",
    dueDate: "2026-08-22",
    done: false,
  },
  {
    id: "task-2",
    leadId: "lead-2",
    title: "Llamada de retención con Marcus",
    dueDate: "2026-08-14",
    done: false,
  },
  {
    id: "task-3",
    leadId: "lead-3",
    title: "Confirmar pago recibido con Sarah",
    dueDate: "2026-08-10",
    done: true,
  },
  {
    id: "task-4",
    leadId: "lead-1",
    title: "Agendar seguimiento post-envío",
    dueDate: "2026-08-30",
    done: false,
  },
];

export const coPilotInsights = [
  {
    id: "insight-1",
    icon: "call",
    iconClass: "text-success-emerald",
    title: "Contactar a Elena Vance ahora",
    detail:
      "94% de probabilidad de conversión basado en búsquedas recientes de safaris de lujo.",
  },
  {
    id: "insight-2",
    icon: "ac_unit",
    iconClass: "text-alert-coral",
    title: "Marcus Thorne se está enfriando",
    detail:
      "Inactividad detectada por 48h. Enviar seguimiento de 'Bora Bora Exclusivo'.",
  },
  {
    id: "insight-3",
    icon: "auto_graph",
    iconClass: "text-secondary-fixed",
    title: "Oportunidad Masiva: Grupo Alumni",
    detail:
      "La IA identifica 12 perfiles similares interesados en cruceros fluviales europeos.",
  },
];

export const kpiCards = [
  { label: "Prospectos Activos", value: "142", delta: "+12%", deltaClass: "text-success-emerald" },
  { label: "Valor de Pipeline", value: "$1.2M", delta: "Estable", deltaClass: "text-secondary" },
];
