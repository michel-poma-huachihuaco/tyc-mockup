---
id: "SPEC-ANALISIS-PROSPECTOS"
tipo: "spec"
titulo: "Proceso de atención de prospectos y casos de identidad que Control de acceso deriva a ATC"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Brayan Hurtado (Dev 1)"
aprobadores: [product_owner, tech_lead]
fecha: "2026-10-26"
relacionados: ["AYB-0001", ADR-009, ADR-011, HU-ATC-001, HU-ATC-043, HU-ATC-047, SPEC-ARQ-ROLES-ATC, DECISIONES-AYB-0001]
tags: [analisis, proceso, prospectos, control-de-acceso, c-06]
---

# Proceso de atención de prospectos (C-06)

> **Fuera de la Etapa 1 (ED-09, 26-oct):** los casos manuales de prospectos no están en el PLT-04 v1.3; este documento queda como propuesta para una etapa posterior. En la Etapa 1 un caso así se registra como «Pedido simple · Otra solicitud» y lo resuelve en la consola de Control de acceso un supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` (`analisis/decisiones.md` v0.7, P-041, ED-09 y ED-20).

Responde a la colisión **C-06** de la revisión del Líder Técnico (22-oct-2026): «ATC no construye la validación: la hacen sus gestores en la consola de Control de acceso, con el rol que el área les asigne. ATC agrega el proceso de atención: el caso "correo distinto" entra como un tipo de ticket y se resuelve en la consola del área. Indicar qué gestores necesitan `PROSPECT_VALIDATOR` para que el área se lo asigne».

**Nada de este proceso está en el PLT-04 v1.3**: ninguna de las 62 historias ni de las 243 h lo cubre. Todo lo que sigue es alcance nuevo y **queda fuera de la Etapa 1** (P-041, decidida por el equipo, ED-09): es una propuesta para una etapa posterior y en la Etapa 1 no se construye ni se configura nada de lo que sigue.

## 1 Qué hace cada uno

| Lo hace Control de acceso (PJ-05), en su consola | Lo hace ATC |
|---|---|
| Autorregistro del prospecto y su Party no verificada (R29) | Recibe el contacto de la persona por teléfono, correo, WhatsApp o en persona y lo registra como ticket del tipo propuesto (sección 4) |
| Lista de prospectos pendientes y su coincidencia con la carga inicial | Verifica la identidad con el DNI físico, como piden D-84 y D-291 |
| Validar al prospecto como `CUSTOMER` o `BROKER`, o rechazarlo con su motivo | El gestor con `PROSPECT_VALIDATOR` hace la validación **en la consola de Control de acceso**, no en ATC |
| Suspender la cuenta del impostor y anular su Party | Informa a la persona, deja constancia en el ticket sin datos personales y lo cierra |
| Corregir el correo o el DNI de una Party | **Nadie, hoy:** la consola no tiene esa herramienta; se plantea al área en la etapa posterior |

ATC no construye pantallas de validación, no escribe `PARTY` ni `PARTY_VERIFICATION_LOG`, no lee las tablas de personas y no guarda copia del DNI ni del correo (DT-03, DT-06, C-11; D-119 de PJ-05).

## 2 Qué dice el paquete aprobado de PJ-05

Citas `archivo:línea` de la copia sellada de PJ-05 (`docs-roles-y-permisos/`). ⚠ marca los archivos cuya copia local no coincide con la huella del sello (7, recalculado el 26-oct: `arquitectura/access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003`, `014`, `054`, `057` y `059`): se citan como referencia (como en P-033 a P-042). Aquí se citan dos: el contrato y `HU-IDN-059`.

| Tema | Qué dice | Cita |
|---|---|---|
| Prospecto | Quien no existe se autorregistra: Party no verificada y cuenta `PROSPECT`. Pasa a `CUSTOMER` o `BROKER` cuando una persona de la empresa valida su Party | `analisis/decisiones.md:118` (R29) |
| Quién valida | Ventas o atención al cliente, con su rol; la validación queda en `PARTY_VERIFICATION_LOG` | `analisis/decisiones.md:264` (D-59) |
| El rol | Se siembra `PROSPECT_VALIDATOR`; lo asignan Ventas y ATC | `analisis/decisiones.md:382` (D-176); `historias/HU-IDN-059-validar-prospecto-a-cliente-o-broker.md:27` ⚠ |
| Correo distinto | Mismo DNI con correos distintos: el principal es el del sistema más reciente y es el username. Con otro correo, se le pide contactar a Atención al cliente | `analisis/decisiones.md:285` (D-79); `historias/HU-IDN-061-carga-inicial-de-personas.md:44` (CA-4) |
| Prospecto que la carga trae | La carga nunca convierte un prospecto en cliente: sigue como prospecto y va al reporte `prospectosParaRevision`, para que Ventas o ATC lo validen | `analisis/decisiones.md:286` (D-80); `historias/HU-IDN-061-carga-inicial-de-personas.md:45` (CA-5) |
| Misma persona, impostor y DNI tomado | Ventas o ATC validan el DNI. Si es la misma persona, la pasan a cliente con el correo de la carga como principal; si es un impostor, suspenden la cuenta y liberan el DNI. Si la persona es nueva y el DNI está tomado, lo resuelve ATC con el DNI físico | `analisis/decisiones.md:290` (D-84) |
| Impostor | Operación aparte que suspende la cuenta y anula la Party del prospecto, sin borrar el DNI; «se resuelve el DNI manualmente por ATC» | `analisis/decisiones.md:497` (D-291); `historias/HU-IDN-059-validar-prospecto-a-cliente-o-broker.md:52` ⚠ (CA-12) |
| Lista de pendientes | `listarProspectos`: cuentas que siguen en `PROSPECT`, con el documento enmascarado; la coincidencia con la carga se consulta en el log auditado por hash de DNI | `arquitectura/access-control.openapi.yaml:4007` ⚠; `historias/HU-IDN-059-validar-prospecto-a-cliente-o-broker.md:46` ⚠ (CA-6) y `:48` ⚠ (CA-8) |
| Validar o rechazar | `validarProspecto`, con el rol `ROLE_PROSPECT_VALIDATOR` y el permiso `SEC.PROSPECTOS` (código supuesto) | `arquitectura/access-control.openapi.yaml:4037` ⚠ |
| Suspender | `suspenderProspecto` exige `ROLE_IT_ADMIN`; la HU-IDN-059 CA-12 se la da al validador. En la Etapa 1 vale el contrato: suspende `IT_ADMIN` (ED-09) | `arquitectura/access-control.openapi.yaml:1429` ⚠; P-041 |
| Datos de personas | Nadie lee las tablas de personas directamente | `analisis/decisiones.md:325` (D-119) |

## 3 De dónde sale `prospectosParaRevision` (D-80)

- Es un campo del **resultado de cada lote de la carga inicial de personas**: la puerta de carga `POST /internal/v1/cargas-de-personas` (`cargarPersonas`, rol de cliente `PERSON_LOADER`) devuelve `cargadas`, `yaExistian`, `rechazadas`, `duplicadas` y `prospectosParaRevision`, con el DNI enmascarado (`historias/HU-IDN-061-carga-inicial-de-personas.md:50`, CA-10; `arquitectura/access-control.openapi.yaml:259-262` y `:4954-4983` ⚠).
- **Lo recibe quien envía el lote**, que es el dueño de cada sistema de origen (D-60, `analisis/decisiones.md:265`), **no ATC**.
- El gestor de ATC ve esos prospectos en la **lista de pendientes de la consola de Control de acceso** (`listarProspectos`), donde la coincidencia con la carga sale del log auditado por hash de DNI (D-291; HU-IDN-059 CA-6).
- **ATC no se entera solo.** PJ-05 no tiene bus de eventos (`adr/ADR-020-starters-del-sdk-del-servicio.md:91`) ni una API con token de servicio para esto (P-035). Propuesta para la etapa posterior: el gestor revisa la lista de pendientes de la consola una vez al día y abre un ticket solo cuando el caso necesita seguimiento con la persona (sección 4). Que el ticket se abra solo exigiría que Control de acceso exponga la lista o un aviso, un requerimiento para el área en esa etapa.

## 4 Tipo de ticket propuesto (etapa posterior)

En la Etapa 1 este tipo no existe: un caso así se registra como «Pedido simple · Otra solicitud» (ADR-008, combinación 9) y lo resuelve un supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` (ED-09).

