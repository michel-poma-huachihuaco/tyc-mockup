function __Hud(__p){let r=O.useRef(null);O.useEffect(()=>{r.current&&__hud(r.current,__p)});return(0,k.jsx)(`div`,{ref:r,role:`group`,"aria-label":`Indicadores en vivo`})}
function __Ficha(__p){
let t=__p.t,d=__p.datos,ah=d.ahora,sla=S(t,ah),ref=O.useRef(null);
O.useEffect(()=>{let el=ref.current;el&&el.focus({preventScroll:!0});let f=ev=>{ev.key===`Escape`&&__p.onCerrar()};document.addEventListener(`keydown`,f);return()=>document.removeEventListener(`keydown`,f)},[t.id]);
let hecho=t.estado===`RESOLVED`||t.estado===`CLOSED`,
ini=sla.hito===`respuesta`?t.abierto:t.inicioCiclo,
total=sla.vence.getTime()-ini.getTime(),
fin=hecho?(t.ultimaResolucion??t.cierre??ah):ah,
pct=total>0?Math.max(0,Math.min(1,(fin.getTime()-ini.getTime())/total)):1,
nivel=sla.nivel===`vencido`||sla.nivel===`fuera-de-plazo`?`vencido`:sla.nivel===`en-riesgo`?`riesgo`:sla.nivel===`cumplido`?`cumplido`:`ok`,
fila=(l,v)=>(0,k.jsxs)(`div`,{className:`v3-f-fila`,children:[(0,k.jsx)(`dt`,{children:l}),(0,k.jsx)(`dd`,{children:v})]}),
cli=t.clienteId&&__cli(t.clienteId),
hist=d.filasEstado.filter(q=>q.ticketId===t.id).sort((a,b)=>b.fecha.getTime()-a.fecha.getTime()).slice(0,5),
rayo=re(d,t.id),
zona=A.find(q=>q.k===I(d,t));
return(0,k.jsxs)(`aside`,{ref:ref,tabIndex:-1,role:`dialog`,"aria-label":`Detalle del ticket ${t.numero}`,className:`v3-ficha`,"data-nivel":nivel,children:[
(0,k.jsxs)(`div`,{className:`v3-f-cab`,children:[
(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{className:`v3-f-num`,children:t.numero}),
(0,k.jsxs)(`div`,{className:`v3-f-chips`,children:[(0,k.jsx)(C,{sla:sla,size:`sm`}),rayo?(0,k.jsx)(e,{tone:`danger`,size:`sm`,children:`Rayo`}):null,(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:y[t.estado]})]})]}),
(0,k.jsx)(`button`,{type:`button`,className:`v3-f-x`,"aria-label":`Cerrar el detalle`,onClick:__p.onCerrar,dangerouslySetInnerHTML:{__html:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`}})]}),
(0,k.jsx)(`p`,{className:`v3-f-res`,children:t.resumen}),
(0,k.jsxs)(`div`,{className:`v3-f-sla`,children:[(0,k.jsxs)(`div`,{className:`v3-f-sla-t`,children:[(0,k.jsxs)(`span`,{children:[`SLA de `,sla.hito===`respuesta`?`primera respuesta`:`resolución`,` · vence `,(0,k.jsx)(`b`,{children:x(sla.vence)})]}),(0,k.jsxs)(`b`,{children:[Math.round(pct*100),` %`]})]}),(0,k.jsx)(`div`,{className:`v3-f-barra`,children:(0,k.jsx)(`i`,{style:{"--p":pct}})})]}),
(0,k.jsxs)(`dl`,{className:`v3-f-grid`,children:[fila(`Canal`,t.canal),fila(`Tipo`,r(t.tipo)),fila(`Área`,zona?zona.n:`—`),fila(`Etapa`,se[L(t)]),fila(`Responsable`,t.responsable?p(t.responsable):`Sin responsable`),fila(`Cliente`,cli?cli.nombre:`—`)]}),
hist.length?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(`h3`,{className:`v3-f-t`,children:`Recorrido`}),(0,k.jsx)(`ol`,{className:`v3-f-hist`,children:hist.map(q=>(0,k.jsxs)(`li`,{children:[x(q.fecha),` · `,q.de?`${y[q.de]} → `:``,y[q.a]]},q.id))})]}):null,
(0,k.jsxs)(`div`,{className:`v3-f-acc`,children:[(0,k.jsx)(n,{size:`sm`,variant:`primary`,onClick:__p.onAbrir,children:`Abrir el ticket`}),t.clienteId&&t.clienteId!==`cli-int`?(0,k.jsx)(n,{size:`sm`,variant:`secondary`,onClick:__p.onC360,children:`Consulta 360`}):null,__p.puedeRayo&&!hecho&&!rayo?(0,k.jsx)(n,{size:`sm`,variant:`secondary`,onClick:__p.onRayo,children:`Rayo`}):null]})]})}
