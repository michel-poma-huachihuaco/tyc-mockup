// Datos de ejemplo del PO para la consulta 360. Son ficticios (clientes de demostración).
export interface Fuente { id: string; n: string; d: string; ms: number }
export interface Dato { id: string; n: string; s: string[]; lock?: string[]; sem?: boolean }
export type Fila = readonly [string, string]
export interface Cliente { k: string; ini: string; n: string; doc: string; proj: string; lotes: string[]; data: Record<string, Fila[]> }
export interface RolDef { k: string; n: string }

export const SOURCES: Fuente[] = [
  { id: 'sigda', n: 'SIGDA / TAXON', d: 'Maestro único del cliente', ms: 180 },
  { id: 'contr', n: 'Contratos y Activos', d: 'Contrato, unidad, acta', ms: 240 },
  { id: 'cob', n: 'Cobranza', d: 'Cronograma y pagos', ms: 310 },
  { id: 'jose', n: 'Motor de José', d: 'Consultas específicas', ms: 220 },
  { id: 'repo', n: 'Repositorio S3 / GLI', d: 'Documentos indexados', ms: 420 },
  { id: 'mail', n: 'Correo', d: 'Hilos con el cliente', ms: 260 },
  { id: 'cti', n: 'Call center', d: 'Llamadas y grabaciones', ms: 200 },
  { id: 'atc', n: 'Tickets ATC', d: 'Historial y Libro', ms: 120 },
]

export const DATA: Dato[] = [
  { id: 'kyc', n: 'DNI y KYC', s: ['sigda'] }, { id: 'cont', n: 'Contactos', s: ['sigda'] },
  { id: 'lote', n: 'Lotes', s: ['contr', 'sigda'] }, { id: 'contrato', n: 'Contrato y adendas', s: ['contr', 'repo'] },
  { id: 'acta', n: 'Acta de entrega', s: ['contr'] }, { id: 'gar', n: 'Garantía vigente', s: ['contr'] },
  { id: 'crono', n: 'Cronograma', s: ['cob'] }, { id: 'cuotas', n: 'Cuotas vencidas', s: ['cob', 'jose'] },
  { id: 'saldo', n: 'Saldo por lote', s: ['jose'] }, { id: 'ecta', n: 'Estado de cuenta', s: ['cob', 'jose'], lock: ['gestor'] },
  { id: 'docs', n: 'Documentos', s: ['repo'], sem: true }, { id: 'correos', n: 'Correos', s: ['mail'] },
  { id: 'llam', n: 'Llamadas', s: ['cti'] }, { id: 'tick', n: 'Tickets previos', s: ['atc'] },
  { id: 'libro', n: 'Reclamos del Libro', s: ['atc'] }, { id: 'expo', n: 'Exposición legal', s: ['atc', 'cob'], lock: ['gestor'] },
]

