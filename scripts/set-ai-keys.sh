#!/usr/bin/env bash
# Carga las llaves de IA de Travel OS en Vercel (proyecto travelos-api, producción).
# Las llaves se piden sin mostrarse en pantalla, no quedan en el historial ni en archivos,
# y viajan por stdin a `vercel env add` (Vercel las guarda cifradas).
#
# Uso (desde la carpeta enlazada al proyecto travelos-api):
#   ./scripts/set-ai-keys.sh
# Deja en blanco cualquier llave que no tengas; el pool compartido sirve de reserva.
set -euo pipefail

TARGET=production
command -v vercel >/dev/null || { echo "Falta la CLI de Vercel (npm i -g vercel)"; exit 1; }
if [[ ! -f .vercel/project.json ]] || ! grep -q '"projectName":"travelos-api"\|travelos-api' .vercel/project.json; then
  echo "Ejecuta este script en la carpeta enlazada al proyecto travelos-api (vercel link)."; exit 1
fi

read_keys() { # $1 = nombre legible ; imprime la lista separada por comas
  local label="$1" list="" key i=1
  while true; do
    read -r -s -p "  ${label} llave #${i} (Enter para terminar): " key; echo >&2
    [[ -z "$key" ]] && break
    list="${list:+$list,}${key}"; i=$((i+1))
  done
  printf '%s' "$list"
}

set_var() { # $1 = variable ; $2 = valor
  [[ -z "$2" ]] && { echo "  · $1 sin cambios (vacía)"; return; }
  vercel env rm "$1" "$TARGET" -y >/dev/null 2>&1 || true
  printf '%s' "$2" | vercel env add "$1" "$TARGET" >/dev/null
  echo "  ✓ $1 guardada ($(tr ',' '\n' <<<"$2" | wc -l | tr -d ' ') llave(s))"
}

echo "Gemini (https://aistudio.google.com/apikey). Usa proyectos de Google distintos para que la cuota no se comparta."
for pool in QUOTE COPILOT ASSISTANT; do
  echo "Pool del agente ${pool}:"
  set_var "GEMINI_API_KEYS_${pool}" "$(read_keys "Gemini ${pool}")"
done
echo "Pool compartido de reserva (todos los agentes):"
set_var GEMINI_API_KEYS "$(read_keys 'Gemini compartida')"
echo "Respaldo Groq (https://console.groq.com/keys):"
set_var GROQ_API_KEYS "$(read_keys 'Groq')"
echo "Respaldo OpenRouter (https://openrouter.ai/keys):"
set_var OPENROUTER_API_KEYS "$(read_keys 'OpenRouter')"

read -r -p "¿Quitar AI_PROVIDER para activar el respaldo automático entre proveedores? [s/N] " ans
if [[ "$ans" =~ ^[sS]$ ]]; then
  vercel env rm AI_PROVIDER "$TARGET" -y >/dev/null 2>&1 && echo "  ✓ AI_PROVIDER eliminada" || echo "  · AI_PROVIDER no existía"
fi
echo "Listo. Publica de nuevo la API para que tome las llaves: vercel deploy --prod"
