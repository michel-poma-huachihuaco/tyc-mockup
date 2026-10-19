---
id: "FT-NNN"
tipo: feature
titulo: "[nombre de la feature]"
estado: draft
producto: "[producto]"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "AAAA-MM-DD"
relacionados: ["EP-NN", "AYB-NNNN"]
tags: [feature, plt-03]
---

# PLT-03 - FT-NNN [nombre de la feature]

Va en `docs/features/FT-NNN-<slug>.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-NNN | [nombre] | EP-NN |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| [nombre] | [Debe / Deberia / Podria / No ahora] | [Borrador] |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| [release] | [horas o puntos del equipo; "sin estimar" si no hay] | [AAAA-MM-DD / v0.1] |

## 1 Descripcion y valor

[Que hace, para quien y que valor entrega, en tres o cuatro frases. Enlaza el
objetivo de la epica (OBJ-NN).]

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificacion | Estado |
|---|---|---|---|---|---|
| RF-NNN | El sistema debe [verbo + objeto + condicion] | [Debe] | [BRD seccion / D-NN de decisiones.md] | [observable: HU y TC que lo prueban] | [Propuesto / Aprobado] |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-NNN | [Rendimiento / Seguridad / Disponibilidad / Auditoria / Usabilidad] | [que] | [con numero: p95 < 400 ms, no "rapido"] |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-NN | [regla explicita y verificable] | [decisiones.md D-NN / BRD / normativa] |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-NNN | HU-NNN | DEP-NN | R-NN |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md`.

## 6 Fuera de alcance

- [lo que esta feature no hace, y donde se hace si se hace]

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | [...] | [rol] | [AAAA-MM-DD] | [Si / No] |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la
respuesta va a `docs/analisis/decisiones.md` y aqui se enlaza.

Generado por IA: [partes] — Revisado por: [nombre, fecha]
