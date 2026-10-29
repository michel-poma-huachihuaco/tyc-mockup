/**
 * Buscador de módulos y funciones (paleta Ctrl/Cmd+K) · lógica pura, sin Angular.
 *
 * Los sinónimos y las funciones de abajo son un punto de partida SIN validar con negocio.
 * Solo se indexan funciones que la app tiene; elegir una lleva al MÓDULO: hoy no hay deep-link a pestañas
 * ni acciones (son señales locales de cada vista). Los permisos NO se repiten aquí: quien llama pasa los
 * módulos que el sidebar ya muestra al perfil activo, y una función solo aparece si su módulo está entre ellos.
 */
import type { VistaAtc } from './datos-atc';
import type { RolPrototipoAtc } from './estado-prototipo-atc';

/** Igual que `normalizar` de busqueda-fonetica.ts; se repite porque las pruebas (node) solo admiten imports de tipos sin extensión. */
const normalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export interface EntradaIndice {
  readonly id: string;
  readonly etiqueta: string;
  /** Rótulo del módulo (o del ámbito) que se muestra como contexto. */
  readonly grupo: string;
  /** Módulo al que lleva. Debe ser un módulo listable (no `detalle` ni `buses`). */
  readonly vista: VistaAtc;
  readonly sinonimos: readonly string[];
  /** Sin valor: todos los perfiles menos CLIENTE. Con valor: solo esos (CLIENTE solo entra si se nombra). */
  readonly roles?: readonly RolPrototipoAtc[];
  /** Rótulo alterno para el cliente del portal. */
  readonly etiquetaCliente?: string;
}

const ADMIN: readonly RolPrototipoAtc[] = ['ADMIN_FUNCIONAL', 'SUPERVISOR'];
const CLI: readonly RolPrototipoAtc[] = ['CLIENTE'];

export const SINONIMOS_MODULO: Readonly<Partial<Record<VistaAtc, readonly string[]>>> = {
  c360: ['cliente', 'ficha', 'consulta 360', 'contrato', 'grafo', 'dni', 'buscar cliente'],
  vivo: ['planta', 'monitor', 'tiempo real', 'responsables', 'sla', 'semaforo', 'tv'],
  torre: ['control', 'cx', 'nps', 'encuesta', 'denuncia', 'riesgo', 'informe'],
  bandeja: ['tickets', 'solicitudes', 'casos', 'buscar ticket', 'vencimiento', 'sla', 'rayo', 'prioridad'],
  tudia: ['mi dia', 'avance', 'agenda', 'pendientes', 'hoy'],
  nuevo: ['registrar ticket', 'crear ticket', 'nueva atencion', 'alta', 'solicitud', 'reclamo', 'consulta'],
  evento: ['entregafest', 'entrega fest', 'moderacion', 'frases ancla', 'padron', 'bus'],
  ingreso: ['garita', 'acceso', 'promotores', 'asesores', 'visitas'],
  libro: ['reclamo', 'queja', 'indecopi', 'plazo legal', 'asiento', 'apelacion'],
  garantias: ['garantia', 'postventa', 'acta de entrega', 'vigencia', 'inspeccion'],
  morosidad: ['mora', 'moroso', 'impago', 'deuda', 'cobranza', 'cuotas', 'resolucion de contrato', 'carta'],
  sgd: ['documental', 'comite', 'paquete', 'limbo', 'escalamiento', 'casos sgd'],
  reasignar: ['reasignacion', 'masiva', 'ausencia', 'vacaciones', 'rotar', 'carga'],
  alertas: ['sla', 'vencimiento', 'preventivas', 'incumplimiento', 'plazos', 'job', 'bitacora'],
  cierre: ['cierre', '72 horas', 'csat', 'encuesta', 'causas raiz', 'ia'],
  politicas: ['sla', 'matriz', 'plazos', 'horas habiles', 'prioridad', 'canal'],
  workflow: ['mantenimiento', 'flujos', 'tipos', 'subtipos', 'guias', 'pasos', 'areas', 'catalogo'],
};

