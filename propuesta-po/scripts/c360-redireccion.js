// Consulta 360 · información de cada dato y de cada sistema de origen, redirección a los módulos que ya existen y tarjetas del
// módulo «Consulta 360» (pedido del PO para la presentación, 20-oct; textos traídos de la rama de Daniel y adaptados a la Etapa 1).
// Sufijo del chunk Grafo360 (parchear.mjs), detrás de consulta360.js: JS plano con sus nombres minificados: G runtime JSX, i Botón,
// t Insignia, L Tarjeta, R cuerpo de tarjeta, H cabecera de tarjeta, U pares clave-valor, M navegar, _ ruta «#/…», X sistemas de
// origen; __Ico icono del sistema, __perm permisos por rol y __pre aviso previo de «Nuevo ticket» (importados por parchear).
// Los nombres locales llevan «__» para no tapar esos imports. La lógica pura (__redir360, __ticketCon360, pares y textos) la prueba
// scripts/probar-360-redireccion.mjs fuera del navegador.

// «Criterio» y «Consulta en línea» de cada dato (clave: id del dato en el modelo del chunk)
const __TRAZ360 = {
  kyc: [`Se valida contra el maestro único de clientes.`, `DNI, CE o RUC validado contra el maestro; si no figura, se registra como interesado.`],
  cont: [`Canal preferido y llamada directa desde la ficha.`, `Teléfono verificado, correo del titular y canal preferido de notificación.`],
  lote: [`Ubicación por proyecto, manzana y lote.`, `Proyecto, etapa, manzana y lote, metraje y estado de habilitación urbana.`],
  contrato: [`Seguimiento de firmas y causales de resolución.`, `Estado del contrato y de sus adendas, modalidad de venta y causal de resolución si acumula 3 cuotas vencidas.`],
  acta: [`Fecha base para el cómputo de las garantías de postventa.`, `Fecha de firma del acta de entrega, el hito que inicia el cómputo de las garantías.`],
  gar: [`Vigencia calculada en meses desde el acta.`, `Meses de garantía por partida (infraestructura y acabados) desde el acta: vigente o vencida.`],
  crono: [`Consulta en línea a la cartera y la recaudación.`, `Total de cuotas del financiamiento, cuotas pagadas y fecha del próximo vencimiento.`],
  cuotas: [`Alerta temprana por acumulación de cuotas impagas.`, `Cuotas vencidas, días de mora y caso de resolución al llegar a 3 cuotas vencidas.`],
  saldo: [`Cálculo actualizado de capital e intereses.`, `Saldo de capital financiado, intereses moratorios y monto de liquidación al día.`],
  ecta: [`Detalle financiero reservado: se muestra según el rol.`, `Total pagado, saldo pendiente y días de mora del cliente.`],
  docs: [`Búsqueda por significado, en lenguaje natural.`, `Contratos, adendas, planos y cartas notariales, sin recordar el nombre exacto del documento.`],
  correos: [`Evidencia de notificaciones y cargos enviados.`, `Correos enviados y recibidos con el cliente y notificaciones formales con cargo.`],
  llam: [`La grabación queda vinculada a la atención.`, `Llamadas entrantes y salientes, duración, quién atendió y grabación vinculada al ticket.`],
  tick: [`Un ticket por cada consulta.`, `Tickets anteriores y activos del cliente, con su estado y su SLA.`],
  libro: [`Plazo legal de respuesta de 15 días hábiles.`, `Hojas de reclamación (queja o reclamo), plazo legal, prórroga única y cargo de respuesta.`],
  expo: [`Dato reservado: solo lo ven los roles autorizados.`, `Riesgo regulatorio o judicial por ticket: monto reclamado e intereses estimados.`],
}

