// Parches sobre los chunks compilados del artifact. Parte siempre de original/ (los chunks sin tocar), así
// que se puede repetir sin acumular cambios. El código nuevo largo vive en scripts/*.js (JS plano, con los
// nombres minificados del chunk); los reemplazos cortos van aquí.
//
//  · Vista en vivo y Búsqueda 360: el efecto que dibujaba el canvas 2D pasa a las escenas three.js.
//  · Vista en vivo: HUD de indicadores (con tickets por estado y NPS) y ficha del ticket.
//  · Encuesta de cierre (comun + Torre): pregunta NPS 0–10 y desglose por tipo, área, gestor y resultado.
import { readFileSync, writeFileSync } from 'node:fs'

const leer = (f) => readFileSync(`scripts/${f}`, 'utf8').trim()
const falla = (archivo, que) => { throw new Error(`${archivo}: no encuentro ${que} (¿cambió el artifact?)`) }

function parchear(archivo, { efecto, importa = '', prefijo = '', reemplazos = [] }) {
  let t = readFileSync(`original/${archivo}`, 'utf8')
  if (efecto) {
    const i = t.indexOf(efecto.inicio), j = t.indexOf(efecto.fin, i)
    if (i < 0 || j < 0) falla(archivo, 'el efecto del canvas')
    t = t.slice(0, i) + leer(efecto.nuevo) + t.slice(j + efecto.fin.length)
  }
  for (const [a, b, todos] of reemplazos) {
    if (!t.includes(a)) falla(archivo, `«${a.slice(0, 70)}…»`)
    t = todos ? t.split(a).join(b) : t.replace(a, b)
  }
  writeFileSync(`artefacto/assets/${archivo}`, importa + prefijo + t)
  console.log(`${archivo}: parchado (${reemplazos.length + (efecto ? 1 : 0)} cambios)`)
}

// ---------------------------------------------------------------------------- Vista en vivo
const NPS_VIVO = '(()=>{let q=Z.filter(w=>w.respuesta&&w.respuesta.nps!==void 0).map(w=>w.respuesta.nps),r=q.length>0,v=r?q:Z.map(w=>w.respuesta.csat),pr=r?v.filter(w=>w>=9).length:v.filter(w=>w===5).length,de=r?v.filter(w=>w<=6).length:v.filter(w=>w<=3).length,n=v.length;return{real:r,n:n,prom:pr,det:de,pas:n-pr-de,valor:n?Math.round((pr-de)/n*100):null}})()'
const ESTADOS_VIVO = '[`OPEN`,`IN_PROGRESS`,`PENDING_CUSTOMER`,`ESCALATED`,`REOPENED`,`RESOLVED`,`CLOSED`].map(q=>({id:q,n:y[q],v:o.tickets.filter(w=>w.estado===q).length}))'

parchear('VistaEnVivo-tj2-pLd4.js', {
  efecto: {
    inicio: '(0,O.useEffect)(()=>{let e=xe.current,t=be.current;if(!e||!t)return;let n=e.getContext(`2d`)',
    fin: '},[l,ve,o]);',
    nuevo: 'efecto-vivo.js',
  },
  importa: 'import{montarVivo as __mv,actualizarHud as __hud}from"./escenas-three.js";import{Kn as __cli}from"./comun-CVU2GQ4h.js";',
  prefijo: leer('componentes-vivo.js') + '\n',
  reemplazos: [
    // indicadores en vivo: el StatGroup del artifact pasa a un HUD con iconos, anillo de SLA, estrellas, XP, NPS y estados
    ['(0,k.jsx)(oe,{items:[{id:`act`,label:`Tickets activos`,value:String(X.length)},{id:`sla`,label:`Resueltos en SLA`,value:Te},{id:`csat`,label:`CSAT del día`,value:we},{id:`niv`,label:`Nivel del equipo`,value:`${Y.nivel} · ${Y.xp}/${Y.meta} XP · racha ${Y.racha}`}]})',
     '(0,k.jsx)(__Hud,{act:X.length,riesgo:X.filter(q=>{let w=S(q,o.ahora).nivel;return w===`vencido`||w===`en-riesgo`}).length,sla:Y.resueltos?Math.round(Y.enSla/Y.resueltos*100):null,enSla:Y.enSla,res:Y.resueltos,csat:Z.length?Z.reduce((q,w)=>q+(w.respuesta?.csat??0),0)/Z.length:null,nCsat:Z.length,nivel:Y.nivel,xp:Y.xp,meta:Y.meta,racha:Y.racha,estados:' + ESTADOS_VIVO + ',nps:' + NPS_VIVO + '})'],
    // ficha flotante del ticket seleccionado, dentro de la escena
    ['(0,k.jsx)(`div`,{ref:be,className:`pt-escena`,children:(0,k.jsx)(`canvas`,{ref:xe,', '(0,k.jsxs)(`div`,{ref:be,className:`pt-escena`,children:[(0,k.jsx)(`canvas`,{ref:xe,'],
    [',onClick:Oe})})', ',onClick:Oe}),$?(0,k.jsx)(__Ficha,{t:$,datos:o,puedeRayo:h(c),onCerrar:()=>pe(null),onRayo:Ae,onAbrir:()=>ne(u(`ticket/${$.id}`)),onC360:()=>ne(u(`clientes/${$.clienteId}`))}):null]})'],
    // los tickets son más grandes: el clic los alcanza desde un poco más lejos
    ['i=null,a=20;', 'i=null,a=30;'],
  ],
})

