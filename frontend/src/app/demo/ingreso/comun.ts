import { Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { AyToastService } from '@aybarcorp/ui-angular';

let siguienteId = 0;

/** Un id único en la página: el índice pinta varias maquetas a la vez. */
export function idUnico(prefijo: string): string {
  return `${prefijo}-${++siguienteId}`;
}

/**
 * El envío de una maqueta: «enviando» un momento —el botón muestra su carga y los campos
 * quedan de solo lectura— y después el siguiente estado de la maqueta o, si no lo hay, el
 * Toast que dice que la pantalla no inicia sesión. Nada sale del navegador.
 */
export function usarEnvioDemo(espera = 900) {
  const toast = inject(AyToastService);
  const enviando = signal(false);
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(temporizador));
  return {
    enviando: enviando.asReadonly(),
    enviar(despues?: () => void): void {
      if (enviando()) return;
      enviando.set(true);
      temporizador = setTimeout(() => {
        enviando.set(false);
        if (despues) despues();
        else avisar(toast);
      }, espera);
    },
    avisar(mensaje?: string): void {
      avisar(toast, mensaje);
    },
  };
}

function avisar(toast: AyToastService, mensaje = 'Demo: esta pantalla no inicia sesión.'): void {
  toast.mostrar({ mensaje, tono: 'info' });
}

/**
 * Los campos de texto de un formulario de maqueta: sus valores, sus errores y la
 * validación al enviar. Escribir en un campo retira su error: ya no describe lo que hay.
 */
export function usarCampos<K extends string>(claves: readonly K[]) {
  const valores = signal(Object.fromEntries(claves.map((k) => [k, ''])) as Record<K, string>);
  const errores = signal<Partial<Record<K, string>>>({});
  return {
    valores: valores.asReadonly(),
    errores: errores.asReadonly(),
    escribir(clave: K, valor: string): void {
      valores.update((v) => ({ ...v, [clave]: valor }));
      if (errores()[clave]) errores.update((e) => ({ ...e, [clave]: undefined }));
    },
    /** Aplica las reglas; `true` si no hay ningún error. */
    validar(reglas: Partial<Record<K, (valor: string, todos: Record<K, string>) => string | undefined>>): boolean {
      const todos = valores();
      const encontrados: Partial<Record<K, string>> = {};
      for (const clave of Object.keys(reglas) as K[]) {
        const error = reglas[clave]?.(todos[clave], todos);
        if (error) encontrados[clave] = error;
      }
      errores.set(encontrados);
      return Object.keys(encontrados).length === 0;
    },
    limpiar(): void {
      valores.set(Object.fromEntries(claves.map((k) => [k, ''])) as Record<K, string>);
      errores.set({});
    },
  };
}

/** Una cuenta atrás en segundos, que se detiene en 0 y al destruirse la pantalla. */
export function usarCuentaAtras() {
  const restante = signal(0);
  let intervalo: ReturnType<typeof setInterval> | undefined;
  const detener = () => clearInterval(intervalo);
  inject(DestroyRef).onDestroy(detener);
  return {
    restante: restante.asReadonly(),
    iniciar(segundos: number): void {
      detener();
      restante.set(segundos);
      intervalo = setInterval(() => {
        restante.update((s) => Math.max(0, s - 1));
        if (restante() === 0) detener();
      }, 1000);
    },
    detener,
  };
}

/**
 * Lleva el foco a lo que coincida con `selector` dentro de la pantalla, después del
 * siguiente render. Al cambiar de paso, el botón que se pulsó desaparece: sin esto, el foco
 * caería en `body`.
 */
export function usarEnfocar() {
  const anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  return (selector: string) => {
    setTimeout(() => anfitrion.querySelector<HTMLElement>(selector)?.focus());
  };
}

/** Tras un envío con errores, el foco al primer campo inválido: lo que hay que corregir. */
export function usarFocoEnError() {
  const enfocar = usarEnfocar();
  return () => enfocar('[aria-invalid="true"]');
}

/** La marca de las pantallas de ingreso: el símbolo y «Aybar», con el texto del producto. */
@Component({
  selector: 'gl-marca-acceso',
  host: { class: 'gl-marca-acceso', '[class.gl-marca-acceso--inversa]': 'inversa()' },
  template: `
    <svg class="gl-marca-acceso__simbolo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path class="gl-marca-acceso__letra" d="M9 24 16 8l7 16h-3.6l-1.4-3.4h-4L12.6 24Zm6-6.4h2.1L16 14.9Z" />
    </svg>
    <span class="gl-marca-acceso__nombre">Aybar</span>
    @if (producto()) {
      <span class="gl-marca-acceso__producto">{{ producto() }}</span>
    }
  `,
})
export class MarcaAcceso {
  readonly inversa = input(false);
  readonly producto = input('');
}

/**
 * Curvas de nivel para la textura topográfica: anillos irregulares concéntricos, siempre
 * los mismos (sin azar), como path de SVG en una caja de 800 × 800.
 */
export function curvasDeNivel(anillos = 14, centroX = 560, centroY = 300): string[] {
  const curvas: string[] = [];
  for (let a = 1; a <= anillos; a++) {
    const radio = 26 * a + 10;
    const puntos: string[] = [];
    const pasos = 72;
    for (let i = 0; i <= pasos; i++) {
      const t = (i / pasos) * Math.PI * 2;
      const ondula = 1 + 0.09 * Math.sin(3 * t + a * 0.7) + 0.05 * Math.cos(5 * t - a * 0.4) + 0.03 * Math.sin(9 * t + a);
      const x = centroX + Math.cos(t) * radio * ondula * 1.18;
      const y = centroY + Math.sin(t) * radio * ondula;
      puntos.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    curvas.push(`${puntos.join(' ')}Z`);
  }
  return curvas;
}
