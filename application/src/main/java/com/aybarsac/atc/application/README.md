application - los casos de uso que orquestan el negocio
======================================================

QUE VA AQUI
- Un caso de uso por operacion de negocio, en `application/usecase`: recibe datos simples,
  llama al dominio y a los puertos, y devuelve el resultado.
- La anotacion `@Transactional` cuando la operacion escribe en una base transaccional.

QUE NO VA AQUI
- Reglas de negocio: esas viven en `domain`. Si un caso de uso empieza a decidir cosas del
  negocio, esa decision se mueve a una entidad o a un objeto de valor.
- Detalles de HTTP (`@RestController`, codigos de estado), de SQL ni de Kafka.

DE QUE PUEDE DEPENDER
- De `domain` (modelos y puertos) y de Spring para inyectar y para transacciones.
- NUNCA de `adapters`: el caso de uso conoce el puerto, no quien lo implementa.

COMO LLAMARLO CUANDO LO CREES (todavia no existe)
- `application/usecase/RegistrarCobroUseCase.java`. El que si viene ya, de andamio, es
  `application/usecase/RegistrarEjemploUseCase.java`.

La regla de no depender de `adapters` tambien la vigila `NormaHexagonalTest`.
