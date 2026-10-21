#!/usr/bin/env bash
#
# arranque.sh - lo PRIMERO que corre cualquier agente de IA (y cualquier
# persona) al abrir este repositorio: entorno, certificacion del paquete
# Definir de docs/ y explorador al dia. Dice que falta; no arregla nada.
#
#   .agents/scripts/arranque.sh                      informe en texto
#   .agents/scripts/arranque.sh --formato json       el mismo informe en JSON (aybar.arranque/1)
#   .agents/scripts/arranque.sh --hook <herramienta> modo hook de sesion: nunca sale con error
#   .agents/scripts/arranque.sh --estricto           para CI: 1 si el paquete tiene errores o el
#                                                    explorador no esta al dia
#   .agents/scripts/arranque.sh --hay-paquete        0 si docs/ trae un paquete Definir, 1 si no
#   .agents/scripts/arranque.sh --huella             huella de las fuentes del explorador (sha256:...)
#
# Sin la CLI aybar (CI sin acceso al release del SDK, maquina recien clonada)
# no se puede validar el paquete, pero si saber si el explorador esta al dia:
# la pagina lleva <meta name="aybar-huella"> con la huella de las fuentes de
# docs/ de las que salio, y aqui se recalcula con coreutils. Con --estricto y
# sin CLI solo corta un explorador ausente o desactualizado.
#
# Herramientas de --hook (cada una espera su protocolo en stdout):
#   claude, codex, opencode   texto plano (se anade como contexto)
#   cursor                    JSON {"additional_context": ...}
#   gemini                    JSON {"hookSpecificOutput": {"additionalContext": ...}, "systemMessage": ...}
#                             (Gemini CLI exige que stdout sea SOLO ese JSON)
#   copilot                   JSON {"additionalContext": ...}
#
# Los hooks que lo llaman estan en .claude/settings.json, .cursor/hooks.json,
# .gemini/settings.json, .codex/hooks.json, .github/hooks/arranque.json y
# .opencode/plugins/arranque.ts. Kimi CLI y Hermes Agent solo admiten hooks
# de usuario: AGENTS.md explica como activarlo.
#
# Rapido (dos llamadas a la CLI, segundos) y sin red. Bash 3.2 (macOS) en
# adelante, sin jq ni python: el JSON de la CLI se lee con grep y awk.
set -u

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
DOCS="$RAIZ/docs"
EXPLORADOR_REL="docs/explorador.html"
# Sello de origen documental (ADR-007): oculto, no entra en la huella del explorador.
SELLO_REL="docs/.origen-documental.json"
MAX_EDAD_SELLO_HORAS=72

formato="texto"
hook=""
estricto=0
solo_hay_paquete=0
solo_huella=0

uso() {
    sed -n '3,25p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
    case "$1" in
        --formato) formato="${2:-}"; shift ;;
        --formato=*) formato="${1#*=}" ;;
        --hook) hook="${2:-}"; shift ;;
        --hook=*) hook="${1#*=}" ;;
        --estricto) estricto=1 ;;
        --hay-paquete) solo_hay_paquete=1 ;;
        --huella) solo_huella=1 ;;
        -h|--ayuda|--help) uso; exit 0 ;;
        *) echo "arranque.sh: opcion desconocida '$1' (usa --ayuda)" >&2; [ -n "$hook" ] && exit 0; exit 2 ;;
    esac
    shift
done

case "$formato" in texto|json) ;; *) echo "arranque.sh: --formato texto|json" >&2; exit 2 ;; esac
case "$hook" in ""|claude|codex|opencode|cursor|gemini|copilot) ;;
    *) echo "arranque.sh: --hook claude|cursor|gemini|codex|copilot|opencode" >&2; exit 0 ;;
esac

# ---------------------------------------------------------------- deteccion

# Hay paquete si alguna carpeta del alcance trae un .md, o hay tareas o flujos.
hay_paquete() {
    for c in analisis roadmap epicas features historias dor; do
        if [ -d "$DOCS/$c" ] && [ -n "$(find "$DOCS/$c" -type f -name '*.md' 2>/dev/null | head -1)" ]; then
            return 0
        fi
    done
    [ -n "$(find "$DOCS/backlog/tareas" -type f -name '*.json' 2>/dev/null | head -1)" ] && return 0
    [ -f "$DOCS/flujos/flujos.json" ] && return 0
    return 1
}

