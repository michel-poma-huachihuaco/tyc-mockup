---
id: "ADR-003"
tipo: "adr"
titulo: "ADR-003: El dato del cliente no se copia: PARTY es la fuente viva, con consulta 360 federada y degradación por fuente"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.6"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-004, ADR-005, ADR-006, ADR-009, ADR-011, ADR-012]
tags: [adr, arquitectura, g3]
---

# ADR-003: El dato del cliente no se copia: PARTY es la fuente viva, con consulta 360 federada y degradación por fuente

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.6 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-03 del PLT-05 v1.3, con la decisión DT-06 del Líder Técnico (Jose Jara, 22-oct-2026): las tablas de ATC van en la base única del v7 con FK físicas y **`PARTY` es la fuente viva del cliente, no una copia**. Registrada en `analisis/decisiones.md` v0.7. Cierra P-010 en lo técnico; el interesado sin `PARTY` y la relación con SIGDA/TAXON los decide el equipo (P-037 y P-027, ED-05).
- Las referencias a Control de acceso (PJ-05: R29, A26, D-119 y ADR-019) se verificaron el 26-oct en la copia sellada de su paquete aprobado (`docs-roles-y-permisos/`).
- Cambia lo que fija el PO: el ADR-03 del PO, RN-SVC-026, RNF-INT-007 y DEP-01 dicen «SIGDA/TAXON única fuente, 0 registros paralelos fuera de SIGDA/TAXON». Es una diferencia listada en ED-19 de `analisis/decisiones.md` (P-027; P-021 quedó cerrada por DT-06); los documentos del PO no se editan. La relación de `PARTY` con SIGDA/TAXON la fija el punto 3 (ED-05).

## Contexto

Motivo: RN-SVC-026 (cero registros paralelos del dato de cliente) y HU-050 (consulta 360, prioridad 2). Una auditoría quincenal debe dar 0 registros paralelos (RNF-INT-007, HU-032). Con DT-06, el cliente vive en `PARTY` de la base única y el dato sensible, cifrado, en `PARTY_SENSITIVE_DATA` (fragmento PARTY, de otro dominio). La FK del ticket a `PARTY` **no es una copia**: es una referencia a la fuente viva.

Sugerencia del equipo (no es parte de los PLT): que el módulo Clientes reemplace a SIGDA/TAXON detrás del mismo contrato.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Copiar el cliente a una base propia de ATC | Crea registros paralelos (RN-SVC-026) y obliga a mantener datos personales fuera de su fuente (Ley 29733). | — |
| Replicar de forma programada | El dato queda desfasado y sigue siendo una copia. | — |
| Consulta en línea sin caché a las demás fuentes | Una caída o lentitud de una fuente bloquea la atención (HU-051 exige continuar). | Que la caché corta resulte insuficiente. |
| FK obligatoria a `PARTY` sin excepción | Impide el ticket de un interesado que aún no existe (HU-051). | — |

## Decisión

