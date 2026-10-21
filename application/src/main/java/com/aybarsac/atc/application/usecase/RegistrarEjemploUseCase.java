package com.aybarsac.atc.application.usecase;

import com.aybarsac.atc.domain.model.Ejemplo;
import com.aybarsac.atc.domain.port.out.EjemploRepositorio;

/**
 * AQUI VAN los casos de uso: un caso de uso por operacion de negocio, orquestando
 * el dominio y los puertos. Sin logica de negocio propia - esa vive en
 * {@code domain} - y sin detalles de HTTP, SQL ni Kafka.
 *
 * <p><strong>Java puro.</strong> Esta clase no importa Spring, JPA ni el SDK:
 * es Java del lenguaje. El wiring ({@code @Service}, {@code @Transactional})
 * se hace en {@code adapters}, en una clase conductora que recibe el caso de
 * uso por inyeccion y lo envuelve con las anotaciones de Spring. Ver
 * {@code adapters.outbound.persistence.EjemploRepositorioEnMemoria}. El
 * dominio y los casos de uso no importan Spring: lo verifica
 * {@code NormaHexagonalTest}.</p>
 */
public class RegistrarEjemploUseCase {

    private final EjemploRepositorio repositorio;

    public RegistrarEjemploUseCase(EjemploRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    public Ejemplo registrar(String nombre) {
        return repositorio.guardar(new Ejemplo(null, nombre));
    }
}
