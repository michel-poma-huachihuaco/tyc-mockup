---
id: "SPEC-ARQ-ROLES-ATC"
tipo: "spec"
titulo: "Roles y permisos de ATC: catálogo que ATC entrega a Control de acceso"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-009, ADR-010, ADR-011, ADR-014]
tags: [arquitectura, seguridad, roles, g3]
---

# Roles y permisos de ATC

Resuelve las colisiones C-02 (no había catálogo de ATC) y C-08 (asignación global o por empresa) de la revisión del Líder Técnico (Jose Jara, 22-oct-2026), con DT-03 (`analisis/decisiones.md` v0.5). Es la **propuesta** de catálogo de ATC. **No la aprueba ATC:** ATC la entrega a Control de acceso (PJ-05) por el mecanismo del ADR-021 de PJ-05 y desde ahí la aprueba, la asigna y la cambia el área de Roles y Permisos (Sony Montoya) (ADR-009).

**Fuentes verificadas el 26-oct** en la copia sellada del paquete **aprobado** de Control de acceso (`docs-roles-y-permisos/`, traída de Nexora el 22-oct; el perfil desarrollador recibe 403 al leer PJ-05 en Nexora). ⚠ marca lo que sale de los 7 archivos de esa copia que no coinciden con la huella del sello (recalculada el 26-oct): `arquitectura/access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003` (credencial local), `HU-IDN-014` (permisos de menú por rol), `HU-IDN-054` (otorgar `CATALOG_REGISTRAR` a una cuenta de servicio), `HU-IDN-057` (aprobar o rechazar lo registrado por un microservicio) y `HU-IDN-059` (validar prospecto). Lo que se cita de ellos se confirma con la versión aprobada (P-039).

| Hecho de PJ-05 | Dónde |
|---|---|
| El catálogo se registra en tres partes: opciones de menú (código, nombre, tipo `MENU`, `SUBMENU` o `ACTION`, padre), roles, y permisos por rol y opción con cinco acciones (`ver`, `crear`, `editar`, `eliminar`, `aprobar`), más incompatibilidades (par de roles, alcance, `BLOCK` o `WARN_AND_LOG`, motivo) | ADR-021 PJ-05 (Contexto y Decisión 2); ⚠ esquemas `LoteDeOpcionesDeMenu`, `LoteDeRolesPermisosEIncompatibilidades` y `AccionesPermitidas`; ⚠ `HU-IDN-014` |
| Solo registra una cuenta de servicio (`client_credentials`) con el rol de cliente `CATALOG_REGISTRAR`; todo nace inactivo y lo aprueba una persona con `ROLE_IT_ADMIN`, una tarea por fila; nadie se auto-aprueba | ADR-021 PJ-05 (Decisión 1 a 5); D-61; ⚠ `HU-IDN-054` y `HU-IDN-057` |
| Un servicio solo da permisos sobre las opciones que él registró y solo declara incompatibilidades entre sus propios roles; un código de rol no puede repetir un rol sembrado. Los sembrados son **9**: los 8 de D-30 (`ADMIN`, `IT_ADMIN`, `PROSPECT`, `CUSTOMER`, `BROKER`, `SECURITY_BATCH`, `DATA_PROTECTION_OFFICER` y `SENSITIVE_ACCESS_APPROVER`) y `PROSPECT_VALIDATOR`, que suma D-176. D-281 todavía habla de «los 8 roles de D-30». Ningún rol de ATC coincide con los 9 | ADR-021 PJ-05 (Decisión 2); D-30, D-66, D-176 y D-281; ⚠ `AYB-RCD-422` |
| La ruta para otorgar o retirar `CATALOG_REGISTRAR` y las de cambiar o retirar roles y opciones siguen en `x-estado: propuesta` | D-171; ⚠ `access-control.openapi.yaml:41-52` |
| El token trae **roles, no permisos**: `realm_access.roles` (globales) y `company_roles` (por empresa), con `companyId` (empresa activa), `user_account_id`, `preferred_username`, `sid` y `aybar_nivel`. **No trae `PartyID`** | ADR-012 PJ-05 (Decisión); `arquitectura/arquitectura-tecnica.md:976-988` |
| El permiso efectivo (opción y acción) lo calcula Control de acceso sobre su base; el token sirve para «el filtro grueso de `@PreAuthorize`» | ADR-007 PJ-05 (Opción B y Decisión); ⚠ `consultarMiPermiso` (`GET /api/v1/mi/permisos/{codigoOpcion}?accion=`) |
| `companyId` y `company_roles` no viajan para `CUSTOMER`, `BROKER`, `PROSPECT` ni para un `EMPLOYEE` sin roles por empresa; cambiar de empresa renueva el token | D-178 |
| `CUSTOMER`, `BROKER`, `PROSPECT`, `PROSPECT_VALIDATOR`, `IT_ADMIN` y los demás roles sembrados son de Control de acceso; `ATC_AGENT` lo registra el microservicio de ATC | D-30, D-176; ADR-021 PJ-05 (Contexto); ⚠ `HU-IDN-059` |
| El permiso efectivo es la unión de los roles vigentes por las dos vías (globales y de la empresa activa), acumulativa y sin negación; la incompatibilidad (SoD) se evalúa sobre esa misma unión | ADR-007 PJ-05 (Decisión); ADR-008 PJ-05; ADR-003 PJ-05 |

## 1 Qué es propuesta y qué viene de los documentos

