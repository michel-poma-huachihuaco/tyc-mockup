// Reglas de Mi Portal (HU-ATC-064, 065 y 066 · FT-ATC-24 · EP-ATC-06, PLT-04 v1.3). Funciones puras sobre el estado del
// prototipo: reciben el núcleo del chunk «comun» (no lo importan) para poder probarlas en Node (scripts/probar-portal.mjs).
// No duplican reglas de la consola: el SLA, el flujo, las transiciones y la encuesta son las mismas funciones del chunk.
import type { Adjunto, Cliente, Datos, Estado, FilaAsignacion, FilaEstado, Interaccion, Lote, Nucleo, Ticket } from './tipos.ts'

export const CANAL = 'Mi Portal'
/** Persona del prototipo que representa al cliente (existe en el maestro de personas: «Cliente de Mi Portal»). */
export const AUTOR_CLIENTE = 'p-cliente'
/** Usuario de servicio que registra lo que entra por Mi Portal (también existe en el prototipo). */
export const AUTOR_SERVICIO = 'p-portal'

/** HU-064 CA-05. Formatos y tope: decisión de diseño (el PLT-04 pide «tamaño y formatos permitidos» sin listarlos). */
export const ADJUNTOS = {
  accept: 'image/jpeg,image/png,application/pdf',
  maxBytes: 10 * 1024 * 1024,
  maxArchivos: 3,
  texto: 'JPG, PNG o PDF de hasta 10 MB; máximo 3 archivos.',
}
/**
 * HU-066 CA-04: días hábiles que se espera la confirmación antes del cierre automático. Los configura el administrador funcional
 * (Configuración › Cierre automático) y los lee el job del sistema en «comun» (scripts/hu066-sla.js); el valor inicial, 5, es
 * un supuesto del equipo (pregunta abierta del PLT-04).
 */
export const diasConfirmacion = (n: Nucleo, d: Datos = n.datos()): number => n.diasConfirmacion(d)
/** HU-064 CA-01: el código de un solo uso vence a los 5 minutos y admite 3 intentos. Supuesto (no está en el PLT-04). */
export const CODIGO = { minutos: 5, intentos: 3 }

export interface TipoPortal { id: string; nombre: string; ayuda: string; subtipos: string[]; libro?: boolean }
/**
 * Tipos y subtipos que ve el cliente. El PLT-04 deja abierto «¿qué tipos y subtipos se habilitan al cliente en el piloto?».
 * Los tipos son los del catálogo del prototipo. Subtipos (decisión del 20-oct, DECISIONES §5.9): donde la plataforma actual
 * (Front Digital) ya tiene el subtipo, se usa su nombre: «Estado de cuenta del lote» (SOLICITUD DE EE.CC - LOTE, nombre de
 * portal), «Actualización de datos» (SOLICITUD DE ACTUALIZACION DE DATOS), «Copia legalizada de contrato» (COPIA LEGALIZADA
 * DE CONTRATO) y «Otra solicitud» (OTROS, nombre de portal). Los demás siguen siendo una propuesta nuestra, sin equivalente.
 * Fuera: incidencia de ciudad (Etapa 2), resolución de contrato, ingreso a proyecto y reserva de bus.
 */
export const TIPOS: TipoPortal[] = [
  { id: 'CTA', nombre: 'Consulta de cuenta', ayuda: 'Cuotas, pagos, estado de cuenta o constancias.', subtipos: ['Estado de cuenta del lote', 'Pago no reflejado', 'Constancia de pagos', 'Cronograma de pagos'] },
  { id: 'PED', nombre: 'Pedido simple', ayuda: 'Copias de documentos o cambios de datos de contacto.', subtipos: ['Copia legalizada de contrato', 'Actualización de datos', 'Información de cambio de titular', 'Otra solicitud'] },
  { id: 'VIS', nombre: 'Visita técnica', ayuda: 'Coordinar una visita a tu lote o vivienda.', subtipos: ['Visita al lote', 'Revisión de linderos', 'Coordinación de la entrega'] },
  { id: 'GAR', nombre: 'Garantía postventa', ayuda: 'Algo de tu vivienda entregada necesita reparación.', subtipos: ['Estructural', 'Impermeabilización', 'Acabados', 'Instalaciones eléctricas o sanitarias'] },
  { id: 'REC', nombre: 'Reclamo', ayuda: 'Disconformidad con un producto o servicio.', subtipos: [], libro: true },
  { id: 'QUE', nombre: 'Queja', ayuda: 'Malestar por la atención recibida.', subtipos: [], libro: true },
]

