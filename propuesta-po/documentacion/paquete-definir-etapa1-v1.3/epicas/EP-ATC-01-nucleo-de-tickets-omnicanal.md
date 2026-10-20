---
id: "EP-ATC-01"
tipo: epica
titulo: "Núcleo de tickets omnicanal"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-01", "FT-ATC-02"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-01 Núcleo de tickets omnicanal

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-01 | Núcleo de tickets omnicanal | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| mié 21-oct → lun 26-oct 2026 · Dev 1 · 22 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica habilitadora | Dev 1 (Brayan) | 22 h · iteración 1 |

## 1 Contexto

- **Problema**: Hoy las solicitudes se anotan en Excel, chats personales o correo, sin número ni tipificación; el cliente no puede dar seguimiento y la empresa no sabe cuántas solicitudes tiene ni de qué tipo.
- **Usuarios**: gestores de tickets (Eje 1) y colaboradores de área que atienden solicitudes de las 11 razones sociales; clientes que llaman, escriben por WhatsApp o correo.
- **Evidencia**: NEC-SVC-001 «registrar el pedido una sola vez, tipificado y con número»; OBJ-SVC-001 y OBJ-SVC-003; dolores 1, 2 y 5 del AS-IS (registros paralelos, sin bitácora, cierres informales). Volumen y tiempos actuales: por medir en Iteración 0.
- **Alineamiento**: Atender toda solicitud con compromiso de tiempo trazable y auditable (OBJ-SVC-001) y operar ATC como servicio transversal de las 11 razones sociales (OBJ-SVC-003).
- **Procesos**: PROC-SVC-001, PROC-SVC-002

## 2 Objetivos

Objetivo de negocio:
- Registrar el 100 % de las solicitudes de los canales telefónicos, WhatsApp y correo en la plataforma, con número por RUC, dentro de los 3 meses siguientes al pase a producción.

Objetivo del usuario:
- El cliente recibe un número de ticket desde el primer contacto y puede preguntar por su caso sin repetir la historia.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de solicitudes registradas con N.º de ticket | no indicada en el PLT-02 | 100 % | — | — |
| Registros paralelos del dato de cliente (RNF-INT-007) | no indicada en el PLT-02 | 0 | — | — |
| % de tickets cerrados con cierre formal en Mi Portal | no indicada en el PLT-02 | 100 % | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro de tickets tipificados por teléfono, WhatsApp y correo (registro asistido por el gestor de tickets) | Conectores automáticos de WhatsApp y correo (pendientes de producto, fuera de la Etapa 1); la llamada se integra en FT-ATC-17 |
| Número correlativo único por razón social (11 RUC) | Maestro de clientes propio (se consulta SIGDA/TAXON) |
| Ciclo de vida con 7 estados e historial inmutable | Chat en vivo en web |
| Interacciones visibles al cliente vs. notas internas, con evidencia multimedia | App móvil nativa |
| Hitos probatorios: 1.ª respuesta, 1.ª resolución, última resolución y cierre |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-01 | Registro multicanal y tipificación | Debe | 9 | mié 21-oct → jue 22-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-02 | Ciclo de vida, interacciones e hitos | Debe | 13 | jue 22-oct → lun 26-oct | FT-ATC-01 | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-01 → FT-ATC-02 (22 h)
- **Supuestos**: SIGDA/TAXON expone una API de consulta de cliente y KYC; la instancia PostgreSQL Multi-AZ de la arquitectura vigente está disponible.
- **Restricciones**: Ley 29733 (Protección de Datos Personales): sin PII en bitácoras (RN-SVC-012). Empresa y línea de negocio obligatorias y no derivables (RN-SVC-005).
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON · DEP-02 usuarios y roles locales · R-04 adopción interna · R-05 terceros · R-07 datos personales
- **Criterios de éxito**: 100 % de solicitudes con N.º durante 2 meses seguidos, 0 registros paralelos en 2 auditorías quincenales seguidas y 100 % de cierres formales. Indicadores: % de solicitudes registradas con N.º de ticket: 100 %; Registros paralelos del dato de cliente (RNF-INT-007): 0; % de tickets cerrados con cierre formal en Mi Portal: 100 %.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato) | Interna | EP-ATC-01, EP-ATC-04, EP-ATC-06, EP-ATC-10 | CDO / Equipo Datos | 21-oct-2026 | Pendiente |
| DEP-02 | Maestro local de usuarios, roles, áreas y líderes de ATC (carga inicial de RR. HH.) | Interna | EP-ATC-01, EP-ATC-02, EP-ATC-09 | Gerencia ATC · RR. HH. | 21-oct-2026 | Pendiente |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-04 | Calidad del código generado con IA (errores sutiles, seguridad, deuda técnica) | Media | Alto | Revisión de pares obligatoria, pruebas automatizadas generadas y revisadas por el desarrollador, análisis SAST y guía de prompts del equipo | Líder técnico | Abierto |
| R-05 | Sin QA dedicado y UAT concentrada en un día (mar 03-nov) | Media | Alto | Aceptación diaria del PO a las 17:00, pruebas E2E automatizadas desde el día 3 y usuarios clave citados para la UAT | PO · Jefe Operaciones UX | Abierto |
| R-07 | Datos personales expuestos en bitácoras, búsqueda, Mi Portal o prompts de IA (Ley 29733) | Media | Alto | DLP (RNF-SEC-008), anonimización antes de la IA (RNF-SEC-009), permisos del origen (RNF-SEC-010) y visibilidad del cliente (RN-SVC-044) | Seguridad TI |  |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)
