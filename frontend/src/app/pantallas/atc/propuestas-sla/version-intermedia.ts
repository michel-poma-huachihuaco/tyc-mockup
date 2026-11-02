import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AyBadge, AyCard, AyCardBody, AyCardHeader, AyStatistic } from '@aybarcorp/ui-angular';
import { AvisosSla, diaCorto, hora, type SlaPrevisto } from './sla-previsto';

/**
 * Propuesta intermedia: lo primero que se lee son las dos cifras que importan (horas para responder y
 * horas para resolver, con su fecha de vencimiento) y debajo una barra proporcional que muestra cómo se
 * reparte el plazo. La política pasa a una línea de pie.
 */
@Component({
  selector: 'app-sla-intermedia',
  standalone: true,
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AyStatistic, AvisosSla],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ay-card superficie="solid">
      <ay-card-header
        titulo="Plazos de atención (SLA)"
        subtitulo="Se fijan al guardar y no cambian aunque la política se actualice después."
        nivel="h2"
        [separador]="true"
      />
      <ay-card-body padding="sm" gap="md">
        <div class="si-cifras">
          <div class="si-cifra">
            <ay-statistic etiqueta="Para responder" [valor]="sla().respuestaH" unidad="h hábiles" size="sm" />
            <span class="si-vence">Vence {{ dia(sla().venceRespuesta) }} · {{ hora(sla().venceRespuesta) }}</span>
          </div>
          <div class="si-cifra">
            <ay-statistic etiqueta="Para resolver" [valor]="sla().resolucionH" unidad="h hábiles" size="sm" />
            <span class="si-vence">Vence {{ dia(sla().venceResolucion) }} · {{ hora(sla().venceResolucion) }}</span>
          </div>
        </div>

        <div class="si-barra" role="img" [attr.aria-label]="resumen()">
          <div class="si-tramo si-tramo--respuesta" [style.flex-grow]="sla().respuestaH">
            <span>Responder</span>
          </div>
          <div class="si-tramo si-tramo--resolucion" [style.flex-grow]="resto()">
            <span>Resolver</span>
          </div>
        </div>
        <div class="si-marcas" aria-hidden="true">
          <span>Apertura<br />{{ hora(sla().apertura) }}</span>
          <span>1.ª respuesta<br />{{ hora(sla().venceRespuesta) }}</span>
          <span>Resolución<br />{{ hora(sla().venceResolucion) }}</span>
        </div>

        <p class="si-pie">
          <ay-badge size="sm" tono="info">{{ sla().politica }}</ay-badge>
          <span>{{ sla().etiquetaOrigen }}</span>
        </p>

        <app-avisos-sla [sla]="sla()" />
      </ay-card-body>
    </ay-card>
  `,
  styles: `
    .si-cifras { display: grid; grid-template-columns: 1fr 1fr; gap: var(--aybar-space-3); }
    .si-cifra { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-3); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface-sunken); }
    .si-vence { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .si-barra { display: flex; gap: var(--aybar-space-1); height: 2rem; }
    .si-tramo { display: flex; align-items: center; justify-content: center; min-width: 4.5rem; flex-basis: 0; border-radius: var(--aybar-radius-md); font-size: var(--aybar-font-size-xs); font-weight: 600; overflow: hidden; }
    .si-tramo--respuesta { background: var(--aybar-color-bg-brand); color: var(--aybar-color-fg-on-brand); }
    .si-tramo--resolucion { background: var(--aybar-color-bg-brand-subtle); color: var(--aybar-color-fg-default); }
    .si-marcas { display: flex; justify-content: space-between; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); line-height: 1.3; }
    .si-marcas span:nth-child(2) { text-align: center; }
    .si-marcas span:last-child { text-align: end; }
    .si-pie { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); margin: 0; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
  `,
})
export class SlaIntermedia {
  readonly sla = input.required<SlaPrevisto>();
  protected readonly dia = diaCorto;
  protected readonly hora = hora;
  /** Horas de la resolución que quedan después de la 1.ª respuesta (nunca menos de 1 para que se dibuje). */
  protected readonly resto = computed(() => Math.max(this.sla().resolucionH - this.sla().respuestaH, 1));
  protected readonly resumen = computed(
    () => `Responder en ${this.sla().respuestaH} horas hábiles y resolver en ${this.sla().resolucionH}.`,
  );
}
