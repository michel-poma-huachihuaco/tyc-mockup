---
id: "SPEC-ARQ-ROLES-ATC"
tipo: "spec"
titulo: "Roles y permisos de ATC: catálogo que ATC entrega a Control de acceso"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.6"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-009, ADR-010, ADR-011, ADR-014]
tags: [arquitectura, seguridad, roles, g3]
---

# Roles y permisos de ATC

Resuelve las colisiones C-02 (no había catálogo de ATC) y C-08 (asignación global o por empresa) de la revisión del Líder Técnico (Jose Jara, 22-oct-2026), con DT-03 y las decisiones del equipo ED-01, ED-02, ED-03, ED-04, ED-07, ED-09 y ED-20 (`analisis/decisiones.md`). La versión 0.6 aplica la revisión final del Líder Técnico del 26-oct (O-02, O-07, O-08 y O-09) y la decisión del coordinador sobre C-06. Es el catálogo de ATC **decidido por el equipo** y propuesto al Líder Técnico en este envío. **No la aprueba ATC:** ATC la entrega a Control de acceso (PJ-05) por el mecanismo del ADR-021 de PJ-05 y desde ahí la aprueba, la asigna y la cambia el área de Roles y Permisos (Sony Montoya) (ADR-009).

**Fuentes verificadas el 26-oct** en la copia sellada del paquete **aprobado** de Control de acceso (`docs-roles-y-permisos/`, traída de Nexora el 22-oct; el perfil desarrollador recibe 403 al leer PJ-05 en Nexora). ⚠ marca lo que sale de los 7 archivos de esa copia que no coinciden con la huella del sello (recalculada el 26-oct): `arquitectura/access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003` (credencial local), `HU-IDN-014` (permisos de menú por rol), `HU-IDN-054` (otorgar `CATALOG_REGISTRAR` a una cuenta de servicio), `HU-IDN-057` (aprobar o rechazar lo registrado por un microservicio) y `HU-IDN-059` (validar prospecto). Se citan como referencia: ninguna decisión de este catálogo depende de que cambien.

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
| `realm_access.roles` son los roles de las filas vigentes de `IDN_USER_ROLE`. La cuenta que nace por DNI toma el tipo `CUSTOMER` de su Party y **no recibe roles**; el prospecto validado pasa a tipo `CUSTOMER` y recibe el rol `CUSTOMER` | `arquitectura/arquitectura-tecnica.md:987`; `historias/HU-IDN-045-registro-con-correo-verificado-nivel-1.md:43` (CA-3); D-67 (`analisis/decisiones.md:272`); ⚠ `HU-IDN-059` CA-1 |
| El rol de cliente `CATALOG_REGISTRAR` lo otorga el Administrador de seguridad y vive en `IDN_OAUTH_CLIENT_SCOPE`; un lote se registra entero o nada; las tareas de aprobación vencen a los 7 días | ADR-021 PJ-05 (Decisión 1; Consecuencias); D-61; ⚠ `registrarRolesPermisosEIncompatibilidades` |
| El permiso efectivo es la unión de los roles vigentes por las dos vías (globales y de la empresa activa), acumulativa y sin negación; la incompatibilidad (SoD) se evalúa sobre esa misma unión | ADR-007 PJ-05 (Decisión); ADR-008 PJ-05; ADR-003 PJ-05 |

## 1 Qué decidió el equipo y qué viene de los documentos

| Dato | Origen |
|---|---|
| Los 5 roles `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` y `ATC_ADMIN_FUNCIONAL` | Revisión del Líder Técnico (C-02) |
| Los roles `ATC_CASES_DESK`, `ATC_CX`, `ATC_EVENT` y `ATC_SITE_ACCESS` | **Decisión del equipo** (ED-20): actores de las historias que los 5 roles no cubren (sección 10) |
| El formato del catálogo (árbol de opciones, permiso = opción + una de las cinco acciones) | PJ-05 (tabla anterior) |
| Los códigos de las opciones y qué acción usa cada operación | Decisión del equipo (ED-20), en inglés como los módulos (ADR-001) |
| Qué rol puede cada operación | Decisión del equipo (ED-20), deducida del actor de cada historia del PLT-04 v1.3; la columna «Base» lo dice |
| Las reglas de permiso (quién no puede, quién sí) | Criterios de aceptación de las historias, citados en cada fila |

## 2 Roles

| Rol | Quién es (actor de las historias) | Alcance sugerido | Origen |
|---|---|---|---|
| `ATC_AGENT` | Gestor de tickets, colaborador de área y referente de atención | Por empresa, o global para quien atiende las 11 razones sociales | Líder Técnico (C-02) |
| `ATC_SUPERVISOR` | Supervisor ATC; es el **líder** de las historias (HU-045, HU-054 y HU-055), no una jefatura (ED-20) | Global o por empresa | Líder Técnico (C-02) |
| `ATC_LEGAL` | Responsable legal de reclamos; eje destino que confirma el handoff (HU-027, ED-20) | Por empresa | Líder Técnico (C-02) |
| `ATC_POSTVENTA` | Gestor de Postventa | Por empresa | Líder Técnico (C-02) |
| `ATC_ADMIN_FUNCIONAL` | Administrador funcional de flujos (HU-043) | Global | Líder Técnico (C-02) |
| `ATC_CASES_DESK` | Gestor de la Mesa de Casos (SGD), HU-020 a 025 | Global | Decisión del equipo (ED-20) |
| `ATC_CX` | Coordinador CX, HU-029 a 031, 039 y 041 | Global | Decisión del equipo (ED-20) |
| `ATC_EVENT` | Moderador y personal de apoyo del Entrega Fest, HU-037 a 039 | Por empresa | Decisión del equipo (ED-20) · no va en la solicitud de la Etapa 1: no tiene operaciones (HU-037 a 039 fuera por P-025); se registra en una nueva solicitud cuando se retomen (§11) |
| `ATC_SITE_ACCESS` | Personal de control de acceso del proyecto, HU-059 | Por empresa | Decisión del equipo (ED-20) |
| `CUSTOMER` | Cliente de Mi Portal (HU-064 a 066) y cliente convocado al Entrega Fest (HU-060) | No es un rol de ATC: lo siembra Control de acceso (D-30). Mi Portal no autoriza por este rol sino por la **cuenta** de tipo `CUSTOMER` activa, y ATC no le registra permisos (§7, S-2; ED-01) | Control de acceso |

**Roles que ATC no registra.** `CUSTOMER`, `PROSPECT` y `PROSPECT_VALIDATOR` son de Control de acceso (D-30, D-176). **Una sola regla para Mi Portal (ED-01):** sus 8 operaciones admiten solo una **cuenta de tipo `CUSTOMER` activa**, sin exigir rol: la cuenta que nace por DNI no recibe el rol `CUSTOMER` (HU-IDN-045 CA-3) y la del prospecto validado sí (D-67), y las dos son de tipo `CUSTOMER` (HU-IDN-059 CA-1). `PROSPECT` queda fuera, porque su cuenta es de tipo `PROSPECT` (D-62) y las historias HU-064 a 066 hablan de clientes. `PROSPECT_VALIDATOR` (C-06) lo reciben los **supervisores de la cola `ATC`** (`ATC_SUPERVISOR`), que validan prospectos en la consola de Control de acceso; el área lo asigna al invitarlos (ED-09, ED-20). Los casos de identidad que Control de acceso deriva a ATC entran en la Etapa 1 como el tipo de ticket «Validación de identidad (prospecto)» (decisión del coordinador del 26-oct; ADR-008, combinaciones 12 a 15): ATC registra, deriva y cierra; no valida.

