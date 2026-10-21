import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AyAvatar, AyBadge } from '@aybarcorp/ui-angular';
import type { AsistenteProyecto } from './datos-atc';

/**
 * Ingresos registrados hoy en garita: resumen (ingresos y personas) y una línea de tiempo por hora con
 * el avatar, el nombre y el DNI de cada visitante y su proyecto, lote y acompañantes.
 */
@Component({
  selector: 'app-ingresos-hoy',
  standalone: true,
  imports: [AyAvatar, AyBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ingresos-hoy.css',
  template: `
    @if (asistentes().length === 0) {
      <p class="ih__vacio">Todavía no hay ingresos registrados hoy.</p>
    } @else {
      <p class="ih__resumen">
        <strong>{{ asistentes().length }} {{ asistentes().length === 1 ? 'ingreso' : 'ingresos' }}</strong>
        · {{ personas() }} {{ personas() === 1 ? 'persona' : 'personas' }} con acompañantes
      </p>
      <ol class="ih" aria-label="Ingresos registrados hoy">
        @for (a of asistentes(); track a.id) {
          <li class="ih__fila">
            <time class="ih__hora">{{ a.hora }}</time>
            <span class="ih__nodo" aria-hidden="true"></span>
            <div class="ih__tarjeta">
              <ay-avatar size="md" [nombre]="a.nombre" [decorativo]="true" />
              <div class="ih__datos">
                <strong class="ih__nombre">{{ a.nombre }}</strong>
                <span class="ih__dni">DNI {{ a.dni }}</span>
              </div>
              <div class="ih__chips">
                <ay-badge size="sm" tono="info">{{ a.proyecto }}</ay-badge>
                <ay-badge size="sm" tono="neutral">Lote {{ a.lote }}</ay-badge>
                @if (a.acompanantes > 0) {
                  <ay-badge size="sm" tono="warning">+{{ a.acompanantes }} acomp.</ay-badge>
                }
              </div>
            </div>
          </li>
        }
      </ol>
    }
  `,
})
export class IngresosHoyComponent {
  readonly asistentes = input.required<readonly AsistenteProyecto[]>();
  protected readonly personas = computed(() => this.asistentes().reduce((s, a) => s + 1 + a.acompanantes, 0));
}
