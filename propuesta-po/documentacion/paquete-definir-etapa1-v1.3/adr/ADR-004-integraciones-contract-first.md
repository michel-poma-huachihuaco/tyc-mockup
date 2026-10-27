---
id: "ADR-004"
tipo: "adr"
titulo: "ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.8"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-27"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-009, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.8 · Fecha: 2026-10-27 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-04 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: reintento y circuit breaker con Resilience4j (BOM), token de servicio `client_credentials` (DT-10), y dueño y fecha de cada API externa. Registrado en `analisis/decisiones.md`, con las decisiones del equipo del 26-oct (ED-03, ED-05, ED-08, ED-17 y ED-24).

## Contexto

Varias APIs externas no tienen fecha comprometida (R-02: SIGDA/TAXON, call center, Legal, Cobranza, motor de José), y Control de acceso no la tiene en DEV (R-11). Con contrato y simulador, la historia se construye sin esperar al externo.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Esperar a que cada API exista | Bloquea el desarrollo desde el 21-oct (R-02). | Que todas las APIs estén disponibles antes del inicio. |
| Integrar cada API directo en los módulos que la usan | Acopla los módulos a cada externo: un cambio de dominio, formato o proveedor se multiplica. | — |
| Reintento y circuit breaker construidos a mano | Resilience4j ya está gobernado por el BOM y el SDK trae sus registros listos. | — |

## Decisión

Cada sistema externo se toca por un **puerto** en `domain.port.out`, un **adaptador** en `adapters.outbound.external` y un **simulador** con el mismo contrato. Se construye contra el simulador y la API real se activa cuando su responsable la entrega. Solo el módulo `integrations` habla con lo externo (ADR-001). Las llamadas HTTP usan el cliente corporativo del SDK (`aybar-starter-client`).

1. **Reintento y circuit breaker con Resilience4j** (condición del Líder Técnico). `aybar-starter-client` aplica tiempos límite (2 s de conexión y 10 s de lectura) y **no trae reintento ni circuit breaker**. Resilience4j está gobernado por el BOM (2.2.0 en el SDK 0.7.1) y no está declarado. `aybar-starter-logging` trae los registros de circuit breaker y de reintento **como opción** (`aybar.logging.resilience.enabled=true`, con `CircuitBreakerRegistry` en el classpath), con estos valores por defecto: el circuito abre al 50 % de fallos, con ventana de 20 llamadas y mínimo de 10; espera 10 s antes de volver a probar; hace **hasta 3 intentos en total, es decir, 2 reintentos**, con 500 ms entre intentos (`max-attempts=3` cuenta el primero, `aybar-starter-logging`). Se declara la dependencia, se enciende la opción y **cada adaptador decora su llamada** con el circuito y el reintento de su conector. Decisión del equipo: esos valores por defecto rigen para todos los externos de la Etapa 1, salvo la consulta 360, que no reintenta dentro de la petición para cumplir sus 2 s (HU-050 CA-09) y degrada la sección (ADR-003).
2. **Token de servicio:** las llamadas de ATC a servicios corporativos, entre ellos Control de acceso, usan el token `client_credentials` del emisor corporativo con `aybar-starter-client` (DT-10; `AYBAR_CLIENT_TOKEN_URI`, `AYBAR_CLIENT_CLIENT_ID` y el secreto en Key Vault). Hoy lo usa el registro del catálogo de ATC (ADR-009, ED-07). Control de acceso no tiene una API de gestores y líderes con token de servicio: `GestoresPort` usa el adaptador «actividad de ATC» (los gestores de una cola salen de la bitácora de asignaciones de ATC) y la evolución es un adaptador contra Control de acceso, sin cambiar el dominio (ADR-009, ED-03). Los conectores de terceros tienen **credenciales propias**; el token del usuario nunca viaja a un tercero (`aybar.client.hosts-con-token`, vacía = ninguno).
3. **Contrato y simulador:** un contrato de interfaz y un simulador por dependencia, cerrados en la etapa de diseño. Pruebas de contrato: el SDK no trae librería para ello.

## Dueño y fecha de cada API externa

Fuente: PLT-01 v1.3 §3 (responsable, fecha requerida y estado), PLT-05 v1.3 §2 (diagrama de dependencias), roadmap `RMP-001` §2 y §3, `roadmap/analisis-dependencias.md` §3 y el bloque «Depende de» de las 62 historias (26-oct). Son las 11 dependencias con API o sistema; DEP-03 (matriz SLA), DEP-04 (calendario) y DEP-05 (validación legal) son decisiones o datos y siguen en el roadmap. La «fecha requerida» es el inicio de la primera historia que la necesita (PLT-01 §3).

