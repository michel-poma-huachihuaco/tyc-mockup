---
id: "FT-ATC-17"
tipo: feature
titulo: "Integración con la plataforma del call center"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
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
| v1.0 - 30-oct-2026 | 5 h (talla S) | 2026-10-15 / v0.1 |

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

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-042 | HU-ATC-042 | DEP-11 plataforma de call center | R-02 |

## 6 Fuera de alcance

- Reemplazo de la central telefónica.
- Marcador predictivo.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué proveedor y versión de call center se usa? | PO | por definir | Sí |
| P-02 | ¿Expone API o CTI para screen pop y grabaciones? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
