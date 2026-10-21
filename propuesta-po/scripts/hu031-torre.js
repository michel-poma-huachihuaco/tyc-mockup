// HU-ATC-031 (v1.3): Torre de Control › Informes. Ya no hay botones para generarlos: los genera el job al cierre de cada jornada
// y de cada quincena (scripts/hu031-informes.js). El quincenal muestra las tendencias de los KPI con el grupo de cifras del sistema
// de diseño (valor al cierre y variación respecto de la quincena anterior) y su evolución por jornada en una tabla.
// Reemplaza la función «oe» del chunk Torre; usa sus nombres minificados: Z jsx, R tarjeta, q cabecera, z cuerpo, J pares,
// U grupo de cifras, H tabla, B estado vacío, T nota; y __inf (comun: __ptInformes, importado aquí: el corte queda en el nivel
// superior del módulo, donde una declaración import es válida, y así no toca el «importa» del chunk).
import{__ptInformes as __inf}from"./comun-CVU2GQ4h.js";
function oe({datos:e}){let __p=__inf.proximos(e),__h=`${String(__inf.hasta).padStart(2,`0`)}:00`,__v=(id,v)=>__inf.txt(id,v)??`—`;
return(0,Z.jsxs)(`div`,{className:`pt-pila`,children:[
(0,Z.jsx)(`p`,{className:`pt-texto-chico`,children:`Se generan solos: el diario al cierre de cada jornada (${__h}) y el quincenal al cierre de la última jornada hábil de cada quincena. Próximos cierres: jornada del ${__inf.fecha(__p.jornada)} y quincena del ${__inf.fecha(__p.quincena)}.`}),
e.informes.length?[...e.informes].reverse().map(i=>(0,Z.jsxs)(R,{children:[(0,Z.jsx)(q,{as:`h2`,title:i.tipo===`DIARIO`?`Informe diario operativo`:`Informe quincenal analítico`,
subtitle:i.corte?i.tipo===`DIARIO`?`Generado al cierre de la jornada del ${__inf.fecha(i.corte)} (${__h})`:`Generado al cierre de la quincena, del ${__inf.fecha(i.desde)} al ${__inf.fecha(i.corte)} (${__h})`:`Generado el ${E(i.generado)}`}),
(0,Z.jsx)(z,{padding:`sm`,children:(0,Z.jsxs)(`div`,{className:`pt-pila`,children:[
i.tendencias?(0,Z.jsx)(U,{size:`sm`,items:i.tendencias.map(t=>({id:t.id,label:t.label,value:__inf.txt(t.id,t.valor),delta:__inf.delta(t)})),period:`Variación respecto del cierre de la quincena anterior (${__inf.fecha(i.anterior)}).`}):null,
(0,Z.jsx)(J,{pairs:i.datos.map(([e,t])=>[e,t])}),
i.tendencias&&i.serie.length?(0,Z.jsx)(H,{caption:`Tendencia de los KPI por jornada`,captionVisible:!0,columns:[{key:`jornada`,header:`Jornada`,render:t=>__inf.fecha(t.jornada)},{key:`sla`,header:`Cumplimiento de SLA`,align:`end`,render:t=>__v(`sla`,t.sla)},{key:`csat`,header:`CSAT`,align:`end`,render:t=>__v(`csat`,t.csat)},{key:`nps`,header:`NPS`,align:`end`,render:t=>__v(`nps`,t.nps)},{key:`adopcion`,header:`Adopción de Mi Portal`,align:`end`,render:t=>__v(`adopcion`,t.adopcion)}],rows:i.serie}):null]})})]},i.id))
:(0,Z.jsx)(B,{title:`Aún no hay informes`,description:`El diario se genera al cierre de cada jornada con tickets por eje, NPS preliminar, derivaciones y cumplimiento de SLA; el quincenal, al cierre de cada quincena, con las tendencias de los KPI y la adopción de Mi Portal.`}),
(0,Z.jsx)(T,{children:`Adopción de Mi Portal: porcentaje de los tickets nuevos de la quincena que el cliente registró en Mi Portal. Las cifras salen de las reglas locales del prototipo hasta contar con el motor de KPI.`})]})}
