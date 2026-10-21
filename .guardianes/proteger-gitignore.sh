#!/usr/bin/env bash
#
# proteger-gitignore.sh - deja el .gitignore en solo lectura.
#
# El .gitignore es lo que impide que un .env o un target/ acaben en el
# historial: no se toca a mano. git no versiona ese permiso y lo pierde al
# reescribir el fichero (pull, cambio de rama, rebase), por eso lo vuelven a
# aplicar los hooks post-checkout, post-merge y post-rewrite, y aybar install.
#
# Cambiarlo a proposito (con su PR y su revision):
#   chmod u+w .gitignore && <editar> && git commit
set -euo pipefail
RAIZ="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
[ -f "$RAIZ/.gitignore" ] && chmod a-w "$RAIZ/.gitignore" 2>/dev/null
exit 0
