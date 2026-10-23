---
id: "ADR-006"
tipo: "adr"
titulo: "ADR-006: Evidencia probatoria en Azure Blob Storage con inmutabilidad y checksum"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-006: Evidencia probatoria en Azure Blob Storage con inmutabilidad y checksum

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: convierte a la plantilla del marco el ADR-06 del PLT-05 v1.3, con la decisión DT-07 del Líder Técnico (Jose Jara, 22-oct-2026): Azure Blob Storage con inmutabilidad para la evidencia. Registrada en `analisis/decisiones.md` v0.3.
- Cambia lo que fija el PO: el ADR-06 del PO («Evidencia probatoria en S3 con Object Lock y checksum») y el Excel (RNF-CUM-007, RNF-AUD-004) piden S3. **El PO actualiza esos textos a Blob Storage con inmutabilidad** (P-027).
- El nombre del archivo conserva «s3-object-lock» para publicarse como versión nueva del mismo documento.

## Contexto

El Libro de Reclamaciones y los casos sensibles generan documentos probatorios (cartas con cargo, adjuntos). El PLT-05 fijaba S3 con Object Lock (DEP-06). El SDK solo puede publicar su auditoría técnica a S3 o MinIO (`aybar-starter-audit`): no es un almacén de evidencia y no tiene destino Azure Blob (ADR-014).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Guardar los archivos en PostgreSQL | No son inmutables, pesan en la base y complican la copia y la reversión. | — |
| Almacenamiento de objetos sin candado | Un archivo se puede sobrescribir o borrar. | Que Legal no exija inmutabilidad. |
| S3 con Object Lock | La nube es Azure (DT-07). | Que el Líder Técnico cambie la nube. |

## Decisión

La evidencia probatoria vive en **Azure Blob Storage con inmutabilidad y checksum** (DT-07); en la base solo quedan la clave del objeto y su hash.

1. **Inmutabilidad:** política de retención por tiempo (WORM) a nivel de versión del objeto, con **versionado activado** en la cuenta. En producción la política se **bloquea** (no se puede acortar ni quitar); en DEV y QA puede quedar sin bloquear para poder probar. El mecanismo de Azure se verifica antes de la primera carga: la equivalencia exacta con «gobernanza» y «cumplimiento» de S3 no es uno a uno.
2. **Retención:** **al menos 2 años para el Libro de Reclamaciones**, según la revisión del Líder Técnico; **la confirma Legal** (DEP-05, P-007), que fija también el modo y el plazo definitivos.
3. **Checksum:** SHA-256 calculado al subir y guardado en la fila espejo de `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión); se verifica al leer.
4. **Relación con `GOV_DOCUMENT_REPOSITORY`:** cada documento probatorio tiene su fila espejo allí (clave del objeto, checksum, versión). La carta de respuesta con cargo va en `CompanyResponseDocumentPath` de `SVC_COMPLAINT_BOOK_ENTRY` (Excel, RF-SVC-014); el Excel pide el mismo espejo para el cargo de la prórroga y la resolución de la apelación (RNF-CUM-007), con columnas por confirmar.
5. **Cliente:** se reemplaza la dependencia del cliente S3 por la del SDK de Azure Storage Blob. Se verifica si el BOM la gobierna; si no, se declara con versión fija.
6. **Acceso:** el servicio sube con una identidad administrada o con credencial en Azure Key Vault (ADR-014); nadie más tiene permiso de borrado.

## Consecuencias

- Obliga a:
  - Declarar la dependencia del cliente de Azure Blob (la de S3 no se usa para la evidencia).
  - Activar el versionado y la política de inmutabilidad en el contenedor, y registrar la fila espejo en `GOV_DOCUMENT_REPOSITORY`.
  - Calcular y guardar el checksum al subir y verificarlo al leer.
  - Que Legal confirme el plazo y el modo de retención (P-007).
  - Que el PO actualice ADR-06, RNF-CUM-007 y RNF-AUD-004 (P-027).
- Impide:
  - Borrar o reemplazar un archivo dentro de su plazo de retención.
- Cuesta: almacenamiento con retención. Costo cloud **sin cifra todavía**: depende del volumen de evidencia y de su retención (ADR-014); horas en P-025.

## Datos (puerta F4 de Gobierno de Datos)

- Entidad `SVC_COMPLAINT_BOOK_ENTRY`: la carta de respuesta con cargo va en `CompanyResponseDocumentPath` (Excel, RF-SVC-014), con su fila espejo en `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión). El Excel pide el mismo espejo para el cargo de la prórroga y la resolución de la apelación (RNF-CUM-007); sus columnas están por confirmar. Referencias de adjuntos en `SVC_TICKET_INTERACTION`.
- Reglas de calidad (F10, Q-008): objeto sin referencia en base y referencia sin objeto; documentos probatorios sin checksum = 0 (RNF-CUM-007).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con «almacenamiento de objetos» genérico |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-06 del PO (S3) |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Azure Blob Storage con inmutabilidad (DT-07) en lugar de S3; retención mínima de 2 años para el Libro, a confirmar por Legal; relación con `GOV_DOCUMENT_REPOSITORY` |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
