---
id: "TP-ATC-001"
tipo: test-plan
titulo: "Plan de pruebas inicial - Aybar Atiende · Plataforma ATC (Etapa 1)"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: []
fecha: "2026-11-03"
relacionados: ["EP-ATC-01", "EP-ATC-02", "EP-ATC-03", "EP-ATC-04", "EP-ATC-05", "EP-ATC-06", "EP-ATC-07", "EP-ATC-08", "EP-ATC-09", "EP-ATC-10", "EP-ATC-11"]
tags: [pruebas, test-plan, g4, g6]
---

# Plan de pruebas inicial (T-TEST-PLAN) - G4 · G6

- Ticket: (pendiente: AYB-NNNN del proyecto; Nexora aún no tiene ítems de trabajo en PJ-06) - Tipo: (pendiente: T1/T2/T3)
- Alcance: Etapa 1 · 11 épicas · 23 features · 62 HU · **197 casos de prueba (uno por criterio de aceptación)**; más el Núcleo de IA (HU-048 reescrita y HU-068 a HU-072, propuestas): 25 casos adicionales en FT-ATC-19, por consolidar (ver esa sección). HU-053 queda fuera de la Etapa 1 (sin índice vectorial; se replantea): sus 3 casos no se ejecutan en la Etapa 1
- Origen: criterios Gherkin `CA-NN` de cada HU del paquete Definir de Nexora (PJ-06, v1.3). Es el plan **inicial** (DoR punto 8 · «casos iniciales de QA»): ningún ciclo se ha ejecutado.
- Flujos críticos E2E: **los define el PO** (pendiente). Candidatos: los 11 flujos de `flujos/flujos.json` (FL-ATC-01 a FL-ATC-11).
- Preparado por IA a partir de los documentos de Nexora; lo consolida y aprueba QA.

## Cómo se identifican los casos

Cada criterio `CA-NN` de la HU `HU-ATC-NNN` tiene el caso `TC-ATC-NNN-NN` (por ejemplo, `CA-02` de `HU-ATC-001` es `TC-ATC-001-02`). El desarrollador escribe un test por cada TC con ese id en el nombre del test; QA verifica que ninguno falte.

## Ciclos ejecutados (referencia: qa-ciclos)

| Ciclo | Fecha | Casos | Fallidos | % | Sev x Impacto | Resultado | Valida |
|---|---|---|---|---|---|---|---|
| 0 Perf+Sec | — | — | — | <=20% | — | [apto/no] · sin ejecutar | QA |
| 1 Funcional | — | — | — | <=20% | — | [apto/no] · sin ejecutar | PO |
| 2 Integral | — | — | — | <=10% | — | [apto/no] · sin ejecutar | QA+PO |
| 3 UAT | — | — | — | - | — | [aceptado/no] · sin ejecutar | Cliente |

El porcentaje se lee junto a severidad e impacto; nunca decide solo. Una brecha de seguridad alta abierta no aprueba, sin importar el porcentaje (marco de QA de Nexora).

## Cobertura por épica

| Épica | Features | HU | Casos (TC) |
|---|---|---|---|
| EP-ATC-01 Núcleo de tickets omnicanal | 2 | 5 | 17 |
| EP-ATC-02 Enrutamiento, SLA y alertas | 2 | 7 | 20 |
| EP-ATC-03 Libro de Reclamaciones y apelaciones | 2 | 5 | 16 |
| EP-ATC-04 Gate legal Eje 3 y Mesa de Casos sensibles | 3 | 9 | 23 |
| EP-ATC-05 Postventa: reclamos de garantía | 1 | 4 | 8 |
| EP-ATC-06 Autogestión del cliente y trazabilidad (Mi Portal) | 1 | 3 | 13 |
| EP-ATC-07 Calidad de atención y Torre de Control CX | 2 | 4 | 9 |
| EP-ATC-08 EntregaFest: contención y derivación en vivo | 1 | 3 | 6 |
| EP-ATC-09 Bandeja orquestadora y asistencia al gestor | 4 | 9 | 39 |
| EP-ATC-10 Consulta 360 e integraciones operativas | 3 | 8 | 31 |
| EP-ATC-11 Resolución por morosidad y formularios simples | 2 | 5 | 15 |
| **Total** | **23** | **62** | **197** |

## Casos

Tipo: func / E2E / API / integ / regres / advers. Propuesta inicial de la IA (**12 adversariales**, los criterios de permisos y accesos; el resto, funcionales): QA los reclasifica y agrega los de performance, integración y regresión de los ciclos 0 y 2. Resultado inicial de todos: Pendiente.