/** Estados como los ve el cliente (diagrama 6.1 de FT-ATC-24 en el PLT-04 v1.3). */
export const ESTADO_CLIENTE: Record<Estado, { texto: string; tono: 'info' | 'warning' | 'success' | 'neutral' | 'danger' }> = {
  OPEN: { texto: 'Registrado', tono: 'info' },
  IN_PROGRESS: { texto: 'En atención', tono: 'info' },
  PENDING_CUSTOMER: { texto: 'Pendiente de tu respuesta', tono: 'warning' },
  ESCALATED: { texto: 'En revisión especializada', tono: 'info' },
  RESOLVED: { texto: 'Resuelto · por confirmar', tono: 'success' },
  CLOSED: { texto: 'Cerrado', tono: 'neutral' },
  REOPENED: { texto: 'Reabierto', tono: 'warning' },
}

/** Nombre del área para el cliente. Pregunta abierta del PLT-04 (¿nombre del área o uno genérico?): aquí, el del área. */
export function areaCliente(area: string, nombres: Record<string, string>): string {
  return area === 'ATC' ? 'Atención al cliente' : nombres[area] ?? area
}

/** Razón social y línea salen del contrato del lote en SIGDA/TAXON (RN-SVC-005), no las elige el cliente. Regla fija del prototipo. */
export function contratoDelLote(lote: Lote): { empresaId: string; linea: string } {
  const p = lote.descripcion
  if (p.startsWith('Residencial Brisas')) return { empresaId: 'AIN', linea: 'Vivienda' }
  if (p.startsWith('Ciudad Aybar Norte')) return { empresaId: 'ADN', linea: 'Lotes urbanos' }
  return { empresaId: 'ALT', linea: 'Lotes urbanos' }
}

export const enmascararCorreo = (c: string) => c.replace(/^(.{2})[^@]*(@.*)$/, (_, a: string, b: string) => `${a}•••${b}`)
/** Deja el código de país y los 3 últimos dígitos: «+51 ••• ••• 490». */
export const enmascararTelefono = (t: string) => { const m = t.match(/^(\+\d{1,3})?(.*?)(\d{3})$/); return m ? `${m[1] ? `${m[1]} ` : ''}${m[2]!.replace(/^\s+/, '').replace(/\d/g, '•')}${m[3]}` : t }

// ------------------------------------------------------------------ acceso (DNI + código de un solo uso)
export function buscarPorDni(clientes: Cliente[], dni: string): Cliente | null {
  const limpio = dni.replace(/\D/g, '')
  return clientes.find((c) => c.dni === limpio) ?? null
}
export function validarDni(dni: string): string | null {
  return /^\d{8}$/.test(dni.trim()) ? null : 'Escribe tu DNI: 8 dígitos, sin puntos ni espacios.'
}
export function nuevoCodigo(azar: () => number = Math.random): string {
  return String(Math.floor(azar() * 900000) + 100000)
}

// ------------------------------------------------------------------ mis tickets (HU-064 CA-02)
export function ticketsDelCliente(d: Datos, clienteId: string): Ticket[] {
  return d.tickets.filter((t) => t.clienteId === clienteId).sort((a, b) => b.abierto.getTime() - a.abierto.getTime())
}
/** HU-065 CA-04: solo se muestra si es del cliente de la sesión; si no, null (y la vista registra el intento). */
export function ticketDelCliente(d: Datos, clienteId: string, ticketId: string): Ticket | null {
  const t = d.tickets.find((x) => x.id === ticketId)
  return t && t.clienteId === clienteId ? t : null
}
export function registrarIntentoAjeno(n: Nucleo, ticketId: string, clienteId: string) {
  n.aplicar((d) => n.auditar(d, AUTOR_CLIENTE, 'ver ticket en Mi Portal', `Mi Portal: el cliente ${clienteId} intentó abrir el ticket ${ticketId}, que no es suyo. Denegado; no se mostró nada.`))
}

// ------------------------------------------------------------------ trazabilidad (HU-065)
export interface Paso { id: string; fecha: Date; titulo: string; detalle: string | null; area: string; tono: 'default' | 'success' | 'accent' | 'danger' }

