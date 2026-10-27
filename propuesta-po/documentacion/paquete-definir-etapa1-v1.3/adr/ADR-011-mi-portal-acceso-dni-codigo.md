---
id: "ADR-011"
tipo: "adr"
titulo: "ADR-011: Mi Portal: el cliente entra con el login de clientes de Control de acceso"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.6"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-011: Mi Portal: el cliente entra con el login de clientes de Control de acceso

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.6 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: decisión DT-04 del Líder Técnico (Jose Jara, 22-oct-2026) y colisión C-05 de su revisión, registradas en `analisis/decisiones.md`, con las decisiones del equipo del 26-oct (ED-01, ED-05 y ED-26). **Sustituye a la v0.1** («DNI + código de un solo uso propio»): ATC ya no emite códigos ni abre sesiones.
- Cambia lo que fija el PO: HU-064 CA-01 y el requisito de seguridad de FT-ATC-24 (código de 6 dígitos, vence a los 5 minutos, 3 intentos, al correo o al celular). Es una diferencia listada en ED-19 de `analisis/decisiones.md` (P-027): el cliente entra con el login de Control de acceso (DT-04) y los documentos del PO no se editan.
- El nombre del archivo (`ADR-011-mi-portal-acceso-dni-codigo.md`) es el de la v0.1 y dice lo contrario de la decisión: se conserva porque Nexora usa la ruta como clave del documento. Vale el título.

> Las referencias a PJ-05 se verificaron el 26-oct en la copia sellada de su paquete aprobado (`docs-roles-y-permisos/`): ADR-012, 014 y 018; D-33, D-47, D-62, D-63, D-67, D-178; R25 y R29. ⚠ Siete archivos de esa copia no coinciden con la huella del sello: `access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003`, `014`, `054`, `057` y `059` (esta, la validación del prospecto que cita la decisión 4); se citan como referencia: ninguna decisión de este ADR depende de que cambien.

## Contexto

Mi Portal (HU-064, 065 y 066) deja al cliente consultar y responder sus tickets; solo ve lo suyo. Control de acceso (PJ-05) ya resuelve el login de clientes: la persona se encuentra por DNI con el correo coincidente (D-47, R25), entra con su cuenta `CUSTOMER`, verifica su contacto por correo o WhatsApp (ADR-018 de PJ-05) y su token lleva el nivel de autenticación calculado (`aybar_nivel`, ADR-014 de PJ-05). Quien no existe se autorregistra como `PROSPECT` con una `PARTY` no verificada (R29). Un login propio en ATC duplicaría ese servicio y obligaría a custodiar credenciales y códigos de clientes (Ley 29733).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| DNI y código de un solo uso propio de ATC, con tabla `PORTAL_SESSION` (v0.1 y ADR-11 del PO) | Duplica el login de clientes de Control de acceso; ATC tendría que enviar códigos y custodiar sesiones (DT-04). Además necesitaba un canal de envío que no figuraba en las dependencias. | — |
| Usuario y contraseña propios del cliente | La plataforma custodiaría credenciales de clientes. | — |
| SSO corporativo | Los clientes no son colaboradores. | — |

## Decisión

**Mi Portal hace login contra el emisor de Control de acceso** (`@aybarcorp/auth`, Authorization Code con PKCE, token solo en memoria). ATC solo valida el JWT (ADR-009, ADR-014). **ATC no abre sesiones, no emite códigos y no verifica identidades** (DT-04).

