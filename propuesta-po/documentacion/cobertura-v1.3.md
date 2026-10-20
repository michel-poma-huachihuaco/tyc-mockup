# Cobertura del mockup frente al PLT-04 v1.3 (Etapa 1)

Al 20-oct-2026, después de la quinta ronda (ver `../DECISIONES.md` §5.7): **50 historias completas, 12 parciales y 0 sin pantalla**, de 62.
Una historia es «completa» cuando el mockup permite comprobar cada uno de sus criterios de aceptación; «parcial» dice qué criterio falta.

Responsable según el plan v1.3: Dev 1 Brayan, Dev 2 Jesús, Dev 3 Michel, Dev 4 Daniel.

## EP-ATC-01 · Núcleo de tickets omnicanal

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 001 | Registrar un ticket tipificado desde cualquier canal | 1 | **completa** | #/nuevo · Ver como: Gestor de tickets (CA-04: Ver como «Rol sin atención»; el intento se ve en Simulación › «Auditoría: intentos rechazados») | — |
| 002 | Entregar al cliente un número de ticket por razón social | 1 | **completa** | #/nuevo (diálogo «Ticket registrado» con «Copiar el número») y #/ticket/tk-15 (cabecera AIN-000482) · Ver como: Gestor de tickets; CA-03 en Simulación › Pruebas de reglas › «Dos guardados simultáneos» | — |
| 004 | Cambiar el estado del ticket con historial inmutable | 1 | **completa** | #/ticket/tk-15 (cerrado) › «Cambiar estado» y pestaña «Historial de estados» · Ver como: Colaborador de área; CA-02 en Simulación › «Intentar editar la última fila del historial de estados» | — |
| 005 | Registrar interacciones visibles o internas con evidencia | 1 | **completa** | #/ticket/tk-592 (sin respuestas) › Interacciones › «Registrar interacción» y «Ver como el cliente» · Ver como: Colaborador de área | — |
| 006 | Conservar los hitos temporales probatorios | 1 | **completa** | #/ticket/tk-57 (reabierto 2 veces) y #/ticket/tk-15 (cerrado) › tarjeta «Compromisos SLA e hitos» · Ver como: Supervisor ATC | — |

## EP-ATC-02 · Enrutamiento, SLA y alertas

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 003 | Congelar el SLA del ticket al abrirlo | 2 | **completa** | #/nuevo · Ver como: Gestor de tickets (panel «SLA que se congelará»; Simulación › Apertura del próximo ticket › «Caso feriado: vie 26-jun-2026, 18:00»); #/politicas y #/alertas («Alertas de configuración») · Ver como: Supervisor ATC | — |
| 007 | Derivar un ticket a otra área con motivo tipificado | 2 | **completa** | #/ticket/tk-460 · Ver como: Gestor de tickets («Derivar» y pestaña «Derivaciones») | — |
| 008 | Reasignar en bloque los tickets de un colaborador que cesa | 2 | **completa** | #/reasignar · Ver como: Supervisor ATC (Renato Salazar tiene 12 pendientes; otros roles ven «sin permiso» y no tienen el enlace) | — |
| 009 | Ver mi casillero de tareas por área y responsable | 2 | **completa** | #/bandeja · Ver como: Colaborador de área (pestañas «Míos», «Mi área», «Sin asignar» y chip «En riesgo o vencidos») | — |
| 010 | Recibir una sola alerta por incumplimiento de SLA | 2 | **completa** | #/alertas · Ver como: Supervisor ATC («Ejecutar el job ahora» y Simulación › reloj); pestaña «Alertas SLA» en #/ticket/tk-57 | — |
| 011 | Reabrir un ticket con un nuevo compromiso sin borrar el original | 2 | **completa** | #/ticket/tk-57 (reabierto 2 veces) y #/ticket/tk-174 (cerrado: «Cambiar estado › Reabierto») · Ver como: Gestor de tickets | — |
| 029 | Medir el cierre end-to-end de la experiencia | 2 | **completa** | #/cierre · Ver como: Coordinador CX (tarjeta «Cierre end-to-end» también en #/ticket/tk-73 y #/ticket/tk-90) | — |

