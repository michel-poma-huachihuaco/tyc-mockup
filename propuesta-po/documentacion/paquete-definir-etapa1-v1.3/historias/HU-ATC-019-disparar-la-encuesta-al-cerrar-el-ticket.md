---
id: "HU-ATC-019"
tipo: hu
titulo: "Disparar la encuesta al cerrar el ticket"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-13", "EP-ATC-07", "HU-ATC-029"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-019 — Disparar la encuesta al cerrar el ticket

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-07 / FT-ATC-13
- Como supervisor ATC quiero que al cerrar un ticket se envíe la encuesta y pueda ver CSAT/CES por tipo, área y gestor de tickets para medir la calidad de la atención.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-019 | Debe | 3 h con IA | Dev 3 (Michel) | 2 | 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** HU-ATC-029 (dependencia lógica EP-ATC-02 → EP-ATC-07 del Gantt del PLT-01 y esta es la última HU de EP-ATC-02) · Dependencias externas: DEP-10 (KPI Engine y encuestas; PLT-03, PLT-04 y PLT-05)

**La necesitan:** HU-ATC-030, HU-ATC-066

**Requerimiento de origen:** El sistema debe disparar la encuesta POST_TRANSACTION al cerrar el ticket y permitir medir CSAT/CES por tipo, área y gestor de tickets.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Disparo
  Dado un ticket que pasa a CLOSED
  Cuando se cierra
  Entonces se registra el envío de la encuesta con puntero polimórfico (SubjectEntityName = 'SVC_TICKET').

Escenario: CA-02 · Medición
  Dado respuestas recibidas
  Cuando consulto los resultados
  Entonces veo CSAT/CES por tipo de ticket, área y gestor de tickets.

Escenario: CA-03 · Reapertura (agregado por el PO)
  Dado un ticket con encuesta respondida que se reabre y se vuelve a cerrar
  Cuando se cierra de nuevo
  Entonces se dispara una nueva encuesta asociada al nuevo ciclo.
```

## Reglas de negocio

- RN-SVC-007
- RNF-INT-004

**Fuera de alcance:** Diseño de preguntas.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Torre de Control (CSAT por área)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVY-001 SVY_SURVEY_RESPONSE · DEP-10 KPI Engine
- Datos de prueba / analítica (PLT-04): Evento encuesta_enviada / encuesta_respondida
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · encuesta post-atención
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · disparo de encuesta
- 6.5 Diagrama entidad-relación · encuesta

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
