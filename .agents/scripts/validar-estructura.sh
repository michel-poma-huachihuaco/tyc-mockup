#!/usr/bin/env bash
#
# validar-estructura.sh - etapa de ESTRUCTURA del pipeline (la primera, porque
# cuesta segundos y evita gastar minutos de build en un cambio que ya
# incumple): nombre de rama + formato de cada commit del rango.
#
#   .agents/scripts/validar-estructura.sh [base]   base por defecto: origin/main
set -euo pipefail
RAIZ="$(git rev-parse --show-toplevel)"
BASE="${1:-origin/main}"
git -C "$RAIZ" rev-parse --verify -q "$BASE" >/dev/null \
  || { echo "[!] No existe la base '$BASE'; valido solo la rama y el ultimo commit." >&2; BASE=""; }

"$RAIZ/.guardianes/validar-nombre-rama.sh"
if [ -n "$BASE" ]; then
  "$RAIZ/.guardianes/validar-mensaje-commit.sh" --rango "$BASE..HEAD"
else
  git -C "$RAIZ" log -1 --format=%B | "$RAIZ/.guardianes/validar-mensaje-commit.sh"
fi
echo "[ok] Estructura conforme (rama y commits)."
