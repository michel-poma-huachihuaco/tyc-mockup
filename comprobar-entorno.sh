#!/usr/bin/env bash
#
# comprobar-entorno.sh - revisa que estan las variables de entorno que
# aybar-atc necesita ANTES de arrancar, y explica que falta.
#
#   ./comprobar-entorno.sh
#
# Devuelve 0 si el servicio puede arrancar y 1 si falta algo obligatorio, asi que
# sirve tal cual en un paso de CI o en el arranque de un contenedor.
#
# Solo comprueba los starters con los que se genero el servicio. La guia completa,
# con el mensaje literal de cada fallo, esta en docs/VARIABLES.md.
#
# NO comprueba conectividad: no abre sockets ni llama a docker. Que la variable
# este puesta no garantiza que el broker o el emisor OIDC respondan.
#
# COMPATIBILIDAD: se limita a bash 3.2, que es el que trae macOS. Sin arrays
# asociativos y sin ${{var,,}. Las variables se leen con 'printenv'
# para no depender de expansiones con llaves.
set -eu

# printenv en vez de expansion: devuelve cadena vacia si no esta definida, sin
# que 'set -u' aborte y sin escribir ${{...} en esta plantilla.
valor() { printenv "$1" 2>/dev/null || true; }

definida() { [ -n "$(valor "$1")" ]; }

if [ -t 1 ] && [ -z "$(valor NO_COLOR)" ]; then
    C_ROJO=$(printf '\033[31m'); C_VERDE=$(printf '\033[32m')
    C_AMAR=$(printf '\033[33m'); C_NEG=$(printf '\033[1m'); C_FIN=$(printf '\033[0m')
else
    C_ROJO=''; C_VERDE=''; C_AMAR=''; C_NEG=''; C_FIN=''
fi

errores=0
avisos=0

ok()     { printf '  %s[ OK ]%s    %s\n' "$C_VERDE" "$C_FIN" "$1"; }
aviso()  { printf '  %s[AVISO]%s   %s\n' "$C_AMAR" "$C_FIN" "$1"; avisos=$((avisos + 1)); }
falta()  { printf '  %s[FALTA]%s   %s\n' "$C_ROJO" "$C_FIN" "$1"; errores=$((errores + 1)); }
titulo() { printf '\n%s%s%s\n' "$C_NEG" "$1" "$C_FIN"; }
nota()   { printf '            %s\n' "$1"; }

# ------------------------------------------------------------------------------
# Perfil activo: decide que es obligatorio
# ------------------------------------------------------------------------------
# Sin la variable NO hay perfil: el application.yml no trae uno por defecto, y el
# SDK trata "sin perfil" como entorno real. Se comprueba como fuera de 'local'.
perfil=$(valor SPRING_PROFILES_ACTIVE)
if [ -z "$perfil" ]; then perfil='(ninguno)'; fi
es_local='no'
if [ "$perfil" = 'local' ]; then es_local='si'; fi

printf '\n%sComprobacion de entorno de aybar-atc%s\n' "$C_NEG" "$C_FIN"
printf 'Perfil activo: %s\n' "$perfil"
if [ -z "$(valor SPRING_PROFILES_ACTIVE)" ]; then
    aviso 'SPRING_PROFILES_ACTIVE sin definir: el servicio arranca SIN perfil (entorno real), no en "local"'
    nota 'En desarrollo: export SPRING_PROFILES_ACTIVE=local (aybar run ya la pone).'
fi
if [ "$es_local" = 'si' ]; then
    printf 'En "local" el application.yml trae valores por defecto, asi que casi nada es obligatorio.\n'
else
    printf 'FUERA de "local" no hay valores por defecto: lo obligatorio lo es de verdad.\n'
fi

# ------------------------------------------------------------------------------
# Base
# ------------------------------------------------------------------------------
titulo 'Base'

puerto=$(valor SERVER_PORT)
if [ -z "$puerto" ]; then
    ok "SERVER_PORT sin definir: se usara 8081"
else
    case "$puerto" in
        ''|*[!0-9]*) falta "SERVER_PORT no es un numero: '$puerto'" ;;
        *)           ok "SERVER_PORT = $puerto" ;;
    esac
fi

# ------------------------------------------------------------------------------
# Variables retiradas que siguen circulando en documentacion vieja.
# Spring las convierte en una propiedad igualmente, asi que nadie protesta si se
# quedan puestas: por eso conviene avisar aqui.
# ------------------------------------------------------------------------------
for retirada in AYBAR_RESILIENCE_ENABLED AYBAR_REDIS_URI AYBAR_DISCOVERY_MODO; do
    if definida "$retirada"; then
        aviso "$retirada esta definida y NO hace nada. Ver docs/VARIABLES.md"
    fi
done
if definida AYBAR_RESILIENCE_ENABLED; then
    nota 'La que funciona es AYBAR_LOGGING_RESILIENCE_ENABLED.'
fi


# ------------------------------------------------------------------------------
# aybar-starter-data
# ------------------------------------------------------------------------------
titulo 'aybar-starter-data (PostgreSQL / MongoDB)'

