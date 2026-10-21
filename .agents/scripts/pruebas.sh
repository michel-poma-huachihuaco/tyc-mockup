#!/usr/bin/env bash
#
# pruebas.sh - pruebas del proyecto. Detecta que hay en el repositorio: el
# backend si hay pom.xml en la raiz y el frontend si hay frontend/package.json
# (en un monorepo, los dos).
#   .agents/scripts/pruebas.sh          unitarias (rapidas)
#   .agents/scripts/pruebas.sh --todo   backend: verify completo, unitarias + IT
#                                       (los IT con Testcontainers necesitan
#                                       Docker; sin demonio se saltan EN
#                                       SILENCIO y el verde no prueba nada);
#                                       frontend: pruebas + lint + build
set -euo pipefail
RAIZ="$(git rev-parse --show-toplevel)"
hizo=0

if [ -f "$RAIZ/pom.xml" ]; then
  hizo=1
  if [ "${1:-}" = "--todo" ]; then
    docker info >/dev/null 2>&1 || echo "[!] Docker no responde: los IT se van a saltar sin fallar." >&2
    "$RAIZ/mvnw" -B -ntp verify
  else
    "$RAIZ/mvnw" -B -ntp test
  fi
fi

if [ -f "$RAIZ/frontend/package.json" ]; then
  hizo=1
  FRONT="$RAIZ/frontend"
  if [ ! -d "$FRONT/node_modules" ]; then
    echo "[x] frontend/ sin dependencias: corre 'aybar install' (o 'npm ci' en frontend/; sin tokens)." >&2
    exit 1
  fi
  if grep -q '"test"[[:space:]]*:' "$FRONT/package.json"; then
    npm --prefix "$FRONT" run test
  else
    echo "[!] frontend/ no declara el script test: sus pruebas quedan SIN verificar." >&2
  fi
  if [ "${1:-}" = "--todo" ]; then
    npm --prefix "$FRONT" run lint --if-present
    npm --prefix "$FRONT" run build
  fi
fi

if [ "$hizo" -eq 0 ]; then
  echo "[x] Ni pom.xml en la raiz ni frontend/package.json: no hay nada que probar." >&2
  exit 1
fi
