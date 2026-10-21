import * as THREE from 'three'
import { bucle, type RGB } from './comun.ts'
import { Kit, mezcla } from './modelos.ts'
import { animarRobotBase, crearRobot } from './robots.ts'

// Asistente de IA (mock): robot 3D flotante y motor de respuestas. Todo es de ejemplo: las respuestas salen de
// plantillas que dependen del contexto del ticket (tipo, estado, SLA, cliente e historial), no de un modelo.

// ------------------------------------------------------------------ contexto del ticket
export interface CtxBot {
  numero: string; resumen: string; tipo: string; tipoId: string; estado: string; estadoId: string
  area: string; canal: string; cliente: string | null; responsable: string | null; usuario: string
  eje: number; reaperturas: number; rayo: boolean; primeraRespuesta: boolean
  sla: { nivel: 'ok' | 'riesgo' | 'vencido' | 'cumplido' | 'fuera'; hito: string; vence: string; restante: string }
  historial: { fecha: string; texto: string }[]
  mensajes: number; notas: number; ultimoMensaje: string | null
}
export type Tono = 'empatico' | 'formal' | 'breve'
export const TONOS: { id: Tono; n: string }[] = [{ id: 'empatico', n: 'Empático' }, { id: 'formal', n: 'Formal' }, { id: 'breve', n: 'Breve' }]

const CONTEXTO: Record<string, string> = {
  CTA: 'tu consulta sobre tu estado de cuenta', PED: 'tu pedido', VIS: 'la visita técnica que solicitaste', QUE: 'tu queja', REC: 'tu reclamo',
  GAR: 'tu reclamo de garantía', CIT: 'el reporte de la incidencia en tu zona', RES: 'el proceso sobre tu contrato', ING: 'tu solicitud de ingreso al proyecto', RSV: 'tu reserva de bus',
}
const primerNombre = (c: CtxBot) => (c.cliente ?? 'cliente').split(' ')[0]!
const contexto = (c: CtxBot) => CONTEXTO[c.tipoId] ?? 'tu solicitud'

function estadoLinea(c: CtxBot, corto = false): string {
  const t = contexto(c)
  switch (c.estadoId) {
    case 'OPEN': return corto ? `ya la recibimos y la estamos asignando` : `hemos registrado ${t} y la estamos asignando al equipo de ${c.area}.`
    case 'IN_PROGRESS': return corto ? `estamos trabajando en ello` : `estamos trabajando en ${t} con el equipo de ${c.area}.`
    case 'PENDING_CUSTOMER': return corto ? `necesitamos un dato tuyo para avanzar` : `para avanzar con ${t} necesitamos que nos confirmes la información que te pedimos.`
    case 'ESCALATED': return corto ? `lo derivamos a un equipo especializado` : `hemos derivado ${t} a un equipo especializado para que lo revise con prioridad.`
    case 'RESOLVED': return corto ? `ya lo resolvimos; confírmanos que todo está bien` : `ya resolvimos ${t}. ¿Podrías confirmarnos en Mi Portal que todo quedó conforme?`
    case 'CLOSED': return corto ? `quedó cerrado` : `${t} quedó cerrado. Si algo no te convence, puedes pedirnos reabrirlo.`
    case 'REOPENED': return corto ? `lo reabrimos y lo estamos revisando de nuevo` : `reabrimos ${t} y lo estamos revisando de nuevo, con un nuevo plazo.`
    default: return `estamos atendiendo ${t}.`
  }
}
function slaLinea(c: CtxBot, corto = false): string {
  if (c.estadoId === 'CLOSED') return ''
  if (c.sla.nivel === 'vencido' || c.sla.nivel === 'fuera') return corto ? 'Lamentamos la demora: ya lo priorizamos.' : 'Lamentamos la demora: ya lo estamos priorizando y te escribiremos hoy mismo con novedades.'
  if (c.sla.nivel === 'cumplido') return ''
  return corto ? `Te respondemos antes del ${c.sla.vence}.` : `Te daremos una respuesta a más tardar el ${c.sla.vence}.`
}

