# Auditoría UI/UX: Aybar Atiende (consola ATC)

22-10-2026, rama `prototipo-polar`. Solo lectura; no se ha cambiado código.
Alcance: las ~20 vistas de `src/app/pantallas/atc/`, el shell (`consola-atc.ts`), el ingreso, `src/styles.css` y
las escenas 3D (`three/`). Design system: `@aybarcorp/ui-angular` y `@aybarcorp/tokens` 0.3.0.
Método: cuatro revisiones de código por dimensión más un recorrido visual en navegador con 45 capturas
(claro, oscuro y móvil 390 px, perfil Supervisor). El orquestador verificó en código y capturas los
hallazgos marcados con ✔.

Abreviaturas: `esp` = `vista-especializada.ts`, `op` = `vista-operacion.ts`, `c360` = `vista-c360.ts`,
`vivo` = `vista-vivo.ts`, `con` = `consola-atc.ts`.

---

## 1. Defectos (se ven mal o no funcionan hoy)

| # | Defecto | Evidencia | Corrección |
|---|---|---|---|
| D1 ✔ | **4 tokens que no existen** en el design system: `--aybar-space-7`, `--aybar-duration-fast`, `--aybar-ease-standard`, `--aybar-motion-duration-normal`. Esas declaraciones son inválidas: el botón de cierre de la ficha flotante y el icono Rayo no tienen tamaño fijo, y varias transiciones no se ejecutan | `styles.css:1224-1225`, `:1571-1572`, `:1580-1583`, `:1185`, `:1369` | Usar `--aybar-space-8`, `--aybar-motion-duration-*` y `--aybar-motion-easing-standard` |
| D2 ✔ | **El FAB de Configuración** (engranaje, abajo a la izquierda) **tapa el sidebar**: cubre «Torre de Control CX» a 1440×900 | captura `torre-oscuro-1440` | Moverlo al pie del sidebar |
| D3 ✔ | **El bot flotante y su globo tapan contenido**: la acción «Editar» en Políticas, el último hito de Tu día, «Copiar frase» en EntregaFest y KPIs en móvil | `politicas-oscuro-1440`, `tudia-oscuro-1440`, `vivo-oscuro-390` | Reservar espacio al pie del contenido; globo que se oculta solo |
| D4 | **Etiquetas del grafo 3D cortadas y solapadas** («Acta de entreg», «Repositorio S3 / GL»; «Motor de Consultas» pisa a otra etiqueta); en móvil son enormes | `c360-grafo3d-oscuro-1440`, `c360-oscuro-390` | Ajustar las etiquetas a los bordes del canvas, evitar que se pisen y escalarlas con el viewport |
| D5 | **Planta 3D de Operación en Vivo ilegible en móvil**: las etiquetas de salas se amontonan | `vivo-oscuro-390` | Bajo 600 px, mostrar una lista de salas en lugar de etiquetas 3D |
| D6 | **Tablas recortadas sin pista de scroll**: «Ver ticket» cortado en Bandeja, «Expediente» en Tu día; SGD muestra 4 de ~7 columnas | `bandeja-oscuro-1440`, `sgd-oscuro-1440` | Contenedor de tabla estándar (§4.2) |
| D7 | **Texto ilegible en tema claro**: la píldora de selección de la planta lleva fondo mandarina y texto `#f6f6f6` (contraste 1,8:1). Los chevrones de pasos en Configuración, con «2 · 40 h» blanco sobre fondo claro, también se leen mal | `three/vivo.ts:957`; `configuracion-claro-1440` | Texto `--aybar-color-fg-on-accent`; tokens por estado de paso |
| D8 | **Códigos internos visibles**: `UNDER_REVIEW`, `REJECTED`, `FIRST_RESPONSE_AT_RISK`, `DERIVACION_CONFLICTO_EJE3`, `REASSIGNMENT_CESE` | `garantias`, `alertas`, `modal-derivar`, `modal-reasignacion` | Mapa de etiquetas es-PE en un único fichero |
| D9 | **Salto de 15 px** del contenido y de la cabecera entre vistas con y sin scrollbar | `ingreso-proy` frente a `bandeja` | `scrollbar-gutter: stable` |
| D10 | **`prefers-reduced-motion` a medias**: animaciones `v3-arriba`, `v3-msg` y el «escribiendo» infinito del bot, y transiciones globales sin cubrir; cuatro comprobaciones `matchMedia` copiadas por separado | `styles.css:1411`, `three/estilos.ts:161-460`, `asistente-bot-atc.ts:94` | Regla global y un helper TS único |
| D11 | **Foco visible ausente** en botones propios (`.pt-usuario__btn`, `.pt-bot__btn`, filas de herramientas, favoritos) y **cuatro estilos de anillo distintos** | `celda-ticket.css:19`, `monitor-vivo.css:10`, `vista-c360.ts:458` | Una sola regla global `:focus-visible` |
| D12 | **IDs de ticket partidos en dos líneas** («ALT-/001204») | `evento-oscuro-1440`, `sgd-oscuro-1440` | `white-space: nowrap` en la celda de ticket |
| D13 | Consola: avisos de WebGL (`texImage3D FLIP_Y`, ×4) y campos de formulario sin `id`/`name`; `label for` incorrecto | recorrido visual | Ajustar texturas y campos |

