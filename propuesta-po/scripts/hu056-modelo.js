// HU-ATC-056 CA-01 (PLT-04 v1.3): el ticket «Resolución de contrato» que abre la evaluación diaria se deriva al flujo de
// Cobranza y Legal. Se añade al final de «comun» (sufijo, después de hu043-modelo.js) y usa sus nombres minificados:
// D persona por id, Gt nombres de las áreas, __h43nombre y __h43responsable (HU-043).
// La evaluación (Xs) registra el ticket con el subtipo «General» (el de los flujos del PO, supuesto de la HU-043) y le aplica el
// flujo con __h43crear, igual que el alta de la consola: «Resolución de contrato · General · Cobranza», con «Verificación de la
// deuda» (Cobranza) y «Revisión legal de la causal» y «Carta de resolución» (Legal). Aquí, lo que se muestra de esa derivación.
function __h56area(t,q){let r=q.responsable&&!q.responsable.startsWith(`rol:`)?D(q.responsable)?.area:null;return Gt[r??t.flujo?.area]??r??t.flujo?.area??``}
function __h56areas(t){let a=[];for(let q of t.actividades??[]){let n=__h56area(t,q);n&&!a.includes(n)&&a.push(n)}return a.length>1?`${a.slice(0,-1).join(`, `)} y ${a.at(-1)}`:a[0]??`—`}
function __h56actividades(t){return t.flujo&&t.actividades?.length?t.actividades.map(q=>({n:q.n,nombre:q.nombre,responsable:__h43responsable(q.responsable),area:__h56area(t,q),estado:q.estado})):null}
// nota del historial del caso al abrirlo
function __h56nota(t){return t.flujo?`derivado al flujo ${__h43nombre(t.flujo)} (versión ${t.flujo.version}), con actividades de ${__h56areas(t)}.`:`sin flujo publicado para «Resolución de contrato»: el ticket queda en la bandeja de Cobranza y se avisó al administrador funcional.`}
var __h56={areas:__h56areas,actividades:__h56actividades,nota:__h56nota,nombre:__h43nombre};
export{__h56};
