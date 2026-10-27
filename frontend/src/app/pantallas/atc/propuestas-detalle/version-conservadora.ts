import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyDivider,
  AyHeading,
  AyIcon,
  AyPageHeader,
  AyStack,
  AyTag,
  AyText,
  AyTimeline,
} from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { BannerConflicto } from './banner-conflicto';
import { DerivarTicket } from './derivar-ticket';
import { GuiaSolucion } from './guia-solucion';
import { RecorridoFlujo } from './recorrido-flujo';
import { RegistroInteracciones } from './registro-interacciones';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import {
  DetalleDemo,
  estadoEs,
  nombrePrioridad,
  tiempoRestante,
  tonoEstado,
  tonoPrioridad,
} from './base';

/**
 * Propuesta 1 · Conservadora. Mismos bloques y mismo orden que hoy (ficha, hilo, guía, recorrido,
 * bitácora). Cambia lo mínimo para que se lea mejor: una franja de resumen con el estado, el SLA y el
 * responsable siempre a la vista, y el recorrido del workflow como línea de avance.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-detalle-conservadora',
  standalone: true,
  imports: [
    RecorridoFlujo,
    BannerConflicto,
    DerivarTicket,
    GuiaSolucion,
    RegistroInteracciones,
    AyAlert,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyDivider,
    AyHeading,
    AyIcon,
    AyPageHeader,
    AyStack,
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

      <ay-page-header [titulo]="t.num + ' · ' + estadoEs(t.state)" [descripcion]="t.summary">
        <app-derivar-ticket ayAcciones [ticket]="t" [area]="d.area()" [conSenal]="d.senalActiva()" (derivado)="d.registrarDerivacion($event)" />
        @if (!d.cerrado()) {
          <ay-button ayAcciones tamano="sm" variante="primary" [disabled]="d.cierreBloqueado()">
            Marcar Resuelto
          </ay-button>
        } @else {
          <ay-button ayAcciones tamano="sm" variante="secondary">Reabrir con nuevo SLA</ay-button>
        }
      </ay-page-header>

      <ay-card superficie="solid">
        <ay-card-body padding="sm">
          <div class="c1-resumen" role="group" aria-label="Resumen del ticket">
            <div class="c1-resumen__item">
              <span class="c1-resumen__t">Estado</span>
              <ay-badge size="sm" [tono]="tonoEstado(t.state)">{{ estadoEs(t.state) }}</ay-badge>
            </div>
            <div class="c1-resumen__item">
              <span class="c1-resumen__t">Prioridad</span>
              <span class="c1-linea">
                <ay-badge size="sm" [tono]="tonoPrioridad(t.prio)">{{ nombrePrioridad(t.prio) }}</ay-badge>
                @if (t.rayo) {
                  <ay-badge size="sm" tono="warning">
                    <ay-icon size="16"><svg:path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></ay-icon>
                    Rayo
                  </ay-badge>
                }
              </span>
            </div>
            <div class="c1-resumen__item">
              <span class="c1-resumen__t">SLA</span>
              <span class="c1-linea">
                <ay-badge size="sm" [tono]="sla.tono">{{ sla.txt }}</ay-badge>
                @if (sla.due; as due) {
                  <span ayText="mono" size="xs">{{ tiempoRestante(due) }}</span>
                }
              </span>
            </div>
            <div class="c1-resumen__item">
              <span class="c1-resumen__t">Responsable</span>
              <strong>{{ d.responsable() }}</strong>
            </div>
            <div class="c1-resumen__item">
              <span class="c1-resumen__t">Cliente</span>
              <strong>{{ t.cli }}</strong>
            </div>
          </div>
        </ay-card-body>
      </ay-card>

      <app-recorrido-flujo [d]="d" />

      <app-banner-conflicto [ticket]="t" [area]="d.area()" [retirada]="d.senalRetirada()" [handoffConfirmado]="d.handoffConfirmado()" (retirar)="d.senalRetirada.set($event)" (confirmarRecepcion)="d.handoffConfirmado.set(true)" />

      <div class="c1-columnas">
        <div ayStack gap="4">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Ficha del ticket"
              [subtitulo]="t.num + ' · ' + t.empresa.nombre"
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <section ayStack gap="2" aria-label="Clasificación del ticket">
                <strong ayText="label" size="xs">Clasificación del ticket</strong>
                <dl class="c1-clasif">
                  @for (c of d.clasificacion(); track c.clave) {
                    <div class="c1-clasif__item">
                      <dt>{{ c.clave }}</dt>
                      <dd><ay-tag variante="brand" size="md">{{ c.valor }}</ay-tag></dd>
                    </div>
                  }
                </dl>
              </section>
              <ay-divider espaciado="sm" />
              @for (g of d.fichaGrupos(); track g.id) {
                <section ayStack gap="2" [attr.aria-label]="g.titulo">
                  <strong ayText="label" size="xs">{{ g.titulo }}</strong>
                  <ay-card-pairs [pares]="g.pares" />
                </section>
                @if (!$last) {
                  <ay-divider espaciado="sm" />
                }
              }
              <ay-alert tono="info" size="sm" titulo="Nota de contexto del cliente">{{ t.emotion }}</ay-alert>
            </ay-card-body>
          </ay-card>

          <app-registro-interacciones [ticket]="t" [sugerenciaIa]="d.guia()?.versionActual != null ? d.plantillaIa() : null" />
        </div>

        <div ayStack gap="4">
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Guía de solución"
              subtitulo="Cómo resolver este tipo de ticket (HU-047)"
              nivel="h2"
              [separador]="true"
            >
              <div ayAcciones>
                @if (d.guia()?.versionActual; as ver) {
                  <ay-badge size="sm" tono="info">Versión v{{ ver }}</ay-badge>
                } @else {
                  <ay-badge size="sm" tono="danger">Sin guía</ay-badge>
                }
              </div>
            </ay-card-header>
            <ay-card-body padding="md" gap="md">
              <app-guia-solucion [ticket]="t" />
            </ay-card-body>
          </ay-card>

          <div ayStack gap="2">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">Bitácora de asignaciones</ay-heading>
              <span ayText="subtitle" size="xs">
                Derivaciones y reasignaciones: quién lo tenía, a quién pasó y por qué. No se edita ni se borra (HU-007).
              </span>
            </div>
            <ay-card superficie="solid">
              <ay-card-body padding="md">
                <ay-timeline etiqueta="Bitácora de asignaciones del ticket" [hitos]="d.hitos()" />
              </ay-card-body>
            </ay-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .c1-resumen {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: var(--aybar-space-3);
    }
    .c1-resumen__item { display: flex; flex-direction: column; gap: var(--aybar-space-1); font-size: var(--aybar-font-size-sm); }
    .c1-resumen__t { font-size: var(--aybar-font-size-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--aybar-color-fg-muted); }
    .c1-linea { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .c1-clasif { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--aybar-space-3); margin: 0; }
    .c1-clasif__item { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-1); }
    .c1-clasif dt { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .c1-clasif dd { margin: 0; }
    .c1-columnas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--aybar-space-4); align-items: start; }
    .c1-fila { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-2); }
    .c1-fila--inicio { justify-content: flex-start; }
    .c1-lista { margin: 0; padding-left: var(--aybar-space-5); display: flex; flex-direction: column; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    @media (max-width: 70rem) { .c1-columnas { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class DetalleConservadora {
  readonly ticket = input.required<TicketAtc>();
  protected readonly d = new DetalleDemo(this.ticket, inject(EstadoPrototipoAtcService));

  protected readonly estadoEs = estadoEs;
  protected readonly tonoEstado = tonoEstado;
  protected readonly tonoPrioridad = tonoPrioridad;
  protected readonly nombrePrioridad = nombrePrioridad;
  protected readonly tiempoRestante = tiempoRestante;
}
