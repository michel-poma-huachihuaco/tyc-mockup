#!/usr/bin/env bash
#
# validar-gate-listo.sh - guardian de G4 antes de construir (marco Aybar).
#
# En una rama feature/<TICKET>-<slug>, un cambio que toca CODIGO solo entra
# si el paquete Definir del ticket esta aprobado en la rama principal DEL
# REMOTO (REF_GATES de guardianes.conf, origin/main por defecto):
#   - docs/gates/<TICKET>/G4.md con estado: approved (Definition of Ready);
#   - y, si existe, docs/gates/<TICKET>/G3.md tambien approved (arquitectura);
#   - y docs/gates/<TICKET>/G2.md approved (UX/UI) si la feature tiene alguna
#     HU con pantalla (frontmatter `ui: true` o tag `ui`) o si G2.md existe.
#
# Codigo es lo que dice PATRONES_CODIGO (guardianes.conf): el backend y,
# en un repositorio con frontend, tambien frontend/.
#
# CON SELLO DE ORIGEN DOCUMENTAL (docs/.origen-documental.json, ADR-007 del
# SDK): la documentacion se aprueba en la fuente que nombra el sello (p. ej.
# Nexora) y docs/ es copia sellada. Un gate que el sello cita cuenta si esta
# `aprobado` alli y el archivo coincide con su sha256: la misma regla que
# `aybar paquete validar`, de la que se lee (con la CLI en el PATH). Sin la
# CLI no se interpreta el sello: manda REF_GATES, como sin sello. Un gate que
# el sello no cita, tambien.
#
# Manda origin/main y no la copia local: la aprobacion real es el PR del gate
# mergeado con la revision del CODEOWNER del rol (G4: PO; G3: TL; G2: PO y UX). Un
# "estado: approved" escrito a mano en la rama no abre nada hasta que ese PR
# entra en main. Los cambios que no tocan codigo (docs/ y demas) pasan: asi
# se escribe el paquete en la misma rama.
#
# UN VALIDADOR, TRES ASIENTOS:
#   validar-gate-listo.sh --staged                          hook pre-commit
#   validar-gate-listo.sh --rama R --rango A...B --fetch    CI: el PR contra su base
#   validar-gate-listo.sh --rama R --archivos f1 [f2 ...]   hook de agente
#   ... | validar-gate-listo.sh --rama R --archivos -       rutas por stdin
#
#   --rama R     rama que se evalua (por defecto, la actual)
#   --ref REF    de donde se lee la evidencia (por defecto, REF_GATES)
#   --fetch      trae REF del remoto antes de leerla. Es para CI: un hook
#                local no sale a la red, y en local vale lo ultimo que trajiste
#   --informar   cuenta tambien por que deja pasar (log de CI)
#   --archivos   va AL FINAL: todo lo que sigue son rutas ('-' = stdin)
#
# Exit 0 deja pasar; 1 bloquea (tambien con un uso incorrecto). El motivo
# va a stderr.
#
# Exentas: hotfix/, bugfix/ y release/ (RAMAS_EXENTAS_GATE explica por que).
# Cualquier otra rama que no sea feature/ no es asunto de este guardian.
#
# FALLA CERRADO: sin remoto, sin la ref de evidencia o con un frontmatter que
# no se puede leer, bloquea y dice que hacer. Un guardian que en la duda deja
# pasar no vigila nada.
#
# QUE NO COMPRUEBA: que el PR del gate lo aprobara el CODEOWNER que toca (eso
# lo garantiza el servidor: .github/CODEOWNERS y la proteccion de rama) ni la
# calidad del paquete (criterio humano en la revision del gate).

set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=guardianes.conf
. "$AQUI/guardianes.conf"
RAIZ_REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ -f "$RAIZ_REPO/.aybar-guardianes.conf" ]; then
  # shellcheck disable=SC1091
  . "$RAIZ_REPO/.aybar-guardianes.conf"
fi

REF="${REF_GATES:-origin/main}"
PATRONES="${PATRONES_CODIGO:-domain/* application/* adapters/* infrastructure/* boot/* pom.xml */pom.xml frontend/src/* frontend/public/* frontend/index.html frontend/package.json frontend/package-lock.json frontend/npm-shrinkwrap.json frontend/pnpm-lock.yaml frontend/yarn.lock frontend/angular.json frontend/aybar.config.json frontend/tsconfig*.json frontend/vite.config.* frontend/vite.*.config.*}"
EXENTAS="${RAMAS_EXENTAS_GATE:-hotfix/* bugfix/* release/*}"

