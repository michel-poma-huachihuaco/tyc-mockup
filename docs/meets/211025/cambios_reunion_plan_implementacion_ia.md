# Cambios de reunión: especificación de implementación para agente IA

## 1. Objetivo y fuente

Evolucionar el prototipo de Vista 360 del cliente, su grafo de navegación y el módulo Operaciones en Vivo para facilitar la gestión del asesor y el monitoreo de tickets.

- Fuente: `transcripcion_reunion_corregida.txt`, secciones 1–15.
- Fecha de elaboración de este documento: 22 de octubre de 2026. La fecha de la reunión no está indicada en la fuente.
- No se asignaron fechas de entrega ni responsables individuales por cambio.
- Este documento convierte la conversación en tareas verificables. Los criterios de aceptación y el orden de trabajo son una propuesta operativa; no constituyen acuerdos textuales adicionales.

## 2. Instrucción de ejecución para el agente

Actúa como ingeniero senior full stack con criterio de UX/UI. Inspecciona primero el repositorio, sus instrucciones locales, documentación funcional, historias de usuario, arquitectura e identidad visual. Reutiliza el stack, SDK, componentes, rutas y servicios existentes. No asumas tecnologías, rutas ni archivos que no hayas verificado.

1. Identifica qué requisitos ya están implementados, cuáles están parcialmente implementados y cuáles faltan.
2. Relaciona cada cambio con los archivos y módulos reales que será necesario modificar.
3. Implementa por incrementos funcionales, conservando los identificadores de este documento en el seguimiento.
4. Continúa con las tareas independientes cuando una dependencia esté pendiente. Solicita aclaración solo si una decisión impide ejecutar correctamente la tarea afectada.
5. Distingue en los resultados entre funcionalidad con datos de prueba e integración real. Si faltan contratos o servicios, utiliza el mecanismo de simulación del proyecto y declara la limitación.
6. No inventes políticas de negocio, SLA, permisos, umbrales de productividad ni datos de empresas y áreas.
7. Ejecuta las verificaciones aplicables del proyecto y pruebas centradas en los comportamientos modificados.
8. Entrega una matriz final por requisito: implementado, parcial, bloqueado, pendiente de decisión o ya existente, con evidencia y limitaciones.

## 3. Interpretación de estados

| Estado | Significado para la implementación |
| --- | --- |
| Incorporar | Dirección funcional recogida en la reunión y respaldada por el cierre general de aplicación de cambios. |
| Considerar | Propuesta acogida para consideración, sin especificación cerrada. Preparar una solución reversible consistente con el proyecto y documentar los supuestos. |
| Evaluar | No hay decisión final. Analizar y presentar una recomendación; no ejecutar una sustitución estructural por defecto. |
| Dependencia | Requiere información o recursos externos. Completar las partes independientes y registrar el bloqueo. |

El cierre general de la reunión no convierte todas las alternativas técnicas en decisiones aprobadas.

## 4. Vista 360 y grafo

### V360-01 — Últimos movimientos del cliente

**Estado:** considerar. **Fuente:** secciones 1 y 5.

Mostrar junto al grafo el contexto reciente del cliente. Se propuso una lista de los últimos cinco movimientos, incluyendo pagos, cuotas, reclamos u otras operaciones.

**Criterios de aceptación propuestos:**

- [ ] Al seleccionar un cliente, se muestran hasta cinco movimientos recientes, ordenados del más reciente al más antiguo.
- [ ] Cada elemento permite reconocer el tipo de movimiento y su resultado o estado cuando la fuente lo proporcione.
- [ ] Al cambiar de cliente, la lista corresponde al nuevo cliente y no conserva datos del anterior.
- [ ] Se contemplan clientes sin movimientos y con menos de cinco registros.

### GRA-01 — Accesos estables y disponibles sin actividad previa

**Estado:** incorporar. **Fuente:** secciones 5 y 8.

Mantener los accesos principales en posiciones consistentes. Mostrar las opciones aplicables aunque el cliente no tenga operaciones previas, para que el asesor pueda iniciar nuevas gestiones.

**Criterios de aceptación propuestos:**

- [ ] Los accesos principales conservan su ubicación al cambiar de cliente o su volumen de operaciones.
- [ ] La ausencia de reclamos o movimientos no elimina el acceso correspondiente cuando el usuario tiene permiso para utilizarlo.
- [ ] Se distingue un acceso disponible sin registros de una funcionalidad no disponible.
- [ ] Se respeta el esquema de permisos existente; la visibilidad estable no concede permisos adicionales.
- [ ] El tamaño dinámico por actividad no altera esta primera entrega.

Las posiciones derecha/izquierda mencionadas en la reunión fueron ejemplos, no un mapa obligatorio.

