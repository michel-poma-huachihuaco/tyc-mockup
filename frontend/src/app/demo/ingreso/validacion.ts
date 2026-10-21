/**
 * La validación de las maquetas de ingreso, sin Angular: lo que se dice bajo cada campo al
 * enviar. Son maquetas —ninguna inicia sesión—, pero validan de verdad: un campo vacío o
 * un formato que no es se dicen en el campo. Lo prueba `npm test`.
 */

export function errorDeCorreo(valor: string): string | undefined {
  const correo = valor.trim();
  if (!correo) return 'Escribe tu correo.';
  // Lo justo para un formulario: algo, una arroba, algo, un punto y algo. El servidor manda.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Escribe un correo completo, por ejemplo nombre@ejemplo.test.';
  return undefined;
}

export function errorDeClave(valor: string): string | undefined {
  return valor ? undefined : 'Escribe tu contraseña.';
}

/** Un celular del Perú: nueve cifras que empiezan por 9 (los espacios no cuentan). */
export function errorDeCelular(valor: string): string | undefined {
  const cifras = valor.replace(/\D/g, '');
  if (!cifras) return 'Escribe tu número de celular.';
  if (!/^9\d{8}$/.test(cifras)) return 'Un celular tiene nueve cifras y empieza por 9.';
  return undefined;
}

export function errorDeCodigo(valor: string, longitud = 6): string | undefined {
  if (!valor) return 'Escribe el código.';
  if (valor.length < longitud) return `El código tiene ${longitud} cifras.`;
  return undefined;
}

/** Los códigos de recuperación de la maqueta: DEMO-XXXX-XXXX (cuenta.ts). */
export function errorDeCodigoRecuperacion(valor: string): string | undefined {
  const codigo = valor.trim().toUpperCase();
  if (!codigo) return 'Escribe uno de tus códigos de recuperación.';
  if (!/^DEMO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) return 'Los códigos tienen la forma DEMO-XXXX-XXXX.';
  return undefined;
}

export function errorDeNombre(valor: string): string | undefined {
  return valor.trim().length >= 2 ? undefined : 'Escribe tu nombre.';
}

export interface Requisito {
  readonly etiqueta: string;
  readonly cumplido: boolean;
}

/** Lo que pide una contraseña nueva, con lo que ya cumple: se ve antes de escribir. */
export function requisitosDeClave(valor: string): Requisito[] {
  return [
    { etiqueta: 'Al menos 12 caracteres', cumplido: valor.length >= 12 },
    { etiqueta: 'Una mayúscula y una minúscula', cumplido: /[a-zñ]/.test(valor) && /[A-ZÑ]/.test(valor) },
    { etiqueta: 'Un número', cumplido: /\d/.test(valor) },
    { etiqueta: 'Un símbolo, como ! o #', cumplido: /[^A-Za-zÑñ0-9\s]/.test(valor) },
  ];
}

export interface Fortaleza {
  readonly puntos: 0 | 1 | 2 | 3 | 4;
  readonly etiqueta: string;
}

const NOMBRES_FORTALEZA = ['muy débil', 'débil', 'aceptable', 'buena', 'fuerte'] as const;

/**
 * Una estimación sencilla: un punto por requisito cumplido, y nunca «fuerte» por debajo
 * de 16 caracteres. Siempre con texto («débil», «fuerte»): el color solo no basta.
 */
export function fortalezaDeClave(valor: string): Fortaleza {
  if (!valor) return { puntos: 0, etiqueta: 'sin contraseña' };
  let puntos = requisitosDeClave(valor).filter((r) => r.cumplido).length;
  if (puntos === 4 && valor.length < 16) puntos = 3;
  const acotados = Math.max(0, Math.min(4, puntos)) as Fortaleza['puntos'];
  // Password Input antepone «Fortaleza:»; la etiqueta es solo el nivel.
  return { puntos: acotados, etiqueta: NOMBRES_FORTALEZA[acotados] };
}

export function errorDeClaveNueva(valor: string): string | undefined {
  if (!valor) return 'Elige una contraseña.';
  return requisitosDeClave(valor).every((r) => r.cumplido) ? undefined : 'La contraseña todavía no cumple todos los requisitos.';
}

export function errorDeConfirmacion(clave: string, confirmacion: string): string | undefined {
  if (!confirmacion) return 'Repite la contraseña.';
  return clave === confirmacion ? undefined : 'Las dos contraseñas no coinciden.';
}

/** `mm:ss` de una cuenta atrás en segundos: 905 → «15:05». */
export function minutosYSegundos(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