# Igual que HuellaPaquete de la CLI: el sha256 de las lineas "<sha256>  <ruta>"
# de cada fuente del explorador, ordenadas por bytes de la ruta (LC_ALL=C).
huella_docs() {
    local sumador="sha256sum"
    command -v sha256sum >/dev/null 2>&1 || sumador="shasum -a 256"
    (
        cd "$DOCS" 2>/dev/null || exit 0
        {
            find analisis roadmap epicas features historias dor adr arquitectura datos pruebas gates \
                -type f -name '*.md' -not -path '*/.*'
            find backlog/tareas -maxdepth 1 -type f -name '*.json' -not -path '*/.*'
            find flujos -maxdepth 1 -type f -name flujos.json
        } 2>/dev/null | LC_ALL=C sort | while IFS= read -r f; do $sumador "$f"; done
    ) | $sumador | awk '{ print "sha256:" $1 }'
}

huella_pagina() {
    grep -o 'name="aybar-huella" content="sha256:[0-9a-f]*"' "$RAIZ/$EXPLORADOR_REL" 2>/dev/null \
        | head -1 | sed 's/.*content="//; s/"$//'
}

if [ "$solo_huella" -eq 1 ]; then
    huella_docs
    exit 0
fi

if [ "$solo_hay_paquete" -eq 1 ]; then
    hay_paquete
    exit $?
fi

cli_disponible=0
cli_version=""
paquete_presente=0
paquete_valido=0
errores=0
advertencias=0
reglas=""
features=0
features_listas=0
explorador="no-aplica"   # al-dia | desactualizado | ausente | sin-comando | no-aplica | error
pendientes=""

anotar() { pendientes="${pendientes}${pendientes:+
}$1"; }

if command -v aybar >/dev/null 2>&1; then
    cli_disponible=1
    cli_version="$(aybar --version 2>/dev/null | head -1 | sed 's/^aybar //')"
else
    anotar "Instala la CLI aybar (install.sh del release del SDK; ver INSTALL.md del SDK) y vuelve a abrir la sesion: sin ella no se puede certificar el paquete."
fi

if hay_paquete; then
    paquete_presente=1
else
    anotar "docs/ todavia no tiene paquete Definir: el primer paso es el agente analista-paquete (skill aybar-paquete-definir)."
fi

if [ "$cli_disponible" -eq 1 ] && [ "$paquete_presente" -eq 1 ]; then
    salida="$(cd "$RAIZ" && aybar paquete validar docs --json 2>/dev/null)"
    codigo=$?
    if printf '%s' "$salida" | grep -q '"esquema"'; then
        [ "$codigo" -eq 0 ] && paquete_valido=1
        numero() { printf '%s' "$salida" | grep -o "\"$1\" *: *[0-9]*" | head -1 | grep -o '[0-9]*$'; }
        errores="$(numero errores)"; errores="${errores:-0}"
        advertencias="$(numero advertencias)"; advertencias="${advertencias:-0}"
        features="$(printf '%s' "$salida" | grep -c '"g4_origin_main"')"
        features_listas="$(printf '%s' "$salida" | grep -c '"lista" *: *true')"
        # Las tres reglas mas repetidas: de los errores si los hay, si no de las advertencias.
        nivel="ERROR"; [ "$errores" -eq 0 ] && nivel="ADVERTENCIA"
        reglas="$(printf '%s\n' "$salida" | awk -v nivel="$nivel" '
            /"nivel" *:/ { n = $0; sub(/.*"nivel" *: *"/, "", n); sub(/".*/, "", n) }
            /"regla" *:/ { r = $0; sub(/.*"regla" *: *"/, "", r); sub(/".*/, "", r); if (n == nivel) c[r]++ }
            END { for (r in c) print c[r], r }' | sort -rn | head -3 | awk '{ printf "%s%s x%s", (NR > 1 ? ", " : ""), $2, $1 }')"
        if [ "$paquete_valido" -eq 0 ]; then
            anotar "El paquete tiene $errores error(es): corrigelos (aybar paquete validar docs) antes de planificar. Los corrige el dueno de cada documento por PR."
        fi
    else
        anotar "aybar paquete validar no devolvio un informe (codigo $codigo): ejecutalo a mano para ver el error."
    fi

    (cd "$RAIZ" && aybar paquete explorador docs --comprobar >/dev/null 2>&1)
    case $? in
        0) explorador="al-dia" ;;
        1) if [ -f "$RAIZ/$EXPLORADOR_REL" ]; then explorador="desactualizado"; else explorador="ausente"; fi
           anotar "Regenera el explorador: aybar paquete explorador (escribe $EXPLORADOR_REL) y commitealo." ;;
        2) explorador="sin-comando"
           anotar "Tu CLI aybar no trae 'aybar paquete explorador': actualizala (aybar update)." ;;
        *) explorador="error"
           anotar "aybar paquete explorador --comprobar fallo: ejecutalo a mano." ;;
    esac
