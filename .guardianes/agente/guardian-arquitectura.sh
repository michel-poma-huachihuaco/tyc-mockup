#!/usr/bin/env bash
#
# guardian-arquitectura.sh - G3 Architecture, topologia vigente.
# Hook PreToolUse de Claude Code sobre Write|Edit|MultiEdit.
#
# BACKEND. Si el archivo es Java del dominio (carpeta domain/ o paquete
# ..domain..), no puede depender de Spring, Kafka, Jakarta ni JPA: es la misma
# norma que NormaHexagonalTest (ArchUnit) aplica en el build. Este guardian no
# la reemplaza; corta ANTES de escribir, que es cuando el agente aun puede
# poner el import donde va (application/, adapters/ o infrastructure/).
#
# FRONTEND (frontend/, codigo .ts/.tsx/.js/.jsx/.mts/.cts/.mjs/.cjs). El
# frontend no tiene un ArchUnit en su build, asi que este hook es la primera
# barrera y la revision humana (G5) la segunda. Corta:
#   1. un import relativo que sale de frontend/: el backend y el resto del
#      repositorio se consumen por HTTP, nunca por ruta;
#   2. un import cuyo destino es una URL (http:, https: o //): un remoto se
#      monta por el registro del shell (public/remotos.json + import map), y
#      un remoto no importa a otro; se hablan por el bus (<remoto>:<evento>);
#   3. un import entre remotos que conviven en el repositorio
#      (frontend/.../remotos/<a>/ hacia .../remotos/<b>/);
#   4. en un proyecto de papel remoto, importar @aybarcorp/shell o
#      @aybarcorp/auth: el shell vive solo en el anfitrion, y la sesion (token,
#      renovacion) es del anfitrion, que se la pasa al remoto;
#   5. un COMPONENTE que llama a la red: fetch(...), axios, XMLHttpRequest o
#      el HttpClient de Angular. La llamada va en un servicio que usa
#      @aybarcorp/http (Bearer, X-Correlation-Id, RFC 7807 -> ErrorAybar).
#
# Por que la regla 5 BLOQUEA y no avisa: el hook ve el contenido completo que
# se va a escribir, y en un componente no hay llamada legitima a la red que
# no pueda vivir en un servicio; la correccion es siempre la misma y es
# mecanica (moverla). Un aviso que no bloquea el agente no lo ve. Para que el
# coste de un falso positivo sea bajo, la regla se limita a componentes
# (.tsx/.jsx, o un .ts con @Component), mira la LLAMADA (fetch( y no la
# palabra: refetch(, prefetch(, obj.fetch( no cuentan) y deja fuera las
# pruebas (*.test.*, *.spec.*, __tests__/). Un servicio (src/api/*.ts,
# *.service.ts) puede usar fetch: ahi es donde vive el cliente.
#
# El papel (shell, remoto o app) sale de .aybar/proyecto.properties (papel=)
# o, si no esta, de frontend/aybar.config.json ("papel"). Sin papel conocido,
# la regla 4 no se aplica: no se corta por suposiciones.
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
[ -n "$REL" ] || exit 0

# ===========================================================================
# Backend: domain/ es Java puro.
# ===========================================================================
revisar_dominio() {
  local contenido linea
  contenido="$(json_campo contenido)"
  [ -n "$contenido" ] || exit 0

  # Paquetes que el dominio no conoce (los de el_dominio_no_conoce_la_tecnologia).
  local prohibidos='org\.springframework|org\.apache\.kafka|jakarta|javax\.persistence'

  motivo() {
    printf '%s\n' "domain/ es Java puro: no importa Spring, Kafka, Jakarta ni JPA." \
      "$1" \
      "Ese import va en application/, adapters/ o infrastructure/; el dominio declara" \
      "un puerto (domain/port) y otra capa lo implementa." \
      "Archivo: $REL" >&2
  }

  if contiene "^[[:space:]]*import[[:space:]]+(static[[:space:]]+)?(${prohibidos})\\." "$contenido"; then
    linea="$(grep -m1 -E "^[[:space:]]*import[[:space:]]+(static[[:space:]]+)?(${prohibidos})\\." <<< "$contenido" || true)"
    printf 'GUARDIAN AYBAR (G3, arquitectura hexagonal): ' >&2
    motivo "Import leido: ${linea#"${linea%%[![:space:]]*}"}"
    exit 2
  fi

  # Anotaciones con nombre completo: @org.springframework...Component sin import.
  if contiene "@(${prohibidos})\\." "$contenido"; then
    printf 'GUARDIAN AYBAR (G3, arquitectura hexagonal): ' >&2
    motivo "Hay una anotacion con nombre completo de un paquete prohibido."
    exit 2
  fi
  exit 0
}

