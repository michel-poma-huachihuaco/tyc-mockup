---
id: "GATE-AYB-NNNN-G2"
tipo: gate
titulo: "Envio de G2 Design Gate - AYB-NNNN"
estado: draft
producto: "[producto]"
version: "0.1"
owner: "[UX que envia]"
aprobadores: []
fecha: "AAAA-MM-DD"
relacionados: ["AYB-NNNN", "FT-NNN", "HU-NNN"]
tags: [gate, g2, envio, ux]
---

# Envio de gate - G2 - Design Gate (UX/UI)

Va en `docs/gates/AYB-NNNN/G2.md`. Aprueban: **PO + UX** (los dos; una sola
firma no lo cierra). Bloquea: que la HU con pantalla sea Ready (fase F3). Es
obligatorio cuando alguna HU de la feature lleva `ui: true` (o el tag `ui`) en
su frontmatter; sin pantallas es opcional, pero si existe tiene que estar
approved. Lo exigen el guardian de G4 (`.guardianes/validar-gate-listo.sh`) y
`aybar paquete validar`.

El gate cuenta como aprobado solo cuando este archivo tiene `estado: approved`
en `origin/main`, por un PR aprobado por los CODEOWNERS de PO y de UX. Al pasar
a approved, `aprobadores` lleva las dos firmas con nombre. `disenador-ux` (o
cualquier agente) lo deja en `draft` o `review`; nunca escribe `approved`.

## 1 Correo de formalizacion

| Campo | Valor |
|---|---|
| De | [UX que envia] |
| Para | Product Owner y UX lead |
| Fecha | [AAAA-MM-DD] |
| Asunto | [G2] · [AYB-NNNN] · [titulo] · [T1 / T2 / T3] |
| Pedido | Cerrar G2 de las HU con pantalla de [FT-NNN] |
| Adjunto | Este documento, con los enlaces fijados por commit o por version de Figma |

## 2 Identificacion

| Campo | Valor |
|---|---|
| Ticket | AYB-NNNN |
| Tipo | [T1 / T2 / T3] |
| Feature | [FT-NNN - nombre] |
| HU con pantalla (`ui: true`) | [HU-NNN, HU-NNN] |
| UI y papel del frontend | [React+Vite / Angular / Next.js] · [app / shell / remoto] (de `.aybar/proyecto.properties`) |
| Aprobadores | PO + UX |

## 3 Diseno

| Evidencia | Que debe contener | Enlace | ¿Cumple? |
|---|---|---|---|
| Figma versionado | Archivo y **version fija** (enlace a la version o al historial con su nombre), nunca "el archivo vivo" | [figma: archivo · version] | [Si / No: motivo] |
| User flow | Por HU: entrada, pasos, decisiones y salidas, incluidos los caminos de error | [enlace] | |
| Prototipo | Si hay interaccion no trivial (asistentes, arrastrar, edicion en linea); si no, "No aplica" | [enlace o No aplica] | |
| Contrato | Cada dato que la pantalla muestra o envia existe en `docs/arquitectura/<servicio>.openapi.yaml` (G3) | [operaciones] | |
| Validacion de stakeholder | Quien lo vio, cuando y que cambio pidio | [acta o comentario] | |

## 4 Estados por pantalla

Una fila por pantalla. Cada celda enlaza el frame de Figma (o dice "No aplica"
y por que). Detalle de cada estado y lo que el framework cubre hoy: skill
`aybar-estados-ui`.

| Pantalla | Vacio | Carga | Error (red / servidor / validacion) | Sin permisos (403, rol insuficiente) | Responsive (sm 640 · md 768 · lg 1024 · xl 1280) |
|---|---|---|---|---|---|
| [nombre] | [frame] | [frame] | [frame: mensaje, reintento y codigo de soporte (correlationId)] | [frame: que falta y a quien pedirlo] | [frames por breakpoint] |

## 5 Accesibilidad

| Criterio | Como se verifico | ¿Cumple? |
|---|---|---|
| Contraste | Pares texto/fondo de los tokens de `@aybarcorp/tokens` (verificados en su build); colores fuera de los tokens, medidos uno a uno (4.5:1 texto, 3:1 texto grande y controles) | |
| Foco | Orden de foco dibujado por pantalla; foco visible en todo lo accionable; a donde va el foco al abrir y cerrar un dialogo o al fallar un envio | |
| Teclado | Todo se hace sin raton: Tab, Shift+Tab, Enter, Espacio, Escape | |
| Etiquetas | Todo campo con etiqueta visible; botones de icono con nombre accesible; errores asociados a su campo y anunciados | |
| Movimiento | Animaciones respetan `prefers-reduced-motion` | |

## 6 Consistencia con el design system

| Pregunta | Respuesta |
|---|---|
| Componentes del framework usados | [`Button`, `Field`, `Alert`, `Card`, `Stack`... (React `@aybarcorp/ui`; Angular `@aybarcorp/ui-elements`)] |
| Compuestos con lo que hay (no existe el componente) | [p. ej. estado vacio = `Card` + `Heading` + `Button`] |
| Pedidos al framework | [componente o patron que falta, con su motivo] |
| Desvios de los tokens | [ninguno / cual y por que: lo decide UX con el dueno del framework] |

## 7 IA

Si una IA preparo partes de este envio (flujos, textos, tabla de estados), se
dice cuales y quien las reviso. La IA no disena la version que se aprueba ni
firma.

## 8 Firmas

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | Aprueba / Rechaza |
| UX | | | Aprueba / Rechaza |

La IA no cierra gates ni aprueba pull requests. Nadie se auto-aprueba.

Generado por IA: [partes] — Revisado por: [nombre, fecha]
