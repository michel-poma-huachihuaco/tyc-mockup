---
id: "HU-ATC-060"
tipo: hu
titulo: "Reservar un cupo en el bus del Entrega Fest"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-23", "EP-ATC-11"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-060 — Reservar un cupo en el bus del Entrega Fest

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-11 / FT-ATC-23
- Como cliente convocado al Entrega Fest quiero reservar mi cupo en un bus indicando acompañantes y punto de embarque para llegar al evento de entrega de mi lote sin coordinar por teléfono.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-060 | Debería | 3 h con IA | Dev 4 (Daniel) | 2 | 30-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: ninguna (PLT-03 y PLT-05; el PLT-03 pone «conectividad en proyecto», que no es una DEP)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe permitir que el cliente solicite cupo en los buses del Entrega Fest con un formulario simple que genera un ticket, controla el aforo por bus y horario y envía la confirmación con punto y hora de embarque. Feedback 2.ª reunión · ítem 6

## Criterios de aceptación (Gherkin, verificables)

```gherkin
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

## Reglas de negocio

- RN-SVC-042 Aforo de buses del Entrega Fest
- RN-SVC-041 Formulario simple genera ticket

**Fuera de alcance:** Contratación y pago del proveedor de buses.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Formulario Entrega Fest
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-020 SVC_EVENT_BUS_BOOKING, ENT-SVC-019 SVC_SIMPLE_FORM_DEFINITION, ENT-SVC-001 SVC_TICKET
- Datos de prueba / analítica (PLT-04): Evento reserva_bus {acompanantes} Preguntas abiertas Confirmar el alcance de «Buses entrega fest»: ¿reserva de cupo del cliente, logística de buses con el proveedor o ambas? ¿Cuántos acompañantes se permiten? ¿Se asocia al proyecto y a la fecha de entrega?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · formulario simple
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · reserva de bus del Entrega Fest
- 6.5 Diagrama entidad-relación · formularios y reservas

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
