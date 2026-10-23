---
id: "SPEC-ARQ-SEGURIDAD"
tipo: "spec"
titulo: "Seguridad: autenticación, autorización, datos sensibles y secretos"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-002, ADR-004, ADR-009, ADR-011, ADR-014]
tags: [arquitectura, seguridad, g3]
---

# Seguridad (criterio de G3)

Versión 0.2 del 22-oct-2026. Aplica las decisiones DT-03, DT-04, DT-05, DT-07, DT-09 y DT-10 del Líder Técnico (`analisis/decisiones.md` v0.3): **ATC consume la seguridad; Control de acceso (PJ-05) la administra.** Lo que se dice de PJ-05 es lo que cita el correo del Líder Técnico del 22-oct; quien redacta este documento no ve ese apartado en Nexora y no lo verificó.

| Tema | Decisión | Fuente |
|---|---|---|
| Autenticación (gestores) | El servicio es resource server: **solo valida** el JWT con `aybar-starter-security` (firma, emisor y vencimiento). **No hay login en el servicio.** El emisor es el servidor de autorización de Control de acceso (Spring Authorization Server), que también hace el login de internos | DT-05; ADR-009, ADR-014 |
| Autenticación (cliente en Mi Portal) | Login de clientes de Control de acceso (`@aybarcorp/auth`, Authorization Code con PKCE): cuenta `CUSTOMER`, búsqueda por DNI con correo coincidente, verificación y niveles de autenticación de PJ-05. **ATC no abre sesiones, no emite códigos y no verifica identidades**; no hay canal de envío de códigos en ATC | DT-04; ADR-011 |
| Quién es el usuario | `user_account_id` y `PartyID` del token, empresa activa y roles. ATC **no guarda copia** de usuarios, roles ni permisos. Lo que no viene en el token (líder de un área, gestores con un rol, disponibilidad) se consulta a Control de acceso con el token de servicio | DT-03, DT-10; ADR-009 |
| Autorización | `@PreAuthorize` con el permiso que llega en el token (`x-permiso` de cada operación del contrato), según el catálogo que ATC entrega a Control de acceso y que el área aprueba (`roles-y-permisos-atc.md`). Roles globales y de la empresa activa (`realm_access.roles`, `company_roles`). Los permisos del origen se aplican en cada consulta; el cliente solo ve lo suyo (filtro por `PartyID`) | ADR-009; RNF-SEC-010; RN-SVC-044 |
| Aislamiento por empresa | Claim `companyId`; filtro en toda consulta de lectura según el tipo de rol del token (global o por empresa) | C-08; skill `aybar-cqrs` |
| Audiencia del token | `AYBAR_JWT_AUDIENCE` obligatoria fuera de `local`: sin ella ningún token se acepta. Azure API Management valida la audiencia (`aud`) por API; ATC solo declara la suya. Los clientes OAuth de la consola, Mi Portal y la API los registra Control de acceso | `docs/VARIABLES.md`; C-09; ADR-014 |
| CORS | Orígenes exactos (`AYBAR_CORS_ORIGENES`), nunca `*` | `aybar-starter-security` |
| Errores de seguridad | 401, 403 y la falta de rol o permiso los emiten el SDK y Control de acceso con sus códigos; ATC no los reinventa. Los errores de negocio de ATC usan áreas propias (`TKT`, `SLA`, `LRC`, `APL`, `GAR`, `PTL`) | DT-09; C-10 |
| Datos personales (Ley 29733) | Sin datos personales en notas ni bitácoras (RNF-SEC-008); anonimización antes de la IA (RNF-SEC-009); auditoría técnica con lista blanca (solo referencias); eventos solo con referencias, sin texto libre. `PARTY` es la fuente viva del cliente: ATC no persiste nombre, DNI ni contacto; el dato sensible se enmascara (`MAE_FIELD_MASKING_POLICY`). **Excepción de la hoja del Libro de Reclamaciones, por validar con Legal** | ADR-003, ADR-007; DT-06 |
| Evidencia | Bitácora solo de inserción con HMAC-SHA256, encadenada por entidad, con trigger que rechaza `UPDATE` y `DELETE` y usuario de aplicación sin ser dueño de las tablas; archivos en Azure Blob Storage con inmutabilidad y checksum | ADR-002, ADR-006 |
| Entrada | Cloudflare y Azure API Management en el borde. La política de WAF no está definida en los documentos: la confirma Seguridad TI | DT-07; ADR-014 |
| Secretos | Por entorno, nunca en Git; ni contraseñas en YAML. **Azure Key Vault** (`aybar.secretos.proveedor=azure`), incluida la llave HMAC de las bitácoras con rotación anual propuesta (la versión de la llave va dentro del hash) | DT-07; skill `aybar-secretos`; ADR-002 |
| Llamadas salientes | Token de servicio `client_credentials` del emisor corporativo con `aybar-starter-client` para los servicios corporativos, entre ellos Control de acceso. El token del usuario solo viaja a los hosts de `aybar.client.hosts-con-token` (vacía = ninguno); credenciales propias por conector de terceros | DT-10; ADR-004 |
| Proveedor de IA | Solo vía el servicio de asistencia, con anonimización y registro; lo aprueban TI y Seguridad (DEP-14, «Por evaluar», sin proveedor elegido) | ADR-007 |
| Auditoría de accesos | La del área (Control de acceso). ATC conserva la auditoría técnica de sus operaciones y el registro de los intentos denegados que piden las historias | DT-03; skill `aybar-auditoria` |
| Código | SAST y análisis de dependencias (CVSS ≥ 7 bloquea; `NVD_API_KEY`) en cada integración | PLT-05 (4.2) · `aybar verify dependencias` |

