import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AySegmentedControl, AyText, type AySegmentoOpcion } from '@aybarcorp/ui-angular';
import { AHORA_BASE, TIPOS_TICKET, sumarDiasHabiles } from '../datos-atc';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import type { SlaPrevisto } from './sla-previsto';
import { SlaConservadora } from './version-conservadora';
import { SlaCreativa } from './version-creativa';
import { SlaIntermedia } from './version-intermedia';

type Propuesta = 'conservadora' | 'intermedia' | 'creativa' | 'todas';
type Escenario = 'corto' | 'largo' | 'sin-politica' | 'libro';

const PRIORIDADES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

/**
 * Propuestas de la card «Plazos de atención (SLA)» de Nuevo ticket. Página aislada (`/propuestas-sla`): no
 * toca la consola. Los plazos salen de las políticas SLA reales del prototipo; el escenario cambia qué
 * política se aplica. Se muestran al ancho de la columna lateral de Nuevo ticket.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-vista-propuestas-sla',
  standalone: true,
  imports: [AySegmentedControl, AyText, SlaConservadora, SlaIntermedia, SlaCreativa],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="vs-selector" aria-label="Propuesta de la card de SLA">
      <ay-segmented-control etiqueta="Propuesta" size="sm" [opciones]="propuestas" [valor]="activa()" (valorChange)="elegir($event)" />
      <ay-segmented-control etiqueta="Escenario" size="sm" [opciones]="escenarios" [valor]="escenario()" (valorChange)="elegirEscenario($event)" />
      <span ayText="body" size="xs">{{ descripciones[activa()] }}</span>
    </nav>

    <main class="vs-pagina">
      <div class="vs-fila" [class.vs-fila--todas]="activa() === 'todas'">
        @if (activa() === 'conservadora' || activa() === 'todas') {
          <section class="vs-col" aria-label="Propuesta conservadora">
            @if (activa() === 'todas') { <h2 class="vs-tit">Conservadora</h2> }
            <app-sla-conservadora [sla]="sla()" />
          </section>
        }
        @if (activa() === 'intermedia' || activa() === 'todas') {
          <section class="vs-col" aria-label="Propuesta intermedia">
            @if (activa() === 'todas') { <h2 class="vs-tit">Intermedia</h2> }
            <app-sla-intermedia [sla]="sla()" />
          </section>
        }
        @if (activa() === 'creativa' || activa() === 'todas') {
          <section class="vs-col" aria-label="Propuesta creativa">
            @if (activa() === 'todas') { <h2 class="vs-tit">Creativa</h2> }
            <app-sla-creativa [sla]="sla()" />
          </section>
        }
      </div>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: var(--aybar-color-bg-surface-sunken); }
    .vs-selector { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-4); padding: var(--aybar-space-3) var(--aybar-space-6); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); background: var(--aybar-color-bg-surface); }
    .vs-pagina { padding: var(--aybar-space-6); }
    .vs-fila { display: flex; justify-content: center; }
    .vs-fila--todas { justify-content: flex-start; flex-wrap: wrap; gap: var(--aybar-space-6); align-items: flex-start; }
    .vs-col { width: 100%; max-width: 26rem; display: flex; flex-direction: column; gap: var(--aybar-space-2); }
    .vs-tit { margin: 0; font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); text-transform: uppercase; letter-spacing: 0.04em; }
  `,
})
export class VistaPropuestasSla {
  private readonly estado = inject(EstadoPrototipoAtcService);
  private readonly params = new URLSearchParams(globalThis.location?.search ?? '');

  protected readonly propuestas: AySegmentoOpcion[] = [
    { valor: 'conservadora', etiqueta: '1 · Conservadora' },
    { valor: 'intermedia', etiqueta: '2 · Intermedia' },
    { valor: 'creativa', etiqueta: '3 · Creativa' },
    { valor: 'todas', etiqueta: 'Las tres' },
  ];
  protected readonly escenarios: AySegmentoOpcion[] = [
    { valor: 'corto', etiqueta: 'Plazo corto' },
    { valor: 'largo', etiqueta: 'Plazo largo' },
    { valor: 'sin-politica', etiqueta: 'Sin política' },
    { valor: 'libro', etiqueta: 'Libro de Reclamaciones' },
  ];
  protected readonly descripciones: Readonly<Record<Propuesta, string>> = {
    conservadora: 'La card de hoy, con el mismo contenido, ordenada en tres filas: qué, cuándo y en cuántas horas.',
    intermedia: 'Dos cifras grandes (responder y resolver) con su vencimiento y una barra que reparte el plazo.',
    creativa: 'Calendario de jornadas hábiles: se ve por qué 24 h hábiles vencen días después y qué horas no cuentan.',
    todas: 'Las tres propuestas juntas, al ancho real de la columna lateral de Nuevo ticket.',
  };

  protected readonly activa = signal<Propuesta>(this.inicial());
  protected readonly escenario = signal<Escenario>('corto');

  /** Todas las combinaciones de tipo y prioridad, ya calculadas con las políticas vigentes. */
  private readonly combinaciones = computed(() =>
    TIPOS_TICKET.flatMap((t) => PRIORIDADES.map((p) => this.construir(t.id, p))),
  );

  protected readonly sla = computed<SlaPrevisto>(() => {
    const todas = this.combinaciones();
    const propias = todas.filter((s) => s.origen !== 'global');
    switch (this.escenario()) {
      case 'largo':
        return propias.reduce((a, b) => (b.resolucionH > a.resolucionH ? b : a), propias[0]);
      case 'sin-politica':
        return todas.find((s) => s.origen === 'global') ?? this.construir('SIN-TIPO', 'LOW');
      case 'libro':
        return todas.find((s) => s.libroFecha !== null) ?? propias[0];
      default:
        return propias.find((s) => s.origen === 'especifica') ?? propias[0];
    }
  });

  protected elegir(v: string): void {
    if (v === 'conservadora' || v === 'intermedia' || v === 'creativa' || v === 'todas') this.activa.set(v);
  }
  protected elegirEscenario(v: string): void {
    if (v === 'corto' || v === 'largo' || v === 'sin-politica' || v === 'libro') this.escenario.set(v);
  }

  private inicial(): Propuesta {
    const p = this.params.get('propuesta');
    return p === 'conservadora' || p === 'intermedia' || p === 'creativa' || p === 'todas' ? p : 'todas';
  }

  private construir(tipo: string, prio: (typeof PRIORIDADES)[number]): SlaPrevisto {
    const c = this.estado.calcularPoliticaVigente(tipo, prio);
    const info = TIPOS_TICKET.find((t) => t.id === tipo);
    return {
      politica: `${c.politica.id} · v${c.politica.version}`,
      origen: c.origen,
      etiquetaOrigen: c.etiquetaOrigen,
      apertura: AHORA_BASE,
      venceRespuesta: c.venceRespuesta,
      venceResolucion: c.venceResolucion,
      respuestaH: c.politica.respuestaH,
      resolucionH: c.politica.resolucionH,
      libroFecha: info?.libro ? sumarDiasHabiles(AHORA_BASE, 15) : null,
      nombreTipo: info?.nombre ?? tipo,
    };
  }
}
