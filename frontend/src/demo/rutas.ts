/**
 * El mapa de la galería de demostración, sin React ni DOM: qué pantalla corresponde a cada
 * ruta de /demo, qué pide (sesión, rol ADMIN), su título, sus migas y las rutas parecidas a
 * una que no existe. Lo prueba `npm test` (pruebas/demo-rutas.test.ts).
 *
 * La galería vive solo en desarrollo y `npm run demo:quitar` la borra entera: nada fuera de
 * src/demo/ importa este módulo.
 */

export const BASE = '/demo'

export const VARIANTES_INGRESO = [
  { id: 'partido', nombre: 'Partido', descripcion: 'El clásico: panel de marca con textura topográfica y el formulario al lado.' },
  { id: 'minimal', nombre: 'Minimal', descripcion: 'Centrado y con mucho aire: solo tipografía.' },
  { id: 'animado', nombre: 'Animado', descripcion: 'Fondo SVG en movimiento con botón de pausa; quieto con movimiento reducido.' },
  { id: 'vidrio', nombre: 'Vidrio', descripcion: 'Tarjeta de vidrio sobre el degradado de la paleta, inclinada hacia el puntero.' },
  { id: 'celular', nombre: 'Celular', descripcion: 'El número de celular y, después, un código de seis dígitos.' },
  { id: 'enlace-magico', nombre: 'Enlace mágico', descripcion: 'Solo el correo; después, «revisa tu correo» con reenvío temporizado.' },
  { id: 'sso', nombre: 'Inicio único', descripcion: 'Google, Microsoft y Apple con glifos neutros, y el correo de siempre.' },
  { id: 'dos-pasos', nombre: 'Dos pasos', descripcion: 'El código de la app autenticadora, o uno de recuperación.' },
  { id: 'registro', nombre: 'Registro', descripcion: 'Alta con contraseña nueva: requisitos, fuerza y términos.' },
  { id: 'recuperar', nombre: 'Recuperar', descripcion: 'Pedir el enlace, confirmarlo y elegir una contraseña nueva, por pasos.' },
  { id: 'bloqueo', nombre: 'Bloqueo', descripcion: 'Cuenta bloqueada con temporizador, o sesión expirada: dos estados.' },
] as const

export type VarianteIngreso = (typeof VARIANTES_INGRESO)[number]['id']

export const SECCIONES_CUENTA = [
  { id: 'perfil', nombre: 'Perfil', descripcion: 'Tu nombre, tu foto y cómo te contactan.' },
  { id: 'preferencias', nombre: 'Preferencias', descripcion: 'Apariencia, idioma y zona horaria.' },
  { id: 'notificaciones', nombre: 'Notificaciones', descripcion: 'Qué avisos te llegan y por qué canal.' },
  { id: 'seguridad', nombre: 'Seguridad', descripcion: 'Contraseña, doble factor y llaves de acceso.' },
  { id: 'sesiones', nombre: 'Sesiones', descripcion: 'Los dispositivos con tu sesión abierta.' },
] as const

export type SeccionCuenta = (typeof SECCIONES_CUENTA)[number]['id']

export const SECCIONES_ADMIN = [
  { id: 'resumen', nombre: 'Resumen', descripcion: 'Cifras de usuarios, lotes y actividad.' },
  { id: 'usuarios', nombre: 'Usuarios', descripcion: 'Alta, búsqueda, filtros y acciones en lote.' },
  { id: 'roles', nombre: 'Roles', descripcion: 'Qué permisos concede cada rol.' },
  { id: 'auditoria', nombre: 'Auditoría', descripcion: 'Quién hizo qué y cuándo.' },
] as const

export type SeccionAdmin = (typeof SECCIONES_ADMIN)[number]['id']

/** Las pantallas de una sola ruta, sin parámetros. */
export const PANTALLAS_SIMPLES = ['personalizacion', 'profundidad', '3d', 'redimensionado', 'accesibilidad', 'filtros'] as const

export type PantallaSimple = (typeof PANTALLAS_SIMPLES)[number]

export type Pantalla =
  | { readonly id: 'portada' }
  | { readonly id: 'vitrina'; readonly familia?: string; readonly componente?: string }
  | { readonly id: 'vitrina-caso'; readonly familia: string; readonly componente: string; readonly caso: number }
  | { readonly id: 'ingreso' }
  | { readonly id: 'ingreso-variante'; readonly variante: VarianteIngreso }
  | { readonly id: 'cuenta'; readonly seccion: SeccionCuenta }
  | { readonly id: 'admin'; readonly seccion: SeccionAdmin }
  | { readonly id: PantallaSimple }
  | { readonly id: 'desconocida'; readonly ruta: string }

