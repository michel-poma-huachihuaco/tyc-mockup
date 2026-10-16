import { Component, computed, inject, signal } from '@angular/core';
import { AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyConfirmationDialog, AyList, AyListItem, AyToastService } from '@aybarcorp/ui-angular';
import { SESIONES } from '../datos';
import type { SesionAbierta } from '../datos';
import { haceTiempo } from '../formato';
import { Icono } from '../icono';
import type { NombreIcono } from '../icono';
import { usarEnfocar } from '../ingreso/comun';

/**
 * Sesiones: los dispositivos con la sesión abierta, en una ay-list. La de esta pestaña dice
 * «Esta sesión» y no tiene botón; las demás se cierran con una confirmación
 * (ay-confirmation-dialog), una a una o todas a la vez. En memoria.
 */
@Component({
  selector: 'gl-cuenta-sesiones',
  imports: [AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyConfirmationDialog, AyList, AyListItem, Icono],
  template: `
    <div class="gl-seccion" tabindex="-1" data-gl-foco>
      <ay-card>
        <ay-card-header titulo="Dónde tienes la sesión abierta" nivel="h2" [subtitulo]="resumen()">
          <ay-button ayAcciones variante="secondary" tamano="sm" [disabled]="otras() === 0" (click)="pedir(null)">Cerrar las demás</ay-button>
        </ay-card-header>
        <ay-card-body>
          <ay-list etiqueta="Sesiones abiertas" [elementos]="sesiones()" separadores>
            <ng-template #elemento let-s>
              <ay-list-item [titulo]="s.dispositivo + ' · ' + s.navegador" [meta]="meta(s)" tieneInicial>
                <span ayInicial class="gl-sesion__icono"><gl-icono [nombre]="icono(s.dispositivo)" /></span>
                <span ayFinal>
                  @if (s.actual) {
                    <ay-badge tono="success" size="sm">Esta sesión</ay-badge>
                  } @else {
                    <ay-button variante="ghost" tamano="sm" (click)="pedir(s)">Cerrar sesión</ay-button>
                  }
                </span>
              </ay-list-item>
            </ng-template>
          </ay-list>
        </ay-card-body>
      </ay-card>
    </div>

    <ay-confirmation-dialog
      [abierto]="confirmando()"
      tono="danger"
      [titulo]="pendiente() ? 'Cerrar la sesión de ' + pendiente()!.dispositivo.toLowerCase() : 'Cerrar las demás sesiones'"
      [descripcion]="
        pendiente()
          ? 'Quien use ' + pendiente()!.navegador + ' en ' + pendiente()!.lugar + ' tendrá que volver a entrar.'
          : 'Se cerrarán ' + otras() + ' sesiones. Esta pestaña sigue abierta.'
      "
      [etiquetaConfirmar]="pendiente() ? 'Cerrar la sesión' : 'Cerrar ' + otras() + ' sesiones'"
      (confirmar)="confirmar()"
      (abiertoChange)="!$event && confirmando.set(false)"
    />
  `,
})
export class CuentaSesiones {
  private readonly toast = inject(AyToastService);
  private readonly enfocar = usarEnfocar();

  protected readonly sesiones = signal<SesionAbierta[]>(SESIONES.map((s) => ({ ...s })));
  protected readonly otras = computed(() => this.sesiones().filter((s) => !s.actual).length);
  protected readonly resumen = computed(() => {
    const n = this.sesiones().length;
    return n === 1 ? 'Solo esta sesión.' : `${n} sesiones: esta y ${n - 1} más.`;
  });
  protected readonly confirmando = signal(false);
  protected readonly pendiente = signal<SesionAbierta | null>(null);

  protected meta(s: SesionAbierta): string {
    return `${s.lugar} · IP ${s.ip} · ${s.actual ? 'activa ahora' : 'última actividad ' + haceTiempo(s.ultimaActividad)}`;
  }

  protected icono(dispositivo: string): NombreIcono {
    return dispositivo === 'Celular' ? 'celular' : dispositivo === 'Tableta' ? 'redimensionado' : 'portada';
  }

  /** `null`: todas las demás. */
  protected pedir(sesion: SesionAbierta | null): void {
    this.pendiente.set(sesion);
    this.confirmando.set(true);
  }

  protected confirmar(): void {
    const sesion = this.pendiente();
    this.sesiones.update((lista) => lista.filter((s) => (sesion ? s.id !== sesion.id : s.actual)));
    this.confirmando.set(false);
    this.toast.mostrar({
      mensaje: sesion ? `Sesión de ${sesion.dispositivo.toLowerCase()} cerrada.` : 'Se cerraron las demás sesiones.',
      tono: 'success',
    });
    // El botón que abrió la confirmación ya no existe: el foco va a la siguiente sesión, o a
    // la sección si no queda ninguna que cerrar.
    this.enfocar(this.otras() > 0 ? '.ay-list__trail button' : '[data-gl-foco]');
  }
}
