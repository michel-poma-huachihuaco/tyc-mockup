# Gobierno de Datos: puertas formales en el ciclo

Gobierno de Datos no interviene de forma transversal: actua como puerta
formal en F4, F5, F8, F9 y F10, y de forma consultiva ligera (sin puerta ni
bloqueo) en las fases previas, solo para detectar temprano datos sensibles,
maestros o estructuras criticas. Toda intervencion cierra con decision
trazable: que se valido, contra que, como, resultado, hallazgos, evidencia y
aprobacion.

Estados normalizados de cada puerta: Aprobado / Aprobado con observaciones /
Rechazado. SLA de respuesta: 3 dias habiles en F4 y F9; 1 dia habil en F5 y
F8. En F9 el SLA cubre la ventana completa D-3 a D-1.

## F4 - Arquitectura (valida el diseño de datos)

- Valida: modelo logico y fisico, nomenclatura, claves y relaciones, linaje
  fuente-destino, transformaciones, clasificacion de sensibilidad/PII, dueño
  de dato asignado, impacto sobre estructuras existentes.
- Como: revision documental (DER, diccionario, mapeo de linaje) contra el
  Estandar de Modelado y el Diccionario Corporativo + walkthrough con el
  arquitecto y el TL.
- Bloqueantes: entidades sin dueño, PII sin clasificar, duplicacion de
  maestros, ausencia de linaje, cambio de granularidad no justificado.
- Entregable: Acta de Validacion de Arquitectura de Datos.
- Las reglas de calidad e integridad de las entidades nuevas SE DECLARAN AQUI
  y se dan de alta en la bateria de monitoreo al momento del release.

## F5 - Refinement (checklist CAD-F5)

Contrasta la HU con lo aprobado en F4. Respuesta cerrada por item:
Cumple / No cumple / No aplica, registrado en la HU, sin documento aparte.
Plantilla: `.agents/templates/checklist-cad-f5.md`.

- Desviacion: toda diferencia entre lo que la HU necesita y lo aprobado en
  F4. Un vacio de definicion (la HU toca un dato que F4 no cubrio) es
  desviacion MAYOR: no hay base contra la cual validar.
- Mayores (bloquean, retornan a F4): entidad nueva; campo no aprobado; cambio
  de clave, cardinalidad o granularidad; PII nueva; integracion o linaje
  nuevo; migracion o backfill no declarado; cambio de integridad sobre datos
  historicos; borrado fisico productivo; acceso directo a datos de otro
  dominio; ruptura de contrato aguas abajo.
- Menores (se registran con responsable y fecha de cierre <= F8 de la misma
  HU): nomenclatura, descripcion faltante, tipo/longitud sin impacto, indice
  sin definir. Tres menores abiertas en la misma iniciativa escalan y
  bloquean hasta su cierre.

## F8 - QA + Security (valida lo implementado)

QA valida comportamiento funcional; Gobierno de Datos valida estructura,
integridad y linaje, con independencia de que la funcionalidad opere.
Complementarias, no superpuestas.

- Como: evidencia ejecutable en QA: diff de esquema contra el modelo
  aprobado, pruebas de integridad referencial, reglas sobre datos
  representativos, logs de migracion.
- Bloqueantes: diff de esquema no justificado, FK faltantes o deshabilitadas,
  perdida o truncamiento en migracion, transformacion incorrecta, PII sin
  enmascarar fuera de produccion.
- Entregable: Informe de Conformidad de Arquitectura Implementada.

## F9 - Release Data Gate

La puerta = Ficha de Impacto de Datos + Plan de Rollback de Datos. Gobierno
de Datos valida y aprueba el plan; la ejecucion de la reversion y la custodia
de los puntos de recuperacion son de DBA/Infraestructura. El rollback de
aplicacion NO es rollback de datos: se diseñan por separado (principio 5).

Plan de Rollback de Datos, ocho secciones obligatorias (plantilla en
`.agents/templates/plan-rollback-datos.md`): alcance y volumetria; estado
previo verificable (conteos, checksums); punto de recuperacion identificado;
ventana de reversion con RPO/RTO comprometidos y tiempo real medido en QA;
procedimiento con orden de dependencias; validacion posterior con consultas y
resultado esperado; responsables con suplente (decide, ejecuta, valida);
riesgos residuales y accion compensatoria.

- Obligatorio en: DDL en produccion, migraciones o backfills, borrados o
  actualizaciones masivas, cambio de clave o granularidad, integraciones de
  escritura, entidades criticas o maestras. El "no aplica" se declara en la
  Ficha, nunca por omision.
