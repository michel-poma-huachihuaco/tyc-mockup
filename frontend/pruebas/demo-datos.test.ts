import assert from 'node:assert/strict'
import { register } from 'node:module'
import { test } from 'node:test'

/**
 * Los datos sintéticos de la galería salen de generadores con semilla: los mismos en cada
 * carga, sin red y sin datos de nadie. Los archivos de src/demo/datos/ son comunes con la
 * plantilla Angular e importan sin extensión (los resuelve el empaquetador); para Node se
 * registra un resolutor mínimo que prueba con `.ts`. `npm run demo:quitar` borra este
 * archivo con la galería.
 */
register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(especificador, contexto, siguiente) {
      try {
        return await siguiente(especificador, contexto)
      } catch (error) {
        if (error?.code === 'ERR_MODULE_NOT_FOUND' && /^\\.\\.?\\//.test(especificador) && !/\\.[cm]?[jt]sx?$/.test(especificador)) {
          return siguiente(especificador + '.ts', contexto)
        }
        throw error
      }
    }
  `)}`,
  import.meta.url,
)

/**
 * Lo que esta prueba usa de datos/, escrito aquí: la configuración de Node de tsc
 * (nodenext) no sigue los imports sin extensión de esos archivos, así que no se importan
 * sus tipos; la ruta va en una variable para que tsc no intente resolverla.
 */
interface Persona {
  id: string
  nombre: string
  correo: string
  telefono: string
  roles: string[]
}
interface Datos {
  crearAzar(semilla: number): () => number
  copiaDePersonas(): Persona[]
  PERSONAS: readonly Readonly<Persona>[]
  TOTAL_PERSONAS: number
  LOTES: readonly { id: string }[]
  LOTES_POR_MANZANA: number
  AUDITORIA: readonly { id: string; ip: string; fecha: string }[]
  TOTAL_EVENTOS: number
  SESIONES: readonly { ip: string }[]
  CODIGOS_RECUPERACION: readonly string[]
  HOY: Date
  resumenLotes(): Record<string, number>
  formatoSoles(monto: number): string
}

const rutaDatos = '../src/demo/datos/index.ts'
const datos = (await import(rutaDatos)) as Datos

test('dos llamadas dan las mismas personas, lotes y eventos', () => {
  assert.deepEqual(datos.copiaDePersonas(), datos.copiaDePersonas())
  const a = datos.crearAzar(2026)
  const b = datos.crearAzar(2026)
  assert.deepEqual(
    Array.from({ length: 5 }, () => a()),
    Array.from({ length: 5 }, () => b()),
  )
  assert.equal(datos.PERSONAS.length, datos.TOTAL_PERSONAS)
  assert.equal(datos.LOTES.length, 8 * datos.LOTES_POR_MANZANA)
  assert.equal(datos.AUDITORIA.length, datos.TOTAL_EVENTOS)
  // Un valor fijo de cada generador: si cambia la semilla o el algoritmo, cambian las capturas.
  assert.equal(datos.PERSONAS[0]?.id, 'u-001')
  assert.equal(datos.LOTES[0]?.id, 'A-01')
  assert.equal(datos.AUDITORIA[0]?.id, 'e-001')
})

test('la copia de personas es editable sin tocar los datos congelados', () => {
  const copia = datos.copiaDePersonas()
  const primera = copia[0]
  assert.ok(primera)
  primera.nombre = 'Otra'
  primera.roles.push('ADMIN')
  assert.notEqual(datos.PERSONAS[0]?.nombre, 'Otra')
  assert.ok(Object.isFrozen(datos.PERSONAS[0]))
  assert.ok(Object.isFrozen(datos.LOTES))
})

test('nada real: correos ejemplo.test, IP de documentación y fechas desde el «hoy» fijo', () => {
  for (const p of datos.PERSONAS) {
    assert.match(p.correo, /@ejemplo\.test$/)
    assert.match(p.telefono, /^\+51 900 000 \d{3}$/)
    assert.ok(p.roles.includes('USER'))
  }
  for (const e of datos.AUDITORIA) {
    assert.match(e.ip, /^192\.0\.2\.\d{1,3}$/)
    assert.ok(new Date(e.fecha) <= datos.HOY)
  }
  for (const s of datos.SESIONES) assert.match(s.ip, /^198\.51\.100\.\d{1,3}$/)
  assert.ok(datos.CODIGOS_RECUPERACION.every((c) => c.startsWith('DEMO-')))
})

test('el resumen de lotes cuenta todos y el precio se escribe en soles', () => {
  const resumen = datos.resumenLotes()
  assert.equal(Object.values(resumen).reduce((t, n) => t + n, 0), datos.LOTES.length)
  assert.match(datos.formatoSoles(127300), /^S\/ 127[,.\s]?300$/)
})
