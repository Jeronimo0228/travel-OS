"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { backupCount, getAiStatus, poolHealth, type AgentPool, type AiStatus } from "@/lib/ai-status";

type AgentCard = {
  key: keyof AiStatus["agents"];
  name: string;
  icon: string;
  href: string | null;
  cta: string;
  does: string;
  input: string;
  output: string;
  guardrails: string[];
};

const AGENTS: AgentCard[] = [
  {
    key: "cotizador",
    name: "Agente Cotizador",
    icon: "auto_awesome",
    href: "/cotizador",
    cta: "Abrir cotizador",
    does: "Convierte lo que pidió el cliente en 2 o 3 alternativas de viaje con hoteles y actividades de tu catálogo.",
    input: "Texto libre del asesor, catálogo de la agencia y base de conocimiento.",
    output: "Alternativas con productos del catálogo. Precios y totales los calcula el sistema.",
    guardrails: [
      "Solo puede elegir productos que existen en tu catálogo",
      "Nunca fija precios: el sistema suma las tarifas",
      "Rechaza respuestas repetidas o incompletas y regenera una vez",
    ],
  },
  {
    key: "copiloto",
    name: "Copiloto de prospectos",
    icon: "insights",
    href: "/crm",
    cta: "Ver en el CRM",
    does: "Ordena tus prospectos abiertos de 0 a 100 y explica a quién llamar primero y por qué.",
    input: "Etapa, antigüedad y tareas vencidas de los prospectos que tu rol puede ver.",
    output: "Puntaje entero y una razón corta por prospecto.",
    guardrails: [
      "Un asesor solo ve y puntúa sus propios prospectos",
      "Debe devolver exactamente los prospectos enviados, ni uno más",
      "No recibe correos ni teléfonos de los clientes",
    ],
  },
  {
    key: "asistente",
    name: "Asistente conversacional",
    icon: "smart_toy",
    href: null,
    cta: "Ábrelo con el botón redondo de la esquina inferior derecha.",
    does: "Responde preguntas sobre tu embudo, tus seguimientos y cómo usar cada pantalla.",
    input: "Cifras agregadas de tu agencia según tu rol, guía de pantallas y base de conocimiento.",
    output: "Respuesta breve y hasta 3 enlaces a pantallas de Travel OS.",
    guardrails: [
      "Solo lectura: no puede crear, borrar ni enviar nada",
      "Solo sugiere enlaces internos de la aplicación",
      "Ignora instrucciones que intenten cambiar sus reglas",
    ],
  },
];

const PLATFORM_CONTROLS = [
  {
    icon: "key",
    title: "Llaves por agente",
    text: "Cada agente tiene su propio grupo de llaves y comparte uno de reserva. Si una llave se agota, descansa 60 s y entra la siguiente.",
  },
  {
    icon: "swap_horiz",
    title: "Respaldo de proveedor",
    text: "Gemini es el principal. Si no responde, el sistema pasa a Groq y luego a OpenRouter.",
  },
  {
    icon: "rule",
    title: "Salida validada",
    text: "Toda respuesta de la IA se valida contra un esquema estricto antes de llegar a la pantalla.",
  },
  {
    icon: "speed",
    title: "Límite de uso",
    text: "Máximo 20 solicitudes de IA por usuario y por minuto para proteger la cuota.",
  },
  {
    icon: "shield_person",
    title: "Datos por rol y agencia",
    text: "La IA solo recibe datos de tu agencia y de lo que tu rol puede ver.",
  },
  {
    icon: "visibility_off",
    title: "Secretos protegidos",
    text: "Las llaves viven cifradas en el servidor. Nunca llegan al navegador ni a los registros.",
  },
];

const HEALTH_LABEL = {
  ok: { text: "Operando", cls: "bg-emerald-100 text-emerald-800" },
  degradado: { text: "En respaldo", cls: "bg-amber-100 text-amber-800" },
  "sin-llaves": { text: "Sin llaves", cls: "bg-slate-100 text-slate-700" },
} as const;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function PoolBadge({ pool }: { pool: AgentPool }) {
  const label = HEALTH_LABEL[poolHealth(pool)];
  return (
    <div className="rounded-lg bg-surface-container-low p-3 text-body-sm">
      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${label.cls}`}>{label.text}</span>
      <p className="mt-2 tabular-nums">
        {plural(pool.dedicated, "llave")} propia{pool.dedicated === 1 ? "" : "s"} · {pool.total} en total ·{" "}
        {plural(pool.available, "disponible")}
      </p>
    </div>
  );
}

export function AgentsCenter() {
  const { user } = useSession();
  const isAdmin = user?.role === "ADMIN";
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    getAiStatus()
      .then(setStatus)
      .catch(() => setStatusError("No se pudo leer el estado de la IA."));
  }, [isAdmin]);

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && (
        <section aria-labelledby="ai-health" className="rounded-xl border border-outline-variant bg-white p-5">
          <h3 id="ai-health" className="font-headline text-headline-md text-primary">
            Estado de la IA
          </h3>
          {statusError && <p className="mt-2 text-body-sm text-error">{statusError}</p>}
          {!status && !statusError && <p className="mt-2 text-body-sm text-on-surface-variant">Cargando…</p>}
          {status && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-label-sm text-on-surface-variant">Proveedor principal</p>
                <p className="font-bold capitalize">{status.provider ?? "sin configurar"}</p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-label-sm text-on-surface-variant">Llaves Gemini disponibles</p>
                <p className="font-bold tabular-nums">
                  {status.gemini.available} de {status.gemini.keys}
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-label-sm text-on-surface-variant">Proveedores de respaldo</p>
                <p className="font-bold tabular-nums">
                  {backupCount(status)}
                  {status.forced ? " (desactivados)" : ""}
                </p>
              </div>
            </div>
          )}
          <p className="mt-3 text-[12px] text-on-surface-variant">
            Solo los administradores ven esta sección. Nunca se muestran las llaves, solo cuántas hay.
          </p>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <article key={agent.key} className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-white">
                <span className="material-symbols-outlined" aria-hidden>
                  {agent.icon}
                </span>
              </span>
              <h3 className="font-headline text-headline-md text-primary">{agent.name}</h3>
            </div>
            <p className="text-body-md">{agent.does}</p>
            <dl className="grid gap-2 text-body-sm">
              <div>
                <dt className="font-bold">Recibe</dt>
                <dd className="text-on-surface-variant">{agent.input}</dd>
              </div>
              <div>
                <dt className="font-bold">Entrega</dt>
                <dd className="text-on-surface-variant">{agent.output}</dd>
              </div>
            </dl>
            <ul className="space-y-1 text-body-sm">
              {agent.guardrails.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600" aria-hidden>
                    verified_user
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
            {status && <PoolBadge pool={status.agents[agent.key]} />}
            <div className="mt-auto pt-2">
              {agent.href ? (
                <Link
                  href={agent.href}
                  className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-semibold text-on-primary hover:opacity-90"
                >
                  {agent.cta}
                </Link>
              ) : (
                <p className="text-body-sm text-on-surface-variant">{agent.cta}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <section aria-labelledby="controls" className="rounded-xl border border-outline-variant bg-white p-5">
        <h3 id="controls" className="font-headline text-headline-md text-primary">
          Cómo protegemos a los agentes
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_CONTROLS.map((control) => (
            <div key={control.title} className="flex gap-3">
              <span className="material-symbols-outlined text-secondary" aria-hidden>
                {control.icon}
              </span>
              <div>
                <p className="font-bold">{control.title}</p>
                <p className="text-body-sm text-on-surface-variant">{control.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