### EP-ATC-01 · Núcleo de tickets omnicanal

#### FT-ATC-01 · Registro multicanal y tipificación

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-001-01 | HU-ATC-001 | CA-01 | Campos obligatorios | func | Pendiente | — |
| TC-ATC-001-02 | HU-ATC-001 | CA-02 | Canal remoto sin local | func | Pendiente | — |
| TC-ATC-001-03 | HU-ATC-001 | CA-03 | Cliente desde SIGDA/TAXON | func | Pendiente | — |
| TC-ATC-001-04 | HU-ATC-001 | CA-04 | Permiso | advers | Pendiente | — |
| TC-ATC-002-01 | HU-ATC-002 | CA-01 | Correlativo por empresa | func | Pendiente | — |
| TC-ATC-002-02 | HU-ATC-002 | CA-02 | Número visible | func | Pendiente | — |
| TC-ATC-002-03 | HU-ATC-002 | CA-03 | Concurrencia | func | Pendiente | — |

#### FT-ATC-02 · Ciclo de vida, interacciones e hitos

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-004-01 | HU-ATC-004 | CA-01 | Historial | func | Pendiente | — |
| TC-ATC-004-02 | HU-ATC-004 | CA-02 | Inmutabilidad | func | Pendiente | — |
| TC-ATC-004-03 | HU-ATC-004 | CA-03 | Cambio automático | func | Pendiente | — |
| TC-ATC-004-04 | HU-ATC-004 | CA-04 | Transición inválida | func | Pendiente | — |
| TC-ATC-005-01 | HU-ATC-005 | CA-01 | Primera respuesta | func | Pendiente | — |
| TC-ATC-005-02 | HU-ATC-005 | CA-02 | Evidencia | func | Pendiente | — |
| TC-ATC-005-03 | HU-ATC-005 | CA-03 | Nota interna | func | Pendiente | — |
| TC-ATC-005-04 | HU-ATC-005 | CA-04 | DLP | func | Pendiente | — |
| TC-ATC-006-01 | HU-ATC-006 | CA-01 | Reapertura | func | Pendiente | — |
| TC-ATC-006-02 | HU-ATC-006 | CA-02 | Cierre | func | Pendiente | — |

### EP-ATC-02 · Enrutamiento, SLA y alertas

#### FT-ATC-03 · Derivación, reasignación y casillero

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-007-01 | HU-ATC-007 | CA-01 | Área sin persona | func | Pendiente | — |
| TC-ATC-007-02 | HU-ATC-007 | CA-02 | Rastro | func | Pendiente | — |
| TC-ATC-007-03 | HU-ATC-007 | CA-03 | Motivo obligatorio | func | Pendiente | — |
| TC-ATC-008-01 | HU-ATC-008 | CA-01 | Cese | func | Pendiente | — |
| TC-ATC-008-02 | HU-ATC-008 | CA-02 | Reparto | func | Pendiente | — |
| TC-ATC-008-03 | HU-ATC-008 | CA-03 | Permiso | advers | Pendiente | — |
| TC-ATC-009-01 | HU-ATC-009 | CA-01 | Bandeja | func | Pendiente | — |
| TC-ATC-009-02 | HU-ATC-009 | CA-02 | Filtros | func | Pendiente | — |
| TC-ATC-009-03 | HU-ATC-009 | CA-03 | Sin asignar | func | Pendiente | — |

#### FT-ATC-04 · Motor SLA y alertas

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-003-01 | HU-ATC-003 | CA-01 | Precedencia | func | Pendiente | — |
| TC-ATC-003-02 | HU-ATC-003 | CA-02 | Feriado | func | Pendiente | — |
| TC-ATC-003-03 | HU-ATC-003 | CA-03 | Cambio de política | func | Pendiente | — |
| TC-ATC-003-04 | HU-ATC-003 | CA-04 | Sin política | func | Pendiente | — |
| TC-ATC-010-01 | HU-ATC-010 | CA-01 | Sin duplicados | func | Pendiente | — |
| TC-ATC-010-02 | HU-ATC-010 | CA-02 | Constancia | func | Pendiente | — |
| TC-ATC-010-03 | HU-ATC-010 | CA-03 | Ticket resuelto | func | Pendiente | — |
| TC-ATC-011-01 | HU-ATC-011 | CA-01 | Nuevo compromiso | func | Pendiente | — |
| TC-ATC-011-02 | HU-ATC-011 | CA-02 | Contador | func | Pendiente | — |
| TC-ATC-029-01 | HU-ATC-029 | CA-01 | Sin escalamiento | func | Pendiente | — |
| TC-ATC-029-02 | HU-ATC-029 | CA-02 | Con escalamiento | func | Pendiente | — |

