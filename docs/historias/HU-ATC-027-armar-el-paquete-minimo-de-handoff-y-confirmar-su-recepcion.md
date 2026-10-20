---
id: "HU-ATC-027"
tipo: hu
titulo: "Armar el paquete mínimo de handoff y confirmar su recepción"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-07", "EP-ATC-04"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-027 — Armar el paquete mínimo de handoff y confirmar su recepción

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-07
- Como gestor de tickets quiero que al derivar entre ejes se arme el paquete mínimo con sus 6 elementos para que el eje destino confirme la recepción y no quede un vacío de responsabilidad.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-027 | Debe | 4 h con IA | Dev 2 (Jesús) | 1 | 27-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe armar el paquete mínimo de handoff (6 elementos) en toda derivación entre ejes y permitir al eje destino confirmar la recepción.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Paquete completo
  Dado un ticket que se deriva de Eje 2 a Eje 3
  Cuando armo el handoff
  Entonces los 6 elementos (ID, KYC validado, proyecto y lote, pagos y estado de cuenta, atención previa, próximo paso) deben estar completos antes de enviar.

Escenario: CA-02 · Confirmación
  Dado un handoff recibido en Eje 3
  Cuando el Especialista Legal Senior lo recibe
  Entonces confirma la recepción en el mismo ticket.

Escenario: CA-03 · Sin confirmar (agregado por el PO)
  Dado un handoff sin confirmar tras 1 día hábil
  Cuando corre el control
  Entonces se alerta al supervisor del eje destino.
```

## Reglas de negocio

- RN-SVC-022

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle › «Derivar a Eje 3»
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): DEP-01 KYC · DEP-08 Cobranza
- Datos de prueba / analítica (PLT-04): Evento handoff {completo, confirmado}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket con señal de conflicto
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · gate y handoff a Eje 3
- 6.5 Diagrama entidad-relación · conflicto y handoff

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