- Cadencia (relativa al dia D de liberacion): D-3 revision documental; D-2
  prueba efectiva de rollback en QA con volumetria representativa y medicion
  contra el RTO; D-1 confirmacion de precondiciones (backup legible,
  responsables disponibles, ventana compatible). Cambios de alto impacto se
  declaran en el ciclo anterior.
- Un plan no probado se considera INEXISTENTE, sin importar su calidad
  documental. Si el alcance del release cambia tras la conformidad, esta
  caduca.
- Bloqueantes absolutos: plan ausente/incompleto/no probado; backup
  inexistente o no verificado; reversion real por encima del RTO; sin
  consultas de validacion posterior; responsables no designados o no
  disponibles; impacto declarado distinto del alcance real; PII sin
  tratamiento aprobado.
- Excepcion formal: solo con aceptacion expresa y escrita del dueño del dato,
  registrada en el Acta. Se documenta, no se asume.

## F10 - Operacion (dos regimenes)

Estabilizacion postproduccion: detecta si EL RELEASE rompio algo; foco en los
objetos tocados, contra la linea base de la Ficha de F9; cada ejecucion se
etiqueta por release para que los hallazgos sean atribuibles. Regimen
permanente: detecta degradacion progresiva; alcance fijo sobre entidades
criticas y maestras.

Cuatro dominios de monitoreo:
- Actividad transaccional: volumen de INSERT/UPDATE/DELETE contra linea base,
  fallidas, incompletas, deadlocks y timeouts, reprocesos, volumenes
  anomalos. En entidades criticas todo borrado fisico alerta individual.
- Integridad estructural: huerfanos, violaciones de FK y restricciones,
  duplicados por clave natural, restricciones deshabilitadas (hallazgo en si
  mismas).
- Consistencia: estados invalidos, transiciones no permitidas, descuadres
  agregado-detalle, inconsistencia entre sistemas para el mismo dato.
- Calidad: completitud de obligatorios, validez de dominio y formato,
  unicidad, integridad contra maestros, frescura, conformidad con el
  diccionario.

Mecanismo: bateria de reglas SQL versionadas en el repositorio, ejecucion
programada, resultados persistidos con historico de doce meses. Cada regla:
identificador, entidad, dominio, consulta, umbral, severidad, frecuencia,
responsable. Frecuencias: transaccional cada 15 min las primeras 72 h (luego
horaria en criticas, diaria en el resto); integridad cada 2 h las primeras
72 h (luego diaria); consistencia diaria en criticas, semanal en el resto;
calidad diaria dos semanas, luego semanal con informe mensual. A las 72 h se
emite el Reporte de Estabilizacion: estable / en observacion / incidente.

Umbrales iniciales (atencion / critico), calibrados con cuatro semanas de
linea base antes de alertar en firme; los umbrales cero aplican a datos
NUEVOS (lo preexistente es saneamiento con plan propio, no bloquea):
huerfanos en criticas 0/cualquiera; duplicados en maestros 0/cualquiera;
violaciones de integridad 0/cualquiera; fallidas >0,1% / >1%; volumetria
+-20% / +-50%; completitud y validez <99,5% / <98%; frescura >1x / >2x SLA.

Severidades de datos: S1 critico (integridad violada, duplicidad en maestros,
perdida o borrado no previsto, descuadre regulatorio o financiero) alerta
inmediata, contencion en 1 h, resolucion o mitigacion en 4 h, y si es
atribuible a un release en ventana se evalua activar el Plan de Rollback de
Datos (decide el dueño del dato). S2 mayor: causa raiz en 1 dia habil,
correccion en 5. S3 menor: revision semanal; tres S3 iguales en 30 dias
escalan a S2.

KPI mensuales: Indice de Calidad de Datos >=99,5%; Indice de Integridad 100%;
exito transaccional >=99,9%; incidentes atribuibles a release con meta
descendente por trimestre; tiempo medio de deteccion <=4 h en criticos;
tiempo medio de resolucion por severidad.

Retroalimentacion: todo S1/S2 se clasifica por fase de origen (F4, F5, F8,
F9 u operacion) y trimestralmente produce acciones concretas: item nuevo en
el CAD-F5, verificacion nueva en F8 o criterio mas duro en F4.

## Condiciones habilitantes (pendientes de acuerdo)

Acceso de lectura de Gobierno de Datos a QA y produccion; escritura acotada
al esquema de resultados; herramienta de visualizacion y canal de alertas por
definir; dedicacion para construir y mantener la bateria de reglas.
