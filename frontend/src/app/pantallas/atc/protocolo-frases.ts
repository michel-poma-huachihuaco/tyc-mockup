import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { AyBadge, AyButton } from '@aybarcorp/ui-angular';
import type { FraseAnclaEvento } from './estado-prototipo-atc';

/**
 * Protocolo de contención de EntregaFest: las frases ancla como una línea de tiempo. Cada paso lleva su
 * situación con color, la frase en una caja de cita y «Copiar frase» para el moderador; el paso que
 * deriva a Legal se marca en rojo con su consecuencia.
 */
@Component({
  selector: 'app-protocolo-frases',
  standalone: true,
  imports: [AyBadge, AyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './protocolo-frases.css',
  template: `
    <ol class="pc" aria-label="Frases ancla del protocolo de contención">
      @for (f of frases(); track f.id; let i = $index) {
        <li class="pc__paso" [attr.data-tono]="f.tono">
          <span class="pc__nodo" aria-hidden="true">{{ i + 1 }}</span>
          <div class="pc__cuerpo">
            <div class="pc__cab">
              <ay-badge size="sm" [tono]="f.tono">{{ f.categoria }}</ay-badge>
              <h3 class="pc__momento">{{ momento(f) }}</h3>
              @if (f.alerta) {
                <ay-badge size="sm" tono="danger">⚠ {{ f.alerta }}</ay-badge>
              }
            </div>
            <blockquote class="pc__frase">
              <p>{{ f.frase }}</p>
              <ay-button tamano="sm" variante="ghost" (click)="copiar(f)">
                {{ copiada() === f.id ? 'Copiada ✓' : 'Copiar frase' }}
              </ay-button>
            </blockquote>
          </div>
        </li>
      }
    </ol>
  `,
})
export class ProtocoloFrasesComponent {
  readonly frases = input.required<readonly FraseAnclaEvento[]>();
  protected readonly copiada = signal<string | null>(null);

  /** El momento viene numerado («3. Ante…»): el número ya lo lleva el nodo. */
  protected momento(f: FraseAnclaEvento): string {
    return f.momento.replace(/^\d+\.\s*/, '');
  }

  protected async copiar(f: FraseAnclaEvento): Promise<void> {
    try {
      await navigator.clipboard.writeText(f.frase.replace(/^«|»$/g, ''));
      this.copiada.set(f.id);
      setTimeout(() => this.copiada.set(null), 1600);
    } catch {
      this.copiada.set(null); // sin permiso de portapapeles: no hay nada que confirmar
    }
  }
}
