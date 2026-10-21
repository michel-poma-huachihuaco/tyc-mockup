# propuesta-po · «Prototipo Aybar Atiende · what-if PO» en local

El artifact `claude.ai/artifact/JN561TDhgAeMtwBEm2SgeR` (prototipo React con la propuesta del PO), traído a
esta carpeta como código local, con **dos cambios**: los gráficos de **Vista en vivo** y de **Búsqueda 360**
(el grafo de la consulta 360) ya no son canvas 2D, sino escenas **three.js**. Todo lo demás es el artifact tal cual.

```
cd propuesta-po
npm install
npm start              # compila las escenas y sirve http://localhost:5180
```

Rutas (hash): `#/vivo` (Vista en vivo) y `#/clientes/cli-001` (Búsqueda 360 del cliente).

## Qué hay

| Ruta | Qué es |
|---|---|
| `artefacto/` | El artifact publicado (67 archivos: `index.html`, `assets/*`). Solo los chunks que de verdad carga; sin los duplicados antiguos |
| `artefacto/assets/escenas-three.js` | **Generado** por `npm run build:three` desde `src/three/` (three.js incluido) |
| `src/three/vivo.ts` | Vista en vivo: oficina de atención 3D (cámara isométrica, luz y sombras). Controla tickets, personas, cámara y carteles |
| `src/three/oficina.ts` | Plano de la oficina: salas, puestos, pasillos y rutas de los tickets (solo geometría) |
| `src/three/robots.ts` | Robot orquestador de la bandeja y cuerpo base de los mini-bots |
| `src/three/entradas.ts` | Cinco estilos de entradas automatizadas (terminales, turneros, orbes, mini-bots, portales) e iconos de canal |
| `src/three/hud.ts` + `estilos.ts` | Indicadores en vivo animados (iconos, anillo de SLA, estrellas, XP) y estilos de la ficha y del selector |
| `src/three/modelos.ts` | Modelos: escritorio, silla, monitor, planta, tabique de vidrio, persona y tarjeta de ticket |
| `src/three/grafo360.ts` | Grafo 3D de la Búsqueda 360 (perspectiva, se gira arrastrando) |
| `src/three/comun.ts` | Capa de etiquetas DOM, colores y bucle (respeta `prefers-reduced-motion`) |
| `original/` | Los dos chunks tal como se publicaron, sin parchear |
| `scripts/componentes-vivo.js` | `HUD` y `Ficha` del ticket (React, con los nombres del chunk) que se insertan en «Vista en vivo» |
| `original/` también guarda `comun` y `Torre` sin parchear (encuesta con NPS) |
| `scripts/efecto-*.js` | El código nuevo de cada efecto (JS plano con los nombres minificados del chunk): lo que el chunk le entrega a la escena |
| `scripts/parchear.mjs` | Reemplaza, en esos dos chunks, el efecto que dibujaba el canvas 2D por una llamada a `src/three`. Parte siempre de `original/`; se puede repetir |
| `_v1-descartado/` | Mi primera versión (réplica propia del artifact anterior). Descartada; se conserva por si acaso |

## Cómo está hecho

El artifact solo existe **compilado** (sin fuente ni sourcemaps), así que no se rehízo la app: se parchearon
los dos chunks. Cada gráfico tenía un `useEffect` que dibujaba en un `<canvas>` 2D; se sustituyó por
`montarVivo(...)` / `montarGrafo(...)`, que dibujan con three.js **sobre el mismo canvas** y las mismas refs:

- **Vista en vivo:** el chunk sigue calculando el estado (tickets, SLA, rayo, posiciones interpoladas) y se lo
  entrega a la escena en `obtener()`. La escena devuelve en `hits` la posición en pantalla de cada ticket, y el
  clic del artifact sigue funcionando igual.
- **Búsqueda 360:** el chunk mantiene la vista, los pulsos y los nodos encendidos; la escena los dibuja y escribe
  en `pos` la posición en pantalla de cada nodo (lo que usan el clic y el hover originales).
