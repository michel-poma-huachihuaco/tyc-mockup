---
id: "DOR-FT-ATC-21"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-21 Productividad y notificaciones del gestor"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-21", "EP-ATC-09", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-21 Productividad y notificaciones del gestor

Va en `docs/dor/DOR-FT-ATC-21-productividad-notificaciones-gestor.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-09 / FT-ATC-21 Productividad y notificaciones del gestor | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-054, 055 |
| 2 | Gherkin verificable | [x] | HU-ATC-054, 055 |
| 3 | Reglas explícitas | [x] | RN-SVC-035, 025 |
| 4 | G2 si `ui: true` | [ ] | Tablero de avance es pantalla; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 005 (correo por evento, idempotente); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-02 (NEXUS, líder de cada gestor) sin resolver |
| 7 | Técnicas y de datos | [x] | Lectura agregada (Mongo, CQRS) en `docs/datos/diccionario.md` |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 6 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-02 | NEXUS: jerarquía líder-gestor | Externa | HU-ATC-054, 055 | Líder técnico | 2026-10-19 | Pendiente |

## 3 Modelado

- Proyección Mongo de productividad diaria en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-005

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | NEXUS no disponible en 2 semanas | Alta | Alto | Simulador de jerarquía líder-gestor | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-02 sin resolver
- [ ] P-02 de FT-ATC-21 (el correo incluye datos del cliente o solo el enlace) bloquea G4 — relevante también para DLP (RN-SVC-012)
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: documento completo — Revisado por: pendiente
