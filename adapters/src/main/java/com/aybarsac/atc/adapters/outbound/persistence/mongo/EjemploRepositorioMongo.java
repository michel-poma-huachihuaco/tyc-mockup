
package com.aybarsac.atc.adapters.outbound.persistence.mongo;

import java.util.Optional;

import org.springframework.data.mongodb.core.MongoTemplate;

import com.aybarsac.atc.domain.model.Ejemplo;
import com.aybarsac.atc.domain.port.out.EjemploRepositorio;

/**
 * ANDAMIO: implementa el puerto del dominio contra MongoDB. Borra esta clase al escribir
 * tu primera consulta de verdad.
 *
 * <p><strong>Todavia no es un bean de Spring</strong>, por lo mismo que
 * {@code EjemploRepositorioJpa}: hoy el puerto ya lo sirve el repositorio en memoria.
 * Cuando esta clase sea la buena, anotala con {@code @Repository}.</p>
 *
 * <p>Ojo con el perfil 'local': application.yml excluye la autoconfiguracion de Mongo para
 * que el servicio arranque sin Mongo levantado, asi que ahi no hay {@code MongoTemplate}.
 * Cuando uses esta clase de verdad, exporta AYBAR_MONGO_URI y quita esa exclusion.</p>
 */
public class EjemploRepositorioMongo implements EjemploRepositorio {

    private final MongoTemplate mongoTemplate;

    public EjemploRepositorioMongo(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Ejemplo guardar(Ejemplo ejemplo) {
        String id = ejemplo.id() == null ? null : String.valueOf(ejemplo.id());
        EjemploDocumento guardado = mongoTemplate.save(new EjemploDocumento(id, ejemplo.nombre()));
        return new Ejemplo(Long.valueOf(guardado.getId()), guardado.getNombre());
    }

    @Override
    public Optional<Ejemplo> buscarPorId(Long id) {
        return Optional.ofNullable(mongoTemplate.findById(String.valueOf(id), EjemploDocumento.class))
                .map(documento -> new Ejemplo(id, documento.getNombre()));
    }
}

