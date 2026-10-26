---
id: "HU-ATC-021"
tipo: hu
titulo: "Emitir cargo previo y cargo de activación por separado"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-08", "EP-ATC-04", "HU-ATC-020"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-021 — Emitir cargo previo y cargo de activación por separado

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-08
- Como gestor de la Mesa de Casos (SGD) quiero emitir un cargo previo al recibir el caso y un cargo de activación aparte para que el SLA de línea arranque solo cuando el caso queda formalmente activado.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-021 | Debe | 3 h con IA | Dev 2 (Jesús) | 2 | 28-oct-2026 → 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-020 (RF-SVC-020 es predecesora de RF-SVC-021, PLT-03) · Dependencias externas: DEP-03 (plazos de línea de la Mesa SGD; PLT-05); el PLT-03 pone «modelo de datos SGD», que no es una DEP

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe emitir el cargo previo de asignación y un cargo de activación separado; el SLA de línea inicia solo con la activación.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Cargo previo
  Dado un caso recién registrado
  Cuando emito el cargo previo
  Entonces el SLA de línea todavía no inicia.

Escenario: CA-02 · Activación
  Dado un caso con cargo previo
  Cuando emito el cargo de activación
  Entonces el reloj del SLA de línea empieza a correr desde ese instante.

Escenario: CA-03 · Limbo (agregado por el PO)
  Dado un caso con cargo previo sin activar por más de 2 días hábiles
  Cuando corre el control
  Entonces aparece en la lista de casos en limbo.
```

## Reglas de negocio

- RN-SVC-015

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Mesa SGD («Emitir cargo de activación»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Entidad por modelar (R-06)
- Datos de prueba / analítica (PLT-04): Evento caso_activado
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso sensible en la Mesa SGD
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · recepción y activación
- 6.5 Diagrama entidad-relación · casos sensibles (por modelar · R-06)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
