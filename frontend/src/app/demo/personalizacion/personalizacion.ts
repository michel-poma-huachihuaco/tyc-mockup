import { Component, computed, inject, signal } from '@angular/core';
import {
  AyAlert,
  AyAppearanceService,
  AyAppearancePanel,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardFooter,
  AyCardHeader,
  AyCheckbox,
  AyFormField,
  AyInput,
  AySelect,
  AySwitch,
  AyTable,
} from '@aybarcorp/ui-angular';
import type { AyColumna, AyOpcionSelect } from '@aybarcorp/ui-angular';
import { ETIQUETA_ESTADO, LOTES, formatoSoles } from '../datos';
import { textoParaCopiar } from '../configuracion';
import { usarAtributosDeApariencia, usarCopiar } from '../utiles';
import { usarTemaLocal } from './tema-local';

/**
 * /demo/personalizacion: el ay-appearance-panel del framework a la izquierda y, a la
 * derecha, una vista previa viva —botones de todas las variantes, campos, tarjetas, una
 * tabla corta, alertas e insignias— en claro y en oscuro a la vez, con un tema local
 * (tema-local.ts). Debajo, la configuración elegida tal como se copia.
 */
@Component({
  selector: 'gl-personalizacion',
  imports: [
    AyAlert,
    AyAppearancePanel,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardFooter,
    AyCardHeader,
    AyCheckbox,
    AyFormField,
    AyInput,
    AySelect,
    AySwitch,
    AyTable,
  ],
  template: `
    <div class="gl-pagina">
      <header class="gl-cabecera">
        <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Experiencia</p>
        <h1 class="gl-titulo">Personalización</h1>
        <p class="gl-texto">
          Siete ejes —paleta, acento, grises, radio, tipografía, profundidad y estilo— más el tema y la densidad. Todas las
          combinaciones de color cumplen AA; lo elegido se aplica en toda la galería y se recuerda en este navegador.
        </p>
      </header>

      <div class="gl-personalizacion">
        <div class="gl-personalizacion__panel gl-superficie">
          <ay-appearance-panel titulo="Apariencia" [nivelTitulo]="2" mostrarPresets />
        </div>

        <section class="gl-personalizacion__vista" aria-labelledby="gl-vista-titulo">
          <h2 id="gl-vista-titulo" class="gl-subtitulo">Vista previa en claro y en oscuro</h2>
          <div class="gl-vista-previa">
            @for (lado of lados; track lado.tema) {
              <div class="gl-vista-previa__lado" [attr.data-gl-tema]="lado.tema" role="group" [attr.aria-label]="'Vista previa en ' + lado.nombre">
                <p class="gl-vista-previa__rotulo">{{ lado.nombre }}</p>
                <div class="gl-vista-previa__botones">
                  <ay-button variante="primary" tamano="sm">Reservar</ay-button>
                  <ay-button variante="accent" tamano="sm">Destacar</ay-button>
                  <ay-button variante="secondary" tamano="sm">Cancelar</ay-button>
                  <ay-button variante="ghost" tamano="sm">Detalle</ay-button>
                  <ay-button variante="danger" tamano="sm">Liberar</ay-button>
                </div>
                <div class="gl-vista-previa__campos">
                  <ay-form-field etiqueta="Correo" [ayuda]="'Vista ' + lado.nombre.toLowerCase()">
                    <ay-input tipo="email" placeholder="nombre@ejemplo.test" size="sm" />
                  </ay-form-field>
                  <ay-form-field etiqueta="Manzana">
                    <ay-select size="sm" [opciones]="manzanas" valor="B" />
                  </ay-form-field>
                  <ay-checkbox [marcado]="true">Solo disponibles</ay-checkbox>
                  <ay-switch [etiqueta]="'Avisos en ' + lado.nombre.toLowerCase()" [activo]="true" />
                </div>
                <ay-card variante="elevated">
                  <ay-card-header titulo="Lote B-07" nivel="h3" subtitulo="Manzana B · 196 m²">
                    <span ayAcciones><ay-badge tono="success" size="sm" punto>Disponible</ay-badge></span>
                  </ay-card-header>
                  <ay-card-body>{{ precio }} · frente 10 m · fondo 19.6 m</ay-card-body>
                  <ay-card-footer><ay-button tamano="sm">Separar</ay-button></ay-card-footer>
                </ay-card>
                <ay-table [leyenda]="'Lotes de la manzana A, ' + lado.nombre.toLowerCase()" [columnas]="columnas" [filas]="filas" />
                <div class="gl-vista-previa__alertas">
                  <ay-alert tono="info" size="sm" anuncio="off">Reserva válida por 72 horas.</ay-alert>
                  <ay-alert tono="success" size="sm" anuncio="off">Pago conciliado.</ay-alert>
                  <ay-alert tono="warning" size="sm" anuncio="off">Cuota por vencer.</ay-alert>
                  <ay-alert tono="danger" size="sm" anuncio="off">Contrato sin firma.</ay-alert>
                </div>
                <div class="gl-vista-previa__insignias">
                  <ay-badge tono="neutral">Borrador</ay-badge>
                  <ay-badge tono="info">Nuevo</ay-badge>
                  <ay-badge tono="success">Pagado</ay-badge>
                  <ay-badge tono="warning">Pendiente</ay-badge>
                  <ay-badge tono="danger">Vencido</ay-badge>
                </div>
              </div>
            }
          </div>
        </section>
      </div>

      <section class="gl-bloque" aria-labelledby="gl-config-titulo">
        <div class="gl-bloque__cabecera">
          <h2 id="gl-config-titulo" class="gl-bloque__titulo">La configuración elegida</h2>
          <p class="gl-bloque__texto">Para fijarla en el proyecto: los atributos en el &lt;html&gt; de src/index.html.</p>
        </div>
        <div class="gl-codigo gl-superficie">
          <pre class="gl-codigo__texto"><code>{{ configuracion() }}</code></pre>
          <div class="gl-codigo__acciones">
            <ay-button variante="secondary" tamano="sm" (click)="copiarConfiguracion()">Copiar configuración</ay-button>
            <ay-button variante="ghost" tamano="sm" (click)="apariencia.restablecer()">Restablecer</ay-button>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class PantallaPersonalizacion {
  protected readonly apariencia = inject(AyAppearanceService);
  private readonly copiar = usarCopiar();
  private readonly atributos = usarAtributosDeApariencia();

  protected readonly lados = [
    { tema: 'light', nombre: 'Claro' },
    { tema: 'dark', nombre: 'Oscuro' },
  ] as const;
  protected readonly manzanas: AyOpcionSelect[] = ['A', 'B', 'C', 'D'].map((m) => ({ value: m, label: `Manzana ${m}` }));
  protected readonly precio = formatoSoles(98400);
  protected readonly columnas: AyColumna[] = [
    { clave: 'id', cabecera: 'Lote' },
    { clave: 'estado', cabecera: 'Estado' },
    { clave: 'precio', cabecera: 'Precio (S/)', alineacion: 'end' },
  ];
  protected readonly filas = LOTES.slice(0, 4).map((l) => ({ id: l.id, estado: ETIQUETA_ESTADO[l.estado], precio: formatoSoles(l.precio) }));

  /** Se recalcula con cada cambio de apariencia: la señal del servicio lo avisa. */
  protected readonly configuracion = computed(() => {
    this.apariencia.apariencia();
    return textoParaCopiar(this.atributos());
  });
  protected readonly copiado = signal(false);

  constructor() {
    usarTemaLocal();
  }

  protected async copiarConfiguracion(): Promise<void> {
    await this.copiar(this.configuracion(), 'Configuración copiada.');
  }
}
