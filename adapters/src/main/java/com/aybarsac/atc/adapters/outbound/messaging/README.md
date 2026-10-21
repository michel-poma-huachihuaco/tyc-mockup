
outbound/messaging - lo que el servicio PUBLICA en Kafka
========================================================

QUE VA AQUI
- Los publicadores: implementan un puerto de `domain/port/out` y mandan el evento con el
  `AybarEventProducer` de `aybar-starter-messaging`, que ya pone los headers de correlacion.
- El nombre del topic, con la forma `aybar.<fragmento>.<evento>`.

QUE NO VA AQUI
- Decidir SI se publica: eso lo decide el caso de uso o el dominio. Aqui solo se publica.
- Un evento publicado es un contrato publico: anadir un campo es seguro, quitarlo o
  renombrarlo rompe a quien lo consume y se negocia antes.

DE QUE PUEDE DEPENDER
- De `domain`, de Spring Kafka y de `aybar-starter-messaging`.

COMO LLAMARLO CUANDO LO CREES (todavia no existe)
- `CobroRegistradoPublicador.java`.

`EjemploPublicador` es andamio: borralo cuando publiques tu primer evento de verdad.

