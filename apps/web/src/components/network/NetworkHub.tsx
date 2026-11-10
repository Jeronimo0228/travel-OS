"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { ApiError } from "@/lib/api-client";
import { formatCop } from "@/lib/format";
import {
  addDeparture,
  answerPartnership,
  archiveProgram,
  BOOKING_LABEL,
  bookingEstimate,
  cancelBooking,
  createProgram,
  decideBooking,
  formatDay,
  getOverview,
  incomingBookings,
  invitePartner,
  listPartners,
  listPrograms,
  myBookings,
  myPartnerships,
  networkPrograms,
  PARTNER_LABEL,
  publishProgram,
  requestBooking,
  setAgencyKind,
  updatePartner,
  type Booking,
  type NetworkProgram,
  type Overview,
  type Partner,
  type Program,
} from "@/lib/wholesale";
import { cardClass, errorClass, fieldClass, ghostButton, labelClass, okClass, primaryButton } from "@/components/ui/styles";

type Tab = "disponibles" | "mis-reservas" | "mayoristas" | "programas" | "aliadas" | "recibidas";
const errText = (err: unknown) => (err instanceof ApiError ? err.message : "No se pudo completar la acción.");

const statusPill = (label: string, tone: "ok" | "warn" | "off") =>
  `rounded-full px-2 py-0.5 text-[11px] font-bold ${
    tone === "ok" ? "bg-emerald-100 text-emerald-800" : tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
  }`;
const bookingTone = (s: Booking["status"]) => (s === "CONFIRMED" ? "ok" : s === "REQUESTED" ? "warn" : "off");

