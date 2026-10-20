(0,O.useEffect)(()=>{let e=xe.current,t=be.current;if(!e||!t)return;
let __zp=__zonasPermitidas(c),__zv=z=>!__zp||__zp.has(z.k),
r={teal:R(`primary-700`),teal2:R(`primary-500`),orange:R(`secondary-400`),ok:R(`feedback-success-border`),warn:R(`feedback-warning-border`),bad:R(`feedback-danger-border`),line:R(`border-subtle`),muted:R(`fg-muted`),texto:R(`fg-default`),superficie:R(`bg-surface`),suelo:R(`bg-surface-sunken`),lienzo:R(`bg-canvas`)},
__m=new Map,__a=e=>{let t=__m.get(e)??R(e);return __m.set(e,t),t},
__obtener=()=>{let e=U.current,
i=new Set(e.tickets.filter(e=>L(e)===`salida`).sort((e,t)=>(t.ultimaResolucion?.getTime()??0)-(e.ultimaResolucion?.getTime()??0)).slice(0,8).map(e=>e.id)),
c=e.tickets.filter(e=>w.includes(e.estado)||i.has(e.id)).map(t=>({t,zona:I(e,t),etapa:L(t)})),
f=(e,t)=>c.filter(n=>n.zona===e&&n.etapa===t).length,
__n=t=>S(t.t,e.ahora).nivel,__v=t=>__n(t)===`vencido`||__n(t)===`fuera-de-plazo`;
return{bandeja:c.filter(e=>e.etapa===`bandeja`).length,escalados:e.escalamientos.length,
comite:c.filter(t=>t.etapa!==`salida`&&__v(t)&&e.alertas.some(q=>q.ticketId===t.t.id&&q.ciclo===t.t.reaperturas)).map(t=>({id:t.t.id,numero:t.t.numero})),
zonas:A.filter(__zv).map(z=>({k:z.k,cola:f(z.k,`cola`),atencion:f(z.k,`atencion`),riesgo:c.some(t=>t.zona===z.k&&t.etapa!==`salida`&&__v(t)),gente:z.gente.slice(0,3).map(g=>({id:g,nombre:p(g)||g,ocupado:c.some(t=>t.zona===z.k&&t.etapa===`atencion`&&t.t.responsable===g)})),ocupados:z.gente.filter(g=>c.some(t=>t.zona===z.k&&t.etapa===`atencion`&&t.t.responsable===g)).length,total:z.gente.length})),
tickets:c.map(t=>({id:t.t.id,numero:t.t.numero,tipo:t.t.tipo,gate:F(t.t),zona:t.zona,etapa:t.etapa,sla:t.etapa===`salida`?`ok`:__v(t)?`vencido`:__n(t)===`en-riesgo`?`riesgo`:`ok`,rayo:re(e,t.t.id),sel:Se.current===t.t.id,resp:t.t.responsable}))}};
try{return __mv({canvas:e,host:t,cols:r,color:__a,reducido:l,est:{zonas:A.filter(__zv).map(z=>({k:z.k,n:z.n,color:__a(z.color)})),compuertas:j.map(g=>({k:g.k,n:g.n,sigla:g.sigla,color:__a(g.color)})),tipos:Object.entries(__COLOR_TIPO).map(([k0,q])=>({k:k0,color:__a(q)}))},hits:W,obtener:__obtener,onZona:q=>{pe(null);__sz(q)}})}catch(__e){console.error(__e&&__e.stack||__e)}},[l,ve,c]);