## 3 Asignación global o por empresa (C-08)

Las asignaciones las hace Control de acceso (`asignarRol` para un rol global y `asignarRolPorEmpresa` para uno por empresa, con `ROLE_IT_ADMIN`); ATC no asigna.

| Caso | Cómo llega en el token | Qué ve en ATC |
|---|---|---|
| Gestor que atiende las 11 razones sociales | Rol de ATC **global**, en `realm_access.roles`. Sin roles por empresa, el token puede llegar sin `companyId` (D-178; ED-02) | Las 11 empresas. Puede filtrar por empresa en la consulta |
| Gestor de una o varias empresas | Rol de ATC **por empresa**, en `company_roles`, y la empresa activa en `companyId`. Cambiar de empresa renueva el token (D-178) | Solo la empresa activa |
| Gestor con los dos | La unión de los dos (`ROLE_*` de `realm_access.roles` ∪ `company_roles[companyId]`) | **Depende de la operación** (regla de abajo): las 11 empresas en las operaciones que su rol global autoriza; solo la empresa activa en las que solo autoriza su rol por empresa |
| Cliente (cuenta `CUSTOMER`) | Sin `companyId` ni `company_roles` (D-178); la cuenta por DNI llega sin roles (HU-IDN-045 CA-3) | Solo sus tickets, filtrados por su `PartyID`, que sale de su cuenta (sección 7, S-3; ED-01) |

**Regla de ATC (combinación de un rol global y uno por empresa):**

1. **Si la operación se permite** lo decide la unión de los dos caminos, igual que el permiso efectivo de Control de acceso (ADR-007 de PJ-05): `@PreAuthorize(hasAnyRole(<x-roles>))` sobre los `ROLE_*` que arma el SDK con los roles globales y los de la empresa activa.
2. **Sobre qué empresas actúa** se calcula **por operación**, solo con los roles que la autorizan. Sea `R` el conjunto de `x-roles` de la operación: si `R ∩ roles globales` (`AybarUserContext.roles`) no está vacío, el alcance son las 11 razones sociales; si solo `R ∩ rolesDe(companyId)` no está vacío, el alcance es `{companyId}`. Un rol que no está en `R` nunca amplía el alcance. Los roles de empresas que no son la activa no cuentan: cambiar de empresa renueva el token (D-178).
3. **Ejemplo que la regla impide:** `ATC_AGENT` global con `ATC_SUPERVISOR` solo en la empresa X. Pasa `@PreAuthorize` de `reasignarEnBloque` (`x-roles: ATC_SUPERVISOR`), pero como `ATC_SUPERVISOR` solo llega por la empresa X, reasigna únicamente tickets de X. En `listarBandeja`, que autoriza `ATC_AGENT`, ve las 11.
4. **Dónde vive y cómo se prueba:** un solo componente de `application` (`AlcanceDeEmpresa`) recibe los `x-roles` de la operación y el `AybarUserContext` y devuelve el conjunto de empresas. Todos los casos de uso con filtro de empresa lo usan, y ninguno lee `companyId` directamente. Prueba obligatoria: la combinación del punto 3 y sus variantes (solo global, solo por empresa, los dos con el mismo rol).
5. **Incompatibilidad que lo acompaña:** sección 9.

**Quiénes van con rol global (ED-20):** rol global para quien atiende las 11 razones sociales y por empresa para el resto. La asignación a cada persona la hace el área de Roles y Permisos al invitarla; ATC no asigna.

## 4 Opciones de menú

Árbol en el formato de PJ-05: un `MENU` sin padre, `SUBMENU` bajo un `MENU` o `SUBMENU`, y `ACTION` como hoja. Una pantalla es un `SUBMENU`; una acción dentro de una pantalla es un `ACTION`. Están documentadas 31 opciones (1 `MENU`, 17 `SUBMENU` y 13 `ACTION`). **La solicitud de la Etapa 1 lleva 27** (1 `MENU`, 16 `SUBMENU` y 10 `ACTION`): las 4 que no tienen operación en la Etapa 1 (`ATC.TICKETS.AI_ASSIST`, `ATC.CUSTOMER360.DOCUMENTS`, `ATC.EVENT_CASES` y `ATC.EVENT_CASES.ANCHOR_PHRASES`; HU-037 a 039, 048 y 053 fuera por P-025) van en una solicitud posterior (§11).

