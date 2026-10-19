---
id: "HU-ATC-041"
tipo: hu
titulo: "Priorizar los reclamos con riesgo de denuncia por su exposición"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-16", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-041-prevenir-reclamo-llegue-denuncia.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como coordinador CX quiero ver la exposición económica de cada reclamo con riesgo de denuncia y recibir una alerta antes del plazo para actuar antes de que el caso llegue a denuncia.
- Requerimiento origen (RF-SVC-041 — Prevenir que un reclamo llegue a denuncia): El sistema debe identificar los tickets con riesgo de escalar a denuncia o INDECOPI y calcular su exposición económica (monto reclamado + interés legal referencial del 8 %) para priorizarlos y alertar a Legal. Feedback presentación · ítem 16 · Proceso: PROC-SVC-015 (Integracion con Legal y prevencion de denuncias) · Fuente: PLT-04 · HU-ATC-041 · traza RF-SVC-041
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 4** (2026-10-23 → 2026-10-26) · Dependencias externas: DEP-12 (Herramienta de Legal (responsable: Rosario): API o intercambio para sincronizar casos de Eje 3)
- Observaciones de alcance: Fuera de alcance: Cálculo de costas procesales.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso legal y riesgo de denuncia | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · sincronización con Legal | 6.5 Diagrama entidad-relación · caso legal y exposición

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Priorizar los reclamos con riesgo de denuncia por su exposición

Escenario: CA-01 · Cálculo de exposición
  Dado un reclamo con monto
  Cuando se registra o cambia
  Entonces el sistema calcula la exposición (monto + interés legal al día) y la muestra en el ticket y en la Torre de Control.

Escenario: CA-02 · Alerta a Legal
  Dado un ticket que supera el umbral de riesgo de denuncia
  Cuando se evalúa
  Entonces se marca como prioritario y se alerta a Legal antes del vencimiento del plazo.

Escenario: CA-03 · Sin monto (agregado por el PO)
  Dado un reclamo sin monto registrado
  Cuando se evalúa el riesgo
  Entonces la exposición se muestra como «por estimar» y el caso no se descarta de la priorización.
```

- Evidencia / prueba esperada (PLT-04): `Evento riesgo_denuncia {exposicion} Preguntas abiertas ¿El 8 % es la tasa de interés legal que Legal quiere usar o un referencial? ¿Qué señales definen riesgo de denuncia (reincidencia, monto, palabras, abogado)? ¿Umbral de alerta?`

## Reglas de negocio

- RN-SVC-034 (Exposicion economica por denuncia): Exposicion = monto reclamado + interes legal (tasa referencial 8 % anual, a validar con Legal) desde la fecha del reclamo; los casos con mayor exposicion se priorizan.
- RN-SVC-016 (Clasificacion de riesgo objetiva y recalibrable): El nivel de riesgo de un caso se calcula con una matriz objetiva (nunca por percepcion) y se recalibra si el caso evoluciona con nuevos elementos o vinculacion con otros casos.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Torre de Control (columna «exposición») — Mockups: P-08 "Torre de Control CX" (Operación en vivo; Riesgo de denuncia: exposición económica y alerta a Legal (propuesta))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/riesgo-denuncia` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY · DEP-12
- Entidades/campos que LEE: SVC_TICKET, SVC_COMPLAINT_BOOK_ENTRY (monto reclamado)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.ExposicionEconomica, alerta a Legal
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
