boot - el arranque de la aplicacion
===================================

QUE VA AQUI
- La clase con `@SpringBootApplication` que arranca el servicio: `Application.java`.
- La configuracion de Spring que no pertenece a ninguna capa concreta: clases `@Configuration`
  que crean beans de infraestructura, o un `CommandLineRunner` de arranque.
- El smoke test del arranque, que por eso vive en `src/test/java/boot`.

QUE NO VA AQUI
- Reglas de negocio, casos de uso, controladores ni repositorios. Aqui no se implementa
  nada del servicio: solo se enciende.

DE QUE PUEDE DEPENDER
- De todo lo demas, porque es el unico sitio que conoce el conjunto. Es la capa mas
  externa y nadie depende de ella.

QUE HAY HOY Y QUE PODRIAS ANADIR
- Hoy: `boot/Application.java`. Si algun dia necesitas un bean de infraestructura propio,
  una clase como `boot/RelojConfiguracion.java` iria aqui (todavia no existe).

El paquete raiz del escaneo de componentes es `com.aybarsac.atc`: todo lo que cuelgue de ahi
lo ve Spring sin configuracion extra.
