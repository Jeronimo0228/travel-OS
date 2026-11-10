import { documentUploadLimits } from "@travelos/shared";

type FileLike = { name: string; type: string; size: number };

const allowedTypes: readonly string[] = documentUploadLimits.contentTypes;

export function validateDocumentFile(file: FileLike): string | null {
  if (!allowedTypes.includes(file.type)) {
    return "Solo se permiten archivos PDF, JPG o PNG.";
  }
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > documentUploadLimits.maxBytes) {
    return "El archivo supera los 4 MB.";
  }
  return null;
}
