import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AyAlert, AyButton, AyLoginForm, AySpinner } from '@aybarcorp/ui-angular';
import type { AyCredenciales } from '@aybarcorp/ui-angular';
import { Acceso } from '../acceso';
import { NOMBRE_PROYECTO } from '../proyecto';
import { destinoSeguro } from '../rutas';
import { rolesDeUsuarioDemo } from '../sesion';
import type { UsuarioDemo } from '../sesion';
import { Marca } from './marca';
import { codigoDe, mensajeDe } from './utiles';

/**
 * /ingresar. Con el modo demo es una pantalla partida: a la izquierda el panel de marca y a
 * la derecha el Login Form aprobado (`size="lg"`, el de pantalla partida), conectado a
 * `ingresar(usuario, clave)`; al abrir la sesión vuelve a `?destino=` o al inicio. El acceso
 * es la página entera, así que el Login Form es su `<main>` (`como="main"`) y nada lo
 * envuelve en otro. Con el emisor real no hay pantalla propia: sale al emisor
 * (Authorization Code con PKCE).
 *
 * Se entra con un usuario, no con un correo: `tipoIdentificador="text"`. Los campos vacíos
 * los dice el Login Form en cada campo y lleva el foco al primero; a `ingresar` solo llega
 * un envío completo. El error de credenciales es uno solo para usuario inexistente y
 * contraseña errónea, como pide la ficha: decir cuál de los dos falló revela qué cuentas
 * existen. No hay «No recuerdo la contraseña» hasta que exista la pantalla de recuperar.
 *
 * El aviso de sesión demo lista los usuarios de prueba de environment.development.ts, con su
 * clave: solo existen en desarrollo y en localhost, y sin ellos nadie sabría con qué entrar.
 *
 * Los accesos de Google, Microsoft, Apple y celular son de la siguiente fase: se ven,
 * deshabilitados y rotulados «Próximamente».
 */