1. **`PARTY` es la fuente viva** (DT-06). ATC guarda **solo los identificadores** del cliente (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) como claves foráneas físicas del v7: la FK **no es una copia**, es una referencia a la fuente. No persiste nombre, DNI ni contacto de un cliente vinculado en columnas propias. Tampoco lee las tablas de personas por JOIN: en PJ-05 nadie las lee directamente y el dato llega ya enmascarado desde el dueño del fragmento 3 (D-119 de PJ-05; `PARTY_IDENTIFICATION` es DAC). El nombre y el contacto llegan por la consulta en línea del punto 3 y no se guardan (decisión del equipo, ED-05).
2. **Interesado que no existe en `PARTY` (HU-051).** El Líder Técnico pidió crear su `PARTY` como no verificada (R29). En PJ-05, R29 es el **autorregistro** que hace Control de acceso: crea la `PARTY` no verificada y una cuenta `PROSPECT`. Las únicas vías que escriben `PARTY` en la Etapa 1 son esa, la puerta de carga de Control de acceso (`cargarPersonas`, rol de cliente `PERSON_LOADER`) y la validación del prospecto (ADR-019 de PJ-05, punto 7; A26). **ATC no crea la `PARTY`.** Decisión del equipo (P-037, ED-05), que cumple la intención (el interesado termina con su `PARTY` y la FK del ticket la referencia, sin copia):
   - el ticket se registra **«sin cliente vinculado»**: `SVC_TICKET.PartyID` nulo (HU-051 CA-01; el contrato lo admite);
   - los **datos mínimos** del interesado (tipo y número de documento, nombre, teléfono y correo) van a `SVC_TICKET_PROSPECT`, tabla de ATC 1:1 con el ticket (cambio al v7 del fragmento SERVICE, en el acta F4), clasificada como dato personal (Ley 29733) y visible solo para los roles de atención;
   - la `PARTY` la crea **Control de acceso** cuando la persona se autorregistra (R29) o llega por la carga de personas (D-60);
   - entonces el job de vinculación (ADR-005, cada 5 min) consulta al cliente por el documento con el puerto de la consulta del cliente (punto 3), completa el `PartyID`, deja el cambio en la bitácora (HU-051 CA-02 y CA-03) y **borra en la misma transacción** la fila de datos mínimos. Guardarlos solo hasta la vinculación es lo mínimo que pide el criterio (principio de proporcionalidad).
3. **Consulta 360 federada en línea** para lo que `PARTY` no tiene (contratos, cobranza, documentos), con **caché corta** y **degradación por fuente**: si una fuente falla, la consulta responde con el resto y el ticket sigue (ticket mínimo y reintento de vinculación, RF-051). **Relación de `PARTY` con SIGDA/TAXON (ED-05):** el contrato de la consulta del cliente que define ATC (ADR-004) devuelve, junto con los datos de pantalla, el `PartyID` de la base única; lo implementa el adaptador de la DEP-01 y, mientras no esté, su simulador.
4. **Dato sensible:** llega por la consulta en línea con los permisos del origen (RNF-SEC-010) y, cuando exista, enmascarado desde su dueño según `MAE_FIELD_MASKING_POLICY`, que publica Control de acceso (D-119 de PJ-05, de su Etapa 2); el acceso excepcional pasa por `IDN_SENSITIVE_ACCESS_REQUEST`, también de Control de acceso.
5. **El almacén de lectura** guarda lo de ATC, no el dato del cliente (ADR-012).
6. **Excepción de la hoja del Libro de Reclamaciones (condición del Líder Técnico; decisión del equipo, ED-13).** La hoja de reclamación lleva los datos que pide el **Anexo I del Reglamento del Libro de Reclamaciones** (D.S. 011-2011-PCM; el Anexo I, en el texto del D.S. 101-2022-PCM): datos del consumidor (nombre, documento, domicilio y contacto), del bien contratado y el detalle del reclamo o queja. Ese contenido es la **hoja**, un documento probatorio que vive en el almacén de evidencia con inmutabilidad y checksum (ADR-006), con su fila espejo en `GOV_DOCUMENT_REPOSITORY`; el asiento (`SVC_COMPLAINT_BOOK_ENTRY`) guarda la referencia y el `PartyID`, no los datos en columnas. Se conserva **2 años desde el registro**, el mínimo del art. 12 del Reglamento (texto del D.S. 006-2014-PCM; ADR-006). El «formato del asiento» de la DEP-05 es ese Anexo I: la DEP-05 queda como riesgo con mitigación en el roadmap, no como condición de este ADR.

## Consecuencias

- Obliga a:
  - Un adaptador y un simulador de SIGDA/TAXON (cuyo contrato devuelve el `PartyID`) y de las demás fuentes de la consulta 360 (ADR-004).
  - Una caché: el SDK no trae Redis (`aybar-redis`, NO IMPLEMENTADO); empezar con caché local por fuente y registrarlo como deuda.
  - Una regla de auditoría que cuente registros paralelos (debe dar 0) sobre `PARTY`; las filas de `SVC_TICKET_PROSPECT` no cuentan como registro paralelo porque se borran al vincular (ED-05).
  - La tabla `SVC_TICKET_PROSPECT` y su borrado en el job de vinculación (punto 2; acta F4).
  - La plantilla de la hoja con el Anexo I del Reglamento (punto 6).
