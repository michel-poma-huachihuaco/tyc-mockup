---
id: "SPEC-ARQ-SEGURIDAD"
tipo: "spec"
titulo: "Seguridad: autenticación, autorización, datos sensibles y secretos"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-002, ADR-003, ADR-004, ADR-006, ADR-007, ADR-009, ADR-010, ADR-011, ADR-014]
tags: [arquitectura, seguridad, g3]
---

# Seguridad (criterio de G3)

Versión 0.3 del 26-oct-2026. Aplica las decisiones DT-03, DT-04, DT-05, DT-07, DT-09 y DT-10 del Líder Técnico y las colisiones C-08, C-09 y C-10 de su revisión del 22-oct (`analisis/decisiones.md` v0.5): **ATC consume la seguridad; Control de acceso (PJ-05) la administra.** Lo que se dice de PJ-05 se verificó el 26-oct en la copia sellada de su paquete **aprobado** (`docs-roles-y-permisos/`, traída de Nexora el 22-oct; el perfil desarrollador recibe 403 al leer PJ-05 en Nexora). ⚠ marca `access-control.openapi.yaml` y `VARIABLES.md` de esa copia, que no coinciden con la huella del sello: esas líneas se confirman con la versión aprobada. Donde lo que pidió el Líder Técnico no tiene respaldo en PJ-05, este documento escribe el diseño que cumple su intención con lo que PJ-05 sí da, el supuesto y la pregunta (P-033 a P-041).

