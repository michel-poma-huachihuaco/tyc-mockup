---
id: "HU-ATC-050"
tipo: hu
titulo: "Ver la consulta 360 del cliente dentro del ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-050-consulta-360-cliente-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero ver en el ticket los lotes, cuotas, correos, tickets previos y documentos del cliente para responder sin salir del ticket.
- Requerimiento origen (RF-SVC-050 — Consulta 360 del cliente en el ticket): El sistema debe mostrar en el ticket un submódulo de consulta del cliente con su detalle: lotes, cuotas y estado de cuenta, correos y mensajes, tickets e interacciones previas y documentos. Feedback presentación · ítem 12 · Proceso: PROC-SVC-019 (Consulta 360 y busqueda del cliente) · Fuente: PLT-04 · HU-ATC-050 · traza RF-SVC-050
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Etapa 1 sin la sección de propuesta comercial; DAEDALUS se agrega en la Etapa 2 (RF-SVC-063)
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 4** (2026-10-20 → 2026-10-20) · Depende de HU: HU-ATC-049 · Dependencias externas: DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)); DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h))
- Observaciones de alcance: Fuera de alcance: Edición de datos de las fuentes.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · consulta del cliente | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · consulta 360 | 6.5 Diagrama entidad-relación · búsqueda y consulta

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Ver la consulta 360 del cliente dentro del ticket

Escenario: CA-01 · Consulta 360
  Dado un ticket con cliente identificado
  Cuando el gestor de tickets abre la pestaña del cliente
  Entonces ve sus lotes, cuotas, correos y tickets previos consultados en línea (sin copiarlos).

Escenario: CA-02 · Sección restringida
  Dado un gestor de tickets sin permiso a estado de cuenta
  Cuando abre la consulta
  Entonces esa sección aparece restringida.

Escenario: CA-03 · Fuente caída (agregado por el PO)
  Dado que Cobranza no responde
  Cuando abro la consulta 360
  Entonces las demás secciones cargan y la de cuotas muestra «no disponible» con hora del intento.
```

- Evidencia / prueba esperada (PLT-04): `Evento consulta360 {secciones} Preguntas abiertas ¿Qué sistemas fuente alimentan cada sección (SIGDA/TAXON, Cobranza, Contratos, correo)? ¿Qué secciones ve cada rol?`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-036 (Busqueda respeta permisos): La busqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen.
- RN-SVC-026 (Cero registros paralelos del dato de cliente): No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoria quincenal debe arrojar cero casos y crear uno es gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Ticket › pestaña Cliente — Mockups: P-11 "Consulta 360 del cliente" (Pestaña Cliente del ticket (consulta 360))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/{id}/consulta-360` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-01 · DEP-08
- Entidades/campos que LEE: SIGDA/TAXON (lotes, cuotas, correos, documentos), SVC_TICKET (historial previo)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