fi

# ---------------------------------------------------------------- sello de origen documental

# Si la documentacion se escribe y se aprueba fuera (p. ej. en Nexora), docs/ es
# una copia sellada: de donde viene, cuando se trajo y que espera aprobacion.
sello_presente=0
sello_fuente=""
sello_traido=""
sello_horas=""
sello_documentos=0
sello_pendientes=0
sello_huella_distinta=0
sello_firmas=""
if [ -f "$RAIZ/$SELLO_REL" ]; then
    sello_presente=1
    campo_sello() {
        grep -o "\"$1\" *: *\"[^\"]*\"" "$RAIZ/$SELLO_REL" 2>/dev/null | head -1 | sed 's/^[^:]*: *"//; s/"$//'
    }
    sello_fuente="$(campo_sello fuente)"; sello_fuente="${sello_fuente:-?}"
    sello_traido="$(campo_sello traido_en)"
    sello_documentos="$(grep -o '"huella_sha256"' "$RAIZ/$SELLO_REL" 2>/dev/null | wc -l | tr -d ' ')"
    sello_pendientes="$(grep -oE '"estado" *: *"(pendiente|rechazado)"' "$RAIZ/$SELLO_REL" 2>/dev/null | wc -l | tr -d ' ')"
    if [ -n "${salida:-}" ]; then
        sello_horas="$(printf '%s' "$salida" | grep -o '"edad_horas" *: *[0-9]*' | head -1 | grep -o '[0-9]*$')"
        sello_huella_distinta="$(printf '%s' "$salida" | grep -c '"regla" *: *"origen-huella-distinta"')"
    fi
    if [ -z "$sello_horas" ] && [ -n "$sello_traido" ]; then
        # Sin la CLI: GNU date o BSD date (macOS); si ninguno entiende la fecha, se queda sin saber.
        t="$(date -u -d "$sello_traido" +%s 2>/dev/null || date -u -j -f '%Y-%m-%dT%H:%M:%SZ' "$sello_traido" +%s 2>/dev/null || true)"
        if [ -n "$t" ]; then
            sello_horas=$(( ( $(date -u +%s) - t ) / 3600 ))
            [ "$sello_horas" -lt 0 ] && sello_horas=0
        fi
    fi
    if [ -n "$sello_horas" ] && [ "$sello_horas" -gt "$MAX_EDAD_SELLO_HORAS" ]; then
        anotar "El paquete se trajo de $sello_fuente hace $sello_horas h: vuelve a traerlo (skill aybar-nexora-traer) antes de decidir con sus aprobaciones."
    fi
    if [ "$sello_huella_distinta" -gt 0 ]; then
        anotar "$sello_huella_distinta documento(s) de docs/ no coinciden con lo traido de $sello_fuente (origen-huella-distinta): publicalos alli (skill aybar-nexora-publicar) o vuelve a traer el paquete. Mientras, no cuentan como aprobados."
    fi
    # Firmas pendientes por rol (DoR y gates): las da `aybar paquete validar --json`
    # (resumen_firmas_pendientes, sacado de features[].dor y gates[]). Sin la CLI no
    # se listan: el sello no se interpreta a mano.
    if [ -n "${salida:-}" ]; then
        sello_firmas="$(printf '%s\n' "$salida" | awk '
            /^  "resumen_firmas_pendientes": \[$/ { dentro = 1; next }
            dentro && /^  \]/ { dentro = 0; next }
            dentro { l = $0; sub(/^ *"/, "", l); sub(/",?$/, "", l); gsub(/\\"/, "\"", l); gsub(/\\\\/, "\\", l); print l }')"
    else
        anotar "Las firmas pendientes de $sello_fuente las lista la CLI (aybar paquete validar --json); sin ella no se muestran."
    fi
    if [ -n "$sello_firmas" ]; then
        anotar "Firmas pendientes en $sello_fuente (las pone una persona con ese rol, nunca la IA):"
        while IFS= read -r linea; do anotar "  $linea"; done <<EOF_FIRMAS
$sello_firmas
EOF_FIRMAS
    fi
    if [ "$sello_pendientes" -gt 0 ]; then
        anotar "$sello_pendientes documento(s) esperan aprobacion en $sello_fuente: los aprueba una persona con el rol de su carpeta, nunca la IA."
    fi