uri_datos=$(valor AYBAR_DATASOURCE_URI)
if [ -z "$uri_datos" ]; then
    if [ "$es_local" = 'si' ]; then
        ok 'AYBAR_DATASOURCE_URI sin definir: en "local" se usa el H2 en memoria'
    else
        falta "AYBAR_DATASOURCE_URI es obligatoria con el perfil '$perfil'"
        nota 'Formato: jdbc:postgresql://usuario:clave@host:puerto/base'
    fi
else
    case "$uri_datos" in
        jdbc:*) ok 'AYBAR_DATASOURCE_URI definida' ;;
        *)      falta 'AYBAR_DATASOURCE_URI no empieza por "jdbc:"'
                nota 'El arranque fallaria con:  ('"'"'url'"'"' must start with "jdbc")'
                nota 'Formato: jdbc:postgresql://usuario:clave@host:puerto/base' ;;
    esac
fi

for retirada in AYBAR_DATASOURCE_USER AYBAR_DATASOURCE_PASSWORD AYBAR_DATASOURCE_URL; do
    if definida "$retirada"; then
        aviso "$retirada esta definida y NO hace nada. Ver docs/VARIABLES.md"
        nota 'Las credenciales van dentro de AYBAR_DATASOURCE_URI.'
    fi
done

if definida AYBAR_MONGO_URI; then
    ok 'AYBAR_MONGO_URI definida'
    if [ "$es_local" = 'si' ]; then
        aviso 'Con el perfil "local", MongoDB esta excluido en application.yml'
        nota 'Si no quitas las dos lineas de "exclude", el arranque se cae con:'
        nota "Included health contributor 'mongo' in group 'readiness' does not exist"
    fi
else
    ok 'AYBAR_MONGO_URI sin definir: el servicio no hablara con MongoDB'
fi



# ------------------------------------------------------------------------------
# aybar-starter-messaging
# ------------------------------------------------------------------------------
titulo 'aybar-starter-messaging (Kafka)'

if definida AYBAR_KAFKA_BOOTSTRAP; then
    ok "AYBAR_KAFKA_BOOTSTRAP = $(valor AYBAR_KAFKA_BOOTSTRAP)"
elif [ "$es_local" = 'si' ]; then
    ok 'AYBAR_KAFKA_BOOTSTRAP sin definir: en "local" el yml usa localhost:9094'
else
    falta "AYBAR_KAFKA_BOOTSTRAP es obligatoria con el perfil '$perfil'"
    nota 'Sin ella el arranque se detiene con:'
    nota 'spring.kafka.bootstrap-servers (AYBAR_KAFKA_BOOTSTRAP) es obligatorio:'
    nota 'sin este valor el arranque no puede continuar'
    nota 'Formato: host:puerto'
fi



# ------------------------------------------------------------------------------
# aybar-starter-security
# ------------------------------------------------------------------------------
titulo 'aybar-starter-security (emisor OIDC)'

if definida AYBAR_ISSUER_URI; then
    ok "AYBAR_ISSUER_URI = $(valor AYBAR_ISSUER_URI)"
elif [ "$es_local" = 'si' ]; then
    ok 'AYBAR_ISSUER_URI sin definir: en "local" arranca sin emisor y lo protegido responde 401'
    nota 'Para validar tokens reales, definela con el emisor OIDC que fije el ADR'
else
    falta "AYBAR_ISSUER_URI es obligatoria con el perfil '$perfil'"
    nota 'Sin ella no se crea el JwtDecoder y el contexto no arranca. El error NO'
    nota 'nombra la variable, dice:'
    nota "required a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder'"
    nota 'Formato: URL del emisor (issuer), sin barra final'
fi

if definida AYBAR_JWT_AUDIENCE; then
    ok "AYBAR_JWT_AUDIENCE = $(valor AYBAR_JWT_AUDIENCE)"
elif [ "$es_local" = 'si' ]; then
    ok 'AYBAR_JWT_AUDIENCE sin definir: en "local" vale aybar-atc'
else
    falta "AYBAR_JWT_AUDIENCE es obligatoria con el perfil '$perfil'"
    nota 'Sin ella ningun token se acepta: el claim aud tiene que traer este servicio.'
    nota 'Formato: una audiencia, o varias separadas por comas'
fi



# ------------------------------------------------------------------------------
# aybar-starter-client
# ------------------------------------------------------------------------------
titulo 'aybar-starter-client (HTTP entre servicios)'

if definida AYBAR_CLIENT_CLIENT_ID && ! definida AYBAR_CLIENT_TOKEN_URI; then
    falta 'AYBAR_CLIENT_CLIENT_ID esta definida pero AYBAR_CLIENT_TOKEN_URI no'
    nota 'Esta combinacion TUMBA el arranque:'
    nota 'aybar.client.token-uri es obligatorio para client-credentials'
elif definida AYBAR_CLIENT_CLIENT_ID; then
    ok 'Client-credentials configurado (token-uri + client-id)'
    if ! definida AYBAR_CLIENT_CLIENT_SECRET; then
        aviso 'AYBAR_CLIENT_CLIENT_SECRET sin definir'
    fi
