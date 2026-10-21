// Visor de contratos de la rama de Daniel (origin/prototipo-polar › consola-atc.ts, modal «Expediente Contractual Inmobiliario»):
// selector de expediente, estado, «Ficha Registral y Financiera», pestañas «Cláusulas y Linderos», «Adendas GLI», «Firmas y
// Custodia» y «Cronograma de Pagos», y el pie con la Bandeja, la mesa de morosidad (3 letras vencidas o más) y «Cerrar visor».
// Mismos textos; paresResumenContrato e itemsPestanasContrato copiados de su componente. 20-oct (b3-k): los expedientes son los
// del cliente del mockup (uno por lote: modelo.ts › contratosDe) y lo financiero (posición, letras y cronograma) se muestra con
// candado si el rol no ve las cuotas del cliente (misma matriz que la Consulta 360).
import type { ContratoInmobiliarioAtc, CuotaCronogramaContratoAtc, FirmanteContratoAtc } from './datos.ts'
import { Divider, Row, Stack, Texto, h, ui } from './kit.ts'

export type PestanaContrato = 'clausulas' | 'adendas' | 'firmantes' | 'cronograma'

export interface PropsVisor {
  abierto: boolean
  /** Expedientes del cliente (uno por lote) */
  contratos: readonly ContratoInmobiliarioAtc[]
  /** ¿El rol ve las cuotas y el estado de cuenta del cliente? */
  verFinanzas: boolean
  codigo: string
  pestana: PestanaContrato
  alElegir: (codigo: string) => void
  alCambiarPestana: (p: PestanaContrato) => void
  alCerrar: () => void
  /** «Ver tickets del titular en Bandeja» (solo si el rol ve la Bandeja) */
  verBandeja?: () => void
  /** «Ir a Mesa de Morosidad 3 Meses» (solo si el rol ve Resolución por morosidad) */
  irMorosidad?: () => void
}

const RESTRINGIDO = 'Restringido para tu rol'
const unidadCompleta = (ctr: ContratoInmobiliarioAtc) => [ctr.proyecto, ctr.etapa, ctr.manzanaLote].filter(Boolean).join(' · ')

function paresResumenContrato(ctr: ContratoInmobiliarioAtc, verFinanzas: boolean): [string, string][] {
  const letrasTexto = !verFinanzas
    ? `${RESTRINGIDO} · ${ctr.actaEntregaEstado}`
    : ctr.letrasVencidas > 0
      ? `${ctr.letrasPagadas}/${ctr.totalLetras} pagadas · ${ctr.letrasVencidas} vencidas (${ctr.moraAcumulada})`
      : `${ctr.letrasPagadas}/${ctr.totalLetras} pagadas · ${ctr.actaEntregaEstado}`
  return [
    ['Empresa Vendedora', `${ctr.empresa} (RUC ${ctr.rucEmpresa})`],
    ['Titular / Comprador', `${ctr.clienteNombre} (${ctr.clienteDoc})`],
    ['Proyecto y Unidad', `${unidadCompleta(ctr)} (${ctr.areaMetros})`],
    ['Registro SUNARP y Notaría', `Partida ${ctr.partidaMatrizSunarp} · ${ctr.notaria} (${ctr.kardexNotarial})`],
    ['Posición Financiera', verFinanzas ? `Total: ${ctr.precioTotal} · Inicial: ${ctr.cuotaInicial} · Saldo: ${ctr.saldoPendiente}` : RESTRINGIDO],
    ['Letras y Entrega', letrasTexto],
  ]
}

const itemsPestanasContrato = (ctr: ContratoInmobiliarioAtc) => [
  { value: 'clausulas', label: 'Cláusulas y Linderos', count: ctr.clausulas.length },
  { value: 'adendas', label: 'Adendas GLI', count: ctr.adendas.length },
  { value: 'firmantes', label: 'Firmas y Custodia', count: ctr.firmantes.length },
  { value: 'cronograma', label: 'Cronograma de Pagos', count: ctr.cronograma.length },
]

const mono = (t: string) => h(Texto, { estilo: 'mono', size: 'xs' }, t)

