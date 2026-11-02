/**
 * Política de autonomía de Tigo y su gateway (lógica PURA, sin Angular). Propuesta fuera de la Etapa 1, todo simulado.
 * ADR-007 / RN-SVC-032: la IA sugiere, el gestor decide. Qué hace Tigo solo, qué pide aprobar y qué no hace sale de
 * una política (datos) por tipo de ticket y etapa, aplicada por `decidirAccion`; no de banderas escritas en cada propuesta.
 *
 * Reservado, NO implementado: el nivel «ejecuta-solo». Solo existiría con evidencia de confianza y la decisión de una persona.
 */
// Solo tipos: el runner de pruebas (node) no resuelve imports de valores sin extensión.
import type { EfectoTicket, PasoGuion, PropuestaGuion } from './tigo-guion';
import type { EtapaTigo } from './tigo-modelo';

export type NivelTigo = 'solo-sugiere' | 'prepara-con-aprobacion' | 'no-interviene';
export type ClaseAccion = 'interna' | 'cliente' | 'deriva' | 'cierre' | 'libro' | 'sistema';

export const ETIQUETA_NIVEL: Record<NivelTigo, string> = {
  'solo-sugiere': 'Solo sugiere',
  'prepara-con-aprobacion': 'Prepara y espera aprobación',
  'no-interviene': 'No interviene',
};

export const ETIQUETA_CLASE: Record<ClaseAccion, string> = {
  interna: 'Interna y reversible',
  cliente: 'Sale al cliente',
  deriva: 'Deriva a otra área',
  cierre: 'Resuelve o cierra',
  libro: 'Libro de Reclamaciones',
  sistema: 'Informativa',
};

/** Clase de cada acción (clave = `PropuestaTigo.accion`). */
export const CLASE_POR_ACCION: Readonly<Record<string, ClaseAccion>> = {
  clasificar: 'interna',
  anonimizar: 'interna',
  enrutar: 'interna',
  asignar: 'interna',
  resumir360: 'interna',
  'citar-guia': 'interna',
  'consultar-motor': 'interna',
  'completar-actividad': 'interna',
  'resumir-caso': 'interna',
  'plazo-libro': 'interna',
  redactar: 'cliente',
  'redactar-acuse': 'cliente',
  resolver: 'cierre',
  'registrar-asiento': 'libro',
  'derivar-legal': 'deriva',
  'escalar-legal': 'deriva',
  // Pasan tal cual: informativas o post-cierre ya autorizado.
  guardarrailes: 'sistema',
  'detectar-libro': 'sistema',
  'detectar-riesgo': 'sistema',
  'fin-sin-cierre': 'sistema',
  'atender-manual': 'sistema',
  'confirmar-cliente': 'sistema',
  encuesta: 'sistema',
};

export const ETIQUETA_ACCION: Readonly<Record<string, string>> = {
  clasificar: 'Clasificar el pedido',
  anonimizar: 'Anonimizar el mensaje',
  enrutar: 'Citar el flujo y el destino',
  asignar: 'Asignar al gestor de menor carga',
  resumir360: 'Resumir la Consulta 360',
  'citar-guia': 'Citar la guía vigente',
  'consultar-motor': 'Consultar el Motor de Consultas',
  'completar-actividad': 'Completar la actividad 1',
  'resumir-caso': 'Resumir el caso',
  'plazo-libro': 'Calcular el plazo legal',
  redactar: 'Redactar la respuesta al cliente',
  'redactar-acuse': 'Redactar el acuse de recibo',
  resolver: 'Resolver el ticket',
  'registrar-asiento': 'Registrar el asiento del Libro',
  'derivar-legal': 'Derivar al responsable legal',
  'escalar-legal': 'Escalar a Legal (Eje 3)',
  guardarrailes: 'Revisar los guardarraíles',
  'detectar-libro': 'Detectar un asiento del Libro',
  'detectar-riesgo': 'Detectar riesgo verbal',
  'fin-sin-cierre': 'Terminar sin cerrar',
  'atender-manual': 'Atención manual',
  'confirmar-cliente': 'Confirmación del cliente (simulada)',
  encuesta: 'Encuesta CSAT/CES (simulada)',
};

