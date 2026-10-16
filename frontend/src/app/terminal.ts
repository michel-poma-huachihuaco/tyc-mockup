/**
 * La terminal de la bienvenida, sin DOM ni Angular: se prueba con `npm test` (pruebas/).
 */

/**
 * Un comando partido en piezas que no se cortan por dentro: cada palabra, y una opción
 * `--x` junto con su valor (`--ui react`). En una pantalla estrecha la línea solo se parte
 * entre piezas, nunca a mitad de `--papel` ni entre la opción y su valor.
 */
export function piezasDeComando(comando: string): string[] {
  const piezas: string[] = [];
  for (const palabra of comando.split(/\s+/).filter(Boolean)) {
    const anterior = piezas[piezas.length - 1];
    // Una opción sola (`--ui`) se queda con la palabra que la sigue, si no es otra opción.
    if (anterior?.startsWith('--') && !anterior.includes(' ') && !palabra.startsWith('-')) {
      piezas[piezas.length - 1] = `${anterior} ${palabra}`;
    } else {
      piezas.push(palabra);
    }
  }
  return piezas;
}