## EP-ATC-03 · Libro de Reclamaciones y apelaciones

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 012 | Registrar el asiento del Libro de Reclamaciones | 1 | **completa** | #/ticket/tk-528 › tarjeta «Libro de Reclamaciones» › «Registrar asiento», y #/libro · Ver como: Responsable legal de reclamos; CA-03 en Simulación › «Intentar cambiar la razón social de ALT-CAR-0042» | — |
| 013 | Calcular el plazo legal y gestionar la prórroga única | 1 | **completa** | #/libro/as-48 («Prorrogar 15 días»; tras prorrogar queda deshabilitado) y #/libro/as-34 (plazo original vencido) · Ver como: Responsable legal de reclamos; CA-02 en Simulación › «Intentar modificar el vencimiento prorrogado de ALT-CAR-0042» y tarjeta «Historial del plazo» | — |
| 014 | Registrar la respuesta formal con cargo | 1 | **completa** | #/libro/as-48 › «Registrar respuesta» (respuesta ya registrada: #/libro/as-20) · Ver como: Responsable legal de reclamos | — |
| 015 | Vigilar el plazo legal y detectar reclamos huérfanos | 1 | **completa** | #/libro (pestañas «Alertas legales» y «Huérfanos»; tk-528 huérfano) · Ver como: Responsable legal de reclamos; Simulación › «Ejecutar el job ahora» o «+1 día hábil» | — |
| 016 | Dar seguimiento a apelaciones internas y ante INDECOPI | 1 | **completa** | #/libro/as-6 (apelación ante INDECOPI en revisión › «Cambiar estado») y #/libro/as-20 (apelación desistida) › tarjeta «Apelaciones» del asiento · Ver como: Responsable legal de reclamos | — |

## EP-ATC-04 · Gate legal Eje 3 y Mesa de Casos sensibles

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 020 | Registrar un caso sensible con Código Único | 2 | **completa** | #/mesa («Registrar caso») y #/mesa/cas-367 («Reclasificar a reclamo formal») · Ver como: Gestora de la Mesa SGD | — |
| 021 | Emitir cargo previo y cargo de activación por separado | 2 | **completa** | #/mesa (pestaña «En limbo»: SGD-2026-000321) y #/mesa/cas-576 («Emitir cargo de activación») · Ver como: Gestora de la Mesa SGD | — |
| 022 | Clasificar el riesgo del caso con matriz objetiva | 2 | **completa** | #/mesa/cas-367 (clasificar) y #/mesa/cas-123 (recalibrar riesgo medio) · Ver como: Gestora de la Mesa SGD | — |
| 023 | Escalar en cadena un caso que incumple su SLA | 2 | **completa** | #/mesa (pestaña «Escalamientos») y #/mesa/cas-134 (en Comité: «Cerrar el caso») · Ver como: Gestora de la Mesa SGD; Simulación › reloj | — |
| 024 | Validar casos cruzados o vinculados antes de registrar | 2 | **completa** | #/mesa › «Registrar caso» con el cliente de SGD-2026-000323 (cli-022) · Ver como: Gestora de la Mesa SGD; hilo compartido en #/mesa/cas-484 | — |
| 025 | Cerrar el caso con estado homologado y evidencia | 2 | **completa** | #/mesa/cas-484 («Cerrar el caso») · Ver como: Gestora de la Mesa SGD | — |
| 026 | Bloquear la resolución en Eje 1/2 ante señal de conflicto | 2 | parcial | #/ticket/tk-73 (señal «Intervención de abogado», Eje 2) · Ver como: Gestor de tickets; retiro de la señal · Ver como: Supervisor ATC | CA-01 y CA-02: con la señal activa, «Cambiar estado › Escalado» sigue habilitado: el ticket pasa a Eje 3 sin handoff y sin cambiar de área (tk-73 sigue en Postventa), y como el gate solo mira eje ≠ 3, quien lo tenía puede resolverlo después. El bloqueo de Eje 1/2 se esquiva sin pasar por Legal. |
| 027 | Armar el paquete mínimo de handoff y confirmar su recepción | 2 | parcial | #/ticket/tk-73 · Ver como: Gestor de tickets («Derivar a Eje 3»); #/ticket/tk-423 · Ver como: Responsable legal de reclamos («Confirmar recepción») | CA-01: el paquete de 6 elementos solo se pide en «Derivar a Eje 3», que aparece únicamente con señal de conflicto; «Cambiar estado › Escalado» pasa cualquier ticket (con o sin señal) a Eje 3 sin paquete ni handoff. CA-03: el job registra el aviso HANDOFF_SIN_CONFIRMAR para Roberto Castillo (colaborador de Legal), pero ninguna pantalla lo muestra: solo el contador del job y la etiqueta «jefatura avisada» del detalle. |
| 028 | Registrar la nota de estado emocional sin juicios de valor | 2 | **completa** | #/ticket/tk-73 · Ver como: Gestor de tickets («Nota de estado emocional»); nota y aviso de vocería visibles en #/ticket/tk-90 | — |

