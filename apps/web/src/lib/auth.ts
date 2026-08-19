import type { LoginInput, RegisterAgencyInput } from "@travelos/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class AuthError extends Error {}

async function postAuth<TInput>(path: string, input: TInput) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
  } catch {
    throw new AuthError(
      "No se pudo conectar con el servidor. Verifica que la API esté disponible.",
    );
  }

  if (!res.ok) {
    const message = await res
      .json()
      .then((body: { message?: string }) => body.message)
      .catch(() => undefined);
    throw new AuthError(message ?? "La solicitud fue rechazada por el servidor.");
  }

  return res.json();
}

export function login(input: LoginInput) {
  return postAuth("/api/auth/login", input);
}

export function registerAgency(input: RegisterAgencyInput) {
  return postAuth("/api/auth/register", input);
}
