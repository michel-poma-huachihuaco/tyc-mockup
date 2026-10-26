import { Injectable, computed, type Signal, signal, type WritableSignal } from '@angular/core';
import type { AyFilterOpcion, AyFilterValor, AySegmentoOpcion } from '@aybarcorp/ui-angular';

/**
 * Estándar de filtros de tabla (ver ESTANDAR-FILTROS-TABLAS.md).
 * Cada tabla declara sus filtros y recibe, ya calculados, las filas filtradas, las opciones con su
 * recuento facetado, el estado «hay filtros» y la acción de limpiar. La barra (`app-barra-filtros`) y el
 * estado vacío (`app-vacio-filtros`) los pintan igual en todas las pantallas.
 *
 * Semántica: AND entre filtros distintos y con la búsqueda; OR dentro de un filtro `multi`.
 */

/** multi: varias opciones · single: una · boolean: «solo …» · segmento: una vista rápida de 2 a 5 opciones · rango-fechas: intervalo [desde, hasta]. */
export type TipoFiltroTabla = 'multi' | 'single' | 'boolean' | 'segmento' | 'rango-fechas';

export interface OpcionBaseFiltro {
  readonly valor: string;
  readonly etiqueta: string;
}

export interface DefFiltroTabla<T> {
  readonly id: string;
  readonly etiqueta: string;
  readonly tipo: TipoFiltroTabla;
  /** Valor de la fila para este filtro; en `boolean`, true si la fila cumple la condición; en `rango-fechas`, `Date` o texto de fecha. */
  readonly valorDe: (fila: T) => string | boolean | Date;
  /** Catálogo fijo de opciones; si falta se derivan de las filas. */
  readonly opciones?: readonly OpcionBaseFiltro[];
  readonly etiquetaDe?: (valor: string) => string;
  readonly conBusqueda?: boolean;
  /** Rótulo de «sin filtro» en un segmento. */
  readonly etiquetaTodas?: string;
}

export interface ConfigFiltrosTabla<T> {
  /** Identifica la tabla: con ella se conserva el estado al cambiar de vista. */
  readonly clave: string;
  /** Plural del elemento: «tickets». */
  readonly etiquetaElemento: string;
  /** Si falta, la tabla no tiene buscador. */
  readonly textoDe?: (fila: T) => string;
  readonly etiquetaBusqueda?: string;
  readonly placeholderBusqueda?: string;
  readonly filtros: readonly DefFiltroTabla<T>[];
}

interface EstadoFiltros {
  readonly busqueda: string;
  readonly valores: Readonly<Record<string, readonly string[]>>;
}

const SIN_FILTROS: EstadoFiltros = { busqueda: '', valores: {} };
export const TODAS = '__todas__';
const MAX_EN_LINEA = 6;
const EN_LINEA_CON_MAS = 4;

