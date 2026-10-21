package com.aybarsac.atc.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;


/**
 * Punto de entrada del microservicio. Vive en {@code boot}, la unica capa del
 * hexagono que conoce a todas las demas.
 *
 * <p>Los starters del SDK se autoconfiguran solos al estar en el classpath:
 * aybar-starter-config (perfiles, variables AYBAR_*, defaults de Actuator,
 * startup report) y aybar-starter-logging (logs JSON con correlationId). No hay
 * que registrar nada a mano.</p>
 *
 * <p><strong>Por que el {@code scanBasePackages} explicito.</strong> Al estar
 * esta clase en {@code com.aybarsac.atc.boot}, el escaneo por defecto de Spring Boot
 * solo alcanzaria ese subpaquete: {@code domain}, {@code application} y
 * {@code adapters} son paquetes HERMANOS, no hijos, y sus beans no se
 * encontrarian. No lo quites.</p>
 */
@SpringBootApplication(scanBasePackages = "com.aybarsac.atc")

// Los paquetes de persistencia se declaran aparte por el mismo motivo: Spring
// Boot deriva el paquete base de JPA y de Mongo del paquete de ESTA clase, no de
// scanBasePackages. Sin estas tres anotaciones, tus @Entity y tus repositorios
// quedarian fuera del escaneo y el servicio arrancaria sin ellos sin decir por que.
//
// OJO: los dos paquetes a los que apuntan todavia NO existen en el proyecto recien
// generado. Estan ya escritos para cuando los crees; mientras tanto el arranque
// funciona igual, porque aybar-starter-data soporta un servicio sin entidades.
// El arbol completo esta en el README de este proyecto.
@EntityScan(basePackages = "com.aybarsac.atc.adapters.outbound.persistence.postgres")
@EnableJpaRepositories(basePackages = "com.aybarsac.atc.adapters.outbound.persistence.postgres")
@EnableMongoRepositories(basePackages = "com.aybarsac.atc.adapters.outbound.persistence.mongo")

public class AtcApplication {

    public static void main(String[] args) {
        SpringApplication.run(AtcApplication.class, args);
    }
}
