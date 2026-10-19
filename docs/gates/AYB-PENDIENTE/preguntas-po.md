# Preguntas cerradas para el PO · prototipo G2 de Aybar Atiende

Para: Eddie Huamaní (PO). Cada pregunta trae opciones y la que usa hoy el prototipo
(**supuesto**), marcada en pantalla con «Supuesto». Basta con marcar una opción o
escribir otra. Lo que no se responda se queda como está en el prototipo.

## Ola 1 · Núcleo de tickets, enrutamiento y SLA (EP-ATC-01 y EP-ATC-02)

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 1 | ¿Qué formato tiene el N.º visible del ticket? | a) `SIGLA-000000` · b) `RUC-000000` · c) `SIGLA-AAAA-000000` | a | 002 | |
| 2 | ¿El correlativo reinicia cada año? | a) No · b) Sí, el 1 de enero | a | 002 | |
| 3 | ¿Cuál es el horario hábil? | a) L-V 9:00-18:00, igual en todas las sedes · b) Distinto por sede (indicar) · c) Incluye sábados | a | 003, 010, 029 | |
| 4 | ¿El SLA se pausa mientras el ticket está en «Espera cliente»? | a) No · b) Sí, se detiene y se reanuda | a | 003, 010 | |
| 5 | ¿Quién recibe las alertas de SLA y por dónde? | a) Supervisor ATC, notificación en consola · b) Supervisor del área actual, consola · c) Lo anterior + correo | a | 010 | |
| 6 | ¿Quién puede reasignar en bloque? | a) Solo supervisor ATC · b) Supervisor ATC y jefes de área | a | 008 | |
| 7 | ¿Cómo se reparten los tickets de quien cesa? | a) Por turnos, del más urgente al menos · b) Al de menor carga · c) Los elige el supervisor uno a uno | a | 008 | |
| 8 | ¿El catálogo de motivos de derivación es cerrado? | a) Sí, el del prototipo (competencia, información, conflicto Eje 3) · b) Sí, con otra lista (adjuntar) · c) Abierto (texto libre) | a | 007 | |
| 9 | ¿Qué evidencia se acepta? | a) JPG, PNG, PDF y MP4 hasta 10 MB, máx. 5 · b) Otros límites (indicar) | a | 005 | |
| 10 | ¿En qué campos aplica el bloqueo de DNI y tarjetas (DLP)? | a) Notas internas, de estado, de derivación y de reasignación · b) Además en mensajes al cliente | a | 005, 007 | |
| 11 | ¿La primera respuesta visible pasa el ticket a «En atención» sola? | a) Sí, como cambio automático · b) No, el cambio lo hace el gestor | a | 004, 005 | |
| 12 | ¿Qué transiciones de estado se permiten? | a) La matriz del prototipo (ver anexo) · b) Otra (adjuntar) | a | 004 | |
| 13 | ¿Cuándo se marca un ticket «en riesgo» de SLA? | a) Con menos del 25 % del plazo · b) Con menos de N horas (indicar) | a | 009, 010 | |
| 14 | ¿Cuál es el plazo del Eje 3 para el cierre end-to-end? | a) 10 días hábiles · b) Otro (indicar) | a | 029 | |
| 15 | ¿Desde qué punto se avisa «por vencer» el cierre end-to-end? | a) 80 % del plazo · b) Otro (indicar) | a | 029 | |
| 16 | ¿Qué es «escalar»? | a) Pasar a Eje 3 (Legal / Mesa de Casos Sensibles) · b) Otra definición | a | 029 | |
| 17 | ¿Quién registra el cierre formal? | a) El cliente confirma en Mi Portal y la consola lo registra · b) El gestor cierra tras N días sin respuesta (indicar N) · c) Ambos | a | 004, 006 | |

Anexo, transiciones del supuesto 12: Abierto → En atención, Espera cliente, Escalado,
Resuelto · En atención → Espera cliente, Escalado, Resuelto · Espera cliente → En
atención, Escalado, Resuelto · Escalado → En atención, Resuelto · Resuelto → Cerrado,
Reabierto · Cerrado → Reabierto · Reabierto → En atención, Espera cliente, Escalado,
Resuelto.