### EP-ATC-03 · Libro de Reclamaciones y apelaciones

#### FT-ATC-05 · Libro de Reclamaciones

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-012-01 | HU-ATC-012 | CA-01 | Correlativo | func | Pendiente | — |
| TC-ATC-012-02 | HU-ATC-012 | CA-02 | Monto y moneda | func | Pendiente | — |
| TC-ATC-012-03 | HU-ATC-012 | CA-03 | Empresa inmutable | func | Pendiente | — |
| TC-ATC-013-01 | HU-ATC-013 | CA-01 | Requisitos de prórroga | func | Pendiente | — |
| TC-ATC-013-02 | HU-ATC-013 | CA-02 | Sin reescritura | func | Pendiente | — |
| TC-ATC-013-03 | HU-ATC-013 | CA-03 | Segunda prórroga | func | Pendiente | — |
| TC-ATC-013-04 | HU-ATC-013 | CA-04 | Fuera de ventana | func | Pendiente | — |
| TC-ATC-014-01 | HU-ATC-014 | CA-01 | Respuesta válida | func | Pendiente | — |
| TC-ATC-014-02 | HU-ATC-014 | CA-02 | Derecho INDECOPI | func | Pendiente | — |
| TC-ATC-014-03 | HU-ATC-014 | CA-03 | Sin cargo | func | Pendiente | — |
| TC-ATC-015-01 | HU-ATC-015 | CA-01 | Alerta legal | func | Pendiente | — |
| TC-ATC-015-02 | HU-ATC-015 | CA-02 | Huérfano | func | Pendiente | — |
| TC-ATC-015-03 | HU-ATC-015 | CA-03 | Plazo prorrogado | func | Pendiente | — |

#### FT-ATC-06 · Apelaciones internas e INDECOPI

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-016-01 | HU-ATC-016 | CA-01 | Resolución INDECOPI | func | Pendiente | — |
| TC-ATC-016-02 | HU-ATC-016 | CA-02 | Historial | func | Pendiente | — |
| TC-ATC-016-03 | HU-ATC-016 | CA-03 | Desistimiento | func | Pendiente | — |

### EP-ATC-04 · Gate legal Eje 3 y Mesa de Casos sensibles

#### FT-ATC-07 · Gate de derivación a Eje 3 y handoff

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-026-01 | HU-ATC-026 | CA-01 | Detección | func | Pendiente | — |
| TC-ATC-026-02 | HU-ATC-026 | CA-02 | Gate | func | Pendiente | — |
| TC-ATC-026-03 | HU-ATC-026 | CA-03 | Marca por error | func | Pendiente | — |
| TC-ATC-027-01 | HU-ATC-027 | CA-01 | Paquete completo | func | Pendiente | — |
| TC-ATC-027-02 | HU-ATC-027 | CA-02 | Confirmación | func | Pendiente | — |
| TC-ATC-027-03 | HU-ATC-027 | CA-03 | Sin confirmar | func | Pendiente | — |
| TC-ATC-028-01 | HU-ATC-028 | CA-01 | Nota objetiva | func | Pendiente | — |
| TC-ATC-028-02 | HU-ATC-028 | CA-02 | Aviso | func | Pendiente | — |
| TC-ATC-028-03 | HU-ATC-028 | CA-03 | Palabras de juicio | func | Pendiente | — |

#### FT-ATC-08 · Mesa SGD: recepción, activación y riesgo

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-020-01 | HU-ATC-020 | CA-01 | Código único | func | Pendiente | — |
| TC-ATC-020-02 | HU-ATC-020 | CA-02 | Reclasificación | func | Pendiente | — |
| TC-ATC-021-01 | HU-ATC-021 | CA-01 | Cargo previo | func | Pendiente | — |
| TC-ATC-021-02 | HU-ATC-021 | CA-02 | Activación | func | Pendiente | — |
| TC-ATC-021-03 | HU-ATC-021 | CA-03 | Limbo | func | Pendiente | — |
| TC-ATC-022-01 | HU-ATC-022 | CA-01 | Cálculo objetivo | func | Pendiente | — |
| TC-ATC-022-02 | HU-ATC-022 | CA-02 | Recalibración | func | Pendiente | — |

