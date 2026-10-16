import { Component, DOCUMENT, ElementRef, ViewEncapsulation, computed, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AyFormField, AySegmentedControl, AySelect } from '@aybarcorp/ui-angular';
import type { AySegmentoOpcion } from '@aybarcorp/ui-angular';
import { EstadoGaleria } from '../estado';
import { RAIZ_GALERIA, SECCIONES } from '../navegacion';
import { usarAnchoDe } from './medir';
import { ANCHOS, anchoVista, describirEscala, escalaParaCaber, rutaEmbebida } from './modelo';

/**
 * Una pantalla de la galería en un iframe del propio sitio (`?embebido=1`, sin el marco), al
 * ancho de un celular, una tableta, un portátil o un escritorio, reducida para caber. Los
 * breakpoints y las container queries de dentro ven el ancho del iframe, no el de esta
 * ventana. Redimensionado no se ofrece: se mostraría a sí misma dentro de sí misma.
 */
@Component({
  selector: 'gl-vista-previa',
  imports: [AyFormField, AySegmentedControl, AySelect],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './vista-previa.css',
  host: { class: 'gl-vista-previa' },
  template: `
    <div class="gl-vista__controles">
      <ay-segmented-control etiqueta="Ancho de la vista previa" [opciones]="opcionesAncho" [valor]="'' + vista().ancho" (valorChange)="ancho.set(+$event)" />
      <div class="gl-vista__campo">
        <ay-form-field etiqueta="Pantalla">
          <ay-select [opciones]="opcionesRuta()" [(valor)]="ruta" />
        </ay-form-field>
      </div>
      <p class="gl-vista__escala">{{ vista().nombre }} · {{ escalaTexto() }}</p>
    </div>
    <div class="gl-vista">
      <div #lienzo class="gl-vista__lienzo" [style.--gl-vista-alto]="anidada ? null : altoEscalado() + 'px'">
        @if (anidada) {
          <p class="gl-vista__aviso">La vista previa no se repite dentro de sí misma.</p>
        } @else {
          <div
            class="gl-vista__dispositivo"
            [style.--gl-vista-ancho]="vista().ancho + 'px'"
            [style.--gl-vista-alto-real]="vista().alto + 'px'"
            [style.--gl-vista-escala]="escala()"
          >
            <iframe class="gl-vista__marco" [src]="src()" [title]="titulo()" loading="lazy"></iframe>
          </div>
        }
      </div>
    </div>
  `,
})
export class VistaPrevia {
  private readonly estado = inject(EstadoGaleria);
  private readonly saneador = inject(DomSanitizer);
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly lienzo = viewChild.required<ElementRef<HTMLElement>>('lienzo');

  protected readonly opcionesAncho: AySegmentoOpcion[] = ANCHOS.map((a) => ({ valor: String(a.ancho), etiqueta: `${a.ancho} px` }));
  protected readonly ancho = signal<number>(ANCHOS[3].ancho);
  protected readonly ruta = signal(RAIZ_GALERIA);
  private readonly disponible = usarAnchoDe(() => this.lienzo().nativeElement);
  // Dentro de su propio iframe (alguien navegó hasta aquí) no se anida otra vez.
  protected readonly anidada = this.ventana !== null && this.ventana.self !== this.ventana.top;

  private readonly rutas = computed(() =>
    SECCIONES.filter((s) => s.id !== 'redimensionado' && (this.estado.esAdmin() || !s.soloAdmin)),
  );
  protected readonly opcionesRuta = computed(() => this.rutas().map((s) => ({ value: s.ruta, label: s.titulo })));
  protected readonly vista = computed(() => anchoVista(this.ancho()));
  protected readonly escala = computed(() => escalaParaCaber(this.vista().ancho, this.disponible()));
  protected readonly altoEscalado = computed(() => Math.round(this.vista().alto * this.escala()));
  protected readonly escalaTexto = computed(() => describirEscala(this.vista(), this.escala()));
  protected readonly titulo = computed(() => {
    const nombre = this.rutas().find((s) => s.ruta === this.ruta())?.titulo ?? 'Galería';
    return `${nombre}, de la galería, a ${this.vista().ancho} px de ancho`;
  });
  // Una ruta de este mismo sitio, armada aquí con rutaEmbebida (no la escribe nadie): segura.
  protected readonly src = computed(() => this.saneador.bypassSecurityTrustResourceUrl(rutaEmbebida(this.ruta())));
}
