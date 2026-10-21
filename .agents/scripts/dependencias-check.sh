#!/usr/bin/env bash
#
# dependencias-check.sh - analisis de dependencias para G7 ("0 criticas; altas
# justificadas con fecha de correccion"). Envoltorio honesto, como
# sonar-check.sh: si no puede analizar EN CONDICIONES lo dice y sale con 2,
# en vez de un verde que no analizo nada.
#
#   NVD_API_KEY=... .agents/scripts/dependencias-check.sh [--backend|--frontend]
#
# Analiza lo que haya: el backend (pom.xml en la raiz) con OWASP
# dependency-check y el frontend (frontend/package.json) con npm audit, que
# corta con vulnerabilidades altas o criticas. --backend o --frontend limitan
# el analisis a uno (el pipeline los corre en jobs separados).
#
# Backend: sin NVD_API_KEY el analisis no arranca (el pom pasa la clave vacia
# y NVD la rechaza); por eso aqui es requisito. En local: aybar verify
# dependencias (la toma tambien del .env del servicio).
# Frontend: npm audit lee el package-lock.json; sin el no hay analisis.
set -euo pipefail
RAIZ="$(git rev-parse --show-toplevel)"
SOLO="${1:-}"
case "$SOLO" in
  ''|--backend|--frontend) ;;
  *) echo "Uso: dependencias-check.sh [--backend|--frontend]" >&2; exit 1 ;;
esac
estado=0
analizo=0

if [ "$SOLO" != --backend ] && [ -f "$RAIZ/frontend/package.json" ]; then
  if [ -f "$RAIZ/frontend/package-lock.json" ]; then
    analizo=1
    (cd "$RAIZ/frontend" && npm audit --audit-level=high)
  else
    echo "[!] frontend/ sin package-lock.json: npm audit no tiene que analizar; queda SIN verificar." >&2
    estado=2
  fi
fi

if [ "$SOLO" != --frontend ] && [ -f "$RAIZ/pom.xml" ]; then
  if [ -z "${NVD_API_KEY:-}" ]; then
    cat >&2 <<'FIN'
[!] dependency-check sin NVD_API_KEY: el criterio de G7 "dependencias: 0
    criticas" queda SIN verificar en este pipeline; que conste en el PR.
    Clave gratuita: https://nvd.nist.gov/developers/request-an-api-key
FIN
    exit 2
  fi
  analizo=1
  "$RAIZ/mvnw" -B -ntp -Pseguridad -DskipTests verify
fi

if [ "$analizo" -eq 0 ] && [ "$estado" -eq 0 ]; then
  echo "[!] No hay dependencias que analizar (ni pom.xml ni frontend/package.json): SIN verificar." >&2
  estado=2
fi
exit "$estado"
