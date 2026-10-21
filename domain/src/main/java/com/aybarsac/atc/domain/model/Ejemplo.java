package com.aybarsac.atc.domain.model;

/**
 * AQUI VAN los modelos del dominio: entidades y value objects con las reglas de
 * negocio. Renombra esta clase por la primera entidad real de tu servicio.
 *
 * <p><strong>Invariante Aybar, no negociable:</strong> {@code domain} no importa
 * Spring, Kafka, JPA, Mongo ni {@code com.aybarsac.sdk}, con una unica excepcion:
 * {@code com.aybarsac.sdk.errores} (el catalogo {@code CodigoNegocio}). Si te ves
 * escribiendo aqui una anotacion {@code @Entity} o {@code @Component}, la clase
 * no va aqui: va en {@code adapters.outbound.persistence}.</p>
 *
 * <p>Un {@code record} suele bastar para un value object. Para una entidad con
 * identidad y estado mutable, una clase normal.</p>
 */
public record Ejemplo(Long id, String nombre) {
}
