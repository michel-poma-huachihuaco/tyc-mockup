// v1.3 · Paso a Eje 3 y Legal (FT-ATC-07: HU-026 CA-01/02 y HU-027 CA-01; FT-ATC-16: HU-041 CA-02). Se añade al final de
// «comun» (parchear.mjs, opción `sufijo`) y usa sus nombres minificados: B señales activas del ticket, R ticket por id,
// z reemplazar ticket. Solo declaraciones de función (se elevan): _i y po las llaman mientras se genera la semilla.

// HU-026 CA-01/02 y HU-027 CA-01: a Eje 3 no se pasa con «Cambiar estado › Escalado». El único camino es «Derivar a Eje 3»
// (So), que exige el paquete mínimo de 6 elementos y, con señal de conflicto, la nota de estado emocional. _i (el gate que
// también deshabilita la opción en «Cambiar estado») devuelve este motivo para un ticket que todavía no está en Eje 3.
function __h26escalar(e,t){return B(e,t.id).length?`Gate no compensable: con señal de conflicto, el ticket pasa a Eje 3 solo con «Derivar a Eje 3» (nota de estado emocional y paquete mínimo completo).`:`Gate no compensable: a Eje 3 se pasa solo con «Derivar a Eje 3», con el paquete mínimo de handoff completo (6 elementos).`}

// HU-041 CA-02: cuando el job alerta a Legal por la exposición, el ticket se marca como prioritario: su prioridad pasa a
// «Urgente» (la prioridad anterior queda en la alerta). No es el rayo (solo lo marca un líder, con motivo y tope del 10 %) y
// no cambia el SLA ya comprometido.
function __h41priorizar(e,t){let k=R(e,t);return k.prioridad===`URGENT`?e:z(e,{...k,prioridad:`URGENT`})}
