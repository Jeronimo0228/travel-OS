#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JSON="$ROOT/backlog/github-bootstrap.json"
REPO="${REPO:-Jeronimo0228/travel-OS}"
GH="${GH:-/usr/bin/gh}"

if ! "$GH" auth status -h github.com >/dev/null 2>&1; then
  echo "ERROR: gh no autenticado. Ejecuta: /usr/bin/gh auth login -h github.com"
  exit 1
fi

command -v jq >/dev/null || { echo "jq requerido"; exit 1; }

echo ">> Labels"
jq -c '.labels[]' "$JSON" | while read -r row; do
  name=$(echo "$row" | jq -r .name)
  color=$(echo "$row" | jq -r .color)
  desc=$(echo "$row" | jq -r .description)
  "$GH" label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null \
    || "$GH" label edit "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null \
    || true
done

echo ">> Milestones"
jq -c '.milestones[]' "$JSON" | while read -r row; do
  title=$(echo "$row" | jq -r .title)
  desc=$(echo "$row" | jq -r .description)
  due=$(echo "$row" | jq -r .due_on)
  state=$(echo "$row" | jq -r '.state // "open"')
  if "$GH" api "repos/$REPO/milestones" --jq '.[].title' | grep -Fxq "$title"; then
    echo "milestone exists: $title"
  else
    "$GH" api "repos/$REPO/milestones" -f title="$title" -f description="$desc" -f due_on="$due" >/dev/null
    echo "created milestone: $title"
  fi
  if [ "$state" = "closed" ]; then
    num=$("$GH" api "repos/$REPO/milestones" --jq ".[] | select(.title==\"$title\") | .number")
    "$GH" api -X PATCH "repos/$REPO/milestones/$num" -f state=closed >/dev/null || true
  fi
done

echo ">> Issues"
jq -c '.issues[]' "$JSON" | while read -r row; do
  title=$(echo "$row" | jq -r .title)
  if "$GH" issue list --repo "$REPO" --state all --limit 200 --json title --jq '.[].title' | grep -Fxq "$title"; then
    echo "skip existing: $title"
    continue
  fi
  body=$(echo "$row" | jq -r .body)
  milestone=$(echo "$row" | jq -r .milestone)
  labels=$(echo "$row" | jq -r '.labels | join(",")')
  "$GH" issue create --repo "$REPO" --title "$title" --body "$body" --label "$labels" --milestone "$milestone" >/dev/null
  echo "created: $title"
done

echo "OK bootstrap $REPO"
