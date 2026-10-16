---
id: "FT-ATC-20"
tipo: feature
titulo: "Búsqueda y consulta 360 del cliente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
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
| v1.0 - 30-oct-2026 | 20 h (talla L) | 2026-10-15 / v0.1 |

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

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-049 | HU-ATC-049 | DEP-01 SIGDA/TAXON, DEP-13 motor de José | R-02, R-07 |
| RF-SVC-050 | HU-ATC-050 | DEP-01, DEP-13 | R-02, R-07 |
| RF-SVC-051 | HU-ATC-051 | DEP-01, DEP-13 | R-02, R-07 |
| RF-SVC-052 | HU-ATC-052 | DEP-01, DEP-13 | R-02, R-07 |
| RF-SVC-053 | HU-ATC-053 | DEP-01, DEP-13 | R-02, R-07 |

## 6 Fuera de alcance

- Copia local del maestro de clientes.
- Edición de datos del cliente desde ATC.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué significa "llamar la cuenta" exactamente? | PO | por definir | No |
| P-02 | ¿Qué sistemas alimentan cada sección de la consulta 360? | PO | por definir | Sí |
| P-03 | ¿Qué repositorios de documentos se indexan para la búsqueda semántica? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