/** Propone el mensaje al cliente según el contexto del ticket y el tono elegido. */
export function redactar(c: CtxBot | null, tono: Tono): string {
  if (!c) return 'Abre un ticket y te redacto la respuesta con su contexto.'
  const yo = c.usuario, cl = c.cliente ?? 'cliente', sla = slaLinea(c), est = estadoLinea(c)
  if (tono === 'formal') return `Estimado(a) ${cl}:\n\nEn relación con ${contexto(c)} (ticket ${c.numero}), ${est}${sla ? `\n\n${sla}` : ''}\n\nQuedamos atentos a cualquier consulta.\n\nAtentamente,\n${yo}\nAtención al Cliente · Aybar`
  if (tono === 'breve') return `Hola ${primerNombre(c)}, sobre ${contexto(c)} (${c.numero}): ${estadoLinea(c, true)}. ${slaLinea(c, true)} — ${yo}`.replace(/\s+—/, ' —').replace('. .', '.')
  const calidez = c.sla.nivel === 'vencido' || c.estadoId === 'REOPENED' ? 'Sentimos mucho el inconveniente y te agradecemos tu paciencia.' : `Gracias por escribirnos; sabemos que ${contexto(c)} es importante para ti.`
  return `Hola ${primerNombre(c)}, ${calidez}\n\n${est[0]!.toUpperCase() + est.slice(1)}${sla ? `\n\n${sla}` : ''}\n\nSi necesitas algo más mientras tanto, aquí estoy para ayudarte.\n\nUn saludo cordial,\n${yo}`
}

export function resumir(c: CtxBot | null): { titulo: string; lineas: string[] } {
  if (!c) return { titulo: 'Sin ticket abierto', lineas: ['Abre un ticket desde la bandeja o la vista en vivo y te lo resumo.'] }
  const lineas = [
    `${c.tipo} por ${c.canal}${c.cliente ? ` · cliente: ${c.cliente}` : ''}.`,
    `Está «${c.estado}» en ${c.area}${c.responsable ? ` con ${c.responsable}` : ', sin responsable'}${c.rayo ? ' y tiene rayo' : ''}.`,
    c.estadoId === 'CLOSED' ? 'El SLA ya no corre.' : `SLA de ${c.sla.hito}: ${c.sla.nivel === 'vencido' ? 'vencido' : c.sla.nivel === 'riesgo' ? 'en riesgo' : 'en plazo'}, vence el ${c.sla.vence} (${c.sla.restante}).`,
    c.historial[0] ? `Último movimiento: ${c.historial[0].texto} (${c.historial[0].fecha}).` : 'Aún no tiene movimientos de estado.',
    `${c.mensajes} mensaje${c.mensajes === 1 ? '' : 's'} al cliente y ${c.notas} nota${c.notas === 1 ? '' : 's'} interna${c.notas === 1 ? '' : 's'}.`,
  ]
  if (c.reaperturas) lineas.push(`Se reabrió ${c.reaperturas} vez${c.reaperturas === 1 ? '' : 'es'}: conviene revisar qué falló antes.`)
  return { titulo: `${c.numero} · ${c.resumen}`, lineas }
}

const CRITERIOS: Record<string, string[]> = {
  REC: ['Asiento del Libro de Reclamaciones registrado', 'Respuesta formal con cargo de entrega'], QUE: ['Asiento del Libro de Reclamaciones registrado', 'Respuesta formal con cargo de entrega'],
  GAR: ['Inspección técnica registrada', 'Resolución comunicada al cliente'], CTA: ['Datos de cuenta verificados con el cliente'], VIS: ['Visita realizada y constancia adjunta'],
}
export function siguientePaso(c: CtxBot | null): { accion: string; motivo: string; pasos: string[]; criterios: string[] } {
  if (!c) return { accion: 'Abrir un ticket', motivo: 'No hay un ticket en pantalla.', pasos: ['Elige uno en la bandeja o en la vista en vivo.'], criterios: [] }
  const criterios = ['Respuesta enviada al cliente', ...(CRITERIOS[c.tipoId] ?? []), 'Cliente informado del cierre']
  if (c.sla.nivel === 'vencido' && c.estadoId !== 'CLOSED') return { accion: 'Priorizar y avisar al cliente', motivo: 'El SLA ya venció.', pasos: ['Escribe al cliente reconociendo la demora y dando una nueva fecha.', 'Si no puedes resolverlo hoy, pide apoyo al supervisor (rayo) o deriva.', 'Deja una nota interna con el motivo del retraso.'], criterios }
  if (c.estadoId === 'OPEN' && !c.primeraRespuesta) return { accion: 'Registrar la primera respuesta', motivo: 'Sin primera respuesta el ticket sigue en «Abierto» y corre el SLA de respuesta.', pasos: ['Responde al cliente con lo que ya sabes.', 'El ticket pasa solo a «En atención».'], criterios }
  if (c.estadoId === 'PENDING_CUSTOMER') return { accion: 'Recordar al cliente lo que falta', motivo: 'Estamos esperando su respuesta.', pasos: ['Envía un recordatorio amable por el mismo canal.', 'Si no responde en 2 días hábiles, cierra la espera y avisa a tu líder.'], criterios }
  if (c.estadoId === 'ESCALATED') return { accion: 'Dar seguimiento al área', motivo: 'El caso está en otro equipo.', pasos: ['Consulta el avance con el área responsable.', 'Informa al cliente con una fecha probable.'], criterios }
  if (c.estadoId === 'RESOLVED') return { accion: 'Esperar la confirmación del cliente', motivo: 'El cierre formal lo confirma el cliente en Mi Portal.', pasos: ['Pídele confirmar en Mi Portal.', 'Cuando confirme, el ticket pasa a «Cerrado» y se envía la encuesta.'], criterios }
  if (c.estadoId === 'CLOSED') return { accion: 'Nada pendiente', motivo: 'El ticket está cerrado.', pasos: ['Si el cliente rechaza la solución, reábrelo con un nuevo plazo.'], criterios: [] }
  if (c.estadoId === 'REOPENED') return { accion: 'Revisar por qué se reabrió', motivo: 'Un ticket reabierto tiene un nuevo SLA.', pasos: ['Lee la última respuesta del cliente.', 'Evita repetir lo ya intentado y propón una solución distinta.'], criterios }
  if (c.sla.nivel === 'riesgo') return { accion: 'Adelantar la resolución', motivo: 'El SLA está por vencer.', pasos: ['Resuelve hoy o deriva al área que puede hacerlo.', 'Avisa al cliente del avance.'], criterios }
  return { accion: 'Avanzar hacia la resolución', motivo: 'El ticket está en atención y dentro del plazo.', pasos: ['Revisa la guía de solución del tipo de ticket.', 'Si otra área puede resolverlo, derívalo con el motivo.', 'Cuando lo resuelvas, responde al cliente y cambia el estado.'], criterios }
}

