# Execution log — Sprint 1 functional tests

| Fecha | CP | HU | Ejecutor | Resultado | Bug | Evidencia |
|---|---|---|---|---|---|---|
| — | — | — | — | ⏳ Pendiente de implementación | — | — |

## Cómo ejecutar

1. Levantar stack local (`pnpm dev`, DB up).
2. Tomar CP del archivo de la HU.
3. Ejecutar pasos; marcar ✅/❌.
4. Si ❌: abrir Issue `type:bug` con enlace a HU + CP + pasos + esperado vs actual.
5. Actualizar esta tabla.

## Resumen (actualizar en review)

| Métrica | Valor |
|---|---|
| CP diseñados | 38 |
| CP ejecutados | 0 (pre-código HU) |
| CP OK | — |
| CP FAIL | — |
| Bugs abiertos | 0 |

## Bloqueadores Sprint 1

### HU-01, HU-02, HU-07 (Auth & Multi-tenant)
**Status:** ⏳ Waiting for Backend (Samuel)
**Reason:** Routes `/api/auth/register-agency` and `/api/auth/login` not implemented
**Test file:** apps/api/test/e2e/auth.e2e-spec.ts
**Tests:** 9 failing (expected 404, waiting for routes)
**Resolution:** Once Samuel implements HU-01 & HU-02, re-run tests
