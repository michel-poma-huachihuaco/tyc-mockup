// HU-ATC-044 CA-03 (PLT-04 v1.3): «un ticket de un área a la que no pertenezco… no lo veo, salvo que sea supervisor de esa área».
// Áreas que una persona ve en la Bandeja = la suya + las de los gestores que la tienen como líder en el maestro local de ATC
// (`si`, el mismo dato de Mi día › Equipo y de la copia del correo de asignación). Se añade al final de «comun» (parchear.mjs,
// opción `sufijo`), así que usa sus nombres minificados: D persona por id, ui equipo de un líder, Wt áreas, Gt nombre del área,
// Xt personas, di ¿supervisor?
function __h44areas(p){let q=D(p);if(!q)return[];let s=new Set([q.area,...ui(p).map(x=>x.area)]);return Wt.filter(a=>s.has(a))}
// Supervisor que recibe las alertas de un área (HU-046 CA-03): el supervisor que la supervisa según el maestro local
function __h44supervisor(a){return Xt.find(p=>di(p)&&__h44areas(p.id).includes(a))?.id??Xt.find(di)?.id??null}
function __h44lista(as){let n=as.map(a=>Gt[a]??a);return n.length<2?n.join(``):`${n.slice(0,-1).join(`, `)} y ${n.at(-1)}`}
var __h44={areas:__h44areas,supervisor:__h44supervisor,lista:__h44lista};
export{__h44};
