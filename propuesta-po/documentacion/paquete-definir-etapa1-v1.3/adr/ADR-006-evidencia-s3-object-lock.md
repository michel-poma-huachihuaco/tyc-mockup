---
id: "ADR-006"
tipo: "adr"
titulo: "ADR-006: Evidencia probatoria en Azure Blob Storage con inmutabilidad y checksum"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-006: Evidencia probatoria en Azure Blob Storage con inmutabilidad y checksum

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-06 del PLT-05 v1.3, con la decisión DT-07 del Líder Técnico (Jose Jara, 22-oct-2026): Azure Blob Storage con inmutabilidad para la evidencia. Registrada en `analisis/decisiones.md` v0.5.
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
2. **Retención:** **al menos 2 años para el Libro de Reclamaciones**, según la revisión del Líder Técnico; **la confirma Legal** (DEP-05, Gerencia Legal, fecha requerida 26-oct; P-007), que fija también el modo y el plazo definitivos. Mientras Legal no responde, DEV y QA usan la política sin bloquear y producción no se habilita (G8).
3. **Checksum:** SHA-256 calculado al subir y guardado en la fila espejo de `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión); se verifica al leer.
4. **Relación con `GOV_DOCUMENT_REPOSITORY`:** cada documento probatorio tiene su fila espejo allí (clave del objeto, checksum, versión). Es una tabla del fragmento GOVERNANCE del v7, firmada con `IntegrityHash` (libro del v7, hoja «Entidades»): ATC escribe filas en ella como tabla de otro fragmento, con la receta y el formato de hash del v7 (ADR-002, punto 6), según `datos/registro-de-tablas.md` §5. Quién corre su migración, porque nadie la crea todavía, es P-043 (el registro propone a ATC como custodio, §6). Sus columnas de ruta guardan la URL del blob, como acordó PJ-05 para el v7 en Azure (H-06/M8 de PJ-05). La carta de respuesta con cargo va en `CompanyResponseDocumentPath` de `SVC_COMPLAINT_BOOK_ENTRY` (Excel, RF-SVC-014); el Excel pide el mismo espejo para el cargo de la prórroga y la resolución de la apelación (RNF-CUM-007), con columnas por confirmar.
5. **Cliente:** se reemplaza la dependencia del cliente S3 por `com.azure:azure-storage-blob`. La gobierna el `azure-sdk-bom` 1.3.8 que importa el BOM del SDK Aybar 0.7.1, así que se declara **sin `<version>`**, como `azure-identity` para la identidad administrada.
6. **Acceso:** el servicio sube con una identidad administrada o con credencial en Azure Key Vault (ADR-014); nadie más tiene permiso de borrado.

## Consecuencias

- Obliga a:
  - Declarar `azure-storage-blob` y `azure-identity` sin versión (la de S3 no se usa para la evidencia).
  - Activar el versionado y la política de inmutabilidad en el contenedor, y registrar la fila espejo en `GOV_DOCUMENT_REPOSITORY`.
  - Calcular y guardar el checksum al subir y verificarlo al leer.
  - Que Legal confirme el plazo y el modo de retención (P-007).
  - Que el PO actualice ADR-06, RNF-CUM-007 y RNF-AUD-004 (P-027).
- Impide:
  - Borrar o reemplazar un archivo dentro de su plazo de retención.
- Cuesta: **USD 2,07 al mes en producción** (Azure Blob Storage Hot ZRS, 48 GB al cumplirse 24 meses de retención), 0,08 en PRE (UAT), 0,08 en QA y 0,04 en DEV; la política de inmutabilidad no tiene costo propio (`arquitectura/costo-cloud.md` v0.4, §1.1 y §2.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos en P-044). **0 h** adicionales: el cliente de Blob reemplaza al de S3 en las tareas que ya suben evidencia.

## Datos (puerta F4 de Gobierno de Datos)

- Entidad `SVC_COMPLAINT_BOOK_ENTRY`: la carta de respuesta con cargo va en `CompanyResponseDocumentPath` (Excel, RF-SVC-014), con su fila espejo en `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión). El Excel pide el mismo espejo para el cargo de la prórroga y la resolución de la apelación (RNF-CUM-007); sus columnas están por confirmar. Referencias de adjuntos en `SVC_TICKET_INTERACTION`.
- Reglas de calidad (F10, Q-008): objeto sin referencia en base y referencia sin objeto; documentos probatorios sin checksum = 0 (RNF-CUM-007).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con «almacenamiento de objetos» genérico |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-06 del PO (S3) |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Azure Blob Storage con inmutabilidad (DT-07) en lugar de S3; retención mínima de 2 años para el Libro, a confirmar por Legal; relación con `GOV_DOCUMENT_REPOSITORY` |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Cliente de Blob gobernado por el BOM (`azure-sdk-bom` 1.3.8); `GOV_DOCUMENT_REPOSITORY` como tabla firmada de otro fragmento (P-014); qué pasa mientras Legal no confirma la retención; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: lo que ATC escribe en `GOV_DOCUMENT_REPOSITORY` remite al registro de tablas §5 (cierra el «se acuerda» de P-014) y conserva el formato de hash del v7 (ADR-002); costo con PRE (UAT) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