### GRA-02 — Navegación y consulta operativa

**Estado:** incorporar/completar; parte de la interacción ya se mostró en el prototipo. **Fuente:** secciones 3, 4 y 6.

Permitir consultar detalles por lote y acceder a las funciones relacionadas desde nodos principales y secundarios. Vincular el inicio de tickets o reclamos con la bandeja correspondiente cuando aplique.

**Criterios de aceptación propuestos:**

- [ ] Los nodos secundarios consultables abren información del lote y cliente seleccionados.
- [ ] Los nodos principales ofrecen accesos relacionados organizados de forma consistente.
- [ ] La selección de saldo presenta saldo e intereses moratorios si existen en el contrato de datos.
- [ ] Una acción de nueva gestión utiliza el flujo existente de tickets o reclamos, conservando el contexto disponible del cliente/lote.
- [ ] No hay accesos que aparenten funcionar y terminen sin respuesta; si falta una integración, se comunica su estado.

### GRA-03 — Relaciones y contexto del caso

**Estado:** incorporar la utilidad funcional; considerar el resaltado visual. **Fuente:** secciones 3, 4 y 6.

Definir atributos, propiedades y reglas de recorrido y consulta que permitan identificar áreas y procesos asociados. Al seleccionar un reclamo o nodo relacionado, resaltar su contexto en el propio grafo.

**Criterios de aceptación propuestos:**

- [ ] Los nodos y relaciones tienen identidad y tipo definidos, de acuerdo con el modelo existente.
- [ ] La consulta de relaciones permite reconocer las áreas/procesos vinculados con el elemento seleccionado.
- [ ] Los elementos asociados se distinguen visualmente al seleccionar un nodo, sin depender exclusivamente de un panel lateral.
- [ ] Cambiar o limpiar la selección actualiza el resaltado.
- [ ] Las relaciones se basan en datos o reglas explícitas; no se infieren asociaciones de negocio sin respaldo.

### GRA-04 — Empresas, áreas y menús

**Estado:** incorporar, con dependencia de catálogo. **Fuente:** sección 8.

Representar las dos empresas y doce áreas mencionadas, vinculando sus opciones de menú. Se indicó que se compartiría el catálogo y sus relaciones.

**Criterios de aceptación propuestos:**

- [ ] El catálogo y las relaciones se reutilizan de la fuente del proyecto o se configuran fuera de la lógica de renderizado.
- [ ] No se inventan los nombres de áreas ni su distribución entre empresas.
- [ ] La representación definitiva se valida contra el catálogo recibido.

**Dependencia:** catálogo completo de empresas, áreas y menús. Los ejemplos mencionados no constituyen el catálogo completo.

## 5. Búsqueda e identidad visual

### BUS-01 — Búsqueda por similitud fonética

**Estado:** considerar; solución técnica por definir. **Fuente:** sección 7.

Ampliar la búsqueda de nombres/apellidos para encontrar variantes de sonido similar. Ejemplo expresado: buscar `Alvan` y poder encontrar `Alban` o `Halban`.

**Criterios de aceptación propuestos:**

- [ ] Se conserva la búsqueda existente por nombre y documento/DNI.
- [ ] Se cubre el ejemplo fonético con datos controlados y se revisan falsos positivos con un conjunto representativo.
- [ ] Se documentan el algoritmo elegido, la normalización, el criterio de similitud y las limitaciones.
- [ ] Se comprueba el comportamiento con un volumen representativo de miles de registros y se informa la medición, sin inventar un SLA.
- [ ] La búsqueda identifica de forma inequívoca al cliente seleccionado antes de actualizar la Vista 360.

**Restricciones:** la reunión no aprobó un algoritmo ni exigió una base vectorial o embeddings. La actualización a partir del tercer carácter describe el prototipo actual, no un nuevo umbral acordado.

### UI-01 — Mascota/asistente Tigo Aybar

**Estado:** considerar incorporación, con dependencia de recursos. **Fuente:** sección 9.

Integrar el personaje gráfico oficial en el módulo de manera coherente con la identidad visual existente.

**Criterios de aceptación propuestos:**

- [ ] Se utilizan recursos oficiales compartidos por el equipo.
- [ ] Su ubicación y tamaño respetan el sistema visual y no impiden operar los controles.
- [ ] La presencia del personaje no se presenta como un asistente conversacional funcional si no existe esa capacidad.

**Dependencia:** recursos gráficos. La protección legal del personaje es un asunto externo; no constituye una tarea de implementación.

## 6. Operaciones en Vivo y tickets

### OPE-01 — Vista Monitor con actualización automática

**Estado:** considerar como ampliación del módulo. **Fuente:** sección 11.