// «Plataforma», «Integración» y «Consulta en línea» de cada sistema de origen (clave: id del sistema en X)
const __FUENTES360 = {
  sigda: [`SIGDA / TAXON · maestro corporativo de clientes`, `Maestro único de clientes, sin copia local`, `DNI, CE, RUC o teléfono: devuelve el titular, su KYC, sus contratos y su contacto del maestro.`],
  contr: [`Contratos y Activos Inmobiliarios`, `Consulta en línea de lotes, contratos, actas y vigencia de garantías`, `Código de cliente o lote: devuelve manzana y lote, contrato, acta de entrega firmada y meses de garantía.`],
  cob: [`Sistema de Cobranza y Cartera`, `Cronogramas, saldos y alertas de morosidad`, `Contrato o lote: devuelve cronograma, cuotas vencidas, mora, saldo y alerta al llegar a 3 cuotas vencidas.`],
  jose: [`Motor de consultas (API)`, `Respuestas consolidadas en tiempo real, sin copia local`, `Tipo de consulta y lote: responde saldo, próxima cuota, último pago y estado del contrato.`],
  repo: [`Repositorio documental S3 / GLI`, `Indexación por significado sobre los documentos`, `Pregunta en lenguaje natural o cliente: devuelve minutas, adendas, planos y cargos con su relevancia.`],
  mail: [`Servidor de correo corporativo`, `Trazabilidad de correos, cargos y cartas de resolución`, `Correo del cliente o ticket: devuelve los hilos enviados y recibidos y las cartas de resolución de contrato.`],
  cti: [`Central telefónica (CTI)`, `Llamada desde la ficha y grabación vinculada automáticamente`, `Teléfono del titular: inicia la llamada saliente y vincula la grabación al ticket.`],
  atc: [`Aybar Atiende`, `Consolidado de tickets, hojas de reclamación y riesgo legal`, `Identificador del cliente: devuelve su historial de tickets, sus asientos del Libro y su exposición legal.`],
}

// Módulo al que lleva cada dato: solo módulos que ya existen (no hay visor de contratos). `ve` replica la decisión del menú del
// shell (prototipo › ua): si el rol no ve el módulo en el menú, no se ofrece el botón. Si cambia el menú, cambia aquí también
// (probar-360-redireccion.mjs lo compara con el menú parcheado y avisa si se separan).
const __SIN_MENU360 = [`CONTROL_ACCESO`, `CLIENTE`]
const __MODULOS360 = {
  ficha: { etiqueta: `Abrir la ficha del cliente`, modulo: `Clientes`, ruta: (c) => `clientes/${c}`, ve: (r) => __perm.atender(r) || r === `COORDINADOR_CX` },
  fest: { etiqueta: `Ir a EntregaFest en vivo`, modulo: `EntregaFest en vivo`, ruta: () => `fest`, ve: (r) => r === `COORDINADOR_CX` || r === `MODERADOR_EVENTO` },
  garantias: { etiqueta: `Ir a Garantías postventa`, modulo: `Garantías postventa`, ruta: () => `garantias`, ve: (r) => !__SIN_MENU360.includes(r) && r !== `SIN_ATENCION` },
  morosidad: { etiqueta: `Ir a Resolución por morosidad`, modulo: `Resolución por morosidad`, ruta: () => `morosidad`, ve: (r) => [`COLABORADOR`, `SUPERVISOR`, `LEGAL_RECLAMOS`, `COORDINADOR_CX`].includes(r) },
  correo: { etiqueta: `Abrir el último ticket con correo`, modulo: `Bandeja`, canal: `Correo`, ve: (r) => !__SIN_MENU360.includes(r) },
  llamada: { etiqueta: `Abrir ticket y grabación`, modulo: `Bandeja`, canal: `Teléfono`, ve: (r) => !__SIN_MENU360.includes(r) },
  bandeja: { etiqueta: `Ver tickets en la Bandeja`, modulo: `Bandeja`, ruta: () => `bandeja`, ve: (r) => !__SIN_MENU360.includes(r) },
  libro: { etiqueta: `Ir al Libro de Reclamaciones`, modulo: `Libro de Reclamaciones`, ruta: () => `libro`, ve: (r) => __perm.verLibro(r) },
  torre: { etiqueta: `Ir a la Torre de Control CX`, modulo: `Torre de Control CX`, ruta: () => `torre`, ve: (r) => r === `COORDINADOR_CX` || r === `SUPERVISOR` },
}
const __REDIR360 = { kyc: `ficha`, cont: `ficha`, lote: `ficha`, contrato: `ficha`, docs: `ficha`, acta: `fest`, gar: `garantias`, crono: `morosidad`, cuotas: `morosidad`, saldo: `morosidad`, ecta: `morosidad`, correos: `correo`, llam: `llamada`, tick: `bandeja`, libro: `libro`, expo: `torre` }

