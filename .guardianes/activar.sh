#!/usr/bin/env bash
#
# activar.sh - enciende los guardianes del marco en ESTE clon.
#
#   ./.guardianes/activar.sh            activa
#   ./.guardianes/activar.sh --quitar   desactiva
#
# Por que existe: core.hooksPath es configuracion local del clon, no viaja
# con el repositorio. `ayb new project` lo deja activado en el clon que
# genera; cada clon posterior lo activa con este script, una sola vez.
# Para adoptar los guardianes en un repositorio ya existente: copiar el
# directorio .guardianes/ a su raiz, commitearlo y ejecutar este script.

set -euo pipefail

RAIZ="$(git rev-parse --show-toplevel 2>/dev/null)" \
  || { echo "Ejecutalo dentro de un repositorio git." >&2; exit 1; }

if [ "${1:-}" = "--quitar" ]; then
  actual="$(git -C "$RAIZ" config --local core.hooksPath 2>/dev/null || true)"
  if [ "$actual" = ".guardianes/hooks" ]; then
    git -C "$RAIZ" config --local --unset core.hooksPath
    echo "[ok] Guardianes desactivados en este clon."
  else
    echo "core.hooksPath no apunta a los guardianes (vale: '${actual:-vacio}'). Nada que quitar."
  fi
  exit 0
fi

actual="$(git -C "$RAIZ" config --local core.hooksPath 2>/dev/null || true)"
if [ -n "$actual" ] && [ "$actual" != ".guardianes/hooks" ]; then
  cat >&2 <<FIN
[x] Este clon ya tiene core.hooksPath='$actual'.
    No lo piso: integra los guardianes en tus hooks o retira esa
    configuracion antes de activar.
FIN
  exit 1
fi

chmod +x "$RAIZ/.guardianes/"*.sh "$RAIZ/.guardianes/hooks/"* "$RAIZ/.guardianes/agente/"*.sh 2>/dev/null || true
git -C "$RAIZ" config --local core.hooksPath .guardianes/hooks
"$RAIZ/.guardianes/proteger-gitignore.sh"
cat <<FIN
[ok] Guardianes activos en este clon.
     - pre-commit: en feature/<TICKET>-*, el codigo espera al G4 (y al G3, si
                   existe) approved en origin/main: el paquete Definir (G4)
     - commit-msg: forma tipo(alcance): asunto + ticket (marco 3.2)
     - pre-push:   corta push a protegidas y valida nombres de rama (3.1, 3.4)
     - .gitignore: en solo lectura; post-checkout, post-merge y post-rewrite
                   lo vuelven a proteger tras pull, cambio de rama o rebase
     Agente de IA: .claude/settings.json cablea .guardianes/agente/ como hooks
     de Claude Code; no dependen de este script, pero el agente no commitea
     si estos guardianes de git estan apagados.
     Config: crea .aybar-guardianes.conf en la raiz para sobreescribir los
     valores por defecto de .guardianes/guardianes.conf.
FIN
