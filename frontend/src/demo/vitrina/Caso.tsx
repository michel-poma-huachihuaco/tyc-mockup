import { Alert, Button, Icon, Spinner, toast } from '@aybarcorp/ui'
import { Component, startTransition, use, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent, ReactNode, RefObject } from 'react'
import { enlaceInterno } from '../../navegacion'
import { copiar } from '../utiles'
import type { CasoCatalogo, GrupoCatalogo } from './catalogo'
import { construirCaso, traeDisparador } from './construir'
import type { Ajustes } from './construir'
import { cargarCatalogo } from './fuente'

/**
 * Un caso del catálogo dentro de su marco. La vitrina monta a la vez decenas de componentes
 * pensados para estar solos en la página —un Login Form a pantalla completa, una página de
 * error que toma el título y el foco, un Fab o un aviso fijos a la ventana—, así que cada
 * caso queda aislado:
 *
 * - Se monta al acercarse a la vista (IntersectionObserver), en una transición: cambiar de
 *   componente no congela la página aunque tenga treinta casos.
 * - El marco es relativo, con altura máxima y desplazamiento propio: lo de página completa
 *   cabe y se recorre dentro (y tiene su enlace a pantalla completa).
 * - Si algo del caso se fija a la ventana, el marco pasa a tener `transform` y se convierte
 *   en su bloque contenedor: el Fab o el Snackbar quedan dentro en vez de tapar la página.
 * - Una capa (`capa: true` en el catálogo: Modal, Drawer, diálogos…) se pinta con un
 *   disparador y se abre a petición, controlada: Escape, la X o el velo la cierran de verdad
 *   y el foco vuelve al disparador. Un caso que trae su propio disparador (un Dropdown Menu)
 *   se pinta en línea, sin abrir.
 * - Lo que el caso toca fuera al montarse —el título del documento, el foco, el
 *   desplazamiento— se devuelve como estaba.
 * - Un caso que lanza al renderizar no tumba la vitrina: su límite de error dice cuál falló.
 */
export function Caso({
  grupo,
  caso,
  n,
  rutaComponente,
}: {
  grupo: GrupoCatalogo
  caso: CasoCatalogo
  n: number
  /** La página del componente: el caso a pantalla completa cuelga de ella. */
  rutaComponente: string
}) {
  const figura = useRef<HTMLElement>(null)
  const visible = useVisible(figura)
  const [codigo, setCodigo] = useState(false)
  const idCodigo = useId()
  const completo = grupo.ancho === 'completo'

  return (
    <figure ref={figura} id={`caso-${n}`} className={completo ? 'gl-caso gl-caso--completo' : 'gl-caso'}>
      {visible ? (
        <Marco grupo={grupo} caso={caso} />
      ) : (
        <div className="gl-caso__reserva" aria-hidden="true">
          <Spinner size="sm" />
        </div>
      )}
      <figcaption className="gl-caso__pie">
        <span className="gl-caso__etiqueta">{caso.etiqueta}</span>
        <span className="gl-caso__acciones">
          {completo ? (
            <a className="gl-enlace-chico" {...enlaceInterno(`${rutaComponente}/caso/${n}`)}>
              <Icon name="external" size={16} />
              Pantalla completa<span className="ay-visually-hidden">: {caso.etiqueta}</span>
            </a>
          ) : null}
          {caso.jsx ? (
            <button
              type="button"
              className="gl-enlace-chico"
              aria-expanded={codigo}
              aria-controls={codigo ? idCodigo : undefined}
              onClick={() => setCodigo(!codigo)}
            >
              <Icon name="chevron-down" size={16} />
              Código<span className="ay-visually-hidden"> de «{caso.etiqueta}»</span>
            </button>
          ) : null}
        </span>
      </figcaption>
      {codigo && caso.jsx ? <BloqueCodigo id={idCodigo} codigo={caso.jsx} /> : null}
    </figure>
  )
}

/** El JSX del caso (lo calcula el build de @aybarcorp/ui) con su «Copiar». */
export function BloqueCodigo({ id, codigo }: { id?: string; codigo: string }) {
  return (
    <div id={id} className="gl-codigo">
      <pre className="gl-codigo__pre" tabIndex={0} aria-label="Código del caso">
        <code>{codigo}</code>
      </pre>
      <span className="gl-codigo__copiar">
        <Button variant="ghost" size="sm" leadingIcon={<Icon name="copy" size={16} />} onClick={() => void copiar(codigo, 'Código')}>
          Copiar
        </Button>
      </span>
    </div>
  )
}

/** `true` desde que el elemento se acerca a la vista; después ya no vuelve a `false`. */
function useVisible(elemento: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const nodo = elemento.current
    if (!nodo || visible) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          observador.disconnect()
          startTransition(() => setVisible(true))
        }
      },
      { rootMargin: '320px 0px' },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [elemento, visible])
  return visible
}

type Modo = 'en-linea' | 'disparador' | 'abierto'

