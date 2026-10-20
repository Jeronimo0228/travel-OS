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

export const kpiCards = [
  { label: "Prospectos Activos", value: "142", delta: "+12%", deltaClass: "text-success-emerald" },
  { label: "Valor de Pipeline", value: "$1.2M", delta: "Estable", deltaClass: "text-secondary" },
];
