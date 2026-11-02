import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AyBadge, AyCard, AyCardBody, AyCardHeader } from '@aybarcorp/ui-angular';
import { AvisosSla, fecha, type SlaPrevisto } from './sla-previsto';

/**
 * Propuesta conservadora: la misma card de hoy, con el mismo contenido y los mismos componentes, pero
 * ordenada como una lista de tres filas (qué, cuándo, en cuántas horas) en vez de pares apilados, y con la
 * política y su origen arriba como una sola línea.
 */
@Component({
  selector: 'app-sla-conservadora',
  standalone: true,
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AvisosSla],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ay-card superficie="solid">
      <ay-card-header
        titulo="Plazos de atención (SLA)"
        subtitulo="Se fijan al guardar con la política vigente y no cambian aunque la política se actualice después."
        nivel="h2"
        [separador]="true"
      />
      <ay-card-body padding="sm" gap="sm">
        <p class="sc-politica">
          <ay-badge size="sm" tono="info">{{ sla().politica }}</ay-badge>
          <span>{{ sla().etiquetaOrigen }}</span>
        </p>

        <dl class="sc-lista">
          <div class="sc-fila">
            <dt>Apertura</dt>
            <dd>{{ fecha(sla().apertura) }}</dd>
          </div>
          <div class="sc-fila">
            <dt>1.ª respuesta</dt>
            <dd>
              {{ fecha(sla().venceRespuesta) }}
              <small>{{ sla().respuestaH }} h hábiles</small>
            </dd>
          </div>
          <div class="sc-fila">
            <dt>Resolución</dt>
            <dd>
              {{ fecha(sla().venceResolucion) }}
              <small>{{ sla().resolucionH }} h hábiles</small>
            </dd>
          </div>
        </dl>

        <app-avisos-sla [sla]="sla()" />
      </ay-card-body>
    </ay-card>
  `,
  styles: `
    .sc-politica { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); margin: 0; font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); }
    .sc-lista { margin: 0; display: flex; flex-direction: column; }
    .sc-fila { display: grid; grid-template-columns: 7.5rem 1fr; gap: var(--aybar-space-3); padding: var(--aybar-space-2) 0; border-top: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); font-size: var(--aybar-font-size-sm); }
    .sc-fila:first-child { border-top: 0; }
    .sc-fila dt { color: var(--aybar-color-fg-muted); }
    .sc-fila dd { margin: 0; display: flex; flex-direction: column; gap: var(--aybar-space-1); color: var(--aybar-color-fg-default); font-weight: 600; }
    .sc-fila small { font-weight: 400; color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-xs); }
  `,
})
export class SlaConservadora {
  readonly sla = input.required<SlaPrevisto>();
  protected readonly fecha = fecha;
}