1. **Autorización: una sola regla (decisión del equipo, ED-01; excepción a ED-02).** Las 8 operaciones de Mi Portal admiten solo una **cuenta de tipo `CUSTOMER` activa** (`AccountTypeID = CUSTOMER` y `AccountStatusID = ACTIVE` del vínculo `IDN_USER_ACCOUNT`, que ATC lee con `CuentaPersonaPort`, punto 2) y no exigen rol: en el contrato llevan `x-roles: []` y `x-autorizacion`, y `@PreAuthorize` usa un bean de ATC con esa lectura. Es lo que aprobó PJ-05: la cuenta que nace por DNI toma el tipo `CUSTOMER` de su Party y no recibe roles (HU-IDN-045 CA-3; `realm_access.roles` sale de las filas vigentes de `IDN_USER_ROLE`, `arquitectura/arquitectura-tecnica.md:987` de PJ-05), y el prospecto validado pasa a tipo `CUSTOMER` y recibe el rol `CUSTOMER` (HU-IDN-059 CA-1; D-67): las dos son de tipo `CUSTOMER`. Mi Portal **no acepta `PROSPECT`** (su cuenta es de tipo `PROSPECT`, D-62) ni ningún otro tipo de cuenta: reciben 403 (`AYB-SEG-403` del SDK); las historias hablan de clientes. ATC no registra permisos para el rol `CUSTOMER` (`roles-y-permisos-atc.md` §7, S-2).
2. **Filtro por cliente:** toda lectura y escritura de Mi Portal se filtra por el `PartyID` del cliente **autenticado**. El ticket de otro cliente responde `AYB-PTL-404` (como si no existiera) y el intento queda en la auditoría, emitido desde el caso de uso (HU-065 CA-04; `seguridad.md`, «Intentos denegados»). El Líder Técnico pidió filtrar «por el `PartyID` del token», pero **el token no trae `PartyID`** (ADR-012 de PJ-05), el de un `CUSTOMER` no lleva `companyId` (D-178) y ningún servicio aprobado de PJ-05 devuelve la persona con el token del propio usuario. **Decisión del equipo (ED-01):** ATC obtiene el `PartyID` (y el tipo de cuenta) del cliente autenticado leyendo, en la base única y en solo lectura, el vínculo `IDN_USER_ACCOUNT` del `user_account_id` del token, con el puerto `CuentaPersonaPort` (ADR-009, punto 2); nunca guarda una tabla propia de correspondencias. **El `SELECT` por columna lo otorga el dueño de la tabla, Control de acceso:** ATC lo pide al área en el correo de solicitud (entregable de la DEP-16); mientras, en local y DEV se trabaja con el emisor de pruebas y los datos de prueba (simulador de `CuentaPersonaPort`, ED-08). Evolución: si Control de acceso publica un claim de persona (se leería con `aybar.security.claims.adicionales`) o una ruta `/api/v1/mi/…` que la devuelva, cambia el adaptador, no el dominio.
3. **Niveles de autenticación:** si una acción pide un nivel más fuerte, lo exige Azure API Management por operación con el claim `aybar_nivel` (D-33 de PJ-05); ATC no lo implementa. Hoy ninguna historia de Mi Portal pide un nivel.
4. **Persona que no existe en `PARTY`:** ATC **no crea su `PARTY`** (P-037). La persona se autorregistra en Control de acceso, que crea su `PARTY` no verificada y una cuenta `PROSPECT` (R29, A26), y pasa a `CUSTOMER` cuando una persona de Ventas o de ATC la valida en la consola del área (D-59; `analisis/proceso-atencion-prospectos.md`). El ticket que un gestor registra para un interesado sin `PARTY` queda «sin cliente vinculado», con sus datos mínimos en `SVC_TICKET_PROSPECT`, hasta que el job de vinculación completa el `PartyID` (ADR-003, punto 2; ED-05).
5. **Lo que sigue fijando el PO** (PLT-04 v1.3, HU-064 a 066): adjuntos de hasta 10 MB y rechazo del que sea más grande o de un formato no admitido (HU-064 CA-05); el cliente confirma o rechaza la solución, y el rechazo reabre el ticket; si no responde, el ticket se cierra solo a los días hábiles configurados; cuando el cliente responde, el SLA se reanuda; las notas internas y el nombre del gestor no se muestran al cliente (HU-005 CA-03, HU-065 CA-03).
6. **Qué ve el cliente se cita por los criterios de origen:** HU-064 CA-02 (solo sus tickets), HU-065 CA-03 (sin notas internas ni nombre del gestor) y CA-04 (el ticket de otro cliente no se muestra), y HU-005 CA-03. Los PDF del PO le ponen a esa regla un código que no está en el Excel `ATC_requerimientos (3).xlsx`; el Excel queda como lo publicó el PO y la diferencia está listada (P-022, ED-18), así que este ADR cita los criterios.
7. **Decisiones del equipo tomadas del mockup** (ED-26): adjuntos JPG, PNG o PDF de hasta 10 MB cada uno (HU-064 CA-05) y **máximo 3 por envío** (cada registro o respuesta), el mismo límite que la consola y la inspección: es el valor que el equipo presentó al PO en la propuesta v1.3 (los documentos del PO no fijan la cantidad; O-15); **5 días hábiles** de espera antes del cierre automático, configurables en `MAE_SLA_POLICY.AutoCloseBusinessDays` (Q-066-1; ED-15); prioridad Media al registrar; el área se muestra con su nombre y la cola `ATC` como «Atención al cliente» (Q-065-1).
8. **El contrato de Mi Portal tiene esquemas propios** (`aybar-atc.openapi.yaml`), distintos de los de la consola:
   - **La identidad del cliente sale solo del token.** Ninguna operación de Mi Portal recibe un identificador de cliente en el cuerpo, la ruta ni la consulta. Los esquemas de entrada (`PortalTicketNuevo`, `PortalRespuesta`, `ConfirmacionSolucion`, `ReservaBus`) declaran `additionalProperties: false`, y el servidor rechaza con `AYB-VAL-400` un cuerpo que traiga cualquier otro campo, por ejemplo `clienteId`, `partyId`, `prioridadId`, `canal`, `tipo` de interacción o `visible`. En Jackson eso se activa en esos DTO (`@JsonIgnoreProperties(ignoreUnknown = false)` o `FAIL_ON_UNKNOWN_PROPERTIES`), y una prueba de contrato envía cada uno de esos campos y espera el 400.
   - **Lo que fija el servidor:** el `PartyID` del cliente autenticado (punto 2; ED-01), el canal `MI_PORTAL`, la empresa y la línea de negocio (las del contrato del cliente, RN-SVC-005), la prioridad (la del flujo o, si no la fija, Media; decisión del equipo), la visibilidad (`IsVisibleToCustomer = true`) y el tipo de interacción (`CUSTOMER_MESSAGE`).
   - **Lo que devuelve:** solo lo que HU-064 a 066 dejan ver: número, tipo y subtipo, estado, área, fecha de compromiso, los pasos de la trazabilidad con su fecha y hora y su área, y las interacciones visibles con su origen («cliente» o «Aybar»), su texto y sus adjuntos. **No devuelve** el `PartyID`, la prioridad, el responsable ni quién creó el ticket, el nombre ni el ID del gestor, la política de SLA, el conflicto, el eje, el rayo, el flujo ni sus actividades, ni las notas internas (HU-064 CA-02, HU-065 CA-01 y CA-03, HU-005 CA-03).
   - **Reclamo o queja desde Mi Portal:** si el tipo va al Libro de Reclamaciones, `registrarMiTicket` responde `AYB-PTL-422` con el aviso legal y no crea un ticket común (HU-064 CA-04).