@Component({
  selector: 'app-ingreso',
  imports: [AyAlert, AyButton, AyLoginForm, AySpinner, Marca, RouterLink],
  template: `
    @if (acceso.demo) {
      <div class="pl-ingreso">
        <header class="pl-ingreso__panel">
          <a class="pl-ingreso__inicio" routerLink="/"><app-marca [nombre]="nombre" /></a>
          <div class="pl-ingreso__mensaje">
            <p class="pl-ingreso__lema">Aybar Atiende · Sistema Central de Atención al Cliente</p>
            <p class="pl-ingreso__texto">
              Ingresa con tu cuenta corporativa o selecciona directamente uno de los perfiles operativos para explorar la plataforma desde su perspectiva.
            </p>
          </div>
          <ul class="pl-ingreso__sellos">
            <li>Consulta 360 en tiempo real desde 9 fuentes de origen</li>
            <li>Control de acceso por perfil (Gestor, Supervisor, Legal, CX y Postventa)</li>
            <li>Operación multicanal, Libro de Reclamaciones INDECOPI y Comité SGD</li>
          </ul>
        </header>
        <div class="pl-ingreso__lado">
          <aside class="pl-ingreso__aviso" aria-label="Perfiles disponibles para ingreso">
            <svg class="pl-ingreso__aviso-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16v.5" />
            </svg>
            <div class="pl-ingreso__aviso-texto" style="width: 100%;">
              <p><strong>Ingreso rápido por perfil o mediante credenciales:</strong></p>
              @if (usuarios.length > 0) {
                <ul class="pl-ingreso__usuarios" style="display: grid; gap: 6px; margin-top: 8px;">
                  @for (usuario of usuarios; track usuario.usuario) {
                    <li style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; border-radius: 8px; background: color-mix(in oklab, var(--aybar-color-bg-surface) 75%, transparent); border: 1px solid var(--aybar-color-border-subtle);">
                      <span>
                        <strong>{{ usuario.nombre || usuario.usuario }}</strong>
                        <span style="display: block; font-size: 11.5px; color: var(--aybar-color-fg-muted);">
                          Usuario: <code>{{ usuario.usuario }}</code> · Clave: <code>{{ usuario.clave }}</code> · Rol: {{ roles(usuario) }}
                        </span>
                      </span>
                      <ay-button
                        size="sm"
                        variante="secondary"
                        [disabled]="enviando()"
                        (click)="ingresarRapido(usuario)"
                      >
                        Entrar →
                      </ay-button>
                    </li>
                  }
                </ul>
              }
            </div>
          </aside>
          <ay-login-form
            como="main"
            size="lg"
            etiquetaIdentificador="Usuario"
            tipoIdentificador="text"
            [error]="error()"
            [enviando]="enviando()"
            (acceder)="enviar($event)"
          >
            <div ayProveedores class="pl-accesos">
              <div class="pl-proveedores" role="group" aria-label="Otros accesos" [attr.aria-describedby]="idNota">
                @for (proveedor of proveedores; track proveedor) {
                  <ay-button variante="secondary" disabled title="Próximamente">
                    <span ayIconoInicio class="pl-proveedores__marca">
                      @if (proveedor === 'Celular') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
                          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                          <path d="M11 18h2" />
                        </svg>
                      } @else {
                        {{ proveedor[0] }}
                      }
                    </span>
                    {{ proveedor }}
                  </ay-button>
                }
              </div>
              <p class="pl-proveedores__nota" [id]="idNota">Próximamente: inicio de sesión federado corporativo.</p>
            </div>
          </ay-login-form>
        </div>
      </div>
    } @else if (acceso.conEmisor) {
      <main id="contenido" class="pl-centro">
        @if (errorEmisor(); as falla) {
          <ay-alert tono="danger" titulo="No se pudo ir al emisor de identidad" anuncio="off">
            {{ mensaje(falla) }} Revisa la sección autenticacion de src/environments (README.md).
          </ay-alert>
        } @else {
          <ay-spinner size="lg" etiqueta="Redirigiendo al emisor de identidad" mostrarTexto />
        }
      </main>
    } @else {
      <main id="contenido" class="pl-centro">
        <ay-alert tono="info" titulo="Este remoto no inicia sesión" anuncio="off">
          Montado en un shell, usa la sesión del shell. Para recorrerlo solo, el usuario demo va en
          src/environments/environment.development.ts y existe con npm run dev (README.md).
        </ay-alert>
      </main>
    }
  `,
})
export class Ingreso {
  protected readonly acceso = inject(Acceso);
  private readonly router = inject(Router);
  private readonly destino = destinoSeguro(inject(ActivatedRoute).snapshot.queryParamMap.get('destino'));

  protected readonly nombre = NOMBRE_PROYECTO;
  protected readonly usuarios = this.acceso.usuariosDemo;
  protected readonly proveedores = ['Google', 'Microsoft', 'Apple', 'Celular'] as const;
  protected readonly idNota = 'ingreso-proveedores-nota';
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly enviando = signal(false);
  protected readonly errorEmisor = signal<unknown>(null);

  constructor() {
    if (!this.acceso.demo && this.acceso.conEmisor) {
      this.acceso.entrar(this.destino).catch((falla: unknown) => this.errorEmisor.set(falla));
    }
  }

  protected async ingresarRapido(usuario: UsuarioDemo): Promise<void> {
    await this.enviar({ identificador: usuario.usuario, password: usuario.clave, recordar: false });
  }

  protected async enviar({ identificador, password }: AyCredenciales): Promise<void> {
    this.enviando.set(true);
    this.error.set(undefined);
    try {
      await this.acceso.ingresar(identificador, password);
      await this.router.navigateByUrl(this.destino);
    } catch (falla) {
      this.error.set(
        codigoDe(falla) === 'credenciales-invalidas' ? 'Usuario o contraseña incorrectos.' : mensajeDe(falla),
      );
    } finally {
      this.enviando.set(false);
    }
  }

  protected mensaje(falla: unknown): string {
    return mensajeDe(falla);
  }

  protected roles(usuario: UsuarioDemo): string {
    return rolesDeUsuarioDemo(usuario);
  }
}
