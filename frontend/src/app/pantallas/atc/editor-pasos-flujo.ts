import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  AyAvatar,
  AyBadge,
  AyButton,
  AyFormField,
  AyInput,
  AyProgressBar,
  AySelect,
  type AyOpcionSelect,
} from '@aybarcorp/ui-angular';
import type { PasoFlujoConfig } from './estado-prototipo-atc';

export interface CambioPaso {
  readonly idx: number;
  readonly campo: 'nombre' | 'responsable' | 'horas';
  readonly valor: string;
}

/**
 * Editor de los pasos de un flujo (modal de Configuración): un riel vertical con un nodo por
 * paso y «Relevo» donde cambia de manos. El área, el responsable
 * y el SLA caen en las mismas columnas.
 */
@Component({
  selector: 'app-editor-pasos-flujo',
  standalone: true,
  imports: [AyAvatar, AyBadge, AyButton, AyFormField, AyInput, AyProgressBar, AySelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './editor-pasos-flujo.css',
  template: `
    <div class="ep">
      <div class="ep__resumen">
        <ay-form-field etiqueta="Área que recibe el ticket" obligatorio>
          <ay-select size="sm" [opciones]="opcionesAreas()" [valor]="area()" (valorChange)="areaChange.emit($event)" />
        </ay-form-field>
        <ay-progress-bar
          size="sm"
          etiqueta="Horas vs SLA E2E"
          [valor]="porcentaje()"
          [detalle]="pasos().length + ' pasos · ' + horasTotales() + ' h de ' + sla + ' h'"
          [tono]="horasTotales() > sla ? 'danger' : 'brand'"
        />
      </div>

      <ol class="ep__lista">
        @for (p of pasos(); track $index; let i = $index; let ultimo = $last) {
          <li class="ep__item">
            <span class="ep__nodo" aria-hidden="true">{{ i + 1 }}</span>
            <div class="ep__tarjeta">
              <header class="ep__cab">
                <ay-avatar size="xs" [nombre]="p.responsable" [decorativo]="true" />
                <span class="ep__resp">{{ p.responsable }}</span>
                <ay-badge size="sm" tono="neutral">{{ p.horas }} h</ay-badge>
                @if (pasos().length > 1) {
                  <ay-button tamano="sm" variante="ghost" (click)="quitar.emit(i)">
                    Quitar paso
                  </ay-button>
                }
              </header>
              <div class="ep__campos">
                <ay-form-field class="ep__nombre" etiqueta="Nombre del paso" obligatorio>
                  <ay-input size="sm" [valor]="p.nombre" (valorChange)="cambiar(i, 'nombre', $event)" />
                </ay-form-field>
                <ay-form-field etiqueta="Responsable" obligatorio>
                  <ay-select
                    size="sm"
                    [opciones]="opcionesResponsables()"
                    [valor]="p.responsable"
                    (valorChange)="cambiar(i, 'responsable', $event)"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="SLA (h hábiles)" obligatorio>
                  <ay-input
                    tipo="number"
                    size="sm"
                    [valor]="'' + p.horas"
                    (valorChange)="cambiar(i, 'horas', $event)"
                  />
                </ay-form-field>
              </div>
            </div>
            @if (!ultimo && pasos()[i + 1].responsable !== p.responsable) {
              <span class="ep__relevo" aria-hidden="true">Relevo</span>
            }
          </li>
        }
      </ol>

      <ay-button class="ep__agregar" tamano="sm" variante="secondary" (click)="agregar.emit()">
        + Agregar paso
      </ay-button>
    </div>
  `,
})
export class EditorPasosFlujoComponent {
  readonly pasos = input.required<readonly PasoFlujoConfig[]>();
  readonly area = input.required<string>();
  readonly opcionesAreas = input.required<AyOpcionSelect[]>();
  readonly opcionesResponsables = input.required<AyOpcionSelect[]>();

  readonly areaChange = output<string>();
  readonly pasoChange = output<CambioPaso>();
  readonly agregar = output<void>();
  readonly quitar = output<number>();

  /** Meta corporativa de cierre end-to-end (la de la Torre de Control). */
  protected readonly sla = 72;
  protected readonly horasTotales = computed(() => this.pasos().reduce((s, p) => s + p.horas, 0));
  protected readonly porcentaje = computed(() => Math.min(100, Math.round((this.horasTotales() / this.sla) * 100)));

  protected cambiar(idx: number, campo: CambioPaso['campo'], valor: string): void {
    this.pasoChange.emit({ idx, campo, valor });
  }
}
