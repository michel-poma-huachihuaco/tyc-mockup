#!/usr/bin/env bash
#
# validar-evidencia-gates.sh - forma de los archivos de gate que trae un PR
# (marco Aybar; docs/especificaciones/evidencia-de-gates.md del SDK).
#
# Para cada docs/gates/<TICKET>/G<n>.md que el cambio agrega o modifica:
#   - la ruta tiene la forma del marco (ticket del backlog, n de 0 a 9);
#   - el frontmatter YAML abre y cierra con '---' y trae los campos
#     obligatorios: id, tipo, titulo, estado, producto, version, owner,
#     aprobadores, fecha, relacionados, tags;
#   - id es GATE-<TICKET>-G<n> (coincide con la ruta) y tipo es gate;
#   - estado es uno de draft, review, approved, deprecated, superseded;
#   - si estado es approved: aprobadores no esta vacio y, en G2, G7 y G8
#     (gates de dos roles), declara al menos dos firmas.
#
#   validar-evidencia-gates.sh [--informar] --rango A...B   CI: el PR contra su base
#   validar-evidencia-gates.sh [--informar] --archivos f1 [f2 ...]
#                                   archivos sueltos; --archivos va AL FINAL
#
# Exit 0 pasa; 1 bloquea (el motivo va a stderr).
#
# QUE NO COMPRUEBA, Y POR QUE: que el PR lo aprobara el CODEOWNER del rol, ni
# que en G2/G7/G8 firmaran personas de los DOS roles. Eso es estado del
# servidor (revisiones y equipos), no del repositorio: un workflow tendria
# que leer equipos de la organizacion, que el GITHUB_TOKEN no puede, y
# volver a correr con cada revision. Seria un script fragil que aparenta
# vigilar. Lo garantiza la proteccion de main: "Require review from Code
# Owners" con .github/CODEOWNERS (ver ahi lo de los gates de dos roles).
# Aqui solo se exige que la evidencia DECLARE lo que el marco pide.
#
# CON SELLO DE ORIGEN DOCUMENTAL (docs/.origen-documental.json, ADR-007): un
# gate que el sello cita y cuyo sha256 esta en el sello es copia de la fuente
# donde se aprobo (p. ej. Nexora); sus firmas viven alli, asi que no se le
# exige `aprobadores` (si la forma: ruta, campos, id, tipo, estado).

set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=guardianes.conf
. "$AQUI/guardianes.conf"
RAIZ_REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ -f "$RAIZ_REPO/.aybar-guardianes.conf" ]; then
  # shellcheck disable=SC1091
  . "$RAIZ_REPO/.aybar-guardianes.conf"
fi

decir() { printf '%s\n' "$*" >&2; }
uso() {
  decir "Uso: validar-evidencia-gates.sh (--rango A...B | --archivos f1 [f2 ...]) [--informar]"
  exit 1
}

modo=""; rango=""; lista=""; informar=0
while [ $# -gt 0 ]; do
  case "$1" in
    --rango)    [ $# -ge 2 ] || uso; modo=rango; rango="$2"; shift 2 ;;
    --informar) informar=1; shift ;;
    --archivos) modo=archivos; shift; lista="$(printf '%s\n' "$@")"; break ;;
    -h|--help)  sed -n '3,29p' "$0"; exit 0 ;;
    *)          decir "[x] opcion desconocida: $1"; uso ;;
  esac
done
[ -n "$modo" ] || uso

if [ "$modo" = rango ]; then
  # Solo agregados y modificados (A, M y el destino de un renombre): un gate
  # borrado o retirado no tiene forma que validar; lo revisa su CODEOWNER.
  if ! lista="$(git diff --name-only --diff-filter=AMR -z "$rango" | tr '\0' '\n')"; then
    decir "[x] No pude listar los archivos del rango '$rango'."
    exit 1
  fi
fi

