---
id: "HU-ATC-009"
tipo: hu
titulo: "Ver mi casillero de tareas por área y responsable"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-03", "EP-ATC-02", "HU-ATC-007"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-009 — Ver mi casillero de tareas por área y responsable

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-03
- Como colaborador de área quiero ver en una bandeja los tickets de mi área y los míos, ordenados por vencimiento para conocer mi carga pendiente sin duplicar el estado del ticket.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-009 | Debe | 3 h con IA | Dev 2 (Jesús) | 1 | 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-007 (RF-SVC-007 es predecesora de RF-SVC-009, PLT-03) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 de la traza del PLT-03, DT-03)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe ofrecer el casillero por área y responsable como consulta sobre los tickets, sin tabla adicional.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Bandeja
  Dado que abro mi casillero
  Cuando se carga
  Entonces veo los tickets de CurrentAreaID + CurrentOwnerPartyID + estado activo.

Escenario: CA-02 · Filtros
  Dado que filtro por «en riesgo o vencidos»
  Cuando aplico el filtro
  Entonces solo veo los tickets con SLA en riesgo o vencido, resaltados.

Escenario: CA-03 · Sin asignar (agregado por el PO)
  Dado tickets derivados a mi área sin persona
  Cuando abro la bandeja del área
  Entonces aparecen como «sin asignar» para que alguien los tome.
```

## Reglas de negocio

- RN-SVC-006

**Fuera de alcance:** Tablero Kanban configurable.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Bandeja de tickets
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Vista/consulta sobre SVC_TICKET + ASSIGNMENT_LOG
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
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

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
