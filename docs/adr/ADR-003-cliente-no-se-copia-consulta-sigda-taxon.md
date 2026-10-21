---
id: "ADR-003"
tipo: adr
titulo: "El cliente no se copia - se consulta SIGDA/TAXON por API"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-003: El cliente no se copia — se consulta SIGDA/TAXON por API

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

`RN-SVC-026` ("cero registros paralelos del dato de cliente") y
`RNF-INT-007` (misma meta en número: `registros_paralelos_dato_cliente: 0`)
son explícitas. `HU-ATC-050/051/052` (consulta 360, manejo de excepciones,
reutilización del motor de José) y `HU-ATC-049` dependen de `DEP-01`: la API
de SIGDA/TAXON para consulta de cliente y KYC. Esto ya se discutió con el
humano en esta sesión: ningún otro sistema (ni `aybar-atc`) puede mantener
una copia local del maestro de cliente — cada uno es dueño de su propia
base, y el dato de cliente vive en SIGDA/TAXON.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Replicar el maestro de cliente localmente (tabla espejo en `aybar-atc`) | Crea una segunda fuente de verdad; un cambio en SIGDA/TAXON requeriría sincronización y puede desactualizarse — contradice `RN-SVC-026` de forma directa | Si SIGDA/TAXON no puede garantizar la disponibilidad que exige `RNF-REN-007` (p95 ≤ 2 s) |
| Cache de corta duración (TTL) del resultado de consulta | Reduce la dependencia en tiempo real, pero reintroduce el riesgo de mostrar un dato desactualizado (p. ej. estado de cuenta) al gestor en medio de una atención | Si la latencia real medida de SIGDA/TAXON no permite cumplir el p95 sin cache |
| Consulta síncrona en línea por API, sin persistir (elegida) | — | — |

## Decision

`aybar-atc` nunca persiste el maestro de datos del cliente (lotes,
contratos, cuotas, correos); lo consulta en línea contra SIGDA/TAXON vía
`aybar-starter-client` en cada petición que lo necesite (búsqueda, consulta
360).

## Consecuencias

- Obliga a: declarar un puerto `domain.port.out` por cada dato que se
  consulta a SIGDA/TAXON, con su adaptador en
  `adapters.outbound.external`, detrás de un simulador para DEV/QA (ver
  ADR-007).
- Impide: cualquier tabla Postgres/Mongo en `aybar-atc` que duplique campos
  del cliente más allá de un identificador de referencia (`CompanyID`, id de
  cliente).
- Cuesta: la consulta 360 queda acoplada a la disponibilidad de
  SIGDA/TAXON; sin esa API (`DEP-01`, hoy pendiente al 19-oct-2026 según el
  roadmap) la funcionalidad no opera — riesgo ya registrado como `R-02` en
  `docs/roadmap/RMP-001-aybar-atiende.md`.

## Datos

- Entidades nuevas y dueño de dato: ninguna entidad de cliente nueva en
  `aybar-atc` — solo referencias (`CompanyID`, identificador de cliente) en
  `SVC_TICKET`. El dato de cliente en sí es propiedad de SIGDA/TAXON.
- Linaje fuente-destino: SIGDA/TAXON → `aybar-atc` (lectura en línea, sin
  persistencia).
- PII/sensibilidad: todo el dato de cliente es PII (Ley 29733); al no
  copiarse, `aybar-atc` no asume su custodia, pero sí su manejo transitorio
  en memoria durante la petición — debe evitar loguearlo (ver
  `RN-SVC-012` DLP en bitácoras).
- Reglas de calidad para F10: `registros_paralelos_dato_cliente = 0`
  (auditoría periódica).

Generado por IA: documento completo, a partir de `RN-SVC-026`,
`RNF-INT-007` y las HU de consulta 360 — Revisado por: [pendiente, nombre y
fecha] - Aprueba: TL