#### FT-ATC-09 · Escalamiento, vinculación y cierre tipificado

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-023-01 | HU-ATC-023 | CA-01 | Alerta temprana | func | Pendiente | — |
| TC-ATC-023-02 | HU-ATC-023 | CA-02 | Cadena | func | Pendiente | — |
| TC-ATC-023-03 | HU-ATC-023 | CA-03 | Resolución | func | Pendiente | — |
| TC-ATC-024-01 | HU-ATC-024 | CA-01 | Coincidencia | func | Pendiente | — |
| TC-ATC-024-02 | HU-ATC-024 | CA-02 | Hilo único | func | Pendiente | — |
| TC-ATC-025-01 | HU-ATC-025 | CA-01 | Estado homologado | func | Pendiente | — |
| TC-ATC-025-02 | HU-ATC-025 | CA-02 | Custodia | func | Pendiente | — |

### EP-ATC-05 · Postventa: reclamos de garantía

#### FT-ATC-10 · Reclamos de garantía postventa

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-033-01 | HU-ATC-033 | CA-01 | Vínculo obligatorio | func | Pendiente | — |
| TC-ATC-033-02 | HU-ATC-033 | CA-02 | Catálogo cerrado | func | Pendiente | — |
| TC-ATC-034-01 | HU-ATC-034 | CA-01 | Validación | func | Pendiente | — |
| TC-ATC-034-02 | HU-ATC-034 | CA-02 | Fuera de cobertura | func | Pendiente | — |
| TC-ATC-035-01 | HU-ATC-035 | CA-01 | Inspección | func | Pendiente | — |
| TC-ATC-035-02 | HU-ATC-035 | CA-02 | Resolución | func | Pendiente | — |
| TC-ATC-036-01 | HU-ATC-036 | CA-01 | Conflicto | func | Pendiente | — |
| TC-ATC-036-02 | HU-ATC-036 | CA-02 | Adenda | func | Pendiente | — |

### EP-ATC-06 · Autogestión del cliente y trazabilidad (Mi Portal)

#### FT-ATC-24 · Autogestión de tickets del cliente en Mi Portal

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-064-01 | HU-ATC-064 | CA-01 | Registro guiado | func | Pendiente | — |
| TC-ATC-064-02 | HU-ATC-064 | CA-02 | Mis tickets | func | Pendiente | — |
| TC-ATC-064-03 | HU-ATC-064 | CA-03 | Datos del cliente | func | Pendiente | — |
| TC-ATC-064-04 | HU-ATC-064 | CA-04 | Reclamo legal | func | Pendiente | — |
| TC-ATC-064-05 | HU-ATC-064 | CA-05 | Adjunto no permitido | func | Pendiente | — |
| TC-ATC-065-01 | HU-ATC-065 | CA-01 | Línea de tiempo | func | Pendiente | — |
| TC-ATC-065-02 | HU-ATC-065 | CA-02 | Aviso de cambio | func | Pendiente | — |
| TC-ATC-065-03 | HU-ATC-065 | CA-03 | Notas internas | func | Pendiente | — |
| TC-ATC-065-04 | HU-ATC-065 | CA-04 | Ticket de otro cliente | func | Pendiente | — |
| TC-ATC-066-01 | HU-ATC-066 | CA-01 | Responder al gestor | func | Pendiente | — |
| TC-ATC-066-02 | HU-ATC-066 | CA-02 | Confirmar solución | func | Pendiente | — |
| TC-ATC-066-03 | HU-ATC-066 | CA-03 | Rechazar solución | func | Pendiente | — |
| TC-ATC-066-04 | HU-ATC-066 | CA-04 | Sin respuesta | func | Pendiente | — |

### EP-ATC-07 · Calidad de atención y Torre de Control CX

#### FT-ATC-13 · Encuesta post-atención

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-019-01 | HU-ATC-019 | CA-01 | Disparo | func | Pendiente | — |
| TC-ATC-019-02 | HU-ATC-019 | CA-02 | Medición | func | Pendiente | — |
| TC-ATC-019-03 | HU-ATC-019 | CA-03 | Reapertura | func | Pendiente | — |