const columnasFirmantes = [
  { key: 'rol', header: 'Rol Contractual', render: (f: FirmanteContratoAtc) => h(ui.Badge, { size: 'sm', tone: f.rol === 'REPRESENTANTE_EMPRESA' ? 'info' : 'success' }, f.rol) },
  { key: 'nombre', header: 'Nombre y Documento', render: (f: FirmanteContratoAtc) => h(Stack, { gap: '1' }, h('strong', null, f.nombre), mono(f.documento)) },
  { key: 'fechaFirma', header: 'Fecha y Hora de Firma', render: (f: FirmanteContratoAtc) => mono(f.fechaFirma) },
  { key: 'modalidad', header: 'Modalidad de Certificación' },
  { key: 'hashCustodia', header: 'Hash SHA-256 Custodia GLI', render: (f: FirmanteContratoAtc) => mono(f.hashCustodia) },
]

const columnasCronograma = [
  { key: 'numero', header: 'N.º Letra', render: (c: CuotaCronogramaContratoAtc) => h(Texto, { as: 'strong', estilo: 'mono', size: 'xs' }, `Letra #${c.numero}`) },
  { key: 'vencimiento', header: 'Vencimiento', render: (c: CuotaCronogramaContratoAtc) => mono(c.vencimiento) },
  { key: 'monto', header: 'Importe', align: 'end', render: (c: CuotaCronogramaContratoAtc) => h('strong', null, c.monto) },
  {
    key: 'estado', header: 'Estado',
    render: (c: CuotaCronogramaContratoAtc) => h(ui.Badge, { size: 'sm', tone: c.estado === 'PAGADA' ? 'success' : c.estado === 'VENCIDA' ? 'danger' : 'info' }, c.estado),
  },
  { key: 'fechaPago', header: 'Fecha de Pago', render: (c: CuotaCronogramaContratoAtc) => mono(c.fechaPago ?? '—') },
  { key: 'operacion', header: 'Operación Conciliada', render: (c: CuotaCronogramaContratoAtc) => mono(c.operacion ?? 'Pendiente de abono') },
]

function contenidoPestana(ctr: ContratoInmobiliarioAtc, p: PestanaContrato, verFinanzas: boolean) {
  if (p === 'clausulas')
    return h(Stack, { gap: '3' },
      h(ui.Alert, { tone: 'info', size: 'sm', title: `Zonificación y Linderos (${ctr.zonificacion})` }, ctr.linderos),
      ctr.clausulas.map((cl) =>
        h(ui.Card, { key: cl.numero },
          h(ui.CardHeader, {
            title: `${cl.numero} CLÁUSULA — ${cl.titulo}`, as: 'h4', divider: true,
            actions: cl.alerta ? h(ui.Badge, { size: 'sm', tone: 'danger' }, cl.alerta) : undefined,
          }),
          h(ui.CardBody, { padding: 'sm' }, h(Texto, { as: 'p', estilo: 'body', size: 'sm' }, cl.contenido)))))
  if (p === 'adendas')
    return h(Stack, { gap: '3' },
      ctr.adendas.length
        ? ctr.adendas.map((ad) =>
          h(ui.Card, { key: ad.codigo },
            h(ui.CardHeader, {
              title: `${ad.codigo} · ${ad.titulo}`, subtitle: `Fecha de suscripción: ${ad.fecha}`, as: 'h4', divider: true,
              actions: h(ui.Badge, { size: 'sm', tone: ad.estado === 'FIRMADA' ? 'success' : 'warning' }, ad.estado),
            }),
            h(ui.CardBody, { padding: 'sm', gap: 'sm' },
              h(Texto, { as: 'strong', estilo: 'label', size: 'sm' }, ad.resumen),
              h(Texto, { as: 'p', estilo: 'body', size: 'sm' }, ad.detalleClausula))))
        : h(ui.EmptyState, {
          size: 'compact', title: 'Sin adendas modificatorias',
          description: `Se rige íntegramente por la minuta matriz firmada el ${ctr.fechaSuscripcion}.`,
        }))
  if (p === 'firmantes')
    return h(ui.Table, {
      caption: 'Firmantes y custodia criptográfica del contrato', columns: columnasFirmantes, striped: true,
      rows: ctr.firmantes.map((f, i) => ({ ...f, id: `f${i}` })),
    })
  if (!verFinanzas)
    return h(ui.Alert, { tone: 'warning', size: 'sm', title: h('span', { className: 'pt-en-linea' }, h(ui.Icono, { name: 'lock', size: 16 }), ' Cronograma restringido') },
      'Tu rol no ve las cuotas ni el estado de cuenta del cliente.')
  return h(ui.Table, {
    caption: 'Cronograma de letras y estado de conciliación', columns: columnasCronograma, striped: true,
    rows: ctr.cronograma.map((c) => ({ ...c, id: `l${c.numero}` })),
  })
}

