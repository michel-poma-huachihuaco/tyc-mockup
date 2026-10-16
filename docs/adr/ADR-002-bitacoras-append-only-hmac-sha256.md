---
id: "ADR-002"
tipo: adr
titulo: "Bitácoras append-only con IntegrityHash HMAC-SHA256 y diff en object storage"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256 y diff en object storage

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

Varias historias exigen historial inmutable con valor probatorio:
`HU-ATC-004` (historial de estados), `HU-ATC-005` (interacciones con
evidencia), `HU-ATC-007`/`HU-ATC-008` (bitácora de asignación append-only,
`RN-SVC-006`), y `HU-ATC-025` (cierre tipificado con evidencia y custodia
legal separada). `RNF-AUD-004` fija la meta en números: "0 `hash_mismatch`
en el job de auditoría" sobre cinco bitácoras firmadas. El DoR (PLT-05,
página 2) ya describe el modelo con columnas `IntegrityHash` en
`STATUS_LOG` y `ASSIGNMENT_LOG`.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Confiar solo en permisos de base de datos (sin hash aplicativo) | No prueba integridad ante una alteración directa de la fila por un acceso administrativo o un incidente; no sirve como evidencia ante una fiscalización de INDECOPI | Si se demuestra que el control de acceso a la base de datos por sí solo es aceptable para el riesgo legal de este negocio |
| Un ledger/blockchain dedicado | Sobreingeniería para cinco bitácoras de un solo servicio; añade infraestructura y costo operativo sin beneficio proporcional al riesgo actual | Si el volumen de litigios crece al punto de necesitar verificación independiente por un tercero externo |
| HMAC-SHA256 por fila, append-only, con diff incremental en object storage (elegida) | — | — |

## Decision

Cada bitácora sensible (`STATUS_LOG`, `ASSIGNMENT_LOG`, `INTERACTION` con
evidencia, `COMPLAINT_BOOK_ENTRY`, historial de apelaciones) calcula un
`IntegrityHash` HMAC-SHA256 sobre el contenido de la fila al insertarla,
nunca se actualiza ni se borra (solo `INSERT`), y un job de auditoría
periódico (ver ADR-005, jobs idempotentes) recalcula y compara los hashes
para cumplir `RNF-AUD-004` (0 `hash_mismatch`).

## Consecuencias

- Obliga a: guardar la clave HMAC fuera del código fuente (gestor de
  secretos — ver skill `aybar-secretos`, nunca en YAML); a que cualquier
  "corrección" de una bitácora sea una fila nueva, no una edición.
- Impide: `UPDATE`/`DELETE` físico sobre estas tablas desde la aplicación.
- Cuesta: almacenamiento de object storage para el diff incremental — no
  estimable todavía porque no hay ADR de proveedor de nube (ver ADR-001).
  **Pendiente de confirmar costo con Arquitectura/TL en G3.**

## Datos (puerta F4 de Gobierno de Datos)

- Entidades nuevas y dueño de dato: `STATUS_LOG`, `ASSIGNMENT_LOG` (columna
  `IntegrityHash`) — dueño: Gestión de Tickets (ATC).
- Linaje fuente-destino: se generan dentro de `aybar-atc`, no provienen de
  una fuente externa.
- PII/sensibilidad: pueden contener el nombre del actor (`By`/`PartyID`) —
  dato personal del colaborador, no del cliente; clasificación formal
  pendiente en el diccionario de datos de F4.
- Reglas de calidad que entran a la batería de F10: `hash_mismatch = 0` en
  cada corrida del job de auditoría.

Generado por IA: documento completo, a partir de `RNF-AUD-004`, `RN-SVC-006`
y el modelo del DoR PDF (PLT-05, página 2) — Revisado por: [pendiente,
nombre y fecha] - Aprueba: TL
