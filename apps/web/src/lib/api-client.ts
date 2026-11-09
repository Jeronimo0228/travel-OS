export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const AUTH_PATH = /^\/api\/auth\//;
const LOGIN_PATH = "/api/auth/login";

let sessionExpiredListener: (() => void) | null = null;

export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListener = listener;
  return () => {
    if (sessionExpiredListener === listener) sessionExpiredListener = null;
  };
}

type ZodErrorBody = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

type MessageErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  fieldErrors?: Record<string, string>;
  status?: number;

  constructor(
    message: string,
    fieldErrors?: Record<string, string>,
    status?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

export class SessionExpiredError extends ApiError {
  constructor() {
    super("Tu sesión expiró. Inicia sesión de nuevo.", undefined, 401);
    this.name = "SessionExpiredError";
  }
}

function flattenFieldErrors(body: ZodErrorBody): Record<string, string> | undefined {
  if (!body.fieldErrors) return undefined;
  const flat: Record<string, string> = {};
  for (const [key, messages] of Object.entries(body.fieldErrors)) {
    if (messages?.length) flat[key] = messages[0];
  }
  return Object.keys(flat).length > 0 ? flat : undefined;
}

async function parseErrorBody(res: Response): Promise<ApiError> {
  if (res.status === 401) return new SessionExpiredError();

  const body = await res.json().catch(() => null) as
    | (ZodErrorBody & MessageErrorBody)
    | null;

  if (!body) {
    return new ApiError(
      `La solicitud falló (${res.status}).`,
      undefined,
      res.status,
    );
  }

  const fieldErrors = flattenFieldErrors(body);

  if (typeof body.message === "string") {
    return new ApiError(body.message, fieldErrors, res.status);
  }
  if (Array.isArray(body.message) && body.message.length > 0) {
    return new ApiError(body.message.join(" "), fieldErrors, res.status);
  }
  if (body.formErrors?.length) {
    return new ApiError(body.formErrors.join(" "), fieldErrors, res.status);
  }
  if (fieldErrors) {
    return new ApiError(Object.values(fieldErrors)[0], fieldErrors, res.status);
  }

  return new ApiError(
    `La solicitud falló (${res.status}).`,
    undefined,
    res.status,
  );
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté disponible.",
    );
  }

  if (!res.ok) {
    if (res.status === 401 && path === LOGIN_PATH) {
      throw new ApiError("Correo o contraseña incorrectos.", undefined, 401);
    }
    const error = await parseErrorBody(res);
    if (
      error instanceof SessionExpiredError &&
      options.credentials !== "omit" &&
      !AUTH_PATH.test(path)
    ) {
      sessionExpiredListener?.();
    }
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
