# Casos de prueba funcionales — Sprint 2

Entorno: https://travel-os.pdpcomunica.com · usuario `gerente@demo.travelos.local` · agencia `demo-agencia`.
Ejecución en vivo del 2026-10-20 (COT) contra producción; columna «Automatizada» indica la prueba que cubre el mismo criterio.

| ID | HU | Precondición | Pasos | Resultado esperado | Resultado | Automatizada |
|---|---|---|---|---|---|---|
| CP2-01 | HU-13 | Login | Cotizador → «Pareja a Cartagena por 4 noches, hotel frente al mar» → Enviar | Propuesta con destino Cartagena en < 60 s | ✅ 201 en 4,4 s | quotes.service.spec |
| CP2-02 | HU-13 | Login | Pedido a destino fuera del catálogo (p. ej. «Tokio») | Mensaje «revisa que el destino esté en el catálogo», sin inventar precios | ✅ 400 controlado | quotes.service.spec |
| CP2-03 | HU-14 | CP2-01 | Revisar alternativas | 2–3 opciones con total en COP y «Más económica» | ✅ | quotes.service.spec |
| CP2-04 | HU-15 | CP2-01 | «Generar PDF» | Estado pasa a listo y se descarga | ✅ (modo inline) | quote-pdf spec |
| CP2-05 | HU-17 | CP2-01 | Selector «Vincular a un lead» → Ana Martínez | La cotización queda vinculada | ✅ | quotes.service.spec |
| CP2-06 | HU-10 | Leads demo | CRM → panel Co-Piloto | Lista ordenada con razón por lead | ✅ 200 en 1,7 s | lead-prioritization spec |
| CP2-07 | HU-16 | Reserva demo | Viajes → Cartagena → agregar actividad día 2 | Aparece en el itinerario | ✅ | portal.e2e |
| CP2-08 | HU-18 | Seed | Cotizar Medellín, Santa Marta, San Andrés, Eje Cafetero, Cusco, Punta Cana | Todas con alternativas | ✅ 5/6 a la primera; 1 reintento por límite de la IA | catalog.service.spec |
| CP2-09 | HU-24 | Login gerente | Base IA → tono y política «30 % de anticipo» → Guardar | Mensaje «guardada»; registro KNOWLEDGE_UPDATE | ✅ | knowledge.e2e |
| CP2-10 | HU-24 | CP2-09 | Nueva cotización | Títulos/resumen respetan el tono configurado | ✅ (cualitativo) | quotes.service.spec (prompt) |
