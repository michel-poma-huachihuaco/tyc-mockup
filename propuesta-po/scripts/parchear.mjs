// Parches sobre los chunks compilados del artifact. Parte siempre de original/ (los chunks sin tocar), así
// que se puede repetir sin acumular cambios. El código nuevo largo vive en scripts/*.js (JS plano, con los
// nombres minificados del chunk); los reemplazos cortos van aquí.
//
//  · Vista en vivo y Búsqueda 360: el efecto que dibujaba el canvas 2D pasa a las escenas three.js.
//  · Vista en vivo: HUD de indicadores (con tickets por estado y NPS) y ficha del ticket.
//  · Encuesta de cierre: CSAT y CES (HU-019). La pregunta «¿Recomendarías…?» (0–10) que se probó en una ronda anterior se quitó
//    el 20-oct porque la v1.3 no la incluye; el NPS de la Torre y de los informes es el «NPS preliminar» derivado del CSAT.
//  · Limpieza: fuera el lenguaje de Scrum de la interfaz; las notas explicativas van al panel «Notas».
//  · Shell: herramientas flotantes, usuario en la barra, módulos «Consulta 360» y «Operación en vivo» (grupo «Núcleo 360 y
//    Planta» del menú; la raíz abre la Consulta 360) y asistente de IA.
//  · v1.3 (16-oct): Mi Portal (HU-064/065/066; src/portal → mi-portal.js, ruta #/portal y núcleo prestado por «comun»),
//    lo pequeño que faltaba de la HU-067 en «Vista en vivo» y fuera de la vista lo que el plan deja para la Etapa 2
//    (UrbeMind e incidencias de ciudad, NEXUS, DAEDALUS): en la Etapa 1 no se muestra nada de eso.
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

function parchear(archivo, { efecto, importa = '', prefijo = '', sufijo = '', reemplazos = [], cortes = [] } = {}) {
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
  writeFileSync(`artefacto/assets/${archivo}`, importa + prefijo + limpiar(t) + (sufijo ? '\n' + sufijo + '\n' : ''))
}

// Frases de todas las pantallas que hablaban de «prototipo», «sesión» o «persona ficticia»
const TEXTOS_COMUNES = [
  ['Puede que el enlace sea de otra sesión del prototipo (los datos se reinician al recargar).', 'Puede que el enlace ya no sea válido.', true],
  ['El enlace puede ser de otra sesión del prototipo.', 'Puede que el enlace ya no sea válido.', true],
  ['El enlace puede ser de otro sesión del prototipo.', 'Puede que el enlace ya no sea válido.', true],
]
const aplicaComunes = (archivo, t) => TEXTOS_COMUNES.filter(([a]) => t.includes(a))

// 20-oct (visor de Daniel, aceptado por el usuario): «NPS del turno» con un reparto fijo de 72 % promotores y 18 % pasivos sobre
// las encuestas respondidas del día; sin encuestas no se muestra número
const NPS_VIVO = '(()=>{let n=Z.length,pr=Math.round(n*.72),pa=Math.round(n*.18),de=Math.max(0,n-pr-pa);return{real:!1,n:n,prom:pr,pas:pa,det:de,valor:n?Math.round((pr-de)/n*100):null}})()'
const ESTADOS_VIVO = '[`OPEN`,`IN_PROGRESS`,`PENDING_CUSTOMER`,`ESCALATED`,`REOPENED`,`RESOLVED`,`CLOSED`].map(q=>({id:q,n:y[q],v:o.tickets.filter(w=>w.estado===q).length}))'
const TIENE_NPS = 'q.respuesta&&q.respuesta.nps!==void 0'
const NOTA = 'globalThis.__ptNota&&globalThis.__ptNota(e),null'
// v1.3: NEXUS, DAEDALUS y UrbeMind pasan a la Etapa 2 (PLT-01 v1.3, «Fuera de este plan · Etapa 2») y no se muestran. Lo que
// queda es el comportamiento de la Etapa 1 («Cómo opera la Etapa 1 mientras tanto»): líderes y roles del maestro local de ATC.
const MAESTRO = 'el maestro local de ATC'
// Decisión del 20-oct (DECISIONES §5.9): el catálogo de áreas suma, a las del mockup, las áreas reales de la plataforma actual
// (Front Digital, producción al 14-oct-2026) que no estaban. Se usan al derivar, en los flujos y en los filtros; sin gestores
// asignados (un ticket derivado ahí queda en la cola del área). La Operación en vivo no gana salas (HU-067 CA-01).
const AREAS_PLATAFORMA = [['BACK_OFFICE', 'Back Office'], ['LEGAL_FORMALIZACION', 'Legal Formalización'], ['LEGAL_CORPORATIVO', 'Legal Corporativo'], ['ARCHIVOS', 'Archivos'], ['PROYECTOS', 'Proyectos'], ['MARKETING', 'Marketing'], ['SOPORTE_WEB', 'Soporte Web']]
const IDS_PLATAFORMA = AREAS_PLATAFORMA.map(([id]) => '`' + id + '`').join(',')
const NOMBRES_PLATAFORMA = AREAS_PLATAFORMA.map(([id, n]) => id + ':`' + n + '`').join(',')
// v1.3 · HU-043 (prioridad 1): flujo por tipo + subtipo + área, con responsable, actividades en orden y SLA por actividad.
// El modelo vive en scripts/hu043-modelo.js (sufijo de comun); estas son las piezas que se cambian dentro de los chunks.
// Semilla de flujos (clave tipo + subtipo + área):
//  · los 4 flujos del PO (Consulta de cuenta y Resolución de contrato en Cobranza, Queja en ATC, Garantía postventa en Postventa),
//    con sus actividades, responsables y SLA tal cual. El PO no les dio subtipo y el CA-03 lo exige: llevan el subtipo «General»
//    (supuesto, a definir con el PO). Responsable del flujo: la persona del área que ya aparece en sus actividades;
//  · el del CA-01/04/05 (Reclamo · Garantía postventa · Postventa; Inspección 8 h, Informe técnico 16 h y Respuesta al cliente 8 h).
// Los tickets de ejemplo de la simulación («ticket entrante») entran con el subtipo «General», así que siguen el flujo de su tipo.
const FLUJO_PO = (id, tipo, area, responsable, pasos, subtipo = 'General') => `{id:\`${id}\`,tipo:\`${tipo}\`,subtipo:\`${subtipo}\`,area:\`${area}\`,responsable:\`${responsable}\`,version:1,pasos:${pasos},slaTotalH:${[...pasos.matchAll(/slaH:(\d+)/g)].reduce((s, m) => s + Number(m[1]), 0)},publicado:Ss,autor:\`p-aperez\`}`
const FLUJOS_043 = 'ws=[' + [
  FLUJO_PO('flu-0-1', 'CTA', 'COBRANZA', 'p-rsalazar', '[{nombre:`Recepción`,responsable:`p-crojas`,slaH:2},{nombre:`Revisión de cobranza`,responsable:`p-rsalazar`,slaH:24},{nombre:`Respuesta al cliente`,responsable:`p-crojas`,slaH:4}]'),
  // decisión del 20-oct: el subtipo real «Estado de cuenta del lote» (Front Digital) con los mismos pasos del flujo del PO de Consulta de cuenta
  FLUJO_PO('flu-0-6', 'CTA', 'COBRANZA', 'p-rsalazar', '[{nombre:`Recepción`,responsable:`p-crojas`,slaH:2},{nombre:`Revisión de cobranza`,responsable:`p-rsalazar`,slaH:24},{nombre:`Respuesta al cliente`,responsable:`p-crojas`,slaH:4}]', 'Estado de cuenta del lote'),
  FLUJO_PO('flu-0-2', 'QUE', 'ATC', 'p-dlazo', '[{nombre:`Registro`,responsable:`p-dlazo`,slaH:2},{nombre:`Respuesta`,responsable:`p-dlazo`,slaH:24}]'),
  FLUJO_PO('flu-0-4', 'RES', 'COBRANZA', 'p-rsalazar', '[{nombre:`Verificación de la deuda`,responsable:`p-rsalazar`,slaH:24},{nombre:`Revisión legal de la causal`,responsable:`p-pvilchez`,slaH:48},{nombre:`Carta de resolución`,responsable:`p-pvilchez`,slaH:72}]'),
  FLUJO_PO('flu-0-3', 'GAR', 'POSTVENTA', 'p-lccahuana', '[{nombre:`Recepción`,responsable:`p-lccahuana`,slaH:4},{nombre:`Inspección técnica`,responsable:`p-omedina`,slaH:72}]'),
  '{id:`flu-0-5`,tipo:`REC`,subtipo:`Garantía postventa`,area:`POSTVENTA`,responsable:`p-lccahuana`,version:1,pasos:[{nombre:`Inspección`,responsable:`p-omedina`,slaH:8},{nombre:`Informe técnico`,responsable:`p-omedina`,slaH:16},{nombre:`Respuesta al cliente`,responsable:`p-lccahuana`,slaH:8}],slaTotalH:32,publicado:Ss,autor:`p-aperez`}',
].join(',') + ']'
const ZR_ORIGINAL = 'function Zr(e,t){let n=R(e,t),r=Mr(e,n.tipo),i=r?.pasos[0]?.responsable??null;if(!r||!i||!qr(e,i))return[{...e,tickets:e.tickets.map(e=>e.id===t?{...e,responsable:null,area:r?.area??e.area}:e)},`cola`];let[a,o]=I(e,`fa`),s=D(i)?.area??r.area;return[{...o,tickets:o.tickets.map(e=>e.id===t?{...e,responsable:i,area:s}:e),filasAsignacion:[...o.filasAsignacion,{id:a,ticketId:t,fecha:e.ahora,deArea:n.area,deResponsable:n.responsable,aArea:s,aResponsable:i,motivo:`ALTA`,nota:`Asignado por el flujo del área`,autor:`p-gnunez`}]},`asignado`]}'
const COLUMNAS_FLUJOS = 'let k=[{key:`tipo`,header:`Tipo de ticket`,width:`13rem`,renderCell:e=>r(e.tipo)},{key:`area`,header:`Área`,width:`10rem`,renderCell:e=>b[m(o,e.tipo)?.area??`ATC`]},{key:`version`,header:`Versión vigente`,width:`9rem`,renderCell:t=>{let n=m(o,t.tipo);return n?`v${n.version}`:(0,V.jsx)(e,{tone:`warning`,size:`sm`,children:`Sin flujo`})}},{key:`pasos`,header:`Pasos y responsables`,renderCell:e=>m(o,e.tipo)?.pasos.map(e=>`${e.nombre} (${d(e.responsable)})`).join(` → `)??`—`},{key:`accion`,header:`Acción`,width:`9rem`,renderCell:e=>(0,V.jsx)(n,{size:`sm`,variant:`secondary`,onClick:()=>E(e.tipo),children:`Editar`})}],'
const COLUMNAS_FLUJOS_043 = 'let k=[{key:`tipo`,header:`Tipo`,width:`11rem`,renderCell:e=>e.tipo==null?`Por defecto del área`:r(e.tipo)},{key:`subtipo`,header:`Subtipo`,width:`11rem`,renderCell:e=>e.subtipo??`—`},{key:`area`,header:`Área`,width:`8rem`,renderCell:e=>b[e.area]??e.area},{key:`responsable`,header:`Responsable`,width:`10rem`,renderCell:e=>d(e.responsable)},{key:`actividades`,header:`Actividades`,renderCell:e=>e.pasos.map(e=>`${e.nombre} (${__f.responsable(e.responsable)} · ${e.slaH} h)`).join(` → `)},{key:`sla`,header:`SLA`,width:`11rem`,renderCell:e=>{let t=__f.sla(o,e);return t.totalH<t.sumaH?`${t.totalH} h hábiles (prevalece la política del tipo; las actividades suman ${t.sumaH} h)`:`${t.sumaH} h hábiles`}},{key:`version`,header:`Versión`,width:`6rem`,renderCell:e=>`v${e.version}`},{key:`accion`,header:`Acción`,width:`9rem`,renderCell:e=>(0,V.jsx)(n,{size:`sm`,variant:`secondary`,onClick:()=>E({base:e}),children:`Nueva versión`})}],__bit=[{key:`fecha`,header:`Fecha`,width:`9rem`,renderCell:e=>y(e.publicado)},{key:`flujo`,header:`Flujo`,renderCell:e=>__f.nombre(e)},{key:`version`,header:`Versión`,width:`6rem`,renderCell:e=>`v${e.version}`},{key:`autor`,header:`Autor`,width:`10rem`,renderCell:e=>d(e.autor)}],'
const TABLA_FLUJOS = 'h===`flujos`?(0,V.jsx)(j,{children:(0,V.jsx)(M,{children:(0,V.jsxs)(`div`,{className:`pt-pila`,children:[(0,V.jsx)(P,{caption:`Flujos por tipo de ticket`,columns:k,rows:c.fase===`listo`?F:[],getRowId:e=>e.id,loading:c.fase===`cargando`}),(0,V.jsx)(v,{children:`Un editor gráfico de procesos (BPMN) queda fuera de alcance; el SLA de cada paso se suma a la precedencia de políticas de la ola 1.`})]})})}):'
const TABLA_FLUJOS_043 = 'h===`flujos`?(0,V.jsxs)(`div`,{className:`pt-pila`,children:[(0,V.jsxs)(j,{children:[(0,V.jsx)(R,{as:`h2`,title:`Flujos por tipo, subtipo y área`,actions:(0,V.jsx)(n,{variant:`primary`,size:`sm`,onClick:()=>E({nuevo:!0}),children:`Nuevo flujo`})}),(0,V.jsx)(M,{children:(0,V.jsxs)(`div`,{className:`pt-pila`,children:[(0,V.jsx)(P,{caption:`Flujos por tipo, subtipo y área`,columns:k,rows:c.fase===`listo`?__f.vigentes(o):[],getRowId:e=>e.id,loading:c.fase===`cargando`}),(0,V.jsx)(v,{children:`Un editor gráfico de procesos (BPMN) queda fuera de alcance. El SLA del flujo es la suma de sus actividades, salvo que la política SLA del tipo sea menor: entonces prevalece la política.`})]})})]}),(0,V.jsxs)(j,{children:[(0,V.jsx)(R,{as:`h2`,title:`Bitácora de publicaciones`,subtitle:`Cada versión publicada, con su autor y su fecha.`}),(0,V.jsx)(M,{children:(0,V.jsx)(P,{caption:`Bitácora de publicaciones`,columns:__bit,rows:c.fase===`listo`?__f.bitacora(o):[],getRowId:e=>e.id,loading:c.fase===`cargando`})})]})]}):'
const SUBTIPO_043 = '(0,R.jsx)(I,{value:y.tipo,placeholder:`Elige el tipo`,onChange:e=>{Z(`tipo`,e.target.value),Z(`subtipo`,``)},options:a.map(e=>({value:e.id,label:e.nombre}))})}),(0,R.jsx)(D,{label:`Subtipo`,optional:!0,helper:`Los subtipos salen de los flujos publicados para el tipo.`,children:(0,R.jsx)(I,{value:y.subtipo,onChange:e=>Z(`subtipo`,e.target.value),options:[{value:``,label:`Sin subtipo`},...__f.subtipos(e,y.tipo).map(e=>({value:e,label:e}))]})}),'
const RESOLUCION_043 = '[`Resolución`,__P&&__P.flujo?`${b(__P.vence)} (${v(__P.totalH)} hábiles, ${__P.prevalece?`prevalece la política`:`suma de las actividades del flujo`})`:`${b(X.venceResolucion)} (${v(X.politica.resolucionH)} hábiles)`],[`Flujo`,__P&&__P.flujo?`${__f.nombre(__P.flujo)} · versión ${__P.flujo.version}${__P.porDefecto?` (se avisa al administrador funcional)`:``}`:`Sin flujo publicado (se avisa al administrador funcional)`]]'

