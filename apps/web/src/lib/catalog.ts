import { apiFetch } from "./api-client";

export type CatalogKind = "HOTEL" | "ACTIVITY";

export type CatalogItem = {
  id: string;
  kind: CatalogKind;
  name: string;
  destination: string;
  description: string;
  pricingUnit: "PER_NIGHT" | "PER_PERSON";
  price: string;
  currency: string;
};

export type ListCatalogParams = {
  kind?: CatalogKind;
  destination?: string;
};

export function listCatalog(params: ListCatalogParams = {}) {
  const query = new URLSearchParams();
  if (params.kind) query.set("kind", params.kind);
  if (params.destination) query.set("destination", params.destination);

  const qs = query.toString();
  return apiFetch<CatalogItem[]>(`/api/catalog${qs ? `?${qs}` : ""}`);
}

// ───── HU-34: editor de catálogo ─────

export type EditableCatalogItem = CatalogItem & { slug: string; archivedAt: string | null };
export type CatalogDraft = {
  kind: CatalogKind;
  name: string;
  destination: string;
  description: string;
  pricingUnit: "PER_NIGHT" | "PER_PERSON";
  price: string;
  currency: string;
};
export type CsvRowError = { row: number; message: string };

export const EMPTY_DRAFT: CatalogDraft = {
  kind: "HOTEL",
  name: "",
  destination: "",
  description: "",
  pricingUnit: "PER_NIGHT",
  price: "",
  currency: "COP",
};

export const CATALOG_CSV_TEMPLATE =
  "tipo,nombre,destino,descripcion,unidad,precio,moneda\n" +
  'hotel,Hotel Frente al Mar,Cartagena,"Desayuno incluido, vista al mar",noche,450000,COP\n' +
  "actividad,Tour Islas del Rosario,Cartagena,Lancha y almuerzo,persona,180000,COP\n";

export function draftFromItem(item: CatalogItem): CatalogDraft {
  return {
    kind: item.kind,
    name: item.name,
    destination: item.destination,
    description: item.description,
    pricingUnit: item.pricingUnit,
    price: String(Number(item.price)),
    currency: item.currency,
  };
}

/** Valida en el navegador lo mismo que exige el API; devuelve el cuerpo listo o el error. */
export function draftToInput(draft: CatalogDraft): { input?: Omit<CatalogDraft, "price"> & { price: number }; error?: string } {
  const price = Number(draft.price.replace(/[$\s.]/g, "").replace(",", "."));
  if (draft.name.trim().length < 2) return { error: "Escribe el nombre del producto." };
  if (draft.destination.trim().length < 2) return { error: "Escribe el destino." };
  if (!Number.isFinite(price) || price <= 0) return { error: "El precio debe ser un número mayor que cero." };
  return {
    input: {
      ...draft,
      name: draft.name.trim(),
      destination: draft.destination.trim(),
      description: draft.description.trim(),
      currency: draft.currency.trim().toUpperCase() || "COP",
      price,
    },
  };
}

export const listCatalogForEditor = (includeArchived: boolean) =>
  apiFetch<EditableCatalogItem[]>(`/api/catalog/manage${includeArchived ? "?includeArchived=true" : ""}`);
export const createCatalogItem = (input: NonNullable<ReturnType<typeof draftToInput>["input"]>) =>
  apiFetch<EditableCatalogItem>("/api/catalog", { method: "POST", body: JSON.stringify(input) });
export const updateCatalogItem = (id: string, input: NonNullable<ReturnType<typeof draftToInput>["input"]>) =>
  apiFetch<EditableCatalogItem>(`/api/catalog/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const archiveCatalogItem = (id: string, archived: boolean) =>
  apiFetch<EditableCatalogItem>(`/api/catalog/${id}/archive`, { method: "PATCH", body: JSON.stringify({ archived }) });
export const importCatalogCsv = (csv: string) =>
  apiFetch<{ created: number }>("/api/catalog/import", { method: "POST", body: JSON.stringify({ csv }) });
