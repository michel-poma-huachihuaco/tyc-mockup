import { CommandPalette, Icon } from '@aybarcorp/ui'
import type { CommandItem } from '@aybarcorp/ui'
import { useEffect, useMemo, useState } from 'react'
import { navegar } from '../../navegacion'
import { buscar, entradasDeCatalogo, entradasDeGaleria } from '../busqueda'
import type { EntradaBusqueda, TipoEntrada } from '../busqueda'
import { useGaleria } from '../contexto'
import { iconoDe } from '../iconos'
import { SECCIONES } from '../rutas'
import { cargarCatalogo } from '../vitrina/fuente'

const GRUPOS: readonly { tipo: TipoEntrada; label: string }[] = [
  { tipo: 'pantalla', label: 'Pantallas de la galería' },
  { tipo: 'componente', label: 'Componentes' },
  { tipo: 'caso', label: 'Casos' },
]

/**
 * El buscador global: un disparador con forma de campo en la Navbar y la Command Palette
 * del framework, modal, que también abre Ctrl K (⌘ K) desde cualquier sitio que no sea un
 * campo de texto. Busca pantallas, componentes y casos con los sinónimos en español de
 * sinonimos.ts; Enter navega y Escape devuelve el foco a donde estaba.
 *
 * El índice de componentes sale del catálogo instalado, que se carga al abrir por primera vez.
 */
export function Buscador() {
  const galeria = useGaleria()
  const [abierta, setAbierta] = useState(false)
  const [consulta, setConsulta] = useState('')
  const [indice, setIndice] = useState<readonly EntradaBusqueda[]>(entradasDeGaleria)
  const [cargando, setCargando] = useState(false)
  const conCatalogo = indice.some((e) => e.tipo === 'componente')

  // El catálogo se indexa la primera vez que se abre (o ya está, si otra pantalla lo cargó).
  useEffect(() => {
    if (!abierta || conCatalogo) return
    let vigente = true
    setCargando(true)
    cargarCatalogo().then(
      (datos) => {
        if (!vigente) return
        setIndice([...entradasDeGaleria(), ...entradasDeCatalogo(datos.catalogo, datos.fichas)])
        setCargando(false)
      },
      () => {
        // Sin catálogo se sigue buscando entre las pantallas de la galería.
        if (vigente) setCargando(false)
      },
    )
    return () => {
      vigente = false
    }
  }, [abierta, conCatalogo])

  const grupos = useMemo(() => {
    const ir = (ruta: string) => () => navegar(ruta)
    if (!consulta.trim()) {
      return [
        {
          label: 'Secciones',
          items: SECCIONES.filter((s) => galeria.admin || !s.soloAdmin).map<CommandItem>((s) => ({
            id: `pantalla:${s.id}`,
            title: s.nombre,
            context: s.descripcion,
            icon: iconoDe(s.id),
            onSelect: ir(s.ruta),
          })),
        },
      ]
    }
    const resultados = buscar(indice, consulta, { porTipo: { pantalla: 6, componente: 8, caso: 6 }, admin: galeria.admin })
    return GRUPOS.map(({ tipo, label }) => ({
      label,
      items: resultados
        .filter((r) => r.tipo === tipo)
        .map<CommandItem>((r) => ({ id: r.id, title: r.titulo, context: r.contexto, onSelect: ir(r.ruta) })),
    })).filter((g) => g.items.length > 0)
  }, [consulta, indice, galeria.admin])

  return (
    <>
      <button
        type="button"
        className="gl-buscador"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setAbierta(true)}
      >
        <Icon name="search" size={16} />
        <span className="gl-buscador__texto">Buscar en la galería…</span>
        <kbd className="gl-buscador__atajo" aria-hidden="true">
          Ctrl K
        </kbd>
      </button>
      <CommandPalette
        open={abierta}
        onOpenChange={(valor) => {
          setAbierta(valor)
          if (!valor) setConsulta('')
        }}
        size="lg"
        label="Buscar en la galería"
        groups={grupos}
        onQuery={setConsulta}
        loading={cargando}
        emptyMessage="Nada coincide. Prueba con «tabla», «fecha», «aviso» o el nombre en inglés."
      />
    </>
  )
}
