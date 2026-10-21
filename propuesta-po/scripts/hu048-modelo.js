// HU-ATC-048 (v1.3) · CA-01: criterios de cierre PENDIENTES del ticket, los de la guía de solución vigente de su tipo (HU-047),
// no una lista fija por tipo. La IA del prototipo es simulada: estas reglas locales hacen de «modelo» y solo leen el ticket.
//  · «… respuesta al cliente …»          cumplido si hay un mensaje al cliente en el ciclo actual del ticket;
//  · «… Libro de Reclamaciones / asiento» cumplido si el ticket tiene su asiento registrado;
//  · «… confirma …»                       cumplido cuando el ticket está cerrado (el cierre registra esa confirmación);
//  · cualquier otro criterio de la guía queda pendiente: la IA no lo puede comprobar y lo decide el gestor de tickets.
// Sufijo del chunk «comun»: $r es la guía vigente del tipo. Lo usan el asistente flotante (shell) y el detalle del ticket.
var __ptIA={criterios(e,t){let g=$r(e,t.tipo);if(!g)return{guia:null,criterios:[],pendientes:[]};
let r=e.interacciones.some(q=>q.ticketId===t.id&&q.tipo===`mensaje`&&(!t.inicioCiclo||q.fecha>=t.inicioCiclo)),a=e.asientos.some(q=>q.ticketId===t.id),c=t.estado===`CLOSED`,
k=g.criterios.map(x=>/libro de reclamaciones|asiento/i.test(x)?{texto:x,regla:!0,cumplido:a}:/confirm/i.test(x)?{texto:x,regla:!0,cumplido:c}:/respuesta/i.test(x)?{texto:x,regla:!0,cumplido:r}:{texto:x,regla:!1,cumplido:!1});
return{guia:g.version,criterios:k,pendientes:k.filter(x=>!x.cumplido).map(x=>x.texto)}}};
export{__ptIA};