#### FT-ATC-14 · Torre de Control CX

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-030-01 | HU-ATC-030 | CA-01 | Riesgo | func | Pendiente | — |
| TC-ATC-030-02 | HU-ATC-030 | CA-02 | Redistribución | func | Pendiente | — |
| TC-ATC-031-01 | HU-ATC-031 | CA-01 | Diario | func | Pendiente | — |
| TC-ATC-031-02 | HU-ATC-031 | CA-02 | Quincenal | func | Pendiente | — |
| TC-ATC-032-01 | HU-ATC-032 | CA-01 | Corte | func | Pendiente | — |
| TC-ATC-032-02 | HU-ATC-032 | CA-02 | Hallazgo | func | Pendiente | — |

### EP-ATC-08 · EntregaFest: contención y derivación en vivo

#### FT-ATC-15 · EntregaFest: contención en vivo

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-037-01 | HU-ATC-037 | CA-01 | Frase 4 | func | Pendiente | — |
| TC-ATC-037-02 | HU-ATC-037 | CA-02 | Frase 6 | func | Pendiente | — |
| TC-ATC-038-01 | HU-ATC-038 | CA-01 | Palabra gatillo | func | Pendiente | — |
| TC-ATC-038-02 | HU-ATC-038 | CA-02 | Sin reapertura | func | Pendiente | — |
| TC-ATC-039-01 | HU-ATC-039 | CA-01 | Etiqueta | func | Pendiente | — |
| TC-ATC-039-02 | HU-ATC-039 | CA-02 | Revisión | func | Pendiente | — |

### EP-ATC-09 · Bandeja orquestadora y asistencia al gestor

#### FT-ATC-18 · Bandeja orquestadora y flujos por área

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-043-01 | HU-ATC-043 | CA-01 | Flujo aplicado | func | Pendiente | — |
| TC-ATC-043-02 | HU-ATC-043 | CA-02 | Versión del flujo | func | Pendiente | — |
| TC-ATC-043-03 | HU-ATC-043 | CA-03 | Datos obligatorios | func | Pendiente | — |
| TC-ATC-043-04 | HU-ATC-043 | CA-04 | Actividades en orden | advers | Pendiente | — |
| TC-ATC-043-05 | HU-ATC-043 | CA-05 | SLA del flujo | func | Pendiente | — |
| TC-ATC-043-06 | HU-ATC-043 | CA-06 | Combinación única | func | Pendiente | — |
| TC-ATC-043-07 | HU-ATC-043 | CA-07 | Sin flujo | func | Pendiente | — |
| TC-ATC-043-08 | HU-ATC-043 | CA-08 | Permiso y bitácora | advers | Pendiente | — |
| TC-ATC-044-01 | HU-ATC-044 | CA-01 | Orden de la bandeja | func | Pendiente | — |
| TC-ATC-044-02 | HU-ATC-044 | CA-02 | Asignación por flujo | func | Pendiente | — |
| TC-ATC-044-03 | HU-ATC-044 | CA-03 | Sin permiso de área | advers | Pendiente | — |
| TC-ATC-045-01 | HU-ATC-045 | CA-01 | Marca con motivo | func | Pendiente | — |
| TC-ATC-045-02 | HU-ATC-045 | CA-02 | Permiso | advers | Pendiente | — |
| TC-ATC-045-03 | HU-ATC-045 | CA-03 | Límite del área | func | Pendiente | — |
| TC-ATC-046-01 | HU-ATC-046 | CA-01 | Balanceo | func | Pendiente | — |
| TC-ATC-046-02 | HU-ATC-046 | CA-02 | Exclusiones | func | Pendiente | — |
| TC-ATC-046-03 | HU-ATC-046 | CA-03 | Nadie disponible | func | Pendiente | — |

#### FT-ATC-25 · Visor del proceso 3D (operación en vivo)

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-067-01 | HU-ATC-067 | CA-01 | Escena de la sede | func | Pendiente | — |
| TC-ATC-067-02 | HU-ATC-067 | CA-02 | Recorrido del ticket | func | Pendiente | — |
| TC-ATC-067-03 | HU-ATC-067 | CA-03 | Color del SLA | func | Pendiente | — |
| TC-ATC-067-04 | HU-ATC-067 | CA-04 | Panel del área | func | Pendiente | — |
| TC-ATC-067-05 | HU-ATC-067 | CA-05 | Seguimiento del ticket | func | Pendiente | — |
| TC-ATC-067-06 | HU-ATC-067 | CA-06 | Indicadores y actividad | func | Pendiente | — |
| TC-ATC-067-07 | HU-ATC-067 | CA-07 | Filtro y permisos | advers | Pendiente | — |
| TC-ATC-067-08 | HU-ATC-067 | CA-08 | Tiempo real | func | Pendiente | — |
| TC-ATC-067-09 | HU-ATC-067 | CA-09 | Vista alternativa | func | Pendiente | — |
| TC-ATC-067-10 | HU-ATC-067 | CA-10 | Equipo, no individuos | func | Pendiente | — |

