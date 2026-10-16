#!/usr/bin/env bash
#
# guardian-pii.sh - datos que no salen: secretos, credenciales y PII
# (skill aybar-datos-que-no-salen). Hook PreToolUse de Claude Code sobre
# Write|Edit|MultiEdit: escanea lo que el agente va a escribir ANTES de que
# llegue a disco, no despues en el commit. El escaneo de secretos del
# pipeline es la ultima linea de defensa; esta es la primera.
#
# Neutral de nube: reconoce por igual credenciales de AWS, Azure y GCP,
# claves privadas PEM, tokens de GitHub y de otros proveedores, secretos
# clave=valor escritos a mano y numeros de tarjeta que no son sinteticos.
# Agnostico de lenguaje: lee el contenido, no la extension, asi que vale igual
# para Java, YAML, .env y el codigo del frontend (.ts, .tsx...). Para el
# frontend anade una regla propia: una variable publica (VITE_*,
# NEXT_PUBLIC_*) con nombre de secreto.
#
# Nunca repite el secreto en el motivo: el motivo vuelve al agente, y un
# guardian que lo cita lo esta filtrando otra vez.
#
# Exit 0 deja pasar; exit 2 bloquea (stderr es el motivo).
set -Eeuo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=comun.sh
. "$AQUI/comun.sh"
guardian_inicio

CONTENIDO="$(json_campo contenido)"
[ -n "$CONTENIDO" ] || exit 0
RUTA="$(json_campo ruta)"
REL="$(ruta_relativa "$RUTA")"

set -f
for patron in ${RUTAS_EXENTAS_PII:-}; do
  case "$REL" in
    $patron) exit 0 ;;
  esac
done
set +f

secreto() {
  printf 'GUARDIAN AYBAR (G7, aybar-datos-que-no-salen): %s\n' "$1" >&2
  printf '  Nunca credenciales ni datos reales en el codigo ni en un prompt. Si es real,\n' >&2
  printf '  sacalo de aqui, rotalo y leelo de una variable de entorno o del gestor de\n' >&2
  printf '  secretos que haya elegido el servicio (su ADR). Si es de ejemplo, que se note:\n' >&2
  printf '  ${VARIABLE}, <tu-valor>, "example".\n' >&2
  printf '  Archivo: %s\n' "${REL:-${RUTA:-desconocido}}" >&2
  exit 2
}

hallazgos() { grep -oE -- "$1" <<< "$CONTENIDO" || true; }
lineas_i()  { grep -iE -- "$1" <<< "$CONTENIDO" || true; }

# Lineas que se declaran de ejemplo: valen para los patrones clave=valor,
# no para los estructurales (una clave PEM no deja de serlo por un comentario).
MARCAS_EJEMPLO='example|ejemplo|placeholder|dummy|changeme|cambia|sintetic|synthetic|fake|falso|test|xxxx|<[a-z_-]+>|\$\{|\$\(|\{\{|process\.env|os\.environ|getenv|@Value|secretKeyRef|(^|[^a-z])(tu|your)_'

# Relleno dentro del propio token: ghp_xxxx..., AKIA...EXAMPLE, 0000...
RELLENO='EXAMPLE|example|xxxxx|XXXXX|00000000'

# Hay algun token que cumple $1 y no es relleno?
token_real() { [ -n "$(hallazgos "$1" | grep -vE -- "$RELLENO" || true)" ]; }

# Hay alguna linea que cumple $1 y no se declara de ejemplo?
kv_real() {
  local l
  l="$(lineas_i "$1")"
  [ -n "$l" ] || return 1
  [ -n "$(grep -viE -- "$MARCAS_EJEMPLO" <<< "$l" || true)" ]
}

# --- AWS ---------------------------------------------------------------------
# Las claves de la documentacion de AWS terminan en EXAMPLE: esas pasan.
if token_real '(AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}'; then
  secreto "parece un Access Key ID de AWS."
fi
if kv_real "aws_?secret_?access_?key[\"']?[[:space:]]*[:=][[:space:]]*[\"']?[A-Za-z0-9/+=]{40}"; then
  secreto "parece un Secret Access Key de AWS."
fi

# --- Azure -------------------------------------------------------------------
if token_real '(AccountKey|SharedAccessKey)=[A-Za-z0-9+/]{20,}'; then
  secreto "parece una cadena de conexion de Azure con su clave (AccountKey= o SharedAccessKey=)."
fi
if token_real '[?&]sig=[A-Za-z0-9%+/]{30,}'; then
  secreto "parece un token SAS de Azure (sig=...)."
fi
if token_real '[A-Za-z0-9_~.-]{3}[0-9]Q~[A-Za-z0-9_~.-]{31,34}'; then
  secreto "parece un client secret de Microsoft Entra ID (Azure AD)."
