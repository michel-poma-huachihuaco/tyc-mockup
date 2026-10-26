---
id: "ADR-010"
tipo: "adr"
titulo: "ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.5"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-010: Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.5 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-10 del PLT-05 v1.3. Incorpora la condición de la revisión del Líder Técnico del 22-oct-2026: el visor recibe los eventos **del servicio** por WebSocket, no directo del bus. Registrado en `analisis/decisiones.md` v0.7.

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

1. **El visor recibe los eventos del servicio, no del bus.** El servicio consume los tópicos `aybar.service.ticket_created`, `ticket_assigned`, `ticket_status_changed`, `ticket_updated` y `sla_breached` (consumidor en `adapters.inbound.messaging`, ADR-013) y los reenvía a las conexiones activas del endpoint `/ws/visor`. El navegador nunca llega al bus ni tiene credenciales de él.
2. **Autenticación en el *handshake*, con la misma cadena de `aybar-starter-security`.** El *handshake* de un WebSocket es un `GET` HTTP con `Upgrade`, así que pasa por el mismo `SecurityFilterChain` del SDK que el resto de la API. `/ws/visor` **no** va en `aybar.security.rutas-publicas`. Como el navegador no puede poner la cabecera `Authorization` en un WebSocket, el visor manda el JWT de Control de acceso en la cabecera `Sec-WebSocket-Protocol`, junto al subprotocolo del visor: `new WebSocket(url, ['aybar.visor.v1', <jwt>])`. No lo manda en la URL, para que no quede en los logs del borde. El JWT usa solo caracteres válidos en esa cabecera.
   - ATC declara en `infrastructure` un bean `BearerTokenResolver`. Spring Security lo toma solo, porque la cadena del SDK no fija uno propio (`AybarSecurityAutoConfiguration`). Para `/ws/visor` lee el token del segundo valor de `Sec-WebSocket-Protocol`; para el resto delega en `DefaultBearerTokenResolver` (cabecera `Authorization`).
   - Con eso, el `JwtDecoder` del starter valida **firma, emisor, vencimiento y audiencia** (`spring.security.oauth2.resourceserver.jwt.audiences`, `AYBAR_JWT_AUDIENCE=aybar-atc`, decisión del equipo ED-06) antes de abrir la conexión. Un token inválido o vencido recibe 401 (`AYB-SEG-401`) y la conexión no se abre.
   - Un `HandshakeInterceptor` exige el mismo rol que `estadoVisor` (`ATC.VIEWER + ver`, rol `ATC_SUPERVISOR`): si falta, 403 (`AYB-SEG-403`). Además guarda en la sesión el `AybarUserContext`, las áreas que su rol puede ver (regla de área de `roles-y-permisos-atc.md` v0.4 §8; `MAE_AREA` como cola, ED-04) y el `exp` del token.
   - El servidor responde con el subprotocolo `aybar.visor.v1` y nunca devuelve el token. El origen se limita a los de `AYBAR_CORS_ORIGENES` (`setAllowedOrigins`).
   - **Al vencer el token** (15 min), el servidor cierra la conexión con el código 4401 («token vencido»). El visor renueva el token con `@aybarcorp/auth`, reabre la conexión y pide de nuevo la foto del punto 3, para no perder lo que pasó mientras estaba cerrada. Cada nueva conexión vuelve a validar el token y los roles: un rol retirado deja de ver el visor en la siguiente renovación.
   - A cada conexión se le envían solo los eventos de las **áreas que su rol permite** (HU-067 CA-07). No se envían datos personales más allá de lo que el usuario puede ver.
   - Para que el borde no corte una conexión quieta, el servidor manda un *ping* cada 30 s: el ingreso de Azure Container Apps corta a los 240 s (`https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview`) y Cloudflare corta antes las conexiones quietas.
