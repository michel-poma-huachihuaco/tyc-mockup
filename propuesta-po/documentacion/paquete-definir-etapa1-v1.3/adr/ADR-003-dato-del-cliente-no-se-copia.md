---
id: "ADR-003"
tipo: "adr"
titulo: "ADR-003: El dato del cliente no se copia: consulta 360 federada en línea, con caché corta y degradación por fuente"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-003: El dato del cliente no se copia: consulta 360 federada en línea, con caché corta y degradación por fuente

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-03 del PLT-05 v1.3
- **Actualizado el 20-oct-2026 al modelo de datos corporativo v7:** el ticket guarda `PartyID`, `CompanyID`, `ContractID` y `UnitID` como claves foráneas; el dato sensible del cliente vive cifrado en `PARTY_SENSITIVE_DATA` (fragmento PARTY). Cuál es la fuente viva del cliente (el modelo corporativo o SIGDA/TAXON) queda por confirmar.
- **Conflicto abierto con el PLT-01 v1.3 (ADR-03 del PO): decide el líder técnico.** El PO fija SIGDA/TAXON como única fuente del cliente, con 0 registros paralelos (RN-SVC-026, RNF-INT-007, DEP-01). Este ADR, adaptado al v7, guarda `PartyID` como clave foránea a `PARTY`: si `PARTY` es una réplica del cliente sería un registro paralelo, y una clave obligatoria impide el ticket del «Interesado» que aún no está en el maestro (HU-051). No se resuelve aquí.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Motivo: RN-SVC-026 (cero registros paralelos del dato de cliente) y HU-050 (consulta 360, prioridad 2). La única fuente del cliente y su KYC es SIGDA/TAXON (DEP-01). Una auditoría quincenal debe dar 0 registros paralelos (RNF-INT-007). Sugerencia del equipo (no es parte de los PLT): que el módulo Clientes reemplace a SIGDA/TAXON detrás del mismo contrato.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Copiar el cliente a una base propia | Crea registros paralelos (RN-SVC-026) y obliga a mantener datos personales fuera de su fuente (Ley 29733). | Que SIGDA/TAXON no pueda responder en el tiempo exigido (p95 ≤ 2 s). |
| Replicar de forma programada | El dato queda desfasado y sigue siendo una copia. | — |
| Consulta en línea sin caché | Una caída o lentitud de la fuente bloquea la atención (HU-051 exige continuar). | Que la caché corta resulte insuficiente. |

## Decisión

ATC guarda **solo los identificadores** del cliente (`PartyID`, `CompanyID`, `ContractID`, `UnitID`, como claves foráneas del v7) y consulta SIGDA/TAXON **en línea**, con **caché corta** y **degradación por fuente**: si una fuente falla, la consulta 360 responde con el resto y el ticket sigue (ticket mínimo y reintento de vinculación, RF-051). MongoDB guarda lo de ATC, no el dato del cliente.

## Consecuencias

- Obliga a:
  - Un adaptador y un simulador de SIGDA/TAXON (ADR-004).
  - Una caché: el SDK no trae Redis (`aybar-redis`, NO IMPLEMENTADO); empezar con caché local por fuente y registrarlo como deuda.
  - Una regla de auditoría que cuente registros paralelos (debe dar 0).
  - Confirmar la fuente viva: el v7 trae `PARTY` y `PARTY_SENSITIVE_DATA` (DAC) y DEP-01 sigue citando SIGDA/TAXON. Si la fuente es `PARTY`, el dato sensible se ve enmascarado según `MAE_FIELD_MASKING_POLICY` y el acceso excepcional pasa por `IDN_SENSITIVE_ACCESS_REQUEST`.
- Impide:
  - Persistir nombre, DNI o contacto del cliente en tablas de ATC.
- Cuesta: Latencia de la consulta en línea; costo cloud: sin impacto propio.

## Datos (puerta F4 de Gobierno de Datos)

- Sin tabla de cliente propia: `SVC_TICKET` guarda las claves (`PartyID`, `CompanyID`, `ContractID`, `UnitID`) y el dato sensible vive en `PARTY_SENSITIVE_DATA` (DAC, fuera de ATC). `SVC_SEARCH_INDEX` (ENT-SVC-017 del PLT-05) no existe en el v7: es una propuesta de vista de lectura con identificadores y metadatos de permisos (ADR-012).
- Linaje: SIGDA/TAXON → consulta en línea → pantalla; no se persiste.
- PII: el dato no se guarda; permisos del origen en cada consulta (RNF-SEC-010).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-03 del PO y línea de conflicto abierto por la clave foránea a PARTY. — Revisado por: (pendiente) · Aprueba: TL
