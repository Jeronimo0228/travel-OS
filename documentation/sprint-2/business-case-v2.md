# Caso de negocio v2 — TravelOS AI (Sprint 2: secciones 4 y 5)

> Cifras en COP. Las tarifas de personal y de publicidad son **supuestos de planeación** del equipo (no cotizaciones reales) y deben validarse con el PO. Los costos de infraestructura corresponden a lo que hoy usa el piloto.

## 4. Finanzas

### 4.1 Presupuesto pre-operación (desarrollo del MVP, 16 semanas)

| Rubro | Unidad | Costo unitario | Cantidad | Subtotal |
|---|---|---|---|---|
| **Personal** — desarrollador FE/BE/QA/UX/DevSecOps (5 personas × 10 h/semana × 16 semanas) | hora | 35.000 | 800 | 28.000.000 |
| **Personal** — Scrum Master (gestión, ceremonias) | hora | 35.000 | 80 | 2.800.000 |
| **Equipos** — portátiles del equipo (depreciación 4 meses de 5 equipos de 3.500.000 a 3 años) | equipo-mes | 97.000 | 20 | 1.940.000 |
| **Licencias / activos digitales** — Vercel (equipo de la empresa), Neon Postgres (plan gratuito), Gemini API (nivel gratuito), GitHub (gratuito) | mes | 0–85.000 | 4 | 340.000 |
| **Licencias / activos digitales** — dominio y hosting cPanel (`pdpcomunica.com`, ya existente en PDP) | mes | 0 | 4 | 0 |
| **Transporte** — visitas al cliente (Punto D' Partida) para elicitación y UAT | visita | 40.000 | 6 | 240.000 |
| **Registro de propiedad intelectual** — registro de software ante la DNDA (trámite en línea) | registro | 0 | 1 | 0 |
| **Publicidad** — piezas para lanzamiento del piloto (diseño + pauta mínima en redes) | campaña | 600.000 | 1 | 600.000 |
| **Imprevistos** (10 %) | — | — | — | 3.392.000 |
| **TOTAL** | | | | **37.312.000** |

### 4.2 Presupuesto de la operación

**Costos fijos (mensuales)**

| Rubro | Valor mensual |
|---|---|
| Hosting web + API (Vercel Pro, 1 asiento) | 85.000 |
| Base de datos administrada (Neon Launch) | 80.000 |
| Dominio y DNS (prorrateo) | 10.000 |
| Soporte y mantenimiento (20 h × 35.000) | 700.000 |
| Marketing continuo | 300.000 |
| **Total fijo** | **1.175.000** |

**Costos variables (por agencia cliente / mes)**

| Rubro | Valor por agencia |
|---|---|
| Consumo de IA (≈300 cotizaciones × 4 llamadas, modelos *flash-lite* de pago) | 15.000 |
| Almacenamiento y transferencia (PDF, documentos) | 5.000 |
| Onboarding (2 h de configuración de catálogo y base de conocimiento, prorrateado a 12 meses) | 6.000 |
| Pasarela de pago (≈3 % de la suscripción) | 4.500 |
| **Total variable** | **30.500** |

Con una suscripción supuesta de 150.000/mes por agencia, el margen de contribución es 119.500 por agencia y el punto de equilibrio operativo es de ⌈1.175.000 / 119.500⌉ = **10 agencias**.

## 5. Riesgos

### 5.1 Inventario de riesgos

| Código | Riesgo | Descripción |
|---|---|---|
| R1 | Límite o caída del proveedor de IA | El plan gratuito de Gemini responde 429/503 en picos; el cotizador y el copiloto fallan. |
| R2 | Alucinación de la IA | La IA inventa ítems o precios fuera del catálogo. |
| R3 | Fuga de datos entre agencias | Un usuario ve leads o cotizaciones de otra agencia (multi-tenant). |
| R4 | Acceso indebido al portal del viajero | Un enlace filtrado expone itinerario y documentos. |
| R5 | Baja adopción por los asesores | La agencia sigue cotizando por WhatsApp/Excel. |
| R6 | Retraso del equipo | Historias que se acumulan al final del sprint (ocurrió en Sprint 2 y 3). |
| R7 | Dependencia de servicios gratuitos | Cambio de condiciones de Vercel/Neon/Gemini. |
| R8 | Ausencia de un integrante en la sustentación | Nota 0.0 individual. |

### 5.2 Matriz de probabilidad e impacto

| Probabilidad \ Impacto | Despreciable | Marginal | Moderado | Crítico | Catastrófico |
|---|---|---|---|---|---|
| Muy probable | | | R1 | | |
| Probable | | | R6 | R5 | |
| Posible | | R7 | R2 | | |
| Poco probable | | | R8 | R4 | |
| Raro | | | | | R3 |

### 5.3 Matriz RACI (gestión de riesgos)

| Actividad | PO (Juan Manuel Restrepo) | SM (Jerónimo Restrepo) | Backend (Samuel Madrid) | Frontend (Santiago Arboleda) | QA (Miguel Mercado) | UX (Juan José Palacio) |
|---|---|---|---|---|---|---|
| 1. Identificar riesgos | A | R | C | C | C | C |
| 2. Evaluar probabilidad e impacto | C | A/R | C | C | R | I |
| 3. Mitigar riesgos técnicos (R1–R4, R7) | I | A | R | R | C | I |
| 4. Mitigar riesgos de adopción (R5) | A | R | I | C | I | R |
| 5. Monitorear y reportar en ceremonias | I | A/R | I | I | R | I |

### 5.4 Estrategias de mitigación

| Riesgo | Estrategia | Responsable |
|---|---|---|
| R1 | Cadena de modelos Gemini con reintento automático y Groq como alternativa (`AI_PROVIDER`); mensaje claro al usuario; plan de pago si el piloto crece | Backend + DevSecOps |
| R2 | La IA solo devuelve IDs del catálogo; el backend valida, calcula precios y regenera una vez si la propuesta es inválida | Backend |
| R3 | Todas las consultas filtran por `agencyId`; pruebas e2e de aislamiento entre agencias en CI | Backend + QA |
| R4 | Token de 24 h guardado con hash, revocación al emitir uno nuevo, límite de intentos y auditoría | DevSecOps |
| R5 | Pruebas de usabilidad con asesores, manual en la app y base de conocimiento con el tono de la agencia | UX + PO |
| R6 | Dailies cortas con avance visible, PRs pequeños, demo integrada a mitad de sprint | SM |
| R7 | Infra declarada en el runbook; Docker Compose como plan B autoalojado | DevSecOps |
| R8 | Agenda de sustentación compartida con todo el equipo con una semana de anticipación | SM |
