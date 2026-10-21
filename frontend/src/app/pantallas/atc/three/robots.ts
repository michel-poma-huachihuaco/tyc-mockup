import * as THREE from 'three';
import { color, type RGB } from './comun';
import { Kit, mezcla } from './modelos';

// Robots de la oficina: el orquestador de la bandeja y los mini-bots de las entradas. Mismo cuerpo,
// distinto tamaño, color y accesorios. Miran a +Z por defecto.

export interface Robot {
  g: THREE.Group;
  cabeza: THREE.Group;
  ojos: THREE.Mesh[];
  bi: { p: THREE.Group; ant: THREE.Group };
  bd: { p: THREE.Group; ant: THREE.Group };
  bulbo: THREE.MeshStandardMaterial;
  aro: THREE.MeshBasicMaterial;
  pecho: THREE.MeshStandardMaterial;
  torso: THREE.Mesh;
  fase: number;
}

export interface OptsRobot {
  cuerpo: RGB;
  acento: RGB;
  escala?: number;
  pechoMapa?: THREE.Texture;
  fase?: number;
  antena?: boolean;
}

const mat = (c: RGB, o: { r?: number; m?: number; e?: RGB; ei?: number } = {}): THREE.MeshStandardMaterial => {
  const m = new THREE.MeshStandardMaterial({
    color: color(c),
    roughness: o.r ?? 0.45,
    metalness: o.m ?? 0.2,
  });
  if (o.e) {
    m.emissive = color(o.e);
    m.emissiveIntensity = o.ei ?? 1;
  }
  return m;
};

export function crearRobot(kit: Kit, o: OptsRobot): Robot {
  const C = kit.C;
  const g = new THREE.Group();
  const blanco = mezcla(o.cuerpo, [255, 255, 255], 0.55);
  const gris = mezcla(C['suelo']!, C['texto']!, 0.3);
  const oscuro = mezcla(C['suelo']!, [0, 0, 0], 0.55);
  const carcasa = mat(blanco, { r: 0.35, m: 0.15 });
  const junta = mat(gris, { r: 0.5, m: 0.5 });
  const visor = mat(oscuro, { r: 0.15, m: 0.6 });

  const disco = new THREE.Mesh(kit.cil(0.3, 0.34, 0.05, 28), mat(oscuro, { r: 0.4, m: 0.5 }));
  disco.position.y = 0.03;
  const aroMat = new THREE.MeshBasicMaterial({ color: color(o.acento), transparent: true, opacity: 0.85 });
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.022, 8, 40), aroMat);
  aro.rotation.x = Math.PI / 2;
  aro.position.y = 0.065;
  const columna = new THREE.Mesh(kit.cil(0.1, 0.16, 0.34, 14), junta);
  columna.position.y = 0.23;

  const torso = new THREE.Mesh(kit.caja(0.46, 0.5, 0.32, 0.09), carcasa);
  torso.position.y = 0.67;
  const pechoMat = mat(mezcla(C['suelo']!, o.acento, 0.35), { r: 0.2, e: o.acento, ei: 0.55 });
  if (o.pechoMapa) {
    pechoMat.map = o.pechoMapa;
    pechoMat.emissiveMap = o.pechoMapa;
    pechoMat.color.set(0xffffff);
  }
  const pecho = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.24), pechoMat);
  pecho.position.set(0, 0.7, 0.163);
  const marcoPecho = new THREE.Mesh(kit.caja(0.32, 0.28, 0.02, 0.012), junta);
  marcoPecho.position.set(0, 0.7, 0.158);
  const cintura = new THREE.Mesh(kit.caja(0.38, 0.06, 0.26, 0.025), junta);
  cintura.position.y = 0.4;

  const cabeza = new THREE.Group();
  cabeza.position.y = 1.07;
  const craneo = new THREE.Mesh(kit.caja(0.4, 0.3, 0.32, 0.1), carcasa);
  const pantalla = new THREE.Mesh(kit.caja(0.33, 0.17, 0.03, 0.05), visor);
  pantalla.position.set(0, 0.01, 0.15);
  const ojos = [-1, 1].map((s) => {
    const e = new THREE.Mesh(kit.cap(0.022, 0.05), new THREE.MeshBasicMaterial({ color: color(o.acento) }));
    e.position.set(s * 0.074, 0.01, 0.169);
    return e;
  });
  const cuello = new THREE.Mesh(kit.cil(0.07, 0.09, 0.08, 12), junta);
  cuello.position.y = -0.17;
  const orejas = [-1, 1].map((s) => {
    const e = new THREE.Mesh(
      kit.cil(0.06, 0.06, 0.05, 16),
      mat(mezcla(o.acento, [0, 0, 0], 0.3), { r: 0.3, m: 0.4 }),
    );
    e.rotation.z = Math.PI / 2;
    e.position.set(s * 0.215, 0, 0);
    return e;
  });
  const bulboMat = mat(o.acento, { r: 0.25, e: o.acento, ei: 1.4 });
  const tallo = new THREE.Mesh(kit.cil(0.008, 0.008, 0.13, 6), junta);
  tallo.position.y = 0.21;
  const bulbo = new THREE.Mesh(kit.esf(0.035), bulboMat);
  bulbo.position.y = 0.29;
  cabeza.add(craneo, pantalla, ...ojos, cuello, ...orejas);
  if (o.antena !== false) {
    cabeza.add(tallo, bulbo);
  }

  const brazo = (lado: number): { p: THREE.Group; ant: THREE.Group } => {
    const p = new THREE.Group();
    p.position.set(lado * 0.3, 0.84, 0);
    const hombro = new THREE.Mesh(kit.esf(0.06), junta);
    const sup = new THREE.Mesh(kit.cil(0.035, 0.035, 0.22, 10), carcasa);
    sup.position.y = -0.12;
    const ant = new THREE.Group();
    ant.position.y = -0.24;
    const codo = new THREE.Mesh(kit.esf(0.045), junta);
    const for_ = new THREE.Mesh(kit.cil(0.03, 0.03, 0.2, 10), carcasa);
    for_.position.y = -0.11;
    const mano = new THREE.Mesh(
      kit.caja(0.08, 0.07, 0.06, 0.02),
      mat(o.acento, { r: 0.4, m: 0.3 }),
    );
    mano.position.y = -0.23;
    ant.add(codo, for_, mano);
    p.add(hombro, sup, ant);
    return { p, ant };
  };
  const bi = brazo(-1);
  const bd = brazo(1);
  g.add(disco, aro, columna, torso, pecho, marcoPecho, cintura, cabeza, bi.p, bd.p);
  g.scale.setScalar(o.escala ?? 1);
  Kit.sombrear(g, true, false);
  return {
    g,
    cabeza,
    ojos,
    bi,
    bd,
    bulbo: bulboMat,
    aro: aroMat,
    pecho: pechoMat,
    torso,
    fase: o.fase ?? 0,
  };
}

