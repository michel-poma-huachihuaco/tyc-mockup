---
name: aybar-pruebas-qa
description: Ciclos de validacion QA 0-3 y paquete del QA Gate (G6) — E2E, regresion, adversariales, criterios <=20 y <=10 por ciento con severidad x impacto. Usar al planear o ejecutar pruebas de una HU, preparar UAT o promover a Pre-Produccion.
---

# Ciclos QA

Validacion progresiva; la IA ejecuta la primera pasada, una persona valida:
- Ciclo 0 (IA->QA): performance y security segun riesgo, ANTES de lo
  funcional. Salida <=20% no conforme + matriz severidad x impacto.
- Ciclo 1 (IA->PO): funcional temprana, E2E, negocio, adversarial. <=20%.
- Ciclo 2 (IA+PO+QA): integral — funcional, E2E, API, integracion, regresion,
  revalidacion. <=10%.
- Ciclo 3 (cliente): UAT sobre procesos reales. Aceptado/No aceptado; no
  sustituye lo tecnico.

El porcentaje nunca decide solo: se lee con severidad e impacto de negocio.
G6 exige plan al 100% del alcance, criticos y bloqueantes en cero, mayores
con plan aprobado por el PO, NFR contra numero (p95 en ms), evidencias
enlazadas. Datos de prueba sinteticos siempre. Plantilla:
`.agents/templates/test-plan.md`; modelo completo:
`.agents/references/qa-ciclos.md`.
