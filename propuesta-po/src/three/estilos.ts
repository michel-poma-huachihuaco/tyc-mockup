// Estilos del HUD, de la ficha del ticket y del selector de entradas. Se inyectan una sola vez desde las
// escenas (el artifact compilado no tiene dónde ponerlos). Usan los tokens --aybar-* con respaldo.

const CSS = `
.v3-hud,.v3-ficha,.v3-entradas{
  --v3-ok:var(--aybar-color-feedback-success-border,#2e8b57);--v3-warn:var(--aybar-color-feedback-warning-border,#e39b1c);
  --v3-bad:var(--aybar-color-feedback-danger-border,#c0453a);--v3-acc:var(--aybar-color-secondary-400,#f6a42c);
  --v3-fg:var(--aybar-color-fg-default,#e8f0f2);--v3-mu:var(--aybar-color-fg-muted,#9db4ba);
  --v3-sf:var(--aybar-color-bg-surface,#1b2a31);--v3-sk:var(--aybar-color-bg-surface-sunken,#142026);--v3-ln:var(--aybar-color-border-subtle,#2d4048);
  --v3-pri:var(--aybar-color-primary-500,#2b8a9c);font-family:inherit}

/* ---------------------------------------------------------------- HUD de estadísticas */
.v3-hud-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
@media(max-width:1100px){.v3-hud-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.v3-hud-grid{grid-template-columns:minmax(0,1fr)}}
.v3-k{position:relative;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:12px;align-items:center;padding:14px 16px;border-radius:14px;background:linear-gradient(160deg,var(--v3-sf),var(--v3-sk));border:1px solid var(--v3-ln);color:var(--v3-fg);overflow:hidden;isolation:isolate;transition:border-color .3s,box-shadow .3s}
.v3-k::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(120% 90% at 0% 0%,color-mix(in srgb,var(--v3-tono,var(--v3-pri)) 22%,transparent),transparent 60%);opacity:.9}
.v3-k[data-estado=ok]{--v3-tono:var(--v3-ok)}.v3-k[data-estado=warn]{--v3-tono:var(--v3-warn)}.v3-k[data-estado=bad]{--v3-tono:var(--v3-bad)}.v3-k[data-estado=acc]{--v3-tono:var(--v3-acc)}.v3-k[data-estado=pri]{--v3-tono:var(--v3-pri)}
.v3-k-ic{position:relative;width:46px;height:46px;border-radius:13px;display:grid;place-items:center;color:var(--v3-tono);background:color-mix(in srgb,var(--v3-tono) 16%,var(--v3-sk));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--v3-tono) 38%,transparent)}
.v3-k-ic svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.v3-k-lbl{font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--v3-mu)}
.v3-k-val{display:block;font-size:30px;line-height:1.05;font-weight:800;letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:var(--v3-fg)}
.v3-k-val small{font-size:14px;font-weight:700;color:var(--v3-mu);margin-left:3px}
.v3-k-sub{grid-column:1/-1;margin-top:10px;display:flex;align-items:center;gap:8px;min-height:20px;font-size:12px;color:var(--v3-mu);flex-wrap:nowrap;white-space:nowrap}
.v3-k-chip{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;color:var(--v3-tono);background:color-mix(in srgb,var(--v3-tono) 14%,transparent);border:1px solid color-mix(in srgb,var(--v3-tono) 35%,transparent)}
.v3-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}
.v3-k-chip.pulsa .v3-dot{animation:v3-latido 1.1s ease-in-out infinite}
.v3-spark{margin-left:auto;width:72px;min-width:40px;height:28px;flex:0 1 auto}
.v3-spark path{fill:none;stroke:var(--v3-tono);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.v3-spark .area{fill:color-mix(in srgb,var(--v3-tono) 20%,transparent);stroke:none}
.v3-tend{font-weight:800;color:var(--v3-mu)}.v3-tend.sube{color:var(--v3-warn)}.v3-tend.baja{color:var(--v3-ok)}
/* anillo de SLA */
.v3-anillo{position:relative;width:56px;height:56px;flex:none;grid-row:1/2}
.v3-anillo svg{width:56px;height:56px;transform:rotate(-90deg)}
.v3-anillo circle{fill:none;stroke-width:5;stroke-linecap:round}
.v3-anillo .base{stroke:var(--v3-ln)}.v3-anillo .arco{stroke:var(--v3-tono);transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1),stroke .3s}
.v3-anillo .meta{stroke:var(--v3-fg);opacity:.6;stroke-width:2.5;stroke-dasharray:1.6 999;stroke-linecap:butt}
.v3-anillo .ic{position:absolute;inset:0;display:grid;place-items:center;color:var(--v3-tono)}
.v3-anillo .ic svg{width:22px;height:22px;transform:none;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
/* estrellas de CSAT */
.v3-estrellas{position:relative;display:inline-block;height:16px;width:90px;line-height:0}
.v3-estrellas svg{width:90px;height:16px;display:block}
.v3-estrellas .fondo{color:var(--v3-ln)}.v3-estrellas .lleno{position:absolute;left:0;top:0;width:90px;color:var(--v3-acc);clip-path:inset(0 var(--r,100%) 0 0);transition:clip-path .9s cubic-bezier(.2,.8,.2,1)}
.v3-estrellas .lleno svg{width:90px}
/* nivel del equipo */
.v3-hex{position:relative;width:46px;height:46px;display:grid;place-items:center;color:var(--v3-acc);font-weight:800;font-size:19px}
.v3-hex svg{position:absolute;inset:0;width:46px;height:46px;fill:color-mix(in srgb,var(--v3-acc) 18%,var(--v3-sk));stroke:var(--v3-acc);stroke-width:2;stroke-linejoin:round}
.v3-hex b{position:relative}
.v3-xp{grid-column:1/-1;margin-top:10px;height:8px;border-radius:99px;background:var(--v3-ln);overflow:hidden;position:relative}
.v3-xp i{display:block;height:100%;width:100%;border-radius:99px;background:linear-gradient(90deg,var(--v3-acc),color-mix(in srgb,var(--v3-acc) 60%,#fff));transform:scaleX(var(--p,0));transform-origin:left;transition:transform .8s cubic-bezier(.2,.8,.2,1);position:relative;overflow:hidden}
.v3-xp i::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-100%);animation:v3-brillo 2.6s ease-in-out infinite}
.v3-racha{display:inline-flex;align-items:center;gap:4px;font-weight:800;color:var(--v3-mu)}
.v3-racha svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.v3-racha.viva{color:var(--v3-acc)}.v3-racha.viva svg{fill:color-mix(in srgb,var(--v3-acc) 55%,transparent);animation:v3-llama .9s ease-in-out infinite alternate;transform-origin:50% 90%}
.v3-nps-cuenta{font-weight:700;letter-spacing:.02em}
/* tickets por estado */
.v3-estados{grid-column:span 3;padding:14px 16px;border-radius:14px;background:linear-gradient(160deg,var(--v3-sf),var(--v3-sk));border:1px solid var(--v3-ln);color:var(--v3-fg)}
@media(max-width:1100px){.v3-estados{grid-column:1/-1}}
.v3-est-cab{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}.v3-est-total{font-size:12px;color:var(--v3-mu)}
.v3-est-lista{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none}
@media(max-width:1100px){.v3-est-lista{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:520px){.v3-est-lista{grid-template-columns:repeat(2,minmax(0,1fr))}}
.v3-est{--c:var(--v3-pri);position:relative;display:grid;grid-template-columns:auto 1fr;column-gap:7px;align-items:center;padding:8px 10px 10px;border-radius:11px;background:color-mix(in srgb,var(--c) 9%,var(--v3-sk));border:1px solid color-mix(in srgb,var(--c) 22%,transparent)}
.v3-est.sep{border-style:dashed}
.v3-est[data-e=OPEN]{--c:var(--v3-pri)}.v3-est[data-e=IN_PROGRESS]{--c:var(--v3-acc)}.v3-est[data-e=PENDING_CUSTOMER]{--c:var(--v3-warn)}.v3-est[data-e=ESCALATED]{--c:var(--v3-bad)}.v3-est[data-e=REOPENED]{--c:#b98ae0}.v3-est[data-e=RESOLVED]{--c:color-mix(in srgb,var(--v3-ok) 70%,#fff)}.v3-est[data-e=CLOSED]{--c:var(--v3-ok)}
.v3-est .v3-dot{color:var(--c)}.v3-est b{font-size:20px;line-height:1;font-variant-numeric:tabular-nums}
.v3-est>span:nth-of-type(2){grid-column:1/-1;font-size:11.5px;color:var(--v3-mu);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v3-est-pista{grid-column:1/-1;margin-top:6px;height:5px;border-radius:99px;background:var(--v3-ln);overflow:hidden}
.v3-est-pista i{display:block;height:100%;width:100%;border-radius:99px;background:var(--c);transform:scaleX(var(--p,0));transform-origin:left;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.v3-est.sube,.v3-est.baja{animation:v3-destello-c .9s ease-out}
.v3-est-nota{margin:10px 0 0;font-size:11.5px;color:var(--v3-mu)}
@keyframes v3-destello-c{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 65%,transparent)}100%{box-shadow:0 0 0 10px transparent}}
/* retroalimentación al cambiar un valor */
.v3-k.sube,.v3-k.baja,.v3-k.sube-bien,.v3-k.baja-mal{animation:v3-destello .9s ease-out}
.v3-k-val.pop{animation:v3-pop .45s cubic-bezier(.25,1,.5,1)}
.v3-delta{position:absolute;right:14px;top:10px;font-size:12px;font-weight:800;padding:1px 8px;border-radius:999px;color:var(--v3-tono);background:color-mix(in srgb,var(--v3-tono) 16%,var(--v3-sk));animation:v3-delta 1.4s ease-out forwards;pointer-events:none}
.v3-k.nivel-up{animation:v3-nivel 1.4s ease-out}
.v3-chispa{position:absolute;left:30px;top:30px;width:6px;height:6px;border-radius:50%;background:var(--v3-acc);animation:v3-chispa 1.1s ease-out forwards;pointer-events:none}
@keyframes v3-latido{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:.45}}
@keyframes v3-brillo{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}
@keyframes v3-llama{from{transform:scale(1) rotate(-3deg)}to{transform:scale(1.18) rotate(3deg)}}
@keyframes v3-destello{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--v3-tono) 70%,transparent);border-color:var(--v3-tono)}100%{box-shadow:0 0 0 14px transparent}}
@keyframes v3-pop{0%{transform:scale(.9);opacity:.6}100%{transform:scale(1);opacity:1}}
@keyframes v3-delta{0%{opacity:0;transform:translateY(8px)}18%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
@keyframes v3-nivel{0%{box-shadow:0 0 0 0 var(--v3-acc)}40%{box-shadow:0 0 0 18px transparent,0 0 40px 6px color-mix(in srgb,var(--v3-acc) 60%,transparent)}100%{box-shadow:none}}
@keyframes v3-chispa{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}

/* ---------------------------------------------------------------- ficha del ticket */
.v3-ficha{position:absolute;z-index:6;top:14px;right:14px;width:min(360px,calc(100% - 28px));max-height:calc(100% - 28px);overflow:auto;border-radius:16px;background:color-mix(in srgb,var(--v3-sf) 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--v3-ln);box-shadow:0 18px 50px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb,var(--v3-tono,var(--v3-pri)) 30%,transparent);color:var(--v3-fg);outline:none;animation:v3-entra .32s cubic-bezier(.2,.9,.3,1.1)}
.v3-ficha[data-nivel=ok],.v3-ficha[data-nivel=cumplido]{--v3-tono:var(--v3-ok)}.v3-ficha[data-nivel=riesgo]{--v3-tono:var(--v3-warn)}.v3-ficha[data-nivel=vencido]{--v3-tono:var(--v3-bad)}
@keyframes v3-entra{from{opacity:0;transform:translateX(24px) scale(.97)}to{opacity:1;transform:none}}
@media(max-width:640px){.v3-ficha{top:auto;bottom:10px;right:10px;left:10px;width:auto;animation-name:v3-sube}@keyframes v3-sube{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}}
.v3-f-cab{display:flex;align-items:flex-start;gap:10px;padding:14px 14px 10px;border-bottom:1px solid var(--v3-ln);background:linear-gradient(180deg,color-mix(in srgb,var(--v3-tono,var(--v3-pri)) 16%,transparent),transparent)}
.v3-f-num{font:700 17px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.02em}
.v3-f-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.v3-f-x{margin-left:auto;flex:none;width:30px;height:30px;border-radius:9px;border:1px solid var(--v3-ln);background:transparent;color:var(--v3-mu);cursor:pointer;display:grid;place-items:center}
.v3-f-x:hover{color:var(--v3-fg);border-color:var(--v3-mu)}.v3-f-x svg{width:14px;height:14px;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round}
.v3-f-res{margin:0;padding:12px 14px 0;font-size:13.5px;line-height:1.45}
.v3-f-sla{padding:12px 14px 4px}.v3-f-sla-t{display:flex;justify-content:space-between;font-size:12px;color:var(--v3-mu);margin-bottom:6px}.v3-f-sla-t b{color:var(--v3-fg)}
.v3-f-barra{height:8px;border-radius:99px;background:var(--v3-ln);overflow:hidden}.v3-f-barra i{display:block;height:100%;width:100%;border-radius:99px;background:var(--v3-tono,var(--v3-ok));transform:scaleX(var(--p,0));transform-origin:left;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.v3-f-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin:0;padding:12px 14px}
.v3-f-fila{min-width:0}.v3-f-fila dt{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--v3-mu)}.v3-f-fila dd{margin:2px 0 0;font-size:13px;font-weight:600;overflow-wrap:anywhere}
.v3-f-hist{margin:0;padding:0 14px 6px;list-style:none;border-left:0}
.v3-f-hist li{position:relative;padding:4px 0 4px 16px;font-size:12px;color:var(--v3-mu)}
.v3-f-hist li::before{content:"";position:absolute;left:3px;top:10px;width:7px;height:7px;border-radius:50%;background:var(--v3-ln);box-shadow:0 0 0 2px var(--v3-sf)}
.v3-f-hist li:first-child::before{background:var(--v3-tono,var(--v3-pri))}.v3-f-hist li:first-child{color:var(--v3-fg)}
.v3-f-t{margin:0;padding:6px 14px 4px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--v3-mu)}
.v3-f-acc{display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px 14px;border-top:1px solid var(--v3-ln)}

/* ---------------------------------------------------------------- selector de entradas */
.v3-entradas{position:absolute;z-index:4;left:14px;bottom:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;max-width:calc(100% - 28px);padding:6px 8px;border-radius:12px;background:color-mix(in srgb,var(--v3-sf) 86%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--v3-ln)}
.v3-entradas span{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--v3-mu);margin-right:2px}
.v3-entradas button{font-family:inherit;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid var(--v3-ln);background:transparent;color:var(--v3-fg);cursor:pointer}
.v3-entradas button:hover{border-color:var(--v3-acc)}
.v3-entradas button[aria-pressed=true]{background:var(--v3-acc);border-color:var(--v3-acc);color:var(--aybar-color-bg-canvas,#0f1a1f)}
.v3-entradas button:focus-visible,.v3-f-x:focus-visible{outline:2px solid var(--v3-acc);outline-offset:2px}

@media(prefers-reduced-motion:reduce){.v3-hud *,.v3-ficha,.v3-ficha *{animation:none!important;transition:none!important}}
`

let hecho = false
export function inyectarEstilos() {
  if (hecho || typeof document === 'undefined') return
  hecho = true
  if (document.getElementById('v3-estilos')) return
  const s = document.createElement('style'); s.id = 'v3-estilos'; s.textContent = CSS; document.head.append(s)
}
