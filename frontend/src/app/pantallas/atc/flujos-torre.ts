import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AyAvatar, AyBadge, AyProgressBar } from '@aybarcorp/ui-angular';
import { AREAS_ATC } from './datos-atc';
import type { FlujoTipoConfig } from './estado-prototipo-atc';

/** Meta corporativa de cierre end-to-end (la misma del tablero de la Torre). */
const SLA_E2E_HORAS = 72;

interface SalaArea {
  readonly area: string;
  readonly flujos: readonly FlujoTipoConfig[];
}

/**
 * Flujos activos por área resolutora, como una planta de operaciones: una sala por área y,
 * dentro, una pista por flujo con sus estaciones (pasos) y el relevo entre responsables.
 * Solo lectura: los flujos se editan en Configuración.
 */
@Component({
  selector: 'app-flujos-torre',
  standalone: true,
  imports: [AyAvatar, AyBadge, AyProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./flujos-torre.css', './flujos-torre-codo.css'],
  template: `
    <div class="ft">
      @for (sala of salas(); track sala.area) {
        <section class="ft__sala" [attr.aria-labelledby]="'ft-sala-' + sala.area">
          <header class="ft__sala-cab">
            <h3 class="ft__sala-nombre" [id]="'ft-sala-' + sala.area">{{ sala.area }}</h3>
            <ay-badge size="sm" tono="neutral">
              {{ sala.flujos.length }} {{ sala.flujos.length === 1 ? 'flujo' : 'flujos' }}
            </ay-badge>
          </header>

          <div class="ft__pistas">
            @for (f of sala.flujos; track f.tipo) {
              <article class="ft__flujo">
                <div class="ft__cab">
                  <header class="ft__flujo-cab">
                    <h4 class="ft__flujo-nombre">{{ f.nombreTipo }}</h4>
                    <ay-badge size="sm" tono="info">{{ f.tipo }}</ay-badge>
                    <ay-badge size="sm" tono="neutral">v{{ f.versionActual }}</ay-badge>
                  </header>
                  <ay-progress-bar
                    size="sm"
                    etiqueta="Horas frente al SLA E2E"
                    [valor]="porcentaje(f)"
                    [detalle]="horasTotales(f) + ' h de ' + sla + ' h'"
                    [tono]="horasTotales(f) > sla ? 'danger' : 'brand'"
                  />
                </div>

                <ol class="ft__pista">
                  @for (p of f.pasos; track $index; let i = $index; let ultimo = $last) {
                    <li class="ft__paso">
                      <div class="ft__estacion">
                        <span class="ft__num" aria-hidden="true">{{ i + 1 }}</span>
                        <p class="ft__estacion-nombre" [attr.title]="p.nombre">{{ p.nombre }}</p>
                        <div class="ft__resp">
                          <ay-avatar size="xs" [nombre]="p.responsable" [decorativo]="true" />
                          <span class="ft__resp-nombre">{{ p.responsable }}</span>
                          <ay-badge size="sm" tono="neutral">{{ p.horas }} h</ay-badge>
                        </div>
                      </div>
                      @if (!ultimo) {
                        <span
                          class="ft__enlace"
                          [class.ft__enlace--relevo]="f.pasos[i + 1].responsable !== p.responsable"
                          aria-hidden="true"
                        >
                          @if (f.pasos[i + 1].responsable !== p.responsable) {
                            <span class="ft__enlace-texto">Relevo</span>
                          }
                        </span>
                      }
                    </li>
                  }
                </ol>
              </article>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class FlujosTorreComponent {
  readonly flujos = input.required<readonly FlujoTipoConfig[]>();
  protected readonly sla = SLA_E2E_HORAS;

  protected readonly salas = computed<SalaArea[]>(() => {
    const lista = this.flujos();
    const orden = [...AREAS_ATC, ...lista.map((f) => f.area)] as string[];
    return [...new Set(orden)]
      .map((area) => ({ area, flujos: lista.filter((f) => f.area === area) }))
      .filter((s) => s.flujos.length > 0);
  });

  protected horasTotales(f: FlujoTipoConfig): number {
    return f.pasos.reduce((suma, p) => suma + p.horas, 0);
  }

  protected porcentaje(f: FlujoTipoConfig): number {
    return Math.min(100, Math.round((this.horasTotales(f) / SLA_E2E_HORAS) * 100));
  }
}
