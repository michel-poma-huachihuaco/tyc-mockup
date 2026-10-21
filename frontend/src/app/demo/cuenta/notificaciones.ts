import { Component, computed, inject, signal } from '@angular/core';
import { AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyCelda, AyNotification, AySwitch, AyTable, AyToastService } from '@aybarcorp/ui-angular';
import type { AyColumna } from '@aybarcorp/ui-angular';
import { AVISOS, PREFERENCIAS_NOTIFICACION } from '../datos';
import type { CanalNotificacion, PreferenciaNotificacion } from '../datos';

const CANALES: readonly { readonly id: CanalNotificacion; readonly nombre: string }[] = [
  { id: 'correo', nombre: 'Correo' },
  { id: 'app', nombre: 'App' },
  { id: 'sms', nombre: 'SMS' },
];

interface Fila {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly correo: boolean;
  readonly app: boolean;
  readonly sms: boolean;
}

/**
 * Notificaciones: una tabla de Switch por aviso y canal (correo, app, SMS) y, debajo, los
 * avisos recientes como ay-notification. Los de seguridad no se pueden apagar todos: el
 * último canal encendido queda deshabilitado y lo dice. Marcar como leído es en memoria.
 */
@Component({
  selector: 'gl-cuenta-notificaciones',
  imports: [AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyCelda, AyNotification, AySwitch, AyTable],
  template: `
    <div class="gl-seccion">
      <ay-card>
        <ay-card-header titulo="Qué te avisamos" nivel="h2" subtitulo="Cada aviso, por el canal que prefieras." />
        <ay-card-body>
          <div class="gl-tabla-avisos">
            <ay-table leyenda="Avisos por canal" [columnas]="columnas" [filas]="filas()">
              <ng-template ayCelda="titulo" let-registro>
                @let fila = comoFila(registro);
                <span class="gl-tabla-avisos__titulo">{{ fila.titulo }}</span>
                <span class="gl-tabla-avisos__descripcion">{{ fila.descripcion }}</span>
              </ng-template>
              @for (canal of canales; track canal.id) {
                <ng-template [ayCelda]="canal.id" let-registro>
                  @let fila = comoFila(registro);
                  <ay-switch
                    [etiqueta]="fila.titulo + ' por ' + canal.nombre.toLowerCase()"
                    [activo]="fila[canal.id]"
                    [disabled]="bloqueado(fila, canal.id)"
                    (activoChange)="cambiar(fila.id, canal.id, $event)"
                  />
                </ng-template>
              }
            </ay-table>
          </div>
          <p class="gl-nota">Los avisos de seguridad necesitan al menos un canal: el último encendido no se puede apagar.</p>
        </ay-card-body>
      </ay-card>

      <ay-card>
        <ay-card-header titulo="Avisos recientes" nivel="h2" [subtitulo]="sinLeer() ? sinLeer() + ' sin leer' : 'Todo leído'">
          <ay-button ayAcciones variante="ghost" tamano="sm" [disabled]="sinLeer() === 0" (click)="marcarTodos()">Marcar todo como leído</ay-button>
        </ay-card-header>
        <ay-card-body>
          <ul class="ay-notifications gl-avisos">
            @for (aviso of avisos(); track aviso.id) {
              <li
                ayNotification
                [titulo]="aviso.titulo"
                [descripcion]="aviso.descripcion"
                [fecha]="aviso.fecha"
                [leida]="aviso.leido"
                (leidaChange)="marcar(aviso.id, $event)"
                (quitar)="quitar(aviso.id)"
              ></li>
            } @empty {
              <li class="gl-avisos__vacio">No hay avisos. <ay-badge size="sm" tono="success">Al día</ay-badge></li>
            }
          </ul>
        </ay-card-body>
      </ay-card>
    </div>
  `,
})
export class CuentaNotificaciones {
  private readonly toast = inject(AyToastService);

  protected readonly canales = CANALES;
  protected readonly columnas: AyColumna[] = [
    { clave: 'titulo', cabecera: 'Aviso' },
    ...CANALES.map((c) => ({ clave: c.id, cabecera: c.nombre, ancho: '5rem' })),
  ];
  private readonly preferencias = signal<PreferenciaNotificacion[]>(PREFERENCIAS_NOTIFICACION.map((p) => ({ ...p, canales: { ...p.canales } })));
  protected readonly filas = computed<Fila[]>(() =>
    this.preferencias().map((p) => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, ...p.canales })),
  );
  protected readonly avisos = signal(AVISOS.map((a) => ({ ...a })));
  protected readonly sinLeer = computed(() => this.avisos().filter((a) => !a.leido).length);

  /** La fila de la tabla con su tipo: `let-registro` llega como un registro sin tipar. */
  protected comoFila(registro: unknown): Fila {
    return registro as Fila;
  }

  /** Seguridad no se queda sin canal: el último encendido no se apaga. */
  protected bloqueado(fila: Fila, canal: CanalNotificacion): boolean {
    if (fila.id !== 'seguridad' || !fila[canal]) return false;
    return CANALES.filter((c) => fila[c.id]).length === 1;
  }

  protected cambiar(id: string, canal: CanalNotificacion, activo: boolean): void {
    this.preferencias.update((lista) => lista.map((p) => (p.id === id ? { ...p, canales: { ...p.canales, [canal]: activo } } : p)));
    this.toast.mostrar({ mensaje: `${activo ? 'Activado' : 'Desactivado'}: ${this.titulo(id)} por ${canal === 'app' ? 'la app' : canal}.`, tono: 'info', duracion: 2500 });
  }

  protected marcar(id: string, leido: boolean): void {
    this.avisos.update((lista) => lista.map((a) => (a.id === id ? { ...a, leido } : a)));
  }

  protected marcarTodos(): void {
    this.avisos.update((lista) => lista.map((a) => ({ ...a, leido: true })));
  }

  protected quitar(id: string): void {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private titulo(id: string): string {
    return this.preferencias().find((p) => p.id === id)?.titulo ?? id;
  }
}
