
outbound/persistence/mongo - el lado de LECTURA
===============================================

QUE VA AQUI
- El `@Document` con la forma que le conviene a una pantalla o a un informe, aunque repita
  datos: en lectura se optimiza para leer, no para normalizar.
- El adaptador que implementa el puerto de lectura de `domain/port/out` contra MongoDB.

QUE NO VA AQUI
- Escrituras de negocio: la fuente de la verdad es PostgreSQL, en la carpeta `postgres`.
  Aqui solo se guarda la proyeccion, y la actualiza el propio servicio al consumir sus
  eventos.
- Reglas de negocio disfrazadas de consulta.

DE QUE PUEDE DEPENDER
- De `domain`, de Spring Data MongoDB y de `aybar-starter-data`.

COMO LLAMARLOS CUANDO LOS CREES (todavia no existen)
- `CobroDocumento.java` y `CobroConsultaMongo.java`.

Las clases `Ejemplo*` de esta carpeta son andamio: borralas al escribir la primera
proyeccion de verdad.

