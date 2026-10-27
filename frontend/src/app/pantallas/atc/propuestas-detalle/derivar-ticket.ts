import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCheckbox,
  AyForm,
  AyFormField,
  AyFormGroup,
  AyModal,
  AySelect,
  AyStack,
  AyText,
  AyTextarea,
  type AyOpcionSelect,
} from '@aybarcorp/ui-angular';
import { AREAS_ATC, MOTIVOS_DERIVACION, type TicketAtc } from '../datos-atc';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import { MOTIVO_ES, etiqueta } from '../etiquetas-es';
import { areaEs } from './base';

/** Lo que el formulario entrega al confirmar la derivación. */
export interface DerivacionEvento {
  readonly area: string;
  /** Persona de la lista del área; vacío = el ticket queda en el área y lo asigna el flujo (HU-007 CA-01). */
  readonly persona: string;
  readonly motivo: string;
  readonly nota: string;
}

/**
 * Los 6 elementos del paquete mínimo de handoff, tal como los define la HU-ATC-027 (CA-01). Deben estar
 * completos antes de enviar una derivación a Legal (RN-SVC-022).
 */
const PAQUETE_MINIMO = [
  { k: 'id', label: 'ID del ticket y del cliente' },
  { k: 'kyc', label: 'KYC del cliente validado' },
  { k: 'proyecto', label: 'Proyecto y lote' },
  { k: 'pagos', label: 'Pagos y estado de cuenta' },
  { k: 'atencion', label: 'Atención previa' },
  { k: 'proximo', label: 'Próximo paso' },
] as const;

type ClavePaquete = (typeof PAQUETE_MINIMO)[number]['k'];

/** Personas de prueba por área. El prototipo no tiene una lista de colaboradores por área. */
const PERSONAS: Readonly<Record<string, readonly string[]>> = {
  ATC: ['C. Rojas', 'Ana P.', 'Luis M.'],
  COBRANZA: ['Iván Q.', 'R. Salazar'],
  LEGAL: ['Dra. P. Vílchez', 'Rosario V.'],
  POSTVENTA: ['L. Ccahuana'],
  TI: [],
  ADMINISTRACION: ['Elena C.'],
};

const SIN_PERSONA = '__sin_persona__';

/**
 * Botón y formulario para **derivar el ticket** (HU-ATC-007). El destino es un **área** (las 6 de
 * `MAE_AREA`), no un «eje»: Legal se rotula «Legal · Eje 3». Se puede elegir una persona del área o dejarla
 * vacía, y el flujo del área la asigna. Si el destino es Legal, el formulario exige los 6 elementos del
 * paquete mínimo (HU-ATC-027).
 */
