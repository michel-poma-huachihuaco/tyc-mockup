import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  AyButton,
  AyChip,
  AySearchInput,
  AyTableToolbar,
} from '@aybarcorp/ui-angular';
import { EMPRESAS_AYBAR } from './datos-atc';
import { EstadoPrototipoAtcService } from './estado-prototipo-atc';
import { formatearRangoIso, type FiltrosTabla } from './filtros-tabla';

/**
 * Barra compacta de tabla: buscador de texto libre, chips de filtros activos seleccionados
 * desde los desplegables de cada columna (`<thead><th>`), chip global de razón social y recuento «N de M».
 */
@Component({
  selector: 'app-barra-filtros',
  standalone: true,
  imports: [AyButton, AyChip, AySearchInput, AyTableToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let f = filtros();
    @if (f.cfg.textoDe || f.hayActivos() || (conFiltroEmpresa() && estado.empresaFiltro())) {
      <ay-table-toolbar [recuento]="f.filtradas().length" [etiquetaElemento]="etiquetaRecuento()">
        @if (f.cfg.textoDe) {
          <ay-search-input
            ayBusqueda
            size="sm"
            [retardo]="250"
            [etiqueta]="f.cfg.etiquetaBusqueda ?? 'Buscar'"
            [placeholder]="f.cfg.placeholderBusqueda"
            [valor]="f.busqueda()"
            (valorChange)="f.setBusqueda($event)"
          />
        }
        <ng-container ayFiltros>
          @for (chip of chipsActivos(); track chip.id) {
            <ay-chip
              variante="removable"
              [etiquetaQuitar]="'Quitar filtro ' + chip.etiqueta"
              (quitar)="f.setValor(chip.id, undefined)"
            >
              {{ chip.etiqueta }}: {{ chip.resumen }}
            </ay-chip>
          }
          @if (conFiltroEmpresa() && estado.empresaFiltro()) {
            <ay-chip
              variante="removable"
              etiquetaQuitar="Quitar el filtro de razón social"
              (quitar)="estado.empresaFiltro.set('')"
            >
              Razón social: {{ nombreEmpresa() }}
            </ay-chip>
          }
          @if (chipsActivos().length === 0) {
            <span class="pl-barra-filtros-guia">
              Filtra haciendo clic en cualquier cabecera de columna <b>▾</b>
            </span>
          }
        </ng-container>
        @if (f.hayActivos()) {
          <ay-button ayAcciones tamano="sm" variante="ghost" (click)="f.limpiar()">
            Limpiar filtros
          </ay-button>
        }
      </ay-table-toolbar>
    }
  `,
})
export class BarraFiltrosComponent {
  protected readonly estado = inject(EstadoPrototipoAtcService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filtros = input.required<FiltrosTabla<any>>();
  /** La tabla se alimenta de los tickets que ya filtra la razón social global: se muestra su chip. */
  readonly conFiltroEmpresa = input<boolean>(false);

  protected readonly chipsActivos = computed(() => {
    const f = this.filtros();
    f.huella();
    const res: { id: string; etiqueta: string; resumen: string }[] = [];
    for (const d of f.cfg.filtros) {
      const vals = f.valores(d.id);
      if (!vals.some((x) => x.trim().length > 0)) continue;
      if (d.tipo === 'boolean') {
        res.push({ id: d.id, etiqueta: d.etiqueta, resumen: 'Sí' });
        continue;
      }
      if (d.tipo === 'rango-fechas') {
        res.push({
          id: d.id,
          etiqueta: d.etiqueta,
          resumen: formatearRangoIso(vals[0] ?? '', vals[1] ?? ''),
        });
        continue;
      }
      const ops = f.opciones(d.id)();
      const etiquetas = vals.map((v) => ops.find((o) => o.valor === v)?.etiqueta ?? v);
      const resumen =
        etiquetas.length <= 2
          ? etiquetas.join(', ')
          : `${etiquetas[0]} +${etiquetas.length - 1}`;
      res.push({ id: d.id, etiqueta: d.etiqueta, resumen });
    }
    return res;
  });

  protected readonly etiquetaRecuento = computed(() => {
    const f = this.filtros();
    const el = f.cfg.etiquetaElemento;
    return f.hayActivos() ? `de ${f.total()} ${el}` : el;
  });

  protected readonly nombreEmpresa = computed(() => {
    const id = this.estado.empresaFiltro();
    return EMPRESAS_AYBAR.find((e) => e.id === id)?.nombre ?? id;
  });
}
