// HU-ATC-055 (PLT-04 v1.3, UX «Plantilla de correo de asignación»): el cuerpo del correo que recibe el gestor de tickets con
// copia a su líder. Parte de los correos que ya deriva Mi día de las filas de asignación (fi: para, copia, asunto, tickets y si es
// el resumen de una reasignación masiva) y les pone N.º, tipo, prioridad y vencimiento del SLA de cada ticket (RF-SVC-055).
// Sin datos del cliente (DLP): solo el número y el enlace al ticket. Se añade al final de «comun» (sufijo): Qt nombre de persona,
// Tn nombre del tipo, Ut prioridades, wi nivel y vencimiento del SLA.
function __h55correo(e,c){let p=Qt(c.para);return{para:p,saludo:p.split(` `)[0],cc:c.cc?Qt(c.cc):null,asunto:c.asunto,fecha:c.fecha,masivo:c.masivo,
filas:c.tickets.map(n=>{let t=e.tickets.find(q=>q.numero===n);if(!t)return{id:null,numero:n,tipo:`—`,prioridad:`—`,vence:null,hito:null};let s=wi(t,e.ahora);return{id:t.id,numero:n,tipo:Tn(t.tipo),prioridad:Ut.find(q=>q.id===t.prioridad)?.nombre??t.prioridad,vence:s.vence,hito:s.hito}})}}
var __h55={correo:__h55correo};
export{__h55};
