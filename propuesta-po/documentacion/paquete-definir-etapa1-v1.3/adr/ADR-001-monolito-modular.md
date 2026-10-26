---
id: "ADR-001"
tipo: "adr"
titulo: "ADR-001: Monolito modular por capacidad en Java con Spring Boot"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-002, ADR-003, ADR-004, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-001: Monolito modular por capacidad en Java con Spring Boot

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-01 del PLT-05 v1.3, con las decisiones DT-01, DT-03 y DT-06 del Líder Técnico (Jose Jara, 22-oct-2026), registradas en `analisis/decisiones.md` v0.5. Cierra D-001 en lo que toca a este ADR.
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

Aybar Atiende se construye como **un monolito modular por capacidad**: un solo despliegue, en Java 21 con Spring Boot sobre el SDK Aybar 0.7.1 (DT-01), con un módulo por capacidad y sus tablas en la base única del v7 (DT-06). **Módulos y paquetes en inglés** (acuerdo del 4-sep, según el Líder Técnico): cada módulo es un paquete dentro de cada capa de la plantilla, por ejemplo `com.aybarsac.atc.domain.tickets`, `com.aybarsac.atc.application.tickets` y `com.aybarsac.atc.adapters.inbound.rest.tickets`. Los nombres en inglés son propuesta del equipo y son también las etiquetas del contrato OpenAPI:

| Módulo (español, v0.1) | Módulo y paquete (inglés) | Qué incluye (épicas) |
|---|---|---|
| `tickets` | `tickets` | Núcleo del ticket, interacciones, derivación, reasignación, actividades del flujo, y los casos y frases del Entrega Fest (EP-ATC-01, 02 y 08) |
| `sla` | `sla` | Compromisos, alertas y jobs de SLA (EP-ATC-02) |
| `libro` | `complaintbook` | Libro de Reclamaciones y apelaciones (EP-ATC-03) |
| `casos_legales` | `legalcases` | Mesa de casos sensibles SGD, gate a Eje 3 (señal de conflicto, handoff y nota de estado) y sincronización con Legal (EP-ATC-04) |
| `postventa` | `aftersales` | Reclamos de garantía (EP-ATC-05) |
| `portal` | `portal` | Operaciones del cliente en Mi Portal (EP-ATC-06) |
| `calidad` | `quality` | Encuesta, Torre de Control CX e informes (EP-ATC-07) |
| `bandeja` | `inbox` | Bandeja, casillero, flujos, rayo, guía, IA, tablero y visor 3D (EP-ATC-09) |
| `consulta360` | `customer360` | Búsqueda y consulta 360 del cliente (EP-ATC-10) |
| `morosidad` | `delinquency` | Resolución por morosidad y formularios simples (EP-ATC-11) |
| `integraciones` | `integrations` | Un adaptador y un simulador por externo (ADR-004), incluido `GestoresPort` hacia Control de acceso (ADR-009) |

Lo transversal (outbox y publicador, proyector, seguridad y configuración) va en `infrastructure` y en los adaptadores, sin módulo de negocio.

**No hay módulo `identidad`** (DT-03): ATC lee del token quién es el usuario y sus roles, y lo que el token no trae lo pide a Control de acceso por un puerto de `integrations` (ADR-009).

