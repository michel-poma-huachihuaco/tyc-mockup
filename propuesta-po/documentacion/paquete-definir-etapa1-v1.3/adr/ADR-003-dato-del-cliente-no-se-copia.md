---
id: "ADR-003"
tipo: "adr"
titulo: "ADR-003: El dato del cliente no se copia: PARTY es la fuente viva, con consulta 360 federada y degradación por fuente"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-004, ADR-006, ADR-009, ADR-012]
tags: [adr, arquitectura, g3]
---

# ADR-003: El dato del cliente no se copia: PARTY es la fuente viva, con consulta 360 federada y degradación por fuente

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: convierte a la plantilla del marco el ADR-03 del PLT-05 v1.3, con la decisión DT-06 del Líder Técnico (Jose Jara, 22-oct-2026): las tablas de ATC van en la base única del v7 con FK físicas y **`PARTY` es la fuente viva del cliente, no una copia**. Registrada en `analisis/decisiones.md` v0.3. Cierra P-010 en lo técnico.
- Cambia lo que fija el PO: el ADR-03 del PO, RN-SVC-026, RNF-INT-007 y DEP-01 dicen «SIGDA/TAXON única fuente, 0 registros paralelos fuera de SIGDA/TAXON». **El PO los reescribe** y dice cómo se relaciona `PARTY` con SIGDA/TAXON (quién sincroniza) (P-021, P-027). Mientras tanto, el adaptador de SIGDA/TAXON sigue en ADR-004.

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

1. **`PARTY` es la fuente viva** (DT-06). ATC guarda **solo los identificadores** del cliente (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) como claves foráneas físicas del v7. No persiste nombre, DNI ni contacto en tablas de ATC.
2. **Interesado que no existe:** se crea su `PARTY` como **no verificada** (R29 de PJ-05, según el Líder Técnico), de modo que la FK siga siendo válida y el ticket se registre (HU-051). Quién escribe esa fila (una API de Control de acceso o ATC en otro fragmento) sigue abierto (P-014, P-031); ATC no debe crear tablas de identidad (C-11).
3. **Consulta 360 federada en línea** para lo que `PARTY` no tiene (contratos, cobranza, documentos), con **caché corta** y **degradación por fuente**: si una fuente falla, la consulta responde con el resto y el ticket sigue (ticket mínimo y reintento de vinculación, RF-051). La relación de `PARTY` con SIGDA/TAXON (DEP-01) la define el PO con Gobierno de Datos (P-021).
4. **Dato sensible:** se ve enmascarado según `MAE_FIELD_MASKING_POLICY` y el acceso excepcional pasa por `IDN_SENSITIVE_ACCESS_REQUEST`.
5. **El almacén de lectura** guarda lo de ATC, no el dato del cliente (ADR-012).
6. **Excepción de la hoja del Libro de Reclamaciones (por validar con Legal).** La hoja de reclamación debe llevar los datos del consumidor que la norma exige; ese contenido vive en el asiento (`SVC_COMPLAINT_BOOK_ENTRY`) y su documento en el almacén de evidencia (ADR-006), no en una tabla de cliente. **El alcance exacto de la excepción lo confirma Legal** (P-007); hasta entonces, el asiento guarda solo referencias y la carta de respuesta en el almacén de evidencia.

## Consecuencias

- Obliga a:
  - Un adaptador y un simulador de SIGDA/TAXON y de las demás fuentes de la consulta 360 (ADR-004).
  - Una caché: el SDK no trae Redis (`aybar-redis`, NO IMPLEMENTADO); empezar con caché local por fuente y registrarlo como deuda.
  - Una regla de auditoría que cuente registros paralelos (debe dar 0), redefinida por el PO sobre `PARTY`.
  - Resolver quién da de alta el `PARTY` del interesado (P-031) y si `PartyID` admite el estado «no verificada» sin cambiar el v7.
- Impide:
  - Persistir nombre, DNI o contacto del cliente en tablas de ATC (salvo la excepción del Libro, cuando Legal la valide).
- Cuesta: latencia de la consulta en línea (objetivo 2 s en p95, HU-050 CA-09); costo cloud sin impacto propio.

## Datos (puerta F4 de Gobierno de Datos)

- Sin tabla de cliente propia: `SVC_TICKET` guarda las claves (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) y el dato sensible vive en `PARTY_SENSITIVE_DATA` (DAC, fuera de ATC). `SVC_SEARCH_INDEX` (ENT-SVC-017 del PLT-05) no existe en el v7: es una propuesta de vista de lectura con identificadores y metadatos de permisos (ADR-012).
- Linaje: `PARTY` y las demás fuentes → consulta en línea → pantalla; no se persiste.
- PII: el dato no se guarda; permisos del origen en cada consulta (RNF-SEC-010, que sí está en el Excel (3), hoja `03_RNF`).
- H-11 del acta F4 (FK a `PARTY` frente al ADR-03 del PO): resuelto en lo técnico por DT-06; falta el PO.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con SIGDA/TAXON como fuente |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto por la FK a `PARTY` |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-06: `PARTY` fuente viva, `PARTY` no verificada para el interesado, excepción de la hoja del Libro por validar con Legal |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
