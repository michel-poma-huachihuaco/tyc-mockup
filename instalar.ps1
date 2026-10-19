# Lo primero tras clonar este repositorio:  .\instalar.ps1
#
# Si la CLI aybar del Aybar SDK esta instalada, ejecuta "aybar install" con los
# argumentos que le pases (--continuar, --sin-kit, --sin-nexora, ...): comprueba
# la maquina, instala el kit de agentes de usuario, baja las dependencias,
# configura el MCP de Nexora con tu token y corre el arranque. Si no esta,
# explica como instalarla y para. No instala herramientas del sistema.
#
# ASCII puro y compatible con Windows PowerShell 5.1 (ver CONTRIBUTING del SDK).

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$aybar = Get-Command aybar -ErrorAction SilentlyContinue
if ($aybar) {
    & aybar install @args
    exit $LASTEXITCODE
}

$repo = 'jose-jeampier-jara-salas/aybar-sdk'
Write-Host 'Falta la CLI aybar del Aybar SDK (este repositorio se genero con la 0.7.1).'
Write-Host 'Se instala una vez por maquina, desde la release del SDK. Hace falta Java 21 y,'
Write-Host 'para el frontend, Node 22 y la CLI gh con sesion (gh auth login).'
Write-Host ''
Write-Host '  Una sola vez por usuario (no pide administrador):'
Write-Host '    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser'
Write-Host '  En una carpeta vacia:'
Write-Host ("    gh release download v0.7.1 --repo " + $repo + " --pattern 'aybar-sdk-*.tar.gz*' --pattern install.ps1")
Write-Host '    Unblock-File .\install.ps1'
Write-Host '    .\install.ps1                 # -Yes: sin preguntas; -SoloBackend: sin frontend'
Write-Host ''
Write-Host ('  (Si esa version no tiene release, la ultima: gh release list --repo ' + $repo + ')')
Write-Host ''
Write-Host 'Despues abre una terminal NUEVA y vuelve a correr .\instalar.ps1'
Write-Host 'Guia completa: INSTALL.md del Aybar SDK.'
exit 1
