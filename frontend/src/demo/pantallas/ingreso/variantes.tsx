import type { ComponentType } from 'react'
import type { VarianteIngreso } from '../../rutas'
import { Animado, Minimal, Partido, Vidrio } from './clasicas'
import type { PropsVariante } from './comun'
import { Bloqueo, DosPasos, Recuperar, Registro } from './flujos'
import { Celular, EnlaceMagico, Sso } from './sinClave'

/** Cada variante de /demo/ingreso/:variante con su componente (el orden es el de rutas.ts). */
export const PANTALLAS_INGRESO: Record<VarianteIngreso, ComponentType<PropsVariante>> = {
  partido: Partido,
  minimal: Minimal,
  animado: Animado,
  vidrio: Vidrio,
  celular: Celular,
  'enlace-magico': EnlaceMagico,
  sso: Sso,
  'dos-pasos': DosPasos,
  registro: Registro,
  recuperar: Recuperar,
  bloqueo: Bloqueo,
}