| Dato | Origen |
|---|---|
| Los 5 roles `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` y `ATC_ADMIN_FUNCIONAL` | Revisión del Líder Técnico (C-02) |
| Los roles `ATC_CASES_DESK`, `ATC_CX`, `ATC_EVENT` y `ATC_SITE_ACCESS` | **Propuesta del equipo**: actores de las historias que los 5 roles no cubren (sección 10) |
| El formato del catálogo (árbol de opciones, permiso = opción + una de las cinco acciones) | PJ-05 (tabla anterior) |
| Los códigos de las opciones y qué acción usa cada operación | Propuesta del equipo, en inglés como los módulos (ADR-001) |
| Qué rol puede cada operación | Propuesta del equipo, deducida del actor de cada historia del PLT-04 v1.3; la columna «Base» lo dice |
| Las reglas de permiso (quién no puede, quién sí) | Criterios de aceptación de las historias, citados en cada fila |

## 2 Roles

| Rol | Quién es (actor de las historias) | Alcance sugerido | Origen |
|---|---|---|---|
| `ATC_AGENT` | Gestor de tickets, colaborador de área y referente de atención | Por empresa, o global para quien atiende las 11 razones sociales | Líder Técnico (C-02) |
| `ATC_SUPERVISOR` | Supervisor ATC; líder de equipo (HU-045, HU-054) mientras P-028 y P-036 no digan otra cosa | Global o por empresa | Líder Técnico (C-02) |
| `ATC_LEGAL` | Responsable legal de reclamos; eje destino del handoff (por confirmar con el PO) | Por empresa | Líder Técnico (C-02) |
| `ATC_POSTVENTA` | Gestor de Postventa | Por empresa | Líder Técnico (C-02) |
| `ATC_ADMIN_FUNCIONAL` | Administrador funcional de flujos (HU-043) | Global | Líder Técnico (C-02) |
| `ATC_CASES_DESK` | Gestor de la Mesa de Casos (SGD), HU-020 a 025 | Global | Propuesta del equipo |
| `ATC_CX` | Coordinador CX, HU-029 a 031, 039 y 041 | Global | Propuesta del equipo |
| `ATC_EVENT` | Moderador y personal de apoyo del Entrega Fest, HU-037 a 039 | Por empresa | Propuesta del equipo |
| `ATC_SITE_ACCESS` | Personal de control de acceso del proyecto, HU-059 | Por empresa | Propuesta del equipo |
| `CUSTOMER` | Cliente de Mi Portal (HU-064 a 066) y cliente convocado al Entrega Fest (HU-060) | No es un rol de ATC: lo siembra Control de acceso (D-30). ATC solo registra sus permisos sobre `ATC.PORTAL` (supuesto S-2) | Control de acceso |

**Roles que ATC no registra.** `CUSTOMER`, `PROSPECT` y `PROSPECT_VALIDATOR` son de Control de acceso (D-30, D-176). Mi Portal **no acepta `PROSPECT`**: una operación acepta ese rol solo si el microservicio lo decide (D-62) y las historias HU-064 a 066 hablan de clientes; si el PO quiere abrirlo a prospectos, cambia este catálogo. `PROSPECT_VALIDATOR` lo necesitan los gestores que validen prospectos en la consola de Control de acceso (C-06): `analisis/proceso-atencion-prospectos.md` v0.1 §5 propone a los gestores de la cola `ATC` asignados al tipo «Registro y acceso de clientes» (al menos dos) y a su supervisor; la lista con nombres la entrega la Gerencia ATC y el alcance lo decide el PO (P-041).

## 3 Asignación global o por empresa (C-08)

Las asignaciones las hace Control de acceso (`asignarRol` para un rol global y `asignarRolPorEmpresa` para uno por empresa, con `ROLE_IT_ADMIN`); ATC no asigna.

| Caso | Cómo llega en el token | Qué ve en ATC |
|---|---|---|
| Gestor que atiende las 11 razones sociales | Rol de ATC **global**, en `realm_access.roles`. Sin roles por empresa, el token puede llegar sin `companyId` (D-178; P-034) | Las 11 empresas. Puede filtrar por empresa en la consulta |
| Gestor de una o varias empresas | Rol de ATC **por empresa**, en `company_roles`, y la empresa activa en `companyId`. Cambiar de empresa renueva el token (D-178) | Solo la empresa activa |
| Gestor con los dos | La unión de los dos (`ROLE_*` de `realm_access.roles` ∪ `company_roles[companyId]`) | **Depende de la operación** (regla de abajo): las 11 empresas en las operaciones que su rol global autoriza; solo la empresa activa en las que solo autoriza su rol por empresa |
| Cliente (`CUSTOMER`) | Sin `companyId` ni `company_roles` (D-178) | Solo sus tickets, filtrados por su `PartyID` (sección 7, S-3) |

**Regla de ATC (combinación de un rol global y uno por empresa):**

1. **Si la operación se permite** lo decide la unión de los dos caminos, igual que el permiso efectivo de Control de acceso (ADR-007 de PJ-05): `@PreAuthorize(hasAnyRole(<x-roles>))` sobre los `ROLE_*` que arma el SDK con los roles globales y los de la empresa activa.
2. **Sobre qué empresas actúa** se calcula **por operación**, solo con los roles que la autorizan. Sea `R` el conjunto de `x-roles` de la operación: si `R ∩ roles globales` (`AybarUserContext.roles`) no está vacío, el alcance son las 11 razones sociales; si solo `R ∩ rolesDe(companyId)` no está vacío, el alcance es `{companyId}`. Un rol que no está en `R` nunca amplía el alcance. Los roles de empresas que no son la activa no cuentan: cambiar de empresa renueva el token (D-178).
3. **Ejemplo que la regla impide:** `ATC_AGENT` global con `ATC_SUPERVISOR` solo en la empresa X. Pasa `@PreAuthorize` de `reasignarEnBloque` (`x-roles: ATC_SUPERVISOR`), pero como `ATC_SUPERVISOR` solo llega por la empresa X, reasigna únicamente tickets de X. En `listarBandeja`, que autoriza `ATC_AGENT`, ve las 11.
4. **Dónde vive y cómo se prueba:** un solo componente de `application` (`AlcanceDeEmpresa`) recibe los `x-roles` de la operación y el `AybarUserContext` y devuelve el conjunto de empresas. Todos los casos de uso con filtro de empresa lo usan, y ninguno lee `companyId` directamente. Prueba obligatoria: la combinación del punto 3 y sus variantes (solo global, solo por empresa, los dos con el mismo rol).
5. **Incompatibilidad que lo acompaña:** sección 9.

