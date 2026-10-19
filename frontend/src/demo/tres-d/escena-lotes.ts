import {
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  EdgesGeometry,
  HemisphereLight,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { BufferGeometry, Material, Texture } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { readColor, subscribeAppearance } from '@aybarcorp/tokens/apariencia'
import { CALLE, LOTES, PLANO } from '../datos/lotes'
import type { EstadoLote, Lote } from '../datos/lotes'
import { ALTURA_ESTADO, ALTURA_FUERA, ESTADOS, JUNTA, LOSA, MANZANAS_PLANO, TOKEN_ESTADO, centroEnEscena } from './plano'

/**
 * La escena three.js del visor de lotes de /demo/3d, sin framework: la pantalla de React y
 * la de Angular le dan un contenedor y la manejan con cuatro funciones. Es el mismo
 * archivo, idéntico, en src/demo/tres-d/ (React) y src/app/demo/visor/ (Angular), y solo
 * lo carga esa pantalla con `import()`: three.js no entra en ningún otro chunk.
 *
 * - Un `InstancedMesh` de cajas bajas, una por lote, con la altura de su estado, sobre la
 *   losa de su manzana; las calles son el suelo que queda entre losas.
 * - Los colores salen de los tokens (`readColor`) y se repintan al cambiar la apariencia
 *   (`subscribeAppearance`): tema, paleta o estilo.
 * - Se pinta a demanda: al mover la cámara, al redimensionar, al seleccionar, al filtrar o
 *   al cambiar los colores. Sin bucle continuo, la pestaña quieta no gasta nada.
 * - `dispose()` suelta geometrías, materiales, texturas, controles, el renderer y los
 *   observadores.
 *
 * El estado (qué lote está elegido, qué filtro hay) es de la pantalla: un clic en un lote
 * solo avisa con `alSeleccionar`, y la pantalla responde con `seleccionar(id)`.
 */

export interface OpcionesEscena {
  /** Un clic (o un toque) sobre un lote visible. */
  readonly alSeleccionar: (id: string) => void
}

export interface EscenaLotes {
  /** Marca el lote elegido (o ninguno): contorno, velo del color de foco y un marcador encima. */
  seleccionar(id: string | null): void
  /** Marca el lote que tiene el foco en la lista (o ninguno), más suave que el elegido. */
  enfocar(id: string | null): void
  /** Deja en pie solo esos lotes; los demás quedan planos y apagados. `null`: todos. */
  filtrar(ids: Iterable<string> | null): void
  dispose(): void
}

/** Los tokens del resto de la escena. Los de los lotes están en `TOKEN_ESTADO` (plano.ts). */
export const TOKENS_ESCENA = {
  fondo: '--aybar-color-bg-canvas',
  suelo: '--aybar-color-bg-surface-sunken',
  losa: '--aybar-color-bg-surface',
  borde: '--aybar-color-border-default',
  foco: '--aybar-color-border-focus',
  rotulo: '--aybar-color-fg-default',
} as const

export interface ColoresEscena {
  readonly fondo: string
  readonly suelo: string
  readonly losa: string
  readonly borde: string
  readonly foco: string
  readonly rotulo: string
  readonly estados: Readonly<Record<EstadoLote, string>>
}

/** El gris de reserva si un token no existe (una hoja sin cargar): mejor gris que negro. */
const RESERVA = '#808080'

/** Los colores de la escena tal como los resuelve ahora la página (`#rrggbb`). */
export function leerColores(leer: (token: string) => string = readColor): ColoresEscena {
  const de = (token: string) => leer(token) || RESERVA
  const estados = {} as Record<EstadoLote, string>
  for (const estado of ESTADOS) estados[estado] = de(TOKEN_ESTADO[estado])
  return {
    fondo: de(TOKENS_ESCENA.fondo),
    suelo: de(TOKENS_ESCENA.suelo),
    losa: de(TOKENS_ESCENA.losa),
    borde: de(TOKENS_ESCENA.borde),
    foco: de(TOKENS_ESCENA.foco),
    rotulo: de(TOKENS_ESCENA.rotulo),
    estados,
  }
}

/** Lo que se ve marcado. `bajoPuntero` es el lote bajo el ratón, que manda sobre `enfocado`. */
export interface EstadoVisual {
  readonly seleccionado: string | null
  readonly enfocado: string | null
  readonly bajoPuntero: string | null
  /** Los lotes que el filtro deja en pie; `null`, todos. */
  readonly visibles: ReadonlySet<string> | null
}

/** La escena sin renderer: se puede construir y consultar sin WebGL (lo hacen las pruebas). */
export interface ModeloLotes {
  readonly escena: Scene
  readonly malla: InstancedMesh
  /** El id del lote de cada instancia, en el orden de `LOTES`. */
  readonly ids: readonly string[]
  readonly estado: Readonly<EstadoVisual>
  /** Aplica los cambios y dice si se ve algo distinto. */
  fijar(cambios: Partial<EstadoVisual>): boolean
  pintar(colores: ColoresEscena): void
  /** El lote visible más cercano que toca el rayo, o `null`. */
  elegir(rayo: Raycaster): string | null
  dispose(): void
}

/** El encuadre de partida: de lado y desde arriba, como una maqueta en la mesa. */
export const VISTA = Object.freeze({ fov: 35, elevacion: (55 * Math.PI) / 180, azimut: (-28 * Math.PI) / 180 })

/** El margen del suelo alrededor de las manzanas, en metros: los rótulos van en él. */
const MARGEN_SUELO = CALLE * 2

export function crearModelo(colores: ColoresEscena, lotes: readonly Readonly<Lote>[] = LOTES): ModeloLotes {
  const escena = new Scene()
  const geometrias: BufferGeometry[] = []
  const materiales: Material[] = []
  const texturas: Texture[] = []
  const geometria = <T extends BufferGeometry>(g: T): T => {
    geometrias.push(g)
    return g
  }
  const material = <T extends Material>(m: T): T => {
    materiales.push(m)
    return m
  }

  // Una caja de 1 m con la base en y = 0: la escala en y es la altura.
  const caja = geometria(new BoxGeometry(1, 1, 1).translate(0, 0.5, 0))
  const lamina = geometria(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2))

  const luzCielo = new HemisphereLight(0xffffff, 0xffffff, 2)
  const luzSol = new DirectionalLight(0xffffff, 1.2)
  luzSol.position.set(-0.6, 1, 0.45)
  escena.add(luzCielo, luzSol)

  const materialSuelo = material(new MeshBasicMaterial())
  const suelo = new Mesh(lamina, materialSuelo)
  suelo.scale.set(PLANO.ancho + 2 * MARGEN_SUELO, 1, PLANO.alto + 2 * MARGEN_SUELO)
  escena.add(suelo)

  // Las losas de las manzanas: un metro más que sus lotes por cada lado, como una acera.
  const materialLosa = material(new MeshBasicMaterial())
  const losas = new InstancedMesh(caja, materialLosa, MANZANAS_PLANO.length)
  const m = new Matrix4()
  const giro = new Quaternion()
  const posicion = new Vector3()
  const escala = new Vector3()
  MANZANAS_PLANO.forEach(({ rect }, i) => {
    const centro = centroEnEscena({ x: rect.x, y: rect.y, frente: rect.ancho, fondo: rect.alto })
    losas.setMatrixAt(i, m.compose(posicion.set(centro.x, 0, centro.z), giro, escala.set(rect.ancho + 2, LOSA, rect.alto + 2)))
  })
  escena.add(losas)

  const materialLote = material(new MeshStandardMaterial({ roughness: 0.85, metalness: 0 }))
  const malla = new InstancedMesh(caja, materialLote, lotes.length)
  malla.instanceMatrix.setUsage(DynamicDrawUsage)
  escena.add(malla)
  const ids = lotes.map((lote) => lote.id)

  // Elegido y enfocado: contorno (por encima de todo), un velo del color de foco sobre la
  // caja y, con lienzo 2D disponible, un marcador del mismo tamaño en pantalla a cualquier
  // distancia de la cámara.
  const aristas = geometria(new EdgesGeometry(caja))
  const marca = (opacidadLinea: number, opacidadVelo: number, tamanoPin: number) => {
    const contorno = new LineSegments(aristas, material(new LineBasicMaterial({ transparent: true, opacity: opacidadLinea, depthTest: false })))
    contorno.renderOrder = 10
    const velo = new Mesh(caja, material(new MeshBasicMaterial({ transparent: true, opacity: opacidadVelo, depthWrite: false })))
    velo.renderOrder = 2
    const pin = hayLienzo2D() ? crearSprite(material, texturas, 0.5, 0, true) : null
    if (pin) {
      pin.renderOrder = 11
      pin.scale.set(tamanoPin, tamanoPin, 1)
    }
    const partes = pin ? [contorno, velo, pin] : [contorno, velo]
    for (const parte of partes) parte.visible = false
    escena.add(...partes)
    return { contorno, velo, pin, opacidadPin: opacidadLinea }
  }
  const marcaElegido = marca(1, 0.32, 0.075)
  const marcaFoco = marca(0.7, 0.16, 0.055)

  // Las letras de las manzanas, en la calle a la izquierda de cada una.
  const rotulos = hayLienzo2D()
    ? MANZANAS_PLANO.map(({ manzana, rect }) => {
        const sprite = crearSprite(material, texturas, 0.5, 0.5, false)
        const centro = centroEnEscena({ x: rect.x, y: rect.y, frente: rect.ancho, fondo: rect.alto })
        sprite.position.set(centro.x - rect.ancho / 2 - CALLE / 2, 3, centro.z)
        sprite.scale.set(0.05, 0.05, 1)
        escena.add(sprite)
        return { manzana, sprite }
      })
    : []

  let actuales = colores
  let estado: EstadoVisual = { seleccionado: null, enfocado: null, bajoPuntero: null, visibles: null }
  const indice = new Map(ids.map((id, i) => [id, i]))
  const color = new Color()
  const colorLosa = new Color()

  const dentro = (id: string) => !estado.visibles || estado.visibles.has(id)

  function levantar() {
    colorLosa.set(actuales.losa)
    lotes.forEach((lote, i) => {
      const visible = dentro(lote.id)
      const { x, z } = centroEnEscena(lote)
      const alto = visible ? ALTURA_ESTADO[lote.estado] : ALTURA_FUERA
      malla.setMatrixAt(i, m.compose(posicion.set(x, LOSA, z), giro, escala.set(lote.frente - JUNTA, alto, lote.fondo - JUNTA)))
      color.set(actuales.estados[lote.estado])
      if (!visible) color.lerp(colorLosa, 0.78)
      malla.setColorAt(i, color)
    })
    malla.instanceMatrix.needsUpdate = true
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true
    malla.computeBoundingSphere()
    malla.computeBoundingBox()
  }

  function colocar(marcaLote: ReturnType<typeof marca>, id: string | null) {
    const i = id === null ? undefined : indice.get(id)
    const lote = i === undefined ? undefined : lotes[i]
    const visible = lote !== undefined && dentro(lote.id)
    marcaLote.contorno.visible = visible
    marcaLote.velo.visible = visible
    if (marcaLote.pin) marcaLote.pin.visible = visible
    if (!lote || !visible) return
    const { x, z } = centroEnEscena(lote)
    const alto = ALTURA_ESTADO[lote.estado]
    marcaLote.contorno.position.set(x, LOSA, z)
    marcaLote.contorno.scale.set(lote.frente - JUNTA + 0.5, alto + 0.25, lote.fondo - JUNTA + 0.5)
    marcaLote.velo.position.set(x, LOSA - 0.01, z)
    marcaLote.velo.scale.set(lote.frente - JUNTA + 0.3, alto + 0.15, lote.fondo - JUNTA + 0.3)
    marcaLote.pin?.position.set(x, LOSA + alto + 0.5, z)
  }

  function marcar() {
    colocar(marcaElegido, estado.seleccionado)
    const foco = estado.bajoPuntero ?? estado.enfocado
    colocar(marcaFoco, foco === estado.seleccionado ? null : foco)
  }

  function pintar(nuevos: ColoresEscena) {
    actuales = nuevos
    escena.background = new Color(nuevos.fondo)
    luzCielo.groundColor.set(nuevos.suelo)
    materialSuelo.color.set(nuevos.suelo)
    materialLosa.color.set(nuevos.losa)
    for (const marcaLote of [marcaElegido, marcaFoco]) {
      marcaLote.contorno.material.color.set(nuevos.foco)
      marcaLote.velo.material.color.set(nuevos.foco)
      if (marcaLote.pin) dibujarPin(marcaLote.pin, nuevos, marcaLote.opacidadPin)
    }
    for (const { manzana, sprite } of rotulos) dibujarRotulo(sprite, manzana, nuevos)
    levantar()
  }

  pintar(colores)
  marcar()

  return {
    escena,
    malla,
    ids,
    get estado() {
      return estado
    },
    fijar(cambios) {
      const antes = estado
      estado = { ...estado, ...cambios }
      if (cambios.visibles !== undefined && cambios.visibles !== antes.visibles) levantar()
      marcar()
      return (Object.keys(cambios) as (keyof EstadoVisual)[]).some((clave) => cambios[clave] !== antes[clave])
    },
    pintar,
    elegir(rayo) {
      for (const golpe of rayo.intersectObject(malla, false)) {
        const id = golpe.instanceId === undefined ? undefined : ids[golpe.instanceId]
        if (id && dentro(id)) return id
      }
      return null
    },
    dispose() {
      for (const g of geometrias) g.dispose()
      for (const mat of materiales) mat.dispose()
      for (const t of texturas) t.dispose()
      malla.dispose()
      losas.dispose()
      escena.clear()
    },
  }
}

