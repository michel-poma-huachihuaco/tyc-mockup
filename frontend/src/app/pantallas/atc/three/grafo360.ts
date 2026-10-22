import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { bucle, capaEtiquetas, color, css, type RGB } from './comun';
import { crearPaleta } from './paleta';
import { ID_CLIENTE_GRAFO, idRelacion } from '../relaciones-360';

export interface FuenteGrafo {
  id: string;
  n: string;
  d: string;
  caida: boolean;
}

export interface NodoDatoGrafo {
  id: string;
  n: string;
  /** `vacio`: la fuente responde pero el cliente no tiene registros (acceso disponible, distinto de `caido`). */
  estado: 'ok' | 'restringido' | 'caido' | 'vacio';
  sem?: boolean;
  fuentes: readonly string[];
}

export interface VistaGrafo {
  apagado?: boolean;
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

/** Elementos relacionados con la selección (GRA-03): ids de nodos, ids de relaciones y texto de áreas/procesos. */
export interface ContextoGrafo {
  ids: ReadonlySet<string>;
  rels: ReadonlySet<string>;
  texto: string;
}

export interface OptsGrafo {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  reducido: boolean;
  vista: Ref<VistaGrafo | null>;
  sel: Ref<string>;
  abierta?: Ref<boolean>;
  sem: Ref<{ hits: unknown[] } | null>;
  hover: Ref<string | null>;
  contexto?: Ref<ContextoGrafo>;
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

export function montarGrafo(o: OptsGrafo): () => void {
  const { canvas, host } = o;
  const P = crearPaleta();
  const T = {
    bad: P.bad,
    warn: P.warn,
    ok: P.ok,
    naranja: P.acento,
    cyan: P.cyan,
    esmeralda: P.esmeralda,
    violeta: P.violeta,
    borde: P.borde,
    texto: P.texto,
    mudo: P.mudo,
    apagado: P.apagado,
    centroTexto: P.centroTexto,
  };
  const fondoEt = css(P.fondo, 0.92);
  const txtEt = css(P.texto);
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  const etiquetas = capaEtiquetas(host);
  const escena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  cam.position.set(0, -3.2, 20.5);
  cam.lookAt(0, 0, 0);
  const ctl = new OrbitControls(cam, canvas);
  ctl.enableZoom = false;
  ctl.enablePan = false;
  ctl.enableRotate = false;
  ctl.enableDamping = true;
  ctl.autoRotate = false;

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
    id: string;
    tipo: 'consulta' | 'alimenta';
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
  etNom.style.cssText = `pointer-events:none;font:700 calc(11.5px * var(--esc,1)) Montserrat,system-ui,sans-serif;width:max-content;max-width:calc(260px * var(--esc,1));text-align:center;color:${txtEt};padding:2px 8px;border-radius:12px;background:${fondoEt};border:1px solid ${css(T.naranja, 0.6)}`;
  const objNom = new CSS2DObject(etNom);
  objNom.position.set(0, -1.48, 0);
  const etCtx = document.createElement('div');
  etCtx.style.cssText = `pointer-events:none;display:none;font:600 calc(10px * var(--esc,1)) Montserrat,system-ui,sans-serif;width:max-content;max-width:calc(260px * var(--esc,1));text-align:center;color:${txtEt};padding:2px 8px;border-radius:8px;background:${fondoEt};border:1px solid ${css(T.naranja, 0.8)}`;
  etCtx.setAttribute('data-contexto-grafo', '');
  const objCtx = new CSS2DObject(etCtx);
  objCtx.position.set(0, -2.1, 0);
  escena.add(centro.mesh, centro.halo, centro.corona, objCentro, objNom, objCtx);

  const colorFuente = (id: string, idx: number): RGB =>
    P.fuentes[id] ?? P.nodos[idx % P.nodos.length]!;

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
          opacity: tipo === 'fuente' ? 0.12 : 0.11,
          depthWrite: false,
        }),
      );
      mesh.position.copy(p);
      mesh.userData = { id, tipo };
      halo.position.copy(p);
      halo.visible = true;
      const el = document.createElement('div');
      el.style.cssText = `pointer-events:auto;cursor:pointer;text-align:center;line-height:1.2;width:max-content;max-width:calc(150px * var(--esc,1));padding:3px 7px;border-radius:8px;user-select:none;background:${fondoEt};border:1px solid ${css(P.texto, 0.25)};transition:border-color .15s,transform .15s`;
      el.dataset['nodoId'] = id;
      el.dataset['nodoTipo'] = tipo;
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
      b.style.cssText = `display:block;font:700 calc(11px * var(--esc,1)) Montserrat,system-ui,sans-serif;color:${txtEt}`;
      b.textContent = texto;
      el.append(b);
      let s: HTMLElement | undefined;
      if (sub != null || tipo === 'dato') {
        s = document.createElement('small');
        s.style.cssText = 'display:block;font:600 calc(10px * var(--esc,1)) Montserrat,system-ui,sans-serif';
        s.textContent = sub ?? '';
        if (!sub) s.style.display = 'none';
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
        P.fuentes[srcPrincipal] ??
        P.nodos[i % P.nodos.length]!;
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
    const posDe = (id: string): THREE.Vector3 => (id === ID_CLIENTE_GRAFO ? new THREE.Vector3() : nodos.get(id)!.pos);
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
      const tipoRel = a === ID_CLIENTE_GRAFO ? 'consulta' : 'alimenta';
      linea.userData = { id: idRelacion(a, b), tipo: tipoRel };
      aristas.push({ linea, mat, id: idRelacion(a, b), tipo: tipoRel, a, b, colorBase: colorLinea, ...extra });
    };
    v.fuentes.forEach((s, i) => arista('c', s.id, colorFuente(s.id, i), { fuente: s.id }));
    v.nodos.forEach((d, i) => {
      const col = nodos.get(d.id)?.colorBase ?? P.nodos[i % P.nodos.length]!;
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
    const h = Math.max(680, Math.min(860, Math.round(w * 0.78)));
    canvas.style.height = `${h}px`;
    r.setSize(w, h, false);
    etiquetas.setSize(w, h);
    etiquetas.domElement.style.setProperty('--esc', String(w < 480 ? 0.85 : w < 800 ? 0.92 : 1));
    cam.aspect = w / h;
    cam.position.setLength(w < 560 ? 32 : w < 800 ? 25 : 20.5);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(ajustar);
  ro.observe(host);
  ajustar();

  const raycaster = new THREE.Raycaster();
  const punteroNdc = new THREE.Vector2();
  let downPos: { x: number; y: number } | null = null;
  let targetRotX = 0;
  let targetRotY = 0;
  let rotActualX = 0;
  let rotActualY = 0;
  let despActualX = 0;

  const onHostPointerMove = (ev: PointerEvent): void => {
    if (o.reducido) return;
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((ev.clientY - rect.top) / rect.height) * 2 - 1;
    // Rotación leve al pasar el mouse (~4.5° en Y y ~3° en X)
    targetRotY = Math.max(-1, Math.min(1, nx)) * 0.08;
    targetRotX = Math.max(-1, Math.min(1, ny)) * 0.052;
  };
  const onHostPointerLeave = (): void => {
    targetRotX = 0;
    targetRotY = 0;
  };

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
  host.addEventListener('pointermove', onHostPointerMove);
  host.addEventListener('pointerleave', onHostPointerLeave);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);

  const tmp = new THREE.Vector3();

  // D4: cada etiqueta se ajusta a los bordes del contenedor y, si dos se pisan, la de menor
  // prioridad se desplaza en vertical o, si no hay hueco, se atenúa. `translate` es independiente
  // del `transform` que escribe CSS2DRenderer. Coste: ~25 rectángulos, O(n²) ≈ 300 pruebas por cuadro.
  const medidas = new WeakMap<HTMLElement, { w: number; h: number; t: number }>();
  const ajustarEtiquetas = (ahora: number, W: number, H: number): void => {
    const M = 4;
    const items: { obj: CSS2DObject; el: HTMLElement; prio: number }[] = [];
    items.push({ obj: objNom, el: etNom, prio: 100 });
    if (etCtx.style.display !== 'none') items.push({ obj: objCtx, el: etCtx, prio: 90 });
    nodos.forEach((n, id) => {
      const marcado = o.sel.current === id || o.hover.current === id;
      items.push({ obj: n.et, el: n.el, prio: marcado ? 95 : n.mesh.userData['tipo'] === 'fuente' ? 60 : 50 });
    });
    items.sort((a, b) => b.prio - a.prio);
    const puestos: { l: number; t: number; r: number; b: number }[] = [];
    for (const it of items) {
      let m = medidas.get(it.el);
      if (!m || ahora - m.t > 500) {
        m = { w: it.el.offsetWidth, h: it.el.offsetHeight, t: ahora };
        medidas.set(it.el, m);
      }
      it.obj.getWorldPosition(tmp).project(cam);
      const px = ((tmp.x + 1) / 2) * W;
      const py = ((1 - tmp.y) / 2) * H;
      const l0 = px - it.obj.center.x * m.w;
      const t0 = py - it.obj.center.y * m.h;
      const fijar = (l: number, t: number): { l: number; t: number } => ({
        l: Math.max(M, Math.min(W - M - m.w, l)),
        t: Math.max(M, Math.min(H - M - m.h, t)),
      });
      const choca = (l: number, t: number): boolean =>
        puestos.some((p) => l < p.r && l + m.w > p.l && t < p.b && t + m.h > p.t);
      let pos = fijar(l0, t0);
      let libre = !choca(pos.l, pos.t);
      for (let k = 1; !libre && k <= 3; k++) {
        for (const sg of [1, -1]) {
          const c = fijar(l0, t0 + sg * k * (m.h + 2));
          if (!choca(c.l, c.t)) {
            pos = c;
            libre = true;
            break;
          }
        }
      }
      it.el.style.translate = `${Math.round(pos.l - l0)}px ${Math.round(pos.t - t0)}px`;
      if (!libre) it.el.style.opacity = String(Math.min(Number(it.el.style.opacity || 1), 0.3));
      puestos.push({ l: pos.l, t: pos.t, r: pos.l + m.w, b: pos.t + m.h });
    }
  };
  const frame = (ahora: number): void => {
    const wHost = host.clientWidth;
    if (!wHost) return;
    if (wHost !== ultimoAncho || !canvas.clientHeight) {
      ajustar();
    }
    const v = o.vista.current;
    if (!v) return;
    const f =
      (v.apagado ? 'OFF' : 'ON') +
      '|' +
      v.cliente.nombre +
      '|' +
      v.fuentes.map((s) => s.id).join() +
      '|' +
      v.nodos.map((n) => n.id).join();
    if (f !== firma) {
      firma = f;
      construir(v);
    }
    const esApagado = Boolean(v.apagado);
    const caida = (id: string): boolean | undefined => v.fuentes.find((s) => s.id === id)?.caida;
    const el = ahora - o.t0.current;
    const lit = o.lit.current;
    const ctxG = o.contexto?.current;
    const hayCtx = !esApagado && Boolean(ctxG && ctxG.ids.size > 0);
    const rel = (id: string): boolean => !hayCtx || Boolean(ctxG?.ids.has(id));

    // Suavizar la rotación leve guiada por el cursor del mouse y el desplazamiento lateral al abrir/cerrar la card
    rotActualX += (targetRotX - rotActualX) * 0.08;
    rotActualY += (targetRotY - rotActualY) * 0.08;
    escena.rotation.x = rotActualX;
    escena.rotation.y = rotActualY;

    const anchoDrawerPx = Math.min(456, wHost * 0.42);
    const fracDesp = (anchoDrawerPx * 0.45) / Math.max(1, wHost);
    const semianchoMundo =
      Math.tan((cam.fov * Math.PI) / 360) * cam.position.length() * cam.aspect;
    const targetDespX = !esApagado && o.abierta?.current ? -semianchoMundo * fracDesp * 2 : 0;
    despActualX += (targetDespX - despActualX) * (o.reducido ? 1 : 0.09);
    escena.position.x = despActualX;

    // Animar anillos orbitales y polvo estelar ASTRA de forma suave
    if (!o.reducido && !esApagado) {
      const seg = ahora * 0.001;
      anilloCore1.rotation.z = seg * 0.28;
      anilloCore1.rotation.x = 0.45 + Math.sin(seg * 0.5) * 0.08;
      anilloCore2.rotation.z = -seg * 0.22;
      anilloCore2.rotation.y = 0.35 + Math.cos(seg * 0.45) * 0.08;
      anilloFuentes.rotation.z = seg * 0.05;
      anilloNodos.rotation.z = -seg * 0.035;
      anilloExterior.rotation.z = seg * 0.025;
      nubeEstrellas.rotation.z = seg * 0.018;
      centro.corona.rotation.y = seg * 0.22;
      centro.corona.rotation.x = seg * 0.15;
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
      if (!esApagado && tInicial > 1 && p.dst && !caida(p.src)) lit.add(p.dst);
      const m = esferas[i]!;
      if (o.reducido || esApagado || caida(p.src)) {
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
      if (esApagado) {
        a.mat.color.copy(color(T.borde));
        a.mat.opacity = 0.18;
        continue;
      }
      const hl = Boolean(
        (a.dato && (o.sel.current === a.dato || o.hover.current === a.dato)) ||
          (a.fuente && (o.sel.current === a.fuente || o.hover.current === a.fuente)),
      );
      const esCaida = Boolean(caida(a.fuente ?? ''));
      const enCtx = hayCtx && Boolean(ctxG?.rels.has(a.id));
      a.mat.color.copy(color(esCaida ? T.bad : hl || enCtx ? T.naranja : a.colorBase));
      a.mat.opacity = esCaida ? 0.45 : hl || enCtx ? 0.96 : hayCtx ? 0.1 : a.dato ? 0.36 : 0.58;
    }

    for (const s of v.fuentes) {
      const n = nodos.get(s.id)!;
      const haloMat = n.halo.material as THREE.MeshBasicMaterial;
      if (esApagado) {
        (n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(T.apagado));
        haloMat.color.copy(color(T.apagado));
        n.halo.visible = false;
        n.mesh.scale.setScalar(0.92);
        n.txt.style.color = css(T.mudo);
        n.txt.style.fontWeight = '600';
        n.el.style.borderColor = css(T.borde, 0.6);
        n.el.style.borderStyle = 'solid';
        n.el.style.opacity = '1';
        if (n.sub) {
          n.sub.style.color = css(T.mudo);
          if (n.sub.textContent !== 'en espera') n.sub.textContent = 'en espera';
        }
        continue;
      }
      const esSelSrc = o.sel.current === s.id;
      const esHoverSrc = o.hover.current === s.id;
      const selSrc = esSelSrc || esHoverSrc;
      const col = s.caida ? T.bad : selSrc ? T.naranja : n.colorBase;
      (n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(col));
      haloMat.color.copy(color(col));
      n.halo.visible = true;
      const respira = o.reducido ? 0 : Math.sin(ahora * 0.0032 + n.fase) * 0.08;
      // Aura discreta por defecto y grande cuando la fuente está seleccionada
      haloMat.opacity = esSelSrc ? 0.36 : esHoverSrc ? 0.2 : 0.11;
      n.mesh.scale.setScalar(
        1 + (esSelSrc ? 0.38 : esHoverSrc ? 0.14 : 0) + respira * (esSelSrc ? 0.3 : 0.15),
      );
      n.halo.scale.setScalar(
        esSelSrc ? 1.38 + respira : esHoverSrc ? 0.8 + respira * 0.35 : 0.62 + respira * 0.2,
      );
      if (!o.reducido) {
        const dz = Math.sin(ahora * 0.002 + n.fase) * 0.12;
        n.mesh.position.z = n.baseZ + dz;
        n.halo.position.z = n.baseZ + dz;
      }
      n.el.style.opacity = rel(s.id) ? '1' : '0.35';
      n.el.style.borderStyle = 'solid';
      n.el.style.borderWidth = s.caida ? '2px' : '1px';
      n.txt.style.color = txtEt;
      n.txt.style.fontWeight = esSelSrc ? '800' : '700';
      n.el.style.borderColor = s.caida
        ? css(T.bad)
        : selSrc
          ? css(T.naranja)
          : css(n.colorBase, 0.55);
      n.el.style.boxShadow = esSelSrc ? `0 0 14px ${css(T.naranja, 0.45)}` : 'none';
      if (n.sub) {
        n.sub.style.color = css(s.caida ? T.bad : n.colorBase);
        const t = s.caida ? '✕ no disponible' : s.d;
        if (n.sub.textContent !== t) n.sub.textContent = t;
      }
    }

    for (const d of v.nodos) {
      const n = nodos.get(d.id)!;
      const haloMat = n.halo.material as THREE.MeshBasicMaterial;
      if (esApagado) {
        (n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(T.apagado));
        haloMat.color.copy(color(T.apagado));
        n.halo.visible = false;
        n.mesh.scale.setScalar(0.9);
        n.txt.style.color = css(T.mudo);
        n.txt.style.fontWeight = '600';
        n.el.style.borderColor = css(T.borde, 0.6);
        n.el.style.borderStyle = 'solid';
        n.el.style.boxShadow = 'none';
        n.el.style.opacity = '1';
        if (n.sub) n.sub.style.display = 'none';
        continue;
      }
      const restringido = d.estado === 'restringido';
      const caido = d.estado === 'caido';
      const vacio = d.estado === 'vacio';
      const enCtx = hayCtx && rel(d.id);
      const on = lit.has(d.id) && d.estado === 'ok';
      const esSel = o.sel.current === d.id;
      const esHover = o.hover.current === d.id;
      const sel = esSel || esHover;
      const sem = Boolean(o.sem.current?.hits.length && d.sem);
      const col = caido
        ? T.bad
        : restringido
          ? T.warn
          : sel
            ? T.naranja
            : on
              ? n.colorBase
              : vacio
                ? T.mudo
                : T.apagado;
      (n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(col));
      haloMat.color.copy(color(col));
      n.halo.visible = on || sel || restringido || caido || enCtx;
      n.el.style.opacity = rel(d.id) ? '1' : '0.35';
      if (n.sub) {
        // El color no es el único medio: el estado también va escrito en la etiqueta del nodo.
        const t = caido ? '✕ no disponible' : restringido ? '▲ restringido' : vacio ? '○ sin registros' : '';
        if (n.sub.textContent !== t) n.sub.textContent = t;
        n.sub.style.display = t ? 'block' : 'none';
        n.sub.style.color = css(caido ? T.bad : restringido ? T.warn : T.mudo);
      }
      const respira = o.reducido ? 0 : Math.sin(ahora * 0.0036 + n.fase) * 0.08;
      // Aura pequeña en reposo y grande únicamente cuando el nodo está seleccionado
      haloMat.opacity = esSel ? 0.38 : esHover ? 0.2 : 0.1;
      n.mesh.scale.setScalar(
        1 +
          (esSel ? 0.52 : esHover ? 0.16 : 0) +
          (sem ? 0.22 : 0) +
          respira * (esSel ? 0.28 : 0.14),
      );
      n.halo.scale.setScalar(
        esSel ? 1.44 + respira : esHover ? 0.8 + respira * 0.35 : 0.6 + respira * 0.18,
      );
      if (!o.reducido) {
        const dz = Math.sin(ahora * 0.0022 + n.fase) * 0.13;
        n.mesh.position.z = n.baseZ + dz;
        n.halo.position.z = n.baseZ + dz;
      }
      n.txt.style.color = caido
        ? css(T.bad)
        : restringido
          ? css(T.warn)
          : on || sel || enCtx
            ? txtEt
            : css(T.mudo);
      n.txt.style.fontWeight = esSel ? '800' : '700';
      // Segundo canal (no solo color): borde sólido grueso = caído, discontinuo = restringido, punteado = sin registros.
      n.el.style.borderStyle = restringido ? 'dashed' : vacio ? 'dotted' : 'solid';
      n.el.style.borderWidth = caido || restringido || vacio ? '2px' : '1px';
      n.el.style.borderColor = sel || enCtx
        ? css(T.naranja)
        : caido
          ? css(T.bad)
          : restringido
            ? css(T.warn)
            : on
              ? css(n.colorBase, 0.55)
              : vacio
                ? css(T.mudo, 0.6)
                : css(T.borde, 0.6);
      n.el.style.boxShadow = esSel ? `0 0 14px ${css(T.naranja, 0.45)}` : 'none';
    }

    const textoCtx = hayCtx ? (ctxG?.texto ?? '') : '';
    if (etCtx.textContent !== textoCtx) etCtx.textContent = textoCtx;
    etCtx.style.display = textoCtx ? 'block' : 'none';

    if (esApagado) {
      (centro.mesh.material as THREE.MeshBasicMaterial).color.copy(color(T.apagado));
      centro.halo.visible = false;
      ini.style.color = css(T.mudo);
      ini.textContent = '360';
      etNom.textContent = 'Sin cliente seleccionado';
    } else {
      (centro.mesh.material as THREE.MeshBasicMaterial).color.copy(color(T.naranja));
      centro.halo.visible = true;
      ini.style.color = css(T.centroTexto);
      ini.textContent = v.cliente.nombre
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0])
        .join('');
      etNom.textContent = v.cliente.nombre;
      centro.halo.scale.setScalar(0.88 + (o.reducido ? 0 : Math.sin(ahora / 340) * 0.08));
    }

    ctl.update();
    r.render(escena, cam);
    etiquetas.render(escena, cam);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w && h) {
      ajustarEtiquetas(ahora, w, h);
      const pos: Record<string, { x: number; y: number; r: number }> = {};
      const pr = (obj: THREE.Object3D, rad: number): { x: number; y: number; r: number } => {
        obj.getWorldPosition(tmp).project(cam);
        return { x: ((tmp.x + 1) / 2) * w, y: ((1 - tmp.y) / 2) * h, r: rad };
      };
      pos['c'] = pr(centro.mesh, 26);
      nodos.forEach((n, id) => {
        pos[id] = pr(n.mesh, n.r > 0.35 ? 14 : 10);
      });
      o.pos.current = pos;
    }
  };
  const parar = bucle(o.reducido, frame);

  return () => {
    parar();
    host.removeEventListener('pointermove', onHostPointerMove);
    host.removeEventListener('pointerleave', onHostPointerLeave);
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
