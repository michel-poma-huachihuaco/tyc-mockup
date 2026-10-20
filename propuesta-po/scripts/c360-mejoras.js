// Consulta 360 · resto de las mejoras de la rama de Daniel (pedido del usuario, 20-oct, aprobadas por el PO para la presentación):
// vista «Grafo 3D / Grafo 2D», búsqueda por sección, coincidencias con su relevancia, más clientes de ejemplo y, solo en el módulo
// (prop `modulo`): «Llamar» y «Tickets en Bandeja» en la ficha, síntesis de IA (reglas locales, sin datos personales), aviso de
// continuidad, «Probar desconexión» / «Reintentar», consultas rápidas al motor y la malla de los 16 datos con su redirección.
// Sufijo del chunk Grafo360 (parchear.mjs), detrás de c360-redireccion.js: JS plano con sus nombres minificados: G runtime JSX,
// W React, i Botón, t Insignia, f Alerta, L Tarjeta, R cuerpo, H cabecera, U pares, I campo, se Select, j error, P acción en curso,
// l API, b acciones del estado (fuentes caídas), E aviso, M navegar, _ ruta, X sistemas de origen, T lotes del cliente, le
// consultas rápidas al motor; __Seg control segmentado y __Dlg diálogo (importados por parchear). Locales con «__».

// clientes de ejemplo que se suman a los del chip original (ids fijos de la semilla, ficticios): con mora y reclamo del Libro,
// con llamada registrada, con dos tickets abiertos y sin tickets
const __CLIENTES360 = [`cli-014`, `cli-022`, `cli-012`, `cli-009`]
const __norm360 = (s) => String(s).normalize(`NFD`).replace(/[̀-ͯ]/g, ``).toLowerCase().trim()

// Búsqueda por sección (como en la rama de Daniel): el texto es el nombre de un dato o de un sistema de origen, o lo contiene entero
function __buscaSeccion360(v, q) {
  const k = __norm360(q)
  if (!k) return null
  const es = (n) => { const x = __norm360(n); return k === x || (k.length > x.length && k.includes(x)) }
  const d = v.nodos.find((n) => es(n.n))
  if (d) return { id: d.id, texto: `Sección «${d.n}» del cliente · origen: ${d.fuentes.map((id) => v.fuentes.find((s) => s.id === id)?.n ?? id).join(` + `)}.` }
  const s = v.fuentes.find((x) => es(x.n))
  if (s) return { id: s.id, fuente: !0, texto: `Sistema de origen «${s.n}»: ${s.caida ? `no disponible` : `en línea`}.` }
  return null
}

// Síntesis de IA simulada: reglas locales sobre los datos que el rol ve (los restringidos o caídos no se usan). Sin nombre, DNI,
// teléfono ni correo en el texto.
function __sintesis360(v, d) {
  const ok = (id) => { const q = v.nodos.find((x) => x.id === id); return q && q.estado === `ok` ? q : null }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  const lo = ok(`lote`), cu = ok(`cuotas`), ec = ok(`ecta`), tk = ok(`tick`), lb = ok(`libro`), ga = ok(`gar`), ex = ok(`expo`)
  const partes = []
  if (lo) partes.push(`${lo.filas.length} ${lo.filas.length === 1 ? `lote` : `lotes`}`)
  const venc = cu ? v.venc ?? 0 : 0
  const mora = ec ? (ec.filas.find((x) => x[0] === `Mora`) ?? [])[1] : null
  if (cu) partes.push(venc ? `${venc} ${venc === 1 ? `cuota vencida` : `cuotas vencidas`}${mora && mora !== `al día` ? ` (${mora} de mora)` : ``}` : `al día en sus cuotas`)
  const caso = cu ? cu.filas.find((x) => x[0] === `Caso de resolución`) : null
  if (caso) partes.push(`caso de resolución ${caso[1]}`)
  const abiertos = tk ? d.tickets.filter((q) => q.clienteId === v.cliente.id && ![`CLOSED`, `RESOLVED`].includes(q.estado)).length : 0
  if (tk) partes.push(abiertos ? `${abiertos} ${abiertos === 1 ? `ticket abierto` : `tickets abiertos`}` : `sin tickets abiertos`)
  const libro = lb ? lb.filas.filter((x) => x[1] === `sin responder`).length : 0
  if (libro) partes.push(`${libro} ${libro === 1 ? `reclamo del Libro sin responder` : `reclamos del Libro sin responder`}`)
  const gar = ga ? ga.filas.filter((x) => !/^(Sin reclamos|No aplica)$/.test(x[0])).length : 0
  if (gar) partes.push(`${gar} ${gar === 1 ? `reclamo de garantía` : `reclamos de garantía`}`)
  const riesgo = ex ? ex.filas.filter((x) => x[0] !== `Sin riesgo de denuncia`).length : 0
  if (riesgo) partes.push(`riesgo legal en ${riesgo} ${riesgo === 1 ? `ticket` : `tickets`}`)
  const caidas = v.fuentes.filter((s) => s.caida).map((s) => s.n)
  let texto = partes.length ? `${cap(partes.join(`; `))}.` : `Tu rol no ve datos para resumir.`
  if (caidas.length) texto += ` No responde${caidas.length === 1 ? `` : `n`}: ${caidas.join(`, `)}; confirma esos datos con el cliente.`
  const accion = libro ? `prioriza la respuesta del reclamo del Libro: corre el plazo legal de 15 días hábiles.`
    : caso && caso[1] === `en resolución` ? `revisa el caso en Resolución por morosidad antes de responder.`
    : venc >= 3 ? `informa el saldo y las cuotas vencidas: con 3 o más el contrato puede entrar en resolución.`
    : venc ? `informa el saldo y ofrece regularizar las cuotas vencidas.`
    : abiertos ? `retoma el ticket abierto antes de registrar uno nuevo.`
    : gar ? `revisa el avance del reclamo de garantía.`
    : `atiende la consulta y registra el ticket.`
  return { texto, accion: cap(accion) }
}