| Código | Tipo | Padre | Nombre | Operaciones | Solicitud |
|---|---|---|---|---|---|
| `ATC` | MENU | — | Aybar Atiende | `listarAvisos` (ver) | Etapa 1 |
| `ATC.TICKETS` | SUBMENU | `ATC` | Tickets | `registrarTicket` (crear), `obtenerTicket` (ver), `cambiarEstado` (editar), `registrarInteraccion` (editar), `cerrarActividad` (editar), `consultarSincronizacionLegal` (ver) | Etapa 1 |
| `ATC.TICKETS.SLA` | ACTION | `ATC.TICKETS` | SLA del ticket | `consultarSla` (ver) | Etapa 1 |
| `ATC.TICKETS.REFER` | ACTION | `ATC.TICKETS` | Derivar a otra área | `derivarTicket` (editar) | Etapa 1 |
| `ATC.TICKETS.REOPEN` | ACTION | `ATC.TICKETS` | Reabrir | `reabrirTicket` (editar) | Etapa 1 |
| `ATC.TICKETS.REASSIGN_BULK` | ACTION | `ATC.TICKETS` | Reasignar en bloque | `reasignarEnBloque` (editar) | Etapa 1 |
| `ATC.TICKETS.GUIDE` | ACTION | `ATC.TICKETS` | Guía de solución | `obtenerGuia` (ver) | Etapa 1 |
| `ATC.TICKETS.AI_ASSIST` | ACTION | `ATC.TICKETS` | Asistencia de IA | `pedirSugerenciaIa` (crear), `decidirSugerenciaIa` (editar) | Posterior (§11) |
| `ATC.TICKETS.LEGAL_GATE` | ACTION | `ATC.TICKETS` | Señal de conflicto y handoff a Eje 3 | `marcarConflicto` (crear), `retirarConflicto` (eliminar), `armarHandoff` (crear), `confirmarHandoff` (aprobar) | Etapa 1 |
| `ATC.TICKETS.STATE_NOTE` | ACTION | `ATC.TICKETS` | Nota de estado emocional | `registrarNotaEstado` (crear) | Etapa 1 |
| `ATC.INBOX` | SUBMENU | `ATC` | Bandeja | `listarBandeja` (ver), `listarCasosResolucion` (ver) | Etapa 1 |
| `ATC.INBOX.LOCKER` | SUBMENU | `ATC.INBOX` | Casillero de tareas | `listarCasillero` (ver) | Etapa 1 |
| `ATC.INBOX.LIGHTNING` | ACTION | `ATC.INBOX` | Rayo de prioridad | `marcarRayo` (crear) | Etapa 1 |
| `ATC.DASHBOARD` | SUBMENU | `ATC` | Tablero de avance | `verTablero` (ver) | Etapa 1 |
| `ATC.DASHBOARD.TEAM` | SUBMENU | `ATC.DASHBOARD` | Tablero del equipo | `verTablero` (ver, parte del equipo), `consultarCsatCes` (ver), `listarInformes` (ver), `consultarAuditoriaRegistrosParalelos` (ver), `listarRiesgoDenuncia` (ver), `consultarCargaGestores` (ver) | Etapa 1 |
| `ATC.VIEWER` | SUBMENU | `ATC` | Visor 3D | `estadoVisor` (ver) | Etapa 1 |
| `ATC.WORKFLOWS` | SUBMENU | `ATC` | Flujos por área | `configurarFlujo` (editar), `listarPublicacionesFlujo` (ver) | Etapa 1 |
| `ATC.COMPLAINT_BOOK` | SUBMENU | `ATC` | Libro de Reclamaciones | `registrarAsiento` (crear), `prorrogarPlazo` (editar), `registrarRespuestaFormal` (editar), `consultarVigilanciaLibro` (ver) | Etapa 1 |
| `ATC.COMPLAINT_BOOK.APPEALS` | SUBMENU | `ATC.COMPLAINT_BOOK` | Apelaciones | `registrarApelacion` (crear), `cambiarEstadoApelacion` (editar) | Etapa 1 |
| `ATC.CUSTOMER360` | SUBMENU | `ATC` | Consulta 360 del cliente | `consulta360` (ver), `obtenerFichaLlamada` (ver) | Etapa 1 |
| `ATC.CUSTOMER360.SEARCH` | SUBMENU | `ATC.CUSTOMER360` | Búsqueda de clientes | `buscarClientes` (ver) | Etapa 1 |
| `ATC.CUSTOMER360.CALL` | ACTION | `ATC.CUSTOMER360` | Llamar al cliente | `llamarCliente` (crear) | Etapa 1 |
| `ATC.CUSTOMER360.QUERY_ENGINE` | ACTION | `ATC.CUSTOMER360` | Consulta al motor de José | `consultarMotor` (ver) | Etapa 1 |
| `ATC.CUSTOMER360.DOCUMENTS` | ACTION | `ATC.CUSTOMER360` | Búsqueda de documentos | `buscarDocumentos` (ver) | Posterior (§11) |
| `ATC.LEGAL_CASES` | SUBMENU | `ATC` | Mesa de casos sensibles (SGD) | `registrarCasoSensible` (crear), `reclasificarCaso` (editar), `emitirCargo` (crear), `clasificarRiesgo` (editar), `escalarCaso` (editar), `buscarCoincidencias` (ver), `vincularCasos` (editar), `cerrarCaso` (editar) | Etapa 1 |
| `ATC.AFTERSALES` | SUBMENU | `ATC` | Garantías postventa | `registrarReclamoGarantia` (crear), `registrarInspeccion` (crear), `resolverReclamo` (editar), `escalarGarantia` (editar), `registrarAdenda` (crear) | Etapa 1 |
| `ATC.EVENT_CASES` | SUBMENU | `ATC` | Entrega Fest | `registrarCasoEvento` (crear), `listarCasosEvento` (ver) | Posterior (§11) |
| `ATC.EVENT_CASES.ANCHOR_PHRASES` | ACTION | `ATC.EVENT_CASES` | Frases Ancla | `registrarFraseAncla` (crear) | Posterior (§11) |
| `ATC.SITE_ENTRY` | SUBMENU | `ATC` | Ingreso al proyecto | `registrarIngreso` (crear) | Etapa 1 |
| `ATC.PORTAL` | SUBMENU | `ATC` | Mi Portal | `listarMisTickets` (ver), `registrarMiTicket` (crear), `verTrazabilidad` (ver), `responderMiTicket` (editar), `listarTiposPortal` (ver), `confirmarSolucion` (aprobar); sin permiso de rol: Mi Portal autoriza por cuenta `CUSTOMER` activa (§7, S-2) | Etapa 1 |
| `ATC.PORTAL.BUS_BOOKING` | SUBMENU | `ATC.PORTAL` | Reserva de bus del Entrega Fest | `reservarBus` (crear), `cancelarReserva` (eliminar); sin permiso de rol: Mi Portal autoriza por cuenta `CUSTOMER` activa (§7, S-2) | Etapa 1 |

## 5 Matriz: operación del OpenAPI → permiso → roles

Cada operación del contrato (`aybar-atc.openapi.yaml`) declara su permiso en `x-permiso`, con la forma que usa PJ-05 en su propio contrato (`<opción> + <acción>`), y los roles que exige `@PreAuthorize` en `x-roles`. Son 69 operaciones (63 en la Etapa 1) y 48 pares opción + acción distintos. `x-roles` de cada operación son exactamente los roles que tienen su permiso en §6, y las que comparten un par tienen los mismos roles (lo comprueba el script de cruce de la entrega). Las 8 de Mi Portal no exigen rol (`x-roles: []`): las autoriza la cuenta de tipo `CUSTOMER` activa (`x-autorizacion`; §7, S-2). «Base» es el actor de la historia que pide la operación.

