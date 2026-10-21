---
id: "ADR-008"
tipo: "adr"
titulo: "ADR-008: Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-008: Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-08 del PLT-05 v1.3
- **Actualizado el 20-oct-2026 con el mockup de la Etapa 1** (rama `feature/AYB-0001-propuesta-po-v1-3` de `tyc-mockup`): las reglas de la HU-043 ya se prueban en el prototipo.
- **Actualizado el 21-oct-2026 a la v1.3 del PO:** las reglas 1 a 5 son criterios de aceptación de la HU-043 v1.3 (CA-02 a CA-08, agregados por el PO) y de la HU-044 (CA-02); solo la regla 6 sigue siendo propuesta del equipo.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Motivo: HU-043 (prioridad 1) y RN-SVC-045. Cada área trabaja con un flujo propio por tipo y subtipo de ticket, con actividades en orden y SLA por actividad (v1.3).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Flujos escritos en código | Cambiar un flujo exige desarrollo y despliegue; HU-043 pide configurarlo por área. | — |
| Flujos configurables sin versionar | Un cambio altera los tickets en curso. | — |

## Decisión

Los flujos se **configuran** por tipo + subtipo + área y están **versionados**; cada ticket **congela la versión** que le tocó al abrirse. La definición incluye responsable, actividades en orden y SLA por actividad (propuesta de entidad `SVC_WORKFLOW_DEFINITION`, que no existe en el v7).

Reglas que el mockup ya prueba:
1. Una versión nueva solo aplica a los tickets nuevos; no se crean dos flujos con la misma combinación: se publica una versión nueva (HU-043 CA-02 y CA-06; RN-SVC-045).
2. Las actividades se cierran en orden y el SLA de cada una corre desde que se habilita (HU-043 CA-04).
3. El SLA total es la suma de las actividades, salvo que la política del tipo sea menor (HU-043 CA-05; RN-SVC-001).
4. Si el área no tiene flujo para la combinación se usa el flujo por defecto del área y se alerta al administrador funcional (HU-043 CA-07); el ticket sin asignar queda en la cola del área (HU-044 CA-02).
5. Cada publicación queda en una bitácora con autor, fecha y versión (HU-043 CA-08).
6. La pausa del SLA (HU-066) también corre el vencimiento de la actividad en curso (propuesta del equipo; la confirma el PO).

## Consecuencias

- Obliga a:
  - Tablas de definición y de actividades, con sus migraciones.
  - Una pantalla de configuración (requiere G2: la historia lleva `ui: true`).
  - Resolver qué pasa con un ticket al cambiar de área.
  - Modelar la definición del flujo, sus actividades, la versión que congela cada ticket y las pausas de actividad: el v7 no tiene tablas para ello (propuesta a G3 y Gobierno de Datos).
  - Resolver dónde vive el subtipo: `SVC_TICKET` no trae una clave de subtipo.
  - Pendiente del comité: combinaciones tipo · subtipo · área del piloto y flujo por defecto de cada área.
- Impide:
  - Modificar una versión de flujo ya usada: se crea una nueva.
- Cuesta: Horas de desarrollo: la historia es de prioridad 1 (8 h).

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014 del PLT-05) y sus actividades (v1.3) no existen en el v7: propuesta a G3 y a Gobierno de Datos. `SVC_TICKET` no trae una clave de subtipo ni de versión de flujo; si existen, estarían entre sus 18 atributos no clave (por confirmar).
- Catálogos que usa el flujo: `MAE_AREA` (6 áreas en el v7; el mockup suma 7 de la plataforma actual), `MAE_TICKET_TYPE` (6 tipos en el v7; el mockup usa 9) y `MAE_SLA_POLICY`.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-08 del PO y reglas 1 a 5 atribuidas a los criterios de la HU-043 y la HU-044. — Revisado por: (pendiente) · Aprueba: TL
