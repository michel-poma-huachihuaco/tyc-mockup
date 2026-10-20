# propuesta-po · cambios para la v1.3 (Etapa 1)

Rama `feature/AYB-0001-propuesta-po-v1-3`, hija de `main` (`d42d81e`). Preparada el 19-oct-2026 por Brayan Hurtado (Dev 1) con asistencia de IA (Claude). Pendiente de revisión del dueño del repositorio y de validación del PO.

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

**44 completas, 18 parciales y 0 sin pantalla.** Antes de este cambio, la HU-064, 065 y 066 no tenían pantalla.

Lo que falta en las prioridades del PO (detalle en [DECISIONES.md §5.1, §5.3 y §5.4](DECISIONES.md)):

- **HU-043 (prioridad 1):**
  - el flujo va solo por tipo, sin subtipo;
  - no crea actividades ni calcula el SLA total del flujo.
- **HU-050 (prioridad 2):**
  - la consulta 360 no deja rastro en la bitácora del ticket;
  - la ficha no tiene el contador «datos visibles n de 16».
- **HU-067 (prioridad 3):**
  - no hay panel al tocar un área ni filtro por razón social;
  - la tarjeta usa el color del área y no el del tipo.

## Cómo probarlo

```bash
cd propuesta-po
npm install
npm start          # compila (escenas three.js y Mi Portal) y sirve http://localhost:5180
npm run probar     # 14 casos: uno por criterio de HU-064, 065 y 066, más el acceso
npm run recorrer   # con el servidor arriba: recorre el mockup en Chrome sin interfaz
```

Verificado el 19-oct-2026:

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
| Sin tocar | `original/`, `frontend/`, `docs/` y el resto del repositorio |

## Para tener en cuenta

- **Ticket:** todavía no hay ticket del backlog. La rama y el commit usan `AYB-0001`, el marcador provisional que propone el paquete del equipo en Nexora (`analisis/decisiones.md`, D-005). Cuando exista el ticket real, se renombra la rama.
- **Firma:** el commit no está firmado (no hay llave GPG/SSH configurada). Para integrar a `main` el SDK pide autor humano con firma verificada, PR con revisor distinto del autor y la asistencia de IA declarada en la descripción del PR.
- **Riesgo técnico:** los parches dependen de los nombres internos del artifact compilado. Si el PO vuelve a publicar el artifact, `parchear.mjs` avisa y hay que actualizar los marcadores.
