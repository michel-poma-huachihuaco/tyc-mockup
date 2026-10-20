import{__h56 as __m56}from"./comun-CVU2GQ4h.js";
// HU-ATC-056 CA-01 y HU-ATC-057 (PLT-04 v1.3) en el caso de resolución (prefijo del chunk Morosidad). Usa sus nombres
// minificados: R jsx, O tarjeta, k cuerpo, F cabecera, I pares, e insignia, o alerta, n botón, N diálogo, S supuesto (va al
// panel de notas), B importe en soles; y __m56 (comun: __h56).
//
// HU-056 CA-01: el flujo al que se derivó el ticket del caso, con sus actividades, quién las atiende y de qué área.
function __FlujoCaso({ticket:__t}){if(!__t)return null;let __a=__m56.actividades(__t);
return(0,R.jsxs)(O,{children:[(0,R.jsx)(F,{as:`h2`,title:`Flujo de resolución`}),(0,R.jsx)(k,{padding:`sm`,children:__a?(0,R.jsxs)(`div`,{className:`pt-pila pt-pila--chica`,children:[
(0,R.jsx)(I,{pairs:[[`Flujo`,`${__m56.nombre(__t.flujo)} · versión ${__t.flujo.version}`],[`Derivado a`,__m56.areas(__t)]]}),
(0,R.jsx)(`ol`,{className:`pt-lista-simple`,"aria-label":`Actividades del flujo`,children:__a.map(q=>(0,R.jsxs)(`li`,{className:`pt-en-linea`,children:[(0,R.jsx)(`span`,{children:`${q.n}. ${q.nombre} · ${q.responsable} (${q.area})`}),(0,R.jsx)(e,{size:`sm`,tone:q.estado===`CERRADA`?`success`:q.estado===`EN_CURSO`?`info`:`neutral`,children:q.estado===`CERRADA`?`Cerrada`:q.estado===`EN_CURSO`?`En curso`:`Pendiente`})]},q.n))})]})
:(0,R.jsx)(`p`,{className:`pt-texto-chico`,children:`Sin flujo publicado para «Resolución de contrato»: el ticket quedó en la bandeja de Cobranza y se avisó al administrador funcional.`})})]})}
//
// HU-057: la plantilla de la alerta de cancelación que recibe el cliente (deuda, plazo para regularizar y consecuencias, según el
// requerimiento). El PLT-04 no trae el texto y el artifact tampoco: el texto, el plazo y las consecuencias quedan pendientes
// (de Legal y de las preguntas abiertas de la HU), sin redactar uno provisional. Los datos del caso sí se completan.
function __Plantilla({abierto:__ab,onCerrar:__c,caso:__q,cliente:__y}){let __p=(t)=>(0,R.jsx)(e,{tone:`warning`,size:`sm`,children:t});
return(0,R.jsx)(N,{open:__ab,onOpenChange:t=>!t&&__c(),title:`Plantilla de alerta de cancelación`,description:`Lo que recibe el cliente al abrirse el caso, por correo, WhatsApp y Mi Portal. Los datos salen del caso.`,footer:(0,R.jsx)(n,{variant:`primary`,onClick:__c,children:`Cerrar`}),
children:(0,R.jsxs)(`div`,{className:`pt-pila`,children:[
(0,R.jsx)(o,{tone:`warning`,size:`sm`,title:`Texto pendiente de Legal`,children:(0,R.jsx)(`span`,{className:`pt-alerta__texto`,children:`El texto de la alerta aún no está definido y su aprobación por Legal está pendiente: no se usa un texto provisional.`})}),
(0,R.jsx)(I,{pairs:[
[`Para`,__y?.nombre??`—`],
[`Canales`,`Correo, WhatsApp y Mi Portal. Si el correo rebota, se reintenta por WhatsApp y Mi Portal.`],
[`Lote`,__y?__q.loteId.replace(/^cli-\d+-/,`Lote `)+` · ${__q.proyecto}`:__q.proyecto],
[`Deuda vencida`,`${B(__q.deuda)} en ${__q.cuotasImpagas} cuotas vencidas e impagas`],
[`Plazo para regularizar`,__p(`Por definir`)],
[`Consecuencias`,__p(`Pendiente de Legal`)],
[`Texto de la alerta`,__p(`Pendiente de Legal`)]]}),
(0,R.jsx)(S,{children:`Preguntas abiertas de la HU: ¿qué significa «cancelación del servicio» (resolución del contrato, suspensión de beneficios u otro)?, ¿qué plazo de regularización se da al cliente? y ¿Legal aprueba el texto de la alerta?`})]})})}
