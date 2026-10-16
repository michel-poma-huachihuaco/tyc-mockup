/**
 * «Copiar configuración» del panel Personalizar, sin Angular ni DOM: la apariencia elegida
 * —los `data-*` que el núcleo de @aybarcorp/tokens pone en `<html>`— como fragmento HTML,
 * para fijarla en src/index.html, y como JSON con los ids del núcleo, para
 * `setPreference` o una configuración propia. Lo prueba `npm test`.
 */

/** Un atributo de `<html>` y el eje del núcleo que lo aplica: `data-palette` → `palette`. */
export interface AtributoApariencia {
  readonly atributo: string;
  readonly eje: string;
  readonly valor: string;
}

const escaparAtributo = (valor: string) =>
  valor.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** `<html lang="es" data-theme="dark" data-palette="oceano">`; sin atributos, `<html lang="es">`. */
export function fragmentoHtml(atributos: readonly AtributoApariencia[]): string {
  const pares = atributos.map(({ atributo, valor }) => ` ${atributo}="${escaparAtributo(valor)}"`).join('');
  return `<html lang="es"${pares}>`;
}

/** `{ "theme": "dark", "palette": "oceano" }`, con dos espacios de sangría. */
export function comoJson(atributos: readonly AtributoApariencia[]): string {
  return JSON.stringify(Object.fromEntries(atributos.map(({ eje, valor }) => [eje, valor])), null, 2);
}

/** Lo que se copia: los dos formatos, cada uno con una línea que dice qué es. */
export function textoParaCopiar(atributos: readonly AtributoApariencia[]): string {
  if (atributos.length === 0) {
    return '<!-- Apariencia por defecto: ningún data-* en <html> -->\n<html lang="es">\n\n{}\n';
  }
  return [
    '<!-- Apariencia elegida en la galería: para fijarla, estos atributos en el <html> de src/index.html -->',
    fragmentoHtml(atributos),
    '',
    '// La misma apariencia con los ejes de @aybarcorp/tokens/apariencia (setPreference)',
    comoJson(atributos),
    '',
  ].join('\n');
}
