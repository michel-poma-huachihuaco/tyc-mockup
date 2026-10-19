import { AppearancePanel, Badge, Banner, Button, Drawer, ErrorPage, FormField, Icon, Navbar, Select, Sidebar, SidePanel, SkipLink, ToastRegion } from '@aybarcorp/ui'
import type { GrupoSidebar } from '@aybarcorp/ui'
import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BotonTema } from '../pantallas/BotonTema'
import { Marca } from '../pantallas/Marca'
import { ESTADOS_ACTIVOS } from './datos/catalogos.ts'
import type { Rol } from './datos/catalogos.ts'
import { fechaLarga } from './comun.tsx'
import { PanelSimulacion } from './PanelSimulacion.tsx'
import { PanelLlamada } from './pantallas/PanelLlamada.tsx'
import { hrefDe, leerRuta, useHash } from './rutas.ts'
import type { Ruta } from './rutas.ts'
import { PERSONA_DE_ROL, simulacion, useConsola, useSesion } from './servicio/api.ts'
import { puede } from './servicio/nucleo.ts'
const puedeVerMora = (rol: Rol) => ['COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS', 'COORDINADOR_CX'].includes(rol)
import { Bandeja } from './pantallas/Bandeja.tsx'
import './prototipo.css'

const NuevoTicket = lazy(() => import('./pantallas/NuevoTicket.tsx'))
const DetalleTicket = lazy(() => import('./pantallas/DetalleTicket.tsx'))
const Reasignar = lazy(() => import('./pantallas/Reasignar.tsx'))
const Alertas = lazy(() => import('./pantallas/Alertas.tsx'))
const CierreE2E = lazy(() => import('./pantallas/CierreE2E.tsx'))
const Politicas = lazy(() => import('./pantallas/Politicas.tsx'))
const Morosidad = lazy(() => import('./pantallas/Morosidad.tsx'))
const CasoMora = lazy(() => import('./pantallas/Morosidad.tsx').then((m) => ({ default: m.CasoMora })))
const Ingreso = lazy(() => import('./pantallas/Ingreso.tsx'))
const Buses = lazy(() => import('./pantallas/Buses.tsx'))
const Libro = lazy(() => import('./pantallas/Libro.tsx'))
const Asiento = lazy(() => import('./pantallas/Asiento.tsx'))
const Mesa = lazy(() => import('./pantallas/Mesa.tsx'))
const UrbeMind = lazy(() => import('./pantallas/UrbeMind.tsx'))
const Clientes = lazy(() => import('./pantallas/Clientes.tsx'))
const Cliente = lazy(() => import('./pantallas/Cliente.tsx'))
const MiDia = lazy(() => import('./pantallas/MiDia.tsx'))
const Configuracion = lazy(() => import('./pantallas/Configuracion.tsx'))
const Torre = lazy(() => import('./pantallas/Torre.tsx'))
const Fest = lazy(() => import('./pantallas/Fest.tsx'))
const Garantias = lazy(() => import('./pantallas/Garantias.tsx'))
const Garantia = lazy(() => import('./pantallas/Garantia.tsx'))
const CasoSgd = lazy(() => import('./pantallas/CasoSgd.tsx'))

const ROLES: ReadonlyArray<{ readonly rol: Rol; readonly etiqueta: string }> = [
  { rol: 'GESTOR', etiqueta: 'Gestor de tickets' },
  { rol: 'COLABORADOR', etiqueta: 'Colaborador de área' },
  { rol: 'SUPERVISOR', etiqueta: 'Supervisor ATC' },
  { rol: 'COORDINADOR_CX', etiqueta: 'Coordinador CX' },
  { rol: 'LEGAL_RECLAMOS', etiqueta: 'Responsable legal de reclamos' },
  { rol: 'MESA_SGD', etiqueta: 'Gestora de la Mesa SGD' },
  { rol: 'MODERADOR_EVENTO', etiqueta: 'Moderador de evento' },
  { rol: 'ADMIN_FUNCIONAL', etiqueta: 'Administrador funcional' },
  { rol: 'CONTROL_ACCESO', etiqueta: 'Control de acceso (garita)' },
  { rol: 'CLIENTE', etiqueta: 'Cliente convocado (Mi Portal)' },
  { rol: 'SIN_ATENCION', etiqueta: 'Rol sin atención' },
]

