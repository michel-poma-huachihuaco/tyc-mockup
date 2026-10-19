<!-- Renderizado desde datos/marco.json del repositorio aybar-estrategia-tecnica.
     Ese JSON es la fuente; si el marco cambia, esto se regenera, no se edita a mano. -->

# Tipificacion: T1, T2, T3

Todo cambio se tipifica antes de estimarse (regla de cierre 1). El tipo lo asignan PO y TL juntos en la ficha de intake, y decide revisores, aprobaciones y artefactos exigidos.

## T1 — Menor

Bug, ajuste de texto, cambio de configuración, refactor local. Sin UI nueva y sin cambio de esquema.

- Revisores: 1 revisor
- Aprobacion: No requiere aprobación de negocio

## T2 — Funcionalidad

Nueva historia, nueva pantalla o nuevo endpoint interno. Puede tocar el esquema de datos.

- Revisores: 1 revisor
- Aprobacion: Aprueba el PO

## T3 — Crítico

Cambio de arquitectura, migración de datos, contrato público, seguridad o cumplimiento, o impacto multi-equipo.

- Revisores: 2 revisores
- Aprobacion: Aprueban PO + Stakeholder + TL

## Artefactos exigidos por tipo

y = obligatorio - c = condicional (si aplica al cambio) - n = no se exige

| Artefacto | Plantilla | T1 | T2 | T3 |
|---|---|---|---|---|
| Ficha de Intake | T-INTAKE | y | y | y |
| Business Requirement (BRD) | T-BRD | n | c | y |
| Functional Spec | T-SPEC | n | c | y |
| UX: user flow y mockup Figma | Figma + HU | c | c | y |
| Prototipo Figma | Figma | n | c | c |
| Architecture Decision Record | T-ADR | n | c | y |
| Historia de Usuario con DoR | T-HU | y | y | y |
| Sprint Goal y Sprint Backlog | Tablero | y | y | y |
| Pull Request con review y CI | Git | y | y | y |
| Test Plan y evidencias | T-TEST-PLAN | c | y | y |
| Release Plan | T-RELEASE-PLAN | c | y | y |
| Deployment Plan | T-RELEASE-PLAN | c | y | y |
| Migration Plan | T-MIGRATION-PLAN | n | c | y |
| Rollback Plan específico | T-ROLLBACK-PLAN | n | c | y |
| Aprobación de negocio | G8 | n | y | y |
| Postmortem · Lecciones aprendidas | T-POSTMORTEM | c | y | y |