| Tema | Decisión | Fuente |
|---|---|---|
| Emisor de tokens | El servidor de autorización de Control de acceso, sobre Spring Authorization Server. No van Cognito, Entra ID ni Auth0 como emisor; Google y Microsoft Entra ID son proveedores de identidad aguas arriba del emisor, no el emisor | DT-05; ADR-001 y ADR-016 de PJ-05; ADR-014 |
| Autenticación (gestores) | El servicio es resource server: **solo valida** el JWT con `aybar-starter-security`: firma, emisor (`AYBAR_ISSUER_URI`), vencimiento (15 min) y audiencia (`AYBAR_JWT_AUDIENCE`). **No hay login en ATC.** El gestor entra por el login de internos de Control de acceso con una cuenta `EMPLOYEE` que el área le crea por invitación | DT-05; ADR-012 y D-46 de PJ-05; ADR-009 |
| Autenticación (cliente en Mi Portal) | Login de clientes de Control de acceso con `@aybarcorp/auth` (Authorization Code con PKCE S256, token solo en memoria): cuenta `CUSTOMER`, búsqueda por DNI con el correo coincidente, verificación y niveles de autenticación de PJ-05. **ATC no abre sesiones, no emite códigos y no verifica identidades**; el contrato no tiene operaciones de código ni de sesión | DT-04; D-47, D-63, ADR-014 y ADR-018 de PJ-05; ADR-011 |
| Nivel de autenticación | El token lleva `aybar_nivel`; si una operación pide un nivel, lo exige Azure API Management por operación y el starter no se toca. Hoy ninguna historia de ATC pide un nivel; si el PO lo pide, se configura en el borde | D-33 de PJ-05; ADR-014 de PJ-05 |
| Quién es el usuario | Del token: `user_account_id` (`AybarUserContext.userAccountId`), la empresa activa (`companyId`) y los roles (`realm_access.roles`, `company_roles`). ATC **no guarda copia** de usuarios, roles ni permisos. **El token no trae `PartyID`**: ATC lo necesita para filtrar Mi Portal y para anotar al autor en las bitácoras (`ChangedByPartyID`, `AssignedToPartyID`). Opciones: un claim nuevo en el contrato de PJ-05 o una operación que resuelva `user_account_id` → `PartyID` (supuesto S-3) | ADR-012 de PJ-05; DT-03; P-033 (Sony Montoya) |
| Autorización | `@PreAuthorize(hasAnyRole(...))` con los roles de `x-roles` de cada operación: el token trae **roles, no permisos**, y ADR-007 de PJ-05 admite el token para ese «filtro grueso». `x-permiso` declara la opción y la acción del catálogo que ATC entrega a Control de acceso (`roles-y-permisos-atc.md`), y `x-roles` son los roles que tienen ese permiso. Si ATC además consulta el permiso efectivo en `GET /api/v1/mi/permisos/{codigoOpcion}` ⚠ lo decide el Líder Técnico (supuesto S-1) | ADR-007 y ADR-012 de PJ-05; ADR-009; P-034 |
| Catálogo de ATC | ATC lo entrega por el mecanismo de ADR-021 de PJ-05 con su cliente de servicio y el rol de cliente `CATALOG_REGISTRAR`; nace inactivo y lo aprueba una persona con `ROLE_IT_ADMIN` (117 tareas). La ruta para otorgar `CATALOG_REGISTRAR` está en propuesta | C-02; ADR-021 y D-171 de PJ-05; P-039 (Sony Montoya) |
| Aislamiento por empresa (C-08) | Según **dónde vino el rol de ATC**: si es global (`realm_access.roles`, gestores de las 11 razones sociales), la consulta no se limita a una empresa; si es por empresa (`company_roles[companyId]`), se limita a la empresa activa. Con un rol solo global, el token puede llegar sin `companyId` (D-178; P-034): por eso el filtro no se basa solo en `companyId`. Las asignaciones las hace Control de acceso; la lista de personas con rol global la da el PO o la Gerencia ATC | C-08; D-178 de PJ-05; skill `aybar-cqrs`; P-028 |
| Aislamiento por cliente (Mi Portal) | Toda lectura y escritura de Mi Portal se filtra por el `PartyID` del cliente autenticado; el ticket de otro cliente responde `AYB-PTL-404` y el intento queda en la bitácora. Depende de P-033 (S-3) | HU-064 CA-02; HU-065 CA-04; RN-SVC-044 |
| Aislamiento por área | El gestor no ve tickets de áreas ajenas salvo que supervise. El token no trae el área y Control de acceso no administra áreas (`NEX_COMPANY_AREA` no existe): mientras tanto, el área de cada rol es un parámetro de ATC, sin guardar personas (supuesto S-4). `MAE_AREA` es solo la cola de atención (`datos/registro-de-tablas.md` §7) | HU-044 CA-03; C-07; D-74 y D-193 de PJ-05; P-036 |
| Audiencia del token (C-09) | **La validan las dos capas:** Azure API Management por API (D-44) y el servicio, porque `aybar-starter-security` 0.7.1 exige `spring.security.oauth2.resourceserver.jwt.audiences` fuera de `local` y `test` (sin ella no arranca). PJ-05 tiene dos definiciones del valor: D-44 (el cliente que pidió el token) y D-224 (lista con el servicio destino más el `client_id`). Para no depender de cuál quede, `AYBAR_JWT_AUDIENCE` es una lista: el identificador del servicio ATC (`aybar-atc` en `local`) y los `client_id` de la consola ATC y de Mi Portal. El valor exacto lo da Control de acceso. Además, `aybar-starter-client` 0.7.1 no envía el parámetro `audience` que D-224 propone para `client_credentials` | D-44 y D-224 de PJ-05; `docs/skills/aybar-starter-security.md`; `docs/VARIABLES.md`; P-038 (Sony Montoya) |
| Registro de ATC en Control de acceso (C-09) | ATC solicita al área: los clientes OAuth `PUBLIC` de la consola ATC y de Mi Portal (con su `redirect_uri` por ambiente; los carga el seeder de PJ-05 por ambiente), el cliente `CONFIDENTIAL` de servicio de ATC (lo crea TI con su script; el secreto va a Azure Key Vault) con el rol de cliente `CATALOG_REGISTRAR`, y la política de API Management con la audiencia de la API de ATC. Va en la dependencia DEP-16 | C-09, C-12; D-30, D-48 y D-223 de PJ-05; P-026, P-039 |
| CORS | Orígenes exactos de la consola ATC y de Mi Portal por ambiente (`AYBAR_CORS_ORIGENES`), nunca `*` | `aybar-starter-security`; `docs/VARIABLES.md` |
| Errores de seguridad (C-10) | 401 (`AYB-SEG-401`) y 403 por falta de rol (`AYB-SEG-403`) los emiten `aybar-starter-security` y `aybar-starter-web`; un token sin la audiencia de la API puede cortarlo antes API Management. ATC no los reinventa y no emite `AYB-PEF-403` (permiso efectivo), que es de Control de acceso | DT-09; D-169 de PJ-05 |
| Errores de negocio (C-10) | `AYB-<ÁREA>-<HTTP>` con `AybarException` y solo áreas de ATC: `TKT`, `SLA`, `LRC`, `APL`, `GAR` y `PTL`, distintas de las del catálogo de Control de acceso (`SEG`, `PEF`, `VRS`, `USR`, `SOD`…). Cada operación los lista en `x-errores-negocio` del contrato | DT-09; C-10; `aybar-atc.openapi.yaml` (`x-areas-de-error`) |
| Intentos denegados | Los que piden las historias (registrar sin rol de atención, HU-001 CA-04; dato no permitido del motor, HU-052 CA-03; ticket de otro cliente, HU-065 CA-04) se registran como evento de auditoría con `aybar-starter-audit`: el 403 lo sigue dando el SDK y ATC escucha el evento de acceso denegado de Spring Security. La auditoría de accesos al login es de Control de acceso | DT-03; skill `aybar-auditoria` |
| Datos personales (Ley 29733) | Sin datos personales en notas ni bitácoras (RNF-SEC-008); anonimización antes de la IA (RNF-SEC-009); auditoría técnica con lista blanca (solo referencias); eventos solo con referencias, sin texto libre (`aybar-starter-messaging` rechaza un `String` en el payload). `PARTY` es la fuente viva del cliente: ATC no persiste nombre, DNI ni contacto en columnas propias; el dato sensible llega enmascarado desde su dueño. **Excepción por validar:** la hoja del Libro de Reclamaciones (Legal, DEP-05). La `PARTY` del interesado que no existe no la crea ATC (P-037) | ADR-003, ADR-007; DT-06; D-119 de PJ-05 |
| Evidencia | Bitácoras solo de inserción con HMAC-SHA256 encadenado por entidad, trigger que rechaza `UPDATE` y `DELETE` y usuario de aplicación que no es dueño de las tablas; archivos en Azure Blob Storage con inmutabilidad y checksum | ADR-002, ADR-006 |
| Entrada | Cloudflare (TLS, WAF y DDoS) y Azure API Management en el borde, como el resto de la plataforma. La política de WAF la define Seguridad TI antes de habilitar PRE | DT-07; ADR-015 de PJ-05; ADR-014 |
| Secretos | Por entorno, nunca en Git ni en YAML. **Azure Key Vault**, leído con identidad administrada: `aybar.secretos.proveedor=azure` con `azure.vault-uri` y `azure.nombres` (SDK 0.7.1), o variables de entorno que la plataforma rellena desde Key Vault. Incluye la llave HMAC de las bitácoras (rotación anual propuesta; la versión de la llave va dentro del hash), la credencial de escritura del proyector y el secreto del cliente de servicio | DT-07; skill `aybar-secretos`; ADR-002, ADR-012 |
| Llamadas salientes | Token de servicio `client_credentials` del emisor de Control de acceso con `aybar-starter-client` para los servicios corporativos (hoy, el registro del catálogo). El token del usuario solo viaja a los hosts de `AYBAR_CLIENT_HOSTS_CON_TOKEN` (vacía = ninguno); los conectores de terceros usan credenciales propias. **Control de acceso no tiene hoy una API con token de servicio para saber qué gestores tienen un rol, quién lidera un área o su disponibilidad**: esas consultas exigen una persona con `ROLE_IT_ADMIN` | DT-10; ADR-004; D-50 de PJ-05; P-035 (Sony Montoya) |
| Proveedor de IA | Solo vía el servicio de asistencia, con anonimización y registro; lo aprueban TI y Seguridad (DEP-14, «Por evaluar», sin proveedor elegido) | ADR-007 |
| Logs y auditoría técnica | JSON por consola de `aybar-starter-logging` con `correlationId`, `usuario`, `companyId` y `userAccountId`, recogido por Azure Monitor (Log Analytics y Application Insights). `aybar-starter-audit` usa su publicador de log (no tiene destino Azure Blob) | DT-07; ADR-015 de PJ-05; ADR-014 |
| Código | SAST y análisis de dependencias (CVSS ≥ 7 bloquea; `NVD_API_KEY`) en cada integración | PLT-05 (4.2) · `aybar verify dependencias` |

