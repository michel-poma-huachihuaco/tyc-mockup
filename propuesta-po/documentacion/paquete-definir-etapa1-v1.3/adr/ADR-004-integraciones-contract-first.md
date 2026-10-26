---
id: "ADR-004"
tipo: "adr"
titulo: "ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-009, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.3 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-04 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: reintento y circuit breaker con Resilience4j (BOM), token de servicio `client_credentials` (DT-10), y dueño y fecha de cada API externa. Registrado en `analisis/decisiones.md` v0.5.

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

Fuente: roadmap `RMP-001` v0.2 y `analisis-dependencias.md` v0.2 (plan v1.3 del PO), §3 «Dependencias por fecha requerida». Son las 11 dependencias con API o sistema; DEP-03 (matriz SLA), DEP-04 (calendario) y DEP-05 (validación legal) no son API. **Ninguna tiene fecha comprometida por su responsable** (0 de 14). La «fecha requerida» es el inicio de la primera historia que la necesita. Los responsables son áreas, no personas: para comprometer una fecha hace falta un nombre (A-06 de `analisis-dependencias.md`).

| Dependencia | API o sistema | Dueño (área) | Fecha requerida | Fecha comprometida | Estado (PLT-01) |
|---|---|---|---|---|---|
| DEP-01 | SIGDA/TAXON: consulta de cliente y KYC | CDO / Equipo Datos | 21-oct | sin fijar | Pendiente |
| DEP-06 | Repositorio documental y GLI | Arquitectura / Legal | 23-oct | sin fijar | En curso |
| DEP-07 | Contratos y Activos | Equipo Contratos | 29-oct | sin fijar | Pendiente |
| DEP-08 | Cobranza | Cobranza | 21-oct | sin fijar | Pendiente |
| DEP-10 | KPI Engine y encuestas | Equipo Datos / BI | 29-oct | sin fijar | Pendiente |
| DEP-11 | Plataforma del call center (API o CTI) | TI / proveedor de call center | 21-oct | sin fijar | Por evaluar |
| DEP-12 | Herramienta de Legal | Gerencia Legal · TI | 26-oct | sin fijar | Por evaluar |
| DEP-13 | Motor de consultas de José | José · TI | 23-oct | sin fijar | Por evaluar |
| DEP-14 | Proveedor de IA (ADR-007) | TI · Seguridad | 23-oct | sin fijar | Por evaluar |
| DEP-15 | Proyectos: responsable y supervisor de cada proyecto (HU-058) | Gerencia Comercial · Datos | 29-oct | sin fijar | Pendiente |
| DEP-16 (propuesta) | Control de acceso (PJ-05): emisor, clientes OAuth y catálogo; API de gestores y líderes por construir (P-035) | Área de Roles y Permisos (Sony Montoya) | 21-oct (HU-001) | sin fijar (P-040) | Nueva (P-026) |

## Consecuencias

- Obliga a:
  - Un contrato de interfaz y un simulador por dependencia, cerrados el 20-oct.
  - Declarar Resilience4j en el `pom.xml` (sin `<version>`: lo gobierna el BOM), encender `aybar.logging.resilience.enabled` y decorar cada adaptador (4 h, tabla del ADR-012; P-025).
  - Credenciales propias por conector y el cliente de servicio `client_credentials` registrado en Control de acceso (P-026).
  - Pruebas de contrato: el SDK no trae librería para ello.
  - Que cada responsable ponga un nombre y una fecha comprometida; si no, lo que bloquea queda en NO READY (G4).
- Impide:
  - Que un módulo de negocio llame a un externo directamente.
  - Que el token del usuario viaje a un tercero.
- Cuesta: **4 h** de reintento y circuit breaker (tabla del ADR-012; P-025); los simuladores van en las horas de cada historia (`backlog/tareas/`). **USD 0 de nube propio**: los adaptadores corren en el contenedor del servicio (`arquitectura/costo-cloud.md` v0.3 (API de precios de Azure del 26-oct-2026, USD por mes, región base Brazil South; supuestos de región, volumen y tamaño en P-044), §1.1).

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

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
