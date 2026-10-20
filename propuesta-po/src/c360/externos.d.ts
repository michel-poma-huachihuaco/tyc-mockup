// Lo que la «Consulta 360 del Cliente» (src/c360) toma de los chunks del artifact, además de lo que ya declaran
// src/portal/externos.d.ts (React, Button, Badge, Tag, Alert, PageHeader, CardHeader, Select, Card, CardBody, Breadcrumb,
// FormField y EmptyState) y src/vivo/externos.d.ts (SegmentedControl, CardPairs y leerTokenRgb de escenas-three.js).
// vite.portal.config.ts deja cada «aybar:*» como externo y lo reescribe a su archivo. Nombres minificados del chunk.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'aybar:prototipo' {
  export const c: any // Tabs
  export const v: any // SearchInput
}
declare module 'aybar:Dialog' { export const t: any }
declare module 'aybar:Table' { export const t: any }
// Escenas three.js (src/three → escenas-three.js): la escena 3D y la vista 2D de la Consulta 360 de Daniel
declare module 'aybar:escenas' {
  export const montarGrafoDaniel: typeof import('../three/grafo360-daniel.ts').montarGrafoDaniel
  export const montarRed2D: typeof import('../three/red2d-daniel.ts').montarRed2D
}