// Ticket más reciente del cliente con una interacción por ese canal (correo o teléfono, incluida la llamada registrada con su
// grabación); si ninguno la tiene, el más reciente del cliente. Sin tickets: null.
function __ticketCon360(d, cid, canal) {
  const tks = d.tickets.filter((q) => q.clienteId === cid)
  if (!tks.length) return null
  const ultima = (q) => {
    const fs = d.interacciones.filter((x) => x.ticketId === q.id && x.canal === canal).map((x) => +x.fecha)
    if (q.canal === canal) fs.push(+q.abierto)
    if (canal === `Teléfono`) fs.push(...(d.llamadas ?? []).filter((l) => l.ticketId === q.id).map((l) => +l.inicio))
    return fs.length ? Math.max(...fs) : null
  }
  const con = tks.map((q) => [q, ultima(q)]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1])
  return con.length ? { t: con[0][0], con: !0 } : { t: [...tks].sort((a, b) => b.abierto - a.abierto)[0], con: !1 }
}

// Redirección de un dato: {etiqueta, hash, modulo} si se ofrece; {motivo} si no se ofrece y conviene decir por qué; null si no
// aplica (dentro del ticket no se saca al gestor de su atención; en la ficha del cliente no se ofrece ir a ella misma).
// c = {d datos, rol, cid cliente, tk dentro de un ticket, aqui ruta actual}
function __redir360(n, c) {
  if (c.tk || n.fuente) return null
  const m = __MODULOS360[__REDIR360[n.id]]
  if (!m) return null
  if (n.estado === `restringido`) return { motivo: `Dato restringido para tu rol: no lleva a otro módulo.` }
  if (!m.ve(c.rol)) return { motivo: `Tu rol no tiene acceso a ${m.modulo}.` }
  let ruta = m.ruta ? m.ruta(c.cid) : null, etiqueta = m.etiqueta
  if (m.canal) {
    const k = __ticketCon360(c.d, c.cid, m.canal)
    if (!k) return { motivo: `El cliente no tiene tickets.` }
    ruta = `ticket/${k.t.id}`
    if (!k.con) etiqueta = `Abrir el último ticket del cliente`
  }
  const hash = _(ruta)
  return hash === c.aqui ? null : { etiqueta, hash, modulo: m.modulo }
}

// Pares del panel: del dato («Sistema de origen», «Criterio», «Consulta en línea») y del sistema de origen
function __paresDato360(n, v) {
  const tr = __TRAZ360[n.id] ?? [`Consulta en línea según el rol.`, `Dato consultado en línea en su sistema de origen.`]
  const origen = n.fuentes.map((id) => { const s = v.fuentes.find((q) => q.id === id) ?? X.find((q) => q.id === id); return s ? (s.caida ? `${s.n}: no disponible` : `${s.n} (${s.d.toLowerCase()})`) : id }).join(` + `)
  return [[`Sistema de origen`, origen], [`Criterio`, tr[0]], [`Consulta en línea`, tr[1]]]
}
function __paresFuente360(id, nombre) {
  const tr = __FUENTES360[id] ?? [nombre, `Consulta en línea, sin copia local`, `Consulta en línea, sin copia local.`]
  return [[`Plataforma`, tr[0]], [`Integración`, tr[1]], [`Consulta en línea`, tr[2]]]
}
// Un sistema de origen elegido se muestra en el panel del dato como si fuera un dato más (título, origen y estado)
function __nodoFuente360(v, id) {
  const s = v.fuentes.find((q) => q.id === id)
  return { id: s.id, n: s.n, fuentes: [s.id], estado: s.caida ? `caido` : `ok`, filas: [], fuente: !0, caida: !!s.caida }
}

