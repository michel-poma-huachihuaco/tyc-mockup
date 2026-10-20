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
// HU-067 CA-05: recorrido con registro, paso por la bandeja orquestadora (al registrarse), asignaciones y cambios de estado
// (más reciente arriba) y CSAT si ya se cerró. `o` ordena los pasos de la misma hora: registro < bandeja < asignación < estado.
reg=d.filasEstado.find(q=>q.ticketId===t.id&&!q.de),
hist=[...d.filasEstado.filter(q=>q.ticketId===t.id).map(q=>({id:q.id,fecha:q.fecha,o:q.de?3:0,txt:q.de?`${y[q.de]} → ${y[q.a]}`:`Registrado`})),{id:`bandeja`,fecha:reg?reg.fecha:t.abierto,o:1,txt:se.bandeja},...d.filasAsignacion.filter(q=>q.ticketId===t.id&&q.aResponsable).map(q=>({id:q.id,fecha:q.fecha,o:2,txt:`Asignado a ${p(q.aResponsable)}`}))].sort((a,b)=>b.fecha.getTime()-a.fecha.getTime()||b.o-a.o).slice(0,7),
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
// HU-067 CA-03 y CA-06: registro de actividad con la hora de cada evento: cambios de estado y, al vencer el SLA (la alerta del job),
// el correo al responsable con copia a su líder (como RN-SVC-035 y HU-055). El líder sale del maestro local de ATC (`__equipo(líder)` es su
// equipo); sin líder se dice, como en Mi día. Sin responsable, el correo va a quien registra la alerta. y estados, p persona.
function __lid(g){return g&&v.find(q0=>__equipo(q0.id).some(q=>q.id===g))?.id||null}
function __bitacora(o){let n=q=>o.tickets.find(t=>t.id===q)?.numero??``,
correo=q=>{let r0=o.tickets.find(t=>t.id===q.ticketId)?.responsable,l=__lid(r0);return r0?l?`correo a ${p(r0)} con copia a su líder, ${p(l)}`:`correo a ${p(r0)} · ${__lider(null)}`:`correo a ${p(q.destinatario)}`};
return[...o.filasEstado.map(q=>({id:q.id,fecha:q.fecha,txt:`${n(q.ticketId)} · ${y[q.a]}`})),...o.alertas.map(q=>({id:q.id,fecha:q.fecha,alerta:!0,txt:`${n(q.ticketId)} · SLA vencido: ${correo(q)}`}))].sort((a,b)=>b.fecha.getTime()-a.fecha.getTime()).slice(0,8)}
// HU-067 CA-07: el visor muestra solo las áreas permitidas y la razón social elegida; lo demás no aparece (escena, tablas,
// indicadores y bitácora salen de la vista filtrada). Áreas permitidas: todas para quien ve «Todas las áreas» en la bandeja
// (supervisor y coordinador CX); para los demás, las salas cuyo equipo es de su misma área (la `gente` de cada sala del chunk).
function __zonasPermitidas(c){if(!c||c.rol===`SUPERVISOR`||c.rol===`COORDINADOR_CX`)return null;return new Set(A.filter(z=>z.gente.some(g=>v.find(q=>q.id===g)?.area===c.area)).map(z=>z.k))}
function __filtrar(o,c,emp){let zs=__zonasPermitidas(c);if(!zs&&!emp)return o;let ok=new Set(o.tickets.filter(t=>(!emp||t.empresaId===emp)&&(!zs||zs.has(I(o,t)))).map(t=>t.id)),f=q=>ok.has(q.ticketId);return{...o,tickets:o.tickets.filter(t=>ok.has(t.id)),filasEstado:o.filasEstado.filter(f),filasAsignacion:o.filasAsignacion.filter(f),alertas:o.alertas.filter(f),encuestas:o.encuestas.filter(f)}}
function __nAreas(c){let q=__zonasPermitidas(c)?.size??A.length;return q===1?`1 área`:`${q} áreas`}
// HU-067 CA-02: la caja del ticket lleva el color de su tipo (tipos de la Etapa 1, sin incidencia de ciudad), con tokens del
// sistema de diseño. Verde, ámbar y rojo quedan para el SLA (la luz y el halo de la caja).
const __COLOR_TIPO={PED:`primary-300`,CTA:`primary-500`,VIS:`primary-800`,QUE:`secondary-300`,REC:`secondary-700`,GAR:`info-400`,RES:`info-700`,ING:`neutral-450`,RSV:`neutral-700`};
// HU-067 CA-04 y CA-09: resumen de un área (cola, gestores ocupados, riesgo, resueltos y % en SLA) para la tabla y el panel.
function __resumenArea(o,z){let ts=o.tickets.filter(q=>w.includes(q.estado)&&I(o,q)===z.k),res=o.tickets.filter(q=>I(o,q)===z.k&&q.primeraResolucion),en=res.filter(q=>q.primeraResolucion<=q.venceResolucion).length;return{id:z.k,n:z.n,ts:ts,cola:ts.filter(q=>L(q)===`cola`).length,aten:ts.filter(q=>L(q)===`atencion`).length,ocup:z.gente.filter(g=>ts.some(q=>L(q)===`atencion`&&q.responsable===g)).length,tot:z.gente.length,riesgo:ts.filter(q=>{let v=S(q,o.ahora).nivel;return v===`vencido`||v===`en-riesgo`}).length,res:res.length,sla:res.length?Math.round(en/res.length*100):null}}
// HU-067 CA-09 (y los datos de CA-04): la escena resumida por área, en tabla, para teclado, lector de pantalla o equipos sin 3D.
// Solo las áreas permitidas (CA-07); el nombre abre el mismo panel que tocar el área en la escena.
function __Areas(__p){let o=__p.datos,fil=A.filter(z=>!__p.zonas||__p.zonas.has(z.k)).map(z=>__resumenArea(o,z));
return(0,k.jsxs)(T,{children:[(0,k.jsx)(D,{as:`h2`,title:`Por área`,subtitle:`La escena resumida por área: cola, gestores ocupados, riesgo y resueltos dentro del SLA.`}),(0,k.jsx)(E,{children:(0,k.jsx)(ae,{caption:`Tickets por área`,rows:fil,getRowId:q=>q.id,columns:[{key:`n`,header:`Área`,renderCell:q=>__p.onZona?(0,k.jsx)(`button`,{type:`button`,tabIndex:-1,className:`pt-enlace-celda`,onClick:()=>__p.onZona(q.id),children:q.n}):q.n},{key:`cola`,header:`En cola`,align:`end`},{key:`aten`,header:`En atención`,align:`end`},{key:`ocup`,header:`Gestores ocupados`,align:`end`,renderCell:q=>`${q.ocup} de ${q.tot}`},{key:`riesgo`,header:`En riesgo o vencidos`,align:`end`},{key:`res`,header:`Resueltos`,align:`end`},{key:`sla`,header:`% en SLA`,align:`end`,renderCell:q=>q.sla===null?`—`:`${q.sla} %`}]})})]})}
// HU-067 CA-04: panel del área (al tocarla en la escena o su nombre en «Por área»): en cola, gestores ocupados, resueltos y % en
// SLA, sus tickets y la carga de cada gestor con las reasignaciones por carga ya hechas. Solo informativo: desde el visor no se
// reasigna (fuera de alcance). La carga sale de todos los tickets del gestor (`todo`), no de la vista filtrada.
function __Area(__p){
let o=__p.datos,z=A.find(q=>q.k===__p.zona),ref=O.useRef(null);
O.useEffect(()=>{let el=ref.current;el&&el.focus({preventScroll:!0});let f=ev=>{ev.key===`Escape`&&__p.onCerrar()};document.addEventListener(`keydown`,f);return()=>document.removeEventListener(`keydown`,f)},[__p.zona]);
if(!z)return null;
let r0=__resumenArea(o,z),
fila=(l,v)=>(0,k.jsxs)(`div`,{className:`v3-f-fila`,children:[(0,k.jsx)(`dt`,{children:l}),(0,k.jsx)(`dd`,{children:v})]}),
tks=[...r0.ts].sort((a,b)=>S(a,o.ahora).vence.getTime()-S(b,o.ahora).vence.getTime()),
ids=new Set(o.tickets.filter(q=>I(o,q)===z.k).map(q=>q.id)),
reas=o.filasAsignacion.filter(q=>q.motivo===`REASSIGNMENT_CARGA`&&ids.has(q.ticketId)).sort((a,b)=>b.fecha.getTime()-a.fecha.getTime()).slice(0,5),
num=q=>o.tickets.find(t=>t.id===q)?.numero??``;
return(0,k.jsxs)(`aside`,{ref:ref,tabIndex:-1,role:`dialog`,"aria-label":`Detalle del área ${z.n}`,className:`v3-ficha`,children:[
(0,k.jsxs)(`div`,{className:`v3-f-cab`,children:[(0,k.jsx)(`h3`,{className:`v3-f-area`,children:z.n}),
(0,k.jsx)(`button`,{type:`button`,className:`v3-f-x`,"aria-label":`Cerrar el detalle del área`,onClick:__p.onCerrar,dangerouslySetInnerHTML:{__html:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`}})]}),
(0,k.jsxs)(`dl`,{className:`v3-f-grid`,children:[fila(`En cola`,r0.cola),fila(`Gestores ocupados`,`${r0.ocup} de ${r0.tot}`),fila(`Resueltos`,r0.res),fila(`% en SLA`,r0.sla===null?`—`:`${r0.sla} %`)]}),
(0,k.jsx)(`h4`,{className:`v3-f-t`,children:`Tickets del área`}),
tks.length?(0,k.jsx)(`ul`,{className:`v3-f-lista`,children:tks.map(q=>(0,k.jsxs)(`li`,{children:[(0,k.jsx)(`button`,{type:`button`,className:`pt-enlace-celda`,onClick:()=>__p.onTicket(q.id),children:q.numero}),(0,k.jsx)(`span`,{children:se[L(q)]}),(0,k.jsx)(C,{sla:S(q,o.ahora),size:`sm`})]},q.id))}):(0,k.jsx)(`p`,{className:`v3-f-nota`,children:`Sin tickets activos.`}),
(0,k.jsx)(`h4`,{className:`v3-f-t`,children:`Carga de cada gestor`}),
(0,k.jsx)(`ul`,{className:`v3-f-lista`,children:z.gente.map(g=>{let c0=__carga(__p.todo,g).carga;return(0,k.jsxs)(`li`,{children:[(0,k.jsx)(`span`,{children:p(g)}),(0,k.jsx)(`span`,{children:`Carga ${c0} (límite 12)`}),c0>12?(0,k.jsx)(e,{tone:`warning`,size:`sm`,children:`Sobre el límite`}):null,__disp(__p.todo,g)?null:(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:`No disponible`})]},g)})}),
(0,k.jsx)(`h4`,{className:`v3-f-t`,children:`Reasignaciones por carga`}),
reas.length?(0,k.jsx)(`ul`,{className:`v3-f-lista`,children:reas.map(q=>(0,k.jsx)(`li`,{children:`${x(q.fecha)} · ${num(q.ticketId)}: ${p(q.deResponsable)} → ${q.aResponsable?p(q.aResponsable):`cola del área`}`},q.id))}):(0,k.jsx)(`p`,{className:`v3-f-nota`,children:`Sin reasignaciones por carga.`}),
(0,k.jsx)(`p`,{className:`v3-f-nota`,children:`La reasignación por carga se hace en Mi día › Equipo; aquí solo se consulta.`})]})}
