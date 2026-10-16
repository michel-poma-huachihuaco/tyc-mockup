# comprobar-entorno.ps1 - revisa que estan las variables de entorno que
# aybar-atc necesita ANTES de arrancar, y explica que falta.
#
#   .\comprobar-entorno.ps1
#
# Devuelve codigo de salida 1 si falta algo obligatorio y 0 si no, asi que sirve
# tal cual en un paso de CI. El equivalente para bash es comprobar-entorno.sh, en
# esta misma carpeta: mismas comprobaciones, misma salida.
#
# Solo comprueba los starters con los que se genero el servicio. La guia completa,
# con el mensaje literal de cada fallo, esta en docs/VARIABLES.md.
#
# NO comprueba conectividad: que la variable este puesta no garantiza que el
# broker o el emisor OIDC respondan.
#
# COMPATIBILIDAD: el objetivo es Windows PowerShell 5.1, que es el que viene con
# Windows, no solo PowerShell 7. Por eso no se usan el operador ternario, ??, ni
# $PSStyle, que son de 7+. Tampoco se invoca ningun ejecutable nativo: en 5.1,
# con $ErrorActionPreference = 'Stop', lo que un nativo escriba en stderr puede
# convertirse en excepcion y abortar el script. Si algun dia hace falta llamar a
# uno, se usa el patron de nuevo-servicio.ps1: bajar la preferencia a 'Continue'
# solo para esa llamada, capturar con 2>&1, y restaurarla despues.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$errores = 0
$avisos  = 0

function Valor([string] $nombre) {
    $v = [Environment]::GetEnvironmentVariable($nombre)
    if ($null -eq $v) { return '' }
    return $v
}

function Definida([string] $nombre) {
    return -not [string]::IsNullOrWhiteSpace((Valor $nombre))
}

function EscribirOk([string] $texto) {
    Write-Host '  [ OK ]    ' -ForegroundColor Green -NoNewline
    Write-Host $texto
}

function EscribirAviso([string] $texto) {
    Write-Host '  [AVISO]   ' -ForegroundColor Yellow -NoNewline
    Write-Host $texto
    $script:avisos = $script:avisos + 1
}

function EscribirFalta([string] $texto) {
    Write-Host '  [FALTA]   ' -ForegroundColor Red -NoNewline
    Write-Host $texto
    $script:errores = $script:errores + 1
}

function EscribirNota([string] $texto) {
    Write-Host "            $texto" -ForegroundColor DarkGray
}

function EscribirTitulo([string] $texto) {
    Write-Host ''
    Write-Host $texto -ForegroundColor Cyan
}

# ------------------------------------------------------------------------------
# Perfil activo: decide que es obligatorio
# ------------------------------------------------------------------------------
# Sin la variable NO hay perfil: el application.yml no trae uno por defecto, y el
# SDK trata "sin perfil" como entorno real. Se comprueba como fuera de 'local'.
$perfil = Valor 'SPRING_PROFILES_ACTIVE'
$perfilSinDefinir = [string]::IsNullOrWhiteSpace($perfil)
if ($perfilSinDefinir) { $perfil = '(ninguno)' }
$esLocal = ($perfil -eq 'local')

Write-Host ''
Write-Host 'Comprobacion de entorno de aybar-atc' -ForegroundColor Cyan
Write-Host "Perfil activo: $perfil"
if ($perfilSinDefinir) {
    EscribirAviso 'SPRING_PROFILES_ACTIVE sin definir: el servicio arranca SIN perfil (entorno real), no en "local"'
    EscribirNota 'En desarrollo: $env:SPRING_PROFILES_ACTIVE = "local" (aybar run ya la pone).'
}
if ($esLocal) {
    Write-Host 'En "local" el application.yml trae valores por defecto, asi que casi nada es obligatorio.'
} else {
    Write-Host 'FUERA de "local" no hay valores por defecto: lo obligatorio lo es de verdad.'
}

# ------------------------------------------------------------------------------
# Base
# ------------------------------------------------------------------------------
EscribirTitulo 'Base'