fi

# Sin CLI: el explorador se comprueba por su huella (validar sigue pendiente).
if [ "$cli_disponible" -eq 0 ] && [ "$paquete_presente" -eq 1 ]; then
    if [ ! -f "$RAIZ/$EXPLORADOR_REL" ]; then
        explorador="ausente"
        anotar "Falta el explorador: genera $EXPLORADOR_REL con aybar paquete explorador y commitealo."
    elif [ "$(huella_pagina)" = "$(huella_docs)" ]; then
        explorador="al-dia"
    else
        explorador="desactualizado"
        anotar "El explorador no esta al dia con docs/ (huella distinta): regeneralo con aybar paquete explorador y commitealo."
    fi
fi

certificado=0
if [ "$paquete_presente" -eq 1 ] && [ "$paquete_valido" -eq 1 ] && [ "$explorador" = "al-dia" ]; then
    certificado=1
fi

# ---------------------------------------------------------------- informe en texto

texto() {
    echo "ARRANQUE DE $(basename "$RAIZ") (Aybar SDK) - protocolo para cualquier agente de IA"
    echo
    echo "Antes de tocar codigo: cuentale al humano este estado y lo que falta. No se escribe"
    echo "codigo de una feature hasta que su G3 y su G4 esten en estado approved en origin/main"
    echo "(y G2 si tiene HU con ui: true). La IA propone; el humano aprueba."
    if [ "$sello_presente" -eq 1 ]; then
        echo "docs/ es copia sellada de $sello_fuente: alli se escribe y se aprueba; un documento sellado"
        echo "cuenta como aprobado si el sello lo dice y el archivo no se ha tocado."
    fi
    echo
    if [ "$cli_disponible" -eq 1 ]; then
        echo "[ok] CLI aybar ${cli_version:-?} en el PATH"
    else
        echo "[x]  CLI aybar no encontrada en el PATH"
    fi
    if [ "$paquete_presente" -eq 0 ]; then
        echo "[!]  docs/ sin paquete Definir"
    elif [ "$cli_disponible" -eq 1 ]; then
        if [ "$paquete_valido" -eq 1 ]; then
            echo "[ok] Paquete Definir sin errores ($advertencias advertencias${reglas:+; reglas: $reglas})"
        else
            echo "[x]  Paquete Definir: $errores errores, $advertencias advertencias${reglas:+ (reglas: $reglas)}"
        fi
        echo "     Features listas para construir (G3/G4 approved en origin/main, DoR READY): $features_listas de $features"
        case "$explorador" in
            al-dia) echo "[ok] Explorador al dia: $EXPLORADOR_REL" ;;
            desactualizado) echo "[!]  Explorador desactualizado: $EXPLORADOR_REL" ;;
            ausente) echo "[!]  Falta el explorador: $EXPLORADOR_REL" ;;
            *) echo "[!]  Explorador sin comprobar ($explorador)" ;;
        esac
    else
        echo "[!]  Paquete Definir sin validar (hace falta la CLI aybar)"
        case "$explorador" in
            al-dia) echo "[ok] Explorador al dia por huella: $EXPLORADOR_REL" ;;
            desactualizado) echo "[!]  Explorador desactualizado (huella distinta): $EXPLORADOR_REL" ;;
            ausente) echo "[!]  Falta el explorador: $EXPLORADOR_REL" ;;
        esac
    fi
    if [ "$sello_presente" -eq 1 ]; then
        if [ -n "$sello_horas" ] && [ "$sello_horas" -le "$MAX_EDAD_SELLO_HORAS" ]; then marca="[ok]"; else marca="[!] "; fi
        echo "$marca Origen documental: $sello_fuente, traido hace ${sello_horas:-?} h; $sello_documentos documentos sellados, $sello_pendientes sin aprobar alli"
        [ -n "$sello_firmas" ] && printf '%s\n' "$sello_firmas" | sed 's/^/     /'
    fi
    if [ "$certificado" -eq 1 ]; then
        echo "[ok] Paquete CERTIFICADO (validar sin errores + explorador al dia)"
    elif [ "$paquete_presente" -eq 1 ]; then
        echo "[x]  Paquete NO certificado"
    fi
    echo
    echo "Orden de lectura:"
    if [ -f "$RAIZ/$EXPLORADOR_REL" ]; then
        echo "  1. $RAIZ/$EXPLORADOR_REL  (abrelo en el navegador: mapa navegable del paquete)"
    else
        echo "  1. $EXPLORADOR_REL  (aun no existe: lo genera aybar paquete explorador cuando hay paquete)"
    fi
    echo "  2. docs/analisis/decisiones.md  (fuente de verdad de las decisiones)"
    echo "  3. aybar paquete plan docs  (olas y reparto por capa)"
    if [ -n "$pendientes" ]; then
        echo
        echo "Que falta:"
        printf '%s\n' "$pendientes" | sed 's/^/  - /'
    fi
    echo
    echo "Protocolo completo: skill aybar-arranque-repo. Validar e informar: agente analista-paquete."
}

