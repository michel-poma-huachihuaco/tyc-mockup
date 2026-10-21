---
id: "HU-ATC-049"
tipo: hu
titulo: "Buscar al cliente y llamarlo desde su ficha"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-20", "EP-ATC-10"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-049 — Buscar al cliente y llamarlo desde su ficha

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-20
- Como gestor de tickets quiero buscar al cliente por DNI, nombre, código, lote, teléfono o N.º de ticket y llamarlo desde la ficha para ubicarlo en segundos y contactarlo sin marcar a mano.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-049 | Debe | 4 h con IA | Dev 4 (Daniel) | 1 | 21-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe ofrecer un motor de búsqueda de clientes por DNI, nombre, código de cliente, lote, teléfono o N.º de ticket, con opción de llamar a la cuenta desde la ficha. Feedback presentación · ítem 9

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Búsqueda
  Dado un DNI o código de cliente
  Cuando el gestor de tickets busca
  Entonces obtiene el cliente desde SIGDA/TAXON en 2 s o menos con sus tickets y lotes.

Escenario: CA-02 · Llamar desde la ficha
  Dado un cliente encontrado
  Cuando el gestor de tickets pulsa «Llamar»
  Entonces se inicia la llamada por la plataforma de call center y queda como interacción del ticket.

Escenario: CA-03 · Varias coincidencias (agregado por el PO)
  Dado una búsqueda por nombre con varios resultados
  Cuando busco
  Entonces veo la lista con DNI parcial y lote para elegir al cliente correcto.
```

## Reglas de negocio

- RN-SVC-026 Cero registros paralelos del dato de cliente
- RN-SVC-036 Búsqueda respeta permisos

**Fuera de alcance:** Edición de datos del cliente.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Búsqueda de cliente
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-017 SVC_SEARCH_INDEX, ENT-SVC-001 SVC_TICKET · DEP-01 · DEP-11
- Datos de prueba / analítica (PLT-04): Evento cliente_buscado {criterio} Preguntas abiertas ¿Qué significa «llamar la cuenta»: llamada telefónica (click-to-call) o consultar la cuenta del cliente? ¿Qué campos de búsqueda son obligatorios?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · consulta del cliente
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · consulta 360
- 6.5 Diagrama entidad-relación · búsqueda y consulta

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
