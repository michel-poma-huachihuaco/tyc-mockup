
package com.aybarsac.atc.adapters.outbound.persistence.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * ANDAMIO: la proyeccion de lectura de ejemplo. Borra esta clase al crear tu primera
 * proyeccion de verdad.
 *
 * <p>Una proyeccion se guarda con la forma que necesita quien la lee, aunque repita datos
 * que ya estan en PostgreSQL. Esa duplicidad es la que hace rapida la lectura, y es
 * deliberada.</p>
 */
@Document(collection = "ejemplo")
public class EjemploDocumento {

    @Id
    private String id;

    private String nombre;

    public EjemploDocumento(String id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}

