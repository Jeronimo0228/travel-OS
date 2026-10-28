import { ForbiddenException } from '@nestjs/common';

/**
 * Agencias de demostración en solo lectura. Lista separada por comas en
 * DEMO_READONLY_AGENCY_IDS. Vacío = sin efecto.
 */
const ALLOWED_WRITES: RegExp[] = [
  /^\/api\/auth\/logout\/?$/,
  /^\/api\/quotes\/?$/, // probar el cotizador con IA
  /^\/api\/quotes\/[^/]+\/pdf\/?$/,
];

export function demoReadonlyAgencies(env = process.env.DEMO_READONLY_AGENCY_IDS): Set<string> {
  return new Set((env ?? '').split(',').map((s) => s.trim()).filter(Boolean));
}

export function assertDemoCanWrite(
  agencyId: string | undefined,
  method: string,
  url: string,
  agencies: Set<string> = demoReadonlyAgencies(),
): void {
  if (!agencyId || !agencies.has(agencyId)) return;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) return;
  const path = url.split('?')[0];
  if (ALLOWED_WRITES.some((re) => re.test(path))) return;
  throw new ForbiddenException('Cuenta demo de solo lectura: esta acción no está disponible en la demo.');
}
