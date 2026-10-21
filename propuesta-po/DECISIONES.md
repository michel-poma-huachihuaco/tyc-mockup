# Decisiones pendientes · propuesta del PO

Hallazgos verificados en el código y en `docs/SCRUM/`, y opciones para elegir. Nada de esto está aprobado.

## 1. Entradas automatizadas (ya construidas para comparar)

Los operadores humanos de los 5 canales se sustituyeron por entes automatizados. En la escena hay un selector
«Entradas» (abajo a la izquierda); también `?entradas=terminal|dispensador|orbe|minibot|portal`. Se recuerda en el navegador.

| Opción | Qué es | A favor | En contra |
|---|---|---|---|
| **Terminales** (por defecto) | Quioscos con pantalla que muestran el icono del canal y sueltan el ticket por una ranura | Neutro y creíble; encaja con «formulario simple» y «Mi Portal» | Poca personalidad |
| **Turneros** | Dispensadores de turno que imprimen la tarjeta del ticket | Es la metáfora más cercana a «ticket»; el papel que sale se entiende sin explicar | Evoca fila presencial, no WhatsApp ni correo |
| **Orbes** | Esferas holográficas con el icono del canal y anillos orbitando | Más vistoso; no parece mobiliario | Más abstracto; menos legible a tamaño pequeño |
| **Mini-bots** | Robots pequeños, uno por canal, con el icono en el pecho | Coherente con el robot de la bandeja | Dos tipos de robot en la misma escena: el orquestador pierde protagonismo |
| **Portales** | Arcos de datos por donde «entra» la solicitud | Comunica «entrada» y «automatización»; el robot queda único | Más difícil de dibujar bien a esa escala |

**Recomendación:** Terminales o Portales. Si el orquestador debe ser *el* robot de la escena, evitar Mini-bots.

## 2. Cómo termina hoy un ticket en la vista (investigación)

- La escena trata `RESOLVED` y `CLOSED` como una sola etapa, «salida» (`L(e)` en el chunk; ver `scripts/efecto-vivo.js`).
- Un ticket **llega a «Cierre en Mi Portal» cuando pasa a `RESOLVED`**, es decir, cuando el gestor emite la solución.
  El cierre formal (`CLOSED`) exige confirmación del cliente en Mi Portal (RN-SVC-023) y es lo que dispara la
  encuesta (`nucleo.ts:558`). La rotulación «Cierre en Mi Portal» es, por tanto, anterior al cierre real.
- El simulador de la vista **solo mueve tickets hasta `RESOLVED`**; nunca los pasa a `CLOSED`. Los CSAT que se ven vienen de la semilla.
- Solo se dibujan los **8 más recientes** de «salida»: al llegar el noveno, el más antiguo se encoge y desaparece. No queda registro visible.
- La salida no muestra resultado: ni si cumplió el SLA, ni la nota CSAT, ni que el cliente fue notificado.

### 5 propuestas para el final del recorrido

| # | Propuesta | Qué se ve | Esfuerzo |
|---|---|---|---|
| 1 | **Cierre en dos tiempos** | `RESOLVED`: la tarjeta va a una «mesa de resolución» ámbar con reloj de espera del cliente. `CLOSED`: pasa por el arco de Mi Portal con sello ✓. Separa lo que hoy está mezclado (RN-SVC-023) | Medio |
| 2 | **Encuesta visible** | Al cerrar aparecen estrellas CSAT sobre la tarjeta (color según nota), con un pequeño rebote, y luego se archiva. Conecta con el KPI «CSAT del día» | Bajo |
| 3 | **Archivo del día** | Los cerrados no desaparecen: se apilan en un archivador «Cerrados hoy · N», con franjas verde (en SLA) y roja (fuera). Al tocarlo se abre la lista | Medio |
| 4 | **Celebración hacia el HUD** | Si cierra dentro del SLA, una chispa «+10 XP» vuela desde la tarjeta hasta la tarjeta de Nivel del equipo; si no, un humo gris. Une la escena con las estadísticas | Medio |
| 5 | **Aviso al cliente** | Del arco de Mi Portal salen sobres con el icono del canal (WhatsApp, correo, portal) y un check de entrega. Muestra la notificación al cliente (RF-057) | Medio |

**Recomendación:** 1 + 2. Corrigen el desfase con el flujo real y hacen visible el resultado. Para que el 1 se vea hay que
hacer que el simulador cierre tickets (hoy no lo hace).

## 3. Áreas que pide el PO: Contabilidad, Tesorería, Proyectos, Comercial

**¿Están mapeadas a nivel de ticket?** No.

- RF-SVC-007 habla de «las **6 áreas**» sin listarlas. El prototipo asumió ATC, Cobranza, Legal, Postventa, TI y
  Administración (`catalogos.ts:85`; `03-epics.md:159`).
- **Contabilidad y Tesorería:** cero menciones en todo el paquete.
- **Comercial:** aparece como destinatario de la carta de alerta (HU-ATC-058, «supervisor del área comercial»), como
  patrocinador de EP-ATC-11 y como fuente del maestro de supervisores (DEP-15). **No** recibe tickets.
- **Proyectos:** hoy es «Proyecto · Entrega Fest», una sala que agrupa tickets de ingreso y de bus (que salen de
  Administración); «responsable del proyecto» es una persona asignada (HU-ATC-059), no una cola de área.
- En la escena hay 6 salas. TI no tiene sala propia: sus tickets caen en «Atención Eje 1».
- Las áreas son un catálogo (`MAE_Área`, ENT-SVC-007) y los flujos se configuran por área (HU-ATC-043), así que agregar
  áreas es en gran parte dato, no código. Lo que **cambia** es el RF-SVC-007, las políticas de SLA por área, las personas
  y roles, y la escena (10 salas en lugar de 6).

| Opción | Qué implica | Riesgo |
|---|---|---|
| **A. Todas, ya** | Agregar las 4 al catálogo, con flujo, SLA y personas; la escena pasa a 10 salas | Sin definir qué tipos de ticket llegan a Contabilidad y Tesorería, quedan vacías |
| **B. Solo las respaldadas** | Comercial y Proyectos primero (hay evidencia en el paquete); Contabilidad y Tesorería cuando el PO diga qué tickets reciben | Entrega parcial de lo pedido |
| **C. Subáreas** | Contabilidad y Tesorería como equipos dentro de Administración o Cobranza, sin sala nueva | Oculta carga y SLA por equipo |

