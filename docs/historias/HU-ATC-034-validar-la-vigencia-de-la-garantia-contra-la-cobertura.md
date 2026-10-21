---
id: "HU-ATC-034"
tipo: hu
titulo: "Validar la vigencia de la garantía contra la cobertura"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-10", "EP-ATC-05"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-034 — Validar la vigencia de la garantía contra la cobertura

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-05 / FT-ATC-10
- Como gestor de Postventa quiero que el sistema valide la fecha del reclamo contra la cobertura y la entrega para rechazar automáticamente lo que está fuera de cobertura.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-034 | Debería | 2 h con IA | Dev 1 (Brayan) | 2 | 29-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe validar la vigencia contra el periodo de cobertura y la fecha real de entrega, y rechazar automáticamente lo que está fuera de cobertura.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Validación
  Dado un reclamo nuevo
  Cuando se registra
  Entonces se valida su fecha contra el periodo vigente y la fecha real de entrega antes de admitirlo.

Escenario: CA-02 · Fuera de cobertura
  Dado un reclamo fuera del periodo
  Cuando se valida
  Entonces se marca como no procedente por vigencia y se informa al cliente el motivo.
```

## Reglas de negocio

- RN-SVC-027

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Garantías (chip de cobertura)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): MAE_WARRANTY_COVERAGE_PERIOD · DEP-07
- Datos de prueba / analítica (PLT-04): Evento garantía_no_procedente
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · reclamo de garantía
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · registro y validación de garantía
- 6.5 Diagrama entidad-relación · garantía postventa

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
