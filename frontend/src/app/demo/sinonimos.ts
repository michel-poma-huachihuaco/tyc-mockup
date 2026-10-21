/**
 * Sinónimos en español de la búsqueda global y de la vitrina, sin Angular: quien busca
 * «tabla» encuentra Data Grid y Table; «ventana», Modal y Dialog; «contraseña», Password
 * Input. Lo prueba `npm test` (pruebas/demo-busqueda.test.ts).
 *
 * Cada grupo es una familia de palabras equivalentes, ya normalizadas (minúsculas, sin
 * tildes): lo que se escribe se compara normalizado.
 */
export const SINONIMOS: readonly (readonly string[])[] = [
  ['tabla', 'table', 'data grid', 'datagrid', 'grilla', 'cuadricula'],
  ['ventana', 'modal', 'dialog', 'dialogo', 'confirmation dialog', 'confirmacion'],
  ['aviso', 'alerta', 'alert', 'toast', 'banner', 'snackbar', 'notificacion', 'notification'],
  ['menu', 'dropdown menu', 'navigation menu', 'context menu', 'menu contextual'],
  ['fecha', 'date picker', 'calendar', 'calendario', 'date range picker', 'rango de fechas', 'date time picker'],
  ['subir', 'file upload', 'dropzone', 'archivo', 'adjuntar'],
  ['cargando', 'spinner', 'skeleton', 'progress bar', 'progreso', 'loading overlay', 'carga'],
  ['contrasena', 'password input', 'password', 'clave'],
  ['3d', 'visor', 'tres dimensiones', 'three'],
  ['tema', 'paleta', 'colores', 'personalizacion', 'apariencia', 'appearance panel', 'modo oscuro'],
  ['boton', 'button', 'icon button', 'fab', 'split button'],
  ['tarjeta', 'card'],
  ['pestanas', 'pestana', 'tabs'],
  ['arbol', 'tree view', 'jerarquia'],
  ['linea de tiempo', 'timeline', 'historial'],
  ['buscador', 'search input', 'command palette', 'busqueda', 'buscar'],
  ['formulario', 'form', 'form field', 'campo'],
  ['panel lateral', 'side panel', 'drawer', 'cajon'],
  ['divisor', 'splitter', 'redimensionado'],
  ['ingreso', 'login', 'login form', 'acceso', 'iniciar sesion'],
  ['error', 'error page', 'no encontrada', 'pagina de error'],
  ['casilla', 'checkbox', 'switch', 'interruptor'],
  ['desplegable', 'select', 'combobox', 'autocomplete'],
  ['codigo', 'otp input', 'otp', 'verificacion'],
  ['etiqueta', 'badge', 'chip', 'tag'],
  ['migas', 'breadcrumb', 'migas de pan'],
  ['paginacion', 'pagination'],
  ['profundidad', 'tilt', 'parallax', 'vidrio', 'glass'],
  ['usuario', 'perfil', 'cuenta', 'avatar'],
];

/** Minúsculas, sin tildes ni signos y con los espacios colapsados: «Contraseña» → «contrasena». */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const MAXIMO_ALTERNATIVAS = 16;

/**
 * La consulta y sus alternativas, normalizadas: cada palabra o frase de un grupo que
 * aparece entera en la consulta se cambia por las demás del grupo («tabla usuarios» →
 * «data grid usuarios», «table usuarios»…). Una sola palabra a medio escribir, de cuatro
 * letras o más, también se completa con su grupo: «contra» encuentra Password Input.
 * La consulta va siempre primera; sin consulta, ninguna alternativa.
 */
export function alternativas(consulta: string): string[] {
  const q = normalizar(consulta);
  if (!q) return [];
  const resultado = new Set<string>([q]);
  const rodeada = ` ${q} `;
  for (const grupo of SINONIMOS) {
    for (const palabra of grupo) {
      const entera = rodeada.includes(` ${palabra} `);
      const aMedias = !entera && !q.includes(' ') && q.length >= 4 && palabra.startsWith(q);
      if (!entera && !aMedias) continue;
      for (const otra of grupo) {
        if (otra === palabra) continue;
        resultado.add(entera ? rodeada.replace(` ${palabra} `, ` ${otra} `).trim() : otra);
      }
    }
  }
  return [...resultado].slice(0, MAXIMO_ALTERNATIVAS);
}