**Regla (decisión del equipo, 26-oct):** cada dependencia es un **riesgo del roadmap con su mitigación**, no una pregunta. El responsable es el que da el PLT-01 (persona o área); ninguna tiene fecha comprometida al 26-oct, y por eso cada una se construye contra su **simulador** con el contrato de ATC (punto 3) y la API real se activa cuando su responsable la entrega, cambiando el adaptador por configuración. DEP-01 a DEP-15 son el riesgo R-02; DEP-16 es el riesgo R-11 (ED-08).

| Dependencia | API o sistema | Área (PLT-01) | Responsable (PLT-01) | Fecha requerida | Fecha comprometida | Historias que bloquea (HU-ATC-…) | Estado |
|---|---|---|---|---|---|---|---|
| DEP-01 | SIGDA/TAXON: consulta de cliente y KYC; su contrato devuelve el `PartyID` (ED-05) | CDO / Equipo Datos | El área (CDO / Equipo Datos) | 21-oct | Riesgo R-02: simulador | 001, 002, 026, 027, 028, 032, 049, 050, 051, 052, 053, 064, 065, 066 (14) | Pendiente · fecha vencida · mitigado con simulador |
| DEP-06 | Repositorio documental (Azure Blob con inmutabilidad, ADR-006), `GOV_DOCUMENT_REPOSITORY` y GLI | Arquitectura / Legal | Blob y `GOV_DOCUMENT_REPOSITORY`: ATC (DT-07; custodio, ED-11). GLI: Gerencia Legal | 23-oct | Blob: con el ambiente (ADR-014). GLI: riesgo R-02, simulador | 012, 013, 014, 015, 016, 023, 024, 025, 053 (9) | En curso (PLT-01) · fecha vencida · mitigado |
| DEP-07 | Contratos y Activos: contrato, unidad, Acta de Entrega y cobertura | Equipo Contratos | El área (Equipo Contratos) | 29-oct | Riesgo R-02: simulador; tablas ajenas según ED-11 | 033, 034, 035, 036 (4) | Pendiente · mitigado |
| DEP-08 | Cobranza: estado de cuenta, pagos y cuotas vencidas | Cobranza | El área (Cobranza) | 21-oct | Riesgo R-02: simulador | 026, 027, 028, 050, 056, 057, 058 (7) | Pendiente · fecha vencida · mitigado |
| DEP-10 | KPI Engine y encuestas (`SVY_SURVEY_RESPONSE`) | Equipo Datos / BI | El área (Equipo Datos / BI) | 29-oct | Riesgo R-02: simulador; tabla según ED-11 | 019, 030, 031, 032 (4) | Pendiente · mitigado |
| DEP-11 | Plataforma del call center (API o CTI) | TI / proveedor de call center | El área (TI) | 21-oct | Riesgo R-02: simulador con el contrato de ATC (Q-042-2) | 042, 049 (2) | Por evaluar · fecha vencida · mitigado |
| DEP-12 | Herramienta de Legal | Gerencia Legal · TI | **Rosario** (PLT-01 §3: «responsable: Rosario») | 26-oct | Riesgo R-02: simulador; sincronización en línea por evento (Q-040-3) | 040, 041 (2) | Por evaluar · mitigado |
| DEP-13 | Motor de consultas de José | José · TI | **José** (PLT-01 §3) | 23-oct | Riesgo R-02: simulador con el contrato de ATC (Q-052-1) | 049, 050, 051, 052, 053 (5) | Por evaluar · fecha vencida · mitigado |
| DEP-14 | Proveedor de IA (ADR-007) | TI · Seguridad | El área (TI · Seguridad); proveedor decidido: Azure OpenAI Service (ED-17) | 23-oct | La habilitación es una aprobación de TI y Seguridad; mientras, simulador (ADR-007) | 047, 048, 053 (3) | Proveedor decidido · **no aplica en la Etapa 1** (P-025: HU-ATC-048 y 053 fuera; la guía de HU-ATC-047 no usa IA) |
| DEP-15 | Proyectos: responsable y supervisor de cada proyecto (HU-058) | Gerencia Comercial · Datos | El área (Gerencia Comercial) | 29-oct | Riesgo R-02: simulador; sin responsable, HU-058 CA-03 | 056, 057, 058 (3) | Pendiente · mitigado |
| DEP-16 | Control de acceso (PJ-05): emisor, clientes OAuth, catálogo aprobado y gestores invitados | Área de Roles y Permisos | **Sony Montoya** | 21-oct (HU-001) | Riesgo R-11 (ED-08): emisor de pruebas local, tokens de prueba y personas sintéticas; pasar al emisor del área es cambiar `AYBAR_ISSUER_URI` | 001, 004 a 009, 026, 027, 043 a 046, 049, 050, 052 a 055, 058, 064 a 067 (24) | Pendiente · riesgo aceptado con mitigación |

