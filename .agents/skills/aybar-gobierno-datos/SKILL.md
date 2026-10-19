---
name: aybar-gobierno-datos
description: Puertas de Gobierno de Datos en F4, F5, F8, F9 y F10 — CAD-F5, Release Data Gate, rollback de datos, monitoreo post-release. Usar cuando un cambio toca modelo de datos, migraciones, backfill, PII, maestros o borrados.
---

# Gobierno de Datos

Puertas formales solo en F4 (diseño de datos), F5 (CAD-F5 en refinement),
F8 (esquema implementado vs aprobado), F9 (Release Data Gate) y F10
(monitoreo). Estados: Aprobado / Aprobado con observaciones / Rechazado.

Lo que mas muerde:
- CAD-F5: una desviacion mayor regresa la HU a F4; un vacio de definicion ES
  mayor; tres menores abiertas bloquean.
- F9: rollback de aplicacion NO es rollback de datos. El Plan de Rollback de
  Datos tiene ocho secciones obligatorias, se prueba en QA en D-2 y un plan
  no probado se considera inexistente.
- F10: umbral cero en huerfanos, duplicados de maestros y violaciones de
  integridad sobre datos nuevos; lo preexistente es saneamiento aparte.

Plantillas: `.agents/templates/checklist-cad-f5.md`, `ficha-impacto-datos.md`,
`plan-rollback-datos.md`. Manual completo:
`.agents/references/gobierno-datos.md`. Agente: `gobierno-datos`.
