---
id: "RMP-NNN"
tipo: roadmap
titulo: "Roadmap de producto - [producto]"
estado: draft
producto: "[producto]"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "AAAA-MM-DD"
relacionados: ["AYB-NNNN"]
tags: [roadmap, plt-01]
---

# PLT-01 - Roadmap de producto

Va en `docs/roadmap/`. Dependencias, riesgos e hitos del producto.

| Producto | Product Owner | Version / Fecha |
|---|---|---|
| [nombre y proposito en una linea] | [nombre] | [v0.1 - AAAA-MM-DD] |
| **Horizonte** | **Vision del producto** | **Estado** |
| [periodo que cubre] | [que cambia para el usuario si sale bien] | [Borrador] |

> Fuente de verdad: `docs/analisis/decisiones.md`. Si este roadmap la
> contradice, manda el registro y el roadmap se corrige.

## 1 Roadmap por trimestre

| Epica | Nombre | Prioridad (MoSCoW) | T1 AAAA | T2 AAAA | T3 AAAA | T4 AAAA | Horizonte |
|---|---|---|---|---|---|---|---|
| EP-NN | [nombre] | [Debe / Deberia / Podria / No ahora] | [x o hito] | | | | [Ahora / Siguiente / Despues] |

Hitos:

| Hito | Fecha | Criterio de cumplimiento (observable) | Epicas |
|---|---|---|---|
| H-01 | [AAAA-MM-DD] | [que se puede ver o medir ese dia] | EP-NN |

- **Ahora**: [epicas en construccion o con G4 cerrado]
- **Siguiente**: [epicas en refinamiento]
- **Despues**: [epicas identificadas, sin refinar]

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida | Estado |
|---|---|---|---|---|---|---|
| DEP-01 | [que se necesita y de quien] | [Interna / Externa / Tecnica / Legal] | [EP-NN, FT-NNN] | [rol] | [AAAA-MM-DD] | [Pendiente / Comprometida / Resuelta] |

Una dependencia sin fecha comprometida deja en NO READY (G4) lo que bloquea.

## 3 Riesgos

| ID | Riesgo | Prob. | Impacto | Nivel | Mitigacion / contingencia | Dueño |
|---|---|---|---|---|---|---|
| R-01 | [que puede pasar y que provoca] | [Alta / Media / Baja] | [Alto / Medio / Bajo] | [ALTO / MEDIO / BAJO] | [accion concreta, no "monitorear"] | [rol] |

Matriz de probabilidad por impacto (ubica cada R-NN):

| Prob. \ Impacto | Bajo | Medio | Alto |
|---|---|---|---|
| **Alta** | | | |
| **Media** | | | |
| **Baja** | | | |

Supuestos:
- S-01: [lo que se da por cierto sin haberlo verificado, y quien lo confirma]

Restricciones:
- RES-01: [plazo, presupuesto, normativa o tecnologia impuesta, con su fuente]

## 4 Control de versiones y aprobacion

| Version | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| v0.1 | [AAAA-MM-DD] | [nombre] | Version inicial | |

Aprueba: PO. Solo `estado: approved` en `origin/main` es evidencia.

Generado por IA: [partes] — Revisado por: [nombre, fecha]
