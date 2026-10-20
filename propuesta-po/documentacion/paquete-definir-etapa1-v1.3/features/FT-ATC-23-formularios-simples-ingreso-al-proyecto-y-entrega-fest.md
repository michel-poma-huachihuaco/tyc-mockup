---
id: "FT-ATC-23"
tipo: feature
titulo: "Formularios simples: ingreso al proyecto y Entrega Fest"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-11", "HU-ATC-059", "HU-ATC-060"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-23 Formularios simples: ingreso al proyecto y Entrega Fest

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-23 | Formularios simples: ingreso al proyecto y Entrega Fest | EP-ATC-11 Resolución por morosidad y formularios simples |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debería | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·7h · 7 h de desarrollo · Dev 4 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 4 (Daniel) | 29-oct-2026 → 30-oct-2026 | — |

## 1 Descripción y valor

Formularios de máximo 6 campos, desde celular, que crean un ticket: registro de ingreso de personas al proyecto y reserva de cupo en los buses del Entrega Fest con control de aforo.

**Beneficio:** Registro trazable en campo sin papel ni listas manuales.

**Usuarios:** Personal de control de acceso · Responsable de proyecto · Cliente · Organizador del evento

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-059 | El sistema debe permitir registrar el ingreso de una persona al proyecto con un formulario simple (nombre, DNI, teléfono, motivo, lote o área a visitar y fecha y hora) que genera automáticamente un ticket asignado al responsable del proyecto. | Debería | PROC-SVC-022 · Personal de control de acceso del proyecto · Feedback 2.ª reunión · ítem 5 | Ticket «Ingreso a proyecto» en ≤ 1 min | 4 | — | Pend. DoR |
| RF-SVC-060 | El sistema debe permitir que el cliente solicite cupo en los buses del Entrega Fest con un formulario simple que genera un ticket, controla el aforo por bus y horario y envía la confirmación con punto y hora de embarque. | Debería | PROC-SVC-022 · Interesado (Party) · Feedback 2.ª reunión · ítem 6 | Cupo confirmado solo con aforo disponible | 3 | — | Pend. DoR |

Ruta crítica: RF-SVC-059 (4 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-USA-004 | Usabilidad | Formulario simple y móvil | tiempo_completar_formulario: ≤ 1 min; máximo 6 campos obligatorios | Debería |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-041 | Formulario simple genera ticket. Cada envío de un formulario simple crea un ticket tipificado con número, canal «Formulario» y responsable según el flujo; máximo 6 campos obligatorios | Negocio · Excel 05_Catalogos |
| RN-SVC-042 | Aforo de buses del Entrega Fest. No se confirma un cupo si el bus y horario no tienen capacidad; una cancelación libera el cupo y lo asigna a la lista de espera en orden de solicitud | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-059 | HU-ATC-059 · Iteración 2 · Dev 4 · jue 29-oct → vie 30-oct | Conectividad en proyecto | R-06 |
| RF-SVC-060 | HU-ATC-060 · Iteración 2 · Dev 4 · vie 30-oct | Conectividad en proyecto | R-06 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Control de salida y torniquetes; contratación de buses.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Todo ingreso es un ticket? ¿«Buses entrega fest» es reserva del cliente o logística con el proveedor? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
