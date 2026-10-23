---
id: "SPEC-ARQ-ROLES-ATC"
tipo: "spec"
titulo: "Roles y permisos de ATC: catálogo que ATC entrega a Control de acceso"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-009, ADR-011, ADR-014]
tags: [arquitectura, seguridad, roles, g3]
---

# Roles y permisos de ATC

Resuelve la colisión C-02 de la revisión del Líder Técnico (22-oct-2026): ningún documento listaba un rol de ATC, y por eso HU-001 CA-04 («mi rol no es de atención») no se podía probar. Este documento es la **propuesta** de catálogo de ATC. **No lo aprueba ATC:** ATC lo entrega a Control de acceso (PJ-05) por el mecanismo del ADR-021 de PJ-05, con un cliente `CATALOG_REGISTRAR`, y desde ahí lo aprueba, lo asigna y lo cambia el área de Roles y Permisos (ADR-009, DT-03).

> Lo que dice PJ-05 en este documento (ADR-007, 008, 021; formato `MAE_SYSTEM_ROLE` y `MAE_MENU_OPTION`; permiso efectivo por opción y acción) es lo que cita el correo del Líder Técnico del 22-oct. Quien redacta este documento no ve ese apartado en Nexora y no lo verificó. **El formato exacto del permiso en el token lo fija PJ-05**; `ATC.<OPCIÓN>.<ACCIÓN>` es propuesta del equipo.

## 1 Qué es propuesta y qué viene de los documentos

| Dato | Origen |
|---|---|
| Los 5 roles `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` y `ATC_ADMIN_FUNCIONAL` | Revisión del Líder Técnico (C-02) |
| Los roles `ATC_CASES_DESK`, `ATC_CX` y `ATC_EVENT` | **Propuesta del equipo**: hay actores de las historias que los 5 roles no cubren (sección 8) |
| Qué rol puede cada operación | **Propuesta del equipo**, deducida del actor de cada historia del PLT-04 v1.3. Donde la historia no nombra el actor de la operación, se infiere y la columna «Base» lo dice |
| Las reglas de permiso (quién no puede, quién sí) | Criterios de aceptación de las historias, citados en cada fila |
| El nombre de las opciones y las acciones | Propuesta del equipo, en inglés como los módulos (ADR-001) |

## 2 Roles

| Rol | Quién es (actor de las historias) | Alcance sugerido | Origen |
|---|---|---|---|
| `ATC_AGENT` | Gestor de tickets, colaborador de área, referente de atención | Por empresa, o global para quien atiende las 11 razones sociales | Líder Técnico |
| `ATC_SUPERVISOR` | Supervisor ATC; supervisor o líder (HU-045) | Global o por empresa | Líder Técnico |
| `ATC_LEGAL` | Responsable legal de reclamos | Por empresa | Líder Técnico |
| `ATC_POSTVENTA` | Gestor de Postventa | Por empresa | Líder Técnico |
| `ATC_ADMIN_FUNCIONAL` | Administrador funcional (flujos, HU-043) | Global | Líder Técnico |
| `ATC_CASES_DESK` | Gestor de la Mesa de Casos (SGD) | Global | Propuesta |
| `ATC_CX` | Coordinador CX | Global | Propuesta |
| `ATC_EVENT` | Moderador de evento y personal de apoyo (Entrega Fest) | Por evento | Propuesta |
| `CUSTOMER` | Cliente de Mi Portal | No es un rol de ATC: es la cuenta `CUSTOMER` de Control de acceso (DT-04) | Líder Técnico |

**Quién recibe rol global y quién por empresa (C-08).** Según el Líder Técnico, los gestores que atienden las 11 razones sociales reciben del área un **rol global de ATC**; los demás, roles por empresa y cambian de empresa activa. El token distingue las dos formas (`realm_access.roles` y `company_roles`). **La lista de personas que van con rol global no está en los documentos**: la entrega el PO o la Gerencia ATC. En Mi Portal el filtro es el `PartyID` del token (ADR-011).

## 3 Opciones de menú y acciones


