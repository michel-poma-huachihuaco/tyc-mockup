---
id: "SPEC-ANALISIS-PROSPECTOS"
tipo: "spec"
titulo: "Proceso de atención de prospectos y casos de identidad que Control de acceso deriva a ATC"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.7"
owner: "Brayan Hurtado (Dev 1)"
aprobadores: [product_owner, tech_lead]
fecha: "2026-10-28"
relacionados: ["AYB-0001", ADR-009, ADR-011, HU-ATC-001, HU-ATC-043, HU-ATC-047, SPEC-ARQ-ROLES-ATC, DECISIONES-AYB-0001]
tags: [analisis, proceso, prospectos, control-de-acceso, c-06]
---

# Proceso de atención de prospectos (C-06)

> **En la Etapa 1 (decisión del coordinador, 26-oct-2026; ED-09 y P-041 de `analisis/decisiones.md`):** entra el tipo de ticket **«Validación de identidad (prospecto)»**, con 4 subtipos: «Correo distinto», «DNI ya registrado por otra persona», «Posible suplantación» y «Otro caso de identidad». Va al área ATC (cola `ATC`) y se resuelve en la consola de Control de acceso, **sin HU ni horas nuevas**: el tipo y sus subtipos son semilla del catálogo, que se registra con la tipificación de HU-001 y sigue los flujos de HU-043. La validación la hace Control de acceso (PJ-05) en su consola; ATC registra el caso, informa a la persona y cierra el ticket.

Responde a la colisión **C-06** de la revisión del Líder Técnico (22-oct-2026): «ATC no construye la validación: la hacen sus gestores en la consola de Control de acceso, con el rol que el área les asigne. ATC agrega el proceso de atención: el caso "correo distinto" entra como un tipo de ticket y se resuelve en la consola del área. Indicar qué gestores necesitan `PROSPECT_VALIDATOR` para que el área se lo asigne».

El PLT-04 v1.3 no trae una historia para este proceso, y no hace falta: en la Etapa 1 es **configuración** con lo que ya está en el plan (registro tipificado de HU-001, flujo por área de HU-043 y guía de HU-047) y **0 h nuevas**. No se construye código, pantalla, tabla ni integración con Control de acceso (sección 6).

## 1 Qué hace cada uno

