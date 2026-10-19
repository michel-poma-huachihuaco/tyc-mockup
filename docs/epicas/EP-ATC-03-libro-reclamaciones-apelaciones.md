---
id: "EP-ATC-03"
tipo: epica
titulo: "Libro de Reclamaciones y apelaciones"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-03 Libro de Reclamaciones y apelaciones

Va en `docs/epicas/EP-ATC-03-libro-reclamaciones-apelaciones.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-03 | Libro de Reclamaciones y apelaciones | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia Legal | Debe |
| **Horizonte / Plan** | **Estado** | **Fecha / Version** |
| Ahora · Iteración 1y2 (2026-10-22 → 2026-10-27 · 21 h · Dev 1 (Brayan)) | Borrador (Valor de negocio) | 2026-10-19 / v0.2 |

## 1 Contexto

- **Problema**: el Libro de Reclamaciones se lleva aparte y el plazo de 15 días hábiles se controla a mano. Hay respuestas sin número de reclamo ni cargo, lo que expone a la empresa a sanciones de INDECOPI.
- **Usuarios**: responsable legal de reclamos, gestores de tickets que detectan quejas y reclamos, y consumidores de las 11 razones sociales.
- **Evidencia**: necesidad de probar ante INDECOPI cuándo se registró, prorrogó y respondió un reclamo, y de detectar reclamos sin asiento; Ley 29571 art. 24, Ley 31435 y D.S. 101-2022-PCM.
- **Alineamiento**: cumplir el Libro de Reclamaciones sin exposición ante INDECOPI.

## 2 Objetivos

Objetivos de negocio:
- OBJ-03: Cero respuestas fuera del plazo legal (o prorrogado) y cero reclamos sin asiento desde el pase a producción.

Objetivos del usuario:
- El consumidor recibe una respuesta formal con número y cargo dentro del plazo y sabe que puede acudir a INDECOPI.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Reclamos respondidos fuera del plazo legal | por medir | 0 | Plataforma ATC | Diaria |
| Tickets QUEJA/RECLAMO sin asiento (huérfanos) | por medir | 0 | Job de vigilancia | Diaria |
| Documentos probatorios sin checksum | por medir | 0 | Plataforma ATC | Continua |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento | Portal público del Libro de Reclamaciones virtual (se integra el existente; se define en refinamiento) |
| Cálculo del plazo de 15 días hábiles y prórroga única, con justificación y cargo | Interoperabilidad electrónica con sistemas de INDECOPI (se registra manualmente) |
| Respuesta formal con carta PDF, cargo y constancia del derecho a acudir a INDECOPI | Gestión de procedimientos sancionadores |
| Job de vigilancia del plazo legal y detección diaria de huérfanos | |
| Apelaciones internas y ante INDECOPI con historial | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-05 | Libro de Reclamaciones | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-06 | Apelaciones internas e INDECOPI | Debe | v1.0 - 30-oct-2026 |

- **Supuestos**: el ticket y su tipo existen (EP-ATC-01); Legal valida el formato del asiento y los textos de la respuesta.
- **Restricciones**: plazo legal 15+15 días hábiles, prórroga comunicada antes del vencimiento (RN-SVC-009); la empresa del asiento es inmutable (RN-SVC-013).
- **Dependencias y riesgos**: DEP-04 calendario, DEP-05 validación legal, DEP-06 repositorio S3/GLI; R-03 plazo legal en transición.
- **Criterios de éxito**: 0 respuestas fuera de plazo y 0 huérfanos durante 3 meses seguidos; una auditoría legal interna sin observaciones.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