| Opción | Acciones (`ATC.<OPCIÓN>.<ACCIÓN>`) |
|---|---|
| `ATC.TICKETS` | `CREATE`, `VIEW`, `CHANGE_STATUS`, `ADD_INTERACTION`, `REFER`, `REOPEN`, `REASSIGN_BULK`, `CLOSE_ACTIVITY` |
| `ATC.SLA` | `VIEW` |
| `ATC.INBOX` | `VIEW`, `VIEW_LOCKER`, `MARK_LIGHTNING`, `VIEW_GUIDE`, `VIEW_DASHBOARD`, `VIEW_TEAM_DASHBOARD` |
| `ATC.WORKFLOWS` | `PUBLISH`, `VIEW` |
| `ATC.VIEWER` | `VIEW` |
| `ATC.AI_ASSIST` | `REQUEST`, `DECIDE` |
| `ATC.COMPLAINT_BOOK` | `CREATE`, `EXTEND`, `RESPOND`, `CREATE_APPEAL`, `RESOLVE_APPEAL` |
| `ATC.CUSTOMER360` | `SEARCH`, `VIEW`, `CALL`, `QUERY_ENGINE`, `SEARCH_DOCUMENTS` |
| `ATC.LEGAL_CASES` | `CREATE`, `RECLASSIFY`, `ISSUE_CHARGE`, `CLASSIFY_RISK`, `ESCALATE`, `VIEW`, `LINK`, `CLOSE`, `FLAG_CONFLICT`, `CLEAR_CONFLICT`, `BUILD_HANDOFF`, `CONFIRM_HANDOFF`, `RECORD_STATE_NOTE` |
| `ATC.AFTERSALES` | `CREATE_CLAIM`, `INSPECT`, `RESOLVE`, `ESCALATE`, `ADDENDUM` |
| `ATC.EVENT_CASES` | `CREATE`, `VIEW` |
| `ATC.FORMS` | `REGISTER_ENTRY`, `BOOK_BUS`, `CANCEL_BUS` |
| `ATC.PORTAL` | `VIEW_OWN`, `CREATE_OWN`, `VIEW_TRACE`, `REPLY`, `VIEW_TYPES`, `CONFIRM_SOLUTION` |

Total: 13 opciones y 59 permisos.

## 4 Matriz: operación del OpenAPI → permiso → roles

Cada operación del contrato (`aybar-atc.openapi.yaml` v0.3) declara su permiso en `x-permiso`. Son 59 operaciones; se retiraron `solicitarCodigo` y `abrirSesion` (DT-04), por lo que ya no son 61. «Base» es el actor de la historia que pide la operación.