// «Grafo 3D / Grafo 2D» (control segmentado del sistema de diseño); la elección se recuerda en la sesión del navegador
function __ModoGrafo360({ modo, cambiar }) {
  return (0, G.jsx)(`div`, { className: `pt-grafo__modo`, children: (0, G.jsx)(__Seg, { label: `Vista del grafo`, size: `sm`, options: [{ value: `3d`, label: `Grafo 3D` }, { value: `2d`, label: `Grafo 2D` }], value: modo, onValueChange: cambiar }) })
}
function __modoInicial360() { try { return sessionStorage.getItem(`v3:grafo`) === `2d` ? `2d` : `3d` } catch { return `3d` } }
function __guardaModo360(m) { try { sessionStorage.setItem(`v3:grafo`, m) } catch {} }

// «Probar desconexión» / «Restaurar en línea»: el mismo estado que Herramientas › Simulación (fuentes caídas)
const __codigo360 = (id) => X.find((s) => s.id === id)?.fuente ?? null
function __restaurar360(ids) { for (const id of ids) { const k = __codigo360(id); k && b.fuente(k, !1) } }
function __Desconexion360({ c, id }) {
  const s = c.v.fuentes.find((q) => q.id === id), k = __codigo360(id)
  return (0, G.jsxs)(`div`, { className: `pt-en-linea`, children: [
    k ? (0, G.jsx)(i, { size: `sm`, variant: s && s.caida ? `primary` : `danger`, onClick: () => b.fuente(k, !(s && s.caida)), children: s && s.caida ? `Restaurar en línea` : `Probar desconexión` }) : (0, G.jsx)(`span`, { className: `pt-texto-chico`, children: `Sistema interno: su caída no se simula.` }),
    c.fs === id ? (0, G.jsx)(i, { size: `sm`, variant: `ghost`, onClick: () => c.fuente(null), children: `Ver el dato elegido` }) : null,
  ] })
}
// Latencia del sistema (la de la simulación) y datos que alimenta (elegir uno lo enfoca)
function __Latencia360(id, caida) { const s = X.find((q) => q.id === id); return s ? (0, G.jsx)(t, { tone: caida ? `danger` : `info`, size: `sm`, children: caida ? `Sin respuesta` : `Latencia ${s.ms} ms` }, `l`) : null }
function __Alimenta360({ c, id }) {
  const ns = c.v.nodos.filter((q) => q.fuentes.includes(id))
  return ns.length ? (0, G.jsxs)(`div`, { className: `pt-pila pt-pila--chica`, children: [
    (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: `Datos que alimenta` }),
    (0, G.jsx)(`div`, { className: `pt-en-linea`, role: `group`, "aria-label": `Datos que alimenta este sistema`, children: ns.map((q) => (0, G.jsx)(i, { size: `sm`, variant: `secondary`, onClick: () => c.elegir(q.id), children: q.n }, q.id)) }),
  ] }) : null
}

