import { leerTokenRgb, type RGB } from './comun';

/**
 * Colores «sobre fondo oscuro» del grafo 360 (3D y 2D). Los canvas del grafo son siempre oscuros,
 * también en tema claro (decisión de diseño). Se derivan de tokens `--aybar-color-*`; el respaldo
 * es el hex real de `@aybarcorp/tokens` (tema por defecto).
 */
const hex = (h: string): RGB => [
  Number.parseInt(h.slice(1, 3), 16),
  Number.parseInt(h.slice(3, 5), 16),
  Number.parseInt(h.slice(5, 7), 16),
];
const tk = (token: string, respaldo: string): RGB => leerTokenRgb(token, hex(respaldo));

export interface PaletaGrafo {
  fondo: RGB;
  base: RGB;
  acento: RGB;
  /** Estados: variante clara (*-300) de los semánticos, legible sobre `fondo`. */
  ok: RGB;
  warn: RGB;
  bad: RGB;
  texto: RGB;
  mudo: RGB;
  borde: RGB;
  /** Nodo sin cliente: ≥ 3:1 sobre `fondo`. */
  apagado: RGB;
  centroTexto: RGB;
  cyan: RGB;
  esmeralda: RGB;
  violeta: RGB;
  fuentes: Readonly<Record<string, RGB>>;
  nodos: readonly RGB[];
}

export function crearPaleta(): PaletaGrafo {
  const fondo = tk('primary-900', '#00222a');
  const acento = tk('secondary-400', '#ffa726');
  // Categóricos (sin token equivalente): matices que no se confunden con los estados rojo/ámbar/verde.
  const cyan = tk('info-300', '#a0cfdb');
  const esmeralda: RGB = [38, 222, 160];
  const violeta: RGB = [179, 136, 255];
  const rosa: RGB = [244, 114, 182];
  const indigo: RGB = [129, 140, 248];
  return {
    fondo,
    base: tk('primary-700', '#02424e'),
    acento,
    ok: tk('success-300', '#89da9b'),
    warn: tk('warning-300', '#eabd59'),
    bad: tk('danger-300', '#ffa092'),
    texto: tk('neutral-0', '#ffffff'),
    mudo: tk('primary-300', '#a0cfdb'),
    borde: tk('primary-500', '#468696'),
    apagado: tk('primary-500', '#468696'),
    centroTexto: fondo,
    cyan,
    esmeralda,
    violeta,
    fuentes: {
      sigda: cyan,
      contr: esmeralda,
      cob: tk('secondary-300', '#ffc172'),
      jose: acento,
      repo: [86, 214, 180],
      mail: violeta,
      cti: rosa,
      atc: indigo,
    },
    nodos: [esmeralda, cyan, tk('secondary-200', '#ffd5a3'), violeta, [86, 214, 180], rosa],
  };
}