function BookingsTable({ rows, side, onAction }: { rows: Booking[]; side: "agency" | "wholesaler"; onAction: (b: Booking, action: "confirm" | "cancel") => void }) {
  if (!rows.length) return <p className="text-body-sm text-on-surface-variant">Aún no hay reservas.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-body-sm">
        <thead>
          <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
            <th className="py-2">Programa</th><th>Salida</th><th>{side === "agency" ? "Mayorista" : "Agencia"}</th><th>Viajero</th><th className="text-right">Pax</th><th className="text-right">Neto</th><th className="text-right">Comisión</th><th>Estado</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-b border-outline-variant">
              <td className="py-2 font-semibold">{b.departure.program.name}</td>
              <td>{formatDay(b.departure.startsOn)}</td>
              <td>{side === "agency" ? b.wholesaler.name : b.agency.name}</td>
              <td>{b.travelerName}</td>
              <td className="text-right tabular-nums">{b.pax}</td>
              <td className="text-right tabular-nums">{formatCop(b.netTotal)}</td>
              <td className="text-right tabular-nums">{formatCop(b.commissionTotal)} <span className="text-on-surface-variant">({Number(b.commissionPct)} %)</span></td>
              <td><span className={statusPill(BOOKING_LABEL[b.status], bookingTone(b.status))}>{BOOKING_LABEL[b.status]}</span></td>
              <td className="text-right">
                {side === "wholesaler" && b.status === "REQUESTED" && (
                  <button type="button" className={ghostButton} onClick={() => onAction(b, "confirm")}>Confirmar</button>
                )}
                {b.status !== "CANCELLED" && (side === "wholesaler" || b.status === "REQUESTED") && (
                  <button type="button" className={`${ghostButton} ml-2`} onClick={() => onAction(b, "cancel")}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingForm({ program, onBooked }: { program: NetworkProgram; onBooked: () => Promise<void> }) {
  const open = program.departures.filter((d) => d.seatsLeft > 0);
  const [departureId, setDepartureId] = useState(open[0]?.id ?? "");
  const [travelerName, setTravelerName] = useState("");
  const [pax, setPax] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const estimate = bookingEstimate(program.netPrice, pax, program.commissionPct);
  if (!open.length) return <p className="text-body-sm text-on-surface-variant">Sin cupos disponibles en las próximas salidas.</p>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await requestBooking(departureId, travelerName.trim(), pax);
      setTravelerName("");
      await onBooked();
    } catch (err) {
      setError(errText(err));
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
      <div>
        <label className={labelClass} htmlFor={`dep-${program.id}`}>Salida</label>
        <select id={`dep-${program.id}`} value={departureId} onChange={(e) => setDepartureId(e.target.value)} className={fieldClass}>
          {open.map((d) => <option key={d.id} value={d.id}>{formatDay(d.startsOn)} · {d.seatsLeft} cupos</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor={`trav-${program.id}`}>Viajero o grupo</label>
        <input id={`trav-${program.id}`} required minLength={2} value={travelerName} onChange={(e) => setTravelerName(e.target.value)} className={fieldClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`pax-${program.id}`}>Pax</label>
        <input id={`pax-${program.id}`} type="number" min={1} max={50} value={pax} onChange={(e) => setPax(Math.max(1, Number(e.target.value) || 1))} className={fieldClass} />
      </div>
      <button type="submit" className={primaryButton}>Solicitar cupos</button>
      <p className="text-body-sm text-on-surface-variant sm:col-span-4 tabular-nums">
        Neto {formatCop(estimate.net, program.currency)} · tu comisión {formatCop(estimate.commission, program.currency)} ({Number(program.commissionPct)} %)
      </p>
      {error && <p className={`${errorClass} sm:col-span-4`} role="alert">{error}</p>}
    </form>
  );
}

function ProgramForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ name: "", destination: "", days: 4, netPrice: "", description: "", startsOn: "", seats: 20 });
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const netPrice = Number(form.netPrice.replace(/[$\s.]/g, ""));
    if (!netPrice) return setError("Escribe la tarifa neta por persona.");
    try {
      await createProgram({
        name: form.name.trim(),
        destination: form.destination.trim(),
        days: form.days,
        description: form.description.trim(),
        netPrice,
        departures: form.startsOn ? [{ startsOn: form.startsOn, seats: form.seats }] : [],
      });
      setForm({ name: "", destination: "", days: 4, netPrice: "", description: "", startsOn: "", seats: 20 });
      await onCreated();
    } catch (err) {
      setError(errText(err));
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2"><label className={labelClass} htmlFor="p-name">Nombre del programa</label><input id="p-name" required minLength={3} value={form.name} onChange={(e) => set({ name: e.target.value })} className={fieldClass} /></div>
      <div><label className={labelClass} htmlFor="p-dest">Destino</label><input id="p-dest" required value={form.destination} onChange={(e) => set({ destination: e.target.value })} className={fieldClass} /></div>
      <div><label className={labelClass} htmlFor="p-days">Días</label><input id="p-days" type="number" min={1} max={60} value={form.days} onChange={(e) => set({ days: Number(e.target.value) || 1 })} className={fieldClass} /></div>
      <div className="sm:col-span-2"><label className={labelClass} htmlFor="p-desc">Qué incluye</label><input id="p-desc" value={form.description} onChange={(e) => set({ description: e.target.value })} className={fieldClass} /></div>
      <div><label className={labelClass} htmlFor="p-net">Tarifa neta por persona (COP)</label><input id="p-net" inputMode="numeric" value={form.netPrice} onChange={(e) => set({ netPrice: e.target.value })} className={fieldClass} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass} htmlFor="p-date">Primera salida</label><input id="p-date" type="date" value={form.startsOn} onChange={(e) => set({ startsOn: e.target.value })} className={fieldClass} /></div>
        <div><label className={labelClass} htmlFor="p-seats">Cupos</label><input id="p-seats" type="number" min={1} max={500} value={form.seats} onChange={(e) => set({ seats: Number(e.target.value) || 1 })} className={fieldClass} /></div>
      </div>
      {error && <p className={`${errorClass} sm:col-span-2 lg:col-span-4`} role="alert">{error}</p>}
      <div className="sm:col-span-2 lg:col-span-4"><button type="submit" className={primaryButton}>Crear programa</button></div>
    </form>
  );
}

function DepartureAdder({ program, onAdded }: { program: Program; onAdded: () => Promise<void> }) {
  const [startsOn, setStartsOn] = useState("");
  const [seats, setSeats] = useState(20);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mt-2 flex flex-wrap items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await addDeparture(program.id, startsOn, seats);
          setStartsOn("");
          await onAdded();
        } catch (err) {
          setError(errText(err));
        }
      }}
    >
      <div><label className={labelClass} htmlFor={`nd-${program.id}`}>Nueva salida</label><input id={`nd-${program.id}`} type="date" required value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={fieldClass} /></div>
      <div><label className={labelClass} htmlFor={`ns-${program.id}`}>Cupos</label><input id={`ns-${program.id}`} type="number" min={1} max={500} value={seats} onChange={(e) => setSeats(Number(e.target.value) || 1)} className={`${fieldClass} w-24`} /></div>
      <button type="submit" className={ghostButton}>Agregar salida</button>
      {error && <p className={errorClass} role="alert">{error}</p>}
    </form>
  );
}

