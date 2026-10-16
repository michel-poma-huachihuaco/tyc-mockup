---
id: "EP-ATC-04"
tipo: epica
titulo: "Gate legal Eje 3 y Mesa de Casos sensibles"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-04 Gate legal Eje 3 y Mesa de Casos sensibles

Va en `docs/epicas/EP-ATC-04-gate-legal-eje3-mesa-casos-sensibles.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-04 | Gate legal Eje 3 y Mesa de Casos sensibles | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia Legal / Dirección UX (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Ahora | Borrador | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: casos con carta notarial, INDECOPI, abogado o prensa se atienden en Eje 1 o Eje 2 sin Legal. Los casos sensibles llegan por 5 líneas distintas, sin código único, sin matriz de riesgo y sin escalamiento formal.
- **Usuarios**: Mesa de Casos (SGD), Especialista Legal Senior, gestores de tickets telefónicos y gestores de postventa, Comité de Asistentes y Directorio.
- **Evidencia**: reglas de gate no compensable RN-SVC-014..024; IGDC (RNF-CUM-015); conflictos resueltos sin Legal (dolor del AS-IS).
- **Alineamiento**: reducir la exposición legal y reputacional y medir la gestión de casos con el IGDC.

## 2 Objetivos

Objetivos de negocio:
- OBJ-04: El 100% de los tickets con señal de conflicto llega a Eje 3 con el paquete mínimo completo, y ningún caso sensible vence su SLA de línea sin escalar, desde el pase a producción.

Objetivos del usuario:
- Legal recibe casos completos y confirmados; el cliente en conflicto es atendido por la instancia correcta sin repetir su historia.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de derivaciones a Eje 3 con paquete mínimo (6/6) | por medir | 100% | Plataforma ATC | Diaria |
| Casos sensibles vencidos sin escalamiento | por medir | 0 | Plataforma ATC | Diaria |
| IGDC (Índice de Gestión Documentaria y de Casos) | por medir | ≥ 85 | Plataforma ATC | Trimestral |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Gate que bloquea resolver en Eje 1/2 un ticket con señal de conflicto | Gestión del expediente judicial o arbitral |
| Paquete mínimo de handoff con confirmación de recepción | Vocería y comunicación con prensa (solo aviso al Director UX) |
| Nota de estado emocional sin juicios de valor | Custodia de originales: vive en el Repositorio Legal GLI, no en la plataforma |
| Registro multilínea con Código Único de Caso | |
| Cargo previo vs. cargo de activación (inicio del SLA de línea) | |
| Matriz objetiva de riesgo y recalibración | |
| Escalamiento en cadena, validación de casos vinculados y cierre tipificado en 8 estados | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-07 | Gate de derivación a Eje 3 y handoff | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-08 | Mesa SGD: recepción, activación y riesgo | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-09 | Escalamiento, vinculación y cierre tipificado | Debe | v1.0 - 30-oct-2026 |

- **Supuestos**: la Mesa SGD entrega los plazos del SLA de cada línea y las ponderaciones de la matriz de riesgo (provisionales y parametrizables).
- **Restricciones**: gates no compensables (RN-SVC-021, 022, 024); custodia legal separada de la plataforma operativa (RN-SVC-020).
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON, DEP-06 GLI, DEP-08 Cobranza; R-06 modelo de datos incompleto, R-08 ponderaciones provisionales.
- **Criterios de éxito**: 100% de handoffs completos y 0 casos vencidos sin escalar durante 2 meses; IGDC ≥ 85 en el primer trimestre de operación.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
