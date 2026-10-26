---
id: "ADR-004"
tipo: "adr"
titulo: "ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-009, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-04 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: reintento y circuit breaker con Resilience4j (BOM), token de servicio `client_credentials` (DT-10), y dueño y fecha de cada API externa. Registrado en `analisis/decisiones.md` v0.6.

## Contexto

Varias APIs externas no tienen fecha comprometida (R-02: SIGDA/TAXON, call center, Legal, Cobranza, motor de José). Sin contrato y simulador a la fecha requerida, la historia que bloquean no puede marcarse Lista.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Esperar a que cada API exista | Bloquea el desarrollo desde el 21-oct (R-02). | Que todas las APIs estén disponibles antes del inicio. |
| Integrar cada API directo en los módulos que la usan | Acopla los módulos a cada externo: un cambio de dominio, formato o proveedor se multiplica. | — |
| Reintento y circuit breaker construidos a mano | Resilience4j ya está gobernado por el BOM y el SDK trae sus registros listos. | — |

## Decisión

Cada sistema externo se toca por un **puerto** en `domain.port.out`, un **adaptador** en `adapters.outbound.external` y un **simulador** con el mismo contrato. Se construye contra el simulador y la API real se activa cuando su responsable la entrega. Solo el módulo `integrations` habla con lo externo (ADR-001). Las llamadas HTTP usan el cliente corporativo del SDK (`aybar-starter-client`).

1. **Reintento y circuit breaker con Resilience4j** (condición del Líder Técnico). `aybar-starter-client` aplica tiempos límite (2 s de conexión y 10 s de lectura) y **no trae reintento ni circuit breaker**. Resilience4j está gobernado por el BOM (2.2.0 en el SDK 0.7.1) y no está declarado. `aybar-starter-logging` trae los registros de circuit breaker y de reintento **como opción** (`aybar.logging.resilience.enabled=true`, con `CircuitBreakerRegistry` en el classpath), con estos valores por defecto: el circuito abre al 50 % de fallos, con ventana de 20 llamadas y mínimo de 10; espera 10 s abierto; reintenta 3 veces con 500 ms entre intentos. Se declara la dependencia, se enciende la opción y **cada adaptador decora su llamada** con el circuito y el reintento de su conector. Se confirma que los valores por defecto sirven para cada externo antes de fijarlos.
2. **Token de servicio:** las llamadas de ATC a servicios corporativos, entre ellos Control de acceso, usan el token `client_credentials` del emisor corporativo con `aybar-starter-client` (DT-10; `AYBAR_CLIENT_TOKEN_URI`, `AYBAR_CLIENT_CLIENT_ID` y el secreto en Key Vault). Hoy lo usa el registro del catálogo de ATC (ADR-009). Control de acceso no tiene todavía una API de gestores y líderes con token de servicio: el puerto `GestoresPort` se construye contra su simulador hasta que exista (P-035). Los conectores de terceros tienen **credenciales propias**; el token del usuario nunca viaja a un tercero (`aybar.client.hosts-con-token`, vacía = ninguno).
3. **Contrato y simulador:** un contrato de interfaz y un simulador por dependencia, cerrados en la etapa de diseño. Pruebas de contrato: el SDK no trae librería para ello.

## Dueño y fecha de cada API externa

Fuente: PLT-01 v1.3 §3 (responsable, fecha requerida y estado), PLT-05 v1.3 §2 (diagrama de dependencias), roadmap `RMP-001` v0.5 §2, `roadmap/analisis-dependencias.md` v0.5 §3 y el bloque «Depende de» de las 62 historias (26-oct). Son las 11 dependencias con API o sistema; DEP-03 (matriz SLA), DEP-04 (calendario) y DEP-05 (validación legal) son decisiones o datos y siguen en el roadmap. La «fecha requerida» es el inicio de la primera historia que la necesita (PLT-01 §3).

El PLT-01 nombra áreas, salvo en tres dependencias: la herramienta de Legal (Rosario), el motor de José y Control de acceso (Sony Montoya). Donde el plan no da un nombre, la tabla dice quién lo tiene que dar: este ADR no inventa nombres ni fechas. **Al 26-oct ninguna tiene fecha comprometida** (0 de 11): 7 ya pasaron su fecha requerida (DEP-01, 06, 08, 11, 13, 14 y 16) y la de la DEP-12 vence hoy.

