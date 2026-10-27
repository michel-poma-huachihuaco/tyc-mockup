import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  AyCheckbox,
  AyFormField,
  AySegmentedControl,
  AySelect,
  AyText,
  type AyOpcionSelect,
  type AySegmentoOpcion,
} from '@aybarcorp/ui-angular';
import { crearTicketsDemo, type TicketAtc } from '../datos-atc';
import { etapasDemo, pasoDemo } from './base';
import { DetalleConservadora } from './version-conservadora';
import { DetalleCreativa } from './version-creativa';
import { DetalleIntermedia } from './version-intermedia';

type Version = 'conservadora' | 'intermedia' | 'creativa';

const POR_DEFECTO = 'ALT-001204';

const DETALLE: Readonly<Record<Version, string>> = {
  conservadora: 'Mismos bloques de hoy con franja de resumen y el recorrido como línea de avance.',
  intermedia: 'Pestañas ay-tabs por tarea y ficha con SLA fija a la derecha.',
  creativa: 'Centro de mando: cifras clave del ticket, línea de avance del workflow y pestañas de interacciones, guía y bitácora. Es la que ya usa el detalle de la consola.',
};

/**
 * Página aislada para comparar las 3 propuestas del detalle de ticket con los tickets demo.
 * No toca la consola: se abre en `/detalle-propuestas`. `?v=1|2|3` elige la propuesta y `?t=<N.º>` el ticket.
 */
@Component({
  selector: 'app-vista-propuestas-detalle',
  standalone: true,
  imports: [AyCheckbox, AyFormField, AySegmentedControl, AySelect, AyText, DetalleConservadora, DetalleIntermedia, DetalleCreativa],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="vp-selector" aria-label="Propuesta del detalle de ticket">
      <ay-segmented-control
        etiqueta="Propuesta"
        size="sm"
        [opciones]="versiones"
        [valor]="activa()"
        (valorChange)="elegir($event)"
      />
      <ay-form-field etiqueta="Ticket" disposicion="horizontal">
        <ay-select nombre="ticket" size="sm" [opciones]="opcionesTicket" [valor]="numero()" (valorChange)="numero.set($event)" />
      </ay-form-field>
      <ay-form-field etiqueta="Etapas del workflow" disposicion="horizontal">
        <ay-select nombre="etapas" size="sm" [opciones]="opcionesEtapas" [valor]="'' + etapas()" (valorChange)="cambiarEtapas($event)" />
      </ay-form-field>
      @if (etapas() > 0) {
        <ay-form-field etiqueta="Actividad en curso" disposicion="horizontal">
          <ay-select nombre="paso" size="sm" [opciones]="opcionesPaso()" [valor]="'' + paso()" (valorChange)="cambiarPaso($event)" />
        </ay-form-field>
      }
      <ay-checkbox [marcado]="simularConflicto()" (marcadoChange)="simularConflicto.set($event)">
        Simular señal de conflicto (demo)
      </ay-checkbox>
      <span ayText="body" size="xs">{{ descripcion() }}</span>
    </nav>

    <main class="vp-pagina">
      @for (t of [ticket()]; track t.num) {
        @switch (activa()) {
          @case ('conservadora') { <app-detalle-conservadora [ticket]="t" /> }
          @case ('intermedia') { <app-detalle-intermedia [ticket]="t" /> }
          @case ('creativa') { <app-detalle-creativa [ticket]="t" /> }
        }
      }
    </main>
  `,
  styles: `
    .vp-selector {
      position: sticky; top: 0; z-index: 10;
      display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-4);
      padding: var(--aybar-space-3) var(--aybar-space-6);
      border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);
      background: var(--aybar-color-bg-surface);
    }
    .vp-pagina { padding: var(--aybar-space-6); max-width: 112rem; margin: 0 auto; }
  `,
})
export class VistaPropuestasDetalle {
  private readonly params = new URLSearchParams(globalThis.location?.search ?? '');
  protected readonly tickets: TicketAtc[] = crearTicketsDemo();
  protected readonly versiones: AySegmentoOpcion[] = [
    { valor: 'conservadora', etiqueta: '1 · Conservadora' },
    { valor: 'intermedia', etiqueta: '2 · Intermedia' },
    { valor: 'creativa', etiqueta: '3 · Creativa' },
  ];
  protected readonly opcionesTicket: AyOpcionSelect[] = this.tickets.map((t) => ({
    value: t.num,
    label: `${t.num} · ${t.cli}`,
  }));

  /** `?v=1|2|3` abre directamente una propuesta. */
  protected readonly activa = signal<Version>(
    ({ '2': 'intermedia', '3': 'creativa' } as Record<string, Version>)[this.params.get('v') ?? ''] ?? 'conservadora',
  );
  protected readonly numero = signal<string>(
    this.tickets.some((t) => t.num === this.params.get('t'))
      ? this.params.get('t')!
      : (this.tickets.find((t) => t.num === POR_DEFECTO) ?? this.tickets[0]!).num,
  );
  /** `?conflicto=1` marca el ticket con una señal de conflicto (HU-026) para ver el aviso y la derivación obligatoria. */
  protected readonly simularConflicto = signal(this.params.get('conflicto') === '1');
  protected readonly ticket = computed(() => {
    const t = this.tickets.find((x) => x.num === this.numero()) ?? this.tickets[0]!;
    return this.simularConflicto() ? { ...t, conflict: true } : t;
  });
  protected readonly descripcion = computed(() => DETALLE[this.activa()]);

  /** Cuántas actividades tiene el workflow en la demo: 0 es el real del prototipo (2 para este ticket). */
  protected readonly etapas = etapasDemo;
  protected readonly paso = computed(() => pasoDemo() ?? -1);
  protected readonly opcionesEtapas: AyOpcionSelect[] = [
    { value: '0', label: 'Las del prototipo (2)' },
    ...[4, 6, 8, 10, 15].map((n) => ({ value: String(n), label: `${n} actividades (ejemplo)` })),
  ];
  protected readonly opcionesPaso = computed<AyOpcionSelect[]>(() => [
    { value: '-1', label: 'La que infiere la bitácora' },
    ...Array.from({ length: this.etapas() }, (_, i) => ({ value: String(i), label: `Actividad ${i + 1}` })),
  ]);

  protected cambiarEtapas(v: string): void {
    const n = Number(v);
    etapasDemo.set(n);
    // con un flujo largo se arranca por el primer tercio, para que se vea lo hecho y lo que falta
    pasoDemo.set(n > 0 ? Math.floor(n / 3) : null);
  }
  protected cambiarPaso(v: string): void {
    pasoDemo.set(Number(v) < 0 ? null : Number(v));
  }

  protected elegir(v: string): void {
    if (v === 'conservadora' || v === 'intermedia' || v === 'creativa') this.activa.set(v);
  }
}
