"use client";

import { useState } from "react";
import { useTenantBranding } from "./TenantBrandingProvider";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

const labelClass =
  "font-body-custom text-label-sm text-on-surface-variant mb-1 block";

export function BrandingForm() {
  const { branding, setBranding } = useTenantBranding();
  const [primaryColor, setPrimaryColor] = useState(
    branding.primaryColor ?? "#4648d4",
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(branding.logoUrl);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSaved(false);
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLogoError("Formato no soportado. Usa PNG, JPG o SVG.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLogoError("El archivo supera el tamaño máximo de 2MB.");
      return;
    }

    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setBranding({ primaryColor, logoUrl });
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-lg space-y-6"
    >
      <div>
        <label className={labelClass} htmlFor="branding-color">
          Color primario
        </label>
        <div className="flex items-center gap-3">
          <input
            id="branding-color"
            type="color"
            value={primaryColor}
            onChange={(event) => {
              setPrimaryColor(event.target.value);
              setSaved(false);
            }}
            className="w-12 h-10 rounded-lg border border-outline-variant cursor-pointer"
          />
          <span className="font-body-custom text-body-sm text-on-surface-variant">
            {primaryColor}
          </span>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="branding-logo">
          Logo de la agencia (PNG, JPG o SVG, máx. 2MB)
        </label>
        <input
          id="branding-logo"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleLogoChange}
          className="font-body-custom text-body-sm"
        />
        {logoError && (
          <p className="text-alert-coral text-body-sm mt-1">{logoError}</p>
        )}
        {logoUrl && (
          <div className="mt-3 w-16 h-16 rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Vista previa del logo"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {saved && (
        <p
          role="status"
          className="bg-success-emerald/10 text-success-emerald text-body-sm rounded-lg px-3 py-2"
        >
          Branding actualizado. El sidebar y los botones reflejan el nuevo color.
        </p>
      )}

      <button
        type="submit"
        className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md hover:opacity-90 transition-opacity"
      >
        Guardar cambios
      </button>
    </form>
  );
}
