import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import {
  AyBadge,
  AyButton,
  AyPageHeader,
  AySegmentedControl,
  AyStatGroup,
  AyTable,
  AyTimeline,
  type AyColumna,
  type AySegmentoOpcion,
  type AyStatItem,
  type AyTimelineEvento,
} from '@aybarcorp/ui-angular';
import { fmtFechaHora } from '../datos-atc';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import { CintaTigo } from './cinta-tigo';
import { PanelAprendizajeTigo } from './panel-aprendizaje-tigo';
import { TarjetaPropuestaTigo } from './tarjeta-propuesta-tigo';
import { TigoEstadoService, type GuionEstado } from './tigo-estado';
import { narrarPaso, resumenFinal } from './tigo-guion';
import { ETAPAS_TIGO, type EscenarioTigo, type EstadoPropuesta } from './tigo-modelo';

const ESTADO_GUION: Record<GuionEstado, string> = {
  inactivo: 'Sin escenario en curso',
  corriendo: 'Tigo está atendiendo el ticket',
  pausado: 'Escenario en pausa',
  esperando: 'Tigo espera tu decisión',
  terminado: 'Escenario terminado',
};

const ACCION_ES: Record<string, string> = {
  clasificar: 'Clasificar',
  anonimizar: 'Anonimizar',
  guardarrailes: 'Guardarraíles',
  enrutar: 'Enrutar',
  asignar: 'Asignar',
  resumir360: 'Resumir la ficha 360',
  'citar-guia': 'Citar la guía',
  'consultar-motor': 'Consultar el motor',
  'completar-actividad': 'Completar la actividad',
  redactar: 'Redactar la respuesta',
  resolver: 'Resolver',
  'confirmar-cliente': 'Confirmación del cliente',
  encuesta: 'Encuesta',
  'atender-manual': 'Pasar a atención manual',
  'chat-redactar': 'Redacción en el chat',
  'detectar-libro': 'Detectar el Libro de Reclamaciones',
  'resumir-caso': 'Resumir el caso',
  'plazo-libro': 'Calcular el plazo legal',
  'registrar-asiento': 'Registrar el asiento del Libro',
  'derivar-legal': 'Derivar a Legal',
  'redactar-acuse': 'Redactar el acuse de recibo',
  'fin-sin-cierre': 'Fin sin cierre',
  'detectar-riesgo': 'Detectar riesgo verbal',
  'escalar-legal': 'Escalar a Legal (Eje 3)',
};

const TONO_HITO: Record<EstadoPropuesta, NonNullable<AyTimelineEvento['tono']>> = {
  ejecutada: 'success',
  pendiente: 'accent',
  aprobada: 'success',
  editada: 'success',
  descartada: 'default',
  bloqueada: 'danger',
};

const SUFIJO: Partial<Record<EstadoPropuesta, string>> = {
  pendiente: ' · espera tu aprobación',
  descartada: ' · descartada',
  bloqueada: ' · bloqueada',
};

const DECISION_ES = { ACEPTADA: 'Aceptada', EDITADA: 'Editada', DESCARTADA: 'Descartada' } as const;

/**
 * Pantalla «Tigo · Atención asistida» (PROTOTIPO simulado, propuesta fuera de la Etapa 1).
 * ADR-007 / RN-SVC-032: la IA sugiere, el gestor decide. La vista solo lee los signals de
 * `TigoEstadoService` y llama a sus métodos; no guarda lógica propia.
 */