## Reglas de seguridad y de contenido que piden las historias de Nexora

Contraste del 20-oct-2026 con las 62 historias de PJ-06 (criterios de aceptación). Son requisitos de comportamiento: el contrato (`aybar-atc.openapi.yaml`) los declara como 403, 409, 422 o campos, y los ADR citados dicen dónde se aplican.

| Tema | Qué piden las historias |
|---|---|
| Permiso por rol | Quien no es de atención no registra tickets, y el intento queda registrado (HU-001 CA-04); solo el supervisor reasigna en bloque (HU-008 CA-03); solo el líder marca el rayo (HU-045 CA-02); solo el administrador funcional publica flujos y toda publicación queda en bitácora con autor, fecha y versión (HU-043 CA-08). Cada una se traduce en un permiso del catálogo (`roles-y-permisos-atc.md`) |
| Visibilidad por área y por rol | El gestor no ve tickets de áreas ajenas salvo que supervise (HU-044 CA-03); cada rol ve solo los datos que su permiso permite y los demás aparecen con candado (HU-050 CA-02, CA-07; RN-SVC-036); el visor muestra solo las áreas permitidas (HU-067 CA-07); el tablero del gestor es solo suyo y el del equipo lo ve su líder (HU-054 CA-03) |
| Rastro de intentos y consultas | Se registra el intento de abrir el ticket de otro cliente (HU-065 CA-04), la consulta al motor de José sobre un dato no permitido (HU-052 CA-03) y quién abrió la consulta 360 y qué secciones vio, sin guardar los datos personales (HU-050 CA-10) |
| Datos personales en texto libre | El sistema advierte si una nota de bitácora trae un DNI o una tarjeta (HU-005 CA-04; RN-SVC-012); el texto va anonimizado al modelo de IA y el registro de la sugerencia no lleva datos personales (HU-048 CA-02, CA-03); la nota de estado emocional no admite palabras de juicio (HU-028 CA-03) |
| Búsqueda con permisos | Un documento restringido no aparece en los resultados de la búsqueda por significado (HU-053 CA-02) ni en la búsqueda de clientes fuera del permiso (RN-SVC-036) |
| Notas internas y cliente | Las notas internas y el nombre del gestor no se muestran al cliente en Mi Portal (HU-005 CA-03, HU-065 CA-03); solo ve sus tickets (HU-064 CA-02). La regla RN-SVC-044 **no está en el Excel (3)**: se cita el criterio que la origina (P-022) |
| Adjuntos | Un archivo de más de 10 MB o de un formato no admitido se rechaza e indica tamaño y formatos permitidos (HU-064 CA-05); la evidencia va dentro de la interacción, sin tabla de adjuntos aparte (HU-005 CA-02) |
| Correo de asignación | Va con copia al líder. Si Control de acceso no devuelve el líder del gestor, sale solo al gestor y se alerta al administrador (HU-055 CA-03 dice «maestro local»: el PO lo actualiza, P-027). Si lleva datos del cliente es una pregunta abierta por DLP (Q-055-1) |
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

- **Control de acceso en DEV** (DEP-16, P-026): sin emisor, los endpoints protegidos no responden. Mientras tanto, en local, el emisor de pruebas de `aybar-access-control/herramientas/`.
- **Formato del permiso en el token** y quiénes reciben rol global o por empresa (P-028).
- **Código de 6 dígitos, 5 minutos y 3 intentos de HU-064 CA-01:** el PO decide si Control de acceso lo cumple o se reescribe el criterio (P-027).
- **Política de WAF** del borde y **autenticación del broker** de Azure Event Hubs (P-032).
- **Rotación de la llave HMAC:** la política anual es propuesta; falta confirmar la lectura de versiones anteriores en Key Vault (P-032).
- **Retención de la evidencia** y excepción de la hoja del Libro: las confirma Legal (P-007).
- **Datos del cliente en el correo de asignación** (DLP, Q-055-1) y **proveedor de IA** aprobado por TI y Seguridad (DEP-14).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Fila de autenticación de gestores |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Autenticación y autorización de Control de acceso (DT-03, DT-04, DT-05); Azure y Key Vault (DT-07); errores (DT-09); `client_credentials` (DT-10); catálogo de roles; correo de asignación sin maestro local; pendientes |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
