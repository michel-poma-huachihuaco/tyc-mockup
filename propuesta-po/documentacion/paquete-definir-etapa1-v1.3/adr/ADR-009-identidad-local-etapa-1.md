---
id: "ADR-009"
tipo: "adr"
titulo: "ADR-009: ATC consume la identidad y los permisos de Control de acceso; no los administra"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-011, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-009: ATC consume la identidad y los permisos de Control de acceso; no los administra

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: decisiones DT-03, DT-05 y DT-10 del Líder Técnico (Jose Jara, 22-oct-2026) y colisiones C-01, C-04, C-06, C-07, C-08 y C-11 de su revisión, registradas en `analisis/decisiones.md` v0.3. **Sustituye por completo a la v0.1** («Usuarios, roles y líderes locales en la Etapa 1»): el maestro local y el módulo `identidad` se eliminan.
- Cambia lo que fija el PO: el ADR-09 del PLT-01 y la DEP-02 (carga inicial de RR. HH.) dan por hecho un maestro local de usuarios, roles, áreas y líderes. El PO los actualiza (P-027).

> Las referencias a PJ-05 (Control de acceso: ADR-001, 007, 008, 012, 016, 021; D-30, D-33, D-44, D-46, D-48, D-59, D-193; R27, R29) son las del correo del Líder Técnico del 22-oct. Quien redacta este ADR no ve ese apartado en Nexora y no las verificó.

## Contexto

La Etapa 1 necesita saber quién es el gestor, qué puede hacer, a qué empresa pertenece y quién lidera un área. El SDK no tiene login: el servicio solo valida el JWT de un emisor OIDC (`aybar-starter-security`).

El área de Roles y Permisos (Control de acceso, PJ-05; equipo de Sony Montoya) administra el emisor de tokens, el login de internos y de clientes, las cuentas, el catálogo de roles, opciones de menú y permisos y su aprobación, la asignación de roles (globales y por empresa), las jefaturas y áreas organizacionales, la segregación de funciones, la validación de prospectos y la auditoría de accesos. El servicio está en construcción en `aybar-access-control` (según el Líder Técnico).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Maestro local de usuarios, roles, áreas y líderes cargado desde RR. HH. (la v0.1 y el ADR-09 del PO) | Duplica lo que administra Control de acceso (DT-03) y crea un segundo registro de personas con datos personales de colaboradores. | — |
| NEXUS como fuente de identidad y roles por empresa | Existe solo en papel (R27, según el Líder Técnico). Los roles por empresa los administra el área en la base única. | Que NEXUS exista y el Líder Técnico lo decida. |
| Mezclar la identidad en cada módulo | Cambiar la fuente obligaría a reescribir cada módulo. | — |

## Decisión

**ATC consume la seguridad; Control de acceso la administra** (DT-03). ATC hace solo esto:

1. **Valida el token** con `aybar-starter-security`: firma, emisor y vencimiento. La audiencia (`aud`) la valida API Management; ATC declara la suya en `AYBAR_JWT_AUDIENCE` (ADR-014).
2. **Lee del token** quién es (`user_account_id`, `PartyID`), su empresa activa y sus roles (globales en `realm_access.roles`, por empresa en `company_roles`). **No guarda copia** de usuarios, roles ni permisos.
3. **Autoriza cada operación** con el permiso que llega en el token (`@PreAuthorize`), según el catálogo aprobado por el área. Cada operación del OpenAPI declara el `x-permiso` que exige.
4. **Entrega su catálogo una sola vez** (roles, opciones `ATC.*`, acciones e incompatibilidades) por el mecanismo del ADR-021 de PJ-05, con un cliente `CATALOG_REGISTRAR`. Desde ahí el catálogo es del área: lo aprueba, lo asigna y lo cambia. Un rol nuevo se le solicita al área.
5. **Consulta a Control de acceso** lo que no viene en el token (quién lidera un área, qué gestores tienen un rol, y, para el balanceo de carga, su disponibilidad) con su token de servicio `client_credentials` (DT-10). No lo replica.

**ATC no construye:** login, pantallas de usuarios, roles o permisos, carga de usuarios desde RR. HH., tablas de roles, áreas o líderes, códigos de un solo uso ni sesiones propias.

