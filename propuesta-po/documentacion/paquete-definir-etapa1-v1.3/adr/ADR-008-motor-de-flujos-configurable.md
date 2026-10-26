---
id: "ADR-008"
tipo: "adr"
titulo: "ADR-008: Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.5"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-005, ADR-009, ADR-012, ADR-013]
tags: [adr, arquitectura, g3]
---

# ADR-008: Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.5 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-08 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: las tablas de flujo, subtipo y versión como **cambio formal al v7** (P-016) y cerrar las combinaciones tipo · subtipo · área del piloto (P-017). Registrado en `analisis/decisiones.md` v0.7; el catálogo y las tablas los decide el equipo (ED-14 y ED-15).
- Reglas 1 a 5: criterios de aceptación de la HU-043 v1.3 (CA-02 a CA-08) y de la HU-044 (CA-02). La regla 6 es decisión del equipo (mockup de la Etapa 1, `DECISIONES.md` §5.9, respuesta 19).

## Contexto

Motivo: HU-043 (prioridad 1). Cada área trabaja con un flujo propio por tipo y subtipo de ticket, con actividades en orden y SLA por actividad (v1.3). La clave única del flujo por tipo, subtipo y área se cita por su **criterio de origen, HU-043 CA-06** (PLT-04). Los PDF del PO le ponen un código de regla que no está en el Excel `ATC_requerimientos (3).xlsx`; el Excel queda como lo publicó el PO y la diferencia está listada (P-022, ED-18), así que este ADR cita el criterio de origen.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Flujos escritos en código | Cambiar un flujo exige desarrollo y despliegue; HU-043 pide configurarlo por área. | — |
| Flujos configurables sin versionar | Un cambio altera los tickets en curso. | — |

## Decisión

Los flujos se **configuran** por tipo + subtipo + área y están **versionados**; cada ticket **congela la versión** que le tocó al abrirse. La definición incluye responsable, actividades en orden y SLA por actividad.

Reglas que el mockup ya prueba:
1. Una versión nueva solo aplica a los tickets nuevos; no se crean dos flujos con la misma combinación: se publica una versión nueva (HU-043 CA-02 y CA-06).
2. Las actividades se cierran en orden y el SLA de cada una corre desde que se habilita (HU-043 CA-04).
3. El SLA total es la suma de las actividades, salvo que la política del tipo sea menor (HU-043 CA-05; RN-SVC-001).
4. Si el área no tiene flujo para la combinación se usa el flujo por defecto del área y se alerta al administrador funcional (HU-043 CA-07); el ticket sin asignar queda en la cola del área (HU-044 CA-02).
5. Cada publicación queda en una bitácora con autor, fecha y versión (HU-043 CA-08). Solo publica quien tiene el rol `ATC_ADMIN_FUNCIONAL` (`ATC.WORKFLOWS + editar`, ADR-009); el intento sin ese rol responde `AYB-SEG-403` del SDK y queda registrado.
6. La pausa del SLA (HU-066) también corre el vencimiento de la actividad en curso (decisión del equipo, ED-14).

**Cambio al v7 (condición del Líder Técnico).** El v7 no tiene tablas para el flujo, el subtipo ni la versión. Son tablas de ATC del fragmento SERVICE, que migra ATC, y van como **cambio formal** en el acta F4, lista para la firma del Data Chief (P-016, P-031; decisión del equipo, ED-15):

