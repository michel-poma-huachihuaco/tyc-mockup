import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AyBadge, AyButton, AyStepper } from '@aybarcorp/ui-angular';
import type { DetalleDemo } from './base';

/**
 * Recorrido del workflow como **línea de avance**, igual en las tres propuestas y para cualquier número de
 * actividades: «Actividad 4 de 10», su responsable y horas, y una línea cortada en tantos tramos como
 * actividades tiene el workflow (completada, en curso o pendiente). Un botón despliega
 * la lista de todas las actividades con la que está en curso resaltada (`ay-stepper` vertical).
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-recorrido-flujo',
  standalone: true,
  imports: [AyBadge, AyButton, AyStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rf" aria-label="Recorrido del workflow del ticket">
      <div class="rf-cab">
        <div class="rf-actual">
          <strong>Actividad {{ enCurso() }} de {{ total() }}</strong>
          <span>{{ actividad().nombre }}</span>
          <span class="rf-meta">{{ actividad().responsable }} · {{ actividad().horas }} h</span>
          @if (terminado()) {
            <ay-badge size="sm" tono="success">Workflow completado</ay-badge>
          } @else {
            <ay-badge size="sm" tono="warning">En curso: falta completarla</ay-badge>
          }
        </div>
        <div class="rf-botones">
          @if (conAccion() && !terminado()) {
            <ay-button
              tamano="sm"
              variante="secondary"
              [disabled]="!puedeCompletar()"
              [attr.title]="puedeCompletar() ? null : 'Con la señal de conflicto activa, el último paso se completa en Legal (Eje 3)'"
              (click)="completar.emit()"
            >
              {{ enCurso() === total() ? 'Completar la última actividad y resolver' : 'Completar actividad ' + enCurso() }}
            </ay-button>
          }
          <ay-button tamano="sm" variante="ghost" (click)="verTodas.set(!verTodas())">
            {{ verTodas() ? 'Ocultar las actividades' : 'Ver las ' + total() + ' actividades' }}
          </ay-button>
        </div>
      </div>

      <div class="rf-avance">
        <ol class="rf-tramos" aria-label="Avance del workflow: una división por actividad">
          @for (t of tramos(); track t.indice) {
            <li class="rf-tramo rf-tramo--{{ t.estado }}" [attr.title]="t.indice + '. ' + t.nombre + ' (' + t.texto + ')'">
              <span class="rf-solo-lector">Actividad {{ t.indice }}, {{ t.nombre }}: {{ t.texto }}</span>
            </li>
          }
        </ol>
        <div class="rf-detalle">
          <span>{{ textoFalta() }}</span>
          <span>{{ avance() }}%</span>
        </div>
        <ul class="rf-leyenda" aria-label="Leyenda de la línea de avance">
          <li><span class="rf-muestra rf-muestra--hecha"></span>Completada</li>
          <li><span class="rf-muestra rf-muestra--actual"></span>En curso: aún falta</li>
          <li><span class="rf-muestra rf-muestra--pendiente"></span>Pendiente de iniciar</li>
        </ul>
      </div>

      @if (verTodas()) {
        <ay-stepper
          etiqueta="Actividades del workflow del ticket (el prototipo no registra la actividad en curso: se infiere de la bitácora)"
          orientacion="vertical"
          [pasos]="d().pasosStepper()"
          [actual]="d().pasoStepper()"
        />
      }
    </section>
  `,
  styles: `
    .rf { display: flex; flex-direction: column; gap: var(--aybar-space-3); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .rf-cab { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-3); }
    .rf-actual { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--aybar-space-2); min-width: 0; font-size: var(--aybar-font-size-sm); }
    .rf-botones { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .rf-avance { display: flex; flex-direction: column; gap: var(--aybar-space-1); }
    .rf-tramos { list-style: none; margin: var(--aybar-space-2) 0 0; padding: 0; display: flex; gap: var(--aybar-space-1); }
    .rf-tramo { position: relative; flex: 1 1 0; min-width: 0; height: 0.75rem; border-radius: var(--aybar-radius-full); background: var(--aybar-color-border-subtle); }
    .rf-tramo--hecha { background: var(--aybar-color-feedback-warning-border); }
    .rf-tramo--actual { background: repeating-linear-gradient(-45deg, var(--aybar-color-feedback-warning-border) 0 0.3rem, var(--aybar-color-feedback-warning-bg) 0.3rem 0.6rem); }
    .rf-tramo--actual::before { content: ''; position: absolute; left: 50%; top: -0.55rem; transform: translateX(-50%); border-left: 0.3rem solid transparent; border-right: 0.3rem solid transparent; border-top: 0.4rem solid var(--aybar-color-feedback-warning-border); }
    .rf-leyenda { list-style: none; margin: var(--aybar-space-1) 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--aybar-space-4); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .rf-leyenda li { display: inline-flex; align-items: center; gap: var(--aybar-space-1); }
    .rf-muestra { display: inline-block; width: 1.25rem; height: 0.5rem; border-radius: var(--aybar-radius-full); }
    .rf-muestra--hecha { background: var(--aybar-color-feedback-warning-border); }
    .rf-muestra--actual { background: repeating-linear-gradient(-45deg, var(--aybar-color-feedback-warning-border) 0 0.3rem, var(--aybar-color-feedback-warning-bg) 0.3rem 0.6rem); }
    .rf-muestra--pendiente { background: var(--aybar-color-border-subtle); }
    .rf-detalle { display: flex; justify-content: space-between; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .rf-solo-lector { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .rf-meta { color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-xs); }
  `,
})
export class RecorridoFlujo {
  readonly d = input.required<DetalleDemo>();
  /** Muestra el botón para completar la actividad en curso (en la consola; las propuestas viejas no lo traen). */
  readonly conAccion = input(false);
  readonly completar = output<void>();
  protected readonly verTodas = signal(false);

  protected readonly total = computed(() => this.d().flujo().pasos.length);
  /** Número de la actividad en curso, desde 1; un ticket cerrado queda en la última. */
  protected readonly enCurso = computed(() => this.d().pasoStepper() + 1);
  protected readonly completadas = computed(() => this.d().pasoActual());
  protected readonly terminado = computed(() => this.completadas() >= this.total());
  /** La última actividad cierra el ticket: no se puede completar con una señal de conflicto sin entregar a Legal. */
  protected readonly puedeCompletar = computed(() => !(this.enCurso() === this.total() && this.d().cierreBloqueado()));
  protected readonly pendientes = computed(() => Math.max(this.total() - this.enCurso(), 0));
  /** Dice dónde estamos y qué falta: no es lo mismo estar en la actividad 1 que tenerla completa. */
  protected readonly textoFalta = computed(() => {
    if (this.terminado()) return 'Todas las actividades están completadas';
    const resto = this.pendientes() > 0 ? ` · ${this.pendientes()} por iniciar` : '';
    return `${this.completadas()} de ${this.total()} completadas · falta completar la actividad ${this.enCurso()}${resto}`;
  });
  protected readonly avance = computed(() => Math.round((this.completadas() / Math.max(this.total(), 1)) * 100));
  /** Un tramo por actividad: las anteriores a la en curso están completadas. */
  protected readonly tramos = computed(() =>
    this.d().flujo().pasos.map((p, i) => {
      const estado = i < this.completadas() ? 'hecha' : i === this.d().pasoStepper() ? 'actual' : 'pendiente';
      return {
        indice: i + 1,
        nombre: p.nombre,
        estado,
        texto: estado === 'hecha' ? 'completada' : estado === 'actual' ? 'en curso' : 'pendiente',
      };
    }),
  );
  protected readonly actividad = computed(
    () => this.d().flujo().pasos[this.d().pasoStepper()] ?? { nombre: '', responsable: '', horas: 0 },
  );
}
