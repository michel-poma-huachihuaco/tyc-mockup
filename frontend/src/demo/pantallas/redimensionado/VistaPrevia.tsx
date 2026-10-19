import { FormField, SegmentedControl, Select } from '@aybarcorp/ui'
import type { CSSProperties } from 'react'
import { useRef, useState } from 'react'
import { useGaleria } from '../../contexto'
import { BASE, SECCIONES } from '../../rutas'
import { useAnchoDe } from './medir'
import { ANCHOS, anchoVista, describirEscala, escalaParaCaber, rutaEmbebida } from './modelo'
import './vista-previa.css'

/**
 * Una pantalla de la galería en un iframe del propio sitio (`?embebido=1`, sin el marco), al
 * ancho de un celular, una tableta, un portátil o un escritorio, reducida para caber. Los
 * breakpoints y las container queries de dentro ven el ancho del iframe, no el de esta
 * ventana. Redimensionado no se ofrece: se mostraría a sí misma dentro de sí misma.
 */
export function VistaPrevia() {
  const galeria = useGaleria()
  const [ancho, setAncho] = useState<number>(ANCHOS[3].ancho)
  const [ruta, setRuta] = useState(BASE)
  const lienzo = useRef<HTMLDivElement>(null)
  const disponible = useAnchoDe(lienzo)

  const rutas = SECCIONES.filter((s) => s.id !== 'redimensionado' && (galeria.admin || !s.soloAdmin))
  const vista = anchoVista(ancho)
  const escala = escalaParaCaber(vista.ancho, disponible)
  const nombre = rutas.find((s) => s.ruta === ruta)?.nombre ?? 'Galería'
  // Dentro de su propio iframe (alguien navegó hasta aquí) no se anida otra vez.
  const anidada = window.self !== window.top

  return (
    <div className="gl-vista-previa">
      <div className="gl-vista__controles">
        <SegmentedControl
          label="Ancho de la vista previa"
          options={ANCHOS.map((a) => ({ value: String(a.ancho), label: `${a.ancho} px` }))}
          value={String(vista.ancho)}
          onValueChange={(valor) => setAncho(Number(valor))}
        />
        <div className="gl-vista__campo">
          <FormField label="Pantalla">
            <Select value={ruta} onChange={(e) => setRuta(e.target.value)} options={rutas.map((s) => ({ value: s.ruta, label: s.nombre }))} />
          </FormField>
        </div>
        <p className="gl-vista__escala">
          {vista.nombre} · {describirEscala(vista, escala)}
        </p>
      </div>
      <div className="gl-vista">
        <div ref={lienzo} className="gl-vista__lienzo" style={anidada ? undefined : ({ '--gl-vista-alto': `${Math.round(vista.alto * escala)}px` } as CSSProperties)}>
          {anidada ? (
            <p className="gl-vista__aviso">La vista previa no se repite dentro de sí misma.</p>
          ) : (
            <div
              className="gl-vista__dispositivo"
              style={{ '--gl-vista-ancho': `${vista.ancho}px`, '--gl-vista-alto-real': `${vista.alto}px`, '--gl-vista-escala': escala } as CSSProperties}
            >
              <iframe className="gl-vista__marco" src={rutaEmbebida(ruta)} title={`${nombre}, de la galería, a ${vista.ancho} px de ancho`} loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
