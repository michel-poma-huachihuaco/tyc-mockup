import { Alert, Badge, Button, Card, CardBody, CardHeader, EmptyState, FormField, Select, Statistic } from '@aybarcorp/ui'
import type { TonoBadge } from '@aybarcorp/ui'
import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ETIQUETAS_WCAG, NOMBRE_IMPACTO, ORDEN_IMPACTO, analizar, analizarEnMarco, contarPorImpacto } from '../../axe'
import type { Impacto, ResultadoAxe, ViolacionAxe } from '../../axe'
import { useGaleria } from '../../contexto'
import { Encabezado } from '../../marco/Encabezado'
import { SECCIONES, migasDe } from '../../rutas'
import { fechaCorta } from '../../utiles'
import './accesibilidad.css'

/** El valor del selector que analiza la página que se está viendo. */
const AQUI = 'aqui'

const TONO_IMPACTO: Record<Impacto, TonoBadge> = { critical: 'danger', serious: 'warning', moderate: 'info', minor: 'neutral' }

/** Los nodos de una violación que se listan; los demás se cuentan. */
const NODOS_VISIBLES = 8

type Estado =
  | { readonly tipo: 'inicial' }
  | { readonly tipo: 'analizando'; readonly que: string }
  | { readonly tipo: 'listo'; readonly resultado: ResultadoAxe }
  | { readonly tipo: 'error'; readonly que: string; readonly mensaje: string }

const USO_EN_PRUEBAS = `// Playwright, con npm run dev y la sesión iniciada:
await page.goto('/demo/cuenta')
const { violaciones } = await page.evaluate(() => window.__aybarGaleria!.axe())
expect(violaciones.filter((v) => ['critical', 'serious'].includes(v.impacto))).toEqual([])`

/**
 * /demo/accesibilidad: analiza con axe-core (WCAG 2.2 A y AA) esta página o cualquier
 * pantalla de la galería, que se carga en un iframe de este mismo sitio y se analiza con el
 * axe de su propia ventana. axe-core llega con `import()` al pulsar «Analizar»: ninguna otra
 * pantalla lo carga. Las violaciones salen agrupadas por impacto, con la regla, sus
 * criterios de WCAG, el enlace a su explicación y los elementos afectados.
 */
