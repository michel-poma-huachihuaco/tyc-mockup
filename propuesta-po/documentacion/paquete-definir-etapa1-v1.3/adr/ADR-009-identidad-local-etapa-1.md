---
id: "ADR-009"
tipo: "adr"
titulo: "ADR-009: ATC consume la identidad y los permisos de Control de acceso; no los administra"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-004, ADR-011, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-009: ATC consume la identidad y los permisos de Control de acceso; no los administra

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: decisiones DT-03, DT-05 y DT-10 del Líder Técnico (Jose Jara, 22-oct-2026) y colisiones C-01, C-04, C-06, C-07, C-08, C-11 y C-12 de su revisión, registradas en `analisis/decisiones.md` v0.6. **Sustituye por completo a la v0.1** («Usuarios, roles y líderes locales en la Etapa 1»): el maestro local, la carga desde RR. HH. y el módulo `identidad` se eliminan.
- Cambia lo que fija el PO: el ADR-09 del PLT-01 y la DEP-02 (carga inicial de RR. HH.) dan por hecho un maestro local de usuarios, roles, áreas y líderes, y NEXUS como identidad en la Etapa 2. El PO los actualiza (P-027).
- El nombre del archivo (`ADR-009-identidad-local-etapa-1.md`) es el de la v0.1 y dice lo contrario de la decisión: se conserva porque Nexora usa la ruta como clave del documento. Vale el título. Renombrarlo exige un control de cambio en Nexora (lo pide el owner y lo aprueba el Líder Técnico).

> Las referencias a PJ-05 se verificaron el 26-oct en la copia sellada de su paquete aprobado (`docs-roles-y-permisos/`, traída de Nexora el 22-oct; el perfil desarrollador recibe 403 al leer PJ-05 en Nexora): ADR-001, 007, 008, 012, 016 y 021; D-30, D-44, D-46, D-50, D-59, D-74, D-80, D-84, D-100, D-171, D-176, D-178, D-193, D-224; R27 y R29. ⚠ Siete archivos de esa copia no coinciden con la huella del sello (recalculada el 26-oct): `arquitectura/access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003` (credencial local), `HU-IDN-014` (permisos de menú por rol), `HU-IDN-054` (otorgar `CATALOG_REGISTRAR`), `HU-IDN-057` (aprobar lo registrado por un microservicio) y `HU-IDN-059` (validar prospecto). Lo que este ADR cita del registro del catálogo, su aprobación y la validación de prospectos (ADR-021, D-59, D-171, D-176) se confirma con la versión aprobada en Nexora. Donde lo que pidió el Líder Técnico no tiene respaldo en PJ-05, se escribe el diseño que cumple su intención con lo que PJ-05 sí da, el supuesto y la pregunta.

## Contexto

La Etapa 1 necesita saber quién es el gestor, qué puede hacer, a qué empresa pertenece y quién lidera un área. El SDK no tiene login: el servicio solo valida el JWT de un emisor OIDC (`aybar-starter-security`).

El área de Roles y Permisos (Control de acceso, PJ-05; equipo de Sony Montoya) administra el emisor de tokens, el login de internos y de clientes, las cuentas, el catálogo de roles, opciones de menú y permisos y su aprobación, la asignación de roles (globales y por empresa), la segregación de funciones, la validación de prospectos y la auditoría de accesos. El servicio está en construcción en `aybar-access-control` y su paquete está aprobado en Nexora. **No administra áreas ni jefaturas**: `NEX_COMPANY_AREA` no está entre sus tablas y la crea el dueño de NEXUS (D-74, D-193).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Maestro local de usuarios, roles, áreas y líderes cargado desde RR. HH. (la v0.1 y el ADR-09 del PO) | Duplica lo que administra Control de acceso (DT-03) y crea un segundo registro de personas con datos personales de colaboradores. | — |
| NEXUS como fuente de identidad y roles por empresa | NEXUS existe solo en papel; los roles por empresa están en la base única y los administra Control de acceso (R27 de PJ-05). | Que NEXUS exista y el Líder Técnico lo decida. |
| Mezclar la identidad en cada módulo | Cambiar la fuente obligaría a reescribir cada módulo. | — |

## Decisión

**ATC consume la seguridad; Control de acceso la administra** (DT-03). ATC hace solo esto:

