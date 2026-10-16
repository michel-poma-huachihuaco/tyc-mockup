import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AyAvatar, AyBadge, AyTabs } from '@aybarcorp/ui-angular';
import type { AyTabsElemento } from '@aybarcorp/ui-angular';
import { nombreVisible, rolesVisibles } from '../../sesion';
import { EstadoGaleria } from '../estado';
import { RAIZ_GALERIA, SUBSECCIONES_CUENTA } from '../navegacion';
import { usarMedia } from '../utiles';
import { CuentaNotificaciones } from './notificaciones';
import { CuentaPerfil } from './perfil';
import { CuentaPreferencias } from './preferencias';
import { CuentaSeguridad } from './seguridad';
import { CuentaSesiones } from './sesiones';

/**
 * /demo/cuenta/:seccion: el panel del usuario. Las cinco secciones son pestañas de
 * ay-tabs —verticales en escritorio, como una navegación secundaria, y subrayadas en el
 * celular— y la URL manda: cambiar de pestaña navega, y entrar por una URL abre la suya.
 * Todo es en memoria: guardar avisa con un Toast y nada sale del navegador.
 */
@Component({
  selector: 'gl-cuenta',
  imports: [AyAvatar, AyBadge, AyTabs, CuentaNotificaciones, CuentaPerfil, CuentaPreferencias, CuentaSeguridad, CuentaSesiones],
  template: `
    <div class="gl-pagina">
      <header class="gl-cuenta__cabecera">
        <ay-avatar [nombre]="nombre()" size="xl" estado="online" />
        <div class="gl-cabecera">
          <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Tu cuenta</p>
          <h1 class="gl-titulo">{{ nombre() }}</h1>
          <p class="gl-cuenta__roles">
            @for (rol of estado.roles(); track rol) {
              <ay-badge size="sm" [tono]="rol === 'ADMIN' ? 'info' : 'neutral'">{{ rol }}</ay-badge>
            }
            <span class="gl-cuenta__nota">{{ usuario() }}&#64;ejemplo.test · sesión de la galería</span>
          </p>
        </div>
      </header>

      <div class="gl-cuenta" [class.gl-cuenta--vertical]="ancho()">
        <ay-tabs etiqueta="Secciones de la cuenta" [variante]="ancho() ? 'vertical' : 'underline'" [items]="pestanas" [valor]="seccion()" (valorChange)="ir($event)">
          @switch (seccion()) {
            @case ('perfil') {
              <gl-cuenta-perfil />
            }
            @case ('preferencias') {
              <gl-cuenta-preferencias />
            }
            @case ('notificaciones') {
              <gl-cuenta-notificaciones />
            }
            @case ('seguridad') {
              <gl-cuenta-seguridad />
            }
            @case ('sesiones') {
              <gl-cuenta-sesiones />
            }
          }
        </ay-tabs>
      </div>
    </div>
  `,
})
export class PantallaCuenta {
  protected readonly estado = inject(EstadoGaleria);
  private readonly router = inject(Router);
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

  protected readonly ancho = usarMedia('(min-width: 1024px)');
  protected readonly seccion = computed(() => this.parametros().get('seccion') ?? 'perfil');
  protected readonly pestanas: AyTabsElemento[] = SUBSECCIONES_CUENTA.map((s) => ({ value: s.id, label: s.titulo }));
  protected readonly nombre = computed(() => {
    const sesion = this.estado.sesion();
    return sesion ? nombreVisible(sesion) : '';
  });
  protected readonly usuario = computed(() => this.estado.sesion()?.usuarioId ?? 'usuario');
  protected readonly roles = computed(() => {
    const sesion = this.estado.sesion();
    return sesion ? rolesVisibles(sesion) : '';
  });

  protected ir(seccion: string): void {
    if (seccion !== this.seccion()) void this.router.navigate([RAIZ_GALERIA, 'cuenta', seccion]);
  }
}
