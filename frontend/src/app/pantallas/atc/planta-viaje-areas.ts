import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AyBadge, AyText } from '@aybarcorp/ui-angular';

/**
 * Las 13 áreas de la organización, agrupadas, por las que viajan los tickets en la Planta de Operación en Vivo.
 * Es propia de este panel: no reemplaza ni modifica las salas del 3D ni el catálogo de áreas del resto de la consola.
 */
interface AreaViaje {
  readonly id: string;
  readonly nombre: string;
}

interface GrupoViaje {
  readonly nombre: string;
  readonly areas: readonly AreaViaje[];
}

const GRUPOS: readonly GrupoViaje[] = [
  {
    nombre: 'Datos, IA, Tecnología y Ciberseguridad',
    areas: [{ id: 'datos', nombre: 'Datos, IA, Tecnología y Ciberseguridad' }],
  },
  {
    nombre: 'Gobierno y Control Institucional',
    areas: [
      { id: 'riesgo', nombre: 'Gobierno, Riesgo y Cumplimiento' },
      { id: 'legal', nombre: 'Legal y Asuntos Públicos' },
      { id: 'finanzas', nombre: 'Finanzas y Capital' },
    ],
  },
  {
    nombre: 'Habilitación y Resiliencia Corporativa',
    areas: [
      { id: 'talento', nombre: 'Talento, Conocimiento y Cultura' },
      { id: 'logistica', nombre: 'Logística, Abastecimiento y Activos' },
      { id: 'seguridad', nombre: 'Seguridad Integral y Control Territorial' },
    ],
  },
  {
    nombre: 'Mercado, Cliente y Posicionamiento',
    areas: [
      { id: 'comercial', nombre: 'Comercial y Activación' },
      { id: 'experiencia', nombre: 'Experiencia al Cliente' },
      { id: 'comunicaciones', nombre: 'Comunicaciones, Marca y Vocería' },
    ],
  },
  {
    nombre: 'Producción y Transformación Física',
    areas: [
      { id: 'proyectos', nombre: 'Proyectos y Construcción' },
      { id: 'diseno', nombre: 'Diseño Físico Urbano y Paisajismo' },
      { id: 'industrial', nombre: 'Industrial, Planta y Talleres' },
    ],
  },
];

const NOMBRE_AREA: ReadonlyMap<string, string> = new Map(GRUPOS.flatMap((g) => g.areas.map((a) => [a.id, a.nombre] as const)));

/** Recorridos de ejemplo: por qué áreas pasa un ticket de cada tipo, de la primera atención al cierre. */
const RUTAS: readonly { readonly motivo: string; readonly ruta: readonly string[] }[] = [
  { motivo: 'Reclamo por entrega de minuta', ruta: ['experiencia', 'legal', 'proyectos', 'experiencia'] },
  { motivo: 'Cobro y estado de cuenta', ruta: ['experiencia', 'finanzas', 'experiencia'] },
  { motivo: 'Incidencia de infraestructura urbana', ruta: ['experiencia', 'diseno', 'industrial', 'experiencia'] },
  { motivo: 'Incidente de seguridad en el proyecto', ruta: ['seguridad', 'logistica', 'proyectos'] },
  { motivo: 'Acceso o dato del cliente', ruta: ['experiencia', 'datos', 'experiencia'] },
  { motivo: 'Queja pública en medios', ruta: ['comunicaciones', 'legal', 'riesgo'] },
  { motivo: 'Visita y activación comercial', ruta: ['comercial', 'proyectos', 'comercial'] },
  { motivo: 'Solicitud de personal de apoyo', ruta: ['logistica', 'talento'] },
];

interface TicketViaje {
  readonly id: string;
  readonly motivo: string;
  readonly ruta: readonly string[];
  /** Posición en la ruta; igual a `ruta.length` cuando el ticket ya terminó su viaje. */
  readonly paso: number;
  /** Cuántos pasos del reloj lleva en el área actual. */
  readonly espera: number;
  /** Cuántos pasos del reloj debe quedarse en el área actual. */
  readonly permanencia: number;
}