decir() { printf '%s\n' "$*" >&2; }

uso() {
  decir "Uso: validar-gate-listo.sh [--rama R] [--ref REF] [--fetch] [--informar]"
  decir "       (--staged | --rango A...B | --archivos f1 [f2 ...] | --archivos -)"
  exit 1
}

informar=0
pasa() {
  if [ "$informar" -eq 1 ]; then
    decir "[ok] gate listo: $*"
  fi
  exit 0
}

# ---------------------------------------------------------------------------
# Argumentos.
# ---------------------------------------------------------------------------
rama=""
modo=""
rango=""
fetch=0
lista=""
while [ $# -gt 0 ]; do
  case "$1" in
    --rama)     [ $# -ge 2 ] || uso; rama="$2"; shift 2 ;;
    --ref)      [ $# -ge 2 ] || uso; REF="$2"; shift 2 ;;
    --rango)    [ $# -ge 2 ] || uso; modo=rango; rango="$2"; shift 2 ;;
    --staged)   modo=staged; shift ;;
    --fetch)    fetch=1; shift ;;
    --informar) informar=1; shift ;;
    --archivos)
      modo=archivos
      shift
      if [ "${1:-}" = "-" ]; then
        lista="$(cat)"
      else
        lista="$(printf '%s\n' "$@")"
      fi
      break ;;
    -h|--help)  sed -n '3,47p' "$0"; exit 0 ;;
    *)          decir "[x] opcion desconocida: $1"; uso ;;
  esac
done
[ -n "$modo" ] || uso

# ---------------------------------------------------------------------------
# 1. La rama: solo feature/ exige G4.
# ---------------------------------------------------------------------------
if [ -z "$rama" ]; then
  rama="$(git symbolic-ref --short -q HEAD 2>/dev/null || true)"
fi
[ -n "$rama" ] || pasa "sin rama (HEAD separado o fuera de git): no es una rama de trabajo."

set -f   # los patrones son de `case`, no de ficheros
for patron in $EXENTAS; do
  case "$rama" in
    $patron) set +f; pasa "rama '$rama' exenta del G4 (RAMAS_EXENTAS_GATE)." ;;
  esac
done
set +f