| Operación | Permiso (`x-permiso`) | Roles | Base | Regla de la historia |
|---|---|---|---|---|
| `registrarTicket` | `ATC.TICKETS.CREATE` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-001 gestor de tickets | HU-001 CA-04: quien no es de atención no registra y el intento queda registrado |
| `obtenerTicket` | `ATC.TICKETS.VIEW` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK`, `ATC_CX` | HU-004, HU-050 | Por área: no ve áreas ajenas salvo que supervise (HU-044 CA-03) |
| `cambiarEstado` | `ATC.TICKETS.CHANGE_STATUS` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-004 colaborador de área | — |
| `registrarInteraccion` | `ATC.TICKETS.ADD_INTERACTION` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-005 colaborador de área | Notas internas no se muestran al cliente (HU-005 CA-03) |
| `derivarTicket` | `ATC.TICKETS.REFER` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-007 gestor de tickets | — |
| `reabrirTicket` | `ATC.TICKETS.REOPEN` | `ATC_SUPERVISOR` | HU-011 supervisor ATC | — |
| `reasignarEnBloque` | `ATC.TICKETS.REASSIGN_BULK` | `ATC_SUPERVISOR` | HU-008 supervisor ATC | HU-008 CA-03: solo el supervisor |
| `cerrarActividad` | `ATC.TICKETS.CLOSE_ACTIVITY` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-043 | — |
| `consultarSla` | `ATC.SLA.VIEW` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CX` | HU-003, HU-010 | — |
| `listarBandeja` | `ATC.INBOX.VIEW` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-044 gestor de tickets | Por área (HU-044 CA-03) |
| `listarCasillero` | `ATC.INBOX.VIEW_LOCKER` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-009 colaborador de área | — |
| `configurarFlujo` | `ATC.WORKFLOWS.PUBLISH` | `ATC_ADMIN_FUNCIONAL` | HU-043 administrador funcional | HU-043 CA-08: solo el administrador funcional; queda en bitácora |
| `listarPublicacionesFlujo` | `ATC.WORKFLOWS.VIEW` | `ATC_ADMIN_FUNCIONAL`, `ATC_SUPERVISOR` | HU-043 | — |
| `estadoVisor` | `ATC.VIEWER.VIEW` | `ATC_SUPERVISOR` | HU-067 supervisor ATC | Solo las áreas permitidas (HU-067 CA-07); el WebSocket /ws/visor exige el mismo permiso |
| `marcarRayo` | `ATC.INBOX.MARK_LIGHTNING` | `ATC_SUPERVISOR` | HU-045 supervisor o líder | HU-045 CA-02: solo el líder; tope del 10 % de la bandeja del área |
| `obtenerGuia` | `ATC.INBOX.VIEW_GUIDE` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-047 gestor de tickets | — |
| `pedirSugerenciaIa` | `ATC.AI_ASSIST.REQUEST` | `ATC_AGENT` | HU-048 gestor de tickets | Texto anonimizado (ADR-007) |
| `decidirSugerenciaIa` | `ATC.AI_ASSIST.DECIDE` | `ATC_AGENT` | HU-048 gestor de tickets | La IA sugiere, el gestor decide |
| `verTablero` | `ATC.INBOX.VIEW_DASHBOARD` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_CX` | HU-054, HU-030 | El tablero del equipo exige además ATC.INBOX.VIEW_TEAM_DASHBOARD (líder, HU-054 CA-03) |
| `registrarAsiento` | `ATC.COMPLAINT_BOOK.CREATE` | `ATC_LEGAL` | HU-012 responsable legal de reclamos | — |
| `prorrogarPlazo` | `ATC.COMPLAINT_BOOK.EXTEND` | `ATC_LEGAL` | HU-013 responsable legal de reclamos | Una sola prórroga |
| `registrarRespuestaFormal` | `ATC.COMPLAINT_BOOK.RESPOND` | `ATC_LEGAL` | HU-014 responsable legal de reclamos | — |
| `registrarApelacion` | `ATC.COMPLAINT_BOOK.CREATE_APPEAL` | `ATC_LEGAL` | HU-016 responsable legal de reclamos | — |
| `cambiarEstadoApelacion` | `ATC.COMPLAINT_BOOK.RESOLVE_APPEAL` | `ATC_LEGAL` | HU-016 responsable legal de reclamos | — |
| `buscarClientes` | `ATC.CUSTOMER360.SEARCH` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-049 gestor de tickets | Un cliente fuera del permiso del rol no aparece (RN-SVC-036) |
| `consulta360` | `ATC.CUSTOMER360.VIEW` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK` | HU-050 gestor de tickets | Cada rol ve solo sus secciones; las demás con candado (HU-050 CA-02, CA-07; RN-SVC-036) |
| `llamarCliente` | `ATC.CUSTOMER360.CALL` | `ATC_AGENT` | HU-049 gestor de tickets | — |
| `consultarMotor` | `ATC.CUSTOMER360.QUERY_ENGINE` | `ATC_AGENT` | HU-052 gestor de tickets | El permiso del rol decide qué dato; intento no permitido queda registrado (HU-052 CA-03) |
| `buscarDocumentos` | `ATC.CUSTOMER360.SEARCH_DOCUMENTS` | `ATC_AGENT` | HU-053 gestor de tickets | Un documento restringido no aparece (HU-053 CA-02) |
| `registrarCasoSensible` | `ATC.LEGAL_CASES.CREATE` | `ATC_CASES_DESK` | HU-020 gestor de la Mesa de Casos (SGD) | — |
| `reclasificarCaso` | `ATC.LEGAL_CASES.RECLASSIFY` | `ATC_CASES_DESK` | HU-020 | — |
| `emitirCargo` | `ATC.LEGAL_CASES.ISSUE_CHARGE` | `ATC_CASES_DESK` | HU-021 gestor de la Mesa de Casos (SGD) | — |
| `clasificarRiesgo` | `ATC.LEGAL_CASES.CLASSIFY_RISK` | `ATC_CASES_DESK` | HU-022 gestor de la Mesa de Casos (SGD) | Queda quién, cuándo y por qué |
| `escalarCaso` | `ATC.LEGAL_CASES.ESCALATE` | `ATC_CASES_DESK` | HU-023 gestor de la Mesa de Casos (SGD) | — |
| `buscarCoincidencias` | `ATC.LEGAL_CASES.VIEW` | `ATC_CASES_DESK`, `ATC_LEGAL` | HU-024 gestor de la Mesa de Casos (SGD) | — |
| `vincularCasos` | `ATC.LEGAL_CASES.LINK` | `ATC_CASES_DESK` | HU-024 gestor de la Mesa de Casos (SGD) | — |
| `cerrarCaso` | `ATC.LEGAL_CASES.CLOSE` | `ATC_CASES_DESK` | HU-025 gestor de la Mesa de Casos (SGD) | — |
| `marcarConflicto` | `ATC.LEGAL_CASES.FLAG_CONFLICT` | `ATC_AGENT`, `ATC_POSTVENTA` | HU-026 gestor de tickets o de Postventa | — |
| `retirarConflicto` | `ATC.LEGAL_CASES.CLEAR_CONFLICT` | `ATC_SUPERVISOR` | HU-026 supervisor | HU-026: solo supervisor; con justificación |
| `armarHandoff` | `ATC.LEGAL_CASES.BUILD_HANDOFF` | `ATC_AGENT`, `ATC_POSTVENTA` | HU-027 gestor de tickets | 6 elementos completos antes de enviar |
| `confirmarHandoff` | `ATC.LEGAL_CASES.CONFIRM_HANDOFF` | `ATC_LEGAL` | HU-027 eje destino | Rol del eje destino: por confirmar con el PO |
| `registrarNotaEstado` | `ATC.LEGAL_CASES.RECORD_STATE_NOTE` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-028 referente de atención | Sin palabras de juicio (HU-028 CA-03) |
| `registrarReclamoGarantia` | `ATC.AFTERSALES.CREATE_CLAIM` | `ATC_POSTVENTA` | HU-033, HU-034 gestor de Postventa | — |
| `registrarInspeccion` | `ATC.AFTERSALES.INSPECT` | `ATC_POSTVENTA` | HU-035 gestor de Postventa | — |
| `resolverReclamo` | `ATC.AFTERSALES.RESOLVE` | `ATC_POSTVENTA` | HU-035 gestor de Postventa | — |
| `escalarGarantia` | `ATC.AFTERSALES.ESCALATE` | `ATC_POSTVENTA` | HU-036 gestor de Postventa | — |
| `registrarAdenda` | `ATC.AFTERSALES.ADDENDUM` | `ATC_POSTVENTA` | HU-036 gestor de Postventa | — |
| `registrarFraseAncla` | `ATC.EVENT_CASES.CREATE` | `ATC_EVENT` | HU-037 moderador de evento | — |
| `registrarCasoEvento` | `ATC.EVENT_CASES.CREATE` | `ATC_EVENT`, `ATC_CX` | HU-038, HU-039 moderador, coordinador CX o apoyo | — |
| `listarCasosEvento` | `ATC.EVENT_CASES.VIEW` | `ATC_EVENT`, `ATC_CX`, `ATC_SUPERVISOR` | HU-039 coordinador CX o personal de apoyo | — |
| `registrarIngreso` | `ATC.FORMS.REGISTER_ENTRY` | sin rol de ATC (ver sección 8) | HU-059 personal de control de acceso | Sin rol de ATC: lo hace personal de control de acceso del proyecto; se pide al área |
| `reservarBus` | `ATC.FORMS.BOOK_BUS` | sin rol de ATC (ver sección 8) | HU-060 cliente convocado | Cliente convocado: se resuelve con la cuenta CUSTOMER (Mi Portal) o formulario público; por confirmar con el PO |
| `cancelarReserva` | `ATC.FORMS.CANCEL_BUS` | sin rol de ATC (ver sección 8) | HU-060 cliente convocado | Igual que reservarBus |
| `listarMisTickets` | `ATC.PORTAL.VIEW_OWN` | `CUSTOMER` | HU-064 cliente | Filtro por PartyID del token (HU-064 CA-02) |
| `registrarMiTicket` | `ATC.PORTAL.CREATE_OWN` | `CUSTOMER` | HU-064 cliente | — |
| `verTrazabilidad` | `ATC.PORTAL.VIEW_TRACE` | `CUSTOMER` | HU-065 cliente | Ticket ajeno: se rechaza y queda en la bitácora (HU-065 CA-04); sin notas internas ni nombre del gestor (CA-03) |
| `responderMiTicket` | `ATC.PORTAL.REPLY` | `CUSTOMER` | HU-066 cliente | — |
| `listarTiposPortal` | `ATC.PORTAL.VIEW_TYPES` | `CUSTOMER` | HU-064 cliente | — |
| `confirmarSolucion` | `ATC.PORTAL.CONFIRM_SOLUTION` | `CUSTOMER` | HU-066 cliente | El rechazo reabre el ticket |

