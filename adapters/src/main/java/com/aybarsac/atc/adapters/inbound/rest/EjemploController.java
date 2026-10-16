package com.aybarsac.atc.adapters.inbound.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aybarsac.atc.adapters.outbound.wiring.RegistrarEjemploConductor;
import com.aybarsac.atc.domain.model.Ejemplo;

/**
 * AQUI VAN los adaptadores de ENTRADA por HTTP: controladores REST y sus DTOs.
 * Un adaptador de entrada traduce de HTTP al lenguaje del caso de uso y no
 * contiene reglas de negocio.
 *
 * <p>Las anotaciones de OpenAPI ({@code @Operation}, {@code @Schema}) van aqui y
 * solo aqui; las aporta aybar-starter-web.</p>
 *
 * <p>Los errores se devuelven como RFC 7807 con codigos {@code AYB-*}, que
 * tambien aporta aybar-starter-web. No construyas cuerpos de error a mano.</p>
 *
 * <p>Si tu servicio consume eventos de Kafka, ese listener es tambien un
 * adaptador de entrada y va en {@code adapters.inbound.messaging}.</p>
 */
@RestController
public class EjemploController {

    private final RegistrarEjemploConductor registrarEjemplo;

    public EjemploController(RegistrarEjemploConductor registrarEjemplo) {
        this.registrarEjemplo = registrarEjemplo;
    }

    @PostMapping("/ejemplos")
    public Ejemplo registrar(@RequestParam String nombre) {
        return registrarEjemplo.registrar(nombre);
    }

    @GetMapping("/ejemplos/{id}")
    public String obtener(@PathVariable Long id) {
        return "Sustituye este endpoint por el tuyo: id=" + id;
    }
}
