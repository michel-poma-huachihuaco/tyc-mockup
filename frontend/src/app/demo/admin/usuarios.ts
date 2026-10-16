import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  AyAvatar,
  AyBadge,
  AyButton,
  AyCardPairs,
  AyCelda,
  AyCheckbox,
  AyConfirmationDialog,
  AyCrudToolbar,
  AyDataGrid,
  AyDialog,
  AyDrawer,
  AyEmptyState,
  AyFilterControl,
  AyForm,
  AyFormField,
  AyInput,
  AySearchInput,
  AySelect,
  AySidePanel,
  AySplitter,
  AyTableToolbar,
  AyToastService,
} from '@aybarcorp/ui-angular';
import type { AyCrudAccion, AyFilterOpcion, AyFilterValor, AyFormErrorCampo, AyGridColumna, AyOpcionSelect, AyOrden, ParCardPairs } from '@aybarcorp/ui-angular';
import { AREAS_DISPONIBLES, ROLES } from '../datos';
import type { EstadoPersona, Persona } from '../datos';
import { fechaCorta, haceTiempo } from '../formato';
import { usarMedia } from '../utiles';
import { EstadoAdmin } from './estado';
import { SIN_FILTROS, asignarRol, crearPersona, filtrarPersonas, reactivar, recuentoPor, suspender, validarAlta } from './logica';
import type { ErroresAlta, FiltrosPersonas } from './logica';

const ESTADOS: readonly EstadoPersona[] = ['activo', 'invitado', 'suspendido'];
const ETIQUETA_ESTADO: Record<EstadoPersona, string> = { activo: 'Activa', invitado: 'Invitada', suspendido: 'Suspendida' };
const TONO_ESTADO: Record<EstadoPersona, 'success' | 'info' | 'warning'> = { activo: 'success', invitado: 'info', suspendido: 'warning' };
const ROLES_EXTRA = ROLES.filter((r) => r.id !== 'USER');

/**
 * Usuarios: el CRUD en memoria de las 64 personas sintéticas.
 *
 * - Table Toolbar con la búsqueda (Search Input) y los filtros de área, rol y estado
 *   (Filter Control), el recuento y «Invitar a una persona».
 * - Data Grid con orden, selección y navegación por celdas; el nombre abre el detalle.
 * - Crud Toolbar para la selección: asignar un rol (un Dialog con el rol), reactivar y
 *   suspender, que confirma ella misma y dice cuántas no se pudieron procesar.
 * - El detalle va en un Splitter (lista | detalle) desde 1280 px y en un Side Panel por
 *   debajo; el alta, en un Drawer con un Form que valida y resume los errores.
 */
