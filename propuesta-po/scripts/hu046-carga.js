// HU-ATC-046 CA-01/02/03 (PLT-04 v1.3) al entrar un ticket nuevo: si el responsable que le da el flujo (HU-043) supera el
// límite de carga, el ticket va al gestor disponible del área del flujo con menos tickets activos ponderados y la fila de
// asignación lleva el motivo REASSIGNMENT_CARGA; sin otro gestor disponible queda en la cola del área y se alerta al supervisor.
// Es la misma regla del «Balancear la carga» de Mi día (Xr): límite 12 puntos, carga = Kr (baja 1, media 2, alta 3, urgente 4),
// gestores = Gr, disponible = qr; no se mueve un ticket con rayo (Rr), en Eje 3 o con interacción en curso (Jr).
// La habilidad (RN-SVC-033) no se usa: el PLT-04 no la define y el maestro local no la trae.
// Lo llama __h43aplicar (scripts/hu043-modelo.js), el orquestador por el que pasan la consola, Mi Portal y el «ticket entrante».
// Se añade al final de «comun» (sufijo); Pr/Di no lo llaman, así que la semilla no cambia.
function __h46entrada(e,a,r,n){if(!r||n.eje===3||Rr(e,n.id)||Jr(e,n))return null;let c=Kr(e,r);if(c<=12)return null;let o=Xt.filter(p=>Gr(p)&&p.area===a&&p.id!==r&&qr(e,p.id)).sort((x,y)=>Kr(e,x.id)-Kr(e,y.id))[0]?.id??null;return{de:r,a:o,carga:c}}
function __h46nota(b,f){return`Por carga: el flujo lo daba a ${Qt(b.de)}, con ${b.carga} puntos (límite 12)${b.a?``:`, y no hay otro gestor disponible`}.`}
// CA-03: alerta al supervisor del área (maestro local) y evento de analítica sin datos personales
function __h46avisar(e,n,a,b){let d=e;if(!b.a){let i;[i,d]=I(d,`ops`);d={...d,alertasOps:[...d.alertasOps,{id:i,fecha:e.ahora,destinatario:__h44supervisor(a),tipo:`SIN_DISPONIBLES`,ticketId:n.id,detalle:`No hay gestores disponibles en el área ${Gt[a]??a}: ${n.numero} quedó en su cola (su responsable supera el límite de carga).`}]}}return L(d,`reasignacion_carga`,{area:a,origen:`entrada`,a_cola:!b.a})}
var __h46={entrada:__h46entrada,limite:12};
export{__h46};