export const INDICE_FUNCIONES: readonly EntradaIndice[] = [
  { id: 'c360-grafo', etiqueta: 'Grafo 3D y 2D del cliente', grupo: 'Consulta 360', vista: 'c360', sinonimos: ['red', 'relaciones', 'visualizacion'] },
  { id: 'c360-contrato', etiqueta: 'Ver contrato, adendas, firmantes y cronograma', grupo: 'Consulta 360', vista: 'c360', sinonimos: ['contrato', 'expediente contractual', 'adenda', 'firmante', 'cronograma', 'clausula'] },
  { id: 'c360-buscar', etiqueta: 'Buscar cliente por nombre o DNI', grupo: 'Consulta 360', vista: 'c360', sinonimos: ['dni', 'nombre', 'telefono', 'llamar', 'padron'] },
  { id: 'c360-gestion', etiqueta: 'Nueva gestión desde la ficha del cliente', grupo: 'Consulta 360', vista: 'c360', sinonimos: ['crear ticket del cliente', 'lote'] },
  { id: 'vivo-planta', etiqueta: 'Planta 3D (tickets por áreas)', grupo: 'Operación en Vivo', vista: 'vivo', sinonimos: ['salas', 'areas', '3d'] },
  { id: 'vivo-monitor', etiqueta: 'Monitor de responsables y SLA', grupo: 'Operación en Vivo', vista: 'vivo', sinonimos: ['tablero', 'indicadores', 'semaforo'] },
  { id: 'vivo-tv', etiqueta: 'Pantalla completa (modo TV)', grupo: 'Operación en Vivo', vista: 'vivo', sinonimos: ['tv', 'proyector', 'sala'] },
  { id: 'vivo-correos', etiqueta: 'Correos de asignación', grupo: 'Operación en Vivo', vista: 'vivo', sinonimos: ['email', 'avisos'] },
  { id: 'torre-riesgo', etiqueta: 'Riesgo de denuncia', grupo: 'Torre de Control CX', vista: 'torre', sinonimos: ['denuncia', 'indecopi', 'reclamo'] },
  { id: 'torre-encuestas', etiqueta: 'Encuestas (NPS por tipo, área y gestor)', grupo: 'Torre de Control CX', vista: 'torre', sinonimos: ['nps', 'csat', 'recomendacion', 'satisfaccion'] },
  { id: 'torre-informes', etiqueta: 'Informes diario y quincenal', grupo: 'Torre de Control CX', vista: 'torre', sinonimos: ['informe', 'reporte'] },
  { id: 'bandeja-filtros', etiqueta: 'Filtrar tickets por columna', grupo: 'Bandeja de tickets', vista: 'bandeja', sinonimos: ['buscar ticket', 'filtros', 'empresa', 'canal', 'estado'] },
  { id: 'bandeja-rayo', etiqueta: 'Marcar un ticket con el rayo de prioridad', grupo: 'Bandeja de tickets', vista: 'bandeja', sinonimos: ['rayo', 'urgente', 'prioridad'] },
  { id: 'bandeja-sla', etiqueta: 'Ver vencimiento SLA de los tickets', grupo: 'Bandeja de tickets', vista: 'bandeja', sinonimos: ['sla', 'vencimiento', 'plazo'] },
  { id: 'bandeja-mios', etiqueta: 'Ver el estado y la trazabilidad de mi ticket', grupo: 'Mis tickets', vista: 'bandeja', sinonimos: ['seguimiento', 'estado', 'historial', 'mis tickets'], roles: CLI },
  { id: 'exp-derivar', etiqueta: 'Derivar un ticket a otra área', grupo: 'Expediente de ticket (desde la Bandeja)', vista: 'bandeja', sinonimos: ['derivar', 'escalar'] },
  { id: 'exp-reabrir', etiqueta: 'Reabrir un ticket con nuevo compromiso', grupo: 'Expediente de ticket (desde la Bandeja)', vista: 'bandeja', sinonimos: ['reabrir'] },
  { id: 'exp-guia', etiqueta: 'Guía de solución paso a paso', grupo: 'Expediente de ticket (desde la Bandeja)', vista: 'bandeja', sinonimos: ['guia', 'solucion', 'pasos'] },
  { id: 'exp-interacciones', etiqueta: 'Registrar interacciones del ticket', grupo: 'Expediente de ticket (desde la Bandeja)', vista: 'bandeja', sinonimos: ['interaccion', 'nota', 'llamada'] },
  { id: 'tudia-avance', etiqueta: 'Ver mi avance diario y el de mi equipo', grupo: 'Tu día', vista: 'tudia', sinonimos: ['equipo', 'hoy', 'tickets en riesgo'] },
  { id: 'nuevo-registrar', etiqueta: 'Registrar ticket', grupo: 'Nuevo ticket', vista: 'nuevo', sinonimos: ['crear ticket', 'nueva atencion', 'alta', 'caso', 'canal'] },
  { id: 'nuevo-sla', etiqueta: 'SLA congelado al abrir el ticket (horas hábiles)', grupo: 'Nuevo ticket', vista: 'nuevo', sinonimos: ['sla', 'plazo'] },
  { id: 'nuevo-cliente', etiqueta: 'Registrar una nueva solicitud', grupo: 'Registrar nueva solicitud', vista: 'nuevo', sinonimos: ['solicitud', 'crear', 'registrar ticket'], roles: CLI },
  { id: 'evento-padron', etiqueta: 'Control de padrón por QR o DNI', grupo: 'EntregaFest en vivo', vista: 'evento', sinonimos: ['padron', 'qr', 'dni'] },
  { id: 'evento-frases', etiqueta: 'Frases ancla y riesgo verbal', grupo: 'EntregaFest en vivo', vista: 'evento', sinonimos: ['frases ancla', 'moderacion'] },
  { id: 'evento-bus', etiqueta: 'Reservar mi cupo en el bus', grupo: 'EntregaFest y reserva de bus', vista: 'evento', sinonimos: ['bus', 'cupo', 'reserva', 'transporte'], roles: CLI },
  { id: 'ingreso-garita', etiqueta: 'Registrar ingreso de personas a un proyecto', grupo: 'Ingreso a proyectos', vista: 'ingreso', sinonimos: ['garita', 'visita', 'acceso'] },
  { id: 'libro-asiento', etiqueta: 'Registrar asiento en el Libro', grupo: 'Libro de reclamaciones', vista: 'libro', sinonimos: ['queja', 'reclamo', 'nuevo asiento'] },
  { id: 'libro-plazo', etiqueta: 'Plazo legal de 15 días y prórroga', grupo: 'Libro de reclamaciones', vista: 'libro', sinonimos: ['plazo', 'prorroga', 'vencimiento', 'indecopi'] },
  { id: 'libro-apelacion', etiqueta: 'Apelaciones internas e INDECOPI', grupo: 'Libro de reclamaciones', vista: 'libro', sinonimos: ['apelacion'] },
  { id: 'libro-huerfanos', etiqueta: 'Reclamos sin ticket (huérfanos)', grupo: 'Libro de reclamaciones', vista: 'libro', sinonimos: ['huerfanos'] },
  { id: 'libro-cliente', etiqueta: 'Presentar un reclamo o queja', grupo: 'Libro de reclamaciones', vista: 'libro', sinonimos: ['reclamo', 'queja'], roles: CLI },
  { id: 'gar-registrar', etiqueta: 'Registrar reclamo de garantía', grupo: 'Garantías postventa', vista: 'garantias', sinonimos: ['garantia', 'acta de entrega'] },
  { id: 'gar-vigencia', etiqueta: 'Vigencia y periodo de cobertura', grupo: 'Garantías postventa', vista: 'garantias', sinonimos: ['vigencia', 'cobertura'] },
  { id: 'mor-caso', etiqueta: 'Caso de resolución por impago', grupo: 'Morosidad', vista: 'morosidad', sinonimos: ['resolucion de contrato', 'mora', 'moroso', 'impago'] },
  { id: 'mor-carta', etiqueta: 'Carta de alerta y suspensión por reclamo abierto', grupo: 'Morosidad', vista: 'morosidad', sinonimos: ['carta', 'suspender', 'cancelacion'] },
  { id: 'sgd-limbo', etiqueta: 'Casos en limbo y escalamientos', grupo: 'Mesa SGD', vista: 'sgd', sinonimos: ['limbo', 'escalamiento', 'escalar a comite'] },
  { id: 'sgd-paquete', etiqueta: 'Paquete documental 6/6 antes del Comité', grupo: 'Mesa SGD', vista: 'sgd', sinonimos: ['comite', 'paquete', 'documentos'] },
  { id: 'rea-masiva', etiqueta: 'Reasignar masivamente por cese o rotación', grupo: 'Reasignar en bloque', vista: 'reasignar', sinonimos: ['masiva', 'cese', 'rotacion', 'ausencia', 'vacaciones'] },
  { id: 'rea-auto', etiqueta: 'Auto-asignar al agente con menos carga', grupo: 'Reasignar en bloque', vista: 'reasignar', sinonimos: ['auto asignar', 'asignacion automatica', 'balanceo', 'carga'] },
  { id: 'ale-sla', etiqueta: 'Alertas de incumplimiento de SLA', grupo: 'Alertas SLA', vista: 'alertas', sinonimos: ['sla', 'vencimiento', 'incumplimiento'] },
  { id: 'ale-bitacora', etiqueta: 'Bitácora de ejecuciones del job de alertas', grupo: 'Alertas SLA', vista: 'alertas', sinonimos: ['job', 'bitacora'] },
  { id: 'cie-encuesta', etiqueta: 'Encuesta al cierre (CSAT)', grupo: 'Cierre end-to-end', vista: 'cierre', sinonimos: ['csat', 'satisfaccion', 'encuesta', 'causas raiz'] },
  { id: 'pol-matriz', etiqueta: 'Matriz de SLA por empresa, tipo y prioridad', grupo: 'Políticas SLA', vista: 'politicas', sinonimos: ['sla', 'plazo', 'horas habiles'] },
  { id: 'wf-tipos', etiqueta: 'Tipos y subtipos de ticket', grupo: 'Mantenimiento', vista: 'workflow', sinonimos: ['tipos', 'subtipos', 'catalogo', 'crear tipo'] },
  { id: 'wf-flujos', etiqueta: 'Flujos por tipo y área (pasos y responsables)', grupo: 'Mantenimiento', vista: 'workflow', sinonimos: ['flujo', 'pasos', 'responsables', 'publicar version'] },
  { id: 'wf-guias', etiqueta: 'Guías de solución versionadas y alertas de falta de guía', grupo: 'Mantenimiento', vista: 'workflow', sinonimos: ['guias', 'publicar'], roles: ADMIN },
];

