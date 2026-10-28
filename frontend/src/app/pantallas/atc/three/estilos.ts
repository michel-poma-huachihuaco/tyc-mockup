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

.pt-c360-tablero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--aybar-space-3);
  align-items: stretch;
}

.pt-c360-tablero--con-movs {
  grid-template-columns: minmax(0, 1fr) 21.5rem;
}

.pt-c360-movs {
  display: flex;
  flex-direction: column;
  gap: var(--aybar-space-2);
  padding: var(--aybar-space-3);
  border-radius: var(--aybar-radius-lg);
  border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);
  background: var(--aybar-color-bg-surface);
  min-inline-size: 0;
}

.pt-c360-movs__item {
  display: flex;
  flex-direction: column;
  gap: var(--aybar-space-1);
  padding: var(--aybar-space-2) var(--aybar-space-3);
  border-radius: var(--aybar-radius-md);
  border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);
  background: var(--aybar-color-bg-surface-sunken);
  cursor: pointer;
  text-align: start;
  font-family: inherit;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.pt-c360-movs__item:hover,
.pt-c360-movs__item--activo {
  border-color: var(--aybar-color-secondary-400);
  transform: translateY(-1px);
}

@media (max-width: 1180px) {
  .pt-c360-tablero--con-movs {
    grid-template-columns: minmax(0, 1fr);
  }
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

/* ---------------------------------------------------------------- asistente flotante 3D (pt-bot) */
.pt-bot {
  --v3-ok: var(--aybar-color-feedback-success-border);
  --v3-warn: var(--aybar-color-feedback-warning-border);
  --v3-bad: var(--aybar-color-feedback-danger-border);
  --v3-acc: var(--aybar-color-secondary-400);
  --v3-fg: var(--aybar-color-fg-default);
  --v3-mu: var(--aybar-color-fg-muted);
  --v3-sf: var(--aybar-color-bg-surface);
  --v3-sk: var(--aybar-color-bg-surface-sunken);
  --v3-ln: var(--aybar-color-border-subtle);
  --v3-pri: var(--aybar-color-primary-500);
  --pt-bot-fab: calc(var(--aybar-space-12) + var(--aybar-space-2));
  position: fixed;
  inset-inline-end: var(--aybar-space-5);
  inset-block-end: var(--aybar-space-5);
  z-index: 60;
  font-family: inherit;
}

@keyframes v3-arriba {
  from {
    opacity: 0;
    transform: translateY(var(--aybar-space-3)) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes v3-msg {
  from {
    opacity: 0;
    transform: translateY(var(--aybar-space-2));
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes v3-punto {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(calc(-1 * var(--aybar-space-1)));
  }
}

.pt-bot__fab {
  position: relative;
  display: block;
  inline-size: var(--pt-bot-fab);
  block-size: var(--pt-bot-fab);
  padding: 0;
  border-radius: var(--aybar-radius-full);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
  background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--v3-acc) 22%, var(--v3-sf)), var(--v3-sk));
  cursor: pointer;
  box-shadow: var(--aybar-shadow-lg);
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.2s;
}

.pt-bot__fab:hover {
  transform: translateY(calc(-1 * var(--aybar-space-1)));
  border-color: var(--v3-acc);
}

.pt-bot__fab canvas {
  inline-size: 100%;
  block-size: 100%;
  display: block;
}

.pt-bot__globo {
  position: absolute;
  inset-inline-end: calc(var(--pt-bot-fab) + var(--aybar-space-3));
  inset-block-end: var(--aybar-space-5);
  inline-size: max-content;
  max-inline-size: 14rem;
  padding: var(--aybar-space-2) var(--aybar-space-3);
  border-radius: var(--aybar-radius-md);
  background: var(--v3-sf);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
  box-shadow: var(--aybar-shadow-md);
  font-size: var(--aybar-font-size-xs);
  line-height: 1.35;
  color: var(--v3-fg);
  cursor: pointer;
  animation: v3-arriba 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  text-align: start;
}

.pt-bot__panel {
  position: absolute;
  inset-inline-end: 0;
  inset-block-end: calc(var(--pt-bot-fab) + var(--aybar-space-3));
  inline-size: min(25.5rem, calc(100vw - var(--aybar-space-8)));
  block-size: min(38.5rem, calc(100dvh - 9.5rem));
  display: flex;
  flex-direction: column;
  border-radius: var(--aybar-radius-lg);
  background: color-mix(in srgb, var(--v3-sf) 97%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
  box-shadow: var(--aybar-shadow-lg);
  color: var(--v3-fg);
  overflow: hidden;
  animation: v3-arriba 0.28s cubic-bezier(0.25, 1, 0.5, 1);
}

.pt-bot__cab {
  display: flex;
  align-items: center;
  gap: var(--aybar-space-3);
  padding: var(--aybar-space-3);
  border-block-end: var(--aybar-border-width-thin) solid var(--v3-ln);
  background: linear-gradient(180deg, color-mix(in srgb, var(--v3-acc) 14%, transparent), transparent);
}

.pt-bot__av {
  inline-size: var(--aybar-space-12);
  block-size: var(--aybar-space-12);
  border-radius: var(--aybar-radius-full);
  overflow: hidden;
  flex: none;
  background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--v3-acc) 25%, var(--v3-sf)), var(--v3-sk));
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
}

