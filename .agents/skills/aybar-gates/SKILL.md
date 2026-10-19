---
name: aybar-gates
description: Criterios y paquete de evidencias de cada gate G0-G9, donde vive el archivo de cada gate (docs/gates/<TICKET>/G<n>.md) y cuando cuenta como aprobado. Usar al preparar, pedir o revisar el cierre de un gate, al comprobar si se puede construir, o cuando aparezcan Intake/Discovery/Design/Architecture Gate, DoR, Code/QA/Security/Release/Post-Release Gate.
---

# Gates G0-G9

Quien aprueba: G0/G1/G4 PO - G2 PO+UX - G3 TL - G5 TL o revisor (autor nunca)
- G6 QA - G7 DevOps+TL - G8 TL+PO - G9 TL. Saltarse un gate: nadie.

Que bloquea cada uno: G0 backlog, G1 requisitos, G2 Ready con UI, G3 inicio
de desarrollo, G4 sprint, G5 merge a protegida, G6/G7 Pre-Produccion,
G8 Produccion, G9 cierre del release (48-72 h).

Donde vive: un archivo por gate y ticket, `docs/gates/<TICKET>/G<n>.md`
(`TICKET` = `AYB-NNNN`), con `id: GATE-<TICKET>-G<n>` y `tipo: gate` en el
frontmatter. Se arma con `.agents/templates/gate.md`: correo de formalizacion,
identificacion del cambio, evidencias enlazadas por commit y firmas.

Cuando esta aprobado: solo si ese archivo tiene `estado: approved` en
`origin/main`, no en la copia local ni en una rama. El `approved` entra por un
PR que aprueba el CODEOWNER del rol del gate y que se mergea; un `approved`
escrito en una rama sin mergear no aprueba nada. Antes de construir:

    git fetch origin
    git show origin/main:docs/gates/AYB-NNNN/G3.md   # y G4.md: estado: approved

Con documentacion externa (ADR-007 del SDK): si `docs/.origen-documental.json`
existe, la documentacion se aprueba en la fuente que nombra (por ejemplo,
Nexora) y `docs/` es una copia sellada. Un gate que el sello cita esta aprobado
si el sello dice `estado: aprobado` **y** el archivo coincide con su
`huella_sha256`; su frontmatter y `origin/main` no cuentan. Un gate sellado que
se edito en el repo (`origen-huella-distinta`) no esta aprobado hasta que se
publica, se aprueba alli y se vuelve a traer (skills `aybar-nexora-publicar` y
`aybar-nexora-traer`). Un gate que el sello no cita se sigue leyendo en
`origin/main`. `aybar paquete validar --json` da en cada gate su `evidencia`.
Un DoR sellado y `aprobado` en la fuente es READY; si no, NO READY. Si el sello
trae `firmas_pendientes`, informalas por rol («DoR de FT-X: falta firma de
<rol>»): cuantas firmas hacen falta lo decide la fuente, no el SDK, y nunca las
pone la IA.

Si el archivo no esta en `origin/main`, el gate no esta aprobado. G4 pide G3
"si aplica": sin `G3.md` el guardian de G4 (`.guardianes/validar-gate-listo.sh`)
deja pasar, y el agente lo reporta para que una persona confirme que no aplica.
G2 lo exige el mismo guardian (y `aybar paquete validar`) en cuanto alguna HU
de la feature lleva `ui: true` o el tag `ui`; sin pantallas es opcional, pero
un `G2.md` que existe tiene que estar approved.
Un agente redacta el archivo en `draft` o `review` y lo deja para la firma;
nunca escribe `approved`.

G2 (UX/UI, F3; firman PO y UX, los dos): se arma con
`.agents/templates/g2-diseno.md`. Paquete de evidencia: Figma con version (o
enlace a la version fija, nunca "el archivo vivo"), user flow de cada HU con
pantalla, la tabla de estados por pantalla (vacio, carga, error, sin permisos,
responsive), accesibilidad (contraste, orden de foco, teclado, etiquetas) y
consistencia con el design system del framework `@aybarcorp/*` (que se
compuso, que falta). `disenador-ux` lo prepara; no lo aprueba. Estados y
cobertura del framework: aybar-estados-ui.

Para cerrar uno: criterios completos en `.agents/references/fases-y-gates.md`;
el correo de formalizacion es la seccion 1 de `gate.md` (`correo-gate.md` queda
como version corta). La evidencia tecnica (CI, SAST) vive en el repo y no
sustituye el paquete de negocio. Si el cambio toca datos, la puerta de Gobierno
de Datos correspondiente va ademas del gate: aybar-gobierno-datos. Formato
completo y CODEOWNERS por rol, en el repo del SDK:
`docs/especificaciones/evidencia-de-gates.md`.
