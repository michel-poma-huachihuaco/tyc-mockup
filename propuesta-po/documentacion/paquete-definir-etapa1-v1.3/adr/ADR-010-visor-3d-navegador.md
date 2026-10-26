---
id: "ADR-010"
tipo: "adr"
titulo: "ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.3 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-10 del PLT-05 v1.3. Incorpora la condición de la revisión del Líder Técnico del 22-oct-2026: el visor recibe los eventos **del servicio** por WebSocket, no directo del bus. Registrado en `analisis/decisiones.md` v0.5.

## Contexto

Motivo: HU-067 (prioridad 3), sin plugins ni GPU dedicada. El visor muestra el proceso de atención en vivo y debe tener una vista 2D alternativa. El navegador no habla el protocolo Kafka ni debe tener acceso al bus de eventos (Azure Event Hubs, ADR-014): el bus es interno del servicio.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| 3D con GPU dedicada o plugins | Exige hardware y software que los usuarios no tienen. | — |
| Actualización por consulta periódica | No es en tiempo real y carga el servicio. | Que el tiempo real no sea requisito. |
| El navegador se conecta directo al bus de eventos | Expone el bus fuera del servicio, salta la autorización por área (HU-067 CA-07) y obliga a dar credenciales del bus al navegador. | — |

## Decisión

El visor es un **canvas isométrico** en el navegador, alimentado por eventos en tiempo real por **WebSocket**, con **vista 2D alternativa**. Vive en el módulo `inbox` (antes `bandeja`; FT-25).

1. **El visor recibe los eventos del servicio, no del bus.** El servicio consume los tópicos `aybar.service.ticket_created`, `ticket_assigned`, `ticket_status_changed`, `ticket_updated` y `sla_breached` (consumidor en `adapters.inbound.messaging`, ADR-013) y los reenvía a las conexiones abiertas por el endpoint `/ws/visor`, que entra por el mismo borde que la API (Cloudflare y API Management). El navegador nunca llega al bus ni tiene credenciales de él.
2. **Autenticación y permisos:** el navegador envía el JWT de Control de acceso al abrir la conexión (en el primer mensaje, no en la URL, para que no quede en los logs) y el servicio lo valida con el mismo `aybar-starter-security` (ADR-009). Exige el mismo permiso que `estadoVisor` (`ATC.VIEWER + ver`, rol `ATC_SUPERVISOR`) y envía a cada conexión solo los eventos de las **áreas que su rol permite** (HU-067 CA-07; regla de área de `roles-y-permisos-atc.md`, P-036). Al vencer el token (15 min), el visor lo renueva con `@aybarcorp/auth` y reabre la conexión. No se envían datos personales por el canal más allá de lo que el usuario puede ver.
3. **Estado inicial:** al abrir, el visor pide una foto del estado actual a la vista de lectura del servicio y luego aplica los eventos.
4. **Varias réplicas:** como cada réplica tiene sus propias conexiones, cada una necesita recibir todos los eventos. **Decisión:** cada réplica consume con su **propio grupo de consumidores** (nombre derivado de la réplica) y empieza por lo más reciente; lo anterior lo da la foto inicial del punto 3. No se agrega un canal de difusión entre réplicas. El número de grupos de consumidores que admite el nivel de Event Hubs de `arquitectura/costo-cloud.md` se comprueba en la misma prueba del bus (ADR-013, ADR-014).
5. **Objetivo de tiempo:** un cambio de estado en la bandeja se refleja en el visor en 5 s o menos, sin recargar (HU-067 CA-08), igual que el retraso máximo del almacén de lectura (ADR-012).

## Consecuencias

- Obliga a:
  - Una dependencia de WebSocket en el backend: no está en la plantilla.
  - Autenticar el WebSocket con el JWT y filtrar por área en el servidor.
  - Un grupo de consumidores por réplica (punto 4), con su limpieza cuando la réplica se apaga.
  - Una pantalla (G2) y el tratamiento de los estados vacío, carga, error y sin permisos.
  - Dibujar el visor alimentado por el servicio en `arquitectura/c4-contenedores.mmd` (corregido en la versión del 26-oct: bus → consumidor del servicio → `/ws/visor` → visor).
- Impide:
  - Que el navegador se conecte al bus de eventos.
  - Enviar datos personales por el canal en vivo más allá de lo que el usuario puede ver.
- Cuesta: **14 h**: 10 h de la HU-067 del plan del PO (`backlog/tareas/EP-ATC-09.json`) y 4 h del reparto entre réplicas (tabla del ADR-012; P-025). **USD 0 de nube propio**: el WebSocket corre en el mismo contenedor del servicio y usa los tópicos ya costeados en el ADR-014 (`arquitectura/costo-cloud.md`).

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias: consume los cinco tópicos `aybar.service.*` del ADR-013 (antes `ticket.created`, `ticket.assigned`, `ticket.status_changed`, `ticket.closed` y `sla.breached`).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-10 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | El visor recibe los eventos del servicio por WebSocket, no directo del bus; filtro por área; estado inicial; reparto entre réplicas; corrección pendiente de `c4-contenedores.mmd` |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Tópicos con el formato del SDK; autenticación y permiso del WebSocket; decisión del reparto entre réplicas (un grupo de consumidores por réplica); `c4-contenedores.mmd` corregido; costo con número y fuente |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
