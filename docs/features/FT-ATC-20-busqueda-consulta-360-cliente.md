---
id: "FT-ATC-20"
tipo: feature
titulo: "Búsqueda y consulta 360 del cliente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-10", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-20 Búsqueda y consulta 360 del cliente

Va en `docs/features/FT-ATC-20-busqueda-consulta-360-cliente.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-20 | Búsqueda y consulta 360 del cliente | EP-ATC-10 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 4 · lun 19-oct · Daniel) | 20 h (5 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Motor de búsqueda del cliente por DNI, nombre, código, lote, teléfono o N.º de ticket, con consulta 360 en el ticket (lotes, cuotas, correos, documentos), manejo de excepciones, reutilización del motor de José y búsqueda semántica. Da atención en el primer contacto sin consultar otros sistemas.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-049 | El sistema debe ofrecer un motor de búsqueda de clientes por DNI, nombre, código de cliente, lote, teléfono o N.º de ticket, con opción de llamar a la cuenta desde la ficha. | Debe | Gestor de tickets | Resultado en ≤ 2 s; llamada registrada | Propuesto |
| RF-SVC-050 | El sistema debe mostrar en el ticket un submódulo de consulta del cliente con su detalle: lotes, cuotas y estado de cuenta, correos y mensajes, tickets e interacciones previas y documentos. | Debe | Gestor de tickets | Datos consultados en línea, sin copia | Propuesto |
| RF-SVC-051 | El sistema debe manejar las excepciones de la consulta del cliente: cliente no encontrado, interesado sin contrato, datos incompletos o sistema fuente no disponible, permitiendo continuar el registro con un flujo controlado. | Debe | Gestor de tickets | Ticket creado con datos mínimos y vinculación pendiente | Propuesto |
| RF-SVC-052 | El sistema debe consumir el motor de consultas que ya construyó José para obtener datos específicos del cliente, integrándolo por API en lugar de desarrollar uno nuevo. | Debería | Gestor de tickets | Respuesta proviene del motor vía API | Propuesto |
| RF-SVC-053 | El sistema debe indexar con un modelo de red neuronal (búsqueda semántica) los archivos y documentos de los clientes para que el motor de búsqueda encuentre información por significado y no solo por palabras exactas. | Podría | Gestor de tickets | Resultados relevantes con fragmento y permisos aplicados | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-REN-007 | Rendimiento | Respuesta del motor de búsqueda | p95 ≤ 2 s (DNI/código); ≤ 3 s (semántica) |
| RNF-SEC-010 | Seguridad | Permisos en búsqueda y consulta 360 | accesos_indebidos_busqueda: 0,0 |
| RNF-INT-007 | Interoperabilidad | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-036 | Búsqueda respeta permisos: solo muestra documentos y datos que el rol del usuario puede ver en el sistema de origen | Negocio |
| RN-SVC-026 | Cero registros paralelos del dato de cliente | Negocio |
| RN-SVC-012 | DLP en bitácoras | Ley 29733 · Seguridad TI |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-049 | HU-ATC-049 — Buscar al cliente y llamarlo desde su ficha | 4 h · Dev 4 (Daniel) (2026-10-19 → 2026-10-19) | DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)), DEP-11 (Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call) | R-02, R-07 |
| RF-SVC-050 | HU-ATC-050 — Ver la consulta 360 del cliente dentro del ticket | 5 h · Dev 4 (Daniel) (2026-10-20 → 2026-10-20) | HU-ATC-049, DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)), DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h)) | R-02, R-07 |
| RF-SVC-051 | HU-ATC-051 — Continuar la atención cuando la consulta del cliente falla | 3 h · Dev 4 (Daniel) (2026-10-20 → 2026-10-21) | HU-ATC-049, DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)) | R-02, R-07 |
| RF-SVC-052 | HU-ATC-052 — Consultar datos específicos con el motor de José | 3 h · Dev 4 (Daniel) (2026-10-21 → 2026-10-21) | HU-ATC-050, DEP-13 (Motor de consultas de José: contrato de API y responsable de mantenimiento) | R-02, R-07 |
| RF-SVC-053 | HU-ATC-053 — Buscar documentos del cliente por significado | 5 h · Dev 4 (Daniel) (2026-10-21 → 2026-10-22) | HU-ATC-049, DEP-06 (Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI), DEP-14 (Proveedor de IA aprobado por TI y Seguridad, con política de datos personales) | R-02, R-07 |

## 6 Fuera de alcance

- Copia local del maestro de clientes.
- Edición de datos del cliente desde ATC.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué significa "llamar la cuenta" exactamente? | PO | por definir | No |
| P-02 | ¿Qué sistemas alimentan cada sección de la consulta 360? | PO | por definir | Sí |
| P-03 | ¿Qué repositorios de documentos se indexan para la búsqueda semántica? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
