#!/usr/bin/env bash
#
# guardianes.sh - guardianes del marco sobre los comandos del agente de IA,
# ordenados por gate. Hook PreToolUse de Claude Code con matcher Bash:
# bloquea antes de ejecutar, no pregunta.
#
# Un hook solo ve el comando que esta por correr: no puede verificar estado
# de proceso (un BRD aprobado, un Test Plan al 100 %, un mockup revisado).
# Por eso aqui no hay G1, G2, G6 ni G9: fingir que se verifican seria peor
# que no tenerlos. G4 si tiene guardian, pero lee evidencia en origin/main:
# guardian-gate-listo.sh, el pre-commit y la etapa "Gates listos" de la CI.
#
#   G0  nombre de las ramas nuevas (validar-nombre-rama.sh, la regla del pre-push)
#   G5  gh pr merge / review --approve; force-push; push a protegidas;
#       saltarse los guardianes de git (--no-verify, core.hooksPath);
#       commitear con los guardianes de git apagados; autor o coautoria de
#       IA; forma del mensaje (validar-mensaje-commit.sh)
#   G7  clientes y volcados de datos contra Produccion; dependencias desde
#       una URL o git en vez del registro; curl | bash
#   G8  despliegue, nube o acceso remoto contra Produccion
#
# Que es Produccion, que clientes y que herramientas se configura en
# guardianes.conf (PATRON_PRODUCCION, CLIENTES_DATOS, HERRAMIENTAS_INFRA,
# PUSH_DEL_AGENTE). El SDK no sabe donde vive la Produccion de cada servicio.
#
# Es un filtro de texto sobre el comando, no un interprete de shell: corta lo
# evidente y explica por que. La barrera real esta en el servidor
# (proteccion de rama, CODEOWNERS y CI).
#
# Exit 0 deja pasar; exit 2 bloquea (stderr es el motivo).
set -Eeuo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=comun.sh
. "$AQUI/comun.sh"
guardian_inicio

CMD="$(json_campo comando)"
[ -n "$CMD" ] || exit 0

# ---------------------------------------------------------------------------
# Vistas del comando. Un mensaje de commit que dice "-n" o "ssh a prod" no es
# una opcion ni una orden, asi que las comillas se tratan aparte:
#   SIN_COMILLAS  cada tramo entre comillas queda en Q: aqui se buscan opciones
#   NEUTRO        sin caracteres de comilla, y con ; & | ( ) ` neutralizados
#                 DENTRO de las comillas: aqui se leen nombres y se corta el
#                 comando en ordenes
# El cuerpo de un heredoc (<<EOF ... EOF) no es comando: se vacia en las dos.
# ---------------------------------------------------------------------------
vista() { # modo(q|n) texto
  awk -v modo="$1" '
    delim != "" {
      t = $0; gsub(/^[ \t]+|[ \t]+$/, "", t)
      if (t == delim) delim = ""
      print ""; next
    }
    {
      if (match($0, /<<-?[ \t]*["\047]?[A-Za-z_][A-Za-z0-9_]*/) && substr($0, RSTART + 2, 1) != "<" \
          && (RSTART == 1 || substr($0, RSTART - 1, 1) != "<")) {
        d = substr($0, RSTART, RLENGTH); sub(/^<<-?[ \t]*["\047]?/, "", d); delim = d
      }
      s = ""; q = ""
      for (i = 1; i <= length($0); i++) {
        c = substr($0, i, 1)
        if (q == "") {
          if (c == "\"" || c == "\047") { q = c; if (modo == "q") s = s "Q"; continue }
          s = s c
        } else {
          if (c == q) { q = ""; continue }
          if (modo == "q") continue
          if (index(";&|()`", c)) c = " "
          s = s c
        }
      }
      print s
    }' <<< "$2"
}
SIN_COMILLAS="$(vista q "$CMD")"
NEUTRO="$(vista n "$CMD")"

# Corta un texto en ordenes por ; & | ( ) ` y saltos de linea.
ordenes() { tr ';&|()`' '\n\n\n\n\n\n' <<< "$1"; }

# Una linea "@ <args>" por cada `git <sub>` del texto, con lo que sigue al
# subcomando. Salta las opciones globales de git (-C dir, -c clave=valor...).
invocaciones_git() { # sub texto
  local sub="$1" seg i n
  local -a t
  while IFS= read -r seg; do
    t=()
    read -r -a t <<< "$seg" || true
    n=${#t[@]}
    i=0
    while [ "$i" -lt "$n" ]; do
      case "${t[$i]}" in git|*/git) break ;; esac
      i=$((i + 1))
    done
    [ "$i" -lt "$n" ] || continue
    i=$((i + 1))
    while [ "$i" -lt "$n" ]; do
      case "${t[$i]}" in
        -C|-c|--git-dir|--work-tree|--namespace|--config-env) i=$((i + 2)) ;;
        -*) i=$((i + 1)) ;;
        *) break ;;
      esac
    done
    if [ "$i" -lt "$n" ] && [ "${t[$i]}" = "$sub" ]; then
      printf '@ %s\n' "${t[*]:$((i + 1))}"
    fi
  done <<< "$(ordenes "$2")"
}

# Esta $1 en la lista separada por espacios $2?
en_lista() {
  local x
  for x in $2; do
    if [ "$x" = "$1" ]; then return 0; fi
  done
  return 1
}

# Primer token de una orden que es el programa (salta VAR=valor, sudo, env...).
palabra_de_orden() {
  local a
  set -f
  for a in $1; do
    case "$a" in
      *=*|sudo|time|command|exec|env|nohup|then|do|else|'!'|-*) continue ;;
    esac
    set +f
    printf '%s' "${a##*/}"
    return 0
  done
  set +f
}

