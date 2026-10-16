---
id: "GATE-AYB-NNNN-Gn"
tipo: gate
titulo: "Envio de Gn [nombre del gate] - AYB-NNNN"
estado: draft
producto: "[producto]"
version: "0.1"
owner: "[rol de quien envia]"
aprobadores: []
fecha: "AAAA-MM-DD"
relacionados: ["AYB-NNNN"]
tags: [gate, gn, envio]
---

# Envio de gate - Gn - [nombre del gate]

Va en `docs/gates/AYB-NNNN/Gn.md`. Aprueba: [rol del gate]. Bloquea: [que].
El acto formal es el correo; este documento va adjunto. El gate cuenta como
aprobado solo cuando este archivo tiene `estado: approved` en `origin/main`,
por un PR aprobado por el CODEOWNER del rol. Un agente lo deja en `draft` o
`review`; nunca escribe `approved`.

Aprobadores por gate: G0/G1/G4 PO - G2 PO+UX - G3 TL - G5 TL o revisor -
G6 QA - G7 DevOps+TL - G8 TL+PO - G9 TL. T3: PO + Stakeholder + TL.

## 1 Correo de formalizacion

| Campo | Valor |
|---|---|
| De | [rol y nombre de quien envia] |
| Para | [aprobador del gate] (copia: Product Owner) |
| Fecha | [AAAA-MM-DD] |
| Asunto | [Gn] · [ID] · [titulo] · [T1 / T2 / T3] |
| Pedido | [que gate se pide cerrar y que decision se espera] |
| Adjunto | Este documento, con los enlaces de evidencia fijados por commit |

## 2 Identificacion

| Campo | Valor |
|---|---|
| Ticket | AYB-NNNN |
| Tipo | [T1 / T2 / T3] |
| Producto | [producto] |
| Owner de negocio | [nombre] |
| Documento | [1 Definir (G0-G4) / 2 / 3, segun el estandar de envio del marco] |
| Gate | Gn - [nombre] |
| Aprobador | [rol o roles] |
| Que bloquea si falta | [lo que no puede avanzar] |
| Duplicado de item existente | [No / Si: cual] |

## 3 Evidencias

Una fila por criterio del gate (`.agents/references/fases-y-gates.md`). El
enlace apunta a un commit (`ruta@sha`), no a una rama ni a una captura. Solo un
documento `approved` cuenta como evidencia.

| Evidencia | Que debe contener | Enlace (commit) | ¿Cumple? |
|---|---|---|---|
| [criterio del gate] | [contenido minimo] | [docs/...@sha] | [Si / No: motivo] |

Divergencias de los ADR del proyecto con la estrategia corporativa (solo G3;
se informan al TL, no bloquean):
- [ADR-NNN elige X; la estrategia de referencia dice Y; motivo del proyecto]

## 4 Firmas

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| [aprobador del gate] | | | Aprueba / Rechaza |

La IA no cierra gates ni aprueba pull requests. Nadie se auto-aprueba.

Generado por IA: [partes] — Revisado por: [nombre, fecha]
