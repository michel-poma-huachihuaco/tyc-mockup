import { useCallback, useEffect, useRef, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { Marca } from '../../../pantallas/Marca'
import { NOMBRE_PROYECTO } from '../../../proyecto'
import { avisoDemo } from '../../utiles'

/**
 * Piezas comunes de las once maquetas de ingreso. Ninguna inicia sesión: el envío muestra el
 * siguiente estado de la maqueta o el aviso «Demo: esta pantalla no inicia sesión». La
 * validación por campo sí es de verdad (vacíos y formato), como en una pantalla real.
 */

export interface PropsVariante {
  /** Pintada en miniatura en el índice: sin `main`, sin título del documento, sin movimiento. */
  readonly miniatura?: boolean
}

/** `main` a pantalla completa; `div` en miniatura (el índice ya tiene su `main`). */
export function raizDe(miniatura: boolean | undefined): ElementType {
  return miniatura ? 'div' : 'main'
}

/** El título de la pestaña, solo a pantalla completa. */
export function useTituloVariante(nombre: string, miniatura: boolean | undefined): void {
  useEffect(() => {
    if (!miniatura) document.title = `Ingreso · ${nombre} · Galería · Aybar`
  }, [nombre, miniatura])
}

export const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

/**
 * El envío de una maqueta: un momento «enviando» (para ver el estado de carga del botón) y
 * después el siguiente estado, si lo hay, o el aviso de demo.
 */
export function useEnvioDemo(): [boolean, (despues?: () => void) => Promise<void>] {
  const [enviando, setEnviando] = useState(false)
  // Montado o no: el modo estricto desmonta y vuelve a montar, así que se marca en el efecto.
  const vivo = useRef(false)
  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])
  const enviar = useCallback(async (despues?: () => void) => {
    setEnviando(true)
    await esperar(650)
    if (!vivo.current) return
    setEnviando(false)
    if (despues) despues()
    else avisoDemo()
  }, [])
  return [enviando, enviar]
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** El error de un correo: vacío o mal formado; `undefined` si vale. */
export function errorDeCorreo(valor: string): string | undefined {
  if (!valor.trim()) return 'Escribe tu correo.'
  if (!CORREO.test(valor.trim())) return 'Escribe el correo con el formato nombre@dominio.pe.'
  return undefined
}

/** Un celular peruano: nueve cifras que empiezan por 9. */
export function errorDeCelular(valor: string): string | undefined {
  const cifras = valor.replace(/\D/g, '')
  if (!cifras) return 'Escribe tu número de celular.'
  if (!/^9\d{8}$/.test(cifras)) return 'Un celular tiene nueve cifras y empieza por 9.'
  return undefined
}

/** Los requisitos de una contraseña nueva, con su estado, y la fuerza con su palabra. */
export function requisitosDe(clave: string) {
  const requisitos = [
    { label: 'Al menos 12 caracteres', met: clave.length >= 12 },
    { label: 'Una mayúscula y una minúscula', met: /[A-ZÁÉÍÓÚÑ]/.test(clave) && /[a-záéíóúñ]/.test(clave) },
    { label: 'Al menos un número', met: /\d/.test(clave) },
    { label: 'Un símbolo, como ! o #', met: /[^\p{L}\p{N}\s]/u.test(clave) },
  ]
  const cumplidos = requisitos.filter((r) => r.met).length
  const score = (clave ? Math.min(4, cumplidos) : 0) as 0 | 1 | 2 | 3 | 4
  const nombres = ['muy débil', 'débil', 'regular', 'buena', 'fuerte'] as const
  return { requisitos, cumple: cumplidos === requisitos.length, fuerza: { score, label: `Fortaleza: ${nombres[score]}` } }
}

/** «+51 9•• ••• •45»: el número a la vista, sin enseñarlo entero. */
export function celularVelado(cifras: string): string {
  const limpio = cifras.replace(/\D/g, '')
  return `+51 ${limpio.slice(0, 1)}•• ••• •${limpio.slice(-2)}`
}

/** «m:ss» para una cuenta atrás. */
export function minutosYSegundos(segundos: number): string {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
}

/** La marca del proyecto en las maquetas: el símbolo con los tokens y el nombre. */
export function MarcaIngreso({ inversa = false }: { inversa?: boolean }) {
  return (
    <span className={inversa ? 'gl-in-marca gl-in-marca--inversa' : 'gl-in-marca'}>
      <Marca nombre={NOMBRE_PROYECTO} />
    </span>
  )
}

/** El pie de las maquetas: el aviso de que no hay sesión de verdad detrás. */
export function NotaDemo({ children }: { children?: ReactNode }) {
  return <p className="gl-in-nota">{children ?? 'Maqueta de la galería: los envíos no inician sesión ni salen del navegador.'}</p>
}
