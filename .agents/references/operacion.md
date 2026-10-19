<!-- Renderizado desde datos/marco.json del repositorio aybar-estrategia-tecnica.
     Ese JSON es la fuente; si el marco cambia, esto se regenera, no se edita a mano. -->

# Operacion: severidades, release y metricas

## Severidades

| Sev | Definicion | Respuesta |
|---|---|---|
| Sev1 | Servicio caído o pérdida o corrupción de datos | Inmediata, 24/7, hotfix o rollback |
| Sev2 | Función crítica degradada sin workaround | Mismo día hábil |
| Sev3 | Función no crítica afectada, con workaround | Próximo sprint |
| Sev4 | Cosmético o menor | Backlog |

## Deployment plan

- Pre-check: versiones, config, ventana, guardia
- Backup: verificado, con tiempo de restauracion conocido
- Migracion: fase Expand
- Deploy: aplicacion
- Health check
- Smoke test
- Validacion de negocio
- Monitoreo intensivo 2 h
- Release completado -> G9

## Rollback

- Release en produccion
- Monitoreo
- Error critico? --NO--> continuar hasta G9
- SI
- Decision de rollback: TL, criterios predefinidos, max 15 min
- Rollback de aplicacion (version anterior)
- Estrategia de datos (tabla al lado)
- Validacion + comunicacion
- Incident Report / Postmortem

## Hotfix

- Incidente Sev1/Sev2 confirmado
- Ticket de incidente (obligatorio)
- Rama hotfix desde main
- Fix minimo + prueba que reproduce el fallo
- PR con review (posterior al deploy solo en Sev1)
- CI completo -- no se salta
- Pre-Produccion: smoke dirigido
- Aprobacion TL -> Produccion
- Verificacion + postmortem en 72 h
- Merge de vuelta + HU de causa raiz

## Expand/contract (esquema de datos)

- {'paso': 'Expand · agregar sin quitar', 'descripcion': 'Se crean las columnas o tablas nuevas, siempre nullable y sin restricciones que rompan lo existente. El esquema viejo sigue intacto y la aplicación actual sigue funcionando sin cambios.', 'reversion': 'Reversible sin costo: si algo falla, la estructura nueva simplemente se ignora.'}
- {'paso': 'Deploy · escritura dual', 'descripcion': 'Se despliega el código que escribe en la estructura vieja y en la nueva, y que lee de la nueva con fallback a la vieja. Ninguna funcionalidad depende todavía de que el backfill haya terminado.', 'reversion': 'El rollback de aplicación es limpio: la versión anterior sigue leyendo la estructura vieja.'}
- {'paso': 'Migrate · backfill por lotes', 'descripcion': 'Se copian los datos históricos en lotes, con un proceso idempotente y reanudable. Se registra el punto de corte para poder detener y continuar sin duplicar.', 'reversion': 'Si hay que abortar, se detiene el proceso y se marca el corte; no se revierte el esquema.'}
- {'paso': 'Validate · reconciliación', 'descripcion': 'Conteo de registros, sumas de importes y muestreo funcional entre origen y destino, con tolerancia cero en los controles numéricos. Se observa al menos un release completo antes de continuar.', 'reversion': 'Es el punto de no retorno controlado: si la reconciliación no cuadra, no se avanza a Contract.'}
- {'paso': 'Contract · eliminar lo viejo', 'descripcion': 'En un release posterior y separado se retira la escritura dual, se eliminan columnas o tablas antiguas y se limpia el código de compatibilidad.', 'reversion': 'Nunca en el mismo release que el reemplazo. Aquí el rollback ya exige backup.'}

## Metricas del marco

| Metrica | Objetivo | Revela |
|---|---|---|
| Frecuencia de despliegue | ≥ 1 por sprint por servicio | Lotes grandes y releases riesgosos |
| Lead time de Ready a Producción | < 10 días | Cuellos de botella en QA o en aprobaciones |
| Tasa de fallo en cambios | < 15% | Gates que se están firmando sin verificar |
| Tiempo de restauración (MTTR) | < 4 h | Rollback no ensayado u observabilidad pobre |
| HU rechazadas en el QA Gate | < 20% | Criterios de aceptación débiles o DoR de adorno |
| HU que entran al sprint sin DoR | 0 | El marco no se está aplicando |