---

## 2. Inconsistencias por dimensión

### 2.1 Componentes iguales que se ven distintos entre pantallas
- **Celda de ticket, 7 variantes**: número mono más botón «Ver ticket» (Bandeja); `app-celda-ticket` (solo Cierre); botón ghost con el número (Alertas, Libro); texto sin enlace (UrbeMind, morosidad, evento, encuestas); «Ticket X» en texto plano (Garantías). `op:183`, `esp:832`, `esp:708`, `esp:975`, `esp:1619`.
- **Estado del ticket con distinto tono y texto**:
  - En Bandeja, resuelto va en success; en Tu día va en info.
  - «Espera cliente» va en warning en Vivo y en info en Operación.
  - `IN_PROGRESS` se lee «En atención» en una pantalla y «En curso» en otra. `op:248`, `op:613`, `vivo:1218-1224`.
- **Prioridad y SLA**: el ternario de tonos está copiado (`op:193`, `op:564`) y hay tres funciones distintas de SLA y plazos (`evaluarSla`, `tonoSlaBadge`, plazos del Libro).
- **KPIs, cuatro diseños**:
  - Vivo: `div` propio con alturas de unos 145 px.
  - Tu día: alturas desiguales.
  - Alertas, Cierre y Morosidad: separación de unos 9 px.
  - Torre: separación de unos 20 px.
  - Monitor: un lenguaje visual propio.
- **Cards**: se mezclan `variante="default"`, `superficie="solid"` y `elevated` sin criterio. El título de sección se monta a mano en c360 y vivo; en el resto se usa `ay-card-header`, con niveles h2, h3 y h4 sin regla.
- **Filtros y paginación**: solo 4 de 25 tablas siguen `ESTANDAR-FILTROS-TABLAS.md` (Bandeja, Tu día > acciones, Cierre y catálogo de HU). Solo la Bandeja pagina. Libro, SGD, Garantías, morosidad y UrbeMind no tienen filtros.
- **Estados vacíos**: unas tablas usan `app-vacio-filtros`, otras `ay-empty-state` con texto propio y unas 15 tablas no declaran ninguno.
- **Acceso restringido (403)**: hay 5 copias a mano y c360 usa un `ay-alert`. El design system trae `ay-error-403` y no se usa. Solo Nuevo ticket avisa de «intento registrado en auditoría».
- **Modales**: no comparten estructura de pie. Los de solo lectura no tienen botón de cierre. El texto de introducción va en `xs` en esp y en `sm` en op. **El modal de Reasignación masiva está duplicado** (`op:306` y `op:1279`).
- **Botones de cabecera**: «+ Nuevo ticket», «+ Registrar nuevo ticket», «+ Ticket» y «+ Crear ticket al cliente» hacen lo mismo. El detalle llega a tener 6 botones con 3 variantes. «← Volver a…» se hace con un botón en lugar de la ranura `ayRuta` del `ay-page-header`.
- **Botón de fila**: «Ver ticket» (secondary), «Abrir ticket» (ghost) y «Ver» (primary).
- **Paneles laterales**: el `ay-drawer` de Vivo y la ficha flotante hecha a mano de c360. Existe `ay-side-panel`.
- **Piezas hechas a mano con equivalente en el design system** (verificado en `@aybarcorp/ui-angular`):

  | Pieza a mano | Equivalente |
  |---|---|
  | botón favorito, cierre de ficha | `ay-button`, `ay-icon-button` |
  | Rayo | `ay-toggle-button` |
  | filas de herramientas | `ay-lista-menu` |
  | FAB | `ay-fab` |
  | movimientos e ingresos de hoy | `ay-timeline` |
  | pasos de flujo | `ay-stepper` |
  | KPIs | `ay-stat-group` |
  | acciones de fila | `ay-button-group` |

