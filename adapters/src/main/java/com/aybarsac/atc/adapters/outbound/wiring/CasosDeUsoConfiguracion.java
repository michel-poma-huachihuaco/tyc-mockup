package com.aybarsac.atc.adapters.outbound.wiring;

import com.aybarsac.atc.application.usecase.RegistrarEjemploUseCase;
import com.aybarsac.atc.domain.port.out.EjemploRepositorio;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracion de Spring para los casos de uso. Como {@code application}
 * es Java puro (lo verifica NormaHexagonalTest), las clases alli no llevan
 * {@code @Service}. Es {@code adapters} quien le dice al contenedor como
 * construirlas: por cada caso de uso nuevo, anade un {@code @Bean} aqui.
 */
@Configuration
public class CasosDeUsoConfiguracion {

    @Bean
    public RegistrarEjemploUseCase registrarEjemploUseCase(EjemploRepositorio repositorio) {
        return new RegistrarEjemploUseCase(repositorio);
    }
}