interface EventoViaje {
  readonly id: number;
  readonly texto: string;
}

const TICKETS_EN_VIAJE = 9;
const MS_POR_PASO = 1600;

/**
 * Viaje de tickets por las áreas de la organización, en la Planta de Operación en Vivo. Cada ticket de ejemplo
 * entra por su primer área, se queda un rato en cada una y pasa a la siguiente hasta terminar su ruta; al terminar
 * entra otro. Es una simulación con datos de ejemplo: no lee ni escribe tickets reales.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-planta-viaje-areas',
  standalone: true,
  imports: [AyBadge, AyText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pv" aria-label="Viaje de los tickets por las áreas">
      <header class="pv-cab">
        <div class="pv-cab__txt">
          <strong>Viaje de los tickets por las áreas</strong>
          <span ayText="body" size="xs">Cada ticket pasa por las áreas que le corresponden, desde su primera atención hasta el cierre.</span>
        </div>
        <div class="pv-cab__cifras">
          <ay-badge size="sm" tono="info">{{ enViaje() }} en viaje</ay-badge>
          <ay-badge size="sm" tono="neutral">{{ derivaciones() }} derivaciones</ay-badge>
          <ay-badge size="sm" tono="success">{{ terminados() }} terminados</ay-badge>
        </div>
      </header>

      <div class="pv-grupos">
        @for (g of grupos; track g.nombre) {
          <section class="pv-grupo" [attr.aria-label]="'Grupo ' + g.nombre">
            <h3 class="pv-grupo__nombre">{{ g.nombre }}</h3>
            <ul class="pv-areas">
              @for (a of g.areas; track a.id) {
                <li class="pv-area" [class.pv-area--activa]="presentes()[a.id]?.length" [class.pv-area--llega]="llegada() === a.id">
                  <span class="pv-area__nombre">{{ a.nombre }}</span>
                  <span class="pv-area__chips">
                    @for (t of presentes()[a.id] ?? []; track t.id) {
                      <span class="pv-chip" [attr.title]="t.motivo">{{ t.id }}</span>
                    } @empty {
                      <span class="pv-area__vacia">Sin tickets</span>
                    }
                  </span>
                </li>
              }
            </ul>
          </section>
        }
      </div>

      <ul class="pv-eventos" aria-label="Últimos viajes" aria-live="off">
        @for (e of eventos(); track e.id) {
          <li>{{ e.texto }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    .pv { display: flex; flex-direction: column; gap: var(--aybar-space-3); padding: var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-xl); background: var(--aybar-color-bg-surface); }
    .pv-cab { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-3); }
    .pv-cab__txt { display: flex; flex-direction: column; gap: var(--aybar-space-1); min-inline-size: 0; }
    .pv-cab__cifras { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .pv-grupos { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--aybar-space-3); }
    .pv-grupo { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface-sunken); }
    .pv-grupo__nombre { margin: 0; font-size: var(--aybar-font-size-xs); font-weight: var(--aybar-font-weight-bold); letter-spacing: var(--aybar-font-tracking-wide); text-transform: uppercase; color: var(--aybar-color-fg-muted); }
    .pv-areas { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-2); }
    .pv-area { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-2) var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface); transition: border-color 0.3s, background-color 0.3s; }
    .pv-area--activa { border-color: var(--aybar-color-feedback-info-border); }
    .pv-area--llega { animation: pv-llega 1.2s ease-out; }
    .pv-area__nombre { font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); }
    .pv-area__chips { display: flex; flex-wrap: wrap; gap: var(--aybar-space-1); min-block-size: 1.25rem; }
    .pv-area__vacia { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .pv-chip { padding: 0 var(--aybar-space-2); border-radius: var(--aybar-radius-full); background: var(--aybar-color-feedback-info-bg); color: var(--aybar-color-feedback-info-fg); font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); }
    .pv-eventos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-1); font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .pv-eventos li:first-child { color: var(--aybar-color-fg-default); }
    @keyframes pv-llega { from { background: var(--aybar-color-feedback-info-bg); } to { background: var(--aybar-color-bg-surface); } }
    @media (prefers-reduced-motion: reduce) { .pv-area--llega { animation: none; } }
  `,
})
export class PlantaViajeAreasComponent {
  protected readonly grupos = GRUPOS;
  private contador = 2040;
  private idEvento = 0;
  private rutaSiguiente = 0;

  private readonly tickets = signal<readonly TicketViaje[]>(this.semilla());
  protected readonly eventos = signal<readonly EventoViaje[]>([]);
  protected readonly derivaciones = signal(0);
  protected readonly terminados = signal(0);
  /** Área a la que acaba de llegar un ticket, para resaltarla un instante. */
  protected readonly llegada = signal<string | null>(null);

  protected readonly enViaje = computed(() => this.tickets().filter((t) => t.paso < t.ruta.length).length);
  /** Tickets presentes hoy en cada área. */
  protected readonly presentes = computed(() => {
    const mapa: Record<string, TicketViaje[]> = {};
    for (const t of this.tickets()) {
      const area = t.ruta[t.paso];
      if (area) (mapa[area] ??= []).push(t);
    }
    return mapa;
  });

  constructor() {
    const reloj = setInterval(() => this.avanzar(), MS_POR_PASO);
    inject(DestroyRef).onDestroy(() => clearInterval(reloj));
  }

  /** Los primeros tickets ya van repartidos por las áreas, para que no empiece vacío. */
  private semilla(): TicketViaje[] {
    return Array.from({ length: TICKETS_EN_VIAJE }, (_, i) => {
      const nuevo = this.nuevoTicket();
      const paso = i % nuevo.ruta.length;
      return { ...nuevo, paso, espera: i % 3 };
    });
  }

  private nuevoTicket(): TicketViaje {
    const r = RUTAS[this.rutaSiguiente++ % RUTAS.length]!;
    return {
      id: `TK-${++this.contador}`,
      motivo: r.motivo,
      ruta: r.ruta,
      paso: 0,
      espera: 0,
      permanencia: 2 + (this.contador % 3),
    };
  }

  private avanzar(): void {
    const nuevos: EventoViaje[] = [];
    let llega: string | null = null;
    let derivados = 0;
    let terminados = 0;
    const siguiente = this.tickets().map((t): TicketViaje | null => {
      if (t.paso >= t.ruta.length) return null;
      if (t.espera + 1 < t.permanencia) return { ...t, espera: t.espera + 1 };
      const paso = t.paso + 1;
      const desde = NOMBRE_AREA.get(t.ruta[t.paso]!)!;
      if (paso >= t.ruta.length) {
        terminados++;
        nuevos.push(this.evento(`${t.id} · ${t.motivo}: cierra en ${desde}`));
        return { ...t, paso, espera: 0 };
      }
      derivados++;
      llega = t.ruta[paso]!;
      nuevos.push(this.evento(`${t.id} · ${desde} → ${NOMBRE_AREA.get(llega)}`));
      return { ...t, paso, espera: 0, permanencia: 2 + ((this.contador + paso) % 3) };
    });
    // el ticket que terminó sale de la planta y entra otro nuevo por su primera área
    const vivos = siguiente.filter((t): t is TicketViaje => t !== null);
    while (vivos.length < TICKETS_EN_VIAJE + 2 && vivos.filter((t) => t.paso < t.ruta.length).length < TICKETS_EN_VIAJE) {
      const nuevo = this.nuevoTicket();
      vivos.push(nuevo);
      nuevos.push(this.evento(`${nuevo.id} · ${nuevo.motivo}: entra por ${NOMBRE_AREA.get(nuevo.ruta[0]!)}`));
    }
    this.tickets.set(vivos);
    if (nuevos.length) this.eventos.update((l) => [...nuevos.reverse(), ...l].slice(0, 6));
    if (derivados) this.derivaciones.update((n) => n + derivados);
    if (terminados) this.terminados.update((n) => n + terminados);
    this.llegada.set(llega);
  }

  private evento(texto: string): EventoViaje {
    return { id: ++this.idEvento, texto };
  }
}
