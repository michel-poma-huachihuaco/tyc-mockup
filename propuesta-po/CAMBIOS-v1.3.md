# propuesta-po · cambios para la v1.3 (Etapa 1)

Rama `feature/AYB-0001-propuesta-po-v1-3`, hija de `main` (`d42d81e`). Preparada el 19-oct-2026 por Brayan Hurtado (Dev 1) con asistencia de IA (Claude) y ampliada el 20-oct (secciones 4 y 5). Pendiente de revisión del dueño del repositorio y de validación del PO.

## Por qué

El PO publicó el 16-oct-2026 la versión **v1.3** de los documentos ATC (PLT-01 a PLT-05) y del Excel de requerimientos. Lo que cambia para este mockup:

- **La Etapa 1** es el desarrollo del mié 21-oct al mar 03-nov: 11 épicas, 23 funcionalidades y **62 historias**.
- **La EP-ATC-06 se redefine** como autogestión del cliente en **Mi Portal** (FT-ATC-24, HU-ATC-064, 065 y 066). Antes era la integración con UrbeMind.
- **Entra el visor del proceso en 3D** (FT-ATC-25, HU-ATC-067, prioridad 3). Se apoya en la «Vista en vivo» de este mockup.
- **Las integraciones con NEXUS, DAEDALUS y UrbeMind salen de la Etapa 1.** En la Etapa 1 la identidad usa usuarios, roles y líderes locales de ATC (ADR-09).

El mockup tenía lo de la v1.2: no tenía Mi Portal y mostraba UrbeMind, NEXUS y DAEDALUS como si estuvieran en el plan. **Por indicación del equipo, el mockup muestra solo la Etapa 1.** Lo que no es de la Etapa 1 se quitó de la vista, no se marcó.

## Qué se agregó

### 1. Mi Portal del cliente (HU-ATC-064, 065 y 066)

Pantallas nuevas, con el «Como / quiero / para» y los criterios de aceptación del PLT-04 v1.3:

| Pantalla | Ruta | Historia |
|---|---|---|
| Acceso con DNI y código de un solo uso (en el prototipo, el código se muestra en pantalla) | `#/portal` | HU-064 · ADR-11 |
| «Mis tickets»: lista con número, estado y plazo | `#/portal` | HU-064 |
| Nuevo ticket: tipo y subtipo guiados, lote, descripción y adjuntos | `#/portal/nuevo` | HU-064 |
| Detalle con la línea de tiempo del ticket (trazabilidad paso a paso) | `#/portal/ticket/…` | HU-065 |
| Responder, adjuntar documentos y confirmar o rechazar la solución | `#/portal/ticket/…` | HU-066 |

- Un cliente no ve los tickets de otro: el intento se rechaza y queda en la auditoría.
- **Cómo entrar:** Herramientas › Ver como › Cliente convocado (Mi Portal), o directo a `#/portal`. Clientes de prueba:
  - Ana Inga, DNI `95638594`: tiene un ticket esperando su respuesta (`#/portal/ticket/tk-272`).
  - Pedro Chávez, DNI `94805186`: tiene una solución por confirmar (`#/portal/ticket/tk-308`).
- **Cómo está hecho:** código fuente nuevo en `src/portal/`, compilado a `artefacto/assets/mi-portal.js` con `vite.portal.config.ts`. Usa el React y los componentes del artifact. Lo que necesita del chunk `comun` está en `scripts/nucleo-portal.js`.

### 2. Vista en vivo frente a la HU-ATC-067 (visor 3D)

Se agregó lo pequeño que faltaba según sus criterios:

- cola y ocupación por sala («n en cola · ocupados/total»);
- tabla «Por área»;
- en la ficha del ticket, las asignaciones y el CSAT cuando está cerrado;
- en la bitácora, las alertas de SLA vencido.

Archivos: `src/three/vivo.ts`, `scripts/componentes-vivo.js` y `scripts/efecto-vivo.js`.

### 3. Solo la Etapa 1 en la interfaz

- **UrbeMind (incidencias de ciudad):**
  - sale del menú de todos los roles;
  - `#/urbemind` redirige a `#/vivo` sin cargar esa pantalla;
  - el tipo «Incidencia de ciudad» y la línea «Servicios de ciudad» desaparecen de los selectores y filtros;
  - el ticket de ejemplo de UrbeMind se quita de los datos de prueba con `scripts/etapa1.js`, sin cambiar los demás identificadores.
