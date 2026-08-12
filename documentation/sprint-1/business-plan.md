# Plan de Negocios — TravelOS AI (primera versión · Sprint 1)

**Producto:** TravelOS AI — sistema operativo inteligente para agencias de viajes (LATAM).  
**Cliente / PO:** Juan Manuel Restrepo Molina — CEO, Punto D' Partida.  
**Equipo:** Proyecto Integrador 2 · EAFIT · Grupo 2.  
**Alcance Sprint 1:** secciones 1–5 del esquema del plan de negocio (documento maestro).

---

## Sección 1. Resumen ejecutivo

### Descripción del negocio

TravelOS AI es una plataforma SaaS multi-tenant que actúa como **centro de operaciones** de la agencia de viajes: CRM inteligente, cotización e itinerarios asistidos por IA, portal del viajero, automatizaciones y dashboard gerencial — con marca blanca y conocimiento propio por agencia.

No es “un CRM”, “un chatbot” o “un cotizador” aislado: cierra el loop comercial y operativo que hoy las pymes de turismo resuelven con WhatsApp + Excel + Drive + PDFs.

**Problema que resuelve:** pérdida de leads por respuesta lenta, cotizaciones manuales, información dispersa, fuga de conocimiento cuando un asesor se va, y ausencia de métricas de conversión/rentabilidad.

**Propuesta de valor (una frase):** la agencia responde más rápido, cotiza en minutos y opera en un solo sistema — con IA que aprende su tono y políticas.

### Fundadores / equipo de gestión (académico-operativo)

| Integrante | Rol | Aporte |
|---|---|---|
| Jerónimo Restrepo Ángel | Scrum Master + DevSecOps | Gestión del proyecto, calidad, CI/CD, seguridad |
| Santiago Arboleda Giraldo | Frontend | Experiencia web agencia / portal |
| Samuel Madrid Ossa | Backend | API, multi-tenant, dominio CRM |
| Miguel Mercado Mercado | QA | Pruebas funcionales, trazabilidad HU–CP–bugs |
| Juan José Palacio Zuluaga | UX/UI | Diseño, consistencia con prototipo aprobado |

