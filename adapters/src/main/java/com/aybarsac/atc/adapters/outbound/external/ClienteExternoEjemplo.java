
package com.aybarsac.atc.adapters.outbound.external;

import java.util.Map;

import com.aybarsac.sdk.client.ClientesAybar;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Cliente HTTP de ejemplo contra un servicio externo, construido con
 * {@link ClientesAybar} para que herede los interceptores del SDK:
 * propagacion automatica de {@code X-Correlation-Id} y del
 * {@code Authorization: Bearer} del usuario (o token client-credentials
 * si no hay usuario).
 *
 * <p><strong>Por que no se construye un {@code RestClient} a mano:</strong>
 * un {@code RestClient.builder().baseUrl(...).build()} compila, funciona,
 * y pierde en silencio el token, la correlacion y los timeouts del SDK.
 * Toda llamada saliente en un servicio Aybar <strong>debe</strong> pasar
 * por {@code ClientesAybar}.</p>
 *
 * <p><strong>Quitar cuando entre la primera HU real.</strong> La URL
 * {@code https://httpbin.org/json} es un servicio publico de prueba: el
 * junior ve el patron sin necesitar credenciales ni otra pieza desplegada.
 * Para una llamada real, declarar el host en
 * {@code aybar.client.hosts-con-token} para no filtrar el bearer a un
 * tercero.</p>
 */
@Component
public class ClienteExternoEjemplo {

    private final RestClient cliente;

    public ClienteExternoEjemplo(ClientesAybar clientes) {
        // ClientesAybar.para(baseUrl) devuelve un RestClient con la
        // configuracion corporativa ya aplicada. Si el host aparece en
        // aybar.client.hosts-con-token, el Authorization Bearer se
        // adjunta automaticamente; si no, el SDK avisa al arrancar.
        this.cliente = clientes.para("https://httpbin.org");
    }

    /**
     * Devuelve un JSON publico de prueba. La firma se queda en este
     * servicio: cualquier traduccion al modelo del dominio iria en
     * adaptadores, no en la capa de aplicacion.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> obtenerJsonPublico() {
        return cliente.get()
                .uri("/json")
                .retrieve()
                .body(Map.class);
    }
}
