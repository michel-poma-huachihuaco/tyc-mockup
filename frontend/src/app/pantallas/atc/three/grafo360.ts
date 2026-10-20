import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { bucle, capaEtiquetas, color, css, type RGB } from './comun';

export interface FuenteGrafo {
  id: string;
  n: string;
  d: string;
  caida: boolean;
}

export interface NodoDatoGrafo {
  id: string;
  n: string;
  estado: 'ok' | 'restringido' | 'caido';
  sem?: boolean;
  fuentes: readonly string[];
}

export interface VistaGrafo {
  cliente: { nombre: string };
  fuentes: FuenteGrafo[];
  nodos: NodoDatoGrafo[];
}

export interface PulsoGrafo {
  a: string;
  b: string;
  t0: number;
  dur: number;
  src: string;
  dst?: string;
}

export type Ref<T> = { current: T };

export interface OptsGrafo {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  color: (token: string) => RGB;
  reducido: boolean;
  vista: Ref<VistaGrafo | null>;
  sel: Ref<string>;
  sem: Ref<{ hits: unknown[] } | null>;
  hover: Ref<string | null>;
  lit: Ref<Set<string>>;
  pulsos: Ref<PulsoGrafo[]>;
  t0: Ref<number>;
  pos: Ref<Record<string, { x: number; y: number; r: number }>>;
  alClickNodo?: (id: string) => void;
  alClickFuente?: (id: string) => void;
}

interface NodoEsc {
  pos: THREE.Vector3;
  baseZ: number;
  fase: number;
  r: number;
  colorBase: RGB;
  mesh: THREE.Mesh;
  halo: THREE.Mesh;
  et: CSS2DObject;
  el: HTMLElement;
  sub?: HTMLElement;
  txt: HTMLElement;
}

const COLORES_FUENTES_ASTRA: Readonly<Record<string, RGB>> = {
  sigda: [0, 229, 255],
  contr: [0, 230, 118],
  cob: [255, 196, 0],
  jose: [255, 167, 38],
  repo: [38, 222, 160],
  mail: [179, 136, 255],
  cti: [244, 114, 182],
  atc: [129, 140, 248],
};

const COLORES_NODOS_ASTRA: readonly RGB[] = [
  [52, 211, 153],
  [56, 189, 248],
  [251, 191, 36],
  [167, 139, 250],
  [45, 212, 191],
  [244, 114, 182],
];

