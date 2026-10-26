---
id: "ADR-011"
tipo: "adr"
titulo: "ADR-011: Mi Portal: el cliente entra con el login de clientes de Control de acceso"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-011: Mi Portal: el cliente entra con el login de clientes de Control de acceso

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: decisión DT-04 del Líder Técnico (Jose Jara, 22-oct-2026) y colisión C-05 de su revisión, registradas en `analisis/decisiones.md` v0.5. **Sustituye a la v0.1** («DNI + código de un solo uso propio»): ATC ya no emite códigos ni abre sesiones.
- Cambia lo que fija el PO: HU-064 CA-01 y el requisito de seguridad de FT-ATC-24 (código de 6 dígitos, vence a los 5 minutos, 3 intentos, al correo o al celular). **El PO acepta el cambio o reescribe el criterio según lo que cumpla Control de acceso** (P-027).
- El nombre del archivo (`ADR-011-mi-portal-acceso-dni-codigo.md`) es el de la v0.1 y dice lo contrario de la decisión: se conserva porque Nexora usa la ruta como clave del documento. Vale el título. Renombrarlo exige un control de cambio en Nexora.

> Las referencias a PJ-05 se verificaron el 26-oct en la copia sellada de su paquete aprobado (`docs-roles-y-permisos/`): ADR-012, 014 y 018; D-33, D-47, D-62, D-63, D-67, D-178; R25 y R29. ⚠ Siete archivos de esa copia no coinciden con la huella del sello: `access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003`, `014`, `054`, `057` y `059` (esta, la validación del prospecto que cita la decisión 4); lo que se cita de ellos se confirma con la versión aprobada.

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

