---
id: "HU-ATC-056"
tipo: hu
titulo: "Abrir el caso de resolución por 3 meses impagos"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-22", "EP-ATC-11"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-056 — Abrir el caso de resolución por 3 meses impagos

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-11 / FT-ATC-22
- Como analista de Cobranza quiero que el sistema abra un caso de resolución de contrato cuando un cliente acumula 3 meses sin pagar para aplicar la cláusula resolutoria a tiempo y con trazabilidad.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-056 | Debe | 4 h con IA | Dev 4 (Daniel) | 2 | 28-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe generar automáticamente un ticket de resolución de contrato cuando un cliente acumula 3 meses (cuotas) sin pagar, o cuando se registra un reclamo con 3 meses de no pago, y derivarlo al flujo de resolución con Cobranza y Legal. Feedback 2.ª reunión · ítem 1

## Criterios de aceptación (Gherkin, verificables)

```gherkin
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

## Reglas de negocio

- RN-SVC-037 Causal de resolución por 3 meses impagos
- RN-SVC-006 Asignación append-only

**Fuera de alcance:** Redacción de la resolución y carta notarial.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Casos de resolución
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-SVC-014 SVC_WORKFLOW_DEFINITION · DEP-08
- Datos de prueba / analítica (PLT-04): Evento caso_resolucion {meses} Preguntas abiertas ¿El disparador son 3 cuotas consecutivas o acumuladas? ¿Se cuenta desde el vencimiento o desde el reclamo? Si el cliente tiene un reclamo abierto en el Libro de Reclamaciones, ¿se suspende la resolución hasta responderlo? ¿El contrato exige carta notarial?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso de resolución por morosidad
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · apertura del caso de resolución
- 6.5 Diagrama entidad-relación · caso y alertas de morosidad

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
