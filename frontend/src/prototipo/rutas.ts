import { useSyncExternalStore } from 'react'

/**
 * Rutas por hash (`#/bandeja`, `#/ticket/tk-12`): el prototipo funciona igual servido por
 * `npm run dev` que publicado como página suelta, sin depender del servidor.
 */

export type Ruta =
  | { readonly id: 'bandeja' }
  | { readonly id: 'nuevo' }
  | { readonly id: 'ticket'; readonly ticketId: string }
  | { readonly id: 'reasignar' }
  | { readonly id: 'alertas' }
  | { readonly id: 'cierre' }
  | { readonly id: 'politicas' }
  | { readonly id: 'libro' }
  | { readonly id: 'mesa' }
  | { readonly id: 'garantias' }
  | { readonly id: 'urbemind' }
  | { readonly id: 'midia' }
  | { readonly id: 'morosidad' }
  | { readonly id: 'ingreso' }
  | { readonly id: 'buses' }
  | { readonly id: 'clientes' }
  | { readonly id: 'cliente'; readonly clienteId: string }
  | { readonly id: 'configuracion' }
  | { readonly id: 'torre' }
  | { readonly id: 'fest' }
  | { readonly id: 'garantia'; readonly garantiaId: string }
  | { readonly id: 'caso'; readonly casoId: string }
  | { readonly id: 'asiento'; readonly asientoId: string }
  | { readonly id: 'resolucion'; readonly casoId: string }
  | { readonly id: 'desconocida'; readonly hash: string }

export function leerRuta(hash: string): Ruta {
  const partes = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [primera = 'bandeja', segunda] = partes
  switch (primera) {
    case 'bandeja':
    case 'urbemind':
    case 'midia':
    case 'ingreso':
    case 'buses':
    case 'configuracion':
    case 'torre':
    case 'fest':
    case 'nuevo':
    case 'reasignar':
    case 'alertas':
    case 'cierre':
    case 'politicas':
      return partes.length <= 1 ? { id: primera } : { id: 'desconocida', hash }
    case 'clientes':
      return segunda ? { id: 'cliente', clienteId: segunda } : { id: 'clientes' }
    case 'libro':
      return segunda ? { id: 'asiento', asientoId: segunda } : { id: 'libro' }
    case 'mesa':
      return segunda ? { id: 'caso', casoId: segunda } : { id: 'mesa' }
    case 'garantias':
      return segunda ? { id: 'garantia', garantiaId: segunda } : { id: 'garantias' }
    case 'ticket':
      return segunda ? { id: 'ticket', ticketId: segunda } : { id: 'desconocida', hash }
    case 'morosidad':
      return segunda ? { id: 'resolucion', casoId: segunda } : { id: 'morosidad' }
    default:
      return { id: 'desconocida', hash }
  }
}

export const hrefDe = (ruta: string) => `#/${ruta}`

function suscribir(avisar: () => void) {
  addEventListener('hashchange', avisar)
  return () => removeEventListener('hashchange', avisar)
}

export function useHash(): string {
  return useSyncExternalStore(suscribir, () => location.hash)
}
