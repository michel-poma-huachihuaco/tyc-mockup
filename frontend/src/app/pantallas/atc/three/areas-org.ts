import type { SalaOficina } from '../datos-atc';

/**
 * Las 13 áreas de la organización, en sus 5 grupos, que se suman a las 6 salas de atención de la Planta de
 * Operación en Vivo. Es propio de la Planta: no cambia las salas ni los tipos de ticket del resto de la consola.
 * Las claves no chocan con las de las salas de atención (`eje1`, `cob`, `libro`, `legal`, `post`, `proy`).
 */

export interface GrupoOrg {
  readonly id: string;
  readonly nombre: string;
  /** Claves de las áreas del grupo, en el orden en que se dibujan. */
  readonly areas: readonly string[];
  /** Token `--aybar-color-*` (sin prefijo) del grupo en el tema claro y en el oscuro. */
  readonly tokenClaro: string;
  readonly tokenOscuro: string;
}

export interface AreaOrg {
  readonly k: string;
  readonly nombre: string;
  /** Nombre corto para el letrero de la sala en el 3D: el completo no cabe sobre una sala. */
  readonly corto: string;
  readonly grupo: string;
}

export const GRUPOS_ORG: readonly GrupoOrg[] = [
  { id: 'g-datos', nombre: 'Datos, IA, Tecnología y Ciberseguridad', areas: ['datos'], tokenClaro: 'info-600', tokenOscuro: 'info-300' },
  {
    id: 'g-gobierno',
    nombre: 'Gobierno y Control Institucional',
    areas: ['riesgo', 'legalpub', 'finanzas'],
    tokenClaro: 'secondary-700',
    tokenOscuro: 'secondary-400',
  },
  {
    id: 'g-habilitacion',
    nombre: 'Habilitación y Resiliencia Corporativa',
    areas: ['talento', 'logistica', 'seguridad'],
    tokenClaro: 'neutral-700',
    tokenOscuro: 'neutral-300',
  },
  {
    id: 'g-mercado',
    nombre: 'Mercado, Cliente y Posicionamiento',
    areas: ['comercial', 'experiencia', 'comunicaciones'],
    tokenClaro: 'primary-600',
    tokenOscuro: 'primary-400',
  },
  {
    id: 'g-produccion',
    nombre: 'Producción y Transformación Física',
    areas: ['obra', 'diseno', 'industrial'],
    tokenClaro: 'success-700',
    tokenOscuro: 'success-300',
  },
];

export const AREAS_ORG: readonly AreaOrg[] = [
  { k: 'datos', nombre: 'Datos, IA, Tecnología y Ciberseguridad', corto: 'Datos, IA y Ciberseguridad', grupo: 'g-datos' },
  { k: 'riesgo', nombre: 'Gobierno, Riesgo y Cumplimiento', corto: 'Riesgo y Cumplimiento', grupo: 'g-gobierno' },
  { k: 'legalpub', nombre: 'Legal y Asuntos Públicos', corto: 'Legal y Asuntos Públicos', grupo: 'g-gobierno' },
  { k: 'finanzas', nombre: 'Finanzas y Capital', corto: 'Finanzas y Capital', grupo: 'g-gobierno' },
  { k: 'talento', nombre: 'Talento, Conocimiento y Cultura', corto: 'Talento y Cultura', grupo: 'g-habilitacion' },
  { k: 'logistica', nombre: 'Logística, Abastecimiento y Activos', corto: 'Logística y Activos', grupo: 'g-habilitacion' },
  { k: 'seguridad', nombre: 'Seguridad Integral y Control Territorial', corto: 'Seguridad Integral', grupo: 'g-habilitacion' },
  { k: 'comercial', nombre: 'Comercial y Activación', corto: 'Comercial y Activación', grupo: 'g-mercado' },
  { k: 'experiencia', nombre: 'Experiencia al Cliente', corto: 'Experiencia al Cliente', grupo: 'g-mercado' },
  { k: 'comunicaciones', nombre: 'Comunicaciones, Marca y Vocería', corto: 'Comunicaciones y Marca', grupo: 'g-mercado' },
  { k: 'obra', nombre: 'Proyectos y Construcción', corto: 'Proyectos y Construcción', grupo: 'g-produccion' },
  { k: 'diseno', nombre: 'Diseño Físico Urbano y Paisajismo', corto: 'Diseño y Paisajismo', grupo: 'g-produccion' },
  { k: 'industrial', nombre: 'Industrial, Planta y Talleres', corto: 'Industrial y Talleres', grupo: 'g-produccion' },
];