@Component({
  selector: 'gl-admin-usuarios',
  imports: [
    AyAvatar,
    AyBadge,
    AyButton,
    AyCardPairs,
    AyCelda,
    AyCheckbox,
    AyConfirmationDialog,
    AyCrudToolbar,
    AyDataGrid,
    AyDialog,
    AyDrawer,
    AyEmptyState,
    AyFilterControl,
    AyForm,
    AyFormField,
    AyInput,
    AySearchInput,
    AySelect,
    AySidePanel,
    AySplitter,
    AyTableToolbar,
    NgTemplateOutlet,
  ],
  template: `
    <div class="gl-seccion gl-usuarios">
      <ay-table-toolbar [recuento]="visibles().length" etiquetaElemento="personas">
        <ay-search-input ayBusqueda etiqueta="Buscar personas" placeholder="Nombre, correo o teléfono" size="sm" [valor]="filtros().consulta" (valorChange)="filtrar({ consulta: $event })" />
        <ng-container ayFiltros>
          <ay-filter-control etiqueta="Área" size="sm" [opciones]="opcionesArea()" [valor]="valorAreas()" (valorChange)="filtrar({ areas: lista($event) })" />
          <ay-filter-control etiqueta="Rol" size="sm" [opciones]="opcionesRol()" [valor]="valorRoles()" (valorChange)="filtrar({ roles: lista($event) })" />
          <ay-filter-control etiqueta="Estado" size="sm" [opciones]="opcionesEstado()" [valor]="valorEstados()" (valorChange)="filtrar({ estados: lista($event) })" />
        </ng-container>
        <ay-button ayAcciones tamano="sm" (click)="abrirAlta()">Invitar a una persona</ay-button>
      </ay-table-toolbar>

      <ay-crud-toolbar
        [seleccionados]="seleccion().size"
        [total]="visibles().length"
        etiquetaSingular="persona"
        etiquetaPlural="personas"
        [acciones]="acciones"
        [destructiva]="accionSuspender"
        [resultado]="resultado()"
        (ejecutar)="ejecutar($event)"
        (seleccionarTodos)="seleccionarVisibles()"
        (limpiarSeleccion)="seleccion.set(vacia)"
        (verFallidos)="verFallidas()"
      />

      @if (ancho()) {
        <div class="gl-usuarios__reparto">
          <ay-splitter [(tamano)]="reparto" [minimo]="40" [maximo]="78" clavePersistencia="galeria-usuarios" etiqueta="Ajustar el ancho de la tabla de personas">
            <div ayPanelInicio class="gl-usuarios__panel">
              <ng-container [ngTemplateOutlet]="rejilla" />
            </div>
            <section ayPanelFin class="gl-usuarios__panel gl-usuarios__detalle" aria-label="Detalle de la persona">
              @if (elegida(); as p) {
                <ng-container [ngTemplateOutlet]="detalle" [ngTemplateOutletContext]="{ $implicit: p }" />
              } @else {
                <ay-empty-state size="compact" titulo="Elige a una persona" descripcion="Pulsa su nombre en la tabla para ver su detalle aquí." />
              }
            </section>
          </ay-splitter>
        </div>
      } @else {
        <ng-container [ngTemplateOutlet]="rejilla" />
        <ay-side-panel [titulo]="elegida()?.nombre" [abierto]="elegida() !== null" (abiertoChange)="!$event && elegidaId.set(null)">
          @if (elegida(); as p) {
            <ng-container [ngTemplateOutlet]="detalle" [ngTemplateOutletContext]="{ $implicit: p }" />
          }
        </ay-side-panel>
      }
    </div>

    <ng-template #rejilla>
      @if (visibles().length === 0) {
        <ay-empty-state variante="no-results" [titulo]="'Nadie coincide'" descripcion="Prueba con otra búsqueda o quita algún filtro.">
          <div ayAcciones><ay-button variante="secondary" (click)="limpiarFiltros()">Quitar los filtros</ay-button></div>
        </ay-empty-state>
      } @else {
        <ay-data-grid
          leyenda="Personas"
          conSeleccion
          [columnas]="columnas"
          [filas]="visibles()"
          [idDe]="idDe"
          [totalFilas]="visibles().length"
          [seleccion]="seleccion()"
          [orden]="orden()"
          (seleccionChange)="seleccion.set($event)"
          (ordenChange)="orden.set($event)"
          (abrirFila)="elegidaId.set($event)"
        >
          <ng-template ayCelda="nombre" let-fila>
            @let p = persona(fila);
            <span class="gl-persona">
              <ay-avatar [nombre]="p.nombre" size="sm" decorativo />
              <span class="gl-persona__texto">
                <button type="button" class="gl-enlace gl-persona__nombre" (click)="elegidaId.set(p.id)">{{ p.nombre }}</button>
                <span class="gl-persona__correo">{{ p.correo }}</span>
              </span>
            </span>
          </ng-template>
          <ng-template ayCelda="roles" let-fila>
            @let p = persona(fila);
            <span class="gl-insignias">
              @for (rol of p.roles; track rol) {
                @if (rol !== 'USER') {
                  <ay-badge size="sm" [tono]="rol === 'ADMIN' ? 'info' : 'neutral'">{{ rol }}</ay-badge>
                }
              }
              @if (p.roles.length === 1) {
                <span class="gl-nota">USER</span>
              }
            </span>
          </ng-template>
          <ng-template ayCelda="estado" let-fila>
            @let p = persona(fila);
            <ay-badge size="sm" [tono]="tonoEstado(p.estado)" punto>{{ etiquetaEstado(p.estado) }}</ay-badge>
          </ng-template>
          <ng-template ayCelda="ultimoAcceso" let-fila>
            @let p = persona(fila);
            {{ p.ultimoAcceso ? hace(p.ultimoAcceso) : 'Nunca' }}
          </ng-template>
        </ay-data-grid>
      }
    </ng-template>

    <ng-template #detalle let-p>
      <div class="gl-detalle">
        <div class="gl-detalle__cabecera">
          <ay-avatar [nombre]="p.nombre" size="lg" />
          <div>
            <h2 class="gl-subtitulo">{{ p.nombre }}</h2>
            <ay-badge size="sm" [tono]="tonoEstado(p.estado)" punto>{{ etiquetaEstado(p.estado) }}</ay-badge>
          </div>
        </div>
        <ay-card-pairs [pares]="pares(p)" />
        <div class="gl-form__pie gl-form__pie--inicio">
          @if (p.estado === 'suspendido') {
            <ay-button variante="secondary" tamano="sm" (click)="reactivarUna(p)">Reactivar</ay-button>
          } @else if (p.estado === 'activo') {
            <ay-button variante="danger" tamano="sm" (click)="pedirSuspension(p)">Suspender</ay-button>
          }
          <ay-button variante="ghost" tamano="sm" (click)="elegidaId.set(null)">Cerrar el detalle</ay-button>
        </div>
      </div>
    </ng-template>

    <ay-confirmation-dialog
      [abierto]="suspendiendo() !== null"
      tono="danger"
      [titulo]="'Suspender a ' + (suspendiendo()?.nombre ?? '')"
      descripcion="No podrá entrar hasta que alguien de administración la reactive. Sus datos se conservan."
      etiquetaConfirmar="Suspender"
      (confirmar)="suspenderUna()"
      (abiertoChange)="!$event && suspendiendo.set(null)"
    />

    <ay-dialog [abierto]="asignando()" titulo="Asignar un rol" [descripcion]="'A ' + seleccion().size + ' personas seleccionadas.'" tienePie (abiertoChange)="asignando.set($event)">
      <ay-form-field etiqueta="Rol">
        <ay-select [opciones]="opcionesSelectRol" [(valor)]="rolElegido" />
      </ay-form-field>
      <ng-container ayPie>
        <ay-button variante="ghost" (click)="asignando.set(false)">Cancelar</ay-button>
        <ay-button (click)="asignarSeleccion()">Asignar {{ rolElegido() }}</ay-button>
      </ng-container>
    </ay-dialog>

    <ay-drawer titulo="Invitar a una persona" size="md" [(abierto)]="altaAbierta">
      <ay-form [errores]="resumenAlta()" resumen [enviando]="guardandoAlta()" (enviar)="guardarAlta()">
        <ay-form-field etiqueta="Nombre y apellido" campoId="gl-alta-nombre" [error]="erroresAlta().nombre" obligatorio>
          <ay-input autocompletado="off" [valor]="alta().nombre" (valorChange)="escribirAlta('nombre', $event)" />
        </ay-form-field>
        <ay-form-field etiqueta="Correo" campoId="gl-alta-correo" ayuda="Le llegará la invitación (en la maqueta, no llega nada)." [error]="erroresAlta().correo" obligatorio>
          <ay-input tipo="email" placeholder="nombre@ejemplo.test" [valor]="alta().correo" (valorChange)="escribirAlta('correo', $event)" />
        </ay-form-field>
        <ay-form-field etiqueta="Área" campoId="gl-alta-area" [error]="erroresAlta().area" obligatorio>
          <ay-select placeholder="Elige un área" [opciones]="opcionesSelectArea" [valor]="alta().area" (valorChange)="escribirAlta('area', $event)" />
        </ay-form-field>
        <fieldset class="gl-grupo">
          <legend class="ay-legend">Roles además de USER</legend>
          @for (rol of rolesExtra; track rol.id) {
            <ay-checkbox [marcado]="alta().roles.includes(rol.id)" [ayuda]="rol.descripcion" (marcadoChange)="alternarRolAlta(rol.id, $event)">{{ rol.nombre }}</ay-checkbox>
          }
        </fieldset>
        <div class="ay-form__actions">
          <ay-button variante="ghost" (click)="altaAbierta.set(false)">Cancelar</ay-button>
          <ay-button tipo="submit" [cargando]="guardandoAlta()">Enviar la invitación</ay-button>
        </div>
      </ay-form>
    </ay-drawer>
  `,
})
export class AdminUsuarios {
  private readonly admin = inject(EstadoAdmin);
  private readonly toast = inject(AyToastService);

