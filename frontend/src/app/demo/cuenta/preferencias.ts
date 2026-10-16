import { Component, computed, inject, signal } from '@angular/core';
import { AyAppearancePanel, AyButton, AyCard, AyCardBody, AyCardHeader, AyFormField, AySelect, AySwitch, AyToastService } from '@aybarcorp/ui-angular';
import type { AyOpcionSelect } from '@aybarcorp/ui-angular';

/**
 * Preferencias: el ay-appearance-panel del framework en línea —los mismos ejes que el
 * panel Personalizar, el mismo estado: cambiar aquí cambia allí y en toda la galería— y
 * el idioma, la zona horaria y el formato de los importes, que se guardan con un Toast.
 */
@Component({
  selector: 'gl-cuenta-preferencias',
  imports: [AyAppearancePanel, AyButton, AyCard, AyCardBody, AyCardHeader, AyFormField, AySelect, AySwitch],
  template: `
    <div class="gl-seccion">
      <ay-card>
        <ay-card-body>
          <ay-appearance-panel titulo="Apariencia" [nivelTitulo]="2" mostrarPresets />
        </ay-card-body>
      </ay-card>

      <ay-card>
        <ay-card-header titulo="Idioma y región" nivel="h2" subtitulo="Cómo se escriben las fechas, las horas y los importes." />
        <ay-card-body>
          <form class="gl-form gl-form--dos" novalidate aria-label="Idioma y región" (submit)="guardar($event)">
            <ay-form-field etiqueta="Idioma">
              <ay-select [opciones]="idiomas" [(valor)]="idioma" />
            </ay-form-field>
            <ay-form-field etiqueta="Zona horaria">
              <ay-select [opciones]="zonas" [(valor)]="zona" />
            </ay-form-field>
            <div class="gl-form__ancho">
              <ay-switch etiqueta="Importes con céntimos" descripcion="S/ 127,300.00 en lugar de S/ 127,300." [(activo)]="centimos" />
            </div>
            <p class="gl-form__ancho gl-muestra-formato" aria-live="polite">
              Así se verá: <strong>{{ muestra() }}</strong>
            </p>
            <div class="gl-form__pie gl-form__ancho">
              <ay-button tipo="submit" [cargando]="guardando()">Guardar preferencias</ay-button>
            </div>
          </form>
        </ay-card-body>
      </ay-card>
    </div>
  `,
})
export class CuentaPreferencias {
  private readonly toast = inject(AyToastService);

  protected readonly idiomas: AyOpcionSelect[] = [
    { value: 'es-PE', label: 'Español (Perú)' },
    { value: 'es-419', label: 'Español (Latinoamérica)' },
    { value: 'en-US', label: 'English (United States)' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
  ];
  protected readonly zonas: AyOpcionSelect[] = [
    { value: 'America/Lima', label: 'Lima (UTC−05:00)' },
    { value: 'America/Bogota', label: 'Bogotá (UTC−05:00)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (UTC−06:00)' },
    { value: 'America/Santiago', label: 'Santiago (UTC−03:00)' },
    { value: 'Europe/Madrid', label: 'Madrid (UTC+02:00)' },
    { value: 'UTC', label: 'UTC' },
  ];
  protected readonly idioma = signal('es-PE');
  protected readonly zona = signal('America/Lima');
  protected readonly centimos = signal(false);
  protected readonly guardando = signal(false);

  /** La fecha de la galería y un importe, con lo elegido. */
  protected readonly muestra = computed(() => {
    const fecha = new Intl.DateTimeFormat(this.idioma(), { dateStyle: 'long', timeStyle: 'short', timeZone: this.zona() }).format(
      new Date('2026-10-01T09:00:00-05:00'),
    );
    const importe = new Intl.NumberFormat(this.idioma(), {
      style: 'currency',
      currency: 'PEN',
      currencyDisplay: 'symbol',
      minimumFractionDigits: this.centimos() ? 2 : 0,
      maximumFractionDigits: this.centimos() ? 2 : 0,
    }).format(127300);
    return `${fecha} · ${importe}`;
  });

  protected guardar(evento: Event): void {
    evento.preventDefault();
    this.guardando.set(true);
    setTimeout(() => {
      this.guardando.set(false);
      this.toast.mostrar({ mensaje: 'Preferencias guardadas (en memoria).', tono: 'success' });
    }, 600);
  }
}
