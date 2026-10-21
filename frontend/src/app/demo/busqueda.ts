/**
 * La búsqueda global de la galería, sin Angular: un índice con las pantallas de la galería
 * y los componentes y casos del catálogo de la vitrina, y una búsqueda sin tildes ni
 * mayúsculas que suma los sinónimos de sinonimos.ts. La usa la paleta de comandos (Ctrl K);
 * la prueba `npm test` (pruebas/demo-busqueda.test.ts).
 *
 * El catálogo llega como parámetro con la forma de `CATALOGO_VITRINA` de
 * @aybarcorp/ui-angular, para que este archivo no dependa de Angular.
 */
import { SECCIONES, VARIANTES_INGRESO } from './navegacion';
import { alternativas, normalizar } from './sinonimos';

/** Lo que la búsqueda necesita del catálogo de la vitrina. */
export interface CatalogoBusqueda {
  readonly familias: readonly {
    readonly id: string;
    readonly nombre: string;
    readonly componentes: readonly {
      readonly nombre: string;
      readonly slug: string;
      readonly descripcion?: string;
      readonly grupos: readonly { readonly titulo: string; readonly casos: readonly { readonly etiqueta: string }[] }[];
    }[];
  }[];
}

export type TipoEntrada = 'pantalla' | 'componente' | 'caso';

export interface EntradaBusqueda {
  readonly id: string;
  readonly tipo: TipoEntrada;
  readonly titulo: string;
  /** Dónde está: «Vitrina · Data», «Cuenta». */
  readonly contexto: string;
  readonly ruta: string;
  /** Título normalizado, para puntuar. */
  readonly clave: string;
  /** Todo lo que se busca, normalizado. */
  readonly texto: string;
}

export interface GrupoResultados {
  readonly etiqueta: string;
  readonly entradas: readonly EntradaBusqueda[];
}

const ETIQUETA_GRUPO: Record<TipoEntrada, string> = {
  pantalla: 'Galería',
  componente: 'Componentes',
  caso: 'Casos',
};

/** Cuántos resultados de cada tipo, como mucho: la paleta es para saltar, no para leer. */
const MAXIMO_POR_TIPO: Record<TipoEntrada, number> = { pantalla: 8, componente: 10, caso: 8 };

function entrada(tipo: TipoEntrada, id: string, titulo: string, contexto: string, ruta: string, extra: string[] = []): EntradaBusqueda {
  return {
    id,
    tipo,
    titulo,
    contexto,
    ruta,
    clave: normalizar(titulo),
    texto: normalizar([titulo, contexto, ...extra].join(' ')),
  };
}

/** El índice: secciones, subsecciones y variantes de ingreso; después, el catálogo. */
export function crearIndice(catalogo?: CatalogoBusqueda): EntradaBusqueda[] {
  const indice: EntradaBusqueda[] = [];
  for (const s of SECCIONES) {
    const titulo = s.id ? s.titulo : 'Portada de la galería';
    indice.push(entrada('pantalla', `seccion:${s.id || 'portada'}`, titulo, s.resumen, s.ruta, [...s.palabras]));
    for (const sub of s.subsecciones) {
      indice.push(entrada('pantalla', `seccion:${s.id}/${sub.id}`, sub.titulo, s.titulo, `${s.ruta}/${sub.id}`, [sub.resumen]));
    }
  }
  for (const v of VARIANTES_INGRESO) {
    indice.push(entrada('pantalla', `ingreso:${v.id}`, `Ingreso ${v.titulo.toLowerCase()}`, 'Pantallas de ingreso', `/demo/ingreso/${v.id}`, [v.resumen, 'login']));
  }
  for (const familia of catalogo?.familias ?? []) {
    for (const componente of familia.componentes) {
      const rutaComponente = `/demo/vitrina/${familia.id}/${componente.slug}`;
      indice.push(
        entrada('componente', `componente:${familia.id}/${componente.slug}`, componente.nombre, `Vitrina · ${familia.nombre}`, rutaComponente, [
          componente.descripcion ?? '',
          ...componente.grupos.map((g) => g.titulo),
        ]),
      );
      let n = 0;
      for (const grupo of componente.grupos) {
        for (const caso of grupo.casos) {
          n++;
          indice.push(
            entrada('caso', `caso:${familia.id}/${componente.slug}/${n}`, `${componente.nombre} · ${caso.etiqueta}`, `${familia.nombre} · ${grupo.titulo}`, `${rutaComponente}/caso/${n}`),
          );
        }
      }
    }
  }
  return indice;
}

/** Puntos de una entrada para una alternativa ya normalizada, o 0 si no coincide. */
function puntuar(e: EntradaBusqueda, alternativa: string): number {
  const terminos = alternativa.split(' ');
  if (!terminos.every((t) => e.texto.includes(t))) return 0;
  if (e.clave === alternativa) return 100;
  if (e.clave.startsWith(alternativa)) return 70;
  if (terminos.every((t) => e.clave.includes(t))) return 45;
  return 15;
}

const PESO_TIPO: Record<TipoEntrada, number> = { pantalla: 6, componente: 4, caso: 0 };

/**
 * Lo que coincide con la consulta o con alguno de sus sinónimos, agrupado (Galería,
 * Componentes, Casos) y de lo más a lo menos parecido. La consulta tal cual pesa más que
 * sus sinónimos. Sin consulta, nada.
 */
export function buscar(indice: readonly EntradaBusqueda[], consulta: string): GrupoResultados[] {
  const opciones = alternativas(consulta);
  if (opciones.length === 0) return [];
  const puntuadas: { e: EntradaBusqueda; puntos: number; orden: number }[] = [];
  indice.forEach((e, orden) => {
    let mejor = 0;
    opciones.forEach((alternativa, i) => {
      const puntos = puntuar(e, alternativa);
      if (puntos > 0) mejor = Math.max(mejor, puntos + (i === 0 ? 10 : 0) + PESO_TIPO[e.tipo]);
    });
    if (mejor > 0) puntuadas.push({ e, puntos: mejor, orden });
  });
  puntuadas.sort((a, b) => b.puntos - a.puntos || a.orden - b.orden);
  const grupos: GrupoResultados[] = [];
  for (const tipo of ['pantalla', 'componente', 'caso'] as const) {
    const entradas = puntuadas.filter((p) => p.e.tipo === tipo).slice(0, MAXIMO_POR_TIPO[tipo]).map((p) => p.e);
    if (entradas.length > 0) grupos.push({ etiqueta: ETIQUETA_GRUPO[tipo], entradas });
  }
  return grupos;
}
