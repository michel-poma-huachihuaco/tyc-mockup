/**
 * Las opciones del selector de tema y su nombre accesible, sin React: los prueba `npm test`.
 *
 * El tema es una preferencia del documento que guarda el núcleo de apariencia de
 * @aybarcorp/tokens (lo usa `useTheme` de @aybarcorp/ui): «Claro» y «Oscuro» se recuerdan en
 * este navegador, y «Según el sistema» olvida la elección y vuelve a seguir a
 * prefers-color-scheme.
 */
export const OPCIONES_TEMA = [
  { valor: 'light', etiqueta: 'Claro' },
  { valor: 'dark', etiqueta: 'Oscuro' },
  { valor: 'system', etiqueta: 'Según el sistema' },
] as const

/** Lo que se elige: claro, oscuro o seguir al sistema. */
export type PreferenciaTema = (typeof OPCIONES_TEMA)[number]['valor']

/** Lo que se ve, con «system» ya resuelto. */
export type TemaVisto = 'light' | 'dark'

/** `true` si `valor` es una de las tres opciones (lo que devuelve el menú es un string). */
export function esPreferenciaTema(valor: string): valor is PreferenciaTema {
  return OPCIONES_TEMA.some((opcion) => opcion.valor === valor)
}

/**
 * El nombre del botón que abre el selector: el tema elegido y, si sigue al sistema, el que
 * se ve ahora. Lo anuncia el lector de pantalla y lo muestra el tooltip del Icon Button.
 */
export function etiquetaTema(elegido: PreferenciaTema, visto: TemaVisto): string {
  const nombre = (tema: TemaVisto) => (tema === 'dark' ? 'oscuro' : 'claro')
  return elegido === 'system' ? `Tema: según el sistema (${nombre(visto)})` : `Tema: ${nombre(elegido)}`
}
