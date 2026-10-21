---
id: "HU-ATC-045"
tipo: hu
titulo: "Marcar un ticket crítico con el rayo de prioridad"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-18", "EP-ATC-09"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-045 — Marcar un ticket crítico con el rayo de prioridad

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-18
- Como supervisor o líder quiero marcar un ticket con el icono de rayo indicando el motivo para que se atienda de inmediato sin cambiar su tipo ni su SLA.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-045 | Debería | 2 h con IA | Dev 3 (Michel) | 1 | 22-oct-2026 → 23-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe permitir marcar un ticket con un icono de rayo que lo sube al tope de la bandeja, registrando quien lo marco y por que. Feedback presentación · ítem 10

## Criterios de aceptación (Gherkin, verificables)

```gherkin
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

## Reglas de negocio

- RN-SVC-031 Prioridad rayo controlada

**Fuera de alcance:** Cambio automático del SLA por el rayo.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Bandeja (icono rayo)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET
- Datos de prueba / analítica (PLT-04): Evento rayo_marcado {motivo} Preguntas abiertas ¿Quiénes pueden marcar el rayo? ¿El rayo cambia el SLA o solo el orden? ¿Hay un límite por bandeja?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket en la bandeja orquestadora
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · asignación por la bandeja
- 6.5 Diagrama entidad-relación · flujos y asignación

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
