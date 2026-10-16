---
id: "ADR-004"
tipo: adr
titulo: "UrbeMind y conectores solo por API/eventos, sin JOIN físico"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-004: UrbeMind y conectores solo por API/eventos, sin JOIN físico

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

`HU-ATC-017` (vincular incidencias de ciudad como tickets, tipo
`CITY_INCIDENT`) y `HU-ATC-018` (exponer tickets vía API/evento a UrbeMind)
describen a UrbeMind como una aplicación SaaS que corre en un **ambiente
físico separado** del holding. `RF-SVC-018` lo dice explícito: tratarla
"como un canal más **sin JOIN físico**". Esto ya se conversó con el humano
en esta sesión: ningún sistema externo se conecta directo a la base de
`aybar-atc`, por principio de "una base de datos por servicio".

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Compartir la base de datos de `aybar-atc` con UrbeMind | Acopla físicamente dos sistemas en ambientes separados; rompe el principio de una base por servicio; cualquier migración de `aybar-atc` rompería a UrbeMind sin aviso | Nunca, salvo una decisión corporativa explícita de fusionar ambos sistemas en un solo dominio de datos |
| Sincronización batch nocturna | Introduce una latencia inaceptable para un caso de atención al cliente que puede ser en vivo (incidencia urbana) | Si UrbeMind solo necesitara reportes agregados periódicos, no casos individuales en tiempo real |
| API síncrona para consulta/creación + eventos Kafka para cambios de estado (elegida) | — | — |

## Decision

UrbeMind consume y crea tickets de tipo `CITY_INCIDENT` exclusivamente por
la API REST versionada de `aybar-atc`, y se entera de cambios de estado por
eventos de Kafka (`ticket.assigned`, `ticket.closed`); no existe ninguna
conexión directa de UrbeMind a la base de datos de `aybar-atc`.

## Consecuencias

- Obliga a: versionar en `docs/arquitectura/` el contrato OpenAPI de los
  endpoints que usa UrbeMind, y documentar en `aybar-starter-messaging` los
  topics/eventos que publica `aybar-atc` para este consumidor.
- Impide: cualquier conexión JDBC/Mongo directa desde UrbeMind (u otro
  sistema externo) hacia la infraestructura de `aybar-atc`.
- Cuesta: throughput adicional de Kafka y de la API por el tráfico de
  UrbeMind — no cuantificable hoy, depende del volumen real de incidencias
  urbanas (dato no disponible en ninguna fuente leída). **Pendiente de
  estimar cuando exista ese dato.**

## Datos

- Entidades nuevas y dueño de dato: `SVC_TICKET` gana un vínculo opcional a
  `CITY_SERVICE_FEE` cuando una incidencia deriva en cobro (ya descrito en
  `HU-ATC-017`). Dueño del dato: Gestión de Tickets (`aybar-atc`), no
  UrbeMind.
- Linaje: UrbeMind → `aybar-atc` (creación/consulta por API); `aybar-atc` →
  UrbeMind (eventos de cambio de estado).
- PII/sensibilidad: el ticket `CITY_INCIDENT` puede contener datos del
  reportante — clasificar en el diccionario de datos de F4.
- Reglas de calidad para F10: `accesos_fuera_de_api_evento_urbemind = 0`
  (ya nombrado como `RNF-INT-003` en el catálogo de RNF del artefacto).

**Nota de alcance abierta:** `EP-ATC-06` (Integración UrbeMind) tiene una
contradicción entre fuentes sobre si está dentro o fuera de alcance del
plan de 2 semanas (ver `docs/epicas/EP-ATC-06-integracion-urbemind.md`,
pregunta abierta, y `R-06` del DoR PDF). Este ADR define **cómo** se
integraría si procede, no resuelve **si** procede en este release — eso lo
decide el patrocinador, según el propio DoR PDF (FT-ATC-11 en `NO LISTO`).

Generado por IA: documento completo, a partir de `HU-ATC-017`, `HU-ATC-018`
y el DoR PDF (riesgo `R-06`) — Revisado por: [pendiente, nombre y fecha] -
Aprueba: TL
