import type { AxeResults, ElementContext, RunOptions } from 'axe-core';

/**
 * Análisis de accesibilidad con axe-core, cargado con `import()` solo cuando se pide: no
 * pesa en ninguna otra pantalla y nunca llega a producción (la galería entera es de
 * desarrollo: galeria.ts no declara /demo). Lo usan la pantalla /demo/accesibilidad y, para
 * Playwright, `window.__aybarGaleria.axe()`, que la raíz de la galería (raiz.ts) publica en
 * cuanto se monta:
 *
 * ```ts
 * const { violaciones } = await page.evaluate(() => window.__aybarGaleria!.axe())
 * expect(violaciones.filter((v) => v.impacto === 'critical' || v.impacto === 'serious')).toEqual([])
 * ```
 *
 * El resultado es JSON plano (se puede devolver desde `page.evaluate`). La plantilla React
 * tiene el mismo módulo con el mismo resultado.
 */

export type Impacto = 'critical' | 'serious' | 'moderate' | 'minor';

export interface NodoAxe {
  /** El selector del elemento; dentro de un shadow DOM, los tramos separados por «›». */
  readonly selector: string;
  readonly html: string;
  /** Qué arreglar, en el inglés de axe. */
  readonly resumen: string;
}

export interface ViolacionAxe {
  /** La regla de axe: `color-contrast`. */
  readonly id: string;
  readonly impacto: Impacto;
  /** El título corto de la regla. */
  readonly ayuda: string;
  readonly descripcion: string;
  /** La página de la regla en Deque University. */
  readonly enlace: string;
  /** Los criterios de WCAG que toca: «1.4.3». */
  readonly criterios: readonly string[];
  readonly nodos: readonly NodoAxe[];
}

export interface ResultadoAxe {
  /** Lo analizado: ruta y consulta del documento. */
  readonly ruta: string;
  /** ISO. */
  readonly fecha: string;
  readonly version: string;
  /** De la más grave a la más leve. */
  readonly violaciones: readonly ViolacionAxe[];
  readonly reglasQuePasan: number;
  /** Reglas que axe no pudo decidir solo: hay que mirarlas a mano. */
  readonly incompletas: number;
}

/** Lo que admite `analizar` y `window.__aybarGaleria.axe()`: las opciones de `axe.run`. */
export type OpcionesAxe = RunOptions;

export const ORDEN_IMPACTO: readonly Impacto[] = ['critical', 'serious', 'moderate', 'minor'];

/** El nombre de cada impacto, en singular y en plural: «Crítica», «Críticas». */
export const NOMBRE_IMPACTO: Record<Impacto, { readonly uno: string; readonly varios: string }> = {
  critical: { uno: 'Crítica', varios: 'Críticas' },
  serious: { uno: 'Seria', varios: 'Serias' },
  moderate: { uno: 'Moderada', varios: 'Moderadas' },
  minor: { uno: 'Menor', varios: 'Menores' },
};

/** Lo que se analiza por omisión: WCAG 2.0, 2.1 y 2.2, niveles A y AA. */
export const ETIQUETAS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

const OPCIONES_POR_OMISION: RunOptions = {
  runOnly: { type: 'tag', values: [...ETIQUETAS_WCAG] },
  resultTypes: ['violations'],
  // Un iframe de la galería (el de redimensionado, el de esta pantalla) se analiza aparte.
  iframes: false,
};

const esImpacto = (valor: unknown): valor is Impacto => ORDEN_IMPACTO.includes(valor as Impacto);

/** «wcag143» → «1.4.3»; las demás etiquetas (niveles, best-practice) no son criterios. */
export function criteriosWcag(etiquetas: readonly string[]): string[] {
  return etiquetas.flatMap((etiqueta) => {
    const partes = /^wcag(\d)(\d)(\d{1,2})$/.exec(etiqueta);
    return partes ? [`${partes[1]}.${partes[2]}.${partes[3]}`] : [];
  });
}

