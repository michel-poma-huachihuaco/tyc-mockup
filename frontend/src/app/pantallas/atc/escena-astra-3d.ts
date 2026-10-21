import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Raycaster,
  RingGeometry,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { Object3D } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Cliente360, Fuente360, NodoDato360 } from './datos-atc';

interface FuenteRef3D {
  id: string;
  grupo: Group;
  coreMesh: Mesh;
  ringMesh: Mesh;
  posBase: Vector3;
  fase: number;
}

interface NodoRef3D {
  id: string;
  grupo: Group;
  sphereMesh: Mesh;
  haloMesh: Mesh;
  posBase: Vector3;
  fase: number;
}

interface PulsoSinaptico3D {
  mesh: Mesh;
  curva: QuadraticBezierCurve3;
  progreso: number;
  velocidad: number;
}

const COLOR_FUENTE_3D: Readonly<Record<string, number>> = {
  sigda: 0x38bdf8,
  contr: 0x818cf8,
  cob: 0xf59e0b,
  jose: 0x10b981,
  repo: 0xc084fc,
  mail: 0x60a5fa,
  cti: 0x34d399,
  atc: 0xfbbf24,
};

export interface EstadoAstra3D {
  readonly cliente: Cliente360;
  readonly fuentes: readonly Fuente360[];
  readonly nodos: readonly NodoDato360[];
  readonly fuentesCaidas: readonly string[];
  readonly rolActivo: 'gestor' | 'supervisor' | 'legal';
  readonly nodoSeleccionadoId: string;
  readonly consultaSemanticaActiva: string;
}

export class EscenaAstra3D {
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private clock = new Clock();
  private animId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private interactables: Object3D[] = [];

  private coreGroup = new Group();
  private coreCrystal!: Mesh;
  private coreRing1!: Mesh;
  private coreRing2!: Mesh;
  private coreLabel: Sprite | null = null;
  private starField!: Points;

  private graphGroup = new Group();
  private fuentesMap = new Map<string, FuenteRef3D>();
  private nodosMap = new Map<string, NodoRef3D>();
  private pulsos: PulsoSinaptico3D[] = [];

  private autoRotate = true;
  private targetGoal = new Vector3(0, 0, 0);

  constructor(
    private readonly host: HTMLElement,
    private readonly onSelectNodo: (nodoId: string) => void,
    private readonly onToggleFuente: (fuenteId: string) => void,
  ) {
    this.initScene();
    this.initEstrellas();
    this.initCoreSigda();
    this.scene.add(this.graphGroup);
    this.initInteraccion();
    this.loop();
  }

  public sincronizar(estado: EstadoAstra3D): void {
    this.actualizarEtiquetaCore(estado.cliente);
    this.reconstruirConstelacion(estado);
  }

  public alternarAutoRotacion(): boolean {
    this.autoRotate = !this.autoRotate;
    if (this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
    return this.autoRotate;
  }

  public centrarCamara(): void {
    this.targetGoal.set(0, 0, 0);
    this.camera.position.set(0, 11.8, 22.5);
  }

  public enfocarNodo(nodoId: string): void {
    const ref = this.nodosMap.get(nodoId);
    if (ref) {
      this.targetGoal.copy(ref.posBase).multiplyScalar(0.55);
    }
  }

  public destruir(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
    }
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }

