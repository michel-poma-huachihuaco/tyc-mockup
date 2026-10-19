import { Alert, Button, FormField, Select } from '@aybarcorp/ui'
import { useCallback, useMemo, useState } from 'react'
import { LOTES } from '../datos'
import { Encabezado } from '../marco/Encabezado'
import { migasDe } from '../rutas'
import { FichaLote } from './FichaLote'
import { Leyenda, Tramas } from './Leyenda'
import { Lienzo3D } from './Lienzo3D'
import { ListaLotes } from './ListaLotes'
import { Plano2D } from './Plano2D'
import {
  SIN_FILTRO,
  TODAS,
  avisoDe2D,
  esFiltroEstado,
  esFiltroManzana,
  filtrarLotes,
  hayWebGL,
  idDeManzana,
  loteDe,
  manzanaDeId,
  opcionesEstado,
  opcionesManzana,
  pideMenosMovimiento,
  ramasDeLista,
  vistaInicial,
} from './plano'
import type { Filtro, Motivo2D, Vista } from './plano'
import './visor.css'

/**
 * /demo/3d: los 160 lotes de un proyecto sintético en three.js, con su alternativa 2D, la
 * lista accesible con el teclado y la ficha del lote elegido.
 *
 * El estado es de esta pantalla y de nadie más —filtro, lote elegido, lote enfocado,
 * manzanas abiertas— y baja a las vistas: la escena 3D y el plano 2D solo avisan de un
 * clic. El lote elegido que el filtro deja fuera no se borra: deja de verse, y vuelve al
 * quitar el filtro.
 *
 * three.js llega con un `import()` dentro de Lienzo3D: ni esta pantalla ni ninguna otra lo
 * llevan en su chunk. Sin WebGL, con movimiento reducido o por elección, el plano 2D.
 */
export default function PantallaVisor() {
  const [webgl] = useState(hayWebGL)
  const [{ vista, motivo }, setVista] = useState<{ vista: Vista; motivo: Motivo2D | null }>(() =>
    vistaInicial(webgl, pideMenosMovimiento()),
  )
  const [filtro, setFiltro] = useState<Filtro>(SIN_FILTRO)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [enfocado, setEnfocado] = useState<string | null>(null)
  const [abiertas, setAbiertas] = useState<readonly string[]>(() => ramasDeLista(LOTES).map((rama) => rama.id))

  const visibles = useMemo(() => filtrarLotes(filtro), [filtro])
  const idsVisibles = useMemo<ReadonlySet<string>>(() => new Set(visibles.map((lote) => lote.id)), [visibles])
  const ramas = useMemo(() => ramasDeLista(visibles), [visibles])
  const elegido = seleccionado !== null && idsVisibles.has(seleccionado) ? seleccionado : null
  const aviso = vista === '2d' ? avisoDe2D(motivo) : null

  const abrirManzana = useCallback((manzana: string) => {
    const id = idDeManzana(manzana)
    setAbiertas((lista) => (lista.includes(id) ? lista : [...lista, id]))
  }, [])

  // Elegir un lote lo trae a la vista en la lista: su manzana se abre si estaba plegada.
  const elegir = useCallback(
    (id: string) => {
      const lote = loteDe(id)
      if (!lote) return
      setSeleccionado(id)
      abrirManzana(lote.manzana)
    },
    [abrirManzana],
  )

  // En la lista, activar una manzana la abre o la pliega (no hay «manzana elegida»).
  const activarEnLista = useCallback(
    (id: string) => {
      if (manzanaDeId(id) === null) {
        elegir(id)
        return
      }
      setAbiertas((lista) => (lista.includes(id) ? lista.filter((otra) => otra !== id) : [...lista, id]))
    },
    [elegir],
  )

  const fallo3D = useCallback(() => setVista({ vista: '2d', motivo: 'error' }), [])

  const cambiarVista = () => {
    if (vista === '3d') setVista({ vista: '2d', motivo: 'eleccion' })
    else setVista({ vista: '3d', motivo: null })
  }

  return (
    <div className="gl-pagina">
      <Encabezado
        titulo="Visor 3D"
        descripcion="Los lotes de un proyecto sintético en three.js, con los colores de la paleta activa. Arrastra para girar y usa la rueda para acercar; con el teclado, recorre la lista."
        migas={migasDe({ id: '3d' })}
      />
      <div className="gl-maqueta">
        <Tramas />
        <div className="gl-maqueta__mandos">
          <div className="gl-maqueta__filtros" role="group" aria-label="Filtros de lotes">
            <FormField label="Estado">
              <Select
                value={filtro.estado}
                options={opcionesEstado()}
                onChange={(evento) => {
                  const valor = evento.target.value
                  if (esFiltroEstado(valor)) setFiltro((actual) => ({ ...actual, estado: valor }))
                }}
              />
            </FormField>
            <FormField label="Manzana">
              <Select
                value={filtro.manzana}
                options={opcionesManzana()}
                onChange={(evento) => {
                  const valor = evento.target.value
                  if (!esFiltroManzana(valor)) return
                  setFiltro((actual) => ({ ...actual, manzana: valor }))
                  if (valor !== TODAS) abrirManzana(valor)
                }}
              />
            </FormField>
          </div>
          {webgl ? (
            <Button variant="secondary" onClick={cambiarVista}>
              {vista === '3d' ? 'Ver en 2D' : motivo === 'error' ? 'Reintentar el 3D' : 'Ver en 3D'}
            </Button>
          ) : null}
        </div>

        <Leyenda />

        {aviso ? (
          <Alert tone={motivo === 'error' ? 'warning' : 'info'} size="sm" live={motivo === 'error' ? 'polite' : 'off'}>
            {aviso}
          </Alert>
        ) : null}

        <div className="gl-maqueta__cuerpo">
          <div className="gl-maqueta__escenario">
            {vista === '3d' ? (
              <Lienzo3D seleccionado={elegido} enfocado={enfocado} visibles={idsVisibles} alSeleccionar={elegir} alFallar={fallo3D} />
            ) : (
              <Plano2D seleccionado={elegido} enfocado={enfocado} visibles={idsVisibles} alSeleccionar={elegir} />
            )}
          </div>
          <div className="gl-maqueta__lateral">
            <FichaLote lote={loteDe(elegido)} />
            <ListaLotes
              ramas={ramas}
              total={LOTES.length}
              seleccionado={elegido}
              abiertas={abiertas}
              alAbrir={setAbiertas}
              alSeleccionar={activarEnLista}
              alEnfocar={setEnfocado}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
