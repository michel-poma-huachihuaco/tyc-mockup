import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AyBadge, AyButton, AyFormField, AyInput, AySelect, AySwitch } from '@aybarcorp/ui-angular';
import { fmtFechaHora } from '../datos-atc';
import { ETAPAS_TIGO, type EtapaTigo } from './tigo-modelo';
import {
  CLASE_POR_ACCION,
  ETIQUETA_ACCION,
  ETIQUETA_CLASE,
  ETIQUETA_NIVEL,
  GUARDARRAILES,
  decidirAccion,
  type NivelTigo,
  type ResultadoGateway,
} from './tigo-politica';
import { TigoEstadoService } from './tigo-estado';

const TIPOS: readonly { id: string; nombre: string }[] = [
  { id: 'CTA', nombre: 'Consulta de cuenta' },
  { id: 'QUE', nombre: 'Queja (Libro)' },
];
const NIVELES: NivelTigo[] = ['solo-sugiere', 'prepara-con-aprobacion', 'no-interviene'];
const OPCIONES_NIVEL = NIVELES.map((n) => ({ value: n, label: ETIQUETA_NIVEL[n] }));
const RESULTADO: Record<ResultadoGateway, { texto: string; tono: 'success' | 'warning' | 'neutral' }> = {
  ejecutar: { texto: 'Lo hace solo', tono: 'success' },
  'pedir-aprobacion': { texto: 'Pide aprobación', tono: 'warning' },
  detener: { texto: 'No actúa', tono: 'neutral' },
};
interface Celda {
  participa: boolean;
  nivel: NivelTigo;
}
const aNivel = (v: string): NivelTigo => NIVELES.find((n) => n === v) ?? 'prepara-con-aprobacion';

/**
 * Autonomía de Tigo por tipo de ticket y etapa (PROTOTIPO simulado, propuesta fuera de la Etapa 1).
 * ADR-007 / RN-SVC-032: la IA sugiere, el gestor decide. Solo el administrador funcional edita; la lógica está en
 * `tigo-politica.ts` y `TigoEstadoService`, aquí solo se muestra y se conecta.
 */