Solo el tablero tiene un permiso adicional: la parte del equipo exige `ATC.INBOX.VIEW_TEAM_DASHBOARD` (`x-permiso-adicional` en el contrato).

## 5 Matriz: rol → permisos

**`ATC_AGENT`** (21): `ATC.TICKETS.CREATE`, `ATC.TICKETS.VIEW`, `ATC.TICKETS.CHANGE_STATUS`, `ATC.TICKETS.ADD_INTERACTION`, `ATC.TICKETS.REFER`, `ATC.TICKETS.CLOSE_ACTIVITY`, `ATC.SLA.VIEW`, `ATC.INBOX.VIEW`, `ATC.INBOX.VIEW_LOCKER`, `ATC.INBOX.VIEW_GUIDE`, `ATC.AI_ASSIST.REQUEST`, `ATC.AI_ASSIST.DECIDE`, `ATC.INBOX.VIEW_DASHBOARD`, `ATC.CUSTOMER360.SEARCH`, `ATC.CUSTOMER360.VIEW`, `ATC.CUSTOMER360.CALL`, `ATC.CUSTOMER360.QUERY_ENGINE`, `ATC.CUSTOMER360.SEARCH_DOCUMENTS`, `ATC.LEGAL_CASES.FLAG_CONFLICT`, `ATC.LEGAL_CASES.BUILD_HANDOFF`, `ATC.LEGAL_CASES.RECORD_STATE_NOTE`

