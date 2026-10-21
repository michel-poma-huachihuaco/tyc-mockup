
outbound/external - las llamadas a sistemas de fuera
====================================================

QUE VA AQUI
- Los clientes HTTP hacia APIs de terceros o de otras areas, construidos con el
  `ClientesAybar` de `aybar-starter-client`, que propaga el correlationId y el token.
- La traduccion entre el JSON del tercero y el modelo del dominio: el DTO del proveedor se
  queda aqui y no viaja al resto del servicio.

QUE NO VA AQUI
- Llamadas HTTP a otro microservicio Aybar: entre servicios se habla por eventos de Kafka,
  no por REST. Si te hace falta un dato de otro servicio, se consume su evento.
- Reintentos a mano: el circuit breaker y el retry los gobierna el starter.

DE QUE PUEDE DEPENDER
- De `domain` y de `aybar-starter-client`.

COMO LLAMARLOS CUANDO LOS CREES (todavia no existen)
- `SunatClienteRest.java` y su DTO `SunatRespuesta.java`.

