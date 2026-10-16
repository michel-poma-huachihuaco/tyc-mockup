package com.aybarsac.atc.boot;

import static org.assertj.core.api.Assertions.assertThat;


import java.sql.Connection;
import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.kafka.core.KafkaTemplate;


/**
 * Smoke test del servicio.
 *
 * <p>Corre sin infraestructura y levanta el contexto entero en cualquier maquina y en
 * CI. Lo consigue por el perfil 'local' que trae application.yml, no saltandose
 * nada.</p>

 *
 * <p>Con aybar-starter-data el arranque usa el H2 en memoria del SDK
 * (aybar.data.postgres.fallback-h2), asi que no hace falta PostgreSQL, y Mongo queda
 * excluido en ese mismo perfil.</p>


 *
 * <p>Con aybar-starter-messaging basta con que el bootstrap del broker este declarado:
 * el productor de Kafka conecta perezosamente, asi que tampoco hace falta un broker.</p>


 *
 * <p>Con aybar-starter-security tampoco hace falta emisor OIDC: el JwtDecoder de
 * issuer-uri se resuelve con el primer token, no al arrancar, asi que sin token lo
 * protegido responde 401 y el emisor no se contacta nunca.</p>

 *
 * <p>Vive en {@code boot} junto a la clase que arranca, que es la convencion
 * del resto de servicios Aybar: el smoke test es del arranque, no de una capa.</p>
 *
 * <p>Ese perfil 'local' es una muleta de desarrollo, no un sustituto de las
 * pruebas de verdad. En cuanto el servicio hable con infraestructura real, lo que
 * corresponde es un test de integracion con Testcontainers (nombre terminado en IT, lo
 * ejecuta Failsafe) contra las imagenes reales. Lo que no vale nunca es anotar un test
 * con @EnabledIf para que se salte en silencio.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// Sin perfil 'local' el arranque falla en cuanto un starter detecta que le falta
// una variable obligatoria (AYBAR_DATASOURCE_URI, AYBAR_KAFKA_BOOTSTRAP,
// AYBAR_ISSUER_URI): el SDK prefiere un arranque caido a uno silencioso que
// apunte a la base equivocada. El perfil 'local' aporta los valores por defecto
// (H2 en memoria, Mongo excluido, emisor OIDC sin configurar).
@ActiveProfiles("local")
class ApplicationTest {

    @Autowired
    private ApplicationContext contexto;

    @Autowired
    private TestRestTemplate http;

    @Test
    void contextLoads() {
        assertThat(contexto).isNotNull();
    }

    @Test
    void exponeActuatorHealthConEstadoUp() {
        // Llamada HTTP real contra el puerto aleatorio del test. Esto es lo que
        // cazaria el fallo clasico de olvidar spring-boot-starter-actuator: el
        // bloque management.endpoints del application.yml queda inerte y esta
        // misma URL devuelve 404 en vez de 200.
        ResponseEntity<String> respuesta = http.getForEntity("/actuator/health", String.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).contains("\"status\":\"UP\"");
    }

    @Test
    void exponeLasSondasLivenessYReadinessDelSdk() {
        // Grupos que aporta aybar-starter-config por defecto (AybarActuatorDefaults)
        // y que consume el orquestador (ECS/Kubernetes).
        assertThat(http.getForEntity("/actuator/health/liveness", String.class).getStatusCode())
                .isEqualTo(HttpStatus.OK);
        assertThat(http.getForEntity("/actuator/health/readiness", String.class).getStatusCode())
                .isEqualTo(HttpStatus.OK);
    }


    @Test
    void abreUnaConexionRealContraLaBaseDeDatos() throws Exception {
        // No comprueba que exista el bean: abre la conexion. Con el perfil 'local'
        // eso ejercita de verdad el H2 en memoria que monta aybar-starter-data, y
        // el dia que se exporte AYBAR_DATASOURCE_URI esta misma prueba pasa a
        // ejercitar el Postgres real sin tocar una linea.
        DataSource dataSource = contexto.getBean(DataSource.class);

        try (Connection conexion = dataSource.getConnection()) {
            assertThat(conexion.isValid(5)).isTrue();
        }
    }



    @Test
    void sinEmisorNiTokenLoProtegidoResponde401() {
        // Es lo que ve el frontend con el login demo, que no tiene token. Sin
        // AYBAR_ISSUER_URI el perfil 'local' apunta a un dominio .invalid: si el
        // arranque necesitara contactar al emisor, el contexto ni habria levantado.
        assertThat(http.getForEntity("/recursos-ejemplo/quien-soy", String.class).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }



    @Test
    void elProductorDeKafkaEstaConfigurado() {
        // El KafkaTemplate no conecta al crearse, asi que esto no necesita broker.
        // Lo que si verifica es que aybar-starter-messaging se autoconfiguro: si
        // faltara spring.kafka.bootstrap-servers, el starter habria abortado el
        // arranque y este test ni llegaria a ejecutarse.
        assertThat(contexto.getBean(KafkaTemplate.class)).isNotNull();
    }

}
