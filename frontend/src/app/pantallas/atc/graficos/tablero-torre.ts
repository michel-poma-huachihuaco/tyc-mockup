import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCelda,
  AyGrid,
  AyStatistic,
  AyTable,
  type AyColumna,
} from '@aybarcorp/ui-angular';
import { AREAS_ATC, ESTADO_ES, ESTADOS_TICKET, evaluarSlaTicket, type TicketAtc } from '../datos-atc';
import { nombreArea } from '../etiquetas-es';
import { calcularTorre, COLOR_ESTADO } from '../indicadores-torre';
import { GraficoChartComponent, type SerieGrafico } from './grafico-chart';

const ESTADOS = [...ESTADOS_TICKET, 'REOPENED'] as const;
const SLA = [
  { clave: 'enPlazo', nombre: 'En plazo', color: 'feedback-success-border' },
  { clave: 'enRiesgo', nombre: 'En riesgo', color: 'feedback-warning-border' },
  { clave: 'vencido', nombre: 'Vencido', color: 'feedback-danger-border' },
] as const;

type Fila = Record<string, string | number>;

/** Pestaña «Tablero» de la Torre de Control CX: tickets por área y estado, y SLA por área. */
@Component({
  selector: 'app-tablero-torre',
  standalone: true,
  imports: [AyButton, AyCard, AyCardBody, AyCardHeader, AyCelda, AyGrid, AyStatistic, AyTable, GraficoChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './tablero-torre.css',
  template: `
    <div class="tt">
      <div ayGrid [columnas]="4" gap="md">
        <ay-card superficie="solid">
          <ay-card-body padding="md">
            <ay-statistic etiqueta="Tickets abiertos" [valor]="'' + ind().abiertos" periodo="Sin resolver ni cerrar" size="sm" />
          </ay-card-body>
        </ay-card>
        <ay-card superficie="solid">
          <ay-card-body padding="md">
            <ay-statistic etiqueta="Vencidos" [valor]="'' + ind().vencidos" periodo="Plazo de SLA superado" size="sm" />
          </ay-card-body>
        </ay-card>
        <ay-card superficie="solid">
          <ay-card-body padding="md">
            <ay-statistic
              etiqueta="Cumplimiento de SLA"
              [valor]="ind().cumplimientoSla === null ? '—' : ind().cumplimientoSla + ' %'"
              periodo="Abiertos dentro de plazo · meta ≥ 90 %"
              size="sm"
            />
          </ay-card-body>
        </ay-card>
        <ay-card superficie="solid">
          <ay-card-body padding="md">
            <ay-statistic etiqueta="Resueltos en 1.er contacto (FCR)" valor="68 %" periodo="Dato simulado del prototipo" size="sm" />
          </ay-card-body>
        </ay-card>
      </div>

      <div ayGrid [columnas]="2" gap="md" class="tt__graficos">
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header titulo="Tickets por área y estado" subtitulo="Pulsa una barra para verla en Vivo." nivel="h2" [separador]="true" />
          <ay-card-body padding="md">
            <app-grafico-chart
              class="tt__alto-lg"
              tipo="bar"
              [horizontal]="true"
              [apilado]="true"
              [etiquetas]="etiquetasAreas()"
              [series]="seriesEstado()"
              [ariaLabel]="'Barras apiladas: tickets por área y estado. ' + resumenAreas()"
              (clic)="verArea($event)"
            />
            <details class="tt__datos">
              <summary>Ver datos en tabla</summary>
              <ay-table leyenda="Tickets por área y estado" [columnas]="columnasEstado" [filas]="filasEstado()" [rayada]="true">
                <ng-template ayCelda="accion" let-fila>
                  <ay-button tamano="sm" variante="secondary" (click)="verAreaEnVivo.emit(codigo(fila))">Ver en Vivo</ay-button>
                </ng-template>
              </ay-table>
            </details>
          </ay-card-body>
        </ay-card>

        <ay-card variante="elevated" superficie="solid">
          <ay-card-header titulo="Distribución por estado" subtitulo="Todas las áreas." nivel="h2" [separador]="true" />
          <ay-card-body padding="md">
            <app-grafico-chart
              class="tt__alto-lg"
              tipo="doughnut"
              [etiquetas]="etiquetasEstados"
              [series]="serieDona()"
              [ariaLabel]="'Dona: distribución de tickets por estado. ' + resumenEstados()"
            />
            <details class="tt__datos">
              <summary>Ver datos en tabla</summary>
              <ay-table leyenda="Tickets por estado" [columnas]="columnasDona" [filas]="filasDona()" [rayada]="true" />
            </details>
          </ay-card-body>
        </ay-card>
      </div>

      <ay-card variante="elevated" superficie="solid">
        <ay-card-header titulo="SLA por área (tickets abiertos)" subtitulo="Pulsa una barra para verla en Vivo." nivel="h2" [separador]="true" />
        <ay-card-body padding="md" gap="sm">
          <app-grafico-chart
            class="tt__alto-md"
            tipo="bar"
            [horizontal]="true"
            [apilado]="true"
            [etiquetas]="etiquetasAreas()"
            [series]="serieSla()"
            [ariaLabel]="'Barras apiladas: SLA por área, en plazo, en riesgo y vencido. ' + resumenSla()"
            (clic)="verArea($event)"
          />
          <p class="tt__nota">La regla de «en riesgo» es provisional (la del prototipo: menos del 25 % del plazo restante).</p>
          <details class="tt__datos">
            <summary>Ver datos en tabla</summary>
            <ay-table leyenda="SLA por área" [columnas]="columnasSla" [filas]="filasSla()" [rayada]="true">
              <ng-template ayCelda="accion" let-fila>
                <ay-button tamano="sm" variante="secondary" (click)="verAreaEnVivo.emit(codigo(fila))">Ver en Vivo</ay-button>
              </ng-template>
            </ay-table>
          </details>
        </ay-card-body>
      </ay-card>
    </div>
  `,
})
export class TableroTorreComponent {
  readonly tickets = input.required<TicketAtc[]>();
  /** Código de área (p. ej. 'LEGAL') que el usuario quiere ver en Vivo. */
  readonly verAreaEnVivo = output<string>();

  readonly ind = computed(() =>
    calcularTorre(this.tickets(), { areas: AREAS_ATC, estados: ESTADOS, evaluarSla: evaluarSlaTicket }),
  );

  readonly etiquetasEstados = ESTADOS.map((e) => ESTADO_ES[e] ?? e);
  readonly etiquetasAreas = computed(() => this.ind().areaEstado.map((a) => nombreArea(a.area)));

  readonly seriesEstado = computed<SerieGrafico[]>(() =>
    ESTADOS.map((e, i) => ({
      nombre: this.etiquetasEstados[i]!,
      datos: this.ind().areaEstado.map((a) => a.porEstado[i]!),
      color: COLOR_ESTADO[e]!,
    })),
  );
  readonly serieDona = computed<SerieGrafico[]>(() => [{ nombre: 'Tickets', datos: this.ind().porEstado, color: ESTADOS.map((e) => COLOR_ESTADO[e]!) }]);
  readonly serieSla = computed<SerieGrafico[]>(() =>
    SLA.map((s) => ({ nombre: s.nombre, datos: this.ind().slaPorArea.map((a) => a[s.clave]), color: s.color })),
  );

  readonly resumenAreas = computed(() => this.ind().areaEstado.map((a) => `${nombreArea(a.area)} ${a.total}`).join(', ') + '.');
  readonly resumenEstados = computed(
    () => this.ind().porEstado.map((n, i) => `${this.etiquetasEstados[i]} ${n}`).join(', ') + '.',
  );
  readonly resumenSla = computed(
    () =>
      this.ind()
        .slaPorArea.map((a) => `${nombreArea(a.area)}: ${a.enPlazo} en plazo, ${a.enRiesgo} en riesgo, ${a.vencido} vencidos`)
        .join('; ') + '.',
  );

  readonly columnasEstado: readonly AyColumna[] = [
    { clave: 'area', cabecera: 'Área' },
    ...ESTADOS.map((e, i) => ({ clave: `e${i}`, cabecera: ESTADO_ES[e] ?? e, alineacion: 'end' as const })),
    { clave: 'total', cabecera: 'Total', alineacion: 'end' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end' },
  ];
  readonly columnasDona: readonly AyColumna[] = [
    { clave: 'estado', cabecera: 'Estado' },
    { clave: 'n', cabecera: 'Tickets', alineacion: 'end' },
    { clave: 'pct', cabecera: '%', alineacion: 'end' },
  ];
  readonly columnasSla: readonly AyColumna[] = [
    { clave: 'area', cabecera: 'Área' },
    ...SLA.map((s) => ({ clave: s.clave, cabecera: s.nombre, alineacion: 'end' as const })),
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end' },
  ];

  readonly filasEstado = computed<Fila[]>(() =>
    this.ind().areaEstado.map((a) => ({
      codigo: a.area,
      area: nombreArea(a.area),
      ...Object.fromEntries(a.porEstado.map((n, i) => [`e${i}`, n])),
      total: a.total,
    })),
  );
  readonly filasDona = computed<Fila[]>(() => {
    const total = this.ind().porEstado.reduce((s, n) => s + n, 0);
    return this.ind().porEstado.map((n, i) => ({
      estado: this.etiquetasEstados[i]!,
      n,
      pct: total ? `${Math.round((n / total) * 1000) / 10} %` : '—',
    }));
  });
  readonly filasSla = computed<Fila[]>(() =>
    this.ind().slaPorArea.map((a) => ({
      codigo: a.area,
      area: nombreArea(a.area),
      enPlazo: a.enPlazo,
      enRiesgo: a.enRiesgo,
      vencido: a.vencido,
    })),
  );

  codigo(fila: unknown): string {
    return (fila as Fila)['codigo'] as string;
  }

  verArea(i: number): void {
    this.verAreaEnVivo.emit(AREAS_ATC[i]!);
  }
}
