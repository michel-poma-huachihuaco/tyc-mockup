---
id: "SPEC-ANALISIS-PROSPECTOS"
tipo: "spec"
titulo: "Proceso de atención de prospectos y casos de identidad que Control de acceso deriva a ATC"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Brayan Hurtado (Dev 1)"
aprobadores: [product_owner, tech_lead]
fecha: "2026-10-26"
relacionados: ["AYB-0001", ADR-009, ADR-011, HU-ATC-001, HU-ATC-043, HU-ATC-047, SPEC-ARQ-ROLES-ATC, DECISIONES-AYB-0001]
tags: [analisis, proceso, prospectos, control-de-acceso, c-06]
---

# Proceso de atención de prospectos (C-06)

Responde a la colisión **C-06** de la revisión del Líder Técnico (22-oct-2026): «ATC no construye la validación: la hacen sus gestores en la consola de Control de acceso, con el rol que el área les asigne. ATC agrega el proceso de atención: el caso "correo distinto" entra como un tipo de ticket y se resuelve en la consola del área. Indicar qué gestores necesitan `PROSPECT_VALIDATOR` para que el área se lo asigne».

**Nada de este proceso está en el PLT-04 v1.3**: ninguna de las 62 historias ni de las 243 h lo cubre. Todo lo que sigue es **alcance nuevo para el PO (P-041)**, que decide si entra en la Etapa 1. Mientras no lo decida, no se construye ni se configura nada.

## 1 Qué hace cada uno

| Lo hace Control de acceso (PJ-05), en su consola | Lo hace ATC |
|---|---|
| Autorregistro del prospecto y su Party no verificada (R29) | Recibe el contacto de la persona por teléfono, correo, WhatsApp o en persona y lo registra como ticket del tipo propuesto (sección 4) |
| Lista de prospectos pendientes y su coincidencia con la carga inicial | Verifica la identidad con el DNI físico, como piden D-84 y D-291 |
| Validar al prospecto como `CUSTOMER` o `BROKER`, o rechazarlo con su motivo | El gestor con `PROSPECT_VALIDATOR` hace la validación **en la consola de Control de acceso**, no en ATC |
| Suspender la cuenta del impostor y anular su Party | Informa a la persona, deja constancia en el ticket sin datos personales y lo cierra |
| Corregir el correo o el DNI de una Party | **Nadie, hoy:** la consola no tiene esa herramienta (P-041) |

ATC no construye pantallas de validación, no escribe `PARTY` ni `PARTY_VERIFICATION_LOG`, no lee las tablas de personas y no guarda copia del DNI ni del correo (DT-03, DT-06, C-11; D-119 de PJ-05).

## 2 Qué dice el paquete aprobado de PJ-05

Citas `archivo:línea` de la copia sellada de PJ-05 (`docs-roles-y-permisos/`). ⚠ marca los archivos cuya copia local no coincide con la huella del sello (7, recalculado el 26-oct: `arquitectura/access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003`, `014`, `054`, `057` y `059`): esas líneas se confirman con la versión aprobada (como en P-033 a P-042). Aquí se citan dos: el contrato y `HU-IDN-059`.

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
| Suspender | `suspenderProspecto` exige `ROLE_IT_ADMIN`; la HU-IDN-059 CA-12 se la da al validador | `arquitectura/access-control.openapi.yaml:1429` ⚠; P-041 |
| Datos de personas | Nadie lee las tablas de personas directamente | `analisis/decisiones.md:325` (D-119) |

## 3 De dónde sale `prospectosParaRevision` (D-80)

