---
id: "FT-ATC-15"
tipo: feature
titulo: "EntregaFest: contención en vivo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-08", "HU-ATC-037", "HU-ATC-038", "HU-ATC-039"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-15 EntregaFest: contención en vivo

**Alcance:** fuera de la Etapa 1 por decisión del equipo del 26-oct-2026 (P-025): alcance flexible R-01 del PO; se retoma en una etapa posterior. Sus historias tienen sus tareas en `roadmap/alcance-diferido.md`; la dependencia FT-09 → FT-15 deja de aplicar en la Etapa 1.

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-15 | EntregaFest: contención en vivo | EP-ATC-08 EntregaFest: contención y derivación en vivo |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Podría | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·6h · 6 h de desarrollo · Dev 1 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 1 (Brayan) | 30-oct-2026 → 2-nov-2026 | — |

## 1 Descripción y valor

Registra la clasificación de riesgo verbal y la secuencia de Frases Ancla, detecta palabras de riesgo muy alto y deriva el caso a la Estación 4 con la etiqueta estándar.

**Beneficio:** Contención ordenada en eventos y cero casos sensibles sin registro.

**Usuarios:** Moderador de evento · Coordinador CX · Especialista Legal Senior

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-037 (flexible) | El sistema debe registrar la clasificación de riesgo de la intervención en vivo y la secuencia de Frases Ancla (4, 5, 6) aplicada. | Podría | PROC-SVC-014 · Moderador de evento | Frase 6 exige registrar el caso | 2 | — | Pend. DoR |
| RF-SVC-038 (flexible) | El sistema debe registrar la derivación inmediata a la Estación 4 de todo caso sensible o imputación penal en vivo. | Podría | PROC-SVC-014 · Moderador de evento | Derivación exigida ante palabra gatillo | 2 | RF-SVC-037 | Pend. DoR |
| RF-SVC-039 (flexible) | El sistema debe registrar todo caso sensible del evento con la etiqueta «Atención especial — derivación a Legal». | Podría | PROC-SVC-014 · Moderador de evento | Etiqueta literal | 2 | RF-SVC-038 | Pend. DoR |

Ruta crítica: RF-SVC-037 → RF-SVC-038 → RF-SVC-039 (6 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-REN-006 | Rendimiento | Post-mortem de EntregaFest dentro de 3 días hábiles | pct_eventos_con_postmortem_a_tiempo: 100% dentro de 3 días hábiles (gate no compensable, Capa 1 del NPS post-evento) | Debería |
| RNF-P (P) | Usabilidad | Registro rápido desde tablet durante el evento | ≤ 3 toques para derivar | Debería |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-028 | Gate: casos sensibles no se debaten en sala. Un caso sensible o una imputación penal en vivo durante un EntregaFest no se debate en sala: se deriva de inmediato a la Estación 4 (Legal) y se registra como 'Atención especial — derivación a Legal' | Negocio · Excel 05_Catalogos |
| RN-SVC-029 | Palabras de riesgo muy alto obligan canalización formal. Las palabras 'estafa', 'fraude', 'abuso' o 'delito' se clasifican como riesgo muy alto (imputación penal) y obligan a canalizar por vias formales; el moderador nunca niega, discute o se muestra incomodo ante ellas | Negocio · Excel 05_Catalogos |
| RN-SVC-030 | Secuencia de contención verbal 4-5-6. Ante insistencia de un propietario se aplica la secuencia Frase 4 (concreción), Frase 5 (invocación de reglas), Frase 6 (compromiso formal y registro del caso), en ese orden, antes de derivar | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-037 | HU-ATC-037 · Iteración 2 · Dev 1 · vie 30-oct → lun 02-nov | EP-ATC-04 gate legal | R-04 |
| RF-SVC-038 | HU-ATC-038 · Iteración 2 · Dev 1 · lun 02-nov | EP-ATC-04 gate legal | R-04 |
| RF-SVC-039 | HU-ATC-039 · Iteración 2 · Dev 1 · lun 02-nov | EP-ATC-04 gate legal | R-04 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Transcripción automática de audio; logística del evento.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿El registro lo hace el moderador o el personal de apoyo? ¿Funciona sin conexión en el recinto? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota de alcance al inicio del cuerpo: P-025 (decisión del equipo del 26-oct-2026, `analisis/decisiones.md` v0.8). La funcionalidad entera (6 h) sale de la Etapa 1. No se cambia texto del PO. — Revisado por: (pendiente)
