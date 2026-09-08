import { leadStages } from "@travelos/shared";

// Presentational-only content with no backing feature in Sprint 1's
// backend scope — part of the approved crm.html mockup, kept as static
// flavor rather than invented from real data.

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

export const coPilotInsights = [
  {
    id: "insight-1",
    icon: "call",
    iconClass: "text-success-emerald",
    title: "Contactar a Camila Restrepo ahora",
    detail:
      "94% de probabilidad de conversión basado en búsquedas recientes de safaris de lujo.",
  },
  {
    id: "insight-2",
    icon: "ac_unit",
    iconClass: "text-alert-coral",
    title: "Andrés Gómez se está enfriando",
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