## EP-ATC-05 · Postventa: reclamos de garantía

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 033 | Registrar un reclamo de garantía vinculado a la entrega | 1 | **completa** | #/garantias › «Registrar reclamo» · Ver como: Supervisor ATC (el «Colaborador de área» de Ver como es de Cobranza y solo lee) | — |
| 034 | Validar la vigencia de la garantía contra la cobertura | 1 | **completa** | #/garantias/gar-249 (GAR-0087: motivo informado al cliente) · Ver como: Supervisor ATC o Postventa | — |
| 035 | Registrar la inspección técnica antes de resolver | 1 | **completa** | #/garantias/gar-585 › «Registrar la inspección» (informe, fotos JPG/PNG y PDF) | — |
| 036 | Escalar la garantía a Eje 3 y gestionar la adenda | 1 | **completa** | #/garantias/gar-314 › «Registrar carta notarial» (vincula el ticket y bloquea «Resolver») | — |

## EP-ATC-06 · Autogestión del cliente y trazabilidad (Mi Portal)

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 064 | Registrar y consultar mis tickets en Mi Portal | 4 | **completa** | #/portal (acceso con DNI y código; luego Mis tickets) y #/portal/nuevo · Herramientas › Ver como › Cliente convocado (Mi Portal) o directo por URL | Ningún CA sin cubrir (nuevo en la cuarta ronda; antes: no). Matiz CA-01: la fecha de compromiso es el vencimiento de resolución congelado con la política SLA (HU-003); el flujo (HU-043) decide área y gestor, pero el prototipo no calcula el SLA total del flujo (HU-043 CA-05). Simulado: el código de un solo uso se muestra en pantalla y los adjuntos no se suben. Supuestos (preguntas abiertas del PLT-04): tipos y subtipos para el cliente, formatos de adjunto, razón social y línea derivadas del lote. |
| 065 | Ver la trazabilidad de mi ticket | 4 | **completa** | #/portal/ticket/<id> (p. ej. tk-272 de Ana Inga, DNI 95638594) · mismo acceso | Ningún CA sin cubrir (nuevo en la cuarta ronda; antes: no; solo existía la vista previa «Así lo ve el cliente en Mi Portal» del detalle de la consola). Simulado CA-02: los avisos por correo y WhatsApp se derivan de la bitácora de estados y se listan en el detalle; no se envía nada. Pregunta abierta: nombre del área o genérico (se muestra el área; ATC = «Atención al cliente»). |
| 066 | Responder, adjuntar y confirmar la solución de mi ticket | 4 | parcial | #/portal/ticket/tk-272 (responder) y #/portal/ticket/tk-308 (confirmar o rechazar; Pedro Chávez, DNI 94805186) · mismo acceso | Nuevo en la cuarta ronda (antes: no; el cierre formal solo lo registraba el gestor). CA-01: la respuesta queda visible y el ticket vuelve a «en atención», pero el prototipo no pausa el SLA en «pendiente del cliente», así que «el SLA se reanuda» no tiene efecto. CA-04: el cierre automático se simula con un botón («Simular que venció el plazo»); no hay job ni parámetro configurable de días hábiles (5 es un supuesto; pregunta abierta del PLT-04). |