const especificos = {
  // ------------------------------------------------------------------------- Vista en vivo
  'VistaEnVivo-tj2-pLd4.js': {
    efecto: {
      inicio: '(0,O.useEffect)(()=>{let e=xe.current,t=be.current;if(!e||!t)return;let n=e.getContext(`2d`)',
      fin: '},[l,ve,o]);',
      nuevo: 'efecto-vivo.js',
    },
    // v1.3 · HU-067: equipo y nombre del líder (maestro local de ATC), carga y disponibilidad del gestor, razones sociales y el
    // selector del sistema de diseño (exportado por el shell)
    importa: 'import{montarVivo as __mv,actualizarHud as __hud}from"./escenas-three.js";import{Kn as __cli,mn as __equipo,yn as __lider,dn as __carga,pn as __disp,nr as __empresas,fn as __correos,__vivo}from"./comun-CVU2GQ4h.js";import{x as __Sel,u as __Drawer,n as __Seg,m as __Pares}from"./prototipo-B6qmgYQk.js";',
    prefijo: leer('componentes-vivo.js') + '\n',
    reemplazos: [
      ['(0,k.jsx)(oe,{items:[{id:`act`,label:`Tickets activos`,value:String(X.length)},{id:`sla`,label:`Resueltos en SLA`,value:Te},{id:`csat`,label:`CSAT del día`,value:we},{id:`niv`,label:`Nivel del equipo`,value:`${Y.nivel} · ${Y.xp}/${Y.meta} XP · racha ${Y.racha}`}]})',
       '(0,k.jsx)(__Hud,{act:X.length,riesgo:X.filter(q=>{let w=S(q,o.ahora).nivel;return w===`vencido`||w===`en-riesgo`}).length,sla:Y.resueltos?Math.round(Y.enSla/Y.resueltos*100):null,enSla:Y.enSla,res:Y.resueltos,csat:Z.length?Z.reduce((q,w)=>q+(w.respuesta?.csat??0),0)/Z.length:null,nCsat:Z.length,nivel:Y.nivel,xp:Y.xp,meta:Y.meta,racha:Y.racha,estados:' + ESTADOS_VIVO + ',nps:' + NPS_VIVO + '})'],
      ['(0,k.jsx)(`div`,{ref:be,className:`pt-escena`,children:(0,k.jsx)(`canvas`,{ref:xe,', '(0,k.jsxs)(`div`,{ref:be,className:`pt-escena`,children:[(0,k.jsx)(`canvas`,{ref:xe,'],
      // 20-oct: «Ver expediente» abre #/ticket/<id del ticket elegido>; Rayo/Quitar Rayo, Resolver y Reasignar a menor carga según el rol
      [',onClick:Oe})})', ',onClick:Oe}),$?(0,k.jsx)(__Ficha,{t:$,datos:o,ac:__ac,puedeRayo:h(c),puedeResolver:Q,puedeReasignar:c.rol===`SUPERVISOR`||c.rol===`COORDINADOR_CX`,onCerrar:()=>pe(null),onAbrir:()=>ne(u(`ticket/${$.id}`)),onC360:()=>ne(u(`clientes/${$.clienteId}`))}):null]})'],
      ['i=null,a=20;', 'i=null,a=30;'],
      // v1.3 · HU-067 CA-03/06: la bitácora suma las alertas de SLA vencido; CA-09: tabla por área antes de la tabla por ticket
      ['Me=[...o.filasEstado].sort((e,t)=>t.fecha.getTime()-e.fecha.getTime()).slice(0,6);', 'Me=__bitacora(o);'],
      ['children:[x(e.fecha),` · `,o.tickets.find(t=>t.id===e.ticketId)?.numero,` · `,y[e.a]]},e.id))', 'children:[x(e.fecha),` · `,e.alerta?(0,k.jsx)(`strong`,{children:e.txt}):e.txt]},e.id))'],
      ['(0,k.jsxs)(`div`,{className:`pt-dos-columnas`,children:[(0,k.jsxs)(T,{children:[(0,k.jsx)(D,{as:`h2`,title:`Los mismos tickets, en tabla`', '(0,k.jsx)(__Areas,{datos:o,zonas:__zonasPermitidas(c),onZona:q=>{pe(null);__sz(q)}}),(0,k.jsxs)(`div`,{className:`pt-dos-columnas`,children:[(0,k.jsxs)(T,{children:[(0,k.jsx)(D,{as:`h2`,title:`Los mismos tickets, en tabla`'],
      // v1.3: los tickets registrados en Mi Portal (canal «Mi Portal») entran por la compuerta de Mi Portal, no por la de correo
      ['F=e=>e.tipo===`ING`?`form`:e.tipo===`RSV`?`portal`:', 'F=e=>e.tipo===`ING`?`form`:e.tipo===`RSV`||e.canal===`Mi Portal`?`portal`:'],
      // fuera la etiqueta de la propuesta y el aviso «What-if»; los textos pasan al panel de notas
      // (v1.3 · HU-067 CA-08: en su lugar, la etiqueta «Modo simulación» cuando está activo)
      ['meta:(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:`Propuesta del PO · FT-ATC-18, 21 y 04`}),', 'meta:__s.vivoSimulacion!==!1?(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:`Modo simulación`}):void 0,'],
      ['(0,k.jsx)(s,{tone:`info`,size:`sm`,title:`What-if: propuesta del PO, sin HU aprobada`,children:(0,k.jsx)(`span`,{className:`pt-alerta__texto`,children:', '(0,k.jsx)(ue,{children:(0,k.jsx)(`span`,{children:'],
      ['function ue({children:e}){return(0,k.jsxs)(`span`,{className:`pt-supuesto`,children:[(0,k.jsx)(m,{size:`sm`,variant:`outline`,children:`Propuesta del PO`}),(0,k.jsx)(`span`,{className:`pt-supuesto__texto`,children:e})]})}', 'function ue({children:e}){return ' + NOTA + '}'],
      // v1.3 · HU-067 CA-07: `o` pasa a ser la vista filtrada (razón social y áreas permitidas); `__o0`, los datos completos.
      // CA-08: `__s` es el estado de simulación (Herramientas › Simulación). CA-04: `__z` es el área abierta en el panel.
      ['let{datos:o}=b(),c=t(),', 'let{datos:__o0,sim:__s}=b(),c=t(),[__emp,__se]=(0,O.useState)(``),__cj=__useCajon(),__sz=q=>{q&&__cj.abrir(`sala:${q}`)},o=(0,O.useMemo)(()=>__filtrar(__o0,c,__emp),[__o0,c,__emp]),'],
      // CA-08: el flujo de ejemplo, la pausa y la velocidad (x1, x2) solo existen en el modo simulación
      ['if(v||l||!Q)return;let e=setInterval(()=>void De(),1500/V);return()=>clearInterval(e)},[v,l,Q,V,De])', 'if(__s.vivoSimulacion===!1||v||l||!Q)return;let e=setInterval(()=>void De(),1500/V);return()=>clearInterval(e)},[__s.vivoSimulacion,v,l,Q,V,De])'],
      // CA-07 (filtro por razón social) y CA-08 (pausa y velocidad x1/x2 solo en el modo simulación)
      ['(0,k.jsx)(n,{variant:`secondary`,"aria-pressed":v,disabled:!Q||l,onClick:()=>de(!v),children:v||l?`Reanudar`:`Pausa`}),(0,k.jsx)(n,{variant:`secondary`,disabled:!Q||l,onClick:()=>fe(V===1?2:V===2?4:1),children:`Velocidad x${V}`}),',
       '(0,k.jsx)(__Sel,{size:`sm`,"aria-label":`Razón social`,value:__emp,onChange:q=>__se(q.target.value),options:[{value:``,label:`Todas las razones sociales`},...__empresas.map(q=>({value:q.id,label:q.nombre}))]}),'],
      // CA-04: tocar un ticket cierra el panel del área (tocar un área lo avisa la escena con onZona)
      ['pe(i)},ke=()=>', 'pe(i),i&&__sz(null)},ke=()=>'],
      ['bandeja orquestadora y seis áreas.', 'bandeja orquestadora y ${__nAreas(c)}.'],
      // nombre del PLT-04: «Operación en vivo»
      ['title:`Vista en vivo`,', 'title:`Operación en vivo`,'],
      ['cada área los atiende. Toca un ticket para seguirlo.`', 'cada área los atiende. Toca un ticket para seguirlo, o un canal, la bandeja o una sala para ver su detalle en «Bandejas operativas».`'],
      ['`Resuelto desde la vista en vivo`', '`Resuelto desde la operación en vivo`'],
      ['`Seguimiento desde la vista en vivo`', '`Seguimiento desde la operación en vivo`'],
      // 20-oct · mejoras del visor de la rama de Daniel (pedido del PO para la presentación; scripts/componentes-vivo.js):
      // cabecera con la sala de la bandeja y «Bandejas operativas (n)», que abre el cajón; controles de simulación (solo en el modo
      // simulación: pausa, 1×/2×/4×, ticket entrante, con rayo, escalar a Comité SGD y pico multicanal); cajón con bandeja, inspector
      // y correos CC; resumen y leyenda de la escena; __ac son las acciones (modelo real: E, O y __vivo de comun)
      ['(0,k.jsx)(n,{variant:`primary`,disabled:!Q,onClick:ke,children:`Ticket`}),h(c)?(0,k.jsx)(n,{variant:`secondary`,disabled:!H,onClick:Ae,children:`Rayo`}):null]})}),', '(0,k.jsx)(__Sel,{size:`sm`,"aria-label":`Sala de la bandeja`,value:__cj.fsala,onChange:q=>__cj.setFsala(q.target.value),options:[{value:``,label:`Todas las salas (${__nAreas(c)})`},...A.filter(q=>{let zp=__zonasPermitidas(c);return!zp||zp.has(q.k)}).map(q=>({value:q.k,label:q.n}))]}),(0,k.jsx)(n,{variant:__cj.abierto?`primary`:`secondary`,"aria-expanded":__cj.abierto,onClick:()=>__cj.setAbierto(!__cj.abierto),children:__cj.abierto?`Cerrar cajón de bandejas`:`Bandejas operativas (${__nBandeja(o,__cj.fsala)})`})]})}),(0,k.jsx)(__Controles,{sim:__s.vivoSimulacion!==!1,Q:Q,l:l,pausa:v,alternar:()=>de(!v),vel:V,setVel:fe,ac:__ac,puedeRayo:h(c)}),'],
      ['me?(0,k.jsx)(te,{error:me,titulo:`No se marcó el rayo`}):null,', 'me?(0,k.jsx)(te,{error:me,titulo:`No se completó la acción`}):null,(0,k.jsx)(__Cajon,{cj:__cj,datos:o,todo:__o0,sel:H,sim:__s.vivoSimulacion!==!1,Q:Q,puedeRayo:h(c),ac:__ac,onTicket:q=>{pe(q);__alTicketCajon(__cj)},onIr:q=>ne(u(q))}),'],
      ['(0,k.jsx)(T,{children:(0,k.jsxs)(E,{padding:`sm`,children:[', '(0,k.jsx)(T,{children:(0,k.jsxs)(E,{padding:`sm`,children:[(0,k.jsx)(__CabEscena,{datos:o}),'],
      ['className:`pt-texto-chico`,role:`status`,"aria-live":`polite`,children:ge})', 'className:`pt-texto-chico`,role:`status`,"aria-live":`polite`,children:ge}),(0,k.jsx)(__Leyenda,{})'],
      ['U.current=o,Se.current=H;', 'U.current=o,Se.current=H;let __ac=__accionesVivo({o:o,todo:__o0,pe:pe,_e:_e,he:he,J:J,emp:__emp});'],
      // los tickets de ejemplo de la simulación entran con un resumen según su tipo y canal (antes, todos «Consulta recibida por Mi Portal»)
      ['f.ticketEntrante(n,r,g[t*7%30].id)', '__vivo.entrante(n,r,g[t*7%30].id,__resEj(n,r))'],
      // sala «Postventa (Eje 4)», como en el visor de Daniel
      ['n:`Postventa`,x:8.4', 'n:`Postventa (Eje 4)`,x:8.4'],
    ],
  },

  // ------------------------------------------------------------------------- Búsqueda 360
  'Grafo360-BzaG42VX.js': {
    efecto: {
      inicio: '(0,W.useEffect)(()=>{let e=l.current,t=c.current;if(!e||!t)return;let n=e.getContext(`2d`)',
      fin: '},[o,E,z,f,m]);',
      nuevo: 'efecto-grafo.js',
    },
    // HU-050: icono del sistema (candado), aviso previo de «Nuevo ticket» (modo interesado) y permisos por rol
    importa: 'import{montarGrafo as __mg}from"./escenas-three.js";import{S as __Ico}from"./prototipo-B6qmgYQk.js";import{y as __pre,sn as __perm}from"./comun-CVU2GQ4h.js";import{n as __Seg}from"./prototipo-B6qmgYQk.js";import{t as __Dlg}from"./Dialog-BcfHiG-J.js";',
    sufijo: leer('consulta360.js') + '\n' + leer('c360-redireccion.js') + '\n' + leer('c360-mejoras.js') +
      // 20-oct (b3-k): la Consulta 360 de #/consulta360 (src/c360) usa esta misma vista de los 16 datos por rol y fuente caída,
      // los sistemas de origen, el ticket del cliente por canal y la síntesis por reglas locales
      '\nexport{de as __vista360,X as __fuentes360,__ticketCon360,__sintesis360};',
    reemplazos: [
      // el grafo puede elegir al cliente sin salir de la pantalla (lo usa el inicio); dentro del ticket recibe «Derivar» (HU-050 CA-08)
      ['function ge({clienteId:e}){', 'function ge({clienteId:e,onElegir:__oe,onDerivar:__od}){'],
      ['onClick:()=>M(_(`clientes/${t}`))', 'onClick:()=>__oe?__oe(t):M(_(`clientes/${t}`))'],
      ['M(_(`clientes/${i[0].cliente.id}`));return}', '__oe?__oe(i[0].cliente.id):M(_(`clientes/${i[0].cliente.id}`));return}'],
      [',(0,G.jsx)(S,{size:`sm`,variant:`outline`,children:`Meta p95 ≤ 2 s (propuesta del PO)`})', '', true],
      // HU-050 CA-06: «DNI y KYC» con estado y fecha (la del ejemplo del CA) y «Cuotas vencidas» con la fecha de la consulta
      ['filas:[[`DNI ${re(i.dni)}`,`verificado`],[`KYC`,`conforme (simulado)`]]', 'filas:[[`DNI ${re(i.dni)}`,`verificado · ${Q(new Date(2026,0,15))}`],[`KYC`,`conforme · ${Q(new Date(2026,0,15))}`]]'],
      ['function de(t,n,r){let i=v(n);', 'function de(t,n,r){let __ah=t.ahora,i=v(n);'],
      ["[e.descripcion,`${t.cuotas.filter(e=>e.estado===`Vencida`).length} vencidas`]", "[e.descripcion,`${t.cuotas.filter(e=>e.estado===`Vencida`).length} vencidas · al ${Q(__ah)}`]"],
      ['subtitle:`Fuente: ${le} · consulta en línea, sin copia`', 'subtitle:`Fuente: ${le} · consulta en línea, sin copiar el dato`'],
      // HU-050 CA-05: la vista suma las cuotas vencidas de todos los lotes y los tickets del cliente; la ficha va en scripts/consulta360.js
      ['nodos:A,totalMs:M}}', 'nodos:A,totalMs:M,venc:f.reduce((e,{e:t})=>e+t.cuotas.filter(e=>e.estado===`Vencida`).length,0),nTk:h.length}}'],
      ['(0,G.jsxs)(`p`,{className:`pt-texto-chico`,children:[`DNI `,re(z.cliente.dni),` · `,z.cliente.proyectos[0]?.split(` · `)[0],` · cliente del maestro`]}),(0,G.jsxs)(`div`,{className:`pt-en-linea`,children:[(0,G.jsxs)(t,{tone:`neutral`,size:`sm`,children:[`Lotes `,z.nodos.find(e=>e.id===`lote`)?.filas.length]}),(0,G.jsx)(t,{tone:`neutral`,size:`sm`,children:ge(`cuotas`)}),(0,G.jsxs)(t,{tone:`neutral`,size:`sm`,children:[`Exposición: `,ge(`expo`)]})]})', '(0,G.jsx)(__Ficha,{v:z}),__mod?(0,G.jsx)(__FichaMod360,{c:__cx}):null'],
      // HU-050 CA-07: lo restringido lleva candado y se distingue de lo caído (leyenda, panel del dato y tarjetas)
      ['(0,G.jsx)(S,{size:`sm`,variant:`outline`,children:`Restringido / caído`})', '(0,G.jsxs)(S,{size:`sm`,variant:`outline`,dotColor:`var(--aybar-color-feedback-warning-border)`,children:[(0,G.jsx)(__Ico,{name:`lock`,size:16}),` Restringido`]}),(0,G.jsx)(S,{size:`sm`,variant:`outline`,dotColor:`var(--aybar-color-feedback-danger-border)`,children:`Caído`})'],
      ['e.estado===`restringido`?(0,G.jsx)(f,{tone:`warning`,size:`sm`,title:`Restringido`,', 'e.estado===`restringido`?(0,G.jsx)(f,{tone:`warning`,size:`sm`,title:(0,G.jsxs)(`span`,{className:`pt-en-linea`,children:[(0,G.jsx)(__Ico,{name:`lock`,size:16}),`Restringido`]}),'],
      ['actions:r.estado===`restringido`?(0,G.jsx)(t,{tone:`warning`,size:`sm`,children:`Restringido`})', 'actions:r.estado===`restringido`?(0,G.jsxs)(t,{tone:`warning`,size:`sm`,children:[(0,G.jsx)(__Ico,{name:`lock`,size:16}),` Restringido`]})'],
      // HU-050 CA-08: un DNI que no está en SIGDA/TAXON abre la excepción (interesado o derivar) en vez de buscar documentos
      ['[O,k]=(0,W.useState)(``),A=(0,W.useRef)(new Set)', '[O,k]=(0,W.useState)(``),[__nf,__snf]=(0,W.useState)(null),A=(0,W.useRef)(new Set)'],
      ['(0,W.useEffect)(()=>(y(null),K()),[se,K])', '(0,W.useEffect)(()=>(y(null),__snf(null),K()),[se,K])'],
      ['ce=t=>{t.preventDefault();let r=u.trim();if(!r)return K();', 'ce=t=>{t.preventDefault(),__snf(null);let r=u.trim();if(!r)return K();'],
      ['let o=v(e),s=o?ee(o).filter(e=>C(a)||!e.sensible):[]', 'if(/^\\d{8}$/.test(r)&&!w(n,r).length){__snf({q:r}),k(`El DNI ${r} no está en SIGDA/TAXON: registra como interesado o deriva.`);return}let o=v(e),s=o?ee(o).filter(e=>C(a)||!e.sensible):[]'],
      ['children:`Consultar`})]}),', 'children:`Consultar`})]}),__nf?(0,G.jsx)(__NoEnc,{q:__nf.q,onInteresado:__perm.registrar(a.rol)?()=>{__pre.telefono=``,M(_(`nuevo`))}:void 0,onDerivar:__od}):null,'],
      // HU-050 CA-10: la consulta hecha desde el ticket lleva el ticket para dejar la traza en su bitácora
      ['l.consultar360(e).then(e=>s({fase:`listo`,vista:e,ms:performance.now()-t}),e=>s({fase:`error`,error:e}))},[e]);', 'l.consultar360(e,n).then(e=>s({fase:`listo`,vista:e,ms:performance.now()-t}),e=>s({fase:`error`,error:e}))},[e,n]);'],
      // 20-oct · Consulta 360 (pedido del PO para la presentación; scripts/c360-redireccion.js): información de cada dato y de cada
      // sistema de origen, redirección a los módulos que ya existen, «Crear ticket» y, con la prop `modulo` (página Consulta 360),
      // las tarjetas «Nodos del Grafo 360 y Redirección» y «Estado de sistemas de origen». Dentro del ticket (recibe onDerivar) no hay
      // redirecciones. __fs es el sistema de origen elegido (el grafo lo resalta como a un dato) y __oc, la ficha oculta.
      ['let{datos:n}=te(),a=r(),o=s(`(prefers-reduced-motion: reduce)`)', 'let __pr=arguments[0],__mod=!!__pr.modulo,__tk=`onDerivar`in __pr||(location.hash||``).startsWith(`#/ticket/`),[__fs,__sfs0]=(0,W.useState)(null),[__oc,__soc]=(0,W.useState)(!1),__sfs=__x=>(__sfs0(__x),__soc(!1)),{datos:n}=te(),a=r(),o=s(`(prefers-reduced-motion: reduce)`)'],
      ['[f,p]=(0,W.useState)(`lote`)', '[f,__p0]=(0,W.useState)(`lote`),p=__x=>(__sfs0(null),__soc(!1),__p0(__x))'],
      ['V.current=f;', 'V.current=__fs||f;'],
      ['}),i&&p(i)},J=e=>{', '}),z?.fuentes.forEach(e=>{let t=P.current[e.id];if(!t)return;let o=Math.hypot(t.x-n,t.y-r);o<a&&(a=o,i=`@`+e.id)}),i&&(i[0]===`@`?__sfs(i.slice(1)):p(i))},J=e=>{'],
      ['z?.nodos.forEach(r=>{let i=P.current[r.id];i&&Math.hypot(', '[...z?.nodos??[],...z?.fuentes??[]].forEach(r=>{let i=P.current[r.id];i&&Math.hypot('],
      ['"aria-pressed":f===e.id,', '"aria-pressed":!__fs&&f===e.id,'],
      ['let Y=z.nodos.find(e=>e.id===f)??z.nodos[0],', 'let __cx={v:z,d:n,rol:a.rol,cid:e,tk:__tk,mod:__mod,sel:f,fs:__fs,elegir:p,fuente:__sfs,oculta:__oc,ocultar:__soc,aqui:(location.hash||``).split(`?`)[0]},Y=__fs&&z.fuentes.some(q=>q.id===__fs)?__nodoFuente360(z,__fs):z.nodos.find(e=>e.id===f)??z.nodos[0],'],
      [']})})}),(0,G.jsxs)(`aside`,{className:`pt-lateral`,"aria-label":`Cliente, controles y detalle`,children:[', ',__mod?null:(0,G.jsx)(__ListaFuentes360,{c:__cx})]})})}),(0,G.jsxs)(`aside`,{className:`pt-lateral`,"data-sin-ficha":__mod&&__oc?``:void 0,"aria-label":`Cliente, controles y detalle`,children:['],
      ['(0,G.jsx)(_e,{nodo:Y,', '(0,G.jsx)(_e,{__c:__cx,nodo:Y,'],
      [',sem:g})})]})]})]})}function _e({nodo:e,encendido:t,nombresCaidos:n,sem:r}){return ', ',sem:g})})]})]}),__mod?(0,G.jsx)(__Modulo360,{c:__cx}):null,__mod?(0,G.jsx)(__Mejoras360,{c:__cx}):null]})}function _e(__a){return __Dato360(__a,__e0)}function __e0({nodo:e,encendido:t,nombresCaidos:n,sem:r}){return '],
      // 20-oct · resto de las mejoras de la Consulta 360 de la rama de Daniel (scripts/c360-mejoras.js): búsqueda por sección (nombre
      // de un dato o de un sistema), relevancia de las coincidencias, chips de búsqueda que consultan al momento, más clientes de
      // ejemplo (fuera del ticket), conteos en la leyenda, el estado de la búsqueda a la vista y la vista «Grafo 3D / Grafo 2D»
      // (__modo; __pl llega a la escena como `plano`, ver efecto-grafo.js)
      ['c=ae(s,r).map(e=>({titulo:e.documento.titulo,fragmento:e.fragmento}));', '__sx=__buscaSeccion360(z,r),c=__sx?[]:ae(s,r).map(e=>({titulo:e.documento.titulo,fragmento:e.fragmento,relevancia:e.relevancia}));if(__sx){y(null),__sx.fuente?__sfs(__sx.id):p(__sx.id),k(__sx.texto),K();return}'],
      ['x.find(e=>e.id===n.garantias[0]?.entregaId)?.clienteId]', 'x.find(e=>e.id===n.garantias[0]?.entregaId)?.clienteId,...__tk?[]:__CLIENTES360]'],
      ['onClick:()=>{d(e)},children:`«${e}»`', 'onClick:__ev=>{d(e);let __f=__ev.currentTarget.closest(`.pt-grafo`)?.querySelector(`form[role=search]`);setTimeout(()=>__f&&__f.requestSubmit(),0)},children:`«${e}»`'],
      ['children:`Sistema de origen`})', 'children:`Sistema de origen (${z.fuentes.filter(q=>!q.caida).length}/${z.fuentes.length})`})'],
      ['children:`Dato del cliente`})', 'children:`Dato del cliente (${z.nodos.filter(q=>q.estado===`ok`).length}/${z.nodos.length})`})'],
      ['(0,G.jsx)(`span`,{className:`ay-visually-hidden`,role:`status`,children:O})', '(0,G.jsx)(`p`,{className:O?`pt-texto-chico`:`ay-visually-hidden`,role:`status`,children:O})'],
      ['K()};if(!z)return null;', 'K()},[__modo,__smodo0]=(0,W.useState)(__modoInicial360),__smodo=__x=>(__guardaModo360(__x),__smodo0(__x)),__pl=(0,W.useRef)(!1);__pl.current=__modo===`2d`;(0,W.useEffect)(()=>{k(``)},[se]);if(!z)return null;'],
      ['(0,G.jsx)(`div`,{ref:c,className:`pt-escena-grafo`,', '(0,G.jsx)(__ModoGrafo360,{modo:__modo,cambiar:__smodo}),(0,G.jsx)(`div`,{ref:c,className:`pt-escena-grafo`,"data-plano":__modo===`2d`?``:void 0,'],
      ['r?r.hits.length?(0,G.jsx)(`ul`,{className:`pt-lista-simple`,children:r.hits.map(e=>(0,G.jsxs)(`li`,{children:[(0,G.jsx)(`strong`,{children:e.titulo}),', 'r?r.hits.length?(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`p`,{className:`pt-texto`,children:(0,G.jsx)(`strong`,{children:`Coincidencias semánticas`})}),(0,G.jsx)(`ul`,{className:`pt-lista-simple`,"aria-label":`Coincidencias semánticas`,children:r.hits.map(e=>(0,G.jsxs)(`li`,{children:[e.relevancia==null?null:(0,G.jsxs)(S,{size:`sm`,variant:`outline`,children:[`Relevancia `,e.relevancia,` %`]}),e.relevancia==null?null:` `,(0,G.jsx)(`strong`,{children:e.titulo}),'],
      ['},e.titulo))}):', '},e.titulo))})]}):'],
    ],
    // «Ver como» y «Simular caída» ya están en las herramientas flotantes: no se repiten en la ficha del cliente
    cortes: [['(0,G.jsxs)(L,{children:[(0,G.jsx)(H,{as:`h2`,title:`Ver como`,', '(0,G.jsxs)(L,{children:[(0,G.jsx)(H,{as:`h2`,title:Y.n,', '']],
  },

  // ------------------------------------------------------------------------- Encuesta con NPS (modelo, notas y textos comunes)
  'comun-CVU2GQ4h.js': {
    // v1.3: Mi Portal compone las reglas del chunk con este núcleo (estado, transacción, SLA, flujo, transiciones)
    // y la semilla sin incidencias de ciudad (Etapa 1; ver scripts/etapa1.js)
    sufijo: leer('nucleo-portal.js') + '\n' + leer('etapa1.js') + '\n' + leer('garantias.js') + '\n' + leer('hu043-modelo.js') + '\n' + leer('eje3-modelo.js') + '\n' + leer('hu044-areas.js') + '\n' + leer('hu046-carga.js') + '\n' + leer('hu055-correo.js') + '\n' + leer('hu056-modelo.js') + '\n' + leer('hu066-sla.js') + '\n' + leer('hu048-modelo.js') + '\n' + leer('hu031-informes.js') + '\n' + leer('vivo-modelo.js'),
    prefijo: 'globalThis.__ptNotas=new Map;globalThis.__ptNota=e=>{let t=n=>n==null||n===!1?``:typeof n==`string`||typeof n==`number`?String(n):Array.isArray(n)?n.map(t).join(``):n.props?t(n.props.children):``,r=(location.hash||``).split(`?`)[0];r=r===``||r===`#`||r===`#/`?`#/consulta360`:r;let k=t(e);if(!k)return;let m=globalThis.__ptNotas.get(r);m||globalThis.__ptNotas.set(r,m=new Map);m.has(k)||m.set(k,e)};\n',
    reemplazos: [
      // 20-oct · Consulta 360 (c360-mejoras.js): las consultas rápidas al motor también desde el módulo, sin ticket. Se llama con
      // {clienteId} en lugar del ticket; la consulta queda registrada con el cliente y sin ticket (solo que se consultó, no el valor)
      ['let s=k(R(e,t).clienteId);', 'let s=k(t&&t.clienteId?t.clienteId:R(e,t).clienteId);'],
      ['p={id:d,ticketId:t,fecha:e.ahora,autor:i,consulta:o.id}', 'p={id:d,ticketId:t&&t.clienteId?null:t,clienteId:s.id,fecha:e.ahora,autor:i,consulta:o.id}'],
      // el componente «Supuesto» ya no pinta nada: registra su texto para el panel de notas
      ['function il({children:e}){return(0,c.jsxs)(`span`,{className:`pt-supuesto`,children:[(0,c.jsx)(Me,{size:`sm`,variant:`outline`,children:`Supuesto`}),(0,c.jsx)(`span`,{className:`pt-supuesto__texto`,children:e})]})}', 'function il({children:e}){return ' + NOTA + '}'],
      // cálculo del NPS: si algún día hay respuestas con NPS lo usa; sin ellas (v1.3: encuesta CSAT/CES) es el «NPS preliminar» del CSAT
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
      // 20-oct (pedido del PO para la presentación): Consulta 360 y Operación en vivo son módulos propios; la página de inicio
      // (#/ sin ruta) abre la Consulta 360
      ['[n=`vivo`,r]=t;switch(n){case`vivo`:', '[n=`consulta360`,r]=t;switch(n){case`consulta360`:case`vivo`:'],
      // v1.3: rutas de Mi Portal (#/portal, #/portal/nuevo, #/portal/ticket/<id>)
      ['case`ticket`:return r?{id:`ticket`,ticketId:r}:{id:`desconocida`,hash:e};', 'case`portal`:return{id:`portal`,vista:r??`mis-tickets`,ticketId:t[2]??null};case`ticket`:return r?{id:`ticket`,ticketId:r}:{id:`desconocida`,hash:e};'],
      // v1.3 · Etapa 1: el líder sale del maestro local de ATC (NEXUS es de la Etapa 2 y no se nombra)
      ['mi=e=>e?Qt(e):`Sin líder en NEXUS`', 'mi=e=>e?Qt(e):`Sin líder en ' + MAESTRO + '`'],
      // v1.3 · Etapa 1 sin incidencias de ciudad (UrbeMind): fuera el tipo de los selectores, la línea «Servicios de ciudad»
      // y, de la semilla, el ticket de incidencia de ciudad con sus políticas, llamadas y eventos de UrbeMind
      ['{id:`CIT`,nombre:`Incidencia de ciudad`},', ''],
      ['It=[`Lotes urbanos`,`Vivienda`,`Comercial`,`Servicios de ciudad`]', 'It=[`Lotes urbanos`,`Vivienda`,`Comercial`]'],
      ['return a=ks(a),a=Os(a),a=Ds(a),', 'return a=__etapa1(ks(a)),a=Os(a),a=Ds(a),'],
      // áreas reales de la plataforma actual (decisión del 20-oct)
      ['Wt=[`ATC`,`COBRANZA`,`LEGAL`,`POSTVENTA`,`TI`,`ADMINISTRACION`],Gt={ATC:`ATC`,COBRANZA:`Cobranza`,LEGAL:`Legal`,POSTVENTA:`Postventa`,TI:`TI`,ADMINISTRACION:`Administración`}',
       'Wt=[`ATC`,`COBRANZA`,`LEGAL`,`POSTVENTA`,`TI`,`ADMINISTRACION`,' + IDS_PLATAFORMA + '],Gt={ATC:`ATC`,COBRANZA:`Cobranza`,LEGAL:`Legal`,POSTVENTA:`Postventa`,TI:`TI`,ADMINISTRACION:`Administración`,' + NOMBRES_PLATAFORMA + '}'],
      // v1.3 · HU-056 CA-03 (decisión del 20-oct): el caso «suspendido por reclamo» frena el flujo de su ticket y lo reanuda al
      // responderse el reclamo (scripts/hu043-modelo.js: __h43pausarFlujo / __h43reanudarFlujo)
      ['t=L(t,`resolucion_abierta`,{cuotas:i.impagas,suspendido:c}),c?r++:t=rc(t,l),n++}', 't=L(t,`resolucion_abierta`,{cuotas:i.impagas,suspendido:c}),c&&(t=__h43pausarFlujo(t,s.id)),c?r++:t=rc(t,l),n++}'],
      ['t=rc(t,e.id),i++);return[t,{nuevos', 't=__h43reanudarFlujo(t,e.ticketId),t=rc(t,e.id),i++);return[t,{nuevos'],
      // v1.3 · HU-043: semilla con la clave tipo + subtipo + área; el ticket guarda su subtipo; Pr anota el flujo de esa clave;
      // Zr (Mi Portal, «ticket entrante») y el alta de la consola aplican el flujo (área, responsable, actividades y SLA);
      // publicar valida la HU y «cerrarActividad» habilita la siguiente actividad
      ['ws=[Cs(`flu-0-1`,`CTA`,`COBRANZA`,[{nombre:`Recepción`,responsable:`p-crojas`,slaH:2},{nombre:`Revisión de cobranza`,responsable:`p-rsalazar`,slaH:24},{nombre:`Respuesta al cliente`,responsable:`p-crojas`,slaH:4}]),Cs(`flu-0-2`,`QUE`,`ATC`,[{nombre:`Registro`,responsable:`p-dlazo`,slaH:2},{nombre:`Respuesta`,responsable:`p-dlazo`,slaH:24}]),Cs(`flu-0-4`,`RES`,`COBRANZA`,[{nombre:`Verificación de la deuda`,responsable:`p-rsalazar`,slaH:24},{nombre:`Revisión legal de la causal`,responsable:`p-pvilchez`,slaH:48},{nombre:`Carta de resolución`,responsable:`p-pvilchez`,slaH:72}]),Cs(`flu-0-3`,`GAR`,`POSTVENTA`,[{nombre:`Recepción`,responsable:`p-lccahuana`,slaH:4},{nombre:`Inspección técnica`,responsable:`p-omedina`,slaH:72}])]', FLUJOS_043],
      ['tipo:t.tipo,prioridad:o,', 'tipo:t.tipo,subtipo:t.subtipo||null,prioridad:o,'],
      // la simulación («ticket entrante» del panel y de la operación en vivo) registra con el subtipo «General» de los flujos del PO
      ['tipo:t,prioridad:`MEDIUM`,resumen:`Consulta recibida por Mi Portal`', 'tipo:t,subtipo:`General`,prioridad:`MEDIUM`,resumen:`Consulta recibida por Mi Portal`'],
      ['function Pr(e,t){let n=R(e,t),r=Mr(e,n.tipo);return r?{...e,flujosDeTicket:[...e.flujosDeTicket,{ticketId:t,tipo:n.tipo,version:r.version}]}:e}', 'function Pr(e,t){return __h43registrar(e,t)}'],
      [ZR_ORIGINAL, 'function Zr(e,t){return __h43aplicar(e,t,`p-gnunez`)}'],
      ['crearTicket:e=>Z(`registrar ticket`,t=>Di(t,e,$(),Y.sim.apertura??t.ahora)),', 'crearTicket:e=>Z(`registrar ticket`,t=>__h43crear(t,e,$(),Y.sim.apertura??t.ahora)),'],
      ['crearTicketInteresado:(e,t)=>Z(`registrar ticket de interesado`,n=>Ua(n,e,t,$(),Y.sim.apertura??n.ahora)),', 'crearTicketInteresado:(e,t)=>Z(`registrar ticket de interesado`,n=>__h43crearInteresado(n,e,t,$(),Y.sim.apertura??n.ahora)),'],
      ['publicarFlujo:(e,t,n)=>Z(`publicar flujo`,r=>Q(Fr(r,e,t,n,$()))),', 'publicarFlujo:e=>Z(`publicar flujo`,t=>Q(__h43publicar(t,e,$()))),cerrarActividad:(e,t)=>Z(`cerrar actividad`,n=>Q(__h43cerrarActividad(n,e,t,$()))),'],
      // HU-050 CA-10: la consulta 360 abierta desde un ticket deja en su bitácora (interacciones, nota interna) quién consultó,
      // cuándo y qué secciones vio, sin ningún dato personal; esa nota no cuenta como «interacción en curso» al reasignar por carga
      // (la misma consulta del mismo gestor, con las mismas secciones, en menos de 10 min no se repite: volver a la pestaña no es otra consulta)
      ['function La(e,t,n){', 'function La(e,t,n,__tk){'],
      ['return[L(e,`consulta360`,{secciones:l}),c]}', 'let __d=L(e,`consulta360`,{secciones:l});if(__tk&&e.tickets.some(e=>e.id===__tk)){let __v=[`lotes`,`cuotas`,`correos`,`documentos`,`tickets`,`llamadas`].filter(e=>c[e].estado===`ok`).map(e=>Ea[e]),__x=`Consulta 360 del cliente. Secciones vistas: ${__v.length?__v.join(`, `):`ninguna`}.`,__u=e.interacciones.filter(q=>q.ticketId===__tk&&q.consulta360).at(-1);if(!(__u&&__u.autor===n&&__u.texto===__x&&e.ahora-__u.fecha<6e5)){let[__i,__s]=I(__d,`in`);__d={...__s,interacciones:[...__s.interacciones,{id:__i,ticketId:__tk,fecha:e.ahora,tipo:`nota`,visible:!1,canal:null,autor:n,texto:__x,adjuntos:[],consulta360:!0}]}}}return[__d,c]}'],
      ['consultar360:e=>Z(`consulta 360`,t=>La(t,e,$()))', 'consultar360:(e,__tk)=>Z(`consulta 360`,t=>La(t,e,$(),__tk))'],
      ['Jr=(e,t)=>e.interacciones.some(n=>n.ticketId===t.id&&', 'Jr=(e,t)=>e.interacciones.some(n=>n.ticketId===t.id&&!n.consulta360&&'],
      // v1.3 · HU-034 CA-02: el reclamo no procedente se informa al cliente con su motivo (scripts/garantias.js)
      ['(u=cs(u,l,`NO_PROCEDENTE`,`Sistema`,d.motivoNoProcede),[L(', '(u=cs(u,l,`NO_PROCEDENTE`,`Sistema`,d.motivoNoProcede),u=__gInformar(u,d,a),[L('],
      // v1.3 · HU-035 CA-01: el informe y las fotos (al menos una foto JPG/PNG; PDF opcional; hasta 10 MB y 5 archivos)
      ['n.evidencias.length||a.push({campo:`fotos`,mensaje:`Adjunta al menos una foto o documento de la inspección.`})',
       'n.evidencias.some(o=>/\\.(jpe?g|png)$/i.test(o.nombre))||a.push({campo:`fotos`,mensaje:`Adjunta al menos una foto (JPG o PNG) de la inspección.`}),n.evidencias.some(o=>!/\\.(jpe?g|png|pdf)$/i.test(o.nombre)||o.tamano>10485760)&&a.push({campo:`fotos`,mensaje:`Solo fotos JPG o PNG y documentos PDF de hasta 10 MB.`}),n.evidencias.length>5&&a.push({campo:`fotos`,mensaje:`Máximo 5 archivos por inspección.`})'],
      // v1.3 · HU-036 CA-01: la carta notarial del reclamo (scripts/garantias.js) y, ya en Eje 3, el reclamo sigue sin resolverse
      // en Postventa mientras el ticket esté abierto
      ['registrarAdenda:(e,t)=>Z(`registrar adenda`,n=>Q(ms(n,e,t,$()))),', 'registrarAdenda:(e,t)=>Z(`registrar adenda`,n=>Q(ms(n,e,t,$()))),registrarCartaNotarial:(e,t)=>Z(`registrar carta notarial`,n=>Q(__gCarta(n,e,t,$()))),'],
      ['return!!(n&&n.eje!==3&&B(e,n.id).length)', 'return!!(n&&B(e,n.id).length&&(n.eje!==3||E.includes(n.estado)))'],
      // v1.3 · HU-031: al avanzar el reloj (corre el job programado) se generan el informe diario de cada jornada que cierra y el
      // quincenal de cada quincena que cierra (scripts/hu031-informes.js); la respuesta del reloj trae la lista para el aviso
      ['avanzar(e){X({...Y,datos:H(Y.datos,Kn(Y.datos.ahora,e))});let t=zc.ejecutarJob();return X({...Y,datos:oc(Y.datos)[0]}),t}', 'avanzar(e){let __a=Y.datos.ahora;X({...Y,datos:H(Y.datos,Kn(Y.datos.ahora,e))});let t=zc.ejecutarJob();X({...Y,datos:oc(Y.datos)[0]});let[__d,__i]=__ptInformes.job(Y.datos,__a);return X({...Y,datos:__d}),{...t,informes:__i}}'],
      // v1.3 · HU-055 CA-01/02: el ticket nuevo que el balanceo de entrada (HU-046) manda a otro gestor es un movimiento propio:
      // su correo sale solo; el resumen en un solo correo queda para las reasignaciones masivas (cese, rotación y «Balancear la carga»)
      ['let e=n.motivo===`REASSIGNMENT_CESE`||n.motivo===`REASSIGNMENT_ROTACION`||n.motivo===`REASSIGNMENT_CARGA`,r=e?', 'let e=!n.alEntrar&&(n.motivo===`REASSIGNMENT_CESE`||n.motivo===`REASSIGNMENT_ROTACION`||n.motivo===`REASSIGNMENT_CARGA`),r=e?'],
      // v1.3 · HU-026 CA-01/02 y HU-027 CA-01: a Eje 3 solo se pasa con «Derivar a Eje 3» (paquete mínimo y, con conflicto, nota
      // emocional). El gate _i (que también deshabilita «Escalado» en «Cambiar estado») rechaza ESCALATED fuera de Eje 3; So pone el
      // eje 3 antes de cambiar el estado. Sin señal, el rechazo lleva el código «gate-handoff» (con señal sigue «gate-conflicto»)
      ['function _i(e,t,n){return(n===', 'function _i(e,t,n){return n===`ESCALATED`&&t.eje!==3?__h26escalar(e,t):(n==='],
      ['if(c)throw new j(409,`gate-conflicto`,c,{auditar:!0})', 'if(c)throw new j(409,n===`ESCALATED`&&!B(e,o.id).length?`gate-handoff`:`gate-conflicto`,c,{auditar:!0})'],
      ['s=z(s,{...R(s,t),area:`LEGAL`,responsable:an}),s=Oi[i.estado].includes(`ESCALATED`)?V(s,t,`ESCALATED`,r,`Derivado a Eje 3 con paquete mínimo`):z(s,{...R(s,t),eje:3})',
       's=z(s,{...R(s,t),area:`LEGAL`,responsable:an,eje:3}),s=Oi[i.estado].includes(`ESCALATED`)?V(s,t,`ESCALATED`,r,`Derivado a Eje 3 con paquete mínimo`):s'],
      // v1.3 · HU-041 CA-02: al alertar a Legal por la exposición (desde S/ 500) el ticket se marca como prioritario (prioridad
      // urgente; la anterior queda en la alerta). Sin I(): la semilla no mueve ids
      ['venceLegal:a?a.venceProrrogado??a.venceOriginal:null}]},`riesgo_denuncia`,{exposicion:i.total}),n++}', 'venceLegal:a?a.venceProrrogado??a.venceOriginal:null,prioridadAnterior:r.prioridad}]},`riesgo_denuncia`,{exposicion:i.total}),t=__h41priorizar(t,r.id),n++}'],
      // v1.3 · HU-056 CA-01: la evaluación diaria registra el ticket «Resolución de contrato» con el subtipo «General» (el de los
      // flujos del PO) y le aplica el flujo como el alta de la consola (__h43crear): Cobranza y Legal (scripts/hu056-modelo.js)
      ['tipo:`RES`,prioridad:`HIGH`,', 'tipo:`RES`,subtipo:`General`,prioridad:`HIGH`,'],
      ['[o,s]=Di(t,a,Ps,e.ahora)', '[o,s]=__h43crear(t,a,Ps,e.ahora)'],
      ['cuotas impagas y derivado a Cobranza y Legal.`', 'cuotas impagas y ${__h56nota(s)}`'],
      // v1.3 · HU-066 CA-01: el SLA se pausa en «pendiente del cliente» y se reanuda al salir (V corre los vencimientos); el nivel
      // de SLA (wi) y el job de alertas (Fi) miden contra el vencimiento corrido por la espera en curso (scripts/hu066-sla.js)
      ['let[d,f]=I(e,`fe`);return f=z(f,u),', 'u=__h66pausa(o,u,l);let[d,f]=I(e,`fe`);return f=z(f,u),'],
      ['i=r===`respuesta`?e.venceRespuesta:n;if(t>i)return{nivel:`vencido`', 'i=__h66mover(r===`respuesta`?e.venceRespuesta:n,__h66pausaH(e,t));if(t>i)return{nivel:`vencido`'],
      ['e.ahora>a.venceRespuesta&&o.push([`FIRST_RESPONSE_OVERDUE`,a.venceRespuesta]);let s=Ci(a);', 'e.ahora>__h66mover(a.venceRespuesta,__h66pausaH(a,e.ahora))&&o.push([`FIRST_RESPONSE_OVERDUE`,__h66mover(a.venceRespuesta,__h66pausaH(a,e.ahora))]);let s=__h66mover(Ci(a),__h66pausaH(a,e.ahora));'],
      // v1.3 · HU-066 CA-04: el job del sistema (panel de simulación, «Ejecutar el job ahora» y cada avance del reloj) cierra los
      // tickets resueltos sin respuesta del cliente al terminar los días hábiles configurados; el resumen del job lo cuenta
      ['ejecutarJob(){let[e,t]=Ko(Y.datos);return X({...Y,datos:e}),t}', 'ejecutarJob(){let[e,t]=Ko(Y.datos),[__e,__c]=__h66cerrarVencidos(e);return X({...Y,datos:__e}),{...t,cierres:__c}}'],
      ['${a.alertasRiesgo} alertas por riesgo de denuncia.`}', '${a.alertasRiesgo} alertas por riesgo de denuncia.${e.cierres?` Cierre automático: ${e.cierres.cerrados} tickets resueltos sin respuesta del cliente en ${e.cierres.dias} días hábiles.`:``}`}'],
    ],
  },

  // ------------------------------------------------------------------------- Garantías postventa (v1.3 · HU-034, 035 y 036)
  'Garantia-DnJ0f3xI.js': {
    importa: 'import{ii as __Subir,cn as __sen,__ptHuella as __huella}from"./comun-CVU2GQ4h.js";',
    prefijo: leer('garantia-ui.js') + '\n',
    reemplazos: [
      ['ADENDA:`Adenda registrada`}', 'ADENDA:`Adenda registrada`,MOTIVO_INFORMADO:`Motivo informado al cliente`,TICKET_VINCULADO:`Ticket vinculado`,CARTA_NOTARIAL:`Carta notarial recibida`}'],
      // HU-034 CA-02: el aviso al cliente con el motivo se ve en el reclamo
      ['[j.motivoNoProcede,` Este es el motivo que se informa al cliente.`]', '[j.motivoNoProcede,(q=>q?` Se informó al cliente el ${S(q.fecha)} por ${q.detalle}.`:` Este es el motivo que se informa al cliente.`)($.find(q=>q.evento===`MOTIVO_INFORMADO`))]'],
      // HU-035 CA-01: varios archivos, fotos y documentos
      ['description:`El informe y al menos una foto o documento, antes de resolver.`', 'description:`El informe y al menos una foto, antes de resolver; puedes sumar documentos PDF.`'],
      ['(0,X.jsx)(E,{id:`${a}-fotos`,etiqueta:`Foto o documento de la inspección`,requisitos:`PDF de hasta 10 MB (en el prototipo, un archivo; se guarda su huella).`,documento:c[0]??null,onCambio:e=>l(e?[e]:[]),error:d.fotos})',
       '(0,X.jsx)(__Evidencias,{id:`${a}-fotos`,archivos:c,onCambio:l,error:d.fotos})'],
      // HU-036 CA-01: registrar la carta notarial (vincula el ticket si falta), sin «Resolver» con el conflicto activo y,
      // ya derivado, el aviso de que lo atiende Legal
      ['(0,X.jsx)(G,{as:`h2`,title:`Reclamo`})', '(0,X.jsx)(G,{as:`h2`,title:`Reclamo`,actions:N&&(V||j.estado===`APPROVED`)&&!(F&&(F.eje===3||__sen(a,F.id).includes(`CARTA_NOTARIAL`)))?(0,X.jsx)(t,{size:`sm`,variant:`secondary`,onClick:()=>A(`carta`),children:`Registrar carta notarial`}):void 0})'],
      ['(0,X.jsx)(re,{g:j,abierto:E===`adenda`,onCerrar:()=>A(null)})', '(0,X.jsx)(re,{g:j,abierto:E===`adenda`,onCerrar:()=>A(null)}),(0,X.jsx)(__Carta,{g:j,datos:a,abierto:E===`carta`,onCerrar:()=>A(null)})'],
      ['Q.registrada?(0,X.jsx)(t,{variant:`primary`,onClick:()=>A(`resolver`),children:`Resolver el reclamo`})', 'Q.registrada?I?void 0:(0,X.jsx)(t,{variant:`primary`,onClick:()=>A(`resolver`),children:`Resolver el reclamo`})'],
      ['I&&F?(0,X.jsx)(i,{tone:`danger`,title:`Conflicto: se atiende en Eje 3`,actions:(0,X.jsx)(t,{variant:`primary`,size:`sm`,onClick:()=>k(o(`ticket/${F.id}`)),children:`Ir al ticket para derivar`}),children:(0,X.jsxs)(`span`,{className:`pt-alerta__texto`,children:[`El ticket `,F.numero,` tiene señal de conflicto: este reclamo no se resuelve en Postventa (Eje 2). Deriva a Eje 3 con el paquete mínimo.`]})}):null',
       'I&&F?(0,X.jsx)(i,{tone:`danger`,title:F.eje===3?`Derivado a Eje 3`:`Conflicto: se atiende en Eje 3`,actions:(0,X.jsx)(t,{variant:`primary`,size:`sm`,onClick:()=>k(o(`ticket/${F.id}`)),children:F.eje===3?`Ir al ticket`:`Ir al ticket para derivar`}),children:(0,X.jsxs)(`span`,{className:`pt-alerta__texto`,children:F.eje===3?[`El ticket `,F.numero,` está en Eje 3: lo atiende Legal y este reclamo no se resuelve en Postventa mientras el ticket siga abierto.`]:[`El ticket `,F.numero,` tiene señal de conflicto: este reclamo no se resuelve en Postventa (Eje 2). Deriva a Eje 3 con el paquete mínimo.`]})}):null'],
    ],
  },
  'Garantias-uYNfeDU1.js': {
    reemplazos: [
      // HU-034 CA-02: el aviso confirma que el motivo se informó al cliente
      ['message:e.estado===`NOT_ELIGIBLE`?`${e.codigo} registrado como no procedente por vigencia.`:', 'message:e.estado===`NOT_ELIGIBLE`?`${e.codigo} registrado como no procedente por vigencia; se informó el motivo al cliente.`:'],
    ],
  },

  // v1.3 · HU-027 CA-03: constancia de los avisos «handoff sin confirmar» a la jefatura del eje destino (scripts/eje3-alertas.js)
  'Alertas-pLhNJ3bg.js': {
    importa: 'import{$r as __Tag,gt as __hof}from"./comun-CVU2GQ4h.js";',
    prefijo: leer('eje3-alertas.js') + '\n',
    reemplazos: [
      ['(0,D.jsxs)(v,{children:[(0,D.jsx)(T,{as:`h2`,title:`Corridas del job`', '(0,D.jsx)(__AvisosHandoff,{datos:i,cargando:k.fase===`cargando`}),(0,D.jsxs)(v,{children:[(0,D.jsx)(T,{as:`h2`,title:`Corridas del job`'],
    ],
  },

  'Torre-Cw_qLOQG.js': {
    // v1.3 · HU-031: Informes sin botones (se generan al cierre) y el quincenal con las tendencias de los KPI; scripts/hu031-torre.js
    // reemplaza la función «oe» del chunk y trae su propio import de comun (__ptInformes)
    cortes: [['function oe({datos:e}){', 'function se({datos:t}){', leer('hu031-torre.js') + '\n']],
    // v1.3 · HU-041 CA-02: la prioridad del ticket en «Riesgo de denuncia» (el que ya alertó a Legal queda como prioritario)
    importa: 'import{a as __Prio}from"./comun-CVU2GQ4h.js";',
    reemplazos: [
      ['{key:`alerta`,header:`Alerta a Legal`', '{key:`prioridad`,header:`Prioridad`,width:`10rem`,renderCell:e=>(0,Z.jsx)(__Prio,{prioridad:e.ticket.prioridad,size:`sm`})},{key:`alerta`,header:`Alerta a Legal`'],
    ],
  },

  // ------------------------------------------------------------------------- Detalle del ticket: el asistente es ahora el robot flotante
  'DetalleTicket-CTveBafq.js': {
    // v1.3 · HU-043: tarjeta «Actividades del flujo» (scripts/hu043-detalle.js) y el subtipo en la cabecera
    importa: 'import{__h43 as __f,kr as __nprio}from"./comun-CVU2GQ4h.js";',
    prefijo: leer('hu043-detalle.js') + '\n' + leer('eje3-detalle.js') + '\n' + leer('hu048-detalle.js') + '\n',
    reemplazos: [
      ['g?(0,Q.jsx)(St,{ticket:p,datos:a}):null,', ''],
      // v1.3 · HU-043 CA-01/04/05: actividades del flujo (primera tarjeta del lateral) y subtipo junto al tipo
      ['"aria-label":`Datos, compromisos y cierre`,children:[', '"aria-label":`Datos, compromisos y cierre`,children:[(0,Q.jsx)(__Actividades,{ticket:p,datos:a,atiende:g}),'],
      ['description:`${L(p.empresaId)?.nombre} · ${i(p.tipo)} · ${N[p.area]}', 'description:`${L(p.empresaId)?.nombre} · ${i(p.tipo)}${p.subtipo?` · ${p.subtipo}`:``} · ${N[p.area]}'],
      // HU-050 CA-08: la consulta 360 de la pestaña Cliente ofrece «Derivar» con el mismo diálogo y reglas que la cabecera
      ['function Ct({ticket:e,datos:t}){', 'function Ct({ticket:e,datos:t,onDerivar:__od}){'],
      ['(0,Q.jsx)(lt,{clienteId:e.clienteId})', '(0,Q.jsx)(lt,{clienteId:e.clienteId,onDerivar:__od})'],
      ['(0,Q.jsx)(Ct,{ticket:p,datos:a})', '(0,Q.jsx)(Ct,{ticket:p,datos:a,onDerivar:g&&(w||p.estado!==`CLOSED`)?()=>f(w?`eje3`:`derivar`):void 0})'],
      // v1.3 · HU-048 CA-02: el ticket muestra el registro de decisiones sobre la IA (debajo de la guía de solución)
      ['g?(0,Q.jsx)(xt,{ticket:p,datos:a}):null,', 'g?(0,Q.jsx)(xt,{ticket:p,datos:a}):null,(0,Q.jsx)(__DecisionesIA,{ticket:p,datos:a}),'],
      // HU-048 CA-01: al elegir «Resuelto» o «Cerrado» el asistente revisa los criterios de cierre de la guía; al confirmar, el robot
      // se abre con la respuesta sugerida (aceptar, editar o descartar)
      ['o===`CLOSED`?(0,Q.jsx)(j,{children:`El cierre formal', '(o===`RESOLVED`||o===`CLOSED`)?(0,Q.jsx)(__CierreIA,{ticket:e,datos:t,onRevisar:()=>{i(),__iaCierre(e.id,o)}}):null,o===`CLOSED`?(0,Q.jsx)(j,{children:`El cierre formal'],
      ['E({message:`${e.numero}: ${A[e.estado]} → ${A[o]}.`,tone:`success`}),i())};', 'E({message:`${e.numero}: ${A[e.estado]} → ${A[o]}.`,tone:`success`}),i(),(o===`RESOLVED`||o===`CLOSED`)&&__iaCierre(e.id,o))};'],
      // v1.3 · HU-026 CA-01/02 y HU-027 CA-01: en «Cambiar estado», «Escalado» queda deshabilitado fuera de Eje 3 (gate _i de comun) y
      // el diálogo lleva a «Derivar a Eje 3» (paquete mínimo), también para un ticket sin señal de conflicto
      ['function Qt({ticket:e,datos:t,abierto:n,onCerrar:i}){', 'function Qt({ticket:e,datos:t,abierto:n,onCerrar:i,onEje3:__e3}){'],
      ['checked:o===n,onChange:()=>s(n)},n)})}),o===`REOPENED`?', 'checked:o===n,onChange:()=>s(n)},n)})}),__e3&&e.eje!==3&&!Se(e.estado,`ESCALATED`)?(0,Q.jsx)(m,{tone:`info`,size:`sm`,title:`Escalar a Eje 3`,actions:(0,Q.jsx)(r,{size:`sm`,variant:`secondary`,onClick:__e3,children:`Derivar a Eje 3`}),children:(0,Q.jsx)(`span`,{className:`pt-alerta__texto`,children:D(t,e.id).length?`Con señal de conflicto, el ticket se deriva a Eje 3 con la nota de estado emocional y el paquete mínimo de handoff (6 elementos).`:`El paso a Eje 3 se hace derivando con el paquete mínimo de handoff: los 6 elementos completos antes de enviar.`})}):null,o===`REOPENED`?'],
      ['(0,Q.jsx)(Qt,{ticket:p,datos:a,abierto:d===`estado`,onCerrar:()=>f(null)})', '(0,Q.jsx)(Qt,{ticket:p,datos:a,abierto:d===`estado`,onCerrar:()=>f(null),onEje3:()=>f(`eje3`)})'],
      // v1.3 · HU-027 CA-03: el aviso del job a la jefatura de Legal se ve en el ticket (scripts/eje3-detalle.js)
      ['(0,Q.jsx)(e,{tone:h>=1?`danger`:`warning`,size:`sm`,dot:!0,children:h>=1?`Sin confirmar hace ${h} ${h===1?`día hábil`:`días hábiles`}: jefatura avisada`:`Pendiente de confirmar`})', '(0,Q.jsx)(__AvisoHandoff,{ticket:t,datos:n,dias:h})'],
      // v1.3 · HU-040 CA-02: pestaña «Legal» del ticket con el estado sincronizado (la tarjeta lateral pasa a la pestaña)
      ['...S(o)?[{value:`cliente`,label:`Cliente`}]:[]]', '...S(o)?[{value:`cliente`,label:`Cliente`}]:[],...__h40caso(a,p.id)?[{value:`legal`,label:`Legal`}]:[]]'],
      [':(0,Q.jsx)(Jt,{datos:a,ticket:p})', ':l===`legal`?(0,Q.jsx)(Et,{ticket:p,datos:a}):(0,Q.jsx)(Jt,{datos:a,ticket:p})'],
      ['(0,Q.jsx)(Dt,{ticket:p,datos:a}),(0,Q.jsx)(Et,{ticket:p,datos:a}),', '(0,Q.jsx)(Dt,{ticket:p,datos:a}),'],
      // v1.3 · HU-041 CA-02: «Legal ya fue alertado» dice que el ticket quedó como prioritario
      ['title:`Legal ya fue alertado`,children:(0,Q.jsxs)(`span`,{className:`pt-alerta__texto`,children:[`Alerta del `,M(a.fecha),` por una exposición de `,O(a.total,a.moneda),`.`]})', 'title:`Legal ya fue alertado`,children:(0,Q.jsxs)(`span`,{className:`pt-alerta__texto`,children:[`Alerta del `,M(a.fecha),` por una exposición de `,O(a.total,a.moneda),`.`,a.prioridadAnterior&&a.prioridadAnterior!==`URGENT`?` Se marcó como prioritario: pasó de prioridad ${__nprio(a.prioridadAnterior).toLowerCase()} a urgente.`:` Se marcó como prioritario (prioridad urgente).`]})'],
      // v1.3 · HU-066 CA-01: la pausa del SLA en «pendiente del cliente», en «Compromisos SLA e hitos»
      ['[`Vence resolución (original)`,k(e.venceResolucion)],', '[`Vence resolución (original)`,k(e.venceResolucion)],...e.pausaSla?[[`SLA en pausa`,`Desde ${k(e.pausaSla)}: espera la respuesta del cliente`]]:[],...e.pausasSla?.length?[[`Pausas del SLA`,`${le(e.pausasSla.reduce((q,w)=>q+w.horas,0))} hábiles en espera del cliente; los vencimientos se corrieron ese tiempo`]]:[],'],
    ],
  },
  // v1.3 · HU-043: Configuración › Flujos con la clave tipo + subtipo + área, bitácora de publicaciones y alerta «sin flujo»
  'Configuracion-CA83coxJ.js': {
    importa: 'import{__h43 as __f}from"./comun-CVU2GQ4h.js";',
    prefijo: leer('hu066-configuracion.js') + '\n',
    cortes: [['function W({tipo:e,datos:t,onCerrar:i}){', 'function G({tipo:e,datos:t,onCerrar:i}){', leer('hu043-configuracion.js') + '\n']],
    reemplazos: [
      // áreas reales de la plataforma actual (decisión del 20-oct): también en la lista local de Configuración
      [',H=[`ATC`,`COBRANZA`,`LEGAL`,`POSTVENTA`,`TI`,`ADMINISTRACION`]', ',H=[`ATC`,`COBRANZA`,`LEGAL`,`POSTVENTA`,`TI`,`ADMINISTRACION`,' + IDS_PLATAFORMA + '],__AP=new Set([' + IDS_PLATAFORMA + '])'],
      [COLUMNAS_FLUJOS, COLUMNAS_FLUJOS_043],
      ['{value:`flujos`,label:`Flujos`,count:F.length}', '{value:`flujos`,label:`Flujos`,count:__f.vigentes(o).length}'],
      [TABLA_FLUJOS, TABLA_FLUJOS_043],
      ['e.tipo===`GUIA_FALTANTE`', '(e.tipo===`GUIA_FALTANTE`||e.tipo===`FLUJO_FALTANTE`)', true],
      ['title:`Tipo sin guía`', 'title:e.tipo===`FLUJO_FALTANTE`?`Sin flujo en el área`:`Tipo sin guía`'],
      ['description:`Cuando un gestor abra un ticket de un tipo sin guía, se reporta aquí.', 'description:`Cuando un gestor abra un ticket de un tipo sin guía, o entre un ticket sin flujo publicado en su área, se reporta aquí.'],
      ['(0,V.jsx)(W,{tipo:w,datos:o,onCerrar:()=>E(null)})', '(0,V.jsx)(W,{flujo:w,datos:o,onCerrar:()=>E(null)})'],
      // v1.3 · HU-066 CA-04: pestaña «Cierre automático» con los días hábiles que se espera la confirmación del cliente
      ['}]})}),c.fase===`error`?(0,V.jsx)(S,{error:c.error,reintentar:p}):', '},{value:`cierre`,label:`Cierre automático`}]})}),c.fase===`error`?(0,V.jsx)(S,{error:c.error,reintentar:p}):h===`cierre`?(0,V.jsx)(__Cierre,{datos:o}):'],
    ],
  },
  // v1.3 · HU-043: subtipo al registrar y SLA de resolución según el flujo
  'NuevoTicket-kzkvXK7o.js': {
    importa: 'import{__h43 as __f}from"./comun-CVU2GQ4h.js";',
    reemplazos: [
      ['tipo:``,prioridad:``,resumen:``,descripcion:``}', 'tipo:``,subtipo:``,prioridad:``,resumen:``,descripcion:``}'],
      ['X=y.tipo&&y.prioridad?ne(e,y.tipo,y.prioridad,Y):null,', 'X=y.tipo&&y.prioridad?ne(e,y.tipo,y.prioridad,Y):null,__P=X?__f.prever(e,y,n.personaId,Y,X):null,'],
      ['(0,R.jsx)(I,{value:y.tipo,placeholder:`Elige el tipo`,onChange:e=>Z(`tipo`,e.target.value),options:a.map(e=>({value:e.id,label:e.nombre}))})}),', SUBTIPO_043],
      ['[`Resolución`,`${b(X.venceResolucion)} (${v(X.politica.resolucionH)} hábiles)`]]', RESOLUCION_043],
      // 20-oct · Consulta 360 › «Crear ticket»: el cliente llega ya elegido por el aviso previo (y.cliente, como y.telefono)
      ['[y,C]=(0,L.useState)(z),[w,A]=(0,L.useState)({}),[B,V]=(0,L.useState)(null),', '[y,C]=(0,L.useState)(()=>E.cliente?{...z,clienteId:E.cliente.id}:z),[w,A]=(0,L.useState)({}),[B,V]=(0,L.useState)(()=>E.cliente??null),'],
      ['(0,L.useEffect)(()=>{E.telefono=null,', '(0,L.useEffect)(()=>{E.telefono=null,E.cliente=null,'],
    ],
  },
  // v1.3 · Etapa 1: líderes y gestores del maestro local de ATC (NEXUS es de la Etapa 2 y no se nombra)
  'MiDia-Sl191JQ_.js': {
    // v1.3 · HU-055: «Plantilla de correo de asignación» (scripts/hu055-plantilla.js; modelo en hu055-correo.js, sufijo de comun)
    importa: 'import{__h55 as __c55}from"./comun-CVU2GQ4h.js";',
    prefijo: leer('hu055-plantilla.js') + '\n',
    reemplazos: [
      ['children:`Sin líder en NEXUS`', 'children:`Sin líder en ' + MAESTRO + '`'],
      ['description:`Nadie te tiene como líder en NEXUS.`', 'description:`Nadie te tiene como líder en ' + MAESTRO + '.`'],
      ['title:`Completa el líder en NEXUS`', 'title:`Completa el líder en ' + MAESTRO + '`'],
      ['Líder de cada gestor según NEXUS (DEP-02): ', 'Líder de cada gestor según ' + MAESTRO + ': '],
      // HU-055: «Ver» en cada correo enviado muestra la plantilla con su cuerpo (por defecto, el más reciente)
      ['[E,k]=(0,V.useState)(`dia`)', '[E,k]=(0,V.useState)(`dia`),[__sel,__ss]=(0,V.useState)(null)'],
      ['e.tickets.length>6?`…`:``]})]})}];', 'e.tickets.length>6?`…`:``]})]})},{key:`ver`,header:`Correo`,width:`7rem`,renderCell:__r=>(0,H.jsx)(n,{size:`sm`,variant:`ghost`,"aria-pressed":(__sel??X[0]?.id)===__r.id,"aria-label":`Ver el correo «${__r.asunto}»`,onClick:()=>__ss(__r.id),children:`Ver`})}];'],
      ['depende del servicio de envío.`})]})})})]})', 'depende del servicio de envío.`})]})})}),(0,H.jsx)(__Plantilla,{correo:X.find(__r=>__r.id===__sel)??X[0],datos:s})]})'],
      // HU-046 CA-01: el balanceo también corre al entrar un ticket nuevo (scripts/hu046-carga.js)
      ['sin mover los de rayo, Eje 3 o con interacción en curso.`', 'sin mover los de rayo, Eje 3 o con interacción en curso. Un ticket nuevo cuyo responsable supera el límite entra directo al gestor disponible del área con menos carga.`'],
      ['`; el balanceo corre a pedido. Disponibilidad', '`; el balanceo corre a pedido y también al entrar un ticket nuevo para alguien sobre el límite. Disponibilidad'],
    ],
  },
  'Ingreso-hnvFCZyT.js': { reemplazos: [['Hora actual simulada: ', 'Hora actual: ']] },
  // v1.3 · HU-056 CA-01 (el flujo de Cobranza y Legal, en el caso) y HU-057 (plantilla de la alerta de cancelación al cliente):
  // scripts/hu056-morosidad.js
  'Morosidad-CjqbEmCJ.js': {
    prefijo: leer('hu056-morosidad.js') + '\n',
    reemplazos: [
      [' Es una propuesta del PO, a validar con Legal.', ''],
      ['(0,R.jsx)(F,{as:`h2`,title:`Alerta de cancelación al cliente`,subtitle:`Se envía al abrir el caso, por correo, WhatsApp y Mi Portal, sin esperar el flujo.`})', '(0,R.jsx)(F,{as:`h2`,title:`Alerta de cancelación al cliente`,subtitle:`Se envía al abrir el caso, por correo, WhatsApp y Mi Portal, sin esperar el flujo.`,actions:(0,R.jsx)(n,{size:`sm`,variant:`secondary`,onClick:()=>U(`plantilla`),children:`Ver la plantilla`})})'],
      ['X?(0,R.jsxs)(O,{children:[(0,R.jsx)(F,{as:`h2`,title:`Carta de alerta`})', '(0,R.jsx)(__FlujoCaso,{ticket:J}),X?(0,R.jsxs)(O,{children:[(0,R.jsx)(F,{as:`h2`,title:`Carta de alerta`})'],
      ['(0,R.jsxs)(N,{open:H===`accion`,', '(0,R.jsx)(__Plantilla,{abierto:H===`plantilla`,onCerrar:()=>U(null),caso:q,cliente:Y}),(0,R.jsxs)(N,{open:H===`accion`,'],
    ],
  },

  // ------------------------------------------------------------------------- Shell
  'prototipo-B6qmgYQk.js': {
    importa: 'import{__h44}from"./comun-CVU2GQ4h.js";import{inyectarEstilos as __estilos,montarBot as __mb,redactar as __redactar,resumir as __resumir,siguientePaso as __paso,revisar as __revisar,conversar as __conversar,TONOS as __TONOS,SALUDO as __SALUDO}from"./escenas-three.js";import{nn as __sla,Or as __nombre,Ar as __tipo,hr as __estados,mr as __areas,m as __fecha,Kn as __cli,wn as __rayo,E as __api,__ptIA as __ia}from"./comun-CVU2GQ4h.js";',
    reemplazos: [
      ['function ca(){let e=de(),', leer('shell.js') + '\nfunction ca(){let e=de(),'],
      [',(0,L.jsx)(`span`,{className:`pt-marca__etiqueta`,children:`What-if · propuesta del PO`})', ''],
      ['case`vivo`:return(0,L.jsx)(Gi,{});', 'case`consulta360`:return(0,L.jsx)(__Consulta360,{});case`vivo`:return(0,L.jsx)(Gi,{});'],
      ['...n===`SIN_ATENCION`?[]:[{href:g(`vivo`),label:`Vista en vivo`,icon:(0,L.jsx)(R,{name:`eye`}),current:t.id===`vivo`,badge:(0,L.jsx)(te,{size:`sm`,variant:`outline`,children:`PO`})}],', ''],
      // 20-oct: Consulta 360 y Operación en vivo, cada una en su módulo, en un grupo propio arriba del menú (como en la rama de Daniel)
      ['return[a,...s.items.length?[s]:[],...o.items.length?[o]:[]]}', 'return[...n===`SIN_ATENCION`?[]:[{label:`Núcleo 360 y Planta`,items:[{href:g(`consulta360`),label:`Consulta 360`,icon:(0,L.jsx)(R,{name:`grid`}),current:t.id===`consulta360`},{href:g(`vivo`),label:`Operación en vivo`,icon:(0,L.jsx)(R,{name:`eye`}),current:t.id===`vivo`}]}],a,...s.items.length?[s]:[],...o.items.length?[o]:[]]}'],
      ['(0,L.jsx)(ce,{})]})}function la({ruta:e}){', '(0,L.jsx)(ce,{}),i.rol!==`CONTROL_ACCESO`&&i.rol!==`CLIENTE`?(0,L.jsx)(__Bot,{ruta:t,datos:a,usuario:i.nombre}):null,(0,L.jsx)(__Herramientas,{rol:i.rol,roles:sa,ahora:a.ahora,onApariencia:()=>{d(!u),l(!1)},onSimulacion:()=>{l(!c),d(!1)}})]})}function la({ruta:e}){'],
      ['Mandos para revisar el prototipo. No son parte del producto ni de la consola real.', 'Mandos de prueba para recorrer el sistema como distintos usuarios y en distintos momentos.'],
      // v1.3 · HU-067 CA-08: el modo simulación de la operación en vivo (Y.sim.vivoSimulacion; encendido por defecto, como el prototipo del PO; apagado, el visor solo refleja los cambios reales)
      ['(0,L.jsxs)(`section`,{className:`pt-panel__seccion`,"aria-labelledby":`sim-reloj`', '(0,L.jsxs)(`section`,{className:`pt-panel__seccion`,"aria-labelledby":`sim-vivo`,children:[(0,L.jsx)(`h2`,{id:`sim-vivo`,className:`pt-panel__titulo`,children:`Operación en vivo`}),(0,L.jsx)(Zn,{label:`Modo simulación`,description:`Entran tickets de ejemplo y avanzan solos; aparecen la pausa y la velocidad (x1, x2).`,checked:o.vivoSimulacion!==!1,onCheckedChange:e=>E.ajustar({vivoSimulacion:e})})]}),(0,L.jsxs)(`section`,{className:`pt-panel__seccion`,"aria-labelledby":`sim-reloj`'],
      ['Cambia la persona ficticia y sus permisos.', 'Cambia de usuario y sus permisos.'],
      // v1.3 · HU-031: al avanzar el reloj también se generan los informes de las jornadas y quincenas que cierran
      ['Al avanzar, corre el job de alertas como lo haría el programado.', 'Al avanzar, corre el job de alertas y, si pasa el cierre de una jornada o de una quincena, genera sus informes, como lo haría el programado.'],
      ['ue({message:`Reloj +${t}. ${s(n)}`,tone:`info`})', 'ue({message:`Reloj +${t}. ${s(n)}${n.informes&&n.informes.length?` Informes generados: ${n.informes.join(`, `)}.`:``}`,tone:`info`})'],
      ['Prueba paletas y grises del sistema de diseño. Se recuerda en este navegador. No es parte del producto.', 'Prueba paletas y grises. Se recuerda en este navegador.'],
      ['Esta pantalla no existe en el prototipo', 'Esta pantalla no existe'],
      // v1.3 · Mi Portal: ruta propia y entradas en la navegación del cliente; la redirección del rol Cliente la deja pasar
      ['case`buses`:return(0,L.jsx)(Yi,{});', 'case`buses`:return(0,L.jsx)(Yi,{});case`portal`:return(0,L.jsx)(__Portal,{ruta:e});'],
      ['i.rol===`CLIENTE`&&t.id!==`buses`&&(location.hash=g(`buses`))', 'i.rol===`CLIENTE`&&t.id!==`buses`&&t.id!==`portal`&&(location.hash=g(`buses`))'],
      ['if(n===`CLIENTE`)return[{label:`Mi Portal`,items:[{href:g(`buses`)', 'if(n===`CLIENTE`)return[{label:`Mi Portal`,items:[{href:g(`portal`),label:`Mis tickets`,icon:(0,L.jsx)(R,{name:`list`}),current:t.id===`portal`&&t.vista!==`nuevo`},{href:g(`portal/nuevo`),label:`Nuevo ticket`,icon:(0,L.jsx)(R,{name:`plus`}),current:t.id===`portal`&&t.vista===`nuevo`},{href:g(`buses`)'],
      // v1.3 · UrbeMind es de la Etapa 2: fuera del menú y #/urbemind lleva al inicio (no se carga su pantalla)
      ['...n!==`SIN_ATENCION`&&n!==`MODERADOR_EVENTO`&&n!==`MESA_SGD`&&n!==`ADMIN_FUNCIONAL`?[{href:g(`urbemind`),label:`Integración UrbeMind`,icon:(0,L.jsx)(R,{name:`grid`}),current:t.id===`urbemind`}]:[],', ''],
      ['case`urbemind`:return(0,L.jsx)($i,{});', 'case`urbemind`:return null;'],
      // v1.3 · HU-044 CA-01: el «ticket entrante por Mi Portal» del panel de simulación entra con canal «Mi Portal» (antes, Correo)
      ['E.ticketEntrante(`CTA`)', 'E.ticketEntrante(`CTA`,`Mi Portal`)'],
      // v1.3 · HU-044 CA-03: en la Bandeja cada uno ve su área y, si es supervisor, las áreas que supervisa según el maestro local
      // de ATC (su área y las de los gestores que lo tienen como líder; scripts/hu044-areas.js). Antes, el supervisor y el
      // coordinador CX veían «Todas las áreas».
      ['ie=(e,n)=>n===`mios`?e.responsable===t.id:n===`area`?e.area===t.area:n!==`sin-asignar`||!e.responsable&&(t.rol===`SUPERVISOR`||t.rol===`COORDINADOR_CX`||e.area===t.area)', '__ar=__h44.areas(t.id),ie=(e,n)=>n===`mios`?e.responsable===t.id:n===`area`?e.area===t.area:__ar.includes(e.area)&&(n!==`sin-asignar`||!e.responsable)'],
      ['todas:`Todas las áreas`', 'todas:`Áreas que superviso`'],
      // 20-oct (b3-k): desde la Consulta 360 («Tickets previos», «Tickets en Bandeja», «Ver tickets del titular») la Bandeja abre
      // filtrada por el DNI del cliente, con el alcance más amplio que tenga el rol y con los cerrados (los tickets previos)
      ['[f,p]=(0,P.useState)(d[0]),[m,h]=(0,P.useState)(``),[v,y]=(0,P.useState)([]),[b,x]=(0,P.useState)(!1),[S,C]=(0,P.useState)(!1)', '[__bq]=(0,P.useState)(()=>{let q=globalThis.__ptBandejaBusca||null;return globalThis.__ptBandejaBusca=null,q}),[f,p]=(0,P.useState)(__bq?d.find(q=>q===`todas`||q===`area`)??d[0]:d[0]),[m,h]=(0,P.useState)(__bq??``),[v,y]=(0,P.useState)([]),[b,x]=(0,P.useState)(!1),[S,C]=(0,P.useState)(!!__bq)'],
      ['description:`Tickets activos de ${A===`todas`?`todas las áreas`:', 'description:`Tickets activos de ${A===`todas`||A===`sin-asignar`&&__ar.length!==1?(__ar.length?`las áreas que supervisas (${__h44.lista(__ar)})`:`las áreas que supervisas`):'],
      ['title:A===`sin-asignar`?`Nada sin asignar`', 'title:!__ar.length?`No supervisas ninguna área`:A===`sin-asignar`?`Nada sin asignar`'],
      ['description:A===`sin-asignar`?`Todos los tickets de tu área tienen responsable.`', 'description:!__ar.length?`Según el maestro local de ATC no eres supervisor de ninguna área: aquí no ves tickets de otras áreas.`:A===`sin-asignar`?`Todos los tickets de tu área tienen responsable.`'],
      ['i.rol===`CONTROL_ACCESO`&&t.id!==`ingreso`&&(location.hash=g(`ingreso`)),', 't.id===`urbemind`&&location.replace(g(`vivo`)),i.rol===`CONTROL_ACCESO`&&t.id!==`ingreso`&&(location.hash=g(`ingreso`)),'],
      // v1.3 · HU-040 CA-02: Simulación › «Legal pone en revisión el último caso enviado» (actualización intermedia, sin resolver)
      ['(0,L.jsx)(r,{size:`sm`,variant:`secondary`,disabled:!x,onClick:()=>{try{x&&E.legalActualiza(x.ticketId,`RESUELTO`', '(0,L.jsx)(r,{size:`sm`,variant:`secondary`,disabled:!a.sincLegal.some(q=>q.estado===`ENVIADO`),onClick:()=>{try{let q=[...a.sincLegal].reverse().find(q=>q.estado===`ENVIADO`);q&&E.legalActualiza(q.ticketId,`EN_REVISION`,null),ue({message:`Legal puso en revisión el caso ${q?.idLegal??``} en su herramienta: el ticket lo refleja.`,tone:`info`})}catch(e){ue({message:e instanceof Error?e.message:`No se pudo sincronizar.`,tone:`warning`})}},children:`Legal pone en revisión el último caso enviado`}),(0,L.jsx)(r,{size:`sm`,variant:`secondary`,disabled:!x,onClick:()=>{try{x&&E.legalActualiza(x.ticketId,`RESUELTO`'],
      // 20-oct (b3-i): #/vivo es la «Operación en Vivo» de la rama de Daniel tal cual (diseño, escena 3D, datos de ejemplo,
      // simulación, cajón y acciones): src/vivo → vivo-daniel.js (npm run build:portal) y su escena, src/three/vivo-daniel.ts.
      // Se carga bajo demanda, como Mi Portal; el chunk VistaEnVivo del PO queda sin ruta.
      ['function ca(){let e=de(),', 'const __VivoD=(0,P.lazy)(()=>import(`./vivo-daniel.js`).then(m=>({default:m.VivoDaniel})));\nfunction ca(){let e=de(),'],
      ['case`vivo`:return(0,L.jsx)(Gi,{});', 'case`vivo`:return(0,L.jsx)(__VivoD,{});'],
      // b3-j · HU-067 CA-08: apagado, la Operación en Vivo solo refleja la Bandeja (sin pausa, velocidad ni tickets de ejemplo)
      ['Entran tickets de ejemplo y avanzan solos; aparecen la pausa y la velocidad (x1, x2).', 'Entran tickets de ejemplo y avanzan solos; aparecen la pausa y la velocidad (1×, 2×, 4×). Apagado, la Operación en Vivo solo refleja la Bandeja en tiempo real.'],
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
