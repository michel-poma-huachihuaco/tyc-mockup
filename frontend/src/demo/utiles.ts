import { toast } from '@aybarcorp/ui'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

/**
 * Piezas pequeñas que comparten las pantallas de la galería: almacenamiento que no falla,
 * media queries reactivas, copiar al portapapeles con aviso y un temporizador de cuenta atrás.
 */

/**
 * Lee de localStorage o sessionStorage sin lanzar: en una ventana privada, con el
 * almacenamiento bloqueado o lleno, la galería sigue funcionando y solo se olvida.
 */
export function leerAlmacen(tipo: 'local' | 'sesion', clave: string): string | null {
  try {
    return (tipo === 'local' ? localStorage : sessionStorage).getItem(clave)
  } catch {
    return null
  }
}

export function guardarAlmacen(tipo: 'local' | 'sesion', clave: string, valor: string | null): void {
  try {
    const almacen = tipo === 'local' ? localStorage : sessionStorage
    if (valor === null) almacen.removeItem(clave)
    else almacen.setItem(clave, valor)
  } catch {
    // Sin almacenamiento: vale para esta carga y no más.
  }
}

/** Un estado que se recuerda en el almacén con esa clave. */
export function useRecordado<T extends string>(
  tipo: 'local' | 'sesion',
  clave: string,
  valido: (valor: unknown) => valor is T,
  inicial: T,
): [T, (valor: T) => void] {
  const [valor, setValor] = useState<T>(() => {
    const leido = leerAlmacen(tipo, clave)
    return valido(leido) ? leido : inicial
  })
  const cambiar = useCallback(
    (nuevo: T) => {
      setValor(nuevo)
      guardarAlmacen(tipo, clave, nuevo)
    },
    [tipo, clave],
  )
  return [valor, cambiar]
}

/** `true` mientras la media query se cumple; se actualiza al cambiar. */
export function useMedia(consulta: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const lista = matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    () => matchMedia(consulta).matches,
    () => false,
  )
}

/** Las media queries de la galería: lg es --aybar-breakpoint-lg (1024px), md el de 768px. */
export const ESCRITORIO = '(min-width: 1024px)'
export const TABLETA = '(min-width: 768px)'
export const MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

/**
 * Copia un texto y lo dice con un Toast: «Copiado», o por qué no se pudo (sin permiso o
 * fuera de un contexto seguro). Devuelve si se copió.
 */
export async function copiar(texto: string, que = 'Texto'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    toast({ message: `${que} copiado al portapapeles.`, tone: 'success' })
    return true
  } catch {
    toast({ message: `No se pudo copiar: selecciona el texto y cópialo a mano.`, tone: 'warning' })
    return false
  }
}

/** Descarga un texto como archivo, sin red: un Blob y un enlace temporal. */
export function descargarTexto(nombre: string, texto: string): void {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** El aviso de las maquetas: nada de la galería inicia sesión ni guarda en un servidor. */
export function avisoDemo(mensaje = 'Demo: esta pantalla no inicia sesión.'): void {
  toast({ message: mensaje, tone: 'info' })
}

/**
 * Cuenta atrás en segundos: `[restantes, empezar]`. Se detiene en 0 y no corre en
 * segundo plano si el componente se desmonta.
 */
export function useCuentaAtras(segundos: number): [number, () => void] {
  const [restantes, setRestantes] = useState(0)
  useEffect(() => {
    if (restantes <= 0) return
    const t = window.setTimeout(() => setRestantes((r) => r - 1), 1000)
    return () => window.clearTimeout(t)
  }, [restantes])
  return [restantes, useCallback(() => setRestantes(segundos), [segundos])]
}

/** «hace 5 min», «hace 3 h», «hace 2 días», desde el «hoy» fijo de los datos (semilla.ts). */
export function haceCuanto(iso: string, hoy: Date): string {
  const minutos = Math.max(0, Math.round((hoy.getTime() - new Date(iso).getTime()) / 60_000))
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
}

/** Fecha corta en es-PE: «1 oct. 2026». */
export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}
