---
id: "HU-ATC-028"
tipo: hu
titulo: "Registrar la nota de estado emocional sin juicios de valor"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-028-nota-estado-emocional-sin-juicios-valor.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como referente de atención quiero registrar cómo se encuentra el cliente describiendo lo observado para que el siguiente atendedor conozca el contexto sin prejuicios.
- Requerimiento origen (RF-SVC-028 — Nota de estado emocional sin juicios de valor): El sistema debe registrar una nota del estado emocional del cliente ante frustración o conflicto, sin juicios de valor. · Proceso: PROC-SVC-011 (Derivacion obligatoria a Legal ante caso de conflicto (gate Eje 3)) · Fuente: PLT-04 · HU-ATC-028 · traza RF-SVC-028
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **2 h** · Asignado: **Dev 2** (2026-10-26 → 2026-10-26) · Depende de HU: HU-ATC-026
- Observaciones de alcance: Fuera de alcance: Vocería pública.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket con señal de conflicto | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · gate y handoff a Eje 3 | 6.5 Diagrama entidad-relación · conflicto y handoff

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar la nota de estado emocional sin juicios de valor

Escenario: CA-01 · Nota objetiva
  Dado un cliente frustrado
  Cuando registro la nota
  Entonces describe el estado observado sin adjetivos de juicio y queda visible para el siguiente atendedor.

Escenario: CA-02 · Aviso
  Dado un conflicto derivado a Eje 3
  Cuando se deriva
  Entonces se notifica al Director UX y se habilita la coordinación de vocería sin respuesta pública del atendedor.

Escenario: CA-03 · Palabras de juicio (agregado por el PO)
  Dado que escribo «grosero» o «conflictivo»
  Cuando guardo
  Entonces el sistema advierte y pide reformular.
```

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- RN-SVC-023 (Gate: cierre fuera de Mi Portal): Un ticket cerrado fuera de Mi Portal, sin cierre formal en el sistema, es un gate no compensable.
- RN-SVC-024 (Gate: estado emocional con juicios de valor): El estado emocional del cliente en frustracion o conflicto registrado con juicios de valor, o no registrado, es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Detalle (nota de estado emocional) — Mockups: P-03 "Detalle de ticket" (Detalle con estados, interacciones y compromisos SLA; Modal Derivar / reasignar a Eje 3 con paquete mínimo 6/6)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/estado-emocional` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Campo en SVC_TICKET o interacción (por modelar)
- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_NOTA_EMOCIONAL
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
