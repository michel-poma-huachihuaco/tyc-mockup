import { Component, ViewEncapsulation } from '@angular/core';
import { AyBadge, AyCard, AyCardBody, AyCardHeader, AySplitter } from '@aybarcorp/ui-angular';
import { AUDITORIA, ETIQUETA_ESTADO, HOY, LOTES, PERSONAS, formatoSoles } from '../datos';
import type { EstadoLote } from '../datos';
import { BandejaCorreo } from './bandeja-correo';
import { haceCuanto } from './medir';
import { TarjetasContenedor } from './tarjetas-contenedor';
import { VistaPrevia } from './vista-previa';

type TonoBadge = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONO_ESTADO: Record<EstadoLote, TonoBadge> = { disponible: 'success', reservado: 'warning', vendido: 'info', bloqueado: 'neutral' };

const CODIGO = `<ay-splitter
  etiqueta="Ajustar el ancho del código"
  [tamano]="45"
  [minimo]="25"
  [maximo]="75"
  clavePersistencia="galeria:redim-horizontal"
>
  <pre ayPanelInicio>…</pre>
  <div ayPanelFin><ay-card>…</ay-card></div>
</ay-splitter>`;

/**
 * /demo/redimensionado: el espacio que se reparte. ay-splitter horizontal y vertical, uno
 * anidado en otro como una bandeja de correo, tarjetas que cambian de disposición con su
 * contenedor (container queries) y la galería en un iframe a cuatro anchos de dispositivo.
 * Cada separador se maneja con el puntero o con el teclado y recuerda su reparto.
 */