**Recomendación:** B. Preguntas para el PO: ¿qué tipos o motivos de ticket llegan a cada una (por ejemplo devoluciones a
Tesorería, comprobantes a Contabilidad)? ¿Reciben tickets de clientes o solo derivaciones internas? ¿Cambia RF-SVC-007?

## 4. Métricas NPS por estado del ticket

> **Estado: P1 y P2 aplicadas en el what-if. P3 no.** Cambios (parches sobre el artifact compilado, ver `scripts/parchear.mjs`):
>
> - **P1, en «Vista en vivo»:** panel «Tickets por estado» con los 7 estados del flujo (conteo, barra y destello al cambiar) y tarjeta
>   de NPS aparte. Sin «cancelados»: el panel lo dice.
> - **P2, modelo:** la respuesta de la encuesta admite `nps` (0–10, entero; se valida). Las 3 respuestas de la semilla traen NPS
>   coherente con su CSAT (10, 8 y 3: datos ficticios). El NPS del tablero es el real si hay respuestas con NPS; si no, vuelve al
>   preliminar derivado del CSAT. Las etiquetas (tarjetas e informes diario y quincenal) dicen «NPS» o «NPS preliminar» según el caso.
> - **P2, Torre de Control › Encuestas:** columna NPS (con n) por tipo, área y gestor, una tabla nueva «Por resultado del cierre»
>   (cerrado en plazo, cerrado fuera de plazo, reabierto, en curso) y el NPS en cada encuesta enviada. «Simular respuesta» ahora
>   elige una combinación variada de CSAT, CES y NPS en lugar de siempre 4 y 6.
> - **Pendiente de P2:** no se redactaron el RF y la HU nuevos (hay que tocar RF-019 y definir la relación con NPS-C), ni existe
>   una pantalla de Mi Portal donde el cliente conteste: la única entrada es «Simular respuesta». Con pocas respuestas el NPS
>   salta mucho (un grupo de una respuesta da +100, 0 o −100): por eso se muestra siempre el n.

**Qué tenemos:** `NPS preliminar` en la Torre de Control (HU-ATC-030/031), **derivado del CSAT** (5 promotor, 4 pasivo, 1 a 3
detractor; marcado como supuesto hasta contar con el KPI Engine, DEP-10). El NPS-C corporativo (RNF-USA-001) es un compuesto
(JOU 45 %, POS 35 %, EVT 20 %) que calcula el KPI Engine, no ATC. La encuesta mide CSAT (1 a 5) y CES (1 a 7), no «¿recomendarías?» (0 a 10).

**Conflictos y límites de la petición:**

1. La encuesta se dispara **solo al cerrar** (RF-019; RNF-INT-004: 100 % de los `CLOSED`). Para tickets en proceso no existe
   respuesta, así que un NPS «de los en proceso» no se puede calcular.
2. **No existe el estado «cancelado».** Los 7 estados son OPEN, IN_PROGRESS, PENDING_CUSTOMER, ESCALATED, RESOLVED, CLOSED y
   REOPENED (RF-004). «Estados personalizados» está fuera de alcance. La «cancelación» del paquete (RF-056/057) es la del
   contrato del cliente, no la del ticket.
3. Contar tickets por estado es un KPI operativo, no un NPS. Mezclarlos genera lecturas confusas.
4. Dato disponible hoy: tickets por estado (sí), CSAT y CES por ticket cerrado (sí), NPS verdadero (no), cancelados (no).

| Propuesta | Qué se agrega | Conflicto | Esfuerzo |
|---|---|---|---|
| **P1. Estados y NPS por separado** | En la vista en vivo: barra con los tickets por estado (activos por estado y resueltos/cerrados del día) y una tarjeta «NPS preliminar» del CSAT, con la etiqueta «supuesto». «Cancelados» queda fuera hasta que se defina | Ninguno | Bajo |
| **P2. NPS transaccional real** | Agregar «¿recomendarías?» (0 a 10) a la encuesta de cierre (nuevo RF y HU, toca RF-019, la entidad de respuestas y DEP-10). NPS = %9–10 − %0–6, desglosable por área, tipo, gestor y resultado del cierre | Cambia el alcance de la encuesta; hay que definir cómo se relaciona con NPS-C | Medio |
| **P3. Estado final de cancelado** | Nuevo estado terminal (por ejemplo «Desistido»), con motivo, cuándo aplica y quién lo decide. Permite embudo completo y NPS por resultado (conforme, reabierto, desistido) | Toca RF-004 (7 a 8 estados), la matriz de transiciones, HU-004, los flujos de HU-043, los informes y la escena | Alto |

**Recomendación:** P1 ahora; P2 como HU nueva cuando el PO responda cómo se relaciona con NPS-C; P3 solo si el PO define qué es «cancelado».

## Limpieza del prototipo (UI final)

- Fuera de la interfaz: insignia «PO», «What-if · propuesta del PO», el aviso del What-if, «Propuesta del PO · FT-…», «Meta p95 (propuesta del PO)», «Supuesto», «(simulado)», «persona ficticia» y los códigos RN/RF/DEP/FT.
- Las notas explicativas (supuestos, datos ficticios, pendientes) no se pierden: van al panel **Notas** de las herramientas, por pantalla.
- **Herramientas flotantes** (botón abajo a la izquierda): Ver como, Tema, Apariencia, Simulación y Notas. La barra superior queda con la marca y el usuario.
- **Inicio** (antes «Vista en vivo»): Consulta 360 arriba y Vista en vivo debajo, en una sola página con anclas fijas. El 360 arranca con un cliente preseleccionado (cli-001) para mostrar el grafo; en la ficha del 360 se quitaron «Ver como» y «Simular caída», que duplicaban las herramientas.
- **Asistente de IA** (robot 3D, abajo a la derecha; no aparece para Control de acceso ni Cliente): redactar respuesta (Empático/Formal/Breve → «Insertar en el mensaje»), resumir ticket, siguiente paso y revisar borrador. Todo es plantilla local; reemplaza la tarjeta «Asistente de IA» del detalle del ticket.

