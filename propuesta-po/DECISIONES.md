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

> **Estado: aplicado en el what-if (cuarta ronda, ver README).** Mi Portal (HU-064, 065 y 066), la Etapa 2 fuera de la vista y lo pequeño
> que faltaba de la HU-067. Nada de esto está aprobado: el PLT-04 v1.3 está «Pendiente DoR» y el comité DoR es el 20-oct.

### 5.1 Cobertura del mockup frente al PLT-04 v1.3

De las 62 historias de la Etapa 1: **44 sí, 18 parcial, 0 no** (después de esta ronda; antes, HU-064, 065 y 066 eran «no»).
Las faltas que más pesan, por prioridad del plan:

| HU | Qué falta |
|---|---|
| **HU-043** (prioridad 1) | El flujo es por tipo, sin subtipo; no crea actividades en el ticket ni SLA por actividad; no calcula el SLA total; sin flujo por defecto ni alerta al administrador; sin bitácora de publicaciones |
| **HU-050** (prioridad 2) | La consulta 360 no deja rastro en la bitácora del ticket; a la ficha le faltan etapa, n.º de tickets y «datos visibles n de 16»; lo restringido no lleva candado; un DNI inexistente en el buscador del grafo no abre la excepción |
| **HU-067** (prioridad 3) | Ver §5.4 |
| HU-026 y 027 | «Cambiar estado › Escalado» pasa a Eje 3 sin gate de conflicto ni paquete mínimo de handoff; el aviso de handoff sin confirmar no se ve en ninguna pantalla |
| HU-044, 046, 048, 031, 040, 041, 055, 056, 057, 034, 035, 036 | Faltas acotadas a uno o dos criterios (detalle en la tabla de cobertura entregada aparte) |

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

### 5.4 HU-067 (visor 3D): qué falta frente a sus criterios

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
