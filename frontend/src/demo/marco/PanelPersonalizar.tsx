import { APPEARANCE, AppearancePanel, Button, SidePanel } from '@aybarcorp/ui'
import { useEffect, useRef } from 'react'
import { configuracionDe } from '../apariencia'
import { useGaleria } from '../contexto'
import { copiar } from '../utiles'

/** Los ejes con su atributo de `<html>`, en el orden de @aybarcorp/tokens. */
export const EJES = Object.entries(APPEARANCE.axes).map(([id, eje]) => ({ id, attribute: eje.attribute }))

/** Lo que `<html>` declara ahora, como fragmento HTML y como JSON. */
export function configuracionActual() {
  const raiz = document.documentElement
  const atributos = Object.fromEntries(Array.from(raiz.attributes, (a) => [a.name, a.value]))
  return configuracionDe(atributos, EJES)
}

/**
 * El panel «Personalizar» del marco: un Side Panel redimensionable con el Appearance Panel
 * del framework (paleta, acento, grises, radio, tipografía, densidad, profundidad, estilo y
 * tema, más las combinaciones de la marca y «Restablecer»). Sigue abierto al navegar: vive
 * en el marco, no en la pantalla. Por debajo de lg el Side Panel pasa a Drawer modal.
 *
 * Al abrirse lleva el foco a su primer control; la X y Escape lo devuelven a «Personalizar».
 */
export function PanelPersonalizar({ id }: { id: string }) {
  const galeria = useGaleria()
  const panel = useRef<HTMLElement>(null)
  const abierto = galeria.personalizar
  const disparador = useRef<Element | null>(null)

  useEffect(() => {
    if (!abierto) return
    disparador.current = document.activeElement
    const marco = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLElement>('.ay-appearance input, .ay-appearance button, .ay-appearance [tabindex="0"]')?.focus()
    })
    return () => cancelAnimationFrame(marco)
  }, [abierto])

  return (
    <SidePanel
      ref={panel}
      id={id}
      open={abierto}
      onOpenChange={(valor) => {
        galeria.abrirPersonalizar(valor)
        if (!valor && disparador.current instanceof HTMLElement && disparador.current.isConnected) {
          const volver = disparador.current
          requestAnimationFrame(() => volver.focus())
        }
      }}
      side="end"
      size="sm"
      resizable
      title="Personalizar"
      footer={
        <div className="gl-panel__pie">
          <Button variant="secondary" size="sm" onClick={() => void copiar(configuracionActual().html, 'Fragmento HTML')}>
            Copiar como HTML
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void copiar(configuracionActual().json, 'JSON')}>
            Copiar como JSON
          </Button>
        </div>
      }
    >
      <div className="gl-panel">
        <p className="gl-panel__nota">
          Se aplica en <code>&lt;html&gt;</code>, se recuerda en este navegador y llega a las demás pestañas. «Copiar
          configuración» lleva lo elegido a tu <code>index.html</code> o a <code>setPreference</code>.
        </p>
        <AppearancePanel headingLevel={3} title="Apariencia" />
      </div>
    </SidePanel>
  )
}