fi
if kv_real "(client[_-]?secret|azure_client_secret)[\"']?[[:space:]]*[:=][[:space:]]*[\"']?[A-Za-z0-9_~.+/=-]{16,}"; then
  secreto "parece un client secret escrito a mano."
fi

# --- GCP ---------------------------------------------------------------------
if contiene '"type"[[:space:]]*:[[:space:]]*"service_account"' "$CONTENIDO" \
   && contiene '"private_key(_id)?"[[:space:]]*:' "$CONTENIDO"; then
  secreto "parece la clave JSON de una service account de GCP."
fi
if token_real 'AIza[0-9A-Za-z_-]{35}'; then
  secreto "parece una API key de Google Cloud (AIza...)."
fi

# --- Claves privadas y tokens de proveedor ------------------------------------
if contiene '-----BEGIN ([A-Z0-9]+ )*PRIVATE KEY( BLOCK)?-----' "$CONTENIDO"; then
  secreto "parece una clave privada (bloque PEM). Si un test la necesita, que la genere al correr."
fi
if token_real '(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})'; then
  secreto "parece un token de GitHub."
fi
if token_real '(^|[^A-Za-z0-9_-])sk-(ant-|proj-)?[A-Za-z0-9_-]{20,}'; then
  secreto "parece una API key de un proveedor de modelos (sk-...)."
fi
if token_real 'xox[abposr]-[A-Za-z0-9-]{10,}'; then
  secreto "parece un token de Slack."
fi

# --- Secretos clave=valor escritos a mano --------------------------------------
if kv_real "(api[_-]?key|secret|password|passwd|token)[\"']?[[:space:]]*[:=][[:space:]]*[\"'][A-Za-z0-9/+=_-]{16,}[\"']"; then
  secreto "parece un secreto escrito a mano (clave=valor largo) sin marcar como ejemplo ni leido de una variable de entorno."
fi

# --- Frontend: variable publica con nombre de secreto ---------------------------
# Vite (VITE_*) y Next.js (NEXT_PUBLIC_*) incrustan esas variables en el bundle
# que descarga el navegador: lo que vaya ahi lo lee cualquiera, tenga el valor
# que tenga. Por eso aqui cuenta el NOMBRE, no el valor, y no valen las marcas
# de ejemplo. Se mira la definicion (NOMBRE= o NOMBRE:) y el uso (env.NOMBRE),
# no la mencion en prosa; y el nombre entero (VITE_SECRETARIA_URL no cuenta).
PUBLICA_SECRETA='(VITE|NEXT_PUBLIC)_([A-Z0-9]+_)*(SECRET|PASSWORD|PASSWD|PRIVATE_KEY)(_[A-Z0-9]+)*'
if contiene "(^|[^A-Za-z0-9_.])${PUBLICA_SECRETA}[\"']?[[:space:]]*[:=]|env\\.${PUBLICA_SECRETA}([^A-Za-z0-9_]|\$)" "$CONTENIDO"; then
  printf 'GUARDIAN AYBAR (G7, aybar-datos-que-no-salen): %s\n' "variable publica del frontend con nombre de secreto." >&2
  printf '  VITE_* y NEXT_PUBLIC_* se incrustan en el bundle que descarga el navegador:\n' >&2
  printf '  lo que vaya ahi lo lee cualquiera. En el front no hay secretos (un cliente\n' >&2
  printf '  publico con PKCE no tiene client_secret); si una llamada necesita uno, va\n' >&2
  printf '  por el backend.\n' >&2
  printf '  Archivo: %s\n' "${REL:-${RUTA:-desconocido}}" >&2
  exit 2
fi

# --- PII: tarjetas ----------------------------------------------------------------
# 16 digitos que pasan Luhn y no parecen sinteticos (0000, 1111, 1234, 4242...).
# Luhn quita el ruido de ids numericos largos: una tarjeta real siempre lo pasa.
luhn() {
  local n="$1" suma=0 doble=0 i d
  for ((i = ${#n} - 1; i >= 0; i--)); do
    d="${n:i:1}"
    if [ "$doble" -eq 1 ]; then
      d=$((d * 2))
      if [ "$d" -gt 9 ]; then d=$((d - 9)); fi
    fi
    suma=$((suma + d))
    doble=$((1 - doble))
  done
  [ $((suma % 10)) -eq 0 ]
}

while IFS= read -r m; do
  [ -n "$m" ] || continue
  digitos="$(printf '%s' "$m" | tr -cd '0-9')"
  [ "${#digitos}" -eq 16 ] || continue
  if contiene '0{4,}|1{4,}|1234|9999|4242|5555' "$digitos"; then continue; fi
  if luhn "$digitos"; then
    secreto "parece un numero de tarjeta real (16 digitos, pasa Luhn, termina en ${digitos:12:4}). Usa datos sinteticos."
  fi
done <<< "$(hallazgos '(^|[^0-9])[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}([^0-9]|$)')"

exit 0