| Operación | `x-permiso` (opción + acción) | `x-roles` | Base (historia) |
|---|---|---|---|
| `registrarTicket` | `ATC.TICKETS + crear` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-001 CA-04: quien no es de atención no registra; el intento queda registrado |
| `obtenerTicket` | `ATC.TICKETS + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK`, `ATC_CX` | HU-004, HU-005, HU-006, HU-041 y HU-050: detalle con historial, interacciones y exposición; por área (HU-044 CA-03) |
| `cambiarEstado` | `ATC.TICKETS + editar` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-004, HU-026 |
| `registrarInteraccion` | `ATC.TICKETS + editar` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-005 y la llamada de HU-042 CA-02 (tipo CALL); notas internas no se muestran al cliente (CA-03) |
| `derivarTicket` | `ATC.TICKETS.REFER + editar` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-007 (gestor de tickets) |
| `reabrirTicket` | `ATC.TICKETS.REOPEN + editar` | `ATC_SUPERVISOR` | HU-011 (supervisor ATC) |
| `reasignarEnBloque` | `ATC.TICKETS.REASSIGN_BULK + editar` | `ATC_SUPERVISOR` | HU-008 CA-03: solo el supervisor |
| `consultarSla` | `ATC.TICKETS.SLA + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CX` | HU-003, HU-010 |
| `listarBandeja` | `ATC.INBOX + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-044 CA-03: por área |
| `listarCasillero` | `ATC.INBOX.LOCKER + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-009 |
| `configurarFlujo` | `ATC.WORKFLOWS + editar` | `ATC_ADMIN_FUNCIONAL` | HU-043 CA-08: solo el administrador funcional; queda en bitácora |
| `registrarAsiento` | `ATC.COMPLAINT_BOOK + crear` | `ATC_LEGAL` | HU-012 (responsable legal de reclamos) |
| `prorrogarPlazo` | `ATC.COMPLAINT_BOOK + editar` | `ATC_LEGAL` | HU-013: deshabilitada por la Ley 31435 (15 días hábiles improrrogables): responde AYB-LRC-422 (ED-28) |
| `registrarRespuestaFormal` | `ATC.COMPLAINT_BOOK + editar` | `ATC_LEGAL` | HU-014 |
| `registrarApelacion` | `ATC.COMPLAINT_BOOK.APPEALS + crear` | `ATC_LEGAL` | HU-016 |
| `buscarClientes` | `ATC.CUSTOMER360.SEARCH + ver` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-049; RN-SVC-036 |
| `consulta360` | `ATC.CUSTOMER360 + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK` | HU-050 CA-02, CA-07: secciones con candado según el rol |
| `listarMisTickets` | `ATC.PORTAL + ver` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-064 CA-02: solo sus tickets |
| `registrarMiTicket` | `ATC.PORTAL + crear` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-064 |
| `verTrazabilidad` | `ATC.PORTAL + ver` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-065 CA-03, CA-04 |
| `responderMiTicket` | `ATC.PORTAL + editar` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-066 CA-01 |
| `estadoVisor` | `ATC.VIEWER + ver` | `ATC_SUPERVISOR` | HU-067 CA-07: solo las áreas permitidas; /ws/visor exige lo mismo |
| `listarTiposPortal` | `ATC.PORTAL + ver` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-064 |
| `confirmarSolucion` | `ATC.PORTAL + aprobar` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-066 CA-02, CA-03: confirmar o rechazar la solución |
| `listarPublicacionesFlujo` | `ATC.WORKFLOWS + ver` | `ATC_ADMIN_FUNCIONAL`, `ATC_SUPERVISOR` | HU-043 CA-08 |
| `cerrarActividad` | `ATC.TICKETS + editar` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-043 CA-04 |
| `marcarRayo` | `ATC.INBOX.LIGHTNING + crear` | `ATC_SUPERVISOR` | HU-045 CA-02: solo el líder (`ATC_SUPERVISOR`, ED-20) |
| `obtenerGuia` | `ATC.TICKETS.GUIDE + ver` | `ATC_AGENT`, `ATC_SUPERVISOR` | HU-047 (gestor de tickets) |
| `pedirSugerenciaIa` | `ATC.TICKETS.AI_ASSIST + crear` | `ATC_AGENT` | HU-048; texto anonimizado (ADR-007) · fuera de la Etapa 1 (P-025) |
| `decidirSugerenciaIa` | `ATC.TICKETS.AI_ASSIST + editar` | `ATC_AGENT` | HU-048: la IA sugiere, el gestor decide · fuera de la Etapa 1 (P-025) |
| `verTablero` | `ATC.DASHBOARD + ver`; además `ATC.DASHBOARD.TEAM + ver` para la parte del equipo (`ATC_SUPERVISOR`, `ATC_CX`) | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_CX` | HU-054, HU-030 y HU-029 (cierre de extremo a extremo); el del equipo exige además ATC.DASHBOARD.TEAM + ver |
| `cambiarEstadoApelacion` | `ATC.COMPLAINT_BOOK.APPEALS + editar` | `ATC_LEGAL` | HU-016 |
| `llamarCliente` | `ATC.CUSTOMER360.CALL + crear` | `ATC_AGENT` | HU-049 |
| `consultarMotor` | `ATC.CUSTOMER360.QUERY_ENGINE + ver` | `ATC_AGENT` | HU-052 CA-03: dato no permitido, intento registrado |
| `buscarDocumentos` | `ATC.CUSTOMER360.DOCUMENTS + ver` | `ATC_AGENT` | HU-053 CA-02: documento restringido no aparece · fuera de la Etapa 1 (P-025) |
| `registrarCasoSensible` | `ATC.LEGAL_CASES + crear` | `ATC_CASES_DESK` | HU-020 (gestor de la Mesa SGD) |
| `reclasificarCaso` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-020 CA-02 |
| `emitirCargo` | `ATC.LEGAL_CASES + crear` | `ATC_CASES_DESK` | HU-021 |
| `clasificarRiesgo` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-022: queda quién, cuándo y por qué |
| `escalarCaso` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-023 |
| `buscarCoincidencias` | `ATC.LEGAL_CASES + ver` | `ATC_CASES_DESK`, `ATC_LEGAL` | HU-024 |
| `vincularCasos` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-024 |
| `cerrarCaso` | `ATC.LEGAL_CASES + editar` | `ATC_CASES_DESK` | HU-025 |
| `marcarConflicto` | `ATC.TICKETS.LEGAL_GATE + crear` | `ATC_AGENT`, `ATC_POSTVENTA` | HU-026 (gestor de tickets o de Postventa) |
| `retirarConflicto` | `ATC.TICKETS.LEGAL_GATE + eliminar` | `ATC_SUPERVISOR` | HU-026 CA-03: solo el supervisor, con justificación |
| `armarHandoff` | `ATC.TICKETS.LEGAL_GATE + crear` | `ATC_AGENT`, `ATC_POSTVENTA` | HU-027 CA-01: 6 elementos completos |
| `confirmarHandoff` | `ATC.TICKETS.LEGAL_GATE + aprobar` | `ATC_LEGAL` | HU-027 CA-02: confirma el eje destino (`ATC_LEGAL`, ED-20) |
| `registrarNotaEstado` | `ATC.TICKETS.STATE_NOTE + crear` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-028 CA-03: sin palabras de juicio |
| `registrarReclamoGarantia` | `ATC.AFTERSALES + crear` | `ATC_POSTVENTA` | HU-033, HU-034 (gestor de Postventa) |
| `registrarInspeccion` | `ATC.AFTERSALES + crear` | `ATC_POSTVENTA` | HU-035 |
| `resolverReclamo` | `ATC.AFTERSALES + editar` | `ATC_POSTVENTA` | HU-035 |
| `escalarGarantia` | `ATC.AFTERSALES + editar` | `ATC_POSTVENTA` | HU-036 |
| `registrarAdenda` | `ATC.AFTERSALES + crear` | `ATC_POSTVENTA` | HU-036 |
| `registrarFraseAncla` | `ATC.EVENT_CASES.ANCHOR_PHRASES + crear` | `ATC_EVENT` | HU-037 (moderador de evento) · fuera de la Etapa 1 (P-025) |
| `registrarCasoEvento` | `ATC.EVENT_CASES + crear` | `ATC_EVENT`, `ATC_CX` | HU-038, HU-039 · fuera de la Etapa 1 (P-025) |
| `listarCasosEvento` | `ATC.EVENT_CASES + ver` | `ATC_EVENT`, `ATC_CX`, `ATC_SUPERVISOR` | HU-039 · fuera de la Etapa 1 (P-025) |
| `registrarIngreso` | `ATC.SITE_ENTRY + crear` | `ATC_SITE_ACCESS` | HU-059 (personal de control de acceso del proyecto; rol propuesto) |
| `reservarBus` | `ATC.PORTAL.BUS_BOOKING + crear` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-060 (cliente convocado; cuenta `CUSTOMER` activa, ED-01) |
| `cancelarReserva` | `ATC.PORTAL.BUS_BOOKING + eliminar` | — (cuenta `CUSTOMER` activa; `x-autorizacion`, §7) | HU-060 CA-03 |
| `consultarVigilanciaLibro` | `ATC.COMPLAINT_BOOK + ver` | `ATC_LEGAL` | HU-013 (ver el plazo legal de cada reclamo) y HU-015 CA-01 y CA-02 (responsable legal de reclamos) |
| `consultarCsatCes` | `ATC.DASHBOARD.TEAM + ver` | `ATC_SUPERVISOR`, `ATC_CX` | HU-019 CA-02 (supervisor ATC; también el coordinador CX en la Torre de Control) |
| `listarInformes` | `ATC.DASHBOARD.TEAM + ver` | `ATC_SUPERVISOR`, `ATC_CX` | HU-031 (coordinador CX; el supervisor lo ve como parte del equipo) |
| `consultarAuditoriaRegistrosParalelos` | `ATC.DASHBOARD.TEAM + ver` | `ATC_SUPERVISOR`, `ATC_CX` | HU-032 (CDO o coordinador CX; el CDO no tiene rol de ATC, §10) |
| `consultarSincronizacionLegal` | `ATC.TICKETS + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK`, `ATC_CX` | HU-040 (pestaña Legal del ticket: la ve quien ve el ticket) |
| `listarRiesgoDenuncia` | `ATC.DASHBOARD.TEAM + ver` | `ATC_SUPERVISOR`, `ATC_CX` | HU-041 (coordinador CX, en la Torre de Control) |
| `obtenerFichaLlamada` | `ATC.CUSTOMER360 + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_CASES_DESK` | HU-042 (gestor de tickets del call center): la misma ficha y los mismos roles que la consulta 360 |
| `consultarCargaGestores` | `ATC.DASHBOARD.TEAM + ver` | `ATC_SUPERVISOR`, `ATC_CX` | HU-046 (supervisor ATC, vista de la bandeja) |
| `listarAvisos` | `ATC + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_ADMIN_FUNCIONAL`, `ATC_CASES_DESK`, `ATC_CX`, `ATC_SITE_ACCESS` | HU-046 CA-03, HU-055 CA-01, HU-043 CA-07 y HU-047 CA-03: avisos a un rol y una cola (ED-03); cada uno ve los de sus roles |
| `listarCasosResolucion` | `ATC.INBOX + ver` | `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` | HU-056 a 058 (analista de Cobranza: gestor de la cola `COBRANZA`, S-4; Legal participa del flujo) |

## 6 Matriz: rol → permisos (lo que ATC registra)

Es el lote de permisos que ATC envía (una fila por rol y opción, con sus acciones). Cada rol lleva además `ver` sobre `ATC` y sobre cada `SUBMENU` que usa, para que el menú efectivo de Control de acceso (`GET /api/v1/mi/menu`) le muestre la pantalla. Están documentadas 72 filas; **la solicitud de la Etapa 1 lleva 65**, de 8 roles; las 7 restantes (las 3 de `ATC_EVENT` y las de las 4 opciones de la solicitud posterior) van en la solicitud posterior (§11). ATC no registra permisos para el rol `CUSTOMER`: Mi Portal no autoriza por rol (§7, S-2). Más las 3 incompatibilidades de la sección 9.

- **`ATC_AGENT`** (14 filas en la Etapa 1): `ATC` (ver); `ATC.TICKETS` (ver, crear, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.REFER` (editar); `ATC.TICKETS.GUIDE` (ver); `ATC.TICKETS.LEGAL_GATE` (crear); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.DASHBOARD` (ver); `ATC.CUSTOMER360` (ver); `ATC.CUSTOMER360.SEARCH` (ver); `ATC.CUSTOMER360.CALL` (crear); `ATC.CUSTOMER360.QUERY_ENGINE` (ver). Solicitud posterior (2): `ATC.TICKETS.AI_ASSIST` (crear, editar); `ATC.CUSTOMER360.DOCUMENTS` (ver).
- **`ATC_SUPERVISOR`** (18 filas en la Etapa 1): `ATC` (ver); `ATC.TICKETS` (ver, crear, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.REFER` (editar); `ATC.TICKETS.REOPEN` (editar); `ATC.TICKETS.REASSIGN_BULK` (editar); `ATC.TICKETS.GUIDE` (ver); `ATC.TICKETS.LEGAL_GATE` (eliminar); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.INBOX.LIGHTNING` (crear); `ATC.DASHBOARD` (ver); `ATC.DASHBOARD.TEAM` (ver); `ATC.VIEWER` (ver); `ATC.WORKFLOWS` (ver); `ATC.CUSTOMER360` (ver); `ATC.CUSTOMER360.SEARCH` (ver). Solicitud posterior (1): `ATC.EVENT_CASES` (ver).
- **`ATC_LEGAL`** (11 filas): `ATC` (ver); `ATC.TICKETS` (ver, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.LEGAL_GATE` (aprobar); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.COMPLAINT_BOOK` (ver, crear, editar); `ATC.COMPLAINT_BOOK.APPEALS` (ver, crear, editar); `ATC.CUSTOMER360` (ver); `ATC.LEGAL_CASES` (ver).
- **`ATC_POSTVENTA`** (9 filas): `ATC` (ver); `ATC.TICKETS` (ver, editar); `ATC.TICKETS.SLA` (ver); `ATC.TICKETS.LEGAL_GATE` (crear); `ATC.TICKETS.STATE_NOTE` (crear); `ATC.INBOX` (ver); `ATC.INBOX.LOCKER` (ver); `ATC.CUSTOMER360` (ver); `ATC.AFTERSALES` (ver, crear, editar).
- **`ATC_ADMIN_FUNCIONAL`** (2 filas): `ATC` (ver); `ATC.WORKFLOWS` (ver, editar).
- **`ATC_CASES_DESK`** (4 filas): `ATC` (ver); `ATC.TICKETS` (ver); `ATC.CUSTOMER360` (ver); `ATC.LEGAL_CASES` (ver, crear, editar).
- **`ATC_CX`** (5 filas en la Etapa 1): `ATC` (ver); `ATC.TICKETS` (ver); `ATC.TICKETS.SLA` (ver); `ATC.DASHBOARD` (ver); `ATC.DASHBOARD.TEAM` (ver). Solicitud posterior (1): `ATC.EVENT_CASES` (ver, crear).
- **`ATC_EVENT`** (3 filas, todas en la solicitud posterior): `ATC` (ver); `ATC.EVENT_CASES` (ver, crear); `ATC.EVENT_CASES.ANCHOR_PHRASES` (crear). Sin operaciones en la Etapa 1 (HU-037 a 039 fuera por P-025): el rol y sus permisos se registran en una nueva solicitud cuando se retomen (§11).
- **`ATC_SITE_ACCESS`** (2 filas): `ATC` (ver); `ATC.SITE_ENTRY` (ver, crear).

## 7 Cómo autoriza ATC con lo que da el token (ED-02)

El Líder Técnico pidió que ATC «autorice cada operación con el permiso que llega en el token» (§3.1, punto 3). **El token de PJ-05 no trae permisos, trae roles** (ADR-012 de PJ-05), y el permiso efectivo lo calcula Control de acceso sobre su base (ADR-007 de PJ-05). El diseño que cumple esa intención con lo que PJ-05 sí da es este:

1. **`@PreAuthorize` por rol.** Cada operación exige `hasAnyRole(<x-roles>)`, salvo las 8 de Mi Portal (punto 4). Los roles salen del token: `realm_access.roles` ∪ `company_roles[companyId]`, convertidos a `ROLE_*` por `aybar-starter-security`. Es el «filtro grueso» que ADR-007 de PJ-05 admite. Si falta el rol, responde el SDK con `AYB-SEG-403`; ATC no reinventa ese error (C-10) y no emite `AYB-PEF-403`, que es del área de Control de acceso (D-169).
2. **`x-permiso` es el permiso del catálogo** que esa operación representa: lo que Control de acceso aprueba, lo que pinta el menú del front y lo que permite trazar cada rol a lo aprobado. `x-roles` son los roles que tienen ese permiso en la sección 6.
3. **S-1, decidido (ED-02).** El catálogo que aprueba Control de acceso es el de las secciones 4 a 6. Si el área cambia los permisos de un rol de ATC, ATC actualiza `x-roles` por control de cambio. El backend **no** consulta `GET /api/v1/mi/permisos/{codigoOpcion}?accion=` ⚠ en cada operación: sumaría latencia y una dependencia de disponibilidad sin cambiar el resultado. Solo la consola lo usa, con el token del usuario y junto con `GET /api/v1/mi/menu`, para mostrar u ocultar acciones, nunca como autorización.
4. **S-2, decidido (ED-01; excepción a ED-02).** Mi Portal **no autoriza por rol**: sus 8 operaciones declaran `x-roles: []` y `x-autorizacion`, y `@PreAuthorize` usa un bean de ATC que lee con `CuentaPersonaPort` el tipo y el estado de la cuenta del token y exige `AccountTypeID = CUSTOMER` y `AccountStatusID = ACTIVE`. Es la única regla que cubre las dos vías que aprobó PJ-05: la cuenta que nace por DNI (tipo `CUSTOMER`, sin roles: HU-IDN-045 CA-3; `realm_access.roles` sale de `IDN_USER_ROLE`, `arquitectura-tecnica.md:987`) y el prospecto validado (tipo `CUSTOMER` y rol `CUSTOMER`: HU-IDN-059 CA-1, D-67). `PROSPECT` y cualquier otro tipo de cuenta reciben 403 (`AYB-SEG-403` del SDK). Por eso ATC no registra permisos para el rol `CUSTOMER`: las opciones `ATC.PORTAL` y `ATC.PORTAL.BUS_BOOKING` se registran (el contrato las cita en `x-permiso`) sin permisos de rol.
5. **S-3, decidido (ED-01).** El token no trae `PartyID` y ningún servicio aprobado de PJ-05 lo devuelve con el token del usuario. El puerto `CuentaPersonaPort` lee en la base única, en solo lectura y por la clave `UserAccountID` = `user_account_id`, las columnas `PartyID`, `AccountTypeID` y `AccountStatusID` de `IDN_USER_ACCOUNT` (y `Username` solo de cuentas `EMPLOYEE`), con `SELECT` por columna para `app_atc_servicio`. **Ese permiso lo otorga el dueño de la tabla, Control de acceso** (fragmento 01; ADR-019 de PJ-05: el modelo de cada tabla sigue siendo de su dueño): se pide al área en el correo de solicitud, como entregable de la DEP-16; mientras, en local, DEV y QA (R-11) se trabaja con el emisor de pruebas y el simulador de `CuentaPersonaPort` con datos de prueba (ED-08; `datos/registro-de-tablas.md` §4). No hay tabla propia de correspondencias ni copia. Con ese `PartyID`, Mi Portal filtra por el cliente y las bitácoras guardan al gestor (`ChangedByPartyID`, `AssignedToPartyID` del v7). Si Control de acceso publica más adelante un claim de persona, cambia el adaptador, no el dominio.

## 8 Reglas de alcance que no son un permiso

| Regla | Cómo se aplica | Fuente |
|---|---|---|
| Empresa | Por operación, con los roles que la autorizan: si alguno es global, las 11 empresas; si solo es de la empresa activa, esa empresa (sección 3) | C-08; ADR-009; ADR-007 y D-178 de PJ-05 |
| Área | El gestor no ve tickets de áreas ajenas salvo que supervise. El token no dice a qué área pertenece el gestor y Control de acceso no administra áreas (`NEX_COMPANY_AREA` no existe, D-74, D-193). **S-4, decidido (ED-04):** el área de cada rol de ATC es un parámetro de ATC, sin guardar personas (`ATC_LEGAL` → cola `LEGAL`, `ATC_POSTVENTA` → cola `POSTVENTA`, `ATC_AGENT` y `ATC_SUPERVISOR` → las colas de su empresa, o todas con rol global); el gestor ve las colas de su rol y los tickets asignados a él. `MAE_AREA` es solo la cola de atención, sin correspondencia con un área organizacional en la Etapa 1 (`datos/registro-de-tablas.md` §7) | HU-044 CA-03; C-07; ED-04 |
| Secciones de la consulta 360 | Cada rol ve solo los datos que su permiso permite; los demás aparecen con candado. Los permisos del sistema de origen se aplican en cada consulta | HU-050 CA-02, CA-07; RN-SVC-036; RNF-SEC-010 |
| Visor 3D | Solo las áreas permitidas (regla de área de esta tabla). El WebSocket `/ws/visor` exige el mismo rol que `estadoVisor`, validado en el *handshake* con el JWT; al vencer el token se cierra y el visor se reconecta (ADR-010) | HU-067 CA-07 |
| Tablero | El del gestor es solo suyo; el del equipo exige además `ATC.DASHBOARD.TEAM + ver` | HU-054 CA-03 |
| Cliente | Solo ve sus tickets, filtrados por el `PartyID` de su cuenta (S-3, ED-01); el cuerpo de la petición no puede traer un identificador de cliente (esquemas propios de Mi Portal, ADR-011); el ticket de otro cliente responde `AYB-PTL-404` y el intento queda en la auditoría | HU-064 CA-02; HU-065 CA-03 y CA-04 |
| Intentos denegados | Quedan registrados: registrar un ticket sin rol de atención (HU-001 CA-04), consultar al motor un dato no permitido (HU-052 CA-03) y abrir el ticket de otro cliente (HU-065 CA-04). El 403 por falta de rol lo da el SDK: ATC declara un bean `AuthorizationEventPublisher` (sin él, Spring Security no publica `AuthorizationDeniedEvent`) y un listener emite el evento de auditoría (`aybar-starter-audit`). HU-052 CA-03 y HU-065 CA-04 no son 403: el caso de uso emite el evento de auditoría por su puerto antes de responder | Historias citadas; `seguridad.md` |

Lo que ve el cliente se cita por sus criterios de origen (HU-064 CA-02; HU-065 CA-03 y CA-04): el código de regla que le dan los PDF del PO no está en el Excel; el Excel queda como lo publicó el PO y la diferencia está listada (ED-18). RNF-SEC-010 sí está en el Excel `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 31.

