import { crearAzar, elegir, entero, haceMinutos, ponderado, sinTildes } from './semilla'

/**
 * Personas sintéticas para la administración de la galería. Los nombres salen de listas
 * de nombres y apellidos comunes combinados al azar con semilla: no corresponden a nadie.
 * Los correos usan el dominio reservado `ejemplo.test` (RFC 2606/6761), que no resuelve,
 * y los teléfonos el bloque 900 000 0xx, que no se asigna a abonados.
 */

export type EstadoPersona = 'activo' | 'invitado' | 'suspendido'

export type Area = 'Ventas' | 'Legal' | 'Finanzas' | 'Operaciones' | 'Tecnología' | 'Atención al cliente'

export interface Persona {
  id: string
  nombre: string
  correo: string
  telefono: string
  area: Area
  /** Ids de `ROLES` (roles.ts). Todas tienen USER. */
  roles: string[]
  estado: EstadoPersona
  /** ISO; `null` si nunca entró (las invitadas). */
  ultimoAcceso: string | null
  creada: string
  /** Doble factor activado. */
  dobleFactor: boolean
}

const NOMBRES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fabián', 'Gabriela', 'Héctor', 'Inés', 'Javier',
  'Karina', 'Luis', 'María', 'Nicolás', 'Olga', 'Pablo', 'Rocío', 'Sergio', 'Teresa', 'Ulises',
  'Valeria', 'Walter', 'Ximena', 'Yolanda', 'Zoe', 'Andrés', 'Beatriz', 'César', 'Daniela', 'Emilio',
] as const

const APELLIDOS = [
  'Quispe', 'Rojas', 'Flores', 'Torres', 'Vargas', 'Castillo', 'Mendoza', 'Ramos', 'Chávez', 'Herrera',
  'Salazar', 'Paredes', 'Gutiérrez', 'Delgado', 'Cáceres', 'Navarro', 'Ríos', 'Medina', 'Aguilar', 'Campos',
] as const

const AREAS: readonly Area[] = ['Ventas', 'Legal', 'Finanzas', 'Operaciones', 'Tecnología', 'Atención al cliente']

/** El rol que cada área suma a USER (roles.ts). */
const ROL_DE_AREA: Record<Area, string | null> = {
  Ventas: 'VENTAS',
  Legal: 'LEGAL',
  Finanzas: 'FINANZAS',
  Operaciones: null,
  Tecnología: null,
  'Atención al cliente': null,
}

export const TOTAL_PERSONAS = 64

function generar(): Persona[] {
  const azar = crearAzar(1050)
  const usados = new Set<string>()
  const personas: Persona[] = []
  while (personas.length < TOTAL_PERSONAS) {
    const nombre = `${elegir(azar, NOMBRES)} ${elegir(azar, APELLIDOS)} ${elegir(azar, APELLIDOS)}`
    const [pila, paterno] = nombre.split(' ') as [string, string]
    const base = `${sinTildes(pila)}.${sinTildes(paterno)}`
    if (usados.has(base)) continue
    usados.add(base)
    const area = elegir(azar, AREAS)
    const estado = ponderado<EstadoPersona>(azar, [['activo', 8], ['invitado', 1], ['suspendido', 1]])
    const roles = ['USER']
    const extra = ROL_DE_AREA[area]
    if (extra) roles.push(extra)
    // Uno de cada doce, administrador; Tecnología lo es más a menudo.
    if (azar() < (area === 'Tecnología' ? 0.35 : 0.06)) roles.push('ADMIN')
    const creadaHace = entero(azar, 30, 900) * 24 * 60
    personas.push({
      id: `u-${String(personas.length + 1).padStart(3, '0')}`,
      nombre,
      correo: `${base}@ejemplo.test`,
      telefono: `+51 900 000 ${String(personas.length + 1).padStart(3, '0')}`,
      area,
      roles,
      estado,
      ultimoAcceso: estado === 'invitado' ? null : haceMinutos(entero(azar, 5, Math.min(creadaHace, 60 * 24 * 45))),
      creada: haceMinutos(creadaHace),
      dobleFactor: estado !== 'invitado' && azar() < 0.55,
    })
  }
  return personas
}

/** Las 64 personas, siempre las mismas. Congeladas: el CRUD de la galería trabaja sobre una copia. */
export const PERSONAS: readonly Readonly<Persona>[] = Object.freeze(generar().map((p) => Object.freeze(p)))

/** Una copia editable para el estado en memoria de la administración. */
export function copiaDePersonas(): Persona[] {
  return PERSONAS.map((p) => ({ ...p, roles: [...p.roles] }))
}

export const AREAS_DISPONIBLES = AREAS
