---
id: "HU-ATC-045"
tipo: hu
titulo: "Marcar un ticket crítico con el rayo de prioridad"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-045-marcar-ticket-rayo-prioridad.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como supervisor o líder quiero marcar un ticket con el icono de rayo indicando el motivo para que se atienda de inmediato sin cambiar su tipo ni su SLA.
- Requerimiento origen (RF-SVC-045 — Marcar un ticket con rayo de prioridad): El sistema debe permitir marcar un ticket con un icono de rayo que lo sube al tope de la bandeja, registrando quien lo marco y por que. Feedback presentación · ítem 10 · Proceso: PROC-SVC-017 (Orquestacion de bandeja y flujos de trabajo por area) · Fuente: PLT-04 · HU-ATC-045 · traza RF-SVC-045
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I1** · Estimación: **2 h** · Asignado: **Dev 3** (2026-10-21 → 2026-10-21) · Depende de HU: HU-ATC-044
- Observaciones de alcance: Fuera de alcance: Cambio automático del SLA por el rayo.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket en la bandeja orquestadora | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asignación por la bandeja | 6.5 Diagrama entidad-relación · flujos y asignación

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Marcar un ticket crítico con el rayo de prioridad

Escenario: CA-01 · Marca con motivo
  Dado un ticket crítico
  Cuando el líder lo marca con rayo e indica el motivo
  Entonces aparece primero en la bandeja con el icono visible y queda en la bitácora.

Escenario: CA-02 · Permiso
  Dado un gestor de tickets sin rol de líder
  Cuando intenta marcar el rayo
  Entonces la acción no esta disponible.

Escenario: CA-03 · Límite del área (agregado por el PO)
  Dado un área con el 10 % de su bandeja ya marcada con rayo
  Cuando intento marcar otro
  Entonces el sistema me avisa que se superó el límite y pide confirmar o desmarcar otro.
```

- Evidencia / prueba esperada (PLT-04): `Evento rayo_marcado {motivo} Preguntas abiertas ¿Quiénes pueden marcar el rayo? ¿El rayo cambia el SLA o solo el orden? ¿Hay un límite por bandeja?`

## Reglas de negocio

- RN-SVC-031 (Prioridad rayo controlada): Solo el supervisor o lider puede marcar un ticket con rayo; queda en bitacora con motivo y no puede superar el 10 % de la bandeja del area (umbral a validar).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Bandeja (icono rayo) — Mockups: P-01 "Bandeja de tickets" (Mi casillero por área y responsable; Bandeja orquestadora con rayo, carga por agente y reasignación en bloque (propuesta))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/rayo` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET
- Entidades/campos que LEE: rol del usuario
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.Rayo, bitácora de marca
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
