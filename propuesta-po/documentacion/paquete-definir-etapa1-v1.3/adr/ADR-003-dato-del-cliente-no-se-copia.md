---
id: "ADR-003"
tipo: "adr"
titulo: "ADR-003: El dato del cliente no se copia: PARTY es la fuente viva, con consulta 360 federada y degradación por fuente"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-004, ADR-005, ADR-006, ADR-009, ADR-011, ADR-012]
tags: [adr, arquitectura, g3]
---

# ADR-003: El dato del cliente no se copia: PARTY es la fuente viva, con consulta 360 federada y degradación por fuente

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.3 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-03 del PLT-05 v1.3, con la decisión DT-06 del Líder Técnico (Jose Jara, 22-oct-2026): las tablas de ATC van en la base única del v7 con FK físicas y **`PARTY` es la fuente viva del cliente, no una copia**. Registrada en `analisis/decisiones.md` v0.5. Cierra P-010 en lo técnico.
- Las referencias a Control de acceso (PJ-05: R29, A26, D-119 y ADR-019) se verificaron el 26-oct en la copia sellada de su paquete aprobado (`docs-roles-y-permisos/`).
- Cambia lo que fija el PO: el ADR-03 del PO, RN-SVC-026, RNF-INT-007 y DEP-01 dicen «SIGDA/TAXON única fuente, 0 registros paralelos fuera de SIGDA/TAXON». **El PO los reescribe** y dice cómo se relaciona `PARTY` con SIGDA/TAXON (quién sincroniza) (P-027; P-021 quedó cerrada por DT-06). Mientras tanto, el adaptador de SIGDA/TAXON sigue en ADR-004.

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

1. **`PARTY` es la fuente viva** (DT-06). ATC guarda **solo los identificadores** del cliente (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) como claves foráneas físicas del v7: la FK **no es una copia**, es una referencia a la fuente. No persiste nombre, DNI ni contacto en columnas propias. Tampoco lee las tablas de personas por JOIN: en PJ-05 nadie las lee directamente y el dato llega ya enmascarado desde el dueño del fragmento 3 (D-119 de PJ-05). Si ATC puede leer `PARTY` por JOIN para mostrar el nombre lo responden el Líder Técnico y Sony Montoya con Gobierno de Datos (P-037); mientras tanto, el nombre y el contacto llegan por la consulta en línea del punto 3.
2. **Interesado que no existe en `PARTY` (HU-051).** El Líder Técnico pidió crear su `PARTY` como no verificada (R29). En PJ-05, R29 es el **autorregistro** que hace Control de acceso: crea la `PARTY` no verificada y una cuenta `PROSPECT`. Las únicas vías que escriben `PARTY` en la Etapa 1 son esa, la puerta de carga de Control de acceso (`cargarPersonas`, rol de cliente `PERSON_LOADER`) y la validación del prospecto (ADR-019 de PJ-05, punto 7; A26). **ATC no crea la `PARTY`.** El diseño que cumple la intención (el interesado termina con su `PARTY` y la FK del ticket la referencia, sin copia) es:
   - el ticket se registra con `PartyID` vacío y vinculación pendiente (HU-051 CA-01; el contrato lo admite);
   - la `PARTY` no verificada la crea **Control de acceso**, cuando el interesado se autorregistra (R29), o la vía que definan el Líder Técnico y Sony Montoya con Gobierno de Datos para quien no se autorregistra, por ejemplo la puerta de carga (**P-037**);
   - cuando la `PARTY` existe, el job de vinculación (ADR-005, cada 5 min) completa la FK y deja el cambio en la bitácora (HU-051 CA-02 y CA-03).
   Mientras P-037 no se responda, el ticket del interesado se registra y se atiende sin `PartyID`; los datos mínimos que da la persona (HU-051 CA-01) no se guardan en columnas de ATC, y si hace falta conservarlos para reintentar la vinculación (CA-02), dónde y por cuánto tiempo lo decide Gobierno de Datos con P-037. Hasta entonces, HU-051 CA-02 y CA-03 quedan bloqueadas en ese punto.