  protected readonly ancho = usarMedia('(min-width: 1280px)');
  protected readonly vacia: ReadonlySet<string> = new Set();
  protected readonly reparto = signal(68);
  protected readonly idDe = (p: Persona) => p.id;
  protected readonly hace = haceTiempo;

  protected readonly columnas: AyGridColumna[] = [
    { clave: 'nombre', cabecera: 'Persona', ordenable: true, ancho: '18rem' },
    { clave: 'area', cabecera: 'Área', ordenable: true, ancho: '9rem' },
    { clave: 'roles', cabecera: 'Roles', ancho: '8rem' },
    { clave: 'estado', cabecera: 'Estado', ordenable: true, ancho: '8rem' },
    { clave: 'ultimoAcceso', cabecera: 'Último acceso', ordenable: true, alineacion: 'end', ancho: '8.5rem' },
  ];

  protected readonly filtros = signal<FiltrosPersonas>(SIN_FILTROS);
  /** Copias estables de los filtros para los Filter Control (piden un arreglo mutable). */
  protected readonly valorAreas = computed(() => [...this.filtros().areas]);
  protected readonly valorRoles = computed(() => [...this.filtros().roles]);
  protected readonly valorEstados = computed(() => [...this.filtros().estados]);
  protected readonly orden = signal<AyOrden | undefined>({ clave: 'nombre', dir: 'asc' });
  protected readonly seleccion = signal<ReadonlySet<string>>(new Set());
  protected readonly elegidaId = signal<string | null>(null);
  protected readonly visibles = computed(() => filtrarPersonas(this.admin.personas(), this.filtros()));
  protected readonly elegida = computed(() => this.admin.personas().find((p) => p.id === this.elegidaId()) ?? null);
  protected readonly resultado = signal<{ correctos: number; fallidos: number } | undefined>(undefined);
  private fallidas: string[] = [];