@Component({
  selector: 'app-derivar-ticket',
  standalone: true,
  imports: [AyAlert, AyBadge, AyButton, AyCheckbox, AyForm, AyFormField, AyFormGroup, AyModal, AySelect, AyStack, AyText, AyTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ay-button tamano="sm" variante="secondary" (click)="abrir()">{{ textoBoton() }}</ay-button>

    <ay-modal [abierto]="abierto()" (abiertoChange)="abierto.set($event)" [titulo]="'Derivar el ticket ' + ticket().num">
      <ay-form (enviar)="confirmar()">
        <div ayStack gap="3">
          <ay-alert tono="info" size="sm" titulo="Ahora está en {{ areaEs(area()) }}">
            Un ticket se deriva a un <strong>área</strong>. «Eje 3» es el nivel de Legal: elige «Legal · Eje 3» para
            derivar un conflicto.
          </ay-alert>

          <ay-form-field etiqueta="Área destino" obligatorio>
            <ay-select nombre="derivar-area" [opciones]="opcionesArea()" [valor]="destino()" (valorChange)="elegirArea($event)" />
          </ay-form-field>

          <ay-form-field etiqueta="Persona (opcional)">
            <ay-select
              nombre="derivar-persona"
              [opciones]="opcionesPersona()"
              [valor]="persona()"
              (valorChange)="persona.set($event)"
            />
          </ay-form-field>

          <ay-form-field etiqueta="Motivo de la derivación" obligatorio>
            <ay-select nombre="derivar-motivo" [opciones]="opcionesMotivo" [valor]="motivo()" (valorChange)="motivo.set($event)" />
          </ay-form-field>

          <section class="dt-flujo" aria-label="Workflow que aplicará">
            <strong ayText="label" size="xs">Workflow que aplicará en {{ areaEs(destino()) }}</strong>
            @if (flujoDelArea(); as f) {
              <span class="dt-fila">
                <ay-badge size="sm" tono="info">Flujo v{{ f.versionActual }}</ay-badge>
                <span ayText="body" size="sm">{{ f.pasos.length }} actividades · el área asigna al responsable</span>
              </span>
            } @else {
              <span ayText="body" size="sm">
                No hay un flujo publicado de este tipo en {{ areaEs(destino()) }}: se usará el flujo por defecto del
                área y se avisará al administrador funcional (HU-043, CA-07).
              </span>
            }
          </section>

          @if (exigePaquete()) {
            <ay-form-group
              leyenda="Paquete mínimo de handoff a Legal (Eje 3)"
              [descripcion]="'Completados ' + completos() + ' de 6 elementos. Sin los 6 no se puede derivar (RN-SVC-022).'"
              variante="card"
            >
              @for (e of paquete; track e.k) {
                <ay-checkbox [marcado]="marcados()[e.k]" (marcadoChange)="marcar(e.k, $event)">{{ e.label }}</ay-checkbox>
              }
            </ay-form-group>
          }

          <ay-form-field etiqueta="Nota de la derivación (opcional)">
            <ay-textarea nombre="derivar-nota" [filas]="2" [valor]="nota()" (valorChange)="nota.set($event)" />
          </ay-form-field>

          <div class="dt-fila dt-fila--fin">
            <ay-button variante="ghost" (click)="abierto.set(false)">Cancelar</ay-button>
            <ay-button tipo="submit" variante="primary" [disabled]="!puedeConfirmar()">Confirmar derivación</ay-button>
          </div>
        </div>
      </ay-form>
    </ay-modal>
  `,
  styles: `
    .dt-flujo { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-3); border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface-sunken); }
    .dt-fila { display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-2); }
    .dt-fila--fin { justify-content: flex-end; }
  `,
})
export class DerivarTicket {
  readonly ticket = input.required<TicketAtc>();
  /** Área en la que está ahora el ticket. */
  readonly area = input.required<string>();
  /** Hay una señal de conflicto activa: el botón pasa a «Derivar a Legal (Eje 3)». */
  readonly conSenal = input(false);
  readonly derivado = output<DerivacionEvento>();

  private readonly proto = inject(EstadoPrototipoAtcService);

  protected readonly abierto = signal(false);
  protected readonly destino = signal('');
  protected readonly persona = signal(SIN_PERSONA);
  protected readonly motivo = signal('');
  protected readonly nota = signal('');
  protected readonly marcados = signal<Record<ClavePaquete, boolean>>(vacio());

  protected readonly paquete = PAQUETE_MINIMO;
  protected readonly areaEs = areaEs;

  protected readonly opcionesMotivo: AyOpcionSelect[] = MOTIVOS_DERIVACION.map((m) => ({
    value: m,
    label: etiqueta(MOTIVO_ES, m),
  }));

  protected readonly textoBoton = computed(() =>
    this.conSenal() && this.area() !== 'LEGAL' ? 'Derivar a Legal (Eje 3)' : 'Derivar',
  );

  /** Las 6 áreas; la actual no se puede elegir y Legal lleva su rótulo de nivel. */
  protected readonly opcionesArea = computed<AyOpcionSelect[]>(() =>
    AREAS_ATC.map((a) => ({
      value: a,
      label: `${areaEs(a)}${a === 'LEGAL' ? ' · Eje 3' : ''}${a === this.area() ? ' (actual)' : ''}`,
      disabled: a === this.area(),
    })),
  );

  protected readonly opcionesPersona = computed<AyOpcionSelect[]>(() => [
    { value: SIN_PERSONA, label: 'Sin persona: la asigna el flujo del área' },
    ...(PERSONAS[this.destino()] ?? []).map((p) => ({ value: p, label: p })),
  ]);

  /** El flujo de este tipo si está publicado en el área destino; si no, se usa el del área por defecto. */
  protected readonly flujoDelArea = computed(() => {
    const f = this.proto.obtenerFlujoActivo(this.ticket().type);
    return f.area === this.destino() ? f : null;
  });

  protected readonly exigePaquete = computed(() => this.destino() === 'LEGAL' && this.area() !== 'LEGAL');
  protected readonly completos = computed(() => Object.values(this.marcados()).filter(Boolean).length);
  protected readonly puedeConfirmar = computed(
    () => !!this.destino() && !!this.motivo() && (!this.exigePaquete() || this.completos() === PAQUETE_MINIMO.length),
  );

  protected abrir(): void {
    const aLegal = this.conSenal() && this.area() !== 'LEGAL';
    this.destino.set(aLegal ? 'LEGAL' : (AREAS_ATC.find((a) => a !== this.area()) ?? ''));
    this.persona.set(SIN_PERSONA);
    this.motivo.set(aLegal ? 'DERIVACION_CONFLICTO_EJE3' : 'DERIVACION_COMPETENCIA');
    this.nota.set('');
    this.marcados.set(vacio());
    this.abierto.set(true);
  }

  protected elegirArea(a: string): void {
    this.destino.set(a);
    this.persona.set(SIN_PERSONA);
    if (a === 'LEGAL' && this.motivo() === 'DERIVACION_COMPETENCIA') this.motivo.set('DERIVACION_CONFLICTO_EJE3');
  }

  protected marcar(k: ClavePaquete, v: boolean): void {
    this.marcados.update((m) => ({ ...m, [k]: v }));
  }

  protected confirmar(): void {
    if (!this.puedeConfirmar()) return;
    this.derivado.emit({
      area: this.destino(),
      persona: this.persona() === SIN_PERSONA ? '' : this.persona(),
      motivo: this.motivo(),
      nota: this.nota().trim(),
    });
    this.abierto.set(false);
  }
}

function vacio(): Record<ClavePaquete, boolean> {
  return { id: false, kyc: false, proyecto: false, pagos: false, atencion: false, proximo: false };
}