/** Un tramo de familia o de componente de la vitrina: minúsculas, cifras y guiones. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const esDe = <T extends string>(lista: readonly { readonly id: T }[], valor: string | undefined): valor is T =>
  valor !== undefined && lista.some((item) => item.id === valor)

/** `true` si la ruta es de la galería: `/demo` o algo bajo `/demo/`, y no `/demonio`. */
export function esRutaDeGaleria(pathname: string): boolean {
  return pathname === BASE || pathname.startsWith(`${BASE}/`)
}

/** Los tramos de la ruta bajo /demo, sin barras sobrantes ni codificación. */
function tramos(pathname: string): string[] | null {
  if (!esRutaDeGaleria(pathname)) return null
  return pathname
    .slice(BASE.length)
    .split('/')
    .filter(Boolean)
    .map((tramo) => {
      try {
        return decodeURIComponent(tramo)
      } catch {
        return tramo
      }
    })
}

/** La pantalla de una ruta. Lo que no existe es `desconocida`, con la ruta tal cual llegó. */
export function resolverRuta(pathname: string): Pantalla {
  const partes = tramos(pathname)
  const desconocida: Pantalla = { id: 'desconocida', ruta: pathname }
  if (!partes) return desconocida
  const [primera, segunda, tercera, cuarta, quinta, ...resto] = partes
  if (primera === undefined) return { id: 'portada' }

  switch (primera) {
    case 'vitrina': {
      if (segunda === undefined) return { id: 'vitrina' }
      if (!SLUG.test(segunda)) return desconocida
      if (tercera === undefined) return { id: 'vitrina', familia: segunda }
      if (!SLUG.test(tercera)) return desconocida
      if (cuarta === undefined) return { id: 'vitrina', familia: segunda, componente: tercera }
      if (cuarta !== 'caso' || quinta === undefined || resto.length > 0 || !/^[1-9]\d{0,3}$/.test(quinta)) return desconocida
      return { id: 'vitrina-caso', familia: segunda, componente: tercera, caso: Number(quinta) }
    }
    case 'ingreso':
      if (tercera !== undefined) return desconocida
      if (segunda === undefined) return { id: 'ingreso' }
      return esDe(VARIANTES_INGRESO, segunda) ? { id: 'ingreso-variante', variante: segunda } : desconocida
    case 'cuenta':
      if (tercera !== undefined) return desconocida
      if (segunda === undefined) return { id: 'cuenta', seccion: 'perfil' }
      return esDe(SECCIONES_CUENTA, segunda) ? { id: 'cuenta', seccion: segunda } : desconocida
    case 'admin':
      if (tercera !== undefined) return desconocida
      if (segunda === undefined) return { id: 'admin', seccion: 'resumen' }
      return esDe(SECCIONES_ADMIN, segunda) ? { id: 'admin', seccion: segunda } : desconocida
    default:
      if (segunda === undefined && (PANTALLAS_SIMPLES as readonly string[]).includes(primera)) {
        return { id: primera as PantallaSimple }
      }
      return desconocida
  }
}

/** La ruta de una pantalla: lo contrario de `resolverRuta`. */
export function rutaDe(pantalla: Pantalla): string {
  switch (pantalla.id) {
    case 'portada':
      return BASE
    case 'vitrina':
      return [`${BASE}/vitrina`, pantalla.familia, pantalla.familia ? pantalla.componente : undefined]
        .filter(Boolean)
        .join('/')
    case 'vitrina-caso':
      return `${BASE}/vitrina/${pantalla.familia}/${pantalla.componente}/caso/${pantalla.caso}`
    case 'ingreso':
      return `${BASE}/ingreso`
    case 'ingreso-variante':
      return `${BASE}/ingreso/${pantalla.variante}`
    case 'cuenta':
      return pantalla.seccion === 'perfil' ? `${BASE}/cuenta` : `${BASE}/cuenta/${pantalla.seccion}`
    case 'admin':
      return pantalla.seccion === 'resumen' ? `${BASE}/admin` : `${BASE}/admin/${pantalla.seccion}`
    case 'desconocida':
      return pantalla.ruta
    default:
      return `${BASE}/${pantalla.id}`
  }
}