// ---------------------------------------------------------------------------- Búsqueda 360
parchear('Grafo360-BzaG42VX.js', {
  efecto: {
    inicio: '(0,W.useEffect)(()=>{let e=l.current,t=c.current;if(!e||!t)return;let n=e.getContext(`2d`)',
    fin: '},[o,E,z,f,m]);',
    nuevo: 'efecto-grafo.js',
  },
  importa: 'import{montarGrafo as __mg}from"./escenas-three.js";',
})

// ---------------------------------------------------------------------------- Encuesta con NPS (P2): modelo
const TIENE_NPS = 'q.respuesta&&q.respuesta.nps!==void 0'
parchear('comun-CVU2GQ4h.js', {
  reemplazos: [
    // rr: la respuesta admite un cuarto dato, nps (0–10)
    ['function rr(e,t,n,r){', 'function rr(e,t,n,r,s){'],
    ['throw M([{campo:`csat`,mensaje:`CSAT de 1 a 5 y CES de 1 a 7.`}]);return L(',
     'throw M([{campo:`csat`,mensaje:`CSAT de 1 a 5 y CES de 1 a 7.`}]);if(s!==void 0&&!(Number.isInteger(s)&&s>=0&&s<=10))throw M([{campo:`nps`,mensaje:`NPS (¿recomendarías?) de 0 a 10.`}]);return L('],
    ['respuesta:{csat:n,ces:r,fecha:e.ahora}}:i)},`encuesta_respondida`,{csat:n,ces:r})}',
     'respuesta:{csat:n,ces:r,...s===void 0?{}:{nps:s},fecha:e.ahora}}:i)},`encuesta_respondida`,{csat:n,ces:r,...s===void 0?{}:{nps:s}})}'],
    // las tres respuestas de la semilla traen NPS coherente con su CSAT (promotor, pasivo, detractor)
    ['t=rr(t,e.id,[5,4,2][n],[6,5,3][n])', 't=rr(t,e.id,[5,4,2][n],[6,5,3][n],[10,8,3][n])'],
    ['responderEncuesta(e,t,n){X({...Y,datos:rr(Y.datos,e,t,n)})}', 'responderEncuesta(e,t,n,s){X({...Y,datos:rr(Y.datos,e,t,n,s)})}'],
    // ir: agrupa también por resultado del cierre y devuelve el NPS de cada grupo
    ['let a=t===`tipo`?i.tipo:t===`area`?i.area:i.responsable??`Sin asignar`;', 'let a=t===`tipo`?i.tipo:t===`area`?i.area:t===`resultado`?__res(e,i):i.responsable??`Sin asignar`;'],
    ['ces:t.reduce((e,t)=>e+t.ces,0)/t.length}))}function ar(e){',
     'ces:t.reduce((e,t)=>e+t.ces,0)/t.length,nps:__nps(t),npsN:t.filter(q=>q.nps!==void 0).length}))}' +
     'function __nps(rs){let c=rs.filter(q=>q.nps!==void 0);return c.length?Math.round((c.filter(q=>q.nps>=9).length-c.filter(q=>q.nps<=6).length)/c.length*100):null}' +
     'function __res(e,t){if(t.reaperturas>0)return`reabierto`;let n=wi(t,e.ahora).nivel;return n===`cumplido`?`en-plazo`:n===`fuera-de-plazo`?`fuera-de-plazo`:`abierto`}' +
     'function __lbl(e){return e.encuestas.some(q=>' + TIENE_NPS + ')?`NPS`:`NPS preliminar`}' +
     // ar: el NPS del tablero es el real si hay respuestas con NPS; si no, el preliminar derivado del CSAT
     'function ar(e){let __r=e.encuestas.flatMap(q=>q.respuesta&&q.respuesta.nps!==void 0?[q.respuesta]:[]);if(__r.length)return __nps(__r);'],
    // informes diario y quincenal: la etiqueta dice NPS o NPS preliminar según el dato que se usó
    ['[`NPS preliminar`,o===null', '[__lbl(e),o===null', true],
  ],
})

