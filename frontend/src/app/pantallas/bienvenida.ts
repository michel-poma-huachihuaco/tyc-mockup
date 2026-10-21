import { Component, DOCUMENT, DestroyRef, inject, isDevMode, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AyAlert } from '@aybarcorp/ui-angular';
import { environment } from '../../environments/environment';
import { Acceso } from '../acceso';
// aybar:demo:inicio
import { ENLACES_GALERIA } from '../galeria';
// aybar:demo:fin
import { CON_BACKEND, NOMBRE_PROYECTO, PAPEL, PUERTO_DESARROLLO } from '../proyecto';
import { RUTA_INGRESO, esUrlDePlantilla } from '../rutas';
import { piezasDeComando } from '../terminal';
import { BotonTema } from './boton-tema';
import { Marca } from './marca';
import { codigoDe, mensajeDe } from './utiles';

interface Linea {
  readonly comando?: string;
  /** El comando partido en piezas que no se cortan por dentro (src/app/terminal.ts). */
  readonly piezas?: readonly string[];
  readonly salida?: string;
  readonly nota?: string;
}

/**
 * Bienvenida pública: lo que ve quien llega sin sesión. «Ingresar» lleva a /ingresar, que
 * con el modo demo es el Login Form y con el emisor real redirige al emisor.
 *
 * Todo lo que muestra es del proyecto: su nombre, los comandos con que se generó y se
 * arranca, si la sesión es la demo y la URL de la API que llamará.
 */
@Component({
  selector: 'app-bienvenida',
  imports: [AyAlert, BotonTema, Marca, RouterLink],
  template: `
    <div class="pl-bienvenida">
      <div class="pl-bienvenida__fondo" aria-hidden="true"></div>
      <header class="pl-barra">
        <app-marca [nombre]="nombre" />
        <div class="pl-barra__acciones">
          <app-boton-tema />
          <a class="pl-accion pl-accion--inversa" [routerLink]="ingreso">Ingresar</a>
        </div>
      </header>

      <main id="contenido" class="pl-bienvenida__principal">
        <section class="pl-heroe" aria-labelledby="bienvenida-titulo">
          <p class="pl-heroe__aviso">
            <span class="pl-insignia">Nuevo</span>
            Sistema de diseño Aybar con tema claro y oscuro
          </p>
          <h1 id="bienvenida-titulo" class="pl-heroe__titulo">
            Tu frontend de Aybar, <span class="pl-heroe__resalte">listo para trabajar</span>
          </h1>
          <p class="pl-heroe__texto">
            {{ nombre }} se generó con el Aybar SDK sobre <code class="pl-codigo-chip">&#64;aybarcorp/*</code>.
            Ingresa para ver tu sesión{{ conBackend ? ' y la conexión con el backend' : '' }}.
          </p>
          @if (acceso.error(); as error) {
            <div class="pl-heroe__error">
              <ay-alert tono="danger" titulo="No se pudo iniciar la sesión" anuncio="off">
                {{ mensaje(error) }}
              </ay-alert>
            </div>
          }
          <div class="pl-heroe__acciones">
            <a class="pl-accion pl-accion--primaria pl-accion--lg" routerLink="/consola">
              Abrir Consola ATC (60 HU · 360 ASTRA · 3D)
              <svg class="pl-accion__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a class="pl-accion pl-accion--secundaria pl-accion--lg" [routerLink]="ingreso">
              Ingresar
            </a>
            <!-- aybar:demo:inicio — «Ver la vitrina»: la de la galería de demostración, pasando por el
                 mismo ingreso. Solo con ng serve: en producción ENLACES_GALERIA es null. -->
            @if (galeria; as enlaces) {
              <a class="pl-accion pl-accion--secundaria pl-accion--lg" [routerLink]="enlaces.vitrina">Ver la vitrina</a>
            }
            <!-- aybar:demo:fin -->
          </div>

          <figure class="pl-terminal">
            <figcaption class="pl-terminal__barra">
              <span class="pl-terminal__luces" aria-hidden="true"><span></span><span></span><span></span></span>
              terminal
            </figcaption>
            <!-- Dentro de <pre> Angular conserva los espacios: por eso cada línea va en una sola línea. -->
            <pre class="pl-terminal__codigo">@for (linea of terminal; track $index; let i = $index) {@if (linea.comando; as comando) {<span class="pl-terminal__linea"><span class="pl-terminal__texto"><code [id]="'pl-comando-' + i"><span class="pl-terminal__prompt" aria-hidden="true">$ </span>@for (pieza of linea.piezas ?? []; track $index) {{{ $first ? '' : ' ' }}<span class="pl-terminal__pieza">{{ pieza }}</span>}</code>@if (linea.nota) {<span>   </span><span class="pl-terminal__nota"># {{ linea.nota }}</span>}</span><button type="button" class="pl-terminal__copiar" [attr.aria-describedby]="'pl-comando-' + i" (click)="copiar(comando)">{{ copiado() === comando ? 'Copiado' : 'Copiar' }}</button></span>} @else {<samp class="pl-terminal__salida">{{ linea.salida }}</samp>}}</pre>
            <p class="ay-visually-hidden" aria-live="polite">{{ anuncio() }}</p>
          </figure>
        </section>

        <section class="pl-intro" aria-label="Qué trae">
          <article class="pl-intro__tarjeta">
            <span class="pl-intro__icono pl-intro__icono--marca" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <h2 class="pl-intro__titulo">Sesión y roles</h2>
            <p class="pl-intro__texto">
              En local entras con el login demo; con el emisor OIDC real, el mismo código. La sesión trae el usuario y sus
              roles.
            </p>
          </article>
          <article class="pl-intro__tarjeta">
            <span class="pl-intro__icono pl-intro__icono--acento" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                <path d="M4 7h10M10 17h10" />
                <circle cx="17" cy="7" r="3" />
                <circle cx="7" cy="17" r="3" />
              </svg>
            </span>
            <h2 class="pl-intro__titulo">{{ urlBackend ? 'Backend conectado' : 'Listo para tu backend' }}</h2>
            <p class="pl-intro__texto">
              El cliente HTTP pone el token y el <code>X-Correlation-Id</code>, y convierte los errores RFC 7807 en mensajes
              claros.
            </p>
          </article>
          <article class="pl-intro__tarjeta">
            <span class="pl-intro__icono pl-intro__icono--neutro" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </span>
            <h2 class="pl-intro__titulo">Sistema de diseño</h2>
            <p class="pl-intro__texto">
              Los componentes de <code>&#64;aybarcorp/ui-angular</code> con su catálogo de casos, en tema claro y oscuro y
              con contraste AA verificado.
            </p>
          </article>
        </section>

        <section class="pl-entorno" aria-label="Entorno">
          <ul class="pl-entorno__lista">
            <li class="pl-entorno__dato">
              <span [class]="desarrollo ? 'pl-punto pl-punto--ok' : 'pl-punto pl-punto--neutro'" aria-hidden="true"></span>
              {{ desarrollo ? 'Entorno local (ng serve)' : 'Build de producción' }}
            </li>
            <li class="pl-entorno__dato">
              <span [class]="acceso.demo ? 'pl-punto pl-punto--acento' : 'pl-punto pl-punto--marca'" aria-hidden="true"></span>
              {{ acceso.demo ? 'Sesión demo, sin emisor' : 'Emisor OIDC' }}
            </li>
            <li [class]="urlBackend ? 'pl-entorno__dato pl-entorno__dato--codigo' : 'pl-entorno__dato'">
              <span class="pl-punto pl-punto--neutro" aria-hidden="true"></span>
              {{ urlBackend ? 'API ' + urlBackend : 'Sin backend configurado' }}
            </li>
          </ul>
        </section>
      </main>
    </div>
  `,
})
export class Bienvenida {
  protected readonly acceso = inject(Acceso);
  protected readonly nombre = NOMBRE_PROYECTO;
  protected readonly conBackend = CON_BACKEND;
  protected readonly ingreso = RUTA_INGRESO;
  // aybar:demo:inicio
  /** Los enlaces de la galería con ng serve; `null` en producción. */
  protected readonly galeria = ENLACES_GALERIA;
  // aybar:demo:fin
  protected readonly desarrollo = isDevMode();
  protected readonly urlBackend = esUrlDePlantilla(environment.aybar.api.baseUrl) ? null : environment.aybar.api.baseUrl;

