import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AyBadge, AyButton } from '@aybarcorp/ui-angular';
import type { FraseAnclaEvento } from './estado-prototipo-atc';

/**
 * Secuencia de contención verbal de EntregaFest (RN-SVC-030): las Frases Ancla 4, 5 y 6, que se aplican en
 * ese orden ante la insistencia de un propietario. Cada paso muestra para qué sirve, si ya se aplicó y el
 * botón para aplicarla cuando es su turno. El paquete no define el texto que dice el moderador.
 */
@Component({
  selector: 'app-protocolo-frases',
  standalone: true,
  imports: [AyBadge, AyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './protocolo-frases.css',
  template: `
    <ol class="pc" aria-label="Secuencia de contención: Frases Ancla 4, 5 y 6">
      @for (f of frases(); track f.id; let i = $index) {
        <li class="pc__paso" [attr.data-tono]="f.tono">
          <span class="pc__nodo" aria-hidden="true">{{ f.numero }}</span>
          <div class="pc__cuerpo">
            <div class="pc__cab">
              <ay-badge size="sm" [tono]="f.tono">Frase {{ f.numero }} · {{ f.categoria }}</ay-badge>
              @if (aplicada(f)) {
                <ay-badge size="sm" tono="success">Aplicada</ay-badge>
              } @else if (esSiguiente(i)) {
                <ay-badge size="sm" tono="warning">Siguiente</ay-badge>
              } @else {
                <ay-badge size="sm" tono="neutral">Pendiente</ay-badge>
              }
              @if (f.alerta) {
                <ay-badge size="sm" tono="danger">⚠ {{ f.alerta }}</ay-badge>
              }
            </div>
            <div class="pc__frase">
              <p>{{ f.momento }}</p>
              <ay-button tamano="sm" variante="secondary" [disabled]="!esSiguiente(i)" (click)="aplicar.emit(f.numero)">
                Aplicar Frase {{ f.numero }}
              </ay-button>
            </div>
          </div>
        </li>
      }
    </ol>
  `,
})
export class ProtocoloFrasesComponent {
  readonly frases = input.required<readonly FraseAnclaEvento[]>();
  /** Números de las frases ya aplicadas, en orden. */
  readonly aplicadas = input<readonly number[]>([]);
  readonly aplicar = output<number>();

  protected aplicada(f: FraseAnclaEvento): boolean {
    return this.aplicadas().includes(f.numero);
  }

  /** Solo se puede aplicar la que sigue en el orden 4, 5, 6. */
  protected esSiguiente(indice: number): boolean {
    return this.aplicadas().length === indice;
  }
}