// ------------------------------------------------------------------ revisión del borrador
const JUICIOS: [RegExp, string][] = [[/\bmentiros[oa]\b/gi, 'incorrecto'], [/\bculpa (tuya|suya|del cliente)\b/gi, 'una confusión'], [/\bincompetente(s)?\b/gi, 'poco claro'], [/\babsurd[oa]\b/gi, 'difícil de entender'], [/\bexager(a|ando|ación)\b/gi, 'considera mucho']]
export interface Revision { hallazgos: { nivel: 'ok' | 'aviso' | 'alto'; texto: string }[]; corregido: string; anonimizados: number }
export function revisar(c: CtxBot | null, borrador: string): Revision {
  const b = borrador.trim()
  if (!b) return { hallazgos: [{ nivel: 'aviso', texto: 'Aún no hay borrador: escribe el mensaje y vuelve a pedirme la revisión.' }], corregido: '', anonimizados: 0 }
  const hallazgos: Revision['hallazgos'] = []
  let txt = b, anon = 0
  txt = txt.replace(/(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g, () => { anon++; return 'tarjeta ••••' })
  txt = txt.replace(/(?<!\d)\d{8}(?!\d)/g, () => { anon++; return 'DNI ••••••' })
  if (anon) hallazgos.push({ nivel: 'alto', texto: `Hay ${anon} dato${anon === 1 ? '' : 's'} personal${anon === 1 ? '' : 'es'} (DNI o tarjeta). No viajan a ningún modelo: ya los oculté en la versión corregida.` })
  for (const [re, neutro] of JUICIOS) if (re.test(txt)) { hallazgos.push({ nivel: 'aviso', texto: `Evita juicios de valor como «${(txt.match(re) ?? [''])[0]}»: suena a reproche.` }); txt = txt.replace(re, neutro) }
  const letras = txt.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '')
  if (letras.length > 20 && letras.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length / letras.length > 0.35) { hallazgos.push({ nivel: 'aviso', texto: 'Demasiadas mayúsculas: se lee como si gritaras.' }); txt = txt.charAt(0) + txt.slice(1).toLowerCase() }
  if ((txt.match(/!/g) ?? []).length > 2) { hallazgos.push({ nivel: 'aviso', texto: 'Muchos signos de exclamación; baja el tono.' }); txt = txt.replace(/!{2,}/g, '!') }
  const nombre = c ? primerNombre(c) : 'cliente'
  if (!/\b(hola|estimad[oa]|buen[oa]s)\b/i.test(txt)) { hallazgos.push({ nivel: 'aviso', texto: 'Falta un saludo.' }); txt = `Hola ${nombre}, ${txt.charAt(0).toLowerCase()}${txt.slice(1)}` }
  if (!/\d{1,2}\s?(de|\/)|horas|días|plazo|hoy|mañana|antes del/i.test(txt) && c && c.estadoId !== 'CLOSED') { hallazgos.push({ nivel: 'aviso', texto: 'No dices cuándo tendrá novedades.' }); txt += `\n\n${slaLinea(c)}`.trimEnd() }
  if (!/saludos|atentamente|gracias|quedamos|cualquier consulta/i.test(txt)) { hallazgos.push({ nivel: 'aviso', texto: 'Falta un cierre cordial.' }); txt += `\n\nQuedamos atentos a cualquier consulta.${c ? `\n${c.usuario}` : ''}` }
  if (b.length < 40) hallazgos.push({ nivel: 'aviso', texto: 'Es muy breve: añade qué se hizo y qué sigue.' })
  if (b.length > 700) hallazgos.push({ nivel: 'aviso', texto: 'Es largo: el cliente lee mejor mensajes cortos con un solo pedido.' })
  if (!hallazgos.length) hallazgos.push({ nivel: 'ok', texto: 'Se ve bien: tono correcto, claro y con siguiente paso.' })
  return { hallazgos, corregido: hallazgos.length === 1 && hallazgos[0]!.nivel === 'ok' ? b : txt, anonimizados: anon }
}