1. **Valida el token** con `aybar-starter-security`: firma, emisor, vencimiento y audiencia. La audiencia la valida también Azure API Management por API (D-44 de PJ-05); el SDK 0.7.1 la exige en el servicio (`AYBAR_JWT_AUDIENCE`, lista). El valor lo da Control de acceso (P-038; ADR-014).
2. **Lee del token** quién es (`user_account_id`), su empresa activa (`companyId`) y sus roles (globales en `realm_access.roles`, por empresa en `company_roles`), con `AybarUserContext`. **No guarda copia** de usuarios, roles ni permisos. **El token no trae `PartyID`** (ADR-012 de PJ-05): ATC lo necesita para el autor de sus bitácoras y para Mi Portal; cómo lo obtiene —un claim nuevo o una consulta— lo responde Sony Montoya (P-033).
3. **Autoriza cada operación por rol**: `@PreAuthorize(hasAnyRole(...))` con los `x-roles` del contrato, que son los roles que tienen el permiso `x-permiso` (opción + acción) en el catálogo que aprueba el área (`arquitectura/roles-y-permisos-atc.md`). El Líder Técnico pidió autorizar «con el permiso que llega en el token», pero **el token trae roles, no permisos**: el permiso efectivo lo calcula Control de acceso sobre su base y el token sirve para el filtro grueso de `@PreAuthorize` (ADR-007 de PJ-05). Si además ATC consulta el permiso efectivo en `GET /api/v1/mi/permisos/{codigoOpcion}` ⚠ lo decide el Líder Técnico (P-034).
4. **Entrega su catálogo** (31 opciones `ATC.*`, 9 roles, 75 permisos y 3 incompatibilidades) por el mecanismo de ADR-021 de PJ-05: un cliente de servicio de ATC con el rol de cliente `CATALOG_REGISTRAR` lo registra inactivo y una persona con `ROLE_IT_ADMIN` lo aprueba. Desde ahí el catálogo es del área: lo aprueba, lo asigna y lo cambia; un rol nuevo se le solicita al área. La ruta para otorgar `CATALOG_REGISTRAR` sigue en propuesta (D-171), y D-100 permite al servicio pedir cambios y retiros mientras la revisión dice «una sola vez»: los dos puntos los responden Sony Montoya y el Líder Técnico (P-039).
5. **Lo que no viene en el token no se replica.** El Líder Técnico pidió consultarlo a Control de acceso con el token de servicio (DT-10). **En PJ-05 esa consulta no existe:** buscar cuentas y listar sus roles exige una persona con `ROLE_IT_ADMIN`, el token de servicio solo sirve para registrar el catálogo, cargar personas y correr jobs (D-50), y PJ-05 no publica eventos de cese. Diseño: ATC declara el puerto `GestoresPort` en `domain.port.out` con un adaptador contra el **simulador** (ADR-004) y pide a Control de acceso la API real con su rol de cliente y su fecha (P-035, Sony Montoya). Mientras tanto, cada historia funciona así:

   | Historia | Qué necesita | Mientras no exista la API (P-035) |
   |---|---|---|
   | HU-008 reasignación en bloque | Los tickets del gestor que cesa | El supervisor indica el gestor y los destinatarios (la operación ya los recibe); no hay aviso automático de cese |
   | HU-046 reasignación por menor carga | Gestores del área con el rol y su disponibilidad | Sin candidatos conocidos, el ticket queda en la cola del área y se alerta al supervisor, como pide la propia historia |
   | HU-054 tablero del equipo | Quién forma el equipo del líder | El equipo son los gestores con tickets en las colas del líder (dato propio de ATC, sin guardar personas) |
   | HU-055 correo con copia al líder | El líder del gestor | El correo sale solo al gestor y se alerta al administrador funcional |
   | HU-058 carta al responsable del proyecto | Responsable y supervisor del proyecto | No es de Control de acceso: sale de la DEP-15 (Proyectos) |
   | HU-067 visor: gestores ocupados sobre el total por área (CA-01, CA-04) | Cuántos gestores tiene cada área y cuántos están ocupados | «Ocupados» es dato de ATC: gestores con un ticket en atención en la cola del área. El «total» sale de `GestoresPort`; mientras sea el simulador, el total son los gestores que tuvieron tickets en esa cola en los últimos 30 días (dato propio de ATC, sin guardar personas), y el visor lo rotula «sin dato de Control de acceso» |

   En el contrato (`aybar-atc.openapi.yaml`), los identificadores de colaborador (`colaboradorId`, `gestorId`, `responsableId`, `destinatarioId`) son el **`PartyID`** del colaborador, como las columnas `*PartyID` del v7, y no el `user_account_id` del token. Cómo se pasa de uno al otro es P-033.

**ATC no construye:** login, pantallas de usuarios, roles o permisos, carga de usuarios desde RR. HH., tablas de roles, áreas o líderes, códigos de un solo uso ni sesiones propias.