export function VisorContrato(p: PropsVisor) {
  const ctr = p.contratos.find((c) => c.codigo === p.codigo) ?? p.contratos[0]
  if (!p.abierto || !ctr) return null
  return h(ui.Dialog, {
    open: true, size: 'lg', 'data-c360-visor': '',
    title: `Expediente Contractual Inmobiliario · ${ctr.codigo}`,
    onOpenChange: (v: boolean) => { if (!v) p.alCerrar() },
  },
  h(Stack, { gap: '4' },
    h(ui.Card, null,
      h(ui.CardBody, { padding: 'sm', gap: 'sm' },
        h(Row, { gap: '3', justificar: 'between', ajuste: true },
          h(Stack, { gap: '1' },
            h(Texto, { estilo: 'label', size: 'xs' }, 'Seleccionar expediente contractual (SIGDA / GLI)'),
            h(Row, { gap: '2', ajuste: true },
              p.contratos.map((c) =>
                h(ui.Button, {
                  key: c.codigo, size: 'sm', variant: ctr.codigo === c.codigo ? 'primary' : 'secondary',
                  'aria-pressed': ctr.codigo === c.codigo, onClick: () => p.alElegir(c.codigo),
                }, `${c.codigo} · ${c.manzanaLote}`)))),
          h(Row, { gap: '2', ajuste: true },
            h(ui.Badge, { tone: ctr.estado === 'VIGENTE' ? 'success' : ctr.estado === 'EN_EVALUACION_RESOLUCION' ? 'danger' : 'info' }, ctr.estado),
            h(ui.Badge, { tone: 'neutral' }, ctr.tipo))))),
    h(ui.Card, null,
      h(ui.CardHeader, { title: 'Ficha Registral y Financiera', subtitle: unidadCompleta(ctr), as: 'h3', divider: true }),
      h(ui.CardBody, { padding: 'sm' }, h(ui.CardPairs, { pairs: paresResumenContrato(ctr, p.verFinanzas) }))),
    h(ui.Tabs, {
      'aria-label': 'Secciones del expediente contractual', variant: 'underline', size: 'sm',
      items: itemsPestanasContrato(ctr), value: p.pestana,
      onValueChange: (v: string) => {
        if (v === 'clausulas' || v === 'adendas' || v === 'firmantes' || v === 'cronograma') p.alCambiarPestana(v)
      },
    }, contenidoPestana(ctr, p.pestana, p.verFinanzas)),
    h(Divider, { espaciado: 'none' }),
    h(Row, { gap: '2', justificar: 'between', ajuste: true },
      h(Texto, { estilo: 'body', size: 'xs' }, `Expediente digital sincronizado con Repositorio S3 / GLI (Kardex ${ctr.kardexNotarial})`),
      h(Row, { gap: '2', ajuste: true },
        p.verBandeja ? h(ui.Button, { size: 'sm', variant: 'secondary', onClick: p.verBandeja }, 'Ver tickets del titular en Bandeja') : null,
        p.verFinanzas && ctr.letrasVencidas >= 3 && p.irMorosidad ? h(ui.Button, { size: 'sm', variant: 'danger', onClick: p.irMorosidad }, 'Ir a Mesa de Morosidad 3 Meses') : null,
        h(ui.Button, { size: 'sm', variant: 'primary', onClick: p.alCerrar }, 'Cerrar visor')))))
}
