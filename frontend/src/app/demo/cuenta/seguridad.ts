import { Component, computed, inject, signal } from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyEmptyState,
  AyOtpInput,
  AyPasswordInput,
  AyStepper,
  AyToastService,
} from '@aybarcorp/ui-angular';
import type { AyStepperPaso } from '@aybarcorp/ui-angular';
import { CODIGOS_RECUPERACION, crearAzar } from '../datos';
import { Icono } from '../icono';
import { usarCampos, usarEnfocar, usarFocoEnError } from '../ingreso/comun';
import { errorDeClave, errorDeClaveNueva, errorDeCodigo, errorDeConfirmacion, fortalezaDeClave, requisitosDeClave } from '../ingreso/validacion';
import { descargarTexto, usarCopiar } from '../utiles';

type Fase2fa = 'inactiva' | 'qr' | 'codigo' | 'codigos' | 'activa';

/** Módulos de un QR de maqueta: 25 × 25, con los tres buscadores; el resto, al azar fijo. */
function moduloDeMaqueta(): boolean[][] {
  const azar = crearAzar(2207);
  const n = 25;
  const buscador = (x: number, y: number) => {
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]] as const) {
      const dx = x - ox;
      const dy = y - oy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const borde = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const centro = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return borde || centro ? 1 : 0;
      }
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0;
    }
    return -1;
  };
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => {
      const fijo = buscador(x, y);
      return fijo === -1 ? azar() < 0.48 : fijo === 1;
    }),
  );
}

/**
 * Seguridad: cambiar la contraseña (actual, nueva con requisitos y fuerza, repetirla), la
 * verificación en dos pasos en cuatro pasos —el QR de maqueta, el Otp Input, los códigos de
 * recuperación con Copiar y Descargar .txt, y activa— y las llaves de acceso, todavía
 * vacías (Empty State). Todo en memoria.
 */