**Complementariedad:** producto + ingeniería + calidad + experiencia de usuario, con un PO real del sector (Punto D' Partida).

### Productos / servicios

| Oferta | Qué incluye (visión) |
|---|---|
| TravelOS Agencia (SaaS) | CRM, cotizador IA, itinerarios, automatizaciones, dashboard, marca blanca |
| Portal viajero | Itinerario, docs, chat, estado del viaje |
| Piloto comercial | Despliegue controlado con agencia aliada (Punto D' Partida) |

**MVP académico (ciclo del curso):** fundación multi-tenant + CRM (Sprint 1) → cotizador/itinerarios IA (Sprint 2) → portal + KPIs + piloto (Sprint 3).

### Mercado objetivo

- **Primario:** agencias de viajes SMB en Colombia / LATAM (5–50 asesores) que viven en WhatsApp.
- **Secundario:** operadores / consolidados que necesitan marca blanca y control de embudo.
- **Usuario final del valor:** gerente (visibilidad) y asesor (velocidad de cierre); el viajero consume el portal.

### Competencia (síntesis)

| Competidor | Fortaleza | Brecha vs TravelOS |
|---|---|---|
| TravelJoy | CRM + pagos + copiloto | No es SO integral LATAM/WhatsApp-first ni knowledge por agencia |
| Travefy | Itinerarios visuales | Cotización NL / agente ventas / knowledge aislado más débiles |
| Chatbots turísticos | Respuesta rápida WhatsApp | Sin CRM, docs, métricas ni retención de conocimiento |

### Objetivos a corto y largo plazo

| Horizonte | Objetivo | Medición |
|---|---|---|
| Corto (Sprint 1–3 académico) | MVP demoable + piloto con PO | HUs Done + review con cliente |
| Medio (6–12 meses post-curso) | 3–5 agencias en piloto pago / freemium | Conversión piloto → contrato |
| Largo (2–3 años) | SO de referencia para SMB turismo LATAM | ARR / retención / NPS agencias |

---

## Sección 2. Descripción del negocio

### Historia y antecedentes

1. Diagnóstico con PO (Punto D' Partida): dolor real de operación fragmentada.
2. Sprint 0: definición de producto, arquitectura, mockups, backlog (24 HU / 4 épicas) — **aprobado por PO**.
3. Sprint 1: inicio de implementación — fundación multi-tenant + CRM núcleo.
4. Roadmap: cotizador IA → portal viajero → piloto.

### Misión

Empoderar a las agencias de viajes LATAM para vender y operar viajes con la velocidad que el viajero digital exige, sin perder el control humano ni la identidad de marca.

### Visión

Ser el sistema operativo estándar de la agencia SMB en Latinoamérica: un solo lugar para vender, operar y medir.

### Valores

| Valor | Cómo se refleja |
|---|---|
| Velocidad con calidad | Cotizar y responder en minutos, con trazabilidad |
| Transparencia | Stack y arquitectura documentados; sin caja negra |
| Aislamiento y confianza | Multi-tenant estricto (`agencyId`); datos de cada agencia protegidos |
| Aprendizaje continuo | IA con knowledge propio por agencia |
| Enfoque cliente | Decisiones priorizadas con el PO real del sector |

---

## Sección 3. Análisis del mercado

### Investigación de mercado (síntesis con fuentes a citar en pitch)

- El viajero cotiza con varias agencias a la vez; la **primera respuesta útil** correlaciona con mayor probabilidad de cierre.
- WhatsApp es el canal dominante de atención comercial en turismo SMB LATAM.
- Herramientas globales (TravelJoy, Travefy) resuelven partes del problema; pocas integran CRM + cotización NL + portal + knowledge aislado con foco regional.
- Fuentes a actualizar el día del pitch: informes de e-commerce/turismo digital LATAM, adopción WhatsApp Business, reportes de pymes turismo (MinCIT / cámaras / estudios sectoriales).

### Segmentación

| Segmento | Necesidad principal | Encaje TravelOS |
|---|---|---|
| Agencia SMB 5–20 asesores | Ordenar WhatsApp/Excel y cerrar más | CRM + cotizador + automatizaciones |
| Agencia en crecimiento 20–50 | Visibilidad gerencial y marca blanca | Dashboard + tenancy + branding |
| Operador boutique | Experiencia viajero diferenciada | Portal + itinerarios |

### Clientes objetivo (insights)

- **Gerente:** quiere conversión, CAC y desempeño por asesor/destino.
- **Asesor:** quiere priorización de leads y cotizar sin armar PDFs a mano.
- **Viajero:** quiere ver su viaje, docs y estado sin perseguir al asesor.

### Análisis de competencia

Ver tabla en Sección 1 y detalle ampliado en Wiki [12-Competitive-Analysis](https://github.com/Jeronimo0228/travel-OS/wiki/12-Competitive-Analysis).

**Ventaja competitiva clave:** loop cerrado WhatsApp-first + CRM + cotizador + portal + IA con knowledge por `agencyId`, con marca blanca real.

---

## Sección 4. Producto o servicio

### Descripción

TravelOS AI ofrece:

1. **Espacio multi-tenant** por agencia (datos, marca, IA aislados).
2. **CRM** con leads, pipeline, tareas, asignación y filtros.
3. **Cotizador e itinerarios con IA** (Release 2).
4. **Portal viajero + KPIs** (Release 3).
5. **Calidad de ingeniería:** CI, lint, pruebas, auditoría.

### Propuesta de valor única

| Para | Beneficio |
|---|---|
| Agencia | Menos fugas de leads y menos trabajo repetitivo |
| Gerente | Visibilidad real del embudo |
| Asesor | Prioridad + cotización rápida |
| Viajero | Autoservicio del viaje |
| PO / piloto | Producto listo para demo comercial controlada |

### Ciclo de vida del producto

| Etapa | Estrategia |
|---|---|
| Introducción (ahora) | MVP académico + piloto Punto D' Partida |
| Crecimiento | Onboarding de agencias SMB, plantillas por destino |
| Madurez | Integraciones WhatsApp/pagos/GDS productivos |
| Extensión | Verticalizaciones (bodas, corporativo, MICE) |

---

## Sección 5. Implementación

### Cronograma (ciclo académico)

| Sprint | Objetivo | % MVP acordado |
|---|---|---:|
| 0 | Definición (cerrado, PO aprobado) | 0% código |
| **1** | Fundación + CRM núcleo | ~25% |
| 2 | Cotizador IA + itinerarios + knowledge | ~65% |
| 3 | Portal + BI + piloto | 100% MVP |

### Hitos clave Sprint 1 (medibles)

| Hito | Criterio de aceptación del hito |
|---|---|
| Tenant + auth | Agencia registrada, login, sesión segura |
| RBAC + marca blanca | Roles y branding básico operativos |
| CRM núcleo | Leads CRUD, pipeline, tareas, filtros, asignación |
| Calidad base | CI verde, lint, healthcheck, auditoría sensible |
| Review PO | Demo Sprint 1 con evidencias de CP |

### Recursos necesarios

| Recurso | Justificación |
|---|---|
| Equipo 5 roles | Cobertura FE/BE/QA/UX/DevSecOps |
| PO sectorial | Priorización y aceptación real |
| Stack TS (Next/Nest/Postgres) | Alineado a prototipo y rúbrica |
| GitHub (Wiki/Issues/Actions) | Única herramienta de entrega evaluable |
| Prototipo Vite existente | Acelera UI sin rediseñar |
| Infra local Docker + CI cloud | Reproducibilidad y calidad continua |

### Backlog Sprint 1 (código por roles — no incluido en este scaffolding)

Issues: **#1–#9, #11, #12** · Milestone `Sprint 1 — Fundación + CRM núcleo`  
Planes por rol: `documentation/plans/sprint-1/`
