import { DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * Medidas al día para /demo/redimensionado. Se llaman en un contexto de inyección (el
 * constructor o un inicializador de campo) y se limpian solas al destruir el componente.
 */

/** `true` mientras la media query se cumple; se actualiza al cambiar. */
export function usarMedia(consulta: string): Signal<boolean> {
  const lista = typeof matchMedia === 'function' ? matchMedia(consulta) : null;
  const cumple = signal(lista?.matches ?? false);
  if (lista) {
    const avisar = () => cumple.set(lista.matches);
    lista.addEventListener('change', avisar);
    inject(DestroyRef).onDestroy(() => lista.removeEventListener('change', avisar));
  }
  return cumple.asReadonly();
}

/**
 * El ancho de contenido de un elemento, en px, con un ResizeObserver: la caja de contenido,
 * sin el relleno, que es la que miran las container queries. 0 hasta el primer pintado.
 */
export function usarAnchoDe(elemento: () => HTMLElement | undefined): Signal<number> {
  const ancho = signal(0);
  const destruccion = inject(DestroyRef);
  afterNextRender(() => {
    const observado = elemento();
    if (!observado) return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) ancho.set(entrada.contentBoxSize[0]?.inlineSize ?? entrada.contentRect.width);
    });
    observador.observe(observado);
    destruccion.onDestroy(() => observador.disconnect());
  });
  return ancho.asReadonly();
}

/** Cuántos px mide 1rem ahora (el usuario puede haber cambiado el tamaño de letra). */
export function pxPorRem(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** «hace 5 min», «hace 3 h», «hace 2 días», desde el «hoy» fijo de los datos (datos/semilla.ts). */
export function haceCuanto(iso: string, hoy: Date): string {
  const minutos = Math.max(0, Math.round((hoy.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}
