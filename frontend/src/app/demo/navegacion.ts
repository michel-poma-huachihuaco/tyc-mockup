/**
 * El mapa de la galería de demostración, sin Angular ni DOM: las secciones, las once
 * variantes de ingreso y la resolución de una URL de /demo en su pantalla, sus migas de pan
 * y su título. De aquí salen la Sidebar, la portada, la búsqueda, las migas y las
 * sugerencias del 404. Lo prueba `npm test` (pruebas/demo-navegacion.test.ts).
 *
 * El Router de Angular (src/app/demo/rutas.ts) declara las mismas rutas: si sumas una
 * pantalla, súmala en los dos sitios.
 */

/** Prefijo de todas las rutas de la galería. */
export const RAIZ_GALERIA = '/demo';

export type GrupoSeccion = 'Galería' | 'Pantallas' | 'Experiencia' | 'Calidad';

export const GRUPOS_SECCION: readonly GrupoSeccion[] = ['Galería', 'Pantallas', 'Experiencia', 'Calidad'];

/** Una subsección con su segmento de URL: `/demo/cuenta/seguridad`. */
export interface Subseccion {
  readonly id: string;
  readonly titulo: string;
  readonly resumen: string;
}

export interface Seccion {
  /** Segmento de URL tras /demo; vacío en la portada. */
  readonly id: string;
  readonly ruta: string;
  readonly titulo: string;
  /** Una línea: lo que se ve al entrar. */
  readonly resumen: string;
  readonly grupo: GrupoSeccion;
  /** Sin sesión también se ve: son maquetas, no inician sesión. */
  readonly publica: boolean;
  /** Solo con el rol ADMIN (y «Ver como» en Administración). */
  readonly soloAdmin: boolean;
  /** A pantalla completa, sin el marco de la galería. */
  readonly sinMarco: boolean;
  readonly subsecciones: readonly Subseccion[];
  /** Más palabras para la búsqueda global. */
  readonly palabras: readonly string[];
}

export const SUBSECCIONES_CUENTA: readonly Subseccion[] = [
  { id: 'perfil', titulo: 'Perfil', resumen: 'Foto, nombre y datos de contacto, con validación.' },
  { id: 'preferencias', titulo: 'Preferencias', resumen: 'Apariencia, idioma y zona horaria.' },
  { id: 'notificaciones', titulo: 'Notificaciones', resumen: 'Qué avisos llegan y por qué canal.' },
  { id: 'seguridad', titulo: 'Seguridad', resumen: 'Contraseña, verificación en dos pasos y llaves de acceso.' },
  { id: 'sesiones', titulo: 'Sesiones', resumen: 'Los dispositivos con la sesión abierta.' },
];

export const SUBSECCIONES_ADMIN: readonly Subseccion[] = [
  { id: 'resumen', titulo: 'Resumen', resumen: 'Indicadores de personas, lotes y actividad.' },
  { id: 'usuarios', titulo: 'Usuarios', resumen: 'Tabla de datos con filtros, acciones en lote y alta.' },
  { id: 'roles', titulo: 'Roles', resumen: 'Permisos de cada rol por módulo.' },
  { id: 'auditoria', titulo: 'Auditoría', resumen: 'Línea de tiempo de eventos con filtros.' },
];

function seccion(
  id: string,
  titulo: string,
  resumen: string,
  grupo: GrupoSeccion,
  extra: Partial<Pick<Seccion, 'publica' | 'soloAdmin' | 'sinMarco' | 'subsecciones' | 'palabras'>> = {},
): Seccion {
  return {
    id,
    ruta: id ? `${RAIZ_GALERIA}/${id}` : RAIZ_GALERIA,
    titulo,
    resumen,
    grupo,
    publica: extra.publica ?? false,
    soloAdmin: extra.soloAdmin ?? false,
    sinMarco: extra.sinMarco ?? false,
    subsecciones: extra.subsecciones ?? [],
    palabras: extra.palabras ?? [],
  };
}