## Ola 2 · Libro de Reclamaciones y apelaciones (EP-ATC-03)

Conviene revisarlas con Gerencia Legal (DEP-05).

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 18 | ¿Dónde se asienta un reclamo que llega por teléfono, WhatsApp o correo? | a) En un «Libro virtual» por empresa, con correlativo propio · b) En el establecimiento del proyecto del cliente · c) El libro virtual de la web actual (integrar) | a | 012 | |
| 19 | ¿Qué formato tiene el número del asiento? | a) `SIGLA-EST-0000` · b) Solo correlativo `0000` por establecimiento · c) Otro (indicar) | a | 012 | |
| 20 | ¿Qué tipos de ticket exigen asiento? | a) Queja y Reclamo · b) Además otros (indicar) | a | 012, 015 | |
| 21 | ¿Quién registra el asiento? | a) Cualquier rol de atención · b) Solo la responsable legal | a | 012 | |
| 22 | ¿Quién firma la carta de respuesta por cada razón social? | a) La responsable legal de reclamos para todas · b) Un firmante por razón social (adjuntar lista) | a | 014 | |
| 23 | ¿La constancia del derecho a acudir a INDECOPI es obligatoria para registrar la respuesta? | a) Sí · b) No, solo se registra si se informó | a | 014 | |
| 24 | ¿Qué estados tiene una apelación? | a) Pendiente, En revisión, Fundada, Infundada, Desistida · b) Otros (indicar) | a | 016 | |
| 25 | ¿Qué apelaciones se permiten sobre una misma respuesta? | a) Una interna y luego INDECOPI; nada tras INDECOPI o tras desistir · b) Solo una, de cualquier instancia · c) Otra regla | a | 016 | |
| 26 | ¿Cuál es el plazo interno para resolver la segunda instancia? (pregunta abierta de FT-ATC-06) | a) 15 días hábiles · b) 30 días hábiles · c) Otro (indicar) | Sin plazo en el prototipo | 016 | |
| 27 | ¿A quién le llegan las alertas legales? | a) A la responsable legal, en consola · b) Además al supervisor ATC · c) Además por correo | a | 015 | |
| 28 | ¿Cuándo corre el control de tickets huérfanos? | a) Con cada job; marca los tickets abiertos antes de hoy sin asiento · b) Una vez al día al cierre (indicar hora) | a | 015 | |
| 29 | ¿Quién ve los hechos y el pedido del asiento? | a) Atención y legal; el Coordinador CX no · b) Todos los roles de la consola | a | 012 | |
| 30 | ¿Cómo se cuenta el plazo legal? | a) Vence al final del día hábil 15; la prórroga suma 15 hábiles al vencimiento original · b) Otra forma (indicar) | a | 013 | |

## Ola 3 · Gate a Eje 3 y Mesa de Casos Sensibles (EP-ATC-04)

