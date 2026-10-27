import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import {
  AyAlert,
  AyAvatar,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardPairs,
  AyIcon,
  AyPageHeader,
  AyProgressBar,
  AyStatGroup,
  AyStack,
  AyTabs,
  AyTag,
  AyText,
  AyTimeline,
  type AyTabsElemento,
} from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { BannerConflicto } from './banner-conflicto';
import { DerivarTicket } from './derivar-ticket';
import { GuiaSolucion } from './guia-solucion';
import { RecorridoFlujo } from './recorrido-flujo';
import { crearInteraccionesMock } from './mock-interacciones';
import { RegistroInteracciones } from './registro-interacciones';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import {
  DetalleDemo,
  areaEs,
  estadoEs,
  nombrePrioridad,
  tiempoRestante,
  tonoBarra,
  tonoEstado,
  tonoPrioridad,
} from './base';

/**
 * Propuesta 2 · Intermedia. La página larga de dos columnas se parte en tres pestañas por tarea
 * (`ay-tabs`: conversar, resolver, auditar) y la ficha pasa a una columna fija a la derecha junto con el
 * plazo SLA (`ay-progress-bar`). El recorrido del workflow es una línea de avance y las personas son `ay-avatar`.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-detalle-intermedia',
  standalone: true,
  imports: [
    RecorridoFlujo,
    BannerConflicto,
    DerivarTicket,
    GuiaSolucion,
    RegistroInteracciones,
    AyAlert,
    AyAvatar,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardPairs,
    AyIcon,
    AyPageHeader,
    AyProgressBar,
    AyStatGroup,
    AyStack,
    AyTabs,
    AyTag,
    AyText,
    AyTimeline,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = ticket();
    @let sla = d.sla();
    <div ayStack gap="4">
      <div>
        <ay-button tamano="sm" variante="ghost">← Volver a la Bandeja de tickets</ay-button>
      </div>

      <ay-page-header [titulo]="t.num + ' · ' + t.cli" [descripcion]="t.summary">
        <ay-badge ayEstado size="sm" [tono]="tonoEstado(t.state)">{{ estadoEs(t.state) }}</ay-badge>
        @if (t.rayo) {
          <ay-badge ayEstado size="sm" tono="warning">
            <ay-icon size="16"><svg:path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></ay-icon>
            Rayo
          </ay-badge>
        }
        <app-derivar-ticket ayAcciones [ticket]="t" [area]="d.area()" [conSenal]="d.senalActiva()" (derivado)="d.registrarDerivacion($event)" />
        @if (!d.cerrado()) {
          <ay-button ayAcciones tamano="sm" variante="primary" [disabled]="d.cierreBloqueado()">
            Marcar Resuelto
          </ay-button>
        } @else {
          <ay-button ayAcciones tamano="sm" variante="secondary">Reabrir con nuevo SLA</ay-button>
        }
      </ay-page-header>

      <app-recorrido-flujo [d]="d" />

      <app-banner-conflicto [ticket]="t" [area]="d.area()" [retirada]="d.senalRetirada()" [handoffConfirmado]="d.handoffConfirmado()" (retirar)="d.senalRetirada.set($event)" (confirmarRecepcion)="d.handoffConfirmado.set(true)" />

      <div class="c2-cuerpo">
        <section class="c2-principal">
          <ay-tabs etiqueta="Secciones del ticket" [items]="pestanas()" [(valor)]="pestana">
            @switch (pestana()) {
              @case ('conversacion') {
                <div class="c2-panel">
                  <app-registro-interacciones [ticket]="t" [sugerenciaIa]="d.guia()?.versionActual != null ? d.plantillaIa() : null" />
                </div>
              }

              @case ('guia') {
                <div ayStack gap="4" class="c2-panel">
                  <ay-card superficie="solid">
                    <ay-card-body padding="md" gap="md">
                      <strong ayText="label">Guía de solución · cómo resolver este tipo de ticket (HU-047)</strong>
                      <app-guia-solucion [ticket]="t" />
                    </ay-card-body>
                  </ay-card>

                </div>
              }

              @case ('bitacora') {
                <div class="c2-panel">
                  <ay-card superficie="solid">
                    <ay-card-body padding="md" gap="md">
                      <div ayStack gap="1">
                        <strong ayText="label">Bitácora de asignaciones</strong>
                        <span ayText="body" size="xs">
                          Derivaciones y reasignaciones: quién lo tenía, a quién pasó y por qué. No se edita ni se borra (HU-007).
                        </span>
                      </div>
                      <ay-timeline etiqueta="Bitácora de asignaciones del ticket" [hitos]="d.hitos()" />
                    </ay-card-body>
                  </ay-card>
                </div>
              }
            }
          </ay-tabs>
        </section>

        <aside class="c2-lateral" aria-label="Ficha del ticket">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-body padding="md" gap="md">
              <section ayStack gap="2" aria-label="Clasificación del ticket">
                <strong ayText="label" size="xs">Clasificación del ticket</strong>
                <dl class="c2-clasif">
                  @for (c of d.clasificacion(); track c.clave) {
                    <div class="c2-clasif__item">
                      <dt>{{ c.clave }}</dt>
                      <dd><ay-tag variante="brand" size="md">{{ c.valor }}</ay-tag></dd>
                    </div>
                  }
                </dl>
              </section>

              <section ayStack gap="2" aria-label="Estado del compromiso SLA">
                <strong ayText="label" size="xs">Estado del compromiso SLA</strong>
                <div class="c2-fila c2-fila--inicio">
                  <ay-badge size="sm" [tono]="sla.tono">{{ sla.txt }}</ay-badge>
                  <ay-badge size="sm" [tono]="tonoPrioridad(t.prio)">Prioridad {{ nombrePrioridad(t.prio) }}</ay-badge>
                </div>
                @if (sla.due; as due) {
                  <span ayText="mono" size="xs">{{ tiempoRestante(due) }}</span>
                }
                <ay-progress-bar
                  etiqueta="Plazo SLA consumido"
                  [valor]="d.consumidoPct()"
                  [tono]="tonoBarra(sla.tono)"
                  size="sm"
                />
              </section>

              <section ayStack gap="2" aria-label="Responsable del ticket">
                <strong ayText="label" size="xs">Responsable del ticket</strong>
                <div class="c2-gestor">
                  <ay-avatar [nombre]="d.responsable()" size="lg" decorativo />
                  <div ayStack gap="1">
                    <strong>{{ d.responsable() }}</strong>
                    <span ayText="body" size="xs">
                      Responsable actual · {{ areaEs(d.area()) }}
                    </span>
                  </div>
                </div>
              </section>

              <section ayStack gap="2" aria-label="Cliente y proyecto">
                <strong ayText="label" size="xs">Cliente y proyecto</strong>
                <ay-card-pairs [pares]="d.datosCliente()" />
              </section>

              <section ayStack gap="2" aria-label="Plazos del SLA">
                <strong ayText="label" size="xs">Plazos del SLA</strong>
                <ay-stat-group size="sm" [filete]="true" [elementos]="d.cifrasPlazo()" />
                <ay-card-pairs [pares]="d.datosPlazoExtra()" />
              </section>

              <ay-alert tono="info" size="sm" titulo="Nota de contexto del cliente">{{ t.emotion }}</ay-alert>
            </ay-card-body>
          </ay-card>
        </aside>
      </div>
    </div>
  `,
  styles: `
    .c2-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr) 26rem; gap: var(--aybar-space-4); align-items: start; }
    .c2-principal { min-width: 0; }
    .c2-panel { padding-top: var(--aybar-space-4); }
    .c2-fila { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-2); }
    .c2-fila--inicio { justify-content: flex-start; }
    .c2-lista { margin: 0; padding-left: var(--aybar-space-5); display: flex; flex-direction: column; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .c2-lateral { position: sticky; top: var(--aybar-space-4); }
    .c2-clasif { display: grid; grid-template-columns: repeat(3, minmax(0, auto)); justify-content: space-between; gap: var(--aybar-space-3); margin: 0; }
    .c2-clasif__item { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-1); }
    .c2-clasif dt { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .c2-clasif dd { margin: 0; }
    .c2-gestor { display: flex; align-items: center; gap: var(--aybar-space-3); }
    @media (max-width: 70rem) {
      .c2-cuerpo { grid-template-columns: minmax(0, 1fr); }
      .c2-lateral { position: static; }
    }
  `,
})
export class DetalleIntermedia {
  readonly ticket = input.required<TicketAtc>();
  protected readonly d = new DetalleDemo(this.ticket, inject(EstadoPrototipoAtcService));
  /** `?tab=guia|bitacora` abre directamente esa pestaña. */
  protected readonly pestana = signal(
    ['guia', 'bitacora'].includes(new URLSearchParams(globalThis.location?.search ?? '').get('tab') ?? '')
      ? new URLSearchParams(globalThis.location?.search ?? '').get('tab')!
      : 'conversacion',
  );

  protected pestanas(): AyTabsElemento[] {
    return [
      { value: 'conversacion', label: 'Interacciones', contador: crearInteraccionesMock(this.ticket()).length },
      { value: 'guia', label: 'Guía de solución' },
      { value: 'bitacora', label: 'Bitácora', contador: this.d.asignaciones().length },
    ];
  }

  protected readonly areaEs = areaEs;
  protected readonly estadoEs = estadoEs;
  protected readonly tonoEstado = tonoEstado;
  protected readonly tonoPrioridad = tonoPrioridad;
  protected readonly tonoBarra = tonoBarra;
  protected readonly nombrePrioridad = nombrePrioridad;
  protected readonly tiempoRestante = tiempoRestante;
}
