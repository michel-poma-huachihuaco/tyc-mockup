---
id: "ADR-010"
tipo: "adr"
titulo: "ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: convierte a la plantilla del marco el ADR-10 del PLT-05 v1.3. Incorpora la condición de la revisión del Líder Técnico del 22-oct-2026: el visor recibe los eventos **del servicio** por WebSocket, no directo del bus. Registrado en `analisis/decisiones.md` v0.3.

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

1. **El visor recibe los eventos del servicio, no del bus.** El servicio consume los eventos del bus (consumidor en `adapters.inbound.messaging`, ADR-013) y los reenvía a las conexiones abiertas por el endpoint `/ws/visor`. El navegador nunca llega al bus.
2. **Autenticación y permisos:** el WebSocket se autentica con el JWT de Control de acceso (ADR-009) y el servicio envía a cada conexión solo los eventos de las **áreas que su permiso permite** (HU-067 CA-07). No se envían datos personales por el canal más allá de lo que el usuario puede ver.
3. **Estado inicial:** al abrir, el visor pide una foto del estado actual a la vista de lectura del servicio y luego aplica los eventos.
4. **Varias réplicas:** como cada réplica tiene sus propias conexiones, cada una necesita recibir todos los eventos. Se decide al implementarlo si cada réplica consume con su propio grupo de consumidores o si se usa un canal de difusión entre réplicas; la opción se prueba con Azure Event Hubs (ADR-014).
5. **Objetivo de tiempo:** un cambio de estado en la bandeja se refleja en el visor en 5 s o menos, sin recargar (HU-067 CA-08), igual que el retraso máximo del almacén de lectura (ADR-012).

## Consecuencias

- Obliga a:
  - Una dependencia de WebSocket en el backend: no está en la plantilla.
  - Autenticar el WebSocket con el JWT y filtrar por área en el servidor.
  - Con varias réplicas, un modo de repartir los eventos a todas las conexiones (punto 4).
  - Una pantalla (G2) y el tratamiento de los estados vacío, carga, error y sin permisos.
  - Corregir `arquitectura/c4-contenedores.mmd`: hoy dibuja el visor conectado al bus (`kf -. WebSocket .-> visor`); debe pasar por el servicio.
- Impide:
  - Que el navegador se conecte al bus de eventos.
  - Enviar datos personales por el canal en vivo más allá de lo que el usuario puede ver.
- Cuesta: horas de desarrollo: 10 h (HU-067), sin contar el reparto entre réplicas (P-025); costo cloud sin impacto propio.

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias: consume los eventos `ticket.assigned`, `ticket.closed` y de cambio de estado (nombres lógicos, ADR-013).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-10 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | El visor recibe los eventos del servicio por WebSocket, no directo del bus; filtro por área; estado inicial; reparto entre réplicas; corrección pendiente de `c4-contenedores.mmd` |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