| Entidad | Para qué | Estado en el v7 |
|---|---|---|
| `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014 del PLT-05) | Una fila por versión publicada: tipo, subtipo, área, número de versión, rol responsable, marca de flujo por defecto, autor y fecha de publicación (la bitácora de la regla 5) | No existe |
| `SVC_WORKFLOW_ACTIVITY` | Actividades de cada versión: orden, nombre, rol responsable y SLA propio en horas hábiles | No existe |
| `SVC_TICKET_ACTIVITY` | Actividades de cada ticket: estado, fecha en que se habilita, vencimiento y cierre (regla 2) | No existe |
| `MAE_TICKET_SUBTYPE` | Catálogo de subtipos por tipo | No existe |
| Columnas `SubtypeID` y `WorkflowID` en `SVC_TICKET` | El subtipo del ticket y la versión del flujo que congeló al abrirse | `SVC_TICKET` no las trae; el v7 solo permite agregar columnas |
| `SVC_TICKET_SLA_PAUSE` | Pausas del SLA (desde, hasta, motivo) y su efecto en la actividad en curso (regla 6) | No existe |
| Columna `AutoCloseBusinessDays` en `MAE_SLA_POLICY` | Días hábiles de espera antes del cierre automático (HU-066 CA-04); valor inicial 5; el ticket la congela con su política | `MAE_SLA_POLICY` no la trae; el v7 solo permite agregar columnas |

**Combinaciones del piloto (P-017): catálogo decidido por el equipo (ED-14).** El Líder Técnico pidió cerrarlas. Este es el **catálogo del piloto**, una lista cerrada que sale solo de dos fuentes. Una son los flujos del PO: los cuatro de su prototipo y el del CA-01 de la HU-043 (PLT-04). La otra son los subtipos reales que el equipo registró el 20-oct, tomados del catálogo de la plataforma actual (respuesta 1 de `DECISIONES.md` §5.9). El SLA de cada actividad está en horas hábiles; el del flujo es la suma, salvo que la política del tipo sea menor (regla 3).

| # | Tipo | Subtipo | Área | Actividades en orden (SLA en horas hábiles) | SLA del flujo | Origen |
|---|---|---|---|---|---|---|
| 1 | Consulta de cuenta | General | Cobranza | Recepción (2) → Revisión de cobranza (24) → Respuesta al cliente (4) | 30 h | Flujo del PO (prototipo). Subtipo «General» porque el PO no le dio uno y el CA-03 lo exige |
| 2 | Consulta de cuenta | Estado de cuenta del lote | Cobranza | Las mismas tres del flujo 1 | 30 h | Subtipo real de la plataforma actual («SOLICITUD DE EE.CC - LOTE»), con el flujo del PO de Consulta de cuenta (§5.9, respuesta 1) |
| 3 | Queja | General | ATC | Registro (2) → Respuesta (24) | 26 h | Flujo del PO (prototipo). La queja va además al Libro de Reclamaciones: su plazo legal lo vigila ADR-005 |
| 4 | Resolución de contrato | General | Cobranza | Verificación de la deuda (24) → Revisión legal de la causal (48) → Carta de resolución (72) | 144 h | Flujo del PO (prototipo); lo abre el job de morosidad (HU-056) |
| 5 | Garantía postventa | General | Postventa | Recepción (4) → Inspección técnica (72) | 76 h | Flujo del PO (prototipo) |
| 6 | Reclamo | Garantía postventa | Postventa | Inspección (8) → Informe técnico (16) → Respuesta al cliente (8) | 32 h | HU-043 CA-01, CA-04 y CA-05 (PLT-04) |
| 7 | Pedido simple | Actualización de datos | ATC | Flujo por defecto del área | Política del tipo | Subtipo real de la plataforma actual, ofrecido en Mi Portal (§5.9, respuesta 1) |
| 8 | Pedido simple | Copia legalizada de contrato | ATC | Flujo por defecto del área | Política del tipo | Ídem |
| 9 | Pedido simple | Otra solicitud | ATC | Flujo por defecto del área | Política del tipo | Ídem («OTROS» en la plataforma actual) |

- **Flujo por defecto de cada área (HU-043 CA-07):** una sola actividad, «Atención», con la cola del área como responsable y el SLA de la política del tipo (`MAE_SLA_POLICY`, RN-SVC-001), para las 6 áreas de `MAE_AREA` (ATC, Cobranza, Legal, Postventa, TI y Administración). Lo que entra fuera de la lista va a la cola de su área por este flujo y se alerta al administrador funcional, como pide el CA-07.
- **Fuera de la lista:** Visita técnica (sus subtipos son una propuesta del mockup, no de la plataforma actual), los otros subtipos de Reclamo, el ingreso al proyecto y la reserva de bus (formularios de HU-059 y HU-060) y el tipo «Registro y acceso de clientes», que queda para una etapa posterior (ED-09): en la Etapa 1 esos casos entran como «Pedido simple · Otra solicitud» (combinación 9). Las 7 áreas de la plataforma actual (§5.9, respuesta 25) se usan al derivar, sin flujo propio.
- **Responsable de cada flujo y de cada actividad** (HU-043 CA-03 lo exige): la **cola del área con el rol que la atiende** (`ATC_AGENT`, o `ATC_POSTVENTA` en Postventa), sin personas, porque ATC no guarda usuarios (DT-03); la persona se asigna al operar (ED-14). Las personas de ejemplo del prototipo no pasan a la semilla.
- **Quién aprueba un cambio de flujo** (Q-043-2 y Q-043-3): publica `ATC_ADMIN_FUNCIONAL` y queda en la bitácora (regla 5), sin paso de aprobación en la Etapa 1.

**Carga del catálogo:** el motor se construye parametrizable: la lista se carga como datos de semilla, no como código; un cambio del catálogo no cambia el código. Con este catálogo, la HU-043 (prioridad 1) cumple el criterio «reglas explícitas» de su DoR (G4).

## Consecuencias

- Obliga a:
  - Tablas de definición y de actividades, con sus migraciones, presentadas a Gobierno de Datos como cambio al v7.
  - Una pantalla de configuración (requiere G2: la historia lleva `ui: true`).
  - **Ticket que cambia de área (decisión del equipo):** al derivarlo (HU-007), el ticket pasa al flujo vigente del área destino para su tipo y subtipo (o a su flujo por defecto): `WorkflowID` apunta a esa versión, las actividades pendientes del área de origen se cierran como derivadas y se crean las del destino en `SVC_TICKET_ACTIVITY`, que guarda la historia de las dos. El SLA total del ticket no cambia: está congelado desde que se abrió (RN-SVC-002).
  - **El subtipo vive en `SVC_TICKET.SubtypeID`**, FK a `MAE_TICKET_SUBTYPE` (ED-15).
  - Cargar el catálogo del piloto y el flujo por defecto de cada área como semilla versionada (ED-14).
- Impide:
  - Modificar una versión de flujo ya usada: se crea una nueva.
- Cuesta: **8 h** de la HU-043 (prioridad 1), del plan del PO, que ya incluyen la migración de las tablas de flujo (HU-ATC-043-T02, 1 h; `backlog/tareas/EP-ATC-09.json`). El cambio al v7 va en el acta F4 y no suma horas. **USD 0 de nube propio**: las tablas viven en la base única y la pantalla en el frontend, ya costeados en el ADR-014 (`arquitectura/costo-cloud.md` v0.5, §1.1; supuestos fijados en ED-12).

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_WORKFLOW_DEFINITION`, sus actividades, las actividades del ticket y las pausas no existen en el v7: cambio al v7 en el acta F4 (tabla de la sección «Decisión»; ED-15, ED-23). `SVC_TICKET` no trae una clave de subtipo ni de versión de flujo; se agregan como columnas nuevas (el v7 prohíbe renombrar o quitar columnas).
- Catálogos que usa el flujo: `MAE_AREA` (6 áreas en el v7; el mockup suma 7 de la plataforma actual), `MAE_TICKET_TYPE` (6 tipos en el v7; el mockup usa 9), el subtipo (`MAE_TICKET_SUBTYPE`, ED-15) y `MAE_SLA_POLICY`. El catálogo del piloto usa 6 tipos (Consulta de cuenta, Queja, Resolución de contrato, Garantía postventa, Reclamo y Pedido simple), 6 subtipos y 3 áreas, y se carga como semilla.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v5 en Nexora) | 2026-10-21 | Brayan, con IA | Reglas 1 a 5 atribuidas a HU-043 y HU-044 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Tablas de flujo, subtipo, versión y pausa como cambio formal al v7 (propuesta de entidades); combinaciones del piloto siguen abiertas para el PO (P-017); RN-SVC-045 sustituida por su criterio de origen |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | RN-SVC-045 se conserva, con su evidencia en los PDF del PO (P-030); permiso de publicación del catálogo de ATC; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: lista cerrada de 9 combinaciones tipo · subtipo · área con sus actividades y SLA, sacada de los flujos del PO (prototipo y HU-043 CA-01) y de los subtipos reales registrados el 20-oct, como propuesta para que el PO la confirme (P-017); flujo por defecto de cada área (propuesta); condición explícita sobre la HU-043; la clave única se cita por HU-043 CA-06 y no por el código de regla que falta en el Excel |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): las 9 combinaciones son el catálogo del piloto, con responsables por cola y rol sin personas y publicación de `ATC_ADMIN_FUNCIONAL` sin aprobación (ED-14); tablas del flujo con `SVC_TICKET_ACTIVITY` y `AutoCloseBusinessDays` (ED-15); se quita la condición del PO; ticket que cambia de área y lugar del subtipo decididos; «Registro y acceso de clientes» para una etapa posterior (ED-09); regla 6 como decisión |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
