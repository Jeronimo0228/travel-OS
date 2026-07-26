# Product Backlog — TravelOS AI
> Mínimo 20 historias en ≥3 épicas. **Total: 24 HU / 4 épicas.**

Plataforma: https://github.com/Jeronimo0228/travel-OS/issues

## Épicas

| ID | Épica |
|---|---|
| E1 | Fundación multi-tenant y plataforma |
| E2 | CRM Inteligente |
| E3 | Cotizador e Itinerarios IA |
| E4 | Portal del Viajero + Inteligencia Gerencial |

## Historias de usuario

| ID | Épica | Sprint | Pts | Historia | Responsable sugerido |
|---|---|---|---:|---|---|
| HU-01 | E1 | 1 | 5 | **Registro de agencia (tenant)** — Como dueño de agencia, quiero registrar mi agencia en TravelOS, para operar en un espacio aislado multi-tenant. | Samuel Madrid Ossa |
| HU-02 | E1 | 1 | 5 | **Login y sesión segura** — Como usuario de agencia, quiero autenticarme de forma segura, para acceder a mis módulos autorizados. | Samuel Madrid Ossa |
| HU-03 | E1 | 1 | 5 | **RBAC (gerente, asesor, admin)** — Como admin, quiero asignar roles, para controlar permisos por función. | Samuel Madrid Ossa |
| HU-04 | E1 | 1 | 3 | **Branding básico de marca blanca** — Como gerente, quiero cargar logo y color primario, para ver la app con la identidad de mi agencia. | Santiago Arboleda Giraldo |
| HU-05 | E1 | 1 | 3 | **Auditoría de acciones sensibles** — Como DevSecOps, quiero registrar auditoría de login y cambios de rol, para trazabilidad de seguridad. | Jerónimo Restrepo Ángel |
| HU-06 | E1 | 1 | 3 | **Healthcheck y CI base** — Como DevSecOps, quiero pipeline CI (lint/test/build) y healthcheck, para asegurar calidad desde Sprint 1. | Jerónimo Restrepo Ángel |
| HU-07 | E2 | 1 | 5 | **Crear y editar leads** — Como asesor, quiero crear y editar leads, para centralizar prospectos. | Samuel Madrid Ossa |
| HU-08 | E2 | 1 | 5 | **Pipeline visual por stages** — Como asesor, quiero mover leads entre stages del embudo, para ver el estado de ventas. | Santiago Arboleda Giraldo |
| HU-09 | E2 | 1 | 3 | **Tareas y recordatorios** — Como asesor, quiero crear tareas/recordatorios en un lead, para no perder seguimientos. | Santiago Arboleda Giraldo |
| HU-10 | E2 | 2 | 8 | **Copiloto IA de priorización** — Como asesor, quiero ver qué lead contactar ahora (score IA), para responder primero a los de mayor probabilidad. | Samuel Madrid Ossa |
| HU-11 | E2 | 1 | 3 | **Listado y filtros de clientes** — Como asesor, quiero filtrar leads por stage/destino/asesor, para organizar mi trabajo diario. | Santiago Arboleda Giraldo |
| HU-12 | E2 | 1 | 2 | **Asignación de lead a asesor** — Como gerente, quiero asignar leads a asesores, para distribuir la carga comercial. | Samuel Madrid Ossa |
| HU-13 | E3 | 2 | 8 | **Cotización por lenguaje natural** — Como asesor, quiero describir un viaje en texto natural, para obtener opciones generadas por IA. | Samuel Madrid Ossa |
| HU-14 | E3 | 2 | 5 | **Opciones de cotización comparables** — Como asesor, quiero ver 2–3 opciones con precio estimado, para presentar alternativas al cliente. | Santiago Arboleda Giraldo |
| HU-15 | E3 | 2 | 5 | **Exportar cotización a PDF** — Como asesor, quiero exportar la cotización a PDF, para enviarla por WhatsApp/correo. | Samuel Madrid Ossa |
| HU-16 | E3 | 2 | 8 | **Constructor de itinerario por días** — Como asesor, quiero armar un itinerario día a día, para detallar la experiencia del viaje. | Santiago Arboleda Giraldo |
| HU-17 | E3 | 2 | 3 | **Vincular cotización a lead** — Como asesor, quiero asociar cotizaciones a un lead, para mantener trazabilidad comercial. | Samuel Madrid Ossa |
| HU-18 | E3 | 2 | 5 | **Catálogo seed de hoteles/actividades** — Como sistema, quiero un catálogo inicial mock, para cotizar sin GDS real en el piloto. | Samuel Madrid Ossa |
| HU-19 | E4 | 3 | 5 | **Portal: ver itinerario del viaje** — Como viajero, quiero abrir mi portal y ver el itinerario, para consultar mi viaje desde el celular. | Santiago Arboleda Giraldo |
| HU-20 | E4 | 3 | 5 | **Portal: documentos del viaje** — Como viajero, quiero ver documentos asociados (pasaporte/voucher), para tener todo centralizado. | Santiago Arboleda Giraldo |
| HU-21 | E4 | 3 | 5 | **Portal: chat básico con agencia** — Como viajero, quiero chatear con la agencia, para resolver dudas del viaje. | Samuel Madrid Ossa |
| HU-22 | E4 | 3 | 8 | **Dashboard KPIs gerenciales** — Como gerente, quiero ver ventas, conversión y desempeño por asesor/destino, para tomar decisiones. | Santiago Arboleda Giraldo |
| HU-23 | E4 | 3 | 5 | **Automatización de recordatorio de follow-up** — Como gerente, quiero que el sistema recuerde follow-ups vencidos, para no perder leads fríos. | Samuel Madrid Ossa |
| HU-24 | E4 | 2 | 5 | **Base de conocimiento de la agencia para IA** — Como admin, quiero cargar políticas/tono/FAQs de mi agencia, para que la IA responda como nosotros. | Jerónimo Restrepo Ángel |

## Criterios transversales (DoD)

- AC cumplidos + casos de prueba (QA)
- Código en PR revisado + CI verde
- Aislamiento tenant verificado cuando aplique
- Documentación Wiki/Issue actualizada