**Tipo:** «Registro y acceso de clientes» (alcance de una etapa posterior, ED-09). Cola: `ATC` de `MAE_AREA`. Se registra con la operación que ya existe (`registrarTicket`, HU-001) y sigue el flujo del tipo y subtipo (HU-043), con su guía de solución (HU-047).

| Subtipo | Cómo llega | Qué hace el gestor de ATC | Qué hace en la consola de Control de acceso | Qué falta | ¿En el PLT-04 v1.3? |
|---|---|---|---|---|---|
| **Correo distinto** (D-79) | La persona intentó registrarse con un correo que no es el principal y Control de acceso le pidió contactar a Atención al cliente | Verifica la identidad con el DNI físico. Le indica que se registre con el correo principal, mostrado enmascarado. Informa y cierra | Ninguna acción si el correo principal sigue siendo suyo | Si el correo principal ya no es suyo, cambiarlo: la consola no tiene la herramienta (etapa posterior) | No: etapa posterior (ED-09) |
| **Prospecto por validar** (D-80, D-84) | El prospecto aparece en la lista de pendientes, con coincidencia con la carga, o la persona llama para que la validen | Cita a la persona o verifica el DNI físico | Si es la misma persona: `validarProspecto` como `CUSTOMER` o `BROKER`, con el correo de la carga como principal (D-291). Si no lo es: rechaza con su motivo | — | No: etapa posterior (ED-09) |
| **Suplantación de identidad** (D-84, D-291) | La verificación muestra que el DNI no es de quien se registró | Deja constancia en el ticket, sin datos personales | `suspenderProspecto`: suspende la cuenta y anula la Party del prospecto, sin borrar el DNI | Suspende `IT_ADMIN`, como fija el contrato de PJ-05 (ED-09) | No: etapa posterior (ED-09) |
| **DNI tomado** (D-84, D-291) | Una persona nueva no puede registrarse porque su DNI ya pertenece a otra Party, o al impostor anulado | Verifica el DNI físico y registra el ticket. La persona no tiene Party: el ticket se registra «sin cliente vinculado», con sus datos mínimos (P-037, ED-05) | Liberar o corregir el DNI de la Party: la consola no tiene la herramienta | Herramienta de corrección (etapa posterior); la Party correcta la crea Control de acceso al autorregistrar a la persona (ED-05) | No: etapa posterior (ED-09) |