export function parsearFechaValor(v: unknown): number | null {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (isoMatch) {
    return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T12:00:00`).getTime();
  }
  const latamMatch = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  if (latamMatch) {
    return new Date(`${latamMatch[3]}-${latamMatch[2]}-${latamMatch[1]}T12:00:00`).getTime();
  }
  const parsed = Date.parse(s);
  return Number.isNaN(parsed) ? null : parsed;
}

export function coincideRangoFecha(v: unknown, desdeIso: string, hastaIso: string): boolean {
  const desde = desdeIso.trim();
  const hasta = hastaIso.trim();
  if (!desde && !hasta) return true;
  const ms = parsearFechaValor(v);
  if (ms === null) return false;
  if (desde) {
    const minMs = new Date(`${desde}T00:00:00`).getTime();
    if (!Number.isNaN(minMs) && ms < minMs) return false;
  }
  if (hasta) {
    const maxMs = new Date(`${hasta}T23:59:59.999`).getTime();
    if (!Number.isNaN(maxMs) && ms > maxMs) return false;
  }
  return true;
}

export function formatearRangoIso(desdeIso: string, hastaIso: string): string {
  const fmt = (iso: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
  };
  const d = desdeIso.trim();
  const h = hastaIso.trim();
  if (d && h) return d === h ? fmt(d) : `${fmt(d)} → ${fmt(h)}`;
  if (d) return `Desde ${fmt(d)}`;
  if (h) return `Hasta ${fmt(h)}`;
  return '';
}

/** Guarda el estado de cada tabla durante la sesión, para que sobreviva a cambiar de vista. */
@Injectable({ providedIn: 'root' })
export class EstadoFiltrosTablas {
  private readonly mapa = new Map<string, WritableSignal<EstadoFiltros>>();

  de(clave: string): WritableSignal<EstadoFiltros> {
    let s = this.mapa.get(clave);
    if (!s) {
      s = signal<EstadoFiltros>(SIN_FILTROS);
      this.mapa.set(clave, s);
    }
    return s;
  }
}

export class FiltrosTabla<T> {
  private readonly estado: WritableSignal<EstadoFiltros>;
  private readonly opcionesPorId = new Map<string, Signal<AyFilterOpcion[]>>();
  private readonly segmentosPorId = new Map<string, Signal<AySegmentoOpcion[]>>();

  readonly filtradas: Signal<readonly T[]>;
  readonly total: Signal<number>;
  readonly busqueda: Signal<string>;
  readonly hayActivos: Signal<boolean>;
  /** Cambia con cualquier filtro o búsqueda: sirve para volver a la página 1. */
  readonly huella: Signal<string>;
  readonly enLinea: readonly DefFiltroTabla<T>[];
  readonly enMas: readonly DefFiltroTabla<T>[];

  constructor(
    private readonly filas: Signal<readonly T[]>,
    readonly cfg: ConfigFiltrosTabla<T>,
    estado: WritableSignal<EstadoFiltros>,
  ) {
    this.estado = estado;
    this.busqueda = computed(() => this.estado().busqueda);
    this.total = computed(() => this.filas().length);
    this.filtradas = computed(() => this.filas().filter((f) => this.coincide(f)));
    this.hayActivos = computed(() => {
      const e = this.estado();
      return (
        e.busqueda.trim().length > 0 ||
        Object.values(e.valores).some((v) => v.some((x) => x.trim().length > 0))
      );
    });
    this.huella = computed(() => JSON.stringify(this.estado()));
    const muchos = cfg.filtros.length > MAX_EN_LINEA;
    this.enLinea = muchos ? cfg.filtros.slice(0, EN_LINEA_CON_MAS) : cfg.filtros;
    this.enMas = muchos ? cfg.filtros.slice(EN_LINEA_CON_MAS) : [];
  }

  private coincide(f: T, omitir?: string): boolean {
    const e = this.estado();
    const q = e.busqueda.trim().toLowerCase();
    if (q && this.cfg.textoDe && !this.cfg.textoDe(f).toLowerCase().includes(q)) return false;
    for (const d of this.cfg.filtros) {
      if (d.id === omitir) continue;
      const vs = e.valores[d.id];
      if (!vs?.some((x) => x.trim().length > 0)) continue;
      const v = d.valorDe(f);
      if (d.tipo === 'rango-fechas') {
        if (!coincideRangoFecha(v, vs[0] ?? '', vs[1] ?? '')) return false;
        continue;
      }
      if (d.tipo === 'boolean' ? v !== true : !vs.includes(String(v))) return false;
    }
    return true;
  }

  private def(id: string): DefFiltroTabla<T> {
    const d = this.cfg.filtros.find((x) => x.id === id);
    if (!d) throw new Error(`Filtro desconocido: ${id}`);
    return d;
  }

  private base(d: DefFiltroTabla<T>): readonly OpcionBaseFiltro[] {
    if (d.opciones) return d.opciones;
    const vistos: string[] = [];
    for (const f of this.filas()) {
      const v = String(d.valorDe(f));
      if (!vistos.includes(v)) vistos.push(v);
    }
    return vistos.map((v) => ({ valor: v, etiqueta: d.etiquetaDe?.(v) ?? v }));
  }

  /** Opciones con su recuento facetado: filas que quedarían con esa opción dadas las demás condiciones. */
  opciones(id: string): Signal<AyFilterOpcion[]> {
    let s = this.opcionesPorId.get(id);
    if (!s) {
      const d = this.def(id);
      s = computed(() =>
        this.base(d).map((o) => ({
          valor: o.valor,
          etiqueta: o.etiqueta,
          recuento: this.filas().filter((f) => this.coincide(f, id) && String(d.valorDe(f)) === o.valor).length,
        })),
      );
      this.opcionesPorId.set(id, s);
    }
    return s;
  }

  segmentos(id: string): Signal<AySegmentoOpcion[]> {
    let s = this.segmentosPorId.get(id);
    if (!s) {
      const d = this.def(id);
      s = computed(() => [
        {
          valor: TODAS,
          etiqueta: d.etiquetaTodas ?? 'Todas',
          recuento: this.filas().filter((f) => this.coincide(f, id)).length,
        },
        ...this.opciones(id)().map((o) => ({ valor: o.valor, etiqueta: o.etiqueta, recuento: o.recuento })),
      ]);
      this.segmentosPorId.set(id, s);
    }
    return s;
  }

  valores(id: string): readonly string[] {
    return this.estado().valores[id] ?? [];
  }

  /** Valor para un `ay-filter-control`. */
  valor(id: string): AyFilterValor | undefined {
    const vs = this.valores(id);
    if (!vs.length) return undefined;
    return this.def(id).tipo === 'multi' ? [...vs] : vs[0];
  }

  valorSegmento(id: string): string {
    return this.valores(id)[0] ?? TODAS;
  }

  activo(id: string): boolean {
    return this.valores(id).some((x) => x.trim().length > 0);
  }

  /** Cuántos filtros de «Más filtros» tienen valor. */
  get masActivos(): number {
    return this.enMas.filter((d) => this.activo(d.id)).length;
  }

  setBusqueda(q: string): void {
    this.estado.update((e) => ({ ...e, busqueda: q }));
  }

  setValor(id: string, v: AyFilterValor | string | boolean | undefined): void {
    let lista: string[] = [];
    if (Array.isArray(v)) lista = v.map(String);
    else if (typeof v === 'string' && v !== '' && v !== TODAS) lista = [v];
    else if (v === true) lista = ['1'];
    this.estado.update((e) => ({ ...e, valores: { ...e.valores, [id]: lista } }));
  }

  limpiar(): void {
    this.estado.set(SIN_FILTROS);
  }
}

/** Contexto de inyección: úsalo en un inicializador de campo del componente. */
export function crearFiltrosTabla<T>(
  filas: Signal<readonly T[]>,
  cfg: ConfigFiltrosTabla<T>,
  almacen: EstadoFiltrosTablas,
): FiltrosTabla<T> {
  return new FiltrosTabla<T>(filas, cfg, almacen.de(cfg.clave));
}
