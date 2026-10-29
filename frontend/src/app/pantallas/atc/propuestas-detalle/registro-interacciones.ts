import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  type OnInit,
  computed,
  afterNextRender,
  effect,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  AyAlert,
  AyAvatar,
  AyBadge,
  AyButton,
  AyFormField,
  AyIcon,
  AySegmentedControl,
  AyTag,
  AyText,
  AyTextarea,
  type AySegmentoOpcion,
} from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { fmt } from './base';
import { crearInteraccionesMock, type InteraccionMock } from './mock-interacciones';

type Filtro = 'todo' | 'mensajes' | 'notas' | 'automatico';
type TipoNuevo = 'respuesta_agente' | 'nota_interna';

/** Un DNI (8 dígitos) o un número de tarjeta (13 a 16 dígitos) escrito a mano: lo que bloquea la regla DLP (RN-SVC-012). */
const PATRON_PII = /\b\d{8}\b|\b(?:\d[ -]?){13,16}\b/;

/**
 * Registro de interacciones del ticket con datos de prueba, presentado como un hilo de chat para el equipo
 * (gestor o supervisor): el cliente a la izquierda, el equipo a la derecha, las notas internas marcadas y las
 * marcas automáticas del sistema al centro, de la más antigua a la más reciente, con el compositor abajo (HU-005).
 * Es solo la presentación: no hay chat en vivo (fuera de alcance, HU-005 y HU-065).
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-registro-interacciones',
  standalone: true,
  imports: [AyAlert, AyAvatar, AyBadge, AyButton, AyFormField, AyIcon, AySegmentedControl, AyTag, AyText, AyTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ri" aria-label="Registro de interacciones del ticket">
      <header class="ri-cab">
        <div class="ri-cab__txt">
          <strong class="ri-cab__titulo">Registro de interacciones</strong>
          <span ayText="body" size="xs">
            Historial inmutable del caso: lo que escribe el equipo, lo que escribe el cliente y lo que registra el sistema.
          </span>
        </div>
        <ay-segmented-control etiqueta="Filtrar el registro" size="sm" [opciones]="filtros()" [valor]="filtro()" (valorChange)="elegirFiltro($event)" />
      </header>

      <div #hilo class="ri-hilo" role="log" aria-live="polite" aria-label="Conversación del ticket, de la más antigua a la más reciente">
        @for (e of visibles(); track e.id) {
          @if (e.origen === 'sistema') {
            <p class="ri-sistema">
              <span>{{ e.texto }}</span>
              <time>{{ fmt(e.fecha) }}</time>
            </p>
          } @else {
            <article class="ri-msg" [class.ri-msg--equipo]="e.origen === 'gestor'">
              <ay-avatar [nombre]="e.autor" size="sm" decorativo />
              <div class="ri-burbuja" [class.ri-burbuja--equipo]="e.origen === 'gestor' && e.visible" [class.ri-burbuja--nota]="!e.visible">
                <header class="ri-burbuja__cab">
                  <strong>{{ e.autor }}</strong>
                  <span>{{ e.area }} · {{ e.canal }}</span>
                </header>
                @if (!e.visible) {
                  <ay-badge size="sm" tono="warning">
                    <ay-icon nombre="lock" size="16" />
                    {{ e.subtipo ?? 'Nota interna' }} · oculta al cliente
                  </ay-badge>
                } @else if (e.tipo === 'llamada') {
                  <ay-badge size="sm" tono="neutral">Llamada</ay-badge>
                }
                <p class="ri-burbuja__texto">{{ e.texto }}</p>
                @if (e.llamada; as ll) {
                  <span class="ri-meta">Duración {{ ll.duracion }} · {{ ll.grabacion ? 'Grabación disponible' : 'Sin grabación' }}</span>
                }
                @if (e.adjuntos?.length) {
                  <div class="ri-adjuntos">
                    @for (a of e.adjuntos; track a) {
                      <ay-tag variante="outline" size="sm"><ay-icon nombre="file" size="16" /> {{ a }}</ay-tag>
                    }
                  </div>
                }
                <time class="ri-burbuja__hora">{{ fmt(e.fecha) }}</time>
              </div>
            </article>
          }
        } @empty {
          <p class="ri-vacio">No hay entradas de este tipo en el registro.</p>
        }
      </div>

      <footer class="ri-compositor">
        <ay-segmented-control etiqueta="Tipo de interacción" size="sm" [opciones]="tipos" [valor]="tipoNuevo()" (valorChange)="elegirTipo($event)" />

        @if (sugerenciaIa() && tipoNuevo() === 'respuesta_agente') {
          <ay-alert tono="info" size="sm" titulo="Sugerencia del Copiloto IA (HU-048, fuera de la Etapa 1)">
            {{ sugerenciaIa() }}
            <div ayAcciones class="ri-fila">
              <ay-button tamano="sm" variante="primary" (click)="usarSugerencia()">Usar sugerencia</ay-button>
            </div>
          </ay-alert>
        }

        <ay-form-field [etiqueta]="tipoNuevo() === 'nota_interna' ? 'Nota interna' : 'Mensaje al cliente'">
          <ay-textarea
            #campoTexto
            nombre="texto-interaccion"
            [filas]="3"
            autoajuste
            [filasMax]="12"
            [valor]="texto()"
            (valorChange)="texto.set($event)"
            [placeholder]="tipoNuevo() === 'nota_interna' ? 'Escribe una nota solo para el equipo…' : 'Escribe un mensaje para el cliente…'"
          />
        </ay-form-field>

        @if (conPii()) {
          <ay-alert tono="warning" size="sm" titulo="No se permite PII en este campo">
            Detectamos un posible DNI o número de tarjeta. Quítalo para poder registrar la interacción (RN-SVC-012).
          </ay-alert>
        }

        <div class="ri-fila ri-fila--entre">
          <span ayText="body" size="xs">
            {{ tipoNuevo() === 'nota_interna' ? 'Visibilidad: interna, oculta al cliente.' : 'Visibilidad: visible al cliente.' }}
            Queda como entrada inmutable.
          </span>
          <div class="ri-fila">
            <ay-button tamano="sm" variante="secondary">Adjuntar archivo</ay-button>
            <ay-button tamano="sm" variante="primary" [disabled]="!puedeRegistrar()" (click)="registrar()">
              {{ tipoNuevo() === 'nota_interna' ? 'Guardar nota' : 'Enviar' }}
            </ay-button>
          </div>
        </div>
      </footer>
    </section>
  `,
  styles: `
    .ri { display: flex; flex-direction: column; border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-xl); background: var(--aybar-color-bg-surface); overflow: hidden; }
    .ri-cab { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-3); padding: var(--aybar-space-4); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .ri-cab__txt { display: flex; flex-direction: column; gap: var(--aybar-space-1); min-width: 0; }
    .ri-cab__titulo { font-size: var(--aybar-font-size-lg); }
    .ri-hilo { display: flex; flex-direction: column; gap: var(--aybar-space-3); max-height: 34rem; overflow-y: auto; padding: var(--aybar-space-4); background: var(--aybar-color-bg-surface-sunken); }
    .ri-msg { display: flex; align-items: flex-end; gap: var(--aybar-space-2); }
    .ri-msg--equipo { flex-direction: row-reverse; }
    .ri-burbuja { display: flex; flex-direction: column; gap: var(--aybar-space-1); max-width: min(34rem, 80%); padding: var(--aybar-space-2) var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); border-end-start-radius: var(--aybar-radius-sm); background: var(--aybar-color-bg-surface); }
    .ri-msg--equipo .ri-burbuja { border-end-start-radius: var(--aybar-radius-lg); border-end-end-radius: var(--aybar-radius-sm); }
    .ri-burbuja--equipo { background: var(--aybar-color-bg-brand-subtle); border-color: var(--aybar-color-bg-brand); }
    .ri-burbuja--nota { background: var(--aybar-color-feedback-warning-bg); border-color: var(--aybar-color-feedback-warning-border); border-style: dashed; }
    .ri-burbuja__cab { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .ri-burbuja__cab span { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ri-burbuja__texto { margin: 0; font-size: var(--aybar-font-size-sm); white-space: pre-wrap; }
    .ri-burbuja__hora { align-self: flex-end; font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ri-sistema { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--aybar-space-2); margin: 0; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); text-align: center; }
    .ri-sistema span { padding: var(--aybar-space-1) var(--aybar-space-3); border-radius: var(--aybar-radius-full); background: var(--aybar-color-bg-surface); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .ri-sistema time { align-self: center; font-family: var(--aybar-family-mono); }
    .ri-adjuntos { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .ri-meta { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ri-vacio { margin: 0; font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); text-align: center; }
    .ri-compositor { display: flex; flex-direction: column; gap: var(--aybar-space-3); padding: var(--aybar-space-4); border-top: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); background: var(--aybar-color-bg-surface); }
    .ri-fila { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .ri-fila--entre { justify-content: space-between; align-items: center; }
  `,
})
export class RegistroInteracciones implements OnInit {
  readonly ticket = input.required<TicketAtc>();
  /** Borrador del Copiloto IA para un mensaje al cliente; si falta, no se ofrece. */
  readonly sugerenciaIa = input<string | null>(null);

  private readonly injector = inject(Injector);
  private readonly campoTexto = viewChild('campoTexto', { read: ElementRef<HTMLElement> });
  private readonly hilo = viewChild<ElementRef<HTMLElement>>('hilo');
  protected readonly filtro = signal<Filtro>('todo');
  protected readonly tipoNuevo = signal<TipoNuevo>('respuesta_agente');
  protected readonly texto = signal('');

  /** Registro del caso. Es de prueba: lo que se registre aquí no se guarda en ningún sitio. */
  private readonly entradas = signal<InteraccionMock[]>([]);

  protected readonly tipos: AySegmentoOpcion[] = [
    { valor: 'respuesta_agente', etiqueta: 'Mensaje al cliente' },
    { valor: 'nota_interna', etiqueta: 'Nota interna' },
  ];

  /** Entradas del ticket como en un chat: de la más antigua a la más reciente. */
  private readonly ordenadas = computed(() =>
    [...this.entradas()].sort((a, b) => a.fecha.getTime() - b.fecha.getTime()),
  );

  constructor() {
    // el hilo se abre en lo último, como un chat, y baja solo cuando llega una entrada nueva
    effect(() => {
      this.visibles();
      setTimeout(() => {
        const el = this.hilo()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  ngOnInit(): void {
    this.entradas.set(crearInteraccionesMock(this.ticket()));
  }

  /** Lo que ve el equipo: sin las asignaciones, que viven en la bitácora de asignaciones (HU-007). */
  private readonly delEquipo = computed(() => this.ordenadas().filter((x) => !x.asignacion));

  protected readonly filtros = computed<AySegmentoOpcion[]>(() => {
    const e = this.delEquipo();
    return [
      { valor: 'todo', etiqueta: 'Todo', recuento: e.length },
      { valor: 'mensajes', etiqueta: 'Mensajes', recuento: e.filter(esMensaje).length },
      { valor: 'notas', etiqueta: 'Notas internas', recuento: e.filter((x) => x.tipo === 'nota_interna').length },
      { valor: 'automatico', etiqueta: 'Automático', recuento: e.filter((x) => x.origen === 'sistema').length },
    ];
  });

  protected readonly visibles = computed(() => {
    const f = this.filtro();
    const e = this.delEquipo();
    if (f === 'mensajes') return e.filter(esMensaje);
    if (f === 'notas') return e.filter((x) => x.tipo === 'nota_interna');
    if (f === 'automatico') return e.filter((x) => x.origen === 'sistema');
    return e;
  });

  protected readonly conPii = computed(() => PATRON_PII.test(this.texto()));
  protected readonly puedeRegistrar = computed(() => this.texto().trim().length > 0 && !this.conPii());

  protected elegirFiltro(v: string): void {
    if (v === 'todo' || v === 'mensajes' || v === 'notas' || v === 'automatico') this.filtro.set(v);
  }
  protected elegirTipo(v: string): void {
    if (v === 'respuesta_agente' || v === 'nota_interna') this.tipoNuevo.set(v);
  }

  /** Inserta el borrador del Copiloto y deja el cursor al final para que el operador lo revise. */
  protected usarSugerencia(): void {
    this.texto.set(this.sugerenciaIa() ?? '');
    afterNextRender(() => {
      const ta = this.campoTexto()?.nativeElement.querySelector('textarea');
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
      ta.scrollTop = ta.scrollHeight;
    }, { injector: this.injector });
  }

  protected registrar(): void {
    if (!this.puedeRegistrar()) return;
    const interna = this.tipoNuevo() === 'nota_interna';
    this.agregar({
      id: `n${Date.now()}`,
      tipo: this.tipoNuevo(),
      origen: 'gestor',
      canal: this.ticket().ch,
      visible: !interna,
      autor: 'Tú (prueba)',
      area: this.ticket().area,
      fecha: new Date(),
      texto: this.texto().trim(),
    });
    this.texto.set('');
  }

  private agregar(e: InteraccionMock): void {
    this.entradas.update((l) => [...l, e]);
  }

  protected readonly fmt = fmt;
}

const esMensaje = (e: InteraccionMock): boolean => e.tipo === 'mensaje_cliente' || e.tipo === 'respuesta_agente';