**`ATC_SUPERVISOR`** (22): `ATC.TICKETS.CREATE`, `ATC.TICKETS.VIEW`, `ATC.TICKETS.CHANGE_STATUS`, `ATC.TICKETS.ADD_INTERACTION`, `ATC.TICKETS.REFER`, `ATC.TICKETS.REOPEN`, `ATC.TICKETS.REASSIGN_BULK`, `ATC.TICKETS.CLOSE_ACTIVITY`, `ATC.SLA.VIEW`, `ATC.INBOX.VIEW`, `ATC.INBOX.VIEW_LOCKER`, `ATC.WORKFLOWS.VIEW`, `ATC.VIEWER.VIEW`, `ATC.INBOX.MARK_LIGHTNING`, `ATC.INBOX.VIEW_GUIDE`, `ATC.INBOX.VIEW_DASHBOARD`, `ATC.CUSTOMER360.SEARCH`, `ATC.CUSTOMER360.VIEW`, `ATC.LEGAL_CASES.CLEAR_CONFLICT`, `ATC.LEGAL_CASES.RECORD_STATE_NOTE`, `ATC.EVENT_CASES.VIEW`, `ATC.INBOX.VIEW_TEAM_DASHBOARD`

**`ATC_LEGAL`** (16): `ATC.TICKETS.VIEW`, `ATC.TICKETS.CHANGE_STATUS`, `ATC.TICKETS.ADD_INTERACTION`, `ATC.TICKETS.CLOSE_ACTIVITY`, `ATC.SLA.VIEW`, `ATC.INBOX.VIEW`, `ATC.INBOX.VIEW_LOCKER`, `ATC.COMPLAINT_BOOK.CREATE`, `ATC.COMPLAINT_BOOK.EXTEND`, `ATC.COMPLAINT_BOOK.RESPOND`, `ATC.COMPLAINT_BOOK.CREATE_APPEAL`, `ATC.COMPLAINT_BOOK.RESOLVE_APPEAL`, `ATC.CUSTOMER360.VIEW`, `ATC.LEGAL_CASES.VIEW`, `ATC.LEGAL_CASES.CONFIRM_HANDOFF`, `ATC.LEGAL_CASES.RECORD_STATE_NOTE`