const areaEn = (asig: FilaAsignacion[], fecha: Date, porDefecto: string) => {
  let a = porDefecto
  for (const f of asig) if (f.fecha.getTime() <= fecha.getTime()) a = f.aArea
  return a
}
/**
 * Línea de tiempo del ticket para el cliente: la bitácora de estados en su orden, con los cambios de área intercalados.
 * Sin notas internas ni nombres de gestores (RN-SVC-044): solo se muestra el motivo que escribió el propio cliente.
 */
export function lineaDeTiempo(d: Datos, t: Ticket, nombres: Record<string, string>): Paso[] {
  const estados = d.filasEstado.filter((f) => f.ticketId === t.id)
  const asig = d.filasAsignacion.filter((f) => f.ticketId === t.id).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  const areaInicial = asig[0]?.aArea ?? t.area
  const pasos: (Paso & { orden: number })[] = []
  estados.forEach((f, i) => {
    // el registro va con el área de alta; los demás pasos, con el área que tenía el ticket en ese momento
    const area = areaCliente(f.de === null ? areaInicial : areaEn(asig, f.fecha, areaInicial), nombres)
    pasos.push({ id: f.id, orden: i * 2, fecha: f.fecha, area, ...pasoDeEstado(f, t) })
  })
  // cambios de área visibles: la primera asignación y cada derivación a otra área (sin decir a quién)
  let areaPrevia: string | null = null, hubo = false
  asig.forEach((f, i) => {
    // alta sin responsable seguida de la asignación del flujo: el alta no es un paso para el cliente
    if (i === 0 && !f.aResponsable && asig.length > 1) { areaPrevia = f.aArea; return }
    const primera = !hubo, cambia = f.aArea !== areaPrevia
    hubo = true; areaPrevia = f.aArea
    if (!primera && !cambia) return
    const idx = estados.filter((e) => e.fecha.getTime() <= f.fecha.getTime()).length
    const nombre = areaCliente(f.aArea, nombres)
    pasos.push({
      id: f.id, orden: idx * 2 - 1 + i / 1000, fecha: f.fecha, area: nombre, tono: 'default',
      titulo: primera ? (f.aResponsable ? 'Asignado' : 'En la bandeja de atención') : 'Derivado a otra área',
      detalle: primera ? (f.aResponsable ? `Lo atiende ${nombre}.` : 'Espera a que un gestor lo tome.') : `Ahora lo atiende ${nombre}.`,
    })
  })
  return pasos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.orden - b.orden).map(({ orden: _o, ...p }) => p)
}
/** HU-066 CA-04: si la fila es el cierre del job por falta de respuesta, los días hábiles que se esperó (van en su nota). */
const cierreAutomatico = (f: FilaEstado): string | null => (f.a === 'CLOSED' && f.nota?.match(/^Cierre automático: .* en (\d+) días hábiles/)?.[1]) || null
function pasoDeEstado(f: FilaEstado, t: Ticket): Pick<Paso, 'titulo' | 'detalle' | 'tono'> {
  const delCliente = f.autor === AUTOR_CLIENTE
  switch (f.a) {
    case 'OPEN': return { titulo: 'Registrado', detalle: t.canal === CANAL ? 'Lo registraste en Mi Portal.' : `Se registró por ${t.canal}.`, tono: 'accent' }
    case 'IN_PROGRESS': return { titulo: 'En atención', detalle: delCliente ? 'Respondiste lo que te pedimos; tu caso volvió a atención y el plazo se reanudó.' : f.de === 'PENDING_CUSTOMER' ? 'Retomamos la atención y el plazo se reanudó.' : null, tono: 'default' }
    case 'PENDING_CUSTOMER': return { titulo: 'Pendiente de tu respuesta', detalle: 'Necesitamos un dato o un documento tuyo para seguir. Mientras tanto, el plazo queda en pausa.', tono: 'accent' }
    case 'ESCALATED': return { titulo: 'En revisión especializada', detalle: null, tono: 'default' }
    case 'RESOLVED': return { titulo: 'Resuelto · por confirmar', detalle: 'Revisa la solución y confírmala o recházala.', tono: 'success' }
    case 'CLOSED': return {
      titulo: 'Cerrado',
      detalle: delCliente ? 'Confirmaste la solución (cierre formal en Mi Portal).' : cierreAutomatico(f) ? `Se cerró solo: no hubo respuesta en ${cierreAutomatico(f)} días hábiles.` : null,
      tono: 'success',
    }
    case 'REOPENED': return { titulo: 'Reabierto', detalle: delCliente && f.nota ? `Rechazaste la solución: «${f.nota}»` : null, tono: 'danger' }
  }
}

