---
id: "HU-ATC-055"
tipo: hu
titulo: "Recibir un correo al asignarme un ticket, con copia a mi líder"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-21", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-055-alertar-correo-asignacion-copia-lider.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets quiero recibir un correo cada vez que me asignan o reasignan un ticket, con copia a mi líder para que ninguna asignación pase desapercibida.
- Requerimiento origen (RF-SVC-055 — Alertar por correo la asignacion con copia al lider): El sistema debe enviar una alerta por correo al gestor de tickets cada vez que se le asigna o reasigna un ticket, con copia a su líder, indicando N.º, tipo, prioridad y vencimiento de SLA. Feedback presentación · ítem 15 · Proceso: PROC-SVC-020 (Productividad y notificaciones del agente) · Fuente: PLT-04 · HU-ATC-055 · traza RF-SVC-055
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Etapa 1 con maestro local de gestores y líderes; se conecta a NEXUS en la Etapa 2 (RF-SVC-062)
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **2 h** · Asignado: **Dev 3** (2026-10-23 → 2026-10-23) · Dependencias externas: DEP-02 (NEXUS (tercero): identidad de colaboradores, SSO y roles)
- Observaciones de alcance: Fuera de alcance: Notificaciones por WhatsApp interno.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asignación notificada | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · correo de asignación | 6.5 Diagrama entidad-relación · notificación y avance
- Referencia visual / plantilla en prototipo: Plantilla de correo de asignación [P-15 "Correo de asignación"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Recibir un correo al asignarme un ticket, con copia a mi líder

Escenario: CA-01 · Correo de asignación
  Dado un ticket asignado a un gestor de tickets
  Cuando se guarda la asignación
  Entonces el gestor de tickets recibe un correo en 1 min o menos con copia a su líder.

Escenario: CA-02 · Reasignación masiva
  Dado una reasignación masiva
  Cuando se ejecuta
  Entonces cada gestor de tickets recibe un solo correo con el resumen de sus tickets.

Escenario: CA-03 · Sin líder (agregado por el PO)
  Dado un gestor sin líder registrado en NEXUS
  Cuando se le asigna un ticket
  Entonces el correo sale solo al gestor y se alerta al administrador para completar el dato.
```

- Evidencia / prueba esperada (PLT-04): `Evento correo_asignacion Preguntas abiertas ¿El correo incluye datos del cliente o solo el enlace al ticket (por DLP)? ¿Quién es el líder de cada gestor de tickets (fuente NEXUS)?`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-035 (Aviso de asignacion con copia al lider): Toda asignacion o reasignacion envia un correo al responsable con copia a su lider, una sola vez por movimiento.
- RN-SVC-012 (DLP en bitacoras): Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG · DEP-02
- Entidades/campos que LEE: SVC_TICKET_ASIGNACION, líder del gestor (NEXUS)
- Entidades/campos que ESCRIBE o modifica: registro de envío de correo de asignación
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