/** Las de ingreso son públicas: maquetas de pantallas de acceso, que no inician sesión. */
export function esPublica(pantalla: Pantalla): boolean {
  return pantalla.id === 'ingreso' || pantalla.id === 'ingreso-variante'
}

/** La administración pide el rol ADMIN. */
export function pideAdmin(pantalla: Pantalla): boolean {
  return pantalla.id === 'admin'
}

/** Se pintan sin el marco de la galería: ingreso y un caso a pantalla completa. */
export function esPantallaCompleta(pantalla: Pantalla): boolean {
  return esPublica(pantalla) || pantalla.id === 'vitrina-caso'
}

export type IdIcono = 'portada' | 'vitrina' | 'ingreso' | 'cuenta' | 'admin' | 'personalizacion' | 'profundidad' | '3d' | 'redimensionado' | 'accesibilidad' | 'filtros'

export interface SeccionGaleria {
  readonly id: IdIcono
  readonly nombre: string
  readonly ruta: string
  readonly grupo: 'Explorar' | 'Pantallas' | 'Herramientas'
  readonly descripcion: string
  /** Solo con el rol ADMIN (efectivo: «Ver como» lo puede bajar). */
  readonly soloAdmin?: boolean
}

/** Las secciones de la galería, en el orden de la barra lateral. */
export const SECCIONES: readonly SeccionGaleria[] = [
  { id: 'portada', nombre: 'Portada', ruta: BASE, grupo: 'Explorar', descripcion: 'Qué hay en la galería y cómo se quita.' },
  { id: 'vitrina', nombre: 'Vitrina', ruta: `${BASE}/vitrina`, grupo: 'Explorar', descripcion: 'Cada componente de @aybarcorp/ui con sus casos, su código y sus props.' },
  { id: '3d', nombre: 'Visor 3D', ruta: `${BASE}/3d`, grupo: 'Explorar', descripcion: 'Los lotes de un proyecto en three.js, con alternativa 2D y lista accesible.' },
  { id: 'profundidad', nombre: 'Profundidad', ruta: `${BASE}/profundidad`, grupo: 'Explorar', descripcion: 'Tilt, Parallax y vidrio: cuándo se mueven y cuándo se apagan.' },
  { id: 'redimensionado', nombre: 'Redimensionado', ruta: `${BASE}/redimensionado`, grupo: 'Explorar', descripcion: 'Splitter, container queries y la galería a 390, 768, 1024 y 1440 px.' },
  { id: 'ingreso', nombre: 'Ingreso', ruta: `${BASE}/ingreso`, grupo: 'Pantallas', descripcion: 'Once pantallas de acceso distintas, a pantalla completa.' },
  { id: 'cuenta', nombre: 'Mi cuenta', ruta: `${BASE}/cuenta`, grupo: 'Pantallas', descripcion: 'Perfil, preferencias, notificaciones, seguridad y sesiones.' },
  { id: 'admin', nombre: 'Administración', ruta: `${BASE}/admin`, grupo: 'Pantallas', descripcion: 'Usuarios, roles y auditoría, con datos sintéticos.', soloAdmin: true },
  { id: 'filtros', nombre: 'Filtros de tickets', ruta: `${BASE}/filtros`, grupo: 'Pantallas', descripcion: 'Plantillas de un tablero de tickets con filtros: barra, panel lateral, vistas rápidas y catálogo de controles.' },
  { id: 'personalizacion', nombre: 'Personalización', ruta: `${BASE}/personalizacion`, grupo: 'Herramientas', descripcion: 'Paleta, acento, grises, radio, estilo y profundidad, con vista previa en claro y oscuro.' },
  { id: 'accesibilidad', nombre: 'Accesibilidad', ruta: `${BASE}/accesibilidad`, grupo: 'Herramientas', descripcion: 'Analiza cualquier ruta con axe-core y lista lo que falla.' },
]

/** El nombre de la página, para el Header (su h1 y el título del documento). */
export function tituloDe(pantalla: Pantalla): string {
  switch (pantalla.id) {
    case 'portada':
      return 'Galería de demostración'
    case 'vitrina':
    case 'vitrina-caso':
      return 'Vitrina'
    case 'ingreso':
      return 'Pantallas de ingreso'
    case 'ingreso-variante':
      return `Ingreso · ${VARIANTES_INGRESO.find((v) => v.id === pantalla.variante)?.nombre ?? pantalla.variante}`
    case 'cuenta':
      return 'Mi cuenta'
    case 'admin':
      return 'Administración'
    case 'desconocida':
      return 'Página no encontrada'
    default:
      return SECCIONES.find((s) => s.id === pantalla.id)?.nombre ?? 'Galería'
  }
}

