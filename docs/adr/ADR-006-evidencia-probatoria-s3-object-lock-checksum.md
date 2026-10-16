---
id: "ADR-006"
tipo: adr
titulo: "Evidencia probatoria en object storage con bloqueo de escritura y checksum"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-006: Evidencia probatoria en object storage con bloqueo de escritura y checksum

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

`HU-ATC-014` (carta PDF con cargo al consumidor), `HU-ATC-025` (cierre
tipificado con evidencia y custodia legal separada en el "Repositorio Legal
Controlado", `RN-SVC-020`) y `RNF-CUM-007` ("0 documentos_probatorios_sin
checksum") exigen que la evidencia probatoria del Libro de Reclamaciones y
de los casos sensibles no se pueda alterar ni perder.

El DoR PDF (página 2) propone "S3 + Object Lock" de forma concreta, pero
este proyecto **todavía no tiene un ADR de proveedor de nube** — el SDK es
neutral de nube por diseño. Este ADR documenta el patrón (object storage
con bloqueo de escritura + checksum), no amarra el proveedor.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Guardar el binario como BLOB en PostgreSQL | Infla el tamaño de la base transaccional, complica backups/restauración y no da bloqueo de escritura (WORM) nativo | Si el volumen de evidencia fuera mínimo y no hubiera requisito legal de inmutabilidad |
| Object storage sin bloqueo de escritura (borrado/sobrescritura posibles) | No prueba ante INDECOPI que el documento no fue alterado después de generado — incumple el espíritu de `RNF-CUM-007` | Si no hubiera obligación legal de conservar evidencia inalterable |
| Object storage con bloqueo de escritura (WORM/Object Lock) + checksum verificado (elegida) | — | — |

## Decision

Todo documento probatorio (carta del Libro de Reclamaciones, evidencia
multimedia de interacciones, actas de inspección de garantía) se almacena
en un object storage con bloqueo de escritura, y se calcula y verifica un
checksum (SHA-256) al subir y al leer; la base relacional solo guarda la
referencia (ruta/id del objeto y el checksum), nunca el binario. **El
proveedor concreto de object storage queda pendiente de confirmar en G3**,
condicionado al ADR de nube de este proyecto (todavía no existe).

## Consecuencias

- Obliga a: calcular el checksum antes de subir y volver a verificarlo en
  cada lectura con fines probatorios.
- Impide: guardar binarios de evidencia como BLOB en PostgreSQL; sobrescribir
  o borrar un objeto ya subido dentro del período de retención legal.
- Cuesta: almacenamiento con retención — no cuantificable sin decisión de
  proveedor de nube. **Pendiente de confirmar con Arquitectura/TL en G3.**

## Datos (puerta F4 de Gobierno de Datos)

- Entidades nuevas y dueño de dato: campo `Letter` (referencia a objeto) en
  `COMPLAINT_BOOK_ENTRY`, ya nombrado en el modelo del DoR PDF; dueño:
  Legal / ATC según el tipo de documento.
- Linaje: generado dentro de `aybar-atc` (cartas) o subido por el gestor
  (evidencia multimedia de interacciones).
- PII/sensibilidad: puede contener datos personales del reclamante —
  clasificación formal pendiente en el diccionario de datos de F4.
- Reglas de calidad para F10: `documentos_probatorios_sin_checksum = 0`.

Generado por IA: documento completo, a partir de `HU-ATC-014`,
`HU-ATC-025`, `RNF-CUM-007` y el DoR PDF (página 2, modelo de datos) —
Revisado por: [pendiente, nombre y fecha] - Aprueba: TL
