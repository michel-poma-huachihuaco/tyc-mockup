// Estilos de contenedor para los lienzos WebGL 3D y 2D de Consulta 360 y Operación en Vivo.
// Se inyectan una sola vez desde las escenas y usan exclusivamente tokens --aybar-*.

const CSS = `
.pt-escena-wrap {
  position: relative;
  inline-size: 100%;
  min-inline-size: 0;
  border-radius: var(--aybar-radius-lg);
  overflow: hidden;
}

.pt-escena-grafo {
  position: relative;
  inline-size: 100%;
  min-inline-size: 0;
  border-radius: var(--aybar-radius-lg);
  border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);
  background: var(--aybar-color-bg-surface-sunken);
  overflow: hidden;
}

.pt-escena-grafo[hidden],
.atc-astra-canvas[hidden] {
  display: none !important;
}

.pt-escena-grafo canvas {
  display: block;
  inline-size: 100%;
}
`;

let hecho = false;
export function inyectarEstilos(): void {
  if (hecho || typeof document === 'undefined') return;
  hecho = true;
  if (document.getElementById('v3-estilos')) return;
  const s = document.createElement('style');
  s.id = 'v3-estilos';
  s.textContent = CSS;
  document.head.append(s);
}

