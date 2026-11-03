---
id: "RMP-ATC-DIFERIDO"
tipo: roadmap
titulo: "Alcance diferido de la Etapa 1 (P-025)"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "0.3"
owner: "Brayan Manuel Hurtado Paucar"
aprobadores: []
fecha: "2026-11-03"
relacionados: ["P-025", "R-01", "EP-ATC-08", "FT-ATC-15", "FT-ATC-19", "FT-ATC-20", "HU-ATC-037", "HU-ATC-038", "HU-ATC-039", "HU-ATC-053", "ADR-007", "FT-ATC-19"]
tags: [roadmap, alcance, diferido]
---

# Alcance diferido de la Etapa 1 (P-025)

**Actualización del 3-nov-2026:** HU-ATC-048 **vuelve a la Etapa 1** porque el Núcleo de IA entra en ella (ED-29; `adr/ADR-007` v0.9) y ya no está en este documento. **Siguen fuera de la Etapa 1:** HU-ATC-037, 038 y 039 (EP-ATC-08, EntregaFest; sin cambio respecto de P-025) y HU-ATC-053 (con un motivo nuevo, ver su sección). Lo que sigue describe la decisión del 26-oct; donde cita 5 historias o 16 h, hoy son 4 historias y 11 h.

**Decisión del equipo (Brayan Hurtado), 26-oct-2026** (`analisis/decisiones.md`, P-025). Las 28 h que exige DT-02 (outbox, publicador, proyector y bus, ADR-012) no caben en la holgura de 9 h del plan del PO. Por eso el equipo activó el recorte que el PO previó en su riesgo **R-01** (PLT-01 y PLT-05) y salen de la Etapa 1 las 5 historias de **alcance flexible**: HU-ATC-037, 038 y 039 (toda la EP-ATC-08 EntregaFest, FT-ATC-15), HU-ATC-048 y HU-ATC-053, en total 16 h *(desde el 3-nov, HU-048 volvió a la Etapa 1: quedan 4 historias y 11 h)*. **El R-01 es del PO, que conserva la decisión de revertirlo** (control de alcance del 29-oct o firma de G4): si lo revierte, estas tareas vuelven tal como están.

**Sobrecosto real (revisión interna del equipo, O-05): 7 h**, no 3 h. Capacidad del PLT-01 v1.3: 63 h por persona y 252 h el equipo (días 1 a 9 de 7 h y día 10 de UAT y pase). Carga del backlog de la Etapa 1: 255 h (Brayan 64, Jesús 64, Michel 64 y Daniel 63; 28 h técnicas en la iteración 1), 3 h más, y 4 h de la reestimación de ADR-009 que no se aplica (Jesús 1,5 y Michel 2,5): 7 h (Brayan 1, Jesús 2,5, Michel 3,5 y Daniel 0). Si el PO revierte el recorte, vuelven las historias que siguen fuera (11 h; el 26-oct eran 16 h y 23 h de sobrecosto). **Cifras del 26-oct, sin las horas del Núcleo de IA (HU-048 y HU-068 a HU-072), por estimar por el equipo; R-01 riesgo crítico para el PO** (por decidir: el sobrecosto vigente, cuando haya horas). El cálculo por iteración está en `RMP-001-roadmap-aybar-atiende.md` §1 y en `analisis/decisiones.md` (P-025, punto 7). Dueño: el PO.

Las tareas de HU-037, 038, 039 y 053 están **tal como estaban** en `backlog/tareas/` (mismas horas, responsables y dependencias) y vuelven allí cuando se retomen sus historias. Mientras, cada una de esas historias (HU-048 ya no) conserva en `backlog/tareas/` una tarea de 0 h que remite a este documento.

## EP-ATC-08 · EntregaFest: contención y derivación en vivo (6 h)

*Motivo de HU-037, 038 y 039: sin cambio, P-025 (alcance flexible, R-01; EntregaFest se retoma en una etapa posterior). El Núcleo de IA no las toca.*

### HU-ATC-037 Registrar el riesgo verbal y la secuencia de Frases Ancla · FT-ATC-15 · Podría · 2 h · iteración 2 (2026-10-30 → 2026-11-02)

