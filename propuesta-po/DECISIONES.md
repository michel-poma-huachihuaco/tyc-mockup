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