/**
 * Coloca la cámara para que el plano entero (con las cajas más altas) quepa en el lienzo
 * con un poco de aire, mirando al centro desde `VISTA`. Devuelve la distancia.
 */
export function encuadrar(camara: PerspectiveCamera, holgura = 1.06): number {
  const bordeX = PLANO.ancho / 2 + 2
  const bordeZ = PLANO.alto / 2 + 2
  const techo = Math.max(...Object.values(ALTURA_ESTADO)) + LOSA
  const esquinas: Vector3[] = []
  for (const x of [-bordeX, bordeX]) for (const z of [-bordeZ, bordeZ]) for (const y of [0, techo]) esquinas.push(new Vector3(x, y, z))
  const direccion = new Vector3(
    Math.sin(VISTA.azimut) * Math.cos(VISTA.elevacion),
    Math.sin(VISTA.elevacion),
    Math.cos(VISTA.azimut) * Math.cos(VISTA.elevacion),
  )
  const punto = new Vector3()
  const colocar = (distancia: number) => {
    camara.position.copy(direccion).multiplyScalar(distancia)
    camara.lookAt(0, 0, 0)
    camara.updateProjectionMatrix()
    camara.updateMatrixWorld()
  }
  const cabe = () =>
    esquinas.every((esquina) => {
      punto.copy(esquina).project(camara)
      return Math.abs(punto.x) <= 1 / holgura && Math.abs(punto.y) <= 1 / holgura && punto.z < 1
    })
  // Búsqueda binaria: con la cámara más lejos, el plano siempre cabe mejor.
  let cerca = 10
  let lejos = 8000
  for (let paso = 0; paso < 40; paso++) {
    const medio = (cerca + lejos) / 2
    colocar(medio)
    if (cabe()) lejos = medio
    else cerca = medio
  }
  colocar(lejos)
  return lejos
}