| Lo hace Control de acceso (PJ-05), en su consola | Lo hace ATC |
|---|---|
| Autorregistro del prospecto y su Party no verificada (R29) | Recibe el contacto de la persona por teléfono, correo, WhatsApp o en persona y lo registra como ticket del tipo «Validación de identidad (prospecto)» (sección 4) |
| Lista de prospectos pendientes y su coincidencia con la carga inicial | Verifica la identidad con el DNI físico, como piden D-84 y D-291 |
| Validar al prospecto como `CUSTOMER` o `BROKER`, o rechazarlo con su motivo | El supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` hace la validación **en la consola de Control de acceso**, no en ATC |
| Suspender la cuenta del impostor y anular su Party | Informa a la persona, deja constancia en el ticket sin datos personales y lo cierra |
| Corregir el correo o el DNI de una Party | **Nadie, hoy:** la consola no tiene esa herramienta. El ticket deja el caso anotado y se plantea al área en una etapa posterior |

ATC no construye pantallas de validación, no escribe `PARTY` ni `PARTY_VERIFICATION_LOG`, no lee las tablas de personas y no guarda copia del DNI ni del correo (DT-03, DT-06, C-11; D-119 de PJ-05).

## 2 Qué dice el paquete aprobado de PJ-05

Citas `archivo:línea` de la copia sellada de PJ-05 (`docs-roles-y-permisos/`). ⚠ marca los archivos cuya copia local no coincide con la huella del sello (7, recalculado el 26-oct: `arquitectura/access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003`, `014`, `054`, `057` y `059`): se citan como referencia (como en P-033 a P-042). Aquí se citan dos: el contrato y `HU-IDN-059`.

| Tema | Qué dice | Cita |
|---|---|---|
| Prospecto | Quien no existe se autorregistra: Party no verificada y cuenta `PROSPECT`. Pasa a `CUSTOMER` o `BROKER` cuando una persona de la empresa valida su Party. Su Party es de tipo `OTHER` y origen `URBEMIND` (HU-IDN-058 CA-3; `datos/modelo-de-datos.md:1847`) | `analisis/decisiones.md:118` (R29) |
| Quién valida | Ventas o atención al cliente, con su rol; la validación queda en `PARTY_VERIFICATION_LOG` | `analisis/decisiones.md:264` (D-59) |
| El rol | Se siembra `PROSPECT_VALIDATOR`; lo asignan Ventas y ATC | `analisis/decisiones.md:382` (D-176); `historias/HU-IDN-059-validar-prospecto-a-cliente-o-broker.md:27` ⚠ |
| Correo distinto | Mismo DNI con correos distintos: el principal es el del sistema más reciente y es el username. Con otro correo, se le pide contactar a Atención al cliente | `analisis/decisiones.md:285` (D-79); `historias/HU-IDN-061-carga-inicial-de-personas.md:44` (CA-4) |
| Prospecto que la carga trae | La carga nunca convierte un prospecto en cliente: sigue como prospecto y va al reporte `prospectosParaRevision`, para que Ventas o ATC lo validen | `analisis/decisiones.md:286` (D-80); `historias/HU-IDN-061-carga-inicial-de-personas.md:45` (CA-5) |
| Misma persona, impostor y DNI tomado | Ventas o ATC validan el DNI. Si es la misma persona, la pasan a cliente con el correo de la carga como principal; si es un impostor, suspenden la cuenta y liberan el DNI. Si la persona es nueva y el DNI está tomado, lo resuelve ATC con el DNI físico | `analisis/decisiones.md:290` (D-84) |
| Impostor | Operación aparte que suspende la cuenta y anula la Party del prospecto (queda `INACTIVE`), sin borrar el DNI; «se resuelve el DNI manualmente por ATC» | `analisis/decisiones.md:497` (D-291); `historias/HU-IDN-059-validar-prospecto-a-cliente-o-broker.md:52` ⚠ (CA-12) |
| Lista de pendientes | `listarProspectos`: cuentas que siguen en `PROSPECT`, con el documento enmascarado; la coincidencia con la carga se consulta en el log auditado por hash de DNI | `arquitectura/access-control.openapi.yaml:4007` ⚠; `historias/HU-IDN-059-validar-prospecto-a-cliente-o-broker.md:46` ⚠ (CA-6) y `:48` ⚠ (CA-8) |
| Validar o rechazar | `validarProspecto`, con el rol `ROLE_PROSPECT_VALIDATOR` y el permiso `SEC.PROSPECTOS` (código supuesto) | `arquitectura/access-control.openapi.yaml:4037` ⚠ |
| Suspender | `suspenderProspecto` (`POST /api/v1/prospectos/{id}/suspension`) exige `ROLE_IT_ADMIN`; la HU-IDN-059 CA-12 se la da al validador. En la Etapa 1 vale el contrato: suspende `IT_ADMIN` (ED-09) | `arquitectura/access-control.openapi.yaml:1426-1429` ⚠; P-041 |
| Datos de personas | Nadie lee las tablas de personas directamente | `analisis/decisiones.md:325` (D-119) |

## 3 De dónde sale `prospectosParaRevision` (D-80)

- Es un campo del **resultado de cada lote de la carga inicial de personas**: la puerta de carga `POST /internal/v1/cargas-de-personas` (`cargarPersonas`, rol de cliente `PERSON_LOADER`) devuelve `cargadas`, `yaExistian`, `rechazadas`, `duplicadas` y `prospectosParaRevision`, con el DNI enmascarado (`historias/HU-IDN-061-carga-inicial-de-personas.md:50`, CA-10; `arquitectura/access-control.openapi.yaml:259-262` y `:4954-4983` ⚠).
- **Lo recibe quien envía el lote**, que es el dueño de cada sistema de origen (D-60, `analisis/decisiones.md:265`), **no ATC**.
- El gestor de ATC ve esos prospectos en la **lista de pendientes de la consola de Control de acceso** (`listarProspectos`), donde la coincidencia con la carga sale del log auditado por hash de DNI (D-291; HU-IDN-059 CA-6).
- **ATC no se entera solo.** PJ-05 no tiene bus de eventos (`adr/ADR-020-starters-del-sdk-del-servicio.md:91`) ni una API con token de servicio para esto (P-035). En la Etapa 1, el supervisor de la cola `ATC` revisa la lista de pendientes de la consola una vez al día y abre un ticket «Otro caso de identidad» solo cuando el caso necesita seguimiento con la persona (sección 4). Que el ticket se abra solo exigiría que Control de acceso exponga la lista o un aviso: es un requerimiento para el área en una etapa posterior.

## 4 Tipo de ticket de la Etapa 1

**Tipo:** «Validación de identidad (prospecto)» (ED-09). Área: ATC (cola `ATC` de `MAE_AREA`), con el flujo por defecto del área (una actividad «Atención» con el SLA de la política del tipo; ED-14). Se registra con la operación que ya existe (`registrarTicket`, HU-001), sigue el flujo del tipo y subtipo (HU-043) y trae su guía de solución base en la semilla (HU-047, Q-047-2) con los pasos de esta sección. No se ofrece en Mi Portal: un prospecto no entra a Mi Portal (ED-01).

| Subtipo | Cómo llega | Qué hace ATC | Qué se hace en la consola de Control de acceso | Qué falta |
|---|---|---|---|---|
| **Correo distinto** (D-79) | La persona intentó registrarse con un correo que no es el principal y Control de acceso le pidió contactar a Atención al cliente | Verifica la identidad con el DNI físico. Le indica que se registre con el correo principal, mostrado enmascarado. Informa y cierra | Ninguna acción si el correo principal sigue siendo suyo | Si el correo principal ya no es suyo, cambiarlo: la consola no tiene la herramienta (etapa posterior) |
| **DNI ya registrado por otra persona** (D-84) | Una persona nueva no puede registrarse porque su DNI ya pertenece a otra Party, o al impostor anulado (D-291) | Verifica el DNI físico y registra el ticket. La persona no tiene Party: el ticket queda «sin cliente vinculado», con sus datos mínimos (ED-05) | Si la Party que tiene el DNI es de un impostor, se trata como «Posible suplantación». Liberar o corregir el DNI de otra Party: la consola no tiene la herramienta | Herramienta de corrección (etapa posterior); la Party correcta la crea Control de acceso al autorregistrar a la persona (ED-05) |
| **Posible suplantación** (D-291, D-84) | La verificación muestra que el DNI no es de quien se registró | Deja constancia en el ticket, sin datos personales | `suspenderProspecto`: suspende la cuenta y anula la Party del prospecto, sin borrar el DNI. Lo hace `IT_ADMIN`, como fija el contrato de PJ-05 | — |
| **Otro caso de identidad** | Cualquier otro caso de identidad de un prospecto que llega a ATC; por ejemplo, el prospecto que la carga trae y hay que validar (D-80, D-84) o la persona que llama para que la validen | Cita a la persona o verifica el DNI físico | Si es la misma persona: `validarProspecto` como `CUSTOMER` o `BROKER`, con el correo de la carga como principal (D-291). Si no lo es: rechazo con su motivo | — |

**Datos del ticket** (sin datos personales en notas ni bitácoras, RN-SVC-012):

- `PartyID`: la Party del prospecto o la de la carga, si existe; si no, «sin cliente vinculado» (P-037, ED-05). ATC no lee tipo ni estado de la Party: supone que la consulta del cliente no devuelve una Party `OTHER` o `INACTIVE` como cliente vinculado, y el mapa documento → `PartyID` es un supuesto de diseño de ATC que el simulador no prueba (ED-05, 28-oct).
- La constancia de la verificación del DNI queda en la interacción interna (quién, cuándo y por qué canal), **sin copia del DNI**. La evidencia de la validación la guarda Control de acceso en `PARTY_VERIFICATION_LOG`.
- El cierre usa los estados de siempre (`RESOLVED`, `CLOSED`); el SLA, la política de su tipo (`MAE_SLA_POLICY`, DEP-03).

## 5 Qué gestores necesitan `PROSPECT_VALIDATOR`

Lo asigna el área de Roles y Permisos al invitar a los gestores. Es un rol de Control de acceso, no del catálogo de ATC (D-176). **Decisión del equipo (ED-20):** en la Etapa 1 lo reciben los supervisores de la cola `ATC`. El gestor que recibe el contacto registra el ticket y lo asigna a un supervisor de la cola `ATC`, que resuelve en la consola.

| Quién | ¿Lo necesita? | Por qué |
|---|---|---|
| Supervisor ATC de la cola `ATC` | **Sí, en la Etapa 1** (ED-20) | Resuelve en la consola los tickets «Validación de identidad (prospecto)» y revisa los de posible suplantación. Al menos dos, para cubrir ausencias |
| Gestores de tickets de la cola `ATC` | No, en la Etapa 1 | Registran el ticket y lo asignan a un supervisor. Darles el rol es un pedido al área, si el volumen lo pide |
| Gestores de las otras colas (`COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION`) | No | No atienden este tipo |
| Administrador funcional, Mesa de Casos (SGD), Coordinador CX y moderadores de evento | No | No atienden este tipo |

- La asignación a cada persona la hace el área al invitarla (ED-20); ningún documento del paquete lleva nombres.
- **Cruce del Líder Técnico del 28-oct (§2 punto 7; C19):** la lista de quién necesita `PROSPECT_VALIDATOR` son los supervisores de la cola `ATC` (`ATC_SUPERVISOR`); va en la solicitud al área de Roles y Permisos, punto S28-6 (`arquitectura/roles-y-permisos-atc.md` §13, enviada el 29-oct a Sony Montoya, con copia al Líder Técnico; sin respuesta aún). Esto sustituye al criterio de la v0.5 de no enviar nada al área.
- Además del rol, la consola pide el permiso de la opción de prospectos (`SEC.PROSPECTOS`, código supuesto en PJ-05, D-30).
- Para suspender, el contrato pide `IT_ADMIN` (ED-09).
- Nadie valida su propia Party (RN-IDN-012 de PJ-05). PJ-05 no tiene incompatibilidades definidas para este rol.

## 6 Qué construye ATC

- **Nada nuevo en código:** ni pantallas de validación, ni API hacia Control de acceso, ni tablas.
- **En la Etapa 1, configuración** con lo que ya está en el plan:
  - el tipo y sus cuatro subtipos en la semilla del catálogo (`MAE_TICKET_TYPE` y `MAE_TICKET_SUBTYPE`, cambio al v7 de ED-15), en el área ATC;
  - el flujo por defecto del área (HU-043, ED-14);
  - la guía de solución base con los pasos de la sección 4 (HU-047, Q-047-2);
  - la capacitación de los supervisores el día de la UAT (R-10).
- **Horas:** 0 nuevas. La semilla va dentro de las tareas de tipificación de HU-001 y de flujos de HU-043, con sus horas del PLT-04. Una integración automática con la lista de pendientes sería alcance con horas y un requerimiento para Control de acceso en una etapa posterior.

## 7 Decisiones del equipo (26-oct)

Decididas por el equipo (Brayan Hurtado), 26-oct-2026, y propuestas al Líder Técnico en este envío (`analisis/decisiones.md`). P-041 la cerró el coordinador el 26-oct.

| # | Decisión |
|---|---|
| P-041 | En la Etapa 1 entra el tipo de ticket «Validación de identidad (prospecto)» con 4 subtipos, en el área ATC, sin HU ni horas nuevas; la validación la hace Control de acceso en su consola. Suspende al impostor `IT_ADMIN`, como fija el contrato de PJ-05; la herramienta para corregir el correo o el DNI de una Party se plantea al área en una etapa posterior (ED-09) |
| P-037 | ATC no crea la Party: la crea Control de acceso cuando la persona se autorregistra (R29) y el job de vinculación de ATC completa el ticket «sin cliente vinculado» (ED-05) |
| P-035 | En la Etapa 1 no hay integración con la lista de prospectos: el supervisor la revisa en la consola; la integración queda para una etapa posterior (ED-03, ED-09) |
| P-028 | `PROSPECT_VALIDATOR` lo reciben los supervisores de la cola `ATC`; el área lo asigna al invitarlos (ED-20) |

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial (C-06): qué hace Control de acceso y qué hace ATC, citas al paquete aprobado de PJ-05, de dónde sale `prospectosParaRevision`, tipo de ticket con cuatro subtipos, gestores que necesitan `PROSPECT_VALIDATOR` y qué construye ATC. Todo es alcance nuevo para el PO (P-041) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | El aviso ⚠ cubre los 7 archivos de PJ-05 que no coinciden con el sello y marca las citas a `HU-IDN-059`. P-041 de `decisiones.md` v0.6 ya dice lo mismo que este proceso: un tipo de ticket con cuatro subtipos. El proceso no cambia |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: el proceso queda fuera de la Etapa 1 y como propuesta para una etapa posterior (ED-09); en la Etapa 1, «Pedido simple · Otra solicitud» resuelto por un supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` (ED-20); suspende `IT_ADMIN`; el interesado sin Party, «sin cliente vinculado» (ED-05); la sección 7 pasa de preguntas a decisiones |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Decisión del coordinador (P-041, ED-09): en la Etapa 1 entra el tipo de ticket «Validación de identidad (prospecto)» con los subtipos «Correo distinto», «DNI ya registrado por otra persona», «Posible suplantación» y «Otro caso de identidad», en el área ATC, sin HU ni horas nuevas (semilla con la tipificación de HU-001 y los flujos de HU-043); se resuelve en la consola de Control de acceso. Secciones 4 a 7 reescritas |
| 0.5 | 2026-10-28 | Jesús Chávez Elías, con IA | ATC se adapta a PJ-05 (C11): la Party del prospecto es `OTHER` y la del impostor queda `INACTIVE`; el `PartyID` de un cliente existente es supuesto de diseño de ATC (ED-05 reclasificada). El proceso no cambia |
| 0.6 | 2026-10-28 | Jesús Chávez Elías, con IA | Cruce del Líder Técnico del 28-oct (C19, punto 7): `PROSPECT_VALIDATOR` para los supervisores de la cola `ATC` va en la solicitud S28-6, a enviar por el equipo (manda sobre el criterio «no se envían correos»). El proceso no cambia |
| 0.7 | 2026-10-29 | Jesús Chávez Elías, con IA | Registrado el envío de la solicitud S28 a Sony Montoya el 29-oct |

