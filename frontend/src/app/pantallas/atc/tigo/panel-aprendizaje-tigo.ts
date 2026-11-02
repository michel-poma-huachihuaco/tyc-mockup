import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AyBadge, AyButton } from '@aybarcorp/ui-angular';
import type { PropuestaAprendizaje } from './tigo-aprendizaje';
import { TigoEstadoService } from './tigo-estado';

const ESTADO: Record<PropuestaAprendizaje['estado'], { texto: string; tono: 'warning' | 'success' | 'neutral' }> = {
  pendiente: { texto: 'Pendiente de publicar', tono: 'warning' },
  publicada: { texto: 'Publicada', tono: 'success' },
  rechazada: { texto: 'Rechazada', tono: 'neutral' },
};

/**
 * Propuestas de mejora de la guía que salen de las decisiones de los gestores (PROTOTIPO simulado, propuesta fuera
 * de la Etapa 1). Tigo no se reentrena solo: una persona revisa y el administrador funcional publica la nueva versión.
 */
@Component({
  selector: 'app-panel-aprendizaje-tigo',
  standalone: true,
  imports: [AyBadge, AyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pa" aria-labelledby="pa-t">
      <header class="pa-cab">
        <h2 id="pa-t" class="pa-h">Propuestas de Tigo para mejorar la guía</h2>
        <ay-badge size="sm" tono="warning">Propuesta de Tigo · fuera de la Etapa 1</ay-badge>
        <ay-badge size="sm" tono="neutral">Datos simulados</ay-badge>
      </header>
      <p class="pa-nota">
        Tigo no se reentrena solo: aprende de contenido que una persona revisa. Si lo publicas, el siguiente ticket usa la guía mejorada.
      </p>
      @if (!tigo.puedePublicarAprendizaje()) {
        <p class="pa-solo" role="note">Lo publica el administrador funcional. Aquí lo ves en solo lectura.</p>
      }
      @if (aviso(); as a) {
        <p class="pa-aviso" role="status">{{ a }}</p>
      }
      @for (a of tigo.propuestasAprendizaje(); track a.id) {
        <article class="pa-card" [attr.aria-label]="'Propuesta para ' + a.nombreTipo">
          <header class="pa-card-cab">
            <h3 class="pa-h3">{{ a.nombreTipo }} ({{ a.tipo }}) · guía v{{ a.guiaBase }}</h3>
            <ay-badge size="sm" [tono]="estado[a.estado].tono">{{ estado[a.estado].texto }}</ay-badge>
            @if (a.origen === 'sesion') {
              <ay-badge size="sm" tono="info">Incluye decisiones de hoy</ay-badge>
            }
          </header>
          <p class="pa-hallazgo">{{ a.hallazgo }}</p>
          <ul class="pa-chips" aria-label="Evidencia">
            <li><ay-badge size="sm" tono="success">{{ a.evidencia.aceptadas }} aceptadas</ay-badge></li>
            <li><ay-badge size="sm" tono="warning">{{ a.evidencia.editadas }} editadas</ay-badge></li>
            <li><ay-badge size="sm" tono="neutral">{{ a.evidencia.descartadas }} descartadas</ay-badge></li>
            @for (e of a.evidencia.etiquetas.slice(0, 3); track e.etiqueta) {
              <li><ay-badge size="sm" tono="info">{{ e.etiqueta }} · {{ e.veces }}</ay-badge></li>
            }
          </ul>
          <div class="pa-lado">
            <div class="pa-col">
              <h4 class="pa-h4">Plantilla actual (v{{ a.guiaBase }})</h4>
              <p class="pa-texto">{{ a.plantillaActual }}</p>
            </div>
            <div class="pa-col pa-col--nueva">
              <h4 class="pa-h4">Plantilla propuesta (v{{ a.guiaBase + 1 }}) · lo agregado va resaltado</h4>
              <p class="pa-texto">
                @let d = diferencia(a);
                {{ d.base }}
                @if (d.agregado) {
                  <mark class="pa-mark">{{ d.agregado }}</mark>
                } @else {
                  <em> (sin cambios en la plantilla)</em>
                }
              </p>
              @if (a.criterioNuevo) {
                <p class="pa-texto">Criterio nuevo: <mark class="pa-mark">{{ a.criterioNuevo }}</mark></p>
              }
            </div>
          </div>
          @if (a.estado === 'pendiente' && tigo.puedePublicarAprendizaje()) {
            <div class="pa-botones">
              <ay-button tamano="sm" (click)="publicar(a)">Publicar como guía v{{ a.guiaBase + 1 }}</ay-button>
              <ay-button tamano="sm" variante="secondary" (click)="tigo.rechazarAprendizaje(a.id)">Rechazar</ay-button>
            </div>
          } @else if (a.estado === 'pendiente') {
            <p class="pa-solo">Lo publica el administrador funcional.</p>
          } @else if (a.estado === 'publicada') {
            <p class="pa-solo">Publicada como guía v{{ a.guiaBase + 1 }}: el siguiente borrador ya la usa.</p>
          }
        </article>
      } @empty {
        <p class="pa-vacio">Aún no hay propuestas: se generan cuando los gestores editan al menos el 30 % de al menos 10 borradores.</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .pa { display: flex; flex-direction: column; gap: var(--aybar-space-3); min-width: 0; }
    .pa-cab, .pa-card-cab { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .pa-h { margin: 0; font-size: var(--aybar-font-size-md); font-weight: var(--aybar-font-weight-semibold); }
    .pa-h3 { margin: 0; font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); }
    .pa-h4 { margin: 0; font-size: var(--aybar-font-size-xs); font-weight: var(--aybar-font-weight-semibold); color: var(--aybar-color-fg-muted); }
    .pa-nota, .pa-solo, .pa-hallazgo, .pa-texto, .pa-aviso { margin: 0; font-size: var(--aybar-font-size-sm); }
    .pa-nota, .pa-solo { color: var(--aybar-color-fg-muted); }
    .pa-card { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .pa-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--aybar-space-1); }
    .pa-lado { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--aybar-space-3); }
    @media (min-width: 48rem) { .pa-lado { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .pa-col { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-2) var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); min-width: 0; }
    .pa-mark { background: var(--aybar-color-feedback-success-bg); color: var(--aybar-color-feedback-success-fg); box-shadow: inset 0 -2px 0 var(--aybar-color-feedback-success-border); padding-inline: var(--aybar-space-1); border-radius: var(--aybar-radius-sm); font-weight: var(--aybar-font-weight-semibold); }
    .pa-mark::before { content: '+ '; }
    .pa-botones { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .pa-vacio { margin: 0; padding: var(--aybar-space-4); border: var(--aybar-border-width-thin) dashed var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-sm); }
  `,
})
export class PanelAprendizajeTigo {
  protected readonly tigo = inject(TigoEstadoService);
  protected readonly estado = ESTADO;
  protected readonly aviso = signal<string | null>(null);

  /** Separa lo que la propuesta agrega a la plantilla actual para resaltarlo. */
  protected diferencia(a: PropuestaAprendizaje): { base: string; agregado: string } {
    return a.plantillaPropuesta.startsWith(a.plantillaActual)
      ? { base: a.plantillaActual, agregado: a.plantillaPropuesta.slice(a.plantillaActual.length).trim() }
      : { base: '', agregado: a.plantillaPropuesta };
  }

  protected publicar(a: PropuestaAprendizaje): void {
    const v = this.tigo.publicarAprendizaje(a.id);
    this.aviso.set(v ? `Guía ${a.tipo} v${v} publicada. El siguiente borrador de Tigo la usa.` : null);
  }
}