**Se retiró del contrato** (22-oct): las operaciones `solicitarCodigo` (`/api/v1/portal/codigos`) y `abrirSesion` (`/api/v1/portal/sesiones`) y los esquemas `SolicitudCodigo`, `CodigoEnviado`, `AperturaSesion` y `Sesion`; del diccionario, `PORTAL_SESSION`. El contrato no tiene ninguna operación de código ni de sesión.

## Consecuencias

- Obliga a:
  - Que Control de acceso entregue el login de clientes, registre el cliente OAuth `PUBLIC` de Mi Portal con su `redirect_uri` por ambiente (D-223) y la audiencia `aybar-atc` entre sus servicios destino (ED-06), y otorgue el `SELECT` por columna sobre `IDN_USER_ACCOUNT` (punto 2). Es la DEP-16, riesgo aceptado con mitigación (R-11, ED-08): mientras tanto, emisor de pruebas local y clientes sintéticos.
  - El cliente inicia sesión con lo que fija Control de acceso: DNI con correo coincidente (D-47; FT-24 y Q-064-2 decididas, ED-26).
  - Filtrar toda consulta por el `PartyID` del cliente autenticado, en la escritura y en la lectura (punto 2; ED-01), y admitir solo la cuenta de tipo `CUSTOMER` activa (punto 1).
  - Esquemas propios de Mi Portal, rechazo de campos de más en el cuerpo y pruebas de contrato que lo comprueben (decisión 8).
- Impide:
  - Mostrar al cliente datos de otros clientes, notas internas o datos internos del ticket (responsable, creador, prioridad, conflicto, eje, rayo, flujo).
  - Que el cliente fije su identidad, el canal, la prioridad o la visibilidad desde el cuerpo de la petición.
  - Que ATC guarde credenciales, códigos o sesiones de clientes.
