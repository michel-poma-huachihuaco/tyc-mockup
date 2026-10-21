// La Consulta 360 de Daniel (#/consulta360) sobre el modelo del mockup (20-oct, b3-k). La página mantiene su diseño; los datos y
// las reglas salen de aquí, que solo compone lo que ya usa la Consulta 360 del PO (pestaña Cliente del ticket y #/clientes/<id>):
//  · la vista de los 16 datos con su estado por rol y por fuente caída (Grafo360 › __vista360: la misma matriz de permisos);
//  · la API del modelo (buscar clientes, consultar 360, buscar documentos, motor de José, llamar) con su latencia, sus errores y su
//    auditoría (un intento sin permiso queda registrado);
//  · la simulación de fuentes caídas (Herramientas › Simulación), la misma que ve el resto del mockup.
// Lo de Daniel que no está en el modelo (textos de criterio y plataforma, registros de ejemplo de llamadas y correos, cláusulas,
// linderos y firmas del visor) se asigna a cada cliente del mockup por su índice (estable), con el cliente del mockup en lugar del
// titular de ejemplo.
import * as C from 'aybar:comun'
import * as G from 'aybar:Grafo360'
import { CLIENTES_360, CONTRATOS_ATC, type ContratoInmobiliarioAtc, type CuotaCronogramaContratoAtc } from './datos.ts'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClienteM { id: string; nombre: string; dni: string; telefono: string; correo: string; proyectos: string[] }
export interface LoteM { id: string; descripcion: string; precio: number; contrato: string; firmado: Date; estado: string }
export type EstadoDato = 'ok' | 'restringido' | 'caido'
export interface NodoV { id: string; n: string; fuentes: string[]; estado: EstadoDato; filas: [string, string][]; sem?: boolean }
export interface FuenteV { id: string; n: string; d: string; ms: number; fuente: string | null; caida: boolean }
export interface Vista { cliente: ClienteM; fuentes: FuenteV[]; nodos: NodoV[]; totalMs: number; venc: number; nTk: number }
export interface Persona { id: string; nombre: string; rol: string; area: string }
export interface TicketM { id: string; numero: string; clienteId: string; estado: string; resumen: string; abierto: Date; canal: string; area: string }
export interface Datos {
  ahora: Date
  tickets: TicketM[]
  llamadas: { clienteId: string; ticketId: string | null }[]
  fuentesCaidas: string[]
  casosResolucion: { clienteId: string; loteId: string; estado: string }[]
  garantias: { entregaId: string }[]
  [k: string]: any
}
export interface ErrorModelo { status?: number; codigo?: string; message?: string }

export const api = C.E as {
  buscarClientes360: (q: string) => Promise<{ cliente: ClienteM; criterio: string }[]>
  consultar360: (clienteId: string) => Promise<unknown>
  buscarDocumentos: (clienteId: string, q: string) => Promise<{ resultados: { documento: { titulo: string; tipo: string }; relevancia: number; fragmento: string }[]; sugerencias: string[] }>
  consultarMotor: (ref: { clienteId: string }, consulta: string, loteId: string) => Promise<{ consulta: string; texto: string; fecha: Date }>
  iniciarLlamada: (clienteId: string, ticketId: string | null) => Promise<{ grabacion: string; ticketId: string | null }>
}

/** Estado del mockup y persona de la sesión (hooks del chunk «comun»). */
export const usarModelo = (): { datos: Datos; persona: Persona } => ({ datos: C.k().datos as Datos, persona: C.A() })
export const avisar = (message: string, tone = 'info') => C.Wr({ message, tone })

export const vista360 = (datos: Datos, clienteId: string, persona: Persona): Vista | null => G.__vista360(datos, clienteId, persona)
export const cliente = (id: string): ClienteM | null => C.Kn(id)
export const lotesDe = (c: ClienteM): LoteM[] => C.Ut(c)
export const enmascarar = (dni: string) => C.qn(dni)
export const seccionesDe = (p: Persona) => C.At(p)
export const puede = (permiso: string, rol: string) => Boolean(C.sn[permiso]?.(rol))
export const CONSULTAS_MOTOR = C.yt

