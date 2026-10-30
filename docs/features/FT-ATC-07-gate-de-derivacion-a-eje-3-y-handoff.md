---
id: "FT-ATC-07"
tipo: feature
titulo: "Gate de derivación a Eje 3 y handoff"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-04", "HU-ATC-026", "HU-ATC-027", "HU-ATC-028"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-07 Gate de derivación a Eje 3 y handoff

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-07 | Gate de derivación a Eje 3 y handoff | EP-ATC-04 Gate legal Eje 3 y Mesa de Casos sensibles |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M·9h · 9 h de desarrollo · Dev 2 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 2 (Jesús) | 27-oct-2026 → 28-oct-2026 | — |

## 1 Descripción y valor

Impide que un ticket con señal de conflicto se resuelva en Eje 1/2, exige el paquete mínimo de handoff con confirmación de recepción de Legal y registra el estado emocional del cliente sin juicios de valor.

**Beneficio:** Los conflictos llegan a Legal completos y a tiempo; baja la exposición legal y reputacional.

**Usuarios:** Gestor de tickets · Gestor de Postventa · Especialista Legal Senior · Director UX

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-026 | El sistema debe impedir que un ticket con señal de conflicto permanezca o se resuelva en Eje 1 o Eje 2 y exigir su derivación a Eje 3. | Debe | PROC-SVC-011 · Gestor de tickets | Cierre rechazado en Eje 1/2 | 3 | — | Pend. DoR |
| RF-SVC-027 | El sistema debe armar el paquete mínimo de handoff (6 elementos) en toda derivación entre ejes y permitir al eje destino confirmar la recepción. | Debe | PROC-SVC-011 · Gestor de tickets | 6/6 elementos antes de enviar | 4 | RF-SVC-026 | Pend. DoR |
| RF-SVC-028 | El sistema debe registrar una nota del estado emocional del cliente ante frustración o conflicto, sin juicios de valor. | Debe | PROC-SVC-011 · Gestor de tickets | Nota sin adjetivos de juicio | 2 | RF-SVC-026 | Pend. DoR |

Ruta crítica: RF-SVC-026 → RF-SVC-027 (7 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | Debe |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-021 | Gate: un caso de conflicto no se resuelve en Eje 1/2. Un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 (Legal); es un gate no compensable | Negocio · Excel 05_Catalogos |
| RN-SVC-022 | Gate: derivación sin paquete mínimo. Una derivación entre ejes sin criterio objetivo, sin paquete mínimo completo o sin trazabilidad es un gate no compensable | Negocio · Excel 05_Catalogos |
| RN-SVC-024 | Gate: estado emocional con juicios de valor. El estado emocional del cliente en frustración o conflicto registrado con juicios de valor, o no registrado, es un gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-026 | HU-ATC-026 · Iteración 1 · Dev 2 · mar 27-oct | DEP-01 SIGDA/TAXON · DEP-08 Cobranza | R-05 |
| RF-SVC-027 | HU-ATC-027 · Iteración 1 · Dev 2 · mar 27-oct | DEP-01 SIGDA/TAXON · DEP-08 Cobranza | R-05 |
| RF-SVC-028 | HU-ATC-028 · Iteración 2 · Dev 2 · mié 28-oct | DEP-01 SIGDA/TAXON · DEP-08 Cobranza | R-05 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Respuesta pública o vocería (solo aviso al Director UX y coordinación con SCIMCPI).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué rol puede retirar una señal de conflicto marcada por error? ¿El historial de pagos se adjunta o solo se enlaza? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
