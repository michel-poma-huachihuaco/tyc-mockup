// HU-ATC-048 (v1.3) en el detalle del ticket (prefijo del chunk DetalleTicket).
//  · CA-01: al ir a cerrar (elegir «Resuelto» o «Cerrado» en «Cambiar estado») el asistente actúa sin que se lo pidan: el diálogo
//    muestra los criterios de cierre pendientes de la guía del ticket y, al confirmar o con «Revisar con el asistente», el robot
//    flotante se abre con la respuesta sugerida para aceptarla, editarla o descartarla (evento «pt:asistente», scripts/shell.js).
//  · CA-02: el ticket vuelve a mostrar el registro de decisiones (aceptada, editada o descartada), sin texto ni datos personales.
// Nombres minificados del chunk: Q jsx, U tarjeta, W cuerpo, J cabecera, G estado vacío, m aviso, r botón, e insignia,
// C nombre de persona, M fecha corta; y __ia (comun: __ptIA).
import{__ptIA as __ia}from"./comun-CVU2GQ4h.js";
function __iaCierre(__t,__d){dispatchEvent(new CustomEvent(`pt:asistente`,{detail:{accion:`cierre`,ticketId:__t,destino:__d}}))}
function __CierreIA({ticket:__t,datos:__d,onRevisar:__f}){let __c=__ia.criterios(__d,__t);
return(0,Q.jsx)(m,{tone:__c.pendientes.length?`warning`:`info`,size:`sm`,title:`Asistente de IA: antes de cerrar`,actions:(0,Q.jsx)(r,{size:`sm`,variant:`secondary`,onClick:__f,children:`Revisar con el asistente`}),
children:(0,Q.jsxs)(`div`,{className:`pt-alerta__texto`,children:[__c.guia==null?`Este tipo de ticket no tiene guía publicada: no hay criterios de cierre que revisar.`:__c.pendientes.length?`Criterios de cierre pendientes según la guía (versión ${__c.guia}):`:`Se cumplen los criterios de cierre de la guía (versión ${__c.guia}).`,
__c.pendientes.length?(0,Q.jsx)(`ul`,{className:`pt-lista-simple`,children:__c.pendientes.map(x=>(0,Q.jsx)(`li`,{children:x},x))}):` `,
`Al confirmar, el asistente te propone la respuesta para el cliente: la aceptas, la editas o la descartas.`]})})}
function __DecisionesIA({ticket:__t,datos:__d}){let __l=__d.decisionesIA.filter(q=>q.ticketId===__t.id),__n={ACEPTADA:[`Aceptada`,`success`],EDITADA:[`Editada`,`info`],DESCARTADA:[`Descartada`,`neutral`]};
return(0,Q.jsxs)(U,{children:[(0,Q.jsx)(J,{as:`h2`,title:`Asistente de IA`,subtitle:`Decisiones sobre sus sugerencias`}),(0,Q.jsx)(W,{padding:`sm`,children:__l.length?(0,Q.jsxs)(`div`,{className:`pt-pila pt-pila--chica`,children:[
(0,Q.jsx)(`ul`,{className:`pt-lista-simple pt-texto-chico`,"aria-label":`Registro de decisiones sobre la IA`,children:[...__l].reverse().map(q=>(0,Q.jsxs)(`li`,{className:`pt-en-linea`,children:[(0,Q.jsx)(e,{tone:__n[q.decision][1],size:`sm`,children:__n[q.decision][0]}),`${C(q.autor)} · ${M(q.fecha)}`]},q.id))}),
(0,Q.jsx)(`p`,{className:`pt-texto-chico`,children:`Se registra la decisión, sin el texto de la sugerencia ni datos personales.`})]})
:(0,Q.jsx)(G,{size:`compact`,title:`Sin decisiones registradas`,description:`Cuando aceptes, edites o descartes una sugerencia del asistente, quedará registrada aquí, sin el texto ni datos personales.`})})]})}
