import { ChangeDetectionStrategy, Component, type OnInit, computed, input, signal } from '@angular/core';
import {
  AyAlert,
  AyAvatar,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyFormField,
  AyIcon,
  AySegmentedControl,
  AySelect,
  AyTag,
  AyText,
  AyTextarea,
  type AyOpcionSelect,
  type AySegmentoOpcion,
} from '@aybarcorp/ui-angular';
import { CANALES_ATC, type TicketAtc } from '../datos-atc';
import { fmt } from './base';
import { crearInteraccionesMock, type InteraccionMock } from './mock-interacciones';

type Filtro = 'todo' | 'mensajes' | 'notas' | 'automatico';
type TipoNuevo = 'respuesta_agente' | 'nota_interna';

/** Un DNI (8 dígitos) o un número de tarjeta (13 a 16 dígitos) escrito a mano: lo que bloquea la regla DLP (RN-SVC-012). */
const PATRON_PII = /\b\d{8}\b|\b(?:\d[ -]?){13,16}\b/;

/**
 * Sección de interacciones del ticket con datos de prueba, como la ve el equipo (gestor o supervisor): el
 * registro completo —mensajes, notas internas, llamadas y marcas automáticas— y el formulario
 * «Registrar interacción» (HU-005).
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-registro-interacciones',
  standalone: true,
  imports: [
    AyAlert,
    AyAvatar,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyFormField,
    AyIcon,
    AySegmentedControl,
    AySelect,
    AyTag,
    AyText,
    AyTextarea,
  ],
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
      </header>

      <div class="ri-cuerpo">
        <ay-segmented-control etiqueta="Filtrar el registro" size="sm" [opciones]="filtros()" [valor]="filtro()" (valorChange)="elegirFiltro($event)" />

        <ol class="ri-lista" aria-label="Interacciones del ticket, de la más reciente a la más antigua">
          @for (e of visibles(); track e.id) {
            <li>
              <article class="ri-entrada ri-entrada--{{ e.origen }}" [class.ri-entrada--interna]="!e.visible">
                <header class="ri-entrada__cab">
                  <ay-avatar [nombre]="e.autor" size="sm" decorativo />
                  <div class="ri-entrada__quien">
                    <strong>{{ e.autor }}</strong>
                    <span>{{ e.area }} · Canal: {{ e.canal }}</span>
                  </div>
                  <time class="ri-entrada__fecha">{{ fmt(e.fecha) }}</time>
                </header>

                <div class="ri-etiquetas">
                  <ay-badge size="sm" [tono]="tonoTipo(e)">{{ textoTipo(e) }}</ay-badge>
                  <ay-badge size="sm" [tono]="e.visible ? 'info' : 'warning'">
                    @if (!e.visible) {
                      <ay-icon nombre="lock" size="16" />
                    }
                    {{ e.visible ? 'Visible al cliente' : 'Interna · oculta al cliente' }}
                  </ay-badge>
                  <ay-badge size="sm" tono="neutral">{{ textoOrigen(e) }}</ay-badge>
                </div>

                <p class="ri-entrada__texto">{{ e.texto }}</p>

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
              </article>
            </li>
          } @empty {
            <li class="ri-vacio">No hay entradas de este tipo en el registro.</li>
          }
        </ol>

        <ay-card variante="elevated" superficie="solid">
          <ay-card-header titulo="Registrar interacción" subtitulo="Queda como una entrada inmutable del caso: no se puede editar ni borrar." nivel="h3" [separador]="true" />
          <ay-card-body padding="md" gap="md">
            <div class="ri-form">
              <ay-segmented-control etiqueta="Tipo de interacción" size="sm" [opciones]="tipos" [valor]="tipoNuevo()" (valorChange)="elegirTipo($event)" />
              <ay-form-field etiqueta="Canal">
                <ay-select nombre="canal-interaccion" size="sm" [opciones]="canales" [valor]="canal()" (valorChange)="canal.set($event)" />
              </ay-form-field>
            </div>

            @if (sugerenciaIa() && tipoNuevo() === 'respuesta_agente') {
              <ay-alert tono="info" size="sm" titulo="Sugerencia del Copiloto IA (HU-048, fuera de la Etapa 1)">
                {{ sugerenciaIa() }}
                <div ayAcciones class="ri-fila">
                  <ay-button tamano="sm" variante="primary" (click)="texto.set(sugerenciaIa()!)">Usar sugerencia</ay-button>
                </div>
              </ay-alert>
            }

            <ay-form-field [etiqueta]="tipoNuevo() === 'nota_interna' ? 'Nota interna' : 'Mensaje al cliente'">
              <ay-textarea
                nombre="texto-interaccion"
                [filas]="3"
                [valor]="texto()"
                (valorChange)="texto.set($event)"
                [placeholder]="tipoNuevo() === 'nota_interna' ? 'Texto solo para el equipo…' : 'Texto del mensaje al cliente…'"
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
              </span>
              <div class="ri-fila">
                <ay-button tamano="sm" variante="secondary">Adjuntar archivo</ay-button>
                <ay-button tamano="sm" variante="primary" [disabled]="!puedeRegistrar()" (click)="registrar()">Registrar interacción</ay-button>
              </div>
            </div>
          </ay-card-body>
        </ay-card>
      </div>
    </section>
  `,
  styles: `
    .ri { display: flex; flex-direction: column; border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-xl); background: var(--aybar-color-bg-surface); overflow: hidden; }
    .ri-cab { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-3); padding: var(--aybar-space-4); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .ri-cab__txt { display: flex; flex-direction: column; gap: var(--aybar-space-1); min-width: 0; }
    .ri-cab__titulo { font-size: var(--aybar-font-size-lg); }
    .ri-cuerpo { display: flex; flex-direction: column; gap: var(--aybar-space-4); padding: var(--aybar-space-4); background: var(--aybar-color-bg-surface-sunken); }
    .ri-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-3); }
    .ri-entrada { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-left-width: 4px; border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface); }
    .ri-entrada--cliente { border-left-color: var(--aybar-color-border-strong); }
    .ri-entrada--gestor { border-left-color: var(--aybar-color-feedback-info-border); }
    .ri-entrada--sistema { border-left-color: var(--aybar-color-border-subtle); background: var(--aybar-color-bg-surface-sunken); }
    .ri-entrada--interna { border-left-color: var(--aybar-color-feedback-warning-border); border-style: dashed; border-left-style: solid; background: var(--aybar-color-feedback-warning-bg); }
    .ri-entrada__cab { display: flex; align-items: center; gap: var(--aybar-space-3); }
    .ri-entrada__quien { display: flex; flex-direction: column; min-width: 0; flex: 1; font-size: var(--aybar-font-size-sm); }
    .ri-entrada__quien span { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ri-entrada__fecha { font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ri-entrada__texto { margin: 0; font-size: var(--aybar-font-size-sm); }
    .ri-etiquetas { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .ri-adjuntos { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .ri-meta { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .ri-vacio { font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); }
    .ri-form { display: grid; grid-template-columns: auto minmax(10rem, 14rem); gap: var(--aybar-space-3); align-items: end; }
    .ri-fila { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .ri-fila--entre { justify-content: space-between; align-items: center; }
    @media (max-width: 40rem) { .ri-form { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class RegistroInteracciones implements OnInit {
  readonly ticket = input.required<TicketAtc>();
  /** Borrador del Copiloto IA para un mensaje al cliente; si falta, no se ofrece. */
  readonly sugerenciaIa = input<string | null>(null);

  protected readonly filtro = signal<Filtro>('todo');
  protected readonly tipoNuevo = signal<TipoNuevo>('respuesta_agente');
  protected readonly canal = signal<string>(CANALES_ATC[0]);
  protected readonly texto = signal('');

  /** Registro del caso. Es de prueba: lo que se registre aquí no se guarda en ningún sitio. */
  private readonly entradas = signal<InteraccionMock[]>([]);

  protected readonly tipos: AySegmentoOpcion[] = [
    { valor: 'respuesta_agente', etiqueta: 'Mensaje al cliente' },
    { valor: 'nota_interna', etiqueta: 'Nota interna' },
  ];
  protected readonly canales: AyOpcionSelect[] = CANALES_ATC.map((c) => ({ value: c, label: c }));

  /** Entradas del ticket, de la más reciente a la más antigua. */
  private readonly ordenadas = computed(() =>
    [...this.entradas()].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()),
  );

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

  protected registrar(): void {
    if (!this.puedeRegistrar()) return;
    const interna = this.tipoNuevo() === 'nota_interna';
    this.agregar({
      id: `n${Date.now()}`,
      tipo: this.tipoNuevo(),
      origen: 'gestor',
      canal: this.canal(),
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

  protected textoTipo(e: InteraccionMock): string {
    switch (e.tipo) {
      case 'mensaje_cliente': return 'Mensaje del cliente';
      case 'respuesta_agente': return 'Respuesta al cliente';
      case 'nota_interna': return e.subtipo ?? 'Nota interna';
      case 'cambio_estado': return 'Cambio de estado';
      case 'llamada': return 'Llamada';
    }
  }
  protected tonoTipo(e: InteraccionMock): 'info' | 'warning' | 'neutral' | 'success' {
    return e.tipo === 'respuesta_agente' ? 'info' : e.tipo === 'nota_interna' ? 'warning' : e.tipo === 'mensaje_cliente' ? 'success' : 'neutral';
  }
  protected textoOrigen(e: InteraccionMock): string {
    return e.origen === 'sistema' ? 'Automático' : e.origen === 'cliente' ? 'Escrito por el cliente' : 'Registrado por el equipo';
  }

  protected readonly fmt = fmt;
}

const esMensaje = (e: InteraccionMock): boolean => e.tipo === 'mensaje_cliente' || e.tipo === 'respuesta_agente';
