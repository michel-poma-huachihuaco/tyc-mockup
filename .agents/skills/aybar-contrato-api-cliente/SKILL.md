---
name: aybar-contrato-api-cliente
description: Del OpenAPI aprobado en G3 (docs/arquitectura/*.openapi.yaml) al cliente TypeScript del frontend con @aybarcorp/http — tipos del contrato, un servicio por recurso, ErrorAybar con 'codigo' (RFC 7807 del backend), qué hace la pantalla ante 401, 403, 400 y error de red, y el correlationId en el mensaje de soporte. Usar al consumir un endpoint desde frontend/, al mostrar errores del backend o cuando aparezcan crearClienteHttp, ErrorAybar, problem+json o X-Correlation-Id en el front.
---

# Contrato de API, lado cliente

El contrato manda igual que en el backend (skill `aybar-contrato-api`): el
`docs/arquitectura/<servicio>.openapi.yaml` aprobado en G3 es la
especificación. El front consume **solo** lo que el YAML declara. Si la pantalla
"necesita" otro campo, otra ruta u otro filtro, es un cambio de contrato y vuelve
a G3; no se arregla en el cliente ni pidiendo un endpoint por chat.

## Del YAML al cliente

| Del contrato | Va en |
|---|---|
| `components.schemas` | Tipos TS en `frontend/src/api/tipos.ts` (o por recurso), con los nombres y la opcionalidad del YAML |
| `paths` + operación | Una función por operación en un servicio `frontend/src/api/<recurso>.ts` (Angular: `<recurso>.service.ts`) |
| `servers` / prefijo `/api/v1` | `baseUrl` del cliente, de configuración de entorno; nunca un host escrito en el código |
| `securitySchemes` (`bearer-jwt`) | Lo pone `@aybarcorp/http` desde la sesión: no se toca |
| Respuestas `application/problem+json` | `ErrorAybar`: no se parsean a mano |

No hay generador de código del contrato en el SDK. Si el proyecto quiere uno
(p. ej. `openapi-typescript`), es una dependencia de terceros con versión exacta y
decisión del ADR. Sin generador, los tipos se escriben a mano y una prueba
compara sus campos obligatorios con el YAML.

## El cliente

```ts
import { crearClienteHttp } from '@aybarcorp/http'

export const api = crearClienteHttp({
  baseUrl: configuracion.apiUrl,        // de entorno, p. ej. /api o https://api.example.invalid
  sesion: () => auth.sesion(),          // remoto: () => anfitrion.sesion
  alNoAutenticado: () => auth.entrar(location.pathname),
})

export const listarSalas = (pagina: number) => api.get<PaginaSalas>('/v1/salas', { consulta: { pagina } })
```

Lo que ya hace y no se reimplementa: `Authorization: Bearer` (de
`sesion.obtenerToken()`, que renueva si vence), `Accept: application/json,
application/problem+json`, un `X-Correlation-Id` generado por petición (sin 8 o
más dígitos seguidos, que el backend rechaza), timeout (15 s por defecto) y la
lectura del `X-Correlation-Id` de la respuesta. Un cliente por backend; nunca
`fetch` en un componente.

## Errores: ErrorAybar

El backend responde RFC 7807 con `codigo` (no `code`), `correlationId`,
`timestamp` y, en validación, `campos`. `@aybarcorp/http` lo convierte en
`ErrorAybar`: `status`, `codigo`, `titulo`, `detalle`, `instancia`,
`correlationId`, `timestamp`, `campos: {campo, mensaje}[]` y los atajos
`esNoAutenticado`, `esSinPermiso`, `esValidacion`. Red caída o timeout:
`status` 0 (`fallo` dice `red`, `tiempo` o `cancelado`).

| Caso | Qué hace la pantalla |
|---|---|
| 401 (`esNoAutenticado`) | Reautenticar: `alNoAutenticado` lleva al login y vuelve a la ruta. No se muestra "error 401" |
| 403 (`esSinPermiso`) | Estado **sin permisos** de G2: qué falta y a quién pedirlo. No se reintenta ni se oculta el botón como única defensa |
| 400 / 422 (`esValidacion`) | Cada `campos[i]` va a su `Field` (`error`), por nombre de campo del contrato; lo que no casa con un campo, en un `Alert` arriba del formulario |
| 404, 409 y otros con `codigo` de negocio | Mensaje por `codigo` (`AYB-<AREA>-<HTTP>`), nunca por el texto de `detalle` |
| 0 (red, timeout) y 5xx | Estado **error** de G2 con reintento |

En todo mensaje de error que el usuario pueda reportar, el `correlationId`
visible y copiable ("Código de soporte: …"): es lo que soporte busca en los logs
del backend. Nunca se muestra el cuerpo crudo, una traza ni el token.

## Pruebas

- Por operación que usa la pantalla, un test del servicio con un `fetch` simulado (`crearClienteHttp({ fetch })`): la ruta, el método y el cuerpo son los del YAML.
- Por cada código de error que el criterio de aceptación nombra, un test que provoca ese `ErrorAybar` y comprueba el estado de la pantalla (skill `aybar-estados-ui`).
- Datos sintéticos siempre; ni tokens ni respuestas copiadas de un entorno real.

## Compatibilidad

El cliente sigue la versión de la ruta (`/api/v1`). Un campo opcional nuevo no
rompe al front; quitar o renombrar uno sí: el backend lo publica en `/v2` en
convivencia (skill `aybar-contrato-api`) y el front migra en su propia HU.
