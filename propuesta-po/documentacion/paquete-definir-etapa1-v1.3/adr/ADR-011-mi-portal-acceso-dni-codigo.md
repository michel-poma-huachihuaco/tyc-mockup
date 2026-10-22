---
id: "ADR-011"
tipo: "adr"
titulo: "ADR-011: Mi Portal: el cliente entra con el login de clientes de Control de acceso"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-011: Mi Portal: el cliente entra con el login de clientes de Control de acceso

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: decisión DT-04 del Líder Técnico (Jose Jara, 22-oct-2026) y colisión C-05 de su revisión, registradas en `analisis/decisiones.md` v0.3. **Sustituye a la v0.1** («DNI + código de un solo uso propio»): ATC ya no emite códigos ni abre sesiones.
- Cambia lo que fija el PO: HU-064 CA-01 y el requisito de seguridad de FT-ATC-24 (código de 6 dígitos, vence a los 5 minutos, 3 intentos, al correo o al celular). **El PO acepta el cambio o reescribe el criterio según lo que cumpla Control de acceso** (P-027).

> Las referencias a PJ-05 (D-33, D-47, D-63; ADR-014, ADR-018; R29) son las del correo del Líder Técnico del 22-oct. Quien redacta este ADR no ve ese apartado en Nexora y no las verificó.

## Contexto

Mi Portal (HU-064, 065 y 066) deja al cliente consultar y responder sus tickets; solo ve lo suyo. Control de acceso (PJ-05) ya resuelve el login de clientes: cuenta `CUSTOMER`, búsqueda por DNI con correo coincidente, verificación del contacto y niveles de autenticación. Un login propio en ATC duplicaría ese servicio y obligaría a custodiar credenciales y códigos de clientes (Ley 29733).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| DNI y código de un solo uso propio de ATC, con tabla `PORTAL_SESSION` (v0.1 y ADR-11 del PO) | Duplica el login de clientes de Control de acceso; ATC tendría que enviar códigos y custodiar sesiones (DT-04). Además necesitaba un canal de envío que no figuraba en las dependencias. | — |
| Usuario y contraseña propios del cliente | La plataforma custodiaría credenciales de clientes. | — |
| SSO corporativo | Los clientes no son colaboradores. | — |

## Decisión

**Mi Portal hace login contra el emisor de Control de acceso** (`@aybarcorp/auth`, Authorization Code con PKCE). ATC solo valida el JWT (ADR-009, ADR-014). **ATC no abre sesiones, no emite códigos y no verifica identidades** (DT-04).

1. **Filtro por cliente:** ATC filtra todo ticket por el `PartyID` del token. El ticket de otro cliente no se muestra y el intento queda en la bitácora (HU-065 CA-04).
2. **Niveles de autenticación:** si una acción pide un nivel más fuerte, lo exige Control de acceso con API Management (D-33 de PJ-05, según el Líder Técnico); ATC no lo implementa.
3. **Interesado sin cliente:** si la persona no existe en `PARTY`, se crea su `PARTY` como no verificada (R29 de PJ-05, según el Líder Técnico). **Quién la escribe** (una API de Control de acceso, o ATC en otro fragmento) sigue abierto (P-014, P-031).
4. **Lo que sigue fijando el PO** (PLT-04 v1.3, HU-064 a 066): adjuntos de hasta 10 MB y rechazo del que sea más grande o de un formato no admitido (HU-064 CA-05); el cliente confirma o rechaza la solución, y el rechazo reabre el ticket; si no responde, el ticket se cierra solo a los días hábiles configurados; cuando el cliente responde, el SLA se reanuda; las notas internas y el nombre del gestor no se muestran al cliente (HU-005 CA-03, HU-065 CA-03).
5. **Reglas citadas:** RN-SVC-044 (visibilidad del ticket para el cliente) **no está en el Excel (3)**: viene del PLT-03/04 v1.3 y está por registrar (P-022). Este ADR cita el criterio que la origina (HU-064 CA-02 y HU-065 CA-03).
6. **Propuestas del equipo en el mockup, que confirma el PO:** adjuntos JPG, PNG o PDF, máximo 3; 5 días hábiles de espera antes del cierre automático.

**Se retira del contrato:** del OpenAPI, las operaciones `solicitarCodigo` (`/api/v1/portal/codigos`) y `abrirSesion` (`/api/v1/portal/sesiones`) y los esquemas `SolicitudCodigo`, `CodigoEnviado`, `AperturaSesion` y `Sesion`; del diccionario, `PORTAL_SESSION`.

## Consecuencias

- Obliga a:
  - Que Control de acceso entregue el login de clientes en DEV (P-026) y registre los clientes OAuth de Mi Portal y de la API.
  - Que el PO decida qué pasa con el código de 6 dígitos, 5 minutos y 3 intentos: si Control de acceso lo cumple, se mantiene; si no, se reescribe HU-064 CA-01 (P-027).
  - Que la pregunta «¿con qué dato inicia sesión el cliente?» (FT-24, Q-064-2) se responda con lo que fije Control de acceso: DNI con correo coincidente (DT-04).
  - Filtrar toda consulta por el `PartyID` del token, en la escritura y en la lectura.
- Impide:
  - Mostrar al cliente datos de otros clientes o notas internas.
  - Que ATC guarde credenciales, códigos o sesiones de clientes.
- Cuesta: sin costo de envío de códigos para ATC (lo asume Control de acceso). Las horas de integrar `@aybarcorp/auth` entran en P-025.

## Datos (puerta F4 de Gobierno de Datos)

- ATC no crea tablas de sesión ni de código. Se retira `PORTAL_SESSION` y las candidatas `IDN_USER_SESSION` y `PARTY_CONTACT_VERIFICATION_TOKEN`: son del área (C-11).
- Tipos y subtipos que ve el cliente: consulta de cuenta, pedido simple, visita técnica, garantía postventa, reclamo y queja (estos dos van al Libro). Los subtipos no tienen tabla en el v7 y el canal «Mi Portal» no figura en la descripción de `MAE_CHANNEL` (P-016, P-017).
- PII: el DNI y el contacto los trata Control de acceso; ATC solo conoce el `PartyID`.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador: DNI y código de un solo uso propios |
| 0.1 (v5 en Nexora) | 2026-10-21 | Brayan, con IA | Reglas HU-064 a 066 y mockup de Mi Portal |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-04: login de clientes de Control de acceso, sin sesiones ni códigos propios. El nombre del archivo conserva «dni-codigo» para publicarse como versión nueva |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