**Quiénes van con rol global no está en los documentos:** la lista de personas la entrega el PO o la Gerencia ATC al área de Roles y Permisos (P-028).

## 4 Opciones de menú

Árbol en el formato de PJ-05: un `MENU` sin padre, `SUBMENU` bajo un `MENU` o `SUBMENU`, y `ACTION` como hoja. 31 opciones (1 `MENU`, 17 `SUBMENU` y 13 `ACTION`). Una pantalla es un `SUBMENU`; una acción dentro de una pantalla es un `ACTION`.

| Código | Tipo | Padre | Nombre | Operaciones |
|---|---|---|---|---|
| `ATC` | MENU | — | Aybar Atiende | — (agrupa) |
| `ATC.TICKETS` | SUBMENU | `ATC` | Tickets | `registrarTicket` (crear), `obtenerTicket` (ver), `cambiarEstado` (editar), `registrarInteraccion` (editar), `cerrarActividad` (editar) |
| `ATC.TICKETS.SLA` | ACTION | `ATC.TICKETS` | SLA del ticket | `consultarSla` (ver) |
| `ATC.TICKETS.REFER` | ACTION | `ATC.TICKETS` | Derivar a otra área | `derivarTicket` (editar) |
| `ATC.TICKETS.REOPEN` | ACTION | `ATC.TICKETS` | Reabrir | `reabrirTicket` (editar) |
| `ATC.TICKETS.REASSIGN_BULK` | ACTION | `ATC.TICKETS` | Reasignar en bloque | `reasignarEnBloque` (editar) |
| `ATC.TICKETS.GUIDE` | ACTION | `ATC.TICKETS` | Guía de solución | `obtenerGuia` (ver) |
| `ATC.TICKETS.AI_ASSIST` | ACTION | `ATC.TICKETS` | Asistencia de IA | `pedirSugerenciaIa` (crear), `decidirSugerenciaIa` (editar) |
| `ATC.TICKETS.LEGAL_GATE` | ACTION | `ATC.TICKETS` | Señal de conflicto y handoff a Eje 3 | `marcarConflicto` (crear), `retirarConflicto` (eliminar), `armarHandoff` (crear), `confirmarHandoff` (aprobar) |
| `ATC.TICKETS.STATE_NOTE` | ACTION | `ATC.TICKETS` | Nota de estado emocional | `registrarNotaEstado` (crear) |
| `ATC.INBOX` | SUBMENU | `ATC` | Bandeja | `listarBandeja` (ver) |
| `ATC.INBOX.LOCKER` | SUBMENU | `ATC.INBOX` | Casillero de tareas | `listarCasillero` (ver) |
| `ATC.INBOX.LIGHTNING` | ACTION | `ATC.INBOX` | Rayo de prioridad | `marcarRayo` (crear) |
| `ATC.DASHBOARD` | SUBMENU | `ATC` | Tablero de avance | `verTablero` (ver) |
| `ATC.DASHBOARD.TEAM` | SUBMENU | `ATC.DASHBOARD` | Tablero del equipo | `verTablero` (ver) |
| `ATC.VIEWER` | SUBMENU | `ATC` | Visor 3D | `estadoVisor` (ver) |
| `ATC.WORKFLOWS` | SUBMENU | `ATC` | Flujos por área | `configurarFlujo` (editar), `listarPublicacionesFlujo` (ver) |
| `ATC.COMPLAINT_BOOK` | SUBMENU | `ATC` | Libro de Reclamaciones | `registrarAsiento` (crear), `prorrogarPlazo` (editar), `registrarRespuestaFormal` (editar) |
| `ATC.COMPLAINT_BOOK.APPEALS` | SUBMENU | `ATC.COMPLAINT_BOOK` | Apelaciones | `registrarApelacion` (crear), `cambiarEstadoApelacion` (editar) |
| `ATC.CUSTOMER360` | SUBMENU | `ATC` | Consulta 360 del cliente | `consulta360` (ver) |
| `ATC.CUSTOMER360.SEARCH` | SUBMENU | `ATC.CUSTOMER360` | Búsqueda de clientes | `buscarClientes` (ver) |
| `ATC.CUSTOMER360.CALL` | ACTION | `ATC.CUSTOMER360` | Llamar al cliente | `llamarCliente` (crear) |
| `ATC.CUSTOMER360.QUERY_ENGINE` | ACTION | `ATC.CUSTOMER360` | Consulta al motor de José | `consultarMotor` (ver) |
| `ATC.CUSTOMER360.DOCUMENTS` | ACTION | `ATC.CUSTOMER360` | Búsqueda de documentos | `buscarDocumentos` (ver) |
| `ATC.LEGAL_CASES` | SUBMENU | `ATC` | Mesa de casos sensibles (SGD) | `registrarCasoSensible` (crear), `reclasificarCaso` (editar), `emitirCargo` (crear), `clasificarRiesgo` (editar), `escalarCaso` (editar), `buscarCoincidencias` (ver), `vincularCasos` (editar), `cerrarCaso` (editar) |
| `ATC.AFTERSALES` | SUBMENU | `ATC` | Garantías postventa | `registrarReclamoGarantia` (crear), `registrarInspeccion` (crear), `resolverReclamo` (editar), `escalarGarantia` (editar), `registrarAdenda` (crear) |
| `ATC.EVENT_CASES` | SUBMENU | `ATC` | Entrega Fest | `registrarCasoEvento` (crear), `listarCasosEvento` (ver) |
| `ATC.EVENT_CASES.ANCHOR_PHRASES` | ACTION | `ATC.EVENT_CASES` | Frases Ancla | `registrarFraseAncla` (crear) |
| `ATC.SITE_ENTRY` | SUBMENU | `ATC` | Ingreso al proyecto | `registrarIngreso` (crear) |
| `ATC.PORTAL` | SUBMENU | `ATC` | Mi Portal | `listarMisTickets` (ver), `registrarMiTicket` (crear), `verTrazabilidad` (ver), `responderMiTicket` (editar), `listarTiposPortal` (ver), `confirmarSolucion` (aprobar) |
| `ATC.PORTAL.BUS_BOOKING` | SUBMENU | `ATC.PORTAL` | Reserva de bus del Entrega Fest | `reservarBus` (crear), `cancelarReserva` (eliminar) |