- Impide:
  - Persistir nombre, DNI o contacto de un cliente vinculado en columnas de ATC, y crear o escribir `PARTY` desde ATC.
- Cuesta: **0 h fuera del plan**: la caché corta de la consulta 360 va dentro de las horas que el PO estimó para HU-050 (tarea HU-ATC-050-T02; tabla del ADR-012), y `SVC_TICKET_PROSPECT` y su borrado van en HU-051 (tarea HU-ATC-051-T01, con las horas del PLT-04: P-025, decidida por el equipo el 26-oct-2026, no las reestima y lo que exceda es parte de su riesgo aceptado). **USD 0 de nube propio**: la consulta en línea corre en el contenedor del servicio (Azure Container Apps, 197,70 al mes en producción) y no guarda datos (`arquitectura/costo-cloud.md` v0.5, §1.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos fijados en ED-12). Latencia objetivo: 2 s en p95 (HU-050 CA-09).

## Datos (puerta F4 de Gobierno de Datos)

- Sin tabla de cliente propia: `SVC_TICKET` guarda las claves (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) y el dato sensible vive en `PARTY_SENSITIVE_DATA` (DAC, fuera de ATC). Única excepción: `SVC_TICKET_PROSPECT`, con los datos mínimos del interesado sin `PARTY` hasta su vinculación (punto 2; cambio al v7, ED-05). `SVC_SEARCH_INDEX` (ENT-SVC-017 del PLT-05) no existe en el v7 y **no es una tabla**: es una colección del almacén de lectura con identificadores y metadatos de permisos, que escribe el proyector (ADR-012, punto «Búsqueda»). No es un cambio al v7.
- Linaje: `PARTY` y las demás fuentes → consulta en línea → pantalla; no se persiste.
- PII: el dato de un cliente vinculado no se guarda en columnas de ATC; permisos del origen en cada consulta (RNF-SEC-010: está en el Excel `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 31). Excepciones decididas: la hoja del Libro, como documento probatorio (punto 6, ED-13), y los datos mínimos del interesado en `SVC_TICKET_PROSPECT`, que se borran al vincular (punto 2, ED-05). El registro de lo que ATC crea, lee y escribe está en `datos/registro-de-tablas.md` v0.3.
- H-11 del acta F4 (FK a `PARTY` frente al ADR-03 del PO): resuelto por DT-06; la diferencia con el PO está listada en ED-19.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con SIGDA/TAXON como fuente |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto por la FK a `PARTY` |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-06: `PARTY` fuente viva, `PARTY` no verificada para el interesado, excepción de la hoja del Libro por validar con Legal |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Verificado contra PJ-05: ATC no crea la `PARTY` (R29, A26) ni la lee por JOIN (D-119); el interesado queda con vinculación pendiente: su `PARTY` la autorregistra Control de acceso o la crea la vía que defina P-037; excepción de la hoja del Libro como documento probatorio, con Legal (DEP-05); evidencia de RNF-SEC-010; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: qué datos lleva la hoja se cita en la DEP-05 y la retención en P-007; `SVC_SEARCH_INDEX` es una colección del almacén de lectura (ADR-012), no una tabla ni un cambio al v7; fuente del costo en la v0.4 |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): interesado «sin cliente vinculado» con sus datos mínimos en `SVC_TICKET_PROSPECT`, que se borran al vincular cuando Control de acceso crea su `PARTY` (ED-05); la consulta del cliente devuelve el `PartyID` (relación con SIGDA/TAXON); sin JOIN a las tablas de personas; hoja del Libro con el Anexo I del Reglamento y 2 años de retención (ED-13); caché dentro de HU-050; diferencias con el PO en ED-19 |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): `SVC_TICKET_PROSPECT` y su borrado se hacen en HU-ATC-051-T01 con las horas del PLT-04; lo que exceda es parte del riesgo aceptado (la v0.5 lo dejaba pendiente de P-025) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso. — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
