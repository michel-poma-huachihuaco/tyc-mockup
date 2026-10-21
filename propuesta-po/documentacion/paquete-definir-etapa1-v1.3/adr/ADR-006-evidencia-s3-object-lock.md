---
id: "ADR-006"
tipo: "adr"
titulo: "ADR-006: Evidencia probatoria en almacenamiento de objetos con Object Lock y checksum"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-006: Evidencia probatoria en almacenamiento de objetos con Object Lock y checksum

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-06 del PLT-05 v1.3
- **Conflicto abierto con el PLT-01 v1.3 (ADR-06 del PO): decide el líder técnico.** El PO registra «Evidencia probatoria en S3 con Object Lock y checksum» y el Excel pide S3 (RNF-CUM-007, RNF-AUD-004); este ADR habla de «almacenamiento de objetos» y deja el servicio al ADR-014 (nube por decidir).

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

El Libro de Reclamaciones y los casos sensibles generan documentos probatorios (cartas con cargo, adjuntos). El PLT-05 fija S3 con Object Lock (DEP-06). El SDK solo puede publicar su auditoría a S3 o MinIO (`aybar-starter-audit`, con la dependencia `software.amazon.awssdk:s3` opcional): no es un almacén de evidencia.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Guardar los archivos en PostgreSQL | No son inmutables, pesan en la base y complican la copia y la reversión. | — |
| Almacenamiento de objetos sin candado | Un archivo se puede sobrescribir o borrar. | Que Legal no exija inmutabilidad. |

## Decisión

La evidencia probatoria vive en **almacenamiento de objetos con Object Lock y checksum**; en la base solo quedan la clave del objeto y su hash. El modo de retención (gobernanza o cumplimiento) y el plazo los fija Legal (DEP-05).

## Consecuencias

- Obliga a:
  - Declarar la dependencia del cliente S3 (gobernada por el BOM, sin `<version>`).
  - Activar versionado en el bucket (Object Lock lo exige).
  - Calcular y guardar el checksum al subir y verificarlo al leer.
  - Si ADR-014 elige otra nube, usar el equivalente (inmutabilidad en Azure Blob Storage).
- Impide:
  - Borrar o reemplazar un archivo dentro de su plazo de retención.
- Cuesta: Almacenamiento con retención; costo cloud por estimar.

## Datos (puerta F4 de Gobierno de Datos)

- Entidad `SVC_COMPLAINT_BOOK_ENTRY`: la carta de respuesta con cargo va en `CompanyResponseDocumentPath` (Excel, RF-SVC-014), con su fila espejo en `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión). El Excel pide el mismo espejo para el cargo de la prórroga y la resolución de la apelación (RNF-CUM-007); sus columnas están por confirmar. Referencias de adjuntos en `SVC_TICKET_INTERACTION`.
- Reglas de calidad (F10): objeto sin referencia en base y referencia sin objeto; documentos probatorios sin checksum = 0 (RNF-CUM-007).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: línea de conflicto abierto con el ADR-06 del PO (S3) y columnas de la carta del Excel. — Revisado por: (pendiente) · Aprueba: TL
