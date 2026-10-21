---
id: "ADR-007"
tipo: "adr"
titulo: "ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-07 del PLT-05 v1.3

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Motivo: RN-SVC-032 (la IA asesora y el gestor decide) y RNF-SEC-009 (anonimizar antes de enviar a modelos de IA). El proveedor de IA debe estar aprobado por TI y Seguridad con política de datos personales (DEP-14, por evaluar). Los datos que nunca entran a un prompt están en la skill `aybar-datos-que-no-salen`.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Cada módulo llama al proveedor de IA | Datos personales sin anonimizar y sin registro; imposible auditar qué salió. | — |
| La IA actúa y resuelve sola | Contradice RN-SVC-032: la IA sugiere, el gestor decide. | Que el patrocinador apruebe la propuesta de agente de IA y re-apruebe la regla. |

## Decisión

La IA solo se usa a través de un **servicio de asistencia** que anonimiza antes de enviar y registra cada sugerencia y la decisión del gestor (`SVC_AI_SUGGESTION_LOG`). La IA sugiere; el gestor decide.

## Consecuencias

- Obliga a:
  - Un adaptador al proveedor aprobado (ADR-004) y un anonimizador.
  - Registrar la sugerencia y la decisión del gestor.
  - Que los datos personales y credenciales nunca entren a un prompt ni a datos de prueba.
- Impide:
  - Enviar datos personales sin anonimizar al proveedor.
- Cuesta: Costo del proveedor de IA: por estimar.

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016 del PLT-05) no existe en el v7: propuesta a G3 y a Gobierno de Datos.
- PII: anonimizada antes de salir; clasificación de campos por definir.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-07 del PO. — Revisado por: (pendiente) · Aprueba: TL
