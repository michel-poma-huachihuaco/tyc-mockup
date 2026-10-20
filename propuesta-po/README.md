# propuesta-po · «Prototipo Aybar Atiende · what-if PO» en local

El artifact `claude.ai/artifact/JN561TDhgAeMtwBEm2SgeR` (prototipo React con la propuesta del PO), traído a
esta carpeta como código local, con **dos cambios**: los gráficos de **Vista en vivo** y de **Búsqueda 360**
(el grafo de la consulta 360) ya no son canvas 2D, sino escenas **three.js**. Todo lo demás es el artifact tal cual.

```
cd propuesta-po
npm install
npm start              # parchea los chunks, compila las escenas y Mi Portal, y sirve http://localhost:5180
```

Rutas (hash): `#/vivo` (Vista en vivo) y `#/clientes/cli-001` (Búsqueda 360 del cliente). Desde la v1.3, también
`#/portal` (Mi Portal del cliente; ver «Cuarta ronda»).

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
| `src/portal/*.ts` | **v1.3** · Mi Portal del cliente (HU-064, 065 y 066): `vistas.ts` (pantallas), `modelo.ts` (reglas, sin React), `kit.ts` (React y componentes del artifact), `estilos.ts`, `tipos.ts`, `externos.d.ts` |
| `artefacto/assets/mi-portal.js` | **Generado** por `npm run build:portal` (`vite.portal.config.ts`) desde `src/portal/`. No trae React: usa el de los chunks |
| `scripts/nucleo-portal.js` | **v1.3** · Lo que el chunk `comun` le presta a Mi Portal (estado, transacción, SLA, flujo, transiciones). `parchear.mjs` lo añade al final del chunk |
| `scripts/probar-portal.mjs` | **v1.3** · `npm run probar`: un caso por criterio de aceptación de HU-064, 065 y 066, en Node, contra el chunk ya parcheado |
| `scripts/recorrer-navegador.mjs` | **v1.3** · `npm run recorrer`: recorre el mockup en Chrome sin interfaz (con el servidor arriba), guarda capturas y falla ante cualquier error o texto de la Etapa 2 |
| `scripts/etapa1.js` | **v1.3** · Limpia la semilla de lo que es de la Etapa 2 (incidencia de ciudad y estado de UrbeMind). `parchear.mjs` lo añade al final de `comun` |
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

## Cuarta ronda: v1.3 (16-oct)

Fuente: los documentos v1.3 del PO (Eddie Huamaní, 16-oct-2026): PLT-04 (62 historias de la Etapa 1, con las nuevas
HU-ATC-064 a 067) y PLT-01 (plan: la Etapa 1 va del 21-oct al 03-nov; NEXUS, DAEDALUS y UrbeMind pasan a la Etapa 2,
del 04-nov al 15-dic). **El mockup muestra solo la Etapa 1:** lo que el plan deja para la Etapa 2 no se marca, se quita de
la vista (y donde el plan dice cómo opera la Etapa 1 mientras tanto, se muestra eso).

### Qué cambió y cómo verlo

