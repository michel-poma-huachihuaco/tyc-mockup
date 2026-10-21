---
id: "FT-ATC-01"
tipo: feature
titulo: "Registro multicanal y tipificación"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-01", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-01 Registro multicanal y tipificación

Va en `docs/features/FT-ATC-01-registro-multicanal-tipificacion.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-01 | Registro multicanal y tipificación | EP-ATC-01 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 1 · lun 19-oct · Brayan) | 9 h (2 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Permite al gestor de tickets registrar cada solicitud que llega por teléfono, WhatsApp o correo en un ticket tipificado, con número correlativo por razón social, que se entrega al cliente desde el primer contacto. Es una sola fuente de verdad de solicitudes: elimina los registros paralelos y permite dar seguimiento con un número. Contribuye a OBJ-01 de EP-ATC-01.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-001 | El sistema debe registrar tickets de teléfono, WhatsApp y correo con canal, cliente, empresa (RUC) y línea de negocio obligatorias, establecimiento opcional, tipo, prioridad, resumen y descripción. | Debe | Gestor de tickets | Ticket guardado solo con los campos obligatorios completos | Propuesto |
| RF-SVC-002 | El sistema debe generar un número correlativo único por razón social y entregarlo al cliente. | Debe | Gestor de tickets | UNIQUE (CompanyID, TicketNumber) | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-DIS-003 | Disponibilidad | Plataforma ATC en Multi-AZ | zonas_de_disponibilidad: 2 |
| RNF-INT-007 | Interoperabilidad | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 |
| RNF-REN-001 (id a confirmar en el Excel origen) | Rendimiento | Búsqueda de cliente en SIGDA/TAXON al registrar | p95 ≤ 2 s |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-004 | Correlativo por RUC: TicketNumber UNIQUE por CompanyID; el libro corre además por establecimiento | Ley 29571 (libro) · Negocio |
| RN-SVC-005 | Empresa y línea obligatorias: CompanyID y BusinessLineID son NOT NULL y no derivables | Negocio |
| RN-SVC-026 | Cero registros paralelos del dato de cliente fuera de SIGDA/TAXON | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-001 | HU-ATC-001 — Registrar un ticket tipificado desde cualquier canal | 6 h · Dev 1 (Brayan) (2026-10-19 → 2026-10-20) | DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)) | R-04, R-05 |
| RF-SVC-002 | HU-ATC-002 — Entregar al cliente un número de ticket por razón social | 3 h · Dev 1 (Brayan) (2026-10-20 → 2026-10-20) | HU-ATC-001 | R-04, R-05 |

## 6 Fuera de alcance

- Conectores automáticos de WhatsApp y correo (pendientes de producto).
- Alta de clientes nuevos en SIGDA (proceso del dominio de datos).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿La numeración reinicia por año? | PO | por definir | No |
| P-02 | ¿Cuál es el formato del N.º visible al cliente (prefijo por RUC)? | PO | por definir | Sí |
| P-03 | ¿Quién registra a un interesado sin rol contractual (ACT-003)? | PO | por definir | No |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
