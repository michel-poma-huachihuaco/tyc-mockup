import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ANCHOS,
  CARPETAS,
  EVENTOS_EN_BANDEJA,
  PLURAL_ESTADO,
  UMBRALES_REM,
  anchoVista,
  crearBandeja,
  describirEscala,
  disposicionPara,
  escalaParaCaber,
  mensajesDe,
  resumenPorEstado,
  rutaEmbebida,
} from '../src/demo/pantallas/redimensionado/modelo.ts'
import type { AvisoDeEntrada, EventoDeEntrada, LoteDeEntrada, PersonaDeEntrada } from '../src/demo/pantallas/redimensionado/modelo.ts'

/**
 * Lo que calcula /demo/redimensionado sin React: la bandeja de correo de ejemplo, el
 * resumen de lotes de las tarjetas con container queries y la escala de la vista previa.
 * Con datos mínimos escritos aquí: el modelo recibe los datos por parámetro (los de
 * src/demo/datos/ encajan en sus tipos, lo comprueba tsc). `npm run demo:quitar` borra este
 * archivo con la galería.
 */

const persona = (id: string, nombre: string): PersonaDeEntrada => ({ id, nombre, correo: `${id}@ejemplo.test`, area: 'Ventas' })

const PERSONAS = [persona('u-1', 'Ana Quispe Rojas'), persona('u-2', 'Bruno Flores Ríos')]

const evento = (n: number, gravedad: EventoDeEntrada['gravedad'], actor = 'u-1'): EventoDeEntrada => ({
  id: `e-${String(n).padStart(3, '0')}`,
  // Del más reciente al más antiguo, como AUDITORIA.
  fecha: new Date(Date.UTC(2026, 8, 30, 12) - n * 60_000).toISOString(),
  actor,
  accion: 'Reservó un lote',
  recurso: `Lote ${100 + n}`,
  gravedad,
  ip: '192.0.2.10',
})

const AVISOS: AvisoDeEntrada[] = [
  { id: 'n-1', titulo: 'Pago conciliado', descripcion: 'La cuota 4 quedó conciliada.', fecha: '2026-09-30T12:30:00.000Z', leido: false },
]

test('la bandeja: avisos en Entrada; críticos en Alertas, avisos en Para revisar; informativos en Entrada y luego Archivo', () => {
  const eventos = [
    evento(1, 'critico'),
    evento(2, 'aviso'),
    ...Array.from({ length: 14 }, (_, i) => evento(3 + i, 'info')),
    evento(40, 'info', 'u-desconocido'),
  ]
  const bandeja = crearBandeja(AVISOS, eventos, PERSONAS)
  assert.equal(bandeja.length, 1 + 16, 'un evento de alguien que no está en PERSONAS no entra')
  assert.deepEqual(
    mensajesDe(bandeja, 'alertas').map((m) => m.id),
    ['e-001'],
  )
  assert.deepEqual(
    mensajesDe(bandeja, 'revisar').map((m) => m.id),
    ['e-002'],
  )
  // Doce informativos en Entrada (con el aviso) y los dos más viejos en Archivo.
  assert.equal(mensajesDe(bandeja, 'entrada').length, 1 + 12)
  assert.deepEqual(
    mensajesDe(bandeja, 'archivo').map((m) => m.id),
    ['e-015', 'e-016'],
  )
  const aviso = bandeja.find((m) => m.id === 'aviso-n-1')
  assert.equal(aviso?.carpeta, 'entrada')
  assert.equal(aviso?.correo, 'avisos@ejemplo.test')
  const critico = bandeja.find((m) => m.id === 'e-001')
  assert.equal(critico?.remitente, 'Ana Quispe Rojas')
  assert.equal(critico?.asunto, 'Reservó un lote · Lote 101')
  assert.match(critico?.parrafos[0] ?? '', /^Ana Quispe Rojas, de Ventas, reservó un lote: Lote 101\.$/)
  assert.match(critico?.parrafos[1] ?? '', /Gravedad crítica/)
  assert.deepEqual(
    CARPETAS.map((c) => c.id),
    ['entrada', 'alertas', 'revisar', 'archivo'],
  )
})

