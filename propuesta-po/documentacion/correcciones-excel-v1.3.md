# Correcciones propuestas al Excel `ATC_requerimientos (3).xlsx` · plan v1.3 (Etapa 1)

**Para:** Eddie Huamaní (PO), dueño del Excel.
**Fecha:** mié 21-oct-2026.
**Qué es:** una propuesta, no un cambio hecho. El Excel no se ha tocado. Cada fila dice la hoja, la
celda o las filas afectadas, el valor actual, el valor propuesto y el documento del PO v1.3 en el que se
apoya. Lo decide el PO; si aprueba, el Excel se edita en Google Drive. Recoge la pendiente P-022 de
`docs/analisis/decisiones.md`.

**Referencia:** los documentos del PO v1.3 del 16-oct-2026 (PLT-01 a PLT-05). Las filas son las de la
hoja tal como está hoy, en la versión «(3)» del 16-oct, y se comprobaron sobre el archivo.

**Alcance:** solo la Etapa 1. Las filas que el Excel marca fuera de la Etapa 1 no se tocan.

## Resumen

| # | Qué | Hoja | Celdas | Tipo |
|---|---|---|---|---|
| 1 | Fecha de salida de la Etapa 1: 30-oct → 03-nov | 05_Catalogos, 00_Leyenda, 01_RF_Macro, 02_RF_Micro, 03_RNF, 04_Trazabilidad | 1 + 1 + 16 + 68 + 37 + 52 | Corrige |
| 2 | Faltan RF-SVC-064 a 067 | 02_RF_Micro, 04_Trazabilidad, 01_RF_Macro | 4 filas nuevas en cada una de las dos primeras y 6 celdas en la tercera | Añade |
| 3 | Faltan RN-SVC-044 y RN-SVC-045 | 05_Catalogos | 2 filas nuevas | Añade |
| 4 | RF-SVC-001 a 039 sin prioridad | 02_RF_Micro, columna U | 37 celdas | Corrige |
| 5 | RNF de la Etapa 1 sin prioridad | 03_RNF, columna L | 24 celdas | Opcional |
| 6 | Conteos de la leyenda | 00_Leyenda | B6, B15 | Cosmético |
| 7 | RF-SVC-004 a 006 agrupados bajo otra macro | 02_RF_Micro | filas 25–27 | Cosmético |
| 8 | Motivos de reasignación distintos del PLT-04 | 02_RF_Micro | AD8 y AD9 | Decide el PO |
| 9 | Estado DoR | 02_RF_Micro, columna AE | 63 celdas | Informativo, sin cambio |

## 1 Fecha de salida de la Etapa 1

El Excel dice que la Etapa 1 sale el 30-oct-2026. Según los documentos del PO v1.3:

- El desarrollo va del mié 21-oct al mar 03-nov-2026 (PLT-01 v1.3: encabezado «Horizonte» y §0
  «Etapa 1 · Desarrollo mié 21-oct → mar 03-nov»).
- El Go/No-Go de la v1.0 es el mar 03-nov (PLT-01 §0 y §2, «UAT · demo final · Go/No-Go · mar 03-nov»).
- Diez historias terminan el lun 02-nov, después del 30-oct (PLT-04 v1.3, índice): HU-ATC-024, 025,
  031, 032, 037, 038, 039, 064, 065 y 066.
- El lanzamiento de cada funcionalidad es «v1.0 · Etapa 1 · 03-nov-2026» (PLT-03 v1.3).

