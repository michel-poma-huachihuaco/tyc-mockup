---
id: "SPEC-ARQ-C4"
tipo: "spec"
titulo: "Diagrama de arquitectura (C4: contexto, contenedores y módulos)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-009, ADR-010, ADR-012, ADR-013, ADR-014]
tags: [arquitectura, c4, g3]
---

# Diagrama de arquitectura · C4

Va en `docs/arquitectura/` y se enlaza desde el envío de G3 y desde la sección 4 del DoR. Fuentes: `c4-contexto.mmd`, `c4-contenedores.mmd` y `modulos.mmd` (Mermaid; cualquier visor de Mermaid o `mmdc` los dibuja). Versión 0.2 del 22-oct-2026: dibuja las decisiones DT-01 a DT-10 del Líder Técnico (`analisis/decisiones.md` v0.3).

## 1 Contexto

```mermaid
flowchart LR
  subgraph Quien["Quién pide y atiende"]
    tel[Teléfono]
    wa[WhatsApp]
    mail[Correo]
    portal[Mi Portal<br/>cliente]
    ges[Gestores, supervisores<br/>y áreas]
  end
  atc(["<b>Aybar Atiende</b><br/>plataforma ATC<br/>Java 21 con Spring Boot · un despliegue en Azure"])
  subgraph Ext["Sistemas externos (con simulador)"]
    sigda[SIGDA/TAXON<br/>DEP-01]
    con[Contratos y Activos<br/>DEP-07]
    cob[Cobranza<br/>DEP-08]
    cti[Call center CTI<br/>DEP-11]
    leg[Herramienta de Legal<br/>DEP-12]
    jose[Motor de José<br/>DEP-13]
    ia[Proveedor de IA<br/>DEP-14 · por evaluar]
    kpi[KPI Engine y GLI<br/>DEP-10 y DEP-06]
  end
  ctrl[["Control de acceso (PJ-05)<br/>emisor de tokens, login de internos y clientes,<br/>roles y permisos · DEP-16"]]
  tel --> atc
  wa --> atc
  mail --> atc
  portal -- "login de clientes" --> ctrl
  ges -- "login de internos" --> ctrl
  portal --> atc
  ges --> atc
  ctrl -. "JWT" .-> atc
  atc -- "catálogo de roles (una vez) y consultas de líderes y gestores" --> ctrl
  atc <--> sigda
  atc <--> con
  atc <--> cob
  atc <--> cti
  atc <--> leg
  atc <--> jose
  atc <--> ia
  atc --> kpi
```

## 2 Contenedores

```mermaid
flowchart TB
  user([Gestor / supervisor / cliente])
  ctrl[["Control de acceso (PJ-05)<br/>emisor de tokens y login · DEP-16"]]
  subgraph front["Presentación · Angular"]
    consola[Consola ATC]
    mp[Mi Portal]
    visor[Visor 3D]
    forms[Formularios PWA]
  end
  gw["Cloudflare + Azure API Management<br/>valida la audiencia aud"]
  subgraph app["Aybar Atiende · Java 21 · Spring Boot 3.5 · un despliegue en Azure Container Apps · monolito modular"]
    direction TB
    m1[tickets]
    m2[sla]
    m3[complaintbook]
    m4[legalcases]
    m5[aftersales]
    m6[portal]
    m7[quality]
    m8[inbox]
    m9[customer360]
    m10[delinquency]
    m11[integrations<br/>adaptador + simulador]
    jobs["Jobs idempotentes con ShedLock<br/>SLA y plazo legal"]
    outb[Outbox]
    proy[Proyector<br/>único escritor del almacén de lectura]
    ws["WebSocket /ws/visor<br/>filtra por área"]
  end
  pg[("Azure Database for PostgreSQL<br/>se escribe · base única, tablas del v7")]
  mg[("Azure Cosmos DB for MongoDB vCore<br/>almacén de lectura · vistas de ATC")]
  kf{{"Azure Event Hubs<br/>protocolo Kafka"}}
  blob[("Azure Blob Storage<br/>inmutabilidad · evidencia")]
  kv[["Azure Key Vault<br/>secretos y llave HMAC"]]
  mon[["Azure Monitor<br/>logs, trazas, métricas y alertas de jobs"]]
  ext[Sistemas externos]
  user --> ctrl
  user --> front --> gw --> app
  ctrl -. "JWT" .-> gw
  app -. "client_credentials: líderes, gestores y catálogo" .-> ctrl
  app -- escribe --> pg
  app -- "evento en la misma transacción" --> outb
  outb --> kf
  kf --> proy
  kf --> ws
  proy --> mg
  app -- lee --> mg
  app --> blob
  app -. secretos .-> kv
  app -. logs .-> mon
  m11 <--> ext
  ws -- "WebSocket" --> visor
```

