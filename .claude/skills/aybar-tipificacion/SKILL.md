---
name: aybar-tipificacion
description: Tipificar un cambio como T1, T2 o T3 y saber que artefactos y aprobaciones exige. Usar al recibir un pedido, bug o deuda, al estimar, o cuando aparezcan T1, T2, T3, intake o ficha de intake.
---

# Tipificacion T1/T2/T3

El tipo lo asignan PO y TL juntos, en la ficha de intake, ANTES de estimar.

- T1 Menor: bug, texto, configuracion, refactor local. Sin UI nueva ni cambio
  de esquema. 1 revisor; sin aprobacion de negocio.
- T2 Funcionalidad: historia, pantalla o endpoint interno nuevo; puede tocar
  esquema. 1 revisor; aprueba el PO.
- T3 Critico: arquitectura, migracion de datos, contrato publico, seguridad o
  cumplimiento, multi-equipo. 2 revisores; aprueban PO + Stakeholder + TL.

Proceso proporcional al riesgo: un cambio de copy no paga el peaje de una
migracion. La tabla completa de artefactos por tipo (y/c/n) esta en
`.agents/references/tipificacion.md`; la ficha, en
`.agents/templates/ficha-intake.md`.