# =============================================================================
# G0 Intake: todo trabajo entra tipificado y trazable a un ticket.
# =============================================================================
ramas_nuevas() { # sub args -> nombres de rama que el comando crea
  local sub="$1" previo="" a primero="" ultimo="" opciones=0 renombra=0
  set -f
  for a in $2; do
    case "$sub:$previo" in
      switch:-c|switch:-C|switch:--create|switch:--force-create|checkout:-b|checkout:-B|checkout:--orphan|worktree:-b|worktree:-B)
        printf '%s\n' "$a" ;;
    esac
    if [ "$sub" = branch ]; then
      case "$a" in
        -m|-M|--move) renombra=1 ;;
        -f|--force|-t|--track|--no-track) ;;
        -*) opciones=1 ;;
        *) if [ -z "$primero" ]; then primero="$a"; fi; ultimo="$a" ;;
      esac
    fi
    previo="$a"
  done
  set +f
  if [ "$sub" = branch ]; then
    if [ "$renombra" -eq 1 ]; then
      printf '%s\n' "$ultimo"
    elif [ "$opciones" -eq 0 ]; then
      printf '%s\n' "$primero"
    fi
  fi
}

for sub in switch checkout branch worktree; do
  while IFS= read -r inv; do
    [ -n "$inv" ] || continue
    while IFS= read -r nombre; do
      [ -n "$nombre" ] || continue
      if ! bash "$GUARDIANES_DIR/validar-nombre-rama.sh" "$nombre" >/dev/null 2>&1; then
        bloquear "G0" "la rama '$nombre' no sigue la forma del marco: feature|bugfix|hotfix/<TICKET>-<slug>, p. ej. feature/AYB-1042-reserva-de-lote. Sin ticket no hay item trazable."
      fi
    done <<< "$(ramas_nuevas "$sub" "${inv#@ }")"
  done <<< "$(invocaciones_git "$sub" "$NEUTRO")"
done

# =============================================================================
# G5 Code: PR chico con revisor, nadie aprueba lo propio, commit humano y
# sin saltarse los guardianes. "La IA propone, el humano aprueba."
# =============================================================================
if contiene '(^|[^A-Za-z0-9_-])gh[[:space:]]+pr[[:space:]]+merge([[:space:]]|$)' "$SIN_COMILLAS"; then
  bloquear "G5/G8" "ningun agente mergea un pull request. La IA propone, el humano aprueba: mergealo tu, desde tu cuenta y fuera del agente."
fi
if contiene '(^|[^A-Za-z0-9_-])gh[[:space:]]+pr[[:space:]]+review([[:space:]].*)?[[:space:]](--approve|-a)([[:space:]]|$)' "$SIN_COMILLAS"; then
  bloquear "G5" "ningun agente aprueba un pull request: esa aprobacion la da una persona con su propia cuenta (§14)."
fi
if contiene '(^|[^A-Za-z0-9_-])gh[[:space:]]+api([[:space:]].*)?(/merge|event=APPROVE)' "$NEUTRO"; then
  bloquear "G5" "mergear o aprobar un PR por la API de GitHub es lo mismo que gh pr merge o review --approve: no lo hace el agente."
fi

# Saltarse los hooks de git cambiando core.hooksPath es lo mismo que --no-verify.
SALTO_HOOKS="saltarse los guardianes de git (commit-msg, pre-commit del G4, pre-push) no es una excepcion que el agente pueda tomar. Si de verdad hace falta, la decide y la ejecuta una persona, fuera del agente."
valor_c="$(grep -oiE '(^|[[:space:]])-c[[:space:]]*core\.hookspath=[^[:space:]]*' <<< "$NEUTRO" | head -1 || true)"
if [ -n "$valor_c" ] && [ "${valor_c#*=}" != ".guardianes/hooks" ]; then
  bloquear "G5" "git -c core.hooksPath=...: $SALTO_HOOKS"
fi
while IFS= read -r inv; do
  [ -n "$inv" ] || continue
  clave=0; valor=""; quita=0
  set -f
  for a in ${inv#@ }; do
    if [ "$clave" -eq 1 ] && [ -z "$valor" ]; then valor="$a"; fi
    case "$a" in
      --unset|--unset-all|unset) quita=1 ;;
    esac
    if [ "$clave" -eq 0 ] && contiene_i '^core\.hookspath$' "$a"; then clave=1; fi
  done
  set +f
  if [ "$clave" -eq 1 ]; then
    if [ "$quita" -eq 1 ] || { [ -n "$valor" ] && [ "$valor" != ".guardianes/hooks" ]; }; then
      bloquear "G5" "git config core.hooksPath: $SALTO_HOOKS"
    fi
  fi
done <<< "$(invocaciones_git config "$NEUTRO")"

COMMITS="$(invocaciones_git commit "$SIN_COMILLAS")"
if [ -n "$COMMITS" ]; then
  while IFS= read -r inv; do
    set -f
    for a in ${inv#@ }; do
      case "$a" in
        --no-verify) set +f; bloquear "G5" "git commit --no-verify: $SALTO_HOOKS" ;;
        --*) ;;
        -*n*) set +f; bloquear "G5" "git commit -n es --no-verify: $SALTO_HOOKS" ;;
      esac
    done
    set +f
  done <<< "$COMMITS"

  # Los hooks de git son los que validan el commit de verdad; si estan
  # apagados en este clon, el commit del agente no pasaria por ninguno.
  activo="$(git -C "$RAIZ" config --get core.hooksPath 2>/dev/null || true)"
  if [ -d "$RAIZ/.guardianes/hooks" ] && [ "$activo" != ".guardianes/hooks" ]; then
    bloquear "G5" "los guardianes de git no estan activos en este clon (core.hooksPath='${activo:-vacio}'): el commit no pasaria por commit-msg ni por el pre-commit del G4. Activalos con ./.guardianes/activar.sh (o aybar install) y vuelve a intentarlo."
  fi

  IA='(^|[^a-z])(bot|claude|anthropic|copilot|codex|openai|gpt|gemini|kimi|cursor|assistant|asistente[- ]?ia)([^a-z]|$)'
  if contiene_i "--author[= ]+[\"']?[^\"']*${IA}" "$CMD"; then
    bloquear "G5" "autor de commit de tipo bot o IA en --author. El autor es humano, con firma verificada: quien lanzo el agente firma y responde (§3.3, §14)."
  fi
  if contiene_i "co-authored-by:.*${IA}" "$CMD"; then
    bloquear "G5" "pie de coautoria de IA (Co-Authored-By). Convierte a la herramienta en coautora de un cambio del que no responde: commitea sin ese pie (§14)."
  fi

  # Forma del mensaje, con el mismo validador del hook commit-msg. Solo se
  # leen los -m "..." de una linea; un mensaje en heredoc o en fichero lo
  # valida igualmente el hook commit-msg al commitear.
  RE_M="(^|[[:space:]])(-[A-Za-z]*m|--message)([[:space:]]+|=)(\"[^\"]*\"|'[^']*')"
  mensajes="$(grep -oE -- "$RE_M" <<< "$CMD" \
    | sed -E "s/^[[:space:]]*(-[A-Za-z]*m|--message)([[:space:]]+|=)//; s/^[\"']//; s/[\"']\$//" || true)"
  if [ -n "$mensajes" ] && ! contiene '\$\(|`' "$mensajes"; then
    cuerpo="$(awk 'NR > 1 { print "" } { print }' <<< "$mensajes")"
    if ! salida="$(bash "$GUARDIANES_DIR/validar-mensaje-commit.sh" <<< "$cuerpo" 2>&1)"; then
      bloquear "G5" "el mensaje de commit no cumple el marco (3.2):
