---
id: "HU-ATC-008"
tipo: hu
titulo: "Reasignar en bloque los tickets de un colaborador que cesa"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-03", "EP-ATC-02"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-008 — Reasignar en bloque los tickets de un colaborador que cesa

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-03
- Como supervisor ATC quiero reasignar todos los tickets pendientes de un colaborador que rota, renuncia o cesa para continuar la atención sin perder la trazabilidad.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-008 | Debe | 4 h con IA | Dev 2 (Jesús) | 1 | 21-oct-2026 → 22-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe reasignar los tickets pendientes de un colaborador que rota o cesa, sin borrar el rastro anterior.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Cese
  Dado un colaborador con 12 tickets pendientes que cesa
  Cuando reasigno sus tickets a otro responsable
  Entonces cada ticket recibe una fila nueva con motivo REASSIGNMENT_CESE y el nuevo responsable.

Escenario: CA-02 · Reparto
  Dado que elijo varios destinatarios
  Cuando confirmo
  Entonces los tickets se reparten y el resumen muestra cuántos recibió cada uno.

Escenario: CA-03 · Permiso (agregado por el PO)
  Dado que no soy supervisor
  Cuando intento reasignar en bloque
  Entonces la acción no está disponible.
```

## Reglas de negocio

- RN-SVC-006 asignación append-only

**Fuera de alcance:** Detección automática de ceses desde RR. HH. (propuesta futura).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Por diseñar: Bandeja › Acciones masivas
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_TICKET_ASSIGNMENT_LOG · Etapa 1: líderes y gestores del maestro local
- Datos de prueba / analítica (PLT-04): Evento reasignación_masiva {n_tickets, motivo}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · asignación del ticket
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · derivación y reasignación
- 6.5 Diagrama entidad-relación · enrutamiento

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)
