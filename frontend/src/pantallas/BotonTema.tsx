import { DropdownMenu, IconButton, useTheme } from '@aybarcorp/ui'
import type { MenuItem } from '@aybarcorp/ui'
import { OPCIONES_TEMA, esPreferenciaTema, etiquetaTema } from '../tema'
import type { PreferenciaTema } from '../tema'

/**
 * El selector de tema: Claro, Oscuro o Según el sistema, como elementos de radio de un
 * Dropdown Menu (el marcado es el elegido). `useTheme` del sistema de diseño lo aplica en
 * `<html data-theme>`, de donde leen todos los tokens, y lo recuerda en este navegador;
 * «Según el sistema» olvida la elección y vuelve a seguir a prefers-color-scheme.
 *
 * El estado es uno por documento (el núcleo de apariencia de @aybarcorp/tokens): todos los
 * selectores de la página —el de la bienvenida, el de la Navbar— dicen siempre lo mismo.
 * Para que al recargar no destelle el tema por defecto, index.html carga
 * /aybar-apariencia.js en el <head>, que aplica lo recordado antes del primer pintado.
 *
 * Solo lo pinta quien es dueño del documento: en un remoto el tema es del shell.
 */
export function BotonTema() {
  const { theme, resolved, setTheme } = useTheme()
  const items: MenuItem[] = OPCIONES_TEMA.map(({ valor, etiqueta }) => ({
    type: 'item',
    role: 'menuitemradio',
    value: valor,
    label: etiqueta,
    checked: theme === valor,
  }))
  return (
    <DropdownMenu
      placement="bottom-end"
      items={items}
      onSelect={(valor) => {
        if (esPreferenciaTema(valor)) setTheme(valor)
      }}
      trigger={
        <IconButton variant="secondary" label={etiquetaTema(theme, resolved)} icon={<IconoTema tema={theme} />} />
      }
    />
  )
}

/** El icono del tema elegido: sol, luna o, siguiendo al sistema, una pantalla. */
function IconoTema({ tema }: { tema: PreferenciaTema }) {
  if (tema === 'light') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }
  if (tema === 'dark') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}
