"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api-client";
import {
  archiveCatalogItem,
  CATALOG_CSV_TEMPLATE,
  createCatalogItem,
  draftFromItem,
  draftToInput,
  EMPTY_DRAFT,
  importCatalogCsv,
  listCatalogForEditor,
  updateCatalogItem,
  type CatalogDraft,
  type CsvRowError,
  type EditableCatalogItem,
} from "@/lib/catalog";
import { formatCop } from "@/lib/format";
import { cardClass, errorClass, fieldClass, ghostButton, labelClass, okClass, primaryButton } from "@/components/ui/styles";

const KIND_LABEL = { HOTEL: "Hotel", ACTIVITY: "Actividad" } as const;
const UNIT_LABEL = { PER_NIGHT: "por noche", PER_PERSON: "por persona" } as const;

function ItemForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: CatalogDraft;
  submitLabel: string;
  onSubmit: (draft: CatalogDraft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const set = (patch: Partial<CatalogDraft>) => setDraft((d) => ({ ...d, ...patch }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { error: problem } = draftToInput(draft);
    if (problem) return setError(problem);
    setPending(true);
    setError(null);
    try {
      await onSubmit(draft);
      if (!onCancel) setDraft(EMPTY_DRAFT);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className={labelClass} htmlFor={`kind-${submitLabel}`}>Tipo</label>
        <select
          id={`kind-${submitLabel}`}
          value={draft.kind}
          onChange={(e) => {
            const kind = e.target.value as CatalogDraft["kind"];
            set({ kind, pricingUnit: kind === "HOTEL" ? "PER_NIGHT" : "PER_PERSON" });
          }}
          className={fieldClass}
        >
          <option value="HOTEL">Hotel</option>
          <option value="ACTIVITY">Actividad</option>
        </select>
      </div>
      <div className="lg:col-span-2">
        <label className={labelClass} htmlFor={`name-${submitLabel}`}>Nombre</label>
        <input id={`name-${submitLabel}`} value={draft.name} onChange={(e) => set({ name: e.target.value })} className={fieldClass} maxLength={160} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`dest-${submitLabel}`}>Destino</label>
        <input id={`dest-${submitLabel}`} value={draft.destination} onChange={(e) => set({ destination: e.target.value })} className={fieldClass} maxLength={120} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`desc-${submitLabel}`}>Descripción (la IA la usa para elegir)</label>
        <input id={`desc-${submitLabel}`} value={draft.description} onChange={(e) => set({ description: e.target.value })} className={fieldClass} maxLength={1000} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`price-${submitLabel}`}>Precio</label>
        <input id={`price-${submitLabel}`} inputMode="decimal" value={draft.price} onChange={(e) => set({ price: e.target.value })} className={fieldClass} placeholder="450000" />
      </div>
      <div>
        <label className={labelClass} htmlFor={`unit-${submitLabel}`}>Unidad</label>
        <select id={`unit-${submitLabel}`} value={draft.pricingUnit} onChange={(e) => set({ pricingUnit: e.target.value as CatalogDraft["pricingUnit"] })} className={fieldClass}>
          <option value="PER_NIGHT">Por noche</option>
          <option value="PER_PERSON">Por persona</option>
        </select>
      </div>
      {error && <p className={`${errorClass} sm:col-span-2 lg:col-span-4`} role="alert">{error}</p>}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={pending} className={primaryButton}>{pending ? "Guardando…" : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className={ghostButton}>Cancelar</button>}
      </div>
    </form>
  );
}

function CsvImport({ onImported }: { onImported: (created: number) => Promise<void> }) {
  const [csv, setCsv] = useState("");
  const [errors, setErrors] = useState<CsvRowError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    setErrors([]);
    setError(null);
    try {
      const res = await importCatalogCsv(csv);
      setCsv("");
      await onImported(res.created);
    } catch (err) {
      const body = err instanceof ApiError ? (err.body as { errors?: CsvRowError[] } | undefined) : undefined;
      if (body?.errors) setErrors(body.errors);
      setError(err instanceof ApiError ? err.message : "No se pudo importar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-on-surface-variant">
        Columnas: <code>tipo, nombre, destino, descripcion, unidad, precio, moneda</code>. «tipo» es hotel o actividad; «unidad» es noche o persona. Hasta 200 filas; si una tiene error no se importa nada.
      </p>
      <div className="flex flex-wrap gap-2">
        <a className={ghostButton} href={`data:text/csv;charset=utf-8,${encodeURIComponent(CATALOG_CSV_TEMPLATE)}`} download="plantilla-catalogo.csv">
          Descargar plantilla
        </a>
        <label className={`${ghostButton} cursor-pointer`}>
          Elegir archivo CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) file.text().then(setCsv).catch(() => setError("No se pudo leer el archivo."));
            }}
          />
        </label>
      </div>
      <label className={labelClass} htmlFor="csv-text">O pega el contenido</label>
      <textarea id="csv-text" rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} className={`${fieldClass} font-mono text-[12px]`} placeholder={CATALOG_CSV_TEMPLATE} />
      {error && <p className={errorClass} role="alert">{error}</p>}
      {errors.length > 0 && (
        <ul className="list-disc pl-5 text-body-sm text-on-error-container">
          {errors.slice(0, 20).map((e) => <li key={`${e.row}-${e.message}`}>Fila {e.row}: {e.message}</li>)}
        </ul>
      )}
      <div>
        <button type="button" disabled={!csv.trim() || pending} onClick={run} className={primaryButton}>
          {pending ? "Importando…" : "Importar"}
        </button>
      </div>
    </div>
  );
}