case "$rama" in
  feature/*) ;;
  *) pasa "rama '$rama': el G4 solo se exige en feature/<TICKET>-<slug>." ;;
esac

# ---------------------------------------------------------------------------
# 2. Los archivos del cambio, y cuales son codigo. -z y --no-renames: sin
#    comillas de git en rutas raras, y mover algo FUERA de domain/ tambien
#    cuenta como tocar domain/.
# ---------------------------------------------------------------------------
case "$modo" in
  staged)
    if ! lista="$(git diff --cached --name-only --no-renames -z | tr '\0' '\n')"; then
      decir "[x] No pude listar los archivos preparados (git diff --cached)."
      exit 1
    fi ;;
  rango)
    if ! lista="$(git diff --name-only --no-renames -z "$rango" | tr '\0' '\n')"; then
      decir "[x] No pude listar los archivos del rango '$rango'."
      decir "    En CI: git fetch origin <rama base> antes de llamar a este guardian."
      exit 1
    fi ;;
esac

codigo=""
total_codigo=0
set -f
while IFS= read -r f; do
  [ -n "$f" ] || continue
  f="${f#./}"
  case "$f" in
    "$RAIZ_REPO"/*) f="${f#"$RAIZ_REPO"/}" ;;
  esac
  for patron in $PATRONES; do
    case "$f" in
      $patron)
        codigo="${codigo}${f}"$'\n'
        total_codigo=$((total_codigo + 1))
        break ;;
    esac
  done
done <<< "$lista"
set +f

[ "$total_codigo" -gt 0 ] || pasa "el cambio no toca codigo (PATRONES_CODIGO): el paquete se escribe en la misma rama."

# ---------------------------------------------------------------------------
# 3. El ticket sale del nombre de la rama: feature/<TICKET>-<slug>.
# ---------------------------------------------------------------------------
resto="${rama#feature/}"
ticket="$(printf '%s\n' "$resto" | grep -oE "^(${PATRON_TICKET})" | head -1 || true)"
if [ -n "$ticket" ]; then
  case "${resto#"$ticket"}" in
    ''|-*) ;;
    *) ticket="" ;;
  esac
fi

primeros="$(printf '%s' "$codigo" | head -3 | tr '\n' ' ' || true)"
primeros="${primeros% }"
[ "$total_codigo" -le 3 ] || primeros="${primeros}(y $((total_codigo - 3)) mas)"

if [ -z "$ticket" ]; then
  cat >&2 <<FIN
[x] La rama '${rama}' toca codigo y no lleva ticket (${PATRON_TICKET}).
    Sin ticket no hay docs/gates/<TICKET>/G4.md que leer, y en una rama
    feature el codigo espera a la Definition of Ready (G4).
    Forma: feature/<TICKET>-<slug>, p. ej. feature/AYB-1042-reserva-de-lote
    Codigo en el cambio: ${primeros}
FIN
  exit 1
fi

# ---------------------------------------------------------------------------
# 3b. Sello de origen documental: si existe y hay CLI, la evidencia de los
#     gates que cita sale de `aybar paquete validar --json` (su campo
#     evidencia distinto de origin/main). La salida es la de la CLI (claves en
#     orden fijo, una por linea), no el sello: el sello no se interpreta aqui.
# ---------------------------------------------------------------------------
sello_json=""
if [ -f "$RAIZ_REPO/docs/.origen-documental.json" ]; then
  if command -v aybar >/dev/null 2>&1; then
    sello_json="$(cd "$RAIZ_REPO" && aybar paquete validar docs --json 2>/dev/null || true)"
    case "$sello_json" in
      *'"esquema"'*) ;;
      *) sello_json=""
         decir "[!] docs/.origen-documental.json: aybar paquete validar no devolvio su informe; la evidencia se lee en ${REF}." ;;
    esac
  else
    decir "[!] docs/.origen-documental.json existe, pero sin la CLI aybar no se lee: la evidencia se lee en ${REF}, como sin sello."
  fi
fi

# "<fuente>|<estado>" si el sello cita el gate G<n> del ticket; vacio si no.
evidencia_sello() {
  [ -n "$sello_json" ] || return 0
  printf '%s\n' "$sello_json" | awk -v t="$ticket" -v g="G$1" '
    function v(l) { sub(/^[^:]*: "/, "", l); sub(/",?$/, "", l); return l }
    /^  "gates": \[$/ { dentro = 1; next }
    dentro && /^  \]/ { dentro = 0 }
    !dentro { next }
    /^    \{/ { tk = ""; gt = ""; est = ""; ev = "" }
    /^      "ticket": "/ { tk = v($0) }
    /^      "gate": "/ { gt = v($0) }
    /^      "estado_origin_main": "/ { est = v($0) }
    /^      "evidencia": "/ { ev = v($0) }
    /^    \}/ { if (tk == t && gt == g && ev != "" && ev != "origin/main") print ev "|" est }'
}

# Features del ticket con pantallas segun la CLI (ui: true en features[]).
ui_segun_cli() {
  [ -n "$sello_json" ] || return 0
  printf '%s\n' "$sello_json" | awk -v t="$ticket" '
    function v(l) { sub(/^[^:]*: "/, "", l); sub(/",?$/, "", l); return l }
    /^  "features": \[$/ { dentro = 1; next }
    dentro && /^  \]/ { dentro = 0 }
    !dentro { next }
    /^    \{/ { id = ""; tk = ""; ui = 0 }
    /^      "id": "/ { id = v($0) }
    /^      "ticket": "/ { tk = v($0) }
    /^      "ui": true/ { ui = 1 }
    /^    \}/ { if (tk == t && ui) printf "%s ", id }'
}

g4_sellado="$(evidencia_sello 4)"

# ---------------------------------------------------------------------------
# 4. La evidencia: REF tiene que existir (salvo que el G4 venga del sello). Sin ella no se sabe nada, y no
#    saber no es lo mismo que estar aprobado.
# ---------------------------------------------------------------------------
remoto="${REF%%/*}"
rama_ref="${REF#*/}"

if [ "$fetch" -eq 1 ]; then
  if ! git fetch -q "$remoto" "+refs/heads/${rama_ref}:refs/remotes/${remoto}/${rama_ref}"; then
    decir "[x] No pude traer ${REF} del remoto '${remoto}': sin esa ref no hay evidencia del G4."
    exit 1
  fi
fi

ref_disponible=1
if ! git rev-parse -q --verify "${REF}^{commit}" >/dev/null 2>&1 && [ -n "$g4_sellado" ]; then
  ref_disponible=0