  private readonly vista = inject(DOCUMENT).defaultView;

  /**
   * Los comandos reales del proyecto: con qué se generó, cómo se arranca y cómo se empaqueta,
   * cada uno con su «Copiar». La línea solo se corta entre piezas del comando, con sangría
   * francesa, y «Copiado» se anuncia en una región viva.
   */
  protected readonly terminal: readonly Linea[] = (() => {
    const frontend = CON_BACKEND ? ' --frontend' : '';
    // En desarrollo, el origen de esta misma página: la demo a veces corre en otro puerto.
    const origen = this.desarrollo ? this.vista?.location.origin : undefined;
    const local = origen ? `${origen}/` : `http://localhost:${PUERTO_DESARROLLO}/`;
    const comando = (texto: string, nota?: string): Linea => ({ comando: texto, piezas: piezasDeComando(texto), nota });
    return [
      comando(`aybar new project ${NOMBRE_PROYECTO}${CON_BACKEND ? ' --backend' : ''} --frontend --ui angular --papel ${PAPEL}`),
      comando(`aybar run${frontend}`),
      { salida: `  ➜  Local:   ${local}` },
      comando(`aybar build${frontend}`, PAPEL === 'remoto' ? 'npm run build:remoto' : 'npm run build'),
    ];
  })();

  /** El comando recién copiado, que su botón muestra como «Copiado», y lo que se anuncia. */
  protected readonly copiado = signal<string | null>(null);
  protected readonly anuncio = signal('');
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected async copiar(comando: string): Promise<void> {
    clearTimeout(this.temporizador);
    try {
      const portapapeles = this.vista?.navigator.clipboard;
      if (!portapapeles) throw new Error('Sin portapapeles');
      await portapapeles.writeText(comando);
      this.copiado.set(comando);
      this.anuncio.set('Copiado');
    } catch {
      // Sin permiso o fuera de un contexto seguro (http que no es localhost).
      this.copiado.set(null);
      this.anuncio.set('No se pudo copiar: selecciona el comando y cópialo a mano.');
    }
    this.temporizador = setTimeout(() => {
      this.copiado.set(null);
      this.anuncio.set('');
    }, 2000);
  }

  protected mensaje(error: unknown): string {
    const codigo = codigoDe(error);
    return codigo ? `${mensajeDe(error)} (${codigo})` : mensajeDe(error);
  }
}
