import { NgTemplateOutlet } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { AyButton, AyFormField, AyInput } from '@aybarcorp/ui-angular';
import { MarcaAcceso, usarCampos, usarEnvioDemo, usarFocoEnError } from '../comun';
import { errorDeCorreo } from '../validacion';

interface Proveedor {
  readonly id: string;
  readonly nombre: string;
  /** Glifo neutro: una forma, no el logotipo de la marca. */
  readonly glifo: 'circulo' | 'cuadros' | 'hoja';
}

/**
 * Inicio único (SSO): Google, Microsoft y Apple como botones secundarios a todo el ancho,
 * con glifos neutros —formas, no los logotipos, que son de cada marca y piden su guía—, y
 * el correo como alternativa. Cada proveedor muestra su carga y avisa que la maqueta no
 * sale a ningún emisor.
 */
@Component({
  selector: 'gl-ingreso-sso',
  imports: [AyButton, AyFormField, AyInput, MarcaAcceso, NgTemplateOutlet],
  host: { class: 'gl-acceso gl-sso' },
  template: `
    <ng-template #contenido>
      <div class="gl-sso__tarjeta gl-superficie">
        <gl-marca-acceso producto="Empresas" />
        <div>
          <h1 class="gl-acceso__titulo">Ingresa con tu cuenta de trabajo</h1>
          <p class="gl-acceso__texto">Usa el proveedor que tu empresa tiene configurado.</p>
        </div>
        <div class="gl-sso__proveedores" role="group" aria-label="Proveedores de identidad">
          @for (p of proveedores; track p.id) {
            <ay-button variante="secondary" bloque [cargando]="cargando() === p.id" (click)="conProveedor(p)">
              <span ayIconoInicio class="gl-sso__glifo" [attr.data-glifo]="p.glifo" aria-hidden="true"></span>
              Continuar con {{ p.nombre }}
            </ay-button>
          }
        </div>
        <p class="gl-separador"><span>o con tu correo</span></p>
        <form class="gl-form" novalidate aria-label="Continuar con correo" (submit)="enviar($event)">
          <ay-form-field etiqueta="Correo de trabajo" [error]="campos.errores().correo">
            <ay-input
              tipo="email"
              autocompletado="email"
              placeholder="nombre@ejemplo.test"
              [valor]="campos.valores().correo"
              (valorChange)="campos.escribir('correo', $event)"
            />
          </ay-form-field>
          <ay-button tipo="submit" variante="ghost" bloque [cargando]="envio.enviando()">Continuar con el correo</ay-button>
        </form>
        <p class="gl-sso__legal">Al continuar aceptas los términos de uso y la política de privacidad de tu empresa.</p>
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-sso__centro"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-sso__centro"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoSso {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly campos = usarCampos(['correo'] as const);
  protected readonly cargando = signal<string | null>(null);
  private readonly enfocarError = usarFocoEnError();
  protected readonly proveedores: readonly Proveedor[] = [
    { id: 'google', nombre: 'Google', glifo: 'circulo' },
    { id: 'microsoft', nombre: 'Microsoft', glifo: 'cuadros' },
    { id: 'apple', nombre: 'Apple', glifo: 'hoja' },
  ];

  protected conProveedor(p: Proveedor): void {
    if (this.cargando()) return;
    this.cargando.set(p.id);
    setTimeout(() => {
      this.cargando.set(null);
      this.envio.avisar(`Demo: aquí saldrías a ${p.nombre} para ingresar. La maqueta no sale a ningún emisor.`);
    }, 900);
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    if (!this.campos.validar({ correo: errorDeCorreo })) {
      this.enfocarError();
      return;
    }
    this.envio.enviar();
  }
}