export function montarGrafo(o: OptsGrafo): () => void {
  const { canvas, host } = o;
  const T = {
    bad: [255, 82, 82] as RGB,
    warn: [245, 158, 11] as RGB,
    naranja: [255, 167, 38] as RGB,
    cyan: [0, 229, 255] as RGB,
    esmeralda: [0, 230, 118] as RGB,
    violeta: [179, 136, 255] as RGB,
    borde: [56, 132, 152] as RGB,
    src: o.color('primary-400'),
    texto: [248, 252, 255] as RGB,
    mudo: [165, 208, 220] as RGB,
    apagado: [24, 78, 92] as RGB,
    centroTexto: [1, 27, 35] as RGB,
  };
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  const etiquetas = capaEtiquetas(host);
  const escena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  cam.position.set(0, -4.2, 17);
  cam.lookAt(0, 0, 0);
  const ctl = new OrbitControls(cam, canvas);
  ctl.enableZoom = false;
  ctl.enablePan = false;
  ctl.enableDamping = true;
  ctl.minPolarAngle = Math.PI * 0.28;
  ctl.maxPolarAngle = Math.PI * 0.72;
  ctl.minAzimuthAngle = -0.95;
  ctl.maxAzimuthAngle = 0.95;
  ctl.autoRotate = !o.reducido;
  ctl.autoRotateSpeed = 0.75;
  ctl.addEventListener('start', () => {
    ctl.autoRotate = false;
  });

  const R1 = 3.35;
  const R2 = 6.45;

  // Anillos orbitales 3D estilo ASTRA + campo de partículas estelares
  const grupoAmbiente = new THREE.Group();
  escena.add(grupoAmbiente);

  const crearAnilloOrbital = (
    radio: number,
    tubo: number,
    col: RGB,
    opacidad: number,
    rotX = 0,
    rotY = 0,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(radio, tubo, 12, 96),
      new THREE.MeshBasicMaterial({
        color: color(col),
        transparent: true,
        opacity: opacidad,
        depthWrite: false,
      }),
    );
    m.rotation.set(rotX, rotY, 0);
    grupoAmbiente.add(m);
    return m;
  };

  const anilloCore1 = crearAnilloOrbital(1.28, 0.022, T.naranja, 0.55, 0.45, 0.2);
  const anilloCore2 = crearAnilloOrbital(1.52, 0.016, T.cyan, 0.38, -0.5, 0.35);
  const anilloFuentes = crearAnilloOrbital(R1 * 1.07, 0.02, T.naranja, 0.26, 0.08, -0.06);
  const anilloNodos = crearAnilloOrbital(R2 * 0.94, 0.018, T.cyan, 0.2, -0.06, 0.08);
  const anilloExterior = crearAnilloOrbital(R2 * 1.12, 0.012, T.violeta, 0.14, 0.14, -0.12);

  // Polvo estelar 3D ASTRA (partículas luminosas de fondo)
  const numEstrellas = 96;
  const posEstrellas = new Float32Array(numEstrellas * 3);
  const colEstrellas = new Float32Array(numEstrellas * 3);
  const paletaEstrellas: readonly RGB[] = [T.naranja, T.cyan, T.esmeralda, T.violeta];
  for (let i = 0; i < numEstrellas; i++) {
    const ang = (i / numEstrellas) * Math.PI * 2 + (i % 7) * 0.31;
    const dist = 2.2 + ((i * 1.37) % 6.8);
    posEstrellas[i * 3] = Math.cos(ang) * dist * 1.15;
    posEstrellas[i * 3 + 1] = Math.sin(ang) * dist * 0.9;
    posEstrellas[i * 3 + 2] = ((i % 9) - 4) * 0.55;
    const ce = paletaEstrellas[i % paletaEstrellas.length]!;
    colEstrellas[i * 3] = ce[0] / 255;
    colEstrellas[i * 3 + 1] = ce[1] / 255;
    colEstrellas[i * 3 + 2] = ce[2] / 255;
  }
  const geoEstrellas = new THREE.BufferGeometry();
  geoEstrellas.setAttribute('position', new THREE.BufferAttribute(posEstrellas, 3));
  geoEstrellas.setAttribute('color', new THREE.BufferAttribute(colEstrellas, 3));
  const matEstrellas = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const nubeEstrellas = new THREE.Points(geoEstrellas, matEstrellas);
  grupoAmbiente.add(nubeEstrellas);

  const nodos = new Map<string, NodoEsc>();
  const aristas: {
    linea: THREE.Line;
    mat: THREE.LineBasicMaterial;
    a: string;
    b: string;
    colorBase: RGB;
    fuente?: string;
    dato?: string;
  }[] = [];
  let firma = '';
  const grupo = new THREE.Group();
  escena.add(grupo);

  const centro = {
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 28, 20),
      new THREE.MeshBasicMaterial({ color: color(T.naranja) }),
    ),
    halo: new THREE.Mesh(
      new THREE.SphereGeometry(1.26, 24, 18),
      new THREE.MeshBasicMaterial({
        color: color(T.naranja),
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
    ),
    corona: new THREE.Mesh(
      new THREE.SphereGeometry(1.62, 20, 14),
      new THREE.MeshBasicMaterial({
        color: color(T.cyan),
        transparent: true,
        opacity: 0.1,
        wireframe: true,
        depthWrite: false,
      }),
    ),
  };
  const etCentro = document.createElement('div');
  etCentro.style.cssText = 'pointer-events:none;text-align:center;line-height:1.15';
  const ini = document.createElement('b');
  ini.style.cssText = `display:block;font:800 16px Montserrat,system-ui,sans-serif;color:${css(T.centroTexto)}`;
  etCentro.append(ini);
  const objCentro = new CSS2DObject(etCentro);
  objCentro.position.set(0, 0, 0.92);
  const etNom = document.createElement('div');
  etNom.style.cssText =
    'pointer-events:none;font:700 11.5px Montserrat,system-ui,sans-serif;white-space:nowrap;color:#FFFFFF;padding:2px 8px;border-radius:999px;background:rgba(1,27,35,0.82);border:1px solid rgba(255,167,38,0.45)';
  const objNom = new CSS2DObject(etNom);
  objNom.position.set(0, -1.48, 0);
  escena.add(centro.mesh, centro.halo, centro.corona, objCentro, objNom);

  const colorFuente = (id: string, idx: number): RGB =>
    COLORES_FUENTES_ASTRA[id] ?? COLORES_NODOS_ASTRA[idx % COLORES_NODOS_ASTRA.length]!;

  const construir = (v: VistaGrafo): void => {
    nodos.forEach((n) => n.et.element.remove());
    grupo.clear();
    nodos.clear();
    aristas.length = 0;
    const nuevo = (
      id: string,
      tipo: 'fuente' | 'dato',
      p: THREE.Vector3,
      fase: number,
      rad: number,
      c: RGB,
      texto: string,
      sub?: string,
      lado: 'arriba' | 'abajo' | 'der' | 'izq' = 'arriba',
    ): void => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(rad, 20, 16),
        new THREE.MeshBasicMaterial({ color: color(c) }),
      );
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(rad * 1.95, 16, 12),
        new THREE.MeshBasicMaterial({
          color: color(c),
          transparent: true,
          opacity: tipo === 'fuente' ? 0.28 : 0.24,
          depthWrite: false,
        }),
      );
      mesh.position.copy(p);
      mesh.userData = { id, tipo };
      halo.position.copy(p);
      halo.visible = true;
      const el = document.createElement('div');
      el.style.cssText =
        'pointer-events:auto;cursor:pointer;text-align:center;line-height:1.2;white-space:nowrap;padding:3px 7px;border-radius:8px;user-select:none;background:rgba(1,26,34,0.80);border:1px solid rgba(255,255,255,0.15);backdrop-filter:blur(4px);transition:border-color .15s,transform .15s';
      el.title =
        tipo === 'dato'
          ? `Clic para inspeccionar nodo «${texto}»`
          : `Clic para inspeccionar fuente «${texto}»`;
      el.addEventListener('mouseenter', () => {
        o.hover.current = id;
      });
      el.addEventListener('mouseleave', () => {
        if (o.hover.current === id) o.hover.current = null;
      });
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (tipo === 'dato') {
          o.alClickNodo?.(id);
        } else {
          o.alClickFuente?.(id);
        }
      });
      const b = document.createElement('b');
      b.style.cssText = 'display:block;font:700 11px Montserrat,system-ui,sans-serif;color:#F8FCFF';
      b.textContent = texto;
      el.append(b);
      let s: HTMLElement | undefined;
      if (sub != null) {
        s = document.createElement('small');
        s.style.cssText = 'display:block;font:600 9.5px Montserrat,system-ui,sans-serif';
        s.textContent = sub;
        el.append(s);
      }
      const et = new CSS2DObject(el);
      if (lado === 'der' || lado === 'izq') {
        et.position.set(p.x + (lado === 'der' ? 1 : -1) * (rad + 0.24), p.y, p.z);
        et.center.set(lado === 'der' ? 0 : 1, 0.5);
        el.style.textAlign = lado === 'der' ? 'left' : 'right';
      } else {
        et.position.set(p.x, p.y + (lado === 'arriba' ? 1 : -1) * (rad + 0.5), p.z);
      }
      grupo.add(mesh, halo, et);
      nodos.set(id, {
        pos: p,
        baseZ: p.z,
        fase,
        r: rad,
        colorBase: c,
        mesh,
        halo,
        et,
        el,
        sub: s,
        txt: b,
      });
    };
    v.fuentes.forEach((s, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / v.fuentes.length + 0.2;
      const cSrc = colorFuente(s.id, i);
      nuevo(
        s.id,
        'fuente',
        new THREE.Vector3(Math.cos(a) * R1 * 1.15, Math.sin(a) * R1, i % 2 ? 0.72 : -0.72),
        i * 0.7,
        0.44,
        cSrc,
        s.n,
        s.d,
      );
    });
    v.nodos.forEach((d, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / v.nodos.length + 0.1;
      const cx = Math.cos(a);
      const lado = cx > 0.3 ? 'der' : cx < -0.3 ? 'izq' : Math.sin(a) > 0 ? 'arriba' : 'abajo';
      const srcPrincipal = d.fuentes[0] ?? '';
      const cNodo =
        COLORES_FUENTES_ASTRA[srcPrincipal] ??
        COLORES_NODOS_ASTRA[i % COLORES_NODOS_ASTRA.length]!;
      nuevo(
        d.id,
        'dato',
        new THREE.Vector3(cx * R2 * 1.05, Math.sin(a) * R2 * 0.82, ((i % 3) - 1) * 1.15),
        i * 0.55 + 1.2,
        0.3,
        cNodo,
        d.n,
        undefined,
        lado,
      );
    });
    const posDe = (id: string): THREE.Vector3 => (id === 'c' ? new THREE.Vector3() : nodos.get(id)!.pos);
    const arista = (
      a: string,
      b: string,
      colorLinea: RGB,
      extra: { fuente?: string; dato?: string },
    ): void => {
      const A = posDe(a);
      const B = posDe(b);
      const m = A.clone().add(B).multiplyScalar(0.5);
      m.x += (B.y - A.y) * 0.09;
      m.y -= (B.x - A.x) * 0.09;
      const curva = new THREE.QuadraticBezierCurve3(A, m, B);
      const mat = new THREE.LineBasicMaterial({
        color: color(colorLinea),
        transparent: true,
        opacity: 0.42,
      });
      const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curva.getPoints(28)), mat);
      grupo.add(linea);
      aristas.push({ linea, mat, a, b, colorBase: colorLinea, ...extra });
    };
    v.fuentes.forEach((s, i) => arista('c', s.id, colorFuente(s.id, i), { fuente: s.id }));
    v.nodos.forEach((d, i) => {
      const col = nodos.get(d.id)?.colorBase ?? COLORES_NODOS_ASTRA[i % COLORES_NODOS_ASTRA.length]!;
      d.fuentes.forEach((s) => arista(s, d.id, col, { fuente: s, dato: d.id }));
    });
  };

  let pulsosRef: PulsoGrafo[] | null = null;
  let esferas: THREE.Mesh[] = [];
  const geoPulso = new THREE.SphereGeometry(0.115, 12, 10);
  const punto = (p: PulsoGrafo, t: number, out: THREE.Vector3): THREE.Vector3 => {
    const A = p.a === 'c' ? new THREE.Vector3() : nodos.get(p.a)!.pos;
    const B = nodos.get(p.b)!.pos;
    const mx = (A.x + B.x) / 2 + (B.y - A.y) * 0.09;
    const my = (A.y + B.y) / 2 - (B.x - A.x) * 0.09;
    const u = 1 - t;
    return out.set(
      u * u * A.x + 2 * u * t * mx + t * t * B.x,
      u * u * A.y + 2 * u * t * my + t * t * B.y,
      u * u * A.z + t * t * B.z,
    );
  };

  let ultimoAncho = 0;
  const ajustar = (): void => {
    const w = host.clientWidth;
    if (!w) return;
    ultimoAncho = w;
    const h = Math.max(540, Math.min(720, Math.round(w * 0.74)));
    canvas.style.height = `${h}px`;
    r.setSize(w, h, false);
    etiquetas.setSize(w, h);
    cam.aspect = w / h;
    cam.position.setLength(w < 560 ? 30 : w < 800 ? 22 : 17);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(ajustar);
  ro.observe(host);
  ajustar();

  const raycaster = new THREE.Raycaster();
  const punteroNdc = new THREE.Vector2();
  let downPos: { x: number; y: number } | null = null;

  const onPointerDown = (ev: PointerEvent): void => {
    downPos = { x: ev.clientX, y: ev.clientY };
  };
  const onPointerUp = (ev: PointerEvent): void => {
    if (!downPos) return;
    const distDrag = Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y);
    downPos = null;
    if (distDrag > 6) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    punteroNdc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    punteroNdc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(punteroNdc, cam);

    const meshes: THREE.Object3D[] = [];
    nodos.forEach((n) => meshes.push(n.mesh));
    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const data = hits[0]!.object.userData as { id?: string; tipo?: 'fuente' | 'dato' };
      if (data.id && data.tipo === 'dato') {
        o.alClickNodo?.(data.id);
        return;
      }
      if (data.id && data.tipo === 'fuente') {
        o.alClickFuente?.(data.id);
        return;
      }
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);

  const tmp = new THREE.Vector3();
  const frame = (ahora: number): void => {
    const wHost = host.clientWidth;
    if (!wHost) return;
    if (wHost !== ultimoAncho || !canvas.clientHeight) {
      ajustar();
    }
    const v = o.vista.current;
    if (!v) return;
    const f =
      v.cliente.nombre +
      '|' +
      v.fuentes.map((s) => s.id).join() +
      '|' +
      v.nodos.map((n) => n.id).join();
    if (f !== firma) {
      firma = f;
      construir(v);
    }
    const caida = (id: string): boolean | undefined => v.fuentes.find((s) => s.id === id)?.caida;
    const el = ahora - o.t0.current;
    const lit = o.lit.current;

    // Animar anillos orbitales y polvo estelar ASTRA
    if (!o.reducido) {
      const seg = ahora * 0.001;
      anilloCore1.rotation.z = seg * 0.65;
      anilloCore1.rotation.x = 0.45 + Math.sin(seg * 0.8) * 0.15;
      anilloCore2.rotation.z = -seg * 0.52;
      anilloCore2.rotation.y = 0.35 + Math.cos(seg * 0.7) * 0.15;
      anilloFuentes.rotation.z = seg * 0.14;
      anilloNodos.rotation.z = -seg * 0.09;
      anilloExterior.rotation.z = seg * 0.06;
      nubeEstrellas.rotation.z = seg * 0.04;
      centro.corona.rotation.y = seg * 0.45;
      centro.corona.rotation.x = seg * 0.3;
    }

    if (pulsosRef !== o.pulsos.current) {
      esferas.forEach((e) => {
        (e.material as THREE.Material).dispose();
        escena.remove(e);
      });
      pulsosRef = o.pulsos.current;
      esferas = pulsosRef.map((p, idx) => {
        const colPulso = caida(p.src)
          ? T.bad
          : p.dst
            ? (nodos.get(p.dst)?.colorBase ?? T.cyan)
            : colorFuente(p.src, idx);
        const m = new THREE.Mesh(
          geoPulso,
          new THREE.MeshBasicMaterial({ color: color(colPulso) }),
        );
        m.visible = false;
        escena.add(m);
        return m;
      });
    }
    pulsosRef.forEach((p, i) => {
      const tInicial = (el - p.t0) / p.dur;
      if (tInicial > 1 && p.dst && !caida(p.src)) lit.add(p.dst);
      const m = esferas[i]!;
      if (o.reducido || caida(p.src)) {
        m.visible = false;
        return;
      }
      // Flujo continuo tipo ASTRA: tras la oleada inicial, los pulsos siguen viajando cíclicamente por las curvas 3D
      const tCiclico =
        tInicial >= 0 && tInicial <= 1
          ? tInicial
          : tInicial > 1
            ? ((ahora * 0.00052 + i * 0.17) % 1)
            : -1;
      m.visible = tCiclico >= 0 && tCiclico <= 1;
      if (m.visible) {
        punto(p, tCiclico, m.position);
        const latido = 0.85 + Math.sin(ahora * 0.008 + i) * 0.22;
        m.scale.setScalar(latido);
      }
    });

    for (const a of aristas) {
      const hl = Boolean(
        (a.dato && (o.sel.current === a.dato || o.hover.current === a.dato)) ||
          (a.fuente && (o.sel.current === a.fuente || o.hover.current === a.fuente)),
      );
      const esCaida = Boolean(caida(a.fuente ?? ''));
      a.mat.color.copy(color(esCaida ? T.bad : hl ? T.naranja : a.colorBase));
      a.mat.opacity = esCaida ? 0.45 : hl ? 0.96 : a.dato ? 0.36 : 0.58;
    }

    for (const s of v.fuentes) {
      const n = nodos.get(s.id)!;
      const selSrc = o.sel.current === s.id || o.hover.current === s.id;
      const col = s.caida ? T.bad : selSrc ? T.naranja : n.colorBase;
      (n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(col));
      (n.halo.material as THREE.MeshBasicMaterial).color.copy(color(col));
      n.halo.visible = true;
      const respira = o.reducido ? 0 : Math.sin(ahora * 0.0032 + n.fase) * 0.1;
      n.mesh.scale.setScalar(1 + (selSrc ? 0.34 : 0) + respira * 0.3);
      n.halo.scale.setScalar(1.1 + (selSrc ? 0.35 : 0) + respira);
      if (!o.reducido) {
        const dz = Math.sin(ahora * 0.002 + n.fase) * 0.14;
        n.mesh.position.z = n.baseZ + dz;
        n.halo.position.z = n.baseZ + dz;
      }
      n.txt.style.color = '#FFFFFF';
      n.txt.style.fontWeight = selSrc ? '800' : '700';
      n.el.style.borderColor = s.caida
        ? css(T.bad)
        : selSrc
          ? css(T.naranja)
          : `rgba(${n.colorBase[0]},${n.colorBase[1]},${n.colorBase[2]},0.45)`;
      if (n.sub) {
        n.sub.style.color = css(s.caida ? T.bad : n.colorBase);
        const t = s.caida ? 'no disponible' : s.d;
        if (n.sub.textContent !== t) n.sub.textContent = t;
      }
    }

    for (const d of v.nodos) {
      const n = nodos.get(d.id)!;
      const restringido = d.estado === 'restringido';
      const caido = d.estado === 'caido';
      const on = lit.has(d.id) && d.estado === 'ok';
      const sel = o.sel.current === d.id || o.hover.current === d.id;
      const sem = Boolean(o.sem.current?.hits.length && d.sem);
      const col = caido
        ? T.bad
        : restringido
          ? T.warn
          : sel
            ? T.naranja
            : on
              ? n.colorBase
              : T.apagado;
      (n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(col));
      (n.halo.material as THREE.MeshBasicMaterial).color.copy(color(col));
      n.halo.visible = on || sel || restringido || caido;
      const respira = o.reducido ? 0 : Math.sin(ahora * 0.0036 + n.fase) * 0.1;
      n.mesh.scale.setScalar(1 + (sel ? 0.5 : 0) + (sem ? 0.28 : 0) + respira * 0.25);
      n.halo.scale.setScalar(1.08 + (sel ? 0.4 : 0) + respira);
      if (!o.reducido) {
        const dz = Math.sin(ahora * 0.0022 + n.fase) * 0.16;
        n.mesh.position.z = n.baseZ + dz;
        n.halo.position.z = n.baseZ + dz;
      }
      n.txt.style.color = caido
        ? css(T.bad)
        : restringido
          ? css(T.warn)
          : on || sel
            ? '#FFFFFF'
            : css(T.mudo);
      n.txt.style.fontWeight = sel ? '800' : '700';
      n.el.style.borderColor = sel
        ? css(T.naranja)
        : caido
          ? css(T.bad)
          : restringido
            ? css(T.warn)
            : on
              ? `rgba(${n.colorBase[0]},${n.colorBase[1]},${n.colorBase[2]},0.42)`
              : 'rgba(255,255,255,0.12)';
      n.el.style.boxShadow = sel ? '0 0 14px rgba(255,167,38,0.45)' : 'none';
    }

    ini.textContent = v.cliente.nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('');
    etNom.textContent = v.cliente.nombre;
    centro.halo.scale.setScalar(1 + (o.reducido ? 0 : Math.sin(ahora / 340) * 0.12));

    ctl.update();
    r.render(escena, cam);
    etiquetas.render(escena, cam);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w && h) {
      const pos: Record<string, { x: number; y: number; r: number }> = {};
      const pr = (p: THREE.Vector3, rad: number): { x: number; y: number; r: number } => {
        tmp.copy(p).project(cam);
        return { x: ((tmp.x + 1) / 2) * w, y: ((1 - tmp.y) / 2) * h, r: rad };
      };
      pos['c'] = pr(new THREE.Vector3(), 26);
      nodos.forEach((n, id) => {
        pos[id] = pr(n.pos, n.r > 0.35 ? 14 : 10);
      });
      o.pos.current = pos;
    }
  };
  const parar = bucle(o.reducido, frame);

  return () => {
    parar();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    ro.disconnect();
    ctl.dispose();
    r.dispose();
    etiquetas.domElement.remove();
    esferas.forEach((e) => (e.material as THREE.Material).dispose());
    geoPulso.dispose();
    geoEstrellas.dispose();
    matEstrellas.dispose();
  };
}
