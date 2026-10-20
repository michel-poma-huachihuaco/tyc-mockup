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
// HU-067 CA-05: recorrido con registro, asignaciones y cambios de estado (más reciente arriba) y CSAT si ya se cerró
hist=[...d.filasEstado.filter(q=>q.ticketId===t.id).map(q=>({id:q.id,fecha:q.fecha,txt:q.de?`${y[q.de]} → ${y[q.a]}`:`Registrado`})),...d.filasAsignacion.filter(q=>q.ticketId===t.id&&q.aResponsable).map(q=>({id:q.id,fecha:q.fecha,txt:`Asignado a ${p(q.aResponsable)}`}))].sort((a,b)=>b.fecha.getTime()-a.fecha.getTime()).slice(0,6),
enc=t.estado===`CLOSED`?d.encuestas.filter(q=>q.ticketId===t.id&&q.respuesta).at(-1):null,
rayo=re(d,t.id),
zona=A.find(q=>q.k===I(d,t));
return(0,k.jsxs)(`aside`,{ref:ref,tabIndex:-1,role:`dialog`,"aria-label":`Detalle del ticket ${t.numero}`,className:`v3-ficha`,"data-nivel":nivel,children:[
(0,k.jsxs)(`div`,{className:`v3-f-cab`,children:[
(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{className:`v3-f-num`,children:t.numero}),
(0,k.jsxs)(`div`,{className:`v3-f-chips`,children:[(0,k.jsx)(C,{sla:sla,size:`sm`}),rayo?(0,k.jsx)(e,{tone:`danger`,size:`sm`,children:`Rayo`}):null,(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:y[t.estado]})]})]}),
(0,k.jsx)(`button`,{type:`button`,className:`v3-f-x`,"aria-label":`Cerrar el detalle`,onClick:__p.onCerrar,dangerouslySetInnerHTML:{__html:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`}})]}),
(0,k.jsx)(`p`,{className:`v3-f-res`,children:t.resumen}),
(0,k.jsxs)(`div`,{className:`v3-f-sla`,children:[(0,k.jsxs)(`div`,{className:`v3-f-sla-t`,children:[(0,k.jsxs)(`span`,{children:[`SLA de `,sla.hito===`respuesta`?`primera respuesta`:`resolución`,` · vence `,(0,k.jsx)(`b`,{children:x(sla.vence)})]}),(0,k.jsxs)(`b`,{children:[Math.round(pct*100),` %`]})]}),(0,k.jsx)(`div`,{className:`v3-f-barra`,children:(0,k.jsx)(`i`,{style:{"--p":pct}})})]}),
(0,k.jsxs)(`dl`,{className:`v3-f-grid`,children:[fila(`Canal`,t.canal),fila(`Tipo`,r(t.tipo)),fila(`Área`,zona?zona.n:`—`),fila(`Etapa`,se[L(t)]),fila(`Responsable`,t.responsable?p(t.responsable):`Sin responsable`),fila(`Cliente`,cli?cli.nombre:`—`),t.estado===`CLOSED`?fila(`CSAT`,enc?`${enc.respuesta.csat}/5${enc.respuesta.nps!==void 0?` · NPS ${enc.respuesta.nps}`:``}`:`Encuesta sin respuesta`):null]}),
hist.length?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(`h3`,{className:`v3-f-t`,children:`Recorrido`}),(0,k.jsx)(`ol`,{className:`v3-f-hist`,children:hist.map(q=>(0,k.jsxs)(`li`,{children:[x(q.fecha),` · `,q.txt]},q.id))})]}):null,
(0,k.jsxs)(`div`,{className:`v3-f-acc`,children:[(0,k.jsx)(n,{size:`sm`,variant:`primary`,onClick:__p.onAbrir,children:`Abrir el ticket`}),t.clienteId&&t.clienteId!==`cli-int`?(0,k.jsx)(n,{size:`sm`,variant:`secondary`,onClick:__p.onC360,children:`Consulta 360`}):null,__p.puedeRayo&&!hecho&&!rayo?(0,k.jsx)(n,{size:`sm`,variant:`secondary`,onClick:__p.onRayo,children:`Rayo`}):null]})]})}
// HU-067 CA-03 y CA-06: registro de actividad con la hora de cada evento: cambios de estado y, al vencer el SLA, la alerta tal como
// la registra el job (destinatario y canal). Los nombres son los del chunk: y estados, p persona, x fecha.
function __bitacora(o){let n=q=>o.tickets.find(t=>t.id===q)?.numero??``;return[...o.filasEstado.map(q=>({id:q.id,fecha:q.fecha,txt:`${n(q.ticketId)} · ${y[q.a]}`})),...o.alertas.map(q=>({id:q.id,fecha:q.fecha,alerta:!0,txt:`${n(q.ticketId)} · SLA vencido: aviso a ${p(q.destinatario)} (${String(q.canal).toLowerCase()})`}))].sort((a,b)=>b.fecha.getTime()-a.fecha.getTime()).slice(0,8)}
// HU-067 CA-09 (y los datos de CA-04): la escena resumida por área, en tabla, para teclado, lector de pantalla o equipos sin 3D.
function __Areas(__p){let o=__p.datos,act=o.tickets.filter(q=>w.includes(q.estado)),fil=A.map(z=>{let ts=act.filter(q=>I(o,q)===z.k),res=o.tickets.filter(q=>I(o,q)===z.k&&q.primeraResolucion),en=res.filter(q=>q.primeraResolucion<=q.venceResolucion).length;return{id:z.k,n:z.n,cola:ts.filter(q=>L(q)===`cola`).length,aten:ts.filter(q=>L(q)===`atencion`).length,ocup:z.gente.filter(g=>ts.some(q=>L(q)===`atencion`&&q.responsable===g)).length,tot:z.gente.length,riesgo:ts.filter(q=>{let v=S(q,o.ahora).nivel;return v===`vencido`||v===`en-riesgo`}).length,res:res.length,sla:res.length?Math.round(en/res.length*100):null}});
return(0,k.jsxs)(T,{children:[(0,k.jsx)(D,{as:`h2`,title:`Por área`,subtitle:`La escena resumida por área: cola, gestores ocupados, riesgo y resueltos dentro del SLA.`}),(0,k.jsx)(E,{children:(0,k.jsx)(ae,{caption:`Tickets por área`,rows:fil,getRowId:q=>q.id,columns:[{key:`n`,header:`Área`},{key:`cola`,header:`En cola`,align:`end`},{key:`aten`,header:`En atención`,align:`end`},{key:`ocup`,header:`Gestores ocupados`,align:`end`,renderCell:q=>`${q.ocup} de ${q.tot}`},{key:`riesgo`,header:`En riesgo o vencidos`,align:`end`},{key:`res`,header:`Resueltos`,align:`end`},{key:`sla`,header:`% en SLA`,align:`end`,renderCell:q=>q.sla===null?`—`:`${q.sla} %`}]})})]})}
