
package com.aybarsac.atc.adapters.inbound.rest;

import com.aybarsac.sdk.security.AybarUserContext;
import com.aybarsac.sdk.security.AybarUserContextHolder;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller de ejemplo que muestra como se protege un endpoint con el JWT del emisor OIDC
 * y como se lee el {@link AybarUserContext} corporativo desde el hilo de la peticion.
 *
 * <p><strong>Por que funciona sin tocar nada:</strong> {@code aybar-starter-security}
 * registra el bean {@code AybarUserContextHolder} y activa {@code @EnableMethodSecurity},
 * asi que {@code @PreAuthorize} aplica sin declararlo en cada servicio. El contexto
 * corporativo se publica en el MDC por {@code FiltroMdcUsuario}, asi que un evento de
 * auditoria emitido en este mismo hilo ya lleva el {@code usuario}, {@code companyId}
 * y {@code correlationId} enriquesidos por el SDK, sin que el codigo de negocio haga nada.</p>
 *
 * <p><strong>Quitar cuando entre la primera HU real.</strong> Este controller existe
 * solo para que el esqueleto generado ya demuestre la forma del patron; no es parte
 * del API del servicio.</p>
 */
@RestController
@RequestMapping("/recursos-ejemplo")
public class RecursosEjemploController {

    /**
     * Devuelve el contexto corporativo del usuario autenticado.
     *
     * <p>La regla {@code hasRole('USER')} es solo ilustrativa: tu servicio usara
     * las reglas del negocio (p. ej. {@code hasRole('ADMIN')},
     * {@code @PreAuthorize("@autorizacion.puedeLeer(principal, #id)")}, etc.).</p>
     */
    @GetMapping("/quien-soy")
    @PreAuthorize("hasRole('USER')")
    public AybarUserContext quienSoy() {
        return AybarUserContextHolder.actual()
                .orElseThrow(() -> new IllegalStateException(
                        "No hay contexto de usuario; el endpoint requiere JWT valido"));
    }
}
