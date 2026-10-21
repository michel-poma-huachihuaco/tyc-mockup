# Cobertura del mockup frente al PLT-04 v1.3 (Etapa 1)

**Al 20-oct-2026: las 62 historias de la Etapa 1 están completas** (ver `../DECISIONES.md` §5.7, §5.8 y §5.11).
Se revisó de nuevo después de completar la Operación en vivo y la Consulta 360 que vienen de la rama de Daniel: las dos usan
los clientes y tickets del mockup y cumplen los criterios de la HU-067 y de las HU-049 a 053.
Una historia es «completa» cuando el mockup permite comprobar cada uno de sus criterios de aceptación. Las integraciones con
sistemas reales (SIGDA/TAXON, Cobranza, Legal, correo, WhatsApp) están simuladas; los supuestos tomados donde el PLT-04 deja
preguntas abiertas están en `DECISIONES.md`.

Responsable según el plan v1.3: Dev 1 Brayan, Dev 2 Jesús, Dev 3 Michel, Dev 4 Daniel.

## EP-ATC-01 · Núcleo de tickets omnicanal

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 001 | Registrar un ticket tipificado desde cualquier canal | 1 | #/nuevo · Ver como: Gestor de tickets (CA-04: Ver como «Rol sin atención»; el intento se ve en Simulación › «Auditoría: intentos rechazados») |
| 002 | Entregar al cliente un número de ticket por razón social | 1 | #/nuevo (diálogo «Ticket registrado» con «Copiar el número») y #/ticket/tk-15 (cabecera AIN-000482) · Ver como: Gestor de tickets; CA-03 en Simulación › Pruebas de reglas › «Dos guardados simultáneos» |
| 004 | Cambiar el estado del ticket con historial inmutable | 1 | #/ticket/tk-15 (cerrado) › «Cambiar estado» y pestaña «Historial de estados» · Ver como: Colaborador de área; CA-02 en Simulación › «Intentar editar la última fila del historial de estados» |
| 005 | Registrar interacciones visibles o internas con evidencia | 1 | #/ticket/tk-592 (sin respuestas) › Interacciones › «Registrar interacción» y «Ver como el cliente» · Ver como: Colaborador de área |
| 006 | Conservar los hitos temporales probatorios | 1 | #/ticket/tk-57 (reabierto 2 veces) y #/ticket/tk-15 (cerrado) › tarjeta «Compromisos SLA e hitos» · Ver como: Supervisor ATC |

## EP-ATC-02 · Enrutamiento, SLA y alertas

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 003 | Congelar el SLA del ticket al abrirlo | 2 | #/nuevo · Ver como: Gestor de tickets (panel «SLA que se congelará»; Simulación › Apertura del próximo ticket › «Caso feriado: vie 26-jun-2026, 18:00»); #/politicas y #/alertas («Alertas de configuración») · Ver como: Supervisor ATC |
| 007 | Derivar un ticket a otra área con motivo tipificado | 2 | #/ticket/tk-460 · Ver como: Gestor de tickets («Derivar» y pestaña «Derivaciones») |
| 008 | Reasignar en bloque los tickets de un colaborador que cesa | 2 | #/reasignar · Ver como: Supervisor ATC (Renato Salazar tiene 12 pendientes; otros roles ven «sin permiso» y no tienen el enlace) |
| 009 | Ver mi casillero de tareas por área y responsable | 2 | #/bandeja · Ver como: Colaborador de área (pestañas «Míos», «Mi área», «Sin asignar» y chip «En riesgo o vencidos») |
| 010 | Recibir una sola alerta por incumplimiento de SLA | 2 | #/alertas · Ver como: Supervisor ATC («Ejecutar el job ahora» y Simulación › reloj); pestaña «Alertas SLA» en #/ticket/tk-57 |
| 011 | Reabrir un ticket con un nuevo compromiso sin borrar el original | 2 | #/ticket/tk-57 (reabierto 2 veces) y #/ticket/tk-174 (cerrado: «Cambiar estado › Reabierto») · Ver como: Gestor de tickets |
| 029 | Medir el cierre end-to-end de la experiencia | 2 | #/cierre · Ver como: Coordinador CX (tarjeta «Cierre end-to-end» también en #/ticket/tk-73 y #/ticket/tk-90) |