// Ficha del cliente en el módulo: «Llamar» (la misma acción y el mismo diálogo que la ficha #/clientes/<id>), «Tickets en Bandeja»
// y la síntesis de IA
function __FichaMod360({ c }) {
  const [abierto, setAbierto] = (0, W.useState)(!1), [tk, setTk] = (0, W.useState)(``), acc = P()
  const v = c.v, cli = v.cliente, NINGUNO = `__ninguno`
  const puede = !c.tk && __perm.atender(c.rol) && cli.id !== `cli-int`, ban = !c.tk && __MODULOS360.bandeja.ve(c.rol)
  const abiertos = c.d.tickets.filter((q) => q.clienteId === cli.id && ![`CLOSED`, `RESOLVED`].includes(q.estado)), sel = tk || abiertos[0]?.id || NINGUNO
  const llamar = async () => {
    const r = await acc.ejecutar(() => l.iniciarLlamada(cli.id, sel === NINGUNO ? null : sel))
    r && (setAbierto(!1), E({ message: `Llamada iniciada por el call center. Grabación ${r.grabacion}${r.ticketId ? ` · queda en el ticket` : ``}.`, tone: `success` }), c.elegir(`llam`))
  }
  const s = __sintesis360(v, c.d)
  return (0, G.jsxs)(`div`, { className: `pt-pila pt-pila--chica`, children: [
    puede || ban ? (0, G.jsxs)(`div`, { className: `pt-en-linea`, children: [
      puede ? (0, G.jsx)(i, { size: `sm`, variant: `primary`, onClick: () => { acc.limpiar(); setAbierto(!0) }, children: `Llamar` }) : null,
      ban ? (0, G.jsx)(i, { size: `sm`, variant: `secondary`, trailingIcon: `→`, onClick: () => M(_(`bandeja`)), children: `Tickets en Bandeja` }) : null,
    ] }) : null,
    (0, G.jsx)(f, { tone: `info`, size: `sm`, title: `Síntesis IA`, children: (0, G.jsxs)(`span`, { className: `pt-alerta__texto`, children: [s.texto, ` `, (0, G.jsx)(`strong`, { children: `Acción sugerida:` }), ` `, s.accion] }) }),
    (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: `Síntesis con reglas locales sobre los datos que ve tu rol; no sale a ningún servicio.` }),
    puede ? (0, G.jsx)(__Dlg, { open: abierto, onOpenChange: setAbierto, title: `Llamar a ${cli.nombre}`, description: `La llamada sale por la plataforma del call center y queda como interacción del ticket.`,
      footer: (0, G.jsxs)(G.Fragment, { children: [(0, G.jsx)(i, { variant: `ghost`, onClick: () => setAbierto(!1), children: `Cancelar` }), (0, G.jsx)(i, { variant: `primary`, loading: acc.enCurso, onClick: llamar, children: `Iniciar la llamada` })] }),
      children: (0, G.jsxs)(`div`, { className: `pt-pila`, children: [
        (0, G.jsx)(I, { label: `Registrar la llamada en el ticket`, children: (0, G.jsx)(se, { value: sel, onChange: (ev) => setTk(ev.target.value), options: [...abiertos.map((q) => ({ value: q.id, label: `${q.numero} · ${q.resumen}` })), { value: NINGUNO, label: `Sin ticket (solo en la ficha)` }] }) }),
        acc.error ? (0, G.jsx)(j, { error: acc.error, reintentar: llamar, titulo: `No se pudo iniciar la llamada` }) : null,
        abiertos.length ? null : (0, G.jsx)(f, { tone: `info`, size: `sm`, children: (0, G.jsx)(`span`, { className: `pt-alerta__texto`, children: `No tiene tickets abiertos: la llamada queda solo en su ficha.` }) }),
      ] }) }) : null,
  ] })
}