// ------------------------------------------------------------------ conversación libre
export const SALUDO = 'Hola, soy tu asistente de atención. Puedo redactar la respuesta al cliente, resumir el ticket, sugerir el siguiente paso o revisar tu borrador.'
export function conversar(c: CtxBot | null, texto: string): { texto: string; accion?: 'redactar' | 'resumir' | 'paso' | 'revisar' } {
  const t = texto.toLowerCase()
  if (/redact|respuesta|escrib|mensaje/.test(t)) return { texto: 'Claro, elige el tono y te lo redacto.', accion: 'redactar' }
  if (/resum|qué pas|cómo va|situaci/.test(t)) return { texto: 'Te lo resumo.', accion: 'resumir' }
  if (/siguiente|qué hago|ahora|paso|recomiend/.test(t)) return { texto: 'Esto es lo que haría.', accion: 'paso' }
  if (/revis|borrador|corrig|tono/.test(t)) return { texto: 'Reviso lo que escribiste.', accion: 'revisar' }
  if (!c && /ticket|cliente|plazo|sla/.test(t)) return { texto: 'Ahora no hay un ticket abierto. Entra a uno y te respondo con su contexto.' }
  if (/plazo|sla|vence|cuánto tiempo/.test(t) && c) return { texto: c.estadoId === 'CLOSED' ? 'Este ticket ya está cerrado: no corre SLA.' : `El SLA de ${c.sla.hito} vence el ${c.sla.vence} (${c.sla.restante}). Está ${c.sla.nivel === 'vencido' ? 'vencido' : c.sla.nivel === 'riesgo' ? 'en riesgo' : 'en plazo'}.` }
  if (/cliente|quién es/.test(t) && c) return { texto: c.cliente ? `El cliente es ${c.cliente}. Escribió por ${c.canal} por «${c.resumen}».` : 'Este ticket se registró con datos mínimos y todavía no está ligado a un cliente.' }
  if (/cerrar|cierre/.test(t) && c) return { texto: `Para cerrar: ${siguientePaso(c).criterios.join('; ') || 'ya está cerrado'}. El cierre formal lo confirma el cliente en Mi Portal.` }
  if (/rayo/.test(t)) return { texto: 'El rayo sube un ticket al tope de la bandeja. Solo lo marca un supervisor o líder, con motivo, y el área tiene un tope del 10 %.' }
  if (/deriv|escal/.test(t)) return { texto: 'Deriva a otra área si no es tu competencia o falta información de ella; escala a Eje 3 si hay señal de conflicto. En ambos casos indica el motivo.' }
  if (/gracias/.test(t)) return { texto: '¡Con gusto! Aquí sigo.' }
  if (/hola|buen[oa]s/.test(t)) return { texto: SALUDO }
  return { texto: 'Aún no sé responder eso, pero puedo redactar la respuesta, resumir el ticket, sugerir el siguiente paso o revisar tu borrador.' }
}

// ------------------------------------------------------------------ robot 3D (busto)
export type EstadoBot = 'reposo' | 'pensando' | 'hablando' | 'feliz'