# ===========================================================================
# Frontend.
# ===========================================================================
corta_front() { # motivo lineas...
  printf 'GUARDIAN AYBAR (G3, arquitectura del frontend): %s\n' "$1" >&2
  shift
  if [ $# -gt 0 ]; then printf '  %s\n' "$@" >&2; fi
  printf '  Archivo: %s\n' "$REL" >&2
  exit 2
}

# Normaliza una ruta con '/' (quita '.' y resuelve '..'). Imprime FUERA si
# sube por encima de la raiz del repositorio. Sin arrays: bash 3.2 con set -u.
normalizar() {
  local resto="$1/" salida="" parte
  while [ -n "$resto" ]; do
    parte="${resto%%/*}"
    resto="${resto#*/}"
    case "$parte" in
      ''|.) ;;
      ..)
        if [ -z "$salida" ]; then printf 'FUERA'; return 0; fi
        case "$salida" in */*) salida="${salida%/*}" ;; *) salida="" ;; esac ;;
      *) salida="${salida:+$salida/}$parte" ;;
    esac
  done
  printf '%s' "$salida"
}

# Papel del frontend: shell, remoto, app o vacio si no se sabe.
papel_front() {
  local p=""
  if [ -f "$RAIZ/.aybar/proyecto.properties" ]; then
    p="$(sed -n -E 's/^(frontend\.)?papel[[:space:]]*=[[:space:]]*//p' "$RAIZ/.aybar/proyecto.properties" | tr -d '\r' | head -1 || true)"
  fi
  if [ -z "$p" ] && [ -f "$RAIZ/frontend/aybar.config.json" ]; then
    p="$(grep -oE '"papel"[[:space:]]*:[[:space:]]*"[a-z]+"' "$RAIZ/frontend/aybar.config.json" | head -1 | sed -E 's/.*"([a-z]+)"$/\1/' || true)"
  fi
  printf '%s' "$p"
}

# El remoto al que pertenece una ruta (.../remotos/<x>/...), o vacio.
remoto_de() {
  case "/$1/" in
    */remotos/*/*|*/remotes/*/*)
      local r="/$1/"
      r="${r#*/remotos/}"
      [ "$r" != "/$1/" ] || r="${r#*/remotes/}"
      printf '%s' "${r%%/*}" ;;
  esac
}