**Áreas.** `MAE_AREA` queda solo como **cola de atención** de un ticket (dominio SERVICE). El líder o supervisor de un área se consulta a Control de acceso, por API o por rol en el token, y no se guarda en ATC. Se documenta la correspondencia `MAE_AREA` ↔ `NEX_COMPANY_AREA` y se lleva a Gobierno de Datos.

**Filtro por empresa.** El token dice qué empresas ve cada gestor. Los gestores que atienden las 11 razones sociales reciben del área un **rol global de ATC**; los demás, roles por empresa y cambian de empresa activa. ATC aplica el filtro según el tipo de rol del token. En Mi Portal el filtro es el `PartyID` (ADR-011).

**Catálogo de ATC (propuesta, a completar en `arquitectura/roles-y-permisos-atc.md`, P-028):** roles `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` y `ATC_ADMIN_FUNCIONAL`; opciones `ATC.*`, acciones por opción e incompatibilidades. Las reglas de permiso que piden las historias son: quien no es de atención no registra tickets y el intento queda registrado (HU-001 CA-04); solo el supervisor reasigna en bloque (HU-008 CA-03); solo el líder marca el rayo (HU-045 CA-02); solo el administrador funcional publica flujos (HU-043 CA-08). **Por cerrar:** si «líder» es un rol o la jefatura que administra el área, y el formato exacto del permiso en el token.

**Validación de prospectos (C-06).** ATC no la construye: la hacen sus gestores en la consola de Control de acceso con el rol `PROSPECT_VALIDATOR` que el área les asigne. ATC agrega el **proceso de atención**: el caso «correo distinto» entra como un tipo de ticket y se resuelve en esa consola. Es alcance nuevo, que decide el PO (P-028).

## Consecuencias

- Obliga a:
  - Que Control de acceso esté disponible en DEV con emisor, clientes OAuth de ATC, catálogo aprobado y gestores invitados (dependencia nueva, propuesta `DEP-16`, reemplaza a DEP-02; P-026). Mientras tanto, en local, el emisor de pruebas de `aybar-access-control/herramientas/`.
  - Que el área invite a los gestores de ATC como cuentas `EMPLOYEE` y les asigne los roles de ATC.
  - Que las historias que dependían del maestro local lean de Control de acceso: HU-055 CA-03 (líder del gestor), HU-045, HU-046 (carga y ausencias), HU-008, HU-054 y HU-058. Si Control de acceso no expone la API que necesitan, la historia queda bloqueada (P-027).
  - Quitar el módulo `identidad` de ADR-001, `modulos.mmd`, `c4-contenedores.mmd`, `seguridad.md` y `migracion-y-reversion.md` (la carga de RR. HH.), y quitar NEXUS como fuente de identidad en DEP-02 y los DoR.
  - Los claims corporativos (`companyId`, `company_roles`, `realm_access.roles`, `user_account_id`) configurables en `aybar.security.claims.*`.
- Impide:
  - Roles fijados en código, y guardar usuarios, roles, permisos o líderes en tablas de ATC.
  - Que ATC cree o migre tablas de identidad, roles, permisos o sesiones (C-11).
- Cuesta: sin horas de un módulo `identidad`; costo del emisor: de Control de acceso, no de ATC. Las horas de las consultas a Control de acceso entran en P-025.

## Datos (puerta F4 de Gobierno de Datos)

- ATC no crea tablas de identidad. Las del fragmento IDENTITY-ACCESS (`IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `MAE_SYSTEM_ROLE`) son del área; ATC no las lee directamente, las consulta por token o por API.
- `MAE_AREA` (SERVICE) es la cola de atención; su correspondencia con `NEX_COMPANY_AREA` se documenta y se lleva a Gobierno de Datos (P-031).
- PII: el token trae solo identificadores; no se copian datos de colaboradores a ATC.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador: maestro local de usuarios, roles y líderes |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Conflicto abierto con IDENTITY-ACCESS |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-03, DT-05 y DT-10 y las colisiones C-01, C-04, C-06, C-07, C-08 y C-11. Se elimina el maestro local y el módulo `identidad`. El nombre del archivo conserva «identidad-local» para publicarse como versión nueva |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
