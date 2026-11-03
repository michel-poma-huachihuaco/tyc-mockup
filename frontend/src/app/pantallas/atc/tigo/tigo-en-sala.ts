import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { AyAvatar, AyBadge, AyButton } from '@aybarcorp/ui-angular';
import { TigoEstadoService } from './tigo-estado';
import { narrarPaso } from './tigo-guion';
import { ETAPAS_TIGO } from './tigo-modelo';

/**
 * «Tigo en la sala»: HUD de Operación en Vivo mientras hay un escenario de Tigo en curso. Muestra el ticket, la
 * etapa, la frase narrada y lo que espera aprobación; la decisión se toma en «Tigo · Atención asistida».
 * PROTOTIPO simulado, propuesta fuera de la Etapa 1. Solo lee `TigoEstadoService`; sin escenario no pinta nada.
 */
@Component({
  selector: 'app-tigo-en-sala',
  standalone: true,
  imports: [AyAvatar, AyBadge, AyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tigo.guionTicket(); as num) {
      <section class="ts" [class.ts--espera]="pendientes().length > 0" aria-label="Tigo en la sala">
        <header class="ts-cab">
          <ay-avatar nombre="Tigo" size="sm" decorativo />
          <strong>Tigo en la sala</strong>
          <ay-badge size="sm" tono="neutral">Ticket {{ num }}</ay-badge>
          @if (etapa(); as e) {
            <ay-badge size="sm" tono="info">Etapa: {{ e }}</ay-badge>
          }
          <ay-badge size="sm" tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
          <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge>
        </header>
        <p class="ts-frase" aria-live="polite">{{ frase() }}</p>
        @if (pendientes().length) {
          <div class="ts-pend">
            <strong class="ts-pend-tit">Esperan tu aprobación ({{ pendientes().length }})</strong>
            <ul>
              @for (p of pendientes(); track p.id) {
                <li>{{ p.titulo }}</li>
              }
            </ul>
          </div>
        }
        <div>
          <ay-button tamano="sm" variante="secondary" (click)="irATigo.emit()">Ir a Tigo · Atención asistida</ay-button>
        </div>
      </section>
    }
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .ts { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .ts--espera { border-color: var(--aybar-color-feedback-warning-border); background: var(--aybar-color-feedback-warning-bg); }
    .ts-cab { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .ts-frase { margin: 0; font-size: var(--aybar-font-size-md); font-weight: var(--aybar-font-weight-semibold); overflow-wrap: anywhere; }
    .ts-pend { display: flex; flex-direction: column; gap: var(--aybar-space-1); font-size: var(--aybar-font-size-sm); }
    .ts-pend ul { margin: 0; padding-inline-start: var(--aybar-space-5); }
  `,
})
export class TigoEnSala {
  protected readonly tigo = inject(TigoEstadoService);
  readonly irATigo = output<void>();

  protected readonly pendientes = this.tigo.pendientes;
  protected readonly etapa = computed(() => ETAPAS_TIGO.find((e) => e.id === this.tigo.guionPaso().etapa)?.nombre ?? '');
  protected readonly frase = computed(() => narrarPaso(this.tigo.pendientes()[0] ?? this.tigo.propuestas().at(-1)));
}
