// Etapa 1 (plan v1.3): sin incidencias de ciudad en ATC. UrbeMind (FT-ATC-11, HU-017/018) es de la Etapa 2 y no se muestra.
// La semilla del artifact crea un ticket de incidencia de ciudad (tipo CIT) con llamadas y eventos de UrbeMind (`ks` en «comun»);
// esta función lo quita después de generarla, junto con todo lo que cuelga de él, las políticas, guías y flujos de ese tipo y el
// estado de la integración. Se filtra al final (no se cambia la generación) para que los demás ids de la semilla no se muevan.
// Se añade al final de «comun» (parchear.mjs, opción `sufijo`); el chunk la llama dentro de `js()`.
function __etapa1(e){let t=new Set(e.tickets.filter(q=>q.tipo===`CIT`).map(q=>q.id)),r={...e};
for(let[k,v]of Object.entries(e))Array.isArray(v)&&(r[k]=v.filter(q=>!(q&&typeof q==`object`&&(t.has(q.ticketId)||t.has(q.id)||q.tipo===`CIT`))));
return{...r,vinculosCiudad:[],urbe:{tickets:[],llamadas:[],eventos:[]}}}
