import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AyAlert, AyButton, AyError403, AyTabs } from '@aybarcorp/ui-angular';
import type { AyTabsElemento } from '@aybarcorp/ui-angular';
import { EstadoGaleria } from '../estado';
import { RAIZ_GALERIA, SUBSECCIONES_ADMIN } from '../navegacion';
import { usarMedia } from '../utiles';
import { AdminAuditoria } from './auditoria';
import { EstadoAdmin } from './estado';
import { AdminResumen } from './resumen';
import { AdminRoles } from './roles';
import { AdminUsuarios } from './usuarios';

/**
 * /demo/admin/:seccion: solo con el rol ADMIN entre los roles efectivos (los reales, o los
 * de «Ver como»). Sin él, el 403 del framework dice qué rol hace falta, y si la sesión sí
 * lo tiene, cómo volver a verlo. Resumen, Usuarios, Roles y Auditoría son pestañas con URL.
 */
@Component({
  selector: 'gl-admin',
  imports: [AdminAuditoria, AdminResumen, AdminRoles, AdminUsuarios, AyAlert, AyButton, AyError403, AyTabs],
  providers: [EstadoAdmin],
  template: `
    @if (estado.esAdmin()) {
      <div class="gl-pagina">
        <header class="gl-cabecera">
          <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Solo ADMIN</p>
          <h1 class="gl-titulo">Administración</h1>
          <p class="gl-texto">Personas, roles y la auditoría, con datos sintéticos. Lo que cambies vive en memoria.</p>
        </header>
        <ay-tabs etiqueta="Secciones de la administración" [variante]="ancho() ? 'underline' : 'pill'" [items]="pestanas" [valor]="seccion()" (valorChange)="ir($event)">
          <h2 class="ay-visually-hidden">{{ tituloSeccion() }}</h2>
          @switch (seccion()) {
            @case ('resumen') {
              <gl-admin-resumen />
            }
            @case ('usuarios') {
              <gl-admin-usuarios />
            }
            @case ('roles') {
              <gl-admin-roles />
            }
            @case ('auditoria') {
              <gl-admin-auditoria />
            }
          }
        </ay-tabs>
      </div>
    } @else {
      <div class="gl-pagina gl-pagina--centrada gl-prohibido">
        <ay-error-403 scope="region" rolNecesario="ADMIN" nombreRecurso="la administración de la galería" [hrefVolver]="raiz" />
        @if (estado.adminReal()) {
          <ay-alert tono="info" titulo="Estás viendo la galería como Usuario" anuncio="off">
            Tu sesión tiene ADMIN, pero «Ver como» lo oculta para que veas lo que vería alguien sin él.
            <ay-button ayAcciones variante="secondary" tamano="sm" (click)="estado.establecerVerComo('admin')">Ver como Administración</ay-button>
          </ay-alert>
        }
      </div>
    }
  `,
})
export class PantallaAdmin {
  protected readonly estado = inject(EstadoGaleria);
  private readonly router = inject(Router);
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

  protected readonly raiz = RAIZ_GALERIA;
  protected readonly ancho = usarMedia('(min-width: 640px)');
  protected readonly seccion = computed(() => this.parametros().get('seccion') ?? 'resumen');
  protected readonly pestanas: AyTabsElemento[] = SUBSECCIONES_ADMIN.map((s) => ({ value: s.id, label: s.titulo }));
  /** El h2 de la pestaña, para el lector: lo que sigue (tarjetas, Empty State, Timeline) cuelga de él. */
  protected readonly tituloSeccion = computed(() => SUBSECCIONES_ADMIN.find((s) => s.id === this.seccion())?.titulo ?? '');

  protected ir(seccion: string): void {
    if (seccion !== this.seccion()) void this.router.navigate([RAIZ_GALERIA, 'admin', seccion]);
  }
}
