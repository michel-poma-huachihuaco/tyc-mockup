import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCelda,
  AyCheckbox,
  AyForm,
  AyFormField,
  AyInput,
  AyModal,
  AyRow,
  AySelect,
  AyStack,
  AyTable,
  AyText,
  type AyColumna,
  type AyOpcionSelect,
} from '@aybarcorp/ui-angular';
import { BarraFiltrosComponent } from './barra-filtros';
import { errorCodigoTipo, errorNombreSubtipo, idSubtipoNuevo, normalizarCodigoTipo } from './catalogo-validacion';
import type { TicketAtc } from './datos-atc';
import { EstadoPrototipoAtcService, type SubtipoTicketCfg, type TipoTicketCfg } from './estado-prototipo-atc';
import { crearFiltrosTabla, EstadoFiltrosTablas } from './filtros-tabla';
import { VacioFiltrosComponent } from './vacio-filtros';

interface FilaTipo extends TipoTicketCfg { subtipos: number }
interface FilaSubtipo extends SubtipoTicketCfg { tipoNombre: string }

const ACTIVO = 'Activo';
const INACTIVO = 'Inactivo';
const OPCIONES_ESTADO = [{ valor: ACTIVO, etiqueta: ACTIVO }, { valor: INACTIVO, etiqueta: INACTIVO }];