### 2.2 Tamaños y espaciados
- **Texto**: `ayText size="xs"` (12 px) aparece **123 veces**, incluido texto de lectura. Hay títulos (`ayText="title" size="xs"`) que miden lo mismo que un metadato. `ay-heading` solo se usa en `sm`, así que no hay jerarquía entre sección y card.
- **Alerts**: 15 en `sm` y 16 en md para el mismo papel de aviso. Todos los de c360 van en md.
- **Controles**: los selects de formulario mezclan sm y md; los filtros globales de `con` van en md.
- **Padding de card**: `sm` y `md` para el mismo tipo de contenido, y 14 cards sin padding explícito.
- **Separación cabecera → contenido**: depende de si sigue un grid `sm` (24 px), uno `md` (32 px), un alert o una card. Se nota al cambiar de vista.
- **Botones**: 118 en `sm` y 18 en md (pies de modal). Es coherente, pero no está documentado.
- **Valores fuera de escala**: en `ingreso.ts:62-67`, `6px`, `8px` y `11.5px`. Hay `0.9em`, `calc(bold + 100)`, radios `8px`/`999px` y medidas como `calc(space-4 * 28.5)` que no se entienden.
- **FABs**: uno mide 46 px y otro 64 px. Los `z-index` (6 y 60) van sueltos, sin escala.

### 2.3 Paleta y contraste
- **Los tokens del sistema cumplen WCAG**: el paquete certifica 112 pares texto/fondo. Los fallos vienen del uso fuera de esos pares.
- **Un mismo significado con varios tonos**:

  | Significado | Hoy | Debe ser |
  |---|---|---|
  | Escalado / comité | danger (vivo, op, esp) · warning (movimientos 360) | danger |
  | Simulado | neutral (360) · warning (morosidad) · info (`con`) | uno solo (decisión) |
  | Urgente / Rayo | warning, igual que «en riesgo» | distinguirlo (icono ⚡ más texto, o `accent`) |
  | En riesgo frente a vencido en la planta 3D | mismo rojo, distinto solo por la velocidad de pulso | color más forma |
  | Riesgo de puntaje | dos barras con umbrales distintos para el mismo valor (`esp:1573-1577`) | una sola escala |

- **`info` usa la misma rampa que la marca**: un badge info y uno brand se ven iguales. El tipo de ticket va en info (`celda-ticket.ts:28`).
- **Colores fuera del sistema**:
  - El grafo 3D (`three/grafo360.ts:103-115`) tiene RGB fijos: rojo `#ff5252` frente a danger `#e15a4e`, ámbar `#f59e0b` frente a warning `#b88100`, cian, esmeralda y violeta.
  - El canvas 2D (`c360:2279-2536`) tiene unos 35 `rgba()`.
  - `escena-*-3d.ts` lleva unos 190 literales, pero es código muerto.
- **Riesgos de contraste**:
  - `primary-700` como zona de canal en la planta oscura: 1,52:1.
  - Rellenos `*-500` sobre suelo claro: entre 2,57 y 2,97:1.
  - Nodo «apagado» del grafo: 1,93:1.
  - Etiquetas 3D de 10 a 11,5 px sobre fondo con transparencia 0,8.
  - Estado indicado solo por color en nodos y en `colorPunto`.
- **Tema claro**: el sidebar y los canvas se quedan oscuros mientras la cabecera y el contenido pasan a claro, con lo que hay tres planos de contraste. El acento del ítem activo cambia de turquesa (oscuro) a mandarina (claro). Hay que decidirlo y documentarlo.

### 2.4 Alineación y layout
- **Cabecera de página**:
  - «Añadir a favoritos» va en texto diminuto, 10 px a la derecha del título y con unos 70 px de aire encima.
  - El badge junto al título mide unos 11 px, va con el tracking apretado y en el detalle salta de línea.
  - La línea bajo la descripción baja según tenga 1 o 2 líneas.
  - `styles.css:1143-1150` cambia el `ay-page-header` de forma global, y las pestañas no comparten borde izquierdo con el título.
