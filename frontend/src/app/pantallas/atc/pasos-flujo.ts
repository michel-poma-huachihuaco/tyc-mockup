import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { PasoFlujoConfig } from './estado-prototipo-atc';

/**
 * Pasos de un flujo para la columna «Pasos y responsables» de Workflow: una cadena de
 * chevrones con el ancho proporcional a las horas y un color por responsable.
 */
@Component({
  selector: 'app-pasos-flujo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pasos-flujo.css',
  template: `
    <ol class="pf pf--cre" [style.--pf-cols]="columnas()">
      @for (p of vista(); track p.i) {
        <li class="pf__item">
          <div class="pf__barra" [attr.data-r]="p.r">{{ p.i + 1 }} · {{ p.horas }} h</div>
          <p class="pf__nombre" [attr.title]="p.nombre">{{ p.nombre }}</p>
          <span class="pf__resp">{{ p.responsable }}</span>
        </li>
      }
    </ol>
  `,
})
export class PasosFlujoComponent {
  readonly pasos = input.required<readonly PasoFlujoConfig[]>();

  /** Cada paso con su posición y el color de su responsable (el orden de aparición). */
  protected readonly vista = computed(() => {
    const vistos: string[] = [];
    return this.pasos().map((p, i) => {
      if (!vistos.includes(p.responsable)) vistos.push(p.responsable);
      return { ...p, i, r: vistos.indexOf(p.responsable) % 3 };
    });
  });

  protected readonly columnas = computed(() =>
    this.pasos()
      .map((p) => `minmax(8rem, ${p.horas}fr)`)
      .join(' '),
  );
}
