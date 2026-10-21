---
id: "ADR-008"
tipo: adr
titulo: "IA solo vía servicio de asistencia, con anonimización y registro"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-008: IA solo vía servicio de asistencia, con anonimización y registro

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

`HU-ATC-048` (retroalimentación de IA al gestor durante la atención) y
`HU-ATC-053` (búsqueda semántica con un modelo de red neuronal) son los dos
usos de IA ya identificados en el paquete. `RNF-SEC-009` fija la meta:
"100 % de sugerencias registradas". `DEP-14` (proveedor de IA aprobado por
TI y Seguridad) sigue pendiente. La skill del propio marco
`aybar-datos-que-no-salen` prohíbe mandar datos personales o productivos
reales a un prompt de IA sin tratamiento.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Llamar al proveedor de IA directo desde cualquier caso de uso de negocio | Sin un punto único de anonimización, cada nuevo uso de IA repetiría (o se olvidaría de repetir) el tratamiento de PII — alto riesgo de incumplir la Ley 29733 y `aybar-datos-que-no-salen` | Nunca, mientras el dato de entrada pueda contener PII |
| Correr el modelo on-premise | Sobreingeniería para un plan de 2 semanas sin presupuesto ni infraestructura de ML definida; no resuelve el registro de sugerencias por sí solo | Si el proveedor de IA (`DEP-14`) no pudiera cumplir requisitos de residencia de datos del holding |
| Servicio de asistencia intermedio que anonimiza y registra cada llamada (elegida) | — | — |

## Decision

Toda interacción con un modelo de IA (sugerencia de respuesta, verificación
de criterios de cierre de `HU-ATC-048`, indexación semántica de documentos
de `HU-ATC-053`) pasa por un único componente de servicio de asistencia que
anonimiza los datos personales antes de que salgan del perímetro de
`aybar-atc`, y registra la sugerencia recibida junto con la decisión del
gestor (`SVC_AI_SUGGESTION_LOG`, ya nombrado en el DoR). Ningún caso de uso
de negocio llama al proveedor de IA de forma directa.

## Consecuencias

- Obliga a: que cualquier nuevo uso de IA que se agregue más adelante pase
  por este mismo servicio de asistencia, no por una integración directa
  nueva.
- Impide: enviar texto de tickets, narrativas o documentos con PII a un
  proveedor de IA sin anonimizar primero.
- Cuesta: latencia adicional de la capa de anonimización; el costo del
  proveedor de IA todavía no se puede estimar porque `DEP-14` sigue
  pendiente de aprobación por TI y Seguridad. **Pendiente de confirmar
  cuando exista proveedor.**

## Datos (puerta F4 de Gobierno de Datos)

- Entidades nuevas y dueño de dato: `SVC_AI_SUGGESTION_LOG` (sugerencia,
  decisión del gestor) — dueño: Gestión de Tickets.
- Linaje: entrada anonimizada → proveedor de IA → sugerencia → registro +
  decisión del gestor.
- PII/sensibilidad: el texto de entrada debe anonimizarse antes de salir
  del perímetro; el log de sugerencias no debe reintroducir PII en texto
  plano.
- Reglas de calidad para F10: `100 % de sugerencias registradas`
  (`RNF-SEC-009`).

Generado por IA: documento completo, a partir de `HU-ATC-048`,
`HU-ATC-053`, `RNF-SEC-009` y la skill `aybar-datos-que-no-salen` —
Revisado por: [pendiente, nombre y fecha] - Aprueba: TL