$puerto = Valor 'SERVER_PORT'
if ([string]::IsNullOrWhiteSpace($puerto)) {
    EscribirOk 'SERVER_PORT sin definir: se usara 8081'
} elseif ($puerto -match '^[0-9]+$') {
    EscribirOk "SERVER_PORT = $puerto"
} else {
    EscribirFalta "SERVER_PORT no es un numero: '$puerto'"
}

# Variables retiradas que siguen circulando en documentacion vieja. Spring las
# convierte en una propiedad igualmente, asi que nadie protesta si se quedan
# puestas: por eso conviene avisar aqui.
foreach ($retirada in @('AYBAR_RESILIENCE_ENABLED', 'AYBAR_REDIS_URI', 'AYBAR_DISCOVERY_MODO')) {
    if (Definida $retirada) {
        EscribirAviso "$retirada esta definida y NO hace nada. Ver docs/VARIABLES.md"
    }
}
if (Definida 'AYBAR_RESILIENCE_ENABLED') {
    EscribirNota 'La que funciona es AYBAR_LOGGING_RESILIENCE_ENABLED.'
}


# ------------------------------------------------------------------------------
# aybar-starter-data
# ------------------------------------------------------------------------------
EscribirTitulo 'aybar-starter-data (PostgreSQL / MongoDB)'

$uriDatos = Valor 'AYBAR_DATASOURCE_URI'
if ([string]::IsNullOrWhiteSpace($uriDatos)) {
    if ($esLocal) {
        EscribirOk 'AYBAR_DATASOURCE_URI sin definir: en "local" se usa el H2 en memoria'
    } else {
        EscribirFalta "AYBAR_DATASOURCE_URI es obligatoria con el perfil '$perfil'"
        EscribirNota 'Formato: jdbc:postgresql://usuario:clave@host:puerto/base'
    }
} elseif ($uriDatos.StartsWith('jdbc:')) {
    EscribirOk 'AYBAR_DATASOURCE_URI definida'
} else {
    EscribirFalta 'AYBAR_DATASOURCE_URI no empieza por "jdbc:"'
    EscribirNota 'El arranque fallaria con:  (''url'' must start with "jdbc")'
    EscribirNota 'Formato: jdbc:postgresql://usuario:clave@host:puerto/base'
}

foreach ($retirada in @('AYBAR_DATASOURCE_USER', 'AYBAR_DATASOURCE_PASSWORD', 'AYBAR_DATASOURCE_URL')) {
    if (Definida $retirada) {
        EscribirAviso "$retirada esta definida y NO hace nada. Ver docs/VARIABLES.md"
        EscribirNota 'Las credenciales van dentro de AYBAR_DATASOURCE_URI.'
    }
}

if (Definida 'AYBAR_MONGO_URI') {
    EscribirOk 'AYBAR_MONGO_URI definida'
    if ($esLocal) {
        EscribirAviso 'Con el perfil "local", MongoDB esta excluido en application.yml'
        EscribirNota 'Si no quitas las dos lineas de "exclude", el arranque se cae con:'
        EscribirNota "Included health contributor 'mongo' in group 'readiness' does not exist"
    }
} else {
    EscribirOk 'AYBAR_MONGO_URI sin definir: el servicio no hablara con MongoDB'
}



# ------------------------------------------------------------------------------
# aybar-starter-messaging
# ------------------------------------------------------------------------------
EscribirTitulo 'aybar-starter-messaging (Kafka)'

if (Definida 'AYBAR_KAFKA_BOOTSTRAP') {
    EscribirOk ('AYBAR_KAFKA_BOOTSTRAP = ' + (Valor 'AYBAR_KAFKA_BOOTSTRAP'))
} elseif ($esLocal) {
    EscribirOk 'AYBAR_KAFKA_BOOTSTRAP sin definir: en "local" el yml usa localhost:9094'
} else {
    EscribirFalta "AYBAR_KAFKA_BOOTSTRAP es obligatoria con el perfil '$perfil'"
    EscribirNota 'Sin ella el arranque se detiene con:'
    EscribirNota 'spring.kafka.bootstrap-servers (AYBAR_KAFKA_BOOTSTRAP) es obligatorio:'
    EscribirNota 'sin este valor el arranque no puede continuar'
    EscribirNota 'Formato: host:puerto'
}



