---
id: "HU-ATC-035"
tipo: hu
titulo: "Registrar la inspección técnica antes de resolver"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-10", "EP-ATC-05", "HU-ATC-033"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-035 — Registrar la inspección técnica antes de resolver

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-05 / FT-ATC-10
- Como gestor de Postventa quiero programar y registrar la inspección con su informe y fotos antes de resolver para aprobar, rechazar o resolver con trazabilidad completa.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-035 | Debería | 3 h con IA | Dev 1 (Brayan) | 2 | 30-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-033 (RF-SVC-033 es predecesora de RF-SVC-035, PLT-03) · Dependencias externas: DEP-07 (API de Contratos y Activos; PLT-03 y PLT-05)

**La necesitan:** HU-ATC-036

**Requerimiento de origen:** El sistema debe registrar la inspección técnica con su evidencia antes de resolver el reclamo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Inspección
  Dado un reclamo en revisión
  Cuando programo la inspección
  Entonces queda la fecha y, luego, el informe y las fotos antes de resolver.

Escenario: CA-02 · Resolución
  Dado un reclamo inspeccionado
  Cuando lo resuelvo
  Entonces pasa a APPROVED, REJECTED o RESOLVED con fecha y descripción.
```

## Reglas de negocio

- (el PLT-04 no indica reglas para esta HU)

**Fuera de alcance:** Costeo de la reparación.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Garantías
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): CONTRACT_WARRANTY_CLAIM
- Datos de prueba / analítica (PLT-04): Evento inspección_registrada
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

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
