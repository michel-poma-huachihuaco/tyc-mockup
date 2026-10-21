---
id: "HU-ATC-020"
tipo: hu
titulo: "Registrar un caso sensible con Código Único"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-08", "EP-ATC-04"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-020 — Registrar un caso sensible con Código Único

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-08
- Como gestor de la Mesa de Casos (SGD) quiero registrar cada caso sensible indicando su línea de ingreso y obtener un Código Único para rastrearlo de punta a punta sin importar el canal.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-020 | Debe | 4 h con IA | Dev 2 (Jesús) | 2 | 28-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe registrar todo caso sensible por su línea de origen (5 líneas) con un Código Único Estandarizado.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Código único
  Dado un caso detectado por cualquiera de las 5 líneas
  Cuando lo registro
  Entonces recibe un Código Único que nunca se reutiliza.

Escenario: CA-02 · Reclasificación
  Dado un caso de Legal Atiende (preventivo) que no se resuelve
  Cuando lo reclasifico
  Entonces se re-registra como reclamo formal (línea 2) conservando la trazabilidad del origen.
```

## Reglas de negocio

- RN-SVC-014 cinco líneas de ingreso

**Fuera de alcance:** Digitalización del pendientes de producto en papel.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Mesa de Casos SGD
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Entidad por modelar (R-06)
- Datos de prueba / analítica (PLT-04): Evento caso_sensible_registrado {línea}
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
