# Caso de negocio — Sección 6: Análisis de viabilidad y conclusión (Sprint 3)

> Se basa en las secciones 4 y 5 (`documentation/sprint-2/business-case-v2.md`). Supuestos marcados para validar con el PO.

## 6.1 Viabilidad técnica

El MVP está en producción en infraestructura administrada de PDP (Vercel + Neon, DNS en cPanel): https://travel-os.pdpcomunica.com. Cubre CRM, cotizador con IA sobre catálogo propio, PDF, itinerario, portal del viajero, KPIs y recordatorios, con CI (lint, unitarias, e2e, build) en cada PR. Riesgo técnico principal: límites del plan gratuito de IA, mitigado con cadena de modelos y reintentos. **Viable.**

## 6.2 Viabilidad operativa

Una agencia se configura en menos de una hora: catálogo, marca y base de conocimiento. El portal no exige cuenta al viajero. Pendiente: medir la adopción con las pruebas de usabilidad (Sprint 3, en ejecución). **Viable con validación pendiente.**

## 6.3 Viabilidad económica

| Indicador | Valor (supuestos) |
|---|---|
| Inversión pre-operación | 37.312.000 COP |
| Costo fijo mensual | 1.175.000 COP |
| Margen de contribución por agencia | 119.500 COP/mes (suscripción supuesta 150.000) |
| Punto de equilibrio operativo | 10 agencias |
| Recuperación de la inversión con 40 agencias | 37.312.000 / (40 × 119.500 − 1.175.000) ≈ 10,4 meses |

El valor para la agencia: si una cotización pasa de ~30 min a ~2 min y un asesor hace 10 al día, libera ≈4,5 h diarias (supuesto a medir en el piloto).

## 6.4 Viabilidad legal

Tratamiento de datos personales bajo la Ley 1581 de 2012: datos por agencia aislados, auditoría de accesos, enlaces del portal con vencimiento. Pendiente: política de privacidad publicada y contrato de encargo de datos con cada agencia.

## 6.5 Conclusión

TravelOS es técnicamente viable y ya opera como piloto con Punto D' Partida. La viabilidad económica depende de llegar a 10 agencias pagando; el siguiente paso es ejecutar las pruebas de usabilidad, cerrar el UAT del PO y validar la disposición a pagar con 3–5 agencias de Medellín antes de invertir en pauta.