| Dependencia | API o sistema | Área (PLT-01) | Persona responsable | Fecha requerida | Fecha comprometida | Historias que bloquea (HU-ATC-…) | Estado |
|---|---|---|---|---|---|---|---|
| DEP-01 | SIGDA/TAXON: consulta de cliente y KYC | CDO / Equipo Datos | Por confirmar: la nombra el CDO | 21-oct | Por confirmar: CDO | 001, 002, 026, 027, 028, 032, 049, 050, 051, 052, 053, 064, 065, 066 (14) | Pendiente · fecha vencida |
| DEP-06 | Repositorio documental (Azure Blob con inmutabilidad, ADR-006), `GOV_DOCUMENT_REPOSITORY` y GLI | Arquitectura / Legal | Por confirmar: el Líder Técnico (Jose Jara) para Blob y `GOV_DOCUMENT_REPOSITORY`; la Gerencia Legal para el GLI | 23-oct | Por confirmar: Líder Técnico y Gerencia Legal | 012, 013, 014, 015, 016, 023, 024, 025, 053 (9) | En curso (PLT-01) · fecha vencida |
| DEP-07 | Contratos y Activos: contrato, unidad, Acta de Entrega y cobertura | Equipo Contratos | Por confirmar: la nombra el jefe del Equipo Contratos | 29-oct | Por confirmar: Equipo Contratos | 033, 034, 035, 036 (4) | Pendiente |
| DEP-08 | Cobranza: estado de cuenta, pagos y cuotas vencidas | Cobranza | Por confirmar: la nombra la jefatura de Cobranza | 21-oct | Por confirmar: Cobranza | 026, 027, 028, 050, 056, 057, 058 (7) | Pendiente · fecha vencida |
| DEP-10 | KPI Engine y encuestas (`SVY_SURVEY_RESPONSE`) | Equipo Datos / BI | Por confirmar: la nombra el Equipo Datos / BI | 29-oct | Por confirmar: Equipo Datos / BI | 019, 030, 031, 032 (4) | Pendiente |
| DEP-11 | Plataforma del call center (API o CTI) | TI / proveedor de call center | Por confirmar: la nombra TI | 21-oct | Por confirmar: TI | 042, 049 (2) | Por evaluar · fecha vencida |
| DEP-12 | Herramienta de Legal | Gerencia Legal · TI | **Rosario** (PLT-01 §3: «responsable: Rosario»); apellido y cargo por confirmar con la Gerencia Legal | 26-oct | Por confirmar: Rosario | 040, 041 (2) | Por evaluar · vence el 26-oct |
| DEP-13 | Motor de consultas de José | José · TI | **José** (PLT-01 §3); apellido y quién mantiene la API, por confirmar con TI | 23-oct | Por confirmar: José | 049, 050, 051, 052, 053 (5) | Por evaluar · fecha vencida |
| DEP-14 | Proveedor de IA (ADR-007) | TI · Seguridad | Por confirmar: la nombran TI y Seguridad | 23-oct | Por confirmar: TI y Seguridad; corte propuesto en ADR-007 | 047, 048, 053 (3) | Por evaluar · fecha vencida |
| DEP-15 | Proyectos: responsable y supervisor de cada proyecto (HU-058) | Gerencia Comercial · Datos | Por confirmar: la nombra la Gerencia Comercial | 29-oct | Por confirmar: Gerencia Comercial | 056, 057, 058 (3) | Pendiente |
| DEP-16 | Control de acceso (PJ-05): emisor, clientes OAuth, catálogo aprobado y gestores invitados; API de gestores y líderes por construir (P-035) | Área de Roles y Permisos | **Sony Montoya** | 21-oct (HU-001) | Por confirmar: Sony Montoya; PJ-05 no tiene fecha en DEV (P-040) | 001, 004 a 009, 026, 027, 043 a 046, 050, 052 a 055, 058, 064 a 067 (23) | Pendiente · en riesgo (P-040) · fecha vencida |

**Qué pasa sin persona o sin fecha** (regla del PLT-01 §3 y del PLT-05 §2): sin contrato de interfaz y simulador a la fecha requerida, la historia que bloquea no se marca Lista y se cambia por otra del mismo desarrollador. Con la fecha vencida, la parte de la historia que usa la API real queda **NO READY** en su DoR (G4); la historia se construye contra el simulador (punto 3), que no depende del externo. El PM pide a cada área el nombre y la fecha comprometida, y escala al Líder Técnico si no hay respuesta en 48 h (propuesta del equipo). Cuando haya nombre y fecha, se anotan en esta tabla y en el roadmap, por control de cambio.

## Consecuencias

- Obliga a:
  - Un contrato de interfaz y un simulador por dependencia, cerrados el 20-oct.
  - Declarar Resilience4j en el `pom.xml` (sin `<version>`: lo gobierna el BOM), encender `aybar.logging.resilience.enabled` y decorar cada adaptador (4 h, tabla del ADR-012; P-025).
  - Credenciales propias por conector y el cliente de servicio `client_credentials` registrado en Control de acceso (P-026).
  - Pruebas de contrato: el SDK no trae librería para ello.
  - Que cada área ponga un nombre y una fecha comprometida (tabla de arriba); si no, lo que bloquea queda NO READY (G4) y se construye contra el simulador.
- Impide:
  - Que un módulo de negocio llame a un externo directamente.
  - Que el token del usuario viaje a un tercero.
- Cuesta: **4 h** de reintento y circuit breaker (tabla del ADR-012; P-025); los simuladores van en las horas de cada historia (`backlog/tareas/`). **USD 0 de nube propio**: los adaptadores corren en el contenedor del servicio (`arquitectura/costo-cloud.md` v0.4, §1.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos en P-044).

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias; el módulo `integrations` no guarda datos de negocio.
- PII: los datos personales que lleguen de un externo no se persisten (ADR-003).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-04 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Resilience4j (reintento y circuit breaker) con el BOM, `client_credentials` (DT-10), tabla de dueño y fecha por API externa |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | DEP-15 en la tabla; DEP-16 con fecha requerida y sin la API de líderes como si existiera (P-035, P-040); variables del cliente de servicio; versión de Resilience4j del BOM; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: fuente RMP-001 v0.4 y `analisis-dependencias.md` v0.4; por dependencia, persona responsable (las que da el PLT-01: Rosario, José y Sony Montoya; las demás, «por confirmar» con quién la da), fecha comprometida por confirmar, historias que bloquea y qué pasa sin fecha; DEP-16 deja de ser «propuesta» y queda «Pendiente · en riesgo (P-040)» |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6 y la fuente de la tabla de dependencias, RMP-001 v0.5 y `analisis-dependencias.md` v0.5 (24 HU con la DEP-16), las versiones vigentes (decían v0.5, v0.4 y v0.4). |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
