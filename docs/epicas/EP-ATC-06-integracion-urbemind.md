---
id: "EP-ATC-06"
tipo: epica
titulo: "Integración UrbeMind"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-06 Integración UrbeMind

Va en `docs/epicas/EP-ATC-06-integracion-urbemind.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-06 | Integración UrbeMind | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de TI · Producto UrbeMind (por confirmar) | Debería |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Siguiente | Borrador · alcance por confirmar (R-06) | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: las incidencias de ciudad reportadas en UrbeMind no entran como tickets a la plataforma y no se pueden cobrar ni medir.
- **Usuarios**: residentes que reportan en UrbeMind y gestores de tickets.
- **Evidencia**: RF-SVC-017/018; riesgo de contradicción sobre si UrbeMind entra o no al alcance (R-02), a confirmar por el patrocinador.
- **Alineamiento**: ATC como servicio transversal de las 11 razones sociales y de UrbeMind.

## 2 Objetivos

Objetivos de negocio:
- OBJ-06: Crear automáticamente el 100% de las incidencias de ciudad de UrbeMind como tickets, desde que el patrocinador confirme el alcance.

Objetivos del usuario:
- El residente reporta en UrbeMind y su incidencia se atiende con número y plazo como cualquier ticket.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de incidencias de ciudad con ticket | por medir | 100% | Plataforma ATC | Diaria |
| Accesos de UrbeMind fuera de API/evento | por medir | 0 | Auditoría de integración | Continua |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Tipo de ticket CITY_INCIDENT con vínculo opcional a contrato/unidad (cobro CITY_SERVICE_FEE) | Bot conversacional con IA (fase posterior) |
| API/eventos de creación y consulta para UrbeMind | Desarrollo de funcionalidades dentro de UrbeMind |
| | Facturación del CITY_SERVICE_FEE (dominio Cobranza) |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-11 | Integración UrbeMind (CITY_INCIDENT) | Debería | v1.0 - 30-oct-2026 |

- **Supuestos**: el patrocinador confirma que UrbeMind entra al alcance; los proveedores de canal tienen API disponible.
- **Restricciones**: sin JOIN físico con UrbeMind, solo API/evento (RNF-INT-003).
- **Dependencias y riesgos**: DEP-09 UrbeMind; R-02 alcance ambiguo (pendiente de confirmación del patrocinador).
- **Criterios de éxito**: 100% de incidencias de ciudad con ticket y 0 accesos fuera de API/evento durante 2 meses.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
