# Checklist CAD-F5 (alineamiento de datos en Refinement)

HU: [AYB-NNNN] - Respuesta cerrada por item: Cumple / No cumple / No aplica.
Se registra en la HU, sin documento aparte.

## Arquitectura
- [ ] Consume el dato del sistema dueño por el mecanismo aprobado (servicio,
      API o evento), sin acceso directo a otro dominio ni replicas no previstas
- [ ] Persiste en el componente que la arquitectura asigna a ese dato

## Modelo de datos
- [ ] Entidades y campos existen en lo aprobado en F4
- [ ] La granularidad coincide con la aprobada
- [ ] Claves y relaciones son las definidas en F4

## Reglas de negocio de datos
- [ ] Obligatoriedad, dominios, validaciones y calculos coinciden
- [ ] Estados y ciclo de vida contemplados

## Declaraciones
- [ ] La HU declara que entidades/campos LEE y cuales ESCRIBE
- [ ] Todo cambio de estructura existente fue aprobado en F4
- [ ] Tratamiento de datos existentes definido: default, backfill,
      convivencia o "no aplica" justificado
- [ ] Migracion/carga/backfill/borrado declarados
- [ ] Sin PII nueva sin clasificacion y tratamiento
- [ ] Consumidores aguas abajo identificados; contrato no se rompe

## Desviaciones

Mayor (bloquea, retorna a F4): entidad o campo nuevo, cambio de clave/
cardinalidad/granularidad, PII nueva, integracion o linaje nuevo, migracion
no declarada, integridad sobre historicos, borrado fisico productivo, acceso
a otro dominio, ruptura de contrato, o vacio de definicion.

Menor (registrar con responsable y fecha de cierre <= F8): nomenclatura,
descripcion faltante, tipo/longitud sin impacto, indice sin definir.
Tres menores abiertas en la iniciativa: escala y bloquea.

Resultado: [Aprobado | Aprobado con observaciones | Rechazado]