/** Mensajes visibles del caso. El autor del lado de Aybar es «Aybar», nunca el gestor (RN-SVC-044). */
export function mensajes(d: Datos, t: Ticket): (Interaccion & { quien: 'Tú' | 'Aybar' })[] {
  return d.interacciones
    .filter((i) => i.ticketId === t.id && i.visible)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .map((i) => ({ ...i, quien: i.tipo === 'cliente' ? 'Tú' : 'Aybar' }))
}

export interface Aviso { id: string; fecha: Date; estado: string; canales: string[]; destino: string; texto: string; enlace: string }
/** HU-065 CA-02: un aviso por correo y WhatsApp en cada cambio de estado, con el nuevo estado y el enlace al ticket (simulado). */
export function avisos(d: Datos, t: Ticket, c: Cliente, enlace: string): Aviso[] {
  return d.filasEstado
    .filter((f) => f.ticketId === t.id && f.de !== null)
    .map((f) => ({
      id: `av-${f.id}`, fecha: f.fecha, estado: ESTADO_CLIENTE[f.a].texto, canales: ['Correo', 'WhatsApp'],
      destino: `${enmascararCorreo(c.correo)} · ${enmascararTelefono(c.telefono)}`,
      texto: `Tu ticket ${t.numero} ahora está «${ESTADO_CLIENTE[f.a].texto}».${cierreAutomatico(f) ? ' Se cerró automáticamente.' : ''}`,
      enlace,
    }))
    .reverse()
}

// ------------------------------------------------------------------ registrar (HU-064)
export interface Entrada { loteId: string; tipo: string; subtipo: string; descripcion: string; adjuntos: Adjunto[] }

export function validarEntrada(e: Entrada, lotes: Lote[]): { campo: string; mensaje: string }[] {
  const err: { campo: string; mensaje: string }[] = []
  const tipo = TIPOS.find((t) => t.id === e.tipo)
  if (!lotes.some((l) => l.id === e.loteId)) err.push({ campo: 'lote', mensaje: 'Elige el lote o contrato sobre el que consultas.' })
  if (!tipo) err.push({ campo: 'tipo', mensaje: 'Elige el tipo de solicitud.' })
  else if (tipo.libro) err.push({ campo: 'tipo', mensaje: 'Los reclamos y las quejas se registran en el Libro de Reclamaciones, no como ticket.' })
  else if (!tipo.subtipos.includes(e.subtipo)) err.push({ campo: 'subtipo', mensaje: 'Elige el detalle de tu solicitud.' })
  const desc = e.descripcion.trim()
  if (desc.length < 15) err.push({ campo: 'descripcion', mensaje: 'Cuéntanos tu caso en al menos 15 caracteres.' })
  if (e.adjuntos.length > ADJUNTOS.maxArchivos) err.push({ campo: 'adjuntos', mensaje: `Máximo ${ADJUNTOS.maxArchivos} archivos.` })
  for (const a of e.adjuntos) {
    if (a.tamano > ADJUNTOS.maxBytes || !ADJUNTOS.accept.split(',').includes(a.tipo)) err.push({ campo: 'adjuntos', mensaje: `«${a.nombre}» no se admite: ${ADJUNTOS.texto}` })
  }
  return err
}

const resumenDe = (subtipo: string, desc: string) => {
  const r = `${subtipo}: ${desc.trim().replace(/\s+/g, ' ')}`
  return r.length > 90 ? `${r.slice(0, 89).trimEnd()}…` : r
}

/**
 * Crea el ticket con canal «Mi Portal» (CA-01): datos del cliente desde el maestro (CA-03), SLA congelado con la política
 * vigente (HU-003), área y responsable por el flujo del tipo (HU-043; sin flujo, queda en la bandeja). Devuelve el ticket y
 * si quedó asignado o en cola.
 */
