import { describe, expect, it } from "vitest";
import { validateDocumentFile } from "./document-upload";

const file = (overrides: Partial<{ name: string; type: string; size: number }> = {}) => ({
  name: "voucher.pdf",
  type: "application/pdf",
  size: 120_000,
  ...overrides,
});

describe("validateDocumentFile", () => {
  it("accepts PDF, JPEG and PNG files within the size limit", () => {
    expect(validateDocumentFile(file())).toBeNull();
    expect(validateDocumentFile(file({ type: "image/jpeg", name: "a.jpg" }))).toBeNull();
    expect(validateDocumentFile(file({ type: "image/png", name: "a.png" }))).toBeNull();
  });

  it("accepts a file of exactly 4 MB", () => {
    expect(validateDocumentFile(file({ size: 4 * 1024 * 1024 }))).toBeNull();
  });

  it("rejects files larger than 4 MB", () => {
    expect(validateDocumentFile(file({ size: 4 * 1024 * 1024 + 1 }))).toBe(
      "El archivo supera los 4 MB.",
    );
  });

  it("rejects empty files", () => {
    expect(validateDocumentFile(file({ size: 0 }))).toBe("El archivo está vacío.");
  });

  it("rejects other file types", () => {
    expect(
      validateDocumentFile(file({ type: "application/x-msdownload", name: "a.exe" })),
    ).toBe("Solo se permiten archivos PDF, JPG o PNG.");
    expect(validateDocumentFile(file({ type: "" }))).toBe(
      "Solo se permiten archivos PDF, JPG o PNG.",
    );
  });
});
