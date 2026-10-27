---
id: "ADR-006"
tipo: "adr"
titulo: "ADR-006: Evidencia probatoria en Azure Blob Storage con inmutabilidad y checksum"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.6"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-006: Evidencia probatoria en Azure Blob Storage con inmutabilidad y checksum

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.6 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-06 del PLT-05 v1.3, con la decisión DT-07 del Líder Técnico (Jose Jara, 22-oct-2026): Azure Blob Storage con inmutabilidad para la evidencia. Registrada en `analisis/decisiones.md`, con la retención que fija el equipo (P-007, ED-13).
- Cambia lo que fija el PO: el ADR-06 del PO («Evidencia probatoria en S3 con Object Lock y checksum») y el Excel (RNF-CUM-007, RNF-AUD-004) piden S3. Es una diferencia listada en ED-19 de `analisis/decisiones.md` (P-027); los documentos del PO no se editan.
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

1. **Dos contenedores (decisión del equipo; revisión final del Líder Técnico, O-19).** (a) `evidencia`: la evidencia probatoria (la hoja del Libro, la carta de respuesta con su cargo, la resolución de la apelación, el cierre y los cargos de los casos sensibles, la adenda de garantía y la carta de alerta al proyecto), con su fila espejo en `GOV_DOCUMENT_REPOSITORY`; (b) `adjuntos`: los adjuntos de las interacciones de la consola y de Mi Portal y las fotos de la inspección, que no son probatorios por sí mismos. Un adjunto que pasa a ser prueba de un reclamo o de un caso se copia a `evidencia` con su checksum. Así un adjunto de Mi Portal con datos personales subido por error se puede borrar (Ley 29733), y lo probatorio no.
   **Inmutabilidad de `evidencia` (decisión del equipo, ED-13):** inmutabilidad a nivel de versión, con **versionado activado** en la cuenta, y política de retención por tiempo (WORM) en el contenedor. En **PRE y producción** la política se **bloquea** (no se puede acortar ni quitar; solo alargar); en DEV y QA queda sin bloquear para poder probar. Es el equivalente de Azure al modo «cumplimiento» de S3: una vez bloqueada, nadie la acorta. `adjuntos` no lleva WORM: tiene versionado y borrado temporal.
   **Retención legal (*legal hold*) por versión (O-19):** cuando un reclamo pasa a apelación o a INDECOPI, o un caso de la Mesa SGD sigue abierto, el caso de uso pone una retención legal a las versiones de sus documentos en `evidencia`; se quita cuando el caso se cierra, con la decisión registrada de la Gerencia Legal. Microsoft Learn (`https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview`): la retención legal guarda el dato inmutable «until the legal hold is explicitly cleared», convive con la retención por tiempo y, a nivel de versión, exige versionado. Como sus cambios a nivel de versión no quedan en el registro de auditoría de Azure (misma página), ATC deja cada uno en la bitácora del ticket o del caso.