export function crearTicket(n: Nucleo, d0: Datos, c: Cliente, lote: Lote, e: Entrada): [Datos, { ticket: Ticket; resultado: 'asignado' | 'cola' }] {
  const errores = validarEntrada(e, [lote])
  if (errores.length) throw n.validacion(errores)
  const { empresaId, linea } = contratoDelLote(lote)
  if (!n.empresa(empresaId)) throw n.validacion([{ campo: 'lote', mensaje: 'No encontramos la razón social de ese contrato.' }])
  const ahora = d0.ahora, prioridad = 'MEDIUM'
  const s = n.sla(d0, e.tipo, prioridad, ahora)
  const sec = (d0.secuencias[empresaId] ?? 0) + 1
  let [id, d] = n.id(d0, 'tk')
  const ticket: Ticket = {
    id, numero: `${empresaId}-${String(sec).padStart(6, '0')}`, empresaId, linea, canal: CANAL, establecimiento: null,
    clienteId: c.id, tipo: e.tipo, subtipo: e.subtipo, prioridad, resumen: resumenDe(e.subtipo, e.descripcion), descripcion: e.descripcion.trim(),
    estado: 'OPEN', area: 'ATC', responsable: null, eje: 1, abierto: ahora, registradoPor: AUTOR_SERVICIO,
    politica: { id: s.politica.id, version: s.politica.version, origen: s.origen, respuestaH: s.politica.respuestaH, resolucionH: s.politica.resolucionH },
    venceRespuesta: s.venceRespuesta, venceResolucion: s.venceResolucion, primeraRespuesta: null, primeraResolucion: null,
    ultimaResolucion: null, cierre: null, reaperturas: 0, venceReapertura: null, inicioCiclo: ahora,
  }
  d = { ...d, secuencias: { ...d.secuencias, [empresaId]: sec }, tickets: [...d.tickets, ticket] }
  d = n.registrarFlujo(d, id)
  let fe: string
  ;[fe, d] = n.id(d, 'fe')
  d = { ...d, filasEstado: [...d.filasEstado, { id: fe, ticketId: id, fecha: ahora, de: null, a: 'OPEN', autor: AUTOR_CLIENTE, nota: null }] }
  ;[fe, d] = n.id(d, 'fa')
  d = { ...d, filasAsignacion: [...d.filasAsignacion, { id: fe, ticketId: id, fecha: ahora, deArea: null, deResponsable: null, aArea: 'ATC', aResponsable: null, motivo: 'ALTA', nota: 'Registrado por el cliente en Mi Portal', autor: AUTOR_SERVICIO }] }
  let resultado: 'asignado' | 'cola'
  ;[d, resultado] = n.asignarPorFlujo(d, id)
  const asignado = n.ticket(d, id)
  d = n.reemplazar(d, { ...asignado, eje: asignado.area === 'ATC' ? 1 : 2 })
  if (e.adjuntos.length) {
    let ii: string
    ;[ii, d] = n.id(d, 'in')
    d = { ...d, interacciones: [...d.interacciones, { id: ii, ticketId: id, fecha: ahora, tipo: 'cliente', visible: true, canal: CANAL, autor: AUTOR_CLIENTE, texto: 'Adjunto de la solicitud', adjuntos: e.adjuntos }] }
  }
  d = n.evento(d, 'ticket_creado', { canal: 'mi_portal', tipo: e.tipo, subtipo: e.subtipo, prioridad, empresa: empresaId })
  d = n.evento(d, 'sla_congelado', { politica: `${s.politica.id} v${s.politica.version}`, fr_due: s.venceRespuesta.toISOString(), res_due: s.venceResolucion.toISOString() })
  return [d, { ticket: n.ticket(d, id), resultado }]
}

// ------------------------------------------------------------------ responder, confirmar, rechazar (HU-066)
const firmarUltimaFila = (d: Datos, ticketId: string, autor: string | null): Datos => {
  const filas = d.filasEstado
  for (let i = filas.length - 1; i >= 0; i--) {
    if (filas[i]!.ticketId === ticketId) return { ...d, filasEstado: filas.map((f, j) => (j === i ? { ...f, autor } : f)) }
  }
  return d
}
const exigir = (n: Nucleo, t: Ticket | null, c: string, estado: Estado, que: string): Ticket => {
  if (!t || t.clienteId !== c) throw n.error(404, 'no-encontrado', 'No encontramos ese ticket entre los tuyos.')
  if (t.estado !== estado) throw n.error(409, 'estado-cambiado', `El ticket ya no está «${ESTADO_CLIENTE[estado].texto}»: no se puede ${que}. Recarga para ver su estado actual.`)
  return t
}

/**
 * CA-01: la respuesta queda como interacción visible del cliente y el ticket vuelve a «en atención». El cambio de estado es el
 * de la consola (V en «comun»), que reanuda el SLA pausado en «pendiente del cliente» (scripts/hu066-sla.js).
 */
