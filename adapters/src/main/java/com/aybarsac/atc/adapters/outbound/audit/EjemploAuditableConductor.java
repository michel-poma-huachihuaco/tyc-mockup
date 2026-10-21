
package com.aybarsac.atc.adapters.outbound.audit;

import java.time.Instant;
import java.util.Map;

import com.aybarsac.sdk.audit.Auditoria;
import com.aybarsac.sdk.audit.RefEntidad;

import com.aybarsac.atc.application.usecase.RegistrarEjemploUseCase;
import com.aybarsac.atc.domain.model.Ejemplo;

import org.springframework.stereotype.Component;

/**
 * Conductor de ejemplo que muestra como registrar un evento de negocio en la
 * auditoria corporativa del SDK alrededor de un caso de uso.
 *
 * <p><strong>Por que vive en {@code adapters} y no en {@code application}</strong>:
 * la fachada {@code Auditoria} es del SDK (infraestructura), asi que su uso es un
 * detalle de wiring, no de negocio. La regla del hexagono es que
 * {@code application} no importa el SDK; el cableado con Spring va aqui.</p>
 *
 * <p><strong>Como llega el evento a S3/MinIO</strong> (la cadena, sin tocar nada):</p>
 * <ol>
 *   <li>Este conductor llama {@code auditoria.negocio(...)} con la lista blanca fail-closed.</li>
 *   <li>El SDK despacha el evento en segundo plano ({@code aybar-audit-despachador}).</li>
 *   <li>El publicador activo sigue la precedencia <strong>S3 > NDJSON > log</strong>:
 *     <ul>
 *       <li><strong>S3</strong>: si tu pom.xml declara
 *           {@code <dependency><artifactId>s3</artifactId></dependency>} de
 *           {@code software.amazon.awssdk} <em>y</em> tu application.yml define
 *           {@code aybar.audit.s3.bucket} (y opcionalmente {@code s3.endpoint} para
 *           MinIO, {@code s3.path-style: true}), el evento sube a
 *           {@code auditoria/AAAA/MM/DD/<servicio>/<eventoId>.json}.</li>
 *       <li><strong>NDJSON</strong>: si {@code aybar.audit.ndjson.dir} esta definido,
 *           el evento se escribe a un fichero NDJSON particionado por fecha.</li>
 *       <li><strong>Log</strong>: en cualquier otro caso, el evento JSON aparece en
 *           el log de la aplicacion. No se pierde, pero tampoco queda en un soporte
 *           aparte.</li>
 *     </ul>
 *   </li>
 * </ol>
 *
 * <p><strong>Trampa que hay que conocer:</strong> si defines
 * {@code aybar.audit.s3.bucket} pero <em>no</em> agregas {@code software.amazon.awssdk:s3}
 * al pom, <strong>no falla nada</strong> y el evento cae al siguiente publicador en
 * silencio. Para activarlo en este proyecto, anade al pom de {@code adapters} la
 * dependencia de AWS SDK S3 (sin {@code <version>}: la gobierna {@code aybar-sdk-parent}
 * via el AWS BOM) y configura las properties en tu {@code application.yml}.</p>
 *
 * <p><strong>Lo que NUNCA va en el {@code datos}:</strong> un {@code String} libre,
 * {@code Double}/{@code BigDecimal}, {@code null}, ni un POJO cualquiera. La lista
 * blanca ({@code PartyRef}, {@code RefEntidad}, {@code RefCatalogo}, {@code Long},
 * {@code Integer}, {@code Boolean}, {@code Instant}, {@code enum}) rechaza todo lo
 * demas con {@code IllegalArgumentException} en el momento de la llamada.</p>
 */
@Component
public class EjemploAuditableConductor {

    private final RegistrarEjemploUseCase casoDeUso;
    private final Auditoria auditoria;

    public EjemploAuditableConductor(RegistrarEjemploUseCase casoDeUso, Auditoria auditoria) {
        this.casoDeUso = casoDeUso;
        this.auditoria = auditoria;
    }

    public Ejemplo registrarConAuditoria(String nombre, Long contratoId, Long aprobadoPorId) {
        Ejemplo guardado = casoDeUso.registrar(nombre);

        // Lista blanca fail-closed: solo tipos tecnicos. NO uses String,
        // Double ni null aca: la auditoria los rechaza con excepcion.
        auditoria.negocio("CONTRATO_APROBADO", Map.of(
                "contrato", new RefEntidad("MAE_CONTRACT", "CONTRACT", contratoId),
                "aprobadoPor", aprobadoPorId,
                "timestamp", Instant.now()));

        return guardado;
    }
}