1. **Autorización:** las operaciones de Mi Portal exigen el rol `CUSTOMER` (`x-roles` del contrato). Ese rol lo siembra Control de acceso (D-30); hoy solo D-67 lo asigna, al validar un prospecto, y la cuenta `CUSTOMER` que nace por DNI debe recibirlo para que Mi Portal pueda exigirlo: lo confirma Sony Montoya (P-033). Mi Portal **no acepta `PROSPECT`**: cada microservicio decide si acepta ese rol (D-62) y las historias hablan de clientes; si el PO quiere abrirlo a prospectos, se agrega a `x-roles` (P-027).
2. **Filtro por cliente:** toda lectura y escritura de Mi Portal se filtra por el `PartyID` del cliente **autenticado**. El ticket de otro cliente responde `AYB-PTL-404` (como si no existiera) y el intento queda en la auditoría, emitido desde el caso de uso (HU-065 CA-04; `seguridad.md`, «Intentos denegados»). El Líder Técnico pidió filtrar «por el `PartyID` del token», pero **el token no trae `PartyID`** (ADR-012 de PJ-05) y el token de un `CUSTOMER` no lleva `companyId` (D-178). Diseño: ATC obtiene el `PartyID` del cliente autenticado por un claim nuevo del contrato de PJ-05 (leído con `aybar.security.claims.adicionales`) o por una consulta con el token del usuario que resuelva `user_account_id` → `PartyID`; nunca guarda una tabla propia de correspondencias. **Cuál de las dos lo responde Sony Montoya (P-033).** Hasta entonces, HU-064 a 066 quedan bloqueadas en ese punto.
3. **Niveles de autenticación:** si una acción pide un nivel más fuerte, lo exige Azure API Management por operación con el claim `aybar_nivel` (D-33 de PJ-05); ATC no lo implementa. Hoy ninguna historia de Mi Portal pide un nivel.
4. **Persona que no existe en `PARTY`:** ATC **no crea su `PARTY`** (P-037). La persona se autorregistra en Control de acceso, que crea su `PARTY` no verificada y una cuenta `PROSPECT` (R29, A26), y pasa a `CUSTOMER` cuando una persona de Ventas o de ATC la valida en la consola del área (D-59; `analisis/proceso-atencion-prospectos.md`). El ticket que un gestor registra para un interesado sin `PARTY` queda con la vinculación pendiente (ADR-003).
5. **Lo que sigue fijando el PO** (PLT-04 v1.3, HU-064 a 066): adjuntos de hasta 10 MB y rechazo del que sea más grande o de un formato no admitido (HU-064 CA-05); el cliente confirma o rechaza la solución, y el rechazo reabre el ticket; si no responde, el ticket se cierra solo a los días hábiles configurados; cuando el cliente responde, el SLA se reanuda; las notas internas y el nombre del gestor no se muestran al cliente (HU-005 CA-03, HU-065 CA-03).
6. **Qué ve el cliente se cita por los criterios de origen:** HU-064 CA-02 (solo sus tickets), HU-065 CA-03 (sin notas internas ni nombre del gestor) y CA-04 (el ticket de otro cliente no se muestra), y HU-005 CA-03. Los PDF del PO le ponen a esa regla un código que no está en el Excel `ATC_requerimientos (3).xlsx`; registrarla en el Excel le toca al PO (P-022, P-030), y mientras tanto este ADR no cita ese código.
7. **Propuestas del equipo en el mockup, que confirma el PO:** adjuntos JPG, PNG o PDF, máximo 3; 5 días hábiles de espera antes del cierre automático; prioridad Media al registrar.
8. **El contrato de Mi Portal tiene esquemas propios** (`aybar-atc.openapi.yaml` 0.5.0-borrador), distintos de los de la consola:
   - **La identidad del cliente sale solo del token.** Ninguna operación de Mi Portal recibe un identificador de cliente en el cuerpo, la ruta ni la consulta. Los esquemas de entrada (`PortalTicketNuevo`, `PortalRespuesta`, `ConfirmacionSolucion`, `ReservaBus`) declaran `additionalProperties: false`, y el servidor rechaza con `AYB-VAL-400` un cuerpo que traiga cualquier otro campo, por ejemplo `clienteId`, `partyId`, `prioridadId`, `canal`, `tipo` de interacción o `visible`. En Jackson eso se activa en esos DTO (`@JsonIgnoreProperties(ignoreUnknown = false)` o `FAIL_ON_UNKNOWN_PROPERTIES`), y una prueba de contrato envía cada uno de esos campos y espera el 400.
   - **Lo que fija el servidor:** el `PartyID` del cliente autenticado (P-033), el canal `MI_PORTAL`, la empresa y la línea de negocio (las del contrato del cliente, RN-SVC-005), la prioridad (la del flujo o la del tipo; el mockup propone Media, lo confirma el PO), la visibilidad (`IsVisibleToCustomer = true`) y el tipo de interacción (`CUSTOMER_MESSAGE`).
   - **Lo que devuelve:** solo lo que HU-064 a 066 dejan ver: número, tipo y subtipo, estado, área, fecha de compromiso, los pasos de la trazabilidad con su fecha y hora y su área, y las interacciones visibles con su origen («cliente» o «Aybar»), su texto y sus adjuntos. **No devuelve** el `PartyID`, la prioridad, el responsable ni quién creó el ticket, el nombre ni el ID del gestor, la política de SLA, el conflicto, el eje, el rayo, el flujo ni sus actividades, ni las notas internas (HU-064 CA-02, HU-065 CA-01 y CA-03, HU-005 CA-03).
   - **Reclamo o queja desde Mi Portal:** si el tipo va al Libro de Reclamaciones, `registrarMiTicket` responde `AYB-PTL-422` con el aviso legal y no crea un ticket común (HU-064 CA-04).

**Se retiró del contrato** (22-oct): las operaciones `solicitarCodigo` (`/api/v1/portal/codigos`) y `abrirSesion` (`/api/v1/portal/sesiones`) y los esquemas `SolicitudCodigo`, `CodigoEnviado`, `AperturaSesion` y `Sesion`; del diccionario, `PORTAL_SESSION`. El contrato 0.5.0-borrador no tiene ninguna operación de código ni de sesión.