## 5 Matriz: operación del OpenAPI → permiso → roles

Cada operación del contrato (`aybar-atc.openapi.yaml` 0.5.0-borrador) declara su permiso en `x-permiso`, con la forma que usa PJ-05 en su propio contrato (`<opción> + <acción>`), y los roles que exige `@PreAuthorize` en `x-roles`. Son 59 operaciones y 45 pares opción + acción distintos; las operaciones que comparten un par tienen los mismos roles (lo comprueba el script que genera esta tabla). «Base» es el actor de la historia que pide la operación.

| Operación | `x-permiso` (opción + acción) | `x-roles` | Base (historia) |
|---|---|---|---|
| `registrarTicket` | `ATC.TICKETS + crear` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-001 CA-04: quien no es de atención no registra; el intento queda registrado |
| `obtenerTicket` | `ATC.TICKETS + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK`, `ATC_CX` | HU-004, HU-050; por área (HU-044 CA-03) |
| `cambiarEstado` | `ATC.TICKETS + editar` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-004, HU-026 |
| `registrarInteraccion` | `ATC.TICKETS + editar` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-005; notas internas no se muestran al cliente (CA-03) |
| `cerrarActividad` | `ATC.TICKETS + editar` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-043 CA-04 |
| `derivarTicket` | `ATC.TICKETS.REFER + editar` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-007 (gestor de tickets) |
| `reabrirTicket` | `ATC.TICKETS.REOPEN + editar` | `ATC_SUPERVISOR` | HU-011 (supervisor ATC) |
| `reasignarEnBloque` | `ATC.TICKETS.REASSIGN_BULK + editar` | `ATC_SUPERVISOR` | HU-008 CA-03: solo el supervisor |
| `consultarSla` | `ATC.TICKETS.SLA + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CX` | HU-003, HU-010 |
| `obtenerGuia` | `ATC.TICKETS.GUIDE + ver` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-047 (gestor de tickets) |
| `pedirSugerenciaIa` | `ATC.TICKETS.AI_ASSIST + crear` | `ATC_AGENT` | HU-048; texto anonimizado (ADR-007) |
| `decidirSugerenciaIa` | `ATC.TICKETS.AI_ASSIST + editar` | `ATC_AGENT` | HU-048: la IA sugiere, el gestor decide |
| `marcarConflicto` | `ATC.TICKETS.LEGAL_GATE + crear` | `ATC_AGENT`, `ATC_POSTVENTA` | HU-026 (gestor de tickets o de Postventa) |
| `retirarConflicto` | `ATC.TICKETS.LEGAL_GATE + eliminar` | `ATC_SUPERVISOR` | HU-026 CA-03: solo el supervisor, con justificación |
| `armarHandoff` | `ATC.TICKETS.LEGAL_GATE + crear` | `ATC_AGENT`, `ATC_POSTVENTA` | HU-027 CA-01: 6 elementos completos |
| `confirmarHandoff` | `ATC.TICKETS.LEGAL_GATE + aprobar` | `ATC_LEGAL` | HU-027 CA-02: confirma el eje destino (rol por confirmar con el PO) |
| `registrarNotaEstado` | `ATC.TICKETS.STATE_NOTE + crear` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-028 CA-03: sin palabras de juicio |
| `listarBandeja` | `ATC.INBOX + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-044 CA-03: por área |
| `listarCasillero` | `ATC.INBOX.LOCKER + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-009 |
| `marcarRayo` | `ATC.INBOX.LIGHTNING + crear` | `ATC_SUPERVISOR` | HU-045 CA-02: solo el líder (P-028, P-036) |
| `verTablero` | `ATC.DASHBOARD + ver`; además `ATC.DASHBOARD.TEAM + ver` para la parte del equipo (`ATC_SUPERVISOR`, `ATC_CX`) | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_CX` | HU-054, HU-030; el del equipo exige además ATC.DASHBOARD.TEAM + ver |
| `estadoVisor` | `ATC.VIEWER + ver` | `ATC_SUPERVISOR` | HU-067 CA-07: solo las áreas permitidas; /ws/visor exige lo mismo |
| `configurarFlujo` | `ATC.WORKFLOWS + editar` | `ATC_ADMIN_FUNCIONAL` | HU-043 CA-08: solo el administrador funcional; queda en bitácora |
| `listarPublicacionesFlujo` | `ATC.WORKFLOWS + ver` | `ATC_ADMIN_FUNCIONAL`, `ATC_SUPERVISOR` | HU-043 CA-08 |
| `registrarAsiento` | `ATC.COMPLAINT_BOOK + crear` | `ATC_LEGAL` | HU-012 (responsable legal de reclamos) |
| `prorrogarPlazo` | `ATC.COMPLAINT_BOOK + editar` | `ATC_LEGAL` | HU-013: una sola prórroga |
| `registrarRespuestaFormal` | `ATC.COMPLAINT_BOOK + editar` | `ATC_LEGAL` | HU-014 |
| `registrarApelacion` | `ATC.COMPLAINT_BOOK.APPEALS + crear` | `ATC_LEGAL` | HU-016 |
| `cambiarEstadoApelacion` | `ATC.COMPLAINT_BOOK.APPEALS + editar` | `ATC_LEGAL` | HU-016 |
| `buscarClientes` | `ATC.CUSTOMER360.SEARCH + ver` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-049; RN-SVC-036 |
| `consulta360` | `ATC.CUSTOMER360 + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK` | HU-050 CA-02, CA-07: secciones con candado según el rol |
| `llamarCliente` | `ATC.CUSTOMER360.CALL + crear` | `ATC_AGENT` | HU-049 |
| `consultarMotor` | `ATC.CUSTOMER360.QUERY_ENGINE + ver` | `ATC_AGENT` | HU-052 CA-03: dato no permitido, intento registrado |
| `buscarDocumentos` | `ATC.CUSTOMER360.DOCUMENTS + ver` | `ATC_AGENT` | HU-053 CA-02: documento restringido no aparece |
| `registrarCasoSensible` | `ATC.LEGAL_CASES + crear` | `ATC_CASES_DESK` | HU-020 (gestor de la Mesa SGD) |
| `reclasificarCaso` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-020 CA-02 |
| `emitirCargo` | `ATC.LEGAL_CASES + crear` | `ATC_CASES_DESK` | HU-021 |
| `clasificarRiesgo` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-022: queda quién, cuándo y por qué |
| `escalarCaso` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-023 |
| `buscarCoincidencias` | `ATC.LEGAL_CASES + ver` | `ATC_CASES_DESK`, `ATC_LEGAL` | HU-024 |
| `vincularCasos` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-024 |
| `cerrarCaso` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-025 |
| `registrarReclamoGarantia` | `ATC.AFTERSALES + crear` | `ATC_POSTVENTA` | HU-033, HU-034 (gestor de Postventa) |
| `registrarInspeccion` | `ATC.AFTERSALES + crear` | `ATC_POSTVENTA` | HU-035 |
| `resolverReclamo` | `ATC.AFTERSALES + editar` | `ATC_POSTVENTA` | HU-035 |
| `escalarGarantia` | `ATC.AFTERSALES + editar` | `ATC_POSTVENTA` | HU-036 |
| `registrarAdenda` | `ATC.AFTERSALES + crear` | `ATC_POSTVENTA` | HU-036 |
| `registrarFraseAncla` | `ATC.EVENT_CASES.ANCHOR_PHRASES + crear` | `ATC_EVENT` | HU-037 (moderador de evento) |
| `registrarCasoEvento` | `ATC.EVENT_CASES + crear` | `ATC_EVENT`, `ATC_CX` | HU-038, HU-039 |
| `listarCasosEvento` | `ATC.EVENT_CASES + ver` | `ATC_EVENT`, `ATC_CX`, `ATC_SUPERVISOR` | HU-039 |
| `registrarIngreso` | `ATC.SITE_ENTRY + crear` | `ATC_SITE_ACCESS` | HU-059 (personal de control de acceso del proyecto; rol propuesto) |
| `reservarBus` | `ATC.PORTAL.BUS_BOOKING + crear` | `CUSTOMER` | HU-060 (cliente convocado; P-033) |
| `cancelarReserva` | `ATC.PORTAL.BUS_BOOKING + eliminar` | `CUSTOMER` | HU-060 CA-03 |
| `listarMisTickets` | `ATC.PORTAL + ver` | `CUSTOMER` | HU-064 CA-02: solo sus tickets |
| `registrarMiTicket` | `ATC.PORTAL + crear` | `CUSTOMER` | HU-064 |
| `verTrazabilidad` | `ATC.PORTAL + ver` | `CUSTOMER` | HU-065 CA-03, CA-04 |
| `responderMiTicket` | `ATC.PORTAL + editar` | `CUSTOMER` | HU-066 CA-01 |
| `listarTiposPortal` | `ATC.PORTAL + ver` | `CUSTOMER` | HU-064 |
| `confirmarSolucion` | `ATC.PORTAL + aprobar` | `CUSTOMER` | HU-066 CA-02, CA-03: confirmar o rechazar la solución |

## 6 Matriz: rol → permisos (lo que ATC registra)

Es el lote de permisos que ATC envía (una fila por rol y opción, con sus acciones). Cada rol lleva además `ver` sobre `ATC` y sobre cada `SUBMENU` que usa, para que el menú efectivo de Control de acceso (`GET /api/v1/mi/menu`) le muestre la pantalla. 75 filas: 72 de los roles de ATC y 3 del rol `CUSTOMER` (supuesto S-2). Más las 3 incompatibilidades de la sección 9.

- **`ATC_AGENT`** (16 filas): `ATC` (ver); `ATC.TICKETS` (ver, crear, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.REFER` (editar); `ATC.TICKETS.GUIDE` (ver); `ATC.TICKETS.AI_ASSIST` (crear, editar); `ATC.TICKETS.LEGAL_GATE` (crear); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.DASHBOARD` (ver); `ATC.CUSTOMER360` (ver); `ATC.CUSTOMER360.SEARCH` (ver); `ATC.CUSTOMER360.CALL` (crear); `ATC.CUSTOMER360.QUERY_ENGINE` (ver); `ATC.CUSTOMER360.DOCUMENTS` (ver).
- **`ATC_SUPERVISOR`** (19 filas): `ATC` (ver); `ATC.TICKETS` (ver, crear, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.REFER` (editar); `ATC.TICKETS.REOPEN` (editar); `ATC.TICKETS.REASSIGN_BULK` (editar); `ATC.TICKETS.GUIDE` (ver); `ATC.TICKETS.LEGAL_GATE` (eliminar); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.INBOX.LIGHTNING` (crear); `ATC.DASHBOARD` (ver); `ATC.DASHBOARD.TEAM` (ver); `ATC.VIEWER` (ver); `ATC.WORKFLOWS` (ver); `ATC.CUSTOMER360` (ver); `ATC.CUSTOMER360.SEARCH` (ver); `ATC.EVENT_CASES` (ver).
- **`ATC_LEGAL`** (11 filas): `ATC` (ver); `ATC.TICKETS` (ver, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.LEGAL_GATE` (aprobar); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.COMPLAINT_BOOK` (ver, crear, editar); `ATC.COMPLAINT_BOOK.APPEALS` (ver, crear, editar); `ATC.CUSTOMER360` (ver); `ATC.LEGAL_CASES` (ver).
- **`ATC_POSTVENTA`** (9 filas): `ATC` (ver); `ATC.TICKETS` (ver, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.LEGAL_GATE` (crear); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.CUSTOMER360` (ver); `ATC.AFTERSALES` (ver, crear, editar).
- **`ATC_ADMIN_FUNCIONAL`** (2 filas): `ATC` (ver); `ATC.WORKFLOWS` (ver, editar).
- **`ATC_CASES_DESK`** (4 filas): `ATC` (ver); `ATC.TICKETS` (ver); `ATC.CUSTOMER360` (ver); `ATC.LEGAL_CASES` (ver, crear, editar).
- **`ATC_CX`** (6 filas): `ATC` (ver); `ATC.TICKETS` (ver); `ATC.TICKETS.SLA` (ver); `ATC.DASHBOARD` (ver); `ATC.DASHBOARD.TEAM` (ver); `ATC.EVENT_CASES` (ver, crear).
- **`ATC_EVENT`** (3 filas): `ATC` (ver); `ATC.EVENT_CASES` (ver, crear); `ATC.EVENT_CASES.ANCHOR_PHRASES` (crear).
- **`ATC_SITE_ACCESS`** (2 filas): `ATC` (ver); `ATC.SITE_ENTRY` (ver, crear).
- **`CUSTOMER`** (3 filas): `ATC` (ver); `ATC.PORTAL` (ver, crear, editar, aprobar); `ATC.PORTAL.BUS_BOOKING` (ver, crear, eliminar).

## 7 Cómo autoriza ATC con lo que da el token (P-034)

El Líder Técnico pidió que ATC «autorice cada operación con el permiso que llega en el token» (§3.1, punto 3). **El token de PJ-05 no trae permisos, trae roles** (ADR-012 de PJ-05), y el permiso efectivo lo calcula Control de acceso sobre su base (ADR-007 de PJ-05). El diseño que cumple esa intención con lo que PJ-05 sí da es este:

1. **`@PreAuthorize` por rol.** Cada operación exige `hasAnyRole(<x-roles>)`. Los roles salen del token: `realm_access.roles` ∪ `company_roles[companyId]`, convertidos a `ROLE_*` por `aybar-starter-security`. Es el «filtro grueso» que ADR-007 de PJ-05 admite. Si falta el rol, responde el SDK con `AYB-SEG-403`; ATC no reinventa ese error (C-10) y no emite `AYB-PEF-403`, que es del área de Control de acceso (D-169).
2. **`x-permiso` es el permiso del catálogo** que esa operación representa: lo que Control de acceso aprueba, lo que pinta el menú del front y lo que permite trazar cada rol a lo aprobado. `x-roles` son los roles que tienen ese permiso en la sección 6.
3. **Supuesto S-1.** El catálogo que apruebe Control de acceso es el de las secciones 4 a 6. Si el área cambia los permisos de un rol de ATC, ATC actualiza `x-roles` por control de cambio. La otra vía es que ATC consulte el permiso efectivo de cada operación en `GET /api/v1/mi/permisos/{codigoOpcion}?accion=` ⚠, con el token del usuario, con su costo en latencia, caché y disponibilidad. **Decide el Líder Técnico y lo confirma Sony Montoya (P-034).** Hasta entonces se construye la vía 1, que no depende de una llamada en cada petición.
4. **Supuesto S-2.** ATC registra permisos del rol `CUSTOMER` (sembrado por Control de acceso) sobre sus opciones `ATC.PORTAL`: D-66 limita la **opción** a las del propio servicio, no el rol. Además, la cuenta `CUSTOMER` que nace por DNI debe recibir el **rol** `CUSTOMER` para que Mi Portal pueda exigir `hasRole('CUSTOMER')`; hoy solo D-67 lo asigna, al validar un prospecto. **Lo confirma Sony Montoya (P-033, P-039).**
5. **Supuesto S-3.** Mi Portal filtra por el `PartyID` del cliente y ATC anota el `PartyID` del gestor en las bitácoras (`ChangedByPartyID`, `AssignedToPartyID` del v7), pero **el token no trae `PartyID`**. Opciones para Control de acceso: un claim nuevo (el contrato de claims de ADR-012 de PJ-05 es una interfaz versionada; ATC lo leería con `aybar.security.claims.adicionales`), o una operación con el token del usuario que resuelva `user_account_id` → `PartyID`. **Lo responde Sony Montoya (P-033).** Mientras no esté, las operaciones de Mi Portal y las bitácoras con autor quedan bloqueadas en ese punto; ATC no guarda una tabla propia de correspondencias.

## 8 Reglas de alcance que no son un permiso

| Regla | Cómo se aplica | Fuente |
|---|---|---|
| Empresa | Por operación, con los roles que la autorizan: si alguno es global, las 11 empresas; si solo es de la empresa activa, esa empresa (sección 3) | C-08; ADR-009; ADR-007 y D-178 de PJ-05 |
| Área | El gestor no ve tickets de áreas ajenas salvo que supervise. El token no dice a qué área pertenece el gestor y Control de acceso no administra áreas (`NEX_COMPANY_AREA` no existe, D-74, D-193). **Supuesto S-4:** mientras P-036 no se responda, el área de cada rol de ATC es un parámetro de ATC (por ejemplo, `ATC_LEGAL` → cola `LEGAL`, `ATC_POSTVENTA` → cola `POSTVENTA`), sin guardar personas; el gestor ve las colas de su rol y los tickets asignados a él. La correspondencia de `MAE_AREA` con el área organizacional está propuesta en `datos/registro-de-tablas.md` §7 | HU-044 CA-03; C-07; P-036 |
| Secciones de la consulta 360 | Cada rol ve solo los datos que su permiso permite; los demás aparecen con candado. Los permisos del sistema de origen se aplican en cada consulta | HU-050 CA-02, CA-07; RN-SVC-036; RNF-SEC-010 |
| Visor 3D | Solo las áreas permitidas (regla de área de esta tabla). El WebSocket `/ws/visor` exige el mismo rol que `estadoVisor`, validado en el *handshake* con el JWT; al vencer el token se cierra y el visor se reconecta (ADR-010) | HU-067 CA-07 |
| Tablero | El del gestor es solo suyo; el del equipo exige además `ATC.DASHBOARD.TEAM + ver` | HU-054 CA-03 |
| Cliente | Solo ve sus tickets, filtrados por el `PartyID` que sale de su token (S-3); el cuerpo de la petición no puede traer un identificador de cliente (esquemas propios de Mi Portal, ADR-011); el ticket de otro cliente responde `AYB-PTL-404` y el intento queda en la auditoría | HU-064 CA-02; HU-065 CA-03 y CA-04 |
| Intentos denegados | Quedan registrados: registrar un ticket sin rol de atención (HU-001 CA-04), consultar al motor un dato no permitido (HU-052 CA-03) y abrir el ticket de otro cliente (HU-065 CA-04). El 403 por falta de rol lo da el SDK: ATC declara un bean `AuthorizationEventPublisher` (sin él, Spring Security no publica `AuthorizationDeniedEvent`) y un listener emite el evento de auditoría (`aybar-starter-audit`). HU-052 CA-03 y HU-065 CA-04 no son 403: el caso de uso emite el evento de auditoría por su puerto antes de responder | Historias citadas; `seguridad.md` |

Lo que ve el cliente se cita por sus criterios de origen (HU-064 CA-02; HU-065 CA-03 y CA-04): el código de regla que le dan los PDF del PO no está en el Excel y lo registra el PO (P-022, P-030). RNF-SEC-010 sí está en el Excel `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 31.