| Hoja | Fila / columna | Valor actual | Valor propuesto | Fuente PDF |
|---|---|---|---|---|
| 05_Catalogos | Fila 149 (RN-SVC-043 «Etapas del proyecto»), columna D | «Etapa 1 (salida 30-oct-2026): …» | «Etapa 1 (salida 03-nov-2026): …», con el resto del texto igual | PLT-01 v1.3, encabezado, §0 y §2 |
| 00_Leyenda | Fila 20 («Etapas del proyecto»), columna B | «… Etapa 1 · salida 30-oct-2026: …» | «… Etapa 1 · salida 03-nov-2026: …», con el resto igual | PLT-01 v1.3, encabezado, §0 y §2 |
| 01_RF_Macro | Columna O (`etapa_nota`), filas 3, 5–7, 9–17, 19 y 22–23 (16 celdas) | «Salida 30-oct-2026» | «Salida 03-nov-2026» | PLT-01 v1.3, §0 |
| 02_RF_Micro | Columna AL (`etapa_nota`), filas 4–6, 8, 10–20, 24–59, 61–63, 65–67, 69, 71–73 y 77–83 (68 celdas, filas RF y MACRO) | «Salida 30-oct-2026» | «Salida 03-nov-2026» | PLT-01 v1.3, §0; PLT-03 v1.3 («v1.0 · Etapa 1 · 03-nov-2026») |
| 03_RNF | Columna AF (`etapa_nota`), filas 2–9 y 12–40 (37 celdas) | «Salida 30-oct-2026» | «Salida 03-nov-2026» | PLT-01 v1.3, §0 |
| 04_Trazabilidad | Columna M (`etapa_nota`), filas 3–8, 10–17, 20–46, 48–50, 52–54 y 57–61 (52 celdas) | «Salida 30-oct-2026» | «Salida 03-nov-2026» | PLT-01 v1.3, §0 |

Las demás celdas de `etapa_nota` no traen fecha y no cambian.

## 2 Faltan RF-SVC-064 a 067

El PLT-03 v1.3 los presenta como «propuestos por el PO (por registrar en el Excel)». Son de la
Etapa 1 y tienen historia (HU-ATC-064 a 067). Se propone añadirlos en las tres hojas de RF con los datos
del PLT-03 y el PLT-04. Lo que los PDF no dan (necesidad, estado de trazabilidad) lo completa el PO.

**02_RF_Micro** (filas nuevas, nivel `RF`):

| Dónde | D (id) | F (nombre) | G (enunciado, PLT-03) | P (proceso) | U (prioridad) | Z (reglas) | AK / AL | Fuente PDF |
|---|---|---|---|---|---|---|---|---|
| En el grupo de PROC-SVC-001, después de la fila 5 | RF-SVC-064 | Registrar y consultar mis tickets en Mi Portal | El sistema debe permitir al cliente identificado registrar un ticket desde Mi Portal, con tipo y subtipo guiados, descripción y adjuntos, y consultar la lista de sus tickets con número, estado, área y fecha de compromiso. | PROC-SVC-001 | Debe | RN-SVC-005; RN-SVC-026; RN-SVC-044 | Etapa 1 / Salida 03-nov-2026 | PLT-03 FT-ATC-24; PLT-04 HU-ATC-064 |
| En el grupo de PROC-SVC-002, después de la fila 27 | RF-SVC-065 | Ver la trazabilidad de mi ticket | El sistema debe mostrar al cliente la línea de tiempo de su ticket: cada paso (registrado, asignado, en atención, pendiente del cliente, resuelto, cerrado) con fecha y hora, área responsable y fecha de compromiso, y avisarle por correo y WhatsApp en cada cambio de estado. | PROC-SVC-002 | Debe | RN-SVC-044; RN-SVC-006 | Etapa 1 / Salida 03-nov-2026 | PLT-03 FT-ATC-24; PLT-04 HU-ATC-065 |
| En el grupo de PROC-SVC-002, después de RF-SVC-065 | RF-SVC-066 | Responder, adjuntar y confirmar la solución de mi ticket | El sistema debe permitir al cliente responder lo que pide el gestor, adjuntar documentos y confirmar o rechazar la solución desde Mi Portal; la confirmación cierra el ticket y el rechazo lo reabre con su motivo. | PROC-SVC-002 | Debe | RN-SVC-023; RN-SVC-044 | Etapa 1 / Salida 03-nov-2026 | PLT-03 FT-ATC-24; PLT-04 HU-ATC-066 |
| En el grupo de PROC-SVC-017, después de la fila 64 | RF-SVC-067 | Ver el proceso de atención en un visor 3D (operación en vivo) | El sistema debe mostrar en un visor 3D isométrico la sede de atención con sus áreas, los tickets entrando por los canales, pasando por la bandeja orquestadora y moviéndose al área de su flujo con su color de SLA, y el detalle de cada área y de cada ticket. | PROC-SVC-017 | Debe | RN-SVC-031; RN-SVC-033; RN-SVC-035; RN-SVC-036 | Etapa 1 / Salida 03-nov-2026 | PLT-03 FT-ATC-25; PLT-04 HU-ATC-067 |

