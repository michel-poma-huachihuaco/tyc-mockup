import { BarraFlotante } from '../../marco/BarraFlotante'
import { BASE, VARIANTES_INGRESO } from '../../rutas'
import type { VarianteIngreso } from '../../rutas'
import { PANTALLAS_INGRESO } from './variantes'

/**
 * /demo/ingreso/:variante: la maqueta a pantalla completa, sin el marco de la galería, con
 * la barra flotante para volver al índice y pasar a la anterior o la siguiente. Es pública:
 * se puede ver sin sesión, como una pantalla de acceso de verdad.
 */
export default function PantallaVariante({ variante }: { variante: VarianteIngreso }) {
  const i = VARIANTES_INGRESO.findIndex((v) => v.id === variante)
  const actual = VARIANTES_INGRESO[i]
  const anterior = VARIANTES_INGRESO[i - 1]
  const siguiente = VARIANTES_INGRESO[i + 1]
  const Pantalla = PANTALLAS_INGRESO[variante]
  const destino = (v: (typeof VARIANTES_INGRESO)[number] | undefined) => (v ? { href: `${BASE}/ingreso/${v.id}`, label: v.nombre } : null)
  return (
    <div className="gl-completo gl-completo--ingreso">
      <Pantalla key={variante} />
      <BarraFlotante
        titulo={`${i + 1} de ${VARIANTES_INGRESO.length} · ${actual?.nombre ?? variante}`}
        volver={{ href: `${BASE}/ingreso`, label: 'Pantallas de ingreso' }}
        anterior={destino(anterior)}
        siguiente={destino(siguiente)}
      />
    </div>
  )
}