export function responder(n: Nucleo, d0: Datos, ticketId: string, clienteId: string, texto: string, adjuntos: Adjunto[]): [Datos, void] {
  const t = exigir(n, d0.tickets.find((x) => x.id === ticketId) ?? null, clienteId, 'PENDING_CUSTOMER', 'responder')
  const err: { campo: string; mensaje: string }[] = []
  if (texto.trim().length < 3) err.push({ campo: 'respuesta', mensaje: 'Escribe tu respuesta.' })
  for (const a of adjuntos) if (a.tamano > ADJUNTOS.maxBytes || !ADJUNTOS.accept.split(',').includes(a.tipo)) err.push({ campo: 'adjuntos', mensaje: `«${a.nombre}» no se admite: ${ADJUNTOS.texto}` })
  if (err.length) throw n.validacion(err)
  let [id, d] = n.id(d0, 'in')
  d = { ...d, interacciones: [...d.interacciones, { id, ticketId: t.id, fecha: d.ahora, tipo: 'cliente', visible: true, canal: CANAL, autor: AUTOR_CLIENTE, texto: texto.trim(), adjuntos }] }
  d = n.evento(d, 'interacción_registrada', { tipo: 'cliente', visible: true, adjuntos: adjuntos.length })
  d = n.cambiarEstado(d, t.id, 'IN_PROGRESS', null, 'Respuesta del cliente en Mi Portal')
  d = firmarUltimaFila(d, t.id, AUTOR_CLIENTE)
  return [d, undefined]
}

/** CA-02: cierre formal en Mi Portal (RN-SVC-023); la transición a cerrado dispara la encuesta (HU-019) en el chunk. */
export function confirmar(n: Nucleo, d0: Datos, ticketId: string, clienteId: string): [Datos, void] {
  const t = exigir(n, d0.tickets.find((x) => x.id === ticketId) ?? null, clienteId, 'RESOLVED', 'confirmar la solución')
  let d = n.cambiarEstado(d0, t.id, 'CLOSED', null, 'Cierre formal confirmado por el cliente en Mi Portal')
  d = firmarUltimaFila(d, t.id, AUTOR_CLIENTE)
  d = n.evento(d, 'portal_cierre', { resultado: 'confirmado' })
  return [d, undefined]
}

/** CA-03: el ticket se reabre con el motivo en la bitácora y sigue en el área que lo resolvió. */
export function rechazar(n: Nucleo, d0: Datos, ticketId: string, clienteId: string, motivo: string): [Datos, void] {
  const t = exigir(n, d0.tickets.find((x) => x.id === ticketId) ?? null, clienteId, 'RESOLVED', 'rechazar la solución')
  const m = motivo.trim().replace(/\s+/g, ' ')
  if (m.length < 10) throw n.validacion([{ campo: 'motivo', mensaje: 'Cuéntanos en al menos 10 caracteres por qué no estás conforme.' }])
  const pii = n.pii(m)
  if (pii) throw n.validacion([{ campo: 'motivo', mensaje: 'No escribas tu DNI ni números de tarjeta: el motivo queda en la bitácora del ticket.' }])
  let d = n.cambiarEstado(d0, t.id, 'REOPENED', null, m)
  d = firmarUltimaFila(d, t.id, AUTOR_CLIENTE)
  d = n.evento(d, 'portal_cierre', { resultado: 'rechazado' })
  return [d, undefined]
}

/** Desde cuándo se cierra solo un ticket resuelto sin respuesta (CA-04): fin del n-ésimo día hábil configurado desde la resolución. */
export function cierreAutomaticoDesde(n: Nucleo, t: Ticket, d: Datos = n.datos()): Date | null {
  return n.limiteConfirmacion(d, t)
}
/**
 * CA-04: la regla que el job del sistema aplica a cada ticket resuelto cuyo plazo terminó (scripts/hu066-sla.js, en «comun»).
 * Mi Portal ya no la dispara: el cierre lo hace el job (Herramientas › Simulación › reloj o «Ejecutar el job ahora»).
 */
export function cerrarSinRespuesta(n: Nucleo, d0: Datos, ticketId: string, clienteId: string): [Datos, void] {
  const t = exigir(n, d0.tickets.find((x) => x.id === ticketId) ?? null, clienteId, 'RESOLVED', 'cerrarlo automáticamente')
  return [n.cerrarSinRespuesta(d0, t.id), undefined]
}