export const CLIENTS: Cliente[] = [
  {
    k: 'mq', ini: 'MQ', n: 'María Quispe H.', doc: 'DNI 4•••••21', proj: 'Villa Sol · Etapa II', lotes: ['B-14', 'B-15'],
    data: {
      kyc: [['DNI 4•••••21', 'verificado'], ['KYC', 'conforme 12-ene-2026']], cont: [['Celular 9•• ••• 418', 'principal'], ['mquispe@…', 'correo']],
      lote: [['Lote B-14 · 160 m²', 'Villa Sol II'], ['Lote B-15 · 150 m²', 'Villa Sol II']], contrato: [['Contrato VS-2024-0381', 'vigente'], ['Adenda cambio de lote', '12-mar-2025']],
      acta: [['Acta de entrega B-14', '15-ago-2026']], gar: [['Cobertura instalaciones', 'vence 15-ago-2027']],
      crono: [['Cuota 18 de 60', 'S/ 1,240'], ['Próximo vencimiento', '30-oct-2026']], cuotas: [['Vencidas', '0'], ['Al día desde', '2024']],
      saldo: [['Saldo B-14', 'S/ 52,080'], ['Saldo B-15', 'S/ 61,300']], ecta: [['Pagado', 'S/ 22,320'], ['Pendiente', 'S/ 113,380']],
      docs: [['Adenda cambio de lote.pdf', 'fragmento: «se reubica al lote B-14…»'], ['Voucher cuota 17.jpg', '12-sep-2026'], ['Acta de entrega B-14.pdf', 'firmada']],
      correos: [['«Consulta por fecha de entrega»', '3 mensajes · 02-oct']], llam: [['Llamada 4 min', '08-oct · grabación'], ['Llamada 2 min', '01-oct']],
      tick: [['VS-000231 · Consulta', 'cerrado · CSAT 5'], ['VS-000198 · Postventa', 'cerrado']], libro: [['Sin reclamos', '—']], expo: [['Sin riesgo de denuncia', 'S/ 0']],
    },
  },
  {
    k: 'jr', ini: 'JR', n: 'Jorge Ramos T.', doc: 'DNI 7•••••09', proj: 'Los Álamos · Etapa I', lotes: ['A-03'],
    data: {
      kyc: [['DNI 7•••••09', 'verificado']], cont: [['Celular 9•• ••• 266', 'principal']], lote: [['Lote A-03 · 140 m²', 'Los Álamos I']],
      contrato: [['Contrato LA-2023-0117', 'en riesgo']], acta: [['Sin acta', 'lote no entregado']], gar: [['No aplica', 'sin entrega']],
      crono: [['Cuota 22 de 48', 'S/ 980'], ['Vencida desde', '15-jul-2026']], cuotas: [['Vencidas', '3 (S/ 2,940)'], ['Caso de resolución', 'RF-SVC-056']],
      saldo: [['Saldo A-03', 'S/ 25,480']], ecta: [['Pagado', 'S/ 20,580'], ['Mora', 'S/ 2,940']],
      docs: [['Carta de alerta al proyecto.pdf', '14-oct-2026'], ['Contrato LA-2023-0117.pdf', 'cláusula 9: resolución']],
      correos: [['«Alerta de cancelación del servicio»', 'enviado · constancia']], llam: [['Llamada 7 min', '13-oct · reclamo']],
      tick: [['LA-000088 · Reclamo', 'en atención'], ['LA-000090 · Resolución', 'suspendido por reclamo']],
      libro: [['Reclamo LR-2026-0042', 'vence 03-nov-2026']], expo: [['Riesgo de denuncia: medio', 'S/ 3,180 con interés 8 %']],
    },
  },
  {
    k: 'lp', ini: 'LP', n: 'Lucía Paredes V.', doc: 'CE 0•••••77', proj: 'Mirador del Sur', lotes: ['C-21'],
    data: {
      kyc: [['CE 0•••••77', 'verificado']], cont: [['Celular 9•• ••• 731', 'WhatsApp']], lote: [['Lote C-21 · 180 m²', 'Mirador del Sur']],
      contrato: [['Contrato MS-2025-0210', 'vigente']], acta: [['Acta de entrega C-21', '20-sep-2026']], gar: [['Cobertura estructural', 'vigente'], ['Reclamo de garantía', 'inspección 22-oct']],
      crono: [['Cuota 9 de 36', 'S/ 1,560']], cuotas: [['Vencidas', '0']], saldo: [['Saldo C-21', 'S/ 42,120']], ecta: [['Pagado', 'S/ 14,040']],
      docs: [['Fotos de fisura.jpg', 'subidas desde Mi Portal'], ['Informe de inspección.pdf', 'por emitir']],
      correos: [['«Fisura en muro perimétrico»', '2 mensajes']], llam: [['Sin llamadas', '—']],
      tick: [['MS-000412 · Garantía', 'en atención · Postventa']], libro: [['Sin reclamos', '—']], expo: [['Sin riesgo', 'S/ 0']],
    },
  },
]

export const ROLES: RolDef[] = [{ k: 'gestor', n: 'Gestor de tickets' }, { k: 'sup', n: 'Supervisor ATC' }, { k: 'legal', n: 'Legal' }]
export const SEM = [{ q: 'adenda de cambio de lote', hit: 'docs' }, { q: 'cuotas vencidas', hit: 'cuotas' }, { q: 'fisura en el muro', hit: 'docs' }]

/** RN-SVC-036: la consulta 360 solo muestra lo que el rol puede ver en el origen. */
export const bloqueado = (d: Dato, rol: string) => !!d.lock?.includes(rol)
/** RF-SVC-051: un dato queda «no disponible» si todas sus fuentes son la caída simulada. */
export const caido = (d: Dato, caida: string | null) => !!caida && d.s.every((s) => s === caida)
export const latencia = (id: string, caida: string | null) => (id === caida ? 1200 : SOURCES.find((x) => x.id === id)!.ms)
/** Tiempo de respuesta total (ms) como lo calcula el PO. */
export const tiempoTotal = (caida: string | null) => Math.max(...DATA.map((d) => Math.min(...d.s.map((s) => latencia(s, caida))))) + 120
