
package com.aybarsac.atc.adapters.inbound.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;

import com.aybarsac.atc.application.usecase.RegistrarEjemploUseCase;

/**
 * ANDAMIO: consume un evento de ejemplo. Borra esta clase al consumir tu primer evento
 * de verdad.
 *
 * <p><strong>Todavia no es un bean de Spring, y es intencionado:</strong> si lo fuera,
 * Spring abriria el consumidor al arrancar e intentaria conectarse a un Kafka que en local
 * no esta, llenando el arranque de errores de conexion. Cuando exista el topic y el broker,
 * anota la clase con {@code @Component} y el consumidor se enciende solo.</p>
 *
 * <p>El reintento acotado, la cola de descartes (.DLQ) y la proteccion contra el mensaje
 * envenenado los aporta {@code aybar-starter-messaging}: aqui no se escribe nada de eso.</p>
 *
 * <p>Un consumidor traduce y delega: convierte el mensaje en datos del negocio y llama a un
 * caso de uso. Las reglas viven en {@code domain}, nunca aqui.</p>
 */
public class EjemploConsumidor {

    private static final Logger log = LoggerFactory.getLogger(EjemploConsumidor.class);

    private final RegistrarEjemploUseCase registrarEjemplo;

    public EjemploConsumidor(RegistrarEjemploUseCase registrarEjemplo) {
        this.registrarEjemplo = registrarEjemplo;
    }

    @KafkaListener(topics = "aybar.ejemplo.registrado", groupId = "aybar-atc")
    public void alRecibirEjemploRegistrado(String mensaje) {
        log.info("evento recibido: {}", mensaje);
        registrarEjemplo.registrar(mensaje);
    }
}

