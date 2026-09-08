import { apiFetch } from "./api-client";

export type AgencyBranding = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
};

export type UpdateAgencyBrandingInput = {
  primaryColor: string;
  logoUrl: string | null;
};

export function getAgencyBranding() {
  return apiFetch<AgencyBranding>("/api/agency/branding");
}

export function updateAgencyBranding(input: UpdateAgencyBrandingInput) {
  return apiFetch<AgencyBranding>("/api/agency/branding", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
