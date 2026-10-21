// v1.3 · Paso a Eje 3 y Legal en el detalle del ticket (prefijo del chunk DetalleTicket): HU-027 CA-03 y HU-040 CA-02.
// Usa sus nombres minificados: Q jsx, m alerta, e insignia, C nombre de persona, M fecha corta.

// HU-027 CA-03: el aviso que registra el job (HANDOFF_SIN_CONFIRMAR, para la jefatura de Legal) se ve en el ticket. Antes de
// que corra el control, el handoff solo figura como pendiente (con los días hábiles que lleva).
function __AvisoHandoff({ticket:__t,datos:__d,dias:__h}){let __a=__d.avisos.filter(q=>q.ticketId===__t.id&&q.tipo===`HANDOFF_SIN_CONFIRMAR`).at(-1);
return __a?(0,Q.jsx)(m,{tone:`danger`,size:`sm`,title:`Sin confirmar: jefatura de Legal avisada`,children:(0,Q.jsx)(`span`,{className:`pt-alerta__texto`,children:`${__a.mensaje} Se avisó a ${C(__a.destinatario)} (${M(__a.fecha)}).`})})
:(0,Q.jsx)(e,{tone:__h>=1?`danger`:`warning`,size:`sm`,dot:!0,children:__h>=1?`Sin confirmar hace ${__h} ${__h===1?`día hábil`:`días hábiles`}`:`Pendiente de confirmar`})}

// HU-040: la pestaña «Legal» existe cuando el ticket tiene caso en la herramienta de Legal
function __h40caso(__d,__id){return __d.sincLegal.some(q=>q.ticketId===__id)}
