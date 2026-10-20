import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export type RGB = readonly [number, number, number] | readonly number[];

export const css = (c: RGB, a = 1): string =>
  a === 1 ? `rgb(${c[0]} ${c[1]} ${c[2]})` : `rgb(${c[0]} ${c[1]} ${c[2]} / ${a})`;

export const color = (c: RGB): THREE.Color =>
  new THREE.Color().setRGB((c[0] ?? 0) / 255, (c[1] ?? 0) / 255, (c[2] ?? 0) / 255, THREE.SRGBColorSpace);

/** Mezcla con negro (f < 0) o blanco (f > 0), igual que el sombreado de las caras del 2D original. */
export const sombra = (c: RGB, f: number): RGB =>
  c.map((v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))));

/** Capa de etiquetas DOM sobre el canvas (texto real, nítido y traducible). */
export function capaEtiquetas(host: HTMLElement): CSS2DRenderer {
  if (getComputedStyle(host).position === 'static') {
    host.style.position = 'relative';
  }
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;font-family:Montserrat,system-ui,sans-serif';
  host.append(el);
  return new CSS2DRenderer({ element: el });
}

/** Corre `frame` en cada cuadro, o cada 400 ms si el usuario pidió menos movimiento. Devuelve la limpieza. */
export function bucle(reducido: boolean, frame0: (ahora: number) => void): () => void {
  let raf = 0;
  let avisado = false;
  const frame = (t: number): void => {
    try {
      frame0(t);
    } catch (e) {
      if (!avisado) {
        avisado = true;
        console.error('[escena three.js]', e);
      }
    }
  };
  const paso = (t: number): void => {
    frame(t);
    if (!document.hidden) {
      raf = requestAnimationFrame(paso);
    }
  };
  const visible = (): void => {
    if (!document.hidden && !reducido) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paso);
    }
  };
  frame(performance.now());
  const iv = reducido ? window.setInterval(() => frame(performance.now()), 400) : 0;
  if (!reducido) {
    raf = requestAnimationFrame(paso);
  }
  document.addEventListener('visibilitychange', visible);
  return () => {
    cancelAnimationFrame(raf);
    clearInterval(iv);
    document.removeEventListener('visibilitychange', visible);
  };
}

/** Convierte un token CSS `--aybar-color-*` (hex o rgb) en una tupla RGB `[r, g, b]`. */
export function leerTokenRgb(tokenSinPrefijo: string, respaldo: RGB = [128, 128, 128]): RGB {
  if (typeof document === 'undefined') return respaldo;
  const nombre = tokenSinPrefijo.startsWith('--') ? tokenSinPrefijo : `--aybar-color-${tokenSinPrefijo}`;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  if (!raw) return respaldo;
  if (raw.startsWith('#')) {
    const hex = raw.slice(1);
    if (hex.length === 3) {
      return [
        Number.parseInt(hex[0]! + hex[0]!, 16),
        Number.parseInt(hex[1]! + hex[1]!, 16),
        Number.parseInt(hex[2]! + hex[2]!, 16),
      ];
    }
    if (hex.length >= 6) {
      return [
        Number.parseInt(hex.slice(0, 2), 16),
        Number.parseInt(hex.slice(2, 4), 16),
        Number.parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  const m = raw.match(/(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/);
  if (m) {
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  }
  return respaldo;
}