@Component({
  selector: 'app-panel-politica-tigo',
  standalone: true,
  imports: [AyBadge, AyButton, AyFormField, AyInput, AySelect, AySwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pp" aria-labelledby="pp-t">
      <header class="pp-cab">
        <h2 id="pp-t" class="pp-h">Autonomía de Tigo por etapa</h2>
        <ay-badge size="sm" tono="warning">Propuesta fuera de la Etapa 1</ay-badge>
        <ay-badge size="sm" tono="info">Política v{{ tigo.versionPolitica() }}</ay-badge>
      </header>
      <p class="pp-nota">
        Tigo prepara y ejecuta lo interno; lo que sale al cliente, deriva o cierra lo decide una persona. Esta tabla no puede relajar eso.
      </p>
      @if (!editable()) {
        <p class="pp-nota" role="note">Lo configura el administrador funcional. Aquí lo ves en solo lectura.</p>
      }
      @if (aviso(); as a) {
        <p class="pp-aviso" role="status">{{ a }}</p>
      }

      <section class="pp-card" aria-labelledby="pp-m-t">
        <h3 id="pp-m-t" class="pp-h3">Dónde interviene Tigo</h3>
        <div class="pp-tipos">
          @for (t of tipos; track t.id) {
            <div class="pp-tipo">
              <h4 class="pp-h4">{{ t.nombre }} ({{ t.id }})</h4>
              <div class="pp-scroll" tabindex="0" role="region" [attr.aria-label]="'Política de ' + t.nombre">
                <table class="pp-tabla">
                  <caption class="pp-sr">Participación y nivel de Tigo por etapa, tipo {{ t.nombre }}</caption>
                  <thead>
                    <tr><th scope="col">Etapa</th><th scope="col">Tigo participa</th><th scope="col">Nivel</th></tr>
                  </thead>
                  <tbody>
                    @for (e of etapas; track e.id) {
                      @let c = celda(t.id, e.id);
                      <tr [class.pp-sucia]="sucia(t.id, e.id)">
                        <th scope="row">{{ e.nombre }}</th>
                        <td>
                          <ay-switch
                            [etiqueta]="'Tigo participa en ' + e.nombre + ' (' + t.id + ')'"
                            [activo]="c.participa"
                            [disabled]="!editable()"
                            (activoChange)="editar(t.id, e.id, { participa: $event })"
                          />
                        </td>
                        <td>
                          <label class="pp-etq">
                            <span class="pp-sr">Nivel en {{ e.nombre }} ({{ t.id }})</span>
                            <ay-select
                              size="sm"
                              [opciones]="opcionesNivel"
                              [valor]="c.nivel"
                              [disabled]="!editable() || !c.participa"
                              (valorChange)="editar(t.id, e.id, { nivel: nivel($event) })"
                            />
                          </label>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
        @if (editable() && hayCambios()) {
          <div class="pp-guardar">
            <ay-form-field etiqueta="Motivo del cambio" ayuda="Obligatorio. Describe la razón, nunca datos de un cliente." [error]="errorMotivo()">
              <ay-input nombre="motivo-politica" autocompletado="off" [valor]="motivo()" (valorChange)="escribirMotivo($event)" />
            </ay-form-field>
            <div class="pp-botones">
              <ay-button tamano="sm" (click)="guardar()">Guardar cambio</ay-button>
              <ay-button tamano="sm" variante="ghost" (click)="descartar()">Descartar</ay-button>
            </div>
          </div>
        }
      </section>

      <section class="pp-card" aria-labelledby="pp-a-t">
        <h3 id="pp-a-t" class="pp-h3">Qué hace Tigo en cada acción</h3>
        <p class="pp-nota">Elige un nivel para ver qué pasa con cada acción. Cliente, deriva, cierre y Libro nunca se ejecutan solos: es un piso fijo.</p>
        <div class="pp-guardar">
          <ay-form-field etiqueta="Si el nivel es">
            <ay-select size="sm" [opciones]="opcionesNivel" [valor]="nivelVista()" (valorChange)="nivelVista.set(nivel($event))" />
          </ay-form-field>
        </div>
        <div class="pp-scroll" tabindex="0" role="region" aria-label="Resultado por acción según el nivel">
          <table class="pp-tabla">
            <caption class="pp-sr">Resultado de cada acción de Tigo según el nivel elegido</caption>
            <thead><tr><th scope="col">Acción</th><th scope="col">Clase</th><th scope="col">Resultado</th></tr></thead>
            <tbody>
              @for (f of filasAcciones(); track f.accion) {
                <tr>
                  <th scope="row">{{ f.nombre }}</th>
                  <td>{{ f.clase }}</td>
                  <td><ay-badge size="sm" [tono]="f.tono">{{ f.resultado }}</ay-badge></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="pp-card" aria-labelledby="pp-g-t">
        <h3 id="pp-g-t" class="pp-h3">Límites que ninguna política relaja</h3>
        <ul class="pp-lista">
          @for (g of guardarrailes; track g.id) {
            <li>
              <span><strong>{{ g.nombre }}.</strong> {{ g.descripcion }}</span>
              <ay-badge size="sm" tono="danger">Siempre se detiene</ay-badge>
            </li>
          }
        </ul>
        <p class="pp-nota">Subir la autonomía (nivel «ejecuta solo») está reservado: requiere evidencia de confianza y lo decide una persona.</p>
      </section>

      <section class="pp-card" aria-labelledby="pp-b-t">
        <h3 id="pp-b-t" class="pp-h3">Bitácora de cambios</h3>
        @if (bitacora().length) {
          <div class="pp-scroll" tabindex="0" role="region" aria-label="Bitácora de cambios de política">
            <table class="pp-tabla">
              <caption class="pp-sr">Cambios de la política de Tigo, el más reciente primero</caption>
              <thead>
                <tr>
                  <th scope="col">Versión</th><th scope="col">Fecha y hora</th><th scope="col">Autor</th>
                  <th scope="col">Tipo · etapa</th><th scope="col">Antes → después</th><th scope="col">Motivo</th>
                </tr>
              </thead>
              <tbody>
                @for (b of bitacora(); track b.version) {
                  <tr>
                    <td>v{{ b.version }}</td>
                    <td>{{ fecha(b.fecha) }}</td>
                    <td>{{ b.autor }}</td>
                    <td>{{ b.tipo }} · {{ nombreEtapa(b.etapa) }}</td>
                    <td>{{ estadoTexto(b.antes) }} → {{ estadoTexto(b.despues) }}</td>
                    <td class="pp-motivo">{{ b.motivo }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="pp-vacio">Aún no hay cambios: rige la política v1 por defecto.</p>
        }
      </section>
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; contain: inline-size; }
    .pp { display: flex; flex-direction: column; gap: var(--aybar-space-3); min-width: 0; }
    .pp-cab { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .pp-h { margin: 0; font-size: var(--aybar-font-size-md); font-weight: var(--aybar-font-weight-semibold); }
    .pp-h3 { margin: 0; font-size: var(--aybar-font-size-sm); font-weight: var(--aybar-font-weight-semibold); }
    .pp-h4 { margin: 0; font-size: var(--aybar-font-size-xs); font-weight: var(--aybar-font-weight-semibold); color: var(--aybar-color-fg-muted); }
    .pp-nota, .pp-aviso { margin: 0; font-size: var(--aybar-font-size-sm); }
    .pp-nota { color: var(--aybar-color-fg-muted); }
    .pp-aviso { padding: var(--aybar-space-2) var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-feedback-success-border); border-radius: var(--aybar-radius-md); background: var(--aybar-color-feedback-success-bg); color: var(--aybar-color-feedback-success-fg); }
    .pp-card { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); min-width: 0; }
    .pp-tipos { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--aybar-space-3); }
    @media (min-width: 64rem) { .pp-tipos { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .pp-tipo { display: flex; flex-direction: column; gap: var(--aybar-space-1); min-width: 0; }
    .pp-scroll { overflow-x: auto; max-width: 100%; border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); }
    .pp-scroll:focus-visible { outline: 2px solid var(--aybar-color-primary-500); outline-offset: 2px; }
    .pp-tabla { width: 100%; border-collapse: collapse; font-size: var(--aybar-font-size-sm); }
    .pp-tabla th, .pp-tabla td { padding: var(--aybar-space-2) var(--aybar-space-3); text-align: start; vertical-align: middle; border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .pp-tabla thead th { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); white-space: nowrap; }
    .pp-tabla tbody th { font-weight: var(--aybar-font-weight-semibold); white-space: nowrap; }
    .pp-tabla tr:last-child > * { border-bottom: 0; }
    .pp-sucia { background: var(--aybar-color-feedback-warning-bg); }
    .pp-motivo { min-width: 12rem; overflow-wrap: anywhere; }
    .pp-etq { display: block; min-width: 15rem; }
    .pp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .pp-guardar { display: flex; flex-direction: column; gap: var(--aybar-space-2); max-width: 32rem; }
    .pp-botones { display: flex; flex-wrap: wrap; gap: var(--aybar-space-2); }
    .pp-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .pp-lista li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--aybar-space-2); }
    .pp-vacio { margin: 0; padding: var(--aybar-space-4); border: var(--aybar-border-width-thin) dashed var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-sm); }
  `,
})
export class PanelPoliticaTigo {
  protected readonly tigo = inject(TigoEstadoService);
  protected readonly tipos = TIPOS;
  protected readonly etapas = ETAPAS_TIGO;
  protected readonly opcionesNivel = OPCIONES_NIVEL;
  protected readonly guardarrailes = GUARDARRAILES;
  protected readonly editable = this.tigo.puedeConfigurarPoliticas;
  protected readonly aviso = signal<string | null>(null);
  protected readonly motivo = signal('');
  protected readonly errorMotivo = signal<string | undefined>(undefined);
  protected readonly nivelVista = signal<NivelTigo>('prepara-con-aprobacion');
  /** Cambios sin guardar, por «tipo|etapa». */
  private readonly borrador = signal<Record<string, Celda>>({});

  protected readonly hayCambios = computed(() => Object.keys(this.borrador()).length > 0);
  protected readonly bitacora = computed(() => [...this.tigo.bitacoraPoliticas()].reverse());
  protected readonly filasAcciones = computed(() =>
    Object.keys(CLASE_POR_ACCION)
      .filter((a) => CLASE_POR_ACCION[a] !== 'sistema')
      .map((accion) => {
        const politica = { tipo: 'CTA', etapa: 'atencion' as EtapaTigo, participa: true, nivel: this.nivelVista() };
        const r = RESULTADO[decidirAccion({ accion, politica }).resultado];
        return { accion, nombre: ETIQUETA_ACCION[accion] ?? accion, clase: ETIQUETA_CLASE[CLASE_POR_ACCION[accion]], resultado: r.texto, tono: r.tono };
      }),
  );

  protected nivel = aNivel;

  private actual(tipo: string, etapa: EtapaTigo): Celda {
    const p = this.tigo.politicas().find((x) => x.tipo === tipo && x.etapa === etapa);
    return { participa: p?.participa ?? false, nivel: p?.nivel ?? 'prepara-con-aprobacion' };
  }
  protected celda(tipo: string, etapa: EtapaTigo): Celda {
    return this.borrador()[`${tipo}|${etapa}`] ?? this.actual(tipo, etapa);
  }
  protected sucia(tipo: string, etapa: EtapaTigo): boolean {
    return `${tipo}|${etapa}` in this.borrador();
  }

  protected editar(tipo: string, etapa: EtapaTigo, cambio: Partial<Celda>): void {
    if (!this.editable()) return;
    const k = `${tipo}|${etapa}`;
    const nuevo = { ...this.celda(tipo, etapa), ...cambio };
    const base = this.actual(tipo, etapa);
    const igual = nuevo.participa === base.participa && nuevo.nivel === base.nivel;
    this.borrador.update((b) => {
      const resto = { ...b };
      delete resto[k];
      return igual ? resto : { ...resto, [k]: nuevo };
    });
    this.aviso.set(null);
  }

  protected escribirMotivo(v: string): void {
    this.motivo.set(v);
    this.errorMotivo.set(undefined);
  }

  protected descartar(): void {
    this.borrador.set({});
    this.motivo.set('');
    this.errorMotivo.set(undefined);
  }

  protected guardar(): void {
    if (!this.motivo().trim()) {
      this.errorMotivo.set('Escribe el motivo del cambio para guardarlo.');
      return;
    }
    let version: number | null = null;
    for (const [k, c] of Object.entries(this.borrador())) {
      const [tipo, etapa] = k.split('|');
      version = this.tigo.cambiarPolitica(tipo, etapa as EtapaTigo, c, this.motivo()) ?? version;
    }
    if (version === null) return;
    this.aviso.set(`Política v${version} publicada: aplica a los tickets nuevos; los abiertos conservan la suya.`);
    this.descartar();
  }

  protected fecha = fmtFechaHora;
  protected nombreEtapa = (e: EtapaTigo): string => ETAPAS_TIGO.find((x) => x.id === e)?.nombre ?? e;
  protected estadoTexto = (c: Celda): string => (c.participa ? ETIQUETA_NIVEL[c.nivel] : 'No participa');
}