- **NEXUS:** donde decía que los líderes salen de NEXUS ahora dice «maestro local de ATC» (Mi día, «Ver como», acceso de Mi Portal).
- **DAEDALUS:** no aparece en ninguna pantalla.
- La pantalla de UrbeMind sigue dentro del bundle compilado porque no se puede recortar sin el código fuente del artifact, pero nada la enlaza ni la carga.

### 4. Criterios de las prioridades del PO y de las garantías (20-oct)

Se cerraron, criterio por criterio, las HU que más pesan para el comité DoR. **Regla:** solo lo que pide cada criterio del
PLT-04 v1.3. No se trajo nada de la rama `prototipo-polar`: no cerraba ningún criterio que faltara y lo que tiene de más no
está en el documento.

| HU | Prioridad / dueño | Qué se agregó (criterios) | Dónde verlo |
|---|---|---|---|
| **043** Flujos por tipo y área | P1 · Michel | Clave tipo + subtipo + área, responsable del flujo, actividades con su SLA (CA-01, 03). Una versión nueva solo aplica a tickets nuevos (CA-02). Actividades en orden en el ticket (CA-04). SLA = suma, salvo que la política sea menor (CA-05). Combinación única con «Nueva versión» (CA-06). Flujo por defecto del área y alerta (CA-07). Bitácora de publicaciones (CA-08) | Configuración › Flujos (Administrador funcional), Nuevo ticket, detalle del ticket |
| **050** Consulta 360 en el ticket | P2 · Daniel | Ficha con etapa, tickets y «Datos visibles n de 16» (CA-05). Fecha en el dato (CA-06). Candado y color distinto para lo restringido (CA-07). DNI inexistente: interesado o derivar (CA-08). Rastro en la bitácora del ticket (CA-10) | `#/ticket/tk-460` › Cliente |
| **067** Operación en vivo | P3 · Michel | Nombre del PLT-04. Caja del color de su tipo (CA-02). Al vencer, correo y Sala de Comité (CA-03). Panel del área (CA-04). Paso «en bandeja» (CA-05). Filtro por razón social y áreas permitidas (CA-07). Pausa y velocidad x1/x2 solo en el modo simulación (CA-08) | `#/vivo` |
| **034** Vigencia de la garantía | Brayan | El rechazo por vigencia se informa al cliente con su motivo (CA-02) | `#/garantias/gar-249` |
| **035** Inspección técnica | Brayan | El informe y varias fotos (CA-01) | `#/garantias/gar-585` |
| **036** Escalar a Eje 3 | Brayan | Carta notarial en el reclamo: señal de conflicto, sin resolver en Eje 2 y derivación a Eje 3 desde el ticket (CA-01) | `#/garantias/gar-314` |

Los supuestos de esta ronda (por ejemplo, el subtipo «General» de los 4 flujos del PO, o el modo simulación encendido por
defecto) y las preguntas para el PO están en [DECISIONES.md §5.7](DECISIONES.md).

**Diseño: paleta y componentes del SDK.** El mockup usa el mismo sistema de diseño que el SDK que está en
`frontend/paquetes/`:
- los 122 tokens de color coinciden con `@aybarcorp/tokens` 0.3.0;
- las clases de los componentes son las de `@aybarcorp/ui` 0.3.0.

Todo lo nuevo se armó con esos componentes (Card, DataGrid, Dialog, Form, Select, Switch, Badge, Alert, carga de archivos e
icono `lock`) y con colores por token, sin colores escritos a mano. Además, el CSS propio del visor (`src/three/estilos.ts`)
pasó a usar los tokens del SDK para tamaño y peso de letra, espacios y radios. Solo quedan en px las medidas que el SDK no
tiene como token: bordes, tamaño de iconos, sombras, animaciones y cortes de pantalla.

### 6. Las 12 HU que faltaban (bloque 3, 20-oct)

