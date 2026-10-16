---
id: "ADR-001"
tipo: adr
titulo: "Monolito modular por capacidad sobre el Aybar SDK (Spring Boot / Java)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-001: Monolito modular por capacidad sobre el Aybar SDK (Spring Boot / Java)

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - no se encontró una "Arquitectura de Directorio" del holding en `docs/`; verificar con Arquitectura/TL en el envío de G3]

## Contexto

Aybar Atiende necesita sostener 11 épicas de negocio (núcleo de tickets, SLA,
Libro de Reclamaciones, Mesa de Casos sensibles, postventa, EntregaFest,
calidad CX, bandeja orquestadora, consulta 360, resolución por morosidad y
formularios simples) bajo un único dueño del dato de ticket — `RN-SVC-026`
("cero registros paralelos del dato de cliente") exige justamente eso.

El servicio `aybar-atc` **ya fue generado** con el Aybar SDK
(`aybar-service-template 0.7.1`): Maven multi-módulo hexagonal
(`domain`/`application`/`adapters`/`infrastructure`/`boot`), Spring Boot, con
`NormaHexagonalTest` (ArchUnit) verificando la dirección de las dependencias.
Este scaffold existe en el repositorio antes de que se escribiera este ADR.

El PLT-05 (Definición de Listo, comité del 16-oct-2026, sección "4.1
Componentes y tecnologías") propuso como stack "Servicios en Node.js 20 ·
NestJS como monolito modular". Esa propuesta se redactó sin considerar que el
scaffold Java/Spring Boot ya existía — no es una decisión libre entre dos
stacks en igualdad de condiciones.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Node.js 20 + NestJS como monolito modular (propuesto en PLT-05) | El servicio ya se generó en Java/Spring Boot con el Aybar SDK; migrar de stack implica reescribir los 414 archivos del scaffold y perder los starters corporativos (datos/CQRS, seguridad OAuth2, mensajería Kafka con DLQ, auditoría Ley 29733, web RFC 7807) que ya resuelven buena parte de los RNF de este paquete | Si hubiera una decisión corporativa explícita de migrar la plataforma ATC a Node, tomada antes de invertir desarrollo sobre el scaffold actual |
| Microservicio por capacidad (uno por épica: tickets, SLA, libro, mesa de casos...) | Añade complejidad operativa (despliegue, observabilidad, transacciones distribuidas) desproporcionada para 227 h de desarrollo en 2 semanas; además `RN-SVC-026` exige un único dueño del dato de ticket, que una topología de varios servicios tendría que reconstruir con sincronización | Si el volumen o el equipo crecen al punto de que una capacidad (p. ej. Mesa de Casos sensibles) necesite escalar o desplegarse de forma independiente |
| Monolito modular en Java/Spring Boot sobre el Aybar SDK (elegida) | — | — |

## Decision

Aybar Atiende se construye como un monolito modular por capacidad — un
módulo de dominio por épica (tickets, SLA, Libro de Reclamaciones, Mesa de
Casos, postventa, etc.) dentro del hexágono ya generado — sobre Spring Boot
/ Java y el Aybar SDK 0.7.1, no sobre Node.js/NestJS.

## Consecuencias

- Obliga a: respetar la arquitectura hexagonal ya verificada por
  `NormaHexagonalTest` (Regla 1 de `AGENTS.md`); cada nueva capacidad de
  negocio (SLA, Libro, Mesa de Casos...) se modela como paquetes dentro de
  `domain`/`application`/`adapters` existentes, no como servicio aparte.
- Impide: introducir dependencias Node/NestJS o un segundo runtime backend
  en este repositorio.
- Cuesta: no se puede estimar el costo cloud de este monolito todavía
  porque **no existe un ADR de proveedor de nube** para este proyecto (el
  SDK es neutral de nube). Queda **pendiente de confirmar con
  Arquitectura/TL en G3**, no se inventa un número.

## Datos

No aplica directamente — es una decisión de topología de despliegue, no de
modelo de datos. El modelo de datos resultante (ver `docs/datos/`, en
construcción en paralelo) asume un único esquema relacional + un único
almacén documental para todo `aybar-atc`, coherente con esta decisión.

## Divergencia a informar en G3 (no bloquea)

El PLT-05 (DoR de planificación, comité del 16-oct-2026) propuso Node.js 20
+ NestJS como stack de la plataforma. Esta decisión diverge de esa
propuesta porque el scaffold del servicio ya existía en Java/Spring Boot
antes de esa reunión del comité DoR. Se informa al TL en el envío de G3,
según la regla del marco ("divergencias de los ADR con la estrategia
corporativa se informan, no bloquean"); no se reescribe el PLT-05.

Generado por IA: documento completo, a partir del DoR PDF (PLT-05, sección
4.1) y del scaffold real del repositorio — Revisado por: [pendiente, nombre
y fecha] - Aprueba: TL