## 9 Incompatibilidades

La segregación de funciones (SoD) la administra Control de acceso: la matriz empieza vacía (R28) y un servicio solo declara pares entre sus propios roles (ADR-021 de PJ-05). Lo que ATC propone entregar:

| Rol | Rol incompatible | Alcance | Nivel | Motivo | Estado |
|---|---|---|---|---|---|
| `ATC_ADMIN_FUNCIONAL` | `ATC_AGENT` | Grupo (`companyId` nulo) | `BLOCK` | Quien publica los flujos no atiende los tickets que esos flujos gobiernan | Propuesta del equipo, sin respaldo en las historias |
| `ATC_ADMIN_FUNCIONAL` | `ATC_SUPERVISOR` | Grupo | `BLOCK` | Quien publica los flujos no supervisa los tickets que esos flujos gobiernan | Propuesta del equipo, sin respaldo en las historias |
| `ATC_SUPERVISOR` | `ATC_AGENT` | Grupo | `WARN_AND_LOG` | Un supervisor que también atiende puede tener los dos roles, por eso no se bloquea. El riesgo es tenerlos con alcances distintos (uno global y otro por empresa), la combinación que la sección 3 acota: queda avisada y registrada para que Control de acceso confirme que la asignación es la que se quiso | Propuesta del equipo (segunda revisión del Líder Técnico) |

