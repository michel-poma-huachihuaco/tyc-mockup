package com.aybarsac.atc.domain.port.out;

import java.util.Optional;

import com.aybarsac.atc.domain.model.Ejemplo;

/**
 * AQUI VAN los puertos de salida (driven): lo que el dominio NECESITA del mundo
 * exterior, expresado en el lenguaje del dominio. Repositorios, publicadores de
 * eventos, clientes de terceros, relojes.
 *
 * <p>Son interfaces y viven en {@code domain} a proposito: el dominio define el
 * contrato y {@code adapters.outbound} lo implementa. Esa inversion es lo que
 * permite cambiar Postgres por otra cosa sin tocar una linea de negocio.</p>
 *
 * <p>Con aybar-starter-data hay dos puertos por agregado, no uno:
 * <strong>escritura contra PostgreSQL</strong> y <strong>lectura contra
 * MongoDB</strong>. El SDK aporta las interfaces base
 * {@code AybarWriteRepository} y {@code AybarReadRepository} para extenderlas.</p>
 */
public interface EjemploRepositorio {

    Ejemplo guardar(Ejemplo ejemplo);

    Optional<Ejemplo> buscarPorId(Long id);
}
