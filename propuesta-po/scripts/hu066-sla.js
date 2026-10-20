// HU-ATC-066 (Mi Portal · PLT-04 v1.3) CA-01 y CA-04. Se añade al final de «comun» (parchear.mjs, opción `sufijo`, después de
// nucleo-portal.js), así que usa sus nombres minificados: V cambiar estado, qn horas hábiles entre dos fechas, Kn sumar horas
// hábiles, Jn fin del n-ésimo día hábil, L evento, gi auditoría, F permiso, P persona de un id, jr ¿administrador funcional?,
// M error de validación, Lc API de la consola, Z transacción, Q «sin resultado», $ persona de la sesión, __ptNucleo.
//
// CA-01 · Pausa del SLA en «pendiente del cliente». Al entrar en PENDING_CUSTOMER el ticket anota `pausaSla` (desde cuándo).
// Al salir (el cliente responde en Mi Portal y vuelve a «en atención», o el gestor lo mueve) los vencimientos que aún corren
// —la resolución del ciclo vigente y, si todavía no hubo, la 1.ª respuesta— se corren las horas hábiles que duró la espera, y
// la pausa queda en `pausasSla` (desde, hasta, horas). Mientras dura, el nivel de SLA (wi) y el job de alertas (Fi) miden contra
// el vencimiento corrido por la espera en curso: un ticket en espera del cliente ni vence ni entra en riesgo.
// Decisión del 20-oct (DECISIONES §5.9): la actividad en curso del flujo (HU-043) también se corre lo que duró la espera.
// La semilla no mueve ids: las pausas solo cambian campos del ticket (sin I()).
function __h66pausaH(t,a){return t.estado===`PENDING_CUSTOMER`&&t.pausaSla?qn(t.pausaSla,a):0}
function __h66mover(f,h){return h>0?Kn(f,h):f}
// o: el ticket antes del cambio de estado; u: el ticket después; l: ahora (lo llama V antes de guardar)
function __h66pausa(o,u,l){if(u.estado===`PENDING_CUSTOMER`)return o.estado===`PENDING_CUSTOMER`?u:{...u,pausaSla:l};if(o.estado!==`PENDING_CUSTOMER`||!o.pausaSla)return u;let h=qn(o.pausaSla,l),v={...u,pausaSla:null,pausasSla:[...o.pausasSla??[],{desde:o.pausaSla,hasta:l,horas:h}]};if(h>0){v.venceReapertura?v.venceReapertura=Kn(v.venceReapertura,h):v.venceResolucion=Kn(v.venceResolucion,h);o.primeraRespuesta||(v.venceRespuesta=Kn(v.venceRespuesta,h)),v.actividades&&(v.actividades=v.actividades.map(q=>q.estado===`EN_CURSO`&&q.vence?{...q,vence:Kn(q.vence,h)}:q))}return v}
//
// CA-04 · Cierre automático de un ticket resuelto sin respuesta del cliente. Lo hace el job del sistema (el mismo que corre
// «Ejecutar el job ahora» y cada avance del reloj simulado): cierra los tickets «Resuelto» cuyo plazo de confirmación terminó
// (fin del n-ésimo día hábil desde la resolución) y el cliente recibe el aviso del cambio a «Cerrado» (Mi Portal lo deriva de la
// bitácora). No corre al generar la semilla. Los días hábiles los configura el administrador funcional (Configuración › Cierre
// automático); el valor inicial, 5, es un supuesto del equipo (pregunta abierta del PLT-04).
var __H66_DIAS=5;
function __h66dias(e){return e.parametros?.diasConfirmacion??__H66_DIAS}
function __h66limite(e,t){return t.estado===`RESOLVED`&&t.ultimaResolucion?Jn(t.ultimaResolucion,__h66dias(e)):null}
function __h66fijarDias(e,n,a){F(jr(P(a)),`configurar el cierre automático`);if(!Number.isInteger(n)||n<1)throw M([{campo:`dias`,mensaje:`Escribe un número entero de días hábiles, desde 1.`}]);let v=__h66dias(e);if(n===v)return e;return gi({...e,parametros:{...e.parametros,diasConfirmacion:n,diasConfirmacionCambio:{fecha:e.ahora,autor:a,antes:v}}},a,`configurar el cierre automático`,`Días hábiles para que el cliente confirme la solución: ${v} → ${n}.`)}
// la regla para un ticket (sin rol: lo hace el sistema; V valida la transición y el gate de conflicto)
function __h66cerrarUno(e,t){let d=__h66dias(e);return L(V(e,t,`CLOSED`,null,`Cierre automático: sin respuesta del cliente en ${d} días hábiles`),`portal_cierre`,{resultado:`automatico`,dias:d})}
function __h66cerrarVencidos(e){let t=e,n=0,o=0;for(let k of e.tickets){let l=__h66limite(e,k);if(!l||e.ahora<=l)continue;try{t=__h66cerrarUno(t,k.id),n++}catch{o++}}return[t,{cerrados:n,omitidos:o,dias:__h66dias(e)}]}
Lc.fijarDiasConfirmacion=e=>Z(`configurar el cierre automático`,t=>Q(__h66fijarDias(t,e,$())));
Object.assign(__ptNucleo,{diasConfirmacion:__h66dias,limiteConfirmacion:__h66limite,cerrarSinRespuesta:__h66cerrarUno});
var __h66={dias:__h66dias,limite:__h66limite,pausaH:__h66pausaH,cerrarVencidos:__h66cerrarVencidos};
export{__h66};
