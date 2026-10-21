---
id: "SPEC-ARQ-C4"
tipo: "spec"
titulo: "Diagrama de arquitectura (C4: contexto, contenedores y módulos)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [arquitectura, c4, g3]
---

# Diagrama de arquitectura · C4

Va en `docs/arquitectura/` y se enlaza desde el envío de G3 y desde la sección 4 del DoR. Fuentes: `c4-contexto.mmd`, `c4-contenedores.mmd` y `modulos.mmd` (Mermaid; cualquier visor de Mermaid o `mmdc` los dibuja). Borrador del 2026-10-19, con los PLT v1.3 en refinamiento y el stack que propone el ADR-012 (pendiente de la decisión del líder técnico).

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
  atc(["<b>Aybar Atiende</b><br/>plataforma ATC<br/>Java con Spring Boot · un despliegue"])
  subgraph Ext["Sistemas externos (con simulador)"]
    sigda[SIGDA/TAXON<br/>DEP-01]
    con[Contratos y Activos<br/>DEP-07]
    cob[Cobranza<br/>DEP-08]
    cti[Call center CTI<br/>DEP-11]
    leg[Herramienta de Legal<br/>DEP-12]
    jose[Motor de José<br/>DEP-13]
    ia[Proveedor de IA<br/>DEP-14]
    kpi[KPI Engine y GLI<br/>DEP-10 y DEP-06]
  end
  emisor[["Emisor OIDC de tokens<br/>(por decidir, ADR-014)"]]
  tel --> atc
  wa --> atc
  mail --> atc
  portal --> atc
  ges --> atc
  emisor -. JWT .-> atc
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
  emisor[["Emisor OIDC<br/>(ADR-014)"]]
  subgraph front["Presentación · Angular"]
    consola[Consola ATC]
    mp[Mi Portal]
    visor[Visor 3D]
    forms[Formularios PWA]
  end
  gw[Pasarela de API + WAF]
  subgraph app["Aybar Atiende · Java 21 · Spring Boot 3.5 · un despliegue · monolito modular"]
    direction TB
    m1[tickets]
    m2[sla]
    m3[libro]
    m4[casos_legales]
    m5[postventa]
    m6[portal]
    m7[calidad]
    m8[bandeja]
    m9[consulta360]
    m10[morosidad]
    m11[integraciones<br/>adaptador + simulador]
    m12[identidad<br/>roles locales]
    jobs[Jobs idempotentes<br/>SLA y plazo legal]
    outb[Outbox]
    proy[Proyector]
  end
  pg[(PostgreSQL<br/>se escribe<br/>una instancia, tablas del v7)]
  mg[(Almacén de lectura<br/>API de MongoDB<br/>vistas de ATC)]
  kf{{Bus de eventos<br/>protocolo Kafka}}
  s3[(Almacenamiento de objetos<br/>Object Lock · evidencia)]
  ext[Sistemas externos]
  user --> front --> gw --> app
  emisor -. JWT .-> gw
  app -- escribe --> pg
  app -- evento en la misma transacción --> outb
  outb --> kf
  kf --> proy
  proy --> mg
  app -- lee --> mg
  app --> s3
  m11 <--> ext
  kf -. WebSocket .-> visor
```

Reglas que muestra el diagrama:
- Se **escribe** en PostgreSQL y se **lee** del almacén de lectura; la lectura no abre JDBC (skill `aybar-cqrs`).
- Cada cambio guarda su evento en la misma transacción (outbox) y un proceso lo publica al bus (ADR-013).
- Los módulos no se tocan las tablas: se hablan por su API pública o por eventos (ADR-001).
- Solo el módulo `integraciones` habla con los sistemas externos (ADR-004).
- El almacén de lectura guarda lo de ATC, no el dato del cliente (ADR-003).

## 3 Módulos

```mermaid
flowchart LR
  ident[identidad<br/>roles locales]
  tickets[tickets]
  sla[sla]
  libro[libro]
  casos[casos_legales]
  posv[postventa]
  portal[portal]
  cal[calidad]
  band[bandeja]
  c360[consulta360]
  moro[morosidad]
  integ[integraciones]
  bus{{eventos}}
  ident -. roles .-> tickets
  portal -- API --> tickets
  libro -- API --> tickets
  casos -- API --> tickets
  posv -- API --> tickets
  moro -- API --> tickets
  band -- API --> tickets
  tickets -- ticket.assigned · ticket.closed --> bus
  sla -- sla.breached --> bus
  bus --> band
  bus --> cal
  bus --> portal
  c360 --> integ
  moro --> integ
  casos --> integ
  posv --> integ
  tickets --> integ
  integ --> ext[(Sistemas externos)]
```

## 4 Pendientes del diagrama

- Marcar nube, orquestador y observabilidad: **por decidir** (ADR-014).
- Quién escribe en el almacén de lectura: el servicio (proyector) u otro proceso (ADR-012).
- Papel del frontend Angular: `app` o `shell` con remotos.
- Dónde vive el emisor de tokens de la Etapa 1.
- Stack del diagrama (Java con Spring Boot y Angular; PostgreSQL, almacén de lectura con API de MongoDB y bus de eventos): **conflicto abierto con el PLT-01 v1.3 (ADR-01 del PO, NestJS + React + una sola PostgreSQL Multi-AZ con índice de búsqueda): decide el líder técnico** (ADR-001, ADR-012 y ADR-013).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v2 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: contexto sin sistemas de fases posteriores y conflicto de stack señalado. Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). — Revisado por: (pendiente)
