import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import {
  AyAvatar,
  AyBadge,
  AyButton,
  AyDrawer,
  AyEmptyState,
  AySelect,
  AyStack,
  AyText,
  type AyOpcionSelect,
} from '@aybarcorp/ui-angular';
import { AREAS_ATC, ESTADO_ES, evaluarSlaTicket, type TicketAtc } from './datos-atc';
import { nombreArea } from './etiquetas-es';
import { COLOR_ESTADO } from './indicadores-torre';
import {
  agruparPorResponsable,
  textoHaceDesde,
  type FilaResponsable,
  type OrdenResponsables,
} from './indicadores-responsables';

const TONO_ESTADO: Record<string, 'info' | 'warning' | 'danger' | 'success' | 'neutral'> = {
  OPEN: 'info',
  IN_PROGRESS: 'info',
  PENDING_CUSTOMER: 'warning',
  ESCALATED: 'danger',
  IN_COMMITTEE: 'danger',
  REOPENED: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

/** Tablero de Operación en Vivo a nivel micro: status de atención de tickets por responsable. */
@Component({
  selector: 'app-tablero-responsables',
  standalone: true,
  imports: [AyAvatar, AyBadge, AyButton, AyDrawer, AyEmptyState, AySelect, AyStack, AyText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './tablero-responsables.css',
  template: `
    <div ayStack gap="4">
      <div class="tr-filtros">
        <div class="tr-filtro">
          <ay-select
            nombre="responsables-area"
            etiqueta="Área"
            size="sm"
            [opciones]="opcionesArea"
            [valor]="area()"
            (valorChange)="area.set($event)"
          />
        </div>
        <div class="tr-filtro">
          <ay-select
            nombre="responsables-orden"
            etiqueta="Ordenar"
            size="sm"
            [opciones]="opcionesOrden"
            [valor]="orden()"
            (valorChange)="cambiarOrden($event)"
          />
        </div>
        <span class="tr-vivo"><span class="tr-vivo__punto" aria-hidden="true"></span>en vivo</span>
      </div>

      <ul class="tr-leyenda" aria-label="Colores de estado">
        @for (e of estados; track e) {
          <li><span class="tr-leyenda__punto" [style.--tr-color]="color(e)"></span>{{ estadoEs[e] }}</li>
        }
      </ul>

      @if (filas().length === 0) {
        <ay-empty-state
          variante="no-results"
          size="compact"
          titulo="Sin responsables"
          descripcion="Ningún responsable tiene tickets en el área seleccionada."
        >
          <div ayAcciones>
            <ay-button tamano="sm" variante="secondary" (click)="area.set('')">Ver todas las áreas</ay-button>
          </div>
        </ay-empty-state>
      } @else {
        <div class="tr-scroll" tabindex="0" role="region" aria-label="Responsables y estado de sus tickets">
          <table class="tr-tabla">
            <thead>
              <tr>
                <th scope="col">Responsable</th>
                <th scope="col" class="tr-num">Carga</th>
                <th scope="col">Tickets por estado</th>
                <th scope="col" class="tr-num">En riesgo</th>
                <th scope="col" class="tr-num">Vencidos</th>
                <th scope="col">Último movimiento</th>
              </tr>
            </thead>
            <tbody>
              @for (f of filas(); track f.nombre) {
                <tr class="tr-fila" (click)="abrir(f)">
                  <td>
                    <button type="button" class="tr-fila__btn" [attr.aria-label]="'Ver tickets de ' + f.nombre">
                      <ay-avatar [nombre]="f.nombre" size="sm" decorativo />
                      <span class="tr-fila__texto">
                        <strong>{{ f.nombre }}</strong>
                        <span ayText="subtitle" size="xs">{{ f.owner ? nombreArea(f.area) : 'Pendiente de asignar' }}</span>
                      </span>
                    </button>
                  </td>
                  <td class="tr-num"><strong>{{ f.carga }}</strong></td>
                  <td>
                    <div class="tr-barra" role="img" [attr.aria-label]="textoBarra(f)">
                      @for (e of estados; track e) {
                        @if (f.porEstado[e]; as n) {
                          <span class="tr-barra__seg" [style.--tr-color]="color(e)" [style.flex-grow]="n" [title]="estadoEs[e] + ': ' + n"></span>
                        }
                      }
                    </div>
                  </td>
                  <td class="tr-num">
                    <ay-badge size="sm" [tono]="f.enRiesgo ? 'warning' : 'neutral'">{{ f.enRiesgo }}</ay-badge>
                  </td>
                  <td class="tr-num">
                    <ay-badge size="sm" [tono]="f.vencidos ? 'danger' : 'neutral'">{{ f.vencidos }}</ay-badge>
                  </td>
                  <td>{{ hace(f) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <ay-drawer [(abierto)]="abierto" lado="end" size="lg" [titulo]="seleccion()?.nombre ?? ''">
      @if (seleccion(); as f) {
        <div class="tr-scroll" tabindex="0" role="region" [attr.aria-label]="'Tickets de ' + f.nombre">
          <table class="tr-tabla">
            <thead>
              <tr>
                <th scope="col">Ticket</th>
                <th scope="col">Cliente</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col">SLA</th>
                <th scope="col">Recorrido</th>
              </tr>
            </thead>
            <tbody>
              @for (t of f.tickets; track t.num) {
                @let sla = evaluarSlaTicket(t);
                <tr>
                  <td class="tr-nowrap">
                    <ay-button tamano="sm" variante="ghost" (click)="seleccionarTicket.emit(t.num)">{{ t.num }}</ay-button>
                  </td>
                  <td>{{ t.cli }}</td>
                  <td>{{ t.type }}</td>
                  <td><ay-badge size="sm" [tono]="tonoEstado[t.state] ?? 'neutral'">{{ estadoEs[t.state] ?? t.state }}</ay-badge></td>
                  <td><ay-badge size="sm" [tono]="sla.tono">{{ sla.txt }}</ay-badge></td>
                  <td>{{ recorrido(t) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </ay-drawer>
  `,
})
export class TableroResponsablesComponent {
  readonly tickets = input<readonly TicketAtc[]>([]);
  readonly area = model<string>('');
  readonly seleccionarTicket = output<string>();

  readonly orden = signal<OrdenResponsables>('riesgo');
  readonly abierto = signal(false);
  private readonly claveSeleccion = signal<string | null>(null);

  readonly estados = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'IN_COMMITTEE', 'REOPENED', 'RESOLVED', 'CLOSED'];
  readonly estadoEs = ESTADO_ES;
  readonly tonoEstado = TONO_ESTADO;
  color(e: string): string {
    return `var(--aybar-color-${COLOR_ESTADO[e]})`;
  }
  readonly nombreArea = nombreArea;
  readonly evaluarSlaTicket = evaluarSlaTicket;

  readonly opcionesArea: AyOpcionSelect[] = [
    { value: '', label: 'Todas' },
    ...AREAS_ATC.map((a) => ({ value: a, label: nombreArea(a) })),
  ];
  readonly opcionesOrden: AyOpcionSelect[] = [
    { value: 'riesgo', label: 'Más en riesgo primero' },
    { value: 'carga', label: 'Mayor carga' },
    { value: 'movimiento', label: 'Último movimiento' },
  ];

  readonly filas = computed(() => agruparPorResponsable(this.tickets(), this.area(), this.orden()));
  /** Fila abierta en el panel; se recalcula con los tickets vivos. */
  readonly seleccion = computed(() => this.filas().find((f) => f.nombre === this.claveSeleccion()) ?? null);

  cambiarOrden(v: string): void {
    this.orden.set(v as OrdenResponsables);
  }

  abrir(f: FilaResponsable): void {
    this.claveSeleccion.set(f.nombre);
    this.abierto.set(true);
  }

  hace(f: FilaResponsable): string {
    return textoHaceDesde(f.ultimoMovimiento);
  }

  textoBarra(f: FilaResponsable): string {
    const partes = this.estados.filter((e) => f.porEstado[e]).map((e) => `${f.porEstado[e]} ${ESTADO_ES[e].toLowerCase()}`);
    return `Tickets de ${f.nombre} por estado: ${partes.join(', ')}`;
  }

  recorrido(t: TicketAtc): string {
    return t.status.map((h) => ESTADO_ES[h.estado] ?? h.estado).join(' → ');
  }
}