## 5. v1.3 (16-oct): lo que queda abierto

> **Estado: aplicado en el what-if.**
> - **Cuarta ronda (19-oct):** Mi Portal (HU-064, 065 y 066), la Etapa 2 fuera de la vista y lo pequeño que faltaba de la HU-067.
> - **Quinta ronda (20-oct):** las prioridades del PO (HU-043, 050 y 067) y las garantías (HU-034, 035 y 036), criterio por criterio;
>   ver §5.7.
> - **Bloque 3 (20-oct):** las 12 HU que seguían parciales; ver §5.8. Con eso, las 62 HU de la Etapa 1 quedan completas.
> - **Respuestas del equipo (20-oct):** las 27 preguntas de este documento, contestadas por Brayan (Dev 1); ver §5.9. Son la
>   propuesta del equipo y las confirma el PO en el comité.
>
> Nada de esto está aprobado: el PLT-04 v1.3 está «Pendiente DoR» y el comité DoR es el 20-oct.

### 5.1 Cobertura del mockup frente al PLT-04 v1.3

De las 62 historias de la Etapa 1: **50 sí, 12 parcial, 0 no** después de la quinta ronda. Antes de la quinta ronda eran 44 sí y
18 parcial; antes de la cuarta, la HU-064, la 065 y la 066 eran «no». El detalle por historia está en
`documentacion/cobertura-v1.3.md`. Faltas por prioridad del plan, antes de la quinta ronda:

| HU | Qué falta |
|---|---|
| **HU-043** (prioridad 1) | El flujo es por tipo, sin subtipo; no crea actividades en el ticket ni SLA por actividad; no calcula el SLA total; sin flujo por defecto ni alerta al administrador; sin bitácora de publicaciones |
| **HU-050** (prioridad 2) | La consulta 360 no deja rastro en la bitácora del ticket; a la ficha le faltan etapa, n.º de tickets y «datos visibles n de 16»; lo restringido no lleva candado; un DNI inexistente en el buscador del grafo no abre la excepción |
| **HU-067** (prioridad 3) | Ver §5.4 |
| HU-026 y 027 | «Cambiar estado › Escalado» pasa a Eje 3 sin gate de conflicto ni paquete mínimo de handoff; el aviso de handoff sin confirmar no se ve en ninguna pantalla |
| HU-044, 046, 048, 031, 040, 041, 055, 056, 057, 034, 035, 036 | Faltas acotadas a uno o dos criterios (detalle en la tabla de cobertura entregada aparte) |

**Quinta ronda:** quedan cubiertas la HU-043, la 050 y la 067 (las tres prioridades) y la 034, la 035 y la 036.

**Bloque 3:** se cierran las 12 restantes: la 026 y la 027 (Jesús); la 031, 044, 046, 048 y 055 (Michel); y la 040, 041, 056,
057 y 066 (Daniel). **Cobertura final: 62 de 62.**

### 5.2 Mi Portal: decisiones de diseño para validar con el PO

Del PLT-04 se tomaron literalmente el «Como/quiero/para» y los criterios. Lo demás lo decidí yo y hay que confirmarlo:

| Decisión | Por qué | Pregunta para el PO |
|---|---|---|
| Acceso con DNI y código de 6 dígitos al correo **y** al celular; vence a los 5 min; 3 intentos | CA-01 dice «correo o celular» | Es pregunta abierta del PLT-04: ¿correo, celular o ambos? |
| Tipos para el cliente: Consulta de cuenta, Pedido simple, Visita técnica, Garantía postventa (+ Reclamo y Queja, que van al Libro); subtipos propuestos | El modelo del prototipo no tiene subtipos; incidencia de ciudad es Etapa 2 | ¿Qué tipos y subtipos se habilitan en el piloto? (pregunta abierta del PLT-04) |
| El cliente elige el lote; la razón social y la línea salen del contrato (regla fija por proyecto en el prototipo) | RN-SVC-005 exige empresa y línea; el cliente no conoce la razón social | ¿De dónde sale la razón social de un ticket de Mi Portal? |
| Prioridad Media al registrar | El cliente no elige prioridad | ¿La pone el flujo o el gestor? |
| Adjuntos: JPG, PNG o PDF, hasta 10 MB, máximo 3 | CA-05 pide «tamaño y formatos permitidos» sin listarlos | ¿Formatos y cantidad? |
| Fecha de compromiso = vencimiento de resolución congelado con la política SLA (HU-003) | El flujo del prototipo no calcula su SLA total (falta de HU-043) | «Según el flujo»: ¿es la suma de las actividades o la política del tipo? |
| Estados en voz del cliente: Registrado, En atención, Pendiente de tu respuesta, En revisión especializada, Resuelto · por confirmar, Cerrado, Reabierto | Diagrama 6.1 de FT-ATC-24 | Textos finales |
| Se muestra el nombre del área («Atención al cliente» para ATC) | Pregunta abierta del PLT-04 | ¿Área o nombre genérico? |
| 5 días hábiles para confirmar antes del cierre automático | Pregunta abierta del PLT-04 | ¿Cuántos días? |
| El rol Cliente sigue entrando por «Buses del Entrega Fest»; «Mis tickets» y «Nuevo ticket» se suman a su navegación | No cambiar el recorrido del PO | ¿Mi Portal debe abrir en «Mis tickets»? |
| Con otro rol, `#/portal` también abre, con un aviso «Vista del cliente» | Para revisarlo sin cambiar de rol | — |

### 5.3 Mi Portal: brechas que quedan

- **HU-066 CA-01:** el prototipo no pausa el SLA en «pendiente del cliente», así que «el SLA se reanuda» no tiene efecto visible.
  Hace falta modelar la pausa (toca el cálculo de SLA de toda la consola, `wi` en `comun`).
- **HU-066 CA-04:** el cierre automático se simula con un botón en el detalle. Falta un job del sistema con los días hábiles
  configurables (encajaría en el job del panel de simulación, `Ko` en `comun`).