## EP-ATC-07 · Calidad de atención y Torre de Control CX

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 019 | Disparar la encuesta al cerrar el ticket | 3 | **completa** | #/ticket/tk-308 › Cambiar estado › Cerrado (y Reabierto → Resuelto → Cerrado) · Ver como: Gestor de tickets; resultados en #/torre › Encuestas · Ver como: Supervisor ATC | — |
| 030 | Monitorear en tiempo real y corregir antes del incumplimiento | 3 | **completa** | #/torre › Tablero · Ver como: Coordinador CX | — |
| 031 | Generar el informe diario y el quincenal | 3 | parcial | #/torre › Informes · Ver como: Coordinador CX | CA-02: el quincenal da valores puntuales (tickets abiertos en la quincena, encuestas respondidas, NPS) y solo una serie semanal de adopción de Mi Portal (ficticia); no muestra tendencias de los KPI (SLA, CSAT, NPS) en la quincena. Además los informes se generan a mano con un botón: no hay corte automático al cierre ni envío a jefaturas o Comité. |
| 032 | Auditar registros paralelos del dato de cliente | 3 | **completa** | #/torre › Auditoría de datos · Ver como: Coordinador CX (hallazgo: Herramientas › Simulación › «Crear un registro paralelo del dato de cliente» y volver a ejecutar) | — |

## EP-ATC-08 · EntregaFest: contención y derivación en vivo

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 037 | Registrar el riesgo verbal y la secuencia de Frases Ancla | 1 | **completa** | #/fest › caso EF-001 › «Aplicar la Frase N» (en orden) y «Cerrar el tema en sala» · Ver como: Moderador de evento | — |
| 038 | Derivar de inmediato a la Estación 4 sin debate | 1 | **completa** | #/fest › «Registrar caso» con «estafa», «fraude», «abuso» o «delito»; caso EF-002 (derivado) › «Intentar reabrir» · Ver como: Moderador de evento | — |
| 039 | Registrar el caso con la etiqueta estándar | 1 | **completa** | #/fest › tabla «Registro de casos» (columnas Etiqueta y «¿Derivado a la Estación 4?») · Ver como: Moderador de evento (registra) y Coordinador CX (revisa) | — |