3. **Estado inicial:** al abrir o reabrir, el visor pide una foto del estado actual a la vista de lectura del servicio (`estadoVisor`) y luego aplica los eventos. **Áreas de la sede (decisión del equipo, Q-067-1):** las del CA-01 de HU-067 que tienen flujo o cola en el piloto; el orden y la posición los fija `ATC_ADMIN_FUNCIONAL` en `MAE_AREA` (posición en la sede). El supervisor con rol global ve todas; con rol por empresa, las de su empresa (`DECISIONES.md` §5.9, respuesta 4). **Gestores ocupados sobre el total (CA-01, CA-04):** «ocupados» son los gestores con un ticket en atención en la cola del área; el «total», los gestores de la cola según `GestoresPort` con su adaptador «actividad de ATC» (ADR-009, ED-03). El visor va en la pantalla de la sala de operaciones y en el navegador del supervisor (Q-067-2).
4. **Varias réplicas:** como cada réplica tiene sus propias conexiones, cada una necesita recibir todos los eventos. **Decisión:** cada réplica consume con su **propio grupo de consumidores** de Kafka, con un nombre derivado de la réplica, y empieza por lo más reciente; lo anterior lo da la foto del punto 3. No se agrega un canal de difusión entre réplicas. Event Hubs Standard admite **1.000 grupos de consumidores de Kafka por espacio de nombres** («Number of Kafka consumer groups per namespace»: 1,000, `https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas`), así que dos réplicas en producción y una en los demás ambientes quedan lejos del límite. Al apagarse la réplica, su grupo se borra.
5. **Objetivo de tiempo:** un cambio de estado en la bandeja se refleja en el visor en 5 s o menos, sin recargar (HU-067 CA-08), igual que el retraso máximo del almacén de lectura (ADR-012).
6. **Por dónde entra `/ws/visor`: Cloudflare → ingreso de Azure Container Apps, sin pasar por Azure API Management.** La documentación de Microsoft dice: «WebSocket APIs aren't supported yet in the Consumption tier» (`https://learn.microsoft.com/en-us/azure/api-management/websocket-api`). El costo de ATC (`arquitectura/costo-cloud.md` v0.5) toma API Management en el nivel de consumo, supuesto que fija el equipo (ED-12). Por eso el WebSocket usa un nombre de host propio (por ejemplo `ws-atc.<dominio corporativo>`), que Cloudflare enruta al ingreso de Container Apps. Ese ingreso admite WebSocket («Support for WebSocket and gRPC», misma página del ingreso) y tiene restricción de IP para aceptar solo las de Cloudflare. Una regla de Cloudflare deja pasar en ese host solo la ruta `/ws/visor`. La API REST sigue entrando por API Management. Como el borde no valida el `aud` de esta ruta, la valida el servicio (punto 2), que es lo que exige el SDK 0.7.1 en cualquier caso. Si la instancia corporativa tiene un nivel que admite WebSocket (Developer, Basic, Basic v2, Standard, Standard v2, Premium o Premium v2, según la misma página), `/ws/visor` puede publicarse como API WebSocket con `validate-jwt` en `onHandshake`, sin cambiar el servicio.

## Consecuencias

- Obliga a:
  - La dependencia `spring-boot-starter-websocket`, sin `<version>` (la gobierna Spring Boot por el BOM del SDK): no está en la plantilla.
  - El `BearerTokenResolver` del punto 2, el `HandshakeInterceptor` con el rol y las áreas, el cierre a la hora de `exp` y el *ping* cada 30 s; pruebas de token vencido, sin `aud`, sin rol y de reconexión.
  - El host propio de `/ws/visor` en Cloudflare, con su regla de ruta, y la restricción de IP del ingreso (punto 6).
  - Un grupo de consumidores por réplica (punto 4), con su limpieza cuando la réplica se apaga.
  - Una pantalla (G2) y el tratamiento de los estados vacío, carga, error y sin permisos.
  - Dibujar el visor alimentado por el servicio en `arquitectura/c4-contenedores.mmd`: bus → consumidor del servicio → `/ws/visor` → Cloudflare → visor, sin API Management (hecho el 26-oct).
- Impide:
  - Que el navegador se conecte al bus de eventos.
  - Enviar datos personales por el canal en vivo más allá de lo que el usuario puede ver.
- Cuesta: **10 h** de la HU-067 del plan del PO (`backlog/tareas/EP-ATC-09.json`), que incluyen el WebSocket: la autenticación en el *handshake*, el cierre al vencer el token y el reparto entre réplicas (tarea HU-ATC-067-T02; tabla del ADR-012, sin horas fuera del plan). **USD 0 de nube propio**: el WebSocket corre en el mismo contenedor del servicio, entra por el ingreso de Container Apps sin pasar por API Management y usa los tópicos ya costeados en el ADR-014 (`arquitectura/costo-cloud.md` v0.5, §1.1 y §2.2; supuestos fijados en ED-12).

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias: consume los cinco tópicos `aybar.service.*` del ADR-013 (antes `ticket.created`, `ticket.assigned`, `ticket.status_changed`, `ticket.closed` y `sla.breached`).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-10 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | El visor recibe los eventos del servicio por WebSocket, no directo del bus; filtro por área; estado inicial; reparto entre réplicas; corrección pendiente de `c4-contenedores.mmd` |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Tópicos con el formato del SDK; autenticación y permiso del WebSocket; decisión del reparto entre réplicas (un grupo de consumidores por réplica); `c4-contenedores.mmd` corregido; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: el JWT se valida en el *handshake* con la cadena de `aybar-starter-security` (token en `Sec-WebSocket-Protocol`, `BearerTokenResolver` propio, firma, emisor, vencimiento y audiencia), rol en el `HandshakeInterceptor`, cierre 4401 al vencer y reconexión con la foto; `/ws/visor` entra por Cloudflare al ingreso de Container Apps porque API Management de consumo no admite WebSocket (verificado en Microsoft Learn); límite de grupos de consumidores de Kafka verificado; dependencia y horas |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): audiencia `aybar-atc` validada en el *handshake* (ED-06); áreas de la sede y quién las ordena (Q-067-1); total de gestores con `GestoresPort` «actividad de ATC» (ED-03); nivel de API Management como supuesto del costo (ED-12); WebSocket dentro de las 10 h de HU-067, sin horas fuera del plan |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