Agregar una opción `Monitor` que abra una vista ampliada, legible a distancia y apta para proyectarse en una pantalla o televisor compatible.

**Criterios de aceptación propuestos:**

- [ ] El usuario abre la vista desde Operaciones en Vivo.
- [ ] Los indicadores se actualizan sin clics ni recarga manual.
- [ ] La vista muestra reclamos ingresados y resueltos del día, tickets acumulados por área y tiempos promedio cuando existan datos y definiciones disponibles.
- [ ] Se visualiza el volumen atendido por persona y su comparación con un promedio definido.
- [ ] Los estados se comunican de forma legible; el color no es el único medio de interpretación.
- [ ] La pérdida de actualización se hace visible para no presentar datos desactualizados como actuales.
- [ ] Se verifica la legibilidad en un formato de pantalla grande y la compatibilidad dentro del alcance real del proyecto.

**Decisiones de implementación pendientes:** mecanismo e intervalo de actualización, definición de cada promedio, zona horaria del corte diario, periodo de comparación y umbrales de colores. Reutilizar definiciones existentes si están documentadas; no deducir bajo desempeño de una persona solo por su número de tickets.

La reunión mencionó una PWA y uso desde varios dispositivos, pero no cerró requisitos de instalación, funcionamiento sin conexión, televisores concretos ni mecanismo de tiempo real. No convertir esa mención en una migración de arquitectura obligatoria.

### TIC-01 — Repositorio central y bandeja de tickets

**Estado:** incorporar/continuar. **Fuente:** secciones 6 y 12.

Centralizar los tickets y su distribución a las áreas, incluyendo los casos de libro de reclamaciones y garantías de posventa.

**Criterios de aceptación propuestos:**

- [ ] La bandeja utiliza una fuente lógica central de tickets y permite consultar su área y estado.
- [ ] La distribución sigue las reglas existentes; las reglas ausentes se documentan como pendientes.
- [ ] Se contemplan los tipos de caso indicados sin inventar sus flujos especiales.

La expresión «tabla maestra» describe la centralización deseada; no obliga a concentrar toda la persistencia física en una única tabla.

### TIC-02 — Detalle, trazabilidad y estados

**Estado:** incorporar/completar; varias capacidades ya fueron descritas en la demostración. **Fuente:** secciones 6 y 10.

**Criterios de aceptación propuestos:**

- [ ] El detalle muestra número de ticket, cliente, canal de entrada, área/sala y responsable.
- [ ] Se consulta el recorrido del workflow y el responsable de cada actividad.
- [ ] Se muestran los SLA disponibles sin inventar duraciones o reglas de cálculo.
- [ ] Se visualizan los estados abiertos, cerrados y elevados al comité según el modelo real del sistema.
- [ ] El rayo identifica prioridad alta. No dispara una escalación automática por su sola presencia.

**Límite de alcance:** el orquestador de asignación automática por capacidad y disponibilidad fue descrito durante la presentación. Revisar si ya existe; no asumir que esta reunión definió un nuevo algoritmo de reparto.

### MOR-01 — Contexto de morosidad para el asesor

**Estado:** considerar; regla contractual pendiente de validación. **Fuente:** sección 13.

Facilitar al asesor responsable del ticket la consulta de información sobre mora, posible disolución contractual y etapa de negociación entre el cliente e Iver.

**Criterios de aceptación propuestos:**

- [ ] La funcionalidad se dirige al asesor responsable, respetando los permisos del proyecto.
- [ ] Se integra con el contexto del ticket y cliente correspondiente.
- [ ] La condición mencionada se conserva como «más de tres cuotas»; no se transforma en «tres meses» ni en «tres o más cuotas».
- [ ] No se implementa una disolución automática ni una decisión contractual basada en esta transcripción.
- [ ] La regla definitiva y el flujo de negociación quedan documentados una vez validados por negocio.

**Dependencia:** validación contractual de la condición y especificación del flujo. Puede avanzarse en la estructura de consulta con datos explícitamente simulados, sin activar consecuencias contractuales.

## 7. Accesos favoritos

### FAV-01 — Favoritos personales de menú

**Estado:** considerar; el equipo indicó que tomaría en cuenta la propuesta. **Fuente:** sección 14.

Permitir marcar accesos mediante un corazón y recuperarlos desde una sección visible en la parte superior.

**Criterios de aceptación propuestos:**

- [ ] El asesor puede marcar y desmarcar una opción como favorita.
- [ ] La sección superior permite abrir los accesos marcados sin buscarlos en el menú.
- [ ] El corazón representa favoritos, no prioridad ni urgencia.
- [ ] No se mezclan favoritos entre asesores.

