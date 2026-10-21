adapters - la frontera con la tecnologia
========================================

QUE VA AQUI
- `adapters/inbound`: lo que ENTRA al servicio. Controladores REST en `inbound/rest`, y los
  consumidores en `inbound/messaging` cuando el servicio consume eventos. Traducen del
  mundo exterior al caso de uso.
- `adapters/outbound`: lo que SALE. Persistencia en `outbound/persistence`, y ademas
  `outbound/messaging` para publicar eventos y `outbound/external` para APIs de terceros
  cuando esos starters estan puestos. Implementan los puertos que declaro `domain`.
- Las carpetas que dependen de un starter solo existen si ese starter esta encendido. En
  este servicio estan las que veas al lado de este fichero, ni una mas.

QUE NO VA AQUI
- Reglas de negocio. Un adaptador traduce y delega; si tiene un `if` de negocio, ese `if`
  pertenece a `domain`.
- Logica compartida entre adaptadores que en realidad es un caso de uso: va en `application`.

DE QUE PUEDE DEPENDER
- De `domain`, de `application`, de Spring y de la tecnologia concreta de cada carpeta.

COMO LLAMARLOS CUANDO LOS CREES (todavia no existen)
- `adapters/inbound/rest/CobroController.java`, y el adaptador de escritura dentro de la
  carpeta de su tecnologia, por ejemplo `CobroRepositorioJpa.java`.