Otras columnas de esas filas:

- **S (origen):** «Propuesta PO v1.3 · decisión de etapas del 16-oct-2026» (064 a 066) y «Propuesta
  PO v1.3 · prototipo visor del proceso 3D» (067), como dice el PLT-03.
- **AB (criterios):** los del PLT-04. Son 5, 4, 4 y 10 criterios.
- **AE (`dor_estado`):** `NOT_READY`, como el resto de la hoja (ver el punto 9).

**04_Trazabilidad** (filas nuevas 65 a 68, después de la fila 64):

| A (rf) | B (nombre) | C / F (macro y proceso) | D (objetivo) | G (reglas) | H (entidades, notas técnicas del PLT-04) | I (criterios) | J | L / M | Fuente PDF |
|---|---|---|---|---|---|---|---|---|---|
| RF-SVC-064 | Registrar y consultar mis tickets en Mi Portal | PROC-SVC-001 | OBJ-SVC-001 | RN-SVC-005; RN-SVC-026; RN-SVC-044 | ENT-SVC-001 | 5 | NOT_READY | Etapa 1 / Salida 03-nov-2026 | PLT-02 EP-ATC-06 (alineamiento OBJ-SVC-001); PLT-04 HU-ATC-064 |
| RF-SVC-065 | Ver la trazabilidad de mi ticket | PROC-SVC-002 | OBJ-SVC-001 | RN-SVC-044; RN-SVC-006 | ENT-SVC-001 | 4 | NOT_READY | Etapa 1 / Salida 03-nov-2026 | PLT-02 EP-ATC-06; PLT-04 HU-ATC-065 |
| RF-SVC-066 | Responder, adjuntar y confirmar la solución de mi ticket | PROC-SVC-002 | OBJ-SVC-001 | RN-SVC-023; RN-SVC-044 | ENT-SVC-004 | 4 | NOT_READY | Etapa 1 / Salida 03-nov-2026 | PLT-02 EP-ATC-06; PLT-04 HU-ATC-066 |
| RF-SVC-067 | Ver el proceso de atención en un visor 3D (operación en vivo) | PROC-SVC-017 | OBJ-SVC-001 | RN-SVC-031; RN-SVC-033; RN-SVC-035; RN-SVC-036 | ENT-SVC-014 | 10 | NOT_READY | Etapa 1 / Salida 03-nov-2026 | PLT-02 EP-ATC-09 (alineamiento OBJ-SVC-001); PLT-04 HU-ATC-067 |

Las columnas E (necesidad) y K (estado de trazabilidad) las completa el PO, porque los PDF no las dan.

**01_RF_Macro** (macros que ganan RF):

| Fila / columna | Valor actual | Valor propuesto | Fuente PDF |
|---|---|---|---|
| Fila 2 (PROC-SVC-001), E (`n_micro`) | 3 | 4 | PLT-03 FT-ATC-24 (origen de RF-SVC-064) |
| Fila 2 (PROC-SVC-001), F (`ids_micro`) | RF-SVC-001; RF-SVC-002; RF-SVC-003 | RF-SVC-001; RF-SVC-002; RF-SVC-003; RF-SVC-064 | Ídem |
| Fila 3 (PROC-SVC-002), E | 3 | 5 | PLT-03 FT-ATC-24 (origen de RF-SVC-065 y 066) |
| Fila 3 (PROC-SVC-002), F | RF-SVC-004; RF-SVC-005; RF-SVC-006 | RF-SVC-004; RF-SVC-005; RF-SVC-006; RF-SVC-065; RF-SVC-066 | Ídem |
| Fila 18 (PROC-SVC-017), E | 4.0 | 5 | PLT-03 FT-ATC-25 (origen de RF-SVC-067) |
| Fila 18 (PROC-SVC-017), F | RF-SVC-043; RF-SVC-044; RF-SVC-045; RF-SVC-046 | RF-SVC-043; RF-SVC-044; RF-SVC-045; RF-SVC-046; RF-SVC-067 | Ídem |