export default function Accesibilidad() {
  const galeria = useGaleria()
  const [destino, setDestino] = useState(AQUI)
  const [estado, setEstado] = useState<Estado>({ tipo: 'inicial' })
  const [rutaMarco, setRutaMarco] = useState<string | null>(null)
  const marco = useRef<HTMLIFrameElement>(null)
  const idResultado = useId()

  const opciones = [
    { value: AQUI, label: 'Esta página' },
    ...SECCIONES.filter((s) => galeria.admin || !s.soloAdmin).map((s) => ({ value: s.ruta, label: `${s.nombre} · ${s.ruta}` })),
  ]
  const analizando = estado.tipo === 'analizando'

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (analizando) return
    const que = destino === AQUI ? 'esta página' : destino
    setEstado({ tipo: 'analizando', que })
    try {
      let resultado: ResultadoAxe
      if (destino === AQUI) {
        resultado = await analizar(document)
      } else {
        setRutaMarco(destino)
        resultado = await analizarEnMarco(await elMarco(marco), destino)
      }
      setEstado({ tipo: 'listo', resultado })
    } catch (error) {
      setEstado({ tipo: 'error', que, mensaje: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <div className="gl-pagina">
      <Encabezado
        titulo="Accesibilidad"
        descripcion="axe-core revisa la pantalla con las reglas de WCAG 2.2 A y AA. Lo automático encuentra una parte de los problemas: el teclado, el lector de pantalla y el sentido de los textos se revisan a mano."
        migas={migasDe({ id: 'accesibilidad' })}
      />
      <div className="gl-axe">
        <Card>
          <CardBody>
            <form className="gl-axe__formulario" onSubmit={enviar}>
              <div className="gl-axe__campo">
                <FormField label="Qué analizar" helper="Otra pantalla se carga aquí abajo, en un iframe de este mismo sitio y con tu sesión.">
                  <Select value={destino} onChange={(e) => setDestino(e.target.value)} options={opciones} />
                </FormField>
              </div>
              <Button type="submit" loading={analizando}>
                Analizar
              </Button>
            </form>
            <p className="gl-axe__estado" role="status">
              {mensajeDeEstado(estado)}
            </p>
          </CardBody>
        </Card>

        {estado.tipo === 'error' ? (
          <Alert tone="danger" title={`No se pudo analizar ${estado.que}`} live="off">
            {estado.mensaje} Vuelve a pulsar «Analizar» para reintentarlo.
          </Alert>
        ) : null}

        {rutaMarco ? (
          <section className="gl-axe__vista" aria-label="Pantalla analizada">
            <iframe ref={marco} className="gl-axe__marco" title={`Pantalla analizada: ${rutaMarco}`} />
          </section>
        ) : null}

        {estado.tipo === 'listo' ? <Resultado resultado={estado.resultado} id={idResultado} /> : null}

        {estado.tipo === 'inicial' ? (
          <EmptyState
            size="compact"
            variant="first-use"
            title="Todavía no hay análisis"
            description="Elige esta página u otra pantalla de la galería y pulsa «Analizar». axe-core se descarga en ese momento, no antes."
          />
        ) : null}

        <Card>
          <CardHeader as="h2" title="Desde las pruebas" subtitle="La galería deja window.__aybarGaleria.axe() en cuanto se monta, solo con npm run dev." />
          <CardBody>
            <pre className="gl-axe__codigo">
              <code>{USO_EN_PRUEBAS}</code>
            </pre>
            <p className="gl-axe__nota">
              Acepta las opciones de <code>axe.run</code> (por ejemplo, <code>{"{ runOnly: ['wcag2aa'] }"}</code>); sin ellas,
              analiza con {ETIQUETAS_WCAG.join(', ')}. Devuelve JSON plano.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

/** El iframe recién montado: React lo pinta tras `setRutaMarco`, un cuadro después. */
async function elMarco(ref: { readonly current: HTMLIFrameElement | null }): Promise<HTMLIFrameElement> {
  for (let intento = 0; intento < 60 && !ref.current; intento++) {
    await new Promise((listo) => requestAnimationFrame(listo))
  }
  if (!ref.current) throw new Error('El iframe de la pantalla analizada no llegó a montarse.')
  return ref.current
}

function mensajeDeEstado(estado: Estado): string {
  switch (estado.tipo) {
    case 'inicial':
      return ''
    case 'analizando':
      return `Analizando ${estado.que}…`
    case 'error':
      return `El análisis de ${estado.que} falló.`
    case 'listo': {
      const n = estado.resultado.violaciones.length
      return `Análisis de ${estado.resultado.ruta} listo: ${n === 0 ? 'sin violaciones' : n === 1 ? 'una violación' : `${n} violaciones`}.`
    }
  }
}

function Resultado({ resultado, id }: { resultado: ResultadoAxe; id: string }) {
  const cuentas = contarPorImpacto(resultado.violaciones)
  const hora = new Date(resultado.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return (
    <section className="gl-axe__resultado" aria-labelledby={id}>
      <div className="gl-axe__cabecera">
        <h2 id={id} className="gl-axe__titulo">
          Resultado de <code>{resultado.ruta}</code>
        </h2>
        <p className="gl-axe__nota">
          {fechaCorta(resultado.fecha)}, {hora} · axe-core {resultado.version}
        </p>
      </div>
      <div className="gl-axe__cifras">
        {ORDEN_IMPACTO.map((impacto) => (
          <Statistic key={impacto} size="sm" label={NOMBRE_IMPACTO[impacto].varios} value={cuentas[impacto]} />
        ))}
        <Statistic size="sm" label="Reglas que pasan" value={resultado.reglasQuePasan} />
        <Statistic size="sm" label="Para revisar a mano" value={resultado.incompletas} />
      </div>
      {resultado.violaciones.length === 0 ? (
        <EmptyState
          size="compact"
          variant="no-results"
          title="Sin violaciones de WCAG 2.2 A y AA"
          description={`axe-core no encontró nada en ${resultado.ruta}. Recórrela igual con el teclado y con un lector de pantalla: lo automático no lo ve todo.`}
        />
      ) : (
        ORDEN_IMPACTO.filter((impacto) => cuentas[impacto] > 0).map((impacto) => (
          <GrupoImpacto key={impacto} impacto={impacto} violaciones={resultado.violaciones.filter((v) => v.impacto === impacto)} />
        ))
      )}
    </section>
  )
}

function GrupoImpacto({ impacto, violaciones }: { impacto: Impacto; violaciones: readonly ViolacionAxe[] }) {
  const id = useId()
  return (
    <section className="gl-axe__grupo" aria-labelledby={id}>
      <h3 id={id} className="gl-axe__grupo-titulo">
        {NOMBRE_IMPACTO[impacto].varios}
        <Badge tone={TONO_IMPACTO[impacto]} size="sm">
          {violaciones.length}
        </Badge>
      </h3>
      <ul className="gl-axe__lista">
        {violaciones.map((v) => (
          <li key={v.id}>
            <Violacion violacion={v} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Violacion({ violacion: v }: { violacion: ViolacionAxe }) {
  const extra = v.nodos.length - NODOS_VISIBLES
  return (
    <Card>
      <CardHeader
        as="h4"
        title={v.ayuda}
        subtitle={[v.id, ...v.criterios.map((c) => `WCAG ${c}`)].join(' · ')}
        actions={
          <Badge tone={TONO_IMPACTO[v.impacto]} size="sm">
            {NOMBRE_IMPACTO[v.impacto].uno}
          </Badge>
        }
      />
      <CardBody>
        <div className="gl-axe__violacion">
          <p className="gl-axe__descripcion">{v.descripcion}</p>
          <a className="gl-axe__enlace" href={v.enlace} target="_blank" rel="noreferrer">
            Qué pide la regla {v.id}
            <span className="ay-visually-hidden"> (en Deque University, se abre en otra pestaña)</span>
          </a>
          <details className="gl-axe__nodos">
            <summary>{v.nodos.length === 1 ? 'Un elemento afectado' : `${v.nodos.length} elementos afectados`}</summary>
            <ol className="gl-axe__lista-nodos">
              {v.nodos.slice(0, NODOS_VISIBLES).map((nodo, i) => (
                <li key={`${nodo.selector}-${i}`} className="gl-axe__nodo">
                  <code className="gl-axe__selector">{nodo.selector}</code>
                  <pre className="gl-axe__html">{nodo.html}</pre>
                  {nodo.resumen ? <p className="gl-axe__resumen">{nodo.resumen}</p> : null}
                </li>
              ))}
            </ol>
            {extra > 0 ? <p className="gl-axe__nota">Y {extra === 1 ? 'otro elemento' : `${extra} elementos más`} con el mismo problema.</p> : null}
          </details>
        </div>
      </CardBody>
    </Card>
  )
}
