/**
 * El maestro único de clientes (SIGDA/TAXON, DEP-01), simulado. Solo lectura: el prototipo
 * busca y elige, nunca crea un registro paralelo del cliente (RN-SVC-026). Nombres y DNI
 * sintéticos, generados con semilla fija; los DNI empiezan por 9 y no corresponden a nadie.
 */

export interface Cliente {
  readonly id: string
  readonly nombre: string
  readonly dni: string
  readonly telefono: string
  readonly correo: string
  readonly proyectos: readonly string[]
}

const NOMBRES = ['María', 'Jorge', 'Rosa', 'Luis', 'Ana', 'Pedro', 'Carmen', 'Víctor', 'Elena', 'Hugo', 'Nora', 'César', 'Pilar', 'Raúl', 'Inés', 'Tomás', 'Lidia', 'Félix', 'Gloria', 'Iván']
const APELLIDOS = ['Quispe', 'Mamani', 'Huamán', 'Paredes', 'Torres', 'Chávez', 'Salas', 'Ramos', 'Flores', 'Vargas', 'Rojas', 'Castro', 'Mendoza', 'Ccori', 'Lazo', 'Rivas', 'Poma', 'Inga', 'Soto', 'Díaz']
const PROYECTOS = [
  'Villa Sol II · Mz. C Lt. 14',
  'Los Álamos de Carabayllo · Mz. F Lt. 3',
  'Residencial Brisas · Torre B 402',
  'Villa Sol II · Mz. A Lt. 2',
  'Los Álamos · Mz. B Lt. 21',
  'Ciudad Aybar Norte · Mz. K Lt. 7',
  'Residencial Brisas · Torre A 101',
  'Villa Sol II · Mz. D Lt. 9',
]

/** Generador congruencial: los mismos clientes en cada carga. */
function aleatorio(semilla: number) {
  let s = semilla
  return () => {
    s = (s * 1_103_515_245 + 12_345) % 2_147_483_648
    return s / 2_147_483_648
  }
}

function generar(): Cliente[] {
  const azar = aleatorio(29_571)
  const elegir = <T,>(lista: readonly T[]) => lista[Math.floor(azar() * lista.length)]
  return Array.from({ length: 40 }, (_, i) => {
    const nombre = NOMBRES[i % NOMBRES.length]
    const ap1 = elegir(APELLIDOS)
    const ap2 = elegir(APELLIDOS)
    const dni = `9${String(Math.floor(azar() * 9_999_999)).padStart(7, '0')}`
    const proyectos = [elegir(PROYECTOS)]
    if (azar() > 0.7) proyectos.push(elegir(PROYECTOS.filter((p) => p !== proyectos[0])))
    return {
      id: `cli-${String(i + 1).padStart(3, '0')}`,
      nombre: `${nombre} ${ap1} ${ap2}`,
      dni,
      telefono: `+51 900 ${String(100 + i).padStart(3, '0')} ${String(Math.floor(azar() * 900) + 100)}`,
      correo: `${nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${ap1.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}${i}@ejemplo.test`,
      proyectos,
    }
  })
}

export const CLIENTES: readonly Cliente[] = generar()

/** Quien aún no está en el maestro: el ticket nace con este marcador y se vincula después (HU-ATC-051). */
export const INTERESADO_ID = 'cli-int'
const INTERESADO: Cliente = { id: INTERESADO_ID, nombre: 'Interesado (sin vincular)', dni: '', telefono: '', correo: '', proyectos: [] }

export const cliente = (id: string) => (id === INTERESADO_ID ? INTERESADO : (CLIENTES.find((c) => c.id === id) ?? null))

/** DNI enmascarado para listas y cabeceras: 9123•••• (RNF-SEC-008, mínimo de PII a la vista). */
export const dniEnmascarado = (dni: string) => `${dni.slice(0, 4)}••••`

const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Búsqueda por DNI (prefijo) o por nombre (todas las palabras). */
export function buscarEnMaestro(consulta: string): Cliente[] {
  const q = sinTildes(consulta.trim())
  if (q.length < 3) return []
  if (/^\d+$/.test(q)) return CLIENTES.filter((c) => c.dni.startsWith(q)).slice(0, 8)
  const palabras = q.split(/\s+/)
  return CLIENTES.filter((c) => palabras.every((p) => sinTildes(c.nombre).includes(p))).slice(0, 8)
}
