import { Component, computed, inject, signal } from '@angular/core';
import { AyAlert, AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyToastService, AyTreeView } from '@aybarcorp/ui-angular';
import type { AyTreeNode } from '@aybarcorp/ui-angular';
import { MODULOS } from '../datos';
import { contar } from '../formato';
import { EstadoAdmin } from './estado';

/** Los módulos como árbol: el módulo es la rama y cada permiso una hoja. */
const NODOS: AyTreeNode[] = MODULOS.map((m) => ({
  id: `modulo:${m.id}`,
  etiqueta: m.nombre,
  meta: contar(m.permisos.length, 'permiso', 'permisos'),
  hijos: m.permisos.map((p) => ({ id: p.id, etiqueta: p.nombre, meta: p.id })),
}));
const PERMISOS = new Set(MODULOS.flatMap((m) => m.permisos.map((p) => p.id)));

/**
 * Roles: la lista de roles a la izquierda y, del elegido, sus permisos en un ay-tree-view
 * con casillas (`modo="multi"`): marcar un módulo marca todos sus permisos y uno a medias
 * queda indeterminado. Los cambios son un borrador hasta «Guardar»; «Descartar» vuelve a lo
 * guardado. ADMIN tiene todo y no se edita.
 */
@Component({
  selector: 'gl-admin-roles',
  imports: [AyAlert, AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyTreeView],
  template: `
    <div class="gl-roles">
      <nav class="gl-roles__lista" aria-label="Roles">
        <ul>
          @for (rol of admin.roles(); track rol.id) {
            <li>
              <button type="button" class="gl-roles__rol" [attr.aria-current]="rol.id === elegido() ? 'true' : null" (click)="elegir(rol.id)">
                <span class="gl-roles__nombre">{{ rol.nombre }} <code>{{ rol.id }}</code></span>
                <span class="gl-roles__meta">{{ personasCon(rol.id) }} · {{ contar(rol.permisos.length, 'permiso', 'permisos') }}</span>
              </button>
            </li>
          }
        </ul>
      </nav>

      @if (rol(); as r) {
        <ay-card>
          <ay-card-header [titulo]="r.nombre" nivel="h2" [subtitulo]="r.descripcion">
            <span ayAcciones>
              @if (cambiado()) {
                <ay-badge tono="warning" size="sm">Sin guardar</ay-badge>
              }
            </span>
          </ay-card-header>
          <ay-card-body>
            @if (r.id === 'ADMIN') {
              <ay-alert tono="info" anuncio="off">Administración concede todos los permisos y no se edita: así nadie se queda sin poder administrar.</ay-alert>
            }
            <ay-tree-view
              [etiqueta]="'Permisos de ' + r.nombre"
              [modo]="r.id === 'ADMIN' ? 'read-only' : 'multi'"
              [nodos]="nodos"
              [abiertas]="abiertas()"
              [elegidas]="borrador()"
              conRecuento
              (abiertasChange)="abiertas.set($event)"
              (elegidasChange)="cambiar($event)"
            />
            <div class="gl-form__pie">
              <ay-button variante="ghost" [disabled]="!cambiado()" (click)="descartar()">Descartar</ay-button>
              <ay-button [disabled]="!cambiado()" (click)="guardar()">Guardar los permisos</ay-button>
            </div>
          </ay-card-body>
        </ay-card>
      }
    </div>
  `,
})
export class AdminRoles {
  protected readonly admin = inject(EstadoAdmin);
  private readonly toast = inject(AyToastService);

  protected readonly contar = contar;
  protected readonly nodos = NODOS;
  protected readonly elegido = signal('VENTAS');
  protected readonly abiertas = signal<readonly string[]>(NODOS.map((n) => n.id));
  protected readonly rol = computed(() => this.admin.roles().find((r) => r.id === this.elegido()));
  protected readonly borrador = signal<readonly string[]>(this.rol()?.permisos ?? []);
  protected readonly cambiado = computed(() => {
    const guardados = new Set(this.rol()?.permisos ?? []);
    const borrador = this.borrador();
    return borrador.length !== guardados.size || borrador.some((p) => !guardados.has(p));
  });

  protected personasCon(rol: string): string {
    return contar(this.admin.personas().filter((p) => p.roles.includes(rol)).length, 'persona', 'personas');
  }

  protected elegir(id: string): void {
    if (this.cambiado()) this.toast.mostrar({ mensaje: 'Se descartaron los cambios sin guardar del rol anterior.', tono: 'warning' });
    this.elegido.set(id);
    this.borrador.set(this.rol()?.permisos ?? []);
  }

  /** Solo cuentan las hojas: los ids de módulo los marca el árbol, pero no son permisos. */
  protected cambiar(elegidas: readonly string[]): void {
    this.borrador.set(elegidas.filter((id) => PERMISOS.has(id)));
  }

  protected descartar(): void {
    this.borrador.set(this.rol()?.permisos ?? []);
  }

  protected guardar(): void {
    const id = this.elegido();
    const permisos = [...this.borrador()];
    this.admin.roles.update((roles) => roles.map((r) => (r.id === id ? { ...r, permisos } : r)));
    this.toast.mostrar({ mensaje: `Permisos de ${this.rol()?.nombre} guardados (en memoria).`, tono: 'success' });
  }
}
