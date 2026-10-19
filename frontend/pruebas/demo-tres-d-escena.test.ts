import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test } from 'node:test'
import type { Object3D } from 'three'

/**
 * La escena three.js del visor 3D (src/demo/tres-d/escena-lotes.ts) sin WebGL: el modelo
 * —cajas, colores, marcas— se construye y se consulta en Node, sin renderer. Se prueba
 * que cada lote tiene la altura y el color de su estado, que el encuadre muestra el plano
 * entero, que el rayo de un clic devuelve el id del lote (los 160) y no uno filtrado, y
 * que `dispose()` suelta geometrías y materiales. `npm run demo:quitar` borra este archivo.
 */
registerHooks({
  resolve(especificador, contexto, siguiente) {
    try {
      return siguiente(especificador, contexto)
    } catch (error) {
      if (especificador.startsWith('.') && !/\.[cm]?[jt]sx?(\?.*)?$/.test(especificador)) {
        for (const extension of ['.ts', '/index.ts']) {
          try {
            return siguiente(`${especificador}${extension}`, contexto)
          } catch {
            // la siguiente
          }
        }
      }
      throw error
    }
  },
})

const { Color, Matrix4, PerspectiveCamera, Quaternion, Raycaster, Vector2, Vector3 } = await import('three')
const escena = await import('../src/demo/tres-d/escena-lotes.ts')
const plano = await import('../src/demo/tres-d/plano.ts')
const { LOTES, PLANO } = await import('../src/demo/datos/lotes.ts')

/** Colores fijos, distintos entre sí: lo que `readColor` daría en una página. */
const COLORES = escena.leerColores((token) => {
  const tabla: Record<string, string> = {
    '--aybar-color-feedback-success-border': '#1a7f37',
    '--aybar-color-feedback-warning-border': '#bf8700',
    '--aybar-color-feedback-danger-border': '#cf222e',
    '--aybar-color-border-default': '#8c8c8c',
    '--aybar-color-bg-canvas': '#f5f5f5',
    '--aybar-color-bg-surface-sunken': '#e5e5e5',
    '--aybar-color-bg-surface': '#ffffff',
    '--aybar-color-border-focus': '#0b5394',
    '--aybar-color-fg-default': '#1f1f1f',
  }
  return tabla[token] ?? ''
})

function camara(aspecto = 1.6) {
  const c = new PerspectiveCamera(escena.VISTA.fov, aspecto, 5, 20000)
  escena.encuadrar(c)
  return c
}

/** El rayo de un clic justo sobre el centro del techo de la caja del lote. */
function rayoAl(id: string, c: InstanceType<typeof PerspectiveCamera>) {
  const lote = plano.loteDe(id) ?? assert.fail(id)
  const { x, z } = plano.centroEnEscena(lote)
  const punto = new Vector3(x, plano.LOSA + plano.ALTURA_ESTADO[lote.estado] - 0.01, z).project(c)
  const rayo = new Raycaster()
  rayo.setFromCamera(new Vector2(punto.x, punto.y), c)
  return rayo
}

test('escena · los colores salen de los tokens, con un gris si falta uno', () => {
  assert.equal(COLORES.estados.disponible, '#1a7f37')
  assert.equal(COLORES.estados.bloqueado, '#8c8c8c')
  assert.equal(COLORES.fondo, '#f5f5f5')
  assert.equal(COLORES.foco, '#0b5394')
  assert.equal(COLORES.rotulo, '#1f1f1f')
  assert.equal(escena.leerColores(() => '').losa, '#808080')
  for (const token of Object.values(escena.TOKENS_ESCENA)) assert.match(token, /^--aybar-color-/)
})