function __BotonIr360(r, variante) {
  return (0, G.jsx)(i, { size: `sm`, variant: variante, trailingIcon: `→`, onClick: () => M(r.hash), children: r.etiqueta })
}

// Panel del dato (_e del chunk): lo de siempre (valor, estado y fecha, o restringido / no disponible) + criterio y consulta en línea
// + «<módulo> →» y «Crear ticket» (fuera del ticket). Si lo elegido es un sistema de origen: su estado y su información.
function __Dato360(a, Orig) {
  const c = a.__c, n = a.nodo
  if (!c) return (0, G.jsx)(Orig, a)
  let cuerpo
  if (n.fuente) {
    cuerpo = [
      (0, G.jsx)(`p`, { className: `pt-en-linea`, children: [(0, G.jsx)(t, { tone: n.caida ? `danger` : `success`, size: `sm`, children: n.caida ? `No disponible` : `En línea` }, `e`), __Latencia360(n.id, n.caida)] }, `e`),
      (0, G.jsx)(U, { pairs: __paresFuente360(n.id, n.n) }, `p`),
      // 20-oct (c360-mejoras.js): datos que alimenta y, en el módulo, «Probar desconexión» / «Restaurar en línea»
      (0, G.jsx)(__Alimenta360, { c, id: n.id }, `f`),
      c.mod && !c.tk ? (0, G.jsx)(__Desconexion360, { c, id: n.id }, `d`) : null,
    ]
  } else {
    const r = __redir360(n, c), nuevo = !c.tk && __perm.registrar(c.rol)
    cuerpo = [
      (0, G.jsx)(Orig, a, `o`),
      (0, G.jsx)(U, { pairs: __paresDato360(n, c.v) }, `p`),
      (r && r.hash) || nuevo ? (0, G.jsxs)(`div`, { className: `pt-en-linea`, children: [
        r && r.hash ? __BotonIr360(r, `primary`) : null,
        nuevo ? (0, G.jsx)(i, { size: `sm`, variant: `secondary`, leadingIcon: (0, G.jsx)(__Ico, { name: `plus`, size: 16 }), onClick: () => { __pre.cliente = c.v.cliente; M(_(`nuevo`)) }, children: `Crear ticket` }) : null,
      ] }, `a`) : null,
      r && r.motivo ? (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: r.motivo }, `m`) : null,
    ]
  }
  return (0, G.jsx)(`div`, { className: `pt-pila pt-pila--chica pt-c360-dato`, children: cuerpo })
}

// Equivalente accesible del clic en un sistema de origen del grafo (fuera del módulo, donde no está la tarjeta de sistemas)
function __ListaFuentes360({ c }) {
  return (0, G.jsx)(`ul`, { className: `ay-visually-hidden`, "aria-label": `Sistemas de origen de la consulta 360`, children: c.v.fuentes.map((s) => (0, G.jsx)(`li`, { children: (0, G.jsx)(`button`, { type: `button`, onClick: () => c.fuente(s.id), "aria-pressed": c.fs === s.id, children: `${s.n}: ${s.caida ? `no disponible` : `en línea`}` }) }, s.id)) })
}

// Chip de la tarjeta: botón del sistema de diseño; elegido = relleno; caído = rojo (y su nombre accesible lo dice); restringido = candado
function __Chip360({ id, texto, on, caido, restringido, etiqueta, onClick }) {
  const b = (0, G.jsx)(i, { size: `sm`, variant: on ? (caido ? `danger` : `primary`) : `secondary`, "aria-pressed": !!on, "aria-label": etiqueta, leadingIcon: restringido ? (0, G.jsx)(__Ico, { name: `lock`, size: 16 }) : void 0, onClick, children: texto })
  return (0, G.jsx)(`span`, { className: caido && !on ? `pt-c360-caido` : void 0, children: b }, id)
}