$salida"
    fi
  fi
fi

while IFS= read -r inv; do
  [ -n "$inv" ] || continue
  if [ "${PUSH_DEL_AGENTE:-trabajo}" = nunca ]; then
    bloquear "G5" "este servicio no deja publicar al agente (PUSH_DEL_AGENTE=nunca): el push lo hace a mano quien lo lanzo, con su cuenta y su firma."
  fi
  remoto=""
  refspecs=""
  set -f
  for a in ${inv#@ }; do
    case "$a" in
      --force|--force-with-lease|--force-with-lease=*|--force-if-includes|--mirror)
        set +f; bloquear "G5" "force-push ($a): lo prohibe la proteccion de rama. Si de verdad hace falta, lo hace una persona fuera del agente." ;;
      --no-verify)
        set +f; bloquear "G5" "git push --no-verify: $SALTO_HOOKS" ;;
      --*|-o) ;;
      -*f*)
        set +f; bloquear "G5" "force-push ($a): lo prohibe la proteccion de rama. Si de verdad hace falta, lo hace una persona fuera del agente." ;;
      -*) ;;
      +*)
        set +f; bloquear "G5" "force-push (refspec '$a' con +): lo prohibe la proteccion de rama." ;;
      *)
        if [ -z "$remoto" ]; then remoto="$a"; else refspecs="$refspecs $a"; fi ;;
    esac
  done
  set +f
  actual="$(git -C "$RAIZ" symbolic-ref --short -q HEAD 2>/dev/null || true)"
  if [ -z "${refspecs// /}" ]; then refspecs="$actual"; fi
  set -f
  for r in $refspecs; do
    destino="${r##*:}"
    if [ "$destino" = HEAD ]; then destino="$actual"; fi
    destino="${destino#refs/heads/}"
    for protegida in $RAMAS_PROTEGIDAS; do
      case "$destino" in
        $protegida)
          set +f
          bloquear "G5" "push directo a '$destino', rama protegida. Todo cambio entra por pull request con revision y CI (3.4); publica una rama de trabajo." ;;
      esac
    done
  done
  set +f
