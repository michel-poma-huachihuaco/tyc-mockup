import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { AUTENTICACION, AUTENTICACION_DEMO, ERROR_AUTENTICACION } from './aybar/autenticacion';
import { usuariosDemo } from './sesion';
import type { SesionVisible, UsuarioDemo } from './sesion';

/**
 * El acceso de las pantallas: la sesión como señal, el modo demo y las tres acciones. Es
 * una capa fina sobre la autenticación que escribió `aybar-front init`
 * (src/app/aybar/autenticacion.ts) —OIDC con PKCE, o la simulada del modo demo, que tiene
 * la misma interfaz—: las pantallas no saben cuál de las dos hay detrás.
 */
@Injectable({ providedIn: 'root' })
export class Acceso {
  private readonly autenticacion = inject(AUTENTICACION);
  private readonly autenticacionDemo = inject(AUTENTICACION_DEMO);
  private readonly actual = signal<SesionVisible | null>(this.autenticacion.sesion());

  /** La sesión vigente, o `null`. */
  readonly sesion = this.actual.asReadonly();
  /** Modo demo: login simulado con el Login Form de la aplicación, solo en desarrollo. */
  readonly demo = this.autenticacionDemo !== null;
  /**
   * Los usuarios de prueba del modo demo (environment.development.ts), para que /ingresar los
   * muestre. Vacío fuera de desarrollo: environment.ts, el de producción, trae `demo: null`.
   */
  readonly usuariosDemo: readonly UsuarioDemo[] = this.demo ? usuariosDemo(environment.aybar.demo) : [];
  /** Sin modo demo, /ingresar redirige al emisor OIDC. */
  readonly conEmisor = !this.demo;
  /** El error de `iniciar()` —emisor caído, modo demo fuera de localhost—, o `null`. */
  readonly error = inject(ERROR_AUTENTICACION);

  constructor() {
    const baja = this.autenticacion.alCambiar((sesion) => this.actual.set(sesion));
    inject(DestroyRef).onDestroy(baja);
  }

  /** Modo demo: abre la sesión o lanza el error con código `credenciales-invalidas`. */
  async ingresar(usuario: string, clave: string): Promise<void> {
    if (!this.autenticacionDemo) {
      throw new Error('Sin modo demo no hay login propio: /ingresar redirige al emisor de identidad.');
    }
    await this.autenticacionDemo.ingresar(usuario, clave);
  }

  /** Emisor real: sale al emisor y vuelve a `destino`. */
  entrar(destino: string): Promise<void> {
    return this.autenticacion.entrar(destino);
  }

  salir(): Promise<void> {
    return this.autenticacion.salir();
  }
}

