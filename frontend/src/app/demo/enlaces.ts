import { DOCUMENT, Directive, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Navega con el Router los enlaces internos que pintan los componentes del framework con
 * `href` —Sidebar, Breadcrumb, una Card interactiva, el «No recuerdo la contraseña» del
 * Login Form, las sugerencias del 404—, en lugar de recargar la página. Un clic con
 * modificador, el botón central, `target` o `download` siguen siendo del navegador, y los
 * `routerLink` ya lo resolvieron (llegan con `defaultPrevented`).
 *
 * Un enlace que solo cambia el fragmento de la misma página (`#seccion`) tampoco se toca:
 * el navegador se desplaza solo.
 */
@Directive({
  selector: '[glEnlacesInternos]',
  host: { '(click)': 'alPulsar($event)' },
})
export class EnlacesInternos {
  private readonly router = inject(Router);
  private readonly ventana = inject(DOCUMENT).defaultView;

  protected alPulsar(evento: MouseEvent): void {
    if (evento.defaultPrevented || evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target instanceof Element ? evento.target.closest('a[href]') : null;
    if (!(enlace instanceof HTMLAnchorElement) || !this.ventana) return;
    if ((enlace.target && enlace.target !== '_self') || enlace.hasAttribute('download')) return;
    const destino = new URL(enlace.href, this.ventana.location.href);
    const aqui = this.ventana.location;
    if (destino.origin !== aqui.origin) return;
    if (destino.hash && destino.pathname === aqui.pathname && destino.search === aqui.search) return;
    evento.preventDefault();
    void this.router.navigateByUrl(destino.pathname + destino.search + destino.hash);
  }
}