| Tarea | Capa | Actividad | Responsable | Horas | Depende de | Título |
|---|---|---|---|---|---|---|
| HU-ATC-037-T01 | domain | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-025-T05 | [legalcases] Entidad del caso sensible del evento (nombre provisional SVC_EVENT_SENSITIVE_CASE; entidad por modelar, R-06): clasificacion del riesgo verbal y secuencia de Frases Ancla 4/5/6 (RN-SVC-030), y puerto en domain.port.out |
| HU-ATC-037-T02 | adapters | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-037-T01 | [legalcases] Migracion Flyway V33__crear_tabla_event_sensitive_case.sql y endpoint POST /api/v1/entregafest/casos; @PreAuthorize por rol del token segun arquitectura/roles-y-permisos-atc.md (P-034) |
| HU-ATC-037-T03 | boot | PRUEBAS | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-037-T02 | [legalcases] Un test por cada criterio de aceptacion de HU-ATC-037 (CA-01 y CA-02) con datos sinteticos; el id TC-... lo fija el test plan de QA (docs/pruebas/test-plan.md, aun no publicado) |
| HU-ATC-037-T04 | frontend | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-037-T02 | [legalcases] Pantalla rapida para el moderador: registrar clasificacion y secuencia aplicada, en Angular con @aybarcorp/ui-angular (ui: true: pantalla y estados segun G2) |

### HU-ATC-038 Derivar de inmediato a la Estación 4 sin debate · FT-ATC-15 · Podría · 2 h · iteración 2 (2026-11-02 → 2026-11-02)

| Tarea | Capa | Actividad | Responsable | Horas | Depende de | Título |
|---|---|---|---|---|---|---|
| HU-ATC-038-T01 | adapters | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-037-T02 | [legalcases] Migracion Flyway V37__agregar_columna_derived_to_station4_event_sensitive_case.sql y endpoint POST /api/v1/entregafest/casos/{id}/derivacion; @PreAuthorize por rol del token segun arquitectura/roles-y-permisos-atc.md (P-034) |
| HU-ATC-038-T02 | application | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-038-T01 | [legalcases] Caso de uso RegistrarDerivacionInmediataEstacion4UseCase (RN-SVC-028, RN-SVC-029) |
| HU-ATC-038-T03 | boot | PRUEBAS | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-038-T02 | [legalcases] Un test por cada criterio de aceptacion de HU-ATC-038 (CA-01 y CA-02) con datos sinteticos; el id TC-... lo fija el test plan de QA (docs/pruebas/test-plan.md, aun no publicado) |
| HU-ATC-038-T04 | frontend | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-038-T02 | [legalcases] Boton de derivacion inmediata a Estacion 4, sin debate en sala, en Angular con @aybarcorp/ui-angular (ui: true: pantalla y estados segun G2) |

### HU-ATC-039 Registrar el caso con la etiqueta estándar · FT-ATC-15 · Podría · 2 h · iteración 2 (2026-11-02 → 2026-11-02)

| Tarea | Capa | Actividad | Responsable | Horas | Depende de | Título |
|---|---|---|---|---|---|---|
| HU-ATC-039-T01 | adapters | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-037-T02 | [legalcases] Migracion Flyway V38__agregar_columna_tag_event_sensitive_case.sql y endpoint GET/POST /api/v1/entregafest/registro-casos-sensibles; @PreAuthorize por rol del token segun arquitectura/roles-y-permisos-atc.md (P-034) |
| HU-ATC-039-T02 | application | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-039-T01, HU-ATC-038-T02 | [legalcases] Caso de uso RegistrarCasoConEtiquetaEstandarUseCase (etiqueta: Atencion especial - derivacion a Legal, RN-SVC-028) |
| HU-ATC-039-T03 | boot | PRUEBAS | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-039-T02 | [legalcases] Un test por cada criterio de aceptacion de HU-ATC-039 (CA-01 y CA-02) con datos sinteticos; el id TC-... lo fija el test plan de QA (docs/pruebas/test-plan.md, aun no publicado) |
| HU-ATC-039-T04 | frontend | DESARROLLO | Brayan Manuel Hurtado Paucar | 0.5 | HU-ATC-039-T02 | [legalcases] Vista del Registro de Casos Sensibles del evento, en Angular con @aybarcorp/ui-angular (ui: true: pantalla y estados segun G2) |

## EP-ATC-09 · HU-ATC-048 ya no está diferida (3-nov-2026)

HU-ATC-048 **sale de este documento**: el Núcleo de IA entra en la Etapa 1 (decisión ED-29 del 3-nov-2026; `adr/ADR-007` v0.9) y HU-048 se reescribe como orquestador del Núcleo, junto con las propuestas HU-ATC-068 a HU-ATC-072 (FT-ATC-19). Las 6 tareas de 5 h del 26-oct (HU-ATC-048-T01 a T06, de Michel) quedan **superadas**: las horas del Núcleo están **por estimar por el equipo**, no se derivan de ellas. Pendiente: que el backlog de tareas (`backlog/tareas/`) deje de remitir a este documento para HU-048 (la tarea de 0 h `HU-ATC-048-T00`); no es parte de este documento.

## EP-ATC-10 · Consulta 360 e integraciones operativas (5 h)

