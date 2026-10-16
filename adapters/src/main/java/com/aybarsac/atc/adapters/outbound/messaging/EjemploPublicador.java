
package com.aybarsac.atc.adapters.outbound.messaging;

import java.util.Map;

import com.aybarsac.sdk.messaging.AybarEventProducer;

import com.aybarsac.atc.domain.model.Ejemplo;

/**
 * ANDAMIO: publica un evento de ejemplo. Borra esta clase al publicar tu primer evento
 * de verdad.
 *
 * <p>El {@code AybarEventProducer} lo crea {@code aybar-starter-messaging} y ya pone los
 * headers de correlacion (X-Correlation-Id, companyId, userAccountId, servicio), asi que
 * aqui no hay que tocar nada de eso.</p>
 *
 * <p><strong>Todavia no es un bean de Spring:</strong> un publicador de verdad implementa
 * un puerto declarado en {@code domain.port.out} y se anota con {@code @Component}. Este
 * no implementa ninguno porque el andamio no tiene un evento propio que publicar.</p>
 *
 * <p>El nombre del topic sigue la forma {@code aybar.<fragmento>.<evento>}, y el contenido
 * del evento es un contrato publico: anadir un campo es seguro, quitarlo o renombrarlo
 * rompe a quien lo consume.</p>
 */
public class EjemploPublicador {

    private static final String TOPIC = "aybar.ejemplo.registrado";

    private final AybarEventProducer productor;

    public EjemploPublicador(AybarEventProducer productor) {
        this.productor = productor;
    }

    /**
     * El SDK valida key y payload antes de publicar (fail-closed, Ley 29733):
     * <ul>
     *   <li><strong>key</strong>: {@code null} o un identificador tecnico
     *       {@code [A-Za-z][A-Za-z0-9_]{0,63}} sin 8 o mas digitos seguidos. Viaja en
     *       claro al broker y a la DLQ. Aqui va {@code null}: un id numerico solo
     *       ({@code "42"}) no vale, y {@code "ejemplo_" + id} dejaria de valer el dia
     *       que el id tenga 8 cifras. Si necesitas orden por agregado, usa un
     *       identificador tecnico propio que nunca tenga esa forma.</li>
     *   <li><strong>payload</strong>: claves con la misma regla y valores de la lista
     *       blanca ({@code Long}, {@code Integer}, {@code Boolean}, {@code Instant},
     *       {@code enum}, {@code PartyRef}, {@code RefEntidad}, {@code RefCatalogo}).
     *       Un {@code String} libre (como el nombre) se rechaza: el consumidor que lo
     *       necesite lo lee por el id.</li>
     * </ul>
     */
    public void publicarRegistrado(Ejemplo ejemplo) {
        productor.publish(TOPIC, null, Map.of("id", ejemplo.id()));
    }
}

