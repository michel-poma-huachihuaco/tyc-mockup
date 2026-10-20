// Estilos del HUD, de la ficha del ticket y del selector de entradas. Se inyectan una sola vez desde las
// escenas (el artifact compilado no tiene dónde ponerlos). Todo sale de los tokens del SDK (@aybarcorp/tokens 0.3.0, los mismos
// del artifact): colores --aybar-color-* (con respaldo), tamaño y peso de letra --aybar-font-size-* / --aybar-font-weight-*,
// espacios --aybar-space-* y radios --aybar-radius-*. Quedan en px solo las medidas sin token en el SDK: bordes, tamaño de
// iconos y avatares, sombras, desenfoques, animaciones, posiciones derivadas de esos tamaños y cortes de pantalla.

const CSS = `
.v3-hud,.v3-ficha,.v3-entradas,.pt-herr,.pt-bot,.pt-usuario,.pt-inicio__ancla{
  --v3-ok:var(--aybar-color-feedback-success-border,#2e8b57);--v3-warn:var(--aybar-color-feedback-warning-border,#e39b1c);
  --v3-bad:var(--aybar-color-feedback-danger-border,#c0453a);--v3-acc:var(--aybar-color-secondary-400,#f6a42c);
  --v3-fg:var(--aybar-color-fg-default,#e8f0f2);--v3-mu:var(--aybar-color-fg-muted,#9db4ba);
  --v3-sf:var(--aybar-color-bg-surface,#1b2a31);--v3-sk:var(--aybar-color-bg-surface-sunken,#142026);--v3-ln:var(--aybar-color-border-subtle,#2d4048);
  --v3-pri:var(--aybar-color-primary-500,#2b8a9c);font-family:inherit}

/* ---------------------------------------------------------------- HUD de estadísticas */
.v3-hud-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--aybar-space-3)}
@media(max-width:1100px){.v3-hud-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.v3-hud-grid{grid-template-columns:minmax(0,1fr)}}
.v3-k{position:relative;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:var(--aybar-space-3);align-items:center;padding:var(--aybar-space-3) var(--aybar-space-4);border-radius:var(--aybar-radius-md);background:linear-gradient(160deg,var(--v3-sf),var(--v3-sk));border:1px solid var(--v3-ln);color:var(--v3-fg);overflow:hidden;isolation:isolate;transition:border-color .3s,box-shadow .3s}
.v3-k::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(120% 90% at 0% 0%,color-mix(in srgb,var(--v3-tono,var(--v3-pri)) 22%,transparent),transparent 60%);opacity:.9}
.v3-k[data-estado=ok]{--v3-tono:var(--v3-ok)}.v3-k[data-estado=warn]{--v3-tono:var(--v3-warn)}.v3-k[data-estado=bad]{--v3-tono:var(--v3-bad)}.v3-k[data-estado=acc]{--v3-tono:var(--v3-acc)}.v3-k[data-estado=pri]{--v3-tono:var(--v3-pri)}
.v3-k-ic{position:relative;width:46px;height:46px;border-radius:var(--aybar-radius-md);display:grid;place-items:center;color:var(--v3-tono);background:color-mix(in srgb,var(--v3-tono) 16%,var(--v3-sk));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--v3-tono) 38%,transparent)}
.v3-k-ic svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.v3-k-lbl{font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-semibold);letter-spacing:.02em;color:var(--v3-mu)}
.v3-k-val{display:block;font-size:var(--aybar-font-size-3xl);line-height:1.05;font-weight:var(--aybar-font-weight-bold);letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:var(--v3-fg)}
.v3-k-val small{font-size:var(--aybar-font-size-sm);font-weight:var(--aybar-font-weight-bold);color:var(--v3-mu);margin-left:var(--aybar-space-1)}
.v3-k-sub{grid-column:1/-1;margin-top:var(--aybar-space-2);display:flex;align-items:center;gap:var(--aybar-space-2);min-height:20px;font-size:var(--aybar-font-size-xs);color:var(--v3-mu);flex-wrap:nowrap;white-space:nowrap}
.v3-k-chip{display:inline-flex;align-items:center;gap:var(--aybar-space-1);padding:var(--aybar-space-1) var(--aybar-space-2);border-radius:var(--aybar-radius-full);font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-bold);color:var(--v3-tono);background:color-mix(in srgb,var(--v3-tono) 14%,transparent);border:1px solid color-mix(in srgb,var(--v3-tono) 35%,transparent)}
.v3-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}
.v3-k-chip.pulsa .v3-dot{animation:v3-latido 1.1s ease-in-out infinite}
.v3-spark{margin-left:auto;width:72px;min-width:40px;height:28px;flex:0 1 auto}
.v3-spark path{fill:none;stroke:var(--v3-tono);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.v3-spark .area{fill:color-mix(in srgb,var(--v3-tono) 20%,transparent);stroke:none}
.v3-tend{font-weight:var(--aybar-font-weight-bold);color:var(--v3-mu)}.v3-tend.sube{color:var(--v3-warn)}.v3-tend.baja{color:var(--v3-ok)}
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
.v3-hex{position:relative;width:46px;height:46px;display:grid;place-items:center;color:var(--v3-acc);font-weight:var(--aybar-font-weight-bold);font-size:var(--aybar-font-size-xl)}
.v3-hex svg{position:absolute;inset:0;width:46px;height:46px;fill:color-mix(in srgb,var(--v3-acc) 18%,var(--v3-sk));stroke:var(--v3-acc);stroke-width:2;stroke-linejoin:round}
.v3-hex b{position:relative}
.v3-xp{grid-column:1/-1;margin-top:var(--aybar-space-2);height:8px;border-radius:var(--aybar-radius-full);background:var(--v3-ln);overflow:hidden;position:relative}
.v3-xp i{display:block;height:100%;width:100%;border-radius:var(--aybar-radius-full);background:linear-gradient(90deg,var(--v3-acc),color-mix(in srgb,var(--v3-acc) 60%,#fff));transform:scaleX(var(--p,0));transform-origin:left;transition:transform .8s cubic-bezier(.2,.8,.2,1);position:relative;overflow:hidden}
.v3-xp i::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-100%);animation:v3-brillo 2.6s ease-in-out infinite}
.v3-racha{display:inline-flex;align-items:center;gap:var(--aybar-space-1);font-weight:var(--aybar-font-weight-bold);color:var(--v3-mu)}
.v3-racha svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.v3-racha.viva{color:var(--v3-acc)}.v3-racha.viva svg{fill:color-mix(in srgb,var(--v3-acc) 55%,transparent);animation:v3-llama .9s ease-in-out infinite alternate;transform-origin:50% 90%}
.v3-nps-cuenta{font-weight:var(--aybar-font-weight-bold);letter-spacing:.02em}
/* tickets por estado */
.v3-estados{grid-column:span 3;padding:var(--aybar-space-3) var(--aybar-space-4);border-radius:var(--aybar-radius-md);background:linear-gradient(160deg,var(--v3-sf),var(--v3-sk));border:1px solid var(--v3-ln);color:var(--v3-fg)}
@media(max-width:1100px){.v3-estados{grid-column:1/-1}}
.v3-est-cab{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:var(--aybar-space-2)}.v3-est-total{font-size:var(--aybar-font-size-xs);color:var(--v3-mu)}
.v3-est-lista{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:var(--aybar-space-2);margin:0;padding:0;list-style:none}
@media(max-width:1100px){.v3-est-lista{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:520px){.v3-est-lista{grid-template-columns:repeat(2,minmax(0,1fr))}}
.v3-est{--c:var(--v3-pri);position:relative;display:grid;grid-template-columns:auto 1fr;column-gap:var(--aybar-space-2);align-items:center;padding:var(--aybar-space-2) var(--aybar-space-2) var(--aybar-space-2);border-radius:var(--aybar-radius-sm);background:color-mix(in srgb,var(--c) 9%,var(--v3-sk));border:1px solid color-mix(in srgb,var(--c) 22%,transparent)}
.v3-est.sep{border-style:dashed}
.v3-est[data-e=OPEN]{--c:var(--v3-pri)}.v3-est[data-e=IN_PROGRESS]{--c:var(--v3-acc)}.v3-est[data-e=PENDING_CUSTOMER]{--c:var(--v3-warn)}.v3-est[data-e=ESCALATED]{--c:var(--v3-bad)}.v3-est[data-e=REOPENED]{--c:#b98ae0}.v3-est[data-e=RESOLVED]{--c:color-mix(in srgb,var(--v3-ok) 70%,#fff)}.v3-est[data-e=CLOSED]{--c:var(--v3-ok)}
.v3-est .v3-dot{color:var(--c)}.v3-est b{font-size:var(--aybar-font-size-xl);line-height:1;font-variant-numeric:tabular-nums}
.v3-est>span:nth-of-type(2){grid-column:1/-1;font-size:var(--aybar-font-size-xs);color:var(--v3-mu);margin-top:var(--aybar-space-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v3-est-pista{grid-column:1/-1;margin-top:var(--aybar-space-1);height:5px;border-radius:var(--aybar-radius-full);background:var(--v3-ln);overflow:hidden}
.v3-est-pista i{display:block;height:100%;width:100%;border-radius:var(--aybar-radius-full);background:var(--c);transform:scaleX(var(--p,0));transform-origin:left;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.v3-est.sube,.v3-est.baja{animation:v3-destello-c .9s ease-out}
@keyframes v3-destello-c{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 65%,transparent)}100%{box-shadow:0 0 0 10px transparent}}
/* retroalimentación al cambiar un valor */
.v3-k.sube,.v3-k.baja,.v3-k.sube-bien,.v3-k.baja-mal{animation:v3-destello .9s ease-out}
.v3-k-val.pop{animation:v3-pop .45s cubic-bezier(.25,1,.5,1)}
.v3-delta{position:absolute;right:var(--aybar-space-3);top:var(--aybar-space-2);font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-bold);padding:var(--aybar-space-px) var(--aybar-space-2);border-radius:var(--aybar-radius-full);color:var(--v3-tono);background:color-mix(in srgb,var(--v3-tono) 16%,var(--v3-sk));animation:v3-delta 1.4s ease-out forwards;pointer-events:none}
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
.v3-ficha{position:absolute;z-index:6;top:var(--aybar-space-3);right:var(--aybar-space-3);width:min(360px,calc(100% - 2 * var(--aybar-space-3)));max-height:calc(100% - 2 * var(--aybar-space-3));overflow:auto;border-radius:var(--aybar-radius-md);background:color-mix(in srgb,var(--v3-sf) 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--v3-ln);box-shadow:0 18px 50px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb,var(--v3-tono,var(--v3-pri)) 30%,transparent);color:var(--v3-fg);outline:none;animation:v3-entra .32s cubic-bezier(.2,.9,.3,1.1)}
.v3-ficha[data-nivel=ok],.v3-ficha[data-nivel=cumplido]{--v3-tono:var(--v3-ok)}.v3-ficha[data-nivel=riesgo]{--v3-tono:var(--v3-warn)}.v3-ficha[data-nivel=vencido]{--v3-tono:var(--v3-bad)}
@keyframes v3-entra{from{opacity:0;transform:translateX(24px) scale(.97)}to{opacity:1;transform:none}}
@media(max-width:640px){.v3-ficha{top:auto;bottom:var(--aybar-space-2);right:var(--aybar-space-2);left:var(--aybar-space-2);width:auto;animation-name:v3-sube}@keyframes v3-sube{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}}
.v3-f-cab{display:flex;align-items:flex-start;gap:var(--aybar-space-2);padding:var(--aybar-space-3) var(--aybar-space-3) var(--aybar-space-2);border-bottom:1px solid var(--v3-ln);background:linear-gradient(180deg,color-mix(in srgb,var(--v3-tono,var(--v3-pri)) 16%,transparent),transparent)}
.v3-f-num{font:var(--aybar-font-weight-bold) var(--aybar-font-size-lg)/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.02em}
.v3-f-chips{display:flex;flex-wrap:wrap;gap:var(--aybar-space-1);margin-top:var(--aybar-space-2)}
.v3-f-x{margin-left:auto;flex:none;width:30px;height:30px;border-radius:var(--aybar-radius-sm);border:1px solid var(--v3-ln);background:transparent;color:var(--v3-mu);cursor:pointer;display:grid;place-items:center}
.v3-f-x:hover{color:var(--v3-fg);border-color:var(--v3-mu)}.v3-f-x svg{width:14px;height:14px;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round}
.v3-f-res{margin:0;padding:var(--aybar-space-3) var(--aybar-space-3) 0;font-size:var(--aybar-font-size-sm);line-height:1.45}
.v3-f-sla{padding:var(--aybar-space-3) var(--aybar-space-3) var(--aybar-space-1)}.v3-f-sla-t{display:flex;justify-content:space-between;font-size:var(--aybar-font-size-xs);color:var(--v3-mu);margin-bottom:var(--aybar-space-1)}.v3-f-sla-t b{color:var(--v3-fg)}
.v3-f-barra{height:8px;border-radius:var(--aybar-radius-full);background:var(--v3-ln);overflow:hidden}.v3-f-barra i{display:block;height:100%;width:100%;border-radius:var(--aybar-radius-full);background:var(--v3-tono,var(--v3-ok));transform:scaleX(var(--p,0));transform-origin:left;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.v3-f-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--aybar-space-2) var(--aybar-space-3);margin:0;padding:var(--aybar-space-3) var(--aybar-space-3)}
.v3-f-fila{min-width:0}.v3-f-fila dt{font-size:var(--aybar-font-size-2xs);font-weight:var(--aybar-font-weight-bold);letter-spacing:.08em;text-transform:uppercase;color:var(--v3-mu)}.v3-f-fila dd{margin:var(--aybar-space-1) 0 0;font-size:var(--aybar-font-size-sm);font-weight:var(--aybar-font-weight-semibold);overflow-wrap:anywhere}
.v3-f-hist{margin:0;padding:0 var(--aybar-space-3) var(--aybar-space-1);list-style:none;border-left:0}
.v3-f-hist li{position:relative;padding:var(--aybar-space-1) 0 var(--aybar-space-1) var(--aybar-space-4);font-size:var(--aybar-font-size-xs);color:var(--v3-mu)}
.v3-f-hist li::before{content:"";position:absolute;left:3px;top:10px;width:7px;height:7px;border-radius:50%;background:var(--v3-ln);box-shadow:0 0 0 2px var(--v3-sf)}
.v3-f-hist li:first-child::before{background:var(--v3-tono,var(--v3-pri))}.v3-f-hist li:first-child{color:var(--v3-fg)}
.v3-f-t{margin:0;padding:var(--aybar-space-1) var(--aybar-space-3) var(--aybar-space-1);font-size:var(--aybar-font-size-2xs);font-weight:var(--aybar-font-weight-bold);letter-spacing:.08em;text-transform:uppercase;color:var(--v3-mu)}
.v3-f-acc{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2);padding:var(--aybar-space-2) var(--aybar-space-3) var(--aybar-space-3);border-top:1px solid var(--v3-ln)}
/* HU-067 CA-04: panel del área (mismo marco que la ficha del ticket) */
.v3-f-area{margin:0;font-size:var(--aybar-font-size-base);line-height:1.2;font-weight:var(--aybar-font-weight-bold)}
.v3-f-lista{margin:0;padding:0 var(--aybar-space-3) var(--aybar-space-2);list-style:none;display:grid;gap:var(--aybar-space-1)}
.v3-f-lista li{display:flex;flex-wrap:wrap;align-items:center;gap:var(--aybar-space-1) var(--aybar-space-2);font-size:var(--aybar-font-size-xs)}
.v3-f-nota{margin:0;padding:0 var(--aybar-space-3) var(--aybar-space-2);font-size:var(--aybar-font-size-xs);color:var(--v3-mu)}
/* HU-067 CA-07: el selector de razón social de la cabecera no desborda en móvil */
.ay-pageheader__actions .ay-selectwrap,.ay-pageheader__actions .ay-select{max-width:100%}

/* ---------------------------------------------------------------- selector de entradas */
.v3-entradas{position:absolute;z-index:4;left:var(--aybar-space-3);bottom:var(--aybar-space-3);display:flex;flex-wrap:wrap;align-items:center;gap:var(--aybar-space-1);max-width:calc(100% - 2 * var(--aybar-space-3));padding:var(--aybar-space-1) var(--aybar-space-2);border-radius:var(--aybar-radius-md);background:color-mix(in srgb,var(--v3-sf) 86%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--v3-ln)}
.v3-entradas span{font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-bold);letter-spacing:.06em;text-transform:uppercase;color:var(--v3-mu);margin-right:var(--aybar-space-1)}
.v3-entradas button{font-family:inherit;font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-semibold);padding:var(--aybar-space-1) var(--aybar-space-2);border-radius:var(--aybar-radius-full);border:1px solid var(--v3-ln);background:transparent;color:var(--v3-fg);cursor:pointer}
.v3-entradas button:hover{border-color:var(--v3-acc)}
.v3-entradas button[aria-pressed=true]{background:var(--v3-acc);border-color:var(--v3-acc);color:var(--aybar-color-bg-canvas,#0f1a1f)}
.v3-entradas button:focus-visible,.v3-f-x:focus-visible{outline:2px solid var(--v3-acc);outline-offset:2px}


/* ---------------------------------------------------------------- usuario en la barra superior */
.pt-usuario{display:flex;align-items:center;gap:var(--aybar-space-2);color:var(--v3-fg);font-size:var(--aybar-font-size-sm)}
.pt-usuario__av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:var(--aybar-font-weight-bold);font-size:var(--aybar-font-size-xs);letter-spacing:.02em;background:color-mix(in srgb,var(--v3-pri) 28%,var(--v3-sk));color:var(--v3-fg);box-shadow:inset 0 0 0 1px var(--v3-ln)}
.pt-usuario__txt{display:flex;flex-direction:column;line-height:1.2}.pt-usuario__txt b{font-weight:var(--aybar-font-weight-semibold)}.pt-usuario__txt small{color:var(--v3-mu);font-size:var(--aybar-font-size-xs)}
@media(max-width:700px){.pt-usuario__txt{display:none}}

/* ---------------------------------------------------------------- herramientas flotantes (ver como, tema, apariencia, simulación, notas) */
.pt-herr{position:fixed;left:var(--aybar-space-4);bottom:var(--aybar-space-4);z-index:60}
.pt-herr__fab{width:46px;height:46px;border-radius:50%;border:1px solid var(--v3-ln);background:color-mix(in srgb,var(--v3-sf) 92%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:var(--v3-fg);display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .35s cubic-bezier(.25,1,.5,1),border-color .2s}
.pt-herr__fab:hover,.pt-herr__fab[aria-expanded=true]{border-color:var(--v3-acc);transform:rotate(45deg)}
.pt-herr__fab svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.pt-herr__fab:focus-visible,.pt-herr button:focus-visible,.pt-bot button:focus-visible,.pt-inicio__ancla button:focus-visible{outline:2px solid var(--v3-acc);outline-offset:2px}
.pt-herr__panel{position:absolute;left:0;bottom:58px;width:min(360px,calc(100vw - 32px));max-height:min(72vh,640px);overflow:auto;border-radius:var(--aybar-radius-md);background:color-mix(in srgb,var(--v3-sf) 97%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--v3-ln);box-shadow:0 22px 60px rgba(0,0,0,.5);color:var(--v3-fg);animation:v3-arriba .24s cubic-bezier(.25,1,.5,1)}
@keyframes v3-arriba{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
.pt-herr__cab{display:flex;align-items:center;gap:var(--aybar-space-2);padding:var(--aybar-space-3) var(--aybar-space-4) var(--aybar-space-2)}.pt-herr__cab h2{margin:0;font-size:var(--aybar-font-size-base);font-weight:var(--aybar-font-weight-bold)}.pt-herr__cab small{display:block;color:var(--v3-mu);font-size:var(--aybar-font-size-xs);margin-top:var(--aybar-space-1)}
.pt-herr__atras{border:1px solid var(--v3-ln);background:transparent;color:var(--v3-fg);border-radius:var(--aybar-radius-sm);width:30px;height:30px;cursor:pointer;font-size:var(--aybar-font-size-base)}
.pt-herr__sec{padding:var(--aybar-space-1) var(--aybar-space-4) var(--aybar-space-2)}.pt-herr__sec>b{display:block;font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-bold);letter-spacing:.08em;text-transform:uppercase;color:var(--v3-mu);margin-bottom:var(--aybar-space-1)}
.pt-herr__filas{display:grid;gap:var(--aybar-space-1);padding:var(--aybar-space-1) var(--aybar-space-3) var(--aybar-space-3)}
.pt-herr__fila{display:grid;grid-template-columns:auto 1fr auto;gap:var(--aybar-space-3);align-items:center;text-align:left;padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-md);border:1px solid var(--v3-ln);background:var(--v3-sk);color:var(--v3-fg);cursor:pointer;transition:border-color .2s,background .2s}
.pt-herr__fila:hover{border-color:var(--v3-acc)}.pt-herr__fila b{display:block;font-size:var(--aybar-font-size-sm)}.pt-herr__fila small{display:block;color:var(--v3-mu);font-size:var(--aybar-font-size-xs)}.pt-herr__fila i{font-style:normal;color:var(--v3-mu);font-size:var(--aybar-font-size-lg)}
.pt-herr__cuenta{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 var(--aybar-space-1);border-radius:var(--aybar-radius-full);background:var(--v3-acc);color:var(--aybar-color-bg-canvas,#0f1a1f);font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-bold);margin-left:var(--aybar-space-1)}
.pt-herr__notas{display:grid;gap:var(--aybar-space-2);padding:var(--aybar-space-1) var(--aybar-space-4) var(--aybar-space-4)}.pt-herr__nota{padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-md);background:var(--v3-sk);border:1px solid var(--v3-ln);font-size:var(--aybar-font-size-xs);line-height:1.45}
.pt-herr__vacio{padding:var(--aybar-space-1) var(--aybar-space-4) var(--aybar-space-4);color:var(--v3-mu);font-size:var(--aybar-font-size-xs)}

/* ---------------------------------------------------------------- inicio: consulta 360 y vista en vivo */
.pt-grafo__busca{align-items:start;row-gap:var(--aybar-space-1,4px)}
.pt-grafo__busca>.ay-field{display:contents}
.pt-grafo__busca>.ay-field>*{grid-column:1}
.pt-grafo__busca>.ay-field>.ay-label{grid-row:1}
.pt-grafo__busca>.ay-field>:nth-child(2){grid-row:2}
.pt-grafo__busca>.ay-field>.ay-error:empty{display:none}
.pt-grafo__busca>.ay-btn{grid-column:2;grid-row:2}
/* Consulta 360 (20-oct): en el módulo, las tarjetas de nodos y de sistemas van debajo del grafo, a todo el ancho y alineadas con
   sus columnas; «Ocultar ficha» esconde el panel del dato; un dato o sistema caído se pinta en rojo (solo tokens del SDK) */
.pt-c360-modulo{grid-column:1/-1;display:grid;gap:var(--aybar-space-4);min-inline-size:0;align-items:start}
@media(min-width:1024px){.pt-c360-modulo{grid-template-columns:minmax(0,1.8fr) minmax(0,1fr)}}
.pt-c360-caido>.ay-btn{--button-fg:var(--aybar-color-feedback-danger-fg);--button-border:var(--aybar-color-feedback-danger-border);--button-bg:var(--aybar-color-feedback-danger-bg)}
.pt-lateral[data-sin-ficha]>:has(.pt-c360-dato){display:none}
.pt-inicio__ancla{position:sticky;top:var(--pt-navbar-alto,0px);z-index:5;display:flex;gap:var(--aybar-space-2);align-items:center;padding:var(--aybar-space-2) var(--aybar-space-6);background:color-mix(in srgb,var(--aybar-color-bg-canvas,#0f1a1f) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--v3-ln)}
.pt-inicio__ancla button{font:var(--aybar-font-weight-semibold) var(--aybar-font-size-xs)/1 inherit;font-family:inherit;padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-full);border:1px solid var(--v3-ln);background:transparent;color:var(--v3-mu);cursor:pointer;transition:color .2s,border-color .2s,background .2s}
.pt-inicio__ancla button:hover{color:var(--v3-fg);border-color:var(--v3-mu)}
.pt-inicio__ancla button[aria-current=true]{color:var(--aybar-color-bg-canvas,#0f1a1f);background:var(--v3-acc);border-color:var(--v3-acc)}
.pt-inicio section{scroll-margin-top:calc(var(--pt-navbar-alto,0px) + 56px)}
.pt-inicio__vivo{margin-top:var(--aybar-space-6);padding-top:var(--aybar-space-3);border-top:1px solid var(--v3-ln)}
.pt-inicio__ficha{font-size:var(--aybar-font-size-sm)}

/* ---------------------------------------------------------------- asistente flotante */
.pt-bot{position:fixed;right:var(--aybar-space-5);bottom:var(--aybar-space-5);z-index:60}
.pt-bot__fab{position:relative;display:block;width:78px;height:78px;padding:0;border-radius:50%;border:1px solid var(--v3-ln);background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--v3-acc) 22%,var(--v3-sf)),var(--v3-sk));cursor:pointer;box-shadow:0 12px 32px rgba(0,0,0,.5);overflow:hidden;transition:transform .3s cubic-bezier(.25,1,.5,1),border-color .2s}
.pt-bot__fab:hover{transform:translateY(-3px);border-color:var(--v3-acc)}.pt-bot__fab canvas{width:100%;height:100%;display:block}
.pt-bot__globo{position:absolute;right:88px;bottom:22px;max-width:220px;padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-md) var(--aybar-radius-md) calc(var(--aybar-radius-sm) / 2) var(--aybar-radius-md);background:var(--v3-sf);border:1px solid var(--v3-ln);box-shadow:0 10px 28px rgba(0,0,0,.4);font-size:var(--aybar-font-size-xs);line-height:1.35;color:var(--v3-fg);cursor:pointer;animation:v3-arriba .3s cubic-bezier(.25,1,.5,1);text-align:left}
.pt-bot__panel{position:absolute;right:0;bottom:92px;width:min(410px,calc(100vw - 32px));height:min(620px,calc(100vh - 150px));display:flex;flex-direction:column;border-radius:var(--aybar-radius-lg);background:color-mix(in srgb,var(--v3-sf) 97%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--v3-ln);box-shadow:0 24px 70px rgba(0,0,0,.55);color:var(--v3-fg);overflow:hidden;animation:v3-arriba .28s cubic-bezier(.25,1,.5,1)}
.pt-bot__cab{display:flex;align-items:center;gap:var(--aybar-space-3);padding:var(--aybar-space-3) var(--aybar-space-3);border-bottom:1px solid var(--v3-ln);background:linear-gradient(180deg,color-mix(in srgb,var(--v3-acc) 14%,transparent),transparent)}
.pt-bot__av{width:48px;height:48px;border-radius:50%;overflow:hidden;flex:none;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--v3-acc) 25%,var(--v3-sf)),var(--v3-sk));border:1px solid var(--v3-ln)}.pt-bot__av canvas{width:100%;height:100%;display:block}
.pt-bot__cab h2{margin:0;font-size:var(--aybar-font-size-sm);font-weight:var(--aybar-font-weight-bold)}.pt-bot__cab small{display:block;color:var(--v3-mu);font-size:var(--aybar-font-size-xs);margin-top:var(--aybar-space-px)}
.pt-bot__x{margin-left:auto;width:30px;height:30px;border-radius:var(--aybar-radius-sm);border:1px solid var(--v3-ln);background:transparent;color:var(--v3-mu);cursor:pointer}.pt-bot__x:hover{color:var(--v3-fg)}
.pt-bot__msgs{flex:1;overflow:auto;padding:var(--aybar-space-3);display:flex;flex-direction:column;gap:var(--aybar-space-2);scroll-behavior:smooth}
.pt-bot__m{max-width:94%;padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-md);font-size:var(--aybar-font-size-sm);line-height:1.5;white-space:pre-wrap;animation:v3-msg .28s cubic-bezier(.25,1,.5,1)}
@keyframes v3-msg{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.pt-bot__m--bot{align-self:flex-start;background:var(--v3-sk);border:1px solid var(--v3-ln);border-bottom-left-radius:calc(var(--aybar-radius-sm) / 2)}
.pt-bot__m--yo{align-self:flex-end;background:color-mix(in srgb,var(--v3-acc) 22%,var(--v3-sk));border:1px solid color-mix(in srgb,var(--v3-acc) 40%,transparent);border-bottom-right-radius:calc(var(--aybar-radius-sm) / 2)}
.pt-bot__m h3{margin:0 0 var(--aybar-space-1);font-size:var(--aybar-font-size-xs);letter-spacing:.06em;text-transform:uppercase;color:var(--v3-acc)}
.pt-bot__m ul,.pt-bot__m ol{margin:var(--aybar-space-1) 0 0;padding-left:var(--aybar-space-4)}.pt-bot__m li{margin:var(--aybar-space-1) 0}
.pt-bot__texto{margin:var(--aybar-space-1) 0;padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-sm);background:var(--v3-sf);border:1px dashed var(--v3-ln);white-space:pre-wrap}
.pt-bot__acc{display:flex;gap:var(--aybar-space-1);flex-wrap:wrap;margin-top:var(--aybar-space-2)}
.pt-bot__editar{display:block;width:100%;box-sizing:border-box;resize:vertical;font:inherit;color:var(--v3-fg);line-height:1.5}
.pt-bot__editar:focus{outline:2px solid var(--v3-acc);outline-offset:1px;border-style:solid}.pt-bot__editar[readonly]{color:var(--v3-mu)}
.pt-bot__crit{margin-top:var(--aybar-space-2)}.pt-bot__nota{margin:var(--aybar-space-1) 0 0;color:var(--v3-mu);font-size:var(--aybar-font-size-xs)}
.pt-bot__btn{font-family:inherit;font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-semibold);padding:var(--aybar-space-1) var(--aybar-space-3);border-radius:var(--aybar-radius-full);border:1px solid var(--v3-ln);background:transparent;color:var(--v3-fg);cursor:pointer;transition:border-color .2s,background .2s}
.pt-bot__btn:hover{border-color:var(--v3-acc)}.pt-bot__btn--p{background:var(--v3-acc);border-color:var(--v3-acc);color:var(--aybar-color-bg-canvas,#0f1a1f)}
.pt-bot__btn[aria-pressed=true]{background:color-mix(in srgb,var(--v3-acc) 22%,transparent);border-color:var(--v3-acc)}
.pt-bot__h{display:flex;gap:var(--aybar-space-2);align-items:flex-start;margin:var(--aybar-space-1) 0}.pt-bot__h i{font-style:normal;flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:var(--aybar-font-size-xs);font-weight:var(--aybar-font-weight-bold);color:var(--aybar-color-bg-canvas,#0f1a1f)}
.pt-bot__h[data-n=ok] i{background:var(--v3-ok)}.pt-bot__h[data-n=aviso] i{background:var(--v3-warn)}.pt-bot__h[data-n=alto] i{background:var(--v3-bad)}
.pt-bot__chips{display:flex;flex-wrap:wrap;gap:var(--aybar-space-1);padding:var(--aybar-space-2) var(--aybar-space-3);border-top:1px solid var(--v3-ln)}
.pt-bot__form{display:flex;gap:var(--aybar-space-2);padding:var(--aybar-space-2) var(--aybar-space-3) var(--aybar-space-3);border-top:1px solid var(--v3-ln)}
.pt-bot__form input{flex:1;min-width:0;font:var(--aybar-font-weight-medium) var(--aybar-font-size-sm) inherit;font-family:inherit;padding:var(--aybar-space-2) var(--aybar-space-3);border-radius:var(--aybar-radius-full);border:1px solid var(--v3-ln);background:var(--v3-sk);color:var(--v3-fg)}
.pt-bot__form input:focus{outline:2px solid var(--v3-acc);outline-offset:1px}
.pt-bot__puntos{display:inline-flex;gap:var(--aybar-space-1);padding:var(--aybar-space-1) 0}.pt-bot__puntos i{width:6px;height:6px;border-radius:50%;background:var(--v3-mu);animation:v3-punto 1s ease-in-out infinite}.pt-bot__puntos i:nth-child(2){animation-delay:.15s}.pt-bot__puntos i:nth-child(3){animation-delay:.3s}
@keyframes v3-punto{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@media(max-width:640px){.pt-bot{right:var(--aybar-space-3);bottom:var(--aybar-space-3)}.pt-bot__panel{bottom:88px;height:calc(100vh - 130px)}}

@media(prefers-reduced-motion:reduce){.pt-herr *,.pt-bot *,.pt-inicio__ancla *{animation:none!important;transition:none!important}}
@media(prefers-reduced-motion:reduce){.v3-hud *,.v3-ficha,.v3-ficha *{animation:none!important;transition:none!important}}
`

let hecho = false
export function inyectarEstilos() {
  if (hecho || typeof document === 'undefined') return
  hecho = true
  if (document.getElementById('v3-estilos')) return
  const s = document.createElement('style'); s.id = 'v3-estilos'; s.textContent = CSS; document.head.append(s)
}