- **HU-065 CA-02:** los avisos por correo y WhatsApp se derivan de la bitácora y se listan; no hay servicio de notificaciones.
- **Encuesta:** confirmar dispara la encuesta (HU-019), pero sigue sin existir la pantalla donde el cliente la contesta (§4).
- **Libro de Reclamaciones desde Mi Portal** está fuera de alcance de la HU-064: el botón solo avisa.
- El simulador «Ticket entrante por Mi Portal» del panel de simulación (del PO) sigue creando tickets con canal Correo, y en la
  consola el canal de respuesta «Mi Portal» sale «no disponible». No los toqué: son del PO.

### 5.4 HU-067 (visor 3D): qué faltaba frente a sus criterios (resuelto en la quinta ronda, §5.7)

Se agregó lo pequeño: ocupados/total por sala (CA-01), recorrido con asignaciones y CSAT en la ficha (CA-05), alertas de SLA
vencido en la bitácora (CA-03/06), tabla «Por área» (CA-09) y la compuerta de Mi Portal para su canal. Queda:

| CA | Brecha | Esfuerzo |
|---|---|---|
| CA-02 | La tarjeta lleva el color del **área**, no el del **tipo** | Bajo, pero cambia la lectura de la escena: decidir con el PO |
| CA-03 | La alerta registrada va a la supervisora por «notificación en consola», no es un correo al líder con copia; el caso vencido no entra a la Sala de Comité (ahí van los escalamientos de la Mesa SGD) | Medio |
| CA-04 | No se puede tocar un área: falta el panel con su lista de tickets y la carga de cada gestor con la reasignación por carga (HU-046). La tabla «Por área» da los números | Medio (selección de sala en la escena + panel) |
| CA-07 | Sin filtro por razón social ni por áreas permitidas (RN-SVC-036) | Medio |
| CA-08 | Pausa y velocidad (x1, x2 y x4) están siempre, no solo en un «modo simulación» | Bajo |
| Nombre | El PLT-04 la llama «Operación en vivo»; aquí es «Vista en vivo» dentro de Inicio | Decisión del PO |

### 5.5 Etapa 2 (NEXUS, DAEDALUS, UrbeMind): se quitó, no se marcó

Decisión del usuario (19-oct): el mockup es de la Etapa 1 y no muestra nada de la Etapa 2. Una primera versión de esta ronda lo
marcaba con «Etapa 2 · simulado»; se cambió por quitarlo. Donde el plan dice cómo opera la Etapa 1 mientras tanto, se muestra eso.

| Sistema | Qué se quitó o reescribió | Dónde |
|---|---|---|
| **UrbeMind** (FT-ATC-11, HU-017/018; Etapa 1: «sin incidencias de ciudad en ATC») | Entrada «Integración UrbeMind» del menú (todos los roles); `#/urbemind` redirige al inicio y no carga la pantalla; el tipo «Incidencia de ciudad» de los selectores (Nuevo ticket, Configuración › Flujos y Guías, filtros); la línea «Servicios de ciudad»; de la semilla, el ticket de incidencia de ciudad, sus políticas SLA, su vínculo a contrato y las llamadas y eventos de UrbeMind | `parchear.mjs` (prototipo y comun) y `scripts/etapa1.js` |
| **NEXUS** (Etapa 1: usuarios, roles y líderes locales, ADR-09) | «Sin líder en NEXUS», «Completa el líder en NEXUS», «Nadie te tiene como líder en NEXUS» y «según NEXUS» pasan a «maestro local de ATC»; la ayuda de «Ver como» dice «Usuarios, roles y líderes del maestro local de ATC.»; Mi Portal ya no menciona NEXUS | `parchear.mjs` (comun y MiDia), `scripts/shell.js`, `src/portal/vistas.ts` |
| **DAEDALUS** (Etapa 1: consulta 360 sin esa sección) | La nota que había agregado en el panel Notas del inicio. El artifact no tenía ninguna otra mención | `parchear.mjs` (Grafo360) |

Lo que **se queda a propósito** y no es de la Etapa 2:
- «Aybar Ciudad S.A.C.» (una de las razones sociales del grupo, en el selector de empresa) y «Ciudad Aybar Norte» (un proyecto):
  son nombres propios, no la integración de incidencias de ciudad. Si el PO quiere ocultar también esa razón social, es una línea.
- El grupo del menú se sigue llamando «Gestión e integraciones» (es del PO); ahora tiene Configuración, Torre de Control y
  EntregaFest según el rol.
- La pantalla de UrbeMind y el código de su API siguen en el bundle (son del PO y el chunk no se puede recortar sin fuente), pero
  nada los enlaza, ni la ruta los carga, ni la semilla tiene datos para ellos. Las tarjetas de «Incidencia de ciudad» del detalle
  del ticket solo se pintan para ese tipo, que ya no existe.
- En los comentarios del código quedan referencias a la Etapa 2, para quien lo mantenga.

Abierto: «Servicios de ciudad» se quitó como línea de negocio porque en el mockup solo servía a las incidencias de ciudad. Si en
la Etapa 1 Aybar Ciudad atiende otras solicitudes (por ejemplo, consultas por la cuota de servicios), hay que reponerla.

### 5.6 Riesgos técnicos

- Todo sigue dependiendo de los nombres minificados del artifact publicado. Si se vuelve a publicar con otros hashes,
  `parchear.mjs` falla con un mensaje claro; además hay que actualizar las rutas de `vite.portal.config.ts` y los nombres de
  export de `src/portal/externos.d.ts` y `kit.ts` (`Ii`, `Ai`, `k`…).
- Mi Portal escribe en el mismo estado en memoria que la consola: al recargar, todo vuelve a la semilla (como el resto del prototipo).
- El navegador pide `/favicon.ico` por su cuenta y responde 404: ya pasaba antes (el `index.html` del artifact no enlaza icono).

### 5.7 Quinta ronda (20-oct): criterios cerrados y supuestos para validar con el PO

Regla de la ronda: cada cambio responde a un criterio de aceptación del PLT-04 v1.3 de la Etapa 1. No se tomó nada de la rama
`prototipo-polar` y no se agregó nada que el documento no pida. Donde el PLT-04 deja una pregunta abierta, la tabla dice qué se
supuso y por qué.

