---
id: "HU-ATC-049"
tipo: hu
titulo: "Buscar al cliente y llamarlo desde su ficha"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-049-buscar-cliente-llamarlo-desde-ficha.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero buscar al cliente por DNI, nombre, código, lote, teléfono o N.º de ticket y llamarlo desde la ficha para ubicarlo en segundos y contactarlo sin marcar a mano.
- Requerimiento origen (RF-SVC-049 — Buscar al cliente y llamarlo desde la ficha): El sistema debe ofrecer un motor de búsqueda de clientes por DNI, nombre, código de cliente, lote, teléfono o N.º de ticket, con opción de llamar a la cuenta desde la ficha. Feedback presentación · ítem 9 · Proceso: PROC-SVC-019 (Consulta 360 y busqueda del cliente) · Fuente: PLT-04 · HU-ATC-049 · traza RF-SVC-049
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 4** (2026-10-19 → 2026-10-19) · Dependencias externas: DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)); DEP-11 (Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call)
- Observaciones de alcance: Fuera de alcance: Edición de datos del cliente.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · consulta del cliente | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · consulta 360 | 6.5 Diagrama entidad-relación · búsqueda y consulta

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Buscar al cliente y llamarlo desde su ficha

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

- Evidencia / prueba esperada (PLT-04): `Evento cliente_buscado {criterio} Preguntas abiertas ¿Qué significa «llamar la cuenta»: llamada telefónica (click-to-call) o consultar la cuenta del cliente? ¿Qué campos de búsqueda son obligatorios?`

## Reglas de negocio

- RN-SVC-026 (Cero registros paralelos del dato de cliente): No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoria quincenal debe arrojar cero casos y crear uno es gate no compensable.
- RN-SVC-036 (Busqueda respeta permisos): La busqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Búsqueda de cliente — Mockups: P-10 "Buscador de clientes" (Resultados de clientes con botón Llamar; Documentos por significado («adenda de cambio de lote»); Cliente no encontrado: registrar como Interesado)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/clientes/buscar` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-017 SVC_SEARCH_INDEX, ENT-SVC-001 SVC_TICKET · DEP-01 · DEP-11
- Entidades/campos que LEE: SIGDA/TAXON (DNI, nombre, código, lote, teléfono), SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura y registro de la llamada)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
