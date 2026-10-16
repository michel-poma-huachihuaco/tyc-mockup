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

---

## Precedencia (recordatorio del marco)

`decisiones.md` manda sobre BRD, epicas, features, HU, DoR y test plan. Los
ADR `approved` del proyecto mandan sobre los defaults del SDK. Si
`decisiones.md` choca con un ADR `approved`, es una contradiccion y se
reporta, no se elige un lado.