| Cambio | Qué viene del PO (v1.3) | Qué es decisión de diseño de esta ronda | Cómo verlo |
|---|---|---|---|
| **Mi Portal · Mis tickets** (HU-064 CA-02) | Historia y criterios: solo los tickets del cliente, con número, tipo, estado, área y fecha de compromiso, del más reciente al más antiguo | Tabla en escritorio y tarjetas en móvil; aviso «Un ticket te necesita»; columna «Registrado» | Herramientas › Ver como › Cliente convocado (Mi Portal) › «Mis tickets», o `#/portal` |
| **Mi Portal · Acceso** (HU-064 CA-01) | DNI y código enviado al correo o al celular (el inicio de sesión con NEXUS queda fuera de alcance) | Código de 6 dígitos al correo y al celular, 5 min, 3 intentos; se muestra en pantalla (simulación) y hay «clientes de prueba» | `#/portal` sin sesión. Ana Inga `95638594` (ticket esperando su respuesta), Pedro Chávez `94805186` (solución por confirmar), María Vargas `94841786` (cliente del 360) |
| **Mi Portal · Nuevo ticket** (HU-064 CA-01, 03, 04 y 05) | Tipo y subtipo guiados, descripción y adjunto; canal «Mi Portal», número y fecha de compromiso según el flujo; datos de SIGDA/TAXON sin registro paralelo; «Reclamo» o «Queja» van al Libro con aviso legal y sin ticket; adjunto de más de 10 MB o formato no admitido se rechaza | Catálogo de tipos y subtipos para el cliente; JPG, PNG o PDF, máximo 3; elegir el lote y derivar de él razón social y línea; prioridad Media; texto del aviso legal | `#/portal/nuevo` |
| **Mi Portal · Detalle** (HU-065 y 066) | Línea de tiempo con fecha y hora, área y compromiso, en el orden de la bitácora; aviso por correo y WhatsApp en cada cambio; sin notas internas ni nombre del gestor; ticket ajeno no se muestra y queda en la bitácora; responder y adjuntar vuelve a «en atención»; confirmar cierra (cierre formal y encuesta); rechazar con motivo reabre; sin respuesta, cierre automático | Estados en voz del cliente (diagrama 6.1 del PLT-04); avisos derivados de la bitácora; cierre automático a los 5 días hábiles, simulado con un botón | `#/portal/ticket/tk-272` (Ana: responder), `#/portal/ticket/tk-308` (Pedro: confirmar o rechazar), `#/portal/ticket/tk-1` con Ana (ticket ajeno) |
| **Etapa 2 fuera de la vista** | UrbeMind (FT-ATC-11, HU-017 y 018) sale de la Etapa 1: «sin incidencias de ciudad en ATC»; identidad, roles y líderes locales (ADR-09; NEXUS después); la consulta 360 va sin DAEDALUS | Fuera del menú «Integración UrbeMind» y `#/urbemind` lleva al inicio sin cargar su pantalla; fuera el tipo «Incidencia de ciudad» de todos los selectores y la línea «Servicios de ciudad»; de la semilla, el ticket de incidencia de ciudad con sus políticas SLA, llamadas y eventos de UrbeMind; en Mi día y en «Ver como», «maestro local de ATC» sin nombrar NEXUS. DAEDALUS no aparece en ninguna pantalla | `#/urbemind` (redirige a `#/vivo`), `#/nuevo` (tipos y líneas), `#/configuracion` y `#/politicas` (sin incidencia de ciudad), `#/midia` (pestañas Equipo y Correos) y Herramientas › Ver como |
| **Vista en vivo** (HU-067) | Criterios del visor 3D | Lo pequeño que faltaba: cada sala dice «n en cola · ocupados/total»; tabla «Por área»; la ficha del ticket suma las asignaciones y el CSAT si está cerrado; la bitácora suma las alertas de SLA vencido; los tickets de Mi Portal entran por la compuerta de Mi Portal | `#/vivo` (bajar a «Vista en vivo») |

Lo que no se hizo y queda abierto, con su porqué: `DECISIONES.md` §5.

### Cómo está hecho

- **Mi Portal es fuente propia** (`src/portal/`, TypeScript) compilada a `artefacto/assets/mi-portal.js` con
  `vite.portal.config.ts`. Los chunks del artifact quedan como externos (`aybar:comun`, `aybar:FormField`…) y se reescriben a
  su archivo real: React es el de `comun` (misma instancia, los hooks funcionan) y los componentes son los del sistema de
  diseño del artifact (botón, campo, tabla, tarjetas, alertas, subida de archivos), con los tokens `--aybar-*`, así que siguen
  el tema claro u oscuro y la «Apariencia».
- **Las reglas no se duplican.** `scripts/nucleo-portal.js` se añade al final de `comun` y exporta `__ptNucleo`: estado,
  transacción simulada, SLA congelado, flujo por tipo (HU-043), transiciones y encuesta al cerrar. `src/portal/modelo.ts`
  compone esas funciones (las mismas de la consola) y se prueba en Node con `npm run probar`.
- **Entrada:** el parser de rutas de `comun` reconoce `#/portal`, `#/portal/nuevo` y `#/portal/ticket/<id>`; el shell carga
  Mi Portal bajo demanda; el rol Cliente ve «Mis tickets» y «Nuevo ticket» en su navegación, junto a «Buses del Entrega Fest»
  (y la redirección del rol lo deja entrar). Con otro rol, `#/portal` también abre, con un aviso de «Vista del cliente».
- Lo que la consola ve: el ticket nuevo sale con canal «Mi Portal», sin responsable o asignado por el flujo; las respuestas
  del cliente son «Mensaje del cliente · Mi Portal»; confirmar o rechazar queda en el historial de estados.
- **Etapa 2:** el menú, la ruta y los textos se parchean en los chunks (`parchear.mjs`); la semilla se limpia con
  `scripts/etapa1.js`, que se añade al final de `comun` y filtra lo que cuelga del tipo de incidencia de ciudad después de
  generarla (así no cambia ningún otro id de la semilla). La pantalla de UrbeMind sigue en `artefacto/` (es del PO), pero nada
  la enlaza ni la carga. En los comentarios del código sí quedan las referencias.