**`ATC_POSTVENTA`** (16): `ATC.TICKETS.VIEW`, `ATC.TICKETS.CHANGE_STATUS`, `ATC.TICKETS.ADD_INTERACTION`, `ATC.TICKETS.CLOSE_ACTIVITY`, `ATC.SLA.VIEW`, `ATC.INBOX.VIEW`, `ATC.INBOX.VIEW_LOCKER`, `ATC.CUSTOMER360.VIEW`, `ATC.LEGAL_CASES.FLAG_CONFLICT`, `ATC.LEGAL_CASES.BUILD_HANDOFF`, `ATC.LEGAL_CASES.RECORD_STATE_NOTE`, `ATC.AFTERSALES.CREATE_CLAIM`, `ATC.AFTERSALES.INSPECT`, `ATC.AFTERSALES.RESOLVE`, `ATC.AFTERSALES.ESCALATE`, `ATC.AFTERSALES.ADDENDUM`

**`ATC_ADMIN_FUNCIONAL`** (2): `ATC.WORKFLOWS.PUBLISH`, `ATC.WORKFLOWS.VIEW`

**`ATC_CASES_DESK`** (10): `ATC.TICKETS.VIEW`, `ATC.CUSTOMER360.VIEW`, `ATC.LEGAL_CASES.CREATE`, `ATC.LEGAL_CASES.RECLASSIFY`, `ATC.LEGAL_CASES.ISSUE_CHARGE`, `ATC.LEGAL_CASES.CLASSIFY_RISK`, `ATC.LEGAL_CASES.ESCALATE`, `ATC.LEGAL_CASES.VIEW`, `ATC.LEGAL_CASES.LINK`, `ATC.LEGAL_CASES.CLOSE`

**`ATC_CX`** (6): `ATC.TICKETS.VIEW`, `ATC.SLA.VIEW`, `ATC.INBOX.VIEW_DASHBOARD`, `ATC.EVENT_CASES.CREATE`, `ATC.EVENT_CASES.VIEW`, `ATC.INBOX.VIEW_TEAM_DASHBOARD`

**`ATC_EVENT`** (2): `ATC.EVENT_CASES.CREATE`, `ATC.EVENT_CASES.VIEW`

**`CUSTOMER`** (6): `ATC.PORTAL.VIEW_OWN`, `ATC.PORTAL.CREATE_OWN`, `ATC.PORTAL.VIEW_TRACE`, `ATC.PORTAL.REPLY`, `ATC.PORTAL.VIEW_TYPES`, `ATC.PORTAL.CONFIRM_SOLUTION`

## 6 Reglas de alcance que no son un permiso

| Regla | Cómo se aplica | Fuente |
|---|---|---|
| Empresa | Roles globales ∪ roles de la empresa activa. Toda lectura se filtra según el tipo de rol del token | C-08; ADR-009 |
| Área | El gestor no ve tickets de áreas ajenas salvo que supervise | HU-044 CA-03 |
| Secciones de la consulta 360 | Cada rol ve solo los datos que su permiso permite; los demás aparecen con candado | HU-050 CA-02, CA-07; RN-SVC-036 |
| Visor 3D | Solo las áreas permitidas | HU-067 CA-07 |
| Tablero | El del gestor es solo suyo; el del equipo lo ve su líder | HU-054 CA-03 |
| Cliente | Solo ve sus tickets: filtro por `PartyID` del token; el ticket de otro cliente se rechaza y queda en la bitácora | HU-064 CA-02; HU-065 CA-04 |
| Intentos denegados | Quedan registrados: registrar un ticket sin rol de atención (HU-001 CA-04), consultar al motor un dato no permitido (HU-052 CA-03), abrir el ticket de otro cliente (HU-065 CA-04) | Historias citadas |

