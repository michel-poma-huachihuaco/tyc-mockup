---
id: "FT-ATC-20"
tipo: feature
titulo: "Búsqueda y consulta 360 del cliente"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-10", "HU-ATC-049", "HU-ATC-050", "HU-ATC-051", "HU-ATC-052", "HU-ATC-053"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-20 Búsqueda y consulta 360 del cliente

**Alcance en la Etapa 1:** la Etapa 1 no incluye HU-053 (fuera por decisión del equipo del 26-oct-2026, P-025: alcance flexible R-01 del PO; se retoma en una etapa posterior). En la Etapa 1 la funcionalidad son las HU-049 a 052 (17 h de las 22 h del PO), sin DEP-06 ni DEP-14, que solo traía HU-053; sigue siendo predecesora de FT-17 por HU-052 → HU-042.

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-20 | Búsqueda y consulta 360 del cliente | EP-ATC-10 Consulta 360 e integraciones operativas |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 22 h · 22 h de desarrollo · Dev 4 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 4 (Daniel) | 21-oct-2026 → 26-oct-2026 | — |

## 1 Descripción y valor

Motor de búsqueda del cliente por DNI, nombre, código, lote, teléfono o N.º de ticket, con consulta 360 en el ticket (lotes, cuotas, correos, documentos), manejo de excepciones, reutilización del motor de José y búsqueda semántica.

**Beneficio:** Atención en el primer contacto sin consultar otros sistemas.

**Usuarios:** Gestor de tickets · Supervisor ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-049 | El sistema debe ofrecer un motor de búsqueda de clientes por DNI, nombre, código de cliente, lote, teléfono o N.º de ticket, con opción de llamar a la cuenta desde la ficha. | Debe | PROC-SVC-019 · Gestor de tickets · Feedback presentación · ítem 9 | Resultado en ≤ 2 s; llamada registrada | 4 | — | Pend. DoR |
| RF-SVC-050 | El sistema debe mostrar en el ticket un submódulo de consulta del cliente con su detalle: lotes, cuotas y estado de cuenta, correos y mensajes, tickets e interacciones previas y documentos. | Debe | PROC-SVC-019 · Gestor de tickets · Feedback presentación · ítem 12 | Datos consultados en línea, sin copia | 7 | RF-SVC-049 | Pend. DoR |
| RF-SVC-051 | El sistema debe manejar las excepciones de la consulta del cliente: cliente no encontrado, interesado sin contrato, datos incompletos o sistema fuente no disponible, permitiendo continuar el registro con un flujo controlado. | Debe | PROC-SVC-019 · Gestor de tickets · Feedback presentación · ítem 14 | Ticket creado con datos mínimos y vinculación pendiente | 3 | RF-SVC-049 | Pend. DoR |
| RF-SVC-052 | El sistema debe consumir el motor de consultas que ya construyó José para obtener datos especificos del cliente, integrándolo por API en lugar de desarrollar uno nuevo. | Debería | PROC-SVC-019 · Gestor de tickets · Feedback presentación · ítem 17 | Respuesta proviene del motor vía API | 3 | RF-SVC-050 | Pend. DoR |
| RF-SVC-053 (flexible) | El sistema debe indexar con un modelo de red neuronal (búsqueda semántica) los archivos y documentos de los clientes para que el motor de búsqueda encuentre información por significado y no solo por palabras exactas. | Podría | PROC-SVC-019 · Gestor de tickets · Feedback presentación · ítem 19 | Resultados relevantes con fragmento y permisos aplicados | 5 | RF-SVC-049 | Pend. DoR |

Ruta crítica: RF-SVC-049 → RF-SVC-050 → RF-SVC-052 (14 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-REN-007 | Rendimiento | Respuesta del motor de búsqueda | tiempo_respuesta_busqueda: p95 ≤ 2 s (DNI/código); ≤ 3 s (semántica) | Debería |
| RNF-SEC-010 | Seguridad | Permisos en búsqueda y consulta 360 | accesos_indebidos_busqueda: 0.0 | Debe |
| RNF-INT-007 | Interoperabilidad | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-036 | Búsqueda respeta permisos. La búsqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen | Negocio · Excel 05_Catalogos |
| RN-SVC-026 | Cero registros paralelos del dato de cliente. No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoría quincenal debe arrojar cero casos y crear uno es gate no compensable | Negocio · Excel 05_Catalogos |
| RN-SVC-012 | DLP en bitácoras. Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento | Ley 29733 · Seguridad TI |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-049 | HU-ATC-049 · Iteración 1 · Dev 4 · mié 21-oct | DEP-01 SIGDA/TAXON · DEP-13 motor de José | R-02, R-07 |
| RF-SVC-050 | HU-ATC-050 · Iteración 1 · Dev 4 · mié 21-oct → jue 22-oct | DEP-01 SIGDA/TAXON · DEP-13 motor de José | R-02, R-07 |
| RF-SVC-051 | HU-ATC-051 · Iteración 1 · Dev 4 · jue 22-oct | DEP-01 SIGDA/TAXON · DEP-13 motor de José | R-02, R-07 |
| RF-SVC-052 | HU-ATC-052 · Iteración 1 · Dev 4 · vie 23-oct | DEP-01 SIGDA/TAXON · DEP-13 motor de José | R-02, R-07 |
| RF-SVC-053 | HU-ATC-053 · Iteración 1 · Dev 4 · vie 23-oct → lun 26-oct | DEP-01 SIGDA/TAXON · DEP-13 motor de José | R-02, R-07 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Copia local del maestro de clientes; edición de datos del cliente desde ATC.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué significa «llamar la cuenta»? ¿Qué sistemas alimentan cada sección? ¿Qué repositorios de documentos se indexan? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota de alcance al inicio del cuerpo: P-025 (decisión del equipo del 26-oct-2026, `analisis/decisiones.md` v0.8). La Etapa 1 no incluye HU-053 (17 h de 22 h). No se cambia texto del PO. — Revisado por: (pendiente)
