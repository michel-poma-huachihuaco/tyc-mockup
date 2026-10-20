// Estilos de contenedor de la «Operación en Vivo» de Daniel (frontend/src/styles.css de origin/prototipo-polar: escenario,
// ficha flotante) más el corte de la rejilla de KPI en pantallas estrechas. Solo tokens --aybar-*.
const CSS = `
.atc-vivo-stage-area{position:relative;overflow:hidden;min-block-size:calc(var(--aybar-space-4) * 38)}
.pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;
  inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}
.pl-atc-ficha-flotante--izq{inset-inline-start:var(--aybar-space-4);inset-inline-end:auto;inline-size:auto;max-inline-size:calc(100% - var(--aybar-space-8))}
.ay-grid.vv-grid{grid-template-columns:repeat(var(--vv-cols),minmax(0,1fr))}
@media (max-width:1000px){.ay-grid.vv-grid{grid-template-columns:repeat(auto-fill,minmax(calc(var(--aybar-space-4) * 11),1fr))}}
.vv-pagina .ay-pageheader__title .ay-row{display:inline-flex;vertical-align:middle;margin-inline-start:var(--aybar-space-3)}
.vv-pagina .ay-text--sm{font-size:var(--aybar-font-size-xs)}
`

let hecho = false
export function inyectarEstilosVivo(): void {
  if (hecho || typeof document === 'undefined') return
  hecho = true
  const s = document.createElement('style')
  s.id = 'vv-estilos'
  s.textContent = CSS
  document.head.append(s)
}