- Los colores salen de los mismos tokens `--aybar-*` que leía el 2D, así que siguen el tema y la paleta
  elegidos en «Apariencia». Las etiquetas son DOM (texto real), no píxeles.

## Para cambiar un gráfico

Edita `src/three/*.ts` y corre `npm run build:three`. Si el artifact se vuelve a publicar con otros hashes,
`parchear.mjs` avisa («no encuentro el efecto del canvas») y hay que actualizar los marcadores y `original/`.

## Límites

- Solo se parchearon esos dos gráficos; las demás pantallas siguen siendo el bundle compilado.
- `escenas-three.js` pesa ~700 kB (three.js completo); sin code-splitting.
- Con `prefers-reduced-motion` las escenas se redibujan cada 400 ms, sin giro automático ni pulsos.

## Vista en vivo: rediseño «oficina de atención»

- **Identidad:** de planta industrial a oficina: canales de entrada con operadores, mesa de orquestación con panel de
  colas, 6 salas de vidrio con puestos (escritorio, monitor, silla, planta) y personas, sala de comité con mesa y
  zona de cierre. Muros bajos de maqueta, baldosas y pasillos señalizados.
- **Tickets:** tarjetas con franja del color del área y LED de SLA que viajan por los pasillos con arco y rebote al
  aparecer. Se apilan en la bandeja, en la cola frente a cada sala y sobre el puesto de quien los atiende.
  El rayo es un relámpago 3D que gira con resplandor; el SLA en riesgo o vencido late más rápido cuanto más urgente.
- **Personas:** teclean cuando atienden, respiran y miran alrededor cuando están libres; dos supervisores pasean por
  los pasillos. Pasar el cursor por una persona muestra su nombre.
- **Cámara y luz:** isométrica, con sombras suaves, deriva lenta y paralaje con el cursor.
- **Accesibilidad:** con `prefers-reduced-motion` no hay vuelos, rebotes, paseos ni paralaje: los tickets saltan a su
  lugar y la escena se redibuja cada 400 ms. La tabla equivalente del artifact sigue debajo.

## Segunda ronda: robots, ficha, indicadores

- **Robot orquestador** en la bandeja: ordena tarjetas con los dos brazos, gira la cabeza hacia la bandeja de entrada y
  trabaja más rápido cuanto más hay en espera; tarjetas holográficas orbitan a su alrededor.
- **Entradas automatizadas** en lugar de operadores humanos: 5 estilos para elegir con el selector «Entradas» (o con
  `?entradas=terminal|dispensador|orbe|minibot|portal`). Al llegar un ticket el ente reacciona (pulso, papel, saludo…).
- **Ficha del ticket:** al tocar un ticket se abre una ventana en la escena con número, estado, SLA con barra, canal, tipo,
  área, etapa, responsable, cliente, recorrido y acciones (abrir el ticket, Consulta 360, Rayo si el rol puede). Se cierra con
  la X o con Escape. En pantallas estrechas se muestra como hoja inferior.
- **Indicadores en vivo:** iconos, anillo de SLA con la marca de la meta (90 %), estrellas de CSAT, barra de XP con racha,
  sparkline de tickets activos y retroalimentación de cada cambio (cuenta hacia el valor, destello, chip con la diferencia,
  chispas al subir de nivel). Respetan `prefers-reduced-motion`.

Las decisiones que quedan abiertas están en `DECISIONES.md`.

## Tercera ronda: P1 y P2 del NPS

- **Vista en vivo:** panel «Tickets por estado» (los 7 estados del flujo) y tarjeta de NPS.
- **Encuesta con NPS (0–10):** la respuesta admite `nps`; la Torre de Control muestra el NPS por tipo, área, gestor y resultado del cierre.
- Detalle, límites y lo que sigue pendiente: `DECISIONES.md` §4.