## 3 Faltan RN-SVC-044 y RN-SVC-045

Las citan los PDF, y el PLT-03 llega a poner «Fuente: Negocio · Excel 05_Catalogos» en la RN-SVC-044.
Pero la hoja 05_Catalogos termina en la RN-SVC-043 (43 reglas).

| Hoja | Dónde | A / B / C | D (detalle) propuesto | Fuente PDF |
|---|---|---|---|---|
| 05_Catalogos | Fila nueva después de la 149 | regla / RN-SVC-044 / Visibilidad del ticket para el cliente | «Visibilidad del ticket para el cliente (propuesta PO v1.3). En Mi Portal el cliente solo ve sus propios tickets y las interacciones marcadas como visibles; las notas internas, el gestor asignado y los datos de otras áreas no se muestran» (texto literal del PLT-03) | PLT-03 FT-ATC-24, §4 «Reglas de negocio»; PLT-04 HU-ATC-064 a 066; PLT-01 R-07 |
| 05_Catalogos | Fila nueva después de la RN-SVC-044 | regla / RN-SVC-045 / Clave única del flujo | Propuesta de texto a partir de HU-ATC-043, CA-06: «Un flujo publicado es único por tipo, subtipo y área; otro flujo con la misma combinación no se permite y se crea como nueva versión». El PDF da solo el nombre y el criterio: la redacción final es del PO | PLT-04 HU-ATC-043 (CA-06 y «Reglas de negocio»); PLT-01 y PLT-05, registro de ADR (ADR-08) |

## 4 RF-SVC-001 a 039 sin prioridad

En la columna U de 02_RF_Micro, los RF de la capa base dicen «pendiente». Los de RF-SVC-040 a 060 ya
traen la prioridad del PO («Debe (propuesta PO)», etc.) y coinciden con los PDF. Se propone poner a
los 37 RF de la Etapa 1 de ese rango la prioridad que les da el PLT-03 v1.3, que es la misma de su
historia en el PLT-04. Las 2 filas del rango que el Excel deja fuera de la Etapa 1 (filas 22 y 23) no
tienen prioridad en los PDF y se quedan como están.

| Hoja | Fila / columna | Valor actual | Valor propuesto | Fuente PDF |
|---|---|---|---|---|
| 02_RF_Micro | Columna U, filas 3–5, 8–10, 12–13, 15–18, 20, 25–28, 30–32, 34–36 y 38–41 (27 RF: RF-SVC-001 a 016 y 019 a 029) | pendiente | Debe | PLT-03 v1.3 (FT-ATC-01 a 09 y 13, prioridad de cada RF); PLT-04 v1.3 (índice) |
| 02_RF_Micro | Columna U, filas 43–45 y 47–50 (7 RF: RF-SVC-030 a 036) | pendiente | Debería | PLT-03 v1.3 (FT-ATC-10 y 14); PLT-04 v1.3 |
| 02_RF_Micro | Columna U, filas 52–54 (3 RF: RF-SVC-037 a 039) | pendiente | Podría (flexible) | PLT-03 v1.3 (FT-ATC-15, «flexible»); PLT-01 R-01 |

## 5 RNF de la Etapa 1 sin prioridad (opcional)

En la columna L de 03_RNF, los 24 RNF de la Etapa 1 dicen «pendiente». El PLT-03 v1.3 les da prioridad
al declararlos en cada funcionalidad, y siempre la misma.

| Hoja | Fila / columna | Valor actual | Valor propuesto | Fuente PDF |
|---|---|---|---|---|
| 03_RNF | Columna L, filas 3, 9, 12–13, 17, 19–22, 24–25, 30–31, 35 y 40 (15 RNF) | pendiente | Debe | PLT-03 v1.3, sección RNF de cada funcionalidad |
| 03_RNF | Columna L, filas 5–7, 15, 27–28, 33 y 37–38 (9 RNF) | pendiente | Debería | PLT-03 v1.3, sección RNF de cada funcionalidad |

