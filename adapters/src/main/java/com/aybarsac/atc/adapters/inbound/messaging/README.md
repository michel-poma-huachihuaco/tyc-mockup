
inbound/messaging - lo que el servicio CONSUME de Kafka
=======================================================

QUE VA AQUI
- Los consumidores: metodos con `@KafkaListener` que reciben un evento, lo traducen a datos
  del negocio y llaman a un caso de uso.
- La deserializacion y la validacion del mensaje que llega.

QUE NO VA AQUI
- Reglas de negocio: el consumidor traduce y delega en `application`.
- El reintento y la cola de descartes (DLQ): eso lo aporta `aybar-starter-messaging` sin que
  tengas que escribir nada.

DE QUE PUEDE DEPENDER
- De `application`, de `domain`, de Spring Kafka y de `aybar-starter-messaging`.

COMO LLAMARLO CUANDO LO CREES (todavia no existe)
- `CobroRegistradoConsumidor.java`.

`EjemploConsumidor` es andamio: borralo cuando consumas tu primer evento de verdad.