/** Sistema de origen de Daniel (id) → código de la fuente en la simulación del mockup (Tickets ATC es interno: no se cae). */
export const codigoFuente = (id: string): string | null => G.__fuentes360.find((s) => s.id === id)?.fuente ?? null
export const alternarFuente = (id: string, caida: boolean) => {
  const k = codigoFuente(id)
  if (k) C.O.fuente(k, caida)
}

/** Clientes a mano (los mismos del chip de la 360 del PO): cliente con lote entregado, con caso de resolución, con garantía, con
 * mora y reclamo del Libro, con llamada registrada, con dos tickets abiertos y sin tickets. */
export function clientesFrecuentes(datos: Datos): ClienteM[] {
  const entrega = C.Q.find((e) => e.id === datos.garantias[0]?.entregaId)?.clienteId
  const ids = ['cli-001', datos.casosResolucion[0]?.clienteId, entrega, 'cli-014', 'cli-022', 'cli-012', 'cli-009']
  return [...new Set(ids.filter((x): x is string => Boolean(x)))].map(cliente).filter((x): x is ClienteM => Boolean(x))
}

const indice = (clienteId: string) => Math.max(0, Number.parseInt(clienteId.replace(/\D/g, ''), 10) - 1 || 0)
export const iniciales = (nombre: string) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
/** «Villa Sol II · Mz. C Lt. 14» → proyecto «Villa Sol II» y unidad «Mz. C Lt. 14». */
export const proyectoDe = (desc: string) => desc.split(' · ')[0] ?? desc
export const unidadDe = (desc: string) => desc.split(' · ').slice(1).join(' · ') || desc
export const abierto = (t: TicketM) => t.estado !== 'CLOSED' && t.estado !== 'RESOLVED'

/** Ticket del mismo cliente por canal: el más reciente con correo o con llamada; si ninguno, el más reciente del cliente. */
export const ticketCon = (datos: Datos, clienteId: string, canal: 'Correo' | 'Teléfono') => G.__ticketCon360(datos, clienteId, canal) as { t: TicketM; con: boolean } | null
/** Síntesis de IA por reglas locales sobre lo que el rol ve (la misma de la 360 del PO). */
export const sintesis = (v: Vista, datos: Datos) => G.__sintesis360(v, datos)

// ------------------------------------------------------------------ registros de ejemplo de Daniel (llamadas y correos)
const ejemploDe = (clienteId: string) => CLIENTES_360[indice(clienteId) % CLIENTES_360.length]!

/** Registros de ejemplo de Daniel de un dato (llamadas CTI y correos), con el lote del cliente del mockup en lugar del suyo. */
export function registrosEjemplo(c: ClienteM, nodoId: 'llam' | 'correos'): [string, string][] {
  const ej = ejemploDe(c.id), lote = lotesDe(c)[0]
  const filas = ej.datos[nodoId] ?? []
  const cambia = (t: string) => ej.lotes.reduce((a, l) => (lote ? a.split(l).join(unidadDe(lote.descripcion)) : a), t)
  return filas.filter(([k]) => !/^Sin /.test(k)).map(([k, v]) => [cambia(k), cambia(v)])
}

// ------------------------------------------------------------------ visor de contratos
const soles = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fechaLarga = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
const fechaCorta = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

// plantilla de Daniel según la situación del lote: con mora (resolución), entregado (garantías) o al día
const PLANTILLAS = {
  mora: ['LA-2023-0117', 'VS-2024-0891'],
  entregado: ['MS-2025-0210', 'RB-2024-0318'],
  alDia: ['VS-2025-0507', 'VS-2024-0412'],
} as const

/** Expedientes del cliente (uno por lote del mockup): cifras, cuotas, acta, adendas y titular del modelo; cláusulas, linderos,
 * notaría y firma de la empresa de la plantilla de Daniel, con el cliente y el lote del mockup. */
