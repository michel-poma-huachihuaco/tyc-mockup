---
id: "HU-ATC-060"
tipo: hu
titulo: "Reservar un cupo en el bus del Entrega Fest"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-23", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-060-gestionar-buses-entrega-fest.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como cliente convocado al Entrega Fest quiero reservar mi cupo en un bus indicando acompañantes y punto de embarque para llegar al evento de entrega de mi lote sin coordinar por teléfono.
- Requerimiento origen (RF-SVC-060 — Gestionar los buses del Entrega Fest): El sistema debe permitir que el cliente solicite cupo en los buses del Entrega Fest con un formulario simple que genera un ticket, controla el aforo por bus y horario y envía la confirmación con punto y hora de embarque. Feedback 2.ª reunión · ítem 6 · Proceso: PROC-SVC-022 (Registro por formulario simple: ingreso al proyecto y Entrega Fest) · Fuente: PLT-04 · HU-ATC-060 · traza RF-SVC-060
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 4** (2026-10-28 → 2026-10-28)
- Observaciones de alcance: Fuera de alcance: Contratación y pago del proveedor de buses.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · formulario simple | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · reserva de bus del Entrega Fest | 6.5 Diagrama entidad-relación · formularios y reservas

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Reservar un cupo en el bus del Entrega Fest

Escenario: CA-01 · Reserva con aforo
  Dado un cliente convocado al Entrega Fest
  Cuando completa el formulario con acompañantes y punto de embarque
  Entonces se crea un ticket, se descuenta el cupo del bus y recibe la confirmación por WhatsApp o correo.

Escenario: CA-02 · Lista de espera
  Dado un bus sin cupo
  Cuando el cliente intenta reservar
  Entonces el formulario ofrece otro bus u horario o lo deja en lista de espera.

Escenario: CA-03 · Cancelación (agregado por el PO)
  Dado un cliente con cupo confirmado
  Cuando cancela su reserva
  Entonces el cupo se libera y se asigna al primero de la lista de espera, que recibe la confirmación.
```

- Evidencia / prueba esperada (PLT-04): `Evento reserva_bus {acompanantes} Preguntas abiertas Confirmar el alcance de «Buses entrega fest»: ¿reserva de cupo del cliente, logística de buses con el proveedor o ambas? ¿Cuántos acompañantes se permiten? ¿Se asocia al proyecto y a la fecha de entrega?`

## Reglas de negocio

- RN-SVC-042 (Aforo de buses del Entrega Fest): No se confirma un cupo si el bus y horario no tienen capacidad; una cancelacion libera el cupo y lo asigna a la lista de espera en orden de solicitud.
- RN-SVC-041 (Formulario simple genera ticket): Cada envio de un formulario simple crea un ticket tipificado con numero, canal «Formulario» y responsable segun el flujo; maximo 6 campos obligatorios.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Formulario Entrega Fest
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/formularios/entregafest-bus` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-020 SVC_EVENT_BUS_BOOKING, ENT-SVC-019 SVC_SIMPLE_FORM_DEFINITION, ENT-SVC-001 SVC_TICKET
- Entidades/campos que LEE: aforo disponible por bus y horario
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (tipo reserva de bus), SVC_BUS_SEAT_RESERVATION, lista de espera
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_BUS_SEAT_RESERVATION', el diccionario de F4 lo llama 'SVC_EVENT_BUS_BOOKING' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
