/**
 * Relaciones del Grafo 360 (GRA-03). Cada nodo tiene id y tipo; cada relación tiene id, tipo y
 * origen explícito. Solo se derivan de datos o reglas existentes (nodo -> fuentes de NODOS_360,
 * nodo -> proceso de la regla de redirección, nodo -> áreas de los tickets reales del cliente);
 * no se infiere ninguna otra asociación de negocio. Sin Angular ni Three: se prueba con node.
 */
export type TipoNodoGrafo = 'cliente' | 'fuente' | 'dato';
export type TipoRelacion = 'consulta' | 'alimenta';

export const ID_CLIENTE_GRAFO = 'c';

export const idRelacion = (de: string, a: string): string => `rel:${de}>${a}`;

export interface Relacion360 {
  readonly id: string;
  readonly tipo: TipoRelacion;
  readonly de: string;
  readonly a: string;
}

export interface EntradaContexto {
  readonly fuentes: readonly { id: string }[];
  readonly nodos: readonly { id: string; fuentes: readonly string[] }[];
  /** Proceso/módulo al que lleva el nodo (regla de redirección), si la hay. */
  readonly procesoDe: (nodoId: string) => string | undefined;
  /** Áreas de los tickets reales del cliente asociados al nodo (vacío si el nodo no se liga a tickets). */
  readonly areasDe: (nodoId: string) => readonly string[];
  /** Catálogo de áreas vigente: lo que no esté aquí no se muestra. */
  readonly catalogoAreas: readonly string[];
}

export interface Contexto360 {
  readonly seleccion: string;
  /** Ids de nodos (cliente, fuentes y datos) relacionados con la selección, incluida ella. */
  readonly ids: ReadonlySet<string>;
  readonly relaciones: readonly Relacion360[];
  readonly areas: readonly string[];
  readonly procesos: readonly string[];
}

export const CONTEXTO_VACIO: Contexto360 = {
  seleccion: '',
  ids: new Set(),
  relaciones: [],
  areas: [],
  procesos: [],
};

/** Todas las relaciones del grafo: cliente -> fuente y fuente -> dato. */
export function relacionesGrafo(e: Pick<EntradaContexto, 'fuentes' | 'nodos'>): Relacion360[] {
  return [
    ...e.fuentes.map((s) => ({ id: idRelacion(ID_CLIENTE_GRAFO, s.id), tipo: 'consulta' as const, de: ID_CLIENTE_GRAFO, a: s.id })),
    ...e.nodos.flatMap((n) =>
      n.fuentes.map((sid) => ({ id: idRelacion(sid, n.id), tipo: 'alimenta' as const, de: sid, a: n.id })),
    ),
  ];
}

/** Elementos relacionados con la selección (fuente o dato); selección vacía o desconocida: sin contexto. */
export function contextoDe(seleccion: string, e: EntradaContexto): Contexto360 {
  const esFuente = e.fuentes.some((s) => s.id === seleccion);
  const nodo = e.nodos.find((n) => n.id === seleccion);
  if (!esFuente && !nodo) return CONTEXTO_VACIO;

  const ids = new Set<string>([ID_CLIENTE_GRAFO, seleccion]);
  const datos = esFuente ? e.nodos.filter((n) => n.fuentes.includes(seleccion)) : nodo ? [nodo] : [];
  datos.forEach((n) => {
    ids.add(n.id);
    n.fuentes.forEach((sid) => ids.add(sid));
  });
  const relaciones = relacionesGrafo(e).filter((r) => ids.has(r.de) && ids.has(r.a));
  const unicos = (xs: readonly (string | undefined)[]): string[] => [...new Set(xs.filter((x): x is string => !!x))];
  return {
    seleccion,
    ids,
    relaciones,
    areas: unicos(datos.flatMap((n) => e.areasDe(n.id))).filter((a) => e.catalogoAreas.includes(a)),
    procesos: unicos(datos.map((n) => e.procesoDe(n.id))),
  };
}