- Es un campo del **resultado de cada lote de la carga inicial de personas**: la puerta de carga `POST /internal/v1/cargas-de-personas` (`cargarPersonas`, rol de cliente `PERSON_LOADER`) devuelve `cargadas`, `yaExistian`, `rechazadas`, `duplicadas` y `prospectosParaRevision`, con el DNI enmascarado (`historias/HU-IDN-061-carga-inicial-de-personas.md:50`, CA-10; `arquitectura/access-control.openapi.yaml:259-262` y `:4954-4983` ⚠).
- **Lo recibe quien envía el lote**, que es el dueño de cada sistema de origen (D-60, `analisis/decisiones.md:265`), **no ATC**.
- El gestor de ATC ve esos prospectos en la **lista de pendientes de la consola de Control de acceso** (`listarProspectos`), donde la coincidencia con la carga sale del log auditado por hash de DNI (D-291; HU-IDN-059 CA-6).
- **ATC no se entera solo.** PJ-05 no tiene bus de eventos (`adr/ADR-020-starters-del-sdk-del-servicio.md:91`) ni una API con token de servicio para esto (P-035). Propuesta: el gestor revisa la lista de pendientes de la consola una vez al día y abre un ticket solo cuando el caso necesita seguimiento con la persona (sección 4). Si el PO quiere que el ticket se abra solo, hace falta que Control de acceso exponga la lista o un aviso: es un requerimiento nuevo para el área (P-035, P-041).

## 4 Tipo de ticket propuesto

**Tipo:** «Registro y acceso de clientes» (alcance nuevo, P-041). Cola: `ATC` de `MAE_AREA`. Se registra con la operación que ya existe (`registrarTicket`, HU-001) y sigue el flujo del tipo y subtipo (HU-043), con su guía de solución (HU-047).

| Subtipo | Cómo llega | Qué hace el gestor de ATC | Qué hace en la consola de Control de acceso | Qué falta | ¿En el PLT-04 v1.3? |
|---|---|---|---|---|---|
| **Correo distinto** (D-79) | La persona intentó registrarse con un correo que no es el principal y Control de acceso le pidió contactar a Atención al cliente | Verifica la identidad con el DNI físico. Le indica que se registre con el correo principal, mostrado enmascarado. Informa y cierra | Ninguna acción si el correo principal sigue siendo suyo | Si el correo principal ya no es suyo, cambiarlo: la consola no tiene la herramienta (P-041) | No: **alcance nuevo para el PO (P-041)** |
| **Prospecto por validar** (D-80, D-84) | El prospecto aparece en la lista de pendientes, con coincidencia con la carga, o la persona llama para que la validen | Cita a la persona o verifica el DNI físico | Si es la misma persona: `validarProspecto` como `CUSTOMER` o `BROKER`, con el correo de la carga como principal (D-291). Si no lo es: rechaza con su motivo | — | No: **alcance nuevo para el PO (P-041)** |
| **Suplantación de identidad** (D-84, D-291) | La verificación muestra que el DNI no es de quien se registró | Deja constancia en el ticket, sin datos personales | `suspenderProspecto`: suspende la cuenta y anula la Party del prospecto, sin borrar el DNI | Quién puede suspender: `IT_ADMIN` según el contrato o el validador según HU-IDN-059 CA-12 (P-041) | No: **alcance nuevo para el PO (P-041)** |
| **DNI tomado** (D-84, D-291) | Una persona nueva no puede registrarse porque su DNI ya pertenece a otra Party, o al impostor anulado | Verifica el DNI físico y registra el ticket. La persona no tiene Party: el ticket queda con la vinculación pendiente (P-037) | Liberar o corregir el DNI de la Party: la consola no tiene la herramienta | Herramienta de corrección y quién crea la Party correcta (P-041, P-037) | No: **alcance nuevo para el PO (P-041)** |

**Datos del ticket** (sin datos personales en notas ni bitácoras, RN-SVC-012):

- `PartyID`: la Party del prospecto o la de la carga, si existe; si no, vinculación pendiente (P-037).
- La constancia de la verificación del DNI queda en la interacción interna (quién, cuándo y por qué canal), **sin copia del DNI**. La evidencia de la validación la guarda Control de acceso en `PARTY_VERIFICATION_LOG`.
- El cierre usa los estados de siempre (`RESOLVED`, `CLOSED`); el SLA, la política de su tipo (`MAE_SLA_POLICY`, DEP-03).

## 5 Qué gestores necesitan `PROSPECT_VALIDATOR`