.pt-bot__av canvas {
  inline-size: 100%;
  block-size: 100%;
  display: block;
}

.pt-bot__cab h2 {
  margin: 0;
  font-size: var(--aybar-font-size-sm);
  font-weight: var(--aybar-font-weight-bold);
}

.pt-bot__cab small {
  display: block;
  color: var(--v3-mu);
  font-size: var(--aybar-font-size-xs);
  margin-block-start: var(--aybar-space-px);
}

.pt-bot__x {
  margin-inline-start: auto;
  inline-size: var(--aybar-space-8);
  block-size: var(--aybar-space-8);
  border-radius: var(--aybar-radius-sm);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
  background: transparent;
  color: var(--v3-mu);
  cursor: pointer;
}

.pt-bot__x:hover {
  color: var(--v3-fg);
}

.pt-bot__msgs {
  flex: 1;
  overflow: auto;
  padding: var(--aybar-space-3);
  display: flex;
  flex-direction: column;
  gap: var(--aybar-space-2);
  scroll-behavior: smooth;
}

.pt-bot__m {
  max-inline-size: 94%;
  padding: var(--aybar-space-2) var(--aybar-space-3);
  border-radius: var(--aybar-radius-md);
  font-size: var(--aybar-font-size-sm);
  line-height: 1.5;
  white-space: pre-wrap;
  animation: v3-msg 0.28s cubic-bezier(0.25, 1, 0.5, 1);
}

.pt-bot__m--bot {
  align-self: flex-start;
  background: var(--v3-sk);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
}

.pt-bot__m--yo {
  align-self: flex-end;
  background: color-mix(in srgb, var(--v3-acc) 22%, var(--v3-sk));
  border: var(--aybar-border-width-thin) solid color-mix(in srgb, var(--v3-acc) 40%, transparent);
}

.pt-bot__m h3 {
  margin: 0 0 var(--aybar-space-1);
  font-size: var(--aybar-font-size-xs);
  letter-spacing: var(--aybar-font-tracking-wide);
  text-transform: uppercase;
  color: var(--v3-acc);
}

.pt-bot__m ul,
.pt-bot__m ol {
  margin: var(--aybar-space-1) 0 0;
  padding-inline-start: var(--aybar-space-4);
}

.pt-bot__m li {
  margin: var(--aybar-space-1) 0;
}

.pt-bot__texto {
  margin: var(--aybar-space-1) 0;
  padding: var(--aybar-space-2) var(--aybar-space-3);
  border-radius: var(--aybar-radius-sm);
  background: var(--v3-sf);
  border: var(--aybar-border-width-thin) dashed var(--v3-ln);
  white-space: pre-wrap;
}

.pt-bot__acc {
  display: flex;
  gap: var(--aybar-space-1);
  flex-wrap: wrap;
  margin-block-start: var(--aybar-space-2);
}

.pt-bot__editar {
  display: block;
  inline-size: 100%;
  box-sizing: border-box;
  resize: vertical;
  font: inherit;
  color: var(--v3-fg);
  line-height: 1.5;
}

.pt-bot__editar:focus {
  outline: var(--aybar-focus-ring-width) solid var(--v3-acc);
  outline-offset: var(--aybar-focus-ring-offset);
  border-style: solid;
}

