---
id: "ADR-010"
tipo: "adr"
titulo: "ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-10 del PLT-05 v1.3

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Motivo: HU-067 (prioridad 3), sin plugins ni GPU dedicada. El visor muestra el proceso de atención en vivo y debe tener una vista 2D alternativa.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| 3D con GPU dedicada o plugins | Exige hardware y software que los usuarios no tienen. | — |
| Actualización por consulta periódica | No es en tiempo real y carga el servicio. | Que el tiempo real no sea requisito. |

## Decisión

El visor es un **canvas isométrico** en el navegador, alimentado por eventos en tiempo real por **WebSocket**, con **vista 2D alternativa**. Vive en el módulo `bandeja` (FT-25).

## Consecuencias

- Obliga a:
  - Una dependencia de WebSocket en el backend: no está en la plantilla.
  - Autenticar el WebSocket con el JWT.
  - Con varias réplicas, un modo de repartir los eventos a todas las conexiones.
  - Una pantalla (G2) y el tratamiento de los estados vacío, carga, error y sin permisos.
- Impide:
  - Enviar datos personales por el canal en vivo más allá de lo que el usuario puede ver.
- Cuesta: Horas de desarrollo: 10 h (HU-067).

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias: consume los eventos `ticket.assigned`, `ticket.closed` y de cambio de estado.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v2 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-10 del PO. — Revisado por: (pendiente) · Aprueba: TL