# ------------------------------------------------------------------------------
# aybar-starter-security
# ------------------------------------------------------------------------------
EscribirTitulo 'aybar-starter-security (emisor OIDC)'

if (Definida 'AYBAR_ISSUER_URI') {
    EscribirOk ('AYBAR_ISSUER_URI = ' + (Valor 'AYBAR_ISSUER_URI'))
} elseif ($esLocal) {
    EscribirOk 'AYBAR_ISSUER_URI sin definir: en "local" arranca sin emisor y lo protegido responde 401'
    EscribirNota 'Para validar tokens reales, definela con el emisor OIDC que fije el ADR'
} else {
    EscribirFalta "AYBAR_ISSUER_URI es obligatoria con el perfil '$perfil'"
    EscribirNota 'Sin ella no se crea el JwtDecoder y el contexto no arranca. El error NO'
    EscribirNota 'nombra la variable, dice:'
    EscribirNota "required a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder'"
    EscribirNota 'Formato: URL del emisor (issuer), sin barra final'
}

if (Definida 'AYBAR_JWT_AUDIENCE') {
    EscribirOk ('AYBAR_JWT_AUDIENCE = ' + (Valor 'AYBAR_JWT_AUDIENCE'))
} elseif ($esLocal) {
    EscribirOk 'AYBAR_JWT_AUDIENCE sin definir: en "local" vale aybar-atc'
} else {
    EscribirFalta "AYBAR_JWT_AUDIENCE es obligatoria con el perfil '$perfil'"
    EscribirNota 'Sin ella ningun token se acepta: el claim aud tiene que traer este servicio.'
    EscribirNota 'Formato: una audiencia, o varias separadas por comas'
}



# ------------------------------------------------------------------------------
# aybar-starter-client
# ------------------------------------------------------------------------------
EscribirTitulo 'aybar-starter-client (HTTP entre servicios)'

$tieneClientId = Definida 'AYBAR_CLIENT_CLIENT_ID'
$tieneTokenUri = Definida 'AYBAR_CLIENT_TOKEN_URI'
if ($tieneClientId -and (-not $tieneTokenUri)) {
    EscribirFalta 'AYBAR_CLIENT_CLIENT_ID esta definida pero AYBAR_CLIENT_TOKEN_URI no'
    EscribirNota 'Esta combinacion TUMBA el arranque:'
    EscribirNota 'aybar.client.token-uri es obligatorio para client-credentials'
} elseif ($tieneClientId) {
    EscribirOk 'Client-credentials configurado (token-uri + client-id)'
    if (-not (Definida 'AYBAR_CLIENT_CLIENT_SECRET')) {
        EscribirAviso 'AYBAR_CLIENT_CLIENT_SECRET sin definir'
    }
} else {
    EscribirOk 'Sin client-credentials: el servicio arranca igual'
    EscribirNota 'El interceptor sigue montado: correlationId y bearer del usuario (a los hosts permitidos).'
}

if (Definida 'AYBAR_CLIENT_HOSTS_CON_TOKEN') {
    EscribirOk 'AYBAR_CLIENT_HOSTS_CON_TOKEN definida'
} else {
    EscribirAviso 'AYBAR_CLIENT_HOSTS_CON_TOKEN sin definir: el token NO se adjunta a ningun destino'
    EscribirNota 'Las llamadas salen sin Authorization (401 en destino). Declara los hosts de tus APIs.'
}



# ------------------------------------------------------------------------------
# aybar-starter-audit
# ------------------------------------------------------------------------------
EscribirTitulo 'aybar-starter-audit (Ley 29733)'

if (Definida 'AYBAR_AUDIT_S3_BUCKET') {
    EscribirOk ('AYBAR_AUDIT_S3_BUCKET = ' + (Valor 'AYBAR_AUDIT_S3_BUCKET'))
    EscribirAviso 'S3 solo se activa si el pom.xml declara software.amazon.awssdk:s3'
    EscribirNota 'El archetype NO lo declara: tal cual, este bucket se ignora EN SILENCIO.'
} elseif (Definida 'AYBAR_AUDIT_NDJSON_DIR') {
    EscribirOk ('AYBAR_AUDIT_NDJSON_DIR = ' + (Valor 'AYBAR_AUDIT_NDJSON_DIR'))
    EscribirNota 'El directorio se crea al escribir el primer evento, no al arrancar.'
} else {
    EscribirAviso 'Sin AYBAR_AUDIT_NDJSON_DIR ni AYBAR_AUDIT_S3_BUCKET'
    EscribirNota 'El servicio arranca, pero la auditoria se escribe en el log de la aplicacion.'
    EscribirNota 'Si auditoria espera un soporte aparte, define uno de los dos.'
}


