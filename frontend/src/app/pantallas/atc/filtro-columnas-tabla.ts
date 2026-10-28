import {
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  type Signal,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { AyTable, type AyColumna } from '@aybarcorp/ui-angular';
import {
  ESTADO_ES,
  PRIORIDADES_TICKET,
  evaluarSlaTicket,
  fmtFechaHora,
  type TicketAtc,
} from './datos-atc';
import {
  ALERTA_SLA_ES,
  AREA_ES,
  ASIENTO_TIPO_ES,
  CIERRE_SGD_ES,
  CRITICIDAD_ES,
  EVENTO_URBEMIND_ES,
  GARANTIA_ESTADO_ES,
} from './etiquetas-es';
import {
  TODAS,
  coincideRangoFecha,
  formatearRangoIso,
  parsearFechaValor,
  type FiltrosTabla,
} from './filtros-tabla';

interface OpcionColumna {
  readonly valor: string;
  readonly etiqueta: string;
  readonly recuento: number;
  readonly activo: boolean;
}

interface SeccionFiltroColumna {
  readonly id: string;
  readonly titulo: string;
  readonly tipo: 'multi' | 'single' | 'rango-fechas';
  readonly conBusqueda: boolean;
  readonly opciones: readonly OpcionColumna[];
  readonly activosCount: number;
  readonly rango?: readonly [string, string];
  readonly setRango?: (desde: string, hasta: string) => void;
  readonly alternar: (valor: string) => void;
  readonly limpiar: () => void;
}

const COLUMNAS_SIN_FILTRO = new Set(['accion', 'acciones']);

const COLUMNAS_FECHA_LOCAL = new Set([
  'fecha',
  'vencimientoEvaluado',
  'vencimiento',
  'fechaFirma',
  'fechaPago',
  'plazo',
  'insp',
  'sla',
]);

/**
 * Mapa de columnas de tabla → ids de filtro en `FiltrosTabla` para las tablas que usan `crearFiltrosTabla`.
 * Las demás columnas o tablas obtienen automáticamente un desplegable facetado local sobre las filas.
 */
const MAPA_FILTROS_POR_TABLA: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  'bandeja-tickets': {
    num: ['empresa', 'fechaApertura'],
    prio: ['prioridad'],
    rayo: ['rayo'],
    cli: ['proyecto', 'cliente'],
    ch: ['canal', 'tipo'],
    area: ['area', 'gestor'],
    state: ['estado'],
    sla: ['sla', 'fechaSla'],
  },
  'acciones-hoy': {
    etiqueta: ['categoria'],
  },
  'monitor-personas': {
    persona: ['persona'],
    area: ['area'],
    sla: ['sla'],
  },
  'cierre-e2e': {
    eje: ['eje'],
    etiqueta: ['situacion'],
  },
  'catalogo-hu': {
    etapa: ['etapa'],
  },
};