**Áreas (C-07).** `MAE_AREA` queda solo como **cola de atención** de un ticket (dominio SERVICE). El líder o supervisor de un área no se guarda en ATC. La correspondencia `MAE_AREA` ↔ `NEX_COMPANY_AREA` que pidió el Líder Técnico **no se puede escribir todavía**: esa tabla no existe en la base única (D-74, D-193 de PJ-05) y Control de acceso no administra áreas. El diseño posible está en `datos/registro-de-tablas.md` §7: una columna de referencia al área organizacional en `MAE_AREA`, opcional y sin FK hasta que exista la tabla, como hizo PJ-05 con `CompanyAreaID` (cambio al v7). Supuesto S-4: mientras tanto, el área de cada rol de ATC es un parámetro de ATC, sin personas (`roles-y-permisos-atc.md`, sección 8). Quién es el dueño de las áreas y cómo sabe ATC el área de un gestor lo responden el Líder Técnico, Sony Montoya y Gobierno de Datos (P-036); la correspondencia se lleva a Gobierno de Datos cuando exista la tabla (P-031).

**Filtro por empresa (C-08).** El token dice qué empresas ve cada gestor. Los gestores que atienden las 11 razones sociales reciben del área un **rol global de ATC**, y su token puede llegar sin `companyId` (D-178 de PJ-05; P-034); los demás, roles por empresa, y cambian de empresa activa renovando el token. Si una operación se permite lo decide la unión de roles globales y de la empresa activa, igual que el permiso efectivo de Control de acceso (ADR-007 y ADR-008 de PJ-05). **Sobre qué empresas actúa se calcula por operación, con los roles que la autorizan:** si alguno de los `x-roles` de la operación es global, actúa sobre las 11; si solo está en `company_roles[companyId]`, actúa solo sobre la empresa activa. Así un `ATC_AGENT` global con `ATC_SUPERVISOR` solo en la empresa X reasigna en bloque únicamente en X. La regla, la incompatibilidad que la acompaña y su prueba están en `roles-y-permisos-atc.md` §3 y §9. La lista de personas con rol global la entrega el PO o la Gerencia ATC al área (P-028). En Mi Portal el filtro es el `PartyID` del cliente (ADR-011, P-033).

**Catálogo de ATC.** Está en `arquitectura/roles-y-permisos-atc.md`: roles `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA` y `ATC_ADMIN_FUNCIONAL` (Líder Técnico) más `ATC_CASES_DESK`, `ATC_CX`, `ATC_EVENT` y `ATC_SITE_ACCESS` (propuesta para actores que los cinco no cubren); opciones `ATC.*` en el formato de PJ-05; permisos por rol y opción con sus acciones; incompatibilidades. Las reglas de permiso que piden las historias: quien no es de atención no registra tickets y el intento queda registrado (HU-001 CA-04); solo el supervisor reasigna en bloque (HU-008 CA-03); solo el líder marca el rayo (HU-045 CA-02); solo el administrador funcional publica flujos (HU-043 CA-08). Si «líder» es un rol o una jefatura lo responde P-028.

**Validación de prospectos (C-06).** ATC no la construye: la hacen personas de Ventas o de ATC con el rol `PROSPECT_VALIDATOR` en la consola de Control de acceso (D-59, D-176), y el reporte `prospectosParaRevision` lo revisan Ventas o ATC (D-80, D-84). ATC agrega el **proceso de atención** para los casos que PJ-05 le deja a mano: el correo distinto (D-79), el DNI tomado por una persona nueva (D-84) y el DNI del impostor (D-291). Entran como tipos de ticket y se resuelven en la consola del área. El proceso está escrito en `analisis/proceso-atencion-prospectos.md` v0.2: un tipo de ticket «Registro y acceso de clientes» con cuatro subtipos, que se configura con lo que ya está en el plan (HU-043 y HU-047), y los gestores que necesitan `PROSPECT_VALIDATOR` (los de la cola `ATC` asignados a ese tipo y su supervisor). Es alcance nuevo, sin historia en el PLT-04: lo decide el PO (P-041).

## Consecuencias