/** Claves de las áreas de la organización, para separarlas de las salas de atención. */
export const CLAVES_ORG: ReadonlySet<string> = new Set(AREAS_ORG.map((a) => a.k));

const PUESTOS_POR_AREA: Readonly<Record<string, readonly [string, string]>> = {
  datos: ['Valeria T.', 'Marcos Z.'],
  riesgo: ['Gabriela N.', 'Héctor B.'],
  legalpub: ['Fiorella D.', 'Renzo A.'],
  finanzas: ['Alonso G.', 'Natalia P.'],
  talento: ['Karina O.', 'Julio E.'],
  logistica: ['Bruno F.', 'Lidia C.'],
  seguridad: ['Óscar H.', 'Pamela J.'],
  comercial: ['Andrea K.', 'Diego L.'],
  experiencia: ['Camila R.', 'Tomás V.'],
  comunicaciones: ['Silvia M.', 'Iván S.'],
  obra: ['Raúl Q.', 'Mariela T.'],
  diseno: ['Paola W.', 'Enrique X.'],
  industrial: ['Gustavo Y.', 'Rocío Z.'],
};

/** Las salas que ve el motor de la Planta: las mismas que las de atención, sin geometría (esa vive en el 3D). */
export const SALAS_ORG: readonly SalaOficina[] = AREAS_ORG.map((a) => ({
  k: a.k,
  nombre: a.nombre,
  x: 0,
  y: 0,
  w: 0,
  d: 0,
  gestores: PUESTOS_POR_AREA[a.k] ?? [],
}));

/** Tipos de ticket de ejemplo, uno por área, que llegan a las áreas de la organización. */
export const TIPOS_ORG: Readonly<
  Record<string, { readonly nombre: string; readonly area: string; readonly pt: readonly [number, number]; readonly sla: number }>
> = {
  o_datos: { nombre: 'Acceso o dato del cliente', area: 'datos', pt: [25, 55], sla: 220 },
  o_riesgo: { nombre: 'Revisión de cumplimiento', area: 'riesgo', pt: [40, 80], sla: 260 },
  o_legalpub: { nombre: 'Asunto regulatorio o público', area: 'legalpub', pt: [50, 95], sla: 280 },
  o_finanzas: { nombre: 'Cobro, capital y tesorería', area: 'finanzas', pt: [30, 60], sla: 200 },
  o_talento: { nombre: 'Personal de apoyo y cultura', area: 'talento', pt: [20, 45], sla: 180 },
  o_logistica: { nombre: 'Abastecimiento y activos', area: 'logistica', pt: [25, 50], sla: 200 },
  o_seguridad: { nombre: 'Incidente de seguridad en el proyecto', area: 'seguridad', pt: [30, 65], sla: 160 },
  o_comercial: { nombre: 'Visita y activación comercial', area: 'comercial', pt: [15, 35], sla: 140 },
  o_experiencia: { nombre: 'Experiencia y seguimiento del cliente', area: 'experiencia', pt: [15, 35], sla: 140 },
  o_comunicaciones: { nombre: 'Queja pública en medios', area: 'comunicaciones', pt: [35, 70], sla: 220 },
  o_obra: { nombre: 'Obra y construcción del lote', area: 'obra', pt: [50, 100], sla: 300 },
  o_diseno: { nombre: 'Infraestructura urbana y paisajismo', area: 'diseno', pt: [40, 80], sla: 260 },
  o_industrial: { nombre: 'Planta y talleres', area: 'industrial', pt: [40, 85], sla: 260 },
};

/** Plantilla de puestos por área: dos personas por sala. */
const p = (nombre: string, rol: string, ini: number, base: number, meta: number, vel: number, csat: string) => ({
  nombre,
  rol,
  atendidosInicial: ini,
  baseMin: base,
  metaMin: meta,
  velocidadFactor: vel,
  csat,
});

