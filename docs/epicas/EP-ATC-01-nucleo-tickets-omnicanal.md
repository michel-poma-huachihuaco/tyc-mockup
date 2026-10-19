---
id: "EP-ATC-01"
tipo: epica
titulo: "Núcleo de tickets omnicanal"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-01 Núcleo de tickets omnicanal

Va en `docs/epicas/EP-ATC-01-nucleo-tickets-omnicanal.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-01 | Núcleo de tickets omnicanal | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente | Debe |
| **Horizonte / Plan** | **Estado** | **Fecha / Version** |
| Ahora · Iteración 1 (2026-10-19 → 2026-10-22 · 22 h · Dev 1 (Brayan)) | Borrador (Habilitadora) | 2026-10-19 / v0.2 |

## 1 Contexto

- **Problema**: hoy las solicitudes se anotan en Excel, chats personales o correo, sin número ni tipificación; el cliente no puede dar seguimiento y la empresa no sabe cuántas solicitudes tiene ni de qué tipo.
- **Usuarios**: gestores de tickets (Eje 1) y colaboradores de área que atienden solicitudes de las 11 razones sociales; clientes que llaman, escriben por WhatsApp o correo.
- **Evidencia**: necesidad de "registrar el pedido una sola vez, tipificado y con número"; dolores de registros paralelos, sin bitácora y cierres informales (AS-IS).
- **Alineamiento**: atender toda solicitud con compromiso de tiempo trazable y auditable; operar ATC como servicio transversal de las 11 razones sociales.

## 2 Objetivos

Objetivos de negocio:
- OBJ-01: Registrar el 100% de las solicitudes de los canales telefónico, WhatsApp y correo en la plataforma, con número por RUC, dentro de los 3 meses siguientes al pase a producción.

Objetivos del usuario:
- El cliente recibe un número de ticket desde el primer contacto y puede preguntar por su caso sin repetir su historia.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de solicitudes registradas con N.º de ticket | por medir en Iteración 0 | 100% | Plataforma ATC | Diaria |
| Registros paralelos del dato de cliente | por medir | 0 | Auditoría quincenal | Quincenal |
| % de tickets cerrados con cierre formal en Mi Portal | por medir | 100% | Plataforma ATC | Diaria |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro de tickets tipificados por teléfono, WhatsApp y correo | Conectores automáticos de WhatsApp y correo (pendientes de producto; la llamada se integra en FT-ATC-17) |
| Número correlativo único por razón social (11 RUC) | Maestro de clientes propio (se consulta SIGDA/TAXON) |
| Ciclo de vida con 7 estados e historial inmutable | Chat en vivo en web |
| Interacciones visibles al cliente vs. notas internas, con evidencia multimedia | App móvil nativa |
| Hitos probatorios: 1.ª respuesta, 1.ª resolución, última resolución y cierre | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-01 | Registro multicanal y tipificación | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-02 | Ciclo de vida, interacciones e hitos | Debe | v1.0 - 30-oct-2026 |

- **Supuestos**: SIGDA/TAXON expone una API de consulta de cliente y KYC; la instancia PostgreSQL Multi-AZ de la arquitectura vigente está disponible.
- **Restricciones**: Ley 29733 (Protección de Datos Personales): sin PII en bitácoras (RN-SVC-012). Empresa y línea de negocio obligatorias y no derivables (RN-SVC-005).
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON, DEP-02 NEXUS (SSO/roles); R-04 adopción interna, R-05 terceros, R-07 datos personales.
- **Criterios de éxito**: 100% de solicitudes con N.º durante 2 meses seguidos; 0 registros paralelos en 2 auditorías quincenales seguidas; 100% de cierres formales.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
