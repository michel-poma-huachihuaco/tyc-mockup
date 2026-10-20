import{__h66 as __c66}from"./comun-CVU2GQ4h.js";
// HU-ATC-066 CA-04 · Configuración › Cierre automático (prefijo del chunk Configuracion): el administrador funcional configura
// los días hábiles que se espera la confirmación del cliente antes de que el job cierre el ticket resuelto. Usa los nombres
// minificados del chunk: B React, V jsx, j tarjeta, M cuerpo, R cabecera, D formulario, A número (con su etiqueta), n botón,
// S error de acción, w acción en curso, x errores por campo, a API, p aviso, y fecha corta, d nombre de persona, v supuesto (panel de
// notas); y __c66 (comun: __h66).
function __Cierre({datos:__d}){let __dias=__c66.dias(__d),[__v,__sv]=(0,B.useState)(__dias),__x=w(),__g=x(__x.error),__k=__d.parametros?.diasConfirmacionCambio??null;
(0,B.useEffect)(()=>{__sv(__dias)},[__dias]);
let __guardar=async()=>{await __x.ejecutar(async()=>(await a.fijarDiasConfirmacion(__v),!0))&&p({message:`Guardado: un ticket resuelto se cierra solo a los ${__v} días hábiles sin respuesta del cliente.`,tone:`success`})};
return(0,V.jsxs)(j,{children:[(0,V.jsx)(R,{as:`h2`,title:`Cierre automático de tickets resueltos`,subtitle:`Si el cliente no confirma ni rechaza la solución en Mi Portal, el job del sistema cierra el ticket al cumplirse el plazo y le avisa.`}),
(0,V.jsx)(M,{children:(0,V.jsxs)(D,{id:`cfg-cierre`,onSubmit:__guardar,errors:__g.dias?{"cfg-cierre-dias":__g.dias}:{},children:[
(0,V.jsx)(A,{label:`Días hábiles para que el cliente confirme la solución`,id:`cfg-cierre-dias`,error:__g.dias,value:__v,onValueChange:e=>__sv(e),min:1,step:1,unit:`días`}),
(0,V.jsx)(`p`,{className:`pt-texto-chico`,children:`Se cuentan desde que el ticket pasa a «Resuelto». Rige desde la próxima corrida del job.`}),
__k?(0,V.jsx)(`p`,{className:`pt-texto-chico`,children:`Último cambio: ${y(__k.fecha)} · ${d(__k.autor)} (antes, ${__k.antes} días).`}):null,
__x.error&&!__g.dias?(0,V.jsx)(S,{error:__x.error}):null,
(0,V.jsx)(`div`,{className:`pt-acciones pt-acciones--inicio`,children:(0,V.jsx)(n,{type:`submit`,variant:`primary`,loading:__x.enCurso,disabled:__v===__dias,children:`Guardar`})}),
(0,V.jsx)(v,{children:`El valor inicial, 5 días hábiles, es un supuesto del equipo: cuántos días se espera la confirmación es una pregunta abierta del PLT-04.`})]})})]})}
