// Chunks del artifact que Mi Portal importa en tiempo de ejecución. No tienen tipos (solo existen compilados):
// vite.portal.config.ts los deja como externos y reescribe cada especificador «aybar:*» a su archivo en artefacto/assets.
// Los nombres de export son los minificados del chunk; kit.ts les pone nombre legible.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'aybar:comun' {
  export const Ii: () => any // React
  export const Fi: () => any // react/jsx-runtime
  export const Ai: any // Button
  export const $r: any // Badge
  export const Qr: any // Tag
  export const Gr: any // Alert
  export const Nr: any // PageHeader
  export const Mr: any // ErrorState
  export const ii: any // FileUpload
  export const t: any // alerta de error de una acción (ErrorAccion)
  export const x: () => { enCurso: boolean; error: unknown; ejecutar: <T>(fn: () => Promise<T>) => Promise<T | undefined>; limpiar: () => void }
  export const p: (e: unknown) => Record<string, string> // errores por campo de un error 400
  export const k: () => { datos: any; sim: any } // estado del prototipo (hook)
  export const A: () => { id: string; nombre: string; rol: string; area: string } // persona de la sesión (hook)
  export const Wr: (aviso: { message: string; tone?: string }) => void // aviso emergente
  export const Kn: (clienteId: string) => any // cliente del maestro (SIGDA/TAXON simulado)
  export const Un: any[] // clientes del maestro
  export const Ut: (cliente: any) => any[] // lotes y contratos del cliente
  export const Ar: (tipo: string) => string // nombre del tipo de ticket
  export const mr: Record<string, string> // nombre del área
  export const m: (d: Date) => string // fecha corta con hora
  export const g: (d: Date) => string // fecha larga con hora
  export const h: (d: Date) => string // fecha sin hora (día de la semana, día y mes)
  export const C: (consulta: string) => boolean // hook: coincide la media query
  export const u: string // «(min-width: 768px)», el corte de escritorio del prototipo
  export const Jn: (ruta: string) => string // `#/${ruta}`
  export const __ptNucleo: import('./tipos.ts').Nucleo
}
declare module 'aybar:prototipo' {
  export const h: any // CardHeader
  export const x: any // Select
}
declare module 'aybar:FormField' { export const t: any }
declare module 'aybar:Textarea' { export const t: any }
declare module 'aybar:Input' { export const t: any }
declare module 'aybar:CardBody' { export const n: any; export const t: any }
declare module 'aybar:EmptyState' { export const t: any }
declare module 'aybar:DataGrid' { export const t: any }
declare module 'aybar:Breadcrumb' { export const t: any }
declare module 'aybar:FileItem' { export const t: any }
declare module 'aybar:Radio' { export const n: any; export const t: any }
