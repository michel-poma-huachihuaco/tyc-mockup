import * as THREE from 'three';

// Plano de la oficina de atención (unidades = metros de escena). Solo geometría: dónde está cada sala,
// cada escritorio y cada ruta.
//
//   canales (oeste) → pasillo x=3 → bandeja (centro) → pasillo x=11.6 / y=10.9 → salas → cierre (suroeste)
//
// Al sur, un anexo con las 13 áreas de la organización: dos filas de salas frente a un corredor (z=19.4), unidas al
// pasillo x=3.4 que ya lleva al cierre.

export const PISO = { x0: -0.6, z0: -0.6, w: 19.6, d: 24.4 };
export const CENTRO = new THREE.Vector3(9.2, 0, 11.6);
export const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

export const CANALES = [
  { k: 'tel', z: 1.5 },
  { k: 'wa', z: 3.5 },
  { k: 'mail', z: 5.5 },
  { k: 'portal', z: 7.5 },
  { k: 'form', z: 9.5 },
] as const;

export const ESTACION = { x: 1.5, opX: 0.8 };

export const HUB = {
  x: 7.4,
  z: 6.7,
  w: 3.4,
  d: 0.8,
  pantallas: 6.1,
  despachador: [7.4, 7.55] as const,
};

export const COMITE = { x: 6.0, z: 0.4, w: 4.6, d: 2.8, mesa: [8.3, 1.8] as const };
export const SALIDA = { x: 0.3, z: 12.0, w: 2.7, d: 2.8, puerta: [3.0, 13.4] as const };

export interface Puesto {
  x: number;
  z: number;
  rotEscritorio: number;
  px: number;
  pz: number;
  rotPersona: number;
}

/** El anexo de las áreas de la organización: el corredor y las dos filas de salas que lo flanquean. */
export const ANEXO = { z: 19.4, ancho: 2.4, x0: 0, x1: 18.8, filaA: 15.6, filaB: 20.6, w: 2.2, d: 2.6 };

export interface Sala {
  k: string;
  x: number;
  z: number;
  w: number;
  d: number;
  /** Pared de la puerta: `oeste` y `norte` como en las salas de atención; `sur` es la de la fila norte del anexo. */
  lado: 'oeste' | 'norte' | 'sur';
  /** Sala del anexo de las áreas de la organización. */
  anexo?: boolean;
  puerta: [number, number];
  fuera: [number, number];
  dentro: [number, number];
  puestos: Puesto[];
}

const ESTE = (k: string, z: number): Sala => {
  const x = 12.6;
  const w = 4.8;
  const d = 2.9;
  const pz = z + 1.45;
  return {
    k,
    x,
    z,
    w,
    d,
    lado: 'oeste',
    puerta: [x, pz],
    fuera: [12.0, pz],
    dentro: [x + 0.8, pz],
    puestos: [0, 1, 2].map((i) => {
      const zz = z + 0.55 + i * 0.9;
      return {
        x: x + w - 0.75,
        z: zz,
        rotEscritorio: -Math.PI / 2,
        px: x + w - 1.6,
        pz: zz,
        rotPersona: Math.PI / 2,
      };
    }),
  };
};

const SUR = (k: string, x: number, w: number): Sala => {
  const z = 11.9;
  const d = 2.9;
  const px = x + w / 2;
  return {
    k,
    x,
    z,
    w,
    d,
    lado: 'norte',
    puerta: [px, z],
    fuera: [px, 11.3],
    dentro: [px, z + 0.8],
    puestos: [0, 1, 2].map((i) => {
      const xx = x + 0.85 + i * ((w - 1.7) / 2);
      return {
        x: xx,
        z: z + d - 0.6,
        rotEscritorio: Math.PI,
        px: xx,
        pz: z + d - 1.45,
        rotPersona: 0,
      };
    }),
  };
};

/** Sala de la fila sur del anexo: la puerta mira al norte, al corredor. */
const ANEXO_SUR = (k: string, x: number): Sala => {
  const { w, d, filaB: z } = ANEXO;
  const px = x + w / 2;
  return {
    k,
    x,
    z,
    w,
    d,
    lado: 'norte',
    anexo: true,
    puerta: [px, z],
    fuera: [px, z - 0.6],
    dentro: [px, z + 0.8],
    puestos: [0, 1].map((i) => {
      const xx = x + 0.6 + i * (w - 1.2);
      return { x: xx, z: z + d - 0.6, rotEscritorio: Math.PI, px: xx, pz: z + d - 1.45, rotPersona: 0 };
    }),
  };
};

/** Sala de la fila norte del anexo: la puerta mira al sur, al corredor. */
const ANEXO_NORTE = (k: string, x: number): Sala => {
  const { w, d, filaA: z } = ANEXO;
  const px = x + w / 2;
  return {
    k,
    x,
    z,
    w,
    d,
    lado: 'sur',
    anexo: true,
    puerta: [px, z + d],
    fuera: [px, z + d + 0.6],
    dentro: [px, z + d - 0.8],
    puestos: [0, 1].map((i) => {
      const xx = x + 0.6 + i * (w - 1.2);
      return { x: xx, z: z + 0.6, rotEscritorio: 0, px: xx, pz: z + 1.45, rotPersona: Math.PI };
    }),
  };
};

