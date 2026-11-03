import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AyBadge, AyButton, AyFormField, AyTextarea } from '@aybarcorp/ui-angular';
import { TigoEstadoService } from './tigo-estado';
import type { EstadoPropuesta, PropuestaTigo } from './tigo-modelo';

type Tono = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const ESTADO: Record<EstadoPropuesta, { texto: string; tono: Tono }> = {
  ejecutada: { texto: 'Tigo lo hizo', tono: 'info' },
  pendiente: { texto: 'Espera tu aprobación', tono: 'warning' },
  aprobada: { texto: 'Aprobada', tono: 'success' },
  editada: { texto: 'Editada por ti', tono: 'success' },
  descartada: { texto: 'Descartada', tono: 'neutral' },
  bloqueada: { texto: 'Bloqueada por guardarraíl', tono: 'danger' },
};

/**
 * Una acción de Tigo: qué hizo o qué propone. Si espera al gestor, aquí se aprueba, se edita o se descarta.
 * PROTOTIPO simulado, propuesta fuera de la Etapa 1. La UI solo llama a `TigoEstadoService`.
 */
@Component({
  selector: 'app-tarjeta-propuesta-tigo',
  standalone: true,
  imports: [AyBadge, AyButton, AyFormField, AyTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = propuesta();
    <article class="tp" [class.tp--grande]="grande()" [class.tp--pendiente]="p.estado === 'pendiente'">
      <header class="tp-cab">
        <h4 class="tp-titulo">{{ p.titulo }}</h4>
        <span class="tp-chips">
          <ay-badge size="sm" [tono]="estado().tono">{{ estado().texto }}</ay-badge>
          @if (p.simulada) {
            <ay-badge size="sm" tono="neutral">Simulado</ay-badge>
          }
        </span>
      </header>
      <p class="tp-detalle">{{ p.detalle }}</p>
      @if (p.lineas?.length) {
        <ul class="tp-lineas">
          @for (l of p.lineas; track $index) {
            <li>{{ l }}</li>
          }
        </ul>
      }

      @if (p.estado === 'pendiente') {
        @if (p.texto !== undefined && p.accion === 'resolver') {
          <div class="tp-envio">
            <span class="tp-envio-rotulo">Respuesta que se enviará al cliente</span>
            <p class="tp-envio-texto">{{ p.texto }}</p>
          </div>
        } @else if (p.texto !== undefined) {
          <ay-form-field etiqueta="Borrador de Tigo (puedes editarlo)">
            <ay-textarea
              [nombre]="'borrador-' + p.id"
              [filas]="4"
              autoajuste
              [filasMax]="12"
              [valor]="texto()"
              (valorChange)="editado.set($event)"
            />
          </ay-form-field>
        }
        <p class="tp-apoyo">Tigo prepara; tú decides. Nada se envía al cliente ni se cierra sin tu aprobación.</p>
        <div class="tp-acciones">
          @if (p.texto !== undefined && p.accion !== 'resolver') {
            <ay-button tamano="sm" variante="primary" (click)="aprobar()">
              {{ cambio() ? 'Usar mi versión editada' : 'Aprobar y continuar' }}
            </ay-button>
          } @else {
            <ay-button tamano="sm" variante="primary" (click)="aprobar()">
              {{ p.accion === 'resolver' ? 'Aprobar y resolver' : 'Aprobar y ejecutar' }}
            </ay-button>
          }
          <ay-button tamano="sm" variante="ghost" (click)="tigo.descartar(p.id)">Descartar</ay-button>
        </div>
      }
    </article>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .tp { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface); }
    .tp--pendiente { border-color: var(--aybar-color-feedback-warning-border); background: var(--aybar-color-feedback-warning-bg); }
    .tp--grande { padding: var(--aybar-space-5); gap: var(--aybar-space-3); }
    .tp--grande .tp-titulo { font-size: var(--aybar-font-size-lg); }
    .tp--grande .tp-detalle, .tp--grande .tp-lineas, .tp--grande .tp-apoyo { font-size: var(--aybar-font-size-sm); }
    .tp--grande .tp-envio-texto { font-size: var(--aybar-font-size-md); }
    .tp-cab { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: var(--aybar-space-2); }
    .tp-titulo { margin: 0; font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); min-width: 0; overflow-wrap: anywhere; }
    .tp-chips { display: inline-flex; flex-wrap: wrap; gap: var(--aybar-space-1); }
    .tp-detalle { margin: 0; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .tp-lineas { margin: 0; padding-inline-start: var(--aybar-space-4); font-size: var(--aybar-font-size-xs); display: flex; flex-direction: column; gap: var(--aybar-space-1); overflow-wrap: anywhere; }
    .tp-envio { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-2); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-sm); background: var(--aybar-color-bg-surface); }
    .tp-envio-rotulo { font-size: var(--aybar-font-size-xs); font-weight: var(--aybar-font-weight-semibold); color: var(--aybar-color-fg-muted); }
    .tp-envio-texto { margin: 0; font-size: var(--aybar-font-size-sm); white-space: pre-wrap; overflow-wrap: anywhere; }
    .tp-apoyo { margin: 0; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .tp-acciones { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
  `,
})
export class TarjetaPropuestaTigo {
  readonly propuesta = input.required<PropuestaTigo>();
  /** Variante para proyectar (modo presentación). */
  readonly grande = input(false);
  protected readonly tigo = inject(TigoEstadoService);
  protected readonly editado = signal<string | null>(null);

  protected readonly estado = computed(() => ESTADO[this.propuesta().estado]);
  protected readonly texto = computed(() => this.editado() ?? this.propuesta().texto ?? '');
  protected readonly cambio = computed(() => this.texto().trim() !== (this.propuesta().texto ?? '').trim());

  protected aprobar(): void {
    const p = this.propuesta();
    this.tigo.aprobar(p.id, p.texto !== undefined ? this.texto() : undefined);
  }
}
