// Estilos propios de la Consulta 360 de la rama de Daniel: su three/estilos.ts (lienzos 3D y 2D) y las reglas de su styles.css que
// usa la vista (.pl-atc-ficha-flotante, .atc-astra-canvas y los ajustes de .pl-atc-marco para filas con buscador, segmentado y
// select). Todo bajo .pl-c360 para no tocar la escena de la ficha del cliente ni del ticket (que también usan .pt-escena-grafo).
// Solo tokens --aybar-*.
const CSS = `
.pl-c360.pt-pagina--ancha{max-inline-size:none}
.pl-c360 .pt-escena-wrap{position:relative;inline-size:100%;min-inline-size:0;border-radius:var(--aybar-radius-lg);overflow:hidden}
.pl-c360 .pt-escena-grafo{position:relative;inline-size:100%;min-inline-size:0;border-radius:var(--aybar-radius-lg);border:var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);background:var(--aybar-color-bg-surface-sunken);overflow:hidden}
.pl-c360 .pt-escena-grafo[hidden],.pl-c360 .atc-astra-canvas[hidden]{display:none !important}
.pl-c360 .pt-escena-grafo canvas{display:block;inline-size:100%}
.pl-c360 .atc-astra-canvas{display:block;inline-size:100%;block-size:calc(var(--aybar-space-4) * 35)}
.pl-c360 .pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}
.pl-c360 .ay-segmented:not(.ay-segmented--fill){min-inline-size:0;flex-shrink:0}
.pl-c360 .ay-row>.ay-search{flex:1 1 calc(var(--aybar-space-16) * 3);max-inline-size:none}
.pl-c360 .ay-row>.ay-selectwrap{inline-size:auto}
.pl-c360 .ay-grid>.ay-card{cursor:pointer}
/* cabecera como ay-page-header de ui-angular en la consola de Daniel: panel de superficie, migas sin sangría y el estado
   (ayEstado) en su propia línea bajo el título */
.pl-c360 .ay-pageheader{background:var(--aybar-color-bg-surface)}
.pl-c360 .ay-pageheader>.ay-pageheader__row{padding-inline:clamp(var(--aybar-space-4),(100vw - var(--aybar-breakpoint-md)) * 10000,var(--aybar-space-6))}
.pl-c360 .ay-pageheader__title>.ay-row{flex-basis:100%}
/* visor de contratos: el Dialog del artifact con las medidas de ay-modal size="lg" de ui-angular (va en un portal, fuera de .pl-c360) */
.ay-dialog[data-c360-visor]{inline-size:min(calc(var(--aybar-space-4) * 48),calc(100vw - var(--aybar-space-8)));max-inline-size:none;max-block-size:calc(100vh - var(--aybar-space-16));background:var(--aybar-color-bg-surface)}
.ay-dialog[data-c360-visor] .ay-dialog__header{padding:var(--aybar-space-6) var(--aybar-space-6) var(--aybar-space-4);border-block-end:0}
.ay-dialog[data-c360-visor] .ay-dialog__body{padding:0 var(--aybar-space-6) var(--aybar-space-6);font-size:var(--aybar-font-size-sm);line-height:var(--aybar-font-leading-relaxed)}
.ay-dialog[data-c360-visor] .ay-card__pairs dd{overflow-wrap:anywhere}
`

let hecho = false
export function inyectarEstilos(): void {
  if (hecho || typeof document === 'undefined') return
  hecho = true
  if (document.getElementById('c360-daniel-estilos')) return
  const s = document.createElement('style')
  s.id = 'c360-daniel-estilos'
  s.textContent = CSS
  document.head.append(s)
}
