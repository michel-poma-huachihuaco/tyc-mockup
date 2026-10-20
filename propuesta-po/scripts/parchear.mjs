// Parches sobre los chunks compilados del artifact. Parte siempre de original/ (los chunks sin tocar), así
// que se puede repetir sin acumular cambios. El código nuevo largo vive en scripts/*.js (JS plano, con los
// nombres minificados del chunk); los reemplazos cortos van aquí.
//
//  · Vista en vivo y Búsqueda 360: el efecto que dibujaba el canvas 2D pasa a las escenas three.js.
//  · Vista en vivo: HUD de indicadores (con tickets por estado y NPS) y ficha del ticket.
//  · Encuesta de cierre (comun + Torre): pregunta NPS 0–10 y desglose por tipo, área, gestor y resultado.
//  · Limpieza: fuera el lenguaje de Scrum de la interfaz; las notas explicativas van al panel «Notas».
//  · Shell: herramientas flotantes, usuario en la barra, inicio (360 + vista en vivo) y asistente de IA.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const leer = (f) => readFileSync(`scripts/${f}`, 'utf8').trim()
const falla = (archivo, que) => { throw new Error(`${archivo}: no encuentro ${que} (¿cambió el artifact?)`) }

/** Quita de todos los textos los códigos de trazabilidad (RN-SVC-021, DEP-11, FT-ATC-04…). */
const LIMPIEZAS = [
  [/\s*\((?:RN|RF|RNF)-[A-Z]+-\d+(?:\s*(?:y|e|,)\s*\d+)*\)/g, ''],
  [/\s*\(DEP-\d+[^)]*\)/g, ''],
  [/\s*\(preguntas? abiertas? de FT-ATC-\d+[^)]*\)/g, ''],
]
const limpiar = (t) => LIMPIEZAS.reduce((a, [re, b]) => a.replace(re, b), t)

function parchear(archivo, { efecto, importa = '', prefijo = '', reemplazos = [], cortes = [] } = {}) {
  let t = readFileSync(`original/${archivo}`, 'utf8')
  if (efecto) {
    const i = t.indexOf(efecto.inicio), j = t.indexOf(efecto.fin, i)
    if (i < 0 || j < 0) falla(archivo, 'el efecto del canvas')
    t = t.slice(0, i) + leer(efecto.nuevo) + t.slice(j + efecto.fin.length)
  }
  // cortes: [desde, hasta, reemplazo] — sustituyen el tramo [desde, hasta) (hasta no se incluye salvo `incluye`)
  for (const [desde, hasta, nuevo = '', incluye] of cortes) {
    const i = t.indexOf(desde), j = i < 0 ? -1 : t.indexOf(hasta, i + desde.length)
    if (i < 0 || j < 0) falla(archivo, `el tramo «${desde.slice(0, 60)}…»`)
    t = t.slice(0, i) + nuevo + t.slice(incluye ? j + hasta.length : j)
  }
  for (const [a, b, todos] of reemplazos) {
    if (!t.includes(a)) falla(archivo, `«${a.slice(0, 70)}…»`)
    t = todos ? t.split(a).join(b) : t.replace(a, b)
  }
  writeFileSync(`artefacto/assets/${archivo}`, importa + prefijo + limpiar(t))
}

// Frases de todas las pantallas que hablaban de «prototipo», «sesión» o «persona ficticia»
const TEXTOS_COMUNES = [
  ['Puede que el enlace sea de otra sesión del prototipo (los datos se reinician al recargar).', 'Puede que el enlace ya no sea válido.', true],
  ['El enlace puede ser de otra sesión del prototipo.', 'Puede que el enlace ya no sea válido.', true],
  ['El enlace puede ser de otro sesión del prototipo.', 'Puede que el enlace ya no sea válido.', true],
]
const aplicaComunes = (archivo, t) => TEXTOS_COMUNES.filter(([a]) => t.includes(a))

