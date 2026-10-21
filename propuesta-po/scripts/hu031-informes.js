// HU-ATC-031 (v1.3): los informes se generan solos al cierre. Al avanzar el reloj simulado (Herramientas › Simulación, que también
// corre el job programado), por cada cierre de jornada que el reloj pasó (día hábil a la hora de fin del horario, Cn.hasta) se
// genera el informe diario y, si esa jornada es la última hábil de su quincena (del 1 al 15 y del 16 a fin de mes), también el
// quincenal. El reloj solo avanza por ahí, así que ningún cierre se salta ni se repite. Cada informe se calcula con los datos tal como estaban
// en su corte: tickets abiertos hasta entonces con el estado de su historial, encuestas respondidas y derivaciones hasta el corte.
//  · Diario (CA-01): el mismo contenido de siempre (ur): tickets por eje, NPS preliminar, derivaciones y cumplimiento de SLA.
//  · Quincenal (CA-02): tendencias de los KPI (cumplimiento de SLA, CSAT, NPS y adopción de Mi Portal) al cierre de la quincena,
//    con su variación respecto del cierre de la quincena anterior, y su evolución jornada a jornada dentro de la quincena.
//    Adopción de Mi Portal = % de los tickets nuevos de la quincena que el cliente registró en Mi Portal (canal «Mi Portal»).
// Sufijo del chunk «comun»: ur informe, ar NPS, wi nivel de SLA, Wn día hábil, Cn horario, I ids, Dc personas por rol, __lbl rótulo NPS.
var __ptInformes=(()=>{
let DIAS=[`dom`,`lun`,`mar`,`mié`,`jue`,`vie`,`sáb`],MESES=[`ene`,`feb`,`mar`,`abr`,`may`,`jun`,`jul`,`ago`,`set`,`oct`,`nov`,`dic`],
dia=d=>{let x=new Date(d);return x.setHours(0,0,0,0),x},cierre=d=>{let x=new Date(d);return x.setHours(Cn.hasta,0,0,0),x},
fecha=d=>`${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`,
iniQ=d=>{let x=dia(d);return x.setDate(x.getDate()<=15?1:16),x},
corteQ=d=>{let x=dia(d);for(x.getDate()<=15?x.setDate(15):x.setMonth(x.getMonth()+1,0);!Wn(x);)x.setDate(x.getDate()-1);return cierre(x)},
jornadas=(a,b)=>{let r=[];for(let x=dia(a);x<=b;x.setDate(x.getDate()+1)){let c=cierre(x);Wn(x)&&c>=a&&c<=b&&r.push(c)}return r},
alCorte=(e,c)=>{let est=t=>{let f=null;for(let q of e.filasEstado)q.ticketId===t.id&&q.fecha<=c&&(!f||q.fecha>=f.fecha)&&(f=q);return f?f.a:t.estado};
return{...e,ahora:c,tickets:e.tickets.filter(t=>t.abierto<=c).map(t=>({...t,estado:est(t),primeraRespuesta:t.primeraRespuesta&&t.primeraRespuesta<=c?t.primeraRespuesta:null})),
encuestas:e.encuestas.map(q=>q.respuesta&&q.respuesta.fecha>c?{...q,respuesta:null}:q),handoffs:e.handoffs.filter(q=>q.enviado<=c),filasAsignacion:e.filasAsignacion.filter(q=>q.fecha<=c)}},
pct=(n,d)=>d?Math.round(n/d*100):null,
kpis=(e,c,desde)=>{let v=alCorte(e,c),n=v.tickets.map(t=>wi(t,c).nivel),r=v.encuestas.flatMap(q=>q.respuesta?[q.respuesta]:[]),nu=v.tickets.filter(t=>t.abierto>=desde);
return{sla:pct(n.filter(q=>q===`cumplido`||q===`en-plazo`||q===`en-riesgo`).length,n.length),csat:r.length?Math.round(r.reduce((a,q)=>a+q.csat,0)/r.length*10)/10:null,nps:ar(v),adopcion:pct(nu.filter(t=>t.canal===`Mi Portal`).length,nu.length)}},
diario=(e,c)=>({tipo:`DIARIO`,corte:c,datos:ur(alCorte(e,c),`DIARIO`,Dc.COORDINADOR_CX).informes.at(-1).datos,serie:[]}),
quincenal=(e,c)=>{let d=iniQ(c),pa=new Date(d.getTime()-1),ca=corteQ(pa),k=kpis(e,c,d),ka=kpis(e,ca,iniQ(pa)),v=alCorte(e,c);
return{tipo:`QUINCENAL`,corte:c,desde:d,anterior:ca,
datos:[[`Tickets abiertos en la quincena`,String(v.tickets.filter(t=>t.abierto>=d).length)],[`Encuestas respondidas en la quincena`,String(v.encuestas.filter(q=>q.respuesta&&q.respuesta.fecha>=d).length)]],
tendencias:[[`sla`,`Cumplimiento de SLA`],[`csat`,`CSAT (1 a 5)`],[`nps`,__lbl(v)],[`adopcion`,`Adopción de Mi Portal`]].map(([id,label])=>({id,label,valor:k[id],anterior:ka[id]})),
serie:jornadas(d,c).map(j=>({id:`j-${j.getTime()}`,jornada:j,...kpis(e,j,d)}))}},
txt=(id,v)=>v==null?null:id===`csat`?v.toFixed(1):id===`nps`?`${v>0?`+`:``}${v}`:`${v} %`,
delta=t=>{if(t.valor==null||t.anterior==null)return;let d=t.id===`csat`?Math.round((t.valor-t.anterior)*10)/10:t.valor-t.anterior,a=Math.abs(d),u=t.id===`csat`?a.toFixed(1):`${a} ${a===1?`punto`:`puntos`}`;
return d===0?{dir:`flat`,value:`sin cambio`}:{dir:d>0?`up`:`down`,value:`${d>0?`+`:`−`}${u}`}},
job=(e,a)=>{let b=e.ahora,d=e,hechos=[];
for(let c of jornadas(new Date(a.getTime()+1),b))for(let x of [diario(e,c),...corteQ(c).getTime()===c.getTime()?[quincenal(e,c)]:[]]){let[id,n]=I(d,`inf`);d={...n,informes:[...n.informes,{id,generado:c,automatico:!0,...x}]};hechos.push(x.tipo===`DIARIO`?`diario del ${fecha(c)}`:`quincenal del ${fecha(x.desde)} al ${fecha(c)}`)}
return[d,hechos]},
proximos=e=>{let x=dia(e.ahora);for(;!(Wn(x)&&cierre(x)>e.ahora);)x.setDate(x.getDate()+1);let q=corteQ(e.ahora);return{jornada:cierre(x),quincena:q>e.ahora?q:corteQ(new Date(iniQ(e.ahora).getTime()+16*864e5))}};
return{job,proximos,fecha,txt,delta,kpis,jornadas,corteQ,iniQ,hasta:Cn.hasta}})();
export{__ptInformes};