## EP-ATC-09 · Bandeja orquestadora y asistencia al gestor

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 043 | Configurar el flujo de trabajo de un tipo de ticket por área | 3 | **completa** | #/configuracion › Flujos (Ver como: Administrador funcional), #/nuevo (tipo y subtipo) y el detalle del ticket › «Actividades del flujo» | — |
| 044 | Trabajar desde una bandeja única ordenada por urgencia | 3 | parcial | #/bandeja · Ver como: Gestor de tickets (Supervisor ATC para «Todas las áreas»); entrada sin responsable: Herramientas › Simulación › «Simular un ticket entrante por Mi Portal» | CA-01: desde la cuarta ronda los tickets que el cliente registra en #/portal/nuevo llegan con canal «Mi Portal» y sin responsable si su tipo no tiene flujo; el botón «Simular un ticket entrante por Mi Portal» del panel de simulación sigue usando canal Correo (no se tocó), y «Nuevo ticket» de la consola no ofrece ese canal (el orden rayo → SLA → prioridad sí está). CA-03: el gestor solo ve su área, pero el Supervisor ATC (y el Coordinador CX) ven «Todas las áreas», no solo las que supervisan. |
| 045 | Marcar un ticket crítico con el rayo de prioridad | 3 | **completa** | #/ticket/tk-450 (panel «Rayo de prioridad») y #/bandeja · Ver como: Supervisor ATC | — |
| 046 | Reasignar automáticamente al gestor con menos carga | 3 | parcial | #/midia › Equipo › «Balancear la carga» y columna «Disponible» · Ver como: Supervisor ATC (no está en la Bandeja) | CA-01: el balanceo no corre cuando entra un ticket nuevo: es un botón a pedido que mueve tickets ya asignados de quien supera 12 puntos de carga; el ticket que entra por flujo va al responsable del flujo aunque esté saturado. Solo considera el área, no la habilidad (sí registra REASSIGNMENT_CARGA y elige al disponible con menos carga ponderada). |
| 047 | Consultar la guía de solución del tipo de ticket | 3 | **completa** | #/ticket/tk-450 (panel «Guía de solución»; sin guía: #/ticket/tk-308) · Ver como: Gestor de tickets; versiones y alertas en #/configuracion › Guías / Alertas · Ver como: Administrador funcional | — |
| 048 | Recibir retroalimentación de IA mientras atiendo y cierro | 3 | parcial | #/ticket/tk-450 › asistente de IA flotante (robot, abajo a la derecha) · Ver como: Gestor de tickets; decisiones en Herramientas › Simulación › Telemetría (sugerencia_ia) | CA-01: el asistente solo actúa a pedido (no se activa al ir a cerrar); «Siguiente paso › Para cerrar» lista criterios fijos por tipo, no los pendientes del ticket ni los de su guía; la sugerencia no se edita en el asistente (Insertar / Copiar / Descartar), y «EDITADA» solo se registra con «Usar la versión corregida» al revisar un borrador. CA-02: se registra sin texto ni datos personales, pero el ticket ya no muestra el registro de decisiones (solo la telemetría del panel Simulación). |
| 054 | Ver mi avance diario y el de mi equipo | 3 | **completa** | #/midia › Mi día · Ver como: Gestor de tickets; #/midia › Equipo · Ver como: Supervisor ATC | — |
| 055 | Recibir un correo al asignarme un ticket, con copia a mi líder | 3 | parcial | #/midia › Correos de asignación · Ver como: Gestor de tickets (aviso de líder faltante: Ver como: Administrador funcional) | Pantalla: no hay «Plantilla de correo de asignación»; solo una lista de correos enviados (para, copia, asunto y tickets), sin cuerpo del correo. CA-03: resuelto en la cuarta ronda (los textos dicen «maestro local de ATC»). El envío en 1 min o menos no se simula (depende del servicio de correo). |
| 067 | Ver el proceso de atención en un visor 3D (operación en vivo) | 3 | **completa** | #/vivo › «Operación en vivo» (modo simulación en Herramientas › Simulación; tocar un área o su nombre en «Por área») | — |