## EP-ATC-03 · Libro de Reclamaciones y apelaciones

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 012 | Registrar el asiento del Libro de Reclamaciones | 1 | #/ticket/tk-528 › tarjeta «Libro de Reclamaciones» › «Registrar asiento», y #/libro · Ver como: Responsable legal de reclamos; CA-03 en Simulación › «Intentar cambiar la razón social de ALT-CAR-0042» |
| 013 | Calcular el plazo legal y gestionar la prórroga única | 1 | #/libro/as-48 («Prorrogar 15 días»; tras prorrogar queda deshabilitado) y #/libro/as-34 (plazo original vencido) · Ver como: Responsable legal de reclamos; CA-02 en Simulación › «Intentar modificar el vencimiento prorrogado de ALT-CAR-0042» y tarjeta «Historial del plazo» |
| 014 | Registrar la respuesta formal con cargo | 1 | #/libro/as-48 › «Registrar respuesta» (respuesta ya registrada: #/libro/as-20) · Ver como: Responsable legal de reclamos |
| 015 | Vigilar el plazo legal y detectar reclamos huérfanos | 1 | #/libro (pestañas «Alertas legales» y «Huérfanos»; tk-528 huérfano) · Ver como: Responsable legal de reclamos; Simulación › «Ejecutar el job ahora» o «+1 día hábil» |
| 016 | Dar seguimiento a apelaciones internas y ante INDECOPI | 1 | #/libro/as-6 (apelación ante INDECOPI en revisión › «Cambiar estado») y #/libro/as-20 (apelación desistida) › tarjeta «Apelaciones» del asiento · Ver como: Responsable legal de reclamos |

## EP-ATC-04 · Gate legal Eje 3 y Mesa de Casos sensibles

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 020 | Registrar un caso sensible con Código Único | 2 | #/mesa («Registrar caso») y #/mesa/cas-367 («Reclasificar a reclamo formal») · Ver como: Gestora de la Mesa SGD |
| 021 | Emitir cargo previo y cargo de activación por separado | 2 | #/mesa (pestaña «En limbo»: SGD-2026-000321) y #/mesa/cas-576 («Emitir cargo de activación») · Ver como: Gestora de la Mesa SGD |
| 022 | Clasificar el riesgo del caso con matriz objetiva | 2 | #/mesa/cas-367 (clasificar) y #/mesa/cas-123 (recalibrar riesgo medio) · Ver como: Gestora de la Mesa SGD |
| 023 | Escalar en cadena un caso que incumple su SLA | 2 | #/mesa (pestaña «Escalamientos») y #/mesa/cas-134 (en Comité: «Cerrar el caso») · Ver como: Gestora de la Mesa SGD; Simulación › reloj |
| 024 | Validar casos cruzados o vinculados antes de registrar | 2 | #/mesa › «Registrar caso» con el cliente de SGD-2026-000323 (cli-022) · Ver como: Gestora de la Mesa SGD; hilo compartido en #/mesa/cas-484 |
| 025 | Cerrar el caso con estado homologado y evidencia | 2 | #/mesa/cas-484 («Cerrar el caso») · Ver como: Gestora de la Mesa SGD |
| 026 | Bloquear la resolución en Eje 1/2 ante señal de conflicto | 2 | Ticket con señal de conflicto (p. ej. APV-000089) › «Cambiar estado»: «Escalado» deshabilitado por el gate; lleva a «Derivar a Eje 3» |
| 027 | Armar el paquete mínimo de handoff y confirmar su recepción | 2 | «Derivar a Eje 3» exige los 6 elementos en todo paso a Eje 3; aviso de handoff sin confirmar en el ticket y en Alertas SLA › «Handoffs sin confirmar» (Ver como: Supervisor ATC) |
| 028 | Registrar la nota de estado emocional sin juicios de valor | 2 | #/ticket/tk-73 · Ver como: Gestor de tickets («Nota de estado emocional»); nota y aviso de vocería visibles en #/ticket/tk-90 |

## EP-ATC-05 · Postventa: reclamos de garantía

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 033 | Registrar un reclamo de garantía vinculado a la entrega | 1 | #/garantias › «Registrar reclamo» · Ver como: Supervisor ATC (el «Colaborador de área» de Ver como es de Cobranza y solo lee) |
| 034 | Validar la vigencia de la garantía contra la cobertura | 1 | #/garantias/gar-249 (GAR-0087: motivo informado al cliente) · Ver como: Supervisor ATC o Postventa |
| 035 | Registrar la inspección técnica antes de resolver | 1 | #/garantias/gar-585 › «Registrar la inspección» (informe, fotos JPG/PNG y PDF) |
| 036 | Escalar la garantía a Eje 3 y gestionar la adenda | 1 | #/garantias/gar-314 › «Registrar carta notarial» (vincula el ticket y bloquea «Resolver») |