- **Sidebar**:
  - Los ítems de dos líneas («Consulta 360 del Cliente», «Bandeja de tickets», «Libro de reclamaciones») rompen el ritmo, y el ancho cambia tras buscar un cliente.
  - El override de tema claro está duplicado en dos bloques idénticos (`styles.css:1092-1120`).
  - El engranaje se monta sobre el último ítem (D2).
- **Cards**:
  - En la Consulta 360, el chip «En línea» salta de línea en unas tarjetas y no en otras, así que el contenido empieza a distinta altura.
  - El panel «Últimos movimientos» no sigue la altura del grafo.
  - El editor de pasos alinea los campos por la base (`align-items: end`).
- **Tablas**:
  - La columna «Estado» va alineada a la derecha en unas tablas y a la izquierda en otras. Las numéricas (deuda, personas, versión, horas) no se alinean a la derecha.
  - La columna de acciones mide entre 7 y 16,5 rem.
  - c360 es la única tabla con anchos en `%`.
- **Breakpoints**:
  - Hay 4 valores escritos a mano (1279.98, 1023.98, 767.98 y 639.98) más un `1100px` suelto en c360.
  - Hay `100vh` en los paneles flotantes y `100dvh` en el shell.
- **Ancho de contenido**: las tablas se estiran sin límite, mientras los formularios y las descripciones se cortan a unos 720 px.

### 2.5 Textos, iconografía, accesibilidad y estados
- **Mayúsculas**:
  - Title Case: «Bandeja de Tickets», «Tu Día», «Torre de Control CX», «Fecha de Pago».
  - Oración: «Políticas SLA», «Reasignar en bloque», «Nuevo ticket».
  - Dentro de una misma tabla se mezclan los dos.
- **Glosario**: ticket (~400 apariciones), caso (110) y solicitud (11) para la misma cosa. Inglés visible: «Cierre end-to-end», CSAT frente a «Calificación». La cabecera de acciones se llama «Acción», «Acciones» o «Expediente».
- **Verbos de salida sin norma**: Cerrar, Salir, Volver, Descartar, Cancelar y «Cancelar reserva» (esta tiene sentido de negocio). «Cerrar sesión» aparece dos veces, con estilos distintos.
- **Iconos**: el sprite (`public/iconos-menu.svg`) solo cubre el sidebar. El resto son glifos unicode (✕, ♥, →, ←, ›), que cambian de peso y alineación según el sistema, y SVG en línea copiados (rayo, herramientas, ingreso).
- **Estados**:
  - No hay patrón de carga (`ay-skeleton`, `ay-spinner`) ni de error en ninguna vista.
  - «Sin permiso» se resuelve de tres maneras.
  - Operación en Vivo no tiene estados vacíos.
  - Los KPIs de Tu día son números fijos (`op:383-445`).
- **ARIA**:
  - `aria-live` solo aparece en 2 sitios; falta en el Monitor, que cambia cada 5 s, y en los avisos de guardado.
  - El favorito cambia su texto y además lleva `aria-pressed`, así que se lee el estado dos veces.

---

## 3. Lo que ya está bien (no tocar)
- Los colores de `styles.css`, los CSS de la carpeta y `ingreso.ts` son 100 % tokens. Solo los canvas usan literales.
- `ay-page-header` está en todas las vistas, con título y descripción. Las tablas usan `ay-table` con leyenda y filas alternas.
- La raíz de cada vista usa `ayStack gap="6"` en todas.
- Botones de tabla y barra en `sm`, pies de modal en md: coherente.
- No hay scroll horizontal de página en móvil (390 px).

---

## 4. Patrones consolidados (estándar propuesto)

### 4.1 Estructura de un módulo
```
ay-page-header
  [ayRuta]      breadcrumb, solo en vistas de detalle (sustituye «← Volver a…»)
  titulo        frase, sin Title Case
  descripcion   1–2 líneas, máx. ~72 caracteres por línea
  [ayEstado]    máx. 1 badge de recuento (info) + 1 de alarma (warning/danger, solo si > 0)
  [ayAcciones]  máx. 1 primary + 1 secondary; el resto en ay-dropdown-menu; favorito = ay-icon-button ♥
  [ayPestanas]  underline, md
aviso transitorio   ay-toast (no en la página)
aviso permanente    ay-alert size="sm", un solo tono por significado
KPIs                ay-stat-group / app-kpi-card, grid de 4, gap sm, altura mínima fija
secciones           ay-card superficie="solid" + ay-card-header (h2 sección, h3 subsección) + ay-card-body
tabla               app-tabla-seguimiento (§4.2)
modales             al final del template, con app-modal-form
```