Para que el área de Roles y Permisos (Sony Montoya) lo asigne. Es un rol de Control de acceso, no del catálogo de ATC (D-176); se pide junto con la invitación de los gestores (pedidos de `analisis/decisiones.md`).

| Quién | ¿Lo necesita? | Por qué |
|---|---|---|
| Gestores de tickets de la cola `ATC` asignados al tipo «Registro y acceso de clientes» | **Sí** | Validan o rechazan en la consola (sección 4). Propuesta: al menos dos, para cubrir ausencias |
| Supervisor ATC de esa cola | **Sí** | Suplencia y revisión de los casos de suplantación |
| Gestores de las otras colas (`COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION`) | No | No atienden este tipo |
| Administrador funcional, Mesa de Casos (SGD), Coordinador CX y moderadores de evento | No | No atienden este tipo |

- **La lista con nombres la entrega la Gerencia ATC (PO)** al área de Roles y Permisos; ningún documento la trae.
- Además del rol, la consola pide el permiso de la opción de prospectos (`SEC.PROSPECTOS`, código supuesto en PJ-05, D-30).
- Para suspender, el contrato pide `IT_ADMIN`: lo resuelve P-041.
- Nadie valida su propia Party (RN-IDN-012 de PJ-05). PJ-05 no tiene incompatibilidades definidas para este rol.

## 6 Qué construye ATC

- **Nada nuevo en código:** ni pantallas de validación, ni API hacia Control de acceso, ni tablas.
- Si el PO lo aprueba, es **configuración** con lo que ya está en el plan:
  - el tipo y sus cuatro subtipos (`MAE_TICKET_TYPE` y `MAE_TICKET_SUBTYPE`, cambio al v7 propuesto, P-016);
  - el flujo por área (HU-043);
  - la guía de solución con los pasos de la sección 4 (HU-047);
  - la capacitación de los gestores.
- **Horas:** 0 en el plan de 243 h. La configuración y la capacitación las estima el equipo cuando el PO decida (P-041). Una integración automática con la lista de pendientes sería alcance con horas y requerimiento nuevo para Control de acceso (P-035).

## 7 Preguntas abiertas

| # | Pregunta | A quién |
|---|---|---|
| P-041 | ¿Entra este proceso en la Etapa 1 (tipo, subtipos y horas de configuración)? ¿Quién suspende al impostor? ¿Quién corrige el correo o el DNI de una Party si la consola no tiene la herramienta? | PO (alcance); Sony Montoya (suspensión y corrección); Líder Técnico |
| P-037 | ¿Quién crea la Party de la persona nueva cuyo DNI estaba tomado? | Líder Técnico, Sony Montoya y Gobierno de Datos |
| P-035 | ¿Puede Control de acceso exponer a ATC, con token de servicio, la lista de prospectos por revisar o un aviso? | Sony Montoya |
| P-028 | La lista de gestores con `PROSPECT_VALIDATOR` (sección 5) | PO (Gerencia ATC) y área de Roles y Permisos |

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial (C-06): qué hace Control de acceso y qué hace ATC, citas al paquete aprobado de PJ-05, de dónde sale `prospectosParaRevision`, tipo de ticket con cuatro subtipos, gestores que necesitan `PROSPECT_VALIDATOR` y qué construye ATC. Todo es alcance nuevo para el PO (P-041) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | El aviso ⚠ cubre los 7 archivos de PJ-05 que no coinciden con el sello y marca las citas a `HU-IDN-059`. P-041 de `decisiones.md` v0.6 ya dice lo mismo que este proceso: un tipo de ticket con cuatro subtipos. El proceso no cambia |

Generado por IA: borrador completo (Claude, 26-oct-2026) a partir de la revisión del Líder Técnico del 22-oct (C-06; DT-03 y DT-06) y del paquete aprobado de Control de acceso (PJ-05). No cambia el plan del PO. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.2) por Brayan Hurtado con IA (Claude) a partir de las revisiones del Líder Técnico (hallazgo 29) y de coherencia (hallazgo 9) del 26-oct. — Revisado por: (pendiente)