elif ! git rev-parse -q --verify "${REF}^{commit}" >/dev/null 2>&1; then
  if ! git remote get-url "$remoto" >/dev/null 2>&1; then
    cat >&2 <<FIN
[x] Este clon no tiene el remoto '${remoto}', y la evidencia del G4 vive en ${REF}.
    El gate se aprueba por PR en el servidor; en local solo se lee lo que trajo
    el ultimo fetch. Configura el remoto y traelo:
      git remote add ${remoto} <url-del-repositorio> && git fetch ${remoto} ${rama_ref}
    Mientras tanto, los commits que no tocan codigo (docs/gates/...) pasan.
    Codigo en el cambio: ${primeros}
FIN
  else
    cat >&2 <<FIN
[x] No existe ${REF} en este clon: sin esa ref no hay evidencia del G4.
      git fetch ${remoto} ${rama_ref}
    y vuelve a intentarlo. Codigo en el cambio: ${primeros}
FIN
  fi
  exit 1
fi

# ---------------------------------------------------------------------------
# 5. Los gates. El frontmatter va entre dos lineas '---' al principio del
#    fichero; solo cuentan las claves de primer nivel de ese bloque (un
#    "estado: approved" en el cuerpo no es evidencia de nada).
# ---------------------------------------------------------------------------

# Imprime: falta | sin-frontmatter | sin-cierre | <n estados>|<estado>|<id>|<tipo>
leer_gate() {
  local ruta="docs/gates/${ticket}/G$1.md"
  if ! git cat-file -e "${REF}:${ruta}" 2>/dev/null; then
    echo falta
    return 0
  fi
  git show "${REF}:${ruta}" | tr -d '\r' | awk -v q="'" '
    function valor(l) {
      sub(/^[A-Za-z_]+[ \t]*:[ \t]*/, "", l)
      sub(/[ \t]+#.*$/, "", l)
      sub(/[ \t]+$/, "", l)
      if (length(l) >= 2) {
        a = substr(l, 1, 1); z = substr(l, length(l), 1)
        if ((a == "\"" && z == "\"") || (a == q && z == q)) l = substr(l, 2, length(l) - 2)
      }
      return l
    }
    # Se lee hasta el final aunque el frontmatter acabe antes: cortar con
    # exit romperia la tuberia (SIGPIPE) y pipefail lo tomaria por fallo.
    fin { next }
    NR == 1 { if ($0 != "---") { malo = 1; fin = 1 } ; next }
    $0 == "---" { cerrado = 1; fin = 1; next }
    /^estado[ \t]*:/ { n++; estado = valor($0) }
    /^id[ \t]*:/     { id = valor($0) }
    /^tipo[ \t]*:/   { tipo = valor($0) }
    END {
      if (malo)         { print "sin-frontmatter"; exit }
      if (!cerrado)     { print "sin-cierre"; exit }
      printf "%d|%s|%s|%s\n", n, estado, id, tipo
    }'
}

problemas=0
sellados=""
revisar() { # n obligatorio(si|no)
  local n="$1" obligatorio="$2" ruta r cuenta estado id tipo s
  ruta="docs/gates/${ticket}/G${n}.md"
  s="$(evidencia_sello "$n")"
  if [ -n "$s" ]; then
    if [ "${s#*|}" != approved ]; then
      decir "[x] G${n} de ${ticket}: en ${s%%|*} (sello docs/.origen-documental.json) esta '${s#*|}'. Solo aprobado alli, con el archivo igual a su huella, es evidencia."
      problemas=1
    fi
    sellados="${sellados}, G${n} (${s%%|*})"
    return 0
  fi
  if [ "$ref_disponible" -eq 0 ]; then
    if [ "$obligatorio" = si ] || [ -f "$RAIZ_REPO/$ruta" ]; then
      decir "[x] G${n} de ${ticket}: el sello no lo cita y no hay ${REF} donde leerlo."
      problemas=1
    fi
    return 0
  fi
  r="$(leer_gate "$n")"
  case "$r" in
    falta)
      if [ "$obligatorio" = si ]; then
        decir "[x] G${n} de ${ticket}: ${REF} no tiene ${ruta}."
        problemas=1
      fi
      return 0 ;;
    sin-frontmatter)
      decir "[x] G${n} de ${ticket}: ${ruta} en ${REF} no empieza con frontmatter YAML (linea '---')."
      problemas=1
      return 0 ;;
    sin-cierre)
      decir "[x] G${n} de ${ticket}: el frontmatter de ${ruta} en ${REF} no se cierra con '---'."
      problemas=1
      return 0 ;;
  esac
  IFS='|' read -r cuenta estado id tipo <<< "$r"
  if [ "$cuenta" != 1 ]; then
    decir "[x] G${n} de ${ticket}: ${ruta} tiene ${cuenta} claves 'estado:' en el frontmatter (tiene que haber una)."
    problemas=1
  elif [ "$estado" != approved ]; then
    decir "[x] G${n} de ${ticket}: en ${REF} esta en estado '${estado}'. Solo approved es evidencia."
    problemas=1
  fi
  if [ "$id" != "GATE-${ticket}-G${n}" ]; then
    decir "[x] G${n} de ${ticket}: el id del frontmatter es '${id}', y tiene que ser GATE-${ticket}-G${n}."
    problemas=1
  fi
  if [ "$tipo" != gate ]; then
    decir "[x] G${n} de ${ticket}: el tipo del frontmatter es '${tipo}', y tiene que ser gate."
    problemas=1
  fi
  return 0
}