  protected readonly opcionesArea = computed<AyFilterOpcion[]>(() => {
    const recuento = recuentoPor(this.admin.personas(), 'area', AREAS_DISPONIBLES);
    return AREAS_DISPONIBLES.map((a) => ({ valor: a, etiqueta: a, recuento: recuento[a] }));
  });
  protected readonly opcionesRol = computed<AyFilterOpcion[]>(() =>
    ROLES.map((r) => ({ valor: r.id, etiqueta: r.nombre, recuento: this.admin.personas().filter((p) => p.roles.includes(r.id)).length })),
  );
  protected readonly opcionesEstado = computed<AyFilterOpcion[]>(() => {
    const recuento = recuentoPor(this.admin.personas(), 'estado', ESTADOS);
    return ESTADOS.map((e) => ({ valor: e, etiqueta: ETIQUETA_ESTADO[e], recuento: recuento[e] }));
  });

  protected readonly acciones: AyCrudAccion[] = [
    { id: 'rol', etiqueta: (n, item) => `Asignar un rol a ${n} ${item}` },
    { id: 'reactivar', etiqueta: (n, item) => `Reactivar ${n} ${item}`, variante: 'ghost' },
  ];
  protected readonly accionSuspender: AyCrudAccion = { id: 'suspender', etiqueta: (n, item) => `Suspender ${n} ${item}` };