# ------------------------------------------------------------------------------
# Skills copiadas: comprobar que el sello sigue vigente
# ------------------------------------------------------------------------------
# docs/skills lleva copias SELLADAS de las skills del SDK. Una copia caducada es
# peor que no tenerla: la IA con la que trabajas seguira una instruccion que ya no
# es cierta, y con la misma confianza que una vigente. Esto no compara el contenido
# -no puede, el original no esta aqui-, solo la version del sello contra lo que
# tienes instalado en el repositorio Maven local.
EscribirTitulo 'Skills del SDK (docs/skills)'

$dirSkills = 'docs/skills'
if (-not (Test-Path -LiteralPath $dirSkills -PathType Container)) {
    EscribirAviso "no hay carpeta $dirSkills"
    EscribirNota 'El generador la crea; si la has borrado, la IA se queda sin el contrato de los starters.'
} else {
    $sello = ''
    foreach ($f in (Get-ChildItem -LiteralPath $dirSkills -Filter '*.md' -File)) {
        foreach ($linea in (Get-Content -LiteralPath $f.FullName)) {
            $m = [regex]::Match($linea, '^> Sellado: SDK ([^ ]+) \|')
            if ($m.Success) { $sello = $m.Groups[1].Value; break }
        }
        if ($sello) { break }
    }

    if ([string]::IsNullOrWhiteSpace($sello)) {
        EscribirAviso "las copias de $dirSkills no llevan sello de version"
        EscribirNota 'Sin sello no se puede saber de que version del SDK salieron. Rehazlas con'
        EscribirNota 'aybar skills sync, o borralas antes que dejar contexto sin fecha.'
    } else {
        $repoSkill = Join-Path $HOME '.m2\repository\com\aybarsac\sdk\aybar-starter-config'
        if (-not (Test-Path -LiteralPath $repoSkill -PathType Container)) {
            EscribirAviso "el SDK no esta instalado en $HOME\.m2 (sello de las skills: $sello)"
            EscribirNota 'Instalalo con:  (cd <repo del SDK>; mvn -B install -DskipTests)'
        } elseif (Test-Path -LiteralPath (Join-Path $repoSkill $sello) -PathType Container) {
            EscribirOk "skills selladas con la version $sello, que es la que tienes instalada"
        } else {
            $instaladas = (Get-ChildItem -LiteralPath $repoSkill -Directory | ForEach-Object { $_.Name }) -join ' '
            EscribirAviso "las skills de $dirSkills estan selladas con $sello, que NO tienes instalada"
            EscribirNota "Instaladas en ~/.m2: $instaladas"
            EscribirNota 'Lo que hay en docs/skills puede no describir el SDK que usa este servicio.'
            EscribirNota 'Rehazlas con aybar skills sync (usa la version del aybar-bom del pom.xml),'
            EscribirNota 'o no te fies de esas copias.'
        }
    }
}

# ------------------------------------------------------------------------------
# Resumen
# ------------------------------------------------------------------------------
Write-Host ''
if ($errores -gt 0) {
    Write-Host "No arranques todavia: $errores cosa(s) obligatoria(s) sin resolver, $avisos aviso(s)." -ForegroundColor Red
    Write-Host 'Detalle de cada variable en docs/VARIABLES.md'
    Write-Host ''
    exit 1
}
if ($avisos -gt 0) {
    Write-Host "Puede arrancar, con $avisos aviso(s) que conviene mirar." -ForegroundColor Yellow
    Write-Host 'Detalle en docs/VARIABLES.md'
    Write-Host ''
    exit 0
}
Write-Host 'Todo listo: no falta ninguna variable.' -ForegroundColor Green
Write-Host ''
