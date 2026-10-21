import { Component, computed, inject, signal } from '@angular/core';
import { AyAvatar, AyButton, AyCard, AyCardBody, AyCardHeader, AyFormField, AyInput, AyPhoneInput, AySelect, AyTextarea, AyToastService } from '@aybarcorp/ui-angular';
import type { AyOpcionSelect } from '@aybarcorp/ui-angular';
import { nombreVisible } from '../../sesion';
import { AREAS_DISPONIBLES } from '../datos';
import { EstadoGaleria } from '../estado';
import { errorDeCelular, errorDeCorreo, errorDeNombre } from '../ingreso/validacion';
import { usarFocoEnError } from '../ingreso/comun';

interface Perfil {
  nombre: string;
  correo: string;
  celular: string;
  area: string;
  cargo: string;
  presentacion: string;
}

type Errores = Partial<Record<keyof Perfil, string>>;

/**
 * Perfil: la foto (Avatar con iniciales), los datos de contacto con validación por campo y
 * «Guardar cambios», que avisa con un Toast. «Descartar» vuelve a lo guardado. Todo en
 * memoria: el perfil parte de la sesión visible y de datos sintéticos.
 */
@Component({
  selector: 'gl-cuenta-perfil',
  imports: [AyAvatar, AyButton, AyCard, AyCardBody, AyCardHeader, AyFormField, AyInput, AyPhoneInput, AySelect, AyTextarea],
  template: `
    <div class="gl-seccion">
      <ay-card>
        <ay-card-header titulo="Foto" nivel="h2" subtitulo="Se ve en el menú de la cuenta y en la auditoría." />
        <ay-card-body>
          <div class="gl-perfil__foto">
            <ay-avatar [nombre]="guardado().nombre" size="xl" />
            <div class="gl-perfil__acciones">
              <ay-button variante="secondary" tamano="sm" (click)="aviso('Demo: aquí se abriría el selector de archivos.')">Cambiar la foto</ay-button>
              <ay-button variante="ghost" tamano="sm" (click)="aviso('Demo: la foto se quitaría y quedarían las iniciales.')">Quitar</ay-button>
            </div>
          </div>
        </ay-card-body>
      </ay-card>

      <ay-card>
        <ay-card-header titulo="Datos personales" nivel="h2" subtitulo="Los ve tu equipo; el correo es tu usuario." />
        <ay-card-body>
          <form class="gl-form gl-form--dos" novalidate aria-label="Datos personales" (submit)="guardar($event)">
            <ay-form-field etiqueta="Nombre y apellido" [error]="errores().nombre">
              <ay-input autocompletado="name" [valor]="borrador().nombre" (valorChange)="escribir('nombre', $event)" />
            </ay-form-field>
            <ay-form-field etiqueta="Correo" [error]="errores().correo">
              <ay-input tipo="email" autocompletado="email" [valor]="borrador().correo" (valorChange)="escribir('correo', $event)" />
            </ay-form-field>
            <ay-phone-input etiqueta="Celular" [error]="errores().celular" [valor]="borrador().celular" (valorChange)="escribir('celular', $event)" />
            <ay-form-field etiqueta="Área">
              <ay-select [opciones]="areas" [valor]="borrador().area" (valorChange)="escribir('area', $event)" />
            </ay-form-field>
            <ay-form-field etiqueta="Cargo" opcional>
              <ay-input autocompletado="organization-title" [valor]="borrador().cargo" (valorChange)="escribir('cargo', $event)" />
            </ay-form-field>
            <ay-form-field class="gl-form__ancho" etiqueta="Presentación" opcional ayuda="Una o dos frases; las ve quien te asigna un lote.">
              <ay-textarea [filas]="3" [maxLength]="240" contador [valor]="borrador().presentacion" (valorChange)="escribir('presentacion', $event)" />
            </ay-form-field>
            <div class="gl-form__pie gl-form__ancho">
              <ay-button variante="ghost" [disabled]="!cambiado()" (click)="descartar()">Descartar</ay-button>
              <ay-button tipo="submit" [disabled]="!cambiado()" [cargando]="guardando()">Guardar cambios</ay-button>
            </div>
          </form>
        </ay-card-body>
      </ay-card>
    </div>
  `,
})
export class CuentaPerfil {
  private readonly estado = inject(EstadoGaleria);
  private readonly toast = inject(AyToastService);
  private readonly enfocarError = usarFocoEnError();

  protected readonly areas: AyOpcionSelect[] = AREAS_DISPONIBLES.map((a) => ({ value: a, label: a }));
  protected readonly guardado = signal<Perfil>(this.inicial());
  protected readonly borrador = signal<Perfil>(this.guardado());
  protected readonly errores = signal<Errores>({});
  protected readonly guardando = signal(false);
  protected readonly cambiado = computed(() => JSON.stringify(this.borrador()) !== JSON.stringify(this.guardado()));

  protected escribir(campo: keyof Perfil, valor: string): void {
    this.borrador.update((p) => ({ ...p, [campo]: valor }));
    if (this.errores()[campo]) this.errores.update((e) => ({ ...e, [campo]: undefined }));
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    const p = this.borrador();
    const errores: Errores = {
      nombre: errorDeNombre(p.nombre),
      correo: errorDeCorreo(p.correo),
      celular: p.celular ? errorDeCelular(p.celular) : undefined,
    };
    this.errores.set(errores);
    if (Object.values(errores).some(Boolean)) {
      this.enfocarError();
      return;
    }
    this.guardando.set(true);
    setTimeout(() => {
      this.guardando.set(false);
      this.guardado.set(this.borrador());
      this.toast.mostrar({ mensaje: 'Perfil guardado (en memoria: al recargar vuelve el de la sesión).', tono: 'success' });
    }, 700);
  }

  protected descartar(): void {
    this.borrador.set(this.guardado());
    this.errores.set({});
  }

  protected aviso(mensaje: string): void {
    this.toast.mostrar({ mensaje, tono: 'info' });
  }

  private inicial(): Perfil {
    const sesion = this.estado.sesion();
    const usuario = sesion?.usuarioId ?? 'usuario';
    return {
      nombre: sesion ? nombreVisible(sesion) : '',
      correo: `${usuario}@ejemplo.test`,
      celular: '900000001',
      area: this.estado.adminReal() ? 'Tecnología' : 'Ventas',
      cargo: this.estado.adminReal() ? 'Administración de la plataforma' : 'Asesoría comercial',
      presentacion: '',
    };
  }
}
