const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ZodErrorBody = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

type MessageErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

export class SessionExpiredError extends ApiError {
  constructor() {
    super("Tu sesión expiró. Inicia sesión de nuevo.");
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
    return new ApiError(`La solicitud falló (${res.status}).`);
  }

  const fieldErrors = flattenFieldErrors(body);

  if (typeof body.message === "string") {
    return new ApiError(body.message, fieldErrors);
  }
  if (Array.isArray(body.message) && body.message.length > 0) {
    return new ApiError(body.message.join(" "), fieldErrors);
  }
  if (body.formErrors?.length) {
    return new ApiError(body.formErrors.join(" "), fieldErrors);
  }
  if (fieldErrors) {
    return new ApiError(Object.values(fieldErrors)[0], fieldErrors);
  }

  return new ApiError(`La solicitud falló (${res.status}).`);
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté disponible.",
    );
  }

  if (!res.ok) {
    throw await parseErrorBody(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