export function extraerValorYEtiquetaColumna(
  fila: Record<string, unknown>,
  clave: string,
): { valor: string; etiqueta: string } {
  if ('resDue' in fila && 'prio' in fila && 'co' in fila) {
    const t = fila as unknown as TicketAtc;
    switch (clave) {
      case 'num':
        return { valor: t.co, etiqueta: `${t.co} · ${t.empresa?.nombre ?? t.co}` };
      case 'prio': {
        const p = PRIORIDADES_TICKET.find((x) => x.id === t.prio);
        return { valor: t.prio, etiqueta: p?.nombre ?? t.prio };
      }
      case 'rayo':
        return t.rayo
          ? { valor: 'SI', etiqueta: '⚡ Con prioridad Rayo' }
          : { valor: 'NO', etiqueta: 'Sin prioridad Rayo' };
      case 'cli':
        return { valor: t.cli, etiqueta: `${t.cli} (${t.proj})` };
      case 'ch':
        return { valor: t.ch, etiqueta: t.ch };
      case 'area':
        return { valor: t.area, etiqueta: AREA_ES[t.area] ?? t.area };
      case 'state':
        return { valor: t.state, etiqueta: ESTADO_ES[t.state] ?? t.state };
      case 'sla': {
        const ev = evaluarSlaTicket(t);
        return { valor: ev.tono, etiqueta: ev.txt };
      }
    }
  }

  switch (clave) {
    case 'asiento':
      if ('co' in fila && 'n' in fila) {
        const v = `${fila['co']}-2026-${fila['n']}`;
        return { valor: v, etiqueta: v };
      }
      break;
    case 'plazo':
      if ('reg' in fila) {
        const v = fila['resp'] ? 'RESPONDIDO' : fila['ext'] ? 'PRORROGA_30D' : 'ORDINARIO_15D';
        const et = fila['resp']
          ? 'Respondido en plazo'
          : fila['ext']
            ? 'Con prórroga (30 d)'
            : 'En plazo ordinario (15 d)';
        return { valor: v, etiqueta: et };
      }
      break;
    case 'prorroga':
      if ('ext' in fila) {
        return fila['ext']
          ? { valor: 'SI', etiqueta: 'Con prórroga (+15 d)' }
          : { valor: 'NO', etiqueta: 'Sin prórroga (15 d)' };
      }
      break;
    case 'cargo':
      if ('act' in fila) {
        return fila['act']
          ? { valor: 'ACTIVADO', etiqueta: 'Cargo activado' }
          : { valor: 'LIMBO', etiqueta: 'En limbo (sin activar)' };
      }
      break;
    case 'deuda':
      if ('cuotasImpagas' in fila) {
        const c = Number(fila['cuotasImpagas'] ?? 0);
        return { valor: String(c), etiqueta: `${c} cuotas vencidas` };
      }
      break;
    case 'carta':
      if ('carta' in fila && fila['carta'] && typeof fila['carta'] === 'object') {
        const tieneAccion = Boolean((fila['carta'] as { accion?: unknown }).accion);
        return tieneAccion
          ? { valor: 'CON_ACCION', etiqueta: 'Con acción registrada' }
          : { valor: 'PENDIENTE', etiqueta: 'Pendiente de acción' };
      }
      break;
    case 'n':
      if ('clienteNombre' in fila) {
        const v = String(fila['clienteNombre'] ?? '');
        return { valor: v, etiqueta: v };
      }
      break;
    case 'reg':
      if ('estado' in fila && 'busId' in fila) {
        const v = String(fila['estado'] ?? '');
        return { valor: v, etiqueta: v };
      }
      break;
    case 'acompanantes':
      if ('acompanantes' in fila) {
        const n = 1 + Number(fila['acompanantes'] ?? 0);
        return { valor: String(n), etiqueta: `${n} persona(s)` };
      }
      break;
    case 'clienteNombre':
      if ('cliente' in fila && !('clienteNombre' in fila)) {
        const v = String(fila['cliente'] ?? '');
        return { valor: v, etiqueta: v };
      }
      break;
    case 'version':
      if ('versionActual' in fila) {
        const v = `v${fila['versionActual'] ?? 1}`;
        return { valor: v, etiqueta: v };
      }
      break;
    case 'versionActual':
      if ('versionActual' in fila) {
        const rawV = fila['versionActual'];
        return rawV
          ? { valor: `v${rawV}`, etiqueta: `v${rawV}` }
          : { valor: 'SIN_GUIA', etiqueta: 'Sin guía publicada' };
      }
      break;
    case 'pasos':
      if (Array.isArray(fila['pasos'])) {
        const n = fila['pasos'].length;
        return { valor: String(n), etiqueta: `${n} pasos configurados` };
      }
      break;
    case 'resumen':
      if (Array.isArray(fila['pasos']) && Array.isArray(fila['plantillas'])) {
        const v = `${fila['pasos'].length} pasos · ${fila['plantillas'].length} plantillas`;
        return { valor: v, etiqueta: v };
      }
      break;
  }

  const raw = fila[clave];
  if (raw instanceof Date) {
    const f = fmtFechaHora(raw);
    return { valor: f, etiqueta: f };
  }
  if (typeof raw === 'boolean') {
    return raw ? { valor: 'true', etiqueta: 'Sí' } : { valor: 'false', etiqueta: 'No' };
  }
  const str = String(raw ?? '').trim();
  if (!str) {
    if (clave === 'insp') return { valor: 'SIN_AGENDAR', etiqueta: 'Sin agendar' };
    if (clave === 'error') return { valor: 'SIN_ERROR', etiqueta: 'Sin errores' };
    return { valor: '__vacio__', etiqueta: 'Sin dato' };
  }

  if (clave === 'area' && AREA_ES[str]) {
    return { valor: str, etiqueta: AREA_ES[str] };
  }
  if ((clave === 'state' || clave === 'estado') && ESTADO_ES[str]) {
    return { valor: str, etiqueta: ESTADO_ES[str] };
  }
  if ((clave === 'state' || clave === 'estado') && GARANTIA_ESTADO_ES[str]) {
    return { valor: str, etiqueta: GARANTIA_ESTADO_ES[str] };
  }
  if (clave === 'estado' && 'closeState' in fila) {
    const cs = String(fila['closeState'] ?? '');
    return { valor: cs, etiqueta: CIERRE_SGD_ES[cs] ?? cs };
  }
  if (clave === 'tipo') {
    if ('tipoTicket' in fila && !('tipo' in fila)) {
      const tt = String(fila['tipoTicket'] ?? '');
      return { valor: tt, etiqueta: tt };
    }
    if (ALERTA_SLA_ES[str]) return { valor: str, etiqueta: ALERTA_SLA_ES[str] };
    if (EVENTO_URBEMIND_ES[str]) return { valor: str, etiqueta: EVENTO_URBEMIND_ES[str] };
  }
  if (clave === 'kind' && ASIENTO_TIPO_ES[str]) {
    return { valor: str, etiqueta: ASIENTO_TIPO_ES[str] };
  }
  if (clave === 'criticidad' && CRITICIDAD_ES[str]) {
    return { valor: str, etiqueta: CRITICIDAD_ES[str] };
  }
  if (clave === 'pct') {
    return { valor: str, etiqueta: `${str}%` };
  }
  if (clave === 'respuestaH' || clave === 'resolucionH') {
    return { valor: str, etiqueta: `${str} h hábiles` };
  }
  if (clave === 'estadoHttp') {
    return { valor: str, etiqueta: `HTTP ${str}` };
  }

  return { valor: str, etiqueta: str };
}

