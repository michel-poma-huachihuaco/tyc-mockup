---
id: "ADR-001"
tipo: "adr"
titulo: "ADR-001: Monolito modular por capacidad en Java con Spring Boot"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-003, ADR-004, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-001: Monolito modular por capacidad en Java con Spring Boot

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: convierte a la plantilla del marco el ADR-01 del PLT-05 v1.3, con las decisiones DT-01, DT-03 y DT-06 del Líder Técnico (Jose Jara, 22-oct-2026), registradas en `analisis/decisiones.md` v0.3. Cierra D-001 en lo que toca a este ADR.
- Cambia lo que fija el PO: el ADR-01 del PO dice «Monolito modular por capacidad (NestJS) sobre la infraestructura vigente». Se conserva la forma (monolito modular) y cambia el lenguaje a Java con Spring Boot (DT-01). El PO actualiza el PLT-01 §1 y el PLT-05 §4 (P-027).
- Alineado con el modelo de datos corporativo v7: no hay un esquema por módulo; los módulos son dueños de tablas `SVC_` y `MAE_` del fragmento SERVICE dentro de la **base única** (DT-06).

## Contexto

Aybar Atiende (plataforma ATC) se construye en 10 días hábiles (21-oct al 3-nov-2026) con 4 desarrolladores y 243 de 252 horas comprometidas (96 %; el Dev 4 al 98 %). Son 62 historias, 11 épicas y 14 dependencias, varias sin API comprometida. Hay exigencias de plazo legal en días hábiles, de la Ley 29733 y de evidencia que no se puede editar.

El Líder Técnico fijó el stack del SDK Aybar 0.7.1 (Java 21 con Spring Boot, DT-01), que coincide con el repositorio `aybar-ATC` ya generado: una aplicación hexagonal de un solo servicio. También fijó que ATC consume la seguridad de Control de acceso y no la administra (DT-03), por lo que **no hay un módulo de identidad**.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| A · Monolito simple, sin fronteras | Es lo más barato hoy, pero separar después cuesta mucho: hay que desenredar datos y código. | Un producto de vida corta que no va a crecer. |
| C · Microservicios desde el día 1 | No hay holgura: pipelines, contratos y operación por servicio no caben en 252 h, y el SDK no trae outbox para garantizar los eventos entre servicios (ADR-013). | Un motivo medido: carga distinta, ritmo de cambio distinto, aislar fallas o un equipo propio por módulo. |
| NestJS (propuesta del PLT-05) | Descartada por DT-01. | — |
| Un módulo `identidad` con maestro local | Descartado por DT-03: la identidad la administra Control de acceso (ADR-009). | — |

## Decisión

Aybar Atiende se construye como **un monolito modular por capacidad**: un solo despliegue, en Java con Spring Boot sobre el SDK Aybar, con un módulo por capacidad. **Módulos y paquetes en inglés** (acuerdo del 4-sep, según el Líder Técnico). Los nombres en inglés son propuesta del equipo:

| Módulo (español, v0.1) | Módulo (inglés) |
|---|---|
| `tickets` | `tickets` |
| `sla` | `sla` |
| `libro` | `complaintbook` |
| `casos_legales` | `legalcases` |
| `postventa` | `aftersales` |
| `portal` | `portal` |
| `calidad` | `quality` |
| `bandeja` | `inbox` |
| `consulta360` | `customer360` |
| `morosidad` | `delinquency` |
| `integraciones` | `integrations` (un adaptador y un simulador por externo, ADR-004) |

**No hay módulo `identidad`** (DT-03): ATC lee quién es el usuario y qué puede hacer del token y consulta a Control de acceso lo demás (ADR-009).

Reglas de frontera:
1. Cada módulo es dueño de las tablas del fragmento SERVICE del modelo corporativo v7 que le tocan, en la base única y sin esquema por módulo (los nombres llevan el prefijo del v7, `SVC_` o `MAE_`): `tickets` → `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET_INTERACTION` y los catálogos `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY` y `MAE_AREA` (esta última solo como cola de atención, ADR-009); `sla` → `MAE_SLA_POLICY` y `SVC_SLA_BREACH_ALERT`; `complaintbook` → `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL` y sus bitácoras de estado. De las tablas de otros fragmentos (`PARTY`, `ORG_COMPANY`, `CONTRACT`, `MAE_CHANNEL`…) ATC solo guarda referencias; `PARTY` es la fuente viva del cliente (ADR-003). Quién escribe en tablas de otros fragmentos y cómo se accede a ellas está **por confirmar** (P-014).
2. Un módulo no usa el interior de otro: solo su API pública o sus eventos.
3. Solo el módulo `integrations` habla con los sistemas externos.
4. Un módulo se puede extraer después a un servicio aparte sin reescribirlo; el orden probable es Mi Portal e integraciones, luego IA y trabajos pesados, y al final el núcleo.

La estructura interna sigue la plantilla hexagonal del servicio (`domain`, `application`, `adapters`, `infrastructure`, `boot`); los módulos de negocio son paquetes dentro de esas capas.

## Consecuencias

- Obliga a:
  - **Sumar reglas ArchUnit de frontera entre módulos.** La plantilla (`NormaHexagonalTest`) solo verifica capas: dominio sin tecnología, dominio solo con el SDK seguro y casos de uso sin adaptadores. No vigila los límites entre módulos.
  - Migraciones Flyway que solo agregan (el v7 prohíbe renombrar o eliminar columnas: se marcan DEPRECADO), agrupadas por módulo, y eventos para lo que cruza módulos. **Por confirmar:** si las tablas `SVC_` ya existen en la base única o las crea ATC (C-11: el registro de tablas dice qué crea, qué lee y qué escribe en otro dominio).
  - Renombrar los módulos al inglés en `modulos.mmd`, `c4-contenedores.mmd`, las etiquetas (`tags`) del OpenAPI y los nombres de paquete; los eventos ya tienen nombre lógico (ADR-013).
  - Quitar `identidad` de `modulos.mmd` y `c4-contenedores.mmd`.
- Impide:
  - Consultas directas a tablas de otro módulo.
  - Transacciones de negocio repartidas en varios despliegues.
  - Tablas de identidad, roles, permisos o sesiones en ATC (C-11).
- Cuesta: **sin cifra todavía.** Un solo despliegue, dos almacenes de datos, un bus de eventos y almacenamiento de objetos (ADR-014). El costo cloud lo da `arquitectura/costo-cloud.md` cuando haya volúmenes; las horas de lo que el SDK no trae están en la tabla del ADR-012 (P-025).

## Datos (puerta F4 de Gobierno de Datos)

- Base única del v7 con las tablas `SVC_` y `MAE_`; dueño de dato = el módulo (por asignar a una persona o rol, ver `docs/datos/diccionario.md`; H-01 del acta F4).
- El dato del cliente no se copia: el ticket guarda `PartyID` y `CompanyID` y `PARTY` es la fuente viva (ADR-003, DT-06).
- Sin datos personales en notas ni bitácoras (RNF-SEC-008).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con 12 módulos (incluía `identidad`) |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Tablas del v7 y línea de conflicto con el PO |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-01 y DT-06. Se quita el módulo `identidad` (DT-03). Módulos y paquetes en inglés (propuesta). Costo sin cifra, con su razón |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