### HU-ATC-053 Buscar documentos del cliente por significado · FT-ATC-20 · Podría · 5 h · iteración 1 (2026-10-23 → 2026-10-26)

**Motivo vigente (3-nov-2026): sigue fuera de la Etapa 1 por otra razón.** Ya no es solo alcance flexible (P-025): los documentos del cliente **no llevan índice vectorial** (corpus C de `adr/ADR-007` v0.9: búsqueda por metadatos exactos cliente-lote, HU-ATC-052), y `SVC_SEARCH_INDEX` (ENT-SVC-017) sigue como colección del almacén de lectura (HU-049); no se activa su búsqueda por significado. La HU se replantea antes de retomarla; las tareas de abajo son las del 26-oct.

| Tarea | Capa | Actividad | Responsable | Horas | Depende de | Título |
|---|---|---|---|---|---|---|
| HU-ATC-053-T01 | domain | DESARROLLO | Daniel David Lorenzo Ramos | 0.5 | — | [customer360] Puerto IndexadorSemanticoPort en domain.port.out sobre SVC_SEARCH_INDEX y GOV_DOCUMENT_REPOSITORY (los repositorios a indexar son la pregunta abierta P-01 de FT-ATC-20) |
| HU-ATC-053-T02 | adapters | DESARROLLO | Daniel David Lorenzo Ramos | 1 | HU-ATC-053-T01 | [integrations] Adaptador de indexacion y de busqueda semantica via el servicio de asistencia de IA (DEP-14, ADR-007: anonimizacion y registro) sobre el repositorio documental (DEP-06; Azure Blob Storage, DT-07) |
| HU-ATC-053-T03 | application | DESARROLLO | Daniel David Lorenzo Ramos | 0.5 | HU-ATC-053-T02, HU-ATC-050-T01, HU-ATC-049-T02 | [customer360] Caso de uso BuscarSemanticamenteUseCase (resultados con fragmento y permisos aplicados via PoliticaVisibilidad360, RN-SVC-036; DLP RN-SVC-012) |
| HU-ATC-053-T04 | adapters | DESARROLLO | Daniel David Lorenzo Ramos | 0.5 | HU-ATC-053-T03 | [customer360] Endpoint GET /api/v1/clientes/{id}/documentos/buscar-semantico (p95 <= 3s); @PreAuthorize por rol del token segun arquitectura/roles-y-permisos-atc.md (P-034) |
| HU-ATC-053-T05 | boot | PRUEBAS | Daniel David Lorenzo Ramos | 0.5 | HU-ATC-053-T04 | [customer360] Un test por cada criterio de aceptacion de HU-ATC-053 (CA-01 a CA-03) con datos sinteticos; el id TC-... lo fija el test plan de QA (docs/pruebas/test-plan.md, aun no publicado) |
| HU-ATC-053-T06 | frontend | DESARROLLO | Daniel David Lorenzo Ramos | 2 | HU-ATC-053-T04 | [customer360] Resultados de busqueda semantica con fragmento resaltado en la pantalla de busqueda, en Angular con @aybarcorp/ui-angular (ui: true: pantalla y estados segun G2) |

**Total diferido: 11 h** (HU-037, 038, 039 y 053; el 26-oct eran 16 h con HU-048).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial: tareas apartadas de la Etapa 1 por P-025 |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo: el recorte es el R-01 del PO, que puede revertirlo; sobrecosto real de 7 h con su cálculo. Las tareas no cambian |
| 0.3 | 2026-11-03 | Jesús Chávez Elías, con IA | El Núcleo de IA entra en la Etapa 1 (ED-29; ADR-007 v0.9): HU-048 sale del diferido (total 11 h); HU-053 sigue fuera con el motivo nuevo (sin índice vectorial de documentos, HU-052); HU-037, 038 y 039 sin cambio. Horas del Núcleo por estimar |

Generado por IA a partir de `backlog/tareas/` v1.3. — Revisado por: (pendiente)

Historial: 0.2 · 2026-10-26 · Brayan Hurtado, con IA · R-01 del PO reversible y sobrecosto real de 7 h. — Revisado por: (pendiente)

Actualizado el 3-nov-2026 (v0.3) por Jesús Chávez Elías con IA (Claude): HU-048 sale del diferido por el Núcleo de IA (ED-29, ADR-007 v0.9); HU-053 sigue fuera por otro motivo. — Revisado por: (pendiente)

Historial: 0.3 · 2026-11-03 · Jesús Chávez Elías, con IA · HU-048 sale del diferido (total 11 h); HU-053 con motivo nuevo; HU-037, 038 y 039 sin cambio. — Revisado por: (pendiente)
