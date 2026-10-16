---
id: "ADR-007"
tipo: adr
titulo: "Integraciones externas detrás de adaptadores con simulador (contract-first)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-007: Integraciones externas detrás de adaptadores con simulador (contract-first)

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

Aybar Atiende depende de al menos 8 sistemas externos: SIGDA/TAXON, NEXUS,
la plataforma del call center, Cobranza, la herramienta de Legal, el motor
de consultas de José, un proveedor de IA y UrbeMind. El propio DoR PDF
(página 2, "Diagrama de dependencias") marca en rojo las que se necesitan
en los primeros 3 días y siguen pendientes: `DEP-01, DEP-02, DEP-03, DEP-08,
DEP-11, DEP-13, DEP-14`. El plan de 2 semanas no puede esperar a que todas
esas APIs existan para empezar a construir.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Mocks improvisados por cada test, sin contrato formal | No son reutilizables entre equipo/HU, no sirven como documentación del contrato esperado, y divergen fácilmente de lo que la API real terminará exponiendo | Si solo hubiera una o dos integraciones de bajo riesgo, sin presión de calendario |
| Feature flags por integración dentro del código de negocio | Complica los casos de uso con condicionales de disponibilidad, mezclando lógica de negocio con lógica de infraestructura | Si el número de integraciones externas fuera mínimo |
| Puerto + adaptador con simulador, contract-first (elegida) | — | — |

## Decision

Cada integración externa se declara como un puerto en `domain.port.out`
con un contrato (OpenAPI o esquema de evento) definido **antes** de que
exista la API real del sistema externo; su adaptador en
`adapters.outbound.external` tiene una implementación simuladora para
DEV/QA, que se reemplaza por la implementación real cuando el sistema
externo entrega su API (coordinado contra las fechas de `DEP-01, 02, 03,
08, 11, 12, 13, 14, 15` del roadmap).

## Consecuencias

- Obliga a: definir el contrato de cada integración en
  `docs/arquitectura/` (o el esquema de evento correspondiente) aunque la
  API real todavía no exista.
- Impide: iniciar el desarrollo de una HU que dependa de un sistema externo
  sin que exista, como mínimo, su contrato y su simulador.
- Cuesta: trabajo adicional de mantener dos implementaciones por
  integración (simulador + real) durante la transición — se considera
  compensado porque desbloquea el desarrollo en paralelo mientras los
  equipos externos (NEXUS, Legal, call center...) entregan sus APIs.

## Datos

No aplica directamente — es una decisión de arquitectura de integración,
no de modelo de datos propio de `aybar-atc`.

Generado por IA: documento completo, a partir del diagrama de dependencias
del DoR PDF (página 2) y el riesgo `R-02` del roadmap — Revisado por:
[pendiente, nombre y fecha] - Aprueba: TL
