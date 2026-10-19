---
id: "HU-ATC-042"
tipo: hu
titulo: "Atender la llamada con la ficha del cliente y registrarla en el ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-17", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-042-integrar-plataforma-call-center.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets del call center quiero ver la ficha del cliente al contestar y que la llamada quede registrada en su ticket para atender sin cambiar de sistema ni volver a escribir los datos.
- Requerimiento origen (RF-SVC-042 — Integrar la plataforma del call center): El sistema debe integrarse con la plataforma que usa el equipo de call center para mostrar los datos del cliente al recibir la llamada (screen pop), abrir o ubicar su ticket y registrar la llamada como interacción con su grabación. Feedback presentación · ítem 5 · Proceso: PROC-SVC-016 (Integracion con la plataforma de call center) · Fuente: PLT-04 · HU-ATC-042 · traza RF-SVC-042
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 4** (2026-10-22 → 2026-10-22) · Depende de HU: HU-ATC-053 · Dependencias externas: DEP-11 (Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call)
- Observaciones de alcance: Fuera de alcance: Marcador predictivo; campañas salientes.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · llamada en el call center | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · screen pop y registro de llamada | 6.5 Diagrama entidad-relación · llamada como interacción

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Atender la llamada con la ficha del cliente y registrarla en el ticket

Escenario: CA-01 · Screen pop
  Dado una llamada entrante de un número registrado
  Cuando el gestor de tickets contesta
  Entonces ve la ficha del cliente y sus tickets abiertos en 2 s o menos.

Escenario: CA-02 · Registro de la llamada
  Dado una llamada finalizada
  Cuando se cierra
  Entonces queda registrada como interacción del ticket con duración y enlace a la grabación.

Escenario: CA-03 · Número desconocido (agregado por el PO)
  Dado una llamada de un número no registrado
  Cuando contesto
  Entonces veo la búsqueda del cliente abierta para identificarlo o registrarlo como interesado.
```

- Evidencia / prueba esperada (PLT-04): `Evento llamada_registrada {duracion} Preguntas abiertas ¿Qué plataforma de call center usa hoy el equipo (proveedor y versión)? ¿Expone API o CTI para screen pop y grabaciones?`

## Reglas de negocio

- RN-SVC-005 (Empresa y linea obligatorias): CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Consola (panel de llamada) — Mockups: P-16 "Llamada entrante" (Screen pop sobre la bandeja)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/call-center/screen-pop` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVC-004 SVC_TICKET_INTERACTION, ENT-REF-001 MAE_CHANNEL · DEP-11
- Entidades/campos que LEE: SVC_TICKET, ficha de cliente (SIGDA/TAXON)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_INTERACCION (llamada y grabación)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