- **Accesibilidad:** cada campo con su etiqueta y su error asociados (componentes del artifact), regiones con nombre, la línea
  de tiempo como lista ordenada con el paso actual marcado, foco visible, sin animaciones propias (nada que reducir con
  `prefers-reduced-motion`; la Vista en vivo ya lo respeta). Probado a 390 px sin desplazamiento horizontal.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | `npm run build` y `vite preview` en el puerto 5180 |
| `npm run build` | `parchear` + `build:three` + `build:portal` (reproducible desde `original/`, `scripts/` y `src/`) |
| `npm run build:portal` | Solo Mi Portal (`src/portal` → `mi-portal.js`) |
| `npm run probar` | 14 casos en Node: uno por criterio de HU-064, 065 y 066, más el acceso |
| `npm run recorrer` | Con el servidor arriba: 17 pasos en Chrome sin interfaz (Mi Portal, Vista en vivo, tema claro y oscuro, 390 px, menos movimiento, y que no se vea nada de la Etapa 2: menú de seis roles, `#/urbemind`, 31 pantallas por rol con sus pestañas, selectores, notas y herramientas, y Mi Portal). `CHROME=…` si Chrome no está en `/Applications` |

## Quinta ronda: los criterios del PLT-04 v1.3 (20-oct)

Se cerraron, criterio por criterio, las tres prioridades del PO (HU-043, 050 y 067) y las garantías postventa (HU-034, 035 y
036). Con eso, la cobertura de la Etapa 1 queda en **50 historias completas y 12 parciales**
(`documentacion/cobertura-v1.3.md`). Solo se hizo lo que pide cada criterio. Los supuestos y las preguntas para el PO están en
`DECISIONES.md` §5.7.

| Historia | Cómo verlo |
|---|---|
| **HU-043** · Flujos por tipo, subtipo y área | Ver como › Administrador funcional › Configuración › Flujos («Nuevo flujo», «Nueva versión», «Bitácora de publicaciones», pestaña Alertas). Después, Nuevo ticket con tipo «Reclamo» y subtipo «Garantía postventa» y, en el detalle del ticket, «Actividades del flujo» › «Cerrar la actividad» |
| **HU-050** · Consulta 360 dentro del ticket | `#/ticket/tk-460` › pestaña Cliente: ficha con «Datos visibles n de 16», panel del dato con fecha, candados (cambia de rol en «Ver como»). Para la excepción, busca `12345678`. Para la nota de la consulta, mira la pestaña Interacciones |
| **HU-067** · Operación en vivo | `#/vivo`: cajas del color de su tipo; toca un área o su nombre en «Por área»; selector de razón social; pausa y velocidad (x1, x2) solo con el modo simulación (Herramientas › Simulación › Operación en vivo) |
| **HU-034, 035 y 036** · Garantías | `#/garantias/gar-249` (motivo informado al cliente), `#/garantias/gar-585` › «Registrar la inspección» (varias fotos y PDF), `#/garantias/gar-314` › «Registrar carta notarial» |

| Archivo nuevo | Qué es |
|---|---|
| `scripts/hu043-modelo.js` | Modelo de flujos (sufijo de `comun`, exporta `__h43`): clave, versiones, aplicar al ticket, actividades, SLA y alerta «sin flujo» |
| `scripts/hu043-configuracion.js` y `hu043-detalle.js` | Diálogo de Configuración › Flujos y tarjeta «Actividades del flujo» del detalle |
| `scripts/consulta360.js` | Ficha y excepción de cliente no encontrado de la Consulta 360 (sufijo de `Grafo360`) |
| `scripts/garantias.js` y `garantia-ui.js` | Aviso al cliente, carta notarial (modelo) y carga de varias evidencias (pantalla) |
| `scripts/probar-flujos.mjs`, `probar-consulta360.mjs`, `probar-garantias.mjs` | Pruebas en Node, una por criterio |
| `scripts/recorrer-flujos.mjs`, `recorrer-consulta360.mjs`, `recorrer-operacion-vivo.mjs`, `recorrer-garantias.mjs` | Recorridos en Chrome sin interfaz |
| `documentacion/` | Copia de consulta de los documentos del PO v1.3, del paquete Definir de Dev 1 y de la cobertura (ver su README) |

| Comando | Qué hace ahora |
|---|---|
| `npm run probar` | 40 casos en Node: Mi Portal (14), flujos (9), Consulta 360 (7) y garantías (10) |
| `npm run recorrer` | Con el servidor arriba: 49 pasos en Chrome. Son el recorrido general (17), flujos (7), Consulta 360 (10), Operación en vivo (9) y garantías (6) |
