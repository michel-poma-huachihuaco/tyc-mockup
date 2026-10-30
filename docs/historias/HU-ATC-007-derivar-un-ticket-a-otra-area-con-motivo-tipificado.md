---
id: "HU-ATC-007"
tipo: hu
titulo: "Derivar un ticket a otra área con motivo tipificado"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-03", "EP-ATC-02"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-007 — Derivar un ticket a otra área con motivo tipificado

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-03
- Como gestor de tickets quiero derivar el ticket a otra área o colaborador indicando el motivo para conservar el rastro completo de quién tuvo el ticket en cada momento.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-007 | Debe | 4 h con IA | Dev 2 (Jesús) | 1 | 21-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 de la traza del PLT-03, DT-03)

**La necesitan:** HU-ATC-008, HU-ATC-009

**Requerimiento de origen:** El sistema debe derivar tickets entre las 6 áreas y colaboradores registrando cada movimiento con motivo en bitácora append-only.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Área sin persona
  Dado que derivo al área de Cobranza sin elegir persona
  Cuando confirmo
  Entonces AssignedToPartyID queda vacío y CurrentAreaID se actualiza.

Escenario: CA-02 · Rastro
  Dado un ticket con varias derivaciones
  Cuando consulto su historial
  Entonces cada fila muestra quién lo tenía antes, a quién pasó y por qué.

Escenario: CA-03 · Motivo obligatorio (agregado por el PO)
  Dado que intento derivar sin motivo
  Cuando confirmo
  Entonces el sistema pide elegir un motivo del catálogo.
```

## Reglas de negocio

- RN-SVC-006 asignación append-only
- RN-SVC-012 DLP

**Fuera de alcance:** Asignación por habilidades (la reasignación por carga es RF-SVC-046).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle › «Derivar / reasignar»
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG, MAE_Área
- Datos de prueba / analítica (PLT-04): Evento ticket_derivado {de_área, a_área, motivo}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · asignación del ticket
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · derivación y reasignación
- 6.5 Diagrama entidad-relación · enrutamiento

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