/** El marco del caso: lo aísla de la página (ver el comentario de `Caso`). */
export function Marco({ grupo, caso, pantallaCompleta = false }: { grupo: GrupoCatalogo; caso: CasoCatalogo; pantallaCompleta?: boolean }) {
  const marco = useRef<HTMLDivElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const esCapa = Boolean(grupo.capa) && !traeDisparador(caso)
  const [modo, setModo] = useState<Modo>(esCapa ? 'disparador' : 'en-linea')
  const [contener, setContener] = useState(false)
  const abierto = modo === 'abierto'
  const conCaso = modo !== 'disparador'
  const cerrar = () => setModo('disparador')
  // Las props que el componente declara (props.json): solo esas se sobrescriben al abrirlo.
  const { fichas } = use(cargarCatalogo())
  const propias = new Set(fichas.get(grupo.componente)?.props.map((p) => p.nombre))
  const ajustes = ajustesDeCapa(caso, esCapa, abierto, cerrar, disparador.current, propias)
  // La región de toasts es una por aplicación y la galería ya tiene la suya: el caso lanza un
  // toast en ella en lugar de montar otra.
  const soloLanzar = esCapa && grupo.componente === 'ToastRegion'

  useDevolverLoTocado(marco, modo, !abierto && !pantallaCompleta)

  // Al cerrarse una capa, el foco vuelve a su disparador (si no lo devolvió ella misma).
  const estabaAbierto = useRef(false)
  useEffect(() => {
    if (estabaAbierto.current && !abierto) {
      const foco = document.activeElement
      if (!foco || foco === document.body || !foco.isConnected) disparador.current?.focus()
    }
    estabaAbierto.current = abierto
  }, [abierto])

  // Antes de pintar: un modal abierto pasa a disparador y lo fijo queda contenido, sin que
  // llegue a verse un fotograma tapando la página. A pantalla completa no se contiene nada.
  useLayoutEffect(() => {
    const raiz = marco.current
    if (!raiz || modo !== 'en-linea' || pantallaCompleta) return
    if (tieneModal(raiz)) setModo('disparador')
    else if (tieneFijos(raiz)) setContener(true)
    // Solo al montar (deps vacías a propósito): después, abrir un modal es una acción del
    // usuario y vale, y lo fijo que aparezca más tarde lo ve el observador de abajo.
  }, [])

  // Lo que se fija más tarde —un Snackbar tras una acción, una paleta que se abre— también.
  useEffect(() => {
    const raiz = marco.current
    if (!raiz || contener || !conCaso || pantallaCompleta || esCapa) return
    let pendiente = 0
    const revisar = () => {
      pendiente = 0
      if (modo === 'en-linea' && tieneModal(raiz)) setModo('disparador')
      else if (tieneFijos(raiz)) setContener(true)
    }
    const observador = new MutationObserver(() => {
      pendiente ||= requestAnimationFrame(revisar)
    })
    observador.observe(raiz, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'open', 'hidden'] })
    return () => {
      observador.disconnect()
      cancelAnimationFrame(pendiente)
    }
  }, [contener, conCaso, modo, pantallaCompleta, esCapa])

  // Un <dialog> nativo abierto a petición avisa al cerrarse con su evento `close`.
  useEffect(() => {
    const raiz = marco.current
    if (!raiz || !abierto) return
    raiz.addEventListener('close', cerrar, true)
    return () => raiz.removeEventListener('close', cerrar, true)
  }, [abierto])

  const clases = ['gl-caso__marco', contener ? 'gl-caso__marco--contenido' : '', pantallaCompleta ? 'gl-caso__marco--completo' : '']
  return (
    <div ref={marco} className={clases.filter(Boolean).join(' ')} onClickCapture={noSalir} onSubmitCapture={noEnviar}>
      {modo === 'en-linea' ? null : (
        <div className="gl-caso__disparador">
          <p className="gl-caso__nota">Se abre como capa, por encima de la página.</p>
          {soloLanzar ? (
            <Button variant="secondary" size="sm" onClick={() => toast({ message: 'Reserva registrada', tone: 'success' })}>
              Lanzar un toast de ejemplo
            </Button>
          ) : (
            <Button
              ref={disparador}
              variant="secondary"
              size="sm"
              aria-haspopup={propias.has('open') ? 'dialog' : undefined}
              aria-expanded={abierto}
              onClick={() => setModo(abierto ? 'disparador' : 'abierto')}
            >
              {abierto ? `Cerrar «${caso.etiqueta}»` : `Abrir «${caso.etiqueta}»`}
            </Button>
          )}
        </div>
      )}
      {conCaso && !soloLanzar ? (
        <div className="gl-caso__lienzo">
          <LimiteDelCaso nombre={`${grupo.componente} · ${caso.etiqueta}`}>
            <Construido componente={grupo.componente} caso={caso} ajustes={ajustes} />
          </LimiteDelCaso>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Lo que el caso sobrescribe para abrirse a petición, según las props que el componente
 * declara en props.json (una prop desconocida llegaría al DOM y React lo avisaría en la
 * consola): `open` y `onOpenChange` si es una capa controlada, `onClose` u `onDismiss` si se
 * cierra así (el visor de imágenes, el Snackbar), `returnFocusTo` para que el foco vuelva al
 * disparador y `shortcut: null` para que una paleta de comandos no se pelee por Ctrl K con
 * el buscador de la galería. Una capa sin `open` se monta al abrir y se desmonta al cerrar.
 * Un caso con su propio disparador se pinta cerrado y sin controlar.
 */
function ajustesDeCapa(
  caso: CasoCatalogo,
  esCapa: boolean,
  abierto: boolean,
  cerrar: () => void,
  disparador: HTMLElement | null,
  propias: ReadonlySet<string>,
): Ajustes | undefined {
  if (!esCapa) return traeDisparador(caso) ? { open: undefined, onOpenChange: undefined } : undefined
  const ajustes: Record<string, unknown> = {}
  if (propias.has('open')) ajustes.open = abierto
  if (propias.has('onOpenChange')) {
    ajustes.onOpenChange = (valor: boolean) => {
      if (!valor) cerrar()
    }
  }
  if (propias.has('onClose')) ajustes.onClose = cerrar
  if (propias.has('onDismiss')) ajustes.onDismiss = cerrar
  if (propias.has('returnFocusTo')) ajustes.returnFocusTo = disparador
  if (propias.has('shortcut')) ajustes.shortcut = null
  return ajustes
}

/**
 * Los enlaces de los ejemplos (`/reservas`, `#ancla`) son de muestra: seguirlos sacaría de
 * la vitrina a una ruta que esta aplicación no tiene. Se anula solo la navegación del
 * navegador, en captura; los manejadores del componente corren igual.
 */
function noSalir(evento: MouseEvent) {
  if (evento.target instanceof Element && evento.target.closest('a[href]')) evento.preventDefault()
}

/** Un formulario de ejemplo tampoco se envía a ninguna parte: su `onSubmit`, si lo tiene, corre igual. */
function noEnviar(evento: FormEvent) {
  evento.preventDefault()
}

/** `construirCaso` corre dentro del límite: un componente que no existe también es un fallo del caso. */
function Construido({ componente, caso, ajustes }: { componente: string; caso: CasoCatalogo; ajustes?: Ajustes }) {
  return construirCaso(componente, caso, ajustes)
}

class LimiteDelCaso extends Component<{ nombre: string; children: ReactNode }, { error: unknown; fallo: boolean }> {
  override state = { error: null as unknown, fallo: false }

  static getDerivedStateFromError(error: unknown) {
    return { error, fallo: true }
  }

  override render() {
    if (!this.state.fallo) return this.props.children
    const { error } = this.state
    return (
      <Alert tone="danger" title={`El caso «${this.props.nombre}» falló al renderizar`} live="off">
        {error instanceof Error ? error.message : String(error)}
      </Alert>
    )
  }
}

/**
 * Devuelve el título, el foco y el desplazamiento si el caso los cambió al montarse: un
 * Header o una página de error toman el foco y el título, como deben hacerlo en una página
 * de verdad, y aquí solo son una muestra. Se toma la foto en el efecto de layout del marco
 * y se compara en su efecto pasivo, que React corre después de los de sus hijos.
 */
function useDevolverLoTocado(marco: RefObject<HTMLElement | null>, clave: Modo, conFoco: boolean) {
  const antes = useRef<{ titulo: string; foco: Element | null; x: number; y: number } | null>(null)
  useLayoutEffect(() => {
    antes.current = { titulo: document.title, foco: document.activeElement, x: scrollX, y: scrollY }
  }, [clave])
  useEffect(() => {
    const previo = antes.current
    const raiz = marco.current
    if (!previo || !raiz) return
    if (document.title !== previo.titulo) document.title = previo.titulo
    const foco = document.activeElement
    if (!conFoco || !foco || foco === previo.foco || !raiz.contains(foco)) return
    const volver = previo.foco instanceof HTMLElement && previo.foco !== document.body && previo.foco.isConnected
    if (volver) (previo.foco as HTMLElement).focus({ preventScroll: true })
    else if (foco instanceof HTMLElement) foco.blur()
    if (scrollX !== previo.x || scrollY !== previo.y) scrollTo(previo.x, previo.y)
  }, [clave, conFoco, marco])
}

function tieneFijos(raiz: HTMLElement): boolean {
  for (const elemento of raiz.querySelectorAll('*')) {
    if (getComputedStyle(elemento).position === 'fixed' && !elemento.closest('[role="tooltip"]')) return true
  }
  return false
}

function tieneModal(raiz: HTMLElement): boolean {
  for (const dialogo of raiz.querySelectorAll('dialog[open]')) {
    try {
      if (dialogo.matches(':modal')) return true
    } catch {
      // Un navegador sin :modal no distingue el modal del no modal: se deja en línea.
    }
  }
  return false
}
