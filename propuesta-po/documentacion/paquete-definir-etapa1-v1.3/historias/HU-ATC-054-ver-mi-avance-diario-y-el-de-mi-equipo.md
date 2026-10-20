---
id: "HU-ATC-054"
tipo: hu
titulo: "Ver mi avance diario y el de mi equipo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-21", "EP-ATC-09"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-054 — Ver mi avance diario y el de mi equipo

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-21
- Como gestor de tickets y su líder quiero ver un tablero con tickets atendidos, pendientes, en riesgo y CSAT del día para seguir la productividad y corregir a tiempo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-054 | Debería | 4 h con IA | Dev 3 (Michel) | 2 | 28-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe mostrar a cada gestor de tickets y a su líder un tablero de avance diario: tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT. Feedback presentación · ítem 13

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Tablero del gestor
  Dado un gestor de tickets en su jornada
  Cuando abre su tablero
  Entonces ve sus tickets atendidos, pendientes, en riesgo y su CSAT del día actualizados.

Escenario: CA-02 · Tablero del líder
  Dado un líder
  Cuando abre el tablero de su equipo
  Entonces ve el avance diario de cada gestor de tickets y puede ir al ticket en riesgo.

Escenario: CA-03 · Privacidad (agregado por el PO)
  Dado un gestor que abre el tablero
  Cuando consulta el avance
  Entonces ve solo el suyo; el del equipo es visible para su líder.
```

## Reglas de negocio

- RN-SVC-025 Cierre end-to-end en 72 horas hábiles

**Fuera de alcance:** Evaluación de desempeño.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Mi día
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVY-001 SVY_SURVEY_RESPONSE · DEP-02 · Etapa 1: líder de cada gestor del maestro local
- Datos de prueba / analítica (PLT-04): Evento tablero_visto Preguntas abiertas ¿Qué metas diarias tiene cada gestor de tickets? ¿El tablero del gestor de tickets es visible para sus pares?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · asignación notificada
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · correo de asignación
- 6.5 Diagrama entidad-relación · notificación y avance

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)