**Alcance de la Etapa 1 (P-025, decidida por el equipo el 26-oct-2026; `analisis/decisiones.md`).** HU-ATC-037, 038, 039, 048 y 053 salen de la Etapa 1 y se retoman en una etapa posterior. En la columna «Historias que bloquea», la 053 cuenta en DEP-01, DEP-06, DEP-13 y DEP-16 y la 048 en DEP-14: en la Etapa 1, DEP-01 bloquea 13 historias, DEP-06 8, DEP-13 4 y DEP-16 23; DEP-14 no aplica (su adaptador y su simulador se construyen cuando entren HU-ATC-048 y 053; ADR-007). Las demás filas no cambian.

**Qué pasa con la fecha vencida** (regla del PLT-01 §3 y del PLT-05 §2, con la decisión del equipo): la historia se construye y se prueba contra el simulador (punto 3), que no depende del externo, y su DoR registra la dependencia como riesgo aceptado con esa mitigación. La conexión a la API real es un cambio de adaptador y de configuración, sin cambiar el dominio. Cuando el responsable entregue su API, se anota en esta tabla y en el roadmap por control de cambio.

**Simuladores por ambiente (decisión del equipo; revisión interna del equipo, O-18).** El R-02 del PLT-01 condiciona «el pase a producción de cada integración» a su API real. Por eso: en local, DEV y QA cada adaptador puede correr con su simulador; en PRE (UAT), solo si el plan de UAT lo dice por integración, para que el PO decida el Go/No-Go con ese dato, como con Control de acceso (ADR-014, punto 8); y **en producción ningún adaptador corre con simulador**: una verificación al arrancar con el perfil `prod` (no con `preprod`) impide activar un simulador. Sin la API real, la sección de la consulta 360 degrada (ADR-003) o la funcionalidad que la necesita no pasa a producción (G8).

## Consecuencias

- Obliga a:
  - Un contrato de interfaz y un simulador por dependencia, cerrados el 20-oct.
  - Declarar Resilience4j en el `pom.xml` (sin `<version>`: lo gobierna el BOM), encender `aybar.logging.resilience.enabled` y decorar cada adaptador (dentro de las horas de HU-050, tarea HU-ATC-050-T02; tabla del ADR-012).
  - Credenciales propias por conector y el cliente de servicio `client_credentials` registrado en Control de acceso (entregable de la DEP-16, riesgo R-11; ED-07 y ED-08).
  - Pruebas de contrato: el SDK no trae librería para ello.
  - Mantener cada simulador con el contrato de ATC mientras su responsable no entregue la API (tabla de arriba; riesgos R-02 y R-11), y la verificación de arranque que impide un simulador en producción (configuración, dentro de HU-ATC-050-T02).
- Impide:
  - Que un módulo de negocio llame a un externo directamente.
  - Que el token del usuario viaje a un tercero.
- Cuesta: **0 h fuera del plan**: el reintento y el circuit breaker van dentro de las horas de HU-050 (tarea HU-ATC-050-T02; tabla del ADR-012) y los simuladores en las horas de cada historia (`backlog/tareas/`). **USD 0 de nube propio**: los adaptadores corren en el contenedor del servicio (`arquitectura/costo-cloud.md`, §1.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos fijados en ED-12).

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
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo: fuente RMP-001 v0.4 y `analisis-dependencias.md` v0.4; por dependencia, persona responsable (las que da el PLT-01: Rosario, José y Sony Montoya; las demás, «por confirmar» con quién la da), fecha comprometida por confirmar, historias que bloquea y qué pasa sin fecha; DEP-16 deja de ser «propuesta» y queda «Pendiente · en riesgo (P-040)» |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6 y la fuente de la tabla de dependencias, RMP-001 v0.5 y `analisis-dependencias.md` v0.5 (24 HU con la DEP-16), las versiones vigentes (decían v0.5, v0.4 y v0.4). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): cada dependencia es un riesgo del roadmap con mitigación (R-02; DEP-16, R-11, ED-08), sin dejar persona ni fecha en duda; responsable = el del PLT-01; DEP-16 sin la API de líderes (ED-03; `GestoresPort` con la actividad de ATC); DEP-01 con el `PartyID` en su contrato (ED-05); DEP-14 con proveedor decidido (ED-17); valores de Resilience4j decididos; reintento dentro de HU-050; fuente RMP-001 v0.6 |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): nota con el alcance de la Etapa 1 en la tabla de dependencias (la 053 sale de DEP-01, 06, 13 y 16; DEP-14 no aplica en la Etapa 1, porque HU-ATC-048 y 053 están fuera y la guía de HU-ATC-047 no usa IA) |
| 0.7 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo del 26-oct: «3 intentos (2 reintentos)» como dice `aybar-starter-logging` (O-24); DEP-16 con HU-049 (24 HU; 23 en la Etapa 1, O-16); simuladores por ambiente, ninguno en producción (O-18). Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión; las filas repetidas del historial se conservan como registro (O-26) |
| 0.8 | 2026-10-27 | Brayan Hurtado, con IA | Sin cambio de contenido: las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