revisar 4 si
revisar 3 no

# ---------------------------------------------------------------------------
# 6. G2 (UX/UI) si la feature tiene pantallas. Una HU con pantalla lleva en su
#    frontmatter `ui: true` (o `ui` en sus tags). Cuenta si, EN REF, esa HU:
#      - nombra el ticket en su frontmatter (p. ej. en relacionados), o
#      - pertenece a una feature de docs/features/ que nombra el ticket: la
#        feature la lista en relacionados, o la HU lista a la feature.
#    Con alguna, G2.md es obligatorio y approved (PO + UX). Sin ninguna, G2.md
#    sigue siendo opcional, pero si existe tiene que estar approved, como G3.
#    Se lee solo el frontmatter: lo que diga el cuerpo no es evidencia.
# ---------------------------------------------------------------------------

# Una linea por documento: id|relacionados|tags|ui|texto-del-frontmatter.
leer_frontmatter() {
  git show "${REF}:$1" 2>/dev/null | tr -d '\r' | awk -v q="'" '
    function limpio(v,   a, z) {
      sub(/^[ \t]+/, "", v); sub(/[ \t]+$/, "", v)
      if (length(v) >= 2) {
        a = substr(v, 1, 1); z = substr(v, length(v), 1)
        if ((a == "\"" && z == "\"") || (a == q && z == q)) v = substr(v, 2, length(v) - 2)
      }
      return v
    }
    function lista(v,   n, i, p, r, x) {
      sub(/^[ \t]*\[/, "", v); sub(/\][ \t]*$/, "", v)
      n = split(v, p, ","); r = ""
      for (i = 1; i <= n; i++) { x = limpio(p[i]); if (x != "") r = r (r == "" ? "" : ",") x }
      return r
    }
    fin { next }
    NR == 1 { if ($0 != "---") fin = 1; next }
    $0 == "---" { fin = 1; next }
    { texto = texto " " $0 }
    /^[A-Za-z_]+[ \t]*:/ {
      clave = $0; sub(/[ \t]*:.*/, "", clave)
      valor = $0; sub(/^[A-Za-z_]+[ \t]*:[ \t]*/, "", valor); sub(/[ \t]+#.*$/, "", valor)
      actual = clave
      if (clave == "id") id = limpio(valor)
      else if (clave == "relacionados") rel = lista(valor)
      else if (clave == "tags") tags = lista(valor)
      else if (clave == "ui") ui = limpio(valor)
      next
    }
    /^[ \t]+-/ {
      v = $0; sub(/^[ \t]+-[ \t]*/, "", v); v = limpio(v)
      if (actual == "relacionados") rel = rel (rel == "" ? "" : ",") v
      else if (actual == "tags") tags = tags (tags == "" ? "" : ",") v
      next
    }
    END { gsub(/\|/, " ", texto); printf "%s|%s|%s|%s|%s\n", id, rel, tags, ui, texto }'
}

es_ui() { # ui tags
  # Sin distinguir mayusculas, igual que MarcadorUi de la CLI (aybar paquete
  # validar): los dos tienen que dar el mismo veredicto sobre la misma HU.
  # tr y no ${v,,}: el bash 3.2 de macOS no lo tiene.
  local v t
  v="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  t="$(printf '%s' "$2" | tr '[:upper:]' '[:lower:]')"
  case "$v" in true|si|yes) return 0 ;; esac
  case ",$t," in *,ui,*) return 0 ;; esac
  return 1
}
menciona_ticket() { grep -qE -- "(^|[^A-Za-z0-9-])${ticket}([^0-9]|$)" <<< "$1"; }
en_lista() { [ -n "$1" ] && case ",$2," in *",$1,"*) true ;; *) false ;; esac; }
cruzan() { # lista-a lista-b: algun elemento en comun
  local x resto="$1,"
  while [ -n "$resto" ]; do
    x="${resto%%,*}"; resto="${resto#*,}"
    if en_lista "$x" "$2"; then return 0; fi
  done
  return 1
}