const NPS_VIVO = '(()=>{let q=Z.filter(w=>w.respuesta&&w.respuesta.nps!==void 0).map(w=>w.respuesta.nps),r=q.length>0,v=r?q:Z.map(w=>w.respuesta.csat),pr=r?v.filter(w=>w>=9).length:v.filter(w=>w===5).length,de=r?v.filter(w=>w<=6).length:v.filter(w=>w<=3).length,n=v.length;return{real:r,n:n,prom:pr,det:de,pas:n-pr-de,valor:n?Math.round((pr-de)/n*100):null}})()'
const ESTADOS_VIVO = '[`OPEN`,`IN_PROGRESS`,`PENDING_CUSTOMER`,`ESCALATED`,`REOPENED`,`RESOLVED`,`CLOSED`].map(q=>({id:q,n:y[q],v:o.tickets.filter(w=>w.estado===q).length}))'
const TIENE_NPS = 'q.respuesta&&q.respuesta.nps!==void 0'
const NOTA = 'globalThis.__ptNota&&globalThis.__ptNota(e),null'

const especificos = {
  // ------------------------------------------------------------------------- Vista en vivo
  'VistaEnVivo-tj2-pLd4.js': {
    efecto: {
      inicio: '(0,O.useEffect)(()=>{let e=xe.current,t=be.current;if(!e||!t)return;let n=e.getContext(`2d`)',
      fin: '},[l,ve,o]);',
      nuevo: 'efecto-vivo.js',
    },
    importa: 'import{montarVivo as __mv,actualizarHud as __hud}from"./escenas-three.js";import{Kn as __cli}from"./comun-CVU2GQ4h.js";',
    prefijo: leer('componentes-vivo.js') + '\n',
    reemplazos: [
      ['(0,k.jsx)(oe,{items:[{id:`act`,label:`Tickets activos`,value:String(X.length)},{id:`sla`,label:`Resueltos en SLA`,value:Te},{id:`csat`,label:`CSAT del día`,value:we},{id:`niv`,label:`Nivel del equipo`,value:`${Y.nivel} · ${Y.xp}/${Y.meta} XP · racha ${Y.racha}`}]})',
       '(0,k.jsx)(__Hud,{act:X.length,riesgo:X.filter(q=>{let w=S(q,o.ahora).nivel;return w===`vencido`||w===`en-riesgo`}).length,sla:Y.resueltos?Math.round(Y.enSla/Y.resueltos*100):null,enSla:Y.enSla,res:Y.resueltos,csat:Z.length?Z.reduce((q,w)=>q+(w.respuesta?.csat??0),0)/Z.length:null,nCsat:Z.length,nivel:Y.nivel,xp:Y.xp,meta:Y.meta,racha:Y.racha,estados:' + ESTADOS_VIVO + ',nps:' + NPS_VIVO + '})'],
      ['(0,k.jsx)(`div`,{ref:be,className:`pt-escena`,children:(0,k.jsx)(`canvas`,{ref:xe,', '(0,k.jsxs)(`div`,{ref:be,className:`pt-escena`,children:[(0,k.jsx)(`canvas`,{ref:xe,'],
      [',onClick:Oe})})', ',onClick:Oe}),$?(0,k.jsx)(__Ficha,{t:$,datos:o,puedeRayo:h(c),onCerrar:()=>pe(null),onRayo:Ae,onAbrir:()=>ne(u(`ticket/${$.id}`)),onC360:()=>ne(u(`clientes/${$.clienteId}`))}):null]})'],
      ['i=null,a=20;', 'i=null,a=30;'],
      // fuera la etiqueta de la propuesta y el aviso «What-if»; los textos pasan al panel de notas
      ['meta:(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:`Propuesta del PO · FT-ATC-18, 21 y 04`}),', ''],
      ['(0,k.jsx)(s,{tone:`info`,size:`sm`,title:`What-if: propuesta del PO, sin HU aprobada`,children:(0,k.jsx)(`span`,{className:`pt-alerta__texto`,children:', '(0,k.jsx)(ue,{children:(0,k.jsx)(`span`,{children:'],
      ['function ue({children:e}){return(0,k.jsxs)(`span`,{className:`pt-supuesto`,children:[(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:`Propuesta del PO`}),(0,k.jsx)(`span`,{className:`pt-supuesto__texto`,children:e})]})}', 'function ue({children:e}){return ' + NOTA + '}'],
      ['function I(e,t){return t.eje===3||t.area===`LEGAL`?`legal`:t.tipo===`GAR`||t.area===`POSTVENTA`?`post`:t.tipo===`ING`||t.tipo===`RSV`||t.area===`ADMINISTRACION`?`proy`:(t.tipo===`QUE`||t.tipo===`REC`)&&c(e,t.id)?`libro`:t.area===`COBRANZA`?`cob`:`eje1`}',
       'function I(e,t){return t.eje===3?`legal`:((t.tipo===`QUE`||t.tipo===`REC`)&&c(e,t.id))||t.responsable===`p-pvilchez`?`libro`:t.area===`LEGAL`?`legal`:t.tipo===`GAR`||t.area===`POSTVENTA`?`post`:t.tipo===`ING`||t.tipo===`RSV`||t.area===`ADMINISTRACION`?`proy`:t.area===`COBRANZA`?`cob`:`eje1`}'],
      ['let De=(0,O.useCallback)(async()=>{if(!q.current){q.current=!0;try{let e=U.current,t=J.current++;if(t%4==0){let e=[[`CTA`,`Teléfono`],[`CTA`,`WhatsApp`],[`QUE`,`Correo`],[`GAR`,`WhatsApp`],[`CTA`,`Correo`],[`QUE`,`Teléfono`]],[n,r]=e[t/4%e.length];f.ticketEntrante(n,r,g[t*7%30].id)}else if(t%4==1){let t=e.tickets.find(e=>e.estado===`OPEN`&&e.responsable);t&&await a.cambiarEstado(t.id,`IN_PROGRESS`,null)}else if(t%4==2){let t=e.tickets.find(e=>e.estado===`IN_PROGRESS`&&(K.current.get(e.id)??0)>=2);t&&await a.cambiarEstado(t.id,`RESOLVED`,`Resuelto desde la vista en vivo`)}else t%8==3&&f.avanzar(1);for(let t of e.tickets)t.estado===`IN_PROGRESS`&&K.current.set(t.id,(K.current.get(t.id)??0)+1)}catch{}finally{q.current=!1}}},[]);',
       'let De=(0,O.useCallback)(()=>{if(!q.current){q.current=!0;try{f.pasoVivo(K.current,J.current++)}catch(__err){console.error(__err)}finally{q.current=!1}}},[]);'],
      ['ke=()=>{let e=[[`CTA`,`Teléfono`],[`QUE`,`WhatsApp`],[`GAR`,`Correo`],[`CTA`,`WhatsApp`]],[t,n]=e[J.current++%e.length];f.ticketEntrante(t,n,g[J.current*5%30].id),_e(`Entró un ticket: la bandeja lo asigna por carga.`)}',
       'ke=()=>{let e=[[`CTA`,`Teléfono`,`Consulta de estado de cuenta`],[`QUE`,`WhatsApp`,`Queja de atención registrada`],[`GAR`,`Correo`,`Reporte de garantía postventa`],[`RSV`,`WhatsApp`,`Reserva de bus Entrega Fest`],[`ING`,`Teléfono`,`Registro de ingreso a proyecto`],[`REC`,`Correo`,`Reclamo para revisión legal`]],[t,n,res]=e[J.current++%e.length],tk=f.enBandeja(t,n,g[J.current*5%30].id,res);K.current.set(`ban:`+tk.id,0);_e(`Entró ${tk.numero}: va a la bandeja orquestadora y luego avanza por las áreas.`)}'],
    ],
  },

  // ------------------------------------------------------------------------- Búsqueda 360
  'Grafo360-BzaG42VX.js': {
    efecto: {
      inicio: '(0,W.useEffect)(()=>{let e=l.current,t=c.current;if(!e||!t)return;let n=e.getContext(`2d`)',
      fin: '},[o,E,z,f,m]);',
      nuevo: 'efecto-grafo.js',
    },
    importa: 'import{montarGrafo as __mg}from"./escenas-three.js";',
    reemplazos: [
      // el grafo puede elegir al cliente sin salir de la pantalla (lo usa el inicio)
      ['function ge({clienteId:e}){', 'function ge({clienteId:e,onElegir:__oe}){'],
      ['onClick:()=>M(_(`clientes/${t}`))', 'onClick:()=>__oe?__oe(t):M(_(`clientes/${t}`))'],
      ['M(_(`clientes/${i[0].cliente.id}`));return}', '__oe?__oe(i[0].cliente.id):M(_(`clientes/${i[0].cliente.id}`));return}'],
      [',(0,G.jsx)(S,{size:`sm`,variant:`outline`,children:`Meta p95 ≤ 2 s (propuesta del PO)`})', '', true],
      ['conforme (simulado)', 'conforme'],
    ],
    // «Ver como» y «Simular caída» ya están en las herramientas flotantes: no se repiten en la ficha del cliente
    cortes: [['(0,G.jsxs)(L,{children:[(0,G.jsx)(H,{as:`h2`,title:`Ver como`,', '(0,G.jsxs)(L,{children:[(0,G.jsx)(H,{as:`h2`,title:Y.n,', '']],
  },

  // ------------------------------------------------------------------------- Encuesta con NPS (modelo, notas y textos comunes)
  'comun-CVU2GQ4h.js': {
    prefijo: 'globalThis.__ptNotas=new Map;globalThis.__ptNota=e=>{let t=n=>n==null||n===!1?``:typeof n==`string`||typeof n==`number`?String(n):Array.isArray(n)?n.map(t).join(``):n.props?t(n.props.children):``,r=(location.hash||``).split(`?`)[0];r=r===``||r===`#`||r===`#/`?`#/vivo`:r;let k=t(e);if(!k)return;let m=globalThis.__ptNotas.get(r);m||globalThis.__ptNotas.set(r,m=new Map);m.has(k)||m.set(k,e)};\n',
    reemplazos: [
      // el componente «Supuesto» ya no pinta nada: registra su texto para el panel de notas
      ['function il({children:e}){return(0,c.jsxs)(`span`,{className:`pt-supuesto`,children:[(0,c.jsx)(Me,{size:`sm`,variant:`outline`,children:`Supuesto`}),(0,c.jsx)(`span`,{className:`pt-supuesto__texto`,children:e})]})}', 'function il({children:e}){return ' + NOTA + '}'],
      ['function rr(e,t,n,r){', 'function rr(e,t,n,r,s){'],
      ['throw M([{campo:`csat`,mensaje:`CSAT de 1 a 5 y CES de 1 a 7.`}]);return L(',
       'throw M([{campo:`csat`,mensaje:`CSAT de 1 a 5 y CES de 1 a 7.`}]);if(s!==void 0&&!(Number.isInteger(s)&&s>=0&&s<=10))throw M([{campo:`nps`,mensaje:`NPS (¿recomendarías?) de 0 a 10.`}]);return L('],
      ['respuesta:{csat:n,ces:r,fecha:e.ahora}}:i)},`encuesta_respondida`,{csat:n,ces:r})}',
       'respuesta:{csat:n,ces:r,...s===void 0?{}:{nps:s},fecha:e.ahora}}:i)},`encuesta_respondida`,{csat:n,ces:r,...s===void 0?{}:{nps:s}})}'],
      ['t=rr(t,e.id,[5,4,2][n],[6,5,3][n])', 't=rr(t,e.id,[5,4,2][n],[6,5,3][n],[10,8,3][n])'],
      ['responderEncuesta(e,t,n){X({...Y,datos:rr(Y.datos,e,t,n)})}', 'responderEncuesta(e,t,n,s){X({...Y,datos:rr(Y.datos,e,t,n,s)})},' + leer('sim-vivo.js')],
      ['let a=t===`tipo`?i.tipo:t===`area`?i.area:i.responsable??`Sin asignar`;', 'let a=t===`tipo`?i.tipo:t===`area`?i.area:t===`resultado`?__res(e,i):i.responsable??`Sin asignar`;'],
      ['ces:t.reduce((e,t)=>e+t.ces,0)/t.length}))}function ar(e){',
       'ces:t.reduce((e,t)=>e+t.ces,0)/t.length,nps:__nps(t),npsN:t.filter(q=>q.nps!==void 0).length}))}' +
       'function __nps(rs){let c=rs.filter(q=>q.nps!==void 0);return c.length?Math.round((c.filter(q=>q.nps>=9).length-c.filter(q=>q.nps<=6).length)/c.length*100):null}' +
       'function __res(e,t){if(t.reaperturas>0)return`reabierto`;let n=wi(t,e.ahora).nivel;return n===`cumplido`?`en-plazo`:n===`fuera-de-plazo`?`fuera-de-plazo`:`abierto`}' +
       'function __lbl(e){return e.encuestas.some(q=>' + TIENE_NPS + ')?`NPS`:`NPS preliminar`}' +
       'function ar(e){let __r=e.encuestas.flatMap(q=>q.respuesta&&q.respuesta.nps!==void 0?[q.respuesta]:[]);if(__r.length)return __nps(__r);'],
      ['[`NPS preliminar`,o===null', '[__lbl(e),o===null', true],
      // textos que hablaban de la propuesta o del prototipo
      ['${lr.at(-1)} % (serie ficticia)', '${lr.at(-1)} %'],
      ['(Gabriela Núñez, persona ficticia)', '(Gabriela Núñez)'],
      ['Solicitud simulada: en la consola real le llegaría a la supervisora ATC.', 'Solicitud enviada a la supervisora ATC.'],
      ['Error inesperado del prototipo.', 'Error inesperado.'],
    ],
  },

  'Torre-Cw_qLOQG.js': {
    reemplazos: [
      ['{id:`nps`,label:`NPS preliminar`,value:l===null?`—`:String(l)}', '{id:`nps`,label:e.encuestas.some(q=>' + TIENE_NPS + ')?`NPS`:`NPS preliminar`,value:l===null?`—`:`${l>0?`+`:``}${l}`}'],
      ['children:`NPS preliminar derivado del CSAT (5 promotor, 4 pasivo, 1 a 3 detractor) hasta contar con el KPI Engine (DEP-10).`',
       'children:e.encuestas.some(q=>' + TIENE_NPS + ')?`NPS = % de respuestas 9–10 menos % de respuestas 0–6 a «¿Recomendarías…?». Propuesta del PO (P2), sin HU aprobada: su relación con el NPS-C (DEP-10) está por definir.`:`NPS preliminar derivado del CSAT (5 promotor, 4 pasivo, 1 a 3 detractor) hasta contar con el KPI Engine (DEP-10).`'],
      ['{key:`ces`,header:`CES (1-7)`,align:`end`,render:e=>e.ces.toFixed(1)}]', '{key:`ces`,header:`CES (1-7)`,align:`end`,render:e=>e.ces.toFixed(1)},{key:`nps`,header:`NPS (0-10)`,align:`end`,render:e=>e.nps===null||e.nps===void 0?`—`:`${e.nps>0?`+`:``}${e.nps} (n=${e.npsN})`}]'],
      ['(0,Z.jsx)($,{titulo:`Por gestor de tickets`,filas:u(t,`gestor`),nombre:e=>p(e)})})}),',
       '(0,Z.jsx)($,{titulo:`Por gestor de tickets`,filas:u(t,`gestor`),nombre:e=>p(e)})})}),(0,Z.jsx)(R,{children:(0,Z.jsx)(z,{padding:`sm`,children:(0,Z.jsx)($,{titulo:`Por resultado del cierre`,filas:u(t,`resultado`),nombre:e=>({"en-plazo":`Cerrado en plazo`,"fuera-de-plazo":`Cerrado fuera de plazo`,reabierto:`Reabierto`,abierto:`En curso`})[e]??e})})}),'],
      ['`CSAT ${t.respuesta.csat} · CES ${t.respuesta.ces}`', '`CSAT ${t.respuesta.csat} · CES ${t.respuesta.ces}${t.respuesta.nps===void 0?``:` · NPS ${t.respuesta.nps}`}`'],
      ['{key:`resp`,header:`Respuesta`,width:`11rem`', '{key:`resp`,header:`Respuesta`,width:`15rem`'],
      ['onClick:()=>f.responderEncuesta(e.id,4,6)', 'onClick:()=>{let q=[[5,6,10],[4,5,9],[4,6,8],[3,4,6],[5,7,10],[2,3,3],[4,5,7]][([...e.id].reduce((a,b)=>a+b.charCodeAt(0),0)+e.ciclo)%7];f.responderEncuesta(e.id,q[0],q[1],q[2])}'],
      ['aquí «Simular respuesta» pone CSAT 4 y CES 6. El diseño de las preguntas queda fuera de alcance.', 'aquí «Simular respuesta» elige una combinación de CSAT, CES y NPS («¿Recomendarías…?», 0 a 10; propuesta del PO). El diseño de las preguntas queda fuera de alcance.'],
    ],
  },

  // ------------------------------------------------------------------------- Detalle del ticket: el asistente es ahora el robot flotante
  'DetalleTicket-CTveBafq.js': { reemplazos: [['g?(0,Q.jsx)(St,{ticket:p,datos:a}):null,', '']] },
  'Ingreso-hnvFCZyT.js': { reemplazos: [['Hora actual simulada: ', 'Hora actual: ']] },
  'Morosidad-CjqbEmCJ.js': { reemplazos: [[' Es una propuesta del PO, a validar con Legal.', '']] },

  // ------------------------------------------------------------------------- Shell
  'prototipo-B6qmgYQk.js': {
    importa: 'import{inyectarEstilos as __estilos,montarBot as __mb,redactar as __redactar,resumir as __resumir,siguientePaso as __paso,revisar as __revisar,conversar as __conversar,TONOS as __TONOS,SALUDO as __SALUDO}from"./escenas-three.js";import{nn as __sla,Or as __nombre,Ar as __tipo,hr as __estados,mr as __areas,m as __fecha,Kn as __cli,wn as __rayo,E as __api}from"./comun-CVU2GQ4h.js";',
    reemplazos: [
      ['function ca(){let e=de(),', leer('shell.js') + '\nfunction ca(){let e=de(),'],
      [',(0,L.jsx)(`span`,{className:`pt-marca__etiqueta`,children:`What-if · propuesta del PO`})', ''],
      ['case`vivo`:return(0,L.jsx)(Gi,{});', 'case`vivo`:return(0,L.jsx)(__Inicio,{Vivo:Gi});'],
      ['label:`Vista en vivo`,icon:(0,L.jsx)(R,{name:`eye`}),current:t.id===`vivo`,badge:(0,L.jsx)(te,{size:`sm`,variant:`outline`,children:`PO`})}', 'label:`Inicio`,icon:(0,L.jsx)(R,{name:`grid`}),current:t.id===`vivo`}'],
      ['(0,L.jsx)(ce,{})]})}function la({ruta:e}){', '(0,L.jsx)(ce,{}),i.rol!==`CONTROL_ACCESO`&&i.rol!==`CLIENTE`?(0,L.jsx)(__Bot,{ruta:t,datos:a,usuario:i.nombre}):null,(0,L.jsx)(__Herramientas,{rol:i.rol,roles:sa,ahora:a.ahora,onApariencia:()=>{d(!u),l(!1)},onSimulacion:()=>{l(!c),d(!1)}})]})}function la({ruta:e}){'],
      ['Mandos para revisar el prototipo. No son parte del producto ni de la consola real.', 'Mandos de prueba para recorrer el sistema como distintos usuarios y en distintos momentos.'],
      ['Cambia la persona ficticia y sus permisos.', 'Cambia de usuario y sus permisos.'],
      ['Prueba paletas y grises del sistema de diseño. Se recuerda en este navegador. No es parte del producto.', 'Prueba paletas y grises. Se recuerda en este navegador.'],
      ['Esta pantalla no existe en el prototipo', 'Esta pantalla no existe'],
    ],
    // la barra superior queda con la marca y el usuario; el aviso «What-if» desaparece
    cortes: [
      ['actions:(0,L.jsxs)(L.Fragment,{children:[(0,L.jsx)(`span`,{className:`pt-desde-md pt-ver-como`,', '(0,L.jsx)(bi,{})]})', 'actions:(0,L.jsx)(__Usuario,{nombre:i.nombre,etiqueta:sa.find(q=>q.rol===i.rol)?.etiqueta})', true],
      ['(0,L.jsxs)(jr,{tone:`info`,size:`sm`,children:[`What-if de la propuesta del PO', '(0,L.jsxs)(`div`,{className:`pt-cuerpo ay-split`', ''],
    ],
  },
}

const archivos = readdirSync('original').filter((f) => f.endsWith('.js'))
let n = 0
for (const archivo of archivos) {
  const cfg = { ...(especificos[archivo] ?? {}) }
  const base = readFileSync(`original/${archivo}`, 'utf8')
  const comunes = aplicaComunes(archivo, base)
  if (comunes.length) cfg.reemplazos = [...(cfg.reemplazos ?? []), ...comunes]
  parchear(archivo, cfg)
  n++
}
console.log(`${n} chunks procesados (parcheados y con la limpieza de textos aplicada)`)
