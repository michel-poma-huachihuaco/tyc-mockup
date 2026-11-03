import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AyBadge, AyCard, AyCardBody, AyCardHeader, AyGrid, AyStatistic } from '@aybarcorp/ui-angular';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import { GraficoChartComponent } from '../graficos/grafico-chart';
import { IMPACTO_SIMULADO, borradores, contrasteImpacto, muestraSuficiente } from './tigo-aprendizaje';
import { TigoEstadoService } from './tigo-estado';

const pct = (n: number, total: number): string => (total ? `${Math.round((n / total) * 100)} %` : '—');
const coma = (n: number): string => n.toFixed(1).replace('.', ',');

/**
 * «Impacto de Tigo» para la Torre de Control CX. Lo histórico es SIMULADO (marcado); lo de la sesión es real del
 * prototipo. Propuesta fuera de la Etapa 1.
 */
@Component({
  selector: 'app-impacto-tigo',
  standalone: true,
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AyGrid, AyStatistic, GraficoChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ay-card variante="elevated" superficie="solid">
      <ay-card-header
        titulo="Impacto de Tigo"
        subtitulo="Últimos 30 días, con las decisiones de hoy sumadas. Tigo propone; una persona decide."
        nivel="h2"
        [separador]="true"
      />
      <ay-card-body padding="md" gap="md">
        <p class="it-marcas">
          <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge>
          <ay-badge size="sm" tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
          @if (m().sesion.total) {
            <ay-badge size="sm" tono="info">Incluye {{ m().sesion.total }} decisión(es) real(es) de esta sesión</ay-badge>
          }
        </p>
        <div ayGrid [columnas]="4" gap="md">
          <ay-statistic etiqueta="Tickets asistidos" [valor]="'' + (m().ticketsAsistidos.simulados + m().ticketsAsistidos.sesion)" periodo="Con borrador de Tigo" size="sm" />
          <ay-statistic etiqueta="Aceptación sin cambios" [valor]="aceptacion()" periodo="Borradores aceptados tal cual" size="sm" />
          <ay-statistic etiqueta="Edición" [valor]="edicion()" periodo="Aceptados con cambios del gestor" size="sm" />
          <ay-statistic etiqueta="Descarte" [valor]="descarte()" periodo="El gestor atiende manualmente" size="sm" />
        </div>
        <div ayGrid [columnas]="2" gap="md">
          <div class="it-contraste">
            <ay-statistic etiqueta="Primera respuesta con Tigo" [valor]="min.conTigo + ' min'" [periodo]="'Sin Tigo: ' + min.sinTigo + ' min'" size="sm" />
            <p class="it-ref">Primera respuesta con Tigo {{ min.conTigo }} min · sin Tigo {{ min.sinTigo }} min</p>
            <ay-badge size="sm" tono="success">{{ contraste.respuestaPct }} de tiempo</ay-badge>
            <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge>
          </div>
          <div class="it-contraste">
            <ay-statistic etiqueta="CSAT asistido" [valor]="csatA" [periodo]="'No asistido: ' + csatN" size="sm" />
            <p class="it-ref">CSAT asistido {{ csatA }} · no asistido {{ csatN }}</p>
            <ay-badge size="sm" tono="success">{{ contraste.csatDif }} puntos</ay-badge>
            <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge>
          </div>
        </div>
        <section aria-labelledby="it-v">
          <h3 id="it-v" class="it-h">Aceptación sin cambios por versión de guía (Consulta de cuenta)</h3>
          <app-grafico-chart
            style="--grafico-alto: 12rem"
            tipo="bar"
            [horizontal]="true"
            [etiquetas]="etiquetasVersion()"
            [maximo]="100"
            [series]="[{ nombre: 'Aceptación sin cambios (%)', datos: datosVersion(), color: 'feedback-success-border' }]"
            [ariaLabel]="'Barras: aceptación sin cambios por versión de guía. ' + resumenVersion()"
          />
          <ul class="it-lista">
            @for (v of filasVersion(); track v.version) {
              <li>
                @if (v.pct === null) {
                  Guía v{{ v.version }}: sin datos aún
                } @else if (v.suficiente) {
                  Guía v{{ v.version }}: {{ v.pct }} % ({{ v.textoTotal }})
                } @else {
                  Guía v{{ v.version }}: muestra insuficiente ({{ v.textoTotal }} de hoy, {{ v.aceptadas }} aceptado{{ v.aceptadas === 1 ? '' : 's' }} sin cambios)
                }
                @if (v.simulado) { <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge> }
                @if (v.real) { <ay-badge size="sm" tono="info">Dato real de la sesión</ay-badge> }
              </li>
            }
          </ul>
        </section>
      </ay-card-body>
    </ay-card>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .it-marcas { margin: 0; display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .it-h { margin: 0 0 var(--aybar-space-2); font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); }
    .it-contraste { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .it-ref { margin: 0; flex-basis: 100%; min-width: 0; overflow-wrap: anywhere; font-size: var(--aybar-font-size-sm); }
    .it-lista { margin: var(--aybar-space-2) 0 0; padding-inline-start: var(--aybar-space-5); font-size: var(--aybar-font-size-sm); display: flex; flex-direction: column; gap: var(--aybar-space-1); }
  `,
})
export class ImpactoTigo {
  private readonly tigo = inject(TigoEstadoService);
  private readonly proto = inject(EstadoPrototipoAtcService);
  protected readonly m = this.tigo.metricas;
  protected readonly min = { conTigo: IMPACTO_SIMULADO.primeraRespuestaConTigoMin, sinTigo: IMPACTO_SIMULADO.primeraRespuestaSinTigoMin };
  protected readonly csatA = coma(IMPACTO_SIMULADO.csatAsistido);
  protected readonly csatN = coma(IMPACTO_SIMULADO.csatNoAsistido);
  protected readonly contraste = contrasteImpacto(IMPACTO_SIMULADO);
  protected readonly aceptacion = computed(() => pct(this.m().global.aceptadas, this.m().global.total));
  protected readonly edicion = computed(() => pct(this.m().global.editadas, this.m().global.total));
  protected readonly descarte = computed(() => pct(this.m().global.descartadas, this.m().global.total));

  /** CTA por versión; la versión vigente sin decisiones aparece como «sin datos aún». */
  protected readonly filasVersion = computed(() => {
    const filas = this.m().porVersion.filter((f) => f.tipo === 'CTA');
    const vigente = this.proto.obtenerGuiaActiva('CTA')?.versionActual ?? 0;
    const vistas = filas.map((f) => ({
      version: f.version,
      pct: f.aceptacionPct,
      total: f.total,
      aceptadas: f.aceptadas,
      textoTotal: borradores(f.total),
      suficiente: muestraSuficiente(f.total),
      simulado: f.simulado,
      real: f.real,
    }));
    for (let v = 1; v <= vigente; v++) {
      if (!vistas.some((x) => x.version === v)) vistas.push({ version: v, pct: null, total: 0, aceptadas: 0, textoTotal: borradores(0), suficiente: false, simulado: false, real: false });
    }
    return vistas.sort((a, b) => a.version - b.version);
  });
  /** Solo las versiones con muestra suficiente van como barra; el resto queda en la lista de texto. */
  private readonly graficables = computed(() => this.filasVersion().filter((v) => v.suficiente));
  protected readonly etiquetasVersion = computed(() => this.graficables().map((v) => `v${v.version}`));
  protected readonly datosVersion = computed(() => this.graficables().map((v) => v.pct ?? 0));
  protected readonly resumenVersion = computed(() =>
    this.filasVersion()
      .map((v) => `v${v.version}: ${v.pct === null ? 'sin datos' : v.suficiente ? v.pct + ' %' : 'muestra insuficiente'}`)
      .join(', '),
  );
}
