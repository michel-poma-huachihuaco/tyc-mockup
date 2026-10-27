import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AyAlert, AyBadge, AyStack, AyText } from '@aybarcorp/ui-angular';
import type { TicketAtc } from '../datos-atc';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import { fmt } from './base';
import { documentosRequeridos } from './mock-interacciones';

/**
 * Contenido de la **guía de solución** del tipo del ticket (HU-ATC-047): pasos, plantillas de respuesta,
 * documentos requeridos y criterios de cierre, con su versión y el historial de versiones (CA-02). Si el
 * tipo no tiene guía publicada, avisa y dice que se reporta al administrador funcional (CA-03).
 * No incluye la retroalimentación de IA (HU-048), que está fuera de la Etapa 1 (D-12).
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`; el marco (card, pestaña o acordeón) lo pone quien la usa.
 */
@Component({
  selector: 'app-guia-solucion',
  standalone: true,
  imports: [AyAlert, AyBadge, AyStack, AyText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (guia(); as g) {
      @if (g.versionActual !== null) {
        <div ayStack gap="4">
          <div class="gs-cab">
            <ay-badge size="sm" tono="info">Versión v{{ g.versionActual }}</ay-badge>
            <span ayText="body" size="xs">Mantenida por el administrador funcional</span>
          </div>

          <section ayStack gap="2" aria-label="Pasos">
            <strong ayText="label" size="xs">Pasos para resolver</strong>
            <ol class="gs-lista">
              @for (p of g.pasos; track $index) {
                <li>{{ p }}</li>
              }
            </ol>
          </section>

          <section ayStack gap="2" aria-label="Plantillas de respuesta">
            <strong ayText="label" size="xs">Plantillas de respuesta</strong>
            @for (pl of plantillas(); track $index) {
              <blockquote class="gs-plantilla">{{ pl }}</blockquote>
            } @empty {
              <span ayText="body" size="sm">Esta guía no tiene plantillas.</span>
            }
          </section>

          <section ayStack gap="2" aria-label="Documentos requeridos">
            <strong ayText="label" size="xs">Documentos requeridos</strong>
            <ul class="gs-lista">
              @for (d of documentos(); track d) {
                <li>{{ d }}</li>
              } @empty {
                <li>Esta guía no pide documentos.</li>
              }
            </ul>
          </section>

          <section ayStack gap="2" aria-label="Criterios de cierre">
            <strong ayText="label" size="xs">Criterios de cierre exigidos</strong>
            <ul class="gs-lista">
              @for (c of g.criterios; track $index) {
                <li>{{ c }}</li>
              }
            </ul>
          </section>

          <section ayStack gap="2" aria-label="Historial de versiones">
            <strong ayText="label" size="xs">Historial de versiones</strong>
            <ul class="gs-lista gs-lista--versiones">
              @for (h of versiones(); track h.version) {
                <li>
                  <strong>v{{ h.version }}</strong> · {{ fmt(h.fecha) }} · {{ h.autor }}
                  @if (h.version === g.versionActual) {
                    <ay-badge size="sm" tono="success">Vigente</ay-badge>
                  }
                </li>
              } @empty {
                <li>v{{ g.versionActual }} · vigente. No hay versiones anteriores registradas.</li>
              }
            </ul>
          </section>
        </div>
      } @else {
        <ay-alert tono="warning" size="sm" titulo="Sin guía publicada">
          El tipo «{{ g.nombreTipo }}» no tiene guía publicada. Se reporta al administrador funcional (HU-047, CA-03).
        </ay-alert>
      }
    } @else {
      <ay-alert tono="warning" size="sm" titulo="Sin guía publicada">
        Este tipo de ticket no tiene guía. Se reporta al administrador funcional (HU-047, CA-03).
      </ay-alert>
    }
  `,
  styles: `
    .gs-cab { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .gs-lista { margin: 0; padding-left: var(--aybar-space-5); display: flex; flex-direction: column; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .gs-lista--versiones { list-style: none; padding-left: 0; font-size: var(--aybar-font-size-xs); }
    .gs-plantilla { margin: 0; padding: var(--aybar-space-2) var(--aybar-space-3); border-left: 3px solid var(--aybar-color-feedback-info-border); background: var(--aybar-color-bg-surface-sunken); border-radius: var(--aybar-radius-md); font-size: var(--aybar-font-size-sm); }
  `,
})
export class GuiaSolucion {
  readonly ticket = input.required<TicketAtc>();
  private readonly proto = inject(EstadoPrototipoAtcService);

  protected readonly guia = computed(() => this.proto.obtenerGuiaActiva(this.ticket().type));
  protected readonly documentos = computed(() => documentosRequeridos(this.ticket().type));
  /** Con el resumen del ticket ya puesto donde la plantilla dice `{resumen}`. */
  protected readonly plantillas = computed(() =>
    (this.guia()?.plantillas ?? []).map((p) => p.replace(/\{resumen\}/g, this.ticket().summary)),
  );
  protected readonly versiones = computed(() =>
    [...(this.guia()?.historial ?? [])].sort((a, b) => b.version - a.version),
  );

  protected readonly fmt = fmt;
}
