// Operación en vivo (20-oct, pedido del PO para la presentación: las mejoras del visor de la rama de Daniel). Ayudas de modelo
// para los controles de simulación y la ficha del ticket del chunk VistaEnVivo, con las mismas reglas del mockup. Se añade al
// final de «comun» (sufijo) y usa sus nombres minificados: Y estado, X publicar, Z transacción, $ persona de la sesión, Di alta
// del ticket, Zr asignación por el flujo (HU-043, que aplica la carga de la HU-046), R ticket por id, Xt maestro de personas,
// Gr gestores, qr disponibles, Kr carga ponderada (las del «Balancear la carga»), cr redistribuir (REASSIGNMENT_CARGA),
// wi nivel y vencimiento del SLA, Kn sumar horas hábiles y j error. Nada de esto corre al generar la semilla (no mueve ids).
// entrante: el «ticket entrante» de Qr con un resumen de ejemplo según el canal y, si se pide, la razón social del filtro.
function __vivoEntrante(tipo,canal,clienteId,resumen,empresaId){let[i,a]=Di(Y.datos,{canal,clienteId,empresaId:empresaId||`AIN`,linea:`Lotes urbanos`,establecimiento:``,tipo,subtipo:`General`,prioridad:`MEDIUM`,resumen,descripcion:`Ingresó por ${canal} y pasó por la bandeja orquestadora.`},`p-dlazo`),[o,s]=Zr({...i,tickets:i.tickets.map(e=>e.id===a.id?{...e,responsable:null}:e)},a.id);X({...Y,datos:o});return{id:a.id,numero:a.numero,resultado:s}}
// menorCarga: el gestor disponible del área del ticket con menos carga ponderada (sin contar a su responsable actual)
function __vivoMenorCarga(e,id){let t=R(e,id);return Xt.filter(p=>Gr(p)&&p.area===t.area&&p.id!==t.responsable&&qr(e,p.id)).sort((x,y)=>Kr(e,x.id)-Kr(e,y.id))[0]?.id??null}
// reasignar: «Reasignar a menor carga» de un ticket (cr: solo supervisor o coordinación CX, misma área), con su nota
function __vivoReasignar(id){return Z(`reasignar por menor carga`,e=>{let d=__vivoMenorCarga(e,id);if(!d)throw new j(409,`sin-disponibles`,`No hay otro gestor disponible en el área del ticket: sigue con su responsable.`);let n=cr(e,id,d,$()),f=n.filasAsignacion.at(-1);return[{...n,filasAsignacion:[...n.filasAsignacion.slice(0,-1),{...f,nota:`Reasignado a menor carga desde la operación en vivo`}]},d]})}
// horas: horas hábiles que faltan para que venza el SLA vigente del ticket (0 si ya venció; null si no vence en 60 días hábiles)
function __vivoHoras(e,id){let t=R(e,id),s=wi(t,e.ahora);if(s.nivel===`vencido`||s.nivel===`fuera-de-plazo`)return 0;for(let h=1;h<=540;h++)if(Kn(e.ahora,h)>s.vence)return h;return null}
var __vivo={entrante:__vivoEntrante,menorCarga:__vivoMenorCarga,reasignar:__vivoReasignar,horas:__vivoHoras};
export{__vivo};