export interface Miga {
  readonly label: string
  readonly href?: string
}

/** Las migas hasta la pantalla; la última es la actual y no lleva enlace. */
export function migasDe(pantalla: Pantalla): Miga[] {
  const galeria: Miga = { label: 'Galería', href: BASE }
  switch (pantalla.id) {
    case 'portada':
      return [{ label: 'Galería' }]
    case 'cuenta':
      return [galeria, { label: 'Mi cuenta', href: `${BASE}/cuenta` }, { label: nombreDe(SECCIONES_CUENTA, pantalla.seccion) }]
    case 'admin':
      return [galeria, { label: 'Administración', href: `${BASE}/admin` }, { label: nombreDe(SECCIONES_ADMIN, pantalla.seccion) }]
    case 'ingreso-variante':
      return [galeria, { label: 'Ingreso', href: `${BASE}/ingreso` }, { label: nombreDe(VARIANTES_INGRESO, pantalla.variante) }]
    default:
      return [galeria, { label: tituloDe(pantalla) }]
  }
}

function nombreDe(lista: readonly { readonly id: string; readonly nombre: string }[], id: string): string {
  return lista.find((item) => item.id === id)?.nombre ?? id
}

/** Todas las rutas fijas de la galería, con su nombre: el destino de las sugerencias y del buscador. */
export function rutasConocidas(): { readonly ruta: string; readonly nombre: string }[] {
  return [
    ...SECCIONES.map((s) => ({ ruta: s.ruta, nombre: s.nombre })),
    ...VARIANTES_INGRESO.map((v) => ({ ruta: `${BASE}/ingreso/${v.id}`, nombre: `Ingreso · ${v.nombre}` })),
    ...SECCIONES_CUENTA.filter((s) => s.id !== 'perfil').map((s) => ({ ruta: `${BASE}/cuenta/${s.id}`, nombre: `Mi cuenta · ${s.nombre}` })),
    ...SECCIONES_ADMIN.filter((s) => s.id !== 'resumen').map((s) => ({ ruta: `${BASE}/admin/${s.id}`, nombre: `Administración · ${s.nombre}` })),
  ]
}

/** Distancia de edición (Levenshtein) entre dos textos cortos. */
export function distancia(a: string, b: string): number {
  if (a === b) return 0
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const actual = [i]
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      actual[j] = Math.min((previa[j] ?? 0) + 1, (actual[j - 1] ?? 0) + 1, (previa[j - 1] ?? 0) + costo)
    }
    previa = actual
  }
  return previa[b.length] ?? 0
}

/**
 * Hasta tres rutas de la galería parecidas a una que no existe, de la más a la menos
 * parecida. Se compara cada tramo de la ruta pedida con los de cada ruta conocida, sin
 * mayúsculas ni tildes; si ninguna se parece lo bastante, la lista sale vacía (un 404 sin
 * sugerencias es mejor que uno con sugerencias al azar).
 */
export function sugerencias(ruta: string, maximo = 3): { label: string; href: string }[] {
  const limpiar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
  const pedidos = limpiar(ruta.replace(/^\/demo\/?/, '')).split('/').filter(Boolean)
  if (pedidos.length === 0) return []
  const puntuadas = rutasConocidas().map(({ ruta: destino, nombre }) => {
    const propios = destino.replace(/^\/demo\/?/, '').split('/').filter(Boolean)
    // Cada tramo pedido contra el tramo conocido más parecido: 1 es idéntico, 0 nada en común.
    const parecidos = pedidos.map((pedido) =>
      Math.max(
        0,
        ...propios.map((propio) => {
          if (propio.startsWith(pedido) || pedido.startsWith(propio)) return 0.9
          return 1 - distancia(pedido, propio) / Math.max(pedido.length, propio.length)
        }),
      ),
    )
    const media = parecidos.reduce((suma, p) => suma + p, 0) / parecidos.length
    // Una ruta conocida con más tramos que la pedida se parece un poco menos.
    const penal = Math.max(0, propios.length - pedidos.length) * 0.1
    return { label: nombre, href: destino, parecido: media - penal }
  })
  return puntuadas
    .filter((p) => p.parecido >= 0.55)
    .sort((a, b) => b.parecido - a.parecido || a.href.length - b.href.length)
    .slice(0, maximo)
    .map(({ label, href }) => ({ label, href }))
}
