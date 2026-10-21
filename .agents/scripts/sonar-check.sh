#!/usr/bin/env bash
#
# sonar-check.sh - analisis estatico para el criterio de G5 ("sin bloqueantes
# nuevos") y G7. Es un envoltorio honesto: si Sonar no esta configurado LO
# DICE y sale con 2, en vez de un verde que no analizo nada.
#
#   SONAR_HOST_URL=https://sonar... SONAR_TOKEN=... .agents/scripts/sonar-check.sh
#
# Analiza con el plugin de Maven, asi que necesita el pom.xml del backend. El
# frontend (frontend/) aun no tiene envoltorio: Sonar lo analiza con
# sonar-scanner, y hasta que el proyecto lo configure queda SIN verificar (2).
set -euo pipefail
RAIZ="$(git rev-parse --show-toplevel)"
if [ -z "${SONAR_HOST_URL:-}" ] || [ -z "${SONAR_TOKEN:-}" ]; then
  cat >&2 <<'FIN'
[!] Sonar sin configurar: faltan SONAR_HOST_URL y/o SONAR_TOKEN.
    El criterio de G5 "analisis estatico sin bloqueantes nuevos" queda SIN
    verificar; que conste en el PR. Configura las variables o el paso de CI.
FIN
  exit 2
fi
if [ ! -f "$RAIZ/pom.xml" ]; then
  cat >&2 <<'FIN'
[!] Sin pom.xml no hay analisis por Maven. El frontend se analiza con
    sonar-scanner, que este envoltorio todavia no trae: el criterio de G5
    queda SIN verificar; que conste en el PR.
FIN
  exit 2
fi
if [ -f "$RAIZ/frontend/package.json" ]; then
  echo "[!] Sonar analiza el backend; frontend/ queda fuera de este analisis (sonar-scanner)." >&2
fi
# El token NO va por linea de ordenes: en argv lo ve cualquiera con ps y queda en
# los logs del CI. El scanner de Maven lee SONAR_TOKEN del entorno por su cuenta.
exec "$RAIZ/mvnw" -B -ntp verify sonar:sonar -Dsonar.host.url="$SONAR_HOST_URL"
