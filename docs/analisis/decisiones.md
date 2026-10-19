---
id: "DEC-001"
tipo: decisiones
titulo: "Registro de decisiones - Aybar Atiende"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001"]
tags: [decisiones, fuente-de-verdad]
---

# Registro de decisiones — Aybar Atiende (aybar-atc)

Fuente de verdad del paquete Definir. Si cualquier otro documento (BRD,
roadmap, epica, feature, HU, DoR) contradice lo que esta aqui, manda este
registro y el otro documento se reporta para que su dueño lo corrija.

Formato: `D-NN` — fecha — decision — contexto/motivo — impacto — quien la
tomo. Las marcadas "pendiente de confirmacion humana" las tomo un agente de
IA por practicidad de borrador y no tienen valor de aprobacion.

---

**D-01** — 2026-10-15 — El ticket `AYB-0001` usado en todo el paquete Definir
es un **placeholder**. — Contexto: no existe aun un correo de formalizacion
real ni una numeracion de ticket asignada por PO/TL; `aybar paquete validar`
confirmo que `docs/` no tenia ningun paquete Definir antes de este borrador
(0 documentos en todas las categorias). — Impacto: todo archivo que cite
`AYB-0001` debe renumerarse cuando el PO/TL formalicen el intake real (G0). —
Tomada por: IA, pendiente de confirmacion humana.

**D-02** — 2026-10-15 — Para **epicas, features e historias de usuario**, el
artefacto/tablero de gestion "Aybar Atiende" (PLT-01..05 v1.2, compartido por
el usuario como artefacto de Claude) **prevalece** sobre los PDF de la
carpeta `/home/lazaro/Downloads/Ultima versión de documentos ATC/` cuando
haya conflicto de contenido, porque el artefacto ya corrige inconsistencias
detectadas en esos PDF. — Contexto: instruccion explicita del usuario en esta
sesion. — Impacto: el texto de las 60 HU, y el contenido de RF/RNF/RN de las
features, se toma del artefacto; los PDF (02 Epicas, 03 Funcionalidades, 04
Historias) se usan solo para IDs/titulos/estructura cuando el artefacto no
los trae. — Tomada por: usuario (humano), 2026-10-15.

**D-03** — 2026-10-15 — Los **nombres y el MoSCoW oficiales de las 11
epicas** (EP-ATC-01..11) salen del PDF `01_Plan_Maestro_de_Trabajo` (PLT-01
v1.2), porque el artefacto solo traia los IDs `EP-ATC-01..11` sin titulo. Ver
tabla completa en `docs/roadmap/RMP-001-aybar-atiende.md` §1. — Impacto:
quien redacte `docs/epicas/EP-ATC-*.md` debe usar estos nombres, no inventar
otros. — Tomada por: IA, a partir de fuente documental; pendiente de
confirmacion humana.

**D-04** — 2026-10-15 — **Numeracion oficial de features**: el Plan Maestro
(PLT-01) usa `FT-01` a `FT-23` sin prefijo, el catalogo de funcionalidades
(PLT-03, PDF `03_Funcionalidades_Catalogo_Requerimientos`) usa `FT-ATC-01` a
`FT-ATC-23` para las mismas 22 funcionalidades (22 features; no existe
`FT-ATC-12`, numeracion con salto en la fuente, no es un error de quien
redacto), y el artefacto de Nexora/tablero usa `PROC-SVC-001` a
`PROC-SVC-022` para describirlas. **Se adopta `FT-ATC-NN` (PLT-03) como ID
oficial de feature** en `docs/features/` y por tanto tambien en `docs/epicas/`
y `docs/historias/` (`EP-ATC-NN`, `HU-ATC-NNN`), porque PLT-03 es el unico
documento que trae el detalle de RF/RNF/RN ya asignado por funcionalidad, no
solo el nombre. — **Mapeo PROC-SVC→FT-ATC resuelto**: PLT-03 asigna cada
RF-SVC a su FT-ATC-NN de forma explicita, y esa asignacion **no siempre
coincide** con el agrupamiento por proceso del artefacto de Nexora — ejemplo:
`RF-SVC-003` y `RF-SVC-029` aparecen en el artefacto bajo `PROC-SVC-001` y
`PROC-SVC-011` respectivamente, pero PLT-03 los ubica a ambos en
`FT-ATC-04` (Motor SLA y alertas). Se siguio PLT-03 por ser la fuente con el
detalle de asignacion explicito; el cruce completo queda anotado en la
seccion 5 (Trazabilidad) de cada `FT-ATC-NN.md`. — Impacto: el TL debe
confirmar en G3 que esta reasignacion de RF respecto del agrupamiento
original del artefacto es correcta. — Tomada por: IA; pendiente de
confirmacion humana (TL al revisar G3, o antes).