export const PUESTOS_ORG = {
  datos: [p('Valeria T.', 'Ingeniera de Datos e IA', 9, 22, 30, 1.1, '4.8'), p('Marcos Z.', 'Analista de Ciberseguridad', 5, 30, 30, 0.8, '4.6')],
  riesgo: [p('Gabriela N.', 'Oficial de Cumplimiento', 7, 28, 35, 0.95, '4.7'), p('Héctor B.', 'Analista de Riesgos', 4, 36, 35, 0.7, '4.5')],
  legalpub: [p('Fiorella D.', 'Abogada de Asuntos Públicos', 6, 34, 35, 0.9, '4.7'), p('Renzo A.', 'Asesor Regulatorio', 3, 42, 35, 0.65, '4.4')],
  finanzas: [p('Alonso G.', 'Analista de Tesorería', 10, 20, 30, 1.15, '4.9'), p('Natalia P.', 'Analista de Capital', 6, 27, 30, 0.85, '4.7')],
  talento: [p('Karina O.', 'Especialista de Talento', 8, 21, 28, 1.05, '4.8'), p('Julio E.', 'Coordinador de Cultura', 5, 26, 28, 0.8, '4.6')],
  logistica: [p('Bruno F.', 'Jefe de Abastecimiento', 9, 23, 30, 1.1, '4.8'), p('Lidia C.', 'Gestora de Activos', 5, 29, 30, 0.8, '4.6')],
  seguridad: [p('Óscar H.', 'Supervisor de Control Territorial', 7, 18, 25, 1.2, '4.9'), p('Pamela J.', 'Analista de Seguridad Integral', 4, 24, 25, 0.85, '4.7')],
  comercial: [p('Andrea K.', 'Ejecutiva de Activación', 12, 14, 22, 1.25, '4.9'), p('Diego L.', 'Asesor Comercial', 8, 19, 22, 0.9, '4.7')],
  experiencia: [p('Camila R.', 'Líder de Experiencia al Cliente', 13, 13, 22, 1.25, '4.9'), p('Tomás V.', 'Analista de Experiencia', 9, 18, 22, 0.95, '4.8')],
  comunicaciones: [p('Silvia M.', 'Vocera y Relaciones Públicas', 6, 31, 35, 0.85, '4.6'), p('Iván S.', 'Gestor de Marca', 4, 37, 35, 0.7, '4.5')],
  obra: [p('Raúl Q.', 'Jefe de Proyectos', 6, 38, 40, 0.9, '4.7'), p('Mariela T.', 'Coordinadora de Construcción', 3, 45, 40, 0.65, '4.5')],
  diseno: [p('Paola W.', 'Diseñadora Urbana', 5, 33, 38, 0.9, '4.7'), p('Enrique X.', 'Paisajista', 3, 40, 38, 0.7, '4.5')],
  industrial: [p('Gustavo Y.', 'Jefe de Planta', 6, 35, 38, 0.9, '4.6'), p('Rocío Z.', 'Supervisora de Talleres', 4, 41, 38, 0.7, '4.5')],
} as const;

export const LIDERES_ORG: Readonly<Record<string, string>> = {
  datos: 'Ing. Valeria Torres (Líder de Datos y Ciberseguridad)',
  riesgo: 'Gabriela Núñez (Oficial de Cumplimiento)',
  legalpub: 'Dra. Fiorella Díaz (Líder de Asuntos Públicos)',
  finanzas: 'Alonso Guerra (Jefe de Finanzas y Capital)',
  talento: 'Karina Osorio (Jefa de Talento y Cultura)',
  logistica: 'Bruno Fernández (Jefe de Abastecimiento)',
  seguridad: 'Óscar Herrera (Jefe de Seguridad Integral)',
  comercial: 'Andrea Kong (Jefa Comercial)',
  experiencia: 'Camila Rojas (Líder de Experiencia al Cliente)',
  comunicaciones: 'Silvia Montes (Líder de Comunicaciones)',
  obra: 'Ing. Raúl Quiroz (Jefe de Proyectos y Construcción)',
  diseno: 'Arq. Paola Wong (Líder de Diseño Urbano)',
  industrial: 'Gustavo Yáñez (Jefe de Planta y Talleres)',
};

/** Color de cada sala: el de su grupo, por tema. */
export const TOKEN_ZONA_ORG: Readonly<Record<'claro' | 'oscuro', Readonly<Record<string, string>>>> = {
  claro: Object.fromEntries(AREAS_ORG.map((a) => [a.k, GRUPOS_ORG.find((g) => g.id === a.grupo)!.tokenClaro])),
  oscuro: Object.fromEntries(AREAS_ORG.map((a) => [a.k, GRUPOS_ORG.find((g) => g.id === a.grupo)!.tokenOscuro])),
};