test('escena · una caja por lote, con la altura y el color de su estado', () => {
  const modelo = escena.crearModelo(COLORES)
  assert.equal(modelo.malla.count, LOTES.length)
  assert.deepEqual(modelo.ids, LOTES.map((l) => l.id))
  const m = new Matrix4()
  const posicion = new Vector3()
  const escala = new Vector3()
  const color = new Color()
  LOTES.forEach((lote, i) => {
    modelo.malla.getMatrixAt(i, m)
    m.decompose(posicion, new Quaternion(), escala)
    assert.ok(Math.abs(escala.y - plano.ALTURA_ESTADO[lote.estado]) < 1e-6, `${lote.id} alto`)
    assert.ok(Math.abs(escala.x - (lote.frente - plano.JUNTA)) < 1e-6, `${lote.id} frente`)
    const centro = plano.centroEnEscena(lote)
    assert.ok(Math.abs(posicion.x - centro.x) < 1e-6 && Math.abs(posicion.z - centro.z) < 1e-6, `${lote.id} sitio`)
    modelo.malla.getColorAt(i, color)
    assert.equal(`#${color.getHexString()}`, COLORES.estados[lote.estado], `${lote.id} color`)
  })
  // Filtrar deja planos y apagados los de fuera; el de dentro no cambia.
  const dentro = LOTES[5] ?? assert.fail()
  modelo.fijar({ visibles: new Set([dentro.id]) })
  LOTES.forEach((lote, i) => {
    modelo.malla.getMatrixAt(i, m)
    m.decompose(posicion, new Quaternion(), escala)
    const esperado = lote.id === dentro.id ? plano.ALTURA_ESTADO[lote.estado] : plano.ALTURA_FUERA
    assert.ok(Math.abs(escala.y - esperado) < 1e-6, lote.id)
  })
  modelo.malla.getColorAt(0, color)
  assert.notEqual(`#${color.getHexString()}`, COLORES.estados[LOTES[0]?.estado ?? 'disponible'], 'apagado')
  // Repintar con otra paleta cambia el color de cada caja.
  modelo.fijar({ visibles: null })
  modelo.pintar({ ...COLORES, estados: { ...COLORES.estados, disponible: '#00ff00' } })
  const i = LOTES.findIndex((l) => l.estado === 'disponible')
  modelo.malla.getColorAt(i, color)
  assert.equal(`#${color.getHexString()}`, '#00ff00')
  modelo.dispose()
})

test('escena · el encuadre muestra el plano entero en cualquier proporción', () => {
  for (const aspecto of [0.5, 1, 1.6, 2.4]) {
    const c = camara(aspecto)
    for (const x of [-PLANO.ancho / 2, PLANO.ancho / 2]) {
      for (const z of [-PLANO.alto / 2, PLANO.alto / 2]) {
        const p = new Vector3(x, 0, z).project(c)
        assert.ok(Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z < 1, `esquina fuera con aspecto ${aspecto}`)
      }
    }
    const centro = new Vector3(0, 0, 0).project(c)
    assert.ok(Math.abs(centro.x) < 1e-6 && Math.abs(centro.y) < 1e-6, 'mira al centro')
  }
})

test('escena · el rayo de un clic devuelve el id del lote, y no uno que el filtro dejó fuera', () => {
  const modelo = escena.crearModelo(COLORES)
  const c = camara(1.6)
  for (const lote of LOTES) assert.equal(modelo.elegir(rayoAl(lote.id, c)), lote.id)
  const objetivo = 'D-12'
  modelo.fijar({ visibles: new Set(LOTES.filter((l) => l.id !== objetivo).map((l) => l.id)) })
  assert.notEqual(modelo.elegir(rayoAl(objetivo, c)), objetivo)
  // Un rayo al cielo no elige nada.
  const rayo = new Raycaster()
  rayo.setFromCamera(new Vector2(0, 0.99), c)
  rayo.ray.direction.set(0, 1, 0)
  assert.equal(modelo.elegir(rayo), null)
  modelo.dispose()
})

test('escena · elegido y enfocado se marcan, uno distinto del otro', () => {
  const modelo = escena.crearModelo(COLORES)
  const contornos = () => modelo.escena.children.filter((o: Object3D) => o.type === 'LineSegments' && o.visible)
  assert.equal(contornos().length, 0)
  assert.equal(modelo.fijar({ seleccionado: 'B-07' }), true)
  assert.equal(modelo.fijar({ seleccionado: 'B-07' }), false, 'sin cambios, sin repintar')
  assert.equal(contornos().length, 1)
  const centro = plano.centroEnEscena(plano.loteDe('B-07') ?? assert.fail())
  assert.ok(Math.abs((contornos()[0]?.position.x ?? NaN) - centro.x) < 1e-6)
  modelo.fijar({ enfocado: 'B-07' })
  assert.equal(contornos().length, 1, 'el enfocado que ya está elegido no se marca dos veces')
  modelo.fijar({ enfocado: 'B-08' })
  assert.equal(contornos().length, 2)
  // Lo que el filtro deja fuera no se marca.
  modelo.fijar({ visibles: new Set(['A-01']) })
  assert.equal(contornos().length, 0)
  modelo.dispose()
})

test('escena · dispose suelta geometrías y materiales', () => {
  const modelo = escena.crearModelo(COLORES)
  const soltados = new Set<unknown>()
  const recursos = new Set<{ addEventListener: (tipo: 'dispose', f: () => void) => void }>()
  modelo.escena.traverse((objeto) => {
    const conRecursos = objeto as Object3D & { geometry?: unknown; material?: unknown }
    for (const recurso of [conRecursos.geometry, conRecursos.material]) {
      if (recurso && typeof recurso === 'object' && 'dispose' in recurso) recursos.add(recurso as never)
    }
  })
  assert.ok(recursos.size >= 6)
  for (const recurso of recursos) recurso.addEventListener('dispose', () => soltados.add(recurso))
  modelo.dispose()
  assert.equal(soltados.size, recursos.size)
  assert.equal(modelo.escena.children.length, 0)
})
