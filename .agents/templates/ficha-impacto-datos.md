# Ficha de Impacto de Datos - Release Data Gate (F9)

- Release: [vX.Y.Z] - Ticket(s): [AYB-NNNN] - Fecha: [D]
- Firmada por: [responsable tecnico del release]

## Impacto declarado

- Tablas/entidades afectadas: [lista con volumetria estimada]
- Tipo de cambio: [DDL | migracion | backfill | borrado masivo | cambio de
  clave o granularidad | integracion de escritura | solo lectura]
- Datos sensibles/PII tocados: [no | si -> tratamiento aprobado en F4]
- Dependencias aguas abajo: [consumidores]
- Linea base para F10: [conteos/checksums de referencia por entidad]

## Rollback de datos

- Obligatorio: [si | no aplica -> declaracion expresa del motivo, nunca por omision]
- Plan: [enlace a plan-rollback-datos.md]

## Cadencia validada

- [ ] D-3: revision documental contra F4 y CAD-F5 de las HUs
- [ ] D-2: prueba real de rollback en QA (duracion: [medida] vs RTO [comprometido])
- [ ] D-1: backup legible, responsables disponibles, ventana compatible

Acta de Release Data Gate: [Aprobado | Aprobado con observaciones | Rechazado]
Emite: Gobierno de Datos - [fecha]