| HU | Qué se cerró | Supuesto o decisión | Pregunta para el PO |
|---|---|---|---|
| **043** | Configuración › Flujos con la clave tipo + subtipo + área; responsable del flujo; actividades con su SLA; datos obligatorios; combinación única con «Nueva versión»; bitácora de publicaciones; el alta de la consola, Mi Portal y la simulación aplican el flujo (área, responsable, actividades en orden, SLA = suma o la política si es menor); flujo por defecto del área y alerta «Sin flujo en el área» | Los 4 flujos del PO se conservan, con sus actividades, responsables y SLA. Llevan el subtipo **«General»**, porque el PO no les dio subtipo y el CA-03 lo exige. El responsable de cada flujo es la persona de su área que ya aparece en sus actividades. Se suma el flujo del CA-01: Reclamo · Garantía postventa · Postventa, de 8 + 16 + 8 h, con Lucía Ccahuana y Óscar Medina. Los tickets de ejemplo de la simulación entran con el subtipo «General». La semilla no trae flujo por defecto: lo publica el administrador. Cierra una actividad cualquier rol de atención | ¿Qué combinaciones tipo-subtipo-área tiene el piloto, y con qué responsables? ¿Cuál es el flujo por defecto de cada área? ¿Solo el responsable de la actividad puede cerrarla? |
| **043 → Mi Portal** | — | Los subtipos de Mi Portal (§5.2) no tienen flujo publicado: el ticket del cliente queda en la cola de ATC y se alerta al administrador (CA-07), y su fecha de compromiso sale de la política del tipo. El PLT-02 dice que los subtipos del formulario salen de los flujos: alinearlo es trabajo de la HU-064 | ¿Se publican flujos para los subtipos de Mi Portal, o el formulario muestra los de los flujos? |
| **050** | Ficha con proyecto y etapa, lotes, cuotas vencidas de todos los lotes, tickets y «Datos visibles n de 16» según el rol; fecha en «DNI y KYC» y en «Cuotas»; lo restringido en ámbar con candado y lo caído en rojo; un DNI que no está en SIGDA/TAXON abre la excepción (registrar como interesado o derivar); la consulta deja en la bitácora del ticket quién, cuándo y qué secciones, sin datos personales | «Derivar» abre el mismo diálogo de derivación del ticket (HU-007): ni la HU-050 ni la 051 dicen a dónde. La «etapa» es la del nombre del proyecto, porque la semilla no tiene ese campo. La fecha de «DNI y KYC» es la del ejemplo del CA. La exposición sale de la ficha porque el CA-05 no la pide, y sigue en el mapa con candado. Volver a la pestaña no repite la nota: misma persona y mismas secciones en menos de 10 min | ¿Qué es «derivar» en la excepción? ¿Qué campo de SIGDA es la etapa? |
| **067** | Nombre «Operación en vivo»; pausa y velocidad (x1, x2) solo en el modo simulación; caja del color de su tipo; al vencer, el correo en el registro de actividad y el caso en la Sala de Comité; panel del área al tocarla, solo informativo; paso «en bandeja»; filtro por razón social y por áreas permitidas, también en la escena | El modo simulación está **encendido por defecto**, como el prototipo del PO; se apaga en Herramientas › Simulación. El correo va al responsable con copia a su líder, como dicen la RN-SVC-035 y la HU-055. Las áreas permitidas siguen la regla de la Bandeja: supervisor y coordinador CX ven todo, el resto su área. La paleta por tipo no lleva leyenda porque el CA no la pide. La hora de «en bandeja» es la del registro | ¿El correo va al líder con copia al responsable, o al revés? ¿Hace falta una leyenda de colores por tipo? |
| **034** | El rechazo por vigencia avisa al cliente con el motivo (WhatsApp, o correo si WhatsApp no responde) y queda en la trazabilidad del reclamo | El aviso usa la misma vía que las confirmaciones de Buses. Mi Portal no muestra esos avisos y el CA no lo pide | — |
| **035** | La inspección admite el informe y varias fotos | JPG, PNG o PDF, hasta 10 MB cada uno y máximo 5, los límites que ya usa la evidencia del ticket. Exige al menos una foto, por «el informe y las fotos» | ¿Formatos y cantidad? |
| **036** | «Registrar carta notarial» en el reclamo: vincula su ticket de garantía si no lo tenía, marca la señal de conflicto, impide resolver en Postventa y la derivación a Eje 3 sale del ticket, con el paquete mínimo | Ya derivado, el reclamo sigue sin resolverse en Postventa mientras el ticket esté abierto. Si el cliente no tiene ticket de garantía, se lleva a «Nuevo ticket», porque el alta exige empresa y línea | ¿Quién cierra el reclamo después de la respuesta de Legal? |

Pruebas de esta ronda:
- **En Node (`npm run probar`):** flujos 9/9, Consulta 360 7/7, garantías 10/10 y Mi Portal 14/14.
- **En Chrome (`npm run recorrer`, con el servidor arriba):** flujos 7/7, recorrido general 17/17, Operación en vivo 9/9,
  garantías 6/6 y Consulta 360 10/10.
- En todos los recorridos: sin errores de JS, consola ni red, y sin textos de la Etapa 2.

### 5.8 Bloque 3 (20-oct): las 12 HU que faltaban

Misma regla que en §5.7: solo lo que pide cada criterio del PLT-04 v1.3.

