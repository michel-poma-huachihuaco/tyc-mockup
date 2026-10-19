---
name: aybar-paquete-definir
description: Cómo leer un paquete Definir (docs/ del servicio, G0–G4) — orden de lectura, precedencia entre decisiones.md, ADR y defaults del SDK, el marcador ui de las HU con pantalla y su G2, cuándo una feature está lista para construir y qué hacer ante contradicciones. Usar cuando pidan "revisa esta documentación y empieza", al abrir docs/analisis, docs/adr, docs/epicas, docs/features, docs/historias, docs/dor, docs/gates o docs/backlog/tareas, o antes de correr aybar paquete validar o aybar paquete plan.
---

# Paquete Definir

El paquete Definir es el documento 1 del marco (G0–G4): lo que tiene que estar
escrito y aprobado antes de construir. Vive en `docs/` del servicio. Contrato
completo, en el repo del SDK: `docs/especificaciones/paquete-definir.md`.

## Dónde está cada cosa

| Ruta | Qué es | Gate |
|---|---|---|
| `docs/analisis/decisiones.md` | Registro de decisiones del TL. **Fuente de verdad** del paquete | — |
| `docs/analisis/ficha-intake.md` · `BRD.md` | Intake y BRD | G0 · G1 |
| `docs/roadmap/` | Roadmap (PLT-01): horizonte, dependencias, riesgos | — |
| `docs/epicas/EP-*.md` · `docs/features/FT-*.md` · `docs/historias/HU-*.md` | Épicas (PLT-02), features (PLT-03), historias | G1–G4 |
| `docs/adr/ADR-*.md` | Decisiones del proyecto: nube, emisor de tokens, servicios gestionados, starters | G3 |
| `docs/arquitectura/*.openapi.yaml` | Contrato de API | G3 |
| `docs/datos/` | Diccionario, ER, estados | G3 + puerta F4 de datos |
| `docs/dor/DOR-*.md` | Definition of Ready por feature (PLT-05) | G4 |
| `docs/pruebas/test-plan.md` | Casos de prueba, un `TC` por criterio | G4 (iniciales) · G6 |
| `docs/backlog/tareas/<EPICA>.json` | Tareas por HU con `depende_de` | — |
| `docs/gates/<TICKET>/G<n>.md` | Envío de cada gate (`TICKET` = `AYB-NNNN`). G2 con `.agents/templates/g2-diseno.md` | el que nombra |

Todo `.md` lleva frontmatter: `id, tipo, titulo, estado, producto, version,
owner, aprobadores, fecha, relacionados, tags`. **Solo `estado: approved` es
evidencia.** `draft` y `review` se leen como contexto, nunca como permiso.

## HU con pantalla: el marcador `ui`

Una HU que tiene pantalla lo dice en su frontmatter: `ui: true` (o `ui` entre
sus `tags`; también vale en la feature). Ausente es `false`. Se leen `true`,
`si` y `yes` sin distinguir mayúsculas; `false` y `no` no marcan; cualquier
otro valor (`sí`, `quizas`) **no marca** y `aybar paquete validar` lo avisa
(`ui-valor-invalido`). Lo leen igual la CLI y el guardián de G4.

Si alguna HU de una feature es `ui`, la feature exige además
`docs/gates/<TICKET>/G2.md` approved en `origin/main`: el diseño UX/UI con sus
estados (skill `aybar-estados-ui`), firmado por PO + UX. Quien marca la HU es
el PO al escribirla; el agente no la desmarca para destrabar una feature.

## Orden de lectura

Antes de leer: corre `.agents/scripts/arranque.sh` (skill `aybar-arranque-repo`). Certifica el paquete (`aybar paquete validar` sin errores y `docs/explorador.html` al día) y te dice qué falta. Para entender el negocio sin leerlo entero, el explorador entra por los flujos de `docs/flujos/flujos.json`.

1. `docs/analisis/decisiones.md`, entero y primero: cambia el sentido de todo lo demás.
2. El estado real de los gates en `origin/main` (ver más abajo): sabes qué está aprobado antes de leer lo que dice estarlo.
3. `ficha-intake.md` y `BRD.md`: problema, valor, alcance y fuera de alcance.
4. `docs/adr/`: lo que el proyecto decidió sobre plataforma y diseño.
5. `docs/arquitectura/` y `docs/datos/`: contrato y modelo.
6. Roadmap → épica → feature → sus HU → su DoR → `test-plan.md` → `tareas/<EPICA>.json`.

## Precedencia

- `decisiones.md` manda sobre BRD, épicas, features, HU, DoR y test plan. Si uno la contradice, ese documento está desactualizado: se reporta para que su dueño lo corrija.
- Los ADR `approved` del proyecto mandan sobre los defaults del SDK (skills, contratos de starter, ejemplos). El SDK es la base neutral: la nube, el emisor de tokens y el negocio son del proyecto.
- Si `decisiones.md` choca con un ADR `approved`, no elijas: es una contradicción y se reporta.
- Si un ADR diverge de la estrategia corporativa, se **informa** en el envío de G3 al TL. No se bloquea ni se reescribe.

## ¿Está lista para construir?

Solo si se cumple todo esto, leído en `origin/main`. La copia local no vale:
puede tener un `approved` que nadie aprobó.

