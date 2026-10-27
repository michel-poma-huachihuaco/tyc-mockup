import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AyAlert, AyButton, AyForm, AyFormField, AyModal, AyStack, AyTextarea } from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { areaEs } from './base';

/**
 * Aviso de conflicto del ticket, según las HU de la feature FT-ATC-07:
 * - **Señal de conflicto en Eje 1 o 2** (HU-ATC-026, RN-SVC-021): el ticket no se puede resolver ni cerrar
 *   ahí y hay que derivarlo a Legal (Eje 3). Un supervisor puede retirar una señal marcada por error, con
 *   justificación (CA-03).
 * - **Ya en Legal** (HU-ATC-027): queda pendiente que Legal confirme la recepción del paquete (CA-02).
 * No se muestra «derivación obligatoria» a un ticket que ya está en Legal.
 */
@Component({
  selector: 'app-banner-conflicto',
  standalone: true,
  imports: [AyAlert, AyButton, AyForm, AyFormField, AyModal, AyStack, AyTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (retirada(); as j) {
      <ay-alert tono="success" size="sm" titulo="Señal de conflicto retirada">
        Retirada por un supervisor con esta justificación: «{{ j }}». Queda registrada en el historial (HU-026, CA-03).
      </ay-alert>
    } @else if (senalEnPrimeraLinea()) {
      <ay-alert tono="danger" titulo="Derivación obligatoria a Legal (Eje 3)">
        Este ticket tiene una señal de conflicto (carta notarial, INDECOPI, abogado o prensa). No se puede resolver ni
        cerrar en Eje 1 o 2: hay que derivarlo a Legal con el paquete mínimo de 6 elementos (HU-026, RN-SVC-021).
        <div ayAcciones>
          <ay-button tamano="sm" variante="secondary" (click)="modalAbierto.set(true)">Retirar señal (supervisor)</ay-button>
        </div>
      </ay-alert>
    } @else if (area() === 'LEGAL') {
      @if (handoffConfirmado()) {
        <ay-alert tono="success" size="sm" titulo="Recepción confirmada por Legal">
          Legal confirmó la recepción del paquete en este ticket (HU-027, CA-02).
        </ay-alert>
      } @else {
        <ay-alert tono="warning" size="sm" titulo="En Legal (Eje 3): falta confirmar la recepción">
          El Especialista Legal Senior debe confirmar la recepción del paquete en este mismo ticket. Si pasa 1 día hábil
          sin confirmar, se alerta al supervisor del área destino (HU-027, CA-02 y CA-03).
          <div ayAcciones>
            <ay-button tamano="sm" variante="secondary" (click)="confirmarRecepcion.emit()">Confirmar recepción (Legal)</ay-button>
          </div>
        </ay-alert>
      }
    }

    <ay-modal [abierto]="modalAbierto()" (abiertoChange)="modalAbierto.set($event)" titulo="Retirar la señal de conflicto">
      <ay-form (enviar)="retirarSenal()">
        <div ayStack gap="3">
          <ay-alert tono="info" size="sm" titulo="Solo si se marcó por error">
            Si la señal es correcta, el ticket debe derivarse a Legal. Retirarla exige una justificación y queda en el
            historial.
          </ay-alert>
          <ay-form-field etiqueta="Justificación" obligatorio>
            <ay-textarea nombre="retirar-justificacion" [filas]="3" [valor]="justificacion()" (valorChange)="justificacion.set($event)" />
          </ay-form-field>
          <div class="bc-fila">
            <ay-button variante="ghost" (click)="modalAbierto.set(false)">Cancelar</ay-button>
            <ay-button tipo="submit" variante="primary" [disabled]="justificacion().trim().length === 0">Retirar señal</ay-button>
          </div>
        </div>
      </ay-form>
    </ay-modal>
  `,
  styles: `.bc-fila { display: flex; justify-content: flex-end; gap: var(--aybar-space-2); }`,
})
export class BannerConflicto {
  readonly ticket = input.required<TicketAtc>();
  /** Área en la que está ahora el ticket. */
  readonly area = input.required<string>();
  /** Justificación con la que un supervisor retiró la señal; `null` si sigue activa. */
  readonly retirada = input<string | null>(null);
  readonly handoffConfirmado = input(false);
  readonly retirar = output<string>();
  readonly confirmarRecepcion = output<void>();

  protected readonly modalAbierto = signal(false);
  protected readonly justificacion = signal('');

  protected readonly senalEnPrimeraLinea = computed(() => this.ticket().conflict && this.area() !== 'LEGAL');
  protected readonly areaEs = areaEs;

  protected retirarSenal(): void {
    const j = this.justificacion().trim();
    if (!j) return;
    this.retirar.emit(j);
    this.justificacion.set('');
    this.modalAbierto.set(false);
  }
}
