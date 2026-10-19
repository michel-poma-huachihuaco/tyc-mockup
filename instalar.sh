#!/usr/bin/env sh
# Lo primero tras clonar este repositorio:  ./instalar.sh
#
# Si la CLI `aybar` del Aybar SDK esta instalada, ejecuta `aybar install` con
# los argumentos que le pases (--continuar, --sin-kit, --sin-nexora, ...):
# comprueba la maquina, instala el kit de agentes de usuario, baja las
# dependencias, configura el MCP de Nexora con tu token y corre el arranque.
# Si no esta, explica como instalarla y para. No instala herramientas del sistema.
set -eu

cd "$(dirname "$0")"

if command -v aybar >/dev/null 2>&1; then
  exec aybar install "$@"
fi

cat >&2 <<'AYUDA'
Falta la CLI `aybar` del Aybar SDK (este repositorio se genero con la 0.7.1).
Se instala una vez por maquina, desde la release del SDK. Hace falta Java 21 y,
para el frontend, Node 22 y la CLI gh con sesion (gh auth login).

  En una carpeta vacia:
    gh release download v0.7.1 --repo jose-jeampier-jara-salas/aybar-sdk \
      --pattern 'aybar-sdk-*.tar.gz*' --pattern install.sh
    bash install.sh            # --yes: sin preguntas; --solo-backend: sin frontend

  (Si esa version no tiene release, la ultima: gh release list --repo jose-jeampier-jara-salas/aybar-sdk)

Despues abre una terminal NUEVA (para que vea ~/.local/bin en el PATH) y vuelve a correr ./instalar.sh
Guia completa: INSTALL.md del Aybar SDK.
AYUDA
exit 1
