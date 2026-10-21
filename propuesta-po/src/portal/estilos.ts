// Estilos propios de Mi Portal. Solo tokens --aybar-* (siguen tema claro/oscuro, paleta y densidad de «Apariencia»);
// el resto lo ponen las clases del sistema de diseño (ay-*) y las utilidades del prototipo (pt-*).
const CSS = `
/* .pt-pagina va en la hoja del artifact, que carga después: hace falta más especificidad para el aire de arriba */
.pt-pagina.pp{display:grid;gap:var(--aybar-space-5);padding-block-start:var(--aybar-space-5)}
.pp-cab{display:flex;flex-wrap:wrap;align-items:center;gap:var(--aybar-space-3) var(--aybar-space-5);padding:var(--aybar-space-3) var(--aybar-space-4);
  background:var(--aybar-color-bg-surface);border:1px solid var(--aybar-color-border-subtle);border-radius:var(--aybar-radius-lg)}
.pp-cab__quien{display:flex;align-items:center;gap:var(--aybar-space-3);min-inline-size:0;flex:1 1 14rem}
.pp-cab__av{display:grid;place-items:center;inline-size:2.25rem;block-size:2.25rem;border-radius:var(--aybar-radius-full);flex:none;
  background:var(--aybar-color-bg-brand-subtle);color:var(--aybar-color-fg-default);font-weight:var(--aybar-font-weight-bold);font-size:var(--aybar-font-size-sm)}
.pp-cab__quien b{display:block;color:var(--aybar-color-fg-default)}
.pp-cab__quien small{display:block;color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs)}
.pp-subnav{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2)}
.pp-subnav a{display:inline-flex;align-items:center;min-block-size:2.25rem;padding:0 var(--aybar-space-3);border-radius:var(--aybar-radius-full);
  color:var(--aybar-color-fg-default);text-decoration:none;font-size:var(--aybar-font-size-sm);font-weight:var(--aybar-font-weight-medium);border:1px solid var(--aybar-color-border-subtle)}
.pp-subnav a:hover{background:var(--aybar-color-bg-surface-sunken)}
.pp-subnav a[aria-current=page]{background:var(--aybar-color-bg-brand-subtle);border-color:var(--aybar-color-border-accent)}
.pp a:focus-visible,.pp button:focus-visible{outline:var(--aybar-focus-ring-width) solid var(--aybar-color-border-focus);outline-offset:var(--aybar-focus-ring-offset)}
.pp-acceso{inline-size:min(100%,30rem);justify-self:center}
.pp-sim{display:grid;gap:var(--aybar-space-2);padding:var(--aybar-space-3) var(--aybar-space-4);border:1px dashed var(--aybar-color-border-default);
  border-radius:var(--aybar-radius-md);background:var(--aybar-color-bg-surface-sunken);color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-sm)}
.pp-sim > b{color:var(--aybar-color-fg-default);font-size:var(--aybar-font-size-xs);text-transform:uppercase;letter-spacing:.04em}
.pp-sim ul{margin:0;padding:0;list-style:none;display:grid;gap:var(--aybar-space-2)}
.pp-sim li{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:var(--aybar-space-3)}
.pp-codigo{font-family:var(--aybar-family-mono);font-size:var(--aybar-font-size-lg);font-weight:var(--aybar-font-weight-bold);letter-spacing:.2em;color:var(--aybar-color-fg-default)}
.pp-etapa{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs);margin:0}
.pp-rejilla{display:grid;gap:var(--aybar-space-5);grid-template-columns:minmax(0,1fr)}
@media (min-width:64rem){.pp-rejilla{grid-template-columns:minmax(0,2fr) minmax(16rem,1fr);align-items:start}}
.pp-datos{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--aybar-space-2) var(--aybar-space-4);margin:0;font-size:var(--aybar-font-size-sm)}
.pp-datos dt{color:var(--aybar-color-fg-muted)}
.pp-datos dd{margin:0;color:var(--aybar-color-fg-default);overflow-wrap:anywhere}
.pp-resumen{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2) var(--aybar-space-5);margin:0;font-size:var(--aybar-font-size-sm)}
.pp-resumen div{display:grid;gap:2px}
.pp-resumen dt{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs)}
.pp-resumen dd{margin:0;color:var(--aybar-color-fg-default);font-weight:var(--aybar-font-weight-semibold)}
.pp-paso__area{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs);margin:0}
.pp-paso__det{color:var(--aybar-color-fg-default);font-size:var(--aybar-font-size-sm);margin:0}
.pp-msgs{display:grid;gap:var(--aybar-space-3);margin:0;padding:0;list-style:none}
.pp-msg{display:grid;gap:var(--aybar-space-1);margin:0;padding:var(--aybar-space-3);border-radius:var(--aybar-radius-md);max-inline-size:44rem;
  background:var(--aybar-color-bg-surface-sunken);border:1px solid var(--aybar-color-border-subtle)}
.pp-msg[data-quien=cliente]{justify-self:end;background:var(--aybar-color-bg-brand-subtle);border-color:var(--aybar-color-border-accent)}
.pp-msg__cab{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--aybar-space-2);font-size:var(--aybar-font-size-xs);color:var(--aybar-color-fg-muted)}
.pp-msg__cab b{color:var(--aybar-color-fg-default)}
.pp-msg p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--aybar-color-fg-default);font-size:var(--aybar-font-size-sm)}
.pp-avisos{display:grid;gap:var(--aybar-space-2);margin:0;padding:0;list-style:none;font-size:var(--aybar-font-size-sm)}
.pp-avisos li{display:grid;gap:2px;padding-block-end:var(--aybar-space-2);border-block-end:1px solid var(--aybar-color-border-subtle)}
.pp-avisos li:last-child{border:0;padding:0}
.pp-avisos small{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs)}
.pp-adjuntos{display:grid;gap:var(--aybar-space-2);margin:0;padding:0;list-style:none}
.pp-acciones{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2);align-items:center}
.pp-legal{display:grid;gap:var(--aybar-space-2);font-size:var(--aybar-font-size-sm)}
.pp-legal p{margin:0}
`

export function inyectarEstilos() {
  if (document.getElementById('pp-estilos')) return
  const s = document.createElement('style')
  s.id = 'pp-estilos'
  s.textContent = CSS
  document.head.append(s)
}