- Obliga a:
  - Que Control de acceso esté disponible en DEV con emisor, clientes OAuth de ATC, catálogo aprobado y gestores invitados (dependencia DEP-16, responsable Sony Montoya, reemplaza a DEP-02; fecha sin comprometer: P-026, P-040). Mientras tanto, en local, el emisor de pruebas `herramientas/emisor-local.mjs` del repositorio `AybarCorp/aybar-access-control-deus` (rama `main`, commit `5bab9dc` del 17-oct), que emite `realm_access.roles`, `user_account_id` y `preferred_username` con la audiencia en `aud`, sin `company_roles`, `companyId` ni `PartyID` (P-026).
  - Que el área invite a los gestores de ATC como cuentas `EMPLOYEE` ligadas a su `PARTY` (D-46) y les asigne los roles de ATC, globales o por empresa.
  - Que las historias que dependían del maestro local usen `GestoresPort` (tabla del punto 5) y que el PO actualice sus criterios (HU-008, 045, 046, 054, 055 y 058; P-027).
  - Mantener sin el módulo `identidad` ADR-001, `modulos.mmd`, `c4-contenedores.mmd` y `seguridad.md`, sin la carga de RR. HH. `migracion-y-reversion.md`, y sin NEXUS como fuente de identidad DEP-02 y los DoR.
  - Los claims corporativos (`companyId`, `company_roles`, `realm_access.roles`, `user_account_id`) configurables en `aybar.security.claims.*`; un claim nuevo de `PartyID` iría en `aybar.security.claims.adicionales` (P-033).
- Impide:
  - Roles fijados en código fuera del catálogo, y guardar usuarios, roles, permisos, áreas de personas o líderes en tablas de ATC.
  - Que ATC cree o migre tablas de identidad, roles, permisos o sesiones (C-11; lo que ATC crea, lee y escribe está en `datos/registro-de-tablas.md`).
- Cuesta: **USD 0 de nube para ATC**: el emisor, el login, la consola y la aprobación del catálogo son de Control de acceso (`arquitectura/costo-cloud.md` v0.4, §1.4). **2,5 h** de integración en el backlog, dentro de las horas de las historias: validar el JWT (HU-ATC-001-T07), sesión de la consola (001-T08), registro del catálogo (043-T07), login de Mi Portal (064-T01) y `GestoresPort` con su simulador (008-T01), 0,5 h cada una (`backlog/tareas/`). **Esas 0,5 h no alcanzan** para dos de ellas: el registro de 118 filas con `client_credentials`, reintento y seguimiento de la aprobación (043-T07), y `GestoresPort` con su simulador y los casos de la tabla del punto 5 (008-T01). **Reestimación propuesta para P-025:** 043-T07 a 3 h y 008-T01 a 2 h, 4 h más. El backlog y las 243 h del plan no cambian hasta que el equipo la confirme y el Líder Técnico y el PO la decidan en P-025.

## Datos (puerta F4 de Gobierno de Datos)

- ATC no crea tablas de identidad. Las del fragmento IDENTITY-ACCESS (`IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `MAE_SYSTEM_ROLE`, `MAE_MENU_OPTION`, `IDN_ROLE_MENU_PERMISSION`) y `NEX_USER_COMPANY_ROLE` son del área; ATC no las lee directamente: las conoce por el token o por una API.
- `MAE_AREA` (SERVICE) es la cola de atención; su correspondencia con `NEX_COMPANY_AREA` espera a que esa tabla exista (P-036, P-031).
- PII: el token trae solo identificadores; no se copian datos de colaboradores a ATC.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador: maestro local de usuarios, roles y líderes |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Conflicto abierto con IDENTITY-ACCESS |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-03, DT-05 y DT-10 y las colisiones C-01, C-04, C-06, C-07, C-08 y C-11. Se elimina el maestro local y el módulo `identidad`. El nombre del archivo conserva «identidad-local» para publicarse como versión nueva |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Referencias a PJ-05 verificadas en su paquete aprobado: el token no trae `PartyID` (P-033) ni permisos, y se autoriza por rol (P-034); no hay API de líderes y gestores con token de servicio, y las historias usan `GestoresPort` con simulador (P-035); `NEX_COMPANY_AREA` no existe (P-036); audiencia en las dos capas (P-038); `CATALOG_REGISTRAR` y cambios del catálogo (P-039); casos manuales de prospectos (P-041); costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: aviso ⚠ con los 7 archivos de PJ-05 que no coinciden con el sello (incluye `HU-IDN-003`, `014`, `054`, `057` y `059`); HU-067 en la tabla de P-035; los identificadores de colaborador del contrato son `PartyID`; alcance de empresa calculado por operación con los roles que la autorizan (C-08); reestimación propuesta de 043-T07 y 008-T01 para P-025; nota sobre el nombre del archivo |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): cita `analisis/decisiones.md` v0.6 y `proceso-atencion-prospectos.md` v0.2, las versiones vigentes (decían v0.5 y v0.1). |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso. — Revisado por: (pendiente) · Aprueba: TL
