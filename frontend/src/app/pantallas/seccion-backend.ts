import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { ErrorAybar } from '@aybarcorp/http';
import {
  AyAlert,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyError401,
  AySpinner,
} from '@aybarcorp/ui-angular';
import type { ParCardPairs } from '@aybarcorp/ui-angular';
import { environment } from '../../environments/environment';
import { RUTA_QUIEN_SOY, RecursosEjemplo } from '../api/recursos-ejemplo';
import type { QuienSoy } from '../api/recursos-ejemplo';
import { esUrlDePlantilla, rutaIngreso } from '../rutas';
import { mensajeDe } from './utiles';

type Estado =
  | { readonly fase: 'sin-backend' }
  | { readonly fase: 'cargando' }
  | { readonly fase: 'ok'; readonly datos: QuienSoy }
  | { readonly fase: 'error'; readonly error: unknown };

/**
 * El backend del proyecto: llama a GET /recursos-ejemplo/quien-soy con el cliente de
 * @aybarcorp/http (a través de RecursosEjemplo) y muestra lo que el backend leyó del token.
 * Con la sesión demo no hay token: el cliente ni siquiera envía la petición, responde 401
 * —sin mandar al login— y la sección lo dice tal cual.
 */
@Component({
  selector: 'app-seccion-backend',
  imports: [AyAlert, AyButton, AyCard, AyCardBody, AyCardHeader, AyCardPairs, AyError401, AySpinner],
  template: `
    <ay-card>
      <ay-card-header titulo="Backend" nivel="h2" [subtitulo]="urlBackend" />
      <ay-card-body>
        @switch (estado().fase) {
          @case ('sin-backend') {
            <p>
              La URL de la API es la de plantilla: define api.baseUrl en src/environments (README.md) y
              aquí se llamará a {{ ruta }}.
            </p>
          }
          @case ('cargando') {
            <ay-spinner size="sm" [etiqueta]="'Llamando a ' + ruta" mostrarTexto />
          }
          @case ('ok') {
            <ay-alert tono="success" size="sm" anuncio="off">El backend validó el token y respondió {{ ruta }}.</ay-alert>
            <ay-card-pairs [pares]="pares()" />
          }
          @case ('error') {
            @if (noAutenticado() && demo()) {
              <ay-alert tono="warning" titulo="La sesión demo no puede llamar al backend (401)" anuncio="off">
                La sesión demo no tiene access token: el cliente HTTP no envía la petición y responde 401, lo mismo
                que haría el backend protegido. Para llamarlo hace falta el emisor OIDC real: README.md, «Pasar al
                emisor real».
                <ay-button ayAcciones variante="ghost" tamano="sm" (click)="llamar()">Repetir la llamada</ay-button>
              </ay-alert>
            } @else if (noAutenticado()) {
              <ay-error-401 scope="region" causa="expired" [hrefAcceso]="ingreso" />
            } @else {
              <ay-alert tono="danger" titulo="No se pudo llamar al backend" anuncio="off">
                {{ descripcionError() }}
                <ay-button ayAcciones variante="ghost" tamano="sm" (click)="llamar()">Repetir la llamada</ay-button>
              </ay-alert>
            }
          }
        }
      </ay-card-body>
    </ay-card>
  `,
})
export class SeccionBackend {
  /** La sesión es la simulada: un 401 se explica, no se trata como sesión vencida. */
  readonly demo = input(false);

  private readonly recursos = inject(RecursosEjemplo);
  private control: AbortController | null = null;

  protected readonly ruta = RUTA_QUIEN_SOY;
  protected readonly urlBackend = environment.aybar.api.baseUrl;
  protected readonly ingreso = rutaIngreso(globalThis.location?.pathname ?? '/');
  protected readonly estado = signal<Estado>(
    esUrlDePlantilla(environment.aybar.api.baseUrl) ? { fase: 'sin-backend' } : { fase: 'cargando' },
  );

  protected readonly pares = computed<ParCardPairs[]>(() => {
    const estado = this.estado();
    if (estado.fase !== 'ok') return [];
    const { datos } = estado;
    return [
      { clave: 'Usuario', valor: datos.username ?? '—' },
      { clave: 'Cuenta', valor: datos.userAccountId ?? '—' },
      { clave: 'Empresa', valor: datos.companyId ?? '—' },
      { clave: 'Roles', valor: datos.roles?.length ? datos.roles.join(', ') : 'Sin roles' },
    ];
  });

  protected readonly noAutenticado = computed(() => {
    const estado = this.estado();
    return estado.fase === 'error' && estado.error instanceof ErrorAybar && estado.error.esNoAutenticado;
  });

  protected readonly descripcionError = computed(() => {
    const estado = this.estado();
    return estado.fase === 'error' ? describir(estado.error) : '';
  });

  constructor() {
    if (this.estado().fase === 'cargando') this.llamar();
    inject(DestroyRef).onDestroy(() => this.control?.abort());
  }

  protected llamar(): void {
    this.control?.abort();
    const control = new AbortController();
    this.control = control;
    this.estado.set({ fase: 'cargando' });
    this.recursos.quienSoy(control.signal).then(
      (datos) => this.estado.set({ fase: 'ok', datos }),
      (error: unknown) => {
        if (!control.signal.aborted) this.estado.set({ fase: 'error', error });
      },
    );
  }
}

function describir(error: unknown): string {
  if (!(error instanceof ErrorAybar)) return mensajeDe(error);
  if (error.fallo === 'red') {
    return 'No hubo respuesta: ¿está levantado el backend (aybar run) y permite este origen en CORS?';
  }
  if (error.fallo === 'tiempo') return 'El backend no respondió a tiempo.';
  const titulo = [error.status ? `HTTP ${error.status}` : null, error.titulo].filter(Boolean).join(' · ');
  const traza = error.correlationId ? ` Correlation ID: ${error.correlationId}.` : '';
  return `${titulo}${error.detalle ? `: ${error.detalle}` : '.'}${traza}`;
}