Reglas de frontera:
1. Cada módulo es dueño de las tablas del fragmento SERVICE del modelo corporativo v7 que le tocan, en la base única y sin esquema por módulo (los nombres llevan el prefijo del v7, `SVC_` o `MAE_`): `tickets` → `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET_INTERACTION` y los catálogos `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY` y `MAE_AREA` (esta última solo como cola de atención, ADR-009); `sla` → `MAE_SLA_POLICY` y `SVC_SLA_BREACH_ALERT`; `complaintbook` → `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL` y sus bitácoras de estado. La tabla técnica del outbox (`SVC_OUTBOX_EVENT`, cambio al v7, ADR-013) y la de ShedLock (`shedlock`, ADR-005) son transversales. De las tablas de otros fragmentos (`PARTY`, `ORG_COMPANY`, `CONTRACT`, `MAE_CHANNEL`…) ATC solo guarda referencias con FK física; `PARTY` es la fuente viva del cliente (ADR-003). Las filas que ATC escribe en tablas de otros fragmentos (sus listas en `MAE_GENERIC_LIST_VALUE`, el canal `MI_PORTAL`, las excepciones de `GOV_INTEGRITY_EXCEPTION`, la fila espejo de `GOV_DOCUMENT_REPOSITORY`, la encuesta y el reclamo de garantía) están, tabla por tabla, en `datos/registro-de-tablas.md` §5: con eso se cierra P-014. ATC las escribe solo desde su adaptador de persistencia, con el usuario de aplicación y los permisos del punto 5; las aprueba Gobierno de Datos en la puerta F4 (acta F4).
2. Un módulo no usa el interior de otro: solo su API pública o sus eventos.
3. Solo el módulo `integrations` habla con los sistemas externos.
4. Un módulo se puede extraer después a un servicio aparte sin reescribirlo; el orden probable es Mi Portal e integraciones, luego IA y trabajos pesados, y al final el núcleo.
5. **Migraciones y permisos en la base única** (la base ya tiene las tablas y las migraciones de Control de acceso):
   - **Tabla de historial propia:** `aybar.data.flyway.baseline-table: flyway_schema_history_atc`, que `aybar-starter-data` 0.7.1 traduce a `spring.flyway.table` (`FlywayPropertyPostProcessor`). Va en el mismo esquema que las tablas del v7 de la base única, el que use Control de acceso; lo confirman Sony Montoya y Gobierno de Datos (P-043). Con la tabla por defecto (`flyway_schema_history`), ATC vería las migraciones de Control de acceso y la validación fallaría al arrancar.
   - **Línea base:** como el esquema no está vacío, la primera ejecución necesita una línea base: `aybar.data.flyway.baseline-on-migrate: true` y `spring.flyway.baseline-version: 0`. La versión 0 es necesaria porque con la de defecto (1) Flyway saltaría la `V1__` de ATC. `baseline-version` es la única propiedad `spring.flyway.*` que se declara, porque el SDK no la expone en `aybar.data.flyway.*`, y no se repite en los dos espacios (regla de `aybar-starter-data`).
   - **Roles de base** (los crea infraestructura, como `app_idn_servicio` en Control de acceso): `app_atc_migracion`, dueño de las tablas de ATC (`SVC_*` y `MAE_*` de SERVICE, `SVC_OUTBOX_EVENT`, `shedlock` y `flyway_schema_history_atc`), con `REFERENCES` sobre las tablas ajenas de las FK físicas y sin permisos sobre ellas; y `app_atc_servicio`, el de la aplicación, que no es dueño de nada: `SELECT`, `INSERT` y `UPDATE` en las entidades, en `SVC_OUTBOX_EVENT` y en `shedlock`, solo `SELECT` e `INSERT` en las 5 bitácoras (ADR-002), `DELETE` solo en `SVC_OUTBOX_EVENT` (purga, ADR-013), `SELECT` en las tablas ajenas que lee y `INSERT` en las que escribe (registro §5). Ninguno de los dos crea objetos fuera de ATC.
   - **Quién corre Flyway:** un **job aparte** (Azure Container Apps Job con la misma imagen y un perfil que solo migra) con la cadena de `app_atc_migracion` (`AYBAR_DATASOURCE_URI` desde el secreto `atc-db-migracion-uri` de Key Vault). El servicio corre con `aybar.data.flyway.enabled: false` y la cadena de `app_atc_servicio` (`atc-db-servicio-uri`). Son dos procesos porque el starter usa una sola URI por proceso. El job corre antes de cada despliegue y, si falla, el despliegue no sigue (G8). El orden de despliegue y la reversión están en `arquitectura/migracion-y-reversion.md`.

