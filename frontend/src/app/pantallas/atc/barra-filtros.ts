import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  AyButton,
  AyChip,
  AyFilterControl,
  AySearchInput,
  AySegmentedControl,
  AyTableToolbar,
  AyToggleButton,
} from '@aybarcorp/ui-angular';
import { EMPRESAS_AYBAR } from './datos-atc';
import { EstadoPrototipoAtcService } from './estado-prototipo-atc';
import type { FiltrosTabla } from './filtros-tabla';

/**
 * Barra de filtros estándar de una tabla (ver ESTANDAR-FILTROS-TABLAS.md): buscador, filtros declarados,
 * «Más filtros» si pasan de seis, «Limpiar filtros» siempre presente (deshabilitado sin filtros), chip del
 * filtro global de razón social y recuento «N de M».
 */
@Component({
  selector: 'app-barra-filtros',
  standalone: true,
  imports: [AyButton, AyChip, AyFilterControl, AySearchInput, AySegmentedControl, AyTableToolbar, AyToggleButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let f = filtros();
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
        @for (d of f.enLinea; track d.id) {
          @switch (d.tipo) {
            @case ('segmento') {
              <ay-segmented-control
                size="sm"
                [etiqueta]="d.etiqueta"
                [opciones]="f.segmentos(d.id)()"
                [valor]="f.valorSegmento(d.id)"
                (valorChange)="f.setValor(d.id, $event)"
              />
            }
            @case ('boolean') {
              <ay-toggle-button
                tamano="sm"
                [presionado]="f.activo(d.id)"
                (presionadoChange)="f.setValor(d.id, $event)"
              >
                {{ d.etiqueta }}
              </ay-toggle-button>
            }
            @default {
              <ay-filter-control
                size="sm"
                [etiqueta]="d.etiqueta"
                [tipo]="d.tipo === 'single' ? 'single' : 'multi'"
                [conBusqueda]="d.conBusqueda ?? false"
                [opciones]="f.opciones(d.id)()"
                [valor]="f.valor(d.id)"
                (valorChange)="f.setValor(d.id, $event)"
              />
            }
          }
        }
        @if (f.enMas.length > 0) {
          <ay-button tamano="sm" variante="secondary" (click)="masAbierto.set(!masAbierto())">
            {{ masVisible() ? 'Menos filtros' : 'Más filtros' }}{{ f.masActivos ? ' (' + f.masActivos + ')' : '' }}
          </ay-button>
          @if (masVisible()) {
            @for (d of f.enMas; track d.id) {
              @switch (d.tipo) {
                @case ('boolean') {
                  <ay-toggle-button
                    tamano="sm"
                    [presionado]="f.activo(d.id)"
                    (presionadoChange)="f.setValor(d.id, $event)"
                  >
                    {{ d.etiqueta }}
                  </ay-toggle-button>
                }
                @default {
                  <ay-filter-control
                    size="sm"
                    [etiqueta]="d.etiqueta"
                    [tipo]="d.tipo === 'single' ? 'single' : 'multi'"
                    [conBusqueda]="d.conBusqueda ?? false"
                    [opciones]="f.opciones(d.id)()"
                    [valor]="f.valor(d.id)"
                    (valorChange)="f.setValor(d.id, $event)"
                  />
                }
              }
            }
          }
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
      </ng-container>
      <ay-button ayAcciones tamano="sm" variante="ghost" [disabled]="!f.hayActivos()" (click)="f.limpiar()">
        Limpiar filtros
      </ay-button>
    </ay-table-toolbar>
  `,
})
export class BarraFiltrosComponent {
  protected readonly estado = inject(EstadoPrototipoAtcService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filtros = input.required<FiltrosTabla<any>>();
  /** La tabla se alimenta de los tickets que ya filtra la razón social global: se muestra su chip. */
  readonly conFiltroEmpresa = input<boolean>(false);

  protected readonly masAbierto = signal(false);
  protected readonly masVisible = computed(() => this.masAbierto() || this.filtros().masActivos > 0);

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