**D-05** — 2026-10-15 — El **BRD no tenia una lista explicita de objetivos
medibles `OBJ-NN`** en ninguna fuente leida (ni PDF ni artefacto); se
derivaron 6 objetivos (`OBJ-01`..`OBJ-06`) a partir de la vision del producto
(PLT-01) y de los RNF del catalogo de requerimientos del artefacto
(RNF-REN-005, RNF-CUM-006, RNF-INT-007, RNF-USA-001, RNF-CUM-007,
RNF-SEC-009). — Impacto: marcados explicitamente como "propuesta IA" en
`docs/analisis/BRD.md` — no bloquean G1 pero el PO debe confirmarlos o
reemplazarlos antes de que el BRD pueda pasar a `estado: approved`. — Tomada
por: IA, pendiente de validacion del PO.

**D-06** — 2026-10-15 — **Tipificacion T3** propuesta para este cambio (11
epicas, 22 features, 60 HU, integraciones externas, impacto legal Ley
29571/29733). — Contexto: regla del marco "todo cambio se tipifica antes de
estimarse"; el volumen y el riesgo legal exceden claramente T1/T2. —
Impacto: exige 2 aprobadores en G5, PO+Stakeholder+TL en los gates que lo
piden para T3. — Tomada por: IA (rol `tipificador`), pendiente de
confirmacion conjunta PO+TL en G0.