export function contratosDe(datos: Datos, c: ClienteM): ContratoInmobiliarioAtc[] {
  const i0 = indice(c.id), dniM = `DNI ${enmascarar(c.dni)}`
  const entregas = C.Q.filter((e) => e.clienteId === c.id)
  const adendas = (C.Vt(c) as { titulo: string; tipo: string; fecha: Date; texto: string }[]).filter((d) => d.tipo === 'Adenda')
  const lotes = lotesDe(c)
  // el acta va al lote cuya unidad nombra; si no nombra ninguno, al primer lote
  const conActa = lotes.some((l) => entregas.some((e) => e.unidad.includes(unidadDe(l.descripcion))))
  return lotes.map((l, i) => {
    const cu = C.Ht(c, l, datos.ahora, C.Nt(datos, l.id)) as {
      cuotas: { n: number; vence: Date; monto: number; estado: 'Pagada' | 'Vencida' | 'Pendiente' }[]; pagadas: number; saldo: number; diasMora: number
    }
    const vencidas = cu.cuotas.filter((q) => q.estado === 'Vencida')
    const caso = datos.casosResolucion.find((q) => q.loteId === l.id)
    const enMora = vencidas.length >= 3 || Boolean(caso && caso.estado !== 'REGULARIZADO')
    const acta = entregas.find((e) => e.unidad.includes(unidadDe(l.descripcion))) ?? (i === 0 && !conActa ? entregas[0] : undefined)
    const grupo = enMora ? PLANTILLAS.mora : acta ? PLANTILLAS.entregado : PLANTILLAS.alDia
    const base = CONTRATOS_ATC.find((q) => q.codigo === grupo[(i0 + i) % grupo.length]) ?? CONTRATOS_ATC[0]!
    const proyecto = proyectoDe(l.descripcion), unidad = unidadDe(l.descripcion)
    const monto = cu.cuotas[0]?.monto ?? 0, inicial = l.precio - monto * cu.cuotas.length
    const ej = CLIENTES_360.find((q) => q.k === base.clienteKey360)
    // el titular, su documento, el código, el proyecto y el lote de la plantilla pasan a ser los del cliente del mockup
    const pares: [string, string][] = [
      [base.clienteNombre, c.nombre], [base.clienteDoc, dniM], [base.codigo, l.contrato],
      [`${base.proyecto} - ${base.etapa}`, proyecto], [base.proyecto, proyecto],
      ...(ej ? ej.lotes.map((x): [string, string] => [`Lote ${x}`, `lote ${unidad}`]) : []),
      ...(ej?.datos['cont']?.filter(([k]) => k.includes('@')).map(([k]): [string, string] => [k, c.correo]) ?? []),
    ]
    // una sola pasada (la más larga primero), para no volver a sustituir lo ya sustituido
    const mapa = new Map(pares.filter(([de]) => de))
    const patron = new RegExp([...mapa.keys()].sort((a, b) => b.length - a.length).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g')
    const sust = (t: string) => t.replace(patron, (m) => mapa.get(m) ?? m)
    const ventana = (() => {
      const k = cu.cuotas.findIndex((q) => q.estado !== 'Pagada')
      const desde = Math.max(0, (k < 0 ? cu.cuotas.length : k) - 3)
      return cu.cuotas.slice(desde, desde + 5)
    })()
    const cronograma: CuotaCronogramaContratoAtc[] = ventana.map((q) => ({
      numero: q.n, vencimiento: iso(q.vence), monto: soles(q.monto),
      estado: q.estado === 'Pagada' ? 'PAGADA' : q.estado === 'Vencida' ? 'VENCIDA' : 'POR_VENCER',
      ...(q.estado === 'Pagada' ? { fechaPago: iso(q.vence), operacion: `BCP-${String(((i0 + 7) * 7919 + q.n * 104729) % 900000 + 100000)}` } : {}),
    }))
    const clausulas = base.clausulas.map((cl) => {
      if (/Precio/i.test(cl.titulo))
        return { ...cl, contenido: `El precio total pactado de común acuerdo asciende a ${soles(l.precio)}, cancelados mediante una cuota inicial de ${soles(inicial)} y el saldo de ${soles(l.precio - inicial)} financiado en ${cu.cuotas.length} letras mensuales iguales de ${soles(monto)} con vencimiento el día ${cu.cuotas[0]?.vence.getDate() ?? 5} de cada mes.` }
      if (/Objeto|Transferencia/i.test(cl.titulo))
        return { ...cl, contenido: `Por el presente instrumento, LA VENDEDORA transfiere en compraventa con reserva de propiedad a favor de EL COMPRADOR (${c.nombre}, ${dniM}) el lote ${unidad} del proyecto ${proyecto}, contrato ${l.contrato}.` }
      return { ...cl, contenido: sust(cl.contenido), ...(cl.alerta ? { alerta: sust(cl.alerta) } : {}) }
    })
    return {
      ...base,
      codigo: l.contrato,
      estado: enMora ? 'EN_EVALUACION_RESOLUCION' : acta ? 'ENTREGADO_CON_GARANTIA' : 'VIGENTE',
      clienteNombre: c.nombre, clienteDoc: dniM, clienteKey360: c.id,
      proyecto, etapa: '', manzanaLote: unidad,
      fechaSuscripcion: fechaLarga(l.firmado),
      precioTotal: soles(l.precio), cuotaInicial: soles(inicial), capitalFinanciado: soles(l.precio - inicial),
      totalLetras: cu.cuotas.length, letrasPagadas: cu.pagadas, letrasVencidas: vencidas.length,
      saldoPendiente: soles(cu.saldo), moraAcumulada: vencidas.length ? `${soles(vencidas.length * monto)} · ${cu.diasMora} días de mora` : soles(0),
      actaEntregaEstado: acta ? `Acta ${acta.id} firmada el ${fechaCorta(acta.entregada)}` : 'Sin acta de entrega (lote no entregado)',
      clausulas,
      // adendas: las del repositorio del cliente (título y fecha del modelo; resumen y acuerdo, de la adenda de ejemplo)
      adendas: adendas.map((d, k) => ({
        codigo: `ADE-${l.contrato}-${String(k + 1).padStart(2, '0')}`, fecha: fechaCorta(d.fecha), titulo: d.titulo, estado: 'FIRMADA' as const,
        resumen: d.texto,
        detalleClausula: `ACUERDO SEGUNDO: Las partes acuerdan sustituir el objeto de la compraventa por el lote ${unidad}, reconociendo el 100% de las cuotas abonadas a la fecha y manteniendo la cuota mensual en ${soles(monto)}.`,
      })),
      firmantes: base.firmantes
        .filter((f) => f.rol !== 'COPROPIETARIO')
        .map((f) => (f.rol === 'COMPRADOR_TITULAR'
          ? { ...f, nombre: c.nombre, documento: dniM, fechaFirma: `${iso(l.firmado)} ${f.fechaFirma.split(' ')[1] ?? ''}`.trim() }
          : { ...f, fechaFirma: `${iso(l.firmado)} ${f.fechaFirma.split(' ')[1] ?? ''}`.trim() })),
      cronograma,
    }
  })
}

// ------------------------------------------------------------------ navegación con el cliente
/** «Nuevo ticket» en modo interesado (DNI que no está en SIGDA/TAXON o SIGDA caído): datos mínimos, pendiente de vincular. */
export function prepararInteresado() {
  C.y.telefono = ''
  C.y.cliente = null
}
/** Tickets del cliente que la Bandeja le muestra al rol al llegar desde aquí (alcance «Áreas que superviso» o «Mi área», con los
 * cerrados; HU-044 CA-03: cada uno ve su área y el supervisor, las que supervisa). */
export function enBandeja(datos: Datos, p: Persona, clienteId: string): number {
  if (!puede('atender', p.rol) && p.rol !== 'COORDINADOR_CX') return 0
  const todas = p.rol === 'SUPERVISOR' || p.rol === 'COORDINADOR_CX', areas = C.__h44.areas(p.id)
  return datos.tickets.filter((t) => t.clienteId === clienteId && (todas ? areas.includes(t.area) : t.area === p.area)).length
}
/** La Bandeja abre ya filtrada por el DNI del cliente (y con los cerrados, para ver los tickets previos). */
export function filtrarBandeja(dni: string) {
  ;(globalThis as { __ptBandejaBusca?: string | null }).__ptBandejaBusca = dni
}