/**
 * Prototipo funcional del G2 de «Aybar Atiende», ola 1 (EP-ATC-01 y EP-ATC-02). Solo en
 * desarrollo (`/prototipo.html`) o publicado aparte: no entra al build de producción.
 * Datos ficticios en memoria, servicio simulado y ningún backend.
 */
export function Prototipo() {
  const hash = useHash()
  const ruta = useMemo(() => leerRuta(hash), [hash])
  const sesion = useSesion()
  const { datos } = useConsola()
  const [cajon, setCajon] = useState(false)
  const [panel, setPanel] = useState(false)
  const [apariencia, setApariencia] = useState(false)
  const barra = useRef<HTMLElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const principal = useRef<HTMLElement>(null)
  const primera = useRef(true)

  useLayoutEffect(() => {
    const elemento = barra.current
    const contenedor = raiz.current
    if (!elemento || !contenedor) return
    const medir = () => contenedor.style.setProperty('--pt-navbar-alto', `${elemento.offsetHeight}px`)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  // Al cambiar de pantalla, el foco va al contenido (el lector anuncia el h1 nuevo) y arriba.
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    window.scrollTo({ top: 0 })
    principal.current?.focus()
  }, [hash])

  // Quien solo usa un formulario cae directo en él al cambiar de rol.
  useEffect(() => {
    if (sesion.rol === 'CONTROL_ACCESO' && ruta.id !== 'ingreso') location.hash = hrefDe('ingreso')
    if (sesion.rol === 'CLIENTE' && ruta.id !== 'buses') location.hash = hrefDe('buses')
  }, [sesion.rol, ruta.id])

  const misActivos = datos.tickets.filter((t) => t.responsable === sesion.id && ESTADOS_ACTIVOS.includes(t.estado)).length
  const grupos = gruposDeNavegacion(ruta, sesion.rol, misActivos)

  return (
    <div ref={raiz} className="pt">
      <SkipLink scrollMargin="var(--pt-navbar-alto, 0px)" />
      <Navbar
        ref={barra}
        brand={
          <a className="ay-navbar__brand pt-marca" href={hrefDe('bandeja')}>
            <Marca nombre="" />
            <span className="pt-marca__nombre">Aybar Atiende</span>
            <span className="pt-marca__etiqueta">Prototipo G2 · olas 1 a 8</span>
          </a>
        }
        onMenuClick={() => setCajon(true)}
        actions={
          <>
            <span className="pt-desde-md pt-ver-como">
              <FormField label="Ver como" layout="horizontal">
                <Select
                  size="sm"
                  value={sesion.rol}
                  onChange={(e) => simulacion.ajustar({ personaId: PERSONA_DE_ROL[e.target.value as Rol] })}
                  options={ROLES.map((r) => ({ value: r.rol, label: r.etiqueta }))}
                />
              </FormField>
            </span>
            <Button
              variant={apariencia ? 'primary' : 'secondary'}
              size="sm"
              leadingIcon={<Icon name="eye" size={16} />}
              aria-expanded={apariencia}
              onClick={() => {
                setApariencia(!apariencia)
                setPanel(false)
              }}
            >
              Apariencia
            </Button>
            <Button
              variant={panel ? 'primary' : 'secondary'}
              size="sm"
              leadingIcon={<Icon name="clock" size={16} />}
              aria-expanded={panel}
              onClick={() => {
                setPanel(!panel)
                setApariencia(false)
              }}
            >
              Simulación
            </Button>
            <BotonTema />
          </>
        }
      />
      <Banner tone="info" size="sm">
        Prototipo para la revisión de G2 con <strong>datos ficticios</strong>: nada sale del navegador y al recargar vuelve al estado inicial. Reloj
        simulado: <strong>{fechaLarga(datos.ahora)}</strong>. Sesión: <strong>{sesion.nombre}</strong> ({ROLES.find((r) => r.rol === sesion.rol)?.etiqueta}).
      </Banner>
      <div className="pt-cuerpo ay-split">
        <div className="pt-columnas">
          <Sidebar
            label="Secciones de la consola"
            groups={grupos}
          />
          <main ref={principal} id="contenido" tabIndex={-1} className="pt-principal">
            <PanelLlamada />
            <Suspense fallback={null}>
              <Pantalla ruta={ruta} />
            </Suspense>
          </main>
        </div>
        <PanelSimulacion abierto={panel} onCerrar={() => setPanel(false)} roles={ROLES} />
        {/* Apariencia del SDK (paleta, grises, estilo, tema): solo cambia los tokens de color, no los componentes. */}
        <SidePanel open={apariencia} onOpenChange={setApariencia} title="Apariencia" size="sm" resizable>
          <div className="pt-pila">
            <p className="pt-texto-chico">Prueba paletas y grises del sistema de diseño. Se recuerda en este navegador. No es parte del producto.</p>
            <AppearancePanel headingLevel={3} title="Ajustes de color" />
          </div>
        </SidePanel>
      </div>
      <Drawer id="pt-cajon" side="start" size="sm" title="Aybar Atiende" open={cajon} onOpenChange={setCajon}>
        <div
          className="pt-cajon"
          onClick={(evento) => {
            if (evento.target instanceof Element && evento.target.closest('a[href]')) setCajon(false)
          }}
        >
          {grupos.map((grupo) => (
            <nav key={grupo.label} className="pt-cajon__grupo" aria-label={grupo.label}>
              <p className="pt-cajon__titulo" aria-hidden="true">
                {grupo.label}
              </p>
              <ul className="pt-cajon__lista">
                {grupo.items.map((item) => (
                  <li key={item.href}>
                    <a className="pt-cajon__enlace" href={item.href} aria-current={item.current ? 'page' : undefined}>
                      <span className="pt-cajon__icono" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                      {item.badge ? <span className="pt-cajon__insignia">{item.badge}</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Drawer>
      <ToastRegion />
    </div>
  )
}

function Pantalla({ ruta }: { ruta: Ruta }) {
  switch (ruta.id) {
    case 'bandeja':
      return <Bandeja />
    case 'nuevo':
      return <NuevoTicket />
    case 'ticket':
      return <DetalleTicket ticketId={ruta.ticketId} />
    case 'reasignar':
      return <Reasignar />
    case 'alertas':
      return <Alertas />
    case 'cierre':
      return <CierreE2E />
    case 'politicas':
      return <Politicas />
    case 'libro':
      return <Libro />
    case 'asiento':
      return <Asiento asientoId={ruta.asientoId} />
    case 'clientes':
      return <Clientes />
    case 'cliente':
      return <Cliente clienteId={ruta.clienteId} />
    case 'midia':
      return <MiDia />
    case 'configuracion':
      return <Configuracion />
    case 'urbemind':
      return <UrbeMind />
    case 'torre':
      return <Torre />
    case 'fest':
      return <Fest />
    case 'garantias':
      return <Garantias />
    case 'garantia':
      return <Garantia garantiaId={ruta.garantiaId} />
    case 'mesa':
      return <Mesa />
    case 'caso':
      return <CasoSgd casoId={ruta.casoId} />
    case 'morosidad':
      return <Morosidad />
    case 'resolucion':
      return <CasoMora casoId={ruta.casoId} />
    case 'ingreso':
      return <Ingreso />
    case 'buses':
      return <Buses />
    case 'desconocida':
      return (
        <div className="pt-pagina">
          <ErrorPage
            status={404}
            scope="page"
            title="Esta pantalla no existe en el prototipo"
            description="Vuelve a la bandeja para seguir el recorrido."
            actions={
              <Button variant="primary" onClick={() => (location.hash = hrefDe('bandeja'))}>
                Ir a la bandeja
              </Button>
            }
          />
        </div>
      )
  }
}

function gruposDeNavegacion(ruta: Ruta, rol: Rol, misActivos: number): GrupoSidebar[] {
  const actual = (id: string) => ruta.id === id || (id === 'bandeja' && ruta.id === 'ticket')
  // Formularios simples: quien los usa no opera la consola (HU-ATC-059 y 060).
  if (rol === 'CONTROL_ACCESO') return [{ label: 'Operación', items: [{ href: hrefDe('ingreso'), label: 'Ingreso a proyecto', icon: <Icon name="plus" />, current: ruta.id === 'ingreso' }] }]
  if (rol === 'CLIENTE') return [{ label: 'Mi Portal', items: [{ href: hrefDe('buses'), label: 'Buses del Entrega Fest', icon: <Icon name="calendar" />, current: ruta.id === 'buses' }] }]
  const operacion: GrupoSidebar = {
    label: 'Operación',
    items: [
      { href: hrefDe('bandeja'), label: 'Bandeja', icon: <Icon name="list" />, current: actual('bandeja'), badge: misActivos ? <Badge size="sm" count={misActivos} /> : undefined },
      ...(['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'ADMIN_FUNCIONAL'].includes(rol) ? [{ href: hrefDe('midia'), label: 'Mi día', icon: <Icon name="calendar" />, current: ruta.id === 'midia' }] : []),
      ...(puede.atender(rol) || rol === 'COORDINADOR_CX' ? [{ href: hrefDe('clientes'), label: 'Clientes', icon: <Icon name="search" />, current: ruta.id === 'clientes' || ruta.id === 'cliente' }] : []),
      { href: hrefDe('nuevo'), label: 'Nuevo ticket', icon: <Icon name="plus" />, current: actual('nuevo') },
      ...(puedeVerMora(rol) ? [{ href: hrefDe('morosidad'), label: 'Resolución por morosidad', icon: <Icon name="file-warning" />, current: ruta.id === 'morosidad' || ruta.id === 'resolucion' }] : []),
      ...(rol === 'SUPERVISOR' ? [{ href: hrefDe('ingreso'), label: 'Ingreso a proyecto', icon: <Icon name="plus" />, current: ruta.id === 'ingreso' }] : []),
      ...(['COORDINADOR_CX', 'MODERADOR_EVENTO', 'SUPERVISOR'].includes(rol) ? [{ href: hrefDe('buses'), label: 'Buses del Entrega Fest', icon: <Icon name="calendar" />, current: ruta.id === 'buses' }] : []),
      ...(puede.verLibro(rol)
        ? [{ href: hrefDe('libro'), label: 'Libro de Reclamaciones', icon: <Icon name="file" />, current: ruta.id === 'libro' || ruta.id === 'asiento' }]
        : []),
      ...(rol !== 'SIN_ATENCION' ? [{ href: hrefDe('garantias'), label: 'Garantías postventa', icon: <Icon name="building" />, current: ruta.id === 'garantias' || ruta.id === 'garantia' }] : []),
      ...(puede.verMesa(rol) ? [{ href: hrefDe('mesa'), label: 'Mesa de Casos SGD', icon: <Icon name="lock" />, current: ruta.id === 'mesa' || ruta.id === 'caso' }] : []),
    ],
  }
  const gestion: GrupoSidebar = {
    label: 'Gestión e integraciones',
    items: [
      ...(rol === 'ADMIN_FUNCIONAL' ? [{ href: hrefDe('configuracion'), label: 'Configuración', icon: <Icon name="filter" />, current: ruta.id === 'configuracion' }] : []),
      ...(rol !== 'SIN_ATENCION' && rol !== 'MODERADOR_EVENTO' && rol !== 'MESA_SGD' && rol !== 'ADMIN_FUNCIONAL' ? [{ href: hrefDe('urbemind'), label: 'Integración UrbeMind', icon: <Icon name="grid" />, current: ruta.id === 'urbemind' }] : []),
      ...(rol === 'COORDINADOR_CX' || rol === 'SUPERVISOR' ? [{ href: hrefDe('torre'), label: 'Torre de Control CX', icon: <Icon name="eye" />, current: ruta.id === 'torre' }] : []),
      ...(rol === 'COORDINADOR_CX' || rol === 'MODERADOR_EVENTO' ? [{ href: hrefDe('fest'), label: 'EntregaFest en vivo', icon: <Icon name="star" />, current: ruta.id === 'fest' }] : []),
    ],
  }
  const supervision: GrupoSidebar = {
    label: 'Supervisión',
    items: [
      ...(puede.reasignarEnBloque(rol) ? [{ href: hrefDe('reasignar'), label: 'Reasignar en bloque', icon: <Icon name="user" />, current: actual('reasignar') }] : []),
      ...(puede.verAlertas(rol) ? [{ href: hrefDe('alertas'), label: 'Alertas SLA', icon: <Icon name="bell" />, current: actual('alertas') }] : []),
      ...(puede.verCierreE2E(rol) ? [{ href: hrefDe('cierre'), label: 'Cierre end-to-end', icon: <Icon name="clock" />, current: actual('cierre') }] : []),
      ...(puede.editarPoliticas(rol) ? [{ href: hrefDe('politicas'), label: 'Políticas SLA', icon: <Icon name="file" />, current: actual('politicas') }] : []),
    ],
  }
  return [operacion, ...(supervision.items.length ? [supervision] : []), ...(gestion.items.length ? [gestion] : [])]
}
