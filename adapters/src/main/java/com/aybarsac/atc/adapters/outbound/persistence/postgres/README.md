
outbound/persistence/postgres - el lado de ESCRITURA
====================================================

QUE VA AQUI
- La `@Entity` JPA con su tabla, su `@Id` y sus columnas.
- El adaptador que implementa el puerto de escritura de `domain/port/out` usando JPA.
- Las migraciones NO: esas son ficheros SQL en `src/main/resources/db/migration` (Flyway).

QUE NO VA AQUI
- Consultas de lectura para pantallas o informes: en el estandar CQRS del SDK esas van
  contra MongoDB, en la carpeta `mongo` de al lado.
- La `@Entity` no es el modelo de dominio. Son dos clases distintas a proposito: la de
  aqui tiene anotaciones de JPA y la de `domain` no tiene ninguna.

DE QUE PUEDE DEPENDER
- De `domain`, de Spring Data JPA y de `aybar-starter-data`.

COMO LLAMARLOS CUANDO LOS CREES (todavia no existen)
- `CobroJpaEntity.java` y `CobroRepositorioJpa.java`.

Las clases `Ejemplo*` que ves aqui son andamio: se borran en cuanto escribas el primer
repositorio de verdad, igual que `adapters/outbound/persistence/EjemploRepositorioEnMemoria`.