## 9 Incompatibilidades

La segregación de funciones (SoD) la administra Control de acceso: la matriz empieza vacía (R28) y un servicio solo declara pares entre sus propios roles (ADR-021 de PJ-05). Lo que ATC propone entregar:

| Rol | Rol incompatible | Alcance | Nivel | Motivo | Estado |
|---|---|---|---|---|---|
| `ATC_ADMIN_FUNCIONAL` | `ATC_AGENT` | Grupo (`companyId` nulo) | `BLOCK` | Quien publica los flujos no atiende los tickets que esos flujos gobiernan | Decisión del equipo (ED-20), sin respaldo en las historias |
| `ATC_ADMIN_FUNCIONAL` | `ATC_SUPERVISOR` | Grupo | `BLOCK` | Quien publica los flujos no supervisa los tickets que esos flujos gobiernan | Decisión del equipo (ED-20), sin respaldo en las historias |
| `ATC_SUPERVISOR` | `ATC_AGENT` | Grupo | `WARN_AND_LOG` | Un supervisor que también atiende puede tener los dos roles, por eso no se bloquea. El riesgo es tenerlos con alcances distintos (uno global y otro por empresa), la combinación que la sección 3 acota: queda avisada y registrada para que Control de acceso confirme que la asignación es la que se quiso | Decisión del equipo (ED-20; segunda revisión del Líder Técnico) |