@Component({
  selector: 'gl-redimensionado',
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AySplitter, BandejaCorreo, TarjetasContenedor, VistaPrevia],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './redimensionado.css',
  template: `
    <div class="gl-pagina">
      <header class="gl-cabecera">
        <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Experiencia</p>
        <h1 class="gl-titulo">Redimensionado</h1>
        <p class="gl-texto">
          Splitter, container queries y la galería a varios anchos. Arrastra los separadores o enfócalos con Tab y usa las
          flechas.
        </p>
      </header>

      <div class="gl-redim">
        <section class="gl-redim__seccion" aria-labelledby="gl-redim-ejes">
          <div class="gl-redim__cabecera">
            <h2 id="gl-redim-ejes" class="gl-redim__titulo">Dos paneles, dos ejes</h2>
            <p class="gl-redim__texto">
              Arrastra la línea entre los paneles, o enfócala con <kbd>Tab</kbd> y usa las flechas (<kbd>Mayús</kbd> para
              pasos largos), <kbd>Inicio</kbd> y <kbd>Fin</kbd> para los extremos e <kbd>Intro</kbd> para plegar el primero
              cuando se puede. El reparto se recuerda en este navegador.
            </p>
          </div>
          <div class="gl-redim__par">
            <figure class="gl-redim__demo">
              <figcaption class="gl-redim__leyenda"><strong>Horizontal</strong> · el código y lo que pinta</figcaption>
              <div class="gl-redim__marco">
                <ay-splitter etiqueta="Ajustar el ancho del código" [tamano]="45" [minimo]="25" [maximo]="75" clavePersistencia="galeria:redim-horizontal">
                  <pre ayPanelInicio class="gl-redim__codigo">{{ codigo }}</pre>
                  <div ayPanelFin class="gl-redim__muestra">
                    <ay-card variante="elevated">
                      <ay-card-header
                        nivel="h3"
                        [titulo]="'Lote ' + lote.id"
                        [subtitulo]="'Manzana ' + lote.manzana + ' · ' + lote.area + ' m² · ' + lote.frente + ' × ' + lote.fondo + ' m'"
                      >
                        <span ayAcciones><ay-badge [tono]="tono(lote.estado)" size="sm">{{ etiqueta[lote.estado] }}</ay-badge></span>
                      </ay-card-header>
                      <ay-card-body>
                        <p class="gl-redim__precio">{{ soles(lote.precio) }}</p>
                      </ay-card-body>
                    </ay-card>
                  </div>
                </ay-splitter>
              </div>
            </figure>
            <figure class="gl-redim__demo">
              <figcaption class="gl-redim__leyenda"><strong>Vertical</strong> · la tabla arriba, el registro abajo (plegable)</figcaption>
              <div class="gl-redim__marco">
                <ay-splitter
                  orientacion="vertical"
                  etiqueta="Ajustar el alto de la tabla de lotes"
                  [tamano]="58"
                  [minimo]="20"
                  [maximo]="85"
                  plegable
                  clavePersistencia="galeria:redim-vertical"
                >
                  <table ayPanelInicio class="gl-redim__tabla">
                    <caption class="ay-visually-hidden">Los primeros lotes del proyecto</caption>
                    <thead>
                      <tr>
                        <th scope="col">Lote</th>
                        <th scope="col" class="gl-redim__cifra">Área</th>
                        <th scope="col" class="gl-redim__cifra">Precio</th>
                        <th scope="col">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (l of filas; track l.id) {
                        <tr>
                          <th scope="row">{{ l.id }}</th>
                          <td class="gl-redim__cifra">{{ l.area }} m²</td>
                          <td class="gl-redim__cifra">{{ soles(l.precio) }}</td>
                          <td><ay-badge [tono]="tono(l.estado)" size="sm">{{ etiqueta[l.estado] }}</ay-badge></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                  <ol ayPanelFin class="gl-redim__registro" aria-label="Registro de actividad">
                    @for (e of registro; track e.id) {
                      <li><time [attr.datetime]="e.fecha">{{ hace(e.fecha) }}</time> · {{ nombre(e.actor) }} · {{ e.accion }}</li>
                    }
                  </ol>
                </ay-splitter>
              </div>
            </figure>
          </div>
        </section>

        <section class="gl-redim__seccion" aria-labelledby="gl-redim-correo">
          <div class="gl-redim__cabecera">
            <h2 id="gl-redim-correo" class="gl-redim__titulo">Uno dentro de otro: una bandeja de correo</h2>
            <p class="gl-redim__texto">
              Carpetas, lista y lectura con dos Splitter anidados. Desde 768 px van lado a lado; en el celular se apilan, y cada
              disposición recuerda su reparto. Intro en el primer separador pliega las carpetas.
            </p>
          </div>
          <gl-bandeja-correo />
        </section>

        <section class="gl-redim__seccion" aria-labelledby="gl-redim-contenedor">
          <div class="gl-redim__cabecera">
            <h2 id="gl-redim-contenedor" class="gl-redim__titulo">Tarjetas que miran su contenedor</h2>
            <p class="gl-redim__texto">
              Estas tarjetas no consultan el ancho de la ventana sino el de su panel (container queries). Arrastra el separador:
              por debajo de 22 rem se apilan, desde 22 rem ponen la cifra al lado y desde 36 rem pasan a dos columnas con el
              desglose por manzana.
            </p>
          </div>
          <gl-tarjetas-contenedor />
        </section>

        <section class="gl-redim__seccion" aria-labelledby="gl-redim-anchos">
          <div class="gl-redim__cabecera">
            <h2 id="gl-redim-anchos" class="gl-redim__titulo">La galería a cuatro anchos</h2>
            <p class="gl-redim__texto">
              Una pantalla de la galería en un iframe de este mismo sitio, con ?embebido=1 para quitarle el marco, al ancho de
              cada dispositivo y reducida para caber aquí. Sus breakpoints ven el ancho del iframe, no el de esta ventana.
            </p>
          </div>
          <gl-vista-previa />
        </section>
      </div>
    </div>
  `,
})
export class PantallaRedimensionado {
  protected readonly codigo = CODIGO;
  /** El lote de la vista previa: el primero disponible. */
  protected readonly lote = LOTES.find((l) => l.estado === 'disponible') ?? LOTES[0]!;
  protected readonly filas = LOTES.slice(0, 12);
  protected readonly registro = AUDITORIA.slice(0, 14);
  protected readonly etiqueta = ETIQUETA_ESTADO;
  private readonly nombres = new Map(PERSONAS.map((p) => [p.id, p.nombre]));

  protected tono(estado: EstadoLote): TonoBadge {
    return TONO_ESTADO[estado];
  }

  protected soles(monto: number): string {
    return formatoSoles(monto);
  }

  protected hace(iso: string): string {
    return haceCuanto(iso, HOY);
  }

  protected nombre(id: string): string {
    return this.nombres.get(id) ?? id;
  }
}