@Component({
  selector: 'gl-cuenta-seguridad',
  imports: [AyAlert, AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyEmptyState, AyOtpInput, AyPasswordInput, AyStepper, Icono],
  template: `
    <div class="gl-seccion">
      <ay-card>
        <ay-card-header titulo="Contraseña" nivel="h2" subtitulo="La cambiaste por última vez hace 3 meses." />
        <ay-card-body>
          <form class="gl-form gl-form--estrecho" novalidate aria-label="Cambiar la contraseña" (submit)="cambiarClave($event)">
            <ay-password-input
              etiqueta="Contraseña actual"
              [error]="campos.errores().actual"
              [valor]="campos.valores().actual"
              (valorChange)="campos.escribir('actual', $event)"
            />
            <ay-password-input
              etiqueta="Contraseña nueva"
              autocompletado="new-password"
              [requisitos]="requisitos()"
              [fortaleza]="fortaleza()"
              [error]="campos.errores().nueva"
              [valor]="campos.valores().nueva"
              (valorChange)="campos.escribir('nueva', $event)"
            />
            <ay-password-input
              etiqueta="Repite la contraseña nueva"
              autocompletado="new-password"
              [error]="campos.errores().repetida"
              [valor]="campos.valores().repetida"
              (valorChange)="campos.escribir('repetida', $event)"
            />
            <div class="gl-form__pie">
              <ay-button tipo="submit" [cargando]="guardandoClave()">Cambiar la contraseña</ay-button>
            </div>
          </form>
        </ay-card-body>
      </ay-card>

      <ay-card>
        <ay-card-header titulo="Verificación en dos pasos" nivel="h2" subtitulo="Un código de tu app autenticadora además de la contraseña.">
          <span ayAcciones>
            <ay-badge size="sm" [tono]="fase() === 'activa' ? 'success' : 'neutral'">{{ fase() === 'activa' ? 'Activa' : 'Inactiva' }}</ay-badge>
          </span>
        </ay-card-header>
        <ay-card-body>
          <div class="gl-dos-factores">
            @switch (fase()) {
              @case ('inactiva') {
                <p class="gl-nota">Protege tu cuenta aunque alguien conozca tu contraseña. Tarda un minuto.</p>
                <div><ay-button (click)="ir('qr')">Activar la verificación en dos pasos</ay-button></div>
              }
              @case ('activa') {
                <ay-alert tono="success" anuncio="off">Activa desde hoy. Guarda tus códigos de recuperación en un lugar seguro.</ay-alert>
                <div class="gl-form__pie gl-form__pie--inicio">
                  <ay-button variante="secondary" (click)="ir('codigos')">Ver los códigos de recuperación</ay-button>
                  <ay-button variante="danger" (click)="desactivar()">Desactivar</ay-button>
                </div>
              }
              @default {
                <ay-stepper etiqueta="Activar la verificación en dos pasos" size="sm" [pasos]="pasos" [actual]="indice()" />
                @if (fase() === 'qr') {
                  <div class="gl-qr">
                    <svg class="gl-qr__imagen" viewBox="-2 -2 29 29" role="img" aria-labelledby="gl-qr-titulo">
                      <title id="gl-qr-titulo">Código QR de maqueta: no se puede escanear</title>
                      @for (fila of modulos; track $index; let y = $index) {
                        @for (lleno of fila; track $index; let x = $index) {
                          @if (lleno) {
                            <rect [attr.x]="x" [attr.y]="y" width="1" height="1" />
                          }
                        }
                      }
                    </svg>
                    <div class="gl-qr__texto">
                      <h3 class="gl-subtitulo" tabindex="-1">Escanea el código con tu app</h3>
                      <p class="gl-nota">
                        Google Authenticator, Microsoft Authenticator o cualquier app TOTP. Si no puedes escanearlo, escribe
                        esta clave:
                      </p>
                      <code class="gl-clave">DEMO 4KQ7 M2XA 9TBV 31LC</code>
                      <div class="gl-form__pie gl-form__pie--inicio">
                        <ay-button (click)="ir('codigo')">Ya lo escaneé</ay-button>
                        <ay-button variante="ghost" (click)="ir('inactiva')">Cancelar</ay-button>
                      </div>
                    </div>
                  </div>
                } @else if (fase() === 'codigo') {
                  <form class="gl-form gl-form--estrecho" novalidate aria-label="Verificar el código" (submit)="verificar($event)">
                    <h3 class="gl-subtitulo" tabindex="-1">Escribe el código que muestra la app</h3>
                    <ay-otp-input etiqueta="Código de 6 cifras" [longitud]="6" [error]="errorCodigo()" [(valor)]="codigo" (completado)="verificar()" />
                    <div class="gl-form__pie gl-form__pie--inicio">
                      <ay-button tipo="submit">Verificar</ay-button>
                      <ay-button variante="ghost" (click)="ir('qr')">Atrás</ay-button>
                    </div>
                  </form>
                } @else {
                  <h3 class="gl-subtitulo" tabindex="-1">Guarda tus códigos de recuperación</h3>
                  <p class="gl-nota">Cada uno sirve una vez si pierdes el celular. Son de maqueta: empiezan por DEMO.</p>
                  <ol class="gl-codigos">
                    @for (codigo of codigos; track codigo) {
                      <li><code>{{ codigo }}</code></li>
                    }
                  </ol>
                  <div class="gl-form__pie gl-form__pie--inicio">
                    <ay-button variante="secondary" (click)="copiarCodigos()">
                      <gl-icono ayIconoInicio nombre="copiar" />
                      Copiar
                    </ay-button>
                    <ay-button variante="secondary" (click)="descargarCodigos()">
                      <gl-icono ayIconoInicio nombre="descargar" />
                      Descargar .txt
                    </ay-button>
                    <ay-button (click)="ir('activa')">Listo, los guardé</ay-button>
                  </div>
                }
              }
            }
          </div>
        </ay-card-body>
      </ay-card>

      <ay-card>
        <ay-card-header titulo="Llaves de acceso" nivel="h2" subtitulo="Entra con la huella o el rostro, sin contraseña." />
        <ay-card-body>
          <ay-empty-state size="compact" titulo="Todavía no tienes llaves de acceso" descripcion="Una llave vive en tu dispositivo y no se puede robar con un correo falso.">
            <div ayAcciones>
              <ay-button variante="secondary" (click)="aviso('Demo: aquí el navegador pediría crear la llave (WebAuthn).')">Crear una llave de acceso</ay-button>
            </div>
          </ay-empty-state>
        </ay-card-body>
      </ay-card>
    </div>
  `,
})
export class CuentaSeguridad {
  private readonly toast = inject(AyToastService);
  private readonly copiar = usarCopiar();
  private readonly enfocar = usarEnfocar();
  private readonly enfocarError = usarFocoEnError();

