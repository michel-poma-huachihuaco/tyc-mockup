import { Button, Drawer, IconButton, Navbar, SegmentedControl, Sidebar, SkipLink } from '@aybarcorp/ui'
import type { GrupoSidebar, ItemSidebar } from '@aybarcorp/ui'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { enlaceInterno } from '../../navegacion'
import { BotonTema } from '../../pantallas/BotonTema'
import { Marca } from '../../pantallas/Marca'
import { NOMBRE_PROYECTO } from '../../proyecto'
import { OPCIONES_VER_COMO, esVerComo } from '../acceso'
import { useGaleria } from '../contexto'
import { IconoPaleta, iconoDe } from '../iconos'
import { BASE, SECCIONES, SECCIONES_ADMIN, SECCIONES_CUENTA, rutaDe } from '../rutas'
import type { Pantalla, SeccionGaleria } from '../rutas'
import { useMedia, useRecordado } from '../utiles'
import { ORDEN_FAMILIAS, slugFamilia } from '../vitrina/catalogo'
import { Buscador } from './Buscador'
import { MenuCuenta } from './MenuCuenta'
import { PanelPersonalizar } from './PanelPersonalizar'

const ID_PANEL = 'gl-personalizar'
const esPlegada = (valor: unknown): valor is 'si' | 'no' => valor === 'si' || valor === 'no'

/**
 * El marco de las pantallas de la galería, en el orden del sistema de diseño: SkipLink,
 * Navbar (marca, buscador con Ctrl K, «Ver como», «Personalizar», tema y cuenta), la barra
 * lateral con las secciones —en el celular, un Drawer que abre el botón de la Navbar—, el
 * `main#contenido` y, a la derecha, el panel «Personalizar» (un Side Panel redimensionable
 * que sigue abierto al navegar: su estado vive en la galería, por encima de la pantalla).
 */
