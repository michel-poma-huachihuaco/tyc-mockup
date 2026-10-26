---
id: "ADR-008"
tipo: "adr"
titulo: "ADR-008: Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-005, ADR-009, ADR-012, ADR-013]
tags: [adr, arquitectura, g3]
---

# ADR-008: Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.3 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-08 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: las tablas de flujo, subtipo y versión como **cambio formal al v7** (P-016) y cerrar las combinaciones tipo · subtipo · área del piloto (P-017). Registrado en `analisis/decisiones.md` v0.5.
- Reglas 1 a 5: criterios de aceptación de la HU-043 v1.3 (CA-02 a CA-08) y de la HU-044 (CA-02). La regla 6 sigue siendo propuesta del equipo (mockup de la Etapa 1, rama `feature/AYB-0001-propuesta-po-v1-3` de `tyc-mockup`).

## Contexto

Motivo: HU-043 (prioridad 1). Cada área trabaja con un flujo propio por tipo y subtipo de ticket, con actividades en orden y SLA por actividad (v1.3). La regla RN-SVC-045 (clave única del flujo por tipo, subtipo y área) **se conserva**: no está en el Excel `ATC_requerimientos (3).xlsx`, pero sí en los PDF del PO v1.3: PLT-01 §1 (registro de ADR, ADR-08), PLT-04 (HU-043 CA-06) y PLT-05 (registro de ADR). La registra el PO en el Excel (P-022, P-030).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Flujos escritos en código | Cambiar un flujo exige desarrollo y despliegue; HU-043 pide configurarlo por área. | — |
| Flujos configurables sin versionar | Un cambio altera los tickets en curso. | — |

## Decisión

Los flujos se **configuran** por tipo + subtipo + área y están **versionados**; cada ticket **congela la versión** que le tocó al abrirse. La definición incluye responsable, actividades en orden y SLA por actividad.

Reglas que el mockup ya prueba:
1. Una versión nueva solo aplica a los tickets nuevos; no se crean dos flujos con la misma combinación: se publica una versión nueva (HU-043 CA-02 y CA-06; RN-SVC-045).
2. Las actividades se cierran en orden y el SLA de cada una corre desde que se habilita (HU-043 CA-04).
3. El SLA total es la suma de las actividades, salvo que la política del tipo sea menor (HU-043 CA-05; RN-SVC-001).
4. Si el área no tiene flujo para la combinación se usa el flujo por defecto del área y se alerta al administrador funcional (HU-043 CA-07); el ticket sin asignar queda en la cola del área (HU-044 CA-02).
5. Cada publicación queda en una bitácora con autor, fecha y versión (HU-043 CA-08). Solo publica quien tiene el rol `ATC_ADMIN_FUNCIONAL` (`ATC.WORKFLOWS + editar`, ADR-009); el intento sin ese rol responde `AYB-SEG-403` del SDK y queda registrado.
6. La pausa del SLA (HU-066) también corre el vencimiento de la actividad en curso (propuesta del equipo; la confirma el PO).

**Cambio al v7 (condición del Líder Técnico).** El v7 no tiene tablas para el flujo, el subtipo ni la versión. Se presenta a Gobierno de Datos como **cambio formal** (P-016, P-031), con esta propuesta de entidades (nombres y columnas a confirmar por el Líder Técnico y Gobierno de Datos):

| Entidad propuesta | Para qué | Estado en el v7 |
|---|---|---|
| `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014 del PLT-05) | Una fila por versión publicada: tipo, subtipo, área, número de versión, responsable, marca de flujo por defecto, autor y fecha de publicación (la bitácora de la regla 5) | No existe |
| `SVC_WORKFLOW_ACTIVITY` | Actividades de cada versión: orden, nombre, SLA propio | No existe |
| `MAE_TICKET_SUBTYPE` | Catálogo de subtipos por tipo | No existe |
| Columnas `SubtypeID` y `WorkflowID` en `SVC_TICKET` | El subtipo del ticket y la versión del flujo que congeló al abrirse | `SVC_TICKET` no las trae; el v7 solo permite agregar columnas |
| `SVC_TICKET_SLA_PAUSE` | Pausas del SLA (desde, hasta, horas) y su efecto en la actividad en curso (regla 6) | No existe |

**Combinaciones del piloto (P-017): siguen abiertas y las decide el PO.** No se pueden cerrar en este ADR. Lo que hay hoy:

| Dato | v7 / PLT-04 | Mockup de la Etapa 1 | Quién decide |
|---|---|---|---|
| Tipos de ticket | 6 en `MAE_TICKET_TYPE` | 9 | PO en el comité (pregunta 1, `DECISIONES.md` §5.9 del mockup) |
| Áreas | 6 en `MAE_AREA`: ATC, Cobranza, Legal, Postventa, TI, Administración | 6 más 7 de la plataforma actual | PO |
| Combinaciones tipo · subtipo · área del piloto | sin lista | sin lista | PO (Q-043-1) |
| Flujo por defecto de cada área | sin definir | sin definir | PO |
| Quién aprueba los cambios de flujo | sin definir | — | PO (Q-043-2) |

Mientras el PO no cierre la lista, el motor se construye parametrizable: la combinación y el flujo por defecto se cargan como datos, no como código.

## Consecuencias

- Obliga a:
  - Tablas de definición y de actividades, con sus migraciones, presentadas a Gobierno de Datos como cambio al v7.
  - Una pantalla de configuración (requiere G2: la historia lleva `ui: true`).
  - Resolver qué pasa con un ticket al cambiar de área.
  - Resolver dónde vive el subtipo (la tabla anterior propone `SubtypeID` en `SVC_TICKET`).
  - Que el PO cierre las combinaciones del piloto y el flujo por defecto de cada área (P-017).
- Impide:
  - Modificar una versión de flujo ya usada: se crea una nueva.
- Cuesta: **8 h** de la HU-043 (prioridad 1), del plan del PO, que ya incluyen la migración de las tablas de flujo (HU-ATC-043-T02, 1 h; `backlog/tareas/EP-ATC-09.json`). Si Gobierno de Datos acepta el cambio al v7 tal como se propone, no suma horas; si pide otro modelo, se reestima en P-025. **USD 0 de nube propio**: las tablas viven en la base única y la pantalla en el frontend, ya costeados en el ADR-014 (`arquitectura/costo-cloud.md`).

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_WORKFLOW_DEFINITION` y sus actividades no existen en el v7: cambio propuesto a G3 y a Gobierno de Datos (tabla de la sección «Decisión»). `SVC_TICKET` no trae una clave de subtipo ni de versión de flujo; se agregan como columnas nuevas (el v7 prohíbe renombrar o quitar columnas).
- Catálogos que usa el flujo: `MAE_AREA` (6 áreas en el v7; el mockup suma 7 de la plataforma actual), `MAE_TICKET_TYPE` (6 tipos en el v7; el mockup usa 9) y `MAE_SLA_POLICY`.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v5 en Nexora) | 2026-10-21 | Brayan, con IA | Reglas 1 a 5 atribuidas a HU-043 y HU-044 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Tablas de flujo, subtipo, versión y pausa como cambio formal al v7 (propuesta de entidades); combinaciones del piloto siguen abiertas para el PO (P-017); RN-SVC-045 sustituida por su criterio de origen |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | RN-SVC-045 se conserva, con su evidencia en los PDF del PO (P-030); permiso de publicación del catálogo de ATC; costo con número y fuente |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