@Component({
  selector: 'app-vista-tigo',
  standalone: true,
  imports: [
    AyBadge,
    AyButton,
    AyPageHeader,
    AySegmentedControl,
    AyStatGroup,
    AyTable,
    AyTimeline,
    CintaTigo,
    PanelAprendizajeTigo,
    TarjetaPropuestaTigo,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'tecla($event)' },
  template: `
    @if (presentacion()) {
      <div class="vp" role="region" aria-label="Modo presentación de Tigo">
        <header class="vp-cab">
          <div class="vp-quien">
            <strong class="vp-esc">{{ nombreEscenario() }}</strong>
            <ay-badge tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
            <ay-badge tono="neutral">Datos simulados</ay-badge>
          </div>
          <div class="vp-ctrl">
            @if (tigo.guionEstado() === 'inactivo') {
              @for (e of escenarios; track e.id) {
                <ay-button variante="primary" (click)="tigo.iniciarEscenario(e.id)">Escenario {{ e.id }} · {{ e.titulo }}</ay-button>
              }
            } @else {
              <ay-button variante="primary" [disabled]="!puedeAvanzar()" (click)="tigo.siguientePaso()">Siguiente paso</ay-button>
              @if (tigo.guionEstado() === 'pausado') {
                <ay-button variante="secondary" (click)="tigo.reanudar()">Reanudar</ay-button>
              } @else {
                <ay-button variante="secondary" [disabled]="tigo.guionEstado() !== 'corriendo'" (click)="tigo.pausar()">Pausar</ay-button>
              }
              <ay-button variante="ghost" (click)="tigo.reiniciar()">Reiniciar</ay-button>
            }
            <ay-button variante="ghost" (click)="presentacion.set(false)">Salir</ay-button>
          </div>
        </header>

        <app-cinta-tigo [numero]="tigo.guionTicket()" [grande]="true" />

        <p class="vp-frase" aria-live="polite" aria-atomic="true">{{ frase() }}</p>

        @if (pendienteGrande(); as p) {
          <app-tarjeta-propuesta-tigo class="vp-tarjeta" [propuesta]="p" [grande]="true" />
          @if (tigo.pendientes().length > 1) {
            <p class="vp-mas">Hay {{ tigo.pendientes().length - 1 }} propuesta(s) más esperando después de esta.</p>
          }
        } @else if (tigo.guionEstado() === 'terminado') {
          <p class="vp-resumen">{{ textoResumen() }}</p>
        }

        <p class="vp-teclas">
          <span><kbd>Espacio</kbd> siguiente paso</span>
          <span><kbd>P</kbd> pausar o reanudar</span>
          <span><kbd>Esc</kbd> salir del modo</span>
        </p>
      </div>
    } @else {
    <div class="vt">
      <ay-page-header
        titulo="Tigo · Atención asistida"
        descripcion="Tigo ejecuta lo interno y reversible. Lo que sale al cliente, deriva o cierra lo decide una persona; ante un riesgo, Tigo se detiene."
      >
        <ay-badge ayAcciones tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
        <ay-button ayAcciones variante="secondary" (click)="presentacion.set(true)">Modo presentación</ay-button>
      </ay-page-header>

      <section class="vt-como" aria-labelledby="vt-como-t">
        <h2 id="vt-como-t" class="vt-h">Cómo trabaja</h2>
        <ul>
          <li>Tigo ejecuta lo interno y reversible: clasifica, anonimiza, enruta, resume y consulta.</li>
          <li>El gestor aprueba lo que sale al cliente y el cierre del ticket.</li>
          <li>Cada decisión queda registrada sin el texto, solo con su longitud (ADR-007).</li>
        </ul>
      </section>

      <section class="vt-control" aria-label="Control del escenario">
        <ul class="vt-escenarios" aria-label="Escenarios de Tigo">
          @for (e of escenarios; track e.id) {
            <li class="vt-esc" [class.vt-esc--activo]="tigo.escenario() === e.id">
              <div class="vt-esc-cab">
                <strong class="vt-esc-tit">Escenario {{ e.id }} · {{ e.titulo }}</strong>
                <ay-badge size="sm" [tono]="e.tono">{{ e.autonomia }}</ay-badge>
              </div>
              <p class="vt-esc-desc">{{ e.descripcion }}</p>
              <ay-button tamano="sm" [variante]="tigo.escenario() === e.id ? 'secondary' : 'primary'" (click)="tigo.iniciarEscenario(e.id)">
                {{ tigo.escenario() === e.id ? 'Reiniciar' : 'Iniciar' }} el escenario {{ e.id }}
              </ay-button>
            </li>
          }
        </ul>
        <div class="vt-botones">
          @if (tigo.guionEstado() === 'pausado') {
            <ay-button variante="secondary" (click)="tigo.reanudar()">Reanudar</ay-button>
          } @else {
            <ay-button variante="secondary" [disabled]="tigo.guionEstado() !== 'corriendo'" (click)="tigo.pausar()">
              Pausar
            </ay-button>
          }
          <ay-button variante="secondary" [disabled]="!puedeAvanzar()" (click)="tigo.siguientePaso()">
            Siguiente paso
          </ay-button>
          <ay-button variante="ghost" [disabled]="tigo.guionEstado() === 'inactivo'" (click)="tigo.reiniciar()">
            Reiniciar
          </ay-button>
          <ay-segmented-control
            etiqueta="Velocidad del escenario"
            size="sm"
            [opciones]="velocidades"
            [valor]="'' + tigo.velocidad()"
            (valorChange)="tigo.velocidad.set($event === '2' ? 2 : 1)"
          />
        </div>
        <p class="vt-estado" aria-live="polite">
          <strong>{{ textoEstado() }}</strong>
          @if (textoPaso(); as paso) {
            <span> · {{ paso }}</span>
          }
        </p>
        @if (tigo.guionTicket(); as num) {
          <div>
            <ay-button tamano="sm" variante="secondary" (click)="verTicket.emit(num)">Ver el ticket {{ num }}</ay-button>
          </div>
        }
      </section>

      <ay-stat-group size="md" [filete]="true" [elementos]="cifras()" />

      <div class="vt-cuerpo">
        <section class="vt-linea" aria-labelledby="vt-linea-t">
          <h2 id="vt-linea-t" class="vt-h">Acciones de Tigo</h2>
          @if (hitos().length === 0) {
            <p class="vt-vacio">Elige un escenario para ver a Tigo atender un ticket.</p>
          } @else {
            <ay-timeline agruparPorDia etiqueta="Acciones de Tigo, de la más reciente a la más antigua" [hitos]="hitos()" />
          }
        </section>

        <aside class="vt-cola" aria-labelledby="vt-cola-t">
          <h2 id="vt-cola-t" class="vt-h">Cola de aprobación ({{ tigo.pendientes().length }})</h2>
          <ay-badge size="sm" tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
          @for (p of tigo.pendientes(); track p.id) {
            <app-tarjeta-propuesta-tigo [propuesta]="p" />
          } @empty {
            <p class="vt-vacio">No hay nada esperando tu aprobación.</p>
          }
        </aside>
      </div>

      <section class="vt-guardas" aria-labelledby="vt-g-t">
        <h2 id="vt-g-t" class="vt-h">Guardarraíles</h2>
        <p class="vt-nota">En estos casos Tigo no atiende solo: prepara y deriva (Queja), o se detiene y escala (riesgo).</p>
        <ul>
          <li>
            Reclamo y Queja van al Libro de Reclamaciones: Tigo prepara y una persona decide.
            <button type="button" class="vt-enlace" (click)="tigo.iniciarEscenario('B')">Ver escenario B</button>
          </li>
          <li>
            Riesgo verbal o conflicto de Eje 3 (Legal): Tigo se detiene y escala, no actúa.
            <button type="button" class="vt-enlace" (click)="tigo.iniciarEscenario('C')">Ver escenario C</button>
          </li>
          <li>Rayo: urgencia marcada por el supervisor, la atiende una persona.</li>
          <li>Resolución de contrato: no se automatiza.</li>
        </ul>
        <p class="vt-nota-suave">
          @if (puedeIrAWorkflow()) {
            <button type="button" class="vt-enlace" (click)="abrirWorkflow('politica-tigo')">Ver autonomía de Tigo por etapa</button>
          } @else {
            Autonomía de Tigo por etapa: la configura el administrador funcional.
          }
          @if (politicaTicket(); as v) {
            <ay-badge size="sm" tono="info">Política v{{ v }} aplicada a este ticket</ay-badge>
          }
        </p>
      </section>

      <section class="vt-confianza" aria-labelledby="vt-c-t">
        <h2 id="vt-c-t" class="vt-h">Confianza de Tigo por tipo</h2>
        <p class="vt-nota">
          Datos simulados de los últimos 30 días, con las decisiones de hoy.
          <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge>
        </p>
        <ay-table
          leyenda="Aceptación sin cambios de los borradores de Tigo por tipo de ticket"
          [leyendaVisible]="false"
          [columnas]="columnasConfianza"
          [filas]="filasConfianza()"
          [rayada]="true"
        />
        <p class="vt-nota-suave">Subir el nivel de autonomía lo decide una persona; el prototipo no lo cambia.</p>
      </section>

      <section class="vt-aprendizaje" aria-labelledby="vt-a-t">
        <h2 id="vt-a-t" class="vt-h">Aprendizaje de Tigo</h2>
        <p class="vt-nota-suave">
          Tigo mejora con contenido que una persona revisa, no por su cuenta. Las propuestas se publican en Workflow › Guías.
          @if (puedeIrAWorkflow()) {
            <button type="button" class="vt-enlace" (click)="abrirWorkflow()">Abrir Workflow › Propuestas de Tigo</button>
          }
        </p>
        <app-panel-aprendizaje-tigo />
      </section>

      <section class="vt-registro" aria-labelledby="vt-r-t">
        <h2 id="vt-r-t" class="vt-h">Registro de decisiones</h2>
        @if (filasDecisiones().length) {
          <ay-table
            leyenda="Decisiones del gestor sobre las propuestas de Tigo, sin texto"
            [leyendaVisible]="false"
            [columnas]="columnas"
            [filas]="filasDecisiones()"
            [rayada]="true"
          />
        } @else {
          <p class="vt-vacio">Aún no hay decisiones. Aquí quedan registradas sin el texto del cliente.</p>
        }
      </section>
    </div>
    }
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .vp { display: flex; flex-direction: column; gap: var(--aybar-space-5); min-width: 0; padding: var(--aybar-space-4); }
    .vp-cab { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--aybar-space-3); }
    .vp-quien, .vp-ctrl { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .vp-esc { font-size: var(--aybar-font-size-xl); }
    .vp-frase { margin: 0; font-size: var(--aybar-font-size-3xl); font-weight: var(--aybar-font-weight-semibold); line-height: 1.25; min-block-size: 2.5em; overflow-wrap: anywhere; }
    .vp-tarjeta { max-inline-size: 60rem; }
    .vp-mas { margin: 0; color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-md); }
    .vp-resumen { margin: 0; padding: var(--aybar-space-4); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-feedback-success-bg); color: var(--aybar-color-feedback-success-fg); border: var(--aybar-border-width-thin) solid var(--aybar-color-feedback-success-border); font-size: var(--aybar-font-size-2xl); font-weight: var(--aybar-font-weight-semibold); }
    .vp-teclas { margin: 0; display: flex; flex-wrap: wrap; gap: var(--aybar-space-4); color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-sm); }
    kbd { padding: 0 var(--aybar-space-2); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-sm); background: var(--aybar-color-bg-surface-sunken); font: inherit; font-weight: var(--aybar-font-weight-semibold); }
    .vt { display: flex; flex-direction: column; gap: var(--aybar-space-4); min-width: 0; }
    .vt-h { margin: 0; font-size: var(--aybar-font-size-md); font-weight: var(--aybar-font-weight-semibold); }
    .vt-h3 { margin: 0; font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); color: var(--aybar-color-fg-muted); }
    .vt-como, .vt-guardas, .vt-control { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .vt-como ul, .vt-guardas ul { margin: 0; padding-inline-start: var(--aybar-space-5); display: flex; flex-direction: column; gap: var(--aybar-space-1); font-size: var(--aybar-font-size-sm); }
    .vt-nota { margin: 0; font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); }
    .vt-botones { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .vt-estado { margin: 0; font-size: var(--aybar-font-size-sm); }
    .vt-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--aybar-space-4); align-items: start; }
    @media (min-width: 64rem) { .vt-cuerpo { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); } }
    .vt-cola { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-2); min-width: 0; order: -1; }
    .vt-cola app-tarjeta-propuesta-tigo { align-self: stretch; }
    @media (min-width: 64rem) { .vt-cola { order: 0; position: sticky; inset-block-start: var(--aybar-space-3); } }
    .vt-linea { display: flex; flex-direction: column; gap: var(--aybar-space-3); min-width: 0; }
    .vt-escenarios { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--aybar-space-3); }
    @media (min-width: 64rem) { .vt-escenarios { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    .vt-esc { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-2); padding: var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface); min-width: 0; }
    .vt-esc--activo { border-color: var(--aybar-color-primary-500); border-width: var(--aybar-border-width-medium, 2px); }
    .vt-esc-cab { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-1); }
    .vt-esc-tit { font-size: var(--aybar-font-size-sm); }
    .vt-esc-desc { margin: 0; flex: 1; font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); }
    .vt-enlace { padding: 0; border: 0; background: none; color: var(--aybar-color-primary-600, var(--aybar-color-primary-500)); text-decoration: underline; cursor: pointer; font: inherit; }
    .vt-vacio { margin: 0; padding: var(--aybar-space-4); border: var(--aybar-border-width-thin) dashed var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-sm); align-self: stretch; }
    .vt-confianza, .vt-aprendizaje { display: flex; flex-direction: column; gap: var(--aybar-space-2); min-width: 0; }
    .vt-nota-suave { margin: 0; font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); }
    .vt-registro { display: flex; flex-direction: column; gap: var(--aybar-space-2); min-width: 0; }
  `,
})
export class VistaTigo {
  protected readonly tigo = inject(TigoEstadoService);
  /** Pide abrir el expediente del ticket de Tigo; la consola lo selecciona. */
  readonly verTicket = output<string>();
  /** Pide abrir Workflow (pestaña «Propuestas de Tigo»); la consola cambia de vista. */
  readonly irAWorkflow = output<void>();
  private readonly proto = inject(EstadoPrototipoAtcService);

