// v1.3 · HU-027 CA-03 (prefijo del chunk Alertas): constancia de los avisos «handoff sin confirmar» que el job manda a la
// jefatura del eje destino (Legal) cuando un handoff a Eje 3 pasa 1 día hábil sin confirmar.
// Usa sus nombres minificados: D jsx, v tarjeta, y cuerpo, T cabecera, x tabla, b estado vacío, c nombre de persona, m fecha,
// _ navegar, a ruta; y de «comun» __Tag (insignia) y __hof (último handoff del ticket).
function __AvisosHandoff({datos:__d,cargando:__c}){let __f=[...__d.avisos].filter(q=>q.tipo===`HANDOFF_SIN_CONFIRMAR`).sort((p,q)=>q.fecha.getTime()-p.fecha.getTime()),
__n=q=>__d.tickets.find(t=>t.id===q)?.numero??q,
__k=[{key:`ticket`,header:`Ticket`,width:`8.5rem`,renderCell:q=>(0,D.jsx)(`button`,{type:`button`,tabIndex:-1,className:`pt-enlace-celda`,onClick:()=>_(a(`ticket/${q.ticketId}`)),children:__n(q.ticketId)})},
{key:`fecha`,header:`Fecha del aviso`,width:`10rem`,renderCell:q=>m(q.fecha)},
{key:`destinatario`,header:`Destinatario`,width:`12rem`,renderCell:q=>`${c(q.destinatario)} (jefatura de Legal)`},
{key:`handoff`,header:`Handoff`,width:`13rem`,renderCell:q=>{let h=__hof(__d,q.ticketId);return h&&h.confirmado?(0,D.jsxs)(__Tag,{tone:`success`,size:`sm`,children:[`Confirmado `,m(h.confirmado.fecha)]}):(0,D.jsx)(__Tag,{tone:`danger`,size:`sm`,children:`Sin confirmar`})}}];
return(0,D.jsxs)(v,{children:[(0,D.jsx)(T,{as:`h2`,title:`Handoffs sin confirmar`,subtitle:`Aviso a la jefatura del eje destino cuando un handoff a Eje 3 pasa 1 día hábil sin confirmar.`}),(0,D.jsx)(y,{children:(0,D.jsx)(x,{caption:`Avisos de handoff sin confirmar`,columns:__k,rows:__c?[]:__f,getRowId:q=>q.id,loading:__c,emptyState:(0,D.jsx)(b,{size:`compact`,title:`Sin avisos de handoff`,description:`El job avisa cuando un handoff a Eje 3 lleva más de 1 día hábil sin confirmar.`})})})]})}