## 7 Incompatibilidades

La segregación de funciones (SoD) la administra Control de acceso. Lo que ATC propone entregar con su catálogo:

| Incompatibilidad | Razón | Estado |
|---|---|---|
| `ATC_ADMIN_FUNCIONAL` con `ATC_AGENT` y con `ATC_SUPERVISOR` | Quien publica los flujos no atiende ni supervisa los tickets que esos flujos gobiernan | **Propuesta del equipo, sin respaldo en las historias.** La confirman el Líder Técnico y Control de acceso |

Las demás reglas de «solo el supervisor» (HU-008 CA-03, HU-026, HU-045 CA-02) se resuelven con el permiso, no con una incompatibilidad.

## 8 Actores de las historias sin rol en la lista del Líder Técnico

| Actor | Historias | Qué se propone |
|---|---|---|
| Gestor de la Mesa de Casos (SGD) | HU-020 a HU-025 | Rol `ATC_CASES_DESK` |
| Coordinador CX | HU-029 a HU-031, HU-039, HU-041 | Rol `ATC_CX` |
| Moderador de evento y personal de apoyo | HU-037 a HU-039 | Rol `ATC_EVENT` |
| Personal de control de acceso del proyecto | HU-059 | Sin rol de ATC: es personal de otra área; se pide a Control de acceso cómo se identifica |
| Cliente convocado al Entrega Fest | HU-060 | Cuenta `CUSTOMER`, o un formulario sin sesión: por confirmar con el PO |
| Analista de Cobranza | HU-056, HU-057 | Los casos los abre un job (ADR-005); el analista no tiene operación en el contrato |
| Responsable de proyecto | HU-058 | Recibe una carta; no tiene operación en el contrato |
| CDO | HU-032 | La auditoría es un job (ADR-005); sin operación en el contrato |
| Rol del eje destino que confirma un handoff | HU-027 | Se asignó a `ATC_LEGAL`: por confirmar con el PO |

## 9 Preguntas abiertas (P-028)

1. ¿«Líder» (HU-045 CA-02) es el rol `ATC_SUPERVISOR` o la jefatura que administra Control de acceso? Si es la jefatura, la regla se resuelve consultando a Control de acceso (ADR-009) y no con un rol.
2. ¿Cuál es el formato exacto del permiso en el token? (PJ-05 ADR-007 y 021.)
3. ¿Quiénes reciben rol global y quiénes por empresa? (lista de personas.)
4. ¿Se aceptan los tres roles propuestos (`ATC_CASES_DESK`, `ATC_CX`, `ATC_EVENT`) o se asignan esos permisos a los cinco roles de la lista?
5. ¿Qué gestores necesitan `PROSPECT_VALIDATOR` para resolver el caso «correo distinto» en la consola de Control de acceso (C-06)? El tipo de ticket «correo distinto» es alcance nuevo y lo decide el PO.
6. ¿Cómo se identifican en ATC el personal de control de acceso (HU-059) y el cliente convocado (HU-060)?
7. ¿Se acepta la incompatibilidad de la sección 7?

## 10 Cómo se entrega el catálogo

1. Control de acceso registra a ATC un cliente con permiso `CATALOG_REGISTRAR` (P-026).
2. ATC entrega **una sola vez** sus roles, opciones, acciones e incompatibilidades por el mecanismo del ADR-021 de PJ-05. El formato exacto lo da Control de acceso.
3. El área aprueba el catálogo, invita a los gestores como cuentas `EMPLOYEE` y les asigna los roles.
4. Un rol nuevo, o un permiso nuevo, se le solicita al área; ATC no lo crea.
5. ATC declara el `x-permiso` de cada operación en el contrato y lo exige con `@PreAuthorize`.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-22 | Jesús Chávez Elías, con IA | Primera versión: roles, opciones, acciones, matriz por operación y por rol, alcance, incompatibilidad propuesta, actores sin rol y preguntas abiertas |

Generado por IA: documento completo (Claude, 2026-10-22), a partir de la revisión del Líder Técnico del 22-oct, las 62 historias de Nexora (actores y criterios de aceptación) y el contrato OpenAPI v5. — Revisado por: (pendiente) · Aprueba: TL
