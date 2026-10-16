
package com.aybarsac.atc.adapters.outbound.persistence.postgres;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * ANDAMIO: la tabla de ejemplo del lado de escritura. Borra esta clase al crear tu
 * primera entidad de verdad.
 *
 * <p>Fijate en que esta clase NO es {@code com.aybarsac.atc.domain.model.Ejemplo}. Son dos
 * a proposito: el modelo del dominio no lleva anotaciones de JPA, y esta no lleva reglas
 * de negocio. El adaptador traduce de una a otra.</p>
 */
@Entity
@Table(name = "ejemplo")
public class EjemploJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    /** JPA necesita un constructor sin argumentos. */
    protected EjemploJpaEntity() {
    }

    public EjemploJpaEntity(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}