## EP-ATC-06 · Autogestión del cliente y trazabilidad (Mi Portal)

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 064 | Registrar y consultar mis tickets en Mi Portal | 4 | #/portal (acceso con DNI y código; luego Mis tickets) y #/portal/nuevo · Herramientas › Ver como › Cliente convocado (Mi Portal) o directo por URL |
| 065 | Ver la trazabilidad de mi ticket | 4 | #/portal/ticket/<id> (p. ej. tk-272 de Ana Inga, DNI 95638594) · mismo acceso |
| 066 | Responder, adjuntar y confirmar la solución de mi ticket | 4 | #/portal/ticket/tk-272: SLA en pausa hasta la respuesta y reanudado; Configuración › Cierre automático (Administrador funcional); el job de Simulación cierra sin respuesta |

## EP-ATC-07 · Calidad de atención y Torre de Control CX

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 019 | Disparar la encuesta al cerrar el ticket | 3 | #/ticket/tk-308 › Cambiar estado › Cerrado (y Reabierto → Resuelto → Cerrado) · Ver como: Gestor de tickets; resultados en #/torre › Encuestas · Ver como: Supervisor ATC |
| 030 | Monitorear en tiempo real y corregir antes del incumplimiento | 3 | #/torre › Tablero · Ver como: Coordinador CX |
| 031 | Generar el informe diario y el quincenal | 3 | Torre de Control CX › Informes: al avanzar el reloj (Simulación) se generan el diario al cierre de la jornada y el quincenal con tendencias |
| 032 | Auditar registros paralelos del dato de cliente | 3 | #/torre › Auditoría de datos · Ver como: Coordinador CX (hallazgo: Herramientas › Simulación › «Crear un registro paralelo del dato de cliente» y volver a ejecutar) |

## EP-ATC-08 · EntregaFest: contención y derivación en vivo

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 037 | Registrar el riesgo verbal y la secuencia de Frases Ancla | 1 | #/fest › caso EF-001 › «Aplicar la Frase N» (en orden) y «Cerrar el tema en sala» · Ver como: Moderador de evento |
| 038 | Derivar de inmediato a la Estación 4 sin debate | 1 | #/fest › «Registrar caso» con «estafa», «fraude», «abuso» o «delito»; caso EF-002 (derivado) › «Intentar reabrir» · Ver como: Moderador de evento |
| 039 | Registrar el caso con la etiqueta estándar | 1 | #/fest › tabla «Registro de casos» (columnas Etiqueta y «¿Derivado a la Estación 4?») · Ver como: Moderador de evento (registra) y Coordinador CX (revisa) |

## EP-ATC-09 · Bandeja orquestadora y asistencia al gestor

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 043 | Configurar el flujo de trabajo de un tipo de ticket por área | 3 | #/configuracion › Flujos (Ver como: Administrador funcional), #/nuevo (tipo y subtipo) y el detalle del ticket › «Actividades del flujo» |
| 044 | Trabajar desde una bandeja única ordenada por urgencia | 3 | Bandeja: el supervisor ve «Áreas que superviso»; Simulación › «Simular un ticket entrante por Mi Portal» entra con canal Mi Portal |
| 045 | Marcar un ticket crítico con el rayo de prioridad | 3 | #/ticket/tk-450 (panel «Rayo de prioridad») y #/bandeja · Ver como: Supervisor ATC |
| 046 | Reasignar automáticamente al gestor con menos carga | 3 | Un ticket que entra para un responsable sobre el límite va al disponible con menos carga (REASSIGNMENT_CARGA); sin nadie disponible, alerta en Mi día › Equipo |
| 047 | Consultar la guía de solución del tipo de ticket | 3 | #/ticket/tk-450 (panel «Guía de solución»; sin guía: #/ticket/tk-308) · Ver como: Gestor de tickets; versiones y alertas en #/configuracion › Guías / Alertas · Ver como: Administrador funcional |
| 048 | Recibir retroalimentación de IA mientras atiendo y cierro | 3 | Ticket › «Cambiar estado» › Resuelto: criterios de cierre pendientes y el asistente (Aceptar / Usar mi versión editada / Descartar); registro de decisiones en el ticket |
| 054 | Ver mi avance diario y el de mi equipo | 3 | #/midia › Mi día · Ver como: Gestor de tickets; #/midia › Equipo · Ver como: Supervisor ATC |
| 055 | Recibir un correo al asignarme un ticket, con copia a mi líder | 3 | #/midia › Correos de asignación › «Ver»: «Plantilla de correo de asignación» (con líder, sin líder y resumen de reasignación masiva) |
| 067 | Ver el proceso de atención en un visor 3D (operación en vivo) | 3 | #/vivo › «Operación en Vivo» · Ver como: Supervisor ATC. Tocar una sala para su panel (carga por gestor, solo informativo); tocar una caja para su ficha (recorrido con hora, SLA consumido y CSAT si está cerrado, p. ej. AIN-000482); «Escalar a Comité SGD» hace vencer un ticket: el registro de actividad muestra el correo con copia al líder y el caso aparece en la Sala de Comité; «Razón social» filtra la planta; «Lista por área» es la vista sin 3D; pausa y velocidad (1×, 2×, 4×) solo con Herramientas › Simulación › «Modo simulación». Ver como: Gestor de tickets para ver solo su sala |