/** Crea la escena dentro de `contenedor`. Lanza si el navegador no da un contexto WebGL. */
export function crearEscena(contenedor: HTMLElement, opciones: OpcionesEscena): EscenaLotes {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const lienzo = renderer.domElement
  // El nombre accesible lo lleva el contenedor (role="img"); el lienzo es solo píxeles.
  lienzo.setAttribute('aria-hidden', 'true')
  lienzo.style.display = 'block'
  lienzo.style.inlineSize = '100%'
  lienzo.style.blockSize = '100%'
  contenedor.append(lienzo)

  let colores = leerColores()
  const modelo = crearModelo(colores)
  // near de 5 m: precisión de profundidad de sobra entre la losa (30 cm) y el suelo.
  const camara = new PerspectiveCamera(VISTA.fov, 1, 5, 20000)
  const controles = new OrbitControls(camara, lienzo)
  controles.enableDamping = false
  controles.screenSpacePanning = false
  controles.zoomToCursor = true
  controles.minDistance = 20
  controles.minPolarAngle = (8 * Math.PI) / 180
  controles.maxPolarAngle = (80 * Math.PI) / 180

  let cerrada = false
  let marco = 0
  let tocada = false
  const pedir = () => {
    if (marco || cerrada) return
    marco = requestAnimationFrame(() => {
      marco = 0
      renderer.render(modelo.escena, camara)
    })
  }

  // El centro de la órbita no se va del plano: arrastrar de lado no pierde la maqueta.
  const desvio = new Vector3()
  const alCambiar = () => {
    const { target } = controles
    desvio.set(
      Math.min(Math.max(target.x, -PLANO.ancho / 2), PLANO.ancho / 2) - target.x,
      -target.y,
      Math.min(Math.max(target.z, -PLANO.alto / 2), PLANO.alto / 2) - target.z,
    )
    if (desvio.lengthSq() > 0) {
      target.add(desvio)
      camara.position.add(desvio)
    }
    pedir()
  }
  const alEmpezar = () => {
    tocada = true
  }
  controles.addEventListener('change', alCambiar)
  controles.addEventListener('start', alEmpezar)

  const ajustar = () => {
    const ancho = contenedor.clientWidth
    const alto = contenedor.clientHeight
    if (!ancho || !alto) return
    renderer.setSize(ancho, alto, false)
    camara.aspect = ancho / alto
    camara.updateProjectionMatrix()
    // Mientras nadie mueva la cámara, el plano entero sigue encuadrado al cambiar el tamaño.
    if (!tocada) {
      controles.target.set(0, 0, 0)
      controles.maxDistance = encuadrar(camara) * 1.8
      controles.update()
    }
    pedir()
  }
  const observador = new ResizeObserver(ajustar)
  observador.observe(contenedor)

  // Puntero: un clic sin arrastre elige; el ratón quieto encima marca el lote.
  const rayo = new Raycaster()
  const ndc = new Vector2()
  const loteEn = (evento: PointerEvent): string | null => {
    const caja = lienzo.getBoundingClientRect()
    if (!caja.width || !caja.height) return null
    ndc.set(((evento.clientX - caja.left) / caja.width) * 2 - 1, -((evento.clientY - caja.top) / caja.height) * 2 + 1)
    rayo.setFromCamera(ndc, camara)
    return modelo.elegir(rayo)
  }
  let inicio: { x: number; y: number; puntero: number } | null = null
  const alBajar = (evento: PointerEvent) => {
    inicio = evento.button === 0 ? { x: evento.clientX, y: evento.clientY, puntero: evento.pointerId } : null
  }
  const alSoltar = (evento: PointerEvent) => {
    const origen = inicio
    inicio = null
    if (!origen || origen.puntero !== evento.pointerId) return
    if (Math.hypot(evento.clientX - origen.x, evento.clientY - origen.y) > 5) return
    const id = loteEn(evento)
    if (id) opciones.alSeleccionar(id)
  }
  let encima = 0
  let ultimo: PointerEvent | null = null
  const marcarEncima = (id: string | null) => {
    lienzo.style.cursor = id ? 'pointer' : ''
    if (modelo.fijar({ bajoPuntero: id })) pedir()
  }
  const alMover = (evento: PointerEvent) => {
    if (evento.pointerType !== 'mouse' || evento.buttons !== 0) return
    ultimo = evento
    if (encima) return
    encima = requestAnimationFrame(() => {
      encima = 0
      if (ultimo && !cerrada) marcarEncima(loteEn(ultimo))
    })
  }
  const alSalir = () => {
    ultimo = null
    marcarEncima(null)
  }
  // Si el sistema retira el contexto (otra pestaña con mucho WebGL), se espera a recuperarlo.
  const alPerder = (evento: Event) => evento.preventDefault()
  lienzo.addEventListener('pointerdown', alBajar)
  lienzo.addEventListener('pointerup', alSoltar)
  lienzo.addEventListener('pointermove', alMover)
  lienzo.addEventListener('pointerleave', alSalir)
  lienzo.addEventListener('webglcontextlost', alPerder)
  lienzo.addEventListener('webglcontextrestored', pedir)

  // Los atributos ya están en <html> cuando llega el aviso; los colores se leen en el cuadro
  // siguiente, cuando cualquier hoja que dependa de ellos ya se aplicó.
  let aviso = 0
  const repintar = () => {
    cancelAnimationFrame(aviso)
    aviso = requestAnimationFrame(() => {
      if (cerrada) return
      colores = leerColores()
      modelo.pintar(colores)
      pedir()
    })
  }
  const desuscribir = subscribeAppearance(repintar)
  // Los rótulos se dibujan con la tipografía de la página: al llegar la fuente, otra vez.
  void document.fonts?.ready.then(repintar)

  ajustar()

  const valido = (id: string | null) => (id !== null && modelo.ids.includes(id) ? id : null)

  return {
    seleccionar(id) {
      if (!cerrada && modelo.fijar({ seleccionado: valido(id) })) pedir()
    },
    enfocar(id) {
      if (!cerrada && modelo.fijar({ enfocado: valido(id) })) pedir()
    },
    filtrar(ids) {
      if (cerrada) return
      modelo.fijar({ visibles: ids === null ? null : new Set(ids) })
      pedir()
    },
    dispose() {
      if (cerrada) return
      cerrada = true
      cancelAnimationFrame(marco)
      cancelAnimationFrame(encima)
      cancelAnimationFrame(aviso)
      observador.disconnect()
      desuscribir()
      controles.removeEventListener('change', alCambiar)
      controles.removeEventListener('start', alEmpezar)
      controles.dispose()
      lienzo.removeEventListener('pointerdown', alBajar)
      lienzo.removeEventListener('pointerup', alSoltar)
      lienzo.removeEventListener('pointermove', alMover)
      lienzo.removeEventListener('pointerleave', alSalir)
      lienzo.removeEventListener('webglcontextlost', alPerder)
      lienzo.removeEventListener('webglcontextrestored', pedir)
      modelo.dispose()
      renderer.dispose()
      // Suelta el contexto ya: los navegadores limitan cuántos hay a la vez.
      renderer.forceContextLoss()
      lienzo.remove()
    },
  }
}

