package com.aybarsac.atc.adapters.outbound.persistence;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Repository;

import com.aybarsac.atc.domain.model.Ejemplo;
import com.aybarsac.atc.domain.port.out.EjemploRepositorio;

/**
 * AQUI VAN los adaptadores de SALIDA: las implementaciones de los puertos de
 * {@code domain.port.out}.
 *
 * <p><strong>Esta clase es un andamio, no un destino.</strong> Guarda en memoria
 * para que el esqueleto arranque y el smoke test pase sin base de datos.
 * Borrala en cuanto tengas persistencia de verdad.</p>
 *
 * <p>Cuando la sustituyas, respeta el reparto CQRS del estandar Aybar. Las carpetas que
 * se citan abajo aparecen en el proyecto al encender su starter; si hoy no estan, es
 * que ese starter no se pidio al generar:</p>
 * <ul>
 *   <li><b>Escritura en PostgreSQL</b> -> {@code adapters.outbound.persistence.postgres}:
 *       la {@code @Entity} JPA, su {@code JpaRepository} y el adaptador que
 *       implementa el puerto de escritura.</li>
 *   <li><b>Lectura en MongoDB</b> -> {@code adapters.outbound.persistence.mongo}:
 *       el {@code @Document}, su {@code MongoRepository} y el adaptador que
 *       implementa el puerto de lectura.</li>
 *   <li><b>Kafka</b> -> {@code adapters.outbound.messaging} (publicar) y
 *       {@code adapters.inbound.messaging} (consumir). Kafka no aparece en
 *       ninguna otra capa.</li>
 *   <li><b>APIs de terceros</b> -> {@code adapters.outbound.external}, con el
 *       {@code ClientesAybar} de aybar-starter-client.</li>
 * </ul>
 */
@Repository
public class EjemploRepositorioEnMemoria implements EjemploRepositorio {

    private final Map<Long, Ejemplo> almacen = new ConcurrentHashMap<>();
    private final AtomicLong secuencia = new AtomicLong();

    @Override
    public Ejemplo guardar(Ejemplo ejemplo) {
        Long id = ejemplo.id() != null ? ejemplo.id() : secuencia.incrementAndGet();
        Ejemplo guardado = new Ejemplo(id, ejemplo.nombre());
        almacen.put(id, guardado);
        return guardado;
    }

    @Override
    public Optional<Ejemplo> buscarPorId(Long id) {
        return Optional.ofNullable(almacen.get(id));
    }
}