/** Ids de funciones por id, para resolver recientes guardados. */
export const funcionPorId = (id: string): EntradaIndice | undefined => INDICE_FUNCIONES.find((f) => f.id === id);

/** Una función se ofrece si el perfil la admite y su módulo está entre los que el sidebar le muestra. */
export function funcionesVisibles(rol: RolPrototipoAtc, vistasVisibles: ReadonlySet<VistaAtc>): EntradaIndice[] {
  return INDICE_FUNCIONES.filter(
    (f) => vistasVisibles.has(f.vista) && (f.roles ? f.roles.includes(rol) : rol !== 'CLIENTE'),
  );
}

export const NIVEL_NOMBRE = 300;
export const NIVEL_SINONIMO = 200;
export const NIVEL_FUNCION = 100;

const palabrasDe = (texto: string): string[] => {
  const n = normalizar(texto);
  return n ? n.split(' ') : [];
};

/** Todas las palabras de la consulta, en cualquier orden, deben ser inicio de alguna palabra del texto. */
export function coincidePalabras(consulta: string, texto: string): boolean {
  const q = palabrasDe(consulta);
  const t = palabrasDe(texto);
  return q.length > 0 && q.every((p) => t.some((w) => w.startsWith(p)));
}

/** 0 = no coincide. Nombre (300) > sinónimo (200) > resto (100); suma por palabra de la consulta. */
export function puntaje(consulta: string, nombre: string, sinonimos: readonly string[], resto = ''): number {
  const q = palabrasDe(consulta);
  if (q.length === 0) return 0;
  const n = palabrasDe(nombre);
  const s = palabrasDe(sinonimos.join(' '));
  const r = palabrasDe(resto);
  let total = 0;
  for (const p of q) {
    const ok = (ws: string[]) => ws.some((w) => w.startsWith(p));
    if (ok(n)) total += NIVEL_NOMBRE;
    else if (ok(s)) total += NIVEL_SINONIMO;
    else if (ok(r)) total += NIVEL_FUNCION;
    else return 0;
  }
  return total - n.length; // desempate: el nombre más corto (más específico) primero
}