**Datos del ticket** (sin datos personales en notas ni bitácoras, RN-SVC-012):

- `PartyID`: la Party del prospecto o la de la carga, si existe; si no, «sin cliente vinculado» (P-037, ED-05).
- La constancia de la verificación del DNI queda en la interacción interna (quién, cuándo y por qué canal), **sin copia del DNI**. La evidencia de la validación la guarda Control de acceso en `PARTY_VERIFICATION_LOG`.
- El cierre usa los estados de siempre (`RESOLVED`, `CLOSED`); el SLA, la política de su tipo (`MAE_SLA_POLICY`, DEP-03).

## 5 Qué gestores necesitan `PROSPECT_VALIDATOR`

Lo asigna el área de Roles y Permisos al invitar a los gestores. Es un rol de Control de acceso, no del catálogo de ATC (D-176). **Decisión del equipo (ED-20):** en la Etapa 1 lo reciben los supervisores de la cola `ATC`; los gestores asignados al tipo, cuando el tipo exista.

| Quién | ¿Lo necesita? | Por qué |
|---|---|---|
| Gestores de tickets de la cola `ATC` asignados al tipo «Registro y acceso de clientes» | En la etapa posterior | Validarán o rechazarán en la consola cuando exista el tipo (sección 4). Propuesta: al menos dos, para cubrir ausencias |
| Supervisor ATC de la cola `ATC` | **Sí, en la Etapa 1** (ED-20) | Resuelve en la consola los casos que llegan como «Pedido simple · Otra solicitud» y revisa los de suplantación |
| Gestores de las otras colas (`COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION`) | No | No atienden este tipo |
| Administrador funcional, Mesa de Casos (SGD), Coordinador CX y moderadores de evento | No | No atienden este tipo |