  protected readonly campos = usarCampos(['actual', 'nueva', 'repetida'] as const);
  protected readonly requisitos = computed(() => requisitosDeClave(this.campos.valores().nueva));
  protected readonly fortaleza = computed(() => fortalezaDeClave(this.campos.valores().nueva));
  protected readonly guardandoClave = signal(false);

  protected readonly fase = signal<Fase2fa>('inactiva');
  protected readonly codigo = signal('');
  protected readonly errorCodigo = signal<string | undefined>(undefined);
  protected readonly modulos = moduloDeMaqueta();
  protected readonly codigos = CODIGOS_RECUPERACION;
  protected readonly pasos: AyStepperPaso[] = [
    { id: 'qr', etiqueta: 'Escanear' },
    { id: 'codigo', etiqueta: 'Verificar' },
    { id: 'codigos', etiqueta: 'Códigos' },
  ];
  protected readonly indice = computed(() => ({ qr: 0, codigo: 1, codigos: 2 })[this.fase() as 'qr' | 'codigo' | 'codigos'] ?? 0);

  protected cambiarClave(evento: Event): void {
    evento.preventDefault();
    const bien = this.campos.validar({
      actual: errorDeClave,
      nueva: errorDeClaveNueva,
      repetida: (valor, todos) => errorDeConfirmacion(todos.nueva, valor),
    });
    if (!bien) return this.enfocarError();
    this.guardandoClave.set(true);
    setTimeout(() => {
      this.guardandoClave.set(false);
      this.campos.limpiar();
      this.toast.mostrar({ mensaje: 'Contraseña cambiada (en la maqueta no se guarda nada).', tono: 'success' });
    }, 700);
  }

  protected ir(fase: Fase2fa): void {
    this.fase.set(fase);
    if (fase === 'codigo') {
      this.codigo.set('');
      this.errorCodigo.set(undefined);
    }
    if (fase === 'activa') this.toast.mostrar({ mensaje: 'Verificación en dos pasos activada.', tono: 'success' });
    this.enfocar(fase === 'codigo' ? '.ay-otp__cell' : 'h3[tabindex], .gl-dos-factores button');
  }

  protected verificar(evento?: Event): void {
    evento?.preventDefault();
    const error = errorDeCodigo(this.codigo());
    this.errorCodigo.set(error);
    if (error) return this.enfocarError();
    this.ir('codigos');
  }

  protected desactivar(): void {
    this.fase.set('inactiva');
    this.toast.mostrar({ mensaje: 'Verificación en dos pasos desactivada.', tono: 'warning' });
    this.enfocar('.gl-dos-factores button');
  }

  protected copiarCodigos(): void {
    void this.copiar(this.codigos.join('\n'), 'Códigos copiados al portapapeles.');
  }

  protected descargarCodigos(): void {
    descargarTexto('codigos-de-recuperacion-demo.txt', `Códigos de recuperación (maqueta de la galería)\n\n${this.codigos.join('\n')}\n`);
  }

  protected aviso(mensaje: string): void {
    this.toast.mostrar({ mensaje, tono: 'info' });
  }
}
