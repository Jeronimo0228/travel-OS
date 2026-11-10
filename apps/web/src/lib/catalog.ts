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
