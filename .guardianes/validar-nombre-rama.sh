#!/usr/bin/env bash
#
# validar-nombre-rama.sh - guardian del nombre de rama (marco Aybar, 3.1).
#
#   validar-nombre-rama.sh <nombre>     valida un nombre (hook o CI)
#   validar-nombre-rama.sh              valida la rama actual
#
# La etapa de estructura va primera en el pipeline porque cuesta segundos y
# evita gastar minutos de construccion en un cambio que ya incumple
# (datos/ejemplos.json, verificaciones_que_bloquean).

set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$AQUI/guardianes.conf"
RAIZ_REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
[ -f "$RAIZ_REPO/.aybar-guardianes.conf" ] && . "$RAIZ_REPO/.aybar-guardianes.conf"

rama="${1:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)}"
[ -n "$rama" ] || { echo "No hay rama que validar." >&2; exit 1; }

# Las ramas de larga vida no siguen el patron de trabajo: son las protegidas
# y develop. Se validan por pertenencia, no por forma.
for protegida in $RAMAS_PROTEGIDAS; do
  case "$rama" in
    $protegida) exit 0 ;;
  esac
done

if printf '%s' "$rama" | grep -qE "$PATRON_RAMA_TRABAJO"; then
  exit 0
fi

cat >&2 <<FIN
[x] La rama '${rama}' no sigue la forma del marco (3.1).
    Forma:   feature|bugfix|hotfix/<ID>-<slug>
    Ejemplo: feature/AYB-1042-reserva-de-lote
    El ID es el ticket del backlog; el slug, minusculas y guiones.
FIN
exit 1