  protected readonly asignando = signal(false);
  protected readonly rolElegido = signal('VENTAS');
  protected readonly opcionesSelectRol: AyOpcionSelect[] = ROLES_EXTRA.map((r) => ({ value: r.id, label: `${r.nombre} (${r.id})` }));
  protected readonly suspendiendo = signal<Persona | null>(null);

  protected readonly altaAbierta = signal(false);
  protected readonly guardandoAlta = signal(false);
  protected readonly alta = signal({ nombre: '', correo: '', area: '', roles: [] as string[] });
  protected readonly erroresAlta = signal<ErroresAlta>({});
  protected readonly resumenAlta = computed<AyFormErrorCampo[]>(() => {
    const e = this.erroresAlta();
    return (['nombre', 'correo', 'area'] as const).flatMap((campo) => (e[campo] ? [{ id: `gl-alta-${campo}`, mensaje: e[campo]! }] : []));
  });
  protected readonly opcionesSelectArea: AyOpcionSelect[] = AREAS_DISPONIBLES.map((a) => ({ value: a, label: a }));
  protected readonly rolesExtra = ROLES_EXTRA;

  constructor() {
    // Filtrar deja fuera de la vista a quien estaba seleccionado: la selección se ajusta.
    effect(() => {
      const visibles = new Set(this.visibles().map((p) => p.id));
      untracked(() => {
        const actual = this.seleccion();
        const quedan = [...actual].filter((id) => visibles.has(id));
        if (quedan.length !== actual.size) this.seleccion.set(new Set(quedan));
      });
    });
  }

  protected lista(valor: AyFilterValor | undefined): string[] {
    return Array.isArray(valor) ? valor.map(String) : typeof valor === 'string' && valor ? [valor] : [];
  }

  protected filtrar(cambio: Partial<FiltrosPersonas>): void {
    this.filtros.update((f) => ({ ...f, ...cambio }));
    this.resultado.set(undefined);
  }

  protected limpiarFiltros(): void {
    this.filtros.set(SIN_FILTROS);
  }

  /** La fila de la rejilla con su tipo: `let-fila` llega como un registro sin tipar. */
  protected persona(fila: unknown): Persona {
    return fila as Persona;
  }

  protected etiquetaEstado(estado: EstadoPersona): string {
    return ETIQUETA_ESTADO[estado];
  }

  protected tonoEstado(estado: EstadoPersona): 'success' | 'info' | 'warning' {
    return TONO_ESTADO[estado];
  }

  protected pares(p: Persona): ParCardPairs[] {
    return [
      { clave: 'Correo', valor: p.correo },
      { clave: 'Teléfono', valor: p.telefono || '—' },
      { clave: 'Área', valor: p.area },
      { clave: 'Roles', valor: p.roles.join(', ') },
      { clave: 'Verificación en dos pasos', valor: p.dobleFactor ? 'Activa' : 'Sin activar' },
      { clave: 'Último acceso', valor: p.ultimoAcceso ? haceTiempo(p.ultimoAcceso) : 'Nunca entró' },
      { clave: 'Alta', valor: fechaCorta(p.creada) },
    ];
  }

  protected seleccionarVisibles(): void {
    this.seleccion.set(new Set(this.visibles().map((p) => p.id)));
  }

