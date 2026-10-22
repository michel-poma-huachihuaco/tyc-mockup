import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AHORA_BASE, crearTicketsDemo, type TicketAtc } from './datos-atc';
import { nombreArea } from './etiquetas-es';
import { calcularIndicadores, textoHace, type IndicadoresMonitor } from './indicadores-monitor';

// ponytail: frecuencia de refresco y umbral de "desactualizado" PENDIENTES de decisión (OPE-01).
// Intervalo simple en el cliente; si se decide tiempo real, cambiar por push del servidor.
const REFRESCO_MS = 5000;
const DESACTUALIZADO_TRAS_MS = REFRESCO_MS * 3;

/** Vista Monitor (OPE-01): indicadores ampliados que se recalculan solos. */
@Component({
  selector: 'app-monitor-vivo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './monitor-vivo.css',
  host: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Monitor de Operaciones en Vivo' },
  template: `
    <div class="mv">
      <header class="mv__cab">
        <h1 class="mv__tit">Monitor · Operaciones en Vivo</h1>
        <div class="mv__meta">
          <span>Corte: {{ corte() }}</span>
          <span class="mv__estado" [class.mv__estado--viejo]="desactualizado()" role="status" aria-live="polite">
            @if (desactualizado()) {
              ⚠ DATOS DESACTUALIZADOS · última actualización {{ hace() }}
            } @else {
              ● En vivo · actualizado {{ hace() }}
            }
          </span>
          <button type="button" class="mv__btn" (click)="cerrar.emit()">Salir (Esc)</button>
        </div>
      </header>

      <section class="mv__kpis" aria-label="Indicadores del día">
        <div class="mv__kpi">
          <p class="mv__etq">Reclamos ingresados hoy</p>
          <p class="mv__val">{{ ind().ingresadosDia }}</p>
        </div>
        <div class="mv__kpi">
          <p class="mv__etq">Reclamos resueltos hoy</p>
          <p class="mv__val">{{ ind().resueltosDia }}</p>
        </div>
        <div class="mv__kpi">
          <p class="mv__etq">Prom. primera respuesta</p>
          <p class="mv__val">{{ horas(ind().promedioPrimeraRespuestaH) }}<small> h</small></p>
          <p class="mv__pend">Definición del promedio pendiente</p>
        </div>
        <div class="mv__kpi">
          <p class="mv__etq">Prom. resolución</p>
          <p class="mv__val">{{ horas(ind().promedioResolucionH) }}<small> h</small></p>
          <p class="mv__pend">Definición del promedio pendiente</p>
        </div>
      </section>

      <div class="mv__cols">
        <section class="mv__panel" aria-label="Tickets acumulados por área">
          <h2 class="mv__h">Tickets abiertos por área</h2>
          <ul class="mv__lista">
            @for (a of ind().porArea; track a.area) {
              <li><span>{{ nombreArea(a.area) }}</span><strong>{{ a.abiertos }}</strong></li>
            } @empty {
              <li>Sin tickets abiertos</li>
            }
          </ul>
        </section>
        <section class="mv__panel" aria-label="Volumen atendido por persona">
          <h2 class="mv__h">Atendidos por persona</h2>
          <ul class="mv__lista">
            @for (p of ind().porPersona; track p.persona) {
              <li>
                <span>{{ p.persona }}</span>
                <span><strong>{{ p.atendidos }}</strong> · {{ vsPromedio(p.difVsPromedio) }}</span>
              </li>
            } @empty {
              <li>Sin datos</li>
            }
          </ul>
          <p class="mv__pend">
            Promedio {{ ind().promedioPorPersona.toFixed(1) }} por persona. Solo referencia: la definición de
            promedio, el periodo y los umbrales están pendientes; el volumen no califica desempeño.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class MonitorVivoComponent {
  /** Fuente de tickets; sin ella usa los sintéticos del prototipo. */
  readonly tickets = input<readonly TicketAtc[] | null>(null);
  readonly cerrar = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fuente = crearTicketsDemo();
  private readonly inicio = Date.now();

  readonly ind = signal<IndicadoresMonitor>(calcularIndicadores(this.fuente, AHORA_BASE));
  readonly corte = signal('');
  private readonly ultimaOk = signal(Date.now());
  private readonly reloj = signal(Date.now());
  readonly hace = computed(() => textoHace((this.reloj() - this.ultimaOk()) / 1000));
  readonly desactualizado = computed(() => this.reloj() - this.ultimaOk() > DESACTUALIZADO_TRAS_MS);

  constructor() {
    const refrescar = () => {
      try {
        // Reloj simulado: AHORA_BASE avanza con el tiempo real desde que se abrió el monitor.
        const ahora = new Date(AHORA_BASE.getTime() + (Date.now() - this.inicio));
        this.ind.set(calcularIndicadores(this.tickets() ?? this.fuente, ahora));
        this.corte.set(ahora.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }));
        this.ultimaOk.set(Date.now());
      } catch {
        // Sin marcar ultimaOk: tras el umbral la vista avisa "datos desactualizados".
      }
    };
    refrescar();
    const a = setInterval(refrescar, REFRESCO_MS);
    const b = setInterval(() => this.reloj.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(a);
      clearInterval(b);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    });
    afterNextRender(() => {
      // Pantalla completa nativa si el navegador la ofrece; si no, queda la capa a pantalla completa.
      void this.host.nativeElement.requestFullscreen?.().catch(() => undefined);
    });
  }

  readonly nombreArea = nombreArea;

  horas(h: number | null): string {
    return h === null ? '—' : h.toFixed(1);
  }

  /** Comparación neutra con el promedio: sin calificar a la persona. */
  vsPromedio(d: number): string {
    if (Math.abs(d) < 0.05) return '= promedio';
    return `${d > 0 ? '▲ +' : '▼ '}${d.toFixed(1)} vs promedio`;
  }

  @HostListener('document:keydown.escape')
  alEscape(): void {
    this.cerrar.emit();
  }

  // Salir de la pantalla completa con Esc del navegador también cierra la vista.
  @HostListener('document:fullscreenchange')
  alCambioPantallaCompleta(): void {
    if (!document.fullscreenElement) this.cerrar.emit();
  }
}