// Una sección de la malla: valor, sistema de origen, estado (candado o caído) y su redirección
function __Seccion360({ c, n }) {
  const on = !c.fs && c.sel === n.id, r = __redir360(n, c)
  const origen = n.fuentes.map((id) => c.v.fuentes.find((s) => s.id === id)?.n ?? id).join(` + `)
  const est = n.estado === `restringido` ? (0, G.jsxs)(t, { tone: `warning`, size: `sm`, children: [(0, G.jsx)(__Ico, { name: `lock`, size: 16 }), ` Restringido`] })
    : n.estado === `caido` ? (0, G.jsx)(t, { tone: `danger`, size: `sm`, children: `No disponible` }) : (0, G.jsx)(t, { tone: `success`, size: `sm`, children: `En línea` })
  const cuerpo = n.estado === `ok` ? (0, G.jsx)(U, { pairs: n.filas })
    : n.estado === `restringido` ? (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: `Tu rol no tiene acceso a «${n.n.toLowerCase()}». Pídelo a tu supervisor ATC si lo necesitas.` })
    : (0, G.jsxs)(`div`, { className: `pt-pie-c360`, children: [(0, G.jsx)(`p`, { className: `pt-texto-chico`, children: `No se pudo consultar. Las demás secciones siguen disponibles.` }), (0, G.jsx)(i, { size: `sm`, variant: `secondary`, onClick: () => __restaurar360(n.fuentes.filter((id) => c.v.fuentes.find((s) => s.id === id)?.caida)), children: `Reintentar` })] })
  return (0, G.jsxs)(L, { variant: `selectable`, selected: on, role: `listitem`, onClick: (ev) => { ev.target.closest(`button,a`) || c.elegir(n.id) }, children: [
    (0, G.jsx)(H, { as: `h3`, title: n.n, subtitle: `Origen: ${origen}`, actions: est }),
    (0, G.jsx)(R, { padding: `sm`, children: (0, G.jsxs)(`div`, { className: `pt-pila pt-pila--chica`, children: [
      cuerpo,
      (0, G.jsxs)(`div`, { className: `pt-pie-c360`, children: [
        (0, G.jsx)(i, { size: `sm`, variant: `ghost`, "aria-pressed": on, "aria-label": `Ver ${n.n} en el grafo`, onClick: () => c.elegir(n.id), children: `Ver en el grafo` }),
        r && r.hash ? __BotonIr360(r, `secondary`) : null,
      ] }),
      r && r.motivo ? (0, G.jsx)(`p`, { className: `pt-texto-chico`, children: r.motivo }) : null,
    ] }) }),
  ] })
}

// Debajo de las tarjetas del módulo: aviso de continuidad, consultas rápidas al motor y la malla de los 16 datos
function __Mejoras360({ c }) {
  const v = c.v, caidas = v.fuentes.filter((s) => s.caida), lote = v.nodos.find((q) => q.id === `lote`)
  const lotes = lote && lote.estado !== `restringido` ? T(v.cliente) : null
  return (0, G.jsxs)(`div`, { className: `pt-c360-extra`, children: [
    caidas.length ? (0, G.jsx)(f, { tone: `warning`, size: `sm`, title: `Continuidad: ${caidas.length} ${caidas.length === 1 ? `sistema sin respuesta` : `sistemas sin respuesta`}`,
      actions: (0, G.jsx)(i, { size: `sm`, variant: `secondary`, onClick: () => __restaurar360(caidas.map((s) => s.id)), children: `Reintentar todos` }),
      children: (0, G.jsx)(`span`, { className: `pt-alerta__texto`, children: `La consulta sigue con los otros ${v.fuentes.length - caidas.length} sistemas: los datos de ${caidas.map((s) => s.n).join(`, `)} se marcan «no disponible» y el resto responde con normalidad.` }) }) : null,
    (0, G.jsx)(le, { ticketId: { clienteId: v.cliente.id }, lotes }),
    (0, G.jsxs)(L, { children: [
      (0, G.jsx)(H, { as: `h2`, title: `${v.nodos.length} secciones de datos en línea de ${v.cliente.nombre}`, subtitle: `Cada sección con su sistema de origen y su redirección directa. Elige una para enfocarla en el grafo y en su ficha.` }),
      (0, G.jsx)(R, { padding: `sm`, children: (0, G.jsx)(`div`, { className: `pt-c360-malla`, role: `list`, "aria-label": `Secciones de datos del cliente`, children: v.nodos.map((q) => (0, G.jsx)(__Seccion360, { c, n: q }, q.id)) }) }),
    ] }),
  ] })
}
