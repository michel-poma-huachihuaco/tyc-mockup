import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement, Tooltip, Legend);

export interface SerieGrafico {
  nombre: string;
  datos: number[];
  /** Token `--aybar-color-*` sin prefijo; en una dona, uno por porción. */
  color: string | string[];
}

/** Color CSS de un token, ya resuelto por el navegador (cualquier formato que el canvas entienda). */
function colorToken(canvas: HTMLElement, token: string): string {
  const sonda = document.createElement('i');
  sonda.style.color = `var(--aybar-color-${token})`;
  canvas.append(sonda);
  const c = getComputedStyle(sonda).color;
  sonda.remove();
  return c;
}

/** Gráfico Chart.js (barras o dona) pintado con tokens; se repinta al cambiar de tema. */
@Component({
  selector: 'app-grafico-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #lienzo role="img" [attr.aria-label]="ariaLabel()"></canvas>`,
  styles: `
    /* Chart.js mide este contenedor: debe poder encogerse (min-inline-size: 0) y el canvas no se
       recorta con max-inline-size, que lo deforma (ancho recortado, alto intacto) al estrechar la columna. */
    :host { display: block; position: relative; min-inline-size: 0; inline-size: 100%; overflow: hidden; block-size: var(--grafico-alto, 18rem); }
    canvas { display: block; }
  `,
})
export class GraficoChartComponent {
  readonly tipo = input.required<'bar' | 'doughnut'>();
  readonly etiquetas = input.required<string[]>();
  readonly series = input.required<SerieGrafico[]>();
  readonly horizontal = input(false);
  readonly apilado = input(false);
  readonly ariaLabel = input.required<string>();
  /** Índice de la etiqueta (barra o porción) pulsada. */
  readonly clic = output<number>();

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  /** Cambia con el tema (atributos de <html>) para que el efecto repinte. */
  private readonly tema = signal(0);
  private chart?: Chart;

  constructor() {
    const html = document.documentElement;
    const mo = new MutationObserver(() => this.tema.update((n) => n + 1));
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-palette', 'class'] });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = () => this.tema.update((n) => n + 1);
    mq.addEventListener('change', alCambiar);
    inject(DestroyRef).onDestroy(() => {
      mo.disconnect();
      mq.removeEventListener('change', alCambiar);
      this.chart?.destroy();
    });

    effect(() => {
      this.tema();
      const canvas = this.lienzo().nativeElement;
      const doughnut = this.tipo() === 'doughnut';
      const apilado = this.apilado();
      const texto = colorToken(canvas, 'fg-muted');
      const linea = colorToken(canvas, 'border-subtle');
      const datasets = this.series().map((s) => ({
        label: s.nombre,
        data: s.datos,
        backgroundColor: Array.isArray(s.color) ? s.color.map((c) => colorToken(canvas, c)) : colorToken(canvas, s.color),
        borderColor: colorToken(canvas, 'bg-surface'),
        borderWidth: doughnut ? 2 : 0,
      }));
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const config: ChartConfiguration = {
        type: this.tipo(),
        data: { labels: this.etiquetas(), datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: this.horizontal() ? 'y' : 'x',
          animation: reducido ? false : undefined,
          font: { family: getComputedStyle(canvas).fontFamily },
          color: texto,
          plugins: { legend: { position: 'bottom', labels: { color: texto, boxWidth: 12 } } },
          scales: doughnut
            ? {}
            : {
                x: { stacked: apilado, ticks: { color: texto, precision: 0 }, grid: { color: linea } },
                y: { stacked: apilado, ticks: { color: texto, precision: 0 }, grid: { color: linea } },
              },
          onClick: (_e, els) => {
            if (els[0]) this.clic.emit(els[0].index);
          },
          onHover: (e, els) => {
            (e.native?.target as HTMLElement | undefined)?.style.setProperty('cursor', els.length ? 'pointer' : 'default');
          },
        },
      };
      if (this.chart) {
        this.chart.data = config.data;
        this.chart.options = config.options!;
        this.chart.update();
      } else {
        this.chart = new Chart(canvas, config);
      }
    });
  }
}
