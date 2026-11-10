"use client";

import { useId, useState, type FormEvent } from "react";
import { validateDocumentFile } from "@/lib/document-upload";

const field =
  "w-full bg-surface-container-low rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary-container";

export function DocumentUpload({
  onUpload,
}: {
  onUpload: (file: File, name?: string) => Promise<void>;
}) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setNotice(null);
    if (!file) return setError("Elige un archivo.");
    const problem = validateDocumentFile(file);
    if (problem) return setError(problem);

    setBusy(true);
    setError(null);
    try {
      await onUpload(file, name.trim() || undefined);
      form.reset();
      setFile(null);
      setName("");
      setNotice("Documento subido.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo subir el archivo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 mt-4">
      <div>
        <label htmlFor={`${id}-file`} className="text-label-sm text-on-surface-variant">
          Archivo (PDF, JPG o PNG, hasta 4 MB)
        </label>
        <input
          id={`${id}-file`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(null);
            setNotice(null);
          }}
          className={field}
        />
      </div>
      <div>
        <label htmlFor={`${id}-name`} className="text-label-sm text-on-surface-variant">
          Nombre del documento (opcional)
        </label>
        <input
          id={`${id}-name`}
          value={name}
          maxLength={200}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Voucher hotel"
          className={field}
        />
      </div>
      {error && (
        <p role="alert" className="text-error text-body-sm">
          {error}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-secondary text-body-sm empty:hidden">
        {notice}
      </p>
      <button
        disabled={busy}
        className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-60"
      >
        Subir archivo
      </button>
    </form>
  );
}
