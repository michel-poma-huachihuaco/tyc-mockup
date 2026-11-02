import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AyAvatar, AyBadge } from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { TarjetaPropuestaTigo } from './tarjeta-propuesta-tigo';
import { TigoEstadoService } from './tigo-estado';
import { sinCierre } from './tigo-guion';
import { ETAPAS_TIGO, type EtapaTigo, type PropuestaTigo } from './tigo-modelo';

type EstadoEtapa = 'completa' | 'curso' | 'espera' | 'escalada' | 'sin-iniciar' | 'no-aplica';

const TEXTO_ESTADO: Record<EstadoEtapa, string> = {
  completa: 'Completa',
  curso: 'En curso',
  espera: 'Espera tu aprobación',
  escalada: 'Tigo se detuvo: lo atiende una persona',
  'sin-iniciar': 'No iniciada',
  'no-aplica': 'No aplica: Tigo no cierra',
};

interface EtapaVista {
  id: EtapaTigo;
  nombre: string;
  numero: number;
  estado: EstadoEtapa;
  texto: string;
  acciones: PropuestaTigo[];
}

/**
 * Cinta de Tigo en el detalle del ticket: las 5 etapas con su estado y lo que Tigo hizo en cada una.
 * Lo que espera aprobación se resuelve aquí mismo, sin salir del ticket. PROTOTIPO simulado,
 * propuesta fuera de la Etapa 1. Solo lee `TigoEstadoService`.
 */