## EP-ATC-10 · Consulta 360 e integraciones operativas

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 040 | Sincronizar con Legal los tickets derivados a Eje 3 | 4 | Ticket derivado a Eje 3 › pestaña Legal; Herramientas › Simulación › «Legal pone en revisión el último caso enviado» y «Legal resuelve…» |
| 041 | Priorizar los reclamos con riesgo de denuncia por su exposición | 4 | Ticket ALT-001207 (prioridad Urgente al alertar a Legal) y Torre de Control › «Riesgo de denuncia» (columna Prioridad) |
| 042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | 4 | Cualquier pantalla (panel «Llamada entrante» arriba) · Ver como: Gestor de tickets; Simulación › «Número que llama» (cliente o «Número no registrado») › «Simular una llamada entrante» › Contestar › «Finalizar y registrar la llamada» |
| 049 | Buscar al cliente y llamarlo desde su ficha | 4 | #/clientes (búsqueda por DNI, nombre, código, lote, teléfono o N.º de ticket) y #/clientes/cli-001 (botón «Llamar») · Ver como: Gestor de tickets. También en #/consulta360: buscar «Vargas» o «Villa Sol II» para la lista con DNI parcial y lote, y «Llamar» desde la central CTI |
| 050 | Ver la consulta 360 del cliente dentro del ticket | 4 | #/ticket/tk-460 › pestaña Cliente (ficha, panel del dato, candados, excepción con un DNI inexistente y nota en Interacciones). En #/consulta360, los mismos candados por rol: «Datos visibles n de 16» (Ver como: Coordinador CX, 9 de 16) |
| 051 | Continuar la atención cuando la consulta del cliente falla | 4 | #/nuevo («No está en SIGDA/TAXON» › «Registrar como interesado»; con Simulación › «SIGDA/TAXON no disponible» sale «Puedes seguir atendiendo») y #/ticket/tk-632 (tarjeta «Interesado», pendiente de vincular) · Ver como: Gestor de tickets. En #/consulta360: un DNI inexistente ofrece «Registrar ticket como Interesado»; con SIGDA caído, aviso y «Reintentar» |
| 052 | Consultar datos específicos con el motor de José | 4 | #/ticket/tk-460 › pestaña Cliente › «Consultas rápidas» · Ver como: Gestor de tickets; Simulación › «Motor de consultas no disponible»; Ver como: Gestora de la Mesa SGD para el dato sin permiso (queda en «Auditoría: intentos rechazados»). Igual en #/consulta360 › «Consultas rápidas en línea» |
| 053 | Buscar documentos del cliente por significado | 4 | #/ticket/tk-90 › pestaña Cliente › Documentos («Buscar en los documentos por significado») · Ver como: Gestor de tickets (la «Carta notarial de requerimiento» no aparece) frente a Supervisor ATC (sí aparece). En #/consulta360: chip «adenda de cambio de lote»; sin coincidencias («piscina olímpica con jacuzzi») sugiere palabras exactas |

## EP-ATC-11 · Resolución por morosidad y formularios simples

| HU | Título | Dev | Dónde verlo |
|---|---|---|---|
| 056 | Abrir el caso de resolución por 3 meses impagos | 4 | Simulación › «Evaluar la morosidad» › #/morosidad/<caso>: «Flujo de resolución» (Cobranza y Legal); el ticket muestra «Actividades del flujo» |
| 057 | Enviar al cliente la alerta de cancelación en paralelo | 4 | #/morosidad/<caso> › «Ver la plantilla»: «Plantilla de alerta de cancelación» (texto pendiente de Legal) y constancias |
| 058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | 4 | #/morosidad/<caso> › tarjeta «Carta de alerta» (Para, Con copia, plazo y texto) · Ver como: Supervisor ATC; tras «Evaluar la morosidad (corrida diaria)»; Simulación › «+3 días hábiles» para el escalamiento; proyecto «Los Álamos» sin responsable |
| 059 | Registrar el ingreso de una persona al proyecto | 4 | #/ingreso · Ver como: Control de acceso (garita); Simulación › «Sin conexión» para el guardado en el celular |
| 060 | Reservar un cupo en el bus del Entrega Fest | 4 | #/buses · Ver como: Cliente convocado (Mi Portal) (selector «Cliente convocado» para probar lista de espera y cancelación) |