Control de acceso evalúa estas incompatibilidades sobre la unión de los roles globales y por empresa (ADR-003 y ADR-007 de PJ-05), así que el par `ATC_SUPERVISOR` + `ATC_AGENT` se detecta también cuando uno es global y el otro por empresa. La escalada no depende de esa alerta: la impide la regla de alcance por operación de la sección 3, que vale aunque el área no registre la incompatibilidad. Las tres incompatibilidades las confirman el Líder Técnico y Control de acceso (P-028). Las demás reglas de «solo el supervisor» (HU-008 CA-03, HU-026, HU-045 CA-02) se resuelven con el permiso, no con una incompatibilidad.

## 10 Actores de las historias sin rol en la lista del Líder Técnico

| Actor | Historias | Qué se propone |
|---|---|---|
| Gestor de la Mesa de Casos (SGD) | HU-020 a HU-025 | Rol `ATC_CASES_DESK` |
| Coordinador CX | HU-029 a HU-031, HU-039, HU-041 | Rol `ATC_CX` |
| Moderador de evento y personal de apoyo | HU-037 a HU-039 | Rol `ATC_EVENT` |
| Personal de control de acceso del proyecto | HU-059 | Rol `ATC_SITE_ACCESS`; la persona necesita una cuenta `EMPLOYEE` invitada por el área (D-46) |
| Cliente convocado al Entrega Fest | HU-060 | Cuenta `CUSTOMER` (S-2). Si el PO quiere un formulario sin sesión, cambia el contrato (P-028) |
| Analista de Cobranza | HU-056, HU-057 | Los casos los abre un job (ADR-005); el analista no tiene operación en el contrato |
| Responsable de proyecto | HU-058 | Recibe una carta; no tiene operación en el contrato. Quién es sale de la DEP-15 |
| CDO | HU-032 | La auditoría es un job (ADR-005); sin operación en el contrato |
| Rol del eje destino que confirma un handoff | HU-027 | `ATC_LEGAL`, por confirmar con el PO |
| Validador de prospectos | C-06 | No es de ATC: `PROSPECT_VALIDATOR` de Control de acceso, en su consola; quiénes lo necesitan, en `analisis/proceso-atencion-prospectos.md` §5 (P-041) |