historias_con_ui() {
  local docs f id rel tags ui texto feats="" de_feats="" res=""
  docs="$(git ls-tree -r --name-only "$REF" -- docs/features docs/historias 2>/dev/null | grep -E '\.md$' || true)"
  [ -n "$docs" ] || return 0
  while IFS= read -r f; do
    case "$f" in docs/features/*) ;; *) continue ;; esac
    IFS='|' read -r id rel tags ui texto <<< "$(leer_frontmatter "$f")"
    menciona_ticket "$texto" || continue
    feats="${feats},${id}"
    de_feats="${de_feats},${rel}"
    if es_ui "$ui" "$tags"; then res="$res ${id:-$f}"; fi
  done <<< "$docs"
  while IFS= read -r f; do
    case "$f" in docs/historias/*) ;; *) continue ;; esac
    IFS='|' read -r id rel tags ui texto <<< "$(leer_frontmatter "$f")"
    es_ui "$ui" "$tags" || continue
    if menciona_ticket "$texto" || en_lista "$id" "$de_feats" || cruzan "$rel" "$feats"; then
      res="$res ${id:-$f}"
    fi
  done <<< "$docs"
  printf '%s' "${res# }"
}

con_ui=""
if [ "$ref_disponible" -eq 1 ]; then con_ui="$(historias_con_ui)"; fi
ui_cli="$(ui_segun_cli)"
if [ -n "$ui_cli" ]; then con_ui="${con_ui}${con_ui:+ }${ui_cli% }"; fi
if [ -n "$con_ui" ]; then
  if [ -z "$(evidencia_sello 2)" ] && { [ "$ref_disponible" -eq 0 ] || [ "$(leer_gate 2)" = falta ]; }; then
    decir "[x] G2 de ${ticket}: la feature tiene HU con pantalla (${con_ui}) y ${REF} no tiene docs/gates/${ticket}/G2.md."
    problemas=1
  else
    revisar 2 si
  fi
else
  revisar 2 no
fi

if [ "$problemas" -ne 0 ]; then
  cat >&2 <<FIN

    Rama: ${rama}
    En una rama feature el codigo espera a la Definition of Ready (G4); si
    el ticket tiene G3, a la arquitectura aprobada; y si la feature tiene
    pantallas, al diseño aprobado (G2). Lo que manda es ${REF}, no tu copia
    local. Como se abre:
      1. escribe el paquete en docs/gates/${ticket}/ (esos commits SI pasan);
      2. abre su PR: lo aprueba el CODEOWNER del rol (G4: PO; G3: TL; G2: PO
         y UX) y se mergea a main;
      3. git fetch ${remoto} ${rama_ref}, y vuelve a intentarlo.
    Incidente Sev1/Sev2: rama hotfix/<TICKET>-<slug>, la via comprimida.
    Codigo en el cambio: ${primeros}
FIN
  exit 1
fi

extra=""
if [ "$ref_disponible" -eq 1 ]; then
  if [ -z "$(evidencia_sello 3)" ] && git cat-file -e "${REF}:docs/gates/${ticket}/G3.md" 2>/dev/null; then extra="${extra}, G3"; fi
  if [ -z "$(evidencia_sello 2)" ] && git cat-file -e "${REF}:docs/gates/${ticket}/G2.md" 2>/dev/null; then extra="${extra}, G2"; fi
fi
if [ -n "$g4_sellado" ]; then
  pasa "${ticket}: aprobados en el sello${sellados}${extra:+; en ${REF}:${extra#,}}${con_ui:+ (pantallas: ${con_ui})}."
fi
pasa "${ticket}: G4${extra} approved en ${REF}${sellados:+ (del sello:${sellados#,})}${con_ui:+ (pantallas: ${con_ui})}."