**Por precisar:** se mencionaron «los últimos cinco favoritos» como referencia. El límite, orden y persistencia no quedaron cerrados. Reutilizar las preferencias del proyecto; en ausencia de una definición, documentar la opción reversible elegida y no eliminar favoritos al superar cinco.

## 8. Evaluaciones y mejoras posteriores

| ID | Tema | Acción permitida y límite |
| --- | --- | --- |
| EVA-01 | Three.js, Canvas y vistas 2D/3D | Medir el prototipo existente y comparar opciones. No sustituir Three.js ni añadir un selector obligatorio sin una decisión sustentada. La opción 2D ya se mencionó como existente. |
| EVA-02 | Tamaño de nodos según actividad | Tratar como segunda fase. Definir antes la métrica de volumen y su escala visual; conservar posiciones estables. |
| EVA-03 | Similitud fonética | Seleccionar la técnica después de inspeccionar datos, backend y restricciones. No equiparar automáticamente fonética con búsqueda vectorial. |
| EVA-04 | Expresión «convolución de una red neuronal» | No derivar requisitos técnicos: el significado en el contexto del grafo quedó ambiguo. |
| EVA-05 | PWA | Revisar capacidades existentes y concretar alcance antes de incorporar instalación u otras capacidades adicionales. |

## 9. Dependencias externas y coordinación

| Dependencia | Requisitos afectados | Tratamiento |
| --- | --- | --- |
| Catálogo de dos empresas, doce áreas y opciones relacionadas | GRA-01, GRA-02, GRA-04 | Reutilizar configuración real disponible; registrar faltantes. |
| Referencia visual compartida en la reunión | V360-01, GRA-01 | Consultarla si está disponible; este documento no reproduce su contenido. |
| Recursos oficiales de Tigo Aybar | UI-01 | No inventar una versión definitiva del personaje. |
| Validación contractual y flujo de negociación | MOR-01 | Bloquear consecuencias contractuales hasta disponer de la regla validada. |
| Definiciones de indicadores, promedios y SLA | OPE-01, TIC-02 | Reutilizar reglas documentadas o registrar la decisión faltante. |

Se mencionó una siguiente revisión con Giuliano y coordinar con mayor anticipación para que Kevin pueda participar como observador. No hay fecha acordada. Estos puntos son de coordinación humana y no autorizan al agente a enviar invitaciones o mensajes.

## 10. Secuencia recomendada de trabajo

Esta secuencia es una propuesta de implementación, no una priorización aprobada en la reunión.

1. **Diagnóstico:** revisar documentación, prototipo, servicios y datos; elaborar matriz de brechas y dependencias.
2. **Vista 360:** V360-01 y GRA-01; completar navegación y relaciones con GRA-02 y GRA-03; integrar el catálogo validado de GRA-04.
3. **Gestión:** completar TIC-01 y TIC-02; añadir FAV-01; preparar MOR-01 según las dependencias disponibles.
4. **Monitoreo:** implementar OPE-01 sobre las fuentes y métricas verificadas.
5. **Mejoras condicionadas:** resolver BUS-01 y UI-01; ejecutar las evaluaciones técnicas necesarias sin incorporarlas automáticamente al alcance.

## 11. Verificación y condiciones de finalización

- [ ] Se contrastó cada requisito con el código existente para evitar reimplementar capacidades ya demostradas.
- [ ] Los cambios siguen el sistema visual y las convenciones del repositorio.
- [ ] Se verificaron cambio de cliente, cliente sin actividad y navegación con contexto de lote/ticket.
- [ ] Se comprobaron favoritos por asesor y acceso a funciones según permisos existentes.
- [ ] Se verificó que Monitor actualiza datos sin interacción y comunica fallos de actualización.
- [ ] Se validaron los casos fonéticos si BUS-01 se implementó y se documentaron sus mediciones.
- [ ] Se ejecutaron los checks aplicables y se reportaron los resultados reales.
- [ ] No se presentan datos simulados como integración productiva ni dependencias pendientes como funcionalidad terminada.
- [ ] Las decisiones pendientes permanecen visibles con su impacto concreto.

### Formato del informe de cierre del agente

| ID | Estado final | Cambio y evidencia | Verificación | Dependencia o decisión pendiente |
| --- | --- | --- | --- | --- |
| ID del requisito | Implementado / parcial / ya existente / bloqueado / pendiente de decisión | Archivos reales y comportamiento entregado | Comando o comprobación y resultado | Descripción concreta o «ninguna» |

Finaliza cuando las tareas ejecutables estén implementadas y verificadas, y las tareas condicionadas tengan su bloqueo o decisión claramente identificado. No declares completo un requisito que solo tenga una interfaz simulada cuando requiera una integración real pendiente.