/** Pestañas «Tipos de ticket» y «Subtipos de ticket» de Mantenimiento. */
@Component({
  selector: 'app-mantenimiento-catalogo',
  standalone: true,
  imports: [
    AyAlert, AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyCelda, AyCheckbox, AyForm, AyFormField,
    AyInput, AyModal, AyRow, AySelect, AyStack, AyTable, AyText, BarraFiltrosComponent, VacioFiltrosComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .mc-acciones { display: flex; gap: var(--aybar-space-2, 0.5rem); justify-content: flex-end; flex-wrap: wrap; }
    @media (prefers-reduced-motion: reduce) { :host * { transition: none !important; animation: none !important; } }
  `,
  template: `
    <div ayStack gap="4">
      @if (aviso()) {
        <ay-alert tono="success" size="sm" [titulo]="aviso()!" [descartable]="true" (cerrar)="aviso.set(null)" />
      }

      @if (pestana() === 'tipos') {
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Tipos de ticket"
            subtitulo="Un tipo no se elimina: se desactiva y deja de ofrecerse en «Nuevo ticket»."
            nivel="h2"
            [separador]="true"
          >
            @if (puedeEditar()) {
              <ay-button tamano="sm" variante="primary" (click)="abrirTipo(null)">Crear tipo</ay-button>
            }
          </ay-card-header>
          <ay-card-body padding="sm" gap="sm">
            <app-barra-filtros [filtros]="filtrosTipos" />
            <ay-table leyenda="Tipos de ticket" [columnas]="columnasTipos" [filas]="filtrosTipos.filtradas()" [rayada]="true">
              <ng-template ayCelda="id" let-fila>
                <span ayText="mono" size="xs">{{ comoTipo(fila).id }}</span>
              </ng-template>
              <ng-template ayCelda="libro" let-fila>
                {{ comoTipo(fila).libro ? 'Sí' : 'No' }}
              </ng-template>
              <ng-template ayCelda="activo" let-fila>
                <ay-badge size="sm" [tono]="comoTipo(fila).activo ? 'success' : 'neutral'">
                  {{ comoTipo(fila).activo ? 'Activo' : 'Inactivo' }}
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="accion" let-fila>
                @if (puedeEditar()) {
                  <div class="mc-acciones">
                    <ay-button tamano="sm" variante="secondary" (click)="abrirTipo(comoTipo(fila))">Editar</ay-button>
                    <ay-button tamano="sm" variante="ghost" (click)="confirmaTipo.set(comoTipo(fila))">
                      {{ comoTipo(fila).activo ? 'Desactivar' : 'Reactivar' }}
                    </ay-button>
                  </div>
                }
              </ng-template>
              <app-vacio-filtros ayVacio [filtros]="filtrosTipos" elemento="tipo" />
            </ay-table>
          </ay-card-body>
        </ay-card>
      } @else {
        <ay-alert
          tono="info"
          size="sm"
          titulo="Los subtipos precargados son provisionales hasta que el PO entregue el catálogo oficial."
        />
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Subtipos de ticket"
            subtitulo="Cada subtipo pertenece a un tipo y su nombre es único dentro de él."
            nivel="h2"
            [separador]="true"
          >
            @if (puedeEditar()) {
              <ay-button tamano="sm" variante="primary" (click)="abrirSubtipo(null)">Crear subtipo</ay-button>
            }
          </ay-card-header>
          <ay-card-body padding="sm" gap="sm">
            <app-barra-filtros [filtros]="filtrosSubtipos" />
            <ay-table leyenda="Subtipos de ticket" [columnas]="columnasSubtipos" [filas]="filtrosSubtipos.filtradas()" [rayada]="true">
              <ng-template ayCelda="nombre" let-fila>
                <strong>{{ comoSubtipo(fila).nombre }}</strong>
                @if (comoSubtipo(fila).provisional) {
                  <ay-badge size="sm" tono="warning">Provisional</ay-badge>
                }
              </ng-template>
              <ng-template ayCelda="activo" let-fila>
                <ay-badge size="sm" [tono]="comoSubtipo(fila).activo ? 'success' : 'neutral'">
                  {{ comoSubtipo(fila).activo ? 'Activo' : 'Inactivo' }}
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="accion" let-fila>
                @if (puedeEditar()) {
                  <div class="mc-acciones">
                    <ay-button tamano="sm" variante="secondary" (click)="abrirSubtipo(comoSubtipo(fila))">Editar</ay-button>
                    <ay-button tamano="sm" variante="ghost" (click)="alternarSubtipo(comoSubtipo(fila))">
                      {{ comoSubtipo(fila).activo ? 'Desactivar' : 'Reactivar' }}
                    </ay-button>
                  </div>
                }
              </ng-template>
              <app-vacio-filtros ayVacio [filtros]="filtrosSubtipos" elemento="subtipo" />
            </ay-table>
          </ay-card-body>
        </ay-card>
      }
    </div>

    <ay-modal
      [abierto]="tipoModal() !== null"
      (abiertoChange)="!$event && tipoModal.set(null)"
      [titulo]="tipoModal() === 'nuevo' ? 'Crear tipo de ticket' : 'Editar tipo de ticket'"
    >
      @if (tipoModal() !== null) {
        <ay-form (enviar)="guardarTipo()">
          <div ayStack gap="3">
            <ay-form-field etiqueta="Código (3 letras)" obligatorio [error]="errorCodigo()">
              <ay-input nombre="tipo-codigo" [valor]="fCodigo()" [disabled]="tipoModal() !== 'nuevo'"
                (valorChange)="fCodigo.set($event.toUpperCase())" />
            </ay-form-field>
            <ay-form-field etiqueta="Nombre" obligatorio>
              <ay-input nombre="tipo-nombre" [valor]="fNombre()" (valorChange)="fNombre.set($event)" />
            </ay-form-field>
            <ay-checkbox [marcado]="fLibro()" (marcadoChange)="fLibro.set($event)">
              Va al Libro de reclamaciones
            </ay-checkbox>
            <div ayRow gap="2" justificar="end">
              <ay-button variante="ghost" (click)="tipoModal.set(null)">Cancelar</ay-button>
              <ay-button tipo="submit" variante="primary" [disabled]="!tipoValido()">Guardar</ay-button>
            </div>
          </div>
        </ay-form>
      }
    </ay-modal>

    <ay-modal
      [abierto]="subtipoModal() !== null"
      (abiertoChange)="!$event && subtipoModal.set(null)"
      [titulo]="subtipoModal() === 'nuevo' ? 'Crear subtipo de ticket' : 'Editar subtipo de ticket'"
    >
      @if (subtipoModal() !== null) {
        <ay-form (enviar)="guardarSubtipo()">
          <div ayStack gap="3">
            <ay-form-field etiqueta="Tipo de ticket" obligatorio>
              <ay-select nombre="sub-tipo" [opciones]="opcionesTipoPadre()" [valor]="fTipoPadre()"
                (valorChange)="fTipoPadre.set($event)" />
            </ay-form-field>
            <ay-form-field etiqueta="Nombre" obligatorio [error]="errorNombreSub()">
              <ay-input nombre="sub-nombre" [valor]="fNombre()" (valorChange)="fNombre.set($event)" />
            </ay-form-field>
            <div ayRow gap="2" justificar="end">
              <ay-button variante="ghost" (click)="subtipoModal.set(null)">Cancelar</ay-button>
              <ay-button tipo="submit" variante="primary" [disabled]="!subtipoValido()">Guardar</ay-button>
            </div>
          </div>
        </ay-form>
      }
    </ay-modal>

    <ay-modal
      [abierto]="confirmaTipo() !== null"
      (abiertoChange)="!$event && confirmaTipo.set(null)"
      [titulo]="confirmaTipo()?.activo ? 'Desactivar tipo de ticket' : 'Reactivar tipo de ticket'"
    >
      @if (confirmaTipo(); as t) {
        <div ayStack gap="3">
          <p ayText="body">{{ t.activo ? 'Se desactivará' : 'Se reactivará' }} «{{ t.nombre }}».</p>
          @if (t.activo && (abiertosDe(t.id) > 0 || tieneFlujo(t.id))) {
            <ay-alert tono="warning" size="sm" titulo="Este tipo está en uso">
              @if (abiertosDe(t.id) > 0) { Tiene {{ abiertosDe(t.id) }} ticket(s) abierto(s). }
              @if (tieneFlujo(t.id)) { Tiene un flujo configurado. }
              Los tickets existentes no cambian, pero el tipo ya no se ofrecerá en «Nuevo ticket».
            </ay-alert>
          }
          <div ayRow gap="2" justificar="end">
            <ay-button variante="ghost" (click)="confirmaTipo.set(null)">Cancelar</ay-button>
            <ay-button variante="primary" (click)="alternarTipo()">{{ t.activo ? 'Desactivar' : 'Reactivar' }}</ay-button>
          </div>
        </div>
      }
    </ay-modal>
  `,
})
export class MantenimientoCatalogoComponent {
  private readonly estado = inject(EstadoPrototipoAtcService);

  readonly pestana = input.required<'tipos' | 'subtipos'>();
  readonly puedeEditar = input<boolean>(false);
  readonly tickets = input<readonly TicketAtc[]>([]);

  readonly aviso = signal<string | null>(null);
  readonly tipoModal = signal<string | null>(null);
  readonly subtipoModal = signal<string | null>(null);
  readonly confirmaTipo = signal<TipoTicketCfg | null>(null);
  readonly fCodigo = signal('');
  readonly fNombre = signal('');
  readonly fLibro = signal(false);
  readonly fTipoPadre = signal('');

  readonly comoTipo = (f: unknown) => f as FilaTipo;
  readonly comoSubtipo = (f: unknown) => f as FilaSubtipo;

  private readonly filasTipos = computed<FilaTipo[]>(() => {
    const subs = this.estado.subtiposTicket();
    return this.estado.tiposTicket().map((t) => ({ ...t, subtipos: subs.filter((s) => s.tipoId === t.id).length }));
  });
  private readonly filasSubtipos = computed<FilaSubtipo[]>(() => {
    const nombres = new Map(this.estado.tiposTicket().map((t) => [t.id, t.nombre]));
    return this.estado.subtiposTicket().map((s) => ({ ...s, tipoNombre: nombres.get(s.tipoId) ?? s.tipoId }));
  });

  readonly columnasTipos: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'Código', ancho: '7rem', ordenable: true },
    { clave: 'nombre', cabecera: 'Nombre', ordenable: true },
    { clave: 'libro', cabecera: 'Libro de reclamaciones', ancho: '12rem' },
    { clave: 'subtipos', cabecera: 'Subtipos', ancho: '7rem', ordenable: true },
    { clave: 'activo', cabecera: 'Estado', ancho: '8rem' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '14rem' },
  ];
  readonly columnasSubtipos: readonly AyColumna[] = [
    { clave: 'nombre', cabecera: 'Nombre', ordenable: true },
    { clave: 'tipoNombre', cabecera: 'Tipo de ticket', ordenable: true },
    { clave: 'activo', cabecera: 'Estado', ancho: '8rem' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '14rem' },
  ];

  readonly filtrosTipos = crearFiltrosTabla(
    this.filasTipos,
    {
      clave: 'mant-tipos',
      etiquetaElemento: 'tipos',
      etiquetaBusqueda: 'Buscar tipo',
      placeholderBusqueda: 'Código o nombre…',
      textoDe: (t) => `${t.id} ${t.nombre}`,
      filtros: [
        { id: 'estado', etiqueta: 'Estado', tipo: 'multi', valorDe: (t) => (t.activo ? ACTIVO : INACTIVO), opciones: OPCIONES_ESTADO },
        { id: 'libro', etiqueta: 'Solo Libro de reclamaciones', tipo: 'boolean', valorDe: (t) => t.libro },
      ],
    },
    inject(EstadoFiltrosTablas),
  );
  readonly filtrosSubtipos = crearFiltrosTabla(
    this.filasSubtipos,
    {
      clave: 'mant-subtipos',
      etiquetaElemento: 'subtipos',
      etiquetaBusqueda: 'Buscar subtipo',
      placeholderBusqueda: 'Nombre del subtipo…',
      textoDe: (s) => `${s.nombre} ${s.tipoNombre}`,
      filtros: [
        { id: 'tipo', etiqueta: 'Tipo', tipo: 'multi', valorDe: (s) => s.tipoNombre, conBusqueda: true },
        { id: 'estado', etiqueta: 'Estado', tipo: 'multi', valorDe: (s) => (s.activo ? ACTIVO : INACTIVO), opciones: OPCIONES_ESTADO },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  readonly opcionesTipoPadre = computed<AyOpcionSelect[]>(() => [
    { value: '', label: 'Elige un tipo' },
    ...this.estado.tiposTicket()
      .filter((t) => t.activo || t.id === this.fTipoPadre())
      .map((t) => ({ value: t.id, label: t.nombre })),
  ]);

  readonly errorCodigo = computed(() =>
    this.tipoModal() === 'nuevo' && this.fCodigo()
      ? errorCodigoTipo(this.fCodigo(), this.estado.tiposTicket().map((t) => t.id))
      : '',
  );
  readonly tipoValido = computed(
    () =>
      !!this.fNombre().trim() &&
      (this.tipoModal() !== 'nuevo' || !errorCodigoTipo(this.fCodigo(), this.estado.tiposTicket().map((t) => t.id))),
  );
  private errorSub(): string {
    if (!this.fTipoPadre()) return 'Elige el tipo de ticket.';
    const m = this.subtipoModal();
    return errorNombreSubtipo(this.fNombre(), this.fTipoPadre(), this.estado.subtiposTicket(), m && m !== 'nuevo' ? m : undefined);
  }
  readonly errorNombreSub = computed(() => (this.fNombre() ? this.errorSub() : ''));
  readonly subtipoValido = computed(() => this.subtipoModal() !== null && !this.errorSub());

  abiertosDe(tipoId: string): number {
    return this.tickets().filter((t) => t.type === tipoId && !['RESOLVED', 'CLOSED'].includes(t.state)).length;
  }
  tieneFlujo(tipoId: string): boolean {
    return this.estado.flujosPorTipo().some((f) => f.tipo === tipoId);
  }

  abrirTipo(t: TipoTicketCfg | null): void {
    this.fCodigo.set(t?.id ?? '');
    this.fNombre.set(t?.nombre ?? '');
    this.fLibro.set(t?.libro ?? false);
    this.tipoModal.set(t ? t.id : 'nuevo');
  }
  guardarTipo(): void {
    const m = this.tipoModal();
    if (!m || !this.tipoValido()) return;
    const nombre = this.fNombre().trim();
    if (m === 'nuevo') {
      this.estado.crearTipo(normalizarCodigoTipo(this.fCodigo()), nombre, this.fLibro());
      this.aviso.set(`Tipo «${nombre}» creado.`);
    } else {
      this.estado.actualizarTipo(m, nombre, this.fLibro());
      this.aviso.set(`Tipo «${nombre}» actualizado.`);
    }
    this.tipoModal.set(null);
  }
  alternarTipo(): void {
    const t = this.confirmaTipo();
    if (!t) return;
    this.estado.alternarTipo(t.id);
    this.aviso.set(`Tipo «${t.nombre}» ${t.activo ? 'desactivado' : 'reactivado'}.`);
    this.confirmaTipo.set(null);
  }

  abrirSubtipo(s: SubtipoTicketCfg | null): void {
    this.fTipoPadre.set(s?.tipoId ?? '');
    this.fNombre.set(s?.nombre ?? '');
    this.subtipoModal.set(s ? s.id : 'nuevo');
  }
  guardarSubtipo(): void {
    const m = this.subtipoModal();
    if (!m || !this.subtipoValido()) return;
    const nombre = this.fNombre().trim();
    if (m === 'nuevo') {
      const id = idSubtipoNuevo(this.fTipoPadre(), nombre, this.estado.subtiposTicket().map((s) => s.id));
      this.estado.crearSubtipo(id, this.fTipoPadre(), nombre);
      this.aviso.set(`Subtipo «${nombre}» creado.`);
    } else {
      this.estado.actualizarSubtipo(m, this.fTipoPadre(), nombre);
      this.aviso.set(`Subtipo «${nombre}» actualizado.`);
    }
    this.subtipoModal.set(null);
  }
  alternarSubtipo(s: SubtipoTicketCfg): void {
    this.estado.alternarSubtipo(s.id);
    this.aviso.set(`Subtipo «${s.nombre}» ${s.activo ? 'desactivado' : 'reactivado'}.`);
  }
}
