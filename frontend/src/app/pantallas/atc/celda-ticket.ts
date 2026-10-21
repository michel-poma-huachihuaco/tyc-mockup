import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AyBadge, AyText } from '@aybarcorp/ui-angular';
import type { TicketAtc } from './datos-atc';

/**
 * Celda «Ticket y resumen» de las tablas de seguimiento: número (abre el expediente) con su
 * tipo y la marca Rayo, el resumen recortado a dos líneas y una línea de contexto
 * (cliente · área · gestor), todo alineado a la izquierda.
 */
@Component({
  selector: 'app-celda-ticket',
  standalone: true,
  imports: [AyBadge, AyText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './celda-ticket.css',
  template: `
    <div class="ct">
      <div class="ct__cab">
        <button
          type="button"
          class="ct__num"
          [attr.aria-label]="'Abrir el expediente de ' + ticket().num"
          (click)="abrir.emit(ticket().num)"
        >
          <span ayText="mono" size="sm">{{ ticket().num }}</span>
          <span aria-hidden="true">↗</span>
        </button>
        <ay-badge size="sm" tono="info">{{ ticket().type }}</ay-badge>
        @if (ticket().rayo) {
          <ay-badge size="sm" tono="warning">⚡ Rayo</ay-badge>
        }
      </div>
      <p class="ct__resumen" [attr.title]="ticket().summary">{{ ticket().summary }}</p>
      <p class="ct__meta">{{ ticket().cli }} · {{ ticket().area }} · {{ ticket().owner ?? 'Sin gestor' }}</p>
    </div>
  `,
})
export class CeldaTicketComponent {
  readonly ticket = input.required<TicketAtc>();
  readonly abrir = output<string>();
}