### 4.2 Tabla de seguimiento
Card con `ay-card-header`, después `app-barra-filtros` (si hay más de 10 filas o atributos categóricos), después `ay-table`
(leyenda, filas alternas, cabecera fija), después `ayVacio` (con filtros: `app-vacio-filtros`; sin ellos: vacío simple), después
`ay-pagination`. Más:
- Contenedor con scroll horizontal, sombra de desborde y la columna de acciones fija a la derecha. En móvil, tarjetas.
- Alineación: texto, estado y fecha a la izquierda; números y acciones a la derecha, con `tabular-nums`.
- Anchos en rem. La columna de acciones tiene 3 anchos posibles (7, 10 y 14 rem) y siempre se llama «Acciones».
- Celda de ticket: `app-celda-ticket` siempre, con `nowrap`. Abre el expediente.
- Acción de fila: un `ay-button` ghost `sm` «Abrir». Las secundarias van en un menú.

### 4.3 Escala de espaciado (solo estos valores)
| Nivel | Valor |
|---|---|
| Entre secciones de página | `ayStack gap="6"` |
| Entre cards | `ayGrid gap="md"` |
| Entre KPIs | `ayGrid gap="sm"` |
| Dentro de una card | `ay-card-body gap="sm"` (formularios: `md`) |
| Grupos dentro de una card | `gap="3"` |
| Elementos de lista | `ayStack gap="2"` |
| Controles en fila | `ayRow gap="2"` |
| Etiqueta → valor | `ayStack gap="1"` |
| Padding de card | KPI y datos `sm`; formulario y contenido principal `md`; siempre explícito |
| Radios | `radius-md` (controles, cards) y `radius-full` (chips) |

### 4.4 Escala tipográfica por rol
| Rol | Componente |
|---|---|
| Título de página | `ay-page-header` |
| Título de sección | `ay-card-header nivel="h2"` |
| Título de subsección o card | `ay-card-header nivel="h3"` |
| Cuerpo | `ayText="body"` (base; `sm` dentro de tablas) |
| Secundario | `ayText="subtitle" size="sm"` |
| Metadatos (fecha, ID, pista) | `ayText size="xs"`: **solo aquí** |
| ID de ticket | `ayText="mono"`, `nowrap` |

### 4.5 Tamaños de control por contexto
| Contexto | Botón | Input/select | Badge | Alert | Tabs |
|---|---|---|---|---|---|
| Cabecera de página | sm | — | sm | — | md |
| Barra de filtros / fila de tabla | sm | sm | sm | — | — |
| Dentro de card | sm | md | sm | sm | sm |
| Formulario / pie de modal | md | md | — | sm | — |
| Aviso de página (CTI, bloqueo) | — | — | — | md | — |

### 4.6 Paleta: qué color, dónde y cómo
- **Marca (petróleo)**: solo para la acción primaria (una por vista), el foco y los enlaces. Nunca como estado.
- **Mandarina (acento)**: selección y destacado como relleno, con texto `fg-on-accent`. **Nunca como texto ni icono sobre fondo claro** (1,94:1); para texto en claro, `fg-accent`.
- **Semánticos (solo estado)**:
  - danger = vencido, escalado, comité, error, destructivo.
  - warning = en riesgo, restringido, pendiente de validación.
  - success = en plazo, resuelto, cumplido.
  - info = informativo, en curso.
  - neutral = sin estado, cero alertas, tipo o categoría.
- **Neutros**: estructura (fondos, bordes, texto).
- **Pares permitidos**:
  - Sobre una superficie: `fg-default`, `fg-muted` o `fg-subtle`.
  - Badge o alerta: `feedback-X-fg` sobre `feedback-X-bg`.
  - Sobre marca: `fg-on-brand`. Sobre acento: `fg-on-accent`.
- **Prohibido**: texto blanco sobre `*-500` o sobre mandarina; `primary-700` como línea sobre fondo oscuro.
- **Cuándo subir el contraste** (líneas, rellenos o iconos que llevan información deben llegar a 3:1 frente a su fondo real):
  - En claro, `*-600` en lugar de `*-500` sobre superficie hundida.
  - En oscuro, `*-300` en lugar de `*-500`, y `primary-300/400` en lugar de `primary-700`.
  - Etiquetas de menos de 12 px sobre un canvas, con fondo opaco (alfa de 0,9 o más).
