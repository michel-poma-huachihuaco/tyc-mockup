---
id: "FT-ATC-22"
tipo: feature
titulo: "Resolución de contrato por morosidad"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-11", "HU-ATC-056", "HU-ATC-057", "HU-ATC-058"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-22 Resolución de contrato por morosidad

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-22 | Resolución de contrato por morosidad | EP-ATC-11 Resolución por morosidad y formularios simples |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M · 10 h · 10 h de desarrollo · Dev 4 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 4 (Daniel) | 28-oct-2026 → 29-oct-2026 | — |

## 1 Descripción y valor

Crea el caso de resolución cuando un contrato acumula 3 meses impagos, envía en paralelo la alerta de cancelación al cliente y la carta de alerta al responsable del proyecto con copia al supervisor, con constancia de cada envío.

**Beneficio:** Resoluciones oportunas, con aviso previo y evidencia.

**Usuarios:** Cobranza · Legal · Responsable de proyecto · Supervisor · Cliente

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-056 | El sistema debe generar automáticamente un ticket de resolución de contrato cuando un cliente acumula 3 meses (cuotas) sin pagar, o cuando se registra un reclamo con 3 meses de no pago, y derivarlo al flujo de resolución con Cobranza y Legal. | Debe | PROC-SVC-021 · Job batch de ATC · Feedback 2.ª reunión · ítem 1 | Caso creado y derivado a Cobranza y Legal | 4 | — | Pend. DoR |
| RF-SVC-057 | El sistema debe enviar al cliente, en paralelo al proceso de resolución, una alerta de cancelación del servicio (deuda, plazo para regularizar y consecuencias) por correo, WhatsApp y Mi Portal, dejando constancia de envío. | Debe | PROC-SVC-021 · Job batch de ATC · Feedback 2.ª reunión · ítem 2 | Alerta enviada al crearse el caso, con constancia | 3 | RF-SVC-056 | Pend. DoR |
| RF-SVC-058 | El sistema debe generar y enviar una carta de alerta al responsable del proyecto del lote, con copia a su supervisor, indicando cliente, deuda, estado del caso y fecha prevista de resolución. | Debe | PROC-SVC-021 · Responsable de proyecto · Feedback 2.ª reunión · ítem 3 | Carta con copia al supervisor y escalamiento por plazo | 3 | RF-SVC-056 | Pend. DoR |

Ruta crítica: RF-SVC-056 → RF-SVC-057 (7 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-INT-010 | Interoperabilidad | Morosidad actualizada desde Cobranza | horas_desfase_morosidad: ≤ 24 h | Debe |
| RNF-AUD-005 | Auditoría | Constancia de alertas y cartas de resolución | alertas_con_constancia: 100 % | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-037 | Causal de resolución por 3 meses impagos. Se inicia la resolución cuando el contrato acumula 3 meses (cuotas) vencidos e impagos o cuando un reclamo evidencia 3 meses de no pago; el umbral es parametrizable y la causal se valida con Legal según la cláusula resolutoria del contrato | Negocio · Excel 05_Catalogos |
| RN-SVC-038 | Alerta de cancelación en paralelo. La alerta de cancelación del servicio se envía al cliente al crearse el caso, en paralelo y sin esperar el flujo de resolución; una sola vez por caso y con constancia de envío | Negocio · Excel 05_Catalogos |
| RN-SVC-039 | Carta de alerta al responsable del proyecto. Todo caso de resolución genera una carta de alerta al responsable del proyecto del lote con copia a su supervisor; sin acción en el plazo definido, se escala según la matriz de escalamiento | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-056 | HU-ATC-056 · Iteración 2 · Dev 4 · mié 28-oct | DEP-08 Cobranza · DEP-15 responsables de proyecto | R-06 |
| RF-SVC-057 | HU-ATC-057 · Iteración 2 · Dev 4 · mié 28-oct → jue 29-oct | DEP-08 Cobranza · DEP-15 responsables de proyecto | R-06 |
| RF-SVC-058 | HU-ATC-058 · Iteración 2 · Dev 4 · jue 29-oct | DEP-08 Cobranza · DEP-15 responsables de proyecto | R-06 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Redacción legal de la resolución; cobro o refinanciamiento.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿3 cuotas consecutivas o acumuladas? ¿Se suspende la resolución con un reclamo abierto? ¿Qué plazo se da para regularizar? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