## 6 Conteos de la leyenda (cosmético)

| Hoja | Fila / columna | Valor actual | Valor propuesto | Fuente |
|---|---|---|---|---|
| 00_Leyenda | Fila 15 («Conteos»), columna B | macros 14 · RF 39 · RNF 14 · procesos 14 · reglas 30 | macros 23 · RF 67 · RNF 26 · procesos 23 · reglas 45 | Conteo de la propia hoja (23 macros, 63 RF, 26 RNF, 23 procesos y 43 reglas), más los 4 RF y las 2 reglas de los puntos 2 y 3 (PLT-03 v1.3). Si el PO no añade los puntos 2 y 3: RF 63 · reglas 43 |
| 00_Leyenda | Fila 6 («Como leer RF»), columna B | «1) Abre 01_RF_Macro (14 procesos). …» | «1) Abre 01_RF_Macro (23 procesos). …» | Conteo de la hoja 01_RF_Macro |

## 7 RF-SVC-004 a 006 agrupados bajo otra macro (cosmético)

| Hoja | Fila / columna | Valor actual | Valor propuesto | Fuente |
|---|---|---|---|---|
| 02_RF_Micro | Filas 25–27 (RF-SVC-004, 005 y 006) | Están debajo de la macro PROC-SVC-008 (fila 24), aunque su `macro_id` (columna B) es PROC-SVC-002. La macro PROC-SVC-002 (fila 6) queda sin RF debajo | Moverlas debajo de la fila 6, sin cambiar su contenido | 01_RF_Macro fila 3 (PROC-SVC-002: RF-SVC-004; 005; 006); PLT-03 FT-ATC-02 (origen PROC-SVC-002) |

## 8 Motivos de reasignación (decide el PO)

El Excel y el PLT-04 usan códigos distintos para el motivo de una reasignación. Hay que quedarse con
una sola lista, porque de ella sale el catálogo `SVC_ASSIGNMENT_REASON`.

| Hoja | Fila / columna | Valor actual (Excel) | Qué dice el PDF | Propuesta |
|---|---|---|---|---|
| 02_RF_Micro | Filas 8 y 9 (RF-SVC-007 y 008), columna AD (`fragmentos`) | «… (ESCALATION/DERIVATION_TO_AREA) … (REASSIGNMENT_ROTATION/REASSIGNMENT_RESIGNATION/REASSIGNMENT_TERMINATION via MAE_GENERIC_LIST_VALUE, ListCode='SVC_ASSIGNMENT_REASON') …» | PLT-04 HU-ATC-008, CA-01: «motivo REASSIGNMENT_CESE»; HU-ATC-046, CA-01: «motivo REASSIGNMENT_CARGA» | El PO elige: (a) el Excel suma REASSIGNMENT_CESE y REASSIGNMENT_CARGA, o los pone en lugar de ROTATION, RESIGNATION y TERMINATION; o (b) el PLT-04 usa los códigos del Excel. No se propone un valor sin su decisión |

## 9 Estado DoR (informativo, sin cambio)

| Hoja | Fila / columna | Valor actual | Qué dice el PDF | Propuesta |
|---|---|---|---|---|
| 02_RF_Micro | Columna AE (`dor_estado`), los 63 RF | NOT_READY | PLT-05 v1.3: las 23 funcionalidades pasan a «Listo con condiciones» con los acuerdos 1 a 6 cumplidos | Ninguna por ahora. La escala del Excel solo admite READY, NOT_READY o REQUIRES_BUSINESS_DECISION, y en Nexora ningún DoR está aprobado. El PO lo actualiza cuando el comité decida |

Generado por IA: propuesta de correcciones. Las celdas se comprobaron sobre `ATC_requerimientos (3).xlsx` y los documentos del PO v1.3, por Brayan con IA (Claude, 21-oct-2026). El agente no edita el Excel ni decide: cada cambio lo aprueba el PO. — Revisado por: (pendiente)