#### FT-ATC-19 · Asistencia al gestor: guía e IA

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-047-01 | HU-ATC-047 | CA-01 | Guía en el ticket | func | Pendiente | — |
| TC-ATC-047-02 | HU-ATC-047 | CA-02 | Versión | func | Pendiente | — |
| TC-ATC-047-03 | HU-ATC-047 | CA-03 | Tipo sin guía | func | Pendiente | — |
| TC-ATC-048-01 | HU-ATC-048 | CA-01 | Borrador verificado | func | Pendiente | — |
| TC-ATC-048-02 | HU-ATC-048 | CA-02 | Registro de la decisión | func | Pendiente | — |
| TC-ATC-048-03 | HU-ATC-048 | CA-03 | Datos personales | func | Pendiente | — |
| TC-ATC-048-04 | HU-ATC-048 | CA-04 | Nada sale sin el gestor | func | Pendiente | — |
| TC-ATC-048-05 | HU-ATC-048 | CA-05 | Escalamiento | func | Pendiente | — |
| TC-ATC-048-06 | HU-ATC-048 | CA-06 | Proveedor intercambiable | func | Pendiente | — |
| TC-ATC-068-01 | HU-ATC-068 | CA-01 | Datos de otro cliente | advers | Pendiente | — |
| TC-ATC-068-02 | HU-ATC-068 | CA-02 | Texto que intenta manipular a la IA | advers | Pendiente | — |
| TC-ATC-068-03 | HU-ATC-068 | CA-03 | El cliente no se elige por parámetro | advers | Pendiente | — |
| TC-ATC-069-01 | HU-ATC-069 | CA-01 | Coincide | func | Pendiente | — |
| TC-ATC-069-02 | HU-ATC-069 | CA-02 | No coincide, un reintento | func | Pendiente | — |
| TC-ATC-069-03 | HU-ATC-069 | CA-03 | Afirmación sin respaldo | func | Pendiente | — |
| TC-ATC-069-04 | HU-ATC-069 | CA-04 | Tono | func | Pendiente | — |
| TC-ATC-069-05 | HU-ATC-069 | CA-05 | El gestor ve la evidencia | func | Pendiente | — |
| TC-ATC-070-01 | HU-ATC-070 | CA-01 | Tipo reconocido | func | Pendiente | — |
| TC-ATC-070-02 | HU-ATC-070 | CA-02 | Reglas en código | func | Pendiente | — |
| TC-ATC-070-03 | HU-ATC-070 | CA-03 | Caso mixto o sin tipo | func | Pendiente | — |
| TC-ATC-070-04 | HU-ATC-070 | CA-04 | Independiente del canal | func | Pendiente | — |
| TC-ATC-071-01 | HU-ATC-071 | CA-01 | Señal con motivo | func | Pendiente | — |
| TC-ATC-071-02 | HU-ATC-071 | CA-02 | El Núcleo no decide a quién | func | Pendiente | — |
| TC-ATC-071-03 | HU-ATC-071 | CA-03 | Estado visible | func | Pendiente | — |
| TC-ATC-071-04 | HU-ATC-071 | CA-04 | Reanudación | func | Pendiente | — |
| TC-ATC-071-05 | HU-ATC-071 | CA-05 | Falla cerrada | func | Pendiente | — |
| TC-ATC-071-06 | HU-ATC-071 | CA-06 | Tablero de motivos | func | Pendiente | — |
| TC-ATC-072-01 | HU-ATC-072 | CA-01 | Puerta de despliegue | func | Pendiente | — |
| TC-ATC-072-02 | HU-ATC-072 | CA-02 | Casos anonimizados | func | Pendiente | — |
| TC-ATC-072-03 | HU-ATC-072 | CA-03 | El corpus no se imita a sí mismo | func | Pendiente | — |
| TC-ATC-072-04 | HU-ATC-072 | CA-04 | Versión trazable | func | Pendiente | — |

