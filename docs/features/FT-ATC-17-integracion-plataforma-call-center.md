---
id: "FT-ATC-17"
tipo: feature
titulo: "Integración con la plataforma del call center"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-10", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-17 Integración con la plataforma del call center

Va en `docs/features/FT-ATC-17-integracion-plataforma-call-center.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-17 | Integración con la plataforma del call center | EP-ATC-10 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 4 · jue 22-oct · Daniel) | 5 h (1 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Conecta la plataforma telefónica del call center con el ticket: muestra la ficha del cliente al contestar, abre o ubica su ticket y registra la llamada con su grabación. El operador atiende sin cambiar de sistema ni registrar dos veces.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-042 | El sistema debe integrarse con la plataforma que usa el equipo de call center para mostrar los datos del cliente al recibir la llamada (screen pop), abrir o ubicar su ticket y registrar la llamada como interacción con su grabación. | Debe | Gestor de tickets (call center) | Ficha visible en ≤ 2 s al contestar | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-INT-008 | Interoperabilidad | Integración en línea con el call center | tiempo_screen_pop p95 ≤ 2 s |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-005 | Empresa y línea obligatorias; ContractID puede ser nullable en este caso | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-042 | HU-ATC-042 — Atender la llamada con la ficha del cliente y registrarla en el ticket | 5 h · Dev 4 (Daniel) (2026-10-22 → 2026-10-22) | HU-ATC-053, DEP-11 (Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call) | R-02 |

## 6 Fuera de alcance

- Reemplazo de la central telefónica.
- Marcador predictivo.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué proveedor y versión de call center se usa? | PO | por definir | Sí |
| P-02 | ¿Expone API o CTI para screen pop y grabaciones? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