export const SALAS: Record<string, Sala> = {
  eje1: ESTE('eje1', 0.4),
  cob: ESTE('cob', 3.7),
  libro: ESTE('libro', 7.0),
  legal: SUR('legal', 12.6, 4.8),
  post: SUR('post', 7.7, 4.4),
  proy: SUR('proy', 3.9, 3.5),
  // Anexo, fila norte (de oeste a este): Datos · Gobierno · Habilitación
  datos: ANEXO_NORTE('datos', 0.4),
  riesgo: ANEXO_NORTE('riesgo', 4.0),
  legalpub: ANEXO_NORTE('legalpub', 6.4),
  finanzas: ANEXO_NORTE('finanzas', 8.8),
  talento: ANEXO_NORTE('talento', 11.6),
  logistica: ANEXO_NORTE('logistica', 14.0),
  seguridad: ANEXO_NORTE('seguridad', 16.4),
  // Anexo, fila sur: Mercado · Producción
  comercial: ANEXO_SUR('comercial', 2.2),
  experiencia: ANEXO_SUR('experiencia', 4.6),
  comunicaciones: ANEXO_SUR('comunicaciones', 7.0),
  obra: ANEXO_SUR('obra', 9.8),
  diseno: ANEXO_SUR('diseno', 12.2),
  industrial: ANEXO_SUR('industrial', 14.6),
};

export const H = { viaje: 0.62, mesa: 0.88, atencion: 1.3, cola: 0.5 };

/** Posición de un ticket en la bandeja (sobre la mesa del orquestador, lado oeste). */
export const slotBandeja = (i: number): THREE.Vector3 =>
  V(5.9 + (i % 4) * 0.36, H.mesa + Math.floor(i / 12) * 0.05, 6.5 + (Math.floor(i / 4) % 3) * 0.28);

export const slotCola = (s: Sala, i: number): THREE.Vector3 => {
  const fila = Math.floor(i / 4) % 3;
  const col = i % 4;
  const alto = Math.floor(i / 12) * 0.06;
  if (s.lado === 'oeste') return V(s.fuera[0] - col * 0.42, H.cola + alto, s.fuera[1] - 0.35 + fila * 0.4);
  if (s.lado === 'sur') return V(s.fuera[0] - 0.6 + col * 0.42, H.cola + alto, s.fuera[1] + fila * 0.4);
  return V(s.fuera[0] - 0.6 + col * 0.42, H.cola + alto, s.fuera[1] - fila * 0.4);
};

export const slotSalida = (i: number): THREE.Vector3 =>
  V(0.9 + (i % 4) * 0.55, 0.95, 13.0 + (Math.floor(i / 4) % 3) * 0.5);

export const puestoTicket = (s: Sala, idx: number, n: number): THREE.Vector3 => {
  const p = s.puestos[Math.min(idx, s.puestos.length - 1)]!;
  return V(p.x, H.atencion + n * 0.12, p.z);
};

const nodo = (x: number, z: number, y = H.viaje): THREE.Vector3 => V(x, y, z);

export const rutaBandeja = (gz: number, slot: THREE.Vector3): THREE.Vector3[] => [
  nodo(ESTACION.x + 0.5, gz),
  nodo(3.0, gz),
  nodo(3.0, 6.7),
  nodo(5.3, 6.7),
  slot,
];

export const rutaCola = (s: Sala, slot: THREE.Vector3): THREE.Vector3[] => {
  // anexo: por el pasillo oeste (x=3.4) hasta el corredor y por él hasta la puerta de la sala
  if (s.anexo) return [nodo(5.9, 6.7), nodo(3.4, 6.7), nodo(3.4, ANEXO.z), nodo(s.puerta[0], ANEXO.z), slot];
  const salida =
    s.lado === 'oeste'
      ? [nodo(9.6, 6.7), nodo(11.6, 6.7), nodo(11.6, s.fuera[1])]
      : [nodo(7.4, 8.4), nodo(7.4, 10.9), nodo(s.fuera[0], 10.9)];
  return [nodo(5.9, 6.7), ...salida, slot];
};

export const rutaAtencion = (s: Sala, destino: THREE.Vector3): THREE.Vector3[] => [
  nodo(s.fuera[0], s.fuera[1]),
  nodo(s.puerta[0], s.puerta[1]),
  nodo(s.dentro[0], s.dentro[1]),
  V(destino.x, destino.y, s.lado === 'oeste' ? destino.z : s.dentro[1]),
  destino,
];

export const rutaSalida = (s: Sala, slot: THREE.Vector3): THREE.Vector3[] => {
  if (s.anexo) {
    return [
      nodo(s.dentro[0], s.dentro[1]),
      nodo(s.puerta[0], s.puerta[1]),
      nodo(s.puerta[0], ANEXO.z),
      nodo(3.4, ANEXO.z),
      nodo(3.4, SALIDA.puerta[1]),
      nodo(SALIDA.puerta[0] - 0.2, SALIDA.puerta[1]),
      slot,
    ];
  }
  const camino =
    s.lado === 'oeste'
      ? [nodo(s.dentro[0], s.dentro[1]), nodo(s.puerta[0], s.puerta[1]), nodo(11.6, s.fuera[1]), nodo(11.6, 10.9)]
      : [nodo(s.dentro[0], s.dentro[1]), nodo(s.puerta[0], s.puerta[1]), nodo(s.fuera[0], 10.9)];
  return [...camino, nodo(3.4, 10.9), nodo(3.4, SALIDA.puerta[1]), nodo(SALIDA.puerta[0] - 0.2, SALIDA.puerta[1]), slot];
};

/** Recorrido de las dos personas que pasean por los pasillos (supervisores en ronda). */
export const PASEO = [
  nodo(3.0, 2.2, 0),
  nodo(3.0, 10.6, 0),
  nodo(11.4, 10.6, 0),
  nodo(11.4, 2.2, 0),
];