/** Una acción desconocida se trata como `cliente`: el valor seguro (pide aprobación). */
export const claseDe = (accion: string): ClaseAccion => CLASE_POR_ACCION[accion] ?? 'cliente';

export interface PoliticaEtapa {
  tipo: string;
  etapa: EtapaTigo;
  participa: boolean;
  nivel: NivelTigo;
}

const ETAPAS: readonly EtapaTigo[] = ['registro', 'enrutamiento', 'atencion', 'cierre', 'postcierre'];

/** Comportamiento actual: Tigo participa en todo y prepara con aprobación. Sin fila (tipo, etapa) => no participa. */
export const POLITICAS_POR_DEFECTO: readonly PoliticaEtapa[] = ['CTA', 'QUE'].flatMap((tipo) =>
  ETAPAS.map((etapa): PoliticaEtapa => ({ tipo, etapa, participa: true, nivel: 'prepara-con-aprobacion' })),
);

export const buscarPolitica = (tabla: readonly PoliticaEtapa[], tipo: string, etapa: EtapaTigo): PoliticaEtapa | undefined =>
  tabla.find((p) => p.tipo === tipo && p.etapa === etapa);

export type ResultadoGateway = 'ejecutar' | 'pedir-aprobacion' | 'detener';

/**
 * El gateway. Las `sistema` (informativas) pasan siempre tal cual para que se sigan mostrando, aun sin política.
 * PISO NO RELAJABLE: `cliente`, `deriva`, `cierre` y `libro` nunca devuelven `ejecutar`, sea cual sea el nivel.
 */
export function decidirAccion(args: { accion: string; politica?: PoliticaEtapa }): { resultado: ResultadoGateway; motivo: string } {
  const { accion, politica } = args;
  const clase = claseDe(accion);
  if (clase === 'sistema') return { resultado: 'ejecutar', motivo: 'Acción informativa: pasa tal cual.' };
  if (!politica) return { resultado: 'detener', motivo: 'Sin política para este tipo y etapa: Tigo no participa.' };
  if (!politica.participa) return { resultado: 'detener', motivo: 'Tigo no participa en esta etapa.' };
  if (politica.nivel === 'no-interviene') return { resultado: 'detener', motivo: 'La política de esta etapa es «No interviene».' };
  if (clase !== 'interna') {
    return { resultado: 'pedir-aprobacion', motivo: `${ETIQUETA_CLASE[clase]}: siempre la decide una persona.` };
  }
  return politica.nivel === 'prepara-con-aprobacion'
    ? { resultado: 'ejecutar', motivo: 'Acción interna y reversible: Tigo la hace solo.' }
    : { resultado: 'pedir-aprobacion', motivo: 'La política de esta etapa es «Solo sugiere».' };
}

/** Límites duros, solo para mostrar. La lógica real es `evaluarGuardarrailes` (tigo-guion.ts): ninguna política los relaja. */
export const GUARDARRAILES: readonly { id: string; nombre: string; descripcion: string; piso: 'se-detiene' }[] = [
  { id: 'conflicto', nombre: 'Conflicto activo', descripcion: 'El ticket tiene una señal de conflicto: lo atiende una persona.', piso: 'se-detiene' },
  { id: 'riesgo-verbal', nombre: 'Riesgo verbal', descripcion: 'Amenaza de denuncia, INDECOPI, demanda o publicación en redes, u hostilidad.', piso: 'se-detiene' },
  { id: 'eje3', nombre: 'Eje 3 (Legal)', descripcion: 'Casos de Eje 3: Tigo no interviene.', piso: 'se-detiene' },
  { id: 'libro', nombre: 'Libro de Reclamaciones', descripcion: 'Tipos QUE y REC: el asiento y el plazo legal los decide una persona.', piso: 'se-detiene' },
  { id: 'rayo', nombre: 'Rayo', descripcion: 'Urgencia marcada por el supervisor.', piso: 'se-detiene' },
  { id: 'resolucion-contrato', nombre: 'Resolución de contrato (RES)', descripcion: 'Una resolución de contrato no se automatiza.', piso: 'se-detiene' },
];