# Imprime una linea por campo: "campo<TAB>valor" para los escalares y
# "aprobadores<TAB><n firmas>"; o "sin-frontmatter" / "sin-cierre".
leer() {
  tr -d '\r' < "$1" | awk -v q="'" '
    function recortar(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
    function valor(l) {
      sub(/^[A-Za-z_]+[ \t]*:[ \t]*/, "", l)
      sub(/[ \t]+#.*$/, "", l)
      l = recortar(l)
      if (length(l) >= 2) {
        a = substr(l, 1, 1); z = substr(l, length(l), 1)
        if ((a == "\"" && z == "\"") || (a == q && z == q)) l = substr(l, 2, length(l) - 2)
      }
      return l
    }
    # Elementos de una lista en linea [a, b, {x: 1, y: 2}]: comas de primer nivel.
    function contar_en_linea(l,   i, c, prof, hay, n) {
      l = recortar(l); l = substr(l, 2, length(l) - 2)
      n = 0; prof = 0; hay = 0
      for (i = 1; i <= length(l); i++) {
        c = substr(l, i, 1)
        if (c == "[" || c == "{") prof++
        else if (c == "]" || c == "}") prof--
        else if (c == "," && prof == 0) { if (hay) n++; hay = 0; continue }
        if (c != " " && c != "\t") hay = 1
      }
      if (hay) n++
      return n
    }
    fin { next }
    NR == 1 { if ($0 != "---") { malo = 1; fin = 1 } ; next }
    $0 == "---" { cerrado = 1; fin = 1; next }
    # Dentro de una lista en bloque de aprobadores: "- x" al primer sangrado.
    en_bloque && /^[ \t]*$/ { next }
    en_bloque && /^[ \t]+-([ \t]|$)/ {
      s = $0; match(s, /^[ \t]+/); sangria = RLENGTH
      if (primera == 0) primera = sangria
      if (sangria == primera) firmas++
      next
    }
    en_bloque && /^[ \t]/ { next }
    { en_bloque = 0 }
    /^[A-Za-z_]+[ \t]*:/ {
      clave = $0; sub(/[ \t]*:.*/, "", clave)
      vistos[clave]++
      if (clave == "aprobadores") {
        v = valor($0)
        if (v == "") { en_bloque = 1; primera = 0; firmas = 0 }
        else if (substr(v, 1, 1) == "[") firmas = contar_en_linea(v)
        else firmas = 1
      } else {
        printf "%s\t%s\n", clave, valor($0)
      }
    }
    END {
      if (malo)     { print "sin-frontmatter"; exit }
      if (!cerrado) { print "sin-cierre"; exit }
      for (k in vistos) if (vistos[k] > 1) printf "repetido\t%s\n", k
      if ("aprobadores" in vistos) printf "aprobadores\t%d\n", firmas
    }'
}

OBLIGATORIOS="id tipo titulo estado producto version owner aprobadores fecha relacionados tags"

# Sellado: el sello nombra la ruta y contiene el sha256 exacto del archivo.
# Sin interpretar el JSON (sin jq): basta con que ambos textos esten en el sello.
SELLO="docs/.origen-documental.json"
sellado() { # ruta desde la raiz
  [ -f "$SELLO" ] || return 1
  grep -qF "\"${1#docs/}\"" "$SELLO" || return 1
  local sha
  if command -v sha256sum >/dev/null 2>&1; then sha="$(sha256sum "$1")"; else sha="$(shasum -a 256 "$1")"; fi
  grep -qF "\"${sha%% *}\"" "$SELLO"
}
problemas=0
revisados=0
fallo() { decir "[x] $1: $2"; problemas=1; }

while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in
    docs/gates/*/G*.md) ;;
    *) continue ;;
  esac
  revisados=$((revisados + 1))
  resto="${f#docs/gates/}"
  ticket="${resto%%/*}"
  archivo="${resto#*/}"
  n="${archivo#G}"; n="${n%.md}"

  if ! printf '%s\n' "$ticket" | grep -qxE "$PATRON_TICKET" || [ "$resto" != "$ticket/G$n.md" ]; then
    fallo "$f" "la ruta no tiene la forma docs/gates/<TICKET>/G<n>.md (TICKET: ${PATRON_TICKET})."
    continue
  fi
  case "$n" in
    [0-9]) ;;
    *) fallo "$f" "G${n} no es un gate del marco (G0 a G9)."; continue ;;
  esac
  if [ ! -f "$f" ]; then
    fallo "$f" "no esta en el arbol de trabajo (corre desde la raiz del repositorio)."
    continue
  fi

  campos="$(leer "$f")"
  case "$campos" in
    sin-frontmatter) fallo "$f" "no empieza con frontmatter YAML (linea '---')."; continue ;;
    sin-cierre)      fallo "$f" "el frontmatter no se cierra con '---'."; continue ;;
  esac
  campo() { awk -F '\t' -v k="$1" '$1 == k && !h { print $2; h = 1 }' <<< "$campos"; }

  for c in $OBLIGATORIOS; do
    if ! grep -q "^${c}"$'\t' <<< "$campos"; then
      fallo "$f" "falta el campo obligatorio '${c}' en el frontmatter."
    fi
  done
  while IFS= read -r rep; do
    if [ -n "$rep" ]; then fallo "$f" "el campo '${rep}' esta repetido en el frontmatter."; fi
  done <<< "$(awk -F '\t' '$1 == "repetido" { print $2 }' <<< "$campos")"

  id="$(campo id)"; tipo="$(campo tipo)"; estado="$(campo estado)"; firmas="$(campo aprobadores)"
  [ "$id" = "GATE-${ticket}-G${n}" ] || fallo "$f" "id '${id}' no coincide con la ruta: tiene que ser GATE-${ticket}-G${n}."
  [ "$tipo" = gate ] || fallo "$f" "tipo '${tipo}': tiene que ser gate."
  case "$estado" in
    draft|review|approved|deprecated|superseded) ;;
    *) fallo "$f" "estado '${estado}' fuera de draft, review, approved, deprecated, superseded." ;;
  esac

  if [ "$estado" = approved ] && sellado "$f"; then
    : # aprobado en la fuente documental: las firmas viven alli (ADR-007)
  elif [ "$estado" = approved ]; then
    minimo=1
    case "$n" in 2|7|8) minimo=2 ;; esac
    if [ "${firmas:-0}" -lt "$minimo" ]; then
      if [ "$minimo" -eq 2 ]; then
        fallo "$f" "G${n} es un gate de dos roles (G2: PO y UX; G7: DevOps y TL; G8: TL y PO) y aprobadores declara ${firmas:-0} firma(s). Una sola firma no lo cierra."
      else
        fallo "$f" "pasa a approved con aprobadores vacio: sin firma con nombre no hay gate."
      fi
    fi
  fi
done <<< "$lista"

if [ "$problemas" -ne 0 ]; then
  decir ""
  decir "    La evidencia de un gate es docs/gates/<TICKET>/G<n>.md con el frontmatter"
  decir "    del paquete Definir. Plantilla: .agents/templates/gate.md. Quien firma de"
  decir "    verdad lo decide la revision del CODEOWNER del rol (.github/CODEOWNERS)."
  exit 1
fi
if [ "$informar" -eq 1 ]; then
  decir "[ok] evidencia de gates: ${revisados} archivo(s) de gate con la forma del marco."
fi
exit 0
