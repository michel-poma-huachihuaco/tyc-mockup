import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AyBadge, AyButton } from '@aybarcorp/ui-angular';
import type { FraseAnclaEvento } from './estado-prototipo-atc';

/**
 * Secuencia de contención de EntregaFest (RN-SVC-030) como tres pasos en horizontal, numerados desde el 1:
 * concreción, invocación de reglas y compromiso formal con registro. Cada paso indica qué número de frase
 * del guion del moderador es (4, 5 o 6), si ya se aplicó y trae el botón cuando es su turno. El paquete no
 * define el texto que dice el moderador. Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-protocolo-frases',
  standalone: true,
  imports: [AyBadge, AyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="sec" aria-label="Secuencia de contención en sala: tres pasos en orden">
      @for (f of frases(); track f.id; let i = $index) {
        <li
          class="sec__paso"
          [class.sec__paso--hecho]="aplicada(f)"
          [class.sec__paso--siguiente]="esSiguiente(i) && !bloqueado()"
          [attr.data-tono]="f.tono"
        >
          <div class="sec__cab">
            <span class="sec__num" aria-hidden="true">{{ i + 1 }}</span>
            @if (aplicada(f)) {
              <ay-badge size="sm" tono="success">Aplicado</ay-badge>
            } @else if (esSiguiente(i) && !bloqueado()) {
              <ay-badge size="sm" tono="warning">Siguiente</ay-badge>
            } @else {
              <ay-badge size="sm" tono="neutral">Pendiente</ay-badge>
            }
          </div>
          <strong class="sec__nombre">{{ f.categoria }}</strong>
          <p class="sec__desc">{{ f.momento }}</p>
          <span class="sec__guion">Frase {{ f.numero }} del guion</span>
          @if (f.alerta) {
            <ay-badge size="sm" tono="danger">⚠ {{ f.alerta }}</ay-badge>
          }
          <ay-button tamano="sm" variante="secondary" [disabled]="!esSiguiente(i) || bloqueado()" (click)="aplicar.emit(f.numero)">
            Aplicar paso {{ i + 1 }}
          </ay-button>
        </li>
      }
    </ol>
  `,
  styles: `
    :host { display: block; }
    .sec { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--aybar-space-6); }
    .sec__paso { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-2); padding: var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .sec__paso:not(:last-child)::after { content: '›'; position: absolute; inset-block-start: 50%; inset-inline-end: calc(var(--aybar-space-6) * -0.75); transform: translateY(-50%); color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-xl); line-height: 1; }
    .sec__paso--siguiente { border-color: var(--aybar-color-feedback-warning-border); background: var(--aybar-color-feedback-warning-bg); }
    .sec__paso--hecho { border-color: var(--aybar-color-feedback-success-border); background: var(--aybar-color-feedback-success-bg); }
    .sec__cab { display: flex; align-items: center; gap: var(--aybar-space-2); }
    .sec__num { display: grid; place-items: center; inline-size: var(--aybar-space-8); aspect-ratio: 1; border-radius: var(--aybar-radius-full); background: var(--aybar-color-bg-brand); color: var(--aybar-color-fg-on-brand); font-weight: var(--aybar-font-weight-bold); }
    .sec__nombre { color: var(--aybar-color-fg-default); font-size: var(--aybar-font-size-md); }
    .sec__desc { margin: 0; flex: 1; color: var(--aybar-color-fg-default); font-size: var(--aybar-font-size-sm); line-height: 1.45; }
    .sec__guion { color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-xs); }
    @media (max-width: 52rem) {
      .sec { grid-template-columns: minmax(0, 1fr); gap: var(--aybar-space-4); }
      .sec__paso:not(:last-child)::after { content: none; }
    }
  `,
})
export class ProtocoloFrasesComponent {
  readonly frases = input.required<readonly FraseAnclaEvento[]>();
  /** Números de las frases del guion ya aplicadas, en orden (4, 5, 6). */
  readonly aplicadas = input<readonly number[]>([]);
  /** Con el tema cerrado la secuencia se ve pero ya no se puede aplicar nada. */
  readonly bloqueado = input(false);
  readonly aplicar = output<number>();

  protected aplicada(f: FraseAnclaEvento): boolean {
    return this.aplicadas().includes(f.numero);
  }

  /** Solo se puede aplicar el paso que sigue en el orden. */
  protected esSiguiente(indice: number): boolean {
    return this.aplicadas().length === indice;
  }
}
