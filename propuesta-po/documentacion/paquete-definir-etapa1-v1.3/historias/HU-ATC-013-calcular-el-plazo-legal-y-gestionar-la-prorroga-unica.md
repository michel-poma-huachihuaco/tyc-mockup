---
id: "HU-ATC-013"
tipo: hu
titulo: "Calcular el plazo legal y gestionar la prórroga única"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-05", "EP-ATC-03", "HU-ATC-012"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-013 — Calcular el plazo legal y gestionar la prórroga única

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-03 / FT-ATC-05
- Como responsable legal de reclamos quiero ver el plazo legal de cada reclamo y registrar una única prórroga justificada para responder dentro del plazo y acreditar la prórroga ante una fiscalización.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-013 | Debe | 6 h con IA | Dev 1 (Brayan) | 1 | 26-oct-2026 → 27-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-012 (RF-SVC-012 es predecesora de RF-SVC-013, PLT-03) · Dependencias externas: DEP-04 (calendario MAE_TIME y MAE_HOLIDAY; PLT-04), DEP-05 (validación legal del Libro: asiento, textos y plazos; PLT-03 y PLT-05), DEP-06 (repositorio documental y GLI; PLT-03)

**La necesitan:** HU-ATC-015

> **Nota del equipo (26-oct-2026; ED-28 de `analisis/decisiones.md`). No cambia el texto del PO.** La Ley 31435 (El Peruano, 22-mar-2022) dejó el art. 24.1 del Código de Protección y Defensa del Consumidor en un plazo de respuesta de **15 días hábiles improrrogables**, y el D.S. 101-2022-PCM dejó el art. 6 del Reglamento del Libro de Reclamaciones en 15 días hábiles, sin ampliación. ATC calcula el vencimiento en 15 días hábiles desde el registro, **sin prórroga**: la prórroga única de esta historia (CA-01, CA-03 y CA-04, y RN-SVC-009 «15+15») no se aplica porque la ley vigente no la permite, y queda deshabilitada por el parámetro `atc.libro.prorroga-habilitada=false`. CA-02 sigue valiendo para el vencimiento original: no se reescribe y todo cambio queda como fila nueva. Las horas no cambian (6 h, PLT-04). Es una diferencia con el PO listada en ED-19.

**Requerimiento de origen:** El sistema debe calcular 15 días hábiles desde el registro y gestionar una prórroga única de 15 días con justificación, cargo y canal, bloqueando una segunda.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Requisitos de prórroga
  Dado un reclamo dentro de plazo
  Cuando registro la prórroga
  Entonces el sistema exige justificación, cargo, canal y fecha de comunicación anterior al vencimiento original.

Escenario: CA-02 · Sin reescritura
  Dado un vencimiento ya prorrogado
  Cuando alguien intenta modificarlo
  Entonces se rechaza y cualquier cambio queda como fila nueva en el historial.

Escenario: CA-03 · Segunda prórroga (agregado por el PO)
  Dado un reclamo ya prorrogado
  Cuando intento prorrogar otra vez
  Entonces la acción está bloqueada.

Escenario: CA-04 · Fuera de ventana (agregado por el PO)
  Dado un reclamo con el plazo original vencido
  Cuando intento prorrogar
  Entonces el sistema lo impide porque la prórroga debe comunicarse antes del vencimiento.
```

## Reglas de negocio

- RN-SVC-009 plazo 15+15
- RN-SVC-003 días hábiles

**Fuera de alcance:** Plazos distintos por sector regulado.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Libro › «Prorrogar 15 d»
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_COMPLAINT_BOOK_ENTRY, MAE_TIME · DEP-04
- Datos de prueba / analítica (PLT-04): Evento prorroga_registrada
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · asiento del Libro de Reclamaciones
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · asiento, prórroga y respuesta
- 6.5 Diagrama entidad-relación · Libro de Reclamaciones

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota del equipo debajo del bloque «Responsable / Depende de / La necesitan»: plazo de 15 días hábiles improrrogables (Ley 31435; ED-28); la prórroga queda deshabilitada por parámetro. No cambia el texto del PO. — Revisado por: (pendiente)