- Cuesta: **USD 0 para ATC** en envío de códigos, login y verificación: son de Control de acceso, que usa Azure Communication Services (ADR-018 de PJ-05). **0,5 h** de integración del login con `@aybarcorp/auth` (tarea HU-ATC-064-T01), dentro de las 4 h de la HU-064 (`backlog/tareas/EP-ATC-06.json`); los esquemas propios de Mi Portal van en las horas de HU-064 a 066 y `CuentaPersonaPort` en la tarea HU-ATC-001-T07 (ADR-009). La nube de Mi Portal (contenedor del frontend y llamadas al borde) está en el costo del ADR-014 (`arquitectura/costo-cloud.md`, USD 2.592,53 al mes en los 4 ambientes; supuestos fijados en ED-12).

## Datos (puerta F4 de Gobierno de Datos)

- ATC no crea tablas de sesión ni de código. Se retiran `PORTAL_SESSION` y las candidatas `IDN_USER_SESSION` y `PARTY_CONTACT_VERIFICATION_TOKEN`: son del área (C-11).
- Tipos y subtipos que ve el cliente (decisión del equipo, Q-064-1): Consulta de cuenta · Estado de cuenta del lote; Pedido simple · Actualización de datos, Copia legalizada de contrato y Otra solicitud; Garantía postventa · General; Reclamo y Queja llevan al aviso del Libro (HU-064 CA-04). Visita técnica no está en el catálogo del piloto (ADR-008), y «Validación de identidad (prospecto)» no se ofrece en Mi Portal: la registra el gestor (C-06). Los subtipos viven en `MAE_TICKET_SUBTYPE`, tabla de ATC (ED-15), y ATC siembra el valor `MI_PORTAL` en `MAE_CHANNEL` (`datos/registro-de-tablas.md` §5).
- PII: el DNI y el contacto los trata Control de acceso; ATC solo conoce el `PartyID` y el tipo de cuenta, que lee de `IDN_USER_ACCOUNT` en solo lectura (ED-01).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador: DNI y código de un solo uso propios |
| 0.1 (v5 en Nexora) | 2026-10-21 | Brayan, con IA | Reglas HU-064 a 066 y mockup de Mi Portal |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-04: login de clientes de Control de acceso, sin sesiones ni códigos propios. El nombre del archivo conserva «dni-codigo» para publicarse como versión nueva |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Referencias a PJ-05 verificadas: el token no trae `PartyID` y el diseño del filtro queda para P-033; rol `CUSTOMER` en la cuenta por DNI (P-033); sin `PROSPECT` en Mi Portal (D-62); ATC no crea la `PARTY` de quien no existe (R29); evidencia de RN-SVC-044 en los PDF del PO; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: contrato de Mi Portal con esquemas propios (decisión 8): identidad solo del token, rechazo de cualquier campo de más en el cuerpo, lo que fija el servidor y lo que devuelve, reclamo o queja con `AYB-PTL-422`; lo que ve el cliente se cita por los criterios HU-064 CA-02 y HU-065 CA-03 y CA-04; contrato 0.5.0-borrador; nota sobre el nombre del archivo |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): el `PartyID` y el tipo de cuenta del cliente salen del vínculo `IDN_USER_ACCOUNT` por `CuentaPersonaPort` (ED-01); Mi Portal acepta la cuenta o el rol `CUSTOMER` y rechaza `PROSPECT`; ya no hay historias bloqueadas por P-033; interesado «sin cliente vinculado» (ED-05); adjuntos, 5 días hábiles, prioridad Media y nombre del área como decisiones (ED-26); tipos y subtipos de Mi Portal sin Visita técnica (Q-064-1); HU-064 CA-01 como diferencia listada en ED-19; DEP-16 riesgo aceptado (ED-08) |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | Revisión final del Líder Técnico del 26-oct: una sola regla para Mi Portal, cuenta de tipo `CUSTOMER` activa sin exigir rol, igual en el contrato, el catálogo y `seguridad.md` (O-07); adjuntos máximo 3 por envío (O-15); el `SELECT` sobre `IDN_USER_ACCOUNT` lo otorga el dueño de la tabla (O-03). Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión; las filas repetidas del historial se conservan como registro (O-26) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso. — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
