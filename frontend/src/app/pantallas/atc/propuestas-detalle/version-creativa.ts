import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import {
  AyAlert,
  AyAvatar,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyPageHeader,
  AyStack,
  AyStatGroup,
  AyTabs,
  AyTag,
  AyText,
  AyTimeline,
  type AyStatItem,
  type AyTabsElemento,
} from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { BannerConflicto } from './banner-conflicto';
import { DerivarTicket, type DerivacionEvento } from './derivar-ticket';
import { GuiaSolucion } from './guia-solucion';
import { RecorridoFlujo } from './recorrido-flujo';
import { crearInteraccionesMock } from './mock-interacciones';
import { RegistroInteracciones } from './registro-interacciones';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import {
  DetalleDemo,
  areaEs,
  estadoEs,
  fmt,
  nombrePrioridad,
  tiempoRestante,
  tonoEstado,
  tonoPrioridad,
  traducir,
} from './base';

/**
 * Propuesta 3 · Creativa. El detalle se vuelve un «centro de mando» del caso: arriba, el plazo SLA como
 * `ay-circular-progress` y el recorrido del workflow como línea de avance; en el centro, tres pestañas
 * (`ay-tabs`: Interacciones, Guía de solución y Bitácora) y a la derecha la ficha del ticket.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-detalle-creativa',
  standalone: true,
  imports: [
    RecorridoFlujo,
    BannerConflicto,
    DerivarTicket,
    GuiaSolucion,
    RegistroInteracciones,
    AyAlert,
    AyAvatar,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyPageHeader,
        AyStack,
    AyStatGroup,
    AyTabs,
    AyTag,
    AyText,
    AyTimeline,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = ticket();
    <div ayStack gap="4">
      <div class="c3-volver">
        <ay-button tamano="sm" variante="ghost" (click)="volver.emit()">← Volver a {{ volverA() }}</ay-button>
      </div>

      <ay-page-header [titulo]="t.num" [descripcion]="t.summary">
        @if (t.contract; as contrato) {
          <ay-button ayAcciones tamano="sm" variante="ghost" (click)="verContrato.emit(contrato)">Ver contrato {{ contrato }}</ay-button>
        }
        <app-derivar-ticket ayAcciones [ticket]="t" [area]="d.area()" [conSenal]="d.senalActiva()" (derivado)="derivar($event)" />
        @if (t.state === 'ESCALATED' && !d.cerrado()) {
          <ay-button ayAcciones tamano="sm" variante="secondary" (click)="elevarAComite.emit()">Elevar a comité</ay-button>
        }
        @if (d.cerrado()) {
          <ay-button ayAcciones tamano="sm" variante="secondary" (click)="reabrirTicket()">Reabrir con nuevo SLA</ay-button>
        }
      </ay-page-header>

      <ay-stat-group size="md" [filete]="true" [elementos]="cifrasMando()" />

      <app-recorrido-flujo [d]="d" [conAccion]="true" (completar)="completarActividad()" />

      <app-banner-conflicto [ticket]="t" [area]="d.area()" [retirada]="d.senalRetirada()" [handoffConfirmado]="d.handoffConfirmado()" (retirar)="d.senalRetirada.set($event)" (confirmarRecepcion)="d.handoffConfirmado.set(true)" />

      <div class="c3-cuerpo">
        <section class="c3-principal">
          <ay-tabs etiqueta="Secciones del ticket" [items]="pestanas()" [(valor)]="pestana">
            @switch (pestana()) {
              @case ('interacciones') {
                <div class="c3-panel">
                  <app-registro-interacciones [ticket]="t" [sugerenciaIa]="guiaLista() ? d.plantillaIa() : null" />
                </div>
              }

              @case ('guia') {
                <div class="c3-panel">
                  <ay-card superficie="solid">
                    <ay-card-body padding="md" gap="md">
                      <strong ayText="label">Guía de solución · cómo resolver este tipo de ticket (HU-047)</strong>
                      <app-guia-solucion [ticket]="t" />
                    </ay-card-body>
                  </ay-card>
                </div>
              }

              @case ('bitacora') {
                <div class="c3-panel">
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

        <aside class="c3-contexto" aria-label="Ficha del ticket">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header titulo="Ficha del ticket" nivel="h2" [separador]="true" />
            <ay-card-body padding="md" gap="md">
              <div ayStack gap="4">
                <section ayStack gap="2" aria-label="Cliente y proyecto">
                  <strong ayText="label" size="xs">Cliente y proyecto</strong>
                  <div class="c3-identidad">
                    <ay-avatar [nombre]="t.cli" size="xl" decorativo />
                    <div class="c3-identidad__txt">
                      <strong class="c3-identidad__nombre">{{ t.cli }}</strong>
                      <span class="c3-identidad__dato">DNI {{ t.dni }}</span>
                      <span class="c3-identidad__dato">Proyecto: {{ t.proj }}</span>
                    </div>
                  </div>
                  <ay-card-pairs [pares]="[d.datosCliente()[0]!]" />
                </section>

                <section ayStack gap="2" aria-label="Clasificación del ticket">
                  <strong ayText="label" size="xs">Clasificación del ticket</strong>
                  <dl class="c3-clasif">
                    @for (c of d.clasificacion(); track c.clave) {
                      <div class="c3-clasif__item">
                        <dt>{{ c.clave }}</dt>
                        <dd><ay-tag variante="neutral" size="sm">{{ c.valor }}</ay-tag></dd>
                      </div>
                    }
                  </dl>
                </section>

                <section ayStack gap="2" aria-label="Plazos del SLA">
                  <strong ayText="label" size="xs">Plazos del SLA</strong>
                  <ay-card-pairs [pares]="d.fichaGrupos()[2]!.pares" />
                </section>

                <section ayStack gap="2" aria-label="Responsable del ticket">
                  <strong ayText="label" size="xs">Responsable del ticket</strong>
                  <ay-card-pairs [pares]="[{ clave: 'Gestor asignado', valor: d.responsable() }]" />
                </section>

                <ay-alert tono="info" size="sm" titulo="Nota de contexto del cliente">{{ t.emotion }}</ay-alert>
              </div>
            </ay-card-body>
          </ay-card>
        </aside>
      </div>
    </div>
  `,
  styles: `
    .c3-volver { margin-inline-start: calc(var(--aybar-space-3) * -1); padding-top: var(--aybar-space-4); }
    .c3-principal { min-width: 0; }
    .c3-panel { padding-top: var(--aybar-space-4); }
    .c3-contexto { position: sticky; top: var(--aybar-space-4); }
    .c3-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr) 24rem; gap: var(--aybar-space-4); align-items: start; }
    .c3-clasif { display: flex; flex-wrap: wrap; gap: var(--aybar-space-3) var(--aybar-space-5); margin: 0; }
    .c3-clasif__item { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-1); }
    .c3-clasif dt { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .c3-clasif dd { margin: 0; }
    .c3-identidad { display: flex; align-items: center; gap: var(--aybar-space-3); }
    .c3-identidad__txt { display: flex; flex-direction: column; gap: var(--aybar-space-1); min-width: 0; }
    .c3-identidad__dato { font-size: var(--aybar-font-size-sm); line-height: 1.3; }
    .c3-identidad__nombre { font-size: var(--aybar-font-size-lg); font-weight: var(--aybar-font-weight-bold); }
    .c3-lista { margin: 0; padding-left: var(--aybar-space-5); display: flex; flex-direction: column; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    @media (max-width: 70rem) {
          .c3-cuerpo { grid-template-columns: minmax(0, 1fr); }
      .c3-contexto { position: static; }
    }
  `,
})
export class DetalleCreativa {
  readonly ticket = input.required<TicketAtc>();
  /** Adónde vuelve el botón de arriba (Bandeja de tickets o Tu día). */
  readonly volverA = input<string>('Bandeja de tickets');
  readonly volver = output<void>();
  readonly verContrato = output<string>();
  readonly resolver = output<void>();
  readonly reabrir = output<void>();
  readonly elevarAComite = output<void>();
  /** La derivación se refleja aquí (bitácora y área) y se avisa a quien aloja la vista para que actualice el ticket. */
  readonly derivado = output<DerivacionEvento>();
  protected readonly d = new DetalleDemo(this.ticket, inject(EstadoPrototipoAtcService));
  /** `?tab=guia|bitacora` abre directamente esa pestaña. */
  protected readonly pestana = signal(
    ['guia', 'bitacora'].includes(new URLSearchParams(globalThis.location?.search ?? '').get('tab') ?? '')
      ? new URLSearchParams(globalThis.location?.search ?? '').get('tab')!
      : 'interacciones',
  );
  /** Completa la actividad en curso; al completar la última, el ticket se resuelve solo. */
  protected completarActividad(): void {
    this.d.completarActividad();
    if (this.d.cerrado()) this.resolver.emit();
  }
  protected reabrirTicket(): void {
    this.d.reiniciarAvance();
    this.reabrir.emit();
  }
  protected derivar(e: DerivacionEvento): void {
    this.d.registrarDerivacion(e);
    this.derivado.emit(e);
  }
  protected readonly guiaLista = computed(() => (this.d.guia()?.versionActual ?? null) !== null);

  protected pestanas(): AyTabsElemento[] {
    return [
      { value: 'interacciones', label: 'Interacciones', contador: crearInteraccionesMock(this.ticket()).length },
      { value: 'guia', label: 'Guía de solución' },
      { value: 'bitacora', label: 'Bitácora', contador: this.d.asignaciones().length },
    ];
  }

  /** Cifras clave de la variante B: lo que un gestor mira primero. */
  protected readonly cifrasMando = computed<AyStatItem[]>(() => {
    const sla = this.d.sla();
    const due = sla.due;
    return [
      { id: 'estado', etiqueta: 'Estado', valor: this.d.cerrado() && !['RESOLVED', 'CLOSED'].includes(this.ticket().state) ? 'Resuelto' : estadoEs(this.ticket().state) },
      { id: 'consumido', etiqueta: 'Plazo SLA consumido', valor: `${this.d.consumidoPct()} %` },
      { id: 'vence', etiqueta: 'Vence', valor: due ? tiempoRestante(due) : 'Sin plazo' },
      { id: 'prioridad', etiqueta: 'Prioridad', valor: nombrePrioridad(this.ticket().prio) },
      {
        id: 'responsable',
        etiqueta: `Responsable · ${this.d.area() === 'LEGAL' ? 'Legal · Eje 3' : areaEs(this.d.area())}`,
        valor: this.d.responsable(),
      },
    ];
  });
  protected readonly estadoEs = estadoEs;
  protected readonly tonoEstado = tonoEstado;
  protected readonly tonoPrioridad = tonoPrioridad;
  protected readonly nombrePrioridad = nombrePrioridad;
  protected readonly tiempoRestante = tiempoRestante;
  protected readonly traducir = traducir;
  protected readonly fmt = fmt;
}
