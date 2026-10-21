---
id: "EP-ATC-02"
tipo: epica
titulo: "Enrutamiento, SLA y alertas"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-02 Enrutamiento, SLA y alertas

Va en `docs/epicas/EP-ATC-02-enrutamiento-sla-alertas.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-02 | Enrutamiento, SLA y alertas | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente | Debe |
| **Horizonte / Plan** | **Estado** | **Fecha / Version** |
| Ahora · Iteración 1 (2026-10-19 → 2026-10-23 · 28 h · Dev 2 (Jesús)) | Borrador (Habilitadora) | 2026-10-19 / v0.2 |

## 1 Contexto

- **Problema**: los tickets se derivan por correo o de palabra y se pierden cuando un colaborador rota o cesa. No hay compromiso de tiempo por tipo y prioridad, y nadie se entera de un incumplimiento hasta que el cliente reclama.
- **Usuarios**: gestores de tickets, colaboradores de Cobranza, Legal, Postventa, TI y Administración, supervisores ATC y el job batch de la plataforma.
- **Evidencia**: necesidad de comprometer tiempos sin que un feriado nazca incumplido, y de derivar sin perder el rastro; reglas RN-SVC-001..008.
- **Alineamiento**: compromiso de tiempo trazable y auditable; cierre end-to-end en 72 horas hábiles (RN-SVC-025).

## 2 Objetivos

Objetivos de negocio:
- OBJ-02: Llegar al 90% de cumplimiento de SLA de resolución por tipo y prioridad en los 3 meses siguientes a la puesta en marcha, y cerrar sin escalamiento en ≤ 72 horas hábiles.

Objetivos del usuario:
- El colaborador ve su bandeja con lo que vence primero; el supervisor recibe una sola alerta por incumplimiento y puede reasignar sin perder historial.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de tickets resueltos dentro del SLA | por medir | ≥ 90% | Plataforma ATC | Diaria |
| Tiempo de cierre E2E sin escalamiento | por medir | ≤ 72 h hábiles | Plataforma ATC | Por ticket |
| Tickets sin responsable > 1 día hábil | por medir | 0 | Plataforma ATC | Diaria |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Derivación entre 6 áreas con bitácora append-only y motivo tipificado | Asignación por habilidades avanzadas (reasignación por menor carga está en FT-ATC-18) |
| Derivación a área sin persona asignada | Definición de los tiempos de la matriz SLA (decisión de negocio, DEP-03) |
| Reasignación masiva por cese, rotación o renuncia | Escalamiento de casos sensibles a Comité/Directorio (EP-ATC-04) |
| Casillero de tareas por área y responsable | |
| Motor SLA: precedencia de política, congelamiento al abrir, horas/días hábiles con feriados por geografía | |
| Alertas únicas por tipo y ciclo; reapertura con nuevo compromiso | |
| Medición de cierre E2E (72 h hábiles) | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-03 | Derivación, reasignación y casillero | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-04 | Motor SLA y alertas | Debe | v1.0 - 30-oct-2026 |

- **Supuestos**: negocio entrega la matriz de minutos por tipo y prioridad (o una provisional firmada) antes del inicio del motor SLA; MAE_TIME y MAE_HOLIDAY son la fuente única de días hábiles.
- **Restricciones**: compromisos congelados, nunca se recalculan si la política cambia (RN-SVC-002); bitácoras append-only firmadas HMAC-SHA256 (RNF-AUD-004).
- **Dependencias y riesgos**: DEP-02 NEXUS, DEP-03 matriz SLA, DEP-04 calendario; R-01 matriz sin definir, R-05 terceros.
- **Criterios de éxito**: ≥ 90% de cumplimiento de SLA durante 2 meses seguidos; 0 alertas duplicadas; 0 tickets huérfanos tras un cese.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
