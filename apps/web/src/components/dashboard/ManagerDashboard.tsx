"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { formatCop, pluralize } from "@/lib/format";
import {
  daysUntil,
  getDashboardMetrics,
  getOperationsMetrics,
  shareOfMax,
  stageLabels,
  winRate,
  type DashboardMetrics,
  type OperationsMetrics,
} from "@/lib/metrics";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; sales: DashboardMetrics; ops: OperationsMetrics };

const card =
  "bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm";

function Kpi({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: string;
  tone: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={`${card} relative overflow-hidden`}>
      <div className={`p-2 rounded-lg inline-flex mb-4 ${tone}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="font-body-custom text-label-md text-on-surface-variant mb-1">
        {label}
      </p>
      <p
        className="font-headline text-headline-lg font-bold text-primary"
        data-testid={`kpi-${icon}`}
      >
        {value}
      </p>
      <p className="font-body-custom text-body-sm text-on-surface-variant mt-2">
        {hint}
      </p>
    </div>
  );
}

function Bar({
  value,
  tone = "bg-secondary",
}: {
  value: number;
  tone?: string;
}) {
  return (
    <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
      <div
        className={`h-full ${tone} rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function ManagerDashboard() {
  const { user } = useSession();
  const [state, setState] = useState<State>({ status: "loading" });
  const canSeeMetrics = user?.role === "ADMIN" || user?.role === "GERENTE";

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const [sales, ops] = await Promise.all([
        getDashboardMetrics(),
        getOperationsMetrics(),
      ]);
      setState({ status: "ready", sales, ops });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los KPIs.",
      });
    }
  }, []);

  useEffect(() => {
    if (canSeeMetrics) void load();
  }, [canSeeMetrics, load]);

  if (!canSeeMetrics) {
    return (
      <div className={card}>
        <p className="font-body-custom text-body-md">
          Los KPIs gerenciales están disponibles para gerentes y
          administradores. Tu trabajo diario está en el{" "}
          <Link href="/crm" className="text-secondary underline">
            CRM Inteligente
          </Link>{" "}
          y en{" "}
          <Link href="/viajes" className="text-secondary underline">
            Viajes
          </Link>
          .
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="grid grid-cols-4 gap-gutter" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`${card} h-40 animate-pulse`} />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={`${card} flex items-center justify-between`} role="alert">
        <p className="font-body-custom text-body-md text-error">
          {state.message}
        </p>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { sales, ops } = state;
  const pipelineCounts = ops.pipeline.map((entry) => entry.count);
  const destinationLeads = sales.destinations.map((entry) => entry.leads);

  return (
    <div className="flex flex-col gap-gutter">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <Kpi
          icon="payments"
          tone="bg-success-emerald/10 text-success-emerald"
          label="Ventas cerradas"
          value={formatCop(ops.revenue.won)}
          hint={`${formatCop(ops.revenue.open)} en cotizaciones abiertas`}
        />
        <Kpi
          icon="analytics"
          tone="bg-secondary/10 text-secondary"
          label="Conversión de leads"
          value={`${sales.sales.conversionRate}%`}
          hint={`${sales.sales.wonLeads} ganados de ${sales.sales.totalLeads} leads`}
        />
        <Kpi
          icon="flight_takeoff"
          tone="bg-tertiary-fixed-dim/20 text-on-tertiary-container"
          label="Viajes activos"
          value={String(ops.trips.active)}
          hint={`${pluralize(ops.trips.travelingNow, "viajero", "viajeros")} en ruta ahora`}
        />
        <Kpi
          icon="notifications_active"
          tone="bg-alert-coral/10 text-alert-coral"
          label="Follow-ups vencidos"
          value={String(ops.followUps.overdueTasks)}
          hint={`${pluralize(ops.followUps.unreadReminders, "recordatorio sin leer", "recordatorios sin leer")}`}
        />
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <section
          className={`${card} col-span-12 lg:col-span-7`}
          aria-labelledby="pipeline-title"
        >
          <h3
            id="pipeline-title"
            className="font-headline text-headline-md mb-4"
          >
            Embudo comercial
          </h3>
          <ul className="space-y-3">
            {ops.pipeline.map((entry) => (
              <li
                key={entry.stage}
                className="grid grid-cols-[110px_1fr_40px] items-center gap-3"
              >
                <span className="text-label-md text-on-surface-variant">
                  {stageLabels[entry.stage]}
                </span>
                <Bar
                  value={shareOfMax(entry.count, pipelineCounts)}
                  tone={
                    entry.stage === "GANADO"
                      ? "bg-success-emerald"
                      : entry.stage === "PERDIDO"
                        ? "bg-alert-coral"
                        : "bg-secondary"
                  }
                />
                <span className="text-label-md font-bold text-right">
                  {entry.count}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={`${card} col-span-12 lg:col-span-5`}
          aria-labelledby="trips-title"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 id="trips-title" className="font-headline text-headline-md">
              Próximas salidas
            </h3>
            <Link
              href="/viajes"
              className="text-secondary text-label-md hover:underline"
            >
              Ver viajes
            </Link>
          </div>
          {ops.trips.upcoming.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              No hay salidas programadas.
            </p>
          ) : (
            <ul className="space-y-3">
              {ops.trips.upcoming.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/viajes/${trip.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-secondary">
                      luggage
                    </span>
                    <span className="flex-1">
                      <span className="block text-label-md">
                        {trip.travelerName}
                      </span>
                      <span className="block text-body-sm text-on-surface-variant">
                        {trip.destination}
                      </span>
                    </span>
                    <span className="text-label-sm font-bold text-secondary">
                      en {daysUntil(trip.startsAt)} d
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-body-sm text-on-surface-variant">
            {pluralize(
              ops.portal.travelerMessagesLast7Days,
              "mensaje",
              "mensajes",
            )}{" "}
            de viajeros en los últimos 7 días.
          </p>
        </section>

        <section
          className={`${card} col-span-12 lg:col-span-7`}
          aria-labelledby="advisors-title"
        >
          <h3
            id="advisors-title"
            className="font-headline text-headline-md mb-4"
          >
            Desempeño por asesor
          </h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-label-sm text-on-surface-variant uppercase">
                <th className="py-2">Asesor</th>
                <th className="py-2 text-right">Leads</th>
                <th className="py-2 text-right">Ganados</th>
                <th className="py-2 w-1/3">Tasa de cierre</th>
              </tr>
            </thead>
            <tbody>
              {sales.advisors.map((advisor) => {
                const rate = winRate(advisor.leads, advisor.wonLeads);
                return (
                  <tr
                    key={advisor.id}
                    className="border-t border-outline-variant"
                  >
                    <td className="py-3 text-label-md">{advisor.name}</td>
                    <td className="py-3 text-right">{advisor.leads}</td>
                    <td className="py-3 text-right font-bold">
                      {advisor.wonLeads}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Bar value={rate} tone="bg-success-emerald" />
                        <span className="text-label-sm w-10 text-right">
                          {rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section
          className={`${card} col-span-12 lg:col-span-5`}
          aria-labelledby="destinations-title"
        >
          <h3
            id="destinations-title"
            className="font-headline text-headline-md mb-4"
          >
            Rendimiento por destino
          </h3>
          <ul className="space-y-4">
            {sales.destinations.slice(0, 6).map((entry) => (
              <li key={entry.destination}>
                <div className="flex justify-between text-label-md mb-1">
                  <span>{entry.destination}</span>
                  <span className="text-on-surface-variant">
                    {entry.wonLeads}/{entry.leads} ganados
                  </span>
                </div>
                <Bar value={shareOfMax(entry.leads, destinationLeads)} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
