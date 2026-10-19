import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ELEMENTOS_HANDOFF } from '../src/prototipo/datos/catalogos.ts'
import { CLIENTES, INTERESADO_ID } from '../src/prototipo/datos/clientes.ts'
import { datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'
import { enviarHandoff, marcarSenales } from '../src/prototipo/servicio/conflicto.ts'
import { registrarAsiento } from '../src/prototipo/servicio/libro.ts'
import { ErrorSimulado, conAhora, crearTicket } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../src/prototipo/servicio/nucleo.ts'
import {
  buscarClientes360,
  buscarDocumentos,
  cambiarFuente,
  coincidencias,
  consultar360,
  consultarMotor,
  crearTicketInteresado,
  evaluarRiesgos,
  exposicionDe,
  fichaPorTelefono,
  finalizarLlamada,
  iniciarLlamada,
  legalActualiza,
  priorizadosPorDenuncia,
  reintentarSyncLegal,
  sincDe,
  vincularInteresado,
} from '../src/prototipo/servicio/ola7.ts'
import { ejecutarJobs } from '../src/prototipo/servicio/jobs.ts'

/** Prototipo G2, ola 7 (HU-ATC-040 a 042 y 049 a 053). */

const GESTOR = 'p-crojas'
const SUPERVISOR = 'p-gnunez'
const COORDINADOR = 'p-avaldivia'
const MESA = 'p-vortiz'
const LEGAL = 'p-pvilchez'
const AHORA = new Date(2026, 9, 15, 11, 0)
const rechaza = (fn: () => unknown, status: number) => assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status)
const BASE: EntradaTicket = { canal: 'Teléfono', clienteId: 'cli-001', empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', tipo: 'CTA', prioridad: 'MEDIUM', resumen: 'Consulta', descripcion: 'Descripción' }
const nuevo = (d: Datos = datosVacios(AHORA), e: Partial<EntradaTicket> = {}) => crearTicket(d, { ...BASE, ...e }, GESTOR)
const SIN_CLIENTE = { canal: BASE.canal, empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', tipo: 'CTA', prioridad: BASE.prioridad, resumen: 'Pide información', descripcion: 'Quiere comprar un lote' } as const
const HANDOFF = Object.fromEntries(ELEMENTOS_HANDOFF.map((e) => [e.id, 'Dato de prueba'])) as Record<(typeof ELEMENTOS_HANDOFF)[number]['id'], string>
const ASIENTO = { tipo: 'RECLAMO', establecimiento: 'Oficina Carabayllo', hechos: 'Cobro indebido de gastos', pedido: 'Devolución', monto: 2000, moneda: 'PEN' } as const

test('HU-049 CA-01 y CA-03: se busca por DNI, nombre, código, teléfono, lote y N.º de ticket', () => {
  const c = CLIENTES[4]
  const [d, t] = nuevo(datosVacios(AHORA), { clienteId: c.id })
  assert.equal(coincidencias(d, c.dni.slice(0, 5)).find((r) => r.cliente.id === c.id)?.criterio, 'DNI')
  assert.equal(coincidencias(d, c.nombre.split(' ')[0] + ' ' + c.nombre.split(' ')[1]).find((r) => r.cliente.id === c.id)?.criterio, 'Nombre')
  assert.equal(coincidencias(d, c.id)[0].cliente.id, c.id)
  assert.equal(coincidencias(d, c.telefono.slice(-7)).find((r) => r.cliente.id === c.id)?.criterio, 'Teléfono')
  assert.ok(coincidencias(d, c.proyectos[0].split(' · ')[0]).some((r) => r.cliente.id === c.id), 'por lote')
  assert.equal(coincidencias(d, t.numero)[0]?.cliente.id, c.id, 'por N.º de ticket')
  assert.deepEqual(coincidencias(d, 'ab'), [], 'menos de 3 caracteres')
  const nombres = coincidencias(d, 'Quispe')
  assert.equal(new Set(nombres.map((r) => r.cliente.id)).size, nombres.length, 'cada cliente sale una vez')
})

test('HU-049: con SIGDA/TAXON caído la búsqueda responde 503 y con él arriba emite el evento', () => {
  const d = datosVacios(AHORA)
  const [d2, r] = buscarClientes360(d, CLIENTES[0].dni.slice(0, 4), GESTOR)
  assert.ok(r.length >= 1)
  assert.equal(d2.eventos.at(-1)?.nombre, 'cliente_buscado')
  rechaza(() => buscarClientes360(cambiarFuente(d, 'SIGDA', true), 'Quispe', GESTOR), 503)
  rechaza(() => buscarClientes360(d, 'Quispe', 'p-mtello'), 403)
})

test('HU-050 CA-01: la consulta 360 trae las seis secciones y no copia nada al servicio', () => {
  const [d] = nuevo()
  const [d2, v] = consultar360(d, 'cli-001', GESTOR)
  for (const s of [v.lotes, v.cuotas, v.correos, v.documentos, v.tickets, v.llamadas]) assert.equal(s.estado, 'ok')
  assert.equal(d2.tickets, d.tickets)
  assert.equal(d2.interacciones, d.interacciones)
  assert.equal(d2.eventos.at(-1)?.nombre, 'consulta360')
  assert.equal(v.tickets.estado === 'ok' && v.tickets.datos.length, 1)
})

test('HU-050 CA-02: un rol sin permiso ve la sección restringida y el resto sí', () => {
  const [d] = nuevo()
  const [, v] = consultar360(d, 'cli-001', COORDINADOR)
  assert.equal(v.cuotas.estado, 'restringido')
  assert.equal(v.documentos.estado, 'restringido')
  assert.equal(v.lotes.estado, 'ok')
  assert.equal(consultar360(d, 'cli-001', MESA)[1].cuotas.estado, 'restringido')
})

test('HU-050 CA-03: con Cobranza caída solo cuotas dice «no disponible», con la hora del intento', () => {
  const [d] = nuevo()
  const [, v] = consultar360(cambiarFuente(d, 'COBRANZA', true), 'cli-001', GESTOR)
  assert.equal(v.cuotas.estado, 'no-disponible')
  assert.ok(v.cuotas.estado === 'no-disponible' && v.cuotas.intento.getTime() === AHORA.getTime())
  assert.equal(v.lotes.estado, 'ok')
  assert.equal(v.correos.estado, 'ok')
})

test('HU-051 CA-01: un cliente no encontrado se registra como interesado, pendiente de vincular', () => {
  const [d, t] = crearTicketInteresado(datosVacios(AHORA), SIN_CLIENTE, { nombre: 'Teodoro Valverde', telefono: '+51 900 555 014', dni: '' }, GESTOR)
  assert.equal(t.clienteId, INTERESADO_ID)
  assert.equal(d.interesados[0].estado, 'PENDIENTE')
  assert.equal(d.interesados[0].motivo, 'NO_ENCONTRADO')
  assert.equal(d.eventos.at(-1)?.nombre, 'consulta_excepcion')
  assert.throws(
    () => crearTicketInteresado(datosVacios(AHORA), SIN_CLIENTE, { nombre: '', telefono: '12', dni: '123' }, GESTOR),
    (e: unknown) => e instanceof ErrorSimulado && ['nombreInteresado', 'telefonoInteresado', 'dniInteresado'].every((c) => e.campos.some((x) => x.campo === c)),
  )
  rechaza(() => consultar360(d, INTERESADO_ID, GESTOR), 404)
})

test('HU-051 CA-02 y CA-03: con SIGDA caído se registra y, al volver, el sistema lo vincula por el DNI', () => {
  const dni = CLIENTES[6].dni
  const caido = cambiarFuente(datosVacios(AHORA), 'SIGDA', true)
  const [d, t] = crearTicketInteresado(caido, SIN_CLIENTE, { nombre: 'Persona X', telefono: '900123456', dni }, GESTOR)
  assert.equal(d.interesados[0].motivo, 'SIGDA_CAIDO')
  rechaza(() => vincularInteresado(d, t.id, CLIENTES[6].id, GESTOR), 503)
  const vuelto = cambiarFuente(d, 'SIGDA', false)
  assert.equal(vuelto.interesados[0].estado, 'VINCULADO')
  assert.equal(vuelto.tickets.find((x) => x.id === t.id)?.clienteId, CLIENTES[6].id)
  assert.match(vuelto.interacciones.at(-1)?.texto ?? '', /reintento automático/)
  rechaza(() => vincularInteresado(vuelto, t.id, CLIENTES[6].id, GESTOR), 409)
})

test('HU-051: la vinculación manual elige un cliente del maestro y deja la nota', () => {
  const [d, t] = crearTicketInteresado(datosVacios(AHORA), SIN_CLIENTE, { nombre: 'Persona Y', telefono: '900123456', dni: '' }, GESTOR)
  const d2 = vincularInteresado(d, t.id, 'cli-003', GESTOR)
  assert.equal(d2.tickets[0].clienteId, 'cli-003')
  assert.equal(d2.interacciones.at(-1)?.visible, false)
  rechaza(() => vincularInteresado(d, t.id, INTERESADO_ID, GESTOR), 400)
})

test('HU-052 CA-01: el motor responde la consulta del lote y solo registra que se consultó', () => {
  const [d, t] = nuevo()
  const lote = consultar360(d, 'cli-001', GESTOR)[1].lotes
  const loteId = lote.estado === 'ok' ? lote.datos[0].id : ''
  const [d2, r] = consultarMotor(d, t.id, 'saldo', loteId, GESTOR)
  assert.match(r.texto, /Saldo de/)
  assert.equal(d2.consultasMotor.length, 1)
  assert.ok(!JSON.stringify(d2.consultasMotor).includes('S/'), 'no se guarda el valor')
})

test('HU-052 CA-02 y CA-03: motor caído avisa sin bloquear; sin permiso rechaza con 403 y deja el intento', () => {
  const [d, t] = nuevo()
  const loteId = `cli-001-L1`
  rechaza(() => consultarMotor(cambiarFuente(d, 'MOTOR', true), t.id, 'saldo', loteId, GESTOR), 503)
  assert.throws(
    () => consultarMotor(d, t.id, 'saldo', loteId, MESA),
    (e: unknown) => e instanceof ErrorSimulado && e.status === 403 && e.auditar,
  )
  assert.match(consultarMotor(d, t.id, 'estado-contrato', loteId, MESA)[1].texto, /Contrato/, 'el estado del contrato sí lo ve')
  const [d2, i] = crearTicketInteresado(datosVacios(AHORA), SIN_CLIENTE, { nombre: 'Persona Z', telefono: '900123456', dni: '' }, GESTOR)
  rechaza(() => consultarMotor(d2, i.id, 'saldo', loteId, GESTOR), 409)
})

test('HU-053 CA-01: la búsqueda por significado encuentra la adenda con otras palabras y da el fragmento', () => {
  const [d] = nuevo()
  const [, r] = buscarDocumentos(d, 'cli-001', 'adenda de cambio de lote', GESTOR)
  assert.equal(r.resultados[0].documento.tipo, 'Adenda')
  assert.match(r.resultados[0].fragmento, /reubica/)
  const [, otra] = buscarDocumentos(d, 'cli-001', 'modificación del terreno asignado', GESTOR)
  assert.equal(otra.resultados[0].documento.tipo, 'Adenda', 'por sinónimos, sin una sola palabra exacta')
})

test('HU-053 CA-02 y CA-03: el documento restringido no aparece; sin coincidencias se sugieren palabras exactas', () => {
  const [d] = nuevo()
  const [, gestor] = buscarDocumentos(d, 'cli-002', 'carta notarial de requerimiento', GESTOR)
  assert.ok(!gestor.resultados.some((r) => r.documento.sensible))
  const [, sup] = buscarDocumentos(d, 'cli-002', 'carta notarial de requerimiento', SUPERVISOR)
  assert.equal(sup.resultados[0].documento.tipo, 'Carta notarial')
  const [, nada] = buscarDocumentos(d, 'cli-001', 'helicóptero submarino', GESTOR)
  assert.equal(nada.resultados.length, 0)
  assert.ok(nada.sugerencias.length > 0)
  rechaza(() => buscarDocumentos(d, 'cli-001', 'contrato', COORDINADOR), 403)
  rechaza(() => buscarDocumentos(cambiarFuente(d, 'CONTRATOS', true), 'cli-001', 'contrato', GESTOR), 503)
})

test('HU-042 CA-01 y CA-03: el teléfono que llama abre la ficha y los tickets abiertos; el desconocido, la búsqueda', () => {
  const c = CLIENTES[2]
  const [d, t] = nuevo(datosVacios(AHORA), { clienteId: c.id })
  const f = fichaPorTelefono(d, c.telefono, GESTOR)
  assert.equal(f.cliente?.id, c.id)
  assert.deepEqual(f.abiertos.map((x) => x.id), [t.id])
  assert.equal(fichaPorTelefono(d, '+51 900 000 000', GESTOR).cliente, null)
  rechaza(() => fichaPorTelefono(cambiarFuente(d, 'SIGDA', true), c.telefono, GESTOR), 503)
})

test('HU-042 CA-02: la llamada finalizada queda como interacción con duración y grabación', () => {
  const [d, t] = nuevo()
  const [d2, l] = finalizarLlamada(d, { clienteId: 'cli-001', ticketId: t.id, duracionS: 125 }, GESTOR)
  assert.equal(l.grabacion, 'REC-0001')
  assert.match(d2.interacciones.at(-1)?.texto ?? '', /2 min 05 s · Grabación REC-0001/)
  assert.equal(d2.eventos.at(-1)?.nombre, 'llamada_registrada')
  assert.equal(finalizarLlamada(d2, { clienteId: 'cli-001', ticketId: null, duracionS: 5 }, GESTOR)[1].grabacion, 'REC-0002')
  rechaza(() => finalizarLlamada(d, { clienteId: 'cli-001', ticketId: t.id, duracionS: 5 }, 'p-mtello'), 403)
})

test('HU-049 CA-02: «Llamar» queda en el ticket y falla con el call center caído', () => {
  const [d, t] = nuevo()
  const [d2, l] = iniciarLlamada(d, 'cli-001', t.id, GESTOR)
  assert.equal(l.sentido, 'SALIENTE')
  assert.match(d2.interacciones.at(-1)?.texto ?? '', /Llamada saliente/)
  rechaza(() => iniciarLlamada(cambiarFuente(d, 'CALLCENTER', true), 'cli-001', t.id, GESTOR), 503)
  rechaza(() => iniciarLlamada(d, INTERESADO_ID, null, GESTOR), 409)
})

test('HU-040 CA-01: al derivar a Eje 3 el caso aparece en Legal con el paquete mínimo', () => {
  const [d, t] = nuevo()
  const d2 = enviarHandoff(d, t.id, HANDOFF, GESTOR)
  const s = sincDe(d2, t.id)
  assert.equal(s?.estado, 'ENVIADO')
  assert.match(s?.idLegal ?? '', /^LEG-0001$/)
  assert.equal(s?.paquete, 6)
})

test('HU-040 CA-03: con Legal caído el envío queda en cola, se reintenta y al volver se envía', () => {
  const [d, t] = nuevo()
  const d2 = enviarHandoff(cambiarFuente(d, 'LEGAL', true), t.id, HANDOFF, GESTOR)
  assert.equal(sincDe(d2, t.id)?.estado, 'EN_COLA')
  const [d3, n] = reintentarSyncLegal(d2)
  assert.equal(n, 0)
  assert.equal(sincDe(d3, t.id)?.intentos, 2)
  const [d4] = ejecutarJobs(d3)
  assert.equal(sincDe(d4, t.id)?.intentos, 3, 'el job también reintenta')
  const d5 = cambiarFuente(d4, 'LEGAL', false)
  assert.equal(sincDe(d5, t.id)?.estado, 'ENVIADO')
  assert.ok(sincDe(d5, t.id)?.idLegal)
})

test('HU-040 CA-02: lo que Legal resuelve se refleja en el ticket sin registro manual', () => {
  const [d, t] = nuevo()
  let d2 = enviarHandoff(d, t.id, HANDOFF, GESTOR)
  d2 = legalActualiza(d2, t.id, 'EN_REVISION', '')
  assert.equal(sincDe(d2, t.id)?.estado, 'EN_REVISION')
  d2 = legalActualiza(d2, t.id, 'RESUELTO', 'Caso resuelto por Legal')
  assert.equal(d2.tickets[0].estado, 'RESOLVED')
  assert.equal(d2.filasEstado.at(-1)?.autor, null, 'cambio del sistema')
  assert.equal(sincDe(d2, t.id)?.resolucion, 'Caso resuelto por Legal')
  const [d3, t3] = nuevo()
  rechaza(() => legalActualiza(enviarHandoff(cambiarFuente(d3, 'LEGAL', true), t3.id, HANDOFF, GESTOR), t3.id, 'RESUELTO', 'x'), 409)
  void LEGAL
})

test('HU-041 CA-01: la exposición es el monto más el 8 % anual al día', () => {
  let [d, t] = nuevo(datosVacios(AHORA), { tipo: 'REC' })
  d = registrarAsiento(d, t.id, ASIENTO, GESTOR)[0]
  assert.equal(exposicionDe(d, t)?.total, 2000, 'todo reclamo con monto calcula su exposición')
  assert.equal(priorizadosPorDenuncia(d).length, 0, 'pero sin señales no se prioriza')
  d = marcarSenales(d, t.id, ['INDECOPI'], GESTOR)
  const e0 = exposicionDe(d, t)
  assert.equal(e0?.total, 2000)
  const e1 = exposicionDe(conAhora(d, new Date(2026, 10, 14, 11, 0)), t)
  assert.equal(e1?.dias, 30)
  assert.equal(e1?.interes, Math.round(2000 * 0.08 * (30 / 365) * 100) / 100)
  assert.equal(e1?.total, 2000 + (e1?.interes ?? 0))
})

test('HU-041 CA-03: sin monto la exposición queda «por estimar» y el caso no se descarta', () => {
  let [d, t] = nuevo()
  d = marcarSenales(d, t.id, ['ABOGADO'], GESTOR)
  assert.equal(exposicionDe(d, t)?.total, null)
  assert.equal(priorizadosPorDenuncia(d).length, 1)
  assert.equal(evaluarRiesgos(d)[1], 0, 'sin monto no hay alerta, pero sigue priorizado')
})

test('HU-041 CA-01/02: se prioriza por exposición y se alerta a Legal una sola vez', () => {
  let [d, a] = nuevo(datosVacios(AHORA), { tipo: 'REC' })
  let b
  ;[d, b] = nuevo(d, { tipo: 'REC', clienteId: 'cli-002' })
  d = registrarAsiento(d, a.id, { ...ASIENTO, monto: 900 }, GESTOR)[0]
  d = registrarAsiento(d, b.id, { ...ASIENTO, monto: 4000 }, GESTOR)[0]
  d = marcarSenales(marcarSenales(d, a.id, ['INDECOPI'], GESTOR), b.id, ['CARTA_NOTARIAL'], GESTOR)
  assert.deepEqual(priorizadosPorDenuncia(d).map((x) => x.ticket.id), [b.id, a.id])
  const [d2, n] = evaluarRiesgos(d)
  assert.equal(n, 2)
  assert.equal(d2.alertasRiesgo[0].destinatario, 'p-pvilchez')
  assert.ok(d2.alertasRiesgo[0].venceLegal, 'antes del vencimiento del plazo legal')
  assert.equal(evaluarRiesgos(d2)[1], 0, 'no se repite')
})

test('Semilla de la ola 7: un interesado por vincular, llamadas registradas y alertas ya emitidas', () => {
  const d = sembrar()
  assert.equal(d.interesados.filter((i) => i.estado === 'PENDIENTE').length, 1)
  assert.equal(d.llamadas.length, 2)
  assert.ok(d.sincLegal.length >= 1 && d.sincLegal.every((s) => s.estado === 'ENVIADO'))
  assert.ok(priorizadosPorDenuncia(d).some((x) => x.exposicion.total === null), 'hay casos por estimar')
  assert.ok(d.alertasRiesgo.length >= 1)
  assert.equal(d.fuentesCaidas.length, 0)
  assert.equal(d.eventos.length, 0)
})
