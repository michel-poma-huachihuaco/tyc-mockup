import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ErrorSimulado, cambiarEstado, crearTicket } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../src/prototipo/servicio/nucleo.ts'
import {
  aplicarFrase,
  cerrarEnSala,
  derivarEstacion4,
  detectarGatillo,
  ejecutarAuditoriaDatos,
  generarInforme,
  llamarApiUrbe,
  medirEncuestas,
  npsPreliminar,
  reabrirCasoFest,
  redistribuir,
  registrarCasoFest,
  registrarEnSistema,
  responderEncuesta,
  simularRegistroParalelo,
  ticketsEnRiesgo,
  vincularContrato,
  ETIQUETA_FEST,
} from '../src/prototipo/servicio/ola5.ts'
import { datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'

/** Prototipo G2, ola 5 (HU-ATC-017, 018, 019, 030, 031, 032, 037, 038, 039). */

const GESTOR = 'p-crojas'
const CX = 'p-lbenavides'
const MODERADOR = 'p-fmoreno'
const AHORA = new Date(2026, 9, 15, 11, 0)
const rechaza = (fn: () => unknown, status: number) => assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status)

const CIT: EntradaTicket = { canal: 'Correo', clienteId: 'cli-019', empresaId: 'ACI', linea: 'Servicios de ciudad', establecimiento: '', tipo: 'CIT', prioridad: 'MEDIUM', resumen: 'Luminaria', descripcion: 'Luminaria caída' }
const ticketCit = (d: Datos = datosVacios(AHORA)) => crearTicket(d, CIT, GESTOR)

test('HU-017 CA-01 y CA-02: vincula solo un CITY_SERVICE_FEE; sin contrato también se guarda', () => {
  const [d, t] = ticketCit()
  assert.equal(d.vinculosCiudad.length, 0, 'CA-02 sin contrato ni unidad')
  rechaza(() => vincularContrato(d, t.id, 'CTR-2024-0871', GESTOR), 400)
  const d2 = vincularContrato(d, t.id, 'CSF-2026-0113', GESTOR)
  assert.equal(d2.vinculosCiudad[0].contratoId, 'CSF-2026-0113')
})

test('HU-018 CA-01 y CA-03: el API crea un CITY_INCIDENT con credencial válida y rechaza sin ella', () => {
  const [d, ok] = llamarApiUrbe(datosVacios(AHORA), { credencial: 'valida', accion: 'crear', resumen: 'Poste inclinado', numero: '' })
  assert.equal(ok.estado, 201)
  assert.match(ok.ticketNumero ?? '', /^ACI-/)
  assert.equal(d.tickets[0].tipo, 'CIT')
  for (const c of ['vencida', 'ausente'] as const) {
    const [d2, mal] = llamarApiUrbe(d, { credencial: c, accion: 'crear', resumen: 'x', numero: '' })
    assert.equal(mal.estado, 401)
    assert.equal(d2.tickets.length, d.tickets.length, 'no crea nada')
    assert.equal(d2.urbe.llamadas.length, d.urbe.llamadas.length + 1, 'queda en el log')
  }
  assert.equal(llamarApiUrbe(d, { credencial: 'valida', accion: 'consultar', resumen: '', numero: 'NO-1' })[1].estado, 404)
})

test('HU-018 CA-02: un cambio de estado de un ticket de UrbeMind publica un evento', () => {
  let [d, r] = llamarApiUrbe(datosVacios(AHORA), { credencial: 'valida', accion: 'crear', resumen: 'Poste', numero: '' })
  d = cambiarEstado(d, d.tickets[0].id, 'IN_PROGRESS', GESTOR)
  assert.deepEqual(d.urbe.eventos.map((e) => [e.numero, e.de, e.a]), [[r.ticketNumero, 'OPEN', 'IN_PROGRESS']])
  const [d2] = crearTicket(d, { ...CIT, resumen: 'Otro' }, GESTOR)
  const t2 = d2.tickets[1]
  assert.equal(cambiarEstado(d2, t2.id, 'IN_PROGRESS', GESTOR).urbe.eventos.length, 1, 'un ticket que no es de UrbeMind no publica')
})

test('HU-019: la encuesta se dispara al cerrar, se mide por tipo, área y gestor y se repite al reabrir', () => {
  let [d, t] = crearTicket(datosVacios(AHORA), { ...CIT, tipo: 'CTA' }, GESTOR)
  d = cambiarEstado(cambiarEstado(d, t.id, 'RESOLVED', GESTOR), t.id, 'CLOSED', GESTOR)
  assert.equal(d.encuestas.length, 1)
  assert.equal(d.encuestas[0].sujeto, 'SVC_TICKET')
  d = responderEncuesta(d, d.encuestas[0].id, 4, 6)
  assert.deepEqual(medirEncuestas(d, 'tipo').map((m) => [m.clave, m.csat, m.ces]), [['CTA', 4, 6]])
  assert.equal(medirEncuestas(d, 'area')[0].clave, 'ATC')
  assert.equal(medirEncuestas(d, 'gestor')[0].clave, GESTOR)
  d = cambiarEstado(cambiarEstado(cambiarEstado(d, t.id, 'REOPENED', GESTOR), t.id, 'RESOLVED', GESTOR), t.id, 'CLOSED', GESTOR)
  assert.deepEqual(d.encuestas.map((e) => e.ciclo), [0, 1], 'CA-03 nueva encuesta del nuevo ciclo')
  rechaza(() => responderEncuesta(d, d.encuestas[0].id, 5, 5), 409)
})