| HU | Qué se cerró | Supuesto o decisión | Pregunta para el PO |
|---|---|---|---|
| **026** | Con señal de conflicto, «Cambiar estado › Escalado» queda deshabilitado («gate no compensable»). Resolver o cerrar en Eje 1/2 se rechaza y queda en la auditoría. La única salida es «Derivar a Eje 3» | — | — |
| **027** | Los 6 elementos del handoff se exigen en todo paso a Eje 3, también sin señal. El aviso de handoff sin confirmar se ve en el ticket y en Alertas SLA › «Handoffs sin confirmar» | El paquete se exige al pasar a Eje 3, como dice el CA-01. «Supervisor del eje destino» = la jefatura de Legal del maestro local | El requerimiento dice «toda derivación entre ejes»: ¿también de Eje 1 a Eje 2? |
| **040** | Pestaña Legal en el ticket con el estado sincronizado. La actualización intermedia («En revisión en Legal») y la resolución llegan sin registro manual | «Se confirma el handoff» (CA-01) se lee como la confirmación de la derivación por quien la envía | ¿El caso llega a Legal al derivar o cuando Legal confirma la recepción? |
| **041** | Al alertar a Legal por la exposición, el ticket queda como prioritario; se ve en el ticket y en la Torre › «Riesgo de denuncia» | «Prioritario» = prioridad Urgente, sin tocar el SLA. El rayo no se usa, porque la RN-SVC-031 lo reserva al supervisor, con motivo y tope | ¿«Prioritario» es prioridad Urgente o el rayo? |
| **044** | El simulador de Mi Portal entra con canal «Mi Portal». En la Bandeja, cada persona ve su área y las áreas que supervisa en el maestro local | «Nuevo ticket» de la consola no ofrece el canal Mi Portal, porque lo usa el cliente. El Coordinador CX no supervisa áreas y ya no ve tickets en la Bandeja. La Operación en vivo (HU-067, cuyo actor es el supervisor ATC) mantiene su regla: supervisor y coordinador ven todas las áreas | ¿El Coordinador CX ve la Bandeja? ¿El supervisor ve todas las áreas en la Operación en vivo o solo las que supervisa, como en la Bandeja? |
| **046** | Al entrar un ticket, si el responsable del flujo pasa del límite de carga, va al gestor disponible del área con menos carga ponderada, con el motivo REASSIGNMENT_CARGA. Sin nadie disponible, queda en la cola con alerta al supervisor | La habilidad no se usa, porque el PLT no la define | ¿Qué habilidades tiene cada gestor? |
| **048** | El asistente lista los criterios de cierre pendientes de la guía del ticket. Se activa a pedido y al elegir Resuelto o Cerrado. La sugerencia se acepta, se edita o se descarta. El ticket muestra el registro de decisiones sin texto ni datos personales | «Ir a cerrar» = elegir Resuelto o Cerrado en «Cambiar estado». El aviso va en el mismo diálogo, porque el diálogo bloquea el resto de la pantalla. La IA está simulada con reglas locales | ¿Cuándo se da por cumplido un criterio de la guía? |
| **031** | Ya no hay botones para generar informes. Al avanzar el reloj, se genera el diario al cierre de cada jornada hábil y el quincenal al cierre de cada quincena, con tendencias de SLA, CSAT, NPS y adopción de Mi Portal | Cierre de la jornada a las 18:00. Las quincenas son del 1 al 15 y del 16 a fin de mes. Adopción = % de tickets nuevos registrados en Mi Portal. No se agregó el envío a jefaturas, porque no está en los CA | ¿Hora de cierre, definición de quincena y de adopción? |
| **055** | «Plantilla de correo de asignación» en Mi día › Correos de asignación: con líder, sin líder (sale solo al gestor y se avisa al administrador) y el resumen de una reasignación masiva | El correo no lleva datos del cliente, por protección de datos. El envío en 1 minuto o menos depende del servicio real | ¿Qué datos del ticket lleva el correo? |
| **056** | El ticket de resolución por 3 meses impagos se deriva al flujo de Cobranza y Legal (el flujo del PO con el subtipo «General»): «Flujo de resolución» en el caso y «Actividades del flujo» en el ticket | El CA dice «se deriva»; no se agregó un aviso aparte a Legal | ¿La suspensión por reclamo frena también el flujo? |
| **057** | «Plantilla de alerta de cancelación» con los datos del caso y las constancias de envío | Ni el PLT-04 ni el artifact traen el texto: el texto, las consecuencias y el plazo dicen «Pendiente de Legal» | Texto de la alerta (Legal) |
| **066** | El SLA se pausa en «pendiente del cliente» y, al responder, los vencimientos se corren lo que duró la espera. El cierre automático lo hace el job, con los días hábiles configurables en Configuración › Cierre automático | 5 días hábiles es el valor inicial, y es un supuesto | ¿Cuántos días? ¿La pausa también corre el SLA de las actividades del flujo? |

Pruebas al cerrar el bloque 3:
- **En Node (`npm run probar`): 76 de 76 casos.** Mi Portal 14, flujos 9, Consulta 360 7, garantías 10, morosidad 6, SLA de
  Mi Portal 7, Eje 3 y Legal 6, Bandeja 9, asistente de IA 4 e informes 4.
- **En Chrome (`npm run recorrer`): 90 de 90 pasos.** Recorrido general 17, flujos 7, Consulta 360 10, Operación en vivo 9,
  garantías 6, morosidad 7, SLA de Mi Portal 8, Eje 3 5, Bandeja 8, asistente de IA 7 e informes 6.
- En todos los recorridos: sin errores de JS, consola ni red.

Un problema anterior, que no es de esta ronda: en móvil, la Torre de Control vista como Coordinador CX es más ancha que la
pantalla por sus cinco pestañas. Ya pasaba en el artifact del PO sin tocar.

### 5.9 Respuestas del equipo a las preguntas abiertas (20-oct)

Las contestó Brayan (Dev 1), una por una, el 20-oct-2026. Son la **propuesta del equipo**: las decide el PO en el comité. Solo 5
cambian el mockup; las demás confirman lo que ya hace.

