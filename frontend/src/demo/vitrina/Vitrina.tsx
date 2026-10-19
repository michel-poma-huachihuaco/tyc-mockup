import { Badge, Card, CardBody, CardFooter, CardHeader, Error404, Icon, SearchInput } from '@aybarcorp/ui'
import { Fragment, use, useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { enlaceInterno } from '../../navegacion'
import { Encabezado } from '../marco/Encabezado'
import { BASE, distancia } from '../rutas'
import { anclaDeGrupo, casosDe, normalizar, primeraFrase, ubicarComponente, vecinosDe } from './catalogo'
import type { ComponenteVitrina, FamiliaVitrina, FichaComponente, PropFicha } from './catalogo'
import { Caso } from './Caso'
import { cargarCatalogo } from './fuente'

const RUTA = `${BASE}/vitrina`
const rutaFamilia = (f: FamiliaVitrina) => `${RUTA}/${f.slug}`
const rutaComponente = (c: ComponenteVitrina) => `${RUTA}/${c.slugFamilia}/${c.slug}`

/**
 * La vitrina del sistema de diseño, como una documentación: una URL por componente
 * (`/demo/vitrina/data/data-grid`), las familias en la barra de la galería, los componentes
 * de la familia a la izquierda, «En esta página» a la derecha, y en el centro cada grupo
 * del catálogo con sus casos, su código y la tabla de props. Todo sale del paquete
 * instalado: `@aybarcorp/ui/ejemplos` y `@aybarcorp/ui/props`.
 */
export default function Vitrina({ familia, componente }: { familia?: string; componente?: string }) {
  const datos = use(cargarCatalogo())
  if (!familia) return <Indice familias={datos.familias} componentes={datos.componentes} casos={datos.casos} />
  const f = datos.familias.find((x) => x.slug === familia)
  if (!f) return <NoEsta tipo="familia" pedido={familia} familias={datos.familias} />
  if (!componente) return <PaginaFamilia familia={f} fichas={datos.fichas} />
  const ubicado = ubicarComponente(datos.familias, familia, componente)
  if (!ubicado) return <NoEsta tipo="componente" pedido={componente} familias={datos.familias} />
  return (
    <PaginaComponente
      key={`${familia}/${componente}`}
      familias={datos.familias}
      familia={ubicado.familia}
      componente={ubicado.componente}
      ficha={datos.fichas.get(ubicado.componente.nombre)}
    />
  )
}

/** /demo/vitrina: las familias como tarjetas, con cuántos componentes y casos trae cada una. */
function Indice({ familias, componentes, casos }: { familias: readonly FamiliaVitrina[]; componentes: number; casos: number }) {
  return (
    <div className="gl-pagina">
      <Encabezado
        titulo="Vitrina"
        descripcion={`Los ${componentes} componentes de @aybarcorp/ui con sus ${casos} casos, salidos del catálogo verificado del paquete instalado. Ctrl K busca en español: «tabla», «fecha», «aviso».`}
        migas={[{ label: 'Galería', href: BASE }, { label: 'Vitrina' }]}
      />
      <ul className="gl-rejilla gl-rejilla--familias" aria-label="Familias del sistema de diseño">
        {familias.map((f) => (
          <li key={f.slug}>
            {f.casos > 0 ? (
              <Card variant="interactive" href={rutaFamilia(f)}>
                <CardHeader as="h2" title={f.nombre} subtitle={`${f.componentes.length} componentes · ${f.casos} casos`} />
                <CardBody>
                  <p className="gl-texto-chico">
                    {f.componentes
                      .slice(0, 6)
                      .map((c) => c.nombre)
                      .join(', ')}
                    {f.componentes.length > 6 ? '…' : ''}
                  </p>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardHeader as="h2" title={f.nombre} subtitle="Todavía sin componentes publicados" />
                <CardBody>
                  <p className="gl-texto-chico">Aparecen aquí en cuanto @aybarcorp/ui los publique.</p>
                </CardBody>
              </Card>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** /demo/vitrina/:familia: los componentes de la familia, con su descripción. */
function PaginaFamilia({ familia, fichas }: { familia: FamiliaVitrina; fichas: ReadonlyMap<string, FichaComponente> }) {
  return (
    <div className="gl-pagina">
      <Encabezado
        titulo={familia.nombre}
        descripcion={`${familia.componentes.length} componentes y ${familia.casos} casos de la familia ${familia.nombre}.`}
        migas={[{ label: 'Galería', href: BASE }, { label: 'Vitrina', href: RUTA }, { label: familia.nombre }]}
      />
      <ul className="gl-rejilla" aria-label={`Componentes de ${familia.nombre}`}>
        {familia.componentes.map((c) => (
          <li key={c.slug}>
            <Card variant="interactive" href={rutaComponente(c)}>
              <CardHeader as="h2" title={c.nombre} />
              <CardBody>
                <p className="gl-texto-chico">{primeraFrase(fichas.get(c.nombre)?.descripcion) || 'Sin descripción en props.json.'}</p>
              </CardBody>
              <CardFooter meta={`${c.casos} ${c.casos === 1 ? 'caso' : 'casos'} · ${c.grupos.length} ${c.grupos.length === 1 ? 'grupo' : 'grupos'}`} />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Una familia o un componente que el catálogo no trae: el 404 con los nombres parecidos. */
function NoEsta({ tipo, pedido, familias }: { tipo: 'familia' | 'componente'; pedido: string; familias: readonly FamiliaVitrina[] }) {
  const candidatos =
    tipo === 'familia'
      ? familias.map((f) => ({ label: f.nombre, href: rutaFamilia(f), slug: f.slug }))
      : familias.flatMap((f) => f.componentes.map((c) => ({ label: `${c.nombre} (${f.nombre})`, href: rutaComponente(c), slug: c.slug })))
  const parecidos = candidatos
    .map((c) => ({ ...c, d: distancia(pedido, c.slug) / Math.max(pedido.length, c.slug.length) }))
    .filter((c) => c.d <= 0.5 || c.slug.includes(pedido) || pedido.includes(c.slug))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map(({ label, href }) => ({ label, href }))
  return (
    <div className="gl-pagina">
      <Error404 scope="region" cause="unknown-route" resourceName={`${tipo === 'familia' ? 'La familia' : 'El componente'} «${pedido}»`} backHref={RUTA} suggestions={parecidos} />
    </div>
  )
}

/**
 * /demo/vitrina/:familia/:componente: la página del componente. Los casos se montan al
 * acercarse a la vista; «En esta página» marca el grupo que se está leyendo.
 */
function PaginaComponente({
  familias,
  familia,
  componente,
  ficha,
}: {
  familias: readonly FamiliaVitrina[]
  familia: FamiliaVitrina
  componente: ComponenteVitrina
  ficha: FichaComponente | undefined
}) {
  const ruta = rutaComponente(componente)
  const casos = casosDe(componente)
  const { anterior, siguiente } = vecinosDe(familias, componente)
  const anclas = componente.grupos.map((g, i) => ({ id: anclaDeGrupo(i, g.titulo), titulo: g.titulo }))
  if (ficha?.props.length) anclas.push({ id: 'propiedades', titulo: 'Propiedades' })
  const leyendo = useSeccionVisible(anclas.map((a) => a.id))
  const idNavFamilia = useId()

  return (
    <div className="gl-vitrina">
      <nav className="gl-vitrina__familia" aria-labelledby={idNavFamilia}>
        <p id={idNavFamilia} className="gl-vitrina__rotulo">
          {familia.nombre}
        </p>
        <ul className="gl-vitrina__lista">
          {familia.componentes.map((c) => (
            <li key={c.slug}>
              <a className="gl-vitrina__enlace" href={rutaComponente(c)} aria-current={c.slug === componente.slug ? 'page' : undefined}>
                {c.nombre}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="gl-vitrina__centro">
        <Encabezado
          titulo={componente.nombre}
          descripcion={ficha?.descripcion?.replace(/`/g, '')}
          meta={<Badge tone="neutral">{`${componente.casos} ${componente.casos === 1 ? 'caso' : 'casos'}`}</Badge>}
          migas={[
            { label: 'Galería', href: BASE },
            { label: 'Vitrina', href: RUTA },
            { label: familia.nombre, href: rutaFamilia(familia) },
            { label: componente.nombre },
          ]}
        />
        {componente.grupos.map((grupo, i) => {
          const ancla = anclas[i]?.id ?? `grupo-${i + 1}`
          const propios = casos.filter((c) => c.grupo === grupo)
          return (
            <section key={ancla} className="gl-grupo" aria-labelledby={`${ancla}-titulo`}>
              <h2 id={ancla} className="gl-grupo__titulo">
                <span id={`${ancla}-titulo`}>{grupo.titulo}</span>
                {grupo.capa ? <Badge tone="info" size="sm">Capa</Badge> : null}
              </h2>
              {grupo.nota ? <p className="gl-grupo__nota">{conCodigo(grupo.nota)}</p> : null}
              <div className={grupo.ancho === 'completo' ? 'gl-casos gl-casos--completo' : 'gl-casos'}>
                {propios.map(({ caso, n }) => (
                  <Caso key={n} grupo={grupo} caso={caso} n={n} rutaComponente={ruta} />
                ))}
              </div>
            </section>
          )
        })}
        {ficha?.props.length ? <TablaDeProps nombre={componente.nombre} props={ficha.props} /> : null}
        <nav className="gl-vecinos" aria-label="Componente anterior y siguiente">
          {anterior ? (
            <a className="gl-vecinos__enlace" {...enlaceInterno(rutaComponente(anterior))}>
              <span className="gl-vecinos__rotulo">Anterior</span>
              <span className="gl-vecinos__nombre">
                <Icon name="arrow-left" size={16} />
                {anterior.nombre}
              </span>
            </a>
          ) : (
            <span />
          )}
          {siguiente ? (
            <a className="gl-vecinos__enlace gl-vecinos__enlace--siguiente" {...enlaceInterno(rutaComponente(siguiente))}>
              <span className="gl-vecinos__rotulo">Siguiente</span>
              <span className="gl-vecinos__nombre">
                {siguiente.nombre}
                <Icon name="arrow-right" size={16} />
              </span>
            </a>
          ) : null}
        </nav>
      </div>

      <aside className="gl-vitrina__indice" aria-label="En esta página">
        <p className="gl-vitrina__rotulo" aria-hidden="true">
          En esta página
        </p>
        <ul className="gl-indice">
          {anclas.map((a) => (
            <li key={a.id}>
              <a className="gl-indice__enlace" href={`#${a.id}`} aria-current={leyendo === a.id ? 'location' : undefined}>
                {a.titulo}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

/** Las notas del catálogo marcan props y valores entre comillas invertidas: van como código. */
function conCodigo(texto: string): ReactNode {
  return texto.split('`').map((parte, i) => (i % 2 === 1 ? <code key={i}>{parte}</code> : <Fragment key={i}>{parte}</Fragment>))
}

/** El id de la sección que se está leyendo: la última cuyo título ya pasó bajo la Navbar. */
function useSeccionVisible(ids: readonly string[]): string | undefined {
  const [actual, setActual] = useState<string | undefined>(ids[0])
  const clave = ids.join('|')
  useEffect(() => {
    const lista = clave.split('|').filter(Boolean)
    let marco = 0
    const medir = () => {
      marco = 0
      const limite = 140
      let elegido = lista[0]
      for (const id of lista) {
        const elemento = document.getElementById(id)
        if (elemento && elemento.getBoundingClientRect().top - limite <= 0) elegido = id
      }
      setActual(elegido)
    }
    const alDesplazar = () => {
      marco ||= requestAnimationFrame(medir)
    }
    medir()
    addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      removeEventListener('scroll', alDesplazar)
      cancelAnimationFrame(marco)
    }
  }, [clave])
  return actual
}

function TablaDeProps({ nombre, props }: { nombre: string; props: readonly PropFicha[] }) {
  const [filtro, setFiltro] = useState('')
  const visibles = filtro ? props.filter((p) => normalizar(`${p.nombre} ${p.descripcion ?? ''}`).includes(normalizar(filtro))) : props
  return (
    <section className="gl-grupo" aria-labelledby="propiedades-titulo">
      <h2 id="propiedades" className="gl-grupo__titulo">
        <span id="propiedades-titulo">Propiedades</span>
      </h2>
      {props.length > 6 ? (
        <div className="gl-props__filtro">
          <SearchInput
            size="sm"
            label={`Filtrar las propiedades de ${nombre}`}
            placeholder={`Filtrar ${props.length} props…`}
            value={filtro}
            onValueChange={setFiltro}
            resultCount={filtro ? visibles.length : undefined}
            itemLabel="props"
          />
        </div>
      ) : null}
      {/* Con props largas la tabla se desplaza dentro: con foco, también con el teclado. */}
      <div className="gl-props" role="region" aria-label={`Propiedades de ${nombre}`} tabIndex={0}>
        <table className="gl-props__tabla">
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Tipo</th>
              <th scope="col">Por omisión</th>
              <th scope="col">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((prop) => (
              <tr key={prop.nombre}>
                <th scope="row">
                  <code className="gl-props__nombre">{prop.nombre}</code>
                  {prop.requerido ? <span className="gl-props__nota"> obligatoria</span> : null}
                </th>
                <td>
                  <code className="gl-props__tipo">{prop.tipo}</code>
                </td>
                <td>{prop.porOmision ? <code className="gl-props__valor">{prop.porOmision}</code> : <span className="gl-props__nota">—</span>}</td>
                <td className="gl-props__descripcion">{prop.descripcion ? conCodigo(prop.descripcion) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