## Consecuencias

- Obliga a:
  - Que Control de acceso entregue el login de clientes en DEV (DEP-16; P-026, P-040) y registre el cliente OAuth `PUBLIC` de Mi Portal con su `redirect_uri` por ambiente (D-223) y la audiencia de la API (P-038).
  - Que el PO decida qué pasa con el código de 6 dígitos, 5 minutos y 3 intentos: si Control de acceso lo cumple, se mantiene; si no, se reescribe HU-064 CA-01 (P-027).
  - Que la pregunta «¿con qué dato inicia sesión el cliente?» (FT-24, Q-064-2) se responda con lo que fija Control de acceso: DNI con correo coincidente (D-47).
  - Filtrar toda consulta por el `PartyID` del cliente, en la escritura y en la lectura, en cuanto P-033 diga de dónde sale.
  - Esquemas propios de Mi Portal, rechazo de campos de más en el cuerpo y pruebas de contrato que lo comprueben (decisión 8).
- Impide:
  - Mostrar al cliente datos de otros clientes, notas internas o datos internos del ticket (responsable, creador, prioridad, conflicto, eje, rayo, flujo).
  - Que el cliente fije su identidad, el canal, la prioridad o la visibilidad desde el cuerpo de la petición.
  - Que ATC guarde credenciales, códigos o sesiones de clientes.
- Cuesta: **USD 0 para ATC** en envío de códigos, login y verificación: son de Control de acceso, que usa Azure Communication Services (ADR-018 de PJ-05). **0,5 h** de integración del login con `@aybarcorp/auth` (tarea HU-ATC-064-T01), dentro de las 4 h de la HU-064 (`backlog/tareas/EP-ATC-06.json`); los esquemas propios de Mi Portal van en las horas de HU-064 a 066. La nube de Mi Portal (contenedor del frontend y llamadas al borde) está en el costo del ADR-014 (`arquitectura/costo-cloud.md` v0.4, USD 2.592,53 al mes en los 4 ambientes).

## Datos (puerta F4 de Gobierno de Datos)

- ATC no crea tablas de sesión ni de código. Se retiran `PORTAL_SESSION` y las candidatas `IDN_USER_SESSION` y `PARTY_CONTACT_VERIFICATION_TOKEN`: son del área (C-11).
- Tipos y subtipos que ve el cliente: consulta de cuenta, pedido simple, visita técnica, garantía postventa, reclamo y queja (estos dos van al Libro). Los subtipos no tienen tabla en el v7 y el canal «Mi Portal» no figura en la descripción de `MAE_CHANNEL` (P-016, P-017).
- PII: el DNI y el contacto los trata Control de acceso; ATC solo conoce el `PartyID`.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador: DNI y código de un solo uso propios |
| 0.1 (v5 en Nexora) | 2026-10-21 | Brayan, con IA | Reglas HU-064 a 066 y mockup de Mi Portal |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-04: login de clientes de Control de acceso, sin sesiones ni códigos propios. El nombre del archivo conserva «dni-codigo» para publicarse como versión nueva |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Referencias a PJ-05 verificadas: el token no trae `PartyID` y el diseño del filtro queda para P-033; rol `CUSTOMER` en la cuenta por DNI (P-033); sin `PROSPECT` en Mi Portal (D-62); ATC no crea la `PARTY` de quien no existe (R29); evidencia de RN-SVC-044 en los PDF del PO; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: contrato de Mi Portal con esquemas propios (decisión 8): identidad solo del token, rechazo de cualquier campo de más en el cuerpo, lo que fija el servidor y lo que devuelve, reclamo o queja con `AYB-PTL-422`; lo que ve el cliente se cita por los criterios HU-064 CA-02 y HU-065 CA-03 y CA-04; contrato 0.5.0-borrador; nota sobre el nombre del archivo |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso. — Revisado por: (pendiente) · Aprueba: TL