| HU | Dueño | Qué se agregó (criterios) |
|---|---|---|
| 026 y 027 | Jesús | Con señal de conflicto no se escala a mano ni se resuelve en Eje 1/2: todo paso a Eje 3 va por «Derivar a Eje 3» con los 6 elementos. El aviso de handoff sin confirmar se ve en el ticket y en Alertas SLA |
| 040 y 041 | Daniel | Pestaña Legal con el estado sincronizado, incluido «En revisión en Legal». El ticket con riesgo de denuncia queda prioritario al alertar a Legal |
| 044, 046 y 055 | Michel | Canal Mi Portal en el simulador. La Bandeja muestra las áreas que cada persona supervisa. Reparto por carga al entrar el ticket. «Plantilla de correo de asignación» |
| 048 y 031 | Michel | Asistente de IA al ir a cerrar, con los criterios pendientes de la guía y el registro de decisiones en el ticket. Informes diario y quincenal generados al cierre, con tendencias |
| 056, 057 y 066 | Daniel | Resolución por morosidad derivada al flujo de Cobranza y Legal. «Plantilla de alerta de cancelación» (texto pendiente de Legal). SLA en pausa mientras se espera al cliente y cierre automático con días configurables |

Supuestos y preguntas para el PO: [DECISIONES.md §5.8](DECISIONES.md).

### 7. Documentación de consulta en el repositorio

[`documentacion/`](documentacion/README.md) contiene tres cosas:
- los 6 documentos del PO v1.3, tal cual y con su huella;
- el paquete Definir de toda la Etapa 1 en el formato del SDK: 11 épicas, 23 funcionalidades, 62 historias y 23 DoR (119 documentos, valida sin errores, con su índice y el explorador del SDK; todavía no subido a Nexora);
- la [cobertura](documentacion/cobertura-v1.3.md) del mockup historia por historia.

No reemplaza a Nexora: el paquete se aprueba allí, y la carpeta `docs/` solo la escribe `aybar paquete sellar`.

## Qué viene del PO y qué no

- **Del PLT-04 v1.3, tal cual:** el «Como / quiero / para», los criterios de aceptación y el comportamiento de la Etapa 1 mientras tanto (PLT-01, «Fuera de este plan»).
- **Decisiones de diseño del equipo, a validar con el PO:** están en [DECISIONES.md §5.2](DECISIONES.md). Por ejemplo:
  - el canal y la vigencia del código (5 min, 3 intentos);
  - los tipos y subtipos que ve el cliente;
  - los adjuntos permitidos (JPG, PNG o PDF, máximo 3);
  - la prioridad Media al registrar;
  - los 5 días hábiles antes del cierre automático.
- **Lo que se quitó** y lo que hay que reponer si el PO lo pide (por ejemplo, «Servicios de ciudad»): [DECISIONES.md §5.5](DECISIONES.md).

## Cobertura frente a las 62 HU de la v1.3

**Las 62 HU de la Etapa 1 están completas** al 20-oct: el mockup permite comprobar cada criterio de aceptación. Antes eran 50
completas (quinta ronda) y 44 (19-oct). Dónde ver cada una: [documentacion/cobertura-v1.3.md](documentacion/cobertura-v1.3.md).

## Cómo probarlo

```bash
cd propuesta-po
npm install
npm start          # compila (escenas three.js y Mi Portal) y sirve http://localhost:5180
npm run probar     # 76 casos en Node, en 10 suites (uno por criterio)
npm run recorrer   # con el servidor arriba: 90 pasos en Chrome sin interfaz, en 11 recorridos
```

Verificado el 20-oct-2026, después de la sección 6:

- **`npm run probar`:** 76/76 casos.
- **`npm run recorrer`:** 90/90 pasos.
- En todos: sin errores de JS, consola ni red.

Verificado el 20-oct-2026, después de la sección 4:

- **`npm run probar`:** Mi Portal 14/14, flujos 9/9, Consulta 360 7/7 y garantías 10/10.
- **`npm run recorrer`:** recorrido general 17/17, flujos 7/7, Consulta 360 10/10, Operación en vivo 9/9 y garantías 6/6.
- En todos: sin errores de JS, consola ni red, sin textos de la Etapa 2 y sin desplazamiento horizontal a 390 px.

Verificado el 19-oct-2026 (secciones 1 a 3):

- **Compilación:** sin errores de tipos, y `npm run build` reproduce el mismo artefacto.
- **`npm run probar`:** 14 de 14 casos.
- **`npm run recorrer`:** 17 de 17 pasos, sin errores de JavaScript, consola ni red. Incluye:
  - un barrido de 31 pantallas con seis roles y Mi Portal, que no encuentra ningún texto de la Etapa 2;
  - tema claro y oscuro;
  - móvil a 390 px sin desplazamiento horizontal.