/** Las secciones en el orden de la Sidebar. */
export const SECCIONES: readonly Seccion[] = [
  seccion('', 'Portada', 'El recorrido por todo lo que trae el sistema de diseño.', 'Galería', {
    palabras: ['inicio', 'galeria', 'demo'],
  }),
  seccion('vitrina', 'Vitrina', 'Cada componente con sus casos, su código y sus entradas.', 'Galería', {
    palabras: ['componentes', 'catalogo', 'documentacion'],
  }),
  seccion('ingreso', 'Ingreso', 'Once pantallas de acceso, distintas entre sí.', 'Pantallas', {
    publica: true,
    sinMarco: true,
    palabras: ['login', 'acceso', 'iniciar sesion', 'entrar'],
  }),
  seccion('cuenta', 'Cuenta', 'El panel del usuario: perfil, preferencias, avisos, seguridad y sesiones.', 'Pantallas', {
    subsecciones: SUBSECCIONES_CUENTA,
    palabras: ['usuario', 'perfil', 'mi cuenta'],
  }),
  seccion('admin', 'Administración', 'Usuarios, roles y auditoría. Solo con el rol ADMIN.', 'Pantallas', {
    soloAdmin: true,
    subsecciones: SUBSECCIONES_ADMIN,
    palabras: ['admin', 'gestion', 'backoffice'],
  }),
  seccion('personalizacion', 'Personalización', 'Paleta, acento, grises, radio, tipografía, profundidad y estilo.', 'Experiencia', {
    palabras: ['tema', 'paleta', 'colores', 'apariencia', 'modo oscuro'],
  }),
  seccion('profundidad', 'Profundidad', 'Inclinación, paralaje y vidrio que siguen al puntero.', 'Experiencia', {
    palabras: ['tilt', 'parallax', 'glass', 'vidrio'],
  }),
  seccion('3d', 'Visor 3D', 'Los lotes de un proyecto en 3D con three.js, y su plano en 2D.', 'Experiencia', {
    palabras: ['tres dimensiones', 'lotes', 'plano', 'mapa', 'three'],
  }),
  seccion('redimensionado', 'Redimensionado', 'Splitter, container queries y la galería a varios anchos.', 'Experiencia', {
    palabras: ['splitter', 'responsive', 'container queries', 'anchos'],
  }),
  seccion('accesibilidad', 'Accesibilidad', 'Analiza cualquier pantalla de la galería con axe-core.', 'Calidad', {
    palabras: ['axe', 'a11y', 'wcag', 'contraste'],
  }),
];

/** Una variante de la pantalla de ingreso. */
export interface VarianteIngreso {
  readonly id: string;
  readonly titulo: string;
  readonly resumen: string;
}

/** Las once variantes, en el orden del índice y de «anterior / siguiente». */
export const VARIANTES_INGRESO: readonly VarianteIngreso[] = [
  { id: 'partido', titulo: 'Partido', resumen: 'Panel de marca con textura topográfica y el formulario al lado.' },
  { id: 'minimal', titulo: 'Minimal', resumen: 'Centrado, con mucho aire y solo tipografía.' },
  { id: 'animado', titulo: 'Animado', resumen: 'Fondo SVG en movimiento, con un botón para pausarlo.' },
  { id: 'vidrio', titulo: 'Vidrio', resumen: 'Tarjeta de vidrio sobre un degradado de la paleta, que se inclina.' },
  { id: 'celular', titulo: 'Celular', resumen: 'El número de celular y después un código de seis dígitos.' },
  { id: 'enlace-magico', titulo: 'Enlace mágico', resumen: 'Solo el correo: el acceso llega en un enlace.' },
  { id: 'sso', titulo: 'Inicio único', resumen: 'Google, Microsoft y Apple, y el correo como alternativa.' },
  { id: 'dos-pasos', titulo: 'Dos pasos', resumen: 'El código de la app autenticadora o uno de recuperación.' },
  { id: 'registro', titulo: 'Registro', resumen: 'Alta con los requisitos y la fuerza de la contraseña.' },
  { id: 'recuperar', titulo: 'Recuperar', resumen: 'Pedir el enlace, confirmarlo y elegir una contraseña nueva.' },
  { id: 'bloqueo', titulo: 'Bloqueo', resumen: 'Cuenta bloqueada con temporizador y sesión expirada.' },
];

export function varianteIngreso(id: string): VarianteIngreso | undefined {
  return VARIANTES_INGRESO.find((v) => v.id === id);
}

/** La variante anterior y la siguiente, en círculo: la barra flotante recorre las once. */
export function vecinasDe(id: string): { anterior: VarianteIngreso; siguiente: VarianteIngreso } | null {
  const i = VARIANTES_INGRESO.findIndex((v) => v.id === id);
  if (i < 0) return null;
  const n = VARIANTES_INGRESO.length;
  return {
    anterior: VARIANTES_INGRESO[(i - 1 + n) % n] as VarianteIngreso,
    siguiente: VARIANTES_INGRESO[(i + 1) % n] as VarianteIngreso,
  };
}

export type Pantalla =
  | 'portada'
  | 'vitrina'
  | 'caso'
  | 'ingreso'
  | 'ingreso-variante'
  | 'cuenta'
  | 'admin'
  | 'personalizacion'
  | 'profundidad'
  | '3d'
  | 'redimensionado'
  | 'accesibilidad'
  | 'desconocida';

/** Un paso de las migas de pan; el último no lleva ruta (es la página actual). */
export interface Miga {
  readonly etiqueta: string;
  readonly ruta?: string;
}