## 11 Cómo se entrega el catálogo (ADR-021 de PJ-05)

1. **Cliente de servicio de ATC.** TI crea el cliente OAuth `CONFIDENTIAL` de ATC con su script (D-223): secreto de 32 bytes que se muestra una vez y se guarda en Azure Key Vault (ADR-014).
2. **Rol `CATALOG_REGISTRAR`.** Lo otorga una persona con `ROLE_IT_ADMIN`. La ruta para hacerlo (`PUT /api/v1/clientes/{clientId}/roles/CATALOG_REGISTRAR`) sigue en `x-estado: propuesta` (D-171) ⚠: **cómo se otorga en la Etapa 1 lo responde Sony Montoya (P-039).**
3. **Registro.** ATC llama con `client_credentials` (`aybar-starter-client`, DT-10) a `POST /api/v1/catalogo/opciones-de-menu` (31 opciones, un lote de hasta 200) y después a `POST /api/v1/catalogo/roles` (9 roles, 75 permisos y 3 incompatibilidades) ⚠. Todo nace inactivo.
4. **Aprobación.** Una persona con `ROLE_IT_ADMIN` aprueba cada fila: son **118 tareas** (31 opciones + 9 roles + 75 permisos + 3 incompatibilidades; A24: una por fila), que vencen a los 7 días si nadie las resuelve (ADR-021 de PJ-05) ⚠ `HU-IDN-057`.
5. **Invitación y asignación.** El área invita a los gestores como cuentas `EMPLOYEE` ligadas a su `PARTY` (D-46) y les asigna los roles, globales o por empresa (sección 3).
6. **Cambios.** La revisión del Líder Técnico dice que ATC entrega el catálogo «una sola vez» y que un rol nuevo se le solicita al área. D-100 de PJ-05 permite además que el servicio pida cambiar o retirar lo aprobado, pero esas rutas siguen en propuesta. **Si es «una sola vez» o puede pedir cambios lo deciden el Líder Técnico y Sony Montoya (P-039).**