/** `true` si se puede dibujar en un lienzo 2D (no en las pruebas, que corren sin DOM). */
function hayLienzo2D(): boolean {
  return typeof document !== 'undefined'
}

const LADO_TEXTURA = 128

/**
 * Un sprite con su propio lienzo 2D como textura, anclado en (`anclaX`, `anclaY`) y del
 * mismo tamaño en pantalla a cualquier distancia (su escala es una fracción del alto del
 * lienzo). `delante`: se ve aunque lo tape una caja.
 */
function crearSprite(material: <T extends Material>(m: T) => T, texturas: Texture[], anclaX: number, anclaY: number, delante: boolean): Sprite {
  const lienzo = document.createElement('canvas')
  lienzo.width = LADO_TEXTURA
  lienzo.height = LADO_TEXTURA
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  texturas.push(textura)
  const sprite = new Sprite(
    material(new SpriteMaterial({ map: textura, transparent: true, depthWrite: false, depthTest: !delante, sizeAttenuation: false })),
  )
  sprite.center.set(anclaX, anclaY)
  return sprite
}

function contextoDe(sprite: Sprite): CanvasRenderingContext2D | null {
  const imagen: unknown = sprite.material.map?.image
  return imagen instanceof HTMLCanvasElement ? imagen.getContext('2d') : null
}