Conviene revisarlas con Gerencia Legal y Dirección UX.

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 31 | ¿Quién retira una señal de conflicto marcada por error? | a) Supervisor ATC · b) Jefatura legal · c) Ambos | a | 026 | |
| 32 | ¿El paquete mínimo se exige en toda derivación entre ejes o solo al pasar a Eje 3? | a) Solo a Eje 3 · b) También de Eje 1 a Eje 2 (cambia las derivaciones de la ola 1) | a | 027 | |
| 33 | ¿Quién es la «Especialista Legal Senior» que confirma el handoff? | a) La responsable legal de reclamos · b) Otro puesto (indicar) | a | 027 | |
| 34 | ¿A quién se avisa si el handoff no se confirma en 1 día hábil? | a) Jefatura legal · b) Supervisor ATC · c) Ambos | a | 027 | |
| 35 | ¿El historial de pagos se adjunta o se enlaza? (pregunta abierta de FT-ATC-07) | a) Se resume en texto · b) Se adjunta el estado de cuenta · c) Enlace a Cobranza | a | 027 | |
| 36 | ¿Un conflicto puede derivarse sin nota de estado emocional? | a) No · b) Sí | a | 027, 028 | |
| 37 | ¿Qué palabras de juicio se bloquean? | a) La lista inicial del prototipo · b) Otra lista (adjuntar) | a | 028 | |
| 38 | ¿Cuál es el SLA de cada línea de la Mesa? | a) Indecopi 10, Libro 15, Cartas 10, Legal Atiende 5, Backlog 20 días hábiles · b) Otros (indicar) | a | 021, 023 | |
| 39 | ¿Qué formato tiene el Código Único? | a) `SGD-2026-000000` · b) Otro (indicar) | a | 020 | |
| 40 | ¿Qué criterios y pesos tiene la matriz de riesgo? | a) Los 6 del prototipo (monto 25, abogado 25, autoridad 30, medios 20, reincidencia 10, vulnerabilidad 15) · b) Otros (adjuntar) | a | 022 | |
| 41 | ¿Desde qué puntaje cada nivel? | a) Medio 20, Alto 40, Muy alto 60 · b) Otros | a | 022 | |
| 42 | ¿Cuáles son los umbrales de la escalera? | a) −2, 0, +1, +3 y +5 días hábiles respecto del vencimiento · b) Otros | a | 023 | |
| 43 | ¿Cuándo dos casos «coinciden en hechos»? | a) Mismo cliente con un caso abierto · b) Mismo cliente y mismo ticket · c) Mismo cliente y misma línea | a | 024 | |
| 44 | ¿Quién ve los casos sensibles? | a) Solo Mesa SGD y Legal · b) Además el supervisor ATC | a | 020-025 | |
| 45 | ¿La reclasificación de Legal Atiende abre un caso nuevo con otro Código Único? | a) Sí, enlazado al origen · b) No, cambia la línea del mismo caso | a | 020 | |

## Ola 4 · Reclamos de garantía postventa (EP-ATC-05)

Conviene revisarlas con Postventa.

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 46 | ¿Qué cobertura tiene cada tipo de defecto? (pregunta abierta de FT-ATC-10) | a) Estructural 120 meses; impermeabilización, acabados e instalaciones 12 meses · b) Otros (indicar) | a | 034 | |
| 47 | ¿La cobertura corre desde la fecha real de entrega o desde la del acta? | a) Fecha real de entrega · b) Fecha del acta | a | 034 | |
| 48 | ¿Qué formato tiene el código del reclamo? | a) `GAR-0000` · b) Otro | a | 033 | |
| 49 | ¿Quién gestiona los reclamos? | a) Postventa y supervisor ATC; el resto consulta · b) Cualquier rol de atención | a | 033 | |
| 50 | ¿Un reclamo exige ticket? | a) No, el ticket es opcional · b) Sí, siempre | a | 033 | |
| 51 | ¿Quién registra la inspección: Postventa o un tercero? (pregunta abierta de FT-ATC-10) | a) Postventa · b) Un tercero contratado (indicar) | a | 035 | |
| 52 | ¿Cuántas fotos o documentos exige la inspección? | a) Al menos uno · b) Un mínimo mayor (indicar) | a | 035 | |
| 53 | ¿Qué significa «Resuelto» frente a «Aprobado»? | a) Aprobado: se acepta el reclamo; Resuelto: se cerró el caso · b) Otra definición | a | 035 | |
| 54 | ¿Cuándo se registra la adenda? | a) En cualquier reclamo no rechazado por vigencia, la redacta Legal · b) Solo tras una aprobación | a | 036 | |
| 55 | ¿Un reclamo con conflicto se bloquea igual que un ticket? | a) Sí, reutiliza el gate de Eje 3 · b) No, Postventa puede resolverlo | a | 036 | |

## Ola 5 · UrbeMind, Torre de Control CX y EntregaFest (EP-ATC-06, 07 y 08)

