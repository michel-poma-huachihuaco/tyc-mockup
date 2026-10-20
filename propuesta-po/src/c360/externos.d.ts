// Lo que la «Consulta 360 del Cliente» (src/c360) toma de los chunks del artifact, además de lo que ya declaran
// src/portal/externos.d.ts (React, Button, Badge, Tag, Alert, PageHeader, CardHeader, Select, Card, CardBody, Breadcrumb,
// FormField, EmptyState, hooks de estado y persona, cliente del maestro y lotes) y src/vivo/externos.d.ts (SegmentedControl,
// CardPairs y leerTokenRgb de escenas-three.js). vite.portal.config.ts deja cada «aybar:*» como externo y lo reescribe a su
// archivo. Nombres minificados del chunk.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'aybar:prototipo' {
  export const c: any // Tabs
  export const v: any // SearchInput
  export const S: any // icono del sistema (candado, más…)
}
declare module 'aybar:Dialog' { export const t: any }
declare module 'aybar:Table' { export const t: any }
// Modelo del mockup (chunk «comun»): la API, la simulación de fuentes caídas, los permisos por rol y las reglas de la 360
declare module 'aybar:comun' {
  export const E: any // API del prototipo (buscarClientes360, consultar360, buscarDocumentos, consultarMotor, iniciarLlamada…)
  export const O: any // simulación (fuente(código, caída), ajustar…)
  export const yt: readonly { id: string; nombre: string; requiere: string }[] // consultas del motor de José
  export const sn: Record<string, (rol: string) => boolean> // permisos por rol (atender, registrar, verLibro, verMesa…)
  export const At: (persona: any) => Record<'lotes' | 'tickets' | 'llamadas' | 'correos' | 'cuotas' | 'documentos', boolean> // secciones 360 por rol
  export const qn: (dni: string) => string // DNI enmascarado (4 dígitos + ••••)
  export const y: { telefono: string | null; cliente?: any } // aviso previo de «Nuevo ticket» (cliente elegido o modo interesado)
  export const Ht: (cliente: any, lote: any, ahora: Date, regularizado?: boolean) => any // cuotas de un lote (cronograma, saldo, mora)
  export const Nt: (datos: any, loteId: string) => boolean // ¿caso de resolución regularizado?
  export const Vt: (cliente: any) => any[] // documentos del cliente en el repositorio
  export const Q: readonly { id: string; unidad: string; clienteId: string; entregada: Date }[] // actas de entrega
  export const __h44: { areas: (personaId: string) => string[] } // áreas que una persona ve en la Bandeja (HU-044)
}
// Consulta 360 del PO (chunk Grafo360; parchear.mjs le añade estos exports): la vista de los 16 datos por rol y fuentes caídas,
// los sistemas de origen, el ticket del cliente por canal y la síntesis por reglas locales
declare module 'aybar:Grafo360' {
  export const __vista360: (datos: any, clienteId: string, persona: any) => any
  export const __fuentes360: readonly { id: string; n: string; d: string; ms: number; fuente: string | null }[]
  export const __ticketCon360: (datos: any, clienteId: string, canal: string) => { t: any; con: boolean } | null
  export const __sintesis360: (vista: any, datos: any) => { texto: string; accion: string }
}
// Escenas three.js (src/three → escenas-three.js): la escena 3D y la vista 2D de la Consulta 360 de Daniel
declare module 'aybar:escenas' {
  export const montarGrafoDaniel: typeof import('../three/grafo360-daniel.ts').montarGrafoDaniel
  export const montarRed2D: typeof import('../three/red2d-daniel.ts').montarRed2D
}