@Component({
  selector: 'app-cinta-tigo',
  standalone: true,
  imports: [AyAvatar, AyBadge, TarjetaPropuestaTigo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <section class="ct" [class.ct--grande]="grande()" aria-label="Atención asistida por Tigo">
        @if (!grande()) {
        <header class="ct-cab">
          <ay-avatar nombre="Tigo" size="sm" decorativo />
          <div class="ct-quien">
            <strong>Tigo · Atención asistida</strong>
            <span>Prepara y ejecuta con tu aprobación</span>
          </div>
          <ay-badge size="sm" tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
        </header>
        }

        <ol class="ct-etapas">
          @for (e of etapas(); track e.id) {
            <li class="ct-etapa ct-etapa--{{ e.estado }}">
              <div class="ct-etapa-cab">
                <span class="ct-num" aria-hidden="true">{{ e.numero }}</span>
                <div class="ct-etapa-tit">
                  <strong>{{ e.nombre }}</strong>
                  <span class="ct-estado">{{ e.texto }}</span>
                </div>
              </div>
              @if (e.acciones.length && !grande()) {
                <ul class="ct-acciones" [attr.aria-label]="'Acciones de Tigo en ' + e.nombre">
                  @for (a of e.acciones; track a.id) {
                    <li>{{ a.titulo }}</li>
                  }
                </ul>
              }
            </li>
          }
        </ol>

        @if (pendientes().length && !grande()) {
          <div class="ct-pend">
            <h3 class="ct-pend-tit">Esperan tu aprobación ({{ pendientes().length }})</h3>
            @for (p of pendientes(); track p.id) {
              <app-tarjeta-propuesta-tigo [propuesta]="p" />
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .ct { display: flex; flex-direction: column; gap: var(--aybar-space-3); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .ct-cab { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-3); }
    .ct-quien { display: flex; flex-direction: column; min-width: 0; font-size: var(--aybar-font-size-sm); flex: 1 1 12rem; }
    .ct-quien span { color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-xs); }
    .ct-etapas { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--aybar-space-2); }
    @media (min-width: 64rem) { .ct-etapas { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
    .ct-etapa { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-2) var(--aybar-space-3); border-radius: var(--aybar-radius-md); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-block-start-width: var(--aybar-space-1); min-width: 0; }
    .ct-etapa--completa { border-block-start-color: var(--aybar-color-feedback-success-border); }
    .ct-etapa--curso { border-block-start-color: var(--aybar-color-primary-500); }
    .ct-etapa--espera { border-block-start-color: var(--aybar-color-feedback-warning-border); background: var(--aybar-color-feedback-warning-bg); }
    .ct-etapa--no-aplica { border-style: dashed; background: var(--aybar-color-bg-surface-sunken); }
    .ct-etapa--escalada { border-block-start-color: var(--aybar-color-feedback-danger-border); }
    .ct-etapa-cab { display: flex; align-items: center; gap: var(--aybar-space-2); }
    .ct-num { flex: none; display: inline-grid; place-items: center; inline-size: var(--aybar-space-6); block-size: var(--aybar-space-6); border-radius: var(--aybar-radius-full); background: var(--aybar-color-bg-surface-sunken); font-size: var(--aybar-font-size-xs); font-weight: var(--aybar-font-weight-semibold); }
    .ct-etapa-tit { display: flex; flex-direction: column; min-width: 0; font-size: var(--aybar-font-size-sm); }
    .ct-estado { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ct-acciones { margin: 0; padding-inline-start: var(--aybar-space-4); display: flex; flex-direction: column; gap: var(--aybar-space-1); font-size: var(--aybar-font-size-xs); overflow-wrap: anywhere; }
    .ct--grande { padding: var(--aybar-space-4); }
    .ct--grande .ct-etapa { padding: var(--aybar-space-4); border-block-start-width: var(--aybar-space-2); }
    .ct--grande .ct-etapa-tit { font-size: var(--aybar-font-size-lg); }
    .ct--grande .ct-estado { font-size: var(--aybar-font-size-sm); }
    .ct--grande .ct-num { inline-size: var(--aybar-space-8); block-size: var(--aybar-space-8); font-size: var(--aybar-font-size-md); }
    @media (min-width: 64rem) { .ct--grande .ct-etapa-cab { flex-direction: column; align-items: flex-start; } }
    .ct-pend { display: flex; flex-direction: column; gap: var(--aybar-space-2); }
    .ct-pend-tit { margin: 0; font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); }
  `,
})
export class CintaTigo {
  /** Ticket del detalle; sin él, `numero` (modo presentación, que no tiene el ticket a mano). */
  readonly ticket = input<TicketAtc | null>(null);
  readonly numero = input<string | null>(null);
  /** Variante para proyectar: etapas grandes, sin lista de acciones ni tarjetas de aprobación. */
  readonly grande = input(false);
  private readonly tigo = inject(TigoEstadoService);
  private readonly num = computed(() => this.ticket()?.num ?? this.numero() ?? '');

  protected readonly propuestas = computed(() => this.tigo.propuestasDe(this.num()));
  protected readonly visible = computed(() => this.propuestas().length > 0);
  protected readonly pendientes = computed(() => this.propuestas().filter((p) => p.estado === 'pendiente'));

  protected readonly etapas = computed<EtapaVista[]>(() => {
    const props = this.propuestas();
    const por = ETAPAS_TIGO.map((e) => props.filter((p) => p.etapa === e.id));
    const ultima = por.reduce((u, l, i) => (l.length ? i : u), -1);
    const vivo =
      this.tigo.guionTicket() === this.num() &&
      (this.tigo.guionEstado() === 'corriendo' || this.tigo.guionEstado() === 'pausado');
    const sinCierreTigo = sinCierre(props);
    return ETAPAS_TIGO.map((e, i) => {
      const acciones = por[i];
      const estado: EstadoEtapa = !acciones.length
        ? sinCierreTigo && (e.id === 'cierre' || e.id === 'postcierre')
          ? 'no-aplica'
          : 'sin-iniciar'
        : acciones.some((a) => a.estado === 'pendiente')
          ? 'espera'
          : acciones.some((a) => a.estado === 'bloqueada')
            ? 'escalada'
            : i === ultima && vivo
              ? 'curso'
              : 'completa';
      return { id: e.id, nombre: e.nombre, numero: i + 1, estado, texto: TEXTO_ESTADO[estado], acciones };
    });
  });
}