test('la bandeja va del mensaje más reciente al más antiguo, es siempre la misma y toma solo los eventos recientes', () => {
  const eventos = Array.from({ length: EVENTOS_EN_BANDEJA + 5 }, (_, i) => evento(i + 1, 'info'))
  const una = crearBandeja(AVISOS, eventos, PERSONAS)
  assert.deepEqual(crearBandeja(AVISOS, eventos, PERSONAS), una)
  assert.equal(una.length, 1 + EVENTOS_EN_BANDEJA)
  const fechas = una.map((m) => m.fecha)
  assert.deepEqual(fechas, [...fechas].sort().reverse())
  assert.equal(una[0]?.id, 'aviso-n-1')
})

test('el resumen de lotes: los cuatro estados en orden, con su porcentaje y las tres manzanas con más', () => {
  const lote = (manzana: string, estado: LoteDeEntrada['estado']): LoteDeEntrada => ({ manzana, estado })
  const lotes = [
    lote('A', 'disponible'),
    lote('A', 'disponible'),
    lote('B', 'disponible'),
    lote('C', 'disponible'),
    lote('D', 'disponible'),
    lote('D', 'disponible'),
    lote('B', 'vendido'),
    lote('B', 'reservado'),
  ]
  const resumen = resumenPorEstado(lotes)
  assert.deepEqual(
    resumen.map((r) => [r.estado, r.total, r.porcentaje]),
    [
      ['disponible', 6, 75],
      ['reservado', 1, 13],
      ['vendido', 1, 13],
      ['bloqueado', 0, 0],
    ],
  )
  assert.deepEqual(resumen[0]?.manzanas, [
    { manzana: 'A', total: 2 },
    { manzana: 'D', total: 2 },
    { manzana: 'B', total: 1 },
  ])
  assert.equal(PLURAL_ESTADO.bloqueado, 'Bloqueados')
  assert.deepEqual(
    resumenPorEstado([]).map((r) => r.porcentaje),
    [0, 0, 0, 0],
  )
})

test('la disposición sigue los umbrales de las container queries (22rem y 36rem), en px de rem', () => {
  assert.deepEqual(UMBRALES_REM, { fila: 22, amplia: 36 })
  assert.equal(disposicionPara(351), 'apilada')
  assert.equal(disposicionPara(352), 'en fila')
  assert.equal(disposicionPara(575), 'en fila')
  assert.equal(disposicionPara(576), 'amplia')
  assert.equal(disposicionPara(440, 20), 'en fila', 'con la letra a 20px, 22rem son 440px')
})

test('la vista previa: cuatro anchos, escala que nunca amplía ni se pasa, y la ruta embebida', () => {
  assert.deepEqual(
    ANCHOS.map((a) => a.ancho),
    [390, 768, 1024, 1440],
  )
  assert.equal(anchoVista(768).nombre, 'Tableta')
  assert.equal(anchoVista(1).ancho, 1440, 'un ancho desconocido es el de escritorio')
  assert.equal(escalaParaCaber(390, 900), 1)
  assert.equal(escalaParaCaber(1440, 720), 0.5)
  assert.equal(escalaParaCaber(1440, 1000), 0.694)
  assert.ok(1440 * escalaParaCaber(1440, 1000) <= 1000)
  assert.equal(escalaParaCaber(1440, 0), 1, 'sin medida todavía')
  assert.equal(describirEscala(anchoVista(1440), 0.5), '1440 × 900 px · al 50 %')
  assert.equal(rutaEmbebida('/demo'), '/demo?embebido=1')
  assert.equal(rutaEmbebida('/demo/vitrina?q=tabla#caso-2'), '/demo/vitrina?q=tabla&embebido=1#caso-2')
  assert.equal(rutaEmbebida('/demo?embebido=0'), '/demo?embebido=1')
})
