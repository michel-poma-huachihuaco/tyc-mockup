
package com.aybarsac.atc.adapters.outbound.persistence.postgres;

import java.util.Optional;

import jakarta.persistence.EntityManager;

import com.aybarsac.atc.domain.model.Ejemplo;
import com.aybarsac.atc.domain.port.out.EjemploRepositorio;

/**
 * ANDAMIO: implementa el puerto del dominio contra PostgreSQL con JPA. Borra esta clase
 * al escribir tu primer repositorio de verdad.
 *
 * <p><strong>Todavia no es un bean de Spring, y es intencionado:</strong> mientras exista
 * {@code adapters.outbound.persistence.EjemploRepositorioEnMemoria} habria dos candidatos
 * para el mismo puerto y el arranque fallaria. Cuando borres el de memoria, anota esta
 * clase con {@code @Repository} y marca con {@code @Transactional} los metodos que
 * escriben.</p>
 */
public class EjemploRepositorioJpa implements EjemploRepositorio {

    private final EntityManager entityManager;

    public EjemploRepositorioJpa(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public Ejemplo guardar(Ejemplo ejemplo) {
        EjemploJpaEntity fila = new EjemploJpaEntity(ejemplo.id(), ejemplo.nombre());
        EjemploJpaEntity guardada = entityManager.merge(fila);
        return new Ejemplo(guardada.getId(), guardada.getNombre());
    }

    @Override
    public Optional<Ejemplo> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(EjemploJpaEntity.class, id))
                .map(fila -> new Ejemplo(fila.getId(), fila.getNombre()));
    }
}