export function extraerFechaDeFila(fila: Record<string, unknown>, clave: string): unknown {
  if ('resDue' in fila && (clave === 'sla' || clave === 'fechaSla')) return fila['resDue'];
  if ('opened' in fila && (clave === 'num' || clave === 'fechaApertura')) return fila['opened'];
  if ('reg' in fila && clave === 'plazo') return fila['reg'];
  return fila[clave];
}

@Directive({
  selector: 'ay-table',
  standalone: true,
})
export class FiltroColumnasTablaDirective {
  private readonly tabla = inject<AyTable<Record<string, unknown>>>(AyTable);
  private readonly tablaInterna = this.tabla as unknown as {
    visibles: Signal<readonly Record<string, unknown>[]>;
  };
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doc = inject(DOCUMENT);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filtrosTabla = input<FiltrosTabla<any> | undefined>(undefined);

  readonly filtrosLocales = signal<Readonly<Record<string, readonly string[]>>>({});
  readonly rangosFechaLocales = signal<Readonly<Record<string, readonly [string, string]>>>({});
  readonly columnaAbierta = signal<string | null>(null);

  private popoverEl: HTMLElement | null = null;
  private barraLocalEl: HTMLElement | null = null;
  private thActivoEl: HTMLElement | null = null;
  private textoBusquedaPopover = '';
  private listoEnDom = false;

  constructor() {
    const baseFilas = this.tabla.filas;
    this.tablaInterna.visibles = computed(() => {
      const filas = baseFilas();
      const locales = this.filtrosLocales();
      const rangos = this.rangosFechaLocales();
      const clavesActivas = Object.keys(locales).filter((k) => (locales[k]?.length ?? 0) > 0);
      const rangosActivos = Object.keys(rangos).filter((k) => {
        const r = rangos[k];
        return Boolean(r && (r[0].trim() || r[1].trim()));
      });
      const filtradas =
        clavesActivas.length === 0 && rangosActivos.length === 0
          ? filas
          : filas.filter(
              (f) =>
                clavesActivas.every((k) => {
                  const sel = locales[k];
                  if (!sel?.length) return true;
                  const { valor } = extraerValorYEtiquetaColumna(f, k);
                  return sel.includes(valor);
                }) &&
                rangosActivos.every((k) => {
                  const r = rangos[k];
                  if (!r) return true;
                  return coincideRangoFecha(extraerFechaDeFila(f, k), r[0], r[1]);
                }),
            );
      const o = this.tabla.orden();
      if (!o) return filtradas;
      const dir = o.dir === 'asc' ? 1 : -1;
      return [...filtradas].sort((a, b) => {
        const va = a[o.clave];
        const vb = b[o.clave];
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
        }
        return (
          String(va ?? '').localeCompare(String(vb ?? ''), 'es', {
            numeric: true,
            sensitivity: 'base',
          }) * dir
        );
      });
    });

    afterNextRender(() => {
      this.listoEnDom = true;
      this.configurarListenersHost();
      this.sincronizarCabeceras();
      this.sincronizarBarraLocal();
      this.destroyRef.onDestroy(() => {
        this.ocultarPopoverDom();
        this.barraLocalEl?.remove();
      });
    });

