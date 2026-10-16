#!/usr/bin/env bash
#
# verificar.sh - la secuencia local previa a pedir revision (G5), en el mismo
# orden que el pipeline: estructura -> build y pruebas (backend y/o frontend,
# segun lo que tenga el repositorio) -> estatico si esta.
set -euo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$AQUI/validar-estructura.sh" "${1:-origin/main}"
"$AQUI/pruebas.sh" --todo
if [ -n "${SONAR_HOST_URL:-}" ] && [ -n "${SONAR_TOKEN:-}" ]; then
  # 2 = sin verificar (p. ej. un frontend sin pom.xml): lo dice y no corta.
  "$AQUI/sonar-check.sh" || [ $? -eq 2 ]
else
  echo "[!] Sonar sin configurar: el estatico queda pendiente para CI." >&2
fi
echo "[ok] Verificacion local completa. Lo que sigue es revision humana: G5."