export function NetworkHub() {
  const { user } = useSession();
  const isAdmin = user?.role === "ADMIN";
  const canManage = user?.role === "ADMIN" || user?.role === "GERENTE";
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tab, setTab] = useState<Tab>("disponibles");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [available, setAvailable] = useState<NetworkProgram[]>([]);
  const [mine, setMine] = useState<Booking[]>([]);
  const [wholesalers, setWholesalers] = useState<Partner[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [incoming, setIncoming] = useState<Booking[]>([]);
  const [slug, setSlug] = useState("");
  const [commission, setCommission] = useState(10);

  const isWholesaler = overview?.kind === "WHOLESALER";

  const reload = useCallback(async () => {
    setError(null);
    try {
      const ov = await getOverview();
      setOverview(ov);
      const [a, m, w] = await Promise.all([networkPrograms(), myBookings(), myPartnerships()]);
      setAvailable(a);
      setMine(m);
      setWholesalers(w);
      if (ov.kind === "WHOLESALER" && canManage) {
        const [p, pa, inc] = await Promise.all([listPrograms(), listPartners(), incomingBookings()]);
        setPrograms(p);
        setPartners(pa);
        setIncoming(inc);
      }
    } catch (err) {
      setError(errText(err));
    }
  }, [canManage]);

  // Cada pestaña trae datos frescos al abrirla (las reservas llegan de otras agencias).
  useEffect(() => {
    if (user) void reload();
  }, [user, reload, tab]);

  async function act(fn: () => Promise<unknown>, done: string) {
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(done);
      await reload();
    } catch (err) {
      setError(errText(err));
    }
  }

  const tabs: { id: Tab; label: string; show: boolean; badge?: number }[] = [
    { id: "disponibles", label: "Programas disponibles", show: true },
    { id: "mis-reservas", label: "Mis reservas", show: true },
    { id: "mayoristas", label: "Mis mayoristas", show: true, badge: overview?.pendingInvites },
    { id: "programas", label: "Mis programas", show: isWholesaler && canManage },
    { id: "aliadas", label: "Agencias aliadas", show: isWholesaler && canManage },
    { id: "recibidas", label: "Reservas recibidas", show: isWholesaler && canManage, badge: incoming.filter((b) => b.status === "REQUESTED").length },
  ];

  return (
    <div className="flex flex-col gap-5">
      {error && <p className={errorClass} role="alert">{error}</p>}
      {notice && <p className={okClass} role="status">{notice}</p>}

      {overview && (
        <section className={`${cardClass} flex flex-wrap items-center gap-4`}>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{overview.name} · {isWholesaler ? "Mayorista" : "Agencia"}</p>
            <p className="text-body-sm text-on-surface-variant">
              Tu identificador para que un mayorista te invite: <code className="font-mono">{overview.slug}</code>
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              className={ghostButton}
              onClick={() =>
                act(
                  () => setAgencyKind(isWholesaler ? "AGENCY" : "WHOLESALER"),
                  isWholesaler ? "Modo mayorista desactivado." : "Modo mayorista activado: ya puedes crear programas e invitar agencias.",
                )
              }
            >
              {isWholesaler ? "Desactivar modo mayorista" : "Operar también como mayorista"}
            </button>
          )}
        </section>
      )}

      <div role="tablist" aria-label="Red de agencias" className="flex flex-wrap gap-2">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full px-4 text-label-md font-semibold ${tab === t.id ? "bg-primary text-on-primary" : "border border-outline-variant bg-white text-primary"}`}
          >
            {t.label}
            {t.badge ? <span className="ml-2 rounded-full bg-amber-400 px-2 text-[11px] text-black">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      <section className={cardClass} role="tabpanel">
        {tab === "disponibles" &&
          (available.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Aún no hay programas publicados por tus mayoristas. Cuando un mayorista te invite, acepta la invitación en «Mis mayoristas».
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {available.map((p) => (
                <li key={p.id} className="rounded-lg border border-outline-variant p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-headline text-headline-md text-primary">{p.name}</p>
                    <p className="tabular-nums font-bold">{formatCop(p.netPrice, p.currency)} <span className="text-body-sm font-normal text-on-surface-variant">neto por persona</span></p>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{p.destination} · {p.days} días · {p.wholesalerName}{p.description ? ` · ${p.description}` : ""}</p>
                  <BookingForm program={p} onBooked={async () => { setNotice("Solicitud enviada al mayorista."); await reload(); }} />
                </li>
              ))}
            </ul>
          ))}

        {tab === "mis-reservas" && (
          <BookingsTable rows={mine} side="agency" onAction={(b) => act(() => cancelBooking(b.id), "Reserva cancelada y cupos liberados.")} />
        )}

        {tab === "mayoristas" &&
          (wholesalers.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Ningún mayorista te ha invitado todavía. Compártele tu identificador: <code>{overview?.slug}</code>.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {wholesalers.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center gap-3 py-3">
                  <p className="min-w-0 flex-1 font-semibold">{w.wholesaler?.name} <span className="text-body-sm font-normal text-on-surface-variant">· comisión {Number(w.commissionPct)} %</span></p>
                  <span className={statusPill(PARTNER_LABEL[w.status], w.status === "ACTIVE" ? "ok" : w.status === "PENDING" ? "warn" : "off")}>{PARTNER_LABEL[w.status]}</span>
                  {w.status === "PENDING" && isAdmin && (
                    <>
                      <button type="button" className={primaryButton} onClick={() => act(() => answerPartnership(w.id, true), "Alianza aceptada.")}>Aceptar</button>
                      <button type="button" className={ghostButton} onClick={() => act(() => answerPartnership(w.id, false), "Invitación rechazada.")}>Rechazar</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ))}

        {tab === "programas" && (
          <div className="flex flex-col gap-5">
            <ProgramForm onCreated={async () => { setNotice("Programa creado. Publícalo cuando esté listo."); await reload(); }} />
            <ul className="flex flex-col gap-3">
              {programs.map((p) => (
                <li key={p.id} className="rounded-lg border border-outline-variant p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 font-semibold">{p.name} <span className="text-body-sm font-normal text-on-surface-variant">· {p.destination} · {p.days} días · {formatCop(p.netPrice, p.currency)} neto</span></p>
                    <span className={statusPill(p.publishedAt ? "Publicado" : "Borrador", p.publishedAt ? "ok" : "off")}>{p.publishedAt ? "Publicado" : "Borrador"}</span>
                    <button type="button" className={ghostButton} onClick={() => act(() => publishProgram(p.id, !p.publishedAt), p.publishedAt ? "Programa despublicado." : "Programa publicado para tus aliadas.")}>
                      {p.publishedAt ? "Despublicar" : "Publicar"}
                    </button>
                    <button type="button" className={ghostButton} onClick={() => act(() => archiveProgram(p.id), "Programa archivado.")}>Archivar</button>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2 text-body-sm">
                    {p.departures.map((d) => (
                      <li key={d.id} className="rounded-full bg-surface-container-low px-3 py-1 tabular-nums">{formatDay(d.startsOn)} · {d.seatsLeft}/{d.seats} cupos</li>
                    ))}
                  </ul>
                  <DepartureAdder program={p} onAdded={reload} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "aliadas" && (
          <div className="flex flex-col gap-4">
            <form
              className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                void act(() => invitePartner(slug.trim().toLowerCase(), commission), "Invitación enviada: la agencia debe aceptarla.");
                setSlug("");
              }}
            >
              <div><label className={labelClass} htmlFor="ally-slug">Identificador de la agencia</label><input id="ally-slug" required pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldClass} placeholder="viajes-horizonte" /></div>
              <div><label className={labelClass} htmlFor="ally-pct">Comisión (%)</label><input id="ally-pct" type="number" min={0} max={50} step={0.5} value={commission} onChange={(e) => setCommission(Number(e.target.value))} className={fieldClass} /></div>
              <button type="submit" className={primaryButton}>Invitar agencia</button>
            </form>
            <ul className="divide-y divide-outline-variant">
              {partners.map((pa) => (
                <li key={pa.id} className="flex flex-wrap items-center gap-3 py-3">
                  <p className="min-w-0 flex-1 font-semibold">{pa.agency?.name} <span className="text-body-sm font-normal text-on-surface-variant">· {pa.agency?.slug} · {Number(pa.commissionPct)} %</span></p>
                  <span className={statusPill(PARTNER_LABEL[pa.status], pa.status === "ACTIVE" ? "ok" : pa.status === "PENDING" ? "warn" : "off")}>{PARTNER_LABEL[pa.status]}</span>
                  {pa.status !== "ENDED" ? (
                    <button type="button" className={ghostButton} onClick={() => act(() => updatePartner(pa.id, { status: "ENDED" }), "Alianza terminada.")}>Terminar</button>
                  ) : (
                    <button type="button" className={ghostButton} onClick={() => act(() => updatePartner(pa.id, { status: "ACTIVE" }), "Alianza reactivada.")}>Reactivar</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "recibidas" && (
          <BookingsTable
            rows={incoming}
            side="wholesaler"
            onAction={(b, action) =>
              act(() => decideBooking(b.id, action === "confirm" ? "CONFIRMED" : "CANCELLED"), action === "confirm" ? "Reserva confirmada." : "Reserva cancelada.")
            }
          />
        )}
      </section>
    </div>
  );
}
