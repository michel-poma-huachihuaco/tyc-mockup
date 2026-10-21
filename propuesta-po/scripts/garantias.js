// v1.3 · Garantías postventa (FT-ATC-10: HU-034 CA-02 y HU-036 CA-01). Se añade al final de «comun» (parchear.mjs, opción
// `sufijo`) y usa sus nombres minificados: ls permiso de Postventa, os reclamo por id, ss reemplazar reclamo, cs fila de la
// trazabilidad del reclamo, Qo nombres de estado, Zo Acta de Entrega, R ticket por id, B señales activas del ticket, yo marcar
// señales (gate de FT-ATC-07), Cc canal del aviso al cliente (WhatsApp, o correo si WhatsApp está caído), j error, M error de
// validación, nl huella SHA-256 de un archivo. Solo declaraciones de función (se elevan): «us» llama a __gInformar mientras se
// genera la semilla, antes de que este sufijo se evalúe.

// HU-034 CA-02: el reclamo fuera de cobertura se informa al cliente con su motivo (aviso al cliente, como las confirmaciones de
// Buses) y queda en la trazabilidad del reclamo. Ids fijos, sin el contador, para que la semilla no mueva los demás ids.
function __gInformar(e,t,n){let r=Cc(e);return{...e,notificaciones:[...e.notificaciones,{id:`no-${t.id}`,fecha:e.ahora,para:`cliente:${n.clienteId}`,ticketId:t.ticketId,mensaje:`Reclamo ${t.codigo} no procedente por vigencia (${r}): ${t.motivoNoProcede}`}],filasGarantia:[...e.filasGarantia,{id:`fg-${t.id}-aviso`,garantiaId:t.id,fecha:e.ahora,evento:`MOTIVO_INFORMADO`,autor:`Sistema`,detalle:r}]}}

// HU-036 CA-01: un reclamo que recibe carta notarial se deriva a Eje 3 sin resolverse en Postventa. Reutiliza el gate de
// FT-ATC-07: si el reclamo no tenía ticket, se vincula el ticket de garantía del cliente; en el ticket se marca la señal «Carta
// notarial». Desde ahí «as» bloquea la resolución del reclamo y la derivación sale del ticket con el paquete mínimo de handoff.
function __gCarta(e,t,n,r){ls(e,r,`registrar la carta notarial`);let i=os(e,t);if(i.estado!==`UNDER_REVIEW`&&i.estado!==`APPROVED`)throw new j(409,`estado-invalido`,`Un reclamo «${Qo[i.estado]}» no se deriva a Eje 3.`);let a=i.ticketId||n;if(!a)throw M([{campo:`ticket`,mensaje:`Elige el ticket de garantía del cliente: la derivación a Eje 3 sale del ticket.`}]);let o=R(e,a);if(!i.ticketId&&o.clienteId!==Zo(i.entregaId)?.clienteId)throw M([{campo:`ticket`,mensaje:`El ticket tiene que ser del mismo cliente del reclamo.`}]);if(o.eje===3)throw new j(409,`ya-en-eje-3`,`El ticket ${o.numero} ya está en Eje 3.`);if(B(e,a).includes(`CARTA_NOTARIAL`))throw new j(409,`ya-marcada`,`La carta notarial ya está marcada en el ticket ${o.numero}.`);let s=i.ticketId?e:cs(ss(e,{...i,ticketId:a}),t,`TICKET_VINCULADO`,r,o.numero);return cs(yo(s,a,[`CARTA_NOTARIAL`],r),t,`CARTA_NOTARIAL`,r,`Señal de conflicto en ${o.numero}: se deriva a Eje 3 desde el ticket`)}
export{nl as __ptHuella};
