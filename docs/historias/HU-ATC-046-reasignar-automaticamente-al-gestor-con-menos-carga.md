---
id: "HU-ATC-046"
tipo: hu
titulo: "Reasignar automáticamente al gestor con menos carga"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-18", "EP-ATC-09", "HU-ATC-044"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-046 — Reasignar automáticamente al gestor con menos carga

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-18
- Como supervisor ATC quiero que un ticket pase al gestor disponible del mismo área y habilidad con menos carga cuando el responsable está saturado o ausente para evitar incumplimientos por saturación.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-046 | Debería | 4 h con IA | Dev 3 (Michel) | 1 | 23-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** HU-ATC-044 (RF-SVC-044 es predecesora de RF-SVC-046, PLT-03) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 del PLT-03 y del PLT-04, DT-03; gestores, su disponibilidad y el supervisor)

**La necesitan:** HU-ATC-054, HU-ATC-067

**Requerimiento de origen:** El sistema debe reasignar un ticket al gestor de tickets disponible del mismo área y habilidad con menor carga de trabajo cuando el responsable no esta disponible o su carga supera el límite. Feedback presentación · ítem 18

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Balanceo
  Dado un gestor de tickets con carga mayor al límite
  Cuando entra un ticket nuevo
  Entonces se asigna al gestor de tickets disponible con menos tickets activos ponderados y se registra el motivo REASSIGNMENT_CARGA.

Escenario: CA-02 · Exclusiones
  Dado un ticket con rayo, en Eje 3 o con interacción en curso
  Cuando corre el balanceo
  Entonces no se reasigna.

Escenario: CA-03 · Nadie disponible (agregado por el PO)
  Dado que no hay gestores disponibles en el área
  Cuando corre el balanceo
  Entonces el ticket queda en la cola del área y se alerta al supervisor.
```

## Reglas de negocio

- RN-SVC-033 Reasignación por menor carga
- RN-SVC-006 Asignación append-only

**Fuera de alcance:** Gestión de turnos y vacaciones.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Bandeja (supervisor)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG, ENT-SVC-001 SVC_TICKET · DEP-02 · Etapa 1: disponibilidad y carga desde el maestro local
- Datos de prueba / analítica (PLT-04): Evento reasignacion_carga Preguntas abiertas ¿Cómo se mide la carga (n.º de tickets, ponderado por prioridad, tiempo estimado)? ¿Se considera ausencia por vacaciones o turno?
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

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
