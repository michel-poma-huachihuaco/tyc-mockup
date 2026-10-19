---
name: aybar-release
description: Release Gate (G8), Post-Release (G9), deployment, rollback, hotfix y severidades. Usar al armar un release plan, planear o ejecutar un despliegue, un rollback, un hotfix, o cerrar la ventana de estabilizacion.
---

# Release y rollback

G8 exige: G6+G7 aprobados, release plan (semver, alcance con IDs), deployment
plan con responsables, rollback PROBADO en Pre-Produccion, backup verificado
con tiempo de restauracion conocido, validacion de negocio firmada por el PO,
ventana y comunicacion acordadas, observabilidad lista, guardia identificada.
Si toca datos: Release Data Gate ademas (aybar-gobierno-datos).

Nadie despliega produccion a mano: pipeline + G8 aprobado, deploy por tag.
Severidades: Sev1 caida/perdida de datos (inmediata 24/7, hotfix o rollback),
Sev2 critica degradada sin workaround (mismo dia), Sev3 con workaround
(proximo sprint), Sev4 cosmetico (backlog).

G9 a las 48-72 h: smoke, sin Sev1/Sev2 atribuibles, SLOs, metrica de negocio
del BRD instrumentada, postmortem con la pregunta del marco (que gate debio
detectarlo), deuda al backlog. Un release se cierra cuando pasa su ventana,
no el dia del deploy. Detalle: `.agents/references/operacion.md`; plantillas
release-plan, postmortem en `.agents/templates/`.