## 12 Preguntas abiertas

| # | Pregunta | Se pregunta a |
|---|---|---|
| P-028 | ¿«Líder» (HU-045 CA-02, HU-054 CA-03) es `ATC_SUPERVISOR` o la jefatura del área? ¿Quiénes van con rol global y quiénes por empresa? ¿Se aceptan los roles propuestos y la incompatibilidad de la sección 9? | Líder Técnico, PO y Control de acceso |
| P-033 | ¿De dónde obtiene ATC el `PartyID` del cliente y del gestor (S-3)? ¿La cuenta `CUSTOMER` que nace por DNI recibe el rol `CUSTOMER` (S-2)? | Sony Montoya |
| P-034 | ¿ATC autoriza por rol con esta matriz (vía 1) o consulta el permiso efectivo en cada operación (S-1)? | Líder Técnico; Sony Montoya confirma el contrato |
| P-035 | ¿Qué API da, con token de servicio, los gestores que tienen un rol, el líder de un área y la disponibilidad? Hoy esas consultas exigen una persona con `ROLE_IT_ADMIN` | Sony Montoya |
| P-036 | ¿Quién administra las áreas y jefaturas y cómo sabe ATC el área de un gestor (S-4)? | Líder Técnico, Sony Montoya y Gobierno de Datos |
| P-039 | ¿Cómo recibe ATC el rol `CATALOG_REGISTRAR` y sus clientes OAuth en la Etapa 1? ¿Puede registrar permisos de `CUSTOMER`? ¿«Una sola vez» o con cambios? | Sony Montoya; Líder Técnico |
| P-041 | ¿Entran en la Etapa 1 los casos manuales de prospectos (`analisis/proceso-atencion-prospectos.md`) y con qué gestores con `PROSPECT_VALIDATOR`? ¿Quién suspende al impostor? | PO; Sony Montoya |

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-22 | Jesús Chávez Elías, con IA | Primera versión: roles, opciones, acciones, matriz por operación y por rol, alcance, incompatibilidad propuesta, actores sin rol y preguntas abiertas |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Verificado contra el paquete aprobado de PJ-05: catálogo en su formato (árbol de 31 opciones y permiso = opción + una de las cinco acciones), `x-permiso` con la forma `<opción> + <acción>` y `x-roles` por operación; autorización por rol porque el token no trae permisos (S-1, P-034); permisos de `CUSTOMER` y `PartyID` como supuestos para Sony Montoya (S-2, S-3; P-033); asignación global o por empresa con D-178 (C-08); filtro por área sin áreas en Control de acceso (S-4, P-036); rol propuesto `ATC_SITE_ACCESS` (HU-059); la frase ancla ya no comparte permiso con el caso del evento; pasos de entrega con 117 tareas de aprobación y la ruta de `CATALOG_REGISTRAR` en propuesta (P-039) |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: regla explícita para un rol global y uno por empresa (si se permite: unión de roles, como el permiso efectivo de PJ-05; sobre qué empresas: por operación, con los roles que la autorizan), con ejemplo, componente y prueba; incompatibilidad `ATC_SUPERVISOR` + `ATC_AGENT` (`WARN_AND_LOG`) y 118 tareas de aprobación; aviso ⚠ con los 7 archivos de PJ-05 que no coinciden con el sello; roles sembrados: 9 (D-176); intentos denegados con `AuthorizationEventPublisher` y desde el caso de uso; visor y Mi Portal según ADR-010 y ADR-011; la visibilidad del cliente citada por sus criterios |

Generado por IA: documento completo (Claude, 2026-10-22), a partir de la revisión del Líder Técnico del 22-oct, las 62 historias de Nexora (actores y criterios de aceptación) y el contrato OpenAPI v5; actualizado con IA (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso (PJ-05). — Revisado por: (pendiente) · Aprueba: TL
