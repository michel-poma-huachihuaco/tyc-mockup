domain - las reglas del negocio, sin tecnologia
===============================================

QUE VA AQUI
- Entidades y objetos de valor con las reglas del negocio: `Cuota`, `Monto`, `EstadoCobro`.
- Los puertos de salida, en `domain/port/out`: interfaces que dicen que NECESITA el negocio
  del mundo exterior, escritas con palabras del negocio y no de la tecnologia.

QUE NO VA AQUI
- Anotaciones de Spring (`@Service`, `@Component`), de JPA (`@Entity`) ni de Kafka. Si te ves
  poniendo una, esa clase es un adaptador y va en `adapters`.
- HTTP, SQL, JSON, nombres de tablas o de topics.

DE QUE PUEDE DEPENDER
- Del JDK (`java.*`) y de si mismo, nada mas.
- Del SDK solo lo que es Java puro: `com.aybarsac.sdk.errores` (catalogo `CodigoNegocio`),
  `com.aybarsac.sdk.data.cqrs` y `com.aybarsac.sdk.common`.

COMO LLAMARLOS CUANDO LOS CREES (todavia no existen)
- `domain/model/Cuota.java` y `domain/port/out/CuotaRepositorio.java`.

Esto no es un consejo: `com.aybarsac.atc.arquitectura.NormaHexagonalTest` rompe el build si
`domain` importa Spring, JPA, Jakarta o cualquier otra parte del SDK.