```bash
git fetch origin
git show origin/main:docs/gates/AYB-NNNN/G3.md          # estado: approved
git show origin/main:docs/gates/AYB-NNNN/G4.md          # estado: approved
git show origin/main:docs/gates/AYB-NNNN/G2.md          # estado: approved, si alguna HU es ui (o si existe)
git ls-tree -r --name-only origin/main -- docs/dor/ | grep 'DOR-<FT>'
git show origin/main:docs/dor/DOR-<FT>-<slug>.md        # estado: approved y decisión READY humana
```

- Si `G4.md` no está en `origin/main`, G4 no está aprobado.
- G4 pide G3 "si aplica". Si `G3.md` existe, tiene que estar `approved`. Si no existe, el guardián deja pasar, pero tú lo reportas para que una persona confirme que G3 no aplica.
- La decisión del DoR la escribe quien lo aprueba (lo designan la fuente documental o el ADR del proyecto; con sello, aprobado allí = READY): `Decision: READY` en la plantilla, o la casilla marcada de la PLT-05 en paquetes anteriores. Una línea `Propuesta IA: …` no decide nada. Tú nunca escribes READY.
- Si alguna HU de la feature lleva `ui: true` (o el tag `ui`), G2 también. Sin pantallas, `G2.md` es opcional, pero si existe tiene que estar `approved`, como G3.

**Si `docs/.origen-documental.json` existe** (la documentación manda en una fuente
externa, por ejemplo Nexora; ADR-007 del SDK): para los documentos que el sello
cita, la aprobación sale del sello (`estado: aprobado` y el archivo igual a su
`huella_sha256`), no del frontmatter ni de `origin/main`; un DoR sellado y
aprobado allí es READY (si no, NO READY), y las `firmas_pendientes` que dé la
fuente se informan por rol. Reglas: `origen-huella-distinta` y
`origen-archivo-ausente` (errores), `origen-sin-sellar` y `origen-antiguo`
(advertencias); el JSON trae el bloque `origen`. Traer y publicar: skills
`aybar-nexora-traer` y `aybar-nexora-publicar`. No edites a mano un documento
sellado para que valide.

Quién aprueba cada gate y por qué se lee `origin/main`: skill `aybar-gates`.

## La CLI

| Comando | Para qué |
|---|---|
| `aybar paquete validar [DIR] [--json]` | Estructura, frontmatter, ids, nombres y referencias cruzadas del paquete |
| `aybar paquete plan [DIR] [--json]` | Ordena features, HU y tareas en olas según `depende_de` |
| `aybar paquete explorador [DIR] [--comprobar] [--json]` | Genera `docs/explorador.html`, la vista de negocio (flujos de `docs/flujos/flujos.json` → features → HU, bloqueantes del DoR); `--comprobar` dice si está al día |

- `DIR` por defecto: `docs/` del servicio.
- Salida para personas por defecto. Con `--json`, para agentes: lee siempre el JSON y no parsees la tabla.
- `validar` sale con código `1` si hay errores; las advertencias no lo cambian. En el JSON: `valido`, `hallazgos` (nivel, regla, archivo, mensaje), el estado de cada gate en local y en `origin/main`, y por feature `lista`, `motivos`, `g2_origin_main` (`approved`, ..., `sin-archivo` si tiene pantallas y no hay `G2.md`, `no-aplica`), `ui`, `historias_ui` y `tareas_por_capa` (`backend`, `frontend`, `otras`). Ejemplos de advertencia: `tipo-spec`, `tipo: spec` en una épica, feature, DoR o gate, aceptado por compatibilidad; `ui-sin-g2`, feature con pantallas cuyo ticket no tiene `G2.md`; `hu-frontend-sin-ui`, HU con tareas de capa `frontend` y sin marcador.
- `plan` numera las olas desde 0 y llama "fundación" a la ola 0: las features sin dependencias más las tareas de dominio o datos que se pueden adelantar (nunca una de `frontend`). Marca las `listas_hoy` y, por feature, `ui` y `reparto`: sus tareas por capa en orden de `depende_de` (skill `aybar-construir-feature`). Sale con `1` si hay ciclos entre tareas.
- Un plan sobre un paquete con errores de validación no se ejecuta: primero se corrige o se reporta.
- Si tu versión de la CLI no trae el comando, dilo (skill `aybar-estado-del-sdk`). No lo emules a mano ni presentes tu lectura como si fuera su salida.

## Contradicciones

Casos típicos:
- un DoR que cita como pendiente una decisión ya cerrada en `decisiones.md`;
- un criterio de una HU con un código o una ruta que el OpenAPI no tiene;
- una tarea cuyo `depende_de` apunta a un id que no existe;
- un ADR que elige otra nube u otro emisor que la estrategia corporativa;
- una HU con tareas de capa `frontend` sin `ui: true`, o un criterio que describe una pantalla en una HU sin marcador: falta G2 y nadie lo exige.

Qué haces con cada una:
- La reportas con `ruta:línea` de los dos lados y lo que dice cada uno.
- La clasificas: **bloquea** (toca G3, G4 o un criterio de aceptación), **corregir** o **informativa** (divergencia con la estrategia, va al envío de G3).
- Nunca la "resuelves" eligiendo un lado, ni inventas el dato que falta, ni editas un documento `approved`: lo corrige su dueño por PR.