3. **Consulta 360 federada en línea** para lo que `PARTY` no tiene (contratos, cobranza, documentos), con **caché corta** y **degradación por fuente**: si una fuente falla, la consulta responde con el resto y el ticket sigue (ticket mínimo y reintento de vinculación, RF-051). La relación de `PARTY` con SIGDA/TAXON (DEP-01) la define el PO con Gobierno de Datos (P-027).
4. **Dato sensible:** llega enmascarado desde su dueño según `MAE_FIELD_MASKING_POLICY`, que publica Control de acceso (D-119 de PJ-05, que se construye en la Etapa 2), y el acceso excepcional pasa por `IDN_SENSITIVE_ACCESS_REQUEST`, también de Control de acceso.
5. **El almacén de lectura** guarda lo de ATC, no el dato del cliente (ADR-012).
6. **Excepción de la hoja del Libro de Reclamaciones (condición del Líder Técnico; la valida Legal).** La hoja de reclamación debe llevar los datos del consumidor que la norma exige (Ley 29571 y su reglamento del Libro de Reclamaciones): nombre, documento, domicilio y contacto. Ese contenido es la **hoja**, un documento probatorio que vive en el almacén de evidencia con inmutabilidad y checksum (ADR-006), con su fila espejo en `GOV_DOCUMENT_REPOSITORY`; el asiento (`SVC_COMPLAINT_BOOK_ENTRY`) guarda la referencia y el `PartyID`, no los datos en columnas. **La valida Legal** (DEP-05, Gerencia Legal, fecha requerida 26-oct): qué datos lleva la hoja y cuánto se conserva (P-007). Si Legal pide además los datos en columnas del asiento, es un cambio al v7 (P-031).

## Consecuencias

- Obliga a:
  - Un adaptador y un simulador de SIGDA/TAXON y de las demás fuentes de la consulta 360 (ADR-004).
  - Una caché: el SDK no trae Redis (`aybar-redis`, NO IMPLEMENTADO); empezar con caché local por fuente y registrarlo como deuda.
  - Una regla de auditoría que cuente registros paralelos (debe dar 0), redefinida por el PO sobre `PARTY`.
  - Que el Líder Técnico y Sony Montoya, con Gobierno de Datos, definan quién crea la `PARTY` del interesado y qué se hace con sus datos mínimos mientras tanto (P-037).
  - Que Legal valide la excepción de la hoja del Libro (DEP-05).
- Impide:
  - Persistir nombre, DNI o contacto del cliente en columnas de ATC, y crear o escribir `PARTY` desde ATC.
- Cuesta: **4 h** de la caché corta de la consulta 360 (tabla del ADR-012; P-025). **USD 0 de nube propio**: la consulta en línea corre en el contenedor del servicio (Azure Container Apps, 197,70 al mes en producción) y no guarda datos (`arquitectura/costo-cloud.md` v0.3 (API de precios de Azure del 26-oct-2026, USD por mes, región base Brazil South; supuestos de región, volumen y tamaño en P-044), §1.1). Latencia objetivo: 2 s en p95 (HU-050 CA-09).

## Datos (puerta F4 de Gobierno de Datos)

- Sin tabla de cliente propia: `SVC_TICKET` guarda las claves (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) y el dato sensible vive en `PARTY_SENSITIVE_DATA` (DAC, fuera de ATC). `SVC_SEARCH_INDEX` (ENT-SVC-017 del PLT-05) no existe en el v7: es una propuesta de vista de lectura con identificadores y metadatos de permisos (ADR-012).
- Linaje: `PARTY` y las demás fuentes → consulta en línea → pantalla; no se persiste.
- PII: el dato no se guarda en columnas de ATC; permisos del origen en cada consulta (RNF-SEC-010: está en el Excel `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 31). Excepción por validar: la hoja del Libro (Legal, DEP-05). Los datos mínimos del interesado sin `PARTY` siguen P-037. El registro de lo que ATC crea, lee y escribe está en `datos/registro-de-tablas.md`.
- H-11 del acta F4 (FK a `PARTY` frente al ADR-03 del PO): resuelto en lo técnico por DT-06; falta el PO.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con SIGDA/TAXON como fuente |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto por la FK a `PARTY` |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-06: `PARTY` fuente viva, `PARTY` no verificada para el interesado, excepción de la hoja del Libro por validar con Legal |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Verificado contra PJ-05: ATC no crea la `PARTY` (R29, A26) ni la lee por JOIN (D-119); el interesado queda con vinculación pendiente: su `PARTY` la autorregistra Control de acceso o la crea la vía que defina P-037; excepción de la hoja del Libro como documento probatorio, con Legal (DEP-05); evidencia de RNF-SEC-010; costo con número y fuente |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso. — Revisado por: (pendiente) · Aprueba: TL