/** Un marcador de mapa que apunta hacia abajo, al lote. */
function dibujarPin(sprite: Sprite, colores: ColoresEscena, opacidad: number) {
  const c = contextoDe(sprite)
  if (!c) return
  const l = LADO_TEXTURA
  c.clearRect(0, 0, l, l)
  c.globalAlpha = opacidad
  c.fillStyle = colores.foco
  c.beginPath()
  c.arc(l / 2, l * 0.36, l * 0.28, Math.PI * 0.85, Math.PI * 0.15)
  c.lineTo(l / 2, l)
  c.closePath()
  c.fill()
  c.fillStyle = colores.losa
  c.beginPath()
  c.arc(l / 2, l * 0.36, l * 0.12, 0, Math.PI * 2)
  c.fill()
  c.globalAlpha = 1
  if (sprite.material.map) sprite.material.map.needsUpdate = true
}

/** La letra de la manzana en un círculo, con la tipografía de títulos de la página. */
function dibujarRotulo(sprite: Sprite, manzana: string, colores: ColoresEscena) {
  const c = contextoDe(sprite)
  if (!c) return
  const l = LADO_TEXTURA
  const familia = getComputedStyle(document.documentElement).getPropertyValue('--aybar-family-heading').trim() || 'sans-serif'
  c.clearRect(0, 0, l, l)
  c.fillStyle = colores.losa
  c.strokeStyle = colores.borde
  c.lineWidth = l * 0.05
  c.beginPath()
  c.arc(l / 2, l / 2, l * 0.44, 0, Math.PI * 2)
  c.fill()
  c.stroke()
  c.fillStyle = colores.rotulo
  c.font = `700 ${Math.round(l * 0.5)}px ${familia}`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(manzana, l / 2, l * 0.53)
  if (sprite.material.map) sprite.material.map.needsUpdate = true
}
