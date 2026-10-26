---
id: "HU-ATC-036"
tipo: hu
titulo: "Escalar la garantía a Eje 3 y gestionar la adenda"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-10", "EP-ATC-05", "HU-ATC-026", "HU-ATC-035"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-036 — Escalar la garantía a Eje 3 y gestionar la adenda

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-05 / FT-ATC-10
- Como gestor de Postventa quiero escalar a Legal un reclamo de garantía con conflicto y gestionar la adenda cuando corresponda para no resolver en Postventa lo que es legal y cerrar la reincorporación contractual.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-036 | Debería | 3 h con IA | Dev 1 (Brayan) | 2 | 30-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-026 («reutiliza el gate de FT-ATC-07», que es el CA-02 · Gate de HU-026: notas de la ficha, PLT-04), HU-ATC-035 (RF-SVC-035 es predecesora de RF-SVC-036, PLT-03) · Dependencias externas: DEP-07 (API de Contratos y Activos; PLT-03 y PLT-05)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe escalar a Eje 3 un reclamo de garantía que derive en conflicto legal y permitir gestionar la reincorporación contractual por adenda.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Conflicto
  Dado un reclamo que recibe carta notarial
  Cuando se detecta
  Entonces se deriva a Eje 3 sin intentar resolverlo en Eje 2.

Escenario: CA-02 · Adenda
  Dado un caso de reincorporación contractual tras una devolución
  Cuando se gestiona
  Entonces se resuelve con una adenda registrada en Postventa.
```

## Reglas de negocio

- RN-SVC-021

**Fuera de alcance:** Redacción de la adenda (Legal).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Garantías
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Reutiliza el gate de FT-ATC-07
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
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
