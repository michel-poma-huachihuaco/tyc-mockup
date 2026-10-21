---
id: "FT-ATC-17"
tipo: feature
titulo: "Integración con la plataforma del call center"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-10", "HU-ATC-042"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-17 Integración con la plataforma del call center

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-17 | Integración con la plataforma del call center | EP-ATC-10 Consulta 360 e integraciones operativas |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·5h · 5 h de desarrollo · Dev 4 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 4 (Daniel) | 26-oct-2026 → 26-oct-2026 | FT-ATC-20 |

## 1 Descripción y valor

Conecta la plataforma telefónica del call center con el ticket: muestra la ficha del cliente al contestar, abre o ubica su ticket y registra la llamada con su grabación.

**Beneficio:** El operador atiende sin cambiar de sistema ni registrar dos veces.

**Usuarios:** Gestor de tickets (call center) · Supervisor ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-042 | El sistema debe integrarse con la plataforma que usa el equipo de call center para mostrar los datos del cliente al recibir la llamada (screen pop), abrir o ubicar su ticket y registrar la llamada como interacción con su grabación. | Debe | PROC-SVC-016 · Gestor de tickets · Feedback presentación · ítem 5 | Ficha visible en ≤ 2 s al contestar | 5 | — | Pend. DoR |

Ruta crítica: RF-SVC-042 (5 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-INT-008 | Interoperabilidad | Integración en línea con el call center | tiempo_screen_pop: p95 ≤ 2 s | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-005 | Empresa y línea obligatorias. CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable) | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-042 | HU-ATC-042 · Iteración 1 · Dev 4 · lun 26-oct | DEP-11 plataforma de call center | R-02 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Reemplazo de la central telefónica; marcador predictivo.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué proveedor y versión de call center se usa? ¿Expone API o CTI para screen pop y grabaciones? PLATAFORMA DE ATENCIÓN AL CLIENTE Aybar Atiende · Etapa de diseño y planeamiento | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