    effect(() => {
      // Leemos las señales reactivas que deben refrescar las cabeceras o el popover abierto
      this.tabla.columnas();
      this.tabla.filas();
      this.tabla.orden();
      this.filtrosLocales();
      this.rangosFechaLocales();
      const colAbierta = this.columnaAbierta();
      const f = this.filtrosTabla();
      if (f) {
        f.huella();
      }
      if (!this.listoEnDom) return;

      untracked(() => {
        this.sincronizarCabeceras();
        this.sincronizarBarraLocal();
        if (colAbierta) {
          const focoEnFecha = this.doc.activeElement?.classList.contains(
            'pl-col-filtro-popover__fecha-input',
          );
          if (!focoEnFecha || !this.popoverEl) {
            this.renderizarPopover();
          }
        } else {
          this.ocultarPopoverDom();
        }
      });
    });
  }

  private esColumnaFiltrable(col: AyColumna | undefined): col is AyColumna {
    return Boolean(col && !COLUMNAS_SIN_FILTRO.has(col.clave));
  }

  private obtenerIdsFiltroTabla(claveColumna: string): readonly string[] {
    const f = this.filtrosTabla();
    if (!f) return [];
    const porTabla = MAPA_FILTROS_POR_TABLA[f.cfg.clave]?.[claveColumna];
    if (porTabla?.length) {
      return porTabla.filter((id) => f.cfg.filtros.some((d) => d.id === id));
    }
    const directo = f.cfg.filtros.find((d) => d.id === claveColumna);
    return directo ? [directo.id] : [];
  }

  private contarActivosColumna(claveColumna: string): number {
    const f = this.filtrosTabla();
    const ids = this.obtenerIdsFiltroTabla(claveColumna);
    if (f && ids.length > 0) {
      return ids.reduce((acc, id) => {
        const def = f.cfg.filtros.find((d) => d.id === id);
        if (def?.tipo === 'rango-fechas') {
          return acc + (f.activo(id) ? 1 : 0);
        }
        return acc + f.valores(id).length;
      }, 0);
    }
    const loc = this.filtrosLocales()[claveColumna]?.length ?? 0;
    const r = this.rangosFechaLocales()[claveColumna];
    const tieneRango = Boolean(r && (r[0].trim() || r[1].trim()));
    return loc + (tieneRango ? 1 : 0);
  }

  private columnaTieneFechasLocal(claveColumna: string): boolean {
    if (COLUMNAS_FECHA_LOCAL.has(claveColumna)) return true;
    const primera = this.tabla.filas()[0];
    if (!primera) return false;
    return parsearFechaValor(extraerFechaDeFila(primera, claveColumna)) !== null;
  }

  private construirSeccionesColumna(col: AyColumna): readonly SeccionFiltroColumna[] {
    const f = this.filtrosTabla();
    const ids = this.obtenerIdsFiltroTabla(col.clave);
    if (f && ids.length > 0) {
      return ids.map((id) => {
        const def = f.cfg.filtros.find((d) => d.id === id)!;
        const seleccionados = f.valores(id);
        if (def.tipo === 'rango-fechas') {
          const desde = seleccionados[0] ?? '';
          const hasta = seleccionados[1] ?? '';
          const activo = Boolean(desde.trim() || hasta.trim());
          return {
            id,
            titulo: def.etiqueta,
            tipo: 'rango-fechas',
            conBusqueda: false,
            opciones: [],
            activosCount: activo ? 1 : 0,
            rango: [desde, hasta],
            setRango: (d: string, h: string) => {
              const dl = d.trim();
              const hl = h.trim();
              f.setValor(id, !dl && !hl ? undefined : [dl, hl]);
            },
            alternar: () => undefined,
            limpiar: () => f.setValor(id, undefined),
          };
        }

        const opcionesBase = f.opciones(id)();
        const opciones: OpcionColumna[] = opcionesBase.map((o) => ({
          valor: o.valor,
          etiqueta: o.etiqueta,
          recuento: o.recuento ?? 0,
          activo: seleccionados.includes(o.valor),
        }));
        const esUnico = def.tipo === 'single' || def.tipo === 'segmento' || def.tipo === 'boolean';
        return {
          id,
          titulo: def.etiqueta,
          tipo: esUnico ? 'single' : 'multi',
          conBusqueda: Boolean(def.conBusqueda || opciones.length > 6),
          opciones,
          activosCount: seleccionados.length,
          alternar: (valor: string) => {
            if (def.tipo === 'boolean') {
              f.setValor(id, !f.activo(id));
              return;
            }
            if (esUnico) {
              const yaActivo = seleccionados.includes(valor);
              f.setValor(id, yaActivo ? TODAS : valor);
              return;
            }
            const actual = [...seleccionados];
            const idx = actual.indexOf(valor);
            if (idx >= 0) actual.splice(idx, 1);
            else actual.push(valor);
            f.setValor(id, actual);
          },
          limpiar: () => f.setValor(id, undefined),
        };
      });
    }

    // Filtro facetado local sobre las filas de la tabla
    const todasFilas = this.tabla.filas();
    const locales = this.filtrosLocales();
    const otrasClaves = Object.keys(locales).filter(
      (k) => k !== col.clave && (locales[k]?.length ?? 0) > 0,
    );
    const filasContexto =
      otrasClaves.length === 0
        ? todasFilas
        : todasFilas.filter((fila) =>
            otrasClaves.every((k) => {
              const sel = locales[k];
              if (!sel?.length) return true;
              return sel.includes(extraerValorYEtiquetaColumna(fila, k).valor);
            }),
          );

    const catalogo = new Map<string, { etiqueta: string; recuento: number }>();
    for (const fila of todasFilas) {
      const { valor, etiqueta } = extraerValorYEtiquetaColumna(fila, col.clave);
      if (!catalogo.has(valor)) {
        catalogo.set(valor, { etiqueta, recuento: 0 });
      }
    }
    for (const fila of filasContexto) {
      const { valor, etiqueta } = extraerValorYEtiquetaColumna(fila, col.clave);
      const prev = catalogo.get(valor);
      catalogo.set(valor, {
        etiqueta: prev?.etiqueta ?? etiqueta,
        recuento: (prev?.recuento ?? 0) + 1,
      });
    }

    const seleccionados = locales[col.clave] ?? [];
    const opciones: OpcionColumna[] = Array.from(catalogo.entries()).map(([valor, info]) => ({
      valor,
      etiqueta: info.etiqueta,
      recuento: info.recuento,
      activo: seleccionados.includes(valor),
    }));

    const resultado: SeccionFiltroColumna[] = [
      {
        id: col.clave,
        titulo: col.cabecera,
        tipo: 'multi',
        conBusqueda: opciones.length > 6,
        opciones,
        activosCount: seleccionados.length,
        alternar: (valor: string) => {
          this.filtrosLocales.update((prev) => {
            const actual = [...(prev[col.clave] ?? [])];
            const idx = actual.indexOf(valor);
            if (idx >= 0) actual.splice(idx, 1);
            else actual.push(valor);
            return { ...prev, [col.clave]: actual };
          });
        },
        limpiar: () => {
          this.filtrosLocales.update((prev) => ({ ...prev, [col.clave]: [] }));
        },
      },
    ];

    if (this.columnaTieneFechasLocal(col.clave)) {
      const rActual = this.rangosFechaLocales()[col.clave] ?? ['', ''];
      const rActivo = Boolean(rActual[0].trim() || rActual[1].trim());
      resultado.push({
        id: `${col.clave}:rango-fechas`,
        titulo: 'Rango de fechas',
        tipo: 'rango-fechas',
        conBusqueda: false,
        opciones: [],
        activosCount: rActivo ? 1 : 0,
        rango: rActual,
        setRango: (desde: string, hasta: string) => {
          const dl = desde.trim();
          const hl = hasta.trim();
          this.rangosFechaLocales.update((prev) => ({
            ...prev,
            [col.clave]: [dl, hl],
          }));
        },
        alternar: () => undefined,
        limpiar: () => {
          this.rangosFechaLocales.update((prev) => ({
            ...prev,
            [col.clave]: ['', ''],
          }));
        },
      });
    }

    return resultado;
  }

  private aplicarOrden(clave: string, dir: 'asc' | 'desc' | undefined): void {
    const actual = this.tabla.orden();
    const nuevo =
      dir && !(actual?.clave === clave && actual.dir === dir) ? { clave, dir } : undefined;
    this.tabla.orden.set(nuevo);
  }

  private configurarListenersHost(): void {
    const host = this.hostRef.nativeElement;

    const onClickCapture = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const th = target?.closest('thead th') as HTMLElement | null;
      if (!th || !host.contains(th)) return;
      const tr = th.parentElement;
      if (!tr) return;
      const idx = Array.from(tr.children).indexOf(th);
      const col = this.tabla.columnas()[idx];
      if (!this.esColumnaFiltrable(col)) return;

      ev.preventDefault();
      ev.stopPropagation();

      if (this.columnaAbierta() === col.clave) {
        this.cerrarPopover();
      } else {
        this.thActivoEl = th;
        this.textoBusquedaPopover = '';
        this.columnaAbierta.set(col.clave);
      }
    };

    const onKeyDownCapture = (ev: KeyboardEvent) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const target = ev.target as HTMLElement | null;
      const th = target?.closest('thead th') as HTMLElement | null;
      if (!th || !host.contains(th)) return;
      const tr = th.parentElement;
      if (!tr) return;
      const idx = Array.from(tr.children).indexOf(th);
      const col = this.tabla.columnas()[idx];
      if (!this.esColumnaFiltrable(col)) return;

      ev.preventDefault();
      ev.stopPropagation();
      if (this.columnaAbierta() === col.clave) {
        this.cerrarPopover();
      } else {
        this.thActivoEl = th;
        this.textoBusquedaPopover = '';
        this.columnaAbierta.set(col.clave);
      }
    };

    const onDocMouseDown = (ev: MouseEvent) => {
      if (!this.columnaAbierta()) return;
      const target = ev.target as Node | null;
      if (!target) return;
      if (this.popoverEl?.contains(target)) return;
      if (this.thActivoEl?.contains(target)) return;
      this.cerrarPopover();
    };

    const onDocKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && this.columnaAbierta()) {
        this.cerrarPopover();
      }
    };

    const onReposition = () => {
      if (this.columnaAbierta() && this.popoverEl && this.thActivoEl) {
        this.posicionarPopover(this.popoverEl, this.thActivoEl);
      }
    };

    const onScroll = (ev: Event) => {
      if (!this.columnaAbierta() || !this.popoverEl || !this.thActivoEl) return;
      const target = ev.target as Node | null;
      if (target && this.popoverEl.contains(target)) return;
      this.posicionarPopover(this.popoverEl, this.thActivoEl);
    };

    host.addEventListener('click', onClickCapture, true);
    host.addEventListener('keydown', onKeyDownCapture, true);
    this.doc.addEventListener('mousedown', onDocMouseDown, true);
    this.doc.addEventListener('keydown', onDocKeyDown, true);
    this.doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    this.doc.defaultView?.addEventListener('resize', onReposition, { passive: true });

    this.destroyRef.onDestroy(() => {
      host.removeEventListener('click', onClickCapture, true);
      host.removeEventListener('keydown', onKeyDownCapture, true);
      this.doc.removeEventListener('mousedown', onDocMouseDown, true);
      this.doc.removeEventListener('keydown', onDocKeyDown, true);
      this.doc.removeEventListener('scroll', onScroll, true);
      this.doc.defaultView?.removeEventListener('resize', onReposition);
    });
  }

  private sincronizarCabeceras(): void {
    const host = this.hostRef.nativeElement;
    const ths = Array.from(host.querySelectorAll<HTMLElement>('thead th'));
    const cols = this.tabla.columnas();
    const orden = this.tabla.orden();
    const abierta = this.columnaAbierta();

    ths.forEach((th, idx) => {
      const col = cols[idx];
      if (col && th.getAttribute('data-col') !== col.clave) {
        th.setAttribute('data-col', col.clave);
      }
      if (!this.esColumnaFiltrable(col)) {
        th.classList.remove('pl-th-filtrable', 'pl-th-filtrable--activo', 'pl-th-filtrable--abierto');
        return;
      }
      const activos = this.contarActivosColumna(col.clave);
      const estaAbierta = abierta === col.clave;
      const ordenDir = orden?.clave === col.clave ? orden.dir : undefined;

      th.classList.add('pl-th-filtrable');
      th.classList.toggle('pl-th-filtrable--activo', activos > 0);
      th.classList.toggle('pl-th-filtrable--abierto', estaAbierta);
      if (!th.querySelector('button') && th.tabIndex !== 0) {
        th.tabIndex = 0;
      }

      let badge = th.querySelector<HTMLElement>('.pl-th-filtro-chip');
      if (!badge) {
        badge = this.doc.createElement('span');
        badge.className = 'pl-th-filtro-chip';
        badge.setAttribute('aria-hidden', 'true');
        const btnSort = th.querySelector<HTMLElement>('.ay-table__sort');
        if (btnSort) {
          btnSort.appendChild(badge);
        } else {
          th.appendChild(badge);
        }
      }

      th.setAttribute('aria-haspopup', 'dialog');
      th.setAttribute('aria-expanded', String(estaAbierta));

      const huellaBadge = `${ordenDir ?? ''}|${activos}`;
      if (badge.getAttribute('data-huella') !== huellaBadge) {
        badge.setAttribute('data-huella', huellaBadge);
        const flechaOrden = ordenDir === 'asc' ? '↑ ' : ordenDir === 'desc' ? '↓ ' : '';
        const textoCuenta = activos > 0 ? `<b class="pl-th-filtro-chip__num">${activos}</b>` : '';
        badge.innerHTML =
          `${flechaOrden}<svg class="pl-th-filtro-chip__ico" viewBox="0 0 16 16" aria-hidden="true">` +
          `<path d="M2 3.5h12L9.5 8.5v4l-3 1v-5L2 3.5z"/>` +
          `</svg>${textoCuenta}<span class="pl-th-filtro-chip__chev">▾</span>`;
      }

      th.title =
        activos > 0
          ? `Filtrar «${col.cabecera}» (${activos} activo${activos === 1 ? '' : 's'})`
          : `Clic para desplegar opciones de filtro de «${col.cabecera}»`;
    });
  }

  private sincronizarBarraLocal(): void {
    const host = this.hostRef.nativeElement;
    const locales = this.filtrosLocales();
    const rangos = this.rangosFechaLocales();
    const cols = this.tabla.columnas();
    const entradasActivas = Object.entries(locales).filter(([, vals]) => vals.length > 0);
    const rangosActivos = Object.entries(rangos).filter(
      ([, r]) => Boolean(r && (r[0].trim() || r[1].trim())),
    );

    if (entradasActivas.length === 0 && rangosActivos.length === 0) {
      this.barraLocalEl?.remove();
      this.barraLocalEl = null;
      return;
    }

    if (!this.barraLocalEl) {
      this.barraLocalEl = this.doc.createElement('div');
      this.barraLocalEl.className = 'pl-tabla-filtros-locales';
      host.prepend(this.barraLocalEl);
    }

    this.barraLocalEl.innerHTML = '';
    const etq = this.doc.createElement('span');
    etq.className = 'pl-tabla-filtros-locales__info';
    etq.textContent = `${this.tablaInterna.visibles().length} de ${this.tabla.filas().length} visibles · Filtros:`;
    this.barraLocalEl.appendChild(etq);

    for (const [clave, vals] of entradasActivas) {
      const col = cols.find((c) => c.clave === clave);
      const chip = this.doc.createElement('button');
      chip.type = 'button';
      chip.className = 'pl-tabla-filtros-locales__chip';
      chip.textContent = `${col?.cabecera ?? clave} (${vals.length}) ×`;
      chip.addEventListener('click', () => {
        this.filtrosLocales.update((prev) => ({ ...prev, [clave]: [] }));
      });
      this.barraLocalEl.appendChild(chip);
    }

    for (const [clave, r] of rangosActivos) {
      const col = cols.find((c) => c.clave === clave);
      const chip = this.doc.createElement('button');
      chip.type = 'button';
      chip.className = 'pl-tabla-filtros-locales__chip';
      chip.textContent = `${col?.cabecera ?? clave}: ${formatearRangoIso(r[0], r[1])} ×`;
      chip.addEventListener('click', () => {
        this.rangosFechaLocales.update((prev) => ({ ...prev, [clave]: ['', ''] }));
      });
      this.barraLocalEl.appendChild(chip);
    }

    const btnLimpiar = this.doc.createElement('button');
    btnLimpiar.type = 'button';
    btnLimpiar.className = 'pl-tabla-filtros-locales__limpiar';
    btnLimpiar.textContent = 'Limpiar todo';
    btnLimpiar.addEventListener('click', () => {
      this.filtrosLocales.set({});
      this.rangosFechaLocales.set({});
    });
    this.barraLocalEl.appendChild(btnLimpiar);
  }

  private ocultarPopoverDom(): void {
    this.popoverEl?.remove();
    this.popoverEl = null;
  }

  private cerrarPopover(): void {
    this.ocultarPopoverDom();
    if (this.columnaAbierta() !== null) {
      this.columnaAbierta.set(null);
    }
  }

  private renderizarPopover(): void {
    const clave = this.columnaAbierta();
    if (!clave || !this.thActivoEl) {
      this.ocultarPopoverDom();
      return;
    }
    const col = this.tabla.columnas().find((c) => c.clave === clave);
    if (!col) {
      this.ocultarPopoverDom();
      return;
    }

    if (!this.popoverEl) {
      this.popoverEl = this.doc.createElement('div');
      this.popoverEl.className = 'pl-col-filtro-popover';
      this.popoverEl.setAttribute('role', 'dialog');
      this.doc.body.appendChild(this.popoverEl);
    }

    const popover = this.popoverEl;
    popover.setAttribute('aria-label', `Opciones de filtro para ${col.cabecera}`);
    popover.innerHTML = '';

    // 1. Cabecera con título y botón cerrar
    const cab = this.doc.createElement('div');
    cab.className = 'pl-col-filtro-popover__cab';
    const titulo = this.doc.createElement('strong');
    titulo.className = 'pl-col-filtro-popover__titulo';
    titulo.textContent = col.cabecera;
    const btnCerrar = this.doc.createElement('button');
    btnCerrar.type = 'button';
    btnCerrar.className = 'pl-col-filtro-popover__cerrar';
    btnCerrar.setAttribute('aria-label', 'Cerrar menú de filtro');
    btnCerrar.textContent = '✕';
    btnCerrar.addEventListener('click', () => this.cerrarPopover());
    cab.append(titulo, btnCerrar);
    popover.appendChild(cab);

    // 2. Ordenamiento rápido A-Z / Z-A (omitido en la columna Rayo por no ser alfabética)
    const ordenActual = this.tabla.orden();
    const dirActual = ordenActual?.clave === col.clave ? ordenActual.dir : undefined;
    if (col.clave !== 'rayo') {
      const filaOrden = this.doc.createElement('div');
      filaOrden.className = 'pl-col-filtro-popover__orden';

      const btnAsc = this.doc.createElement('button');
      btnAsc.type = 'button';
      btnAsc.className =
        'pl-col-filtro-popover__orden-btn' +
        (dirActual === 'asc' ? ' pl-col-filtro-popover__orden-btn--activo' : '');
      btnAsc.textContent = '↑ Ordenar A–Z';
      btnAsc.addEventListener('click', () => this.aplicarOrden(col.clave, 'asc'));

      const btnDesc = this.doc.createElement('button');
      btnDesc.type = 'button';
      btnDesc.className =
        'pl-col-filtro-popover__orden-btn' +
        (dirActual === 'desc' ? ' pl-col-filtro-popover__orden-btn--activo' : '');
      btnDesc.textContent = '↓ Ordenar Z–A';
      btnDesc.addEventListener('click', () => this.aplicarOrden(col.clave, 'desc'));

      filaOrden.append(btnAsc, btnDesc);
      popover.appendChild(filaOrden);
    }

    // 3. Secciones de opciones de filtro
    const secciones = this.construirSeccionesColumna(col);
    const mostrarBuscador = secciones.some((s) => s.conBusqueda || s.opciones.length > 5);
    const cuerpo = this.doc.createElement('div');
    cuerpo.className = 'pl-col-filtro-popover__cuerpo';

    const pintarOpcionesCuerpo = (filtroTexto: string) => {
      const q = filtroTexto.trim().toLowerCase();
      cuerpo.innerHTML = '';

      for (const sec of secciones) {
        const secEl = this.doc.createElement('div');
        secEl.className = 'pl-col-filtro-popover__seccion';

        if (secciones.length > 1 || sec.tipo === 'rango-fechas') {
          const sub = this.doc.createElement('div');
          sub.className = 'pl-col-filtro-popover__subtitulo';
          sub.textContent = sec.titulo;
          secEl.appendChild(sub);
        }

        if (sec.tipo === 'rango-fechas') {
          const [desdeActual, hastaActual] = sec.rango ?? ['', ''];
          const boxFechas = this.doc.createElement('div');
          boxFechas.className = 'pl-col-filtro-popover__fechas';

          // Atajos rápidos (relativos al hoy base de la consola: 2026-10-22)
          const filaAtajos = this.doc.createElement('div');
          filaAtajos.className = 'pl-col-filtro-popover__atajos-fecha';
          const atajos: readonly { etq: string; d: string; h: string }[] = [
            { etq: 'Hoy', d: '2026-10-22', h: '2026-10-22' },
            { etq: 'Últ. 7 d', d: '2026-10-15', h: '2026-10-22' },
            { etq: 'Próx. 7 d', d: '2026-10-22', h: '2026-10-29' },
            { etq: 'Este mes', d: '2026-10-01', h: '2026-10-31' },
          ];
          for (const at of atajos) {
            const btnAt = this.doc.createElement('button');
            btnAt.type = 'button';
            const activoAt = desdeActual === at.d && hastaActual === at.h;
            btnAt.className =
              'pl-col-filtro-popover__atajo-btn' +
              (activoAt ? ' pl-col-filtro-popover__atajo-btn--activo' : '');
            btnAt.textContent = at.etq;
            btnAt.addEventListener('click', () => {
              if (activoAt) {
                sec.setRango?.('', '');
              } else {
                sec.setRango?.(at.d, at.h);
              }
            });
            filaAtajos.appendChild(btnAt);
          }
          boxFechas.appendChild(filaAtajos);

          // Campos Desde y Hasta
          const grillaInputs = this.doc.createElement('div');
          grillaInputs.className = 'pl-col-filtro-popover__fechas-grid';

          const lblDesde = this.doc.createElement('label');
          lblDesde.className = 'pl-col-filtro-popover__fecha-campo';
          const spanDesde = this.doc.createElement('span');
          spanDesde.textContent = 'Desde';
          const inpDesde = this.doc.createElement('input');
          inpDesde.type = 'date';
          inpDesde.className = 'pl-col-filtro-popover__fecha-input';
          inpDesde.value = desdeActual;

          const lblHasta = this.doc.createElement('label');
          lblHasta.className = 'pl-col-filtro-popover__fecha-campo';
          const spanHasta = this.doc.createElement('span');
          spanHasta.textContent = 'Hasta';
          const inpHasta = this.doc.createElement('input');
          inpHasta.type = 'date';
          inpHasta.className = 'pl-col-filtro-popover__fecha-input';
          inpHasta.value = hastaActual;

          const aplicarInputs = () => {
            sec.setRango?.(inpDesde.value, inpHasta.value);
          };
          inpDesde.addEventListener('change', aplicarInputs);
          inpHasta.addEventListener('change', aplicarInputs);

          lblDesde.append(spanDesde, inpDesde);
          lblHasta.append(spanHasta, inpHasta);
          grillaInputs.append(lblDesde, lblHasta);
          boxFechas.appendChild(grillaInputs);

          secEl.appendChild(boxFechas);
          cuerpo.appendChild(secEl);
          continue;
        }

        const opcionesFiltradas = q
          ? sec.opciones.filter((o) => o.etiqueta.toLowerCase().includes(q))
          : sec.opciones;

        if (opcionesFiltradas.length === 0) {
          const vacio = this.doc.createElement('p');
          vacio.className = 'pl-col-filtro-popover__vacio';
          vacio.textContent = 'Sin opciones coincidentes';
          secEl.appendChild(vacio);
        } else {
          const lista = this.doc.createElement('div');
          lista.className = 'pl-col-filtro-popover__lista';
          for (const op of opcionesFiltradas) {
            const item = this.doc.createElement('label');
            item.className =
              'pl-col-filtro-popover__opcion' +
              (op.activo ? ' pl-col-filtro-popover__opcion--activa' : '');

            const check = this.doc.createElement('input');
            check.type = 'checkbox';
            check.className = 'pl-col-filtro-popover__check';
            check.checked = op.activo;
            check.addEventListener('change', () => sec.alternar(op.valor));

            const txt = this.doc.createElement('span');
            txt.className = 'pl-col-filtro-popover__etiqueta';
            txt.textContent = op.etiqueta;

            const cnt = this.doc.createElement('span');
            cnt.className = 'pl-col-filtro-popover__cuenta';
            cnt.textContent = String(op.recuento);

            item.append(check, txt, cnt);
            lista.appendChild(item);
          }
          secEl.appendChild(lista);
        }

        cuerpo.appendChild(secEl);
      }
    };

    if (mostrarBuscador) {
      const wrapBusq = this.doc.createElement('div');
      wrapBusq.className = 'pl-col-filtro-popover__busq';
      const inputBusq = this.doc.createElement('input');
      inputBusq.type = 'search';
      inputBusq.className = 'pl-col-filtro-popover__input';
      inputBusq.placeholder = `Buscar en ${col.cabecera.toLowerCase()}…`;
      inputBusq.value = this.textoBusquedaPopover;
      inputBusq.addEventListener('input', () => {
        this.textoBusquedaPopover = inputBusq.value;
        pintarOpcionesCuerpo(this.textoBusquedaPopover);
      });
      wrapBusq.appendChild(inputBusq);
      popover.appendChild(wrapBusq);
    }

    pintarOpcionesCuerpo(this.textoBusquedaPopover);
    popover.appendChild(cuerpo);

    // 4. Pie con acciones de limpiar columna y cerrar
    const totalActivos = secciones.reduce((acc, s) => acc + s.activosCount, 0);
    const pie = this.doc.createElement('div');
    pie.className = 'pl-col-filtro-popover__pie';

    const btnLimpiarCol = this.doc.createElement('button');
    btnLimpiarCol.type = 'button';
    btnLimpiarCol.className = 'pl-col-filtro-popover__btn-limpiar';
    btnLimpiarCol.disabled = totalActivos === 0 && !dirActual;
    btnLimpiarCol.textContent =
      totalActivos > 0 ? `Limpiar (${totalActivos})` : 'Sin filtro activo';
    btnLimpiarCol.addEventListener('click', () => {
      secciones.forEach((s) => s.limpiar());
      if (dirActual) {
        this.aplicarOrden(col.clave, undefined);
      }
    });

    const btnListo = this.doc.createElement('button');
    btnListo.type = 'button';
    btnListo.className = 'pl-col-filtro-popover__btn-listo';
    btnListo.textContent = 'Listo';
    btnListo.addEventListener('click', () => this.cerrarPopover());

    pie.append(btnLimpiarCol, btnListo);
    popover.appendChild(pie);

    this.posicionarPopover(popover, this.thActivoEl);
  }

  private posicionarPopover(popover: HTMLElement, th: HTMLElement): void {
    const rect = th.getBoundingClientRect();
    const win = this.doc.defaultView;
    const winW = win?.innerWidth ?? 1280;
    const scrollX = win?.scrollX ?? 0;
    const scrollY = win?.scrollY ?? 0;

    const anchoMin = Math.min(Math.max(rect.width, 250), Math.min(320, winW - 16));
    popover.style.width = `${anchoMin}px`;

    let leftViewport = rect.left;
    if (leftViewport + anchoMin > winW - 8) {
      leftViewport = Math.max(8, winW - anchoMin - 8);
    }
    if (leftViewport < 8) leftViewport = 8;

    const left = leftViewport + scrollX;
    const top = rect.bottom + scrollY + 4;

    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }
}