Control de acceso evalúa estas incompatibilidades sobre la unión de los roles globales y por empresa (ADR-003 y ADR-007 de PJ-05), así que el par `ATC_SUPERVISOR` + `ATC_AGENT` se detecta también cuando uno es global y el otro por empresa. La escalada no depende de esa alerta: la impide la regla de alcance por operación de la sección 3, que vale aunque el área no registre la incompatibilidad. Las tres incompatibilidades son decisión del equipo (ED-20) y van en el lote que aprueba el área. Las demás reglas de «solo el supervisor» (HU-008 CA-03, HU-026, HU-045 CA-02) se resuelven con el permiso, no con una incompatibilidad.

## 10 Actores de las historias sin rol en la lista del Líder Técnico

| Actor | Historias | Decisión del equipo (ED-20) |
|---|---|---|
| Gestor de la Mesa de Casos (SGD) | HU-020 a HU-025 | Rol `ATC_CASES_DESK` |
| Coordinador CX | HU-029 a HU-031, HU-039, HU-041 | Rol `ATC_CX` |
| Moderador de evento y personal de apoyo | HU-037 a HU-039 | Rol `ATC_EVENT` · sin operaciones en la Etapa 1: HU-037 a 039 fuera por P-025; se entrega al área cuando se retomen |
| Personal de control de acceso del proyecto | HU-059 | Rol `ATC_SITE_ACCESS`; la persona necesita una cuenta `EMPLOYEE` invitada por el área (D-46) |
| Cliente convocado al Entrega Fest | HU-060 | Cuenta de tipo `CUSTOMER` activa (S-2, ED-01), con sesión de Mi Portal |
| Analista de Cobranza | HU-056, HU-057 | Los casos los abre un job (ADR-005); el analista los ve con `listarCasosResolucion`: es un gestor (`ATC_AGENT`) de la cola `COBRANZA` (S-4) |
| Responsable de proyecto | HU-058 | Recibe una carta; no tiene operación en el contrato. Quién es sale de la DEP-15; la constancia de la carta se ve en `listarCasosResolucion` |
| CDO | HU-032 | La auditoría es un job (ADR-005); su resultado lo ven el coordinador CX y el supervisor en la Torre de Control (`consultarAuditoriaRegistrosParalelos`). El CDO no tiene rol de ATC |
| Rol del eje destino que confirma un handoff | HU-027 | `ATC_LEGAL` (ED-20) |
| Validador de prospectos | C-06 | No es de ATC: `PROSPECT_VALIDATOR` de Control de acceso, en su consola; lo reciben los supervisores de la cola `ATC` (ED-09, ED-20). El caso entra a ATC como ticket «Validación de identidad (prospecto)» (decisión del coordinador): el gestor lo registra con `registrarTicket`, lo deriva con `derivarTicket` al supervisor que valida y lo cierra; la suspensión del impostor la hace `IT_ADMIN` (`suspenderProspecto`, ED-09) |