.pt-bot__editar[readonly] {
  color: var(--v3-mu);
}

.pt-bot__crit {
  margin-block-start: var(--aybar-space-2);
}

.pt-bot__nota {
  margin: var(--aybar-space-1) 0 0;
  color: var(--v3-mu);
  font-size: var(--aybar-font-size-xs);
}

.pt-bot__btn {
  font-family: inherit;
  font-size: var(--aybar-font-size-xs);
  font-weight: var(--aybar-font-weight-semibold);
  padding: var(--aybar-space-1) var(--aybar-space-3);
  border-radius: var(--aybar-radius-full);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
  background: transparent;
  color: var(--v3-fg);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.pt-bot__btn:hover {
  border-color: var(--v3-acc);
}

.pt-bot__btn--p {
  background: var(--v3-acc);
  border-color: var(--v3-acc);
  color: var(--aybar-color-fg-on-accent);
}

.pt-bot__h {
  display: flex;
  gap: var(--aybar-space-2);
  align-items: flex-start;
  margin: var(--aybar-space-1) 0;
}

.pt-bot__h i {
  font-style: normal;
  flex: none;
  inline-size: var(--aybar-space-5);
  block-size: var(--aybar-space-5);
  border-radius: var(--aybar-radius-full);
  display: grid;
  place-items: center;
  font-size: var(--aybar-font-size-xs);
  font-weight: var(--aybar-font-weight-bold);
  color: var(--aybar-color-fg-on-accent);
}

.pt-bot__h[data-n='ok'] i {
  background: var(--v3-ok);
}

.pt-bot__h[data-n='aviso'] i {
  background: var(--v3-warn);
}

.pt-bot__h[data-n='alto'] i {
  background: var(--v3-bad);
}

.pt-bot__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aybar-space-1);
  padding: var(--aybar-space-2) var(--aybar-space-3);
  border-block-start: var(--aybar-border-width-thin) solid var(--v3-ln);
}

.pt-bot__form {
  display: flex;
  gap: var(--aybar-space-2);
  padding: var(--aybar-space-2) var(--aybar-space-3) var(--aybar-space-3);
  border-block-start: var(--aybar-border-width-thin) solid var(--v3-ln);
}

.pt-bot__form input {
  flex: 1;
  min-inline-size: 0;
  font: var(--aybar-font-weight-medium) var(--aybar-font-size-sm) inherit;
  font-family: inherit;
  padding: var(--aybar-space-2) var(--aybar-space-3);
  border-radius: var(--aybar-radius-full);
  border: var(--aybar-border-width-thin) solid var(--v3-ln);
  background: var(--v3-sk);
  color: var(--v3-fg);
}

.pt-bot__form input:focus {
  outline: var(--aybar-focus-ring-width) solid var(--v3-acc);
  outline-offset: var(--aybar-focus-ring-offset);
}

.pt-bot__puntos {
  display: inline-flex;
  gap: var(--aybar-space-1);
  padding: var(--aybar-space-1) 0;
}

.pt-bot__puntos i {
  inline-size: var(--aybar-space-2);
  block-size: var(--aybar-space-2);
  border-radius: var(--aybar-radius-full);
  background: var(--v3-mu);
  animation: v3-punto 1s ease-in-out infinite;
}

.pt-bot__puntos i:nth-child(2) {
  animation-delay: 0.15s;
}

.pt-bot__puntos i:nth-child(3) {
  animation-delay: 0.3s;
}

@media (max-width: 639.98px) {
  
  .pt-bot {
    inset-inline-end: var(--aybar-space-3);
    inset-block-end: var(--aybar-space-3);
  }

  .pt-bot__globo {
    inset-inline-end: calc(var(--pt-bot-fab) + var(--aybar-space-2));
    inset-block-end: var(--aybar-space-3);
    max-inline-size: 11rem;
  }

  .pt-bot__panel {
    inset-block-end: calc(var(--pt-bot-fab) + var(--aybar-space-2));
    inline-size: calc(100vw - var(--aybar-space-6));
    block-size: min(32rem, calc(100dvh - 7.5rem));
  }
}
@media (prefers-reduced-motion: reduce) {
  .pt-bot *,
  .pt-bot *::before,
  .pt-bot *::after {
    animation: none !important;
    transition: none !important;
  }
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

