---
id: "SPEC-ARQ-SEGURIDAD"
tipo: "spec"
titulo: "Seguridad: autenticación, autorización, datos sensibles y secretos"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-009, ADR-011, ADR-014]
tags: [arquitectura, seguridad, g3]
---

# Seguridad (criterio de G3)

| Tema | Decisión propuesta | Fuente |
|---|---|---|
| Autenticación (gestores) | El servicio es resource server: **solo valida** el JWT de un emisor OIDC (`aybar-starter-security`); no hay login en el servicio. En la Etapa 1, usuarios, roles y líderes locales detrás de una interfaz de identidad. **Falta definir quién emite el token en la Etapa 1** | ADR-009, ADR-014 · skill `aybar-seguridad` |
| Autenticación (cliente en Mi Portal) | DNI y código de un solo uso al contacto registrado en SIGDA/TAXON. **Falta**: el canal de envío (no figura en las dependencias) y cómo se emite el token de la sesión | ADR-011 |
| Autorización | Roles con `@PreAuthorize`; roles globales y de la empresa activa (`company_roles`); permisos del origen en cada consulta; el cliente solo ve lo suyo | RNF-SEC-010 · RN-SVC-044 |
| Aislamiento por empresa | Claim `companyId`; filtro en toda consulta de lectura | skill `aybar-cqrs` |
| Audiencia del token | `AYBAR_JWT_AUDIENCE` obligatoria fuera de `local`: sin ella ningún token se acepta | `docs/VARIABLES.md` |
| CORS | Orígenes exactos (`AYBAR_CORS_ORIGENES`), nunca `*` | `aybar-starter-security` |
| Datos personales (Ley 29733) | Sin datos personales en notas ni bitácoras (RNF-SEC-008); anonimización antes de la IA (RNF-SEC-009); auditoría técnica con lista blanca (solo referencias); eventos solo con referencias, sin texto libre | PLT-05 · skill `aybar-auditoria` |
| Evidencia | Bitácora solo de inserción con HMAC-SHA256; archivos con Object Lock y checksum | ADR-002, ADR-006 |
| Entrada | Pasarela de API y cortafuegos web (WAF) | PLT-05 (4.1) |
| Secretos | Por entorno, nunca en Git; ni contraseñas en YAML. **Gestor de secretos: por decidir** | skill `aybar-secretos` · ADR-014 |
| Llamadas salientes | El token del usuario solo a los hosts de `aybar.client.hosts-con-token` (vacía = ninguno); credenciales propias por conector | ADR-004 |
| Proveedor de IA | Solo vía el servicio de asistencia, con anonimización y registro; aprobado por TI y Seguridad | ADR-007 · DEP-14 |
| Código | SAST y análisis de dependencias (CVSS ≥ 7 bloquea; `NVD_API_KEY`) en cada integración | PLT-05 (4.2) · `aybar verify dependencias` |

## Reglas de seguridad y de contenido que piden las historias de Nexora

Contraste del 20-oct-2026 con las 62 historias de PJ-06 (criterios de aceptación). Son requisitos de comportamiento: el contrato (`aybar-atc.openapi.yaml`) los declara como 403, 409, 422 o campos, y los ADR citados dicen dónde se aplican.

| Tema | Qué piden las historias |
|---|---|
| Permiso por rol | Quien no es de atención no registra tickets, y el intento queda registrado (HU-001 CA-04); solo el supervisor reasigna en bloque (HU-008 CA-03); solo el líder marca el rayo (HU-045 CA-02); solo el administrador funcional publica flujos y toda publicación queda en bitácora con autor, fecha y versión (HU-043 CA-08) |
| Visibilidad por área y por rol | El gestor no ve tickets de áreas ajenas salvo que supervise (HU-044 CA-03); cada rol ve solo los datos que su permiso permite y los demás aparecen con candado (HU-050 CA-02, CA-07; RN-SVC-036); el visor muestra solo las áreas permitidas (HU-067 CA-07); el tablero del gestor es solo suyo y el del equipo lo ve su líder (HU-054 CA-03) |
| Rastro de intentos y consultas | Se registra el intento de abrir el ticket de otro cliente (HU-065 CA-04), la consulta al motor de José sobre un dato no permitido (HU-052 CA-03) y quién abrió la consulta 360 y qué secciones vio, sin guardar los datos personales (HU-050 CA-10) |
| Datos personales en texto libre | El sistema advierte si una nota de bitácora trae un DNI o una tarjeta (HU-005 CA-04; RN-SVC-012); el texto va anonimizado al modelo de IA y el registro de la sugerencia no lleva datos personales (HU-048 CA-02, CA-03); la nota de estado emocional no admite palabras de juicio (HU-028 CA-03) |
| Búsqueda con permisos | Un documento restringido no aparece en los resultados de la búsqueda por significado (HU-053 CA-02) ni en la búsqueda de clientes fuera del permiso (RN-SVC-036) |
| Notas internas y cliente | Las notas internas y el nombre del gestor no se muestran al cliente en Mi Portal (HU-005 CA-03, HU-065 CA-03; RN-SVC-044); solo ve sus tickets (HU-064 CA-02) |
| Adjuntos | Un archivo de más de 10 MB o de un formato no admitido se rechaza e indica tamaño y formatos permitidos (HU-064 CA-05); la evidencia va dentro de la interacción, sin tabla de adjuntos aparte (HU-005 CA-02) |
| Correo de asignación | Va con copia al líder; si el gestor no tiene líder en el maestro local, sale solo al gestor y se alerta al administrador (HU-055 CA-03); si lleva datos del cliente es una pregunta abierta por DLP |
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

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v2 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: fila de autenticación de gestores. Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). — Revisado por: (pendiente)