## 11 Cómo se entrega el catálogo (ADR-021 de PJ-05; ED-07)

Solo lo que documenta PJ-05 (ADR-021, decisiones 1 a 5; D-61, D-100, D-171 y D-223; rutas ⚠ de `access-control.openapi.yaml`). No hay otra vía de carga.

1. **Lotes de la Etapa 1.** Dos lotes en el formato del ADR-021, generados de las secciones 4 y 6 y versionados en el repositorio de ATC: `LoteDeOpcionesDeMenu` con las **27 opciones** de la Etapa 1, para `POST /api/v1/catalogo/opciones-de-menu`, y `LoteDeRolesPermisosEIncompatibilidades` con **8 roles, 65 permisos y 3 incompatibilidades**, para `POST /api/v1/catalogo/roles`. Las dos rutas están en `x-estado: definido` ⚠; cada lote entra entero o se rechaza.
2. **Quién lo carga.** El cliente OAuth `CONFIDENTIAL` de ATC, que crea TI con su script (D-223: secreto de 32 bytes, mostrado una vez y guardado en Azure Key Vault, ADR-014), con el **rol de cliente `CATALOG_REGISTRAR`**, que otorga el Administrador de seguridad y queda en `IDN_OAUTH_CLIENT_SCOPE` (ADR-021 de PJ-05, decisión 1; D-61). ATC lo pide en el correo de solicitud al área: es un entregable de la DEP-16 (riesgo R-11). La ruta con que el área lo otorga sigue en propuesta (D-171 ⚠); cómo lo otorga lo decide el área. ATC carga con `client_credentials` (`aybar-starter-client`, DT-10); antes consulta `GET /api/v1/catalogo/registros` y envía solo lo que falta.
3. **Todo nace inactivo** (`IsActive = FALSE`), con el cliente que lo registró (`RegisteredByClientID`).
4. **Aprobación fila por fila.** Una persona con `ROLE_IT_ADMIN` aprueba cada fila: son **103 tareas** (27 opciones + 8 roles + 65 permisos + 3 incompatibilidades; A24: una por fila), que vencen a los 7 días si nadie las resuelve y entonces se piden de nuevo (ADR-021 de PJ-05) ⚠ `HU-IDN-057`. Un permiso no se aprueba antes que su rol o su opción. Es la firma del área.
5. **Clientes `PUBLIC`.** Los de la consola ATC y de Mi Portal los carga el seeder del área por ambiente, con su `redirect_uri` (D-223); todos sus tokens llevan `aybar-atc` en `aud` (ED-06).
6. **Invitación y asignación.** El área invita a los gestores como cuentas `EMPLOYEE` ligadas a su `PARTY` (D-46), les asigna los roles, globales o por empresa (sección 3), y asigna `PROSPECT_VALIDATOR` a los supervisores de la cola `ATC` (C-06).
7. **Cambios posteriores: una nueva solicitud.** Lo que entre después se registra con una nueva solicitud por las mismas rutas, que también nace inactiva y se aprueba fila por fila: cuando se retomen HU-037 a 039, 048 y 053, las 4 opciones de la solicitud posterior, el rol `ATC_EVENT` y sus 7 permisos (12 tareas); igual un rol u opción nuevos de una etapa siguiente. Cambiar el nombre o retirar lo ya aprobado también pasa por la aprobación del área (D-100); esas rutas siguen en propuesta (D-171) y el cambio se pide al área.
8. **Mientras el área no apruebe.** En local, DEV y QA (R-11), el emisor de pruebas emite en el token los roles de ATC que pida la prueba (ED-08); en PRE, vale el criterio de corte de la UAT (R-12; ADR-014, punto 8); en producción, nunca.

