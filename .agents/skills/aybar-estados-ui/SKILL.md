---
name: aybar-estados-ui
description: Los estados que G2 exige a cada pantalla (vacío, carga, error, sin permisos, responsive y accesibilidad) — qué tiene que traer el envío de G2, qué componentes del framework @aybarcorp/* los cubren hoy, qué falta y cómo se construye mientras tanto sin salirse del design system. Usar al preparar o revisar G2, al implementar una pantalla de una HU con ui true, o al probar sus estados en QA.
---

# Estados de una pantalla

G2 (UX/UI, lo aprueban PO + UX) no aprueba "la pantalla bonita": aprueba la
pantalla **en todos sus estados**. Una HU con `ui: true` no está lista sin el
diseño de cada uno, y no está terminada sin su prueba. Plantilla del envío:
`.agents/templates/g2-diseno.md`.

## Los estados

| Estado | Qué tiene que decir G2 | Qué tiene que probar la HU |
|---|---|---|
| **Vacío** | Qué ve el usuario sin datos (primera vez y tras un filtro sin resultados) y cuál es la acción siguiente | Respuesta con lista vacía |
| **Carga** | Dónde y cómo se indica que algo está en curso; qué queda bloqueado | Respuesta lenta: no hay doble envío |
| **Error** | Error de red o del servidor (con reintento), y errores de validación por campo | `ErrorAybar` con status 0, 5xx y 400 con `campos` |
| **Sin permisos** | Qué se muestra cuando el backend responde 403 o el rol no alcanza: qué falta y a quién pedirlo | `ErrorAybar` 403 y sesión sin el rol |
| **Responsive** | Comportamiento en cada `breakpoint` de los tokens (sm 640, md 768, lg 1024, xl 1280, 2xl 1536): qué se apila, qué se oculta | Ancho de móvil y de escritorio |
| **Accesibilidad** | Contraste de cada par texto/fondo, orden de foco, uso con teclado, etiquetas y anuncios para lector de pantalla | Recorrido con teclado y nombres accesibles |

El mensaje de error que el usuario puede reportar lleva el `correlationId`
del `ErrorAybar` ("Código de soporte: …"). Qué hace cada código: skill
`aybar-contrato-api-cliente`.

## Qué cubre hoy el framework

Verificado en el repo `aybar-framework` (paquetes en lockstep). Antes de usar
uno, confirma que tu versión lo trae (skill `aybar-estado-del-sdk`).

| Estado | Lo cubre | Falta |
|---|---|---|
| Carga | `Button`, `IconButton` y `Fab` con `cargando` (marca `aria-busy` y deshabilita); `ProveedorAutenticacion` con `cargando`; el punto de montaje del shell (`PuntoDeMontaje cargando` en React, estado `cargando` de `<ay-punto-montaje>`) | Indicador de carga de página o sección y *skeleton* públicos: el `Spinner` es interno, no se exporta |
| Error | `Alert tono="danger"` (`role="alert"`); `Field` con `error` (lo asocia con `aria-describedby` y lo anuncia); `PuntoDeMontaje fallo` con `reintentar`; `ProveedorAutenticacion fallo` | Una vista de error de página con reintento y código de soporte: se compone con `Alert` + `Button` |
| Sin permisos | El shell: `PuntoDeMontaje sinPermiso` y estado `sin-permiso` de `<ay-punto-montaje>` (roles de la entrada en `remotos.json`) | Nada específico para un 403 de la API dentro de una pantalla: `Alert tono="warning"` con el texto de G2 |
| Vacío | — | Componente de estado vacío: se compone con `Card`, `Stack`, `Heading` y `Button` |
| Responsive | Tokens `breakpoint` y `Stack` | Rejilla o *layout* de página: CSS propio con los tokens |
| Accesibilidad | Pares de contraste verificados en el build de `@aybarcorp/tokens` (`@aybarcorp/tokens/contraste`); `:focus-visible` y `prefers-reduced-motion` en `@aybarcorp/ui`; `Field` exige `etiqueta`; `Alert` con el rol correcto | Pruebas automáticas de accesibilidad: la plantilla del front no trae axe ni Playwright |

En Angular u otro host, los mismos componentes como custom elements de
`@aybarcorp/ui-elements` (`ay-button`, `ay-field`, `ay-alert`...); los de
disposición (`Card`, `Stack`) se usan por su clase (`ay-card`, `ay-stack`).

## Cuando falta un componente

- Se **compone** con los componentes y los tokens que existen. Nada de colores, sombras o espacios literales, ni una librería de UI nueva por una HU (eso es decisión del ADR).
- El envío de G2 lo deja escrito en "Consistencia con el design system": qué se compuso y qué se pide al framework. No es un bloqueo de G2 si el diseño lo cubre con lo que hay.
- Si el diseño de G2 pide algo que no se puede componer (un patrón nuevo), es una conversación con UX y el dueño del framework, no una implementación por tu cuenta.

## Cómo se prueba

- Cada estado de la tabla de G2, un test: el servicio simulado (`crearClienteHttp({ fetch })`) devuelve lista vacía, tarda, falla con status 0, 500, 400 con `campos` y 403; la pantalla muestra lo que G2 dice.
- Teclado: todo lo accionable se alcanza con Tab en el orden de G2 y se acciona con Enter o Espacio; el foco se ve.
- Los flujos críticos (los define el PO) van además en E2E: `qa-engineer` los cubre con Playwright si el proyecto lo adopta (dependencia con versión exacta y nota en el ADR).
- Datos sintéticos siempre, también en las capturas que acompañan a G2.