export interface ModuloBuscable {
  readonly vista: VistaAtc;
  readonly titulo: string;
  readonly subtitulo: string;
}

export interface ResultadoModulo {
  readonly modulo: ModuloBuscable;
  readonly puntaje: number;
}
export interface ResultadoFuncion {
  readonly funcion: EntradaIndice;
  readonly etiqueta: string;
  readonly puntaje: number;
}

/** Módulos y funciones que coinciden, mejor primero (empate: orden original). Consulta vacía: nada. */
export function buscar(
  consulta: string,
  modulos: readonly ModuloBuscable[],
  funciones: readonly EntradaIndice[],
  esCliente = false,
): { modulos: ResultadoModulo[]; funciones: ResultadoFuncion[] } {
  const ordenar = <T extends { puntaje: number }>(xs: T[]): T[] =>
    xs.map((x, i) => ({ x, i })).sort((a, b) => b.x.puntaje - a.x.puntaje || a.i - b.i).map((o) => o.x);
  return {
    modulos: ordenar(
      modulos
        .map((modulo) => ({
          modulo,
          puntaje: puntaje(consulta, modulo.titulo, SINONIMOS_MODULO[modulo.vista] ?? [], modulo.subtitulo),
        }))
        .filter((r) => r.puntaje > 0),
    ),
    funciones: ordenar(
      funciones
        .map((funcion) => {
          const etiqueta = esCliente && funcion.etiquetaCliente ? funcion.etiquetaCliente : funcion.etiqueta;
          return { funcion, etiqueta, puntaje: puntaje(consulta, etiqueta, funcion.sinonimos, funcion.grupo) };
        })
        .filter((r) => r.puntaje > 0),
    ),
  };
}