## 12 Decisiones del equipo que aplica este catálogo

Decisiones del equipo (Brayan Hurtado), 26-oct-2026, propuestas al Líder Técnico en este envío (`analisis/decisiones.md`), con la decisión del coordinador del 26-oct sobre C-06.

| # | Tema | Decisión | Ref. |
|---|---|---|---|
| P-028 | Catálogo, «líder», rol global o por empresa, incompatibilidades | 9 roles documentados, 8 en la solicitud de la Etapa 1; «líder» = `ATC_SUPERVISOR`; global para quien atiende las 11 razones sociales; 3 incompatibilidades de §9; `ATC_LEGAL` confirma el handoff | ED-20 |
| P-033 | `PartyID` del cliente y del gestor; rol `CUSTOMER` | `CuentaPersonaPort` sobre `IDN_USER_ACCOUNT`, con el `SELECT` por columna que otorga el dueño de la tabla (entregable de la DEP-16); Mi Portal autoriza por cuenta `CUSTOMER` activa, sin rol | ED-01; excepción en ED-02 |
| P-034 | Permiso por operación | Por rol del token (§7); `/api/v1/mi/permisos` solo en la consola | ED-02 |
| P-035 | Gestores con un rol, líder y disponibilidad | Gestores de la cola según la bitácora de asignaciones de ATC; avisos a un rol y una cola | ED-03 |
| P-036 | Área del gestor | Parámetro de ATC por rol (S-4); `MAE_AREA` solo cola | ED-04 |
| P-039 | `CATALOG_REGISTRAR`, clientes OAuth y cambios | Dos lotes del ADR-021 por las rutas definidas, con el cliente de servicio de ATC y `CATALOG_REGISTRAR` (lo otorga el área); solicitud de la Etapa 1 (103 tareas) y nueva solicitud para lo posterior (§11) | ED-07 |
| P-041 | Prospectos y `PROSPECT_VALIDATOR` | Tipo de ticket «Validación de identidad (prospecto)» con 4 subtipos en la Etapa 1 (decisión del coordinador, C-06): ATC registra, deriva y cierra; valida en la consola de Control de acceso un supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` | ED-09 (actualizada), ED-14 |

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-22 | Jesús Chávez Elías, con IA | Primera versión: roles, opciones, acciones, matriz por operación y por rol, alcance, incompatibilidad propuesta, actores sin rol y preguntas abiertas |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Verificado contra el paquete aprobado de PJ-05: catálogo en su formato (árbol de 31 opciones y permiso = opción + una de las cinco acciones), `x-permiso` con la forma `<opción> + <acción>` y `x-roles` por operación; autorización por rol porque el token no trae permisos (S-1, P-034); permisos de `CUSTOMER` y `PartyID` como supuestos para Sony Montoya (S-2, S-3; P-033); asignación global o por empresa con D-178 (C-08); filtro por área sin áreas en Control de acceso (S-4, P-036); rol propuesto `ATC_SITE_ACCESS` (HU-059); la frase ancla ya no comparte permiso con el caso del evento; pasos de entrega con 117 tareas de aprobación y la ruta de `CATALOG_REGISTRAR` en propuesta (P-039) |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: regla explícita para un rol global y uno por empresa (si se permite: unión de roles, como el permiso efectivo de PJ-05; sobre qué empresas: por operación, con los roles que la autorizan), con ejemplo, componente y prueba; incompatibilidad `ATC_SUPERVISOR` + `ATC_AGENT` (`WARN_AND_LOG`) y 118 tareas de aprobación; aviso ⚠ con los 7 archivos de PJ-05 que no coinciden con el sello; roles sembrados: 9 (D-176); intentos denegados con `AuthorizationEventPublisher` y desde el caso de uso; visor y Mi Portal según ADR-010 y ADR-011; la visibilidad del cliente citada por sus criterios |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de contenido): cita `analisis/decisiones.md` v0.6 y `proceso-atencion-prospectos.md` v0.2, las versiones vigentes (decían v0.5 y v0.1). |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: catálogo decidido (ED-20; «líder» = `ATC_SUPERVISOR`, `ATC_LEGAL` confirma el handoff, rol global por invitación, incompatibilidades); S-1 (ED-02), S-2 y S-3 (ED-01, Mi Portal con cuenta `CUSTOMER`) y S-4 (ED-04) pasan de supuesto a decisión; `PROSPECT_VALIDATOR` para los supervisores de la cola `ATC` (ED-09); §11 con los dos lotes del ADR-021, una sola vez, por el cliente de servicio o el script de TI (ED-07); §12 pasa de preguntas a «Decisiones del equipo que aplica este catálogo» |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): el catálogo documentado no cambia (mismos roles, opciones y permisos); `ATC_EVENT` sin operaciones en la Etapa 1 (HU-037 a 039 fuera), se entrega al área cuando se retomen; las operaciones de HU-037 a 039, 048 y 053 marcadas «fuera de la Etapa 1» |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | Revisión final del Líder Técnico del 26-oct. Mi Portal con una sola regla: cuenta de tipo `CUSTOMER` activa, sin rol (`x-roles: []` y `x-autorizacion`; HU-IDN-045 CA-3, D-67, HU-IDN-059 CA-1), sin permisos para el rol `CUSTOMER` (O-07). Entrega según lo que documenta PJ-05: rutas definidas, todo inactivo, aprobación fila por fila y cambios por nueva solicitud, sin plan B (O-08); la solicitud de la Etapa 1 lleva 27 opciones, 8 roles, 65 permisos y 3 incompatibilidades (103 tareas) y `ATC_EVENT` con las 4 opciones sin operación van en una solicitud posterior (12 tareas; O-09). Matriz §5 con las 10 operaciones nuevas del contrato 0.7.0-borrador (69 operaciones, 48 pares; O-02). `SELECT` sobre `IDN_USER_ACCOUNT` como permiso que otorga el dueño de la tabla (S-3). Tipo de ticket «Validación de identidad (prospecto)» en la Etapa 1 (decisión del coordinador, C-06). Desde esta versión cada cambio de texto sube la versión (O-26) |

Generado por IA: documento completo (Claude, 2026-10-22), a partir de la revisión del Líder Técnico del 22-oct, las 62 historias de Nexora (actores y criterios de aceptación) y el contrato OpenAPI v5; actualizado con IA (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso (PJ-05). — Revisado por: (pendiente) · Aprueba: TL

Actualizado el 26-oct-2026 (v0.4) por Brayan Hurtado con IA (Claude): decisiones del equipo ED-01, ED-02, ED-03, ED-04, ED-07, ED-09 y ED-20 de `analisis/decisiones.md` v0.7. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8); operaciones y rol sin uso en la Etapa 1 anotados. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.6) por Brayan Hurtado con IA (Claude): revisión final del Líder Técnico (O-02, O-07, O-08 y O-09) y decisión del coordinador sobre C-06. — Revisado por: (pendiente)