Núcleo de IA en la Etapa 1 (decisión ED-29, 3-nov-2026; `adr/ADR-007` v0.9, pendiente de aprobación del Líder Técnico): HU-048 se reescribió (CA-04 a CA-06 nuevos) y HU-068 a HU-072 son propuestas (numeración y RF por asignar por el PO). Los 25 casos añadidos (3 de HU-048 y 22 de HU-068 a HU-072) salen de los CA de esas HU, **no están contados** en los 197 de arriba; los consolida QA. Si cambian los CA de las HU, cambian estos casos.

#### FT-ATC-21 · Productividad y notificaciones del gestor

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-054-01 | HU-ATC-054 | CA-01 | Tablero del gestor | func | Pendiente | — |
| TC-ATC-054-02 | HU-ATC-054 | CA-02 | Tablero del líder | func | Pendiente | — |
| TC-ATC-054-03 | HU-ATC-054 | CA-03 | Privacidad | func | Pendiente | — |
| TC-ATC-055-01 | HU-ATC-055 | CA-01 | Correo de asignación | func | Pendiente | — |
| TC-ATC-055-02 | HU-ATC-055 | CA-02 | Reasignación masiva | func | Pendiente | — |
| TC-ATC-055-03 | HU-ATC-055 | CA-03 | Sin líder | func | Pendiente | — |

### EP-ATC-10 · Consulta 360 e integraciones operativas

#### FT-ATC-20 · Búsqueda y consulta 360 del cliente

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-049-01 | HU-ATC-049 | CA-01 | Búsqueda | func | Pendiente | — |
| TC-ATC-049-02 | HU-ATC-049 | CA-02 | Llamar desde la ficha | func | Pendiente | — |
| TC-ATC-049-03 | HU-ATC-049 | CA-03 | Varias coincidencias | func | Pendiente | — |
| TC-ATC-050-01 | HU-ATC-050 | CA-01 | Consulta 360 | func | Pendiente | — |
| TC-ATC-050-02 | HU-ATC-050 | CA-02 | Sección restringida | advers | Pendiente | — |
| TC-ATC-050-03 | HU-ATC-050 | CA-03 | Fuente caída | func | Pendiente | — |
| TC-ATC-050-04 | HU-ATC-050 | CA-04 | Mapa de fuentes | func | Pendiente | — |
| TC-ATC-050-05 | HU-ATC-050 | CA-05 | Ficha resumen | advers | Pendiente | — |
| TC-ATC-050-06 | HU-ATC-050 | CA-06 | Detalle del dato | func | Pendiente | — |
| TC-ATC-050-07 | HU-ATC-050 | CA-07 | Datos por rol | advers | Pendiente | — |
| TC-ATC-050-08 | HU-ATC-050 | CA-08 | Cliente no encontrado | func | Pendiente | — |
| TC-ATC-050-09 | HU-ATC-050 | CA-09 | Tiempo de respuesta | func | Pendiente | — |
| TC-ATC-050-10 | HU-ATC-050 | CA-10 | Trazabilidad de la consulta | func | Pendiente | — |
| TC-ATC-051-01 | HU-ATC-051 | CA-01 | Cliente no encontrado | func | Pendiente | — |
| TC-ATC-051-02 | HU-ATC-051 | CA-02 | Sistema fuente caído | func | Pendiente | — |
| TC-ATC-051-03 | HU-ATC-051 | CA-03 | Vinculación posterior | func | Pendiente | — |
| TC-ATC-052-01 | HU-ATC-052 | CA-01 | Consulta vía API | func | Pendiente | — |
| TC-ATC-052-02 | HU-ATC-052 | CA-02 | Motor no disponible | func | Pendiente | — |
| TC-ATC-052-03 | HU-ATC-052 | CA-03 | Permisos | advers | Pendiente | — |
| TC-ATC-053-01 | HU-ATC-053 | CA-01 | Búsqueda semántica | func | Pendiente | — |
| TC-ATC-053-02 | HU-ATC-053 | CA-02 | Documento restringido | advers | Pendiente | — |
| TC-ATC-053-03 | HU-ATC-053 | CA-03 | Sin resultados | func | Pendiente | — |

#### FT-ATC-17 · Integración con la plataforma del call center

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-042-01 | HU-ATC-042 | CA-01 | Screen pop | func | Pendiente | — |
| TC-ATC-042-02 | HU-ATC-042 | CA-02 | Registro de la llamada | func | Pendiente | — |
| TC-ATC-042-03 | HU-ATC-042 | CA-03 | Número desconocido | func | Pendiente | — |