  protected readonly puedeIrAWorkflow = computed(() => this.proto.vistasPermitidasParaRol().includes('workflow') && ['ADMIN_FUNCIONAL', 'SUPERVISOR'].includes(this.proto.rolActivo()));
  protected readonly politicaTicket = computed(() => {
    const num = this.tigo.guionTicket();
    return num ? this.tigo.politicaVersionDe(num) : null;
  });
  protected abrirWorkflow(pestana = 'propuestas-tigo'): void {
    this.tigo.pestanaWorkflowPedida.set(pestana);
    this.irAWorkflow.emit();
  }

  private nombreTipo(tipo: string): string {
    const n = this.proto.guiasPorTipo().find((g) => g.tipo === tipo)?.nombreTipo;
    return n ? `${n} (${tipo})` : tipo;
  }

  protected readonly columnasConfianza: readonly AyColumna[] = [
    { clave: 'tipo', cabecera: 'Tipo de ticket' },
    { clave: 'aceptacion', cabecera: 'Aceptación 30 d', alineacion: 'end' },
    { clave: 'n', cabecera: 'Borradores (n)', alineacion: 'end' },
    { clave: 'nivel', cabecera: 'Nivel actual' },
  ];
  /** El nivel es siempre «con aprobación» (ADR-007): ninguna fila lo cambia. */
  protected readonly filasConfianza = computed(() =>
    this.tigo.metricas().porTipo.map((f) => ({
      tipo: this.nombreTipo(f.etiqueta),
      aceptacion: f.aceptacionPct === null ? '—' : `${f.aceptacionPct} %`,
      n: String(f.total),
      nivel: 'Prepara y ejecuta con aprobación',
    })),
  );