Reglas que muestra el diagrama:
- Se **escribe** en PostgreSQL y se **lee** del almacén de lectura; la lectura no abre JDBC (skill `aybar-cqrs`). El **proyector del servicio es el único** que escribe en el almacén de lectura (DT-02, ADR-012).
- Cada cambio guarda su evento en la misma transacción (outbox) y un proceso lo publica al bus (ADR-013).
- Los módulos no se tocan las tablas: se hablan por su API pública o por eventos (ADR-001).
- Solo el módulo `integrations` habla con los sistemas externos (ADR-004).
- El almacén de lectura guarda lo de ATC, no el dato del cliente; `PARTY` es la fuente viva (ADR-003, DT-06).
- **ATC no administra identidad** (DT-03): el emisor de tokens, el login de internos y de clientes, los roles y los permisos son de Control de acceso. ATC valida el JWT, lee los roles del token y consulta a Control de acceso con `client_credentials` (ADR-009, DT-10).
- **El visor 3D recibe los eventos del servicio por WebSocket, no del bus** (ADR-010).
- Los jobs de SLA y plazo legal corren con ShedLock y leen PostgreSQL, no el almacén de lectura (ADR-005).
- Los ambientes son DEV, QA, PRE y producción, con una imagen versionada por release (ADR-014).

## 3 Módulos

```mermaid
flowchart LR
  ctrl[["Control de acceso (PJ-05)<br/>token JWT y API"]]
  tickets[tickets]
  sla[sla]
  cbook[complaintbook]
  lcases[legalcases]
  aftersales[aftersales]
  portal[portal]
  quality[quality]
  inbox[inbox]
  c360[customer360]
  delinq[delinquency]
  integ[integrations]
  bus{{eventos}}
  ctrl -. "roles y permisos en el token" .-> tickets
  portal -- API --> tickets
  cbook -- API --> tickets
  lcases -- API --> tickets
  aftersales -- API --> tickets
  delinq -- API --> tickets
  inbox -- API --> tickets
  tickets -- ticket.assigned · ticket.closed --> bus
  sla -- sla.breached --> bus
  bus --> inbox
  bus --> quality
  bus --> portal
  c360 --> integ
  delinq --> integ
  lcases --> integ
  aftersales --> integ
  tickets --> integ
  integ --> ext[(Sistemas externos)]
```

Los nombres en inglés son propuesta del equipo (ADR-001). No hay módulo de identidad.

## 4 Pendientes del diagrama

- Control de acceso disponible en DEV (DEP-16, P-026): sin emisor, los endpoints protegidos no responden.
- Papel del frontend Angular: propuesta de una sola aplicación (`app`) en la Etapa 1; la confirma el Líder Técnico (P-004).
- Autenticación del broker con Azure Event Hubs y reparto de los eventos del visor entre réplicas (ADR-010, P-032).
- **No hay diagrama de ambientes ni de auditoría y logs.** Azure Monitor y Key Vault están en el de contenedores; los ambientes se listan en texto. Un diagrama propio queda por dibujar (condición del Líder Técnico para G3).
- `aybar-starter-audit` no tiene destino Azure Blob: la auditoría técnica va a log o archivo (ADR-014).
- Los nombres de módulo en inglés y los nombres lógicos de los eventos se confirman (ADR-001, ADR-013).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con el stack propuesto por el ADR-012 |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Contexto sin fases posteriores y conflicto de stack señalado |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Sin módulo `identidad`; emisor y login de Control de acceso; Azure; módulos en inglés; visor alimentado por el servicio; Key Vault, Monitor y ShedLock en el diagrama |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