#### FT-ATC-16 · Integración con Legal y prevención de denuncias

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-040-01 | HU-ATC-040 | CA-01 | Envío a Legal | func | Pendiente | — |
| TC-ATC-040-02 | HU-ATC-040 | CA-02 | Estado de vuelta | func | Pendiente | — |
| TC-ATC-040-03 | HU-ATC-040 | CA-03 | Legal no disponible | func | Pendiente | — |
| TC-ATC-041-01 | HU-ATC-041 | CA-01 | Cálculo de exposición | func | Pendiente | — |
| TC-ATC-041-02 | HU-ATC-041 | CA-02 | Alerta a Legal | func | Pendiente | — |
| TC-ATC-041-03 | HU-ATC-041 | CA-03 | Sin monto | func | Pendiente | — |

### EP-ATC-11 · Resolución por morosidad y formularios simples

#### FT-ATC-22 · Resolución de contrato por morosidad

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-056-01 | HU-ATC-056 | CA-01 | Detección diaria | func | Pendiente | — |
| TC-ATC-056-02 | HU-ATC-056 | CA-02 | Regularización | func | Pendiente | — |
| TC-ATC-056-03 | HU-ATC-056 | CA-03 | Reclamo abierto | func | Pendiente | — |
| TC-ATC-057-01 | HU-ATC-057 | CA-01 | Envío en paralelo | func | Pendiente | — |
| TC-ATC-057-02 | HU-ATC-057 | CA-02 | Constancia | func | Pendiente | — |
| TC-ATC-057-03 | HU-ATC-057 | CA-03 | Canal fallido | func | Pendiente | — |
| TC-ATC-058-01 | HU-ATC-058 | CA-01 | Carta con copia | func | Pendiente | — |
| TC-ATC-058-02 | HU-ATC-058 | CA-02 | Escalamiento | func | Pendiente | — |
| TC-ATC-058-03 | HU-ATC-058 | CA-03 | Sin responsable | func | Pendiente | — |

#### FT-ATC-23 · Formularios simples: ingreso al proyecto y Entrega Fest

| TC | HU | Criterio | Caso | Tipo | Resultado | Evidencia (commit) |
|---|---|---|---|---|---|---|
| TC-ATC-059-01 | HU-ATC-059 | CA-01 | Formulario simple | func | Pendiente | — |
| TC-ATC-059-02 | HU-ATC-059 | CA-02 | Cliente reconocido | func | Pendiente | — |
| TC-ATC-059-03 | HU-ATC-059 | CA-03 | Sin conexión | func | Pendiente | — |
| TC-ATC-060-01 | HU-ATC-060 | CA-01 | Reserva con aforo | func | Pendiente | — |
| TC-ATC-060-02 | HU-ATC-060 | CA-02 | Lista de espera | func | Pendiente | — |
| TC-ATC-060-03 | HU-ATC-060 | CA-03 | Cancelación | func | Pendiente | — |

## Defectos

| ID | Severidad | Impacto negocio | Estado | Plan (mayores: aprueba PO) |
|---|---|---|---|---|
| — | — | — | Sin defectos registrados: aún no se ejecutó ningún ciclo | — |

Críticos = 0. Bloqueantes = 0. NFR contra número objetivo: (pendiente: p95 real vs objetivo de los RNF del PLT-03).

## Reglas de este plan

- Datos de prueba sintéticos, jamás de clientes. Sesión de prueba con usuario sintético del emisor de QA.
- Todos los casos de HU con pantalla (`ui: true`, las 62) deben cubrir además los estados de G2 (vacío, carga, error, sin permisos) cuando G2 los fije.
- Los flujos críticos que defina el PO van en E2E contra el front y un backend de Desarrollo o QA, nunca de Producción.
- La IA ejecuta y consolida; aprueba o rechaza QA. Cada ciclo registra qué corrió la IA y quién lo validó.

Ejecutado por IA: ninguno (plan inicial) - Consolidado y aprobado por: QA [nombre, fecha] (pendiente)

Historial: 0.2 · 2026-11-03 · Jesús Chávez Elías, con IA · El Núcleo de IA entra en la Etapa 1 (ED-29, `adr/ADR-007` v0.9): casos de HU-048 ampliados y de HU-068 a HU-072 propuestos en FT-ATC-19; HU-053 anotada fuera de la Etapa 1. No cambian los 197 casos originales ni los resultados. — Revisado por: (pendiente)
