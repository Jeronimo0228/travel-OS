# Sprint 3 — Escalado de la IA (cuota gratuita)

Objetivo: margen de escalabilidad usando solo niveles gratuitos. No es para venta inmediata.

## Diseno
1. **Varias llaves Gemini.** `GEMINI_API_KEYS` acepta una lista separada por comas (se suma `GEMINI_API_KEY` si existe, sin duplicados). Cada peticion empieza en una llave distinta (rotacion round-robin) para repartir la carga.
2. **Cadena de modelos por llave.** Con cada llave se recorre `GEMINI_MODEL` (lista) como antes: un 429/5xx pasa al siguiente modelo; si todos dan 429 se espera `AI_RETRY_PAUSE_MS` y se recorre una vez mas.
3. **Enfriamiento de 60 s.** Si una llave termina en 429, queda 60 s fuera de rotacion y se prueba la siguiente. Si todas estan enfriando, Gemini responde 503 sin llamar a la API.
4. **Respaldo gratuito.** Agotado Gemini, se intenta Groq (`GROQ_API_KEY`) y luego OpenRouter (`OPENROUTER_API_KEY`, modelos `:free`, configurable con `OPENROUTER_MODEL`). Solo se pasa al siguiente proveedor ante 503 (cuota/caida); un error de formato no salta de proveedor.
5. **`AI_PROVIDER` fija un proveedor y desactiva el respaldo.** Para usar la cadena completa hay que quitar esa variable en Vercel.
6. **Estado:** `GET /api/ai/status` (requiere sesion) devuelve numero de llaves, disponibles, en enfriamiento y segundos restantes, y si Groq/OpenRouter estan configurados. Nunca devuelve las llaves.

## Codigo
- `apps/api/src/ai/ai.service.ts` (`geminiKeys`, `providerChain`, `completeWithGeminiKeys`, `completeWithOpenRouter`, `status`)
- `apps/api/src/ai/ai.controller.ts` (`GET ai/status`)
- Pruebas: `apps/api/src/ai/ai.service.scaling.spec.ts` (rotacion + enfriamiento, respaldo OpenRouter, `AI_PROVIDER` sin respaldo, llaves en enfriamiento). Suite completa de la API: 64/64.

## Limites
El enfriamiento vive en memoria de cada instancia serverless; otra instancia puede reintentar una llave enfriada. Suficiente para la carga actual; para mas, mover el estado a Redis.

## Despliegue (no hecho)
Agregar `GEMINI_API_KEYS`, opcionalmente `OPENROUTER_API_KEY`, y quitar `AI_PROVIDER` en Vercel; luego fusionar la rama.