- **Recursos:** los 69 archivos del artefacto responden 200.

## Archivos

| Tipo | Archivos |
|---|---|
| Nuevos | `CAMBIOS-v1.3.md`, `src/portal/` (`index.ts`, `vistas.ts`, `modelo.ts`, `kit.ts`, `estilos.ts`, `tipos.ts`, `externos.d.ts`), `vite.portal.config.ts`, `scripts/nucleo-portal.js`, `scripts/etapa1.js`, `scripts/probar-portal.mjs`, `scripts/recorrer-navegador.mjs`, `artefacto/assets/mi-portal.js` (generado) |
| Modificados | `package.json` (scripts `build`, `build:portal`, `probar`, `recorrer`; `start` compila todo), `README.md` (sección «Cuarta ronda»), `DECISIONES.md` (§5), `scripts/parchear.mjs`, `scripts/shell.js`, `scripts/componentes-vivo.js`, `scripts/efecto-vivo.js`, `src/three/vivo.ts` |
| Regenerados | `artefacto/assets/` (`comun`, `prototipo`, `VistaEnVivo`, `MiDia`, `escenas-three.js`) |
| Nuevos el 20-oct | `documentacion/` (documentos del PO, paquete de Dev 1 y cobertura), `scripts/hu043-modelo.js`, `hu043-configuracion.js`, `hu043-detalle.js`, `consulta360.js`, `garantias.js`, `garantia-ui.js`, `probar-flujos.mjs`, `probar-consulta360.mjs`, `probar-garantias.mjs`, `recorrer-flujos.mjs`, `recorrer-consulta360.mjs`, `recorrer-operacion-vivo.mjs`, `recorrer-garantias.mjs` |
| Modificados el 20-oct | `scripts/parchear.mjs`, `componentes-vivo.js`, `efecto-vivo.js`, `shell.js`, `probar-portal.mjs`, `recorrer-navegador.mjs`; `src/three/vivo.ts`, `grafo360.ts`, `estilos.ts`, `bot.ts`; `package.json`, `README.md`, `DECISIONES.md` (§5.7) y los chunks regenerados de `artefacto/assets/` |
| Nuevos en el bloque 3 | `scripts/eje3-modelo.js`, `eje3-detalle.js`, `eje3-alertas.js`, `hu044-areas.js`, `hu046-carga.js`, `hu055-correo.js`, `hu055-plantilla.js`, `hu048-*.js`, `hu031-*.js`, `hu056-*.js` (morosidad y plantilla de la HU-057), `hu066-*.js` y sus pruebas (`probar-eje3`, `probar-bandeja`, `probar-asistente-ia`, `probar-informes`, `probar-morosidad`, `probar-portal-sla` y sus `recorrer-*`) |
| Sin tocar | `original/`, `frontend/`, `docs/` y el resto del repositorio |

## Para tener en cuenta

- **Ticket:** todavía no hay ticket del backlog. La rama y el commit usan `AYB-0001`, el marcador provisional que propone el paquete del equipo en Nexora (`analisis/decisiones.md`, D-005). Cuando exista el ticket real, se renombra la rama.
- **Firma:** el commit no está firmado (no hay llave GPG/SSH configurada). Para integrar a `main` el SDK pide autor humano con firma verificada, PR con revisor distinto del autor y la asistencia de IA declarada en la descripción del PR.
- **Cambio visible en Mi Portal (20-oct):** los subtipos que ve el cliente no tienen flujo publicado. Su ticket queda en la cola de
  ATC con una alerta para el administrador, como pide la HU-043 CA-07, y la fecha de compromiso sale de la política del tipo.
  Alinear los subtipos de Mi Portal con los flujos es trabajo de la HU-064 (§5.7).
- **Operación en vivo:** el modo simulación está encendido por defecto, para que la escena se mueva como en el prototipo del PO.
  Apagado, el visor solo refleja los cambios reales.
- **Riesgo técnico:** los parches dependen de los nombres internos del artifact compilado. Si el PO vuelve a publicar el artifact, `parchear.mjs` avisa y hay que actualizar los marcadores.