// Tarjetas propias del módulo «Consulta 360» (solo con la prop `modulo`): nodos del grafo con su redirección y estado de los
// sistemas de origen. Elegir un dato o un sistema lo enfoca en el grafo y en el panel del dato (y vuelve a mostrar la ficha).
function __Modulo360({ c }) {
  const v = c.v, fs = v.fuentes, enLinea = fs.filter((q) => !q.caida).length
  const nsel = c.fs ? null : v.nodos.find((q) => q.id === c.sel) ?? null, r = nsel ? __redir360(nsel, c) : null
  const fsel = c.fs ? fs.find((q) => q.id === c.fs) ?? null : null
  const nodos = (0, G.jsxs)(L, { children: [
    (0, G.jsx)(H, { as: `h2`, title: `Nodos del Grafo 360 y Redirección`, subtitle: `Elige un dato para enfocarlo en el grafo y en su ficha, o ve a su módulo.` }),
    (0, G.jsx)(R, { padding: `sm`, children: (0, G.jsxs)(`div`, { className: `pt-pila pt-pila--chica`, children: [
      (0, G.jsx)(`div`, { className: `pt-en-linea`, role: `group`, "aria-label": `Datos del cliente`, children: v.nodos.map((q) => (0, G.jsx)(__Chip360, { id: q.id, texto: q.n, on: nsel && nsel.id === q.id, caido: q.estado === `caido`, restringido: q.estado === `restringido`, etiqueta: q.estado === `restringido` ? `${q.n}: restringido` : q.estado === `caido` ? `${q.n}: no disponible` : void 0, onClick: () => c.elegir(q.id) }, q.id)) }),
      (0, G.jsxs)(`div`, { className: `pt-en-linea`, children: [
        r && r.hash ? __BotonIr360(r, `secondary`) : null,
        (0, G.jsx)(i, { size: `sm`, variant: `ghost`, "aria-expanded": !c.oculta, onClick: () => c.ocultar(!c.oculta), children: c.oculta ? `Mostrar ficha` : `Ocultar ficha` }),
      ] }),
      !nsel ? (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: `Elige un dato para ver a qué módulo lleva.` }) : r && r.motivo ? (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: r.motivo }) : null,
    ] }) }),
  ] })
  const sistemas = (0, G.jsxs)(L, { children: [
    (0, G.jsx)(H, { as: `h2`, title: `Estado de sistemas de origen`, subtitle: `Disponibilidad de cada sistema en esta consulta. Elige uno para ver su información.` }),
    (0, G.jsx)(R, { padding: `sm`, children: (0, G.jsxs)(`div`, { className: `pt-pila pt-pila--chica`, children: [
      (0, G.jsxs)(`div`, { className: `pt-en-linea`, role: `group`, "aria-label": `Sistemas de origen`, children: [
        (0, G.jsx)(t, { tone: enLinea === fs.length ? `success` : `danger`, size: `sm`, children: enLinea === fs.length ? `Todas en línea` : `${enLinea} de ${fs.length} en línea` }),
        ...fs.map((s) => (0, G.jsx)(__Chip360, { id: s.id, texto: `${s.n} · ${s.caida ? `no disponible` : `en línea`}`, on: c.fs === s.id, caido: !!s.caida, onClick: () => c.fuente(c.fs === s.id ? null : s.id) }, s.id)),
      ] }),
      enLinea < fs.length ? (0, G.jsx)(`div`, { className: `pt-en-linea`, children: (0, G.jsx)(i, { size: `sm`, variant: `secondary`, onClick: () => __restaurar360(fs.filter((q) => q.caida).map((q) => q.id)), children: `Todas en línea` }) }) : null,
      fsel ? (0, G.jsxs)(`div`, { className: `pt-pila pt-pila--chica`, "aria-live": `polite`, children: [(0, G.jsx)(`p`, { className: `pt-texto`, children: (0, G.jsx)(`strong`, { children: fsel.n }) }), (0, G.jsx)(U, { pairs: __paresFuente360(fsel.id, fsel.n) }), (0, G.jsx)(__Desconexion360, { c, id: fsel.id })] }) : null,
    ] }) }),
  ] })
  return (0, G.jsxs)(`div`, { className: `pt-c360-modulo`, children: [nodos, sistemas] })
}
