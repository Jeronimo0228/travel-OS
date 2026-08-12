# Calidad del software — Sprint 1

Documentación exigida por el documento maestro (estándares de nombramiento, análisis estático, extras).

## 1. Estándares de nombramiento

### Decisión

Seguir las convenciones oficiales / de comunidad de cada stack:

| Capa | Estándar | Referencia |
|---|---|---|
| TypeScript / JavaScript | camelCase variables/funciones; PascalCase clases/tipos/componentes React; UPPER_SNAKE constantes | [Google TS Style](https://google.github.io/styleguide/tsguide.html) (adaptado) + convención React |
| React / Next.js | Componentes `PascalCase.tsx`; hooks `useXxx`; rutas App Router en kebab de carpetas | [Next.js App Router](https://nextjs.org/docs/app) |
| NestJS | `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs `PascalCaseDto` | [NestJS Style](https://docs.nestjs.com/) |
| Prisma / DB | models `PascalCase`; fields `camelCase`; enums `PascalCase` | Prisma conventions |
| CSS / Tailwind | utility-first; tokens semánticos del prototipo (`primary`, `surface`, …) | Prototipo TravelOS-AI-Ecosystem |
| Git branches | `feature/HU-XX-short-slug`, `fix/…`, `chore/…` | GitHub Flow (abajo) |
| Issues | `HU-XX: título`; bugs `bug: …` | Labels del repo |

### Justificación

- Alineado a frameworks oficiales → onboarding rápido del equipo académico.
- ESLint + TypeScript ya fallan CI si se rompen patrones graves.
- Prettier homogeniza formato (corrección automática estética).

### Ejemplos

```text
apps/api/src/crm/leads.service.ts
apps/web/src/app/(agency)/crm/page.tsx
createLeadDto / LeadResponse
feature/HU-07-create-edit-leads
```

---

## 2. Análisis estático de código

| Herramienta | Alcance | Config | Justificación |
|---|---|---|---|
| **ESLint 9** | `apps/web`, `apps/api` | `eslint.config.mjs` por app | Estándar de facto TS/React/Nest; modo recomendado + reglas TS |
| **TypeScript** (`tsc`) | monorepo | `tsconfig.json` | Tipado estricto = análisis estático semántico |
| **Prettier 3** | TS/TSX/MD/JSON | script `pnpm format` | Formateador con corrección automática (extra de rúbrica) |

### Comandos

```bash
pnpm lint          # ESLint en paquetes
pnpm format        # Prettier --write
pnpm --filter @travelos/api test
pnpm build
```

### Enforcing en CI

Workflow [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml):

1. `pnpm install --frozen-lockfile`
2. Build `@travelos/shared`
3. Prisma generate
4. Lint API + Lint Web
5. Test API
6. Build API + Build Web

**Puntos rúbrica:** lint en CI + Prettier (auto-fix formato).  
**Pendiente opcional (extra):** branch protection en `main` exigiendo CI green + 1 approval (configurar en GitHub Settings → Branches).

---

## 3. Branching strategy — GitHub Flow

### Elección: **GitHub Flow** (no GitFlow completo)

Flujo:

1. `main` siempre desplegable / verde.
2. Rama corta desde `main`: `feature/HU-XX-…` o `fix/…`.
3. PR → CI obligatorio → review de pares → merge.
4. Borrar rama tras merge.

### Justificación

- Equipo pequeño (5) y sprints cortos: GitFlow añade release/hotfix branches innecesarias.
- Ya usamos PRs + Actions; GitHub Flow es el encaje natural.
- Documentado para la rúbrica de “branching strategy”.

Referencia: [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow).

---

## 4. Seguridad / vulnerabilidades (extra)

| Práctica | Estado |
|---|---|
| Secrets solo en env / GitHub Environments | `.env` gitignored; `.env.example` sin secretos |
| Dependabot | Recomendado activar en Settings → Code security |
| `pnpm audit` | Ejecutar en review de calidad Sprint 1 |
| JWT secret en CI solo de prueba | Ya en workflow (`JWT_SECRET` dummy) |

---

## 5. Evidencia para sustentación (profesor)

Demo técnica sugerida (2–3 min):

1. Abrir PR de ejemplo / Actions tab → CI verde.
2. Mostrar `eslint.config.mjs` + fallo local simulado (opcional).
3. Mostrar `pnpm format` y este documento en Wiki.
4. Mostrar convención de ramas en un PR real de HU.
