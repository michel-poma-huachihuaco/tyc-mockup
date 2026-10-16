#!/usr/bin/env bash
#
# guardian-gate-listo.sh - G4 antes de construir, a nivel de agente.
# Hook PreToolUse de Claude Code sobre Write|Edit|MultiEdit.
#
# En una rama feature/<TICKET>-<slug>, si el archivo destino es codigo
# (PATRONES_CODIGO: backend y, si lo hay, frontend/), el agente no lo escribe
# hasta que el paquete Definir del ticket este aprobado en origin/main: G4
# approved; G3 approved si existe; y G2 approved si existe o si la feature
# tiene alguna HU con pantalla (ui: true).
# Escribir el paquete (docs/gates/...) si puede: es lo que lo abre.
#
# Con sello de origen documental (docs/.origen-documental.json) la evidencia
# de lo que el sello cita sale de la fuente documental (ADR-007), con la misma
# regla que aybar paquete validar: lo resuelve el validador de abajo.
#
# No decide nada por su cuenta: delega en ../validar-gate-listo.sh, el mismo
# validador del pre-commit y de la CI, y traduce su "no" (exit 1) al
# protocolo del hook (exit 2). Lo que cubre esta capa es el momento: corta
# antes de escribir, no al commitear. El agente que escribe codigo por Bash
# (sed, cat >) no pasa por aqui; lo para el pre-commit y, siempre, la CI.
#
# Ademas, el agente no aprueba gates: en docs/gates/<TICKET>/G<n>.md deja
# estado draft o review, nunca approved (plantilla .agents/templates/gate.md).
# Ese cambio lo hace una persona en el PR que revisa el CODEOWNER del rol.
#
# Exit 0 deja pasar; exit 2 bloquea (stderr es el motivo).
set -Eeuo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=comun.sh
. "$AQUI/comun.sh"
guardian_inicio

RUTA="$(json_campo ruta)"
[ -n "$RUTA" ] || exit 0
REL="$(ruta_relativa "$RUTA")"
[ -n "$REL" ] || exit 0   # fuera del repositorio: no es asunto de este gate

case "$REL" in
  docs/gates/*/G*.md)
    if contiene "^estado[[:space:]]*:[[:space:]]*[\"']?approved" "$(json_campo contenido)"; then
      bloquear "G0-G9, contrato de IA" "el agente no aprueba gates: deja $REL en draft o review. Lo pasa a approved una persona, en el PR que revisa el CODEOWNER del rol (la IA propone, el humano aprueba)."
    fi
    exit 0 ;;
esac

cd "$RAIZ"
if ! salida="$(bash "$GUARDIANES_DIR/validar-gate-listo.sh" --archivos "$REL" 2>&1)"; then
  printf 'GUARDIAN AYBAR (G4, gate listo): no escribo %s todavia.\n%s\n' "$REL" "$salida" >&2
  printf '\nLa IA propone, el humano aprueba: el gate lo abre el PR del paquete aprobado\n' >&2
  printf 'por su CODEOWNER, no el agente. Puedes ayudar a escribir docs/gates/ mientras.\n' >&2
  exit 2
fi
exit 0