Conviene revisarlas con Coordinación CX y Dirección UX.

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 56 | ¿A nombre de quién quedan los tickets que crea UrbeMind? | a) Un usuario de servicio · b) Un gestor de turno | a | 018 | |
| 57 | ¿Qué contratos puede vincular una incidencia de ciudad? | a) Solo los de tipo CITY_SERVICE_FEE · b) También de otros tipos (indicar) | a | 017 | |
| 58 | ¿Qué escala tienen CSAT y CES? | a) CSAT 1 a 5 y CES 1 a 7 · b) Otras | a | 019 | |
| 59 | ¿Cómo se calcula el NPS preliminar mientras no exista el KPI Engine? | a) Del CSAT: 5 promotor, 4 pasivo, 1 a 3 detractor · b) De una pregunta NPS propia | a | 030, 031 | |
| 60 | ¿Quién ve la Torre de Control? | a) Coordinador CX y supervisor ATC · b) Solo el coordinador CX · c) Además la jefatura legal | a | 030-032 | |
| 61 | ¿La redistribución desde el tablero puede cruzar de área? | a) No, solo dentro del área del ticket · b) Sí, con motivo | a | 030 | |
| 62 | ¿Qué contiene el informe diario? | a) Tickets por eje, NPS preliminar, derivaciones y SLA · b) Otros indicadores | a | 031 | |
| 63 | ¿Qué serie de adopción de Mi Portal se muestra? | a) La que entregue Mi Portal (hoy ficticia) · b) Otra fuente | a | 031 | |
| 64 | ¿Cuándo corre la auditoría de registros paralelos? | a) Al corte quincenal y a pedido · b) Solo al corte | a | 032 | |
| 65 | ¿Quién opera EntregaFest? | a) Solo el moderador; el coordinador revisa · b) También el coordinador | a | 037-039 | |
| 66 | ¿Cuál es el texto de las Frases Ancla 1, 2, 3 y 5? | a) Texto del guion (adjuntar) · b) Se muestran solo números | b | 037 | |
| 67 | ¿Las Frases Ancla se aplican siempre en orden? | a) Sí, sin saltar · b) Puede saltarse | a | 037 | |
| 68 | ¿Qué palabras activan la derivación a la Estación 4? | a) Estafa, fraude, abuso y delito · b) Además otras (indicar) | a | 038 | |
| 69 | ¿Derivar a la Estación 4 registra el caso con la etiqueta estándar? | a) Sí, automáticamente · b) El moderador registra aparte | a | 038, 039 | |
| 70 | ¿Cómo se clasifica el riesgo verbal? | a) Bajo, Medio, Alto y Muy alto (como la matriz SGD) · b) Otra escala | a | 037 | |

## Ola 6 · Asistencia al gestor (EP-ATC-09)