La estructura interna sigue la plantilla hexagonal del servicio (`domain`, `application`, `adapters`, `infrastructure`, `boot`); los módulos de negocio son paquetes dentro de esas capas.

## Consecuencias

- Obliga a:
  - **Sumar reglas ArchUnit de frontera entre módulos.** La plantilla (`NormaHexagonalTest`) solo verifica capas: dominio sin tecnología, dominio solo con el SDK seguro y casos de uso sin adaptadores. No vigila los límites entre módulos: la regla nueva prohíbe que un paquete de módulo use el interior de otro.
  - Migraciones Flyway que solo agregan (el v7 prohíbe renombrar o eliminar columnas: se marcan DEPRECADO), agrupadas por módulo, con la tabla de historial, la línea base, los dos roles y el job del punto 5, y eventos para lo que cruza módulos. Las 13 tablas de SERVICE las crea ATC, que no recrea ningún maestro compartido; qué crea, qué solo lee y qué escribe en otro dominio está en `datos/registro-de-tablas.md` (C-11), y el dueño de migración de los maestros compartidos se acuerda con Gobierno de Datos (P-043).
  - Usar los nombres en inglés en `modulos.mmd`, `c4-contenedores.mmd`, las etiquetas (`tags`) del OpenAPI y los paquetes (hecho en las versiones del 26-oct); los eventos usan los tópicos del SDK (ADR-013).
  - Mantener fuera el módulo `identidad` en `modulos.mmd` y `c4-contenedores.mmd` (hecho).
- Impide:
  - Consultas directas a tablas de otro módulo.
  - Transacciones de negocio repartidas en varios despliegues.
  - Tablas de identidad, roles, permisos o sesiones en ATC (C-11).
- Cuesta: **USD 2.592,53 al mes** para todo ATC: DEV 229,16, QA 390,19, PRE (UAT) 390,19, producción 1.562,71 y registro de imágenes 20,28 (`arquitectura/costo-cloud.md` v0.4, §1.1: API pública de precios de Azure del 26-oct-2026, USD por mes, región base Brazil South; supuestos de región, volumen y tamaño en P-044). Es un solo despliegue: el monolito no suma un contenedor por módulo (Azure Container Apps, 197,70 al mes en producción); el job de migraciones corre segundos por despliegue en el plan de consumo y no suma al total. **3 h** de las reglas ArchUnit de frontera (tabla del ADR-012; P-025).

## Datos (puerta F4 de Gobierno de Datos)

- Base única del v7 con las tablas `SVC_` y `MAE_`. Dueño de dato de cada tabla: el que propone `datos/registro-de-tablas.md` §2 y designa Gobierno de Datos en la puerta F4 (H-01 del acta); este ADR no fija otro.
- El dato del cliente no se copia: el ticket guarda `PartyID` y `CompanyID` y `PARTY` es la fuente viva (ADR-003, DT-06).
- Sin datos personales en notas ni bitácoras (RNF-SEC-008).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con 12 módulos (incluía `identidad`) |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Tablas del v7 y línea de conflicto con el PO |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-01 y DT-06. Se quita el módulo `identidad` (DT-03). Módulos y paquetes en inglés (propuesta). Costo sin cifra, con su razón |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Paquetes en inglés por capa y qué incluye cada módulo (igual a las etiquetas del contrato); tablas transversales (outbox y ShedLock); `GestoresPort` en `integrations`; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: regla 5 de migraciones en la base única (tabla de historial `flyway_schema_history_atc`, línea base en la versión 0, roles `app_atc_migracion` y `app_atc_servicio` y job de migraciones aparte); P-014 cerrada con el registro de tablas §5; dueño de dato remitido al registro; costo con PRE (UAT) incluido, USD 2.592,53 |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