2. **Retención: 2 años desde el registro** del reclamo o queja (decisión del equipo, P-007, ED-13). Es el mínimo del art. 12 del Reglamento del Libro de Reclamaciones (D.S. 011-2011-PCM, con el texto del D.S. 006-2014-PCM: «conservar como mínimo por el lapso de dos (02) años desde la fecha de presentación de la queja o reclamo» las hojas, la información del sistema de reporte y la constancia de la respuesta y de la ampliación del plazo); el D.S. 058-2017-PCM y el D.S. 101-2022-PCM no cambian ese artículo. Los 2 años valen para toda la evidencia probatoria del contenedor `evidencia` (Libro, apelaciones, casos sensibles, adenda y cartas); lo que debe durar más queda con retención legal (punto 1). Con la Ley 31435 ya no hay «ampliación del plazo» que conservar: el plazo es improrrogable (ED-28). Como la retención se cuenta desde la creación de cada versión, y cada documento se sube en el registro o después, cada uno queda protegido al menos 2 años desde la presentación. La purga al vencer no se construye en la Etapa 1: el primer documento vence en noviembre de 2028.
3. **Checksum:** SHA-256 calculado al subir y guardado en la fila espejo de `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión); se verifica al leer.
4. **Relación con `GOV_DOCUMENT_REPOSITORY`:** cada documento probatorio tiene su fila espejo allí (clave del objeto, checksum, versión). Es una tabla del fragmento GOVERNANCE del v7, firmada con `IntegrityHash` (libro del v7, hoja «Entidades»): ATC escribe filas en ella como tabla de otro fragmento, con la receta y el formato de hash del v7 (ADR-002, punto 6), según `datos/registro-de-tablas.md` §5. Su migración la corre ATC como custodio, tal como está en el v7, porque nadie la crea en la Etapa 1 (decisión del equipo, ED-11; registro de tablas §6). Sus columnas de ruta guardan la URL del blob, como acordó PJ-05 para el v7 en Azure (H-06/M8 de PJ-05). La carta de respuesta con cargo va en `CompanyResponseDocumentPath` de `SVC_COMPLAINT_BOOK_ENTRY` (Excel, RF-SVC-014); el Excel pide el mismo espejo para el cargo de la prórroga (que queda vacío: la prórroga está deshabilitada, ED-28) y la resolución de la apelación (RNF-CUM-007), que van en las columnas `ExtensionChargeDocumentPath` de `SVC_COMPLAINT_BOOK_ENTRY` y `ResolutionDocumentPath` de `SVC_COMPLAINT_APPEAL`, `varchar(2048)` (decisión del equipo, ED-16).
5. **Cliente:** se reemplaza la dependencia del cliente S3 por `com.azure:azure-storage-blob`. La gobierna el `azure-sdk-bom` 1.3.8 que importa el BOM del SDK Aybar 0.7.1, así que se declara **sin `<version>`**, como `azure-identity` para la identidad administrada.
6. **Acceso:** el servicio sube con una identidad administrada o con credencial en Azure Key Vault (ADR-014); nadie más tiene permiso de borrado.

## Consecuencias

- Obliga a:
  - Declarar `azure-storage-blob` y `azure-identity` sin versión (la de S3 no se usa para la evidencia).
  - Activar el versionado y la inmutabilidad a nivel de versión; la política de 2 años en el contenedor `evidencia` (bloqueada en PRE y producción); el contenedor `adjuntos` sin WORM; la retención legal por versión en apelaciones, INDECOPI y casos SGD (punto 1), y registrar la fila espejo en `GOV_DOCUMENT_REPOSITORY`.
  - Calcular y guardar el checksum al subir y verificarlo al leer.
  - Guardar en la hoja los datos del Anexo I del Reglamento (ADR-003, punto 6).
  - Tratar el cambio frente al ADR-06, RNF-CUM-007 y RNF-AUD-004 del PO como diferencia listada en ED-19 (P-027).
- Impide:
  - Borrar o reemplazar un archivo probatorio dentro de su plazo de retención o con retención legal.
- Cuesta: **USD 2,07 al mes en producción** (Azure Blob Storage Hot ZRS, 48 GB al cumplirse los 24 meses de retención), 0,08 en PRE (UAT), 0,08 en QA y 0,04 en DEV; la política de inmutabilidad no tiene costo propio y la retención legal solo suma una transacción de escritura por versión (Microsoft Learn, misma página) (`arquitectura/costo-cloud.md`, §1.1 y §2.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos fijados en ED-12). **0 h** adicionales: el cliente de Blob reemplaza al de S3 en las tareas que ya suben evidencia, y los dos contenedores y la retención legal van en ellas (HU-ATC-005-T04, HU-ATC-014-T02, HU-ATC-016-T03 y HU-ATC-025-T02); lo que exceda es parte del riesgo aceptado de P-025.

## Datos (puerta F4 de Gobierno de Datos)

- Entidad `SVC_COMPLAINT_BOOK_ENTRY`: la carta de respuesta con cargo va en `CompanyResponseDocumentPath` (Excel, RF-SVC-014), con su fila espejo en `GOV_DOCUMENT_REPOSITORY` (ENT-GOV-004: checksum y versión). El Excel pide el mismo espejo para el cargo de la prórroga (`ExtensionChargeDocumentPath`) y la resolución de la apelación (`ResolutionDocumentPath`) (RNF-CUM-007; ED-16). Referencias de adjuntos en `SVC_TICKET_INTERACTION`.
- Reglas de calidad (F10, Q-008): objeto sin referencia en base y referencia sin objeto; documentos probatorios sin checksum = 0 (RNF-CUM-007).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con «almacenamiento de objetos» genérico |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-06 del PO (S3) |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Azure Blob Storage con inmutabilidad (DT-07) en lugar de S3; retención mínima de 2 años para el Libro, a confirmar por Legal; relación con `GOV_DOCUMENT_REPOSITORY` |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Cliente de Blob gobernado por el BOM (`azure-sdk-bom` 1.3.8); `GOV_DOCUMENT_REPOSITORY` como tabla firmada de otro fragmento (P-014); qué pasa mientras Legal no confirma la retención; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: lo que ATC escribe en `GOV_DOCUMENT_REPOSITORY` remite al registro de tablas §5 (cierra el «se acuerda» de P-014) y conserva el formato de hash del v7 (ADR-002); costo con PRE (UAT) |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): retención de 2 años desde el registro con la cita del art. 12 del Reglamento del Libro de Reclamaciones (ED-13); política bloqueada en PRE y producción; sin espera de Legal para habilitar producción (G8 normal); `GOV_DOCUMENT_REPOSITORY` con ATC como custodio (ED-11); columnas del cargo de la prórroga y de la resolución de la apelación (ED-16); diferencia con el PO en ED-19; supuestos del costo en ED-12 |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | Revisión final del Líder Técnico del 26-oct: dos contenedores, `evidencia` con WORM de 2 años y `adjuntos` sin WORM, y retención legal por versión para apelaciones, INDECOPI y casos SGD (O-19); cargo de la prórroga vacío por la Ley 31435 (ED-28). Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión; las filas repetidas del historial se conservan como registro (O-26) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
