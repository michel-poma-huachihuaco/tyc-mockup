#!/usr/bin/env bash
#
# comun.sh - piezas compartidas de los guardianes de agente de IA. No es un
# hook: lo cargan (source) guardianes.sh y guardian-*.sh de esta carpeta.
#
# PROTOCOLO (hooks PreToolUse de Claude Code, cableados en
# .claude/settings.json): el hook recibe por stdin un JSON con tool_name y
# tool_input. exit 0 deja pasar; exit 2 bloquea y el agente lee stderr como
# motivo. OJO: cualquier OTRO codigo de salida es un "error no bloqueante" y
# la herramienta se ejecuta igual. Un guardian que revienta por dentro y sale
# con 1 es un guardian que deja pasar todo. Por eso aqui un fallo interno
# sale con 2 y lo dice (falla cerrado).
#
# Lee el JSON con jq o, si no hay jq, con python3. Sin ninguno de los dos
# bloquea: no poder leer lo que el agente va a hacer no es permiso para
# hacerlo. AYBAR_GUARDIANES_JSON=jq|python3 fuerza uno (lo usan las evals).

AQUI_AGENTE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARDIANES_DIR="$(cd "$AQUI_AGENTE/.." && pwd)"

fallo_interno() {
  printf 'GUARDIAN AYBAR: fallo interno de %s (linea %s).\n' "${0##*/}" "$1" >&2
  printf '  Bloqueo por las dudas: un guardian que falla no puede dejar pasar.\n' >&2
  printf '  Revisa .guardianes/agente/ (bash -n, jq o python3 instalados).\n' >&2
  exit 2
}

bloquear() { # etiqueta motivo...
  local etiqueta="$1"
  shift
  printf 'GUARDIAN AYBAR (%s): %s\n' "$etiqueta" "$*" >&2
  exit 2
}

# Sin tuberias a proposito: con pipefail, `printf | grep -q` puede dar
# SIGPIPE en entradas grandes y el `if` leeria "no coincide". Here-strings.
contiene()   { grep -qE  -- "$1" <<< "$2"; }
contiene_i() { grep -qiE -- "$1" <<< "$2"; }

# Carga entrada, raiz y configuracion. Deja ENTRADA y RAIZ.
guardian_inicio() {
  trap 'fallo_interno "$LINENO"' ERR
  ENTRADA="$(cat)"
  RAIZ="${CLAUDE_PROJECT_DIR:-}"
  if [ -z "$RAIZ" ]; then
    RAIZ="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
  fi
  RAIZ="${RAIZ//\\//}"
  RAIZ="${RAIZ%/}"
  # shellcheck source=../guardianes.conf
  . "$GUARDIANES_DIR/guardianes.conf"
  if [ -f "$RAIZ/.aybar-guardianes.conf" ]; then
    # shellcheck disable=SC1091
    . "$RAIZ/.aybar-guardianes.conf"
  fi
}

# Lector del JSON del hook en python3, para maquinas sin jq.
PY_CAMPO='
import json, sys
d = json.load(sys.stdin)
t = d.get("tool_input") or {}
c = sys.argv[1]
if c == "comando":
    v = t.get("command") or ""
elif c == "ruta":
    v = t.get("file_path") or t.get("notebook_path") or ""
else:
    p = [t.get("content"), t.get("new_string")]
    p += [e.get("new_string") for e in (t.get("edits") or []) if isinstance(e, dict)]
    v = "\n".join(x for x in p if isinstance(x, str))
sys.stdout.write(v)
'

# json_campo comando|ruta|contenido
#   comando   tool_input.command (Bash)
#   ruta      tool_input.file_path (Write, Edit, MultiEdit)
#   contenido lo que se va a escribir: content (Write), new_string (Edit) y
#             cada edits[].new_string (MultiEdit), unidos por saltos de linea
json_campo() {
  local motor="${AYBAR_GUARDIANES_JSON:-}"
  if [ -z "$motor" ]; then
    if command -v jq >/dev/null 2>&1; then
      motor=jq
    elif command -v python3 >/dev/null 2>&1; then
      motor=python3
    else
      printf 'GUARDIAN AYBAR: no encuentro jq ni python3 para leer la entrada del hook.\n' >&2
      printf '  Sin leerla no se puede vigilar: instala jq (recomendado) o python3.\n' >&2
      exit 2
    fi
  fi
  case "$motor:$1" in
    jq:comando)   jq -r '.tool_input.command // empty' <<< "$ENTRADA" ;;
    jq:ruta)      jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<< "$ENTRADA" ;;
    jq:contenido) jq -r '[.tool_input.content, .tool_input.new_string,
                          (.tool_input.edits // [] | .[] | .new_string?)]
                         | map(select(type == "string")) | join("\n")' <<< "$ENTRADA" ;;
    python3:*)    python3 -c "$PY_CAMPO" "$1" <<< "$ENTRADA" ;;
    *)            printf 'GUARDIAN AYBAR: lector JSON desconocido: %s\n' "$motor" >&2; exit 2 ;;
  esac
}

# Ruta relativa a la raiz del repositorio; vacia si cae fuera de el.
ruta_relativa() {
  local r="${1//\\//}"
  case "$r" in
    "$RAIZ"/*) printf '%s' "${r#"$RAIZ"/}" ;;
    /*|[A-Za-z]:/*) printf '' ;;
    ./*) printf '%s' "${r#./}" ;;
    *) printf '%s' "$r" ;;
  esac
}