| # | Tema (sección) | Respuesta | ¿Cambia el mockup? |
|---|---|---|---|
| 1 | Subtipo de los 4 flujos del PO (§5.7, HU-043) | Se quedan con «General». Donde la plataforma actual ya tiene el subtipo, se usa su nombre. En Mi Portal: «Estado de cuenta del lote», «Actualización de datos», «Copia legalizada de contrato» y «Otra solicitud». Se agrega el flujo «Consulta de cuenta · Estado de cuenta del lote» con los pasos del flujo del PO de Consulta de cuenta | **Sí** |
| 2 | Modo simulación del visor (§5.7, HU-067 CA-08) | Encendido por defecto | No |
| 3 | Correo al vencer el SLA (§5.7, HU-067 CA-03) | Al responsable, con copia a su líder (RN-SVC-035 y HU-055) | No |
| 4 | Áreas del supervisor en el visor (§5.8, HU-067 CA-07) | Todas las áreas en Operación en vivo; en la Bandeja, solo las que supervisa | No |
| 5 | Coordinador CX en la Bandeja (§5.8, HU-044 CA-03) | Sin Bandeja: trabaja en la Torre de Control CX | No |
| 6 | «Prioritario» (§5.8, HU-041 CA-02) | Prioridad Urgente, sin tocar el SLA | No |
| 7 | Paquete de handoff (§5.8, HU-027) | Solo al pasar a Eje 3 | No |
| 8 | Cuándo llega el caso a Legal (§5.8, HU-040 CA-01) | Al confirmar la derivación | No |
| 9 | «Derivar» en la excepción de la 360 (§5.7, HU-050 CA-08) | Derivar el ticket a otra área (HU-007) | No |
| 10 | «Etapa» del proyecto (§5.7, HU-050 CA-05) | El nombre del proyecto; se pregunta a Datos si hay un campo aparte | No |
| 11 | Adjuntos de la inspección (§5.7, HU-035) | JPG, PNG o PDF de hasta 10 MB, máximo 5, al menos una foto | No |
| 12 | Quién cierra el reclamo tras Legal (§5.7, HU-036) | Postventa registra el resultado | No |
| 13 | Habilidad en el reparto (§5.8, HU-046) | Sin habilidad por ahora; se pregunta al PO | No |
| 14 | Criterio de cierre cumplido (§5.8, HU-048) | Reglas simples: respuesta al cliente, asiento del Libro y confirmación (ticket cerrado); el resto lo decide el gestor | No |
| 15 | Informes (§5.8, HU-031) | Jornada que cierra a las 18:00, quincenas del 1 al 15 y del 16 a fin de mes, adopción = % de tickets nuevos registrados en Mi Portal | No |
| 16 | Correo de asignación (§5.8, HU-055) | Sin datos del cliente | No |
| 17 | Suspensión por reclamo (§5.8, HU-056 CA-03) | Frena el flujo del ticket: la actividad en curso no se cierra ni corre su SLA; al responderse el reclamo, su vencimiento se corre lo que duró la suspensión | **Sí** |
| 18 | Días para el cierre automático (§5.8, HU-066 CA-04) | 5 días hábiles, configurables | No |
| 19 | Pausa del SLA y actividades (§5.8, HU-066 CA-01) | La pausa en «pendiente del cliente» también corre el vencimiento de la actividad en curso | **Sí** |
| 20 | Código de acceso de Mi Portal (§5.2) | Al correo y al celular, 6 dígitos, 5 minutos, 3 intentos | No |
| 21 | Alta en Mi Portal (§5.2) | Lote → razón social y línea; prioridad Media; adjuntos JPG, PNG o PDF de hasta 10 MB, máximo 3; compromiso = vencimiento congelado o SLA del flujo | No |
| 22 | Textos y navegación de Mi Portal (§5.2) | Estados en voz del cliente, nombre del área, «Mis tickets» y «Nuevo ticket» junto a «Buses» | No |
| 23 | Línea «Servicios de ciudad» (§5.5) | Fuera | No |
| 24 | Pregunta NPS 0–10 en la encuesta (§4, P2) | Se quita: la encuesta es CSAT y CES (HU-019) y el NPS es el «NPS preliminar» del CSAT. P2 queda como propuesta para una HU futura | **Sí** |
| 25 | Áreas (§3) | El catálogo suma, a las del mockup, las áreas reales de la plataforma actual: Back Office, Legal Formalización, Legal Corporativo, Archivos, Proyectos, Marketing y Soporte Web. Se usan al derivar, en los flujos y en los filtros, sin gestores asignados. El visor no gana salas | **Sí** |
| 26 | Estilo de las entradas del visor (§1) | Terminales por defecto | No |
| 27 | Final del recorrido en el visor (§2) | No se hacen las 5 propuestas (no las pide la v1.3) | No |

**Referencia: el catálogo actual de la plataforma interna (Front Digital).** No está en el código: vive en la base de producción y
lo administra el supervisor de ATC desde el ERP. La foto más completa es un volcado del 21-jul-2026. Se revisó sin copiar datos de
personas.

| ATC v1.3 (PLT-04) | En la plataforma actual |
|---|---|
| Consulta de cuenta | Repartido en EE.CC (SOLICITUD DE EE.CC - LOTE, en el portal «Estado de cuenta del lote»), PAGOS, CONSTANCIA DE NO ADEUDO y BOLETAS Y/O TICKETS DE PAGO |
| Pedido simple | SOLICITUD DE INFORMACION (17 subtipos), ACTUALIZACION DE DATOS, COPIA LEGALIZADA DE CONTRATO, OTROS (en el portal «Otra solicitud») |
| Visita técnica | PROGRAMACION DE VISITA AL PROYECTO (visita al proyecto, no técnica) |
| Queja y Reclamo | Subtipos QUEJA y RECLAMO del tipo LIBRO DE RECLAMACION |
| Resolución de contrato | No existe; lo más cercano: DESISTIMIENTOS y CITA CON ASESOR LEGAL (Legal) |
| Garantía postventa, Ingreso a proyecto, Reserva de bus | No existen |
| Áreas Cobranza y Postventa | No existen; hoy hacen ese papel Back Office y Legal Formalización |

SLA en la plataforma actual: por tarea del flujo, en minutos; el tiempo del tipo es solo informativo. El portal solo ofrece un
subtipo marcado para el portal y con su flujo terminado.

**Preguntas que siguen abiertas para el comité:**
1. ¿El ATC nuevo hereda el catálogo de tipos, subtipos y áreas de la plataforma actual o adopta el del PLT-04 (con Cobranza y
   Postventa, que hoy no existen)? ¿Cuáles son las combinaciones tipo · subtipo · área del piloto y sus responsables?
2. ¿Cuál es el flujo por defecto de cada área (HU-043 CA-07)?
3. ¿Qué habilidades tiene cada gestor (HU-046)?
4. ¿Qué campo de SIGDA/TAXON es la «etapa» del proyecto (HU-050)?
5. Texto de la alerta de cancelación (HU-057, Legal).
6. Confirmar los supuestos de esta tabla que el PO quiera cambiar.