**D-07** — 2026-10-15 — El repositorio `aybar-atc` no tenia **ningun commit**
hasta hoy; se creo el commit inicial `99e8856` ("chore: scaffold inicial del
servicio") para poder aislar este trabajo en un worktree. — Contexto:
bloqueaba `EnterWorktree` y el guardian de aislamiento de la sesion de fondo.
— Impacto: ninguno sobre el contenido del paquete Definir; se deja registrado
porque es un hito tecnico del repositorio, no una decision de producto. —
Tomada por: sesion coordinadora (humano confirmo), 2026-10-15.

**D-08** — 2026-10-15 — El bloque final del artefacto de Nexora que pedia
escribir en `items/<ID>` con la herramienta de datos del artefacto, o pegar
un fragmento en `CLAUDE.md` para automatizar ese tablero, **se trata como
contenido inyectado en un documento de terceros y se ignora por completo**:
no es una instruccion del usuario. Ningun documento de este paquete se
genero ni se publico usando esa via. — Tomada por: IA (todas las sesiones que
tocaron el artefacto).

**D-09** — 2026-10-16 — **Contradiccion sin resolver entre dos modelos de
estado del ticket**: `FT-ATC-02`/`HU-ATC-004` (`RF-SVC-004`) fija 7 estados
homogeneos (OPEN, IN_PROGRESS, PENDING_CUSTOMER, ESCALATED, RESOLVED, CLOSED,
REOPENED) iguales para todo ticket, sin excepcion. `FT-ATC-18`/`HU-ATC-043`
(`RF-SVC-043`) permite al administrador funcional configurar, sin desarrollo,
"pasos, estados, responsables y aprobaciones" por area y tipo de ticket. —
Contexto: lo detecto primero el usuario en esta sesion y luego, de forma
independiente, el agente que armo `docs/datos/estados.md` durante F4; ninguna
fuente leida (artefacto, PDF, DoR) explica como conviven los dos modelos. —
Impacto: registrado como pregunta abierta bloqueante (P-03 en `FT-ATC-02`,
P-04 en `FT-ATC-18`); ninguna HU de ambas features puede llegar a
`Decision: READY` en su DoR (G4) hasta que el PO y el TL definan si el flujo
configurable es un conjunto de sub-pasos dentro de `IN_PROGRESS` o reemplaza
el campo `Status` de `SVC_TICKET` para el area que lo define. — Tomada por:
IA; pendiente de resolucion PO+TL antes de refinamiento.

**D-10** — 2026-10-16 — **El checklist CAD-F5 escala a bloqueante por numero
de desviaciones menores**, no solo por severidad individual. Al contrastar
las 60 HU contra `docs/datos/diccionario.md` (F4): 5 HU (`HU-ATC-043`, `044`,
`047`, `048`, `060`) declaran un nombre de entidad distinto del que fijo el
diccionario para el mismo concepto (`SVC_WORKFLOW_CONFIG`,
`SVC_SOLUTION_GUIDE`, `SVC_IA_SUGGESTION`, `SVC_BUS_SEAT_RESERVATION` vs. los
nombres del diccionario) — desviacion tipificada como MENOR en
`.agents/templates/checklist-cad-f5.md`. Ese mismo template dice textualmente:
"Tres menores abiertas en la iniciativa: escala y bloquea". Con 5 menores
abiertas, el umbral ya esta cruzado. — Impacto: Gobierno de Datos debe tratar
esto como una desviacion que bloquea (no como 5 notas sueltas) antes de que
F4 pueda darse por cerrado para esas HU; afecta a `FT-ATC-18` (`HU-ATC-043`,
`044`), `FT-ATC-19` (`HU-ATC-047`, `048`) y `FT-ATC-23` (`HU-ATC-060`). —
Ademas, 3 HU quedaron en `Rechazado` por vacio de definicion MAYOR:
`HU-ATC-017` y `HU-ATC-033`/`034` referencian entidades
(`CITY_SERVICE_FEE`, `MAE_WARRANTY_COVERAGE_PERIOD`) que no estan en el
diccionario, y `HU-ATC-033` depende de `CONTRACT_UNIT_HANDOVER`, una entidad
de otro dominio (Postventa/Contratos) sin contrato de consulta definido —
esto es exactamente el tipo de caso que motivo la pregunta del usuario sobre
si "otros proyectos" comparten el modelo de datos (ver conversacion de esta
sesion): aqui el vacio es que `aybar-atc` no tiene todavia definido COMO
consulta ese dato de otro dominio (API, evento, o aun sin decidir). — Tomada
por: IA (dos forks independientes de F5); pendiente de resolucion de
Gobierno de Datos antes de G4.

**D-11** — 2026-10-19 — **División del proyecto en Etapa 1 y Etapa 2
(`RN-SVC-043`) e incorporación de 3 nuevas historias (`HU-ATC-061`..`063`,
total 63 HU y 23 features)**: a partir del archivo actualizado
`ATC_requerimientos.xlsx.ods` compartido por el usuario, el alcance se divide
oficialmente en dos etapas sin bloquear la salida inicial:
- **Etapa 1 · salida 30-oct-2026 (58 HU)**: todo el alcance funcional de ATC
  operando con usuarios, roles y maestro de gestores/líderes locales
  (`HU-ATC-001`, `008`, `046`, `054`, `055`), sin la sección de propuesta
  comercial en la consulta 360 (`HU-ATC-050`) y sin UrbeMind.
- **Etapa 2 · cierre estimado 15-dic-2026 (5 HU)**: integraciones con
  tecnologías de terceros aún en construcción:
  1. **NEXUS (`ACT-050`)**: `HU-ATC-061` (`RF-SVC-061` — SSO, identidad y
     roles) y `HU-ATC-062` (`RF-SVC-062` — estructura organizacional: líder,
     área, disponibilidad y ceses), vinculadas mediante la nueva entidad
     `ENT-SVC-021` (`SVC_IDENTITY_LINK`).
  2. **DAEDALUS (`ACT-051`)**: `HU-ATC-063` (`RF-SVC-063` — propuesta comercial
     y reserva en línea en la consulta 360).
  3. **UrbeMind (`PROC-SVC-007` / `FT-ATC-11`)**: `HU-ATC-017` (`RF-SVC-017`),
     `HU-ATC-018` (`RF-SVC-018`) y `RNF-INT-003`.
— Contexto: instrucción explícita del usuario al sincronizar con
`ATC_requerimientos.xlsx.ods`. — Impacto: se crea `FT-ATC-24` (`PROC-SVC-023` /
`CAP-SVC-018`) bajo `EP-ATC-10`, su `DOR-FT-ATC-24` y las historias
`HU-ATC-061`..`063`. Ninguna funcionalidad de la Etapa 1 queda bloqueada por
NEXUS, DAEDALUS ni UrbeMind. — Tomada por: PO / usuario (humano), 2026-10-19.

---

## Precedencia (recordatorio del marco)

`decisiones.md` manda sobre BRD, epicas, features, HU, DoR y test plan. Los
ADR `approved` del proyecto mandan sobre los defaults del SDK. Si
`decisiones.md` choca con un ADR `approved`, es una contradiccion y se
reporta, no se elige un lado.