# ---------------------------------------------------------------- JSON

json_cadena() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\t'/\\t}"
    s="${s//$'\r'/}"
    s="${s//$'\e'/}"
    s="${s//$'\n'/\\n}"
    printf '"%s"' "$s"
}

json_lista() {
    local primero=1 linea
    printf '['
    while IFS= read -r linea; do
        [ -z "$linea" ] && continue
        [ "$primero" -eq 1 ] || printf ', '
        json_cadena "$linea"
        primero=0
    done
    printf ']'
}

booleano() { if [ "$1" -eq 1 ]; then printf 'true'; else printf 'false'; fi; }

informe_json() {
    printf '{\n'
    printf '  "esquema": "aybar.arranque/1",\n'
    printf '  "raiz": %s,\n' "$(json_cadena "$RAIZ")"
    printf '  "cli": {"disponible": %s, "version": %s},\n' "$(booleano "$cli_disponible")" "$(json_cadena "$cli_version")"
    printf '  "paquete": {"presente": %s, "valido": %s, "errores": %s, "advertencias": %s, "reglas": %s, "features": %s, "features_listas": %s},\n' \
        "$(booleano "$paquete_presente")" "$(booleano "$paquete_valido")" "$errores" "$advertencias" \
        "$(printf '%s' "$reglas" | tr ',' '\n' | sed 's/^ *//' | json_lista)" "$features" "$features_listas"
    printf '  "explorador": {"ruta": %s, "estado": %s},\n' "$(json_cadena "$EXPLORADOR_REL")" "$(json_cadena "$explorador")"
    printf '  "origen": {"presente": %s, "fuente": %s, "traido_en": %s, "horas": %s, "documentos": %s, "pendientes": %s, "firmas_pendientes": %s},\n' \
        "$(booleano "$sello_presente")" "$(json_cadena "$sello_fuente")" "$(json_cadena "$sello_traido")" \
        "${sello_horas:-null}" "$sello_documentos" "$sello_pendientes" "$(printf '%s\n' "$sello_firmas" | json_lista)"
    printf '  "certificado": %s,\n' "$(booleano "$certificado")"
    printf '  "pendientes": %s,\n' "$(printf '%s\n' "$pendientes" | json_lista)"
    printf '  "lectura": ["%s", "docs/analisis/decisiones.md", "aybar paquete plan docs"]\n' "$EXPLORADOR_REL"
    printf '}\n'
}

# ---------------------------------------------------------------- salida

if [ -n "$hook" ]; then
    contexto="$(texto)"
    if [ "$certificado" -eq 1 ]; then
        resumen="Aybar: paquete certificado. Abre $EXPLORADOR_REL antes de empezar."
    else
        resumen="Aybar: revisa el arranque antes de tocar codigo (abre $EXPLORADOR_REL; .agents/scripts/arranque.sh)."
    fi
    case "$hook" in
        cursor)  printf '{"additional_context": %s}\n' "$(json_cadena "$contexto")" ;;
        copilot) printf '{"additionalContext": %s}\n' "$(json_cadena "$contexto")" ;;
        gemini)  printf '{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": %s}, "systemMessage": %s}\n' \
                     "$(json_cadena "$contexto")" "$(json_cadena "$resumen")" ;;
        *)       printf '%s\n' "$contexto" ;;
    esac
    # Un hook de sesion nunca bloquea: informa y deja seguir.
    exit 0
fi

if [ "$formato" = "json" ]; then
    informe_json
else
    texto
fi

if [ "$estricto" -eq 1 ]; then
    if [ "$paquete_presente" -eq 1 ]; then
        [ "$explorador" = "al-dia" ] || exit 1
        # Sin CLI no hay validacion que exigir; el CI lo avisa aparte.
        [ "$cli_disponible" -eq 0 ] || [ "$paquete_valido" -eq 1 ] || exit 1
    fi
fi
exit 0
