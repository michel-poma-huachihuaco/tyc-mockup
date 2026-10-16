package com.aybarsac.atc.adapters.outbound.wiring;

import com.aybarsac.atc.application.usecase.RegistrarEjemploUseCase;
import com.aybarsac.atc.domain.model.Ejemplo;

import org.springframework.stereotype.Service;

/**
 * Conductor de Spring para {@link RegistrarEjemploUseCase}. Es la pieza
 * minima de wiring que el hexagono necesita: el caso de uso es Java puro
 * (no depende de Spring), asi que no se puede anotar con {@code @Service}.
 * Un adapter lo envuelve con la anotacion y expone la misma operacion.
 *
 * <p>El {@code EjemploController} inyecta este conductor, no el caso de uso:
 * asi la frontera entre capas queda explicita (el caso de uso no importa Spring; lo verifica NormaHexagonalTest).</p>
 */
@Service
public class RegistrarEjemploConductor {

    private final RegistrarEjemploUseCase casoDeUso;

    public RegistrarEjemploConductor(RegistrarEjemploUseCase casoDeUso) {
        this.casoDeUso = casoDeUso;
    }

    public Ejemplo registrar(String nombre) {
        return casoDeUso.registrar(nombre);
    }
}