---
id: "ADR-004"
tipo: "adr"
titulo: "ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-004: Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-04 del PLT-05 v1.3

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Varias APIs externas no tienen fecha comprometida (R-02: SIGDA/TAXON, call center, Legal, Cobranza, motor de José). Sin contrato y simulador a la fecha requerida, la historia que bloquean no puede marcarse Lista.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Esperar a que cada API exista | Bloquea el desarrollo desde el 21-oct (R-02). | Que todas las APIs estén disponibles antes del inicio. |
| Integrar cada API directo en los módulos que la usan | Acopla los módulos a cada externo: un cambio de dominio, formato o proveedor se multiplica. | — |

## Decisión

Cada sistema externo se toca por un **puerto** en `domain.port.out`, un **adaptador** en `adapters.outbound.external` y un **simulador** con el mismo contrato. Se construye contra el simulador y la API real se activa cuando su responsable la entrega. Solo el módulo `integraciones` habla con lo externo. Las llamadas HTTP usan el cliente corporativo del SDK (`aybar-starter-client`).

## Consecuencias

- Obliga a:
  - Un contrato de interfaz y un simulador por dependencia, cerrados el 20-oct.
  - Reintento y circuit breaker: el cliente del SDK aplica tiempos límite (2 s de conexión y 10 s de lectura) pero su contrato dice que no trae reintento ni circuit breaker; Resilience4j está gobernado por el BOM y no está declarado. La revisión del Líder Técnico (19-oct) indica que el circuit breaker se puede encender como opción del SDK: por confirmar antes de decidir si se construye o se enciende.
  - Credenciales propias por conector; el token del usuario nunca viaja a un tercero (`aybar.client.hosts-con-token`, vacía = ninguno).
  - Pruebas de contrato: el SDK no trae librería para ello.
- Impide:
  - Que un módulo de negocio llame a un externo directamente.
- Cuesta: Un simulador por conector; costo cloud: sin impacto propio.

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias; el módulo `integraciones` no guarda datos de negocio.
- PII: los datos personales que lleguen de un externo no se persisten (ADR-003).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v2 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-04 del PO. Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). — Revisado por: (pendiente) · Aprueba: TL