  protected readonly velocidades: AySegmentoOpcion[] = [
    { valor: '1', etiqueta: 'x1' },
    { valor: '2', etiqueta: 'x2' },
  ];

  protected readonly escenarios: readonly {
    id: EscenarioTigo;
    titulo: string;
    descripcion: string;
    autonomia: string;
    tono: 'success' | 'warning' | 'danger';
  }[] = [
    { id: 'A', titulo: 'Consulta de cuenta', descripcion: 'Tigo atiende de punta a punta.', autonomia: 'Atiende con tu aprobación', tono: 'success' },
    {
      id: 'B',
      titulo: 'Queja',
      descripcion: 'Tigo prepara y deriva al Libro de Reclamaciones.',
      autonomia: 'Prepara; decide una persona',
      tono: 'warning',
    },
    { id: 'C', titulo: 'Riesgo verbal', descripcion: 'Tigo detecta y escala, no actúa.', autonomia: 'Se detiene y escala', tono: 'danger' },
  ];

  protected readonly columnas: readonly AyColumna[] = [
    { clave: 'hora', cabecera: 'Hora' },
    { clave: 'ticket', cabecera: 'Ticket' },
    { clave: 'accion', cabecera: 'Acción de Tigo' },
    { clave: 'decision', cabecera: 'Decisión' },
    { clave: 'longitud', cabecera: 'Longitud (caracteres)', alineacion: 'end' },
  ];

