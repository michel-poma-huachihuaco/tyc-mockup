---
id: "DOR-FT-NNN"
tipo: dor
titulo: "Definition of Ready - FT-NNN [nombre de la feature]"
estado: draft
producto: "[producto]"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "AAAA-MM-DD"
relacionados: ["FT-NNN", "EP-NN", "HU-NNN", "AYB-NNNN"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-NNN [nombre]

Va en `docs/dor/DOR-FT-NNN-<slug>.md`. Lo aprueban las personas que designen
la fuente documental (si `docs/.origen-documental.json` existe, alli se firma y
el sello trae su estado) o el ADR del proyecto; el resto firma como consultivo. La IA propone; el humano aprueba. Fuente de verdad:
`docs/analisis/decisiones.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-NN / FT-NNN [nombre] | [nombre] | [nombre] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| [AAAA-MM-DD] | [sprint] | [READY / NO READY: lo decide quien aprueba el DoR] |

## 1 Checklist de G4

Cada item lleva evidencia enlazada (ruta del repo). Sin evidencia, no cumple.

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro para el usuario | [ ] | [HU-NNN: "Como ... quiero ... para ..."] |
| 2 | Criterios de aceptacion verificables en Gherkin | [ ] | [HU-NNN, seccion de criterios] |
| 3 | Reglas de negocio explicitas | [ ] | [FT-NNN seccion 4] |
| 4 | Diseño UX aprobado si hay UI (G2 cerrado) | [ ] | [`docs/gates/AYB-NNNN/G2.md` approved en origin/main si alguna HU lleva `ui: true`; si ninguna, "No aplica: sin HU con ui"] |
| 5 | ADR aprobado si aplica (G3 cerrado) | [ ] | [`docs/gates/AYB-NNNN/G3.md` approved en origin/main; ADR-NNN] |
| 6 | Dependencias identificadas y desbloqueadas | [ ] | [seccion 2: cada DEP-NN con fecha comprometida] |
| 7 | Consideraciones tecnicas y de datos | [ ] | [secciones 3 y 4; CAD-F5 registrado si toca datos] |
| 8 | Casos de prueba iniciales definidos por QA | [ ] | [`docs/pruebas/test-plan.md`: TC por criterio] |
| 9 | Estimada por el equipo | [ ] | [`docs/backlog/tareas/EP-NN.json`: `estimacion_horas`] |
| 10 | Cabe en un sprint | [ ] | [horas estimadas frente a la capacidad del sprint] |
| IA | Si hubo IA: revision humana registrada | [ ] | [`revisado_por` en las tareas; linea "Revisado por" en cada documento] |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha comprometida | Estado |
|---|---|---|---|---|---|---|
| DEP-NN | [que y de quien] | [Interna / Externa / Tecnica / Legal] | [HU-NNN] | [rol] | [AAAA-MM-DD, no "por definir"] | [Pendiente / Resuelta] |

Una dependencia sin fecha comprometida, o sin desbloquear, deja el criterio 6 sin cumplir.

[Diagrama de dependencias en Mermaid, opcional]

## 3 Modelado (datos y proceso)

- ER de las entidades que lee y escribe: [enlace a `docs/datos/` o diagrama Mermaid]
- Estados y transiciones: [enlace a `docs/datos/`]
- Diccionario: [enlace; campos nuevos marcados]
- Puerta F4 de Gobierno de Datos: [acta, si toca datos]

## 4 Arquitectura

- Diagrama C4 (contexto y contenedores) de lo que toca: [Mermaid o enlace]
- Contrato: [`docs/arquitectura/<servicio>.openapi.yaml`, operaciones de esta feature]
- ADR que aplican: [ADR-NNN]

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigacion | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-NN | [...] | [Alta / Media / Baja] | [Alto / Medio / Bajo] | [accion concreta] | [rol] | [Abierto / Cerrado] |

## 6 Decision y aprobacion

<!--
Solo hay dos resultados: READY o NO READY.
La PLT-05 en PDF trae una tercera casilla, "READY CON CONDICIONES". Aqui no se
usa porque choca con G4 ("Una HU sin DoR no entra al Sprint Backlog. Sin
excepciones por urgencia"): una condicion abierta es un criterio que no se
cumple. El resultado es NO READY, con la lista de condiciones como lo que
falta; cuando se cumplen, se vuelve a evaluar.
Con sello de origen documental, un DoR aprobado en la fuente es READY: la
aprobacion humana alli es el veredicto, aunque aqui solo haya una propuesta.
Los agentes y `aybar paquete validar` leen la linea "Decision:". Deja una
sola, exactamente "Decision: READY" o "Decision: NO READY". La escribe quien
aprueba el DoR (no la IA): una IA deja "Decision: NO READY" y, si quiere, anota su propuesta en una
linea aparte que empiece por "Propuesta IA", que no cuenta como decision.
-->

Decision: NO READY

Condiciones pendientes (solo si NO READY):
- [ ] [criterio que falta, dueño y fecha]

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

El DoR cuenta como READY solo con `Decision: READY` y `estado: approved` en
`origin/main`.

Generado por IA: [partes] — Revisado por: [nombre, fecha]
