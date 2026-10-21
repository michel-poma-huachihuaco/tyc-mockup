import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { AyAvatar, AyBadge, AyEmptyState, AySplitter } from '@aybarcorp/ui-angular';
import { AUDITORIA, AVISOS, HOY, PERSONAS } from '../datos';
import { haceCuanto, usarMedia } from './medir';
import { CARPETAS, crearBandeja, mensajesDe } from './modelo';
import type { IdCarpeta, Mensaje } from './modelo';

/**
 * Un ay-splitter dentro de otro, como un cliente de correo: carpetas | (lista | lectura).
 * Desde 768px los paneles van lado a lado; en el celular, apilados (cada eje recuerda su
 * propio reparto). Las carpetas pliegan con Intro desde su separador. Los mensajes salen de
 * los avisos y la auditoría sintéticos; abrir uno lo marca como leído, solo en memoria.
 */
@Component({
  selector: 'gl-bandeja-correo',
  imports: [AyAvatar, AyBadge, AyEmptyState, AySplitter],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './correo.css',
  host: { class: 'gl-correo' },
  template: `
    <ay-splitter
      [orientacion]="eje()"
      etiqueta="Ajustar el tamaño de las carpetas"
      [tamano]="lado() ? 22 : 24"
      [minimo]="14"
      [maximo]="40"
      plegable
      [clavePersistencia]="'galeria:correo-carpetas-' + eje()"
    >
      <nav ayPanelInicio class="gl-correo__carpetas" aria-label="Carpetas">
        <ul class="gl-correo__lista-carpetas">
          @for (c of carpetas; track c.id) {
            <li>
              <button
                type="button"
                class="gl-correo__carpeta"
                [attr.aria-current]="c.id === carpeta() ? 'true' : null"
                (click)="carpeta.set(c.id)"
              >
                <span class="gl-correo__carpeta-nombre">{{ c.nombre }}</span>
                @if (sinLeerEn(c.id); as n) {
                  <ay-badge tono="info" size="sm">{{ n }}<span class="ay-visually-hidden"> sin leer</span></ay-badge>
                }
              </button>
            </li>
          }
        </ul>
      </nav>
      <div ayPanelFin class="gl-correo__resto">
        <ay-splitter
          [orientacion]="eje()"
          etiqueta="Ajustar el tamaño de la lista de mensajes"
          [tamano]="lado() ? 42 : 45"
          [minimo]="25"
          [maximo]="75"
          [clavePersistencia]="'galeria:correo-lista-' + eje()"
        >
          <div ayPanelInicio>
            @if (mensajes().length === 0) {
              <div class="gl-correo__vacio">
                <ay-empty-state size="compact" variante="no-results" [titulo]="nombreCarpeta() + ' está vacía'" descripcion="Prueba con otra carpeta." />
              </div>
            } @else {
              <ul class="gl-correo__lista" [attr.aria-label]="'Mensajes de ' + nombreCarpeta()">
                @for (m of mensajes(); track m.id) {
                  <li>
                    <button
                      type="button"
                      class="gl-correo__mensaje"
                      [attr.aria-current]="m.id === mensaje()?.id ? 'true' : null"
                      [attr.data-sin-leer]="sinLeer(m) ? '' : null"
                      (click)="abrir(m)"
                    >
                      <ay-avatar [nombre]="m.remitente" size="sm" decorativo />
                      <span class="gl-correo__remitente">{{ m.remitente }}</span>
                      <time class="gl-correo__fecha" [attr.datetime]="m.fecha">{{ hace(m.fecha) }}</time>
                      <span class="gl-correo__asunto">
                        @if (sinLeer(m)) {
                          <span class="ay-visually-hidden">Sin leer: </span>
                        }
                        {{ m.asunto }}
                      </span>
                      <span class="gl-correo__extracto">{{ m.extracto }}</span>
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
          <div ayPanelFin class="gl-correo__lectura">
            @if (mensaje(); as abierto) {
              <article class="gl-correo__articulo" aria-labelledby="gl-correo-asunto">
                <h3 id="gl-correo-asunto" class="gl-correo__titulo">{{ abierto.asunto }}</h3>
                <div class="gl-correo__de">
                  <ay-avatar [nombre]="abierto.remitente" size="md" decorativo />
                  <p class="gl-correo__de-texto">
                    <strong>{{ abierto.remitente }}</strong>
                    <span>{{ abierto.correo }} · <time [attr.datetime]="abierto.fecha">{{ hace(abierto.fecha) }}</time></span>
                  </p>
                </div>
                <div class="gl-correo__cuerpo">
                  @for (parrafo of abierto.parrafos; track parrafo) {
                    <p>{{ parrafo }}</p>
                  }
                </div>
              </article>
            } @else {
              <ay-empty-state size="compact" variante="no-results" titulo="Ningún mensaje abierto" descripcion="Elige uno de la lista." />
            }
          </div>
        </ay-splitter>
      </div>
    </ay-splitter>
  `,
})
export class BandejaCorreo {
  protected readonly carpetas = CARPETAS;
  private readonly bandeja = crearBandeja(AVISOS, AUDITORIA, PERSONAS);

  protected readonly lado = usarMedia('(min-width: 768px)');
  protected readonly eje = computed(() => (this.lado() ? 'horizontal' : 'vertical'));
  protected readonly carpeta = signal<IdCarpeta>('entrada');
  private readonly elegidos = signal<Partial<Record<IdCarpeta, string>>>({});
  private readonly leidos = signal<ReadonlySet<string>>(new Set());

  protected readonly mensajes = computed(() => mensajesDe(this.bandeja, this.carpeta()));
  protected readonly mensaje = computed<Mensaje | null>(() => {
    const lista = this.mensajes();
    return lista.find((m) => m.id === this.elegidos()[this.carpeta()]) ?? lista[0] ?? null;
  });
  protected readonly nombreCarpeta = computed(() => CARPETAS.find((c) => c.id === this.carpeta())?.nombre ?? this.carpeta());

  protected sinLeer(m: Mensaje): boolean {
    return !m.leido && !this.leidos().has(m.id);
  }

  protected sinLeerEn(carpeta: IdCarpeta): number {
    return this.bandeja.filter((m) => m.carpeta === carpeta && this.sinLeer(m)).length;
  }

  protected abrir(m: Mensaje): void {
    this.elegidos.update((actuales) => ({ ...actuales, [this.carpeta()]: m.id }));
    this.leidos.update((actuales) => new Set(actuales).add(m.id));
  }

  protected hace(iso: string): string {
    return haceCuanto(iso, HOY);
  }
}