Conviene revisarlas con el PO, el administrador funcional y los supervisores de ATC y Postventa.

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 71 | ¿Cómo se mide la carga de un gestor? | a) Puntos por prioridad (baja 1, media 2, alta 3, urgente 4) · b) Cantidad de tickets | a | 046 | |
| 72 | ¿Cuál es el límite de carga por gestor? | a) 12 puntos · b) Otro valor (indicar) | a | 046 | |
| 73 | ¿Cuándo corre el balanceo? | a) A pedido del líder · b) Automático cada cierto tiempo | a | 046 | |
| 74 | ¿Qué es «interacción en curso» para no mover un ticket? | a) Actividad en los últimos 30 minutos · b) Otra definición | a | 046 | |
| 75 | ¿Qué hacer si nadie del área está disponible? | a) Cola del área y alerta al líder · b) Escalar a otra área | a | 046 | |
| 76 | ¿Quién marca el rayo de prioridad? | a) Solo el supervisor o líder, con motivo · b) También el gestor | a | 045 | |
| 77 | ¿Qué límite tiene el rayo por área? | a) 10 % de la bandeja, con opción de confirmar el exceso · b) Tope fijo sin excepción | a | 045 | |
| 78 | ¿Quién publica flujos y guías? | a) Administrador funcional (rol propio) · b) El supervisor de cada área | a | 043, 047 | |
| 79 | ¿Una versión nueva del flujo aplica a los tickets ya abiertos? | a) No, solo a los nuevos · b) Sí | a | 043 | |
| 80 | ¿Qué contiene la guía de solución? | a) Pasos, plantillas y criterios de cierre · b) Otros campos | a | 047 | |
| 81 | ¿Qué datos se anonimizan antes de enviarse a la IA? | a) DNI y datos de tarjeta · b) Además nombres y teléfonos | a | 048 | |
| 82 | ¿Qué se registra de la decisión sobre la sugerencia de IA? | a) Aceptada, editada o descartada, sin el texto · b) También el texto | a | 048 | |
| 83 | ¿Se envía correo si el gestor se asigna el ticket a sí mismo? | a) No · b) Sí | a | 055 | |
| 84 | ¿Qué pasa si el gestor no tiene líder en NEXUS? | a) El correo sale sin copia y se avisa al administrador · b) No se envía | a | 055 | |
| 85 | ¿Cómo se envían las reasignaciones masivas? | a) Un solo correo por persona con el resumen · b) Un correo por ticket | a | 055 | |

## Ola 7 · Consulta 360 e integraciones (EP-ATC-10)

Conviene revisarlas con el PO, Legal, Cobranza, TI (call center, motor de consultas) y el supervisor ATC.

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 86 | ¿Qué significa «llamar la cuenta»? | a) Llamada telefónica por la plataforma del call center · b) Consultar la cuenta del cliente | a | 049 | |
| 87 | ¿Qué campos de búsqueda son obligatorios? | a) Ninguno: basta uno de DNI, nombre, código, lote, teléfono o N.º de ticket (mínimo 3 caracteres) · b) Otros | a | 049 | |
| 88 | ¿Qué secciones de la consulta 360 ve cada rol? | a) Estado de cuenta: gestor, colaborador, supervisor y legal; no el coordinador CX ni la Mesa SGD · b) Otra matriz | a | 050 | |
| 89 | ¿Qué documentos son restringidos y quién los ve? | a) Cartas notariales y similares: supervisor, legal y Mesa SGD · b) Otra regla | a | 050, 053 | |
| 90 | ¿A qué se refiere la «excepción para la consulta de usuario»? | a) Cliente no encontrado o sistema fuente caído · b) Permisos especiales | a | 051 | |
| 91 | ¿Qué datos mínimos lleva un interesado? | a) Nombre, teléfono y DNI opcional · b) Otros | a | 051 | |
| 92 | ¿Cómo se vincula un interesado al cliente? | a) Automático por DNI cuando SIGDA/TAXON vuelve, o manual con búsqueda · b) Solo manual | a | 051 | |
| 93 | ¿Qué expone hoy el motor de José (API, base de datos, reportes) y con qué SLA? | a) API con las consultas del catálogo (saldo, próxima cuota, último pago, estado del contrato) · b) Otra | a | 052 | |
| 94 | ¿Se registra el valor que devuelve el motor? | a) No: solo que se consultó y quién · b) Sí | a | 052 | |
| 95 | ¿Qué repositorios de documentos se indexan y hay restricción legal? | a) Contratos y documentos del cliente aprobados; modelo real por definir (DEP-14) · b) Otros | a | 053 | |
| 96 | ¿Qué plataforma de call center usa el equipo y expone CTI y grabaciones? | a) Por definir (DEP-11); el prototipo simula el aviso y una grabación ficticia · b) Indicar proveedor | a | 042 | |
| 97 | ¿Una llamada sin ticket del cliente puede registrarse solo en su ficha? | a) Sí · b) Siempre debe crearse un ticket | a | 042, 049 | |
| 98 | ¿Qué herramienta usa Legal y cómo se sincroniza (en línea o por lotes)? | a) Herramienta externa, en línea con cola de reintento · b) Por lotes | a | 040 | |
| 99 | ¿El 8 % es la tasa de interés legal o un referencial? | a) Referencial anual, a confirmar con Legal · b) Otra tasa | a | 041 | |
| 100 | ¿Qué señales definen el riesgo de denuncia y cuál es el umbral de alerta? | a) INDECOPI, abogado, carta notarial o 2 reaperturas; alerta desde S/ 500 de exposición · b) Otros | a | 041 | |

