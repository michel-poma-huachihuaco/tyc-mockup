---
id: "HU-ATC-058"
tipo: hu
titulo: "Enviar la carta de alerta al responsable del proyecto y su supervisor"
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

Va en `docs/historias/HU-ATC-058-carta-alerta-responsable-proyecto-copia-supervisor.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como responsable de proyecto quiero recibir una carta de alerta de cada caso de resolución de mi proyecto, con copia a mi supervisor para gestionar el caso antes de que se resuelva.
- Requerimiento origen (RF-SVC-058 — Carta de alerta al responsable del proyecto con copia al supervisor): El sistema debe generar y enviar una carta de alerta al responsable del proyecto del lote, con copia a su supervisor, indicando cliente, deuda, estado del caso y fecha prevista de resolución. Feedback 2.ª reunión · ítem 3 · Proceso: PROC-SVC-021 (Resolucion de contrato por 3 meses de no pago) · Fuente: PLT-04 · HU-ATC-058 · traza RF-SVC-058
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 4** (2026-10-27 → 2026-10-27) · Depende de HU: HU-ATC-056 · Dependencias externas: DEP-15 (Maestro de responsables de proyecto y supervisores (fuente única))
- Observaciones de alcance: Fuera de alcance: Firma digital de la carta.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso de resolución por morosidad | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · apertura del caso de resolución | 6.5 Diagrama entidad-relación · caso y alertas de morosidad
- Referencia visual / plantilla en prototipo: Plantilla de carta de alerta

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Enviar la carta de alerta al responsable del proyecto y su supervisor

Escenario: CA-01 · Carta con copia
  Dado un ticket de resolución de contrato
  Cuando se crea
  Entonces se genera la carta de alerta desde la plantilla y se envía al responsable del proyecto con copia a su supervisor.

Escenario: CA-02 · Escalamiento
  Dado una carta enviada
  Cuando el responsable no registra una acción en el plazo definido
  Entonces el caso se escala al supervisor según la matriz de escalamiento.

Escenario: CA-03 · Sin responsable (agregado por el PO)
  Dado un lote cuyo proyecto no tiene responsable registrado
  Cuando se genera la carta
  Entonces se envía al supervisor del área comercial y se alerta para completar el maestro.
```

- Evidencia / prueba esperada (PLT-04): `Evento carta_alerta Preguntas abiertas ¿Quién es el responsable de cada proyecto y su supervisor (fuente maestra)? ¿La carta es un correo formal o un PDF firmado? ¿Qué acción se espera del responsable del proyecto?`

## Reglas de negocio

- RN-SVC-039 (Carta de alerta al responsable del proyecto): Todo caso de resolucion genera una carta de alerta al responsable del proyecto del lote con copia a su supervisor; sin accion en el plazo definido, se escala segun la matriz de escalamiento.
- RN-SVC-035 (Aviso de asignacion con copia al lider): Toda asignacion o reasignacion envia un correo al responsable con copia a su lider, una sola vez por movimiento.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-GOV-004 GOV_DOCUMENT_REPOSITORY · DEP-15
- Entidades/campos que LEE: SVC_TICKET (caso de resolución), maestro de responsables de proyecto
- Entidades/campos que ESCRIBE o modifica: registro de envío de la carta
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
