---
id: "FT-ATC-01"
tipo: feature
titulo: "Registro multicanal y tipificación"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-01", "HU-ATC-001", "HU-ATC-002"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-01 Registro multicanal y tipificación

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-01 | Registro multicanal y tipificación | EP-ATC-01 Núcleo de tickets omnicanal |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M·9h · 9 h de desarrollo · Dev 1 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 1 (Brayan) | 21-oct-2026 → 22-oct-2026 | — |

## 1 Descripción y valor

Permite al gestor de tickets registrar cada solicitud que llega por teléfono, WhatsApp o correo en un ticket tipificado, con número correlativo por razón social, que se entrega al cliente desde el primer contacto.

**Beneficio:** Una sola fuente de verdad de solicitudes: elimina los registros paralelos y permite dar seguimiento con un número.

**Usuarios:** Gestor de tickets · Supervisor ATC · Cliente (recibe el N.º)

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-001 | El sistema debe registrar tickets de teléfono, WhatsApp y correo con canal, cliente, empresa (RUC), línea de negocio, tipo, prioridad, resumen y descripción. | Debe | PROC-SVC-001 · Gestor de tickets | Ticket guardado solo con los campos obligatorios completos | 6 | — | Pend. DoR |
| RF-SVC-002 | El sistema debe generar un número correlativo único por razón social y entregarlo al cliente. | Debe | PROC-SVC-001 · Gestor de tickets | UNIQUE (CompanyID, TicketNumber) | 3 | RF-SVC-001 | Pend. DoR |

Ruta crítica: RF-SVC-001 → RF-SVC-002 (9 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-DIS-003 | Disponibilidad | Plataforma ATC en Multi-AZ | zonas_de_disponibilidad: 2 | Debe |
| RNF-INT-007 | Interoperabilidad | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 | Debe |
| RNF-P (P) | Rendimiento | Búsqueda de cliente en SIGDA/TAXON al registrar | p95 ≤ 2 s | Debería |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-004 | Correlativo por RUC. TicketNumber UNIQUE por CompanyID; el libro corre ademas por establecimiento (UNIQUE Company+Address+Número) | Ley 29571 (libro) · Negocio |
| RN-SVC-005 | Empresa y línea obligatorias. CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable) | Negocio · Excel 05_Catalogos |
| RN-SVC-026 | Cero registros paralelos del dato de cliente. No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoría quincenal debe arrojar cero casos y crear uno es gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-001 | HU-ATC-001 · Iteración 1 · Dev 1 · mié 21-oct | DEP-01 SIGDA/TAXON | R-04, R-05 |
| RF-SVC-002 | HU-ATC-002 · Iteración 1 · Dev 1 · mié 21-oct → jue 22-oct | DEP-01 SIGDA/TAXON | R-04, R-05 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Conectores automáticos de WhatsApp y correo (pendientes de producto); alta de clientes nuevos en SIGDA (proceso del dominio de datos).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿La numeración reinicia por año? ¿Cuál es el formato del N.º visible al cliente (prefijo por RUC)? ¿Quién registra a un interesado sin rol contractual (ACT-003)? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
