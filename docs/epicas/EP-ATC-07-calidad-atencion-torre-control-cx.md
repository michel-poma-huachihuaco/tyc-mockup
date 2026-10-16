---
id: "EP-ATC-07"
tipo: epica
titulo: "Calidad de atención y Torre de Control CX"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-07 Calidad de atención y Torre de Control CX

Va en `docs/epicas/EP-ATC-07-calidad-atencion-torre-control-cx.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-07 | Calidad de atención y Torre de Control CX | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Dirección UX (por confirmar) | Debería |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Siguiente | Borrador | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: no se mide la satisfacción al cerrar un caso y la jefatura no tiene visibilidad en tiempo real de SLA, NPS ni casos en riesgo: se entera cuando el problema ya escaló.
- **Usuarios**: Coordinador CX (Torre de Control), supervisores ATC, jefaturas, Comité de Asistentes y CDO.
- **Evidencia**: necesidad de medir CSAT/CES por tipo, área y gestor de tickets; NPS-C como North Star corporativo.
- **Alineamiento**: NPS-C como North Star corporativo de experiencia.

## 2 Objetivos

Objetivos de negocio:
- OBJ-07: Disparar la encuesta en el 100% de los tickets cerrados y emitir el informe diario de la Torre de Control desde el pase a producción.

Objetivos del usuario:
- El coordinador detecta un caso en riesgo antes de que venza y redistribuye la carga.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de tickets CLOSED con encuesta disparada | por medir | 100% | Plataforma ATC | Diaria |
| NPS-C | línea base por calibrar | meta tras calibrar el 1.er trimestre | Encuesta | Mensual |
| Registros paralelos del dato de cliente | por medir | 0 | Auditoría quincenal | Quincenal |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Encuesta POST_TRANSACTION al cierre, con CSAT/CES por tipo, área y gestor de tickets | Diseño de las preguntas de la encuesta (se reutiliza el fragmento 19 del KPI Engine) |
| Tablero en tiempo real: tickets activos, SLA, NPS, derivaciones y casos en riesgo | BI corporativo fuera del dominio ATC |
| Informe diario operativo e informe quincenal analítico | |
| Auditoría quincenal de registros paralelos del dato de cliente | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-13 | Encuesta post-atención | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-14 | Torre de Control CX | Debería | v1.0 - 30-oct-2026 |

- **Supuestos**: el KPI Engine y SVY_SURVEY_RESPONSE están disponibles; las ponderaciones del NPS-C se calibran en el primer trimestre.
- **Restricciones**: puntero polimórfico, sin FK desde ATC hacia encuestas (RNF-INT-004).
- **Dependencias y riesgos**: DEP-10 KPI Engine; R-08 ponderaciones provisionales, R-04 adopción.
- **Criterios de éxito**: 100% de encuestas disparadas, informe diario emitido 20 días hábiles seguidos y NPS-C calibrado.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