revisar_frontend() {
  case "$REL" in
    frontend/node_modules/*|frontend/dist/*|frontend/.angular/*|frontend/coverage/*) exit 0 ;;
    frontend/*.ts|frontend/*.tsx|frontend/*.js|frontend/*.jsx|frontend/*.mts|frontend/*.cts|frontend/*.mjs|frontend/*.cjs) ;;
    *) exit 0 ;;
  esac

  local contenido specs spec destino dir papel origen_remoto destino_remoto
  contenido="$(json_campo contenido)"
  [ -n "$contenido" ] || exit 0

  # Especificadores: import ... from 'x', export ... from 'x', import 'x',
  # import('x') y require('x'). Una linea por especificador.
  specs="$(grep -oE "(from|import|require)[[:space:]]*\(?[[:space:]]*['\"][^'\"]+['\"]" <<< "$contenido" \
    | sed -E "s/^(from|import|require)[[:space:]]*\(?[[:space:]]*['\"]//; s/['\"]$//" || true)"

  dir="${REL%/*}"
  papel="$(papel_front)"
  origen_remoto="$(remoto_de "$REL")"

  while IFS= read -r spec; do
    [ -n "$spec" ] || continue
    case "$spec" in
      http:*|https:*|//*)
        corta_front "import de un modulo por URL ($spec)." \
          "Un remoto no se importa: lo monta el shell por su registro (public/remotos.json)" \
          "y el import map. Un remoto tampoco importa a otro: se hablan por el bus" \
          "(<remoto>:<evento>) de @aybarcorp/core." ;;
      .|./*|..|../*)
        destino="$(normalizar "$dir/$spec")"
        case "$destino" in
          frontend|frontend/*) ;;
          *)
            corta_front "import relativo que sale de frontend/ ($spec)." \
              "El codigo de frontend/ no importa nada de fuera de frontend/: el backend se" \
              "consume por HTTP con @aybarcorp/http y el contrato OpenAPI de docs/arquitectura/." ;;
        esac
        destino_remoto="$(remoto_de "$destino")"
        if [ -n "$origen_remoto" ] && [ -n "$destino_remoto" ] && [ "$origen_remoto" != "$destino_remoto" ]; then
          corta_front "el remoto '$origen_remoto' importa codigo del remoto '$destino_remoto' ($spec)." \
            "Dos remotos no comparten codigo por ruta: se despliegan por separado. Lo comun va" \
            "a un paquete compartido; la comunicacion, por el bus (<remoto>:<evento>)."
        fi ;;
    esac
    if [ "$papel" = remoto ]; then
      case "$spec" in
        @aybarcorp/shell|@aybarcorp/shell/*)
          corta_front "un remoto no importa @aybarcorp/shell ($spec)." \
            "El shell vive solo en el anfitrion. El remoto usa @aybarcorp/remote y recibe del" \
            "anfitrion la sesion, la ruta y el tema." ;;
        @aybarcorp/auth|@aybarcorp/auth/*)
          corta_front "un remoto no importa @aybarcorp/auth ($spec)." \
            "La sesion es del anfitrion: el remoto no guarda el token ni lo renueva. La recibe" \
            "en su contexto (useAnfitrion / el contexto del Remoto) y se la pasa a @aybarcorp/http." ;;
      esac
    fi
  done <<< "$specs"

  # Regla 5: un componente no llama a la red.
  case "$REL" in
    *.test.*|*.spec.*|*/__tests__/*) exit 0 ;;
  esac
  local es_componente=0
  case "$REL" in
    *.tsx|*.jsx) es_componente=1 ;;
  esac
  if [ "$es_componente" -eq 0 ] && contiene '@Component[[:space:]]*\(' "$contenido"; then
    es_componente=1
  fi
  [ "$es_componente" -eq 1 ] || exit 0

  local llamada=""
  if contiene '(^|[^A-Za-z0-9_$.])((window|globalThis|self)\.)?fetch[[:space:]]*\(' "$contenido"; then
    llamada="fetch(...)"
  elif grep -qxE 'axios(/.*)?' <<< "$specs"; then
    llamada="axios"
  elif contiene 'new[[:space:]]+XMLHttpRequest' "$contenido"; then
    llamada="XMLHttpRequest"
  elif grep -qxE '@angular/common/http' <<< "$specs"; then
    llamada="HttpClient de @angular/common/http"
  fi
  if [ -n "$llamada" ]; then
    corta_front "un componente llama a la red con $llamada." \
      "La llamada va en un servicio (p. ej. src/api/<recurso>.ts o <recurso>.service.ts)" \
      "con el cliente de @aybarcorp/http: pone el Bearer y el X-Correlation-Id y" \
      "convierte los errores RFC 7807 en ErrorAybar. El componente usa ese servicio."
  fi
  exit 0
}

case "$REL" in
  domain/*.java|*/domain/*.java) revisar_dominio ;;
  frontend/*) revisar_frontend ;;
esac
exit 0
