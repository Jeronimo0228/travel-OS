import type { Lead } from "./leads";

/** Indicadores del CRM calculados con los prospectos que el usuario ve. */
export function crmKpis(leads: Pick<Lead, "stage">[]) {
  const count = (stage: Lead["stage"]) => leads.filter((lead) => lead.stage === stage).length;
  const won = count("GANADO");
  const lost = count("PERDIDO");
  const decided = won + lost;
  return {
    active: leads.length - decided,
    closing: count("CIERRE"),
    won,
    lost,
    conversion: decided === 0 ? null : Math.round((won / decided) * 100),
  };
}