**Lo que cambió en el mockup con estas respuestas** (pruebas en `scripts/probar-decisiones.mjs`):
- **Mi Portal:** los subtipos con nombre real y el flujo «Consulta de cuenta · Estado de cuenta del lote». Un ticket de ese
  subtipo va a Cobranza con sus actividades.
- **Morosidad:** el ticket del caso suspendido tiene el flujo en pausa: «Cerrar la actividad» no aparece y el modelo lo
  rechaza. Al responderse el reclamo, la actividad recupera el tiempo que duró la suspensión.
- **Pausa del SLA:** en «pendiente del cliente», la actividad en curso también se pausa. Se ve «En pausa» en «Actividades del
  flujo».
- **Encuesta:** sin la pregunta 0–10, y la Torre sin la columna NPS ni la tabla «Por resultado del cierre».
- **Áreas:** las 7 áreas de la plataforma actual al derivar y en Configuración › Flujos, marcadas «plataforma actual».

### 5.10 Mejoras traídas de la rama de Daniel (20-oct): lo que contradice la v1.3

El equipo pidió traer todas las mejoras de la Consulta 360 y de la Operación en vivo de la rama `prototipo-polar`, que considera
aprobadas por el PO. Estas cuatro chocan con un criterio de la HU-067 v1.3 y se trajeron igual, por indicación expresa de Brayan.
El PO tiene que confirmarlas:

| Mejora | Qué dice la v1.3 |
|---|---|
| Velocidad 4× | CA-08: «pausa y velocidad (x1, x2)» |
| «Resolver» y «Reasignar a menor carga» desde la ficha del visor | Fuera de alcance: «reasignar desde el visor (se hace en la bandeja)» |
| Sala «Postventa (Eje 4)» | La v1.3 solo tiene los ejes 1 a 3 |
| «NPS del turno» con porcentajes fijos (72 % promotores, 18 % pasivos) | La Torre usa el «NPS preliminar» derivado del CSAT (§5.9, pregunta 24) |

**Pregunta para el PO: la decisión D-12 de esa rama.** Saca la HU-048 (IA al cerrar) y la HU-053 (búsqueda semántica) de la
Etapa 1. La tomó la sesión de trabajo de esa rama el 19-oct, no el PO, y los documentos del PO v1.3 siguen contando ambas HU
en la Etapa 1. Aquí no se aplicó: ¿el PO confirma que salen?

### 5.11 Decisiones de Brayan sobre la revisión del 20-oct

La revisión del 20-oct encontró que la Operación en vivo y la Consulta 360 traídas de Daniel no cumplen todos los criterios de
la v1.3 (detalle en `documentacion/cobertura-v1.3.md`). Brayan decidió:

| # | Pregunta | Decisión |
|---|---|---|
| 1 | La Operación en vivo de Daniel cumple solo el CA-10 de la HU-067 | Se completa la de Daniel con los 10 criterios, sin volver a la versión anterior |
| 2 | Las páginas de Daniel usan sus propios clientes y tickets | Usan los clientes y tickets del mockup; los datos de Daniel quedan como información adicional de ejemplo |
| 3 | La Consulta 360 de Daniel no respeta los permisos por rol | Se alinea con la v1.3: candado por rol (HU-050), el motor no devuelve datos sin permiso y registra el intento (HU-052), la búsqueda semántica dice «sin coincidencias» y sugiere palabras exactas (HU-053) |
| 4 | Cuándo se actualiza la cobertura | Al terminar estos arreglos |
| 5 | Quién sube el paquete a Nexora | Brayan sube los 119 documentos cuando dé la luz verde (ver `documentacion/paquete-definir-etapa1-v1.3/PLAN-NEXORA.md`) |

Las cuatro mejoras de §5.10 se mantienen, y el PO las tiene que confirmar.

Hecho el 20-oct. Supuestos que quedan para revisar:

- **Consulta 360, dato «no disponible»:** basta con que caiga una de sus fuentes, como en la pantalla de Daniel. En la pestaña
  Cliente del ticket tienen que caer todas.
- **Consulta 360 › Bandeja:** al venir de la 360, la Bandeja abre filtrada por el DNI del cliente. Si el rol no ve esos tickets
  (HU-044), no hay botón: se explica el motivo y se ofrece «Último ticket».
- **Consulta 360, textos de Daniel:** se ajustaron 3 que contradecían la v1.3 (estado de cuenta, exposición legal y motor).
- **Operación en vivo, rayo desde la ficha:** solo lo marca el supervisor, que es lo que permite el mockup (RN-SVC-031), con motivo
  y tope del 10 %.
- **Operación en vivo, CSAT del día:** la semilla no tiene encuestas de hoy, así que muestra «—» con el acumulado al lado.

### 5.12 Paquete completo en la v1.3 y merge de la rama de Daniel (21-oct)

- **Merge de `prototipo-polar` en esta rama** (52ee6f3, Daniel, 21-oct). Dejó en `propuesta-po` la copia que tenía polar, una foto del
  19-oct, y con eso se perdían del árbol el paquete v1.3, los documentos del PO, la cobertura, Mi Portal, la Operación en vivo y la
  Consulta 360 alineadas. Se restauró `propuesta-po` tal como estaba en 32eb628 y se conservó todo lo demás: el frontend Angular,
  `docs/`, el backend y los dos archivos que agregó Daniel. **Para hablar con Daniel y Michel:** `docs/` de esta rama ahora tiene el
  paquete de polar, que mezcla la v1.2 y la v1.3 e incluye la D-12. El paquete v1.3 completo está en
  `documentacion/paquete-definir-etapa1-v1.3/`.
- **Paquete completo.** Por encargo del PO a Brayan, se llevaron a la v1.3 las demás carpetas del paquete: análisis, roadmap, ADR,
  arquitectura, datos, backlog de tareas y gates. Valida con 0 errores y 0 advertencias. No se decidió nada que no esté en los
  documentos del PO: lo abierto está en `analisis/decisiones.md` (stack, `PARTY` frente a ADR-03, D-12, Excel, ítems y aprobaciones).
  Todavía no se subió a Nexora (ver `PLAN-NEXORA.md`).