Generado por IA: borrador completo (Claude, 26-oct-2026) a partir de la revisión del Líder Técnico del 22-oct (C-06; DT-03 y DT-06) y del paquete aprobado de Control de acceso (PJ-05). No cambia el plan del PO. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.2) por Brayan Hurtado con IA (Claude) a partir de las revisiones internas técnica (hallazgo 29) y de coherencia (hallazgo 9) del 26-oct. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7, ED-09): fuera de la Etapa 1, propuesta para una etapa posterior. — Revisado por: (pendiente)

Historial: 0.4 · 2026-10-26 · Brayan Hurtado, con IA · El tipo «Validación de identidad (prospecto)» y sus 4 subtipos entran en la Etapa 1 (decisión del coordinador; P-041, ED-09), sin HU ni horas nuevas. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v0.5) por Jesús Chávez Elías con IA (Claude): Party `OTHER` e `INACTIVE` y supuesto del mapa documento → `PartyID` (C11); el proceso no cambia. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v0.6) por Jesús Chávez Elías con IA (Claude): `PROSPECT_VALIDATOR` de los supervisores de la cola `ATC` en la solicitud S28-6 (cruce del Líder Técnico, C19); el proceso no cambia. — Revisado por: (pendiente)

Actualizado el 29-oct-2026 (v0.7) por Jesús Chávez Elías con IA (Claude): registro del envío de la solicitud S28 a Sony Montoya el 29-oct, con copia al Líder Técnico. — Revisado por: (pendiente)
