---
id: "ADR-011"
tipo: "adr"
titulo: "ADR-011: Mi Portal: acceso del cliente con DNI + código de un solo uso al contacto registrado en SIGDA/TAXON"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-011: Mi Portal: acceso del cliente con DNI + código de un solo uso al contacto registrado en SIGDA/TAXON

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-11 del PLT-05 v1.3
- **Actualizado el 20-oct-2026 con el mockup de la Etapa 1** (rama `feature/AYB-0001-propuesta-po-v1-3` de `tyc-mockup`): Mi Portal ya está en el prototipo (HU-064, 065 y 066). Lo que el PLT-04 deja abierto lo propone el equipo y lo confirma el PO.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Motivo: HU-064 a 066 y Ley 29733. El cliente consulta y responde sus tickets; solo ve lo suyo (RN-SVC-044). El contacto registrado vive en SIGDA/TAXON (DEP-01).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Usuario y contraseña propios del cliente | La plataforma tendría que custodiar credenciales de clientes. | Que exista un proveedor de identidad de clientes. |
| SSO corporativo | Los clientes no son colaboradores. | — |

## Decisión

El acceso a Mi Portal es con **DNI y un código de un solo uso** enviado al contacto registrado en SIGDA/TAXON, que abre una sesión limitada a lo del cliente (en el v7, candidata `IDN_USER_SESSION`: por confirmar).

Lo que ya fija el PO (PLT-03 v1.3, FT-24, requisito no funcional de seguridad; PLT-04 v1.3, HU-064 a 066): código de 6 dígitos que vence a los 5 minutos y admite 3 intentos, enviado al correo o al celular; adjuntos de hasta 10 MB (uno más grande o de un formato no admitido se rechaza); el ticket de otro cliente no se muestra y el intento queda en la bitácora; el cliente confirma o rechaza la solución (el rechazo reabre el ticket) y, si no responde, el ticket se cierra solo a los días hábiles configurados; cuando el cliente responde, el SLA se reanuda.

Propuesta del equipo en el mockup (la confirma el PO): enviar el código al correo **y** al celular; adjuntos JPG, PNG o PDF, máximo 3; esperar 5 días hábiles antes del cierre automático.

## Consecuencias

- Obliga a:
  - Un canal para enviar el código (correo o mensaje): **no figura en las dependencias del PLT-01**; proveedor y responsable por definir. El mockup lo simula mostrando el código en pantalla.
  - Un límite de intentos y expiración del código.
  - Resolver cómo se emite el token de la sesión del cliente frente al emisor OIDC que valida el SDK (ADR-014).
  - Filtrar toda consulta por el cliente de la sesión.
- Impide:
  - Mostrar al cliente datos de otros clientes o notas internas.
- Cuesta: Costo del envío de códigos: por estimar.

## Datos (puerta F4 de Gobierno de Datos)

- `PORTAL_SESSION` (v1.3) no existe en el v7; candidatas por confirmar: `IDN_USER_SESSION` (sesión de autenticación, DAC) y `PARTY_CONTACT_VERIFICATION_TOKEN` (OTP o enlace de verificación de teléfono o correo).
- Tipos y subtipos que ve el cliente: consulta de cuenta, pedido simple, visita técnica, garantía postventa, reclamo y queja (estos dos van al Libro). Los subtipos no tienen tabla en el v7, y el canal «Mi Portal» no figura en la descripción de `MAE_CHANNEL`.
- PII: DNI y contacto; el código no se guarda en claro.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-11 del PO; el código de 6 dígitos, 5 minutos y 3 intentos y las reglas de la HU-064 a 066 se atribuyen al PO. — Revisado por: (pendiente) · Aprueba: TL
