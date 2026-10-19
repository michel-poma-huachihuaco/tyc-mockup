---
name: aybar-arquitectura-vigente
description: Topología hexagonal vigente de un servicio del SDK Aybar a nivel de contrato — capas, qué no puede importar qué y quién lo hace cumplir. Usar antes de proponer dónde va un archivo nuevo o un cambio de capa, o cuando un agente esté por escribir código en un servicio construido con el SDK.
---

# Arquitectura vigente

Resumen de contrato. El detalle de paquetes y la tabla "dónde va cada cosa" están
en la skill `aybar-hexagonal`; la fuente que corta es `NormaHexagonalTest`.

## Capas

```
domain          entidades, value objects, servicios de dominio, puertos (port.in, port.out)
application     casos de uso que orquestan los puertos; commands, queries, DTO
adapters        REST, mensajería, persistencia y clientes externos: implementan los puertos
infrastructure  configuración transversal (security, logging, config)
boot            Application y el cableado; el único que conoce a todos
```

Las flechas apuntan hacia dentro: `adapters` → `application` → `domain`. `domain`
no depende de nadie.

## Reglas duras

- `domain` es Java puro: no importa Spring, JPA/Jakarta Persistence, Kafka, el driver documental, OpenAPI ni `com.aybarsac.sdk..`, salvo `com.aybarsac.sdk.common` y `com.aybarsac.sdk.data.cqrs`.
- `application` no conoce adaptadores.
- Una anotación de framework en una clase de dominio significa que esa clase no va en `domain`. Se resuelve con un mapeo explícito en `adapters`.
- Si dudas entre dos capas, la pregunta no es "dónde es más fácil", sino "qué depende de qué".

## Quién lo hace cumplir

- `NormaHexagonalTest` (ArchUnit, en `boot/src/test`) pone `./mvnw verify` en rojo y bloquea G5. Proponer algo que la viola es proponer un merge que va a fallar solo.
- `aybar verify arquitectura` la corre en segundos tras mover o crear clases.
- Si la regla y una skill discrepan, manda el test. Si crees que la regla estorba, se discute en G3; no se rodea ni se desactiva.

## Lo que no es de esta capa

Qué nube, qué emisor de tokens y qué servicio gestionado sirven cada adaptador no
es arquitectura del SDK: lo decide el ADR del proyecto (skill `aybar-lexico`). La
forma hexagonal no cambia con la nube.

Si el repositorio no usa el SDK (por ejemplo, un monorepo JS/TS), sigue la
arquitectura que ya tiene ese repositorio: no le impongas capas de Java.
