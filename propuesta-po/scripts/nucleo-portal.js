// Núcleo que el chunk «comun» le presta a Mi Portal (src/portal, compilado en artefacto/assets/mi-portal.js).
// Se añade al final del chunk (parchear.mjs, opción `sufijo`), así que usa sus nombres minificados:
// Y estado, X publicar estado, Z transacción con latencia simulada y auditoría de errores, $ persona de la sesión,
// I ids, L evento de analítica, gi auditoría, R ticket por id, z reemplazar ticket, V cambiar estado (sin rol = sistema),
// Si SLA congelado, Pr flujo del ticket, Zr asignar por el flujo, Mr flujo vigente del tipo, Kn horas hábiles, Jn días hábiles,
// Ci fecha de compromiso, wi nivel de SLA, Dn empresa, j error del prototipo, M error de validación, bi detector de PII.
// Mi Portal no reimplementa reglas: compone estas mismas funciones (las que usa la consola).
var __ptNucleo={
tx:(e,t)=>Z(e,t),
aplicar:e=>{X({...Y,datos:e(Y.datos)})},
datos:()=>Y.datos,
sim:()=>Y.sim,
personaId:()=>$(),
id:I,evento:L,auditar:gi,ticket:R,reemplazar:z,cambiarEstado:V,sla:Si,registrarFlujo:Pr,asignarPorFlujo:Zr,flujo:Mr,
sumarHorasHabiles:Kn,sumarDiasHabiles:Jn,compromiso:Ci,nivelSla:wi,empresa:Dn,
error:(e,t,n,r)=>new j(e,t,n,r),validacion:M,pii:bi};
export{__ptNucleo};
