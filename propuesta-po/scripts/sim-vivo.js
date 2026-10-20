enBandeja(e=`CTA`,t=`Correo`,n=`cli-038`,r=`Consulta recibida en atención multicanal`){
  let d=Y.datos,emp=[`AIN`,`ALT`,`APV`,`ACS`][d.contador%4],pri=[`MEDIUM`,`HIGH`,`LOW`,`URGENT`][d.contador%4],
  [i,a]=Di(d,{canal:t,clienteId:n,empresaId:emp,linea:`Lotes urbanos`,establecimiento:``,tipo:e,prioridad:pri,resumen:r,descripcion:`Ingresó por canal automatizado hacia la bandeja orquestadora.`},`p-dlazo`),
  o={...i,tickets:i.tickets.map(q=>q.id===a.id?{...q,responsable:null,area:`ATC`,eje:1}:q)};
  return X({...Y,datos:o}),{id:a.id,numero:a.numero}
},
pasoVivo(K,paso){
  let d=Y.datos,mov=new Set,
  GENTE={eje1:[`p-crojas`,`p-dlazo`,`p-gnunez`],cob:[`p-rsalazar`,`p-mpaz`,`p-jccama`],libro:[`p-pvilchez`],legal:[`p-vortiz`,`p-rcastillo`],post:[`p-lccahuana`,`p-omedina`],proy:[`p-nquispe`,`p-jmarin`]},
  AREA_Z={eje1:`ATC`,cob:`COBRANZA`,libro:`LEGAL`,legal:`LEGAL`,post:`POSTVENTA`,proy:`ADMINISTRACION`},
  zonaDe=(s,t)=>t.eje===3?`legal`:((t.tipo===`QUE`||t.tipo===`REC`)&&Bi(s,t.id))||t.responsable===`p-pvilchez`?`libro`:t.area===`LEGAL`?`legal`:t.tipo===`GAR`||t.area===`POSTVENTA`?`post`:t.tipo===`ING`||t.tipo===`RSV`||t.area===`ADMINISTRACION`?`proy`:t.area===`COBRANZA`?`cob`:`eje1`,
  elegir=(s,z)=>{let ids=GENTE[z]??GENTE.eje1,disp=ids.filter(id=>qr(s,id)),l=disp.length?disp:ids;return[...l].sort((a,b)=>Kr(s,a)-Kr(s,b))[0]??ids[0]},
  asig=(s,t,zn,mot,nota,est)=>{let resp=elegir(s,zn),ar=AREA_Z[zn]??`ATC`,ej=zn===`legal`?3:ar===`ATC`?1:2,fid;[fid,s]=I(s,`fa`);let u={...t,area:ar,responsable:resp,eje:ej,...est?{estado:est}:{}};return s=z(s,u),{...s,filasAsignacion:[...s.filasAsignacion,{id:fid,ticketId:t.id,fecha:s.ahora,deArea:t.area,deResponsable:t.responsable,aArea:ar,aResponsable:resp,motivo:mot,nota,autor:`p-gnunez`}]}},
  numId=id=>[...id].reduce((a,c)=>a+c.charCodeAt(0),0),
  activos0=d.tickets.filter(t=>E.includes(t.estado)).length,
  topePaso=activos0>18?3:activos0>13?2:1,
  topeAvance=activos0>16?3:2;

  // 1) RESOLVED -> CLOSED (confirmación en Mi Portal)
  let cerrados=0;
  for(let t of d.tickets){
    if(t.estado!==`RESOLVED`)continue;
    let ed=K.get(`res:`+t.id)??0;
    if(ed>=2&&cerrados<topePaso&&!_i(d,t,`CLOSED`)){
      try{
        d=V(d,t.id,`CLOSED`,t.responsable||`p-crojas`,`El cliente confirmó la solución en Mi Portal.`);
        let enc=d.encuestas.find(q=>q.ticketId===t.id&&!q.respuesta);
        if(enc&&(numId(t.id)+paso)%2===0){let cb=[[5,6,10],[4,5,9],[5,7,10],[4,6,8],[3,4,6]][(numId(t.id)+paso)%5];d=rr(d,enc.id,cb[0],cb[1],cb[2])}
        mov.add(t.id);cerrados++;continue
      }catch{}
    }
    K.set(`res:`+t.id,ed+1)
  }

  // 2) IN_PROGRESS / ESCALATED -> derivación a siguiente área o RESOLVED
  let derivs=0,resueltos=0,zonasRes=new Map,
  enAtencion=[...d.tickets].filter(t=>t.estado===`IN_PROGRESS`||t.estado===`ESCALATED`).sort((a,b)=>(K.get(b.id)??0)-(K.get(a.id)??0));
  for(let t of enAtencion){
    if(mov.has(t.id))continue;
    let zn=zonaDe(d,t),ids=GENTE[zn]??GENTE.eje1;
    if(!t.responsable||!ids.includes(t.responsable)){let r=elegir(d,zn);t={...t,responsable:r};d=z(d,t)}
    let ed=K.get(t.id)??0;
    // 2a) Señal de conflicto activa en Eje 1/2 -> derivar a Legal · Eje 3
    if(ed>=1&&B(d,t.id).length>0&&t.eje!==3&&derivs<2){
      d=asig(d,{...t,primeraRespuesta:t.primeraRespuesta??d.ahora},`legal`,`DERIVACION_CONFLICTO_EJE3`,`Derivado a Legal · Eje 3 por señal de conflicto`);
      K.set(t.id,0);K.set(`der:`+t.id,1);mov.add(t.id);derivs++;continue
    }
    // 2b) En Atención Eje 1 -> avanzar al área especialista según tipo
    if(ed>=1&&zn===`eje1`&&!K.get(`der:`+t.id)&&derivs<2){
      let sig=t.tipo===`CTA`?`cob`:t.tipo===`GAR`||t.tipo===`VIS`?`post`:t.tipo===`ING`||t.tipo===`RSV`?`proy`:t.tipo===`QUE`?`libro`:t.tipo===`REC`?(numId(t.id)%2===0?`libro`:`legal`):t.tipo===`PED`&&numId(t.id)%2===0?`proy`:null;
      if(sig){
        if(sig===`libro`&&!Bi(d,t.id)){
          try{d=Yi(d,t.id,{tipo:t.tipo===`REC`?`RECLAMO`:`QUEJA`,establecimiento:zt,hechos:t.descripcion||t.resumen,pedido:`Revisión y respuesta dentro del plazo legal.`,monto:null,moneda:``},t.responsable||`p-crojas`)[0];t=R(d,t.id)}catch{}
        }
        d=asig(d,{...t,primeraRespuesta:t.primeraRespuesta??d.ahora},sig,`DERIVACION_COMPETENCIA`,`Derivado desde Atención Eje 1 al área especialista`,`OPEN`);
        K.set(`der:`+t.id,1);K.set(`cola:`+t.id,0);K.set(t.id,0);mov.add(t.id);derivs++;continue
      }
      K.set(`der:`+t.id,1)
    }
    // 2c) Resolver en el área actual cuando completó atención
    let nZ=zonasRes.get(zn)??0;
    if(ed>=2&&resueltos<topePaso&&!_i(d,t,`RESOLVED`)&&(nZ===0||(zn===`cob`&&nZ<2))){
      try{
        let u={...t,primeraRespuesta:t.primeraRespuesta??d.ahora};d=z(d,u);
        d=V(d,t.id,`RESOLVED`,t.responsable||`p-crojas`,`Resuelto desde la vista en vivo`);
        K.set(`res:`+t.id,0);mov.add(t.id);zonasRes.set(zn,nZ+1);resueltos++;continue
      }catch{}
    }
    K.set(t.id,ed+1)
  }

  // 3) En cola del área (OPEN con responsable / PENDING_CUSTOMER / REOPENED) -> IN_PROGRESS
  let atendidos=0,zonasAt=new Set;
  for(let t of [...d.tickets].sort(Ur(d))){
    if(mov.has(t.id))continue;
    let enCola=(t.estado===`OPEN`&&t.responsable)||t.estado===`PENDING_CUSTOMER`||t.estado===`REOPENED`;
    if(!enCola)continue;
    let ed=K.get(`cola:`+t.id)??1,zn=zonaDe(d,t);
    if(ed>=1&&atendidos<topeAvance&&(!zonasAt.has(zn)||atendidos<2)){
      try{
        let ids=GENTE[zn]??GENTE.eje1,resp=t.responsable&&ids.includes(t.responsable)?t.responsable:elegir(d,zn);
        if(resp!==t.responsable){t={...t,responsable:resp};d=z(d,t)}
        d=V(d,t.id,`IN_PROGRESS`,resp,null);
        K.set(t.id,0);mov.add(t.id);zonasAt.add(zn);atendidos++;continue
      }catch{}
    }
    K.set(`cola:`+t.id,ed+1)
  }

  // 4) Bandeja orquestadora (OPEN sin responsable) -> En cola del área
  let despachados=0;
  for(let t of [...d.tickets].sort(Ur(d))){
    if(mov.has(t.id)||t.estado!==`OPEN`||t.responsable)continue;
    let ed=K.get(`ban:`+t.id)??1;
    if(ed>=1&&despachados<2){
      let zn=t.area===`COBRANZA`?`cob`:t.area===`POSTVENTA`?`post`:t.area===`ADMINISTRACION`?`proy`:t.area===`LEGAL`?`legal`:t.tipo===`GAR`||t.tipo===`VIS`?`post`:t.tipo===`ING`||t.tipo===`RSV`?`proy`:t.tipo===`CTA`?(numId(t.id)%2===0?`eje1`:`cob`):t.tipo===`REC`?(numId(t.id)%2===0?`eje1`:`legal`):`eje1`;
      if(t.tipo===`QUE`&&numId(t.id)%2===1&&!Bi(d,t.id)){
        try{d=Yi(d,t.id,{tipo:`QUEJA`,establecimiento:zt,hechos:t.descripcion||t.resumen,pedido:`Revisión y respuesta dentro del plazo legal.`,monto:null,moneda:``},`p-crojas`)[0];t=R(d,t.id);zn=`libro`}catch{}
      }
      d=asig(d,t,zn,`ALTA`,`Asignado por la bandeja orquestadora por carga`);
      if(zn!==`eje1`)K.set(`der:`+t.id,1);
      K.set(`cola:`+t.id,0);mov.add(t.id);despachados++;continue
    }
    K.set(`ban:`+t.id,ed+1)
  }

  // 5) Entrada continua de nuevos tickets a la bandeja (eligiendo tipos que alimenten las áreas con menos carga)
  let actList=d.tickets.filter(t=>E.includes(t.estado)),
  enBan=actList.filter(t=>t.estado===`OPEN`&&!t.responsable).length;
  if(enBan<3&&actList.length<20){
    let catalogo=[
      {z:`post`,t:`GAR`,c:`WhatsApp`,r:`Reporte de garantía postventa en vivienda`},
      {z:`proy`,t:`RSV`,c:`WhatsApp`,r:`Reserva de cupo en bus para Entrega Fest`},
      {z:`libro`,t:`QUE`,c:`Correo`,r:`Queja de atención para Libro de Reclamaciones`},
      {z:`legal`,t:`REC`,c:`Correo`,r:`Reclamo contractual con revisión legal`},
      {z:`proy`,t:`ING`,c:`Teléfono`,r:`Solicitud de ingreso a proyecto inmobiliario`},
      {z:`post`,t:`VIS`,c:`Teléfono`,r:`Coordinación de visita técnica a lote`},
      {z:`cob`,t:`CTA`,c:`Teléfono`,r:`Consulta de estado de cuenta y cronograma`},
      {z:`eje1`,t:`PED`,c:`Correo`,r:`Solicitud de constancia y documentos de lote`},
    ],
    contZ={eje1:0,cob:0,libro:0,legal:0,post:0,proy:0};
    for(let t of actList)contZ[zonaDe(d,t)]=(contZ[zonaDe(d,t)]??0)+1;
    let ord=[...catalogo].sort((a,b)=>(contZ[a.z]??0)-(contZ[b.z]??0)),
    elegido=ord[paso%Math.min(3,ord.length)]??catalogo[paso%catalogo.length],
    cli=O[(paso*7)%30]?.id??`cli-038`,
    emp=[`AIN`,`ALT`,`APV`,`ACS`][d.contador%4],pri=[`MEDIUM`,`HIGH`,`LOW`,`URGENT`][d.contador%4],
    [i,a]=Di(d,{canal:elegido.c,clienteId:cli,empresaId:emp,linea:`Lotes urbanos`,establecimiento:``,tipo:elegido.t,prioridad:pri,resumen:elegido.r,descripcion:`Ingresó por canal automatizado hacia la bandeja orquestadora.`},`p-dlazo`);
    d={...i,tickets:i.tickets.map(q=>q.id===a.id?{...q,responsable:null,area:`ATC`,eje:1}:q)};
    K.set(`ban:`+a.id,0)
  }
  if(paso%8===7){
    try{d=Ko(H(d,Kn(d.ahora,1)))[0]}catch{}
  }
  return X({...Y,datos:d}),d
}
