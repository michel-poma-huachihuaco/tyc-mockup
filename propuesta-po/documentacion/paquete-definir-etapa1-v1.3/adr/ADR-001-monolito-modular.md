---
id: "ADR-001"
tipo: "adr"
titulo: "ADR-001: Monolito modular por capacidad en Java con Spring Boot"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-001: Monolito modular por capacidad en Java con Spring Boot

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-01 del PLT-05 v1.3
- Revisa el ADR-01 del PLT-05 v1.3 («Monolito modular por capacidad (NestJS) sobre la infraestructura vigente»): cambia el lenguaje, no la forma. **Actualizado el 20-oct-2026 al modelo de datos corporativo v7:** ya no hay un esquema por módulo; los módulos son dueños de tablas `SVC_` y `MAE_` del fragmento SERVICE dentro de una sola instancia PostgreSQL.
- **Conflicto abierto con el PLT-01 v1.3 (ADR-01 del PO): decide el líder técnico.** El PO registra «Monolito modular por capacidad (NestJS) sobre la infraestructura vigente» y propone NestJS, React con TypeScript y una sola PostgreSQL Multi-AZ con índice de búsqueda (PLT-01 §1; PLT-05 §4.1 y §4.4). Este ADR conserva la forma (monolito modular) y cambia el lenguaje a Java con Spring Boot (ADR-012). Sigue en propuesta.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Aybar Atiende (plataforma ATC) se construye en 10 días hábiles (21-oct al 3-nov-2026) con 4 desarrolladores y 243 de 252 horas comprometidas (96 %; el Dev 4 al 98 %). Son 62 historias, 11 épicas y 14 dependencias, varias sin API comprometida. Hay exigencias de plazo legal en días hábiles, de la Ley 29733 y de evidencia que no se puede editar.

El PLT-05 propuso un monolito modular en NestJS. El líder técnico definió el stack: Java con Spring Boot (ADR-012), que coincide con el SDK Aybar 0.7.1 y con el repositorio `aybar-ATC` ya generado, una aplicación hexagonal de un solo servicio.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| A · Monolito simple, sin fronteras | Es lo más barato hoy, pero separar después cuesta mucho: hay que desenredar datos y código. | Un producto de vida corta que no va a crecer. |
| C · Microservicios desde el día 1 | No hay holgura: pipelines, contratos y operación por servicio no caben en 252 h, y el SDK no trae outbox para garantizar los eventos entre servicios (ADR-013). | Un motivo medido: carga distinta, ritmo de cambio distinto, aislar fallas o un equipo propio por módulo. |
| NestJS (propuesta del PLT-05) | El líder técnico definió Java con Spring Boot. En NestJS habría que construir seguridad, logs con correlationId, auditoría de datos personales, mensajería y cliente HTTP corporativo. | Que el equipo no pueda trabajar con el SDK. |

## Decisión

Aybar Atiende se construye como **un monolito modular por capacidad**: un solo despliegue, en Java con Spring Boot sobre el SDK Aybar, con un módulo por capacidad:

`tickets`, `sla`, `libro`, `casos_legales`, `postventa`, `portal`, `calidad`, `bandeja`, `consulta360`, `morosidad`, más `integraciones` (un adaptador y un simulador por externo, ADR-004) e `identidad` (roles locales, ADR-009).

Reglas de frontera:
1. Cada módulo es dueño de las tablas del fragmento SERVICE del modelo corporativo v7 que le tocan, en una sola instancia PostgreSQL y sin esquema por módulo (los nombres llevan el prefijo del v7, `SVC_` o `MAE_`): `tickets` → `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET_INTERACTION` y los catálogos `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY` y `MAE_AREA`; `sla` → `MAE_SLA_POLICY` y `SVC_SLA_BREACH_ALERT`; `libro` → `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL` y sus bitácoras de estado. De las tablas de otros fragmentos (`PARTY`, `ORG_COMPANY`, `CONTRACT`, `MAE_CHANNEL`…) ATC solo guarda referencias; quién las escribe y cómo se accede a ellas está **por confirmar**.
2. Un módulo no usa el interior de otro: solo su API pública o sus eventos.
3. Solo el módulo `integraciones` habla con los sistemas externos.
4. Un módulo se puede extraer después a un servicio aparte sin reescribirlo; el orden probable es Mi Portal e integraciones, luego IA y trabajos pesados, y al final el núcleo.

La estructura interna sigue la plantilla hexagonal del servicio (`domain`, `application`, `adapters`, `infrastructure`, `boot`); los módulos de negocio son paquetes dentro de esas capas.

## Consecuencias

- Obliga a:
  - **Sumar reglas ArchUnit de frontera entre módulos.** La plantilla (`NormaHexagonalTest`) solo verifica capas: dominio sin tecnología, dominio solo con el SDK seguro y casos de uso sin adaptadores. No vigila los límites entre módulos.
  - Migraciones Flyway que solo agregan (el v7 prohíbe renombrar o eliminar columnas: se marcan DEPRECADO), agrupadas por módulo, y eventos para lo que cruza módulos. **Por confirmar:** si las tablas `SVC_` ya existen en la instancia corporativa o las crea ATC.
- Impide:
  - Consultas directas a tablas de otro módulo.
  - Transacciones de negocio repartidas en varios despliegues.
- Cuesta: Impacto en costo cloud **por estimar** (un solo despliegue, dos bases de datos, bus de eventos y almacenamiento de objetos). Lo da el TL / DevOps con número y fuente (`docs/arquitectura/costo-cloud.md`).

## Datos (puerta F4 de Gobierno de Datos)

- Una sola instancia PostgreSQL con las tablas del v7 (`SVC_`, `MAE_`); dueño de dato = el módulo (por asignar a una persona o rol, ver `docs/datos/diccionario.md`).
- El dato del cliente no se copia: el ticket guarda `PartyID` y `CompanyID` (ADR-003).
- Sin datos personales en notas ni bitácoras (RNF-SEC-008).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: línea de conflicto abierto con el ADR-01 del PO (stack). Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). — Revisado por: (pendiente) · Aprueba: TL