  private initScene(): void {
    const w = Math.max(this.host.clientWidth, 420);
    const h = Math.max(this.host.clientHeight || 500, 420);

    this.scene = new Scene();
    this.scene.background = new Color(0x050b16);
    this.scene.fog = new FogExp2(0x050b16, 0.016);

    this.camera = new PerspectiveCamera(42, w / h, 0.1, 160);
    this.camera.position.set(0, 11.8, 22.5);

    this.renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;

    this.host.innerHTML = '';
    this.host.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 0.65;
    this.controls.maxDistance = 38;
    this.controls.minDistance = 7;
    this.controls.maxPolarAngle = Math.PI * 0.78;

    const ambient = new AmbientLight(0xbae6fd, 1.15);
    this.scene.add(ambient);

    const coreLight = new PointLight(0x38bdf8, 4.2, 36);
    coreLight.position.set(0, 2.2, 0);
    this.scene.add(coreLight);

    const dir1 = new DirectionalLight(0x818cf8, 1.5);
    dir1.position.set(16, 22, 14);
    this.scene.add(dir1);

    const dir2 = new DirectionalLight(0x10b981, 1.2);
    dir2.position.set(-16, -12, -14);
    this.scene.add(dir2);

    const crearAnilloGuia = (radio: number, color: number, opacidad: number): void => {
      const geo = new RingGeometry(radio - 0.035, radio + 0.035, 96);
      const mat = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacidad,
        side: DoubleSide,
      });
      const mesh = new Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = -0.4;
      this.scene.add(mesh);
    };
    crearAnilloGuia(6.2, 0x38bdf8, 0.22);
    crearAnilloGuia(12.5, 0x818cf8, 0.16);

    this.resizeObserver = new ResizeObserver(() => {
      const nw = Math.max(300, this.host.clientWidth);
      const nh = Math.max(400, this.host.clientHeight || 500);
      this.camera.aspect = nw / nh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(nw, nh, false);
    });
    this.resizeObserver.observe(this.host);
  }

  private initEstrellas(): void {
    const count = 560;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new Color(0x38bdf8),
      new Color(0x818cf8),
      new Color(0x34d399),
      new Color(0xfef08a),
      new Color(0xe2e8f0),
    ];

    for (let i = 0; i < count; i++) {
      const r = 17 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));

    const mat = new PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
    });
    this.starField = new Points(geo, mat);
    this.scene.add(this.starField);
  }

  private initCoreSigda(): void {
    const icoGeo = new IcosahedronGeometry(1.32, 1);
    const icoMat = new MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.95,
      roughness: 0.15,
      metalness: 0.7,
      flatShading: true,
    });
    this.coreCrystal = new Mesh(icoGeo, icoMat);
    this.coreGroup.add(this.coreCrystal);

    const wireGeo = new IcosahedronGeometry(1.56, 1);
    const wireMat = new MeshBasicMaterial({
      color: 0x7dd3fc,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    this.coreGroup.add(new Mesh(wireGeo, wireMat));

    this.coreRing1 = new Mesh(
      new TorusGeometry(2.05, 0.038, 16, 64),
      new MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 }),
    );
    this.coreRing1.rotation.x = Math.PI / 3;
    this.coreGroup.add(this.coreRing1);

    this.coreRing2 = new Mesh(
      new TorusGeometry(2.38, 0.028, 16, 64),
      new MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.65 }),
    );
    this.coreRing2.rotation.y = Math.PI / 4;
    this.coreGroup.add(this.coreRing2);

    this.scene.add(this.coreGroup);
  }

  private actualizarEtiquetaCore(cliente: Cliente360): void {
    if (this.coreLabel) {
      this.coreGroup.remove(this.coreLabel);
      this.coreLabel.material.map?.dispose();
      this.coreLabel.material.dispose();
    }
    this.coreLabel = this.crearSpriteEtiqueta(
      `SIGDA · ${cliente.doc}`,
      `${cliente.nombre} (${cliente.lotes.join(', ')})`,
      '#38bdf8',
      true,
    );
    this.coreLabel.position.set(0, 2.95, 0);
    this.coreGroup.add(this.coreLabel);
  }

  private reconstruirConstelacion(estado: EstadoAstra3D): void {
    while (this.graphGroup.children.length > 0) {
      this.graphGroup.remove(this.graphGroup.children[0]);
    }
    this.interactables = [];
    this.fuentesMap.clear();
    this.nodosMap.clear();
    this.pulsos = [];

    const { cliente, fuentes, nodos, fuentesCaidas, rolActivo, nodoSeleccionadoId } = estado;
    const radioFuentes = 6.2;

    // 1. Anillo interior: 8 Sistemas Fuente
    fuentes.forEach((f, idx) => {
      const angulo = -Math.PI / 2 + (idx * Math.PI * 2) / fuentes.length;
      const x = Math.cos(angulo) * radioFuentes;
      const z = Math.sin(angulo) * radioFuentes;
      const y = idx % 2 === 0 ? 0.45 : -0.45;
      const posBase = new Vector3(x, y, z);

      const caida = fuentesCaidas.includes(f.id);
      const colorHex = caida ? 0xef4444 : (COLOR_FUENTE_3D[f.id] ?? 0x38bdf8);

      const grupo = new Group();
      grupo.position.copy(posBase);

      const coreMesh = new Mesh(
        new OctahedronGeometry(0.54, 0),
        new MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: caida ? 1.15 : 0.65,
          roughness: 0.2,
          metalness: 0.55,
        }),
      );
      coreMesh.userData = { tipo: 'fuente', id: f.id };
      grupo.add(coreMesh);
      this.interactables.push(coreMesh);

      const ringMesh = new Mesh(
        new RingGeometry(0.7, 0.82, 32),
        new MeshBasicMaterial({
          color: colorHex,
          side: DoubleSide,
          transparent: true,
          opacity: 0.72,
        }),
      );
      ringMesh.rotation.x = -Math.PI / 2;
      grupo.add(ringMesh);

      const sub = caida ? 'TIMEOUT · CB ABIERTO' : `${f.ms} ms · ${f.detalle}`;
      const sprite = this.crearSpriteEtiqueta(
        f.nombre.toUpperCase(),
        sub,
        caida ? '#ef4444' : '#38bdf8',
        false,
      );
      sprite.position.set(0, 1.12, 0);
      grupo.add(sprite);

      this.graphGroup.add(grupo);
      this.fuentesMap.set(f.id, {
        id: f.id,
        grupo,
        coreMesh,
        ringMesh,
        posBase,
        fase: idx * 0.85,
      });

      const mid = posBase.clone().multiplyScalar(0.5);
      mid.y += 1.35;
      const curva = new QuadraticBezierCurve3(new Vector3(0, 0, 0), mid, posBase.clone());
      const lineGeo = new BufferGeometry().setFromPoints(curva.getPoints(30));
      const lineMat = new LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: caida ? 0.22 : 0.55,
      });
      this.graphGroup.add(new Line(lineGeo, lineMat));

      if (!caida) {
        const pulseMesh = new Mesh(
          new SphereGeometry(0.11, 12, 12),
          new MeshBasicMaterial({ color: colorHex }),
        );
        this.graphGroup.add(pulseMesh);
        this.pulsos.push({
          mesh: pulseMesh,
          curva,
          progreso: Math.random(),
          velocidad: 0.42 + Math.random() * 0.18,
        });
      }
    });

    // 2. Constelación exterior: 16 Nodos de Datos del Cliente
    const radioNodos = 12.5;
    nodos.forEach((n, idx) => {
      const angulo = -Math.PI / 2 + (idx * Math.PI * 2) / nodos.length;
      const rOffset = idx % 3 === 0 ? 0.65 : idx % 3 === 1 ? -0.45 : 0;
      const x = Math.cos(angulo) * (radioNodos + rOffset);
      const z = Math.sin(angulo) * (radioNodos + rOffset);
      const y = Math.sin(idx * 1.35) * 2.15;
      const posBase = new Vector3(x, y, z);

      const bloqueado = Boolean(n.restringidoPara?.includes(rolActivo));
      const fuenteCaida = n.fuentes.some((fid) => fuentesCaidas.includes(fid));
      const seleccionado = nodoSeleccionadoId === n.id;

      let colorHex = 0x10b981;
      let colorBorde = '#10b981';
      if (fuenteCaida) {
        colorHex = 0xef4444;
        colorBorde = '#ef4444';
      } else if (bloqueado) {
        colorHex = 0xf59e0b;
        colorBorde = '#f59e0b';
      } else if (seleccionado) {
        colorHex = 0x38bdf8;
        colorBorde = '#facc15';
      }

      const grupo = new Group();
      grupo.position.copy(posBase);
      grupo.scale.setScalar(seleccionado ? 1.38 : 1.0);

      const sphereMesh = new Mesh(
        new SphereGeometry(0.42, 24, 24),
        new MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: seleccionado ? 1.15 : 0.55,
          roughness: 0.2,
          metalness: 0.45,
        }),
      );
      sphereMesh.userData = { tipo: 'nodo', id: n.id };
      grupo.add(sphereMesh);
      this.interactables.push(sphereMesh);

      const haloMesh = new Mesh(
        new RingGeometry(0.55, 0.68, 32),
        new MeshBasicMaterial({
          color: seleccionado ? 0xfacc15 : colorHex,
          side: DoubleSide,
          transparent: true,
          opacity: seleccionado ? 0.95 : 0.48,
        }),
      );
      haloMesh.rotation.x = -Math.PI / 2;
      grupo.add(haloMesh);

      const primeraFila = cliente.datos[n.id]?.[0];
      const resumenValor = fuenteCaida
        ? 'Fuente sin respuesta'
        : bloqueado
          ? `Restringido (${rolActivo})`
          : primeraFila
            ? `${primeraFila[0]}: ${primeraFila[1]}`
            : 'Activo';

      const sprite = this.crearSpriteEtiqueta(
        n.nombre,
        resumenValor,
        colorBorde,
        seleccionado,
      );
      sprite.position.set(0, 1.0, 0);
      grupo.add(sprite);

      this.graphGroup.add(grupo);
      this.nodosMap.set(n.id, {
        id: n.id,
        grupo,
        sphereMesh,
        haloMesh,
        posBase,
        fase: idx * 0.55,
      });

      // Sinapsis curvas desde cada fuente que alimenta a este nodo
      n.fuentes.forEach((fid) => {
        const fRef = this.fuentesMap.get(fid);
        if (!fRef) return;
        const fDown = fuentesCaidas.includes(fid);
        const mid = fRef.posBase.clone().lerp(posBase, 0.5);
        mid.y += 1.25;
        const curva = new QuadraticBezierCurve3(fRef.posBase.clone(), mid, posBase.clone());
        const lineGeo = new BufferGeometry().setFromPoints(curva.getPoints(28));
        const lineMat = new LineBasicMaterial({
          color: seleccionado ? 0xfacc15 : colorHex,
          transparent: true,
          opacity: fDown ? 0.16 : seleccionado ? 0.92 : 0.42,
        });
        this.graphGroup.add(new Line(lineGeo, lineMat));

        if (!fDown && !bloqueado) {
          const pulseMesh = new Mesh(
            new SphereGeometry(seleccionado ? 0.12 : 0.085, 10, 10),
            new MeshBasicMaterial({ color: seleccionado ? 0xfef08a : colorHex }),
          );
          this.graphGroup.add(pulseMesh);
          this.pulsos.push({
            mesh: pulseMesh,
            curva,
            progreso: Math.random(),
            velocidad: seleccionado ? 0.65 : 0.34 + Math.random() * 0.16,
          });
        }
      });
    });
  }

  private crearSpriteEtiqueta(
    titulo: string,
    subtitulo: string,
    colorAcento: string,
    destacado: boolean,
  ): Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = destacado ? 'rgba(15, 23, 42, 0.95)' : 'rgba(9, 16, 30, 0.88)';
      ctx.strokeStyle = colorAcento;
      ctx.lineWidth = destacado ? 5 : 3;
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 124, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colorAcento;
      ctx.font = '700 22px Montserrat, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(titulo.slice(0, 32), 256, 54);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 22px Figtree, system-ui, sans-serif';
      ctx.fillText(subtitulo.slice(0, 34), 256, 100);
    }

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    const mat = new SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new Sprite(mat);
    sprite.scale.set(destacado ? 3.5 : 2.95, destacado ? 0.98 : 0.82, 1);
    return sprite;
  }

  private initInteraccion(): void {
    const dom = this.renderer.domElement;
    let downX = 0;
    let downY = 0;

    dom.addEventListener('pointerdown', (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    });

    dom.addEventListener('pointerup', (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - downX, ev.clientY - downY) > 6) return;
      const rect = dom.getBoundingClientRect();
      this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactables, false);
      if (hits.length > 0) {
        const data = hits[0].object.userData as { tipo?: string; id?: string };
        if (data.tipo === 'nodo' && data.id) {
          this.enfocarNodo(data.id);
          this.onSelectNodo(data.id);
        } else if (data.tipo === 'fuente' && data.id) {
          this.onToggleFuente(data.id);
        }
      }
    });
  }

  private loop = (): void => {
    this.animId = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    if (this.coreCrystal) {
      this.coreCrystal.rotation.y += dt * 0.55;
      this.coreCrystal.rotation.x += dt * 0.25;
    }
    if (this.coreRing1) {
      this.coreRing1.rotation.z += dt * 0.82;
    }
    if (this.coreRing2) {
      this.coreRing2.rotation.x -= dt * 0.65;
    }
    if (this.starField) {
      this.starField.rotation.y += dt * 0.025;
    }

    this.fuentesMap.forEach((f) => {
      f.grupo.position.y = f.posBase.y + Math.sin(elapsed * 1.7 + f.fase) * 0.16;
      f.coreMesh.rotation.y += dt * 0.95;
      f.ringMesh.rotation.z -= dt * 0.65;
    });

    this.nodosMap.forEach((n) => {
      n.grupo.position.y = n.posBase.y + Math.cos(elapsed * 1.45 + n.fase) * 0.18;
      n.haloMesh.rotation.z += dt * 0.75;
    });

    for (const p of this.pulsos) {
      p.progreso = (p.progreso + dt * p.velocidad) % 1;
      const pt = p.curva.getPoint(p.progreso);
      p.mesh.position.copy(pt);
    }

    this.controls.target.lerp(this.targetGoal, Math.min(1, dt * 4.5));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