  /** Modo presentación: estado local de la vista (al salir de la pantalla vuelve a la vista normal). */
  protected readonly presentacion = signal(false);
  protected readonly nombreEscenario = computed(() => {
    const e = this.escenarios.find((x) => x.id === this.tigo.escenario());
    return e ? `Escenario ${e.id} · ${e.titulo}` : 'Tigo · Atención asistida';
  });
  /** La propuesta que espera al gestor (la primera). */
  protected readonly pendienteGrande = computed(() => this.tigo.pendientes()[0] ?? null);
  protected readonly frase = computed(() => narrarPaso(this.tigo.pendientes()[0] ?? this.tigo.propuestas().at(-1)));
  protected readonly textoResumen = computed(() => {
    const num = this.tigo.guionTicket();
    return resumenFinal(this.tigo.propuestas(), this.tigo.decisiones().filter((d) => d.ticket === num).length);
  });

  /** Atajos del modo presentación; no actúan sobre campos de texto ni sobre un botón enfocado (Espacio lo activa). */
  protected tecla(ev: KeyboardEvent): void {
    if (!this.presentacion() || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const el = (ev.composedPath()[0] ?? ev.target) as HTMLElement | null;
    if (el?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    if (ev.key === 'Escape') {
      this.presentacion.set(false);
    } else if (ev.key.toLowerCase() === 'p') {
      if (this.tigo.guionEstado() === 'pausado') this.tigo.reanudar();
      else this.tigo.pausar();
    } else if (ev.key === ' ' && !el?.closest?.('button, a, [role="button"]')) {
      ev.preventDefault();
      if (this.puedeAvanzar()) this.tigo.siguientePaso();
    }
  }

  protected readonly puedeAvanzar = computed(() => ['corriendo', 'pausado'].includes(this.tigo.guionEstado()));
  protected readonly textoEstado = computed(() => ESTADO_GUION[this.tigo.guionEstado()]);
  protected readonly textoPaso = computed(() => {
    const p = this.tigo.guionPaso();
    if (!p.total) return '';
    const etapa = ETAPAS_TIGO.find((e) => e.id === p.etapa)?.nombre;
    return `Paso ${p.indice} de ${p.total}${etapa ? ` · ${etapa}` : ''}`;
  });

  protected readonly cifras = computed<AyStatItem[]>(() => {
    const ps = this.tigo.propuestas();
    const ds = this.tigo.decisiones();
    const n = (d: string) => ds.filter((x) => x.decision === d).length;
    return [
      {
        id: 'ejecutadas',
        etiqueta: 'Acciones ejecutadas por Tigo',
        valor: String(ps.filter((p) => ['ejecutada', 'aprobada', 'editada'].includes(p.estado)).length),
      },
      { id: 'pendientes', etiqueta: 'Pendientes de aprobación', valor: String(this.tigo.pendientes().length) },
      { id: 'decisiones', etiqueta: 'Decisiones registradas', valor: String(ds.length) },
      {
        id: 'desglose',
        etiqueta: 'Aceptadas · editadas · descartadas',
        valor: `${n('ACEPTADA')} · ${n('EDITADA')} · ${n('DESCARTADA')}`,
      },
    ];
  });

  /** Acciones de Tigo, la más reciente primero; la etapa va en el autor y el día en la cabecera del kit. */
  protected readonly hitos = computed<AyTimelineEvento[]>(() =>
    this.tigo
      .propuestas()
      .map(
        (p): AyTimelineEvento => ({
          id: p.id,
          titulo: p.titulo + (SUFIJO[p.estado] ?? ''),
          fecha: p.creada,
          autor: `Tigo · ${ETAPAS_TIGO.find((e) => e.id === p.etapa)?.nombre ?? p.etapa}`,
          tono: TONO_HITO[p.estado],
        }),
      )
      .reverse(),
  );

  protected readonly filasDecisiones = computed(() =>
    this.tigo
      .decisiones()
      .map((d) => ({
        hora: fmtFechaHora(d.fecha),
        ticket: d.ticket,
        accion: ACCION_ES[d.accion] ?? d.accion,
        decision: DECISION_ES[d.decision],
        longitud: String(d.longitud),
      }))
      .reverse(),
  );
}