## Ola 8 · Morosidad y formularios (EP-ATC-11)

Conviene revisarlas con el PO, Cobranza, Legal, Comercial (responsables de proyecto), control de acceso y Coordinación CX.

| # | Pregunta | Opciones | Supuesto del prototipo | HU | Respuesta |
|---|---|---|---|---|---|
| 101 | ¿Qué cuenta como «3 meses impagos»? | a) 3 o más cuotas vencidas e impagas del lote, según Cobranza · b) 3 consecutivas | a | 056 | |
| 102 | ¿Cuándo corre la evaluación y quién abre el caso? | a) Cada día; el sistema abre el ticket a nombre del analista de Cobranza · b) A mano | a | 056 | |
| 103 | ¿Un reclamo abierto en el Libro suspende el caso? | a) Sí, hasta responderlo (propuesta del PO, validar con Legal) · b) No | a | 056 | |
| 104 | ¿Cuál es la fecha prevista de resolución? | a) 30 días desde la apertura · b) Otro plazo | a | 056, 058 | |
| 105 | ¿Qué contiene la alerta de cancelación y qué plazo da para regularizar? | a) Deuda, plazo y consecuencias; el plazo lo fija Legal · b) Otro contenido | a | 057 | |
| 106 | ¿Se envía por los tres canales a la vez o en cascada? | a) A la vez (correo, WhatsApp y Mi Portal); si el correo rebota, los otros constan como reintento · b) En cascada | a | 057 | |
| 107 | ¿De dónde sale el responsable del proyecto y su supervisor? | a) Del maestro de proyectos; si falta, va al supervisor comercial y se avisa al administrador funcional · b) Otra fuente | a | 058 | |
| 108 | ¿Qué plazo tiene el responsable para actuar y a quién se escala? | a) 2 días hábiles; al supervisor ATC · b) Otra matriz de escalamiento | a | 058 | |
| 109 | ¿Quién registra el pago que regulariza el caso? | a) Cobranza o el supervisor, a mano; la integración con el pago es otra dependencia · b) Automático | a | 056 | |
| 110 | ¿Qué campos y motivos lleva el formulario de ingreso? | a) 6 campos: nombre, DNI, teléfono, motivo (lista corta), proyecto o área y fecha y hora · b) Otros | a | 059 | |
| 111 | ¿Qué hace el ticket de ingreso con un visitante que no es cliente? | a) Queda como interesado, asignado al responsable del proyecto · b) Sin ticket | a | 059 | |
| 112 | ¿Cómo funciona el guardado sin conexión en la garita? | a) Se guarda en el celular y se envía solo al recuperar la conexión · b) Se exige conexión | a | 059 | |
| 113 | ¿Qué alcance tiene «Buses del Entrega Fest»? | a) Solo la reserva del cliente; la logística con el proveedor queda fuera · b) Ambas | a | 060 | |
| 114 | ¿Cuántos acompañantes se permiten y qué aforo tiene cada bus? | a) Hasta 3; aforos de prueba de 2, 4 y 6 personas · b) Indicar valores reales | a | 060 | |
| 115 | ¿Quién puede reservar y por qué canal se confirma? | a) Solo clientes convocados; WhatsApp, o correo si WhatsApp no está disponible · b) Otro criterio | a | 060 | |
| 116 | ¿Cómo se atiende la lista de espera? | a) Por orden de llegada: al liberarse cupo se confirma al primero al que le cabe · b) Otra regla | a | 060 | |