done <<< "$(invocaciones_git push "$SIN_COMILLAS")"

# =============================================================================
# G7 Security: datos reales y cadena de suministro.
# G8 Release: nadie despliega ni opera Produccion fuera del pipeline.
# =============================================================================
while IFS= read -r orden; do
  [ -n "$orden" ] || continue
  if ! contiene_i "$PATRON_PRODUCCION" "$orden"; then continue; fi
  programa="$(palabra_de_orden "$orden")"
  [ -n "$programa" ] || continue
  if en_lista "$programa" "${CLIENTES_DATOS:-}"; then
    bloquear "G7" "'$programa' contra lo que parece Produccion (PATRON_PRODUCCION). Ningun agente trabaja con datos reales de Produccion (aybar-datos-que-no-salen): usa un ambiente sintetico o anonimizado."
  fi
  if en_lista "$programa" "${HERRAMIENTAS_INFRA:-}"; then
    bloquear "G8" "'$programa' contra lo que parece Produccion (PATRON_PRODUCCION). A Produccion se llega por el pipeline con el Release Gate aprobado, nunca con un comando del agente."
  fi
done <<< "$(ordenes "$NEUTRO")"

VARS_CONEXION='(DATABASE_URL|DB_URL|DB_HOST|JDBC_URL|SPRING_DATASOURCE_URL|MONGO_URI|MONGODB_URI|REDIS_URL|REDIS_HOST|PGHOST|MYSQL_HOST)'
while IFS= read -r asignacion; do
  [ -n "$asignacion" ] || continue
  if contiene_i "$PATRON_PRODUCCION" "${asignacion#*=}"; then
    bloquear "G7" "una variable de conexion a datos apunta a Produccion (${asignacion%%=*}). Ningun agente trabaja con datos reales de Produccion (aybar-datos-que-no-salen)."
  fi
done <<< "$(grep -oiE "${VARS_CONEXION}=[^[:space:]]+" <<< "$NEUTRO" || true)"

if contiene_i '(^|[^A-Za-z0-9_-])(npm|pnpm|yarn|bun)[[:space:]]+(add|install|i)([[:space:]]|$)' "$NEUTRO" \
   && contiene_i '(git\+|github:|gitlab:|bitbucket:|git@|https?://)' "$NEUTRO" \
   && ! contiene_i 'https?://registry\.npmjs\.org' "$NEUTRO"; then
  bloquear "G7" "dependencia desde una URL o git en vez del registro oficial: riesgo de cadena de suministro. Si hace falta de verdad, la evalua y la agrega una persona."
fi
if contiene_i '(^|[^A-Za-z0-9_-])pip3?[[:space:]]+install([[:space:]]|$)' "$NEUTRO" \
   && contiene_i '(git\+|https?://)' "$NEUTRO" \
   && ! contiene_i 'https?://(pypi\.org|files\.pythonhosted\.org)' "$NEUTRO"; then
  bloquear "G7" "dependencia Python desde una URL o git en vez de PyPI: riesgo de cadena de suministro. La evalua y la agrega una persona."
fi
if contiene_i '(curl|wget)[^|]*\|[[:space:]]*(sudo[[:space:]]+)?(bash|sh|zsh|python[0-9.]*)([[:space:]]|$)' "$CMD" \
   || contiene_i '(bash|sh|zsh)[[:space:]]+<\([[:space:]]*(curl|wget)' "$CMD"; then
  bloquear "G7" "descargar y ejecutar en un solo paso (curl | bash). Descargalo, revisalo y ejecutalo aparte si corresponde."
fi

exit 0