/** El resultado de axe, aplanado a JSON y ordenado de la violación más grave a la más leve. */
export function normalizar(resultado: AxeResults, ruta: string): ResultadoAxe {
  const violaciones = resultado.violations
    .map<ViolacionAxe>((v) => ({
      id: v.id,
      impacto: esImpacto(v.impact) ? v.impact : 'minor',
      ayuda: v.help,
      descripcion: v.description,
      enlace: v.helpUrl,
      criterios: criteriosWcag(v.tags),
      nodos: v.nodes.map((n) => ({
        selector: n.target.map((tramo) => (Array.isArray(tramo) ? tramo.join(' ') : String(tramo))).join(' › '),
        html: n.html,
        resumen: n.failureSummary ?? '',
      })),
    }))
    .sort((a, b) => ORDEN_IMPACTO.indexOf(a.impacto) - ORDEN_IMPACTO.indexOf(b.impacto) || a.id.localeCompare(b.id));
  return {
    ruta,
    fecha: resultado.timestamp,
    version: resultado.testEngine.version,
    violaciones,
    reglasQuePasan: resultado.passes.length,
    incompletas: resultado.incomplete.length,
  };
}

/** Cuántas violaciones hay de cada impacto. */
export function contarPorImpacto(violaciones: readonly ViolacionAxe[]): Record<Impacto, number> {
  const cuentas: Record<Impacto, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of violaciones) cuentas[v.impacto]++;
  return cuentas;
}

// axe no admite dos análisis a la vez en el mismo documento: se encolan.
let cola: Promise<unknown> = Promise.resolve();

/**
 * Analiza el documento (o un elemento) con WCAG 2.2 A y AA y devuelve las violaciones, de la
 * más a la menos grave. `opciones` se suma a las de omisión (y las sustituye donde coinciden).
 */
export function analizar(contexto: Document | Element = document, opciones: OpcionesAxe = {}): Promise<ResultadoAxe> {
  const tarea = cola.then(async () => {
    const { default: axe } = await import('axe-core');
    const resultado = await axe.run(contexto as ElementContext, { ...OPCIONES_POR_OMISION, ...opciones });
    const doc = contexto instanceof Document ? contexto : contexto.ownerDocument;
    return normalizar(resultado, `${doc.location.pathname}${doc.location.search}`);
  });
  cola = tarea.catch(() => undefined);
  return tarea;
}

/** Herramientas de la galería en `window` (las publica raiz.ts): solo con `ng serve`. */
export interface HerramientasGaleria {
  axe: (opciones?: OpcionesAxe) => Promise<ResultadoAxe>;
}

const esperar = (ms: number) => new Promise<void>((listo) => setTimeout(listo, ms));

/**
 * Carga `ruta` en el iframe (del mismo origen) y la analiza con el axe de su propia galería
 * —`__aybarGaleria.axe()` de su ventana—, cuando terminó de pintar: el documento cargado, la
 * galería montada, nada con `aria-busy` y el DOM quieto tres vueltas seguidas. El resultado
 * se clona a esta ventana: el iframe puede cambiar de página después.
 */
export async function analizarEnMarco(marco: HTMLIFrameElement, ruta: string, opciones?: OpcionesAxe, limiteMs = 20_000): Promise<ResultadoAxe> {
  const limite = Date.now() + limiteMs;
  const tarde = () => new Error(`${ruta} no terminó de cargar en ${Math.round(limiteMs / 1000)} s.`);
  await new Promise<void>((listo, fallo) => {
    const reloj = setTimeout(() => fallo(tarde()), limiteMs);
    marco.addEventListener(
      'load',
      () => {
        clearTimeout(reloj);
        listo();
      },
      { once: true },
    );
    marco.src = ruta;
  });
  let ventana: Window | null = null;
  try {
    ventana = marco.contentWindow;
    void ventana?.document;
  } catch {
    throw new Error(`${ruta} no es de este mismo sitio: no se puede analizar desde aquí.`);
  }
  let anterior = -1;
  let quieto = 0;
  for (;;) {
    if (Date.now() > limite) throw tarde();
    const doc = ventana?.document;
    const herramientas = ventana?.__aybarGaleria;
    const tamano = doc?.body?.innerHTML.length ?? -1;
    const listo = Boolean(herramientas) && doc?.readyState === 'complete' && !doc.querySelector('[aria-busy="true"]');
    quieto = listo && tamano === anterior ? quieto + 1 : 0;
    anterior = tamano;
    if (herramientas && quieto >= 3) return structuredClone(await herramientas.axe(opciones));
    await esperar(150);
  }
}