/** Parpadeo, luz de antena y respiración comunes a todos los robots. */
export function animarRobotBase(r: Robot, t: number, reducido: boolean, ritmo = 1): void {
  if (reducido) return;
  const ph = r.fase;
  r.g.position.y = Math.sin(t * 1.6 + ph) * 0.012;
  const parpadeo = (t * 0.33 + ph) % 1 > 0.965 ? 0.1 : 1;
  r.ojos.forEach((e) => {
    e.scale.y += (parpadeo - e.scale.y) * 0.5;
  });
  r.bulbo.emissiveIntensity = 1.1 + Math.sin(t * 4 * ritmo + ph) * 0.6;
  r.aro.opacity = 0.6 + Math.sin(t * 2.2 * ritmo + ph) * 0.25;
  r.pecho.emissiveIntensity = 0.5 + Math.sin(t * 3 * ritmo + ph) * 0.18;
}

export interface Orquestador {
  robot: Robot;
  g: THREE.Group;
  update: (t: number, carga: number, mira: THREE.Vector3 | null, reducido: boolean) => void;
}

/** El robot de la bandeja: ordena tarjetas con los dos brazos mientras otras orbitan alrededor. */
export function crearOrquestador(kit: Kit, acento: RGB, pechoMapa: THREE.Texture): Orquestador {
  const C = kit.C;
  const robot = crearRobot(kit, {
    cuerpo: mezcla(acento, C['suelo']!, 0.35),
    acento,
    escala: 1.5,
    pechoMapa,
  });
  const g = new THREE.Group();
  g.add(robot.g);

  const orbitan: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const t = kit.tarjeta(i % 2 ? acento : C['teal']!);
    t.scale.setScalar(0.38);
    const m = new THREE.Group();
    m.add(t);
    g.add(m);
    orbitan.push(m);
  }
  const yawBase = Math.PI;
  const update = (t: number, carga: number, mira: THREE.Vector3 | null, reducido: boolean): void => {
    animarRobotBase(robot, t, reducido, 1 + Math.min(1.5, carga / 8));
    const rit = 1.6 + Math.min(3.4, carga * 0.35);
    const ph = robot.fase;
    if (!reducido) {
      const objetivo = mira ? Math.atan2(mira.x - g.position.x, mira.z - g.position.z) - yawBase : 0;
      const rel = Math.atan2(Math.sin(objetivo), Math.cos(objetivo));
      robot.cabeza.rotation.y +=
        (Math.max(-0.9, Math.min(0.9, rel * 0.7)) + Math.sin(t * 0.5 + ph) * 0.12 - robot.cabeza.rotation.y) * 0.08;
      robot.cabeza.rotation.x = Math.sin(t * 1.3) * 0.04;
      robot.bi.p.rotation.x = -0.9 + Math.sin(t * rit + ph) * 0.45;
      robot.bd.p.rotation.x = -0.9 + Math.sin(t * rit + ph + Math.PI) * 0.45;
      robot.bi.p.rotation.z = 0.35 + Math.sin(t * rit * 0.5) * 0.12;
      robot.bd.p.rotation.z = -0.35 - Math.sin(t * rit * 0.5 + 1) * 0.12;
      robot.bi.ant.rotation.x = -0.8 + Math.sin(t * rit + ph + 1) * 0.3;
      robot.bd.ant.rotation.x = -0.8 + Math.sin(t * rit + ph + 4) * 0.3;
      orbitan.forEach((m, i) => {
        const a = t * (0.7 + carga * 0.03) + (i / orbitan.length) * Math.PI * 2;
        m.position.set(Math.cos(a) * 0.62, 0.95 + Math.sin(t * 1.4 + i) * 0.06, Math.sin(a) * 0.62);
        m.rotation.set(0.25, -a, 0.15 * Math.sin(t + i));
      });
    } else {
      robot.bi.p.rotation.x = -0.9;
      robot.bd.p.rotation.x = -0.9;
      orbitan.forEach((m, i) => {
        const a = (i / orbitan.length) * Math.PI * 2;
        m.position.set(Math.cos(a) * 0.62, 0.95, Math.sin(a) * 0.62);
        m.rotation.set(0.25, -a, 0);
      });
    }
  };
  return { robot, g, update };
}