export function MarcoGaleria({ pantalla, children }: { pantalla: Pantalla; children: ReactNode }) {
  const galeria = useGaleria()
  const raiz = useRef<HTMLDivElement>(null)
  const barra = useRef<HTMLElement>(null)
  const [cajon, setCajon] = useState(false)
  const [plegada, setPlegada] = useRecordado('local', 'aybar:galeria:barra-plegada', esPlegada, 'no')
  const ruta = rutaDe(pantalla)
  const ancha = useMedia('(min-width: 1280px)')

  // Lo que se fija bajo la Navbar (la barra lateral, el panel) necesita su alto.
  useLayoutEffect(() => {
    const elemento = barra.current
    const contenedor = raiz.current
    if (!elemento || !contenedor) return
    const medir = () => contenedor.style.setProperty('--gl-navbar-alto', `${elemento.offsetHeight}px`)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  const grupos = gruposDeLaBarra(ruta, galeria.admin)

  return (
    <div ref={raiz} className="gl-marco">
      <SkipLink scrollMargin="var(--gl-navbar-alto, 0px)" />
      <Navbar
        ref={barra}
        brand={
          <a className="ay-navbar__brand gl-marca" {...enlaceInterno(BASE)}>
            <Marca nombre="" />
            <span className="gl-marca__proyecto">{NOMBRE_PROYECTO}</span>
            <span className="gl-marca__galeria">Galería</span>
          </a>
        }
        search={<Buscador />}
        onMenuClick={() => setCajon(true)}
        actions={
          <>
            {galeria.puedeVerComo && ancha ? (
              <span className="gl-ver-como">
                <VerComo />
              </span>
            ) : null}
            <span className="gl-desde-md">
              <Button
                variant={galeria.personalizar ? 'primary' : 'secondary'}
                size="sm"
                leadingIcon={<IconoPaleta />}
                aria-expanded={galeria.personalizar}
                aria-controls={galeria.personalizar ? ID_PANEL : undefined}
                onClick={() => galeria.abrirPersonalizar(!galeria.personalizar)}
              >
                Personalizar
              </Button>
            </span>
            <span className="gl-hasta-md">
              <IconButton
                variant="secondary"
                label="Personalizar la apariencia"
                icon={<IconoPaleta />}
                aria-expanded={galeria.personalizar}
                onClick={() => galeria.abrirPersonalizar(!galeria.personalizar)}
              />
            </span>
            <BotonTema />
            {/* Sin sitio para «Ver como» en la barra, va en el menú de la cuenta. */}
            <MenuCuenta conVerComo={galeria.puedeVerComo && !ancha} />
          </>
        }
      />
      <div className="gl-cuerpo ay-split">
        <div className="gl-columnas">
          <Sidebar
            label="Secciones de la galería"
            groups={grupos}
            collapsed={plegada === 'si'}
            onCollapsedChange={(c) => setPlegada(c ? 'si' : 'no')}
            footer={
              <p className="gl-barra__pie">
                Solo en desarrollo. Se quita con <code>npm run demo:quitar</code>.
              </p>
            }
          />
          <main id="contenido" tabIndex={-1} className="gl-principal">
            {children}
          </main>
        </div>
        <PanelPersonalizar id={ID_PANEL} />
      </div>
      <Drawer
        id="nav-drawer"
        side="start"
        size="sm"
        title="Galería"
        open={cajon}
        onOpenChange={setCajon}
      >
        <div
          className="gl-cajon"
          onClick={(evento) => {
            // Un enlace del cajón navega y lo cierra; el foco vuelve al botón del menú.
            if (evento.target instanceof Element && evento.target.closest('a[href]')) setCajon(false)
          }}
        >
          {grupos.map((grupo) => (
            <nav key={grupo.label} className="gl-cajon__grupo" aria-label={grupo.label}>
              <p className="gl-cajon__titulo" aria-hidden="true">
                {grupo.label}
              </p>
              <ul className="gl-cajon__lista">
                {grupo.items.map((item) => (
                  <li key={item.href}>
                    <a className="gl-cajon__enlace" href={item.href} aria-current={item.current ? 'page' : undefined}>
                      <span className="gl-cajon__icono" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                    {item.items?.length ? (
                      <ul className="gl-cajon__sublista">
                        {item.items.map((sub) => (
                          <li key={sub.href}>
                            <a className="gl-cajon__enlace gl-cajon__enlace--sub" href={sub.href} aria-current={sub.current ? 'page' : undefined}>
                              {sub.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Drawer>
    </div>
  )
}

/** «Ver como»: baja los roles dentro de la galería (nunca los sube). */
function VerComo() {
  const galeria = useGaleria()
  return (
    <SegmentedControl
      size="sm"
      label="Ver como"
      options={OPCIONES_VER_COMO.map((o) => ({ value: o.valor, label: o.etiqueta }))}
      value={galeria.verComo}
      onValueChange={(valor) => {
        if (esVerComo(valor)) galeria.cambiarVerComo(valor)
      }}
    />
  )
}

/**
 * Las secciones en tres grupos. La vitrina abre sus familias, Mi cuenta y Administración sus
 * pestañas; una sección sin permiso (Administración viendo como usuario) no se incluye, en
 * lugar de mostrarse deshabilitada.
 */
function gruposDeLaBarra(ruta: string, admin: boolean): GrupoSidebar[] {
  const actual = (href: string) => ruta === href
  const dentro = (href: string) => ruta === href || ruta.startsWith(`${href}/`)
  const sub: Partial<Record<SeccionGaleria['id'], ItemSidebar[]>> = {
    vitrina: ORDEN_FAMILIAS.map((familia) => {
      const href = `${BASE}/vitrina/${slugFamilia(familia)}`
      return { href, label: familia, current: dentro(href) }
    }),
    cuenta: SECCIONES_CUENTA.map((s) => {
      const href = s.id === 'perfil' ? `${BASE}/cuenta` : `${BASE}/cuenta/${s.id}`
      return { href, label: s.nombre, current: actual(href) }
    }),
    admin: SECCIONES_ADMIN.map((s) => {
      const href = s.id === 'resumen' ? `${BASE}/admin` : `${BASE}/admin/${s.id}`
      return { href, label: s.nombre, current: actual(href) }
    }),
  }
  const porGrupo = new Map<string, ItemSidebar[]>()
  for (const seccion of SECCIONES) {
    if (seccion.soloAdmin && !admin) continue
    const items = sub[seccion.id]
    const conHijoActual = items?.some((i) => i.current) ?? false
    const item: ItemSidebar = {
      href: seccion.ruta,
      label: seccion.nombre,
      icon: iconoDe(seccion.id),
      // La sección es la actual en su ruta exacta, y en cualquiera de sus pantallas si no
      // hay un subnivel que ya lo diga.
      current: seccion.ruta === BASE ? actual(BASE) : !conHijoActual && dentro(seccion.ruta),
      items,
    }
    porGrupo.set(seccion.grupo, [...(porGrupo.get(seccion.grupo) ?? []), item])
  }
  return [...porGrupo].map(([label, items]) => ({ label, items }))
}
