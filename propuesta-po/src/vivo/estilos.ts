// Estilos de contenedor de la «Operación en Vivo» de Daniel (frontend/src/styles.css de origin/prototipo-polar: escenario,
// ficha flotante) más el corte de la rejilla de KPI en pantallas estrechas. Solo tokens --aybar-*. Desde b3-j (HU-067): escena y
// registro de actividad lado a lado (CA-06), vista por área en lista (CA-09) y listas del panel del área (CA-04).
const CSS = `
.atc-vivo-stage-area{position:relative;overflow:hidden;min-block-size:calc(var(--aybar-space-4) * 38)}
.pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;
  inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}
.pl-atc-ficha-flotante--izq{inset-inline-start:var(--aybar-space-4);inset-inline-end:auto;inline-size:auto;max-inline-size:calc(100% - var(--aybar-space-8))}
.ay-grid.vv-grid{grid-template-columns:repeat(var(--vv-cols),minmax(0,1fr))}
@media (max-width:1000px){.ay-grid.vv-grid{grid-template-columns:repeat(auto-fill,minmax(calc(var(--aybar-space-4) * 11),1fr))}}
.vv-pagina .ay-pageheader__title .ay-row{display:inline-flex;vertical-align:middle;margin-inline-start:var(--aybar-space-3)}
.vv-pagina .ay-text--sm{font-size:var(--aybar-font-size-xs)}
.vv-planta{display:grid;grid-template-columns:minmax(0,1fr) calc(var(--aybar-space-4) * 16);gap:var(--aybar-space-3);align-items:start}
.vv-planta--sola{grid-template-columns:minmax(0,1fr)}
.vv-planta .atc-vivo-stage-area{min-block-size:calc(var(--aybar-space-4) * 30)}
.vv-registro{max-block-size:calc(var(--aybar-space-4) * 34);overflow-y:auto}
@media (max-width:1000px){.vv-planta{grid-template-columns:minmax(0,1fr)}.vv-registro{max-block-size:calc(var(--aybar-space-4) * 24)}}
.vv-ficha{margin-block-end:var(--aybar-space-3)}
.vv-areas{display:grid;grid-template-columns:repeat(auto-fill,minmax(calc(var(--aybar-space-4) * 17),1fr));gap:var(--aybar-space-3)}
.vv-lista-tk{list-style:none;margin:0;padding:0;display:grid;gap:var(--aybar-space-2)}
.vv-fila{display:flex;flex-wrap:wrap;align-items:center;gap:var(--aybar-space-2)}
.vv-nota{margin:0}
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