// ---------------------------------------------------------------------------- Encuesta con NPS (P2): Torre de Control
parchear('Torre-Cw_qLOQG.js', {
  reemplazos: [
    // tarjeta del tablero
    ['{id:`nps`,label:`NPS preliminar`,value:l===null?`—`:String(l)}', '{id:`nps`,label:e.encuestas.some(q=>' + TIENE_NPS + ')?`NPS`:`NPS preliminar`,value:l===null?`—`:`${l>0?`+`:``}${l}`}'],
    ['children:`NPS preliminar derivado del CSAT (5 promotor, 4 pasivo, 1 a 3 detractor) hasta contar con el KPI Engine (DEP-10).`',
     'children:e.encuestas.some(q=>' + TIENE_NPS + ')?`NPS = % de respuestas 9–10 menos % de respuestas 0–6 a «¿Recomendarías…?». Propuesta del PO (P2), sin HU aprobada: su relación con el NPS-C (DEP-10) está por definir.`:`NPS preliminar derivado del CSAT (5 promotor, 4 pasivo, 1 a 3 detractor) hasta contar con el KPI Engine (DEP-10).`'],
    // tablas de calidad: columna NPS y un grupo nuevo por resultado del cierre
    ['{key:`ces`,header:`CES (1-7)`,align:`end`,render:e=>e.ces.toFixed(1)}]', '{key:`ces`,header:`CES (1-7)`,align:`end`,render:e=>e.ces.toFixed(1)},{key:`nps`,header:`NPS (0-10)`,align:`end`,render:e=>e.nps===null||e.nps===void 0?`—`:`${e.nps>0?`+`:``}${e.nps} (n=${e.npsN})`}]'],
    ['(0,Z.jsx)($,{titulo:`Por gestor de tickets`,filas:u(t,`gestor`),nombre:e=>p(e)})})}),',
     '(0,Z.jsx)($,{titulo:`Por gestor de tickets`,filas:u(t,`gestor`),nombre:e=>p(e)})})}),(0,Z.jsx)(R,{children:(0,Z.jsx)(z,{padding:`sm`,children:(0,Z.jsx)($,{titulo:`Por resultado del cierre`,filas:u(t,`resultado`),nombre:e=>({"en-plazo":`Cerrado en plazo`,"fuera-de-plazo":`Cerrado fuera de plazo`,reabierto:`Reabierto`,abierto:`En curso`})[e]??e})})}),'],
    // la encuesta enviada muestra el NPS y la simulación responde con una combinación variada
    ['`CSAT ${t.respuesta.csat} · CES ${t.respuesta.ces}`', '`CSAT ${t.respuesta.csat} · CES ${t.respuesta.ces}${t.respuesta.nps===void 0?``:` · NPS ${t.respuesta.nps}`}`'],
    ['{key:`resp`,header:`Respuesta`,width:`11rem`', '{key:`resp`,header:`Respuesta`,width:`15rem`'],
    ['onClick:()=>f.responderEncuesta(e.id,4,6)', 'onClick:()=>{let q=[[5,6,10],[4,5,9],[4,6,8],[3,4,6],[5,7,10],[2,3,3],[4,5,7]][([...e.id].reduce((a,b)=>a+b.charCodeAt(0),0)+e.ciclo)%7];f.responderEncuesta(e.id,q[0],q[1],q[2])}'],
    ['aquí «Simular respuesta» pone CSAT 4 y CES 6. El diseño de las preguntas queda fuera de alcance.', 'aquí «Simular respuesta» elige una combinación de CSAT, CES y NPS («¿Recomendarías…?», 0 a 10; propuesta del PO). El diseño de las preguntas queda fuera de alcance.'],
  ],
})
