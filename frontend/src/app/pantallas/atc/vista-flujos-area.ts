import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AyButton, AyPageHeader, AyStack } from '@aybarcorp/ui-angular';
import { EstadoPrototipoAtcService } from './estado-prototipo-atc';
import { FlujosTorreComponent } from './flujos-torre';

/** Flujos activos por área resolutora: solo lectura, el origen es Configuración. */
@Component({
  selector: 'app-vista-flujos-area',
  standalone: true,
  imports: [AyButton, AyPageHeader, AyStack, FlujosTorreComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div ayStack gap="6">
      <ay-page-header
        titulo="Flujos por área resolutora"
        descripcion="Solo lectura: los flujos activos se sincronizan con Configuración."
      >
        <ay-button ayAcciones tamano="sm" variante="secondary" (click)="irAConfiguracion.emit()">
          Editar en Configuración
        </ay-button>
      </ay-page-header>
      <app-flujos-torre [flujos]="estadoProto.flujosPorTipo()" />
    </div>
  `,
})
export class VistaFlujosAreaComponent {
  protected readonly estadoProto = inject(EstadoPrototipoAtcService);
  readonly irAConfiguracion = output<void>();
}
