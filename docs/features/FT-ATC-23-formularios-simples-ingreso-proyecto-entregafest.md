---
id: "FT-ATC-23"
tipo: feature
titulo: "Formularios simples: ingreso al proyecto y Entrega Fest"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-11", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-23 Formularios simples: ingreso al proyecto y Entrega Fest

Va en `docs/features/FT-ATC-23-formularios-simples-ingreso-proyecto-entregafest.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-23 | Formularios simples: ingreso al proyecto y Entrega Fest | EP-ATC-11 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 4 · mar 27-oct · Daniel) | 7 h (2 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Formularios de máximo 6 campos, desde celular, que crean un ticket: registro de ingreso de personas al proyecto y reserva de cupo en los buses del Entrega Fest con control de aforo. Da registro trazable en campo, sin papel ni listas manuales.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-059 | El sistema debe permitir registrar el ingreso de una persona al proyecto con un formulario simple (nombre, DNI, teléfono, motivo, lote o área a visitar y fecha y hora) que genera automáticamente un ticket asignado al responsable del proyecto. | Debería | Personal de control de acceso | Ticket «Ingreso a proyecto» en ≤ 1 min | Propuesto |
| RF-SVC-060 | El sistema debe permitir que el cliente solicite cupo en los buses del Entrega Fest con un formulario simple que genera un ticket, controla el aforo por bus y horario y envía la confirmación con punto y hora de embarque. | Debería | Interesado (Party) | Cupo confirmado solo con aforo disponible | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-USA-004 | Usabilidad | Formulario simple y móvil | tiempo_completar_formulario ≤ 1 min; máximo 6 campos obligatorios |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-041 | Formulario simple genera ticket tipificado, con canal «Formulario» y responsable según el flujo; máximo 6 campos obligatorios | Negocio |
| RN-SVC-042 | Aforo de buses del Entrega Fest: no se confirma un cupo sin capacidad; una cancelación libera el cupo a la lista de espera | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-059 | HU-ATC-059 — Registrar el ingreso de una persona al proyecto | 4 h · Dev 4 (Daniel) (2026-10-27 → 2026-10-28) | — | R-06 |
| RF-SVC-060 | HU-ATC-060 — Reservar un cupo en el bus del Entrega Fest | 3 h · Dev 4 (Daniel) (2026-10-28 → 2026-10-28) | — | R-06 |

## 6 Fuera de alcance

- Control de salida y torniquetes.
- Contratación de buses.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Todo ingreso al proyecto es un ticket? | PO | por definir | No |
| P-02 | ¿La reserva de buses es del cliente o logística con el proveedor? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
