---
id: "HU-ATC-033"
tipo: hu
titulo: "Registrar un reclamo de garantía vinculado a la entrega"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-10", "EP-ATC-05"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-033 — Registrar un reclamo de garantía vinculado a la entrega

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-05 / FT-ATC-10
- Como gestor de Postventa quiero registrar el reclamo de garantía tipificado y vinculado al Acta de Entrega para gestionar la postventa sobre el mismo caso que originó la entrega.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-033 | Debería | 4 h con IA | Dev 1 (Brayan) | 2 | 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-07 (API de Contratos y Activos; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `registrarReclamoGarantia` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** HU-ATC-034, HU-ATC-035

**Requerimiento de origen:** El sistema debe registrar el reclamo de garantía tipificado y vinculado obligatoriamente a un Acta de Entrega existente.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Vínculo obligatorio
  Dado un cliente que reporta un defecto
  Cuando registro el reclamo
  Entonces queda vinculado a un CONTRACT_UNIT_HANDOVER existente; sin entrega no hay reclamo.

Escenario: CA-02 · Catálogo cerrado
  Dado un reclamo registrado
  Cuando lo tipifico
  Entonces el tipo pertenece al catálogo: estructural, impermeabilización, acabados o instalaciones.
```

## Reglas de negocio

- RN-SVC-027

**Fuera de alcance:** Órdenes de trabajo.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Garantías postventa
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): CONTRACT_WARRANTY_CLAIM, CONTRACT_UNIT_HANDOVER · DEP-07
- Datos de prueba / analítica (PLT-04): Evento garantía_registrada {tipo}
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

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