  protected ejecutar(accion: string): void {
    const ids = this.seleccion();
    if (accion === 'rol') {
      this.asignando.set(true);
      return;
    }
    const personas = this.admin.personas();
    const elegidas = personas.filter((p) => ids.has(p.id));
    if (accion === 'suspender') {
      const posibles = elegidas.filter((p) => p.estado === 'activo');
      this.admin.personas.set(suspender(personas, ids));
      this.informar(posibles.length, elegidas.filter((p) => p.estado !== 'activo').map((p) => p.id));
    } else if (accion === 'reactivar') {
      const posibles = elegidas.filter((p) => p.estado === 'suspendido');
      this.admin.personas.set(reactivar(personas, ids));
      this.informar(posibles.length, elegidas.filter((p) => p.estado !== 'suspendido').map((p) => p.id));
    }
  }

  protected asignarSeleccion(): void {
    const ids = this.seleccion();
    const rol = this.rolElegido();
    const ya = this.admin.personas().filter((p) => ids.has(p.id) && p.roles.includes(rol)).map((p) => p.id);
    this.admin.personas.set(asignarRol(this.admin.personas(), ids, rol));
    this.asignando.set(false);
    this.informar(ids.size - ya.length, ya);
  }

  /** El resultado del lote en la Crud Toolbar: lo que no aplicaba cuenta como fallido. */
  private informar(correctos: number, fallidas: string[]): void {
    this.fallidas = fallidas;
    this.resultado.set({ correctos, fallidos: fallidas.length });
  }

  protected verFallidas(): void {
    this.seleccion.set(new Set(this.fallidas));
    this.resultado.set(undefined);
    this.toast.mostrar({ mensaje: 'Seleccionadas las personas a las que no aplicaba la acción (invitadas o ya en ese estado).', tono: 'info' });
  }

  protected pedirSuspension(p: Persona): void {
    this.suspendiendo.set(p);
  }

  protected suspenderUna(): void {
    const p = this.suspendiendo();
    if (!p) return;
    this.admin.personas.set(suspender(this.admin.personas(), new Set([p.id])));
    this.suspendiendo.set(null);
    this.toast.mostrar({ mensaje: `${p.nombre} quedó suspendida.`, tono: 'success' });
  }

  protected reactivarUna(p: Persona): void {
    this.admin.personas.set(reactivar(this.admin.personas(), new Set([p.id])));
    this.toast.mostrar({ mensaje: `${p.nombre} vuelve a estar activa.`, tono: 'success' });
  }

  protected abrirAlta(): void {
    this.alta.set({ nombre: '', correo: '', area: '', roles: [] });
    this.erroresAlta.set({});
    this.altaAbierta.set(true);
  }

  protected escribirAlta(campo: 'nombre' | 'correo' | 'area', valor: string): void {
    this.alta.update((a) => ({ ...a, [campo]: valor }));
    if (this.erroresAlta()[campo]) this.erroresAlta.update((e) => ({ ...e, [campo]: undefined }));
  }

  protected alternarRolAlta(rol: string, marcado: boolean): void {
    this.alta.update((a) => ({ ...a, roles: marcado ? [...a.roles, rol] : a.roles.filter((r) => r !== rol) }));
  }

  protected guardarAlta(): void {
    const errores = validarAlta(this.alta(), this.admin.personas());
    this.erroresAlta.set(errores);
    if (Object.keys(errores).length > 0) return;
    this.guardandoAlta.set(true);
    setTimeout(() => {
      const nueva = crearPersona(this.alta(), this.admin.personas());
      this.admin.personas.update((lista) => [nueva, ...lista]);
      this.guardandoAlta.set(false);
      this.altaAbierta.set(false);
      this.elegidaId.set(nueva.id);
      this.toast.mostrar({ mensaje: `Invitación enviada a ${nueva.correo} (en la maqueta no sale nada).`, tono: 'success' });
    }, 700);
  }
}