## EP-ATC-10 · Consulta 360 e integraciones operativas

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 040 | Sincronizar con Legal los tickets derivados a Eje 3 | 4 | parcial | #/ticket/tk-90 (tarjeta «Sincronización con Legal»: LEG-0001, paquete 6 de 6) y #/ticket/tk-73 («Derivar a Eje 3»; con Simulación › «Herramienta de Legal no disponible» queda «Pendiente de sincronizar») · Ver como: Gestor de tickets; Simulación › «Legal resuelve el último caso enviado» | CA-02: solo se puede simular «Legal resuelve el último caso enviado» (el ticket pasa a Resuelto con la nota de Legal); el estado intermedio «En revisión en Legal» existe en el modelo pero no hay forma de dispararlo, así que una actualización que no sea la resolución no se ve. No hay pestaña Legal: el estado se ve en una tarjeta lateral del ticket. |
| 041 | Priorizar los reclamos con riesgo de denuncia por su exposición | 4 | parcial | #/torre › pestaña «Riesgo de denuncia» · Ver como: Coordinador CX; #/ticket/tk-90 (tarjeta «Exposición económica»: monto del Libro + interés legal) y #/ticket/tk-73 («Por estimar») | CA-02: el job alerta a Legal cuando la exposición llega a S/ 500 («Legal ya fue alertado» en el ticket y «Alerta a Legal · Enviada» en la Torre), pero el ticket no se marca como prioritario: su prioridad no cambia (tk-90 sigue en Media) ni recibe rayo; solo lleva la etiqueta «Riesgo de denuncia» y se ordena por exposición en la Torre. |
| 042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | 4 | **completa** | Cualquier pantalla (panel «Llamada entrante» arriba) · Ver como: Gestor de tickets; Simulación › «Número que llama» (cliente o «Número no registrado») › «Simular una llamada entrante» › Contestar › «Finalizar y registrar la llamada» | — |
| 049 | Buscar al cliente y llamarlo desde su ficha | 4 | **completa** | #/clientes (búsqueda por DNI, nombre, código, lote, teléfono o N.º de ticket) y #/clientes/cli-001 (botón «Llamar») · Ver como: Gestor de tickets | — |
| 050 | Ver la consulta 360 del cliente dentro del ticket | 4 | **completa** | #/ticket/tk-460 › pestaña Cliente (ficha, panel del dato, candados, excepción con un DNI inexistente y nota en Interacciones) | — |
| 051 | Continuar la atención cuando la consulta del cliente falla | 4 | **completa** | #/nuevo («No está en SIGDA/TAXON» › «Registrar como interesado»; con Simulación › «SIGDA/TAXON no disponible» sale «Puedes seguir atendiendo») y #/ticket/tk-632 (tarjeta «Interesado», pendiente de vincular) · Ver como: Gestor de tickets | — |
| 052 | Consultar datos específicos con el motor de José | 4 | **completa** | #/ticket/tk-460 › pestaña Cliente › «Consultas rápidas» · Ver como: Gestor de tickets; Simulación › «Motor de consultas no disponible»; Ver como: Gestora de la Mesa SGD para el dato sin permiso (queda en «Auditoría: intentos rechazados») | — |
| 053 | Buscar documentos del cliente por significado | 4 | **completa** | #/ticket/tk-90 › pestaña Cliente › Documentos («Buscar en los documentos por significado»; también el buscador del grafo en Inicio) · Ver como: Gestor de tickets (la «Carta notarial de requerimiento» no aparece) frente a Supervisor ATC (sí aparece) | — |

## EP-ATC-11 · Resolución por morosidad y formularios simples

| HU | Título | Dev | Cobertura | Dónde verlo | Qué falta |
|---|---|---|---|---|---|
| 056 | Abrir el caso de resolución por 3 meses impagos | 4 | parcial | #/morosidad y #/morosidad/<caso> · Ver como: Supervisor ATC; Simulación › «Evaluar la morosidad (corrida diaria)» (con los datos iniciales abre 10 casos; el de Raúl Salas Mamani queda «Suspendido por reclamo») › «Registrar pago de la deuda» | CA-01: el ticket «Resolución de contrato» se crea vinculado al cliente y se asigna a Cobranza (Renato Salazar), pero no se deriva ni se avisa a Legal: solo lo dice la nota del historial del caso («derivado a Cobranza y Legal»). |
| 057 | Enviar al cliente la alerta de cancelación en paralelo | 4 | parcial | #/morosidad/<caso> › tarjeta «Alerta de cancelación al cliente» (constancias) · Ver como: Supervisor ATC; tras Simulación › «Evaluar la morosidad (corrida diaria)»; correo rebotado en el caso de Jorge Soto Chávez | Pantalla: no existe la plantilla ni se ve el texto de la alerta de cancelación que recibe el cliente; solo la tabla de constancias de envío (fecha y hora, canal, destinatario, entrega). Los 3 CA sí se simulan. |
| 058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | 4 | **completa** | #/morosidad/<caso> › tarjeta «Carta de alerta» (Para, Con copia, plazo y texto) · Ver como: Supervisor ATC; tras «Evaluar la morosidad (corrida diaria)»; Simulación › «+3 días hábiles» para el escalamiento; proyecto «Los Álamos» sin responsable | — |
| 059 | Registrar el ingreso de una persona al proyecto | 4 | **completa** | #/ingreso · Ver como: Control de acceso (garita); Simulación › «Sin conexión» para el guardado en el celular | — |
| 060 | Reservar un cupo en el bus del Entrega Fest | 4 | **completa** | #/buses · Ver como: Cliente convocado (Mi Portal) (selector «Cliente convocado» para probar lista de espera y cancelación) | — |
