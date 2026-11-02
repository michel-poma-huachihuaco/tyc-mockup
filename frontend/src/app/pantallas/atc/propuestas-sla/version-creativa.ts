import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AyBadge, AyCard, AyCardBody, AyCardHeader } from '@aybarcorp/ui-angular';
import { AvisosSla, diaCorto, diasDelPlazo, hora, type DiaDelPlazo, type Segmento, type SlaPrevisto } from './sla-previsto';

/**
 * Propuesta creativa: el plazo como un calendario de jornadas. Cada día hábil es una columna que va de las
 * 9:00 a las 18:00 y se rellena con el tiempo que consume la 1.ª respuesta y luego la resolución; los
 * fines de semana y feriados quedan como columnas estrechas rayadas. Así se ve por qué «24 horas hábiles»
 * vencen dos o tres días después, y que el plazo no cuenta de noche ni en días no hábiles.
 */
@Component({
  selector: 'app-sla-creativa',
  standalone: true,
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AvisosSla],
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
        <div class="sk-promesa">
          <span class="sk-promesa__eti">Compromiso de resolución</span>
          <strong class="sk-promesa__fecha">{{ dia(sla().venceResolucion) }} · {{ hora(sla().venceResolucion) }}</strong>
          <span class="sk-promesa__sub">
            {{ sla().resolucionH }} h hábiles · {{ dias().length }} {{ dias().length === 1 ? 'día' : 'días' }} de calendario
          </span>
        </div>

        <ol class="sk-dias" aria-label="Jornadas del plazo, de 9:00 a 18:00">
          @for (d of dias(); track d.dia.getTime(); let i = $index) {
            <li class="sk-dia" [class.sk-dia--no-habil]="!d.habil" [attr.title]="dia(d.dia) + (d.habil ? '' : ' (no hábil)')">
              <span class="sk-dia__nombre" [class.sk-dia__nombre--largo]="largo()">{{ etiqueta(d, i) }}</span>
              <div class="sk-jornada">
                @if (d.respuesta; as r) {
                  <i class="sk-seg sk-seg--respuesta" [style.top.%]="r.izq" [style.height.%]="r.ancho"></i>
                }
                @if (d.resolucion; as r) {
                  <i class="sk-seg sk-seg--resolucion" [style.top.%]="r.izq" [style.height.%]="r.ancho"></i>
                }
                @if (d.hitoRespuesta && d.respuesta) {
                  <b class="sk-hito sk-hito--respuesta" [style.top.%]="fin(d.respuesta)"></b>
                }
                @if (d.hitoResolucion && d.resolucion) {
                  <b class="sk-hito sk-hito--resolucion" [style.top.%]="fin(d.resolucion)"></b>
                }
              </div>
            </li>
          }
        </ol>
        <div class="sk-ejes" aria-hidden="true"><span>9:00</span><span>18:00</span></div>

        <ul class="sk-leyenda">
          <li>
            <i class="sk-muestra sk-seg--respuesta"></i>
            Hasta la 1.ª respuesta · {{ dia(sla().venceRespuesta) }}, {{ hora(sla().venceRespuesta) }}
            <small>({{ sla().respuestaH }} h hábiles)</small>
          </li>
          <li>
            <i class="sk-muestra sk-seg--resolucion"></i>
            Hasta la resolución · {{ dia(sla().venceResolucion) }}, {{ hora(sla().venceResolucion) }}
            <small>({{ sla().resolucionH }} h hábiles)</small>
          </li>
          <li><i class="sk-muestra sk-muestra--no-habil"></i>Noche, fin de semana o feriado: no cuenta</li>
        </ul>

        <p class="sk-pie">
          <ay-badge size="sm" tono="info">{{ sla().politica }}</ay-badge>
          <span>{{ sla().etiquetaOrigen }} · apertura {{ dia(sla().apertura) }}, {{ hora(sla().apertura) }}</span>
        </p>

        <app-avisos-sla [sla]="sla()" />
      </ay-card-body>
    </ay-card>
  `,
  styles: `
    .sk-promesa { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-3) var(--aybar-space-4); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-brand-subtle); }
    .sk-promesa__eti { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .sk-promesa__fecha { font-size: var(--aybar-font-size-lg); color: var(--aybar-color-fg-default); }
    .sk-promesa__sub { font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); }
    .sk-dias { list-style: none; margin: 0; padding: 0; display: flex; gap: var(--aybar-space-1); width: 100%; min-width: 0; }
    .sk-dia { flex: 3 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--aybar-space-1); align-items: stretch; }
    .sk-dia--no-habil { flex: 1 1 0; }
    .sk-dia__nombre { display: block; min-height: 1rem; text-align: center; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); white-space: nowrap; }
    .sk-dia__nombre--largo { width: 0; overflow: visible; text-align: left; }
    .sk-jornada { position: relative; height: 6.5rem; border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface-sunken); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); overflow: hidden; }
    .sk-dia--no-habil .sk-jornada { background: repeating-linear-gradient(-45deg, var(--aybar-color-border-subtle) 0 0.25rem, var(--aybar-color-bg-surface-sunken) 0.25rem 0.5rem); }
    .sk-seg { position: absolute; left: 0; right: 0; display: block; }
    .sk-seg--respuesta { background: var(--aybar-color-bg-brand); }
    .sk-seg--resolucion { background: var(--aybar-color-feedback-warning-border); }
    .sk-hito { position: absolute; left: 0; right: 0; height: 0.2rem; transform: translateY(-50%); background: var(--aybar-color-fg-default); }
    .sk-ejes { display: flex; justify-content: space-between; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .sk-leyenda { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .sk-leyenda li { display: flex; align-items: baseline; gap: var(--aybar-space-2); }
    .sk-leyenda small { color: var(--aybar-color-fg-muted); }
    .sk-muestra { flex: none; width: 0.75rem; height: 0.75rem; border-radius: var(--aybar-radius-sm); position: static; align-self: center; }
    .sk-muestra--no-habil { background: repeating-linear-gradient(-45deg, var(--aybar-color-border-default) 0 0.15rem, var(--aybar-color-bg-surface-sunken) 0.15rem 0.3rem); }
    .sk-pie { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); margin: 0; font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
  `,
})
export class SlaCreativa {
  readonly sla = input.required<SlaPrevisto>();
  protected readonly dia = diaCorto;
  protected readonly hora = hora;
  protected readonly dias = computed(() => diasDelPlazo(this.sla()));
  /** Con muchos días las columnas son angostas: solo se rotula el primer día y los lunes. */
  protected readonly largo = computed(() => this.dias().length > 8);
  protected etiqueta(d: DiaDelPlazo, i: number): string {
    if (!d.habil) return '';
    return !this.largo() || i === 0 || d.dia.getDay() === 1 ? d.nombre : '';
  }
  /** Posición, en % de la jornada, donde termina un tramo. */
  protected fin(s: Segmento): number {
    return s.izq + s.ancho;
  }
}
