#!/usr/bin/env bash
#
# validar-mensaje-commit.sh - guardian del formato de commit (marco Aybar, 3.2).
#
#   validar-mensaje-commit.sh <fichero>        un mensaje (hook commit-msg)
#   validar-mensaje-commit.sh --rango A..B     commits de un rango (etapa de CI)
#   echo "mensaje" | validar-mensaje-commit.sh un mensaje por stdin
#
# QUE COMPRUEBA (verificable por maquina):
#   1. Forma `tipo(alcance): asunto` con tipo de la lista cerrada.
#   2. Alcance en minusculas y guiones, si existe.
#   3. Ticket del backlog en el asunto o en el cuerpo.
#   4. En --rango, ademas: autor que no sea de tipo bot (3.3).
#
# QUE NO COMPRUEBA (criterio humano, lo mira el revisor en G5):
#   - Que el asunto este en ingles y en imperativo.
#   - Que el asunto describa el cambio y no los ficheros tocados.
# Un guardian que intenta adivinar idioma bloquea commits legitimos; este
# valida estructura y deja el idioma a la revision, que para eso existe.
#
# Se exceptuan: commits de merge, revert, fixup! y squash! (existen para
# desaparecer o ya arrastran la trazabilidad del commit original).

set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Defaults del marco; luego el override del repositorio, si existe.
# shellcheck source=guardianes.conf
. "$AQUI/guardianes.conf"
RAIZ_REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
[ -f "$RAIZ_REPO/.aybar-guardianes.conf" ] && . "$RAIZ_REPO/.aybar-guardianes.conf"

TIPOS_RE="$(printf '%s' "$TIPOS_PERMITIDOS" | tr ' ' '|')"

fallo=0
avisos=0

decir()  { printf '%s\n' "$*" >&2; }

# ---------------------------------------------------------------------------
# Validacion de UN mensaje. Devuelve 0 si pasa; imprime el motivo si no.
# El mensaje de error enseña la forma valida: un guardian que solo dice "no"
# entrena a la gente a saltarselo.
# ---------------------------------------------------------------------------
validar_mensaje() {
  mensaje="$1"
  etiqueta="$2"   # que se imprime al señalar el fallo (sha corto o "el mensaje")

  # Lineas de comentario fuera (el editor de git las añade).
  mensaje="$(printf '%s\n' "$mensaje" | grep -v '^#' || true)"
  asunto="$(printf '%s\n' "$mensaje" | head -1)"

  [ -z "$asunto" ] && { decir "[x] $etiqueta: mensaje vacio."; return 1; }

  # Excepciones estructurales.
  case "$asunto" in
    Merge\ *|Revert\ \"*|fixup!\ *|squash!\ *) return 0 ;;
  esac

  local_fallo=0

  # 1. Forma tipo(alcance): asunto  (alcance opcional, ! de breaking opcional).
  if ! printf '%s' "$asunto" | grep -qE "^(${TIPOS_RE})(\([a-z0-9][a-z0-9-]*\))?!?: .+"; then
    decir "[x] $etiqueta: el asunto no tiene la forma del marco (3.2)."
    decir "    Forma:   tipo(alcance): asunto        tipos: ${TIPOS_PERMITIDOS}"
    decir "    Ejemplo: feat(ventas): add lot reservation to the sales portal (AYB-1042)"
    decir "    Leido:   ${asunto}"
    local_fallo=1
  fi

  # 2. Ticket en asunto o cuerpo.
  if ! printf '%s\n' "$mensaje" | grep -qE "$PATRON_TICKET"; then
    decir "[x] $etiqueta: sin identificador de ticket (${PATRON_TICKET})."
    decir "    Sin ticket el cambio no se puede atribuir a un item del backlog ni"
    decir "    derivar el changelog (3.2). Va en el asunto o en el cuerpo."
    local_fallo=1
  fi

  # 3. Largo del asunto: aviso, no bloqueo (el marco no fija el numero).
  if [ "${#asunto}" -gt "$LARGO_ASUNTO_AVISO" ]; then
    decir "[!] $etiqueta: asunto de ${#asunto} caracteres (recomendado <= ${LARGO_ASUNTO_AVISO})."
    decir "    Si la primera linea va justa, el ticket puede vivir en el cuerpo."
    avisos=$((avisos + 1))
  fi

  return "$local_fallo"
}

# ---------------------------------------------------------------------------
# Modos de entrada.
# ---------------------------------------------------------------------------
if [ "${1:-}" = "--rango" ]; then
  rango="${2:?Uso: validar-mensaje-commit.sh --rango A..B}"
  total=0
  # Los merges quedan fuera del rango: existen para unir, no para describir.
  for sha in $(git rev-list --no-merges "$rango"); do
    total=$((total + 1))
    corto="$(git log -1 --format=%h "$sha")"
    autor="$(git log -1 --format='%an <%ae>' "$sha")"
    if printf '%s' "$autor" | grep -qE "$PATRON_AUTOR_BOT"; then
      decir "[x] ${corto}: autor de tipo bot (${autor})."
      decir "    Todo commit de rama protegida tiene autor humano identificable (3.3)."
      fallo=1
    fi
    validar_mensaje "$(git log -1 --format=%B "$sha")" "$corto" || fallo=1
  done
  if [ "$fallo" -eq 0 ]; then
    decir "[ok] ${total} commit(s) del rango ${rango} cumplen el marco (avisos: ${avisos})."
  fi
  exit "$fallo"
fi

if [ -n "${1:-}" ] && [ -f "$1" ]; then
  contenido="$(cat "$1")"
else
  contenido="$(cat)"
fi

if validar_mensaje "$contenido" "el mensaje"; then
  exit 0
else
  decir ""
  decir "El guardian valida estructura; el idioma y el imperativo los mira el"
  decir "revisor en G5. Referencia: capitulos/03-control-de-versiones.md (3.2)."
  exit 1
fi