- **Segundo canal**: todo estado lleva color más icono, forma o texto. En la planta, la línea discontinua indica restringido.
- **Canvas siempre oscuros** (grafo 3D y 2D): colores de un único conjunto «sobre oscuro» en `three/paleta.ts`, no RGB sueltos.
- **Una sola tabla estado → tono y texto** (`estados-ui.ts`), usada por todas las vistas.

### 4.7 Alineación y capas
- Breakpoints: `lg 1024`, `md 768` y `sm 640`; nada más.
- `scrollbar-gutter: stable` en el contenedor de scroll; `dvh` siempre.
- Ancho máximo de contenido común. Anchos con nombre (`--pl-ancho-form`, `--pl-ancho-lectura`, `--pl-ancho-panel`) en lugar de `calc(space-4 * N)`.
- Capas: escala de `z-index` con nombre. El engranaje va en el pie del sidebar, el bot es un FAB único de 56 px y el contenido reserva espacio inferior.
- Sidebar con ancho fijo, una línea con elipsis y tooltip.
- Cabecera de card de altura fija (título, origen y chip en grid).

### 4.8 Textos
- Frase (sentence case) en títulos, cabeceras y botones, salvo siglas y nombres propios.
- Glosario: **ticket** es la unidad operativa; **caso** solo para los sensibles o legales (SGD, Eje 3); **solicitud** solo en Mi Portal (cliente).
- Verbos: **Cerrar** (X de modal o panel), **Volver** (navegación), **Cancelar** (abandonar un formulario), **Cerrar sesión** (una sola vez, en el menú de cuenta).
- Un solo texto «Nuevo ticket». Botones primarios en infinitivo.
- Ningún enum visible: todo pasa por el mapa de etiquetas es-PE.

### 4.9 Iconos, accesibilidad y estados
- Un único sprite (`iconos-menu.svg` ampliado con cerrar, chevron, flechas, corazón y rayo) y un `<app-icono nombre>` común. Fuera los glifos unicode.
- Foco: una sola regla global `:focus-visible` con `--aybar-focus-ring-width` y `border-focus`.
- Movimiento: bloque global `prefers-reduced-motion` y un helper `prefiereMenosMovimiento()`.
- `aria-live`: una región `status` global para avisos; en el Monitor, en los indicadores.
- Estados: `app-estado-carga` (sobre `ay-skeleton`), `app-estado-error` (sobre `ay-alert`), `app-acceso-restringido` (sobre `ay-error-403`) y el vacío de §4.2.

---

## 5. Propuestas

| | Propuesta | Qué incluye | Ficheros | Riesgo | Ejecución |
|---|---|---|---|---|---|
| **A** | **Correcciones críticas** | D1 a D3 y D6 a D13: tokens inválidos, FABs que tapan, píldora y pasos ilegibles, enums visibles (mapa es-PE), `scrollbar-gutter`, movimiento reducido, foco global, `nowrap` de ticket, avisos de consola | `styles.css`, `three/estilos.ts`, `three/vivo.ts`, `consola-atc.ts`, `asistente-bot-atc.ts` y un `etiquetas-es.ts` nuevo | Bajo: no cambia la estructura | 1 ola, 2 agentes |
| **B** | **Fundaciones del estándar** (incluye A) | Tabla `estados-ui.ts` (estado → tono y texto, prioridad, SLA) aplicada en todas las vistas; reglas de tamaños de §4.3 a §4.5 (alerts, selects, padding de card, `xs` solo para metadatos, `ay-heading`/`ay-card-header`); breakpoints y anchos con nombre; textos (frase, glosario, verbos, «Nuevo ticket»); cabecera (favorito como icon-button en acciones, badge legible, `ayRuta` en el detalle); sidebar en una línea; documento `ESTANDAR-UI-ATC.md` | Todas las vistas, en cambios pequeños y mecánicos | Medio-bajo | 2 olas de unos 4 agentes con ficheros disjuntos |
| **C** | **Componentes comunes** (requiere B) | `app-celda-ticket` con modos, `app-badge-estado`, `app-kpi-card` o `ay-stat-group`, `app-tabla-seguimiento` (filtros, vacío, paginación y scroll en las ~25 tablas), `app-modal-form` (y fin del modal duplicado), `app-acceso-restringido`, estados de carga y error, `app-icono`; sustituir las piezas hechas a mano por `ay-*` (timeline, stepper, side-panel, fab, toggle-button) | Todas las vistas; es la refactorización mayor | Medio: toca mucho template | 3 olas: crear componentes, aplicar por vista, limpiar |
| **D** | **Canvas y 3D** (independiente) | `three/paleta.ts` (conjunto «sobre oscuro», fin de unos 60 literales), etiquetas que no se pisen ni se salgan del grafo, lista de salas en móvil, segundo canal de estado (forma o icono), contraste de nodos y zonas; borrar `escena-astra-3d.ts` y `escena-oficina-3d.ts` | `three/*`, `vista-c360.ts` (canvas 2D), `vista-vivo.ts` | Medio: lógica de render | 1 ola, 2 agentes (grafo / planta) |
| **E** | **Solo documentar** | Publicar §4 como `ESTANDAR-UI-ATC.md` y aplicarlo cuando se toque cada pantalla | 1 documento | Nulo | 1 agente |