**Reglas citadas que no están en el Excel.** RN-SVC-044 (visibilidad del ticket para el cliente) está en los PDF del PO v1.3 (PLT-03, catálogo de reglas, «propuesta PO v1.3»; PLT-04, HU-064 a 066; PLT-05) y falta en el Excel: la registra el PO (P-022). RNF-SEC-009 y RNF-SEC-010 **sí están** en el Excel `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, filas 30 y 31 (P-030). Se conservan las tres.

## Reglas de seguridad y de contenido que piden las historias de Nexora

Contraste del 20-oct-2026 con las 62 historias de PJ-06 (criterios de aceptación). Son requisitos de comportamiento: el contrato (`aybar-atc.openapi.yaml`) los declara como 403, 404, 409, 422 o campos, y los ADR citados dicen dónde se aplican.

| Tema | Qué piden las historias |
|---|---|
| Permiso por rol | Quien no es de atención no registra tickets, y el intento queda registrado (HU-001 CA-04); solo el supervisor reasigna en bloque (HU-008 CA-03); solo el líder marca el rayo (HU-045 CA-02); solo el administrador funcional publica flujos y toda publicación queda en bitácora con autor, fecha y versión (HU-043 CA-08). Cada una es un permiso del catálogo y un `x-roles` del contrato (`roles-y-permisos-atc.md`) |
| Visibilidad por área y por rol | El gestor no ve tickets de áreas ajenas salvo que supervise (HU-044 CA-03, S-4); cada rol ve solo los datos que su permiso permite y los demás aparecen con candado (HU-050 CA-02, CA-07; RN-SVC-036); el visor muestra solo las áreas permitidas (HU-067 CA-07); el tablero del gestor es solo suyo y el del equipo lo ve su líder (HU-054 CA-03) |
| Rastro de intentos y consultas | Se registra el intento de abrir el ticket de otro cliente (HU-065 CA-04), la consulta al motor de José sobre un dato no permitido (HU-052 CA-03) y quién abrió la consulta 360 y qué secciones vio, sin guardar los datos personales (HU-050 CA-10) |
| Datos personales en texto libre | El sistema advierte si una nota trae un DNI o una tarjeta (HU-005 CA-04; RN-SVC-012); el texto va anonimizado al modelo de IA y el registro de la sugerencia no lleva datos personales (HU-048 CA-02, CA-03); la nota de estado emocional no admite palabras de juicio (HU-028 CA-03) |
| Búsqueda con permisos | Un documento restringido no aparece en los resultados de la búsqueda por significado (HU-053 CA-02) ni un cliente fuera del permiso en la búsqueda de clientes (RN-SVC-036; RNF-SEC-010) |
| Notas internas y cliente | Las notas internas y el nombre del gestor no se muestran al cliente en Mi Portal (HU-005 CA-03, HU-065 CA-03); solo ve sus tickets (HU-064 CA-02; RN-SVC-044) |
| Adjuntos | Un archivo de más de 10 MB o de un formato no admitido se rechaza e indica tamaño y formatos permitidos (HU-064 CA-05); la evidencia va dentro de la interacción, sin tabla de adjuntos aparte (HU-005 CA-02) |
| Correo de asignación | Va con copia al líder (HU-055 CA-03 dice «maestro local»: el PO lo actualiza, P-027). Como Control de acceso no tiene hoy una consulta del líder con token de servicio (P-035), mientras tanto el correo sale solo al gestor y se alerta al administrador funcional. Si lleva datos del cliente es una pregunta abierta por DLP (Q-055-1) |
| Gate no compensable | Un registro paralelo del dato de cliente (HU-032 CA-02) y un caso con señal de conflicto en Eje 1/2 (HU-026 CA-02) no se pueden compensar con otros resultados |

### Tiempos de respuesta y plazos que piden las historias

| Qué | Objetivo | Historia · criterio |
|---|---|---|
| Ficha del cliente al contestar una llamada y búsqueda por DNI o código | 2 s o menos | HU-042 CA-01, HU-049 CA-01 |
| Consulta 360 con 8 fuentes en línea | 2 s o menos (p95), con el tiempo de respuesta y las fuentes que respondieron al pie (RNF-REN-007) | HU-050 CA-09 |
| Cambio de estado en la bandeja reflejado en el visor 3D, sin recargar | 5 s o menos | HU-067 CA-08 |
| Correo al asignar un ticket | 1 min o menos | HU-055 CA-01 |
| Cierre de extremo a extremo en Eje 2 sin escalar | 72 horas hábiles | HU-029 CA-01 |
| Prórroga del plazo legal | 15 + 15 días hábiles; la prórroga se comunica antes del vencimiento original | HU-013 CA-01, CA-04 |
| Cierre automático del ticket resuelto sin respuesta del cliente | Días hábiles configurables (propuesta: 5) | HU-066 CA-04 |

## Pendientes de seguridad

| Pendiente | Qué falta | Quién | Ref. |
|---|---|---|---|
| Control de acceso en DEV | Emisor, clientes OAuth de ATC, catálogo aprobado y gestores invitados en DEV, con fecha comprometida. Sin emisor, los endpoints protegidos responden 401. En local, el emisor de pruebas `herramientas/emisor-local.mjs` del repositorio `AybarCorp/aybar-access-control-deus` (rama `main`, commit `5bab9dc` del 17-oct), que emite `realm_access.roles`, `user_account_id` y `preferred_username` con la audiencia en `aud`, sin `company_roles`, `companyId` ni `PartyID` (P-026) | Sony Montoya | DEP-16; P-026, P-040 |
| `PartyID` del usuario | Claim o consulta para el cliente y el gestor; rol `CUSTOMER` en la cuenta que nace por DNI | Sony Montoya | P-033 |
| Permiso efectivo | Si ATC autoriza solo por rol o también consulta el permiso efectivo | Líder Técnico; Sony Montoya | P-034 |
| Consultas de líderes y gestores | API con token de servicio para gestores con un rol, líder de un área y disponibilidad (HU-008, 046, 054, 055 y 058) | Sony Montoya | P-035 |
| Áreas y jefaturas | Dueño de las áreas y forma en que ATC sabe el área de un gestor | Líder Técnico, Sony Montoya y Gobierno de Datos | P-036 |
| Audiencia | Valor de `aud` para los tokens de la consola, de Mi Portal y de servicio, y valor de `AYBAR_JWT_AUDIENCE` | Sony Montoya | P-038 |
| Rol `CATALOG_REGISTRAR` y clientes OAuth | Cómo se otorgan en la Etapa 1 | Sony Montoya | P-039 |
| Código de 6 dígitos de HU-064 CA-01 | El PO acepta el login de Control de acceso o reescribe el criterio | PO | P-027 |
| Política de WAF del borde | Reglas de Cloudflare para ATC, antes de habilitar PRE | Seguridad TI | DT-07 |
| Huecos del SDK | Autenticación del broker con Event Hubs (SASL) y lectura de versiones anteriores de la llave HMAC en Key Vault | Líder Técnico y equipo del SDK | P-032 |
| Retención de la evidencia y hoja del Libro | Plazo y modo de retención; alcance de la excepción de la hoja | Legal | DEP-05; P-007 |
| Datos del cliente en el correo de asignación | Si el correo lleva datos del cliente (DLP) | PO | Q-055-1 |
| Proveedor de IA | Proveedor aprobado y fecha | TI y Seguridad | DEP-14 |

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Fila de autenticación de gestores |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Autenticación y autorización de Control de acceso (DT-03, DT-04, DT-05); Azure y Key Vault (DT-07); errores (DT-09); `client_credentials` (DT-10); catálogo de roles; correo de asignación sin maestro local; pendientes |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Verificado contra el paquete aprobado de PJ-05: el token no trae `PartyID` ni permisos (autorización por rol con `x-roles`, S-1 y S-3; P-033, P-034); la audiencia la validan API Management y el SDK, con `AYBAR_JWT_AUDIENCE` como lista (P-038); registro de clientes OAuth y `CATALOG_REGISTRAR` (C-09; P-039); aislamiento por empresa según el origen del rol (C-08; D-178) y por área (S-4; P-036); sin API de líderes con token de servicio (P-035); errores de negocio por área (C-10); intentos denegados, logs y auditoría técnica; pendientes con dueño |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso (PJ-05). — Revisado por: (pendiente) · Aprueba: TL