/**
 * Aplica la política a cada propuesta del guion. `ejecutar` => 'ejecutada' (sus efectos se aplican al ejecutar el paso);
 * `pedir-aprobacion` => 'pendiente' y sus efectos pasan a `efectosAlAprobar`; `detener` => 'bloqueada', sin efectos y con
 * el motivo en `detalle`. Las `sistema` conservan su estado. Si la etapa no participa, tampoco se aplican los efectos del paso.
 */
export function aplicarPolitica(
  pasos: readonly PasoGuion[],
  politica: (etapa: EtapaTigo) => PoliticaEtapa | undefined,
): PasoGuion[] {
  return pasos.map((paso) => {
    const pe = politica(paso.etapa);
    const interviene = !!pe && pe.participa && pe.nivel !== 'no-interviene';
    const propuestas = paso.propuestas.map((p): PropuestaGuion => {
      const d = decidirAccion({ accion: p.accion, politica: politica(p.etapa) });
      if (claseDe(p.accion) === 'sistema') return p;
      const { efectos, efectosAlAprobar, ...resto } = p;
      if (d.resultado === 'ejecutar') return { ...resto, estado: 'ejecutada', requiereAprobacion: false, ...(efectos ? { efectos } : {}) };
      if (d.resultado === 'detener') return { ...resto, estado: 'bloqueada', requiereAprobacion: false, detalle: d.motivo };
      const alAprobar = [...(efectos ?? []), ...(efectosAlAprobar ?? [])];
      return { ...resto, estado: 'pendiente', requiereAprobacion: true, ...(alAprobar.length ? { efectosAlAprobar: alAprobar } : {}) };
    });
    return { ...paso, efectos: interviene ? paso.efectos : [], propuestas };
  });
}

/** Efectos que se aplican al ejecutar el paso (ya con la política): los de sus propuestas ejecutadas y los de sistema. */
export const efectosDelPaso = (paso: PasoGuion): EfectoTicket[] => [
  ...paso.propuestas.filter((p) => p.estado === 'ejecutada').flatMap((p) => p.efectos ?? []),
  ...paso.efectos,
];

/* ── Versionado y bitácora de cambios (puro; el servicio solo guarda el resultado) ── */

export interface CambioPolitica {
  version: number;
  fecha: Date;
  autor: string;
  tipo: string;
  etapa: EtapaTigo;
  antes: { participa: boolean; nivel: NivelTigo };
  despues: { participa: boolean; nivel: NivelTigo };
  /** Motivo del administrador. Nunca texto de un cliente. */
  motivo: string;
}

/**
 * Cambia una fila y crea la versión siguiente. Devuelve null si el motivo está vacío, la fila no existe
 * o no hay un cambio real. Quién puede hacerlo lo decide el servicio, no esta función.
 */
export function registrarCambio(
  tabla: readonly PoliticaEtapa[],
  version: number,
  args: { tipo: string; etapa: EtapaTigo; cambio: Partial<{ participa: boolean; nivel: NivelTigo }>; motivo: string; autor: string; fecha: Date },
): { tabla: PoliticaEtapa[]; version: number; registro: CambioPolitica } | null {
  const motivo = args.motivo.trim();
  const fila = buscarPolitica(tabla, args.tipo, args.etapa);
  if (!motivo || !fila) return null;
  const despues = { participa: args.cambio.participa ?? fila.participa, nivel: args.cambio.nivel ?? fila.nivel };
  if (despues.participa === fila.participa && despues.nivel === fila.nivel) return null;
  const nueva = version + 1;
  return {
    tabla: tabla.map((p) => (p === fila ? { ...p, ...despues } : p)),
    version: nueva,
    registro: {
      version: nueva,
      fecha: args.fecha,
      autor: args.autor,
      tipo: args.tipo,
      etapa: args.etapa,
      antes: { participa: fila.participa, nivel: fila.nivel },
      despues,
      motivo,
    },
  };
}