test('HU-030: el tablero marca los casos en riesgo y permite redistribuir antes de que venza', () => {
  const d0 = sembrar()
  const riesgo = ticketsEnRiesgo(d0)
  assert.ok(riesgo.length > 0)
  const t = riesgo.find((x) => x.area === 'COBRANZA')!
  rechaza(() => redistribuir(d0, t.id, 'p-jccama', GESTOR), 403)
  rechaza(() => redistribuir(d0, t.id, 'p-lccahuana', CX), 400)
  const otro = ['p-rsalazar', 'p-mpaz', 'p-jccama'].find((p) => p !== t.responsable)!
  const d = redistribuir(d0, t.id, otro, CX)
  assert.equal(d.tickets.find((x) => x.id === t.id)?.responsable, otro)
  assert.equal(d.filasAsignacion.at(-1)?.motivo, 'REASSIGNMENT_CARGA')
})

test('HU-031: el informe diario y el quincenal traen lo que piden los criterios', () => {
  let d = generarInforme(sembrar(), 'DIARIO', CX)
  d = generarInforme(d, 'QUINCENAL', CX)
  const diario = d.informes[0].datos.map(([k]) => k).join('|')
  assert.match(diario, /Tickets activos por eje.*NPS preliminar.*Derivaciones.*Cumplimiento de SLA/)
  assert.match(d.informes[1].datos.map(([k]) => k).join('|'), /NPS preliminar.*Adopción de Mi Portal/)
  assert.ok(d.informes[1].serie.length > 0)
  rechaza(() => generarInforme(d, 'DIARIO', GESTOR), 403)
  assert.notEqual(npsPreliminar(sembrar()), null)
})

test('HU-032: la auditoría exige cero registros paralelos y un hallazgo es gate no compensable', () => {
  let d = ejecutarAuditoriaDatos(datosVacios(AHORA), CX)
  assert.deepEqual([d.auditoriasDatos[0].cantidad, d.auditoriasDatos[0].gateNoCompensable], [0, false])
  d = ejecutarAuditoriaDatos(simularRegistroParalelo(d), CX)
  assert.deepEqual([d.auditoriasDatos[1].cantidad, d.auditoriasDatos[1].gateNoCompensable], [1, true])
})

const caso = (resumen = 'Propietario divaga sobre varios temas.') => registrarCasoFest(datosVacios(AHORA), { resumen, riesgo: 'MEDIO' }, MODERADOR)

test('HU-037 CA-01 y CA-02: las frases van en orden y la 6 exige registrar el caso para cerrar en sala', () => {
  let [d, c] = caso()
  rechaza(() => aplicarFrase(d, c.id, 4, '', MODERADOR), 409)
  for (const n of [1, 2, 3, 4]) d = aplicarFrase(d, c.id, n, n === 4 ? 'Se pidió concretar.' : '', MODERADOR)
  assert.equal(d.casosFest[0].frases[3].nota, 'Se pidió concretar.')
  for (const n of [5, 6]) d = aplicarFrase(d, c.id, n, '', MODERADOR)
  rechaza(() => cerrarEnSala(d, c.id, MODERADOR), 409)
  d = cerrarEnSala(registrarEnSistema(d, c.id, MODERADOR), c.id, MODERADOR)
  assert.equal(d.casosFest[0].estado, 'CERRADO_EN_SALA')
  assert.equal(d.casosFest[0].registro?.etiqueta, ETIQUETA_FEST)
  rechaza(() => registrarCasoFest(datosVacios(AHORA), { resumen: 'x', riesgo: 'BAJO' }, GESTOR), 403)
})

test('HU-038: una palabra gatillo exige derivar y un caso derivado no se reabre', () => {
  assert.deepEqual(detectarGatillo('Dice que fue una ESTAFA y un abuso'), ['estafa', 'abuso'])
  let [d, c] = caso('El propietario habla de un fraude en su contrato.')
  assert.deepEqual(d.casosFest[0].gatillo, ['fraude'])
  rechaza(() => cerrarEnSala(d, c.id, MODERADOR), 409)
  d = derivarEstacion4(d, c.id, MODERADOR)
  assert.equal(d.casosFest[0].estado, 'DERIVADO')
  assert.equal(d.casosFest[0].registro?.etiqueta, ETIQUETA_FEST, 'derivar lo registra con la etiqueta estándar')
  assert.throws(() => reabrirCasoFest(d, c.id, MODERADOR), (e: unknown) => e instanceof ErrorSimulado && e.auditar)
})

test('HU-038: una palabra gatillo dicha durante una frase también se detecta', () => {
  let [d, c] = caso()
  d = aplicarFrase(d, c.id, 1, 'Menciona un delito.', MODERADOR)
  assert.deepEqual(d.casosFest[0].gatillo, ['delito'])
})

test('HU-039: cada caso del evento tiene la etiqueta y su estado derivado sí o no', () => {
  const d = sembrar()
  assert.equal(d.casosFest.length, 2)
  assert.deepEqual(d.casosFest.map((c) => Boolean(c.derivado)), [false, true])
  assert.equal(d.casosFest[1].registro?.etiqueta, 'Atención especial — derivación a Legal')
})