export function CatalogEditor() {
  const [items, setItems] = useState<EditableCatalogItem[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [panel, setPanel] = useState<"none" | "new" | "import">("none");

  const reload = useCallback(async () => {
    try {
      setItems(await listCatalogForEditor(showArchived));
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? "Solo un administrador o gerente puede editar el catálogo." : "No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.name} ${i.destination}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const destinations = new Set(items.filter((i) => !i.archivedAt).map((i) => i.destination.toLowerCase())).size;

  return (
    <div className="flex flex-col gap-6">
      {error && <p className={errorClass} role="alert">{error}</p>}
      {notice && <p className={okClass} role="status">{notice}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={primaryButton} onClick={() => setPanel(panel === "new" ? "none" : "new")}>
          <span className="material-symbols-outlined text-[20px]" aria-hidden>add</span> Nuevo ítem
        </button>
        <button type="button" className={ghostButton} onClick={() => setPanel(panel === "import" ? "none" : "import")}>
          <span className="material-symbols-outlined text-[20px]" aria-hidden>upload_file</span> Importar CSV
        </button>
        <p className="ml-auto text-body-sm text-on-surface-variant tabular-nums">
          {items.filter((i) => !i.archivedAt).length} ítems vigentes · {destinations} destinos
        </p>
      </div>

      {panel === "new" && (
        <section className={cardClass} aria-label="Nuevo ítem del catálogo">
          <ItemForm
            initial={EMPTY_DRAFT}
            submitLabel="Agregar al catálogo"
            onSubmit={async (draft) => {
              await createCatalogItem(draftToInput(draft).input!);
              setNotice("Ítem agregado. El cotizador ya lo puede usar.");
              await reload();
            }}
          />
        </section>
      )}
      {panel === "import" && (
        <section className={cardClass} aria-label="Importar catálogo desde CSV">
          <CsvImport
            onImported={async (created) => {
              setNotice(`Se importaron ${created} ítems.`);
              setPanel("none");
              await reload();
            }}
          />
        </section>
      )}

      <section className={cardClass} aria-label="Ítems del catálogo">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="catalog-filter">Buscar en el catálogo</label>
          <input id="catalog-filter" type="search" placeholder="Buscar por nombre o destino…" value={query} onChange={(e) => setQuery(e.target.value)} className={`${fieldClass} max-w-sm`} />
          <label className="flex items-center gap-2 text-body-sm">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Mostrar archivados
          </label>
        </div>
        {loading ? (
          <p className="mt-3 text-body-sm text-on-surface-variant">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-3 text-body-sm text-on-surface-variant">No hay ítems con ese filtro.</p>
        ) : (
          <ul className="mt-3 divide-y divide-outline-variant">
            {filtered.map((item) => (
              <li key={item.id} className="py-3">
                {editing === item.id ? (
                  <ItemForm
                    initial={draftFromItem(item)}
                    submitLabel="Guardar cambios"
                    onCancel={() => setEditing(null)}
                    onSubmit={async (draft) => {
                      await updateCatalogItem(item.id, draftToInput(draft).input!);
                      setEditing(null);
                      setNotice("Cambios guardados.");
                      await reload();
                    }}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.kind === "HOTEL" ? "bg-indigo-100 text-indigo-800" : "bg-teal-100 text-teal-800"}`}>
                      {KIND_LABEL[item.kind]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${item.archivedAt ? "text-on-surface-variant line-through" : ""}`}>{item.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{item.destination}{item.description ? ` · ${item.description}` : ""}</p>
                    </div>
                    <p className="tabular-nums font-bold">{formatCop(item.price, item.currency)} <span className="text-body-sm font-normal text-on-surface-variant">{UNIT_LABEL[item.pricingUnit]}</span></p>
                    <div className="flex gap-2">
                      {!item.archivedAt && <button type="button" className={ghostButton} onClick={() => setEditing(item.id)}>Editar</button>}
                      <button
                        type="button"
                        className={ghostButton}
                        onClick={async () => {
                          setError(null);
                          try {
                            await archiveCatalogItem(item.id, !item.archivedAt);
                            setNotice(item.archivedAt ? "Ítem restaurado." : "Ítem archivado: ya no aparece en nuevas cotizaciones.");
                            await reload();
                          } catch (err) {
                            setError(err instanceof ApiError ? err.message : "No se pudo archivar.");
                          }
                        }}
                      >
                        {item.archivedAt ? "Restaurar" : "Archivar"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