**Recomendación:** **A y D ya**, porque arreglan lo que hoy se ve roto y tocan ficheros distintos, así que pueden ir en paralelo. Después **B**, y luego **C por olas**, vista por vista, con verificación visual en cada ola. **E** queda absorbida en B.

### Estado de ejecución
**Olas A y D aplicadas (22-10-2026)**, sin commit. Verificado con `ngc`, `ng build`, `npm test` (75/75, sin
fallos) y `oxlint` (los mismos 11 avisos previos). En navegador (claro, oscuro y 390 px) la consola queda sin errores.

| ID | Estado | Nota |
|---|---|---|
| D1 | Hecho | Tokens reales |
| D2 | Hecho | Engranaje en el pie del sidebar; en móvil, en el pie del menú lateral |
| D3 | Hecho | Espacio inferior reservado, FAB del bot de 56 px, el globo se oculta solo |
| D4 | Hecho | Etiquetas del grafo dentro del canvas y sin pisarse; se reducen en pantallas estrechas |
| D5 | Hecho | Lista de salas bajo 600 px |
| D6 | Hecho (CSS) | Columna de acciones fija a la derecha; el scroll y las sombras los trae `ay-table` |
| D7 | Hecho | Píldora con `fg-on-accent`; chevrones de pasos con par invertido |
| D8 | Hecho | `etiquetas-es.ts`, fuente única (incluye los nombres de área) |
| D9 | Hecho | `scrollbar-gutter: stable` |
| D10 | Hecho (CSS) | El helper TS único para `matchMedia` queda para B |
| D11 | Hecho | Foco global `:where(...)`; anillos locales eliminados |
| D12 | Hecho | `.atc-id-mono` y `nowrap` en la celda de ticket |
| D13 | Hecho | `nombre` en los campos; aviso de WebGL resuelto |
| Paleta del grafo | Hecho | `three/paleta.ts`; el estado se marca con borde, patrón y glifo además del color |
| Planta | Hecho | Zonas y estados con contraste por tema; LED con forma por estado; Legal en grafito |
| Avisos de datos simulados | Quitados | |
| Código muerto | Borrado | `escena-astra-3d.ts`, `escena-oficina-3d.ts` |

Queda para B: el sidebar en una sola línea; el ítem activo del menú móvil en mandarina (hoy usa el estilo
del design system); la separación de 70 px entre el botón Favorito y el título; los textos y la tabla
de estados.

### Decisiones (22-10-2026)
1. **Sidebar oscuro en ambos temas** (decidido): sirve para diferenciar el sidebar del `<main>` por contraste. Se documenta como regla y no se toca.
2. **Acento del ítem activo: mandarina** en ambos temas (decidido). En oscuro hoy es turquesa.
3. **Tono de «Simulado»**: pendiente (ver explicación en la conversación).
4. **Rayo ≠ en riesgo** (decidido): Rayo significa rapidez o prioridad del ticket; «en riesgo» es un estado del SLA. Deben verse distintos. Propuesta: Rayo = icono ⚡ + texto, tono `accent` (mandarina); en riesgo = tono `warning` (ámbar) + icono de reloj + texto. Por confirmar.
5. **`info` sigue igual a la marca** (decidido): no se pide una rampa nueva. Regla: `info` solo para mensajes informativos; lo que es tipo o categoría (p. ej. el tipo de ticket en `celda-ticket.ts:28`) pasa a `neutral`.
6. **«Morosidad 3 meses»** en el menú: en espera, junto con la regla de morosidad.
