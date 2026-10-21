// Lo que la «Operación en Vivo» (src/vivo) toma de los chunks del artifact, además de lo que ya declara src/portal/externos.d.ts
// (React, Button, Badge, Tag, PageHeader, hooks de estado y persona, ruta, CardHeader y Select). Nombres minificados del chunk.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'aybar:prototipo' {
  export const u: any // Drawer
  export const n: any // SegmentedControl
  export const m: any // CardPairs
}
declare module 'aybar:ProgressBar' { export const t: any }
// Escenas three.js (src/three, compiladas a escenas-three.js): la vista toma de ahí la escena de Daniel
declare module 'aybar:escenas' {
  export const montarVivoDaniel: (o: import('../three/vivo-daniel.ts').OptsVivo) => () => void
  export const leerTokenRgb: typeof import('../three/vivo-daniel.ts').leerTokenRgb
}