export interface Resolucion {
  readonly pantalla: Pantalla;
  /** `familia`, `componente`, `n`, `variante`, `seccion`, según la pantalla. */
  readonly parametros: Readonly<Record<string, string>>;
  readonly publica: boolean;
  readonly soloAdmin: boolean;
  readonly sinMarco: boolean;
  readonly titulo: string;
  readonly migas: readonly Miga[];
}

/** Nombres visibles del catálogo de la vitrina, si quien resuelve los conoce. */
export interface NombresCatalogo {
  familia?(id: string): string | undefined;
  componente?(familia: string, slug: string): string | undefined;
}

/** La ruta sin consulta, sin fragmento y sin barra final: `/demo/3d?embebido=1` → `/demo/3d`. */
export function rutaLimpia(url: string): string {
  const sinExtra = url.split(/[?#]/, 1)[0] ?? '';
  const limpia = sinExtra.replace(/\/+$/, '');
  return limpia || '/';
}

/** `true` si la URL pide la vista embebida (`?embebido=1`): sin el marco de la galería. */
export function esEmbebida(url: string): boolean {
  const consulta = url.split('#', 1)[0]?.split('?')[1];
  return consulta ? new URLSearchParams(consulta).get('embebido') === '1' : false;
}

/** `true` si la ruta está dentro de la galería. */
export function esRutaDeGaleria(url: string): boolean {
  const ruta = rutaLimpia(url);
  return ruta === RAIZ_GALERIA || ruta.startsWith(`${RAIZ_GALERIA}/`);
}

const PORTADA = SECCIONES[0] as Seccion;
const porId = (id: string): Seccion => SECCIONES.find((s) => s.id === id) as Seccion;

/**
 * La pantalla de una URL de /demo, con sus parámetros, sus migas y su título. Lo que no
 * existe —una sección, una subsección o una variante desconocidas, un caso que no es un
 * número— es `desconocida`, y el 404 de la galería sugiere las rutas que más se parecen.
 */
export function resolverRuta(url: string, nombres: NombresCatalogo = {}): Resolucion {
  const ruta = rutaLimpia(url);
  if (!esRutaDeGaleria(ruta)) return desconocida(ruta);
  const partes = ruta.slice(RAIZ_GALERIA.length).split('/').filter(Boolean).map(decodificar);
  const [primero, ...resto] = partes;
  const inicio: Miga = { etiqueta: 'Galería', ruta: RAIZ_GALERIA };

  if (primero === undefined) {
    return resultado('portada', PORTADA, {}, PORTADA.titulo, [{ etiqueta: 'Galería' }]);
  }
  const seccionActual = SECCIONES.find((s) => s.id === primero);
  if (!seccionActual) return desconocida(ruta);

  switch (seccionActual.id) {
    case 'vitrina': {
      const [familia, componente, caso, n, ...sobra] = resto;
      const migaVitrina: Miga = { etiqueta: 'Vitrina', ruta: seccionActual.ruta };
      if (familia === undefined) return resultado('vitrina', seccionActual, {}, 'Vitrina', [inicio, { etiqueta: 'Vitrina' }]);
      const nombreFamilia = nombres.familia?.(familia) ?? familia;
      const rutaFamilia = `${seccionActual.ruta}/${familia}`;
      if (componente === undefined) {
        return resultado('vitrina', seccionActual, { familia }, nombreFamilia, [inicio, migaVitrina, { etiqueta: nombreFamilia }]);
      }
      const nombreComponente = nombres.componente?.(familia, componente) ?? componente;
      const migasComponente: Miga[] = [inicio, migaVitrina, { etiqueta: nombreFamilia, ruta: rutaFamilia }];
      if (caso === undefined) {
        return resultado('vitrina', seccionActual, { familia, componente }, nombreComponente, [
          ...migasComponente,
          { etiqueta: nombreComponente },
        ]);
      }
      if (caso !== 'caso' || n === undefined || !/^[1-9]\d*$/.test(n) || sobra.length > 0) return desconocida(ruta);
      return {
        ...resultado('caso', seccionActual, { familia, componente, n }, `${nombreComponente} · caso ${n}`, [
          ...migasComponente,
          { etiqueta: nombreComponente, ruta: `${rutaFamilia}/${componente}` },
          { etiqueta: `Caso ${n}` },
        ]),
        sinMarco: true,
      };
    }
    case 'ingreso': {
      const [variante, ...sobra] = resto;
      if (variante === undefined) return resultado('ingreso', seccionActual, {}, 'Ingreso', [inicio, { etiqueta: 'Ingreso' }]);
      const encontrada = varianteIngreso(variante);
      if (!encontrada || sobra.length > 0) return desconocida(ruta);
      return resultado('ingreso-variante', seccionActual, { variante }, `Ingreso · ${encontrada.titulo}`, [
        inicio,
        { etiqueta: 'Ingreso', ruta: seccionActual.ruta },
        { etiqueta: encontrada.titulo },
      ]);
    }
    case 'cuenta':
    case 'admin': {
      const [id, ...sobra] = resto;
      const sub = id === undefined ? seccionActual.subsecciones[0] : seccionActual.subsecciones.find((s) => s.id === id);
      if (!sub || sobra.length > 0) return desconocida(ruta);
      return resultado(seccionActual.id as Pantalla, seccionActual, { seccion: sub.id }, `${seccionActual.titulo} · ${sub.titulo}`, [
        inicio,
        { etiqueta: seccionActual.titulo, ruta: seccionActual.ruta },
        { etiqueta: sub.titulo },
      ]);
    }
    default: {
      if (resto.length > 0) return desconocida(ruta);
      return resultado(seccionActual.id as Pantalla, seccionActual, {}, seccionActual.titulo, [
        inicio,
        { etiqueta: seccionActual.titulo },
      ]);
    }
  }
}

function resultado(
  pantalla: Pantalla,
  origen: Seccion,
  parametros: Record<string, string>,
  titulo: string,
  migas: readonly Miga[],
): Resolucion {
  return {
    pantalla,
    parametros,
    publica: origen.publica,
    soloAdmin: origen.soloAdmin,
    sinMarco: origen.sinMarco,
    titulo,
    migas,
  };
}

function desconocida(ruta: string): Resolucion {
  return {
    pantalla: 'desconocida',
    parametros: { ruta },
    publica: false,
    soloAdmin: false,
    sinMarco: false,
    titulo: 'Página no encontrada',
    migas: [{ etiqueta: 'Galería', ruta: RAIZ_GALERIA }, { etiqueta: 'No encontrada' }],
  };
}

function decodificar(segmento: string): string {
  try {
    return decodeURIComponent(segmento);
  } catch {
    return segmento;
  }
}

/** Un destino que se puede sugerir: todas las pantallas que existen. */
export interface Destino {
  readonly ruta: string;
  readonly etiqueta: string;
}

/** Cada pantalla de la galería con su nombre, en orden: secciones, subsecciones y variantes. */
export function destinosDeGaleria(): Destino[] {
  const destinos: Destino[] = [];
  for (const s of SECCIONES) {
    destinos.push({ ruta: s.ruta, etiqueta: s.id ? s.titulo : 'Portada de la galería' });
    for (const sub of s.subsecciones) destinos.push({ ruta: `${s.ruta}/${sub.id}`, etiqueta: `${s.titulo} · ${sub.titulo}` });
  }
  for (const v of VARIANTES_INGRESO) destinos.push({ ruta: `${porId('ingreso').ruta}/${v.id}`, etiqueta: `Ingreso · ${v.titulo}` });
  return destinos;
}

/**
 * Las rutas de la galería que más se parecen a una que no existe, para el 404: por la
 * distancia de edición entre segmentos (`/demo/cuneta` → Cuenta), y antes que nada las que
 * contienen lo escrito o empiezan por ello (`/demo/admin/usu` → Usuarios).
 */
export function sugerencias(url: string, cuantas = 3): Destino[] {
  const ruta = rutaLimpia(url).toLowerCase();
  const pedidas = ruta.slice(RAIZ_GALERIA.length).split('/').filter(Boolean);
  if (pedidas.length === 0) return [];
  const puntuadas = destinosDeGaleria()
    .filter((d) => d.ruta !== RAIZ_GALERIA)
    .map((d, orden) => {
      const segmentos = d.ruta.slice(RAIZ_GALERIA.length).split('/').filter(Boolean);
      let puntos = 0;
      pedidas.forEach((pedido, i) => {
        const propio = segmentos[i];
        if (propio === undefined) {
          puntos += pedido.length;
          return;
        }
        if (propio === pedido) return;
        if (propio.startsWith(pedido) || pedido.startsWith(propio)) puntos += 0.5;
        else puntos += Math.min(distancia(pedido, propio), Math.max(pedido.length, propio.length));
      });
      // Un destino más profundo que lo pedido cuesta un poco: /demo/cuenta antes que /demo/cuenta/perfil.
      puntos += Math.max(0, segmentos.length - pedidas.length) * 0.75;
      return { destino: d, puntos, orden };
    })
    .sort((a, b) => a.puntos - b.puntos || a.orden - b.orden);
  return puntuadas.slice(0, cuantas).map((p) => p.destino);
}

/** Distancia de Levenshtein, con dos filas. */
export function distancia(a: string, b: string): number {
  if (a === b) return 0;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    for (let j = 1; j <= b.length; j++) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      actual[j] = Math.min((previa[j] ?? 0) + 1, (actual[j - 1] ?? 0) + 1, (previa[j - 1] ?? 0) + coste);
    }
    previa = actual;
  }
  return previa[b.length] ?? 0;
}