/* ── Recientes: solo ids de módulo (`mod:<vista>`) o función (`fn:<id>`), por persona, sin datos sensibles ── */
export const MAX_RECIENTES = 5;
export const claveRecientes = (personaId: string): string => `aybar-atc:paleta-recientes:${personaId}`;

/** El más reciente primero, sin repetidos y con tope. */
export function registrarReciente(ids: readonly string[], id: string, max = MAX_RECIENTES): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, max);
}

const idValido = (x: unknown): x is string => typeof x === 'string' && /^(mod|fn):[a-z0-9-]{1,40}$/.test(x);

export function leerRecientes(personaId: string, almacen?: Pick<Storage, 'getItem'>): string[] {
  try {
    const crudo = (almacen ?? localStorage).getItem(claveRecientes(personaId));
    const dato: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(dato) ? dato.filter(idValido).slice(0, MAX_RECIENTES) : [];
  } catch {
    return [];
  }
}

export function guardarRecientes(personaId: string, ids: readonly string[], almacen?: Pick<Storage, 'setItem'>): void {
  try {
    (almacen ?? localStorage).setItem(claveRecientes(personaId), JSON.stringify(ids.slice(0, MAX_RECIENTES)));
  } catch {
    /* almacenamiento bloqueado o lleno: los recientes siguen en memoria durante la sesión */
  }
}
