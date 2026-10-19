---
id: "HU-ATC-056"
tipo: hu
titulo: "Abrir el caso de resolución por 3 meses impagos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-22", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-056-generar-caso-resolucion-contrato-3-meses-impagos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como analista de Cobranza quiero que el sistema abra un caso de resolución de contrato cuando un cliente acumula 3 meses sin pagar para aplicar la cláusula resolutoria a tiempo y con trazabilidad.
- Requerimiento origen (RF-SVC-056 — Generar el caso de resolucion de contrato por 3 meses impagos): El sistema debe generar automáticamente un ticket de resolución de contrato cuando un cliente acumula 3 meses (cuotas) sin pagar, o cuando se registra un reclamo con 3 meses de no pago, y derivarlo al flujo de resolución con Cobranza y Legal. Feedback 2.ª reunión · ítem 1 · Proceso: PROC-SVC-021 (Resolucion de contrato por 3 meses de no pago) · Fuente: PLT-04 · HU-ATC-056 · traza RF-SVC-056
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 4** (2026-10-26 → 2026-10-26) · Depende de HU: HU-ATC-006 · Dependencias externas: DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h))
- Observaciones de alcance: Fuera de alcance: Redacción de la resolución y carta notarial.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso de resolución por morosidad | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · apertura del caso de resolución | 6.5 Diagrama entidad-relación · caso y alertas de morosidad
- Referencia visual / plantilla en prototipo: Prototipo › Casos de resolución

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Abrir el caso de resolución por 3 meses impagos

Escenario: CA-01 · Detección diaria
  Dado un contrato con 3 cuotas vencidas e impagas según Cobranza
  Cuando corre la evaluación diaria
  Entonces se crea un ticket «Resolución de contrato» vinculado al cliente y al lote, y se deriva al flujo de Cobranza y Legal.

Escenario: CA-02 · Regularización
  Dado un cliente que regulariza su deuda antes de la resolución
  Cuando Cobranza registra el pago
  Entonces el ticket se cierra como «Regularizado» y el proceso se detiene.

Escenario: CA-03 · Reclamo abierto (agregado por el PO)
  Dado un cliente con 3 meses impagos y un reclamo abierto en el Libro
  Cuando se evalúa el caso
  Entonces el caso queda en «suspendido por reclamo» hasta responderlo (propuesta del PO, a validar con Legal).
```

- Evidencia / prueba esperada (PLT-04): `Evento caso_resolucion {meses} Preguntas abiertas ¿El disparador son 3 cuotas consecutivas o acumuladas? ¿Se cuenta desde el vencimiento o desde el reclamo? Si el cliente tiene un reclamo abierto en el Libro de Reclamaciones, ¿se suspende la resolución hasta responderlo? ¿El contrato exige carta notarial?`

## Reglas de negocio

- RN-SVC-037 (Causal de resolucion por 3 meses impagos): Se inicia la resolucion cuando el contrato acumula 3 meses (cuotas) vencidos e impagos o cuando un reclamo evidencia 3 meses de no pago; el umbral es parametrizable y la causal se valida con Legal segun la clausula resolutoria del contrato.
- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-SVC-014 SVC_WORKFLOW_DEFINITION · DEP-08
- Entidades/campos que LEE: estado de cuotas (Cobranza), reclamos con evidencia de no pago
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (tipo resolución de contrato)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
