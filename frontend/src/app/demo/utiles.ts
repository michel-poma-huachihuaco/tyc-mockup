import { DestroyRef, inject, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import { AyAppearanceService, AyToastService } from '@aybarcorp/ui-angular';
import type { AtributoApariencia } from './configuracion';

/**
 * Copia texto al portapapeles y lo dice con un Toast. Sin permiso o fuera de un contexto
 * seguro (http que no es localhost) no se puede: el Toast lo dice en lugar de fallar
 * en silencio.
 */
export function usarCopiar(): (texto: string, hecho: string) => Promise<boolean> {
  const toast = inject(AyToastService);
  return async (texto, hecho) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.mostrar({ mensaje: hecho, tono: 'success' });
      return true;
    } catch {
      toast.mostrar({ mensaje: 'No se pudo copiar: el navegador no dio permiso para usar el portapapeles.', tono: 'warning' });
      return false;
    }
  };
}

/**
 * Los atributos de apariencia que `<html>` lleva ahora (`data-theme`, `data-palette`…), en
 * el orden de los ejes del núcleo, con el id de cada eje. Lo que no está puesto es el
 * valor por defecto y no se copia.
 */
export function usarAtributosDeApariencia(): () => AtributoApariencia[] {
  const apariencia = inject(AyAppearanceService);
  return () => {
    const raiz = typeof document === 'undefined' ? null : document.documentElement;
    if (!raiz) return [];
    return Object.entries(apariencia.ejes).flatMap(([eje, meta]) => {
      const valor = raiz.getAttribute(meta.attribute);
      return valor ? [{ atributo: meta.attribute, eje, valor }] : [];
    });
  };
}

/** `true` si el usuario pidió menos movimiento: lo que se anima, quieto. */
export function prefiereMenosMovimiento(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Una media query como señal, que sigue sus cambios mientras la pantalla vive. */
export function usarMedia(consulta: string): Signal<boolean> {
  const lista = typeof matchMedia === 'function' ? matchMedia(consulta) : null;
  const coincide = signal(lista?.matches ?? false);
  if (lista) {
    const alCambiar = (e: MediaQueryListEvent) => coincide.set(e.matches);
    lista.addEventListener('change', alCambiar);
    inject(DestroyRef).onDestroy(() => lista.removeEventListener('change', alCambiar));
  }
  return coincide.asReadonly();
}

/** Descarga un texto como archivo, sin servidor: un Blob y un enlace con `download`. */
export function descargarTexto(nombre: string, texto: string): void {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url));
}