- La asignación a cada persona la hace el área al invitarla (ED-20); ningún documento del paquete lleva nombres.
- Además del rol, la consola pide el permiso de la opción de prospectos (`SEC.PROSPECTOS`, código supuesto en PJ-05, D-30).
- Para suspender, el contrato pide `IT_ADMIN` (ED-09).
- Nadie valida su propia Party (RN-IDN-012 de PJ-05). PJ-05 no tiene incompatibilidades definidas para este rol.

## 6 Qué construye ATC

- **Nada nuevo en código:** ni pantallas de validación, ni API hacia Control de acceso, ni tablas.
- En la etapa posterior sería **configuración** con lo que ya está en el plan:
  - el tipo y sus cuatro subtipos (`MAE_TICKET_TYPE` y `MAE_TICKET_SUBTYPE`, cambio al v7 propuesto, P-016);
  - el flujo por área (HU-043);
  - la guía de solución con los pasos de la sección 4 (HU-047);
  - la capacitación de los gestores.
- **Horas:** 0 en la Etapa 1 (ED-09). La configuración y la capacitación se estiman al planear la etapa posterior. Una integración automática con la lista de pendientes sería alcance con horas y un requerimiento para Control de acceso en esa etapa.

## 7 Decisiones del equipo (26-oct)

Decididas por el equipo (Brayan Hurtado), 26-oct-2026; propuestas al Líder Técnico en el envío de `analisis/decisiones.md` v0.7.

| # | Decisión |
|---|---|
| P-041 | El proceso queda fuera de la Etapa 1 (no está en el PLT-04); este documento es una propuesta para una etapa posterior. En la Etapa 1 suspende al impostor `IT_ADMIN`, como fija el contrato de PJ-05; la herramienta para corregir el correo o el DNI de una Party se plantea al área en la etapa posterior (ED-09) |
| P-037 | ATC no crea la Party: la crea Control de acceso cuando la persona se autorregistra (R29) y el job de vinculación de ATC completa el ticket «sin cliente vinculado» (ED-05) |
| P-035 | En la Etapa 1 no hay integración con la lista de prospectos; queda para la etapa posterior (ED-03, ED-09) |
| P-028 | `PROSPECT_VALIDATOR` lo reciben los supervisores de la cola `ATC`; el área lo asigna al invitarlos (ED-20) |

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial (C-06): qué hace Control de acceso y qué hace ATC, citas al paquete aprobado de PJ-05, de dónde sale `prospectosParaRevision`, tipo de ticket con cuatro subtipos, gestores que necesitan `PROSPECT_VALIDATOR` y qué construye ATC. Todo es alcance nuevo para el PO (P-041) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | El aviso ⚠ cubre los 7 archivos de PJ-05 que no coinciden con el sello y marca las citas a `HU-IDN-059`. P-041 de `decisiones.md` v0.6 ya dice lo mismo que este proceso: un tipo de ticket con cuatro subtipos. El proceso no cambia |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: el proceso queda fuera de la Etapa 1 y como propuesta para una etapa posterior (ED-09); en la Etapa 1, «Pedido simple · Otra solicitud» resuelto por un supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` (ED-20); suspende `IT_ADMIN`; el interesado sin Party, «sin cliente vinculado» (ED-05); la sección 7 pasa de preguntas a decisiones |

Generado por IA: borrador completo (Claude, 26-oct-2026) a partir de la revisión del Líder Técnico del 22-oct (C-06; DT-03 y DT-06) y del paquete aprobado de Control de acceso (PJ-05). No cambia el plan del PO. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.2) por Brayan Hurtado con IA (Claude) a partir de las revisiones del Líder Técnico (hallazgo 29) y de coherencia (hallazgo 9) del 26-oct. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7, ED-09): fuera de la Etapa 1, propuesta para una etapa posterior. — Revisado por: (pendiente)