/** Lee un token de color de la página y lo normaliza a RGB. */
const rgbDe = (nombre: string, respaldo: RGB): RGB => {
  try {
    const i = document.createElement('i'); i.style.color = `var(--aybar-color-${nombre})`; document.body.append(i)
    const css = getComputedStyle(i).color; i.remove()
    const c = document.createElement('canvas'); c.width = c.height = 1
    const x = c.getContext('2d', { willReadFrequently: true })!
    x.fillStyle = '#000'; x.fillStyle = css; x.fillRect(0, 0, 1, 1)
    const d = x.getImageData(0, 0, 1, 1).data
    return [d[0]!, d[1]!, d[2]!]
  } catch { return respaldo }
}

export function montarBot(canvas: HTMLCanvasElement, o: { reducido: boolean }) {
  const C: Record<string, RGB> = {
    teal: rgbDe('primary-700', [2, 66, 78]), teal2: rgbDe('primary-500', [43, 97, 108]), orange: rgbDe('secondary-400', [246, 164, 44]),
    ok: rgbDe('feedback-success-border', [46, 139, 87]), warn: rgbDe('feedback-warning-border', [227, 155, 28]), bad: rgbDe('feedback-danger-border', [192, 69, 58]),
    line: rgbDe('border-subtle', [45, 64, 72]), muted: rgbDe('fg-muted', [157, 180, 186]), texto: rgbDe('fg-default', [232, 240, 242]),
    superficie: rgbDe('bg-surface', [27, 42, 49]), suelo: rgbDe('bg-surface-sunken', [20, 32, 38]), lienzo: rgbDe('bg-canvas', [15, 26, 31]),
  }
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.25
  const escena = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, 1, 0.1, 20)
  escena.add(new THREE.HemisphereLight(0xfff4e6, 0x203a44, 1.9))
  const luz = new THREE.DirectionalLight(0xffffff, 2.4); luz.position.set(1.5, 2.5, 3); escena.add(luz)
  const kit = new Kit(C)
  const bot = crearRobot(kit, { cuerpo: mezcla(C.orange!, C.teal2!, 0.45), acento: C.orange!, escala: 1, fase: 1.3 })
  escena.add(bot.g)
  cam.position.set(0, 1.0, 3.05); cam.lookAt(0, 0.98, 0)
  const ajustar = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix() }
  const ro = new ResizeObserver(ajustar); ro.observe(canvas); ajustar()
  let estado: EstadoBot = 'reposo', desde = 0, miraX = 0, miraY = 0
  const mover = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); miraX = Math.max(-1, Math.min(1, (e.clientX - (b.left + b.width / 2)) / 400)); miraY = Math.max(-1, Math.min(1, (e.clientY - (b.top + b.height / 2)) / 400)) }
  if (!o.reducido) addEventListener('pointermove', mover)
  const parar = bucle(o.reducido, (ahora) => {
    const t = ahora / 1000, dt = t - desde
    animarRobotBase(bot, t, o.reducido, estado === 'pensando' ? 3 : estado === 'hablando' ? 2 : 1)
    if (!o.reducido) {
      const pensando = estado === 'pensando', hablando = estado === 'hablando', feliz = estado === 'feliz'
      bot.cabeza.rotation.y += ((pensando ? Math.sin(t * 3) * 0.35 : miraX * 0.5) - bot.cabeza.rotation.y) * 0.1
      bot.cabeza.rotation.x += (((pensando ? -0.2 : 0) + miraY * 0.25 + (hablando ? Math.sin(t * 12) * 0.05 : 0)) - bot.cabeza.rotation.x) * 0.1
      bot.g.position.y = Math.sin(t * 1.6) * 0.02 + (feliz ? Math.abs(Math.sin(t * 9)) * 0.06 : 0)
      bot.ojos.forEach((e) => { e.scale.y += ((feliz ? 0.35 : pensando ? 0.7 : e.scale.y > 0.95 ? 1 : e.scale.y) - e.scale.y) * 0.3; e.scale.x = hablando ? 1 + Math.sin(t * 14) * 0.18 : 1 })
      bot.bd.p.rotation.z = -0.3 + (feliz ? Math.sin(t * 10) * 0.5 : 0)
    }
    void dt; desde = t
    r.render(escena, cam)
  })
  return {
    setEstado: (e: EstadoBot) => { estado = e },
    dispose: () => {
      parar(); ro.disconnect(); removeEventListener('pointermove', mover)
      escena.traverse((x) => { const m = x as THREE.Mesh; if (m.isMesh) { (Array.isArray(m.material) ? m.material : [m.material]).forEach((q) => q.dispose()) } })
      r.dispose()
    },
  }
}