else
    ok 'Sin client-credentials: el servicio arranca igual'
    nota 'El interceptor sigue montado: correlationId y bearer del usuario (a los hosts permitidos).'
fi

if definida AYBAR_CLIENT_HOSTS_CON_TOKEN; then
    ok 'AYBAR_CLIENT_HOSTS_CON_TOKEN definida'
else
    aviso 'AYBAR_CLIENT_HOSTS_CON_TOKEN sin definir: el token NO se adjunta a ningun destino'
    nota 'Las llamadas salen sin Authorization (401 en destino). Declara los hosts de tus APIs.'
fi



# ------------------------------------------------------------------------------
# aybar-starter-audit
# ------------------------------------------------------------------------------
titulo 'aybar-starter-audit (Ley 29733)'

if definida AYBAR_AUDIT_S3_BUCKET; then
    ok "AYBAR_AUDIT_S3_BUCKET = $(valor AYBAR_AUDIT_S3_BUCKET)"
    aviso 'S3 solo se activa si el pom.xml declara software.amazon.awssdk:s3'
    nota 'El archetype NO lo declara: tal cual, este bucket se ignora EN SILENCIO.'
elif definida AYBAR_AUDIT_NDJSON_DIR; then
    ok "AYBAR_AUDIT_NDJSON_DIR = $(valor AYBAR_AUDIT_NDJSON_DIR)"
    nota 'El directorio se crea al escribir el primer evento, no al arrancar.'
else
    aviso 'Sin AYBAR_AUDIT_NDJSON_DIR ni AYBAR_AUDIT_S3_BUCKET'
    nota 'El servicio arranca, pero la auditoria se escribe en el log de la aplicacion.'
    nota 'Si auditoria espera un soporte aparte, define uno de los dos.'
fi


# ------------------------------------------------------------------------------
# Skills copiadas: comprobar que el sello sigue vigente
# ------------------------------------------------------------------------------
# docs/skills lleva copias SELLADAS de las skills del SDK. Una copia caducada es
# peor que no tenerla: la IA con la que trabajas seguira una instruccion que ya no
# es cierta, y con la misma confianza que una vigente. Esto no compara el contenido
# -no puede, el original no esta aqui-, solo la version del sello contra lo que
# tienes instalado en el repositorio Maven local.
titulo 'Skills del SDK (docs/skills)'

dir_skills='docs/skills'
if [ ! -d "$dir_skills" ]; then
    aviso "no hay carpeta $dir_skills"
    nota 'El generador la crea; si la has borrado, la IA se queda sin el contrato de los starters.'
else
    sello=''
    for f in "$dir_skills"/*.md; do
        [ -f "$f" ] || continue
        sello=$(sed -n 's/^> Sellado: SDK \([^ ]*\) |.*/\1/p' "$f" | head -1)
        [ -n "$sello" ] && break
    done

    if [ -z "$sello" ]; then
        aviso "las copias de $dir_skills no llevan sello de version"
        nota 'Sin sello no se puede saber de que version del SDK salieron. Rehazlas con'
        nota 'aybar skills sync, o borralas antes que dejar contexto sin fecha.'
    else
        repo_skill="$HOME/.m2/repository/com/aybarsac/sdk/aybar-starter-config"
        if [ ! -d "$repo_skill" ]; then
            aviso "el SDK no esta instalado en $HOME/.m2 (sello de las skills: $sello)"
            nota 'Instalalo con:  (cd <repo del SDK> && mvn -B install -DskipTests)'
        elif [ -d "$repo_skill/$sello" ]; then
            ok "skills selladas con la version $sello, que es la que tienes instalada"
        else
            # Solo directorios: en esa carpeta tambien hay maven-metadata-local.xml,
            # que no es una version y confundiria al leer el aviso.
            instaladas=$(find "$repo_skill" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null | LC_ALL=C sort | tr '\n' ' ')
            aviso "las skills de $dir_skills estan selladas con $sello, que NO tienes instalada"
            nota "Instaladas en ~/.m2: $instaladas"
            nota 'Lo que hay en docs/skills puede no describir el SDK que usa este servicio.'
            nota 'Rehazlas con aybar skills sync (usa la version del aybar-bom del pom.xml),'
            nota 'o no te fies de esas copias.'
        fi
    fi
fi

# ------------------------------------------------------------------------------
# Resumen
# ------------------------------------------------------------------------------
printf '\n'
if [ "$errores" -gt 0 ]; then
    printf '%sNo arranques todavia: %s cosa(s) obligatoria(s) sin resolver, %s aviso(s).%s\n' \
        "$C_ROJO$C_NEG" "$errores" "$avisos" "$C_FIN"
    printf 'Detalle de cada variable en docs/VARIABLES.md\n\n'
    exit 1
fi
if [ "$avisos" -gt 0 ]; then
    printf '%sPuede arrancar, con %s aviso(s) que conviene mirar.%s\n' "$C_AMAR$C_NEG" "$avisos" "$C_FIN"
    printf 'Detalle en docs/VARIABLES.md\n\n'
    exit 0
fi
printf '%sTodo listo: no falta ninguna variable.%s\n\n' "$C_VERDE$C_NEG" "$C_FIN"
