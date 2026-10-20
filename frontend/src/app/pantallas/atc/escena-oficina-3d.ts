import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Clock,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
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
import type { BufferGeometry, Material, Object3D, Texture } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PUERTAS_CANAL, SALAS_OFICINA } from './datos-atc';

export interface TicketSimuladoVista {
  readonly id: string;
  readonly type: string;
  readonly st: string;
  readonly x: number;
  readonly y: number;
  readonly vis: boolean;
  readonly rayo: boolean;
  readonly esc: boolean;
  readonly drone?: boolean;
  readonly colorTipo: string;
  readonly colorSla: string;
}

export interface GestorSimuladoVista {
  readonly nombre: string;
  readonly ocupado: boolean;
  readonly progreso: number;
}

export interface SalaSimuladaVista {
  readonly k: string;
  readonly enCola: number;
  readonly enRiesgo: boolean;
  readonly gestores: readonly GestorSimuladoVista[];
}

export interface EstadoEscenaOficina {
  readonly areaSeleccionada: string;
  readonly ticketSeleccionadoId: string | null;
  readonly enBandeja: number;
  readonly escaladosComite: number;
  readonly cerradosPortal: number;
  readonly salas: readonly SalaSimuladaVista[];
  readonly tickets: readonly TicketSimuladoVista[];
}

export interface EventosEscenaOficina {
  readonly alSeleccionarArea: (areaKey: string) => void;
  readonly alSeleccionarTicket: (ticketId: string) => void;
  readonly alCrearPorCanal: (gateKey: string) => void;
}

export interface ControladorEscenaOficina {
  sincronizar(estado: EstadoEscenaOficina): void;
  centrarEnArea(areaKey: string): void;
  dispose(): void;
}

interface NodoTicketAnimado {
  id: string;
  grupo: Group;
  cuerpoMesh: Mesh;
  cuerpoMat: MeshStandardMaterial;
  aroMesh: Mesh;
  aroMat: MeshBasicMaterial;
  rayoGrupo: Group;
  dronGrupo: Group;
  helices: Mesh[];
  posActual: Vector3;
  posMeta: Vector3;
  fase: number;
  esDrone: boolean;
  tieneRayo: boolean;
  seleccionado: boolean;
}

interface GestorAnimado {
  grupoFigura: Group;
  torsoMat: MeshStandardMaterial;
  aroMesh: Mesh;
  aroMat: MeshBasicMaterial;
  pantallaMat: MeshStandardMaterial;
  ocupado: boolean;
  progreso: number;
  fase: number;
}

const CENTRO_X = 8.2;
const CENTRO_Z = 8.2;

// Paleta libre arquitectónica de oficina moderna por departamento
const ESTILO_SALA: Readonly<
  Record<string, { suelo: string; acento: string; chaqueta: string }>
> = {
  eje1: { suelo: '#E0F2FE', acento: '#0284C7', chaqueta: '#0369A1' },
  cob: { suelo: '#FEF3C7', acento: '#D97706', chaqueta: '#B45309' },
  libro: { suelo: '#FCE7F3', acento: '#DB2777', chaqueta: '#BE185D' },
  legal: { suelo: '#EDE9FE', acento: '#7C3AED', chaqueta: '#6D28D9' },
  post: { suelo: '#DCFCE7', acento: '#16A34A', chaqueta: '#15803D' },
  proy: { suelo: '#CFFAFE', acento: '#0891B2', chaqueta: '#0E7490' },
};

function crearEtiquetaSprite(
  titulo: string,
  subtitulo: string,
  colorBorde: string,
  colorTexto: string,
  texturas: Texture[],
  materiales: Material[],
): Sprite {
  const cv = document.createElement('canvas');
  cv.width = 400;
  cv.height = 104;
  const g = cv.getContext('2d');
  if (g) {
    g.fillStyle = 'rgba(15, 23, 42, 0.92)';
    g.strokeStyle = colorBorde;
    g.lineWidth = 4;
    g.beginPath();
    g.roundRect(6, 6, 388, 92, 18);
    g.fill();
    g.stroke();

    g.fillStyle = '#F8FAFC';
    g.font = '700 23px Montserrat, system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText(titulo, 200, 44);

    g.fillStyle = colorTexto;
    g.font = '600 18px Figtree, system-ui, sans-serif';
    g.fillText(subtitulo, 200, 76);
  }
  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  texturas.push(tex);
  const mat = new SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  materiales.push(mat);
  const sp = new Sprite(mat);
  sp.scale.set(2.55, 0.66, 1);
  sp.renderOrder = 15;
  return sp;
}

export function crearEscenaOficina3D(
  contenedor: HTMLElement,
  eventos: EventosEscenaOficina,
): ControladorEscenaOficina {
  const escena = new Scene();
  escena.background = new Color('#0F172A');

  const geometrias: BufferGeometry[] = [];
  const materiales: Material[] = [];
  const texturas: Texture[] = [];
  const regGeo = <T extends BufferGeometry>(g: T): T => {
    geometrias.push(g);
    return g;
  };
  const regMat = <T extends Material>(m: T): T => {
    materiales.push(m);
    return m;
  };

  const camara = new PerspectiveCamera(35, 1, 0.5, 130);
  camara.position.set(CENTRO_X - 11.8, 14.5, CENTRO_Z + 14.2);

  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  contenedor.appendChild(renderer.domElement);

  const controles = new OrbitControls(camara, renderer.domElement);
  controles.target.set(CENTRO_X, 0.4, CENTRO_Z);
  controles.enableDamping = true;
  controles.dampingFactor = 0.06;
  controles.maxPolarAngle = Math.PI / 2.15;
  controles.minPolarAngle = Math.PI / 6;
  controles.minDistance = 7.5;
  controles.maxDistance = 35;
  controles.update();

  const metaCamaraTarget = new Vector3(CENTRO_X, 0.4, CENTRO_Z);

  // Iluminación arquitectónica cálida con sombras suaves
  const luzAmbiental = new AmbientLight(0xf8fafc, 0.75);
  const luzHemi = new HemisphereLight(0xfffbeb, 0x1e293b, 1.35);
  const luzSol = new DirectionalLight(0xfff7ed, 1.55);
  luzSol.position.set(-12, 22, 14);
  luzSol.castShadow = true;
  luzSol.shadow.mapSize.width = 2048;
  luzSol.shadow.mapSize.height = 2048;
  luzSol.shadow.camera.near = 2;
  luzSol.shadow.camera.far = 55;
  const dCam = 15;
  luzSol.shadow.camera.left = -dCam;
  luzSol.shadow.camera.right = dCam;
  luzSol.shadow.camera.top = dCam;
  luzSol.shadow.camera.bottom = -dCam;

  const luzHub = new PointLight(0x38bdf8, 2.2, 11);
  luzHub.position.set(7.5, 2.8, 7.2);

  const luzComite = new PointLight(0xf43f5e, 1.8, 9);
  luzComite.position.set(7.1, 2.5, 1.65);

  escena.add(luzAmbiental, luzHemi, luzSol, luzHub, luzComite);

  // Geometrías compartidas
  const geoCaja = regGeo(new BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const geoCilindro = regGeo(new CylinderGeometry(1, 1, 1, 24).translate(0, 0.5, 0));
  const geoEsfera = regGeo(new SphereGeometry(1, 20, 20));
  const geoCono = regGeo(new ConeGeometry(1, 1, 16).translate(0, 0.5, 0));
  const geoAnillo = regGeo(new RingGeometry(0.68, 0.98, 32).rotateX(-Math.PI / 2));
  const geoPlano = regGeo(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2));

  // Basamento arquitectónico de la planta corporativa
  const matBasamento = regMat(
    new MeshStandardMaterial({ color: '#1E293B', roughness: 0.6, metalness: 0.2 }),
  );
  const basamento = new Mesh(geoCaja, matBasamento);
  basamento.position.set(CENTRO_X, -0.48, CENTRO_Z);
  basamento.scale.set(17.5, 0.48, 17.5);
  basamento.receiveShadow = true;
  escena.add(basamento);

  // Borde perimetral luminoso
  const matBordePerimetro = regMat(
    new MeshStandardMaterial({
      color: '#38BDF8',
      emissive: '#0284C7',
      emissiveIntensity: 0.45,
      roughness: 0.3,
    }),
  );
  const bordePerimetro = new Mesh(geoCaja, matBordePerimetro);
  bordePerimetro.position.set(CENTRO_X, -0.05, CENTRO_Z);
  bordePerimetro.scale.set(17.1, 0.06, 17.1);
  escena.add(bordePerimetro);

  // Losa principal tipo porcelanato arquitectónico cálido
  const matPisoPrincipal = regMat(
    new MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.75, metalness: 0.05 }),
  );
  const pisoPrincipal = new Mesh(geoCaja, matPisoPrincipal);
  pisoPrincipal.position.set(CENTRO_X, 0, CENTRO_Z);
  pisoPrincipal.scale.set(16.8, 0.06, 16.8);
  pisoPrincipal.receiveShadow = true;
  escena.add(pisoPrincipal);

  // Pasillos de circulación con alfombra corporativa azul pizarra
  const matPasillo = regMat(
    new MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.85 }),
  );
  const tramosPasillo: readonly [number, number, number, number][] = [
    [10.6, 0.2, 1.25, 16.0],
    [0.2, 10.6, 16.0, 1.05],
    [1.8, 0.2, 1.05, 15.8],
    [2.8, 6.7, 2.4, 1.05],
    [2.8, 3.6, 8.0, 0.85],
    [7.0, 9.4, 1.05, 1.2],
  ];
  for (const [x, z, w, d] of tramosPasillo) {
    const m = new Mesh(geoPlano, matPasillo);
    m.position.set(x + w / 2, 0.068, z + d / 2);
    m.scale.set(w, 1, d);
    m.receiveShadow = true;
    escena.add(m);
  }

  // Función auxiliar para colocar plantas ornamentales de oficina
  const matMaceta = regMat(new MeshStandardMaterial({ color: '#B45309', roughness: 0.65 }));
  const matFollaje1 = regMat(new MeshStandardMaterial({ color: '#16A34A', roughness: 0.55 }));
  const matFollaje2 = regMat(new MeshStandardMaterial({ color: '#22C55E', roughness: 0.5 }));

  const crearPlantaOficina = (x: number, z: number, escala = 1): void => {
    const g = new Group();
    g.position.set(x, 0.08, z);
    g.scale.setScalar(escala);

    const maceta = new Mesh(geoCilindro, matMaceta);
    maceta.scale.set(0.18, 0.26, 0.18);
    maceta.castShadow = true;
    g.add(maceta);

    const copa1 = new Mesh(geoEsfera, matFollaje1);
    copa1.position.set(0, 0.36, 0);
    copa1.scale.set(0.24, 0.28, 0.24);
    copa1.castShadow = true;
    g.add(copa1);

    const copa2 = new Mesh(geoEsfera, matFollaje2);
    copa2.position.set(0.08, 0.52, -0.05);
    copa2.scale.set(0.16, 0.18, 0.16);
    g.add(copa2);

    escena.add(g);
  };

  // Plantas decorativas en el Atrio y pasillos
  crearPlantaOficina(5.45, 4.85, 1.15);
  crearPlantaOficina(9.55, 4.85, 1.15);
  crearPlantaOficina(5.45, 9.15, 1.15);
  crearPlantaOficina(9.55, 9.15, 1.15);
  crearPlantaOficina(3.1, 12.1, 1.0);
  crearPlantaOficina(11.9, 12.1, 1.0);

  const interactivos: Object3D[] = [];
  const suelosSala = new Map<string, { mat: MeshStandardMaterial; colorBase: string }>();
  const gestoresVisuales = new Map<string, GestorAnimado[]>();
  const carpetasSala = new Map<string, Group>();

  // Muros de cristal arquitectónico templado con perfil de aluminio oscuro
  const matVidrio = regMat(
    new MeshStandardMaterial({
      color: '#BAE6FD',
      transparent: true,
      opacity: 0.34,
      roughness: 0.12,
      metalness: 0.2,
    }),
  );
  const matMarcoAluminio = regMat(
    new MeshStandardMaterial({ color: '#1E293B', roughness: 0.35, metalness: 0.6 }),
  );

  const crearMuroCristal = (x: number, z: number, w: number, d: number, h: number): void => {
    const v = new Mesh(geoCaja, matVidrio);
    v.position.set(x, 0.08, z);
    v.scale.set(w, h, d);
    escena.add(v);
    const rielSup = new Mesh(geoCaja, matMarcoAluminio);
    rielSup.position.set(x, 0.08 + h, z);
    rielSup.scale.set(w + 0.03, 0.045, d + 0.03);
    escena.add(rielSup);
  };

  // 1. Puertas de recepción multicanal (Izquierda)
  const coloresCanal: Record<string, string> = {
    tel: '#38BDF8',
    wa: '#22C55E',
    mail: '#818CF8',
    portal: '#F59E0B',
    form: '#EC4899',
  };

  for (const g of PUERTAS_CANAL) {
    const colCanal = coloresCanal[g.k] ?? '#38BDF8';
    const grupoGate = new Group();
    grupoGate.position.set(0.9, 0.08, g.y + 0.48);
    grupoGate.userData = { tipoHit: 'gate', id: g.k };

    const totem = new Mesh(
      geoCaja,
      regMat(new MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 })),
    );
    totem.scale.set(1.18, 0.5, 0.92);
    totem.castShadow = true;
    totem.receiveShadow = true;
    totem.userData = grupoGate.userData;
    grupoGate.add(totem);

    const pantalla = new Mesh(
      geoCaja,
      regMat(
        new MeshStandardMaterial({
          color: colCanal,
          emissive: colCanal,
          emissiveIntensity: 0.45,
          roughness: 0.2,
        }),
      ),
    );
    pantalla.position.set(-0.36, 0.5, 0);
    pantalla.scale.set(0.14, 0.66, 0.72);
    pantalla.userData = grupoGate.userData;
    grupoGate.add(pantalla);

    const sp = crearEtiquetaSprite(
      `${g.ic} · ${g.nombre}`,
      'Clic para inyectar ticket',
      colCanal,
      '#93C5FD',
      texturas,
      materiales,
    );
    sp.position.set(0, 1.52, 0);
    sp.scale.set(1.85, 0.48, 1);
    grupoGate.add(sp);

    escena.add(grupoGate);
    interactivos.push(totem, pantalla);
  }

  // 2. Atrio Central: Bandeja Orquestadora (HUB) con holograma 3D giratorio
  const hubX = 7.5;
  const hubZ = 7.2;
  const matSueloHub = regMat(new MeshStandardMaterial({ color: '#E0F2FE', roughness: 0.75 }));
  const sueloHub = new Mesh(geoCaja, matSueloHub);
  sueloHub.position.set(5.2 + 4.6 / 2, 0.07, 4.6 + 4.8 / 2);
  sueloHub.scale.set(4.6, 0.03, 4.8);
  sueloHub.receiveShadow = true;
  sueloHub.userData = { tipoHit: 'area', id: 'hub' };
  escena.add(sueloHub);
  interactivos.push(sueloHub);
  suelosSala.set('hub', { mat: matSueloHub, colorBase: '#E0F2FE' });

  const mesaHub = new Mesh(
    geoCilindro,
    regMat(new MeshStandardMaterial({ color: '#1E293B', roughness: 0.3, metalness: 0.5 })),
  );
  mesaHub.position.set(hubX, 0.09, hubZ);
  mesaHub.scale.set(1.22, 0.46, 1.22);
  mesaHub.castShadow = true;
  mesaHub.userData = { tipoHit: 'area', id: 'hub' };
  escena.add(mesaHub);
  interactivos.push(mesaHub);

  const topeHub = new Mesh(
    geoCilindro,
    regMat(
      new MeshStandardMaterial({
        color: '#38BDF8',
        emissive: '#0284C7',
        emissiveIntensity: 0.55,
        roughness: 0.2,
      }),
    ),
  );
  topeHub.position.set(hubX, 0.55, hubZ);
  topeHub.scale.set(0.88, 0.05, 0.88);
  escena.add(topeHub);

  // Holograma 3D central en la Bandeja Orquestadora
  const holoGrupo = new Group();
  holoGrupo.position.set(hubX, 1.15, hubZ);
  const holoCristal = new Mesh(
    regGeo(new OctahedronGeometry(0.34, 0)),
    regMat(
      new MeshStandardMaterial({
        color: '#38BDF8',
        emissive: '#0EA5E9',
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
      }),
    ),
  );
  const holoAnillo = new Mesh(
    regGeo(new TorusGeometry(0.55, 0.025, 12, 48)),
    regMat(new MeshBasicMaterial({ color: '#FACC15' })),
  );
  holoAnillo.rotation.x = Math.PI / 3;
  holoGrupo.add(holoCristal, holoAnillo);
  escena.add(holoGrupo);

  const carpetasHub = new Group();
  carpetasHub.position.set(hubX + 1.38, 0.09, hubZ + 1.28);
  escena.add(carpetasHub);
  carpetasSala.set('hub', carpetasHub);

  const etiquetaHub = crearEtiquetaSprite(
    'Bandeja Orquestadora Central',
    'Orden: Rayo · SLA · Menor carga',
    '#F59E0B',
    '#FDE68A',
    texturas,
    materiales,
  );
  etiquetaHub.position.set(hubX, 2.25, hubZ);
  escena.add(etiquetaHub);

  // 3. Sala de Comité (Escalamiento por SLA vencido + Helipuerto de Drones)
  const comX = 4.8 + 4.6 / 2;
  const comZ = 0.3 + 2.7 / 2;
  const matSueloCom = regMat(new MeshStandardMaterial({ color: '#FFE4E6', roughness: 0.78 }));
  const sueloCom = new Mesh(geoCaja, matSueloCom);
  sueloCom.position.set(comX, 0.07, comZ);
  sueloCom.scale.set(4.6, 0.03, 2.7);
  sueloCom.receiveShadow = true;
  sueloCom.userData = { tipoHit: 'area', id: 'com' };
  escena.add(sueloCom);
  interactivos.push(sueloCom);
  suelosSala.set('com', { mat: matSueloCom, colorBase: '#FFE4E6' });

  crearMuroCristal(comX, 0.3, 4.6, 0.06, 1.05);
  crearMuroCristal(4.8, comZ, 0.06, 2.7, 1.05);

  const mesaComite = new Mesh(
    geoCilindro,
    regMat(new MeshStandardMaterial({ color: '#881337', roughness: 0.35, metalness: 0.3 })),
  );
  mesaComite.position.set(comX, 0.09, comZ);
  mesaComite.scale.set(1.05, 0.42, 1.05);
  mesaComite.castShadow = true;
  mesaComite.userData = { tipoHit: 'area', id: 'com' };
  escena.add(mesaComite);
  interactivos.push(mesaComite);

  const aroComite = new Mesh(
    geoAnillo,
    regMat(new MeshBasicMaterial({ color: '#F43F5E', side: DoubleSide })),
  );
  aroComite.position.set(comX, 0.52, comZ);
  aroComite.scale.setScalar(0.85);
  escena.add(aroComite);

  const etiquetaCom = crearEtiquetaSprite(
    'Sala de Comité Ejecutivo',
    'Recepción de Drones SLA (HU-023)',
    '#F43F5E',
    '#FDA4AF',
    texturas,
    materiales,
  );
  etiquetaCom.position.set(comX, 2.0, comZ);
  escena.add(etiquetaCom);

  // 4. Pórtico de Salida: Cierre en Mi Portal + CSAT
  const exitX = 0.3 + 2.3 / 2;
  const exitZ = 12.4 + 3.2 / 2;
  const matSueloExit = regMat(new MeshStandardMaterial({ color: '#DCFCE7', roughness: 0.8 }));
  const sueloExit = new Mesh(geoCaja, matSueloExit);
  sueloExit.position.set(exitX, 0.07, exitZ);
  sueloExit.scale.set(2.3, 0.03, 3.2);
  sueloExit.receiveShadow = true;
  sueloExit.userData = { tipoHit: 'area', id: 'exit' };
  escena.add(sueloExit);
  interactivos.push(sueloExit);
  suelosSala.set('exit', { mat: matSueloExit, colorBase: '#DCFCE7' });

  const matArco = regMat(
    new MeshStandardMaterial({
      color: '#10B981',
      emissive: '#059669',
      emissiveIntensity: 0.35,
      roughness: 0.3,
    }),
  );
  const pilar1 = new Mesh(geoCaja, matArco);
  pilar1.position.set(0.95, 0.09, 13.1);
  pilar1.scale.set(0.22, 1.6, 0.22);
  const pilar2 = new Mesh(geoCaja, matArco);
  pilar2.position.set(0.95, 0.09, 14.9);
  pilar2.scale.set(0.22, 1.6, 0.22);
  const dintel = new Mesh(geoCaja, matArco);
  dintel.position.set(0.95, 1.68, 14.0);
  dintel.scale.set(0.26, 0.22, 2.08);
  escena.add(pilar1, pilar2, dintel);

  const etiquetaExit = crearEtiquetaSprite(
    'Cierre en Mi Portal',
    'Encuesta CSAT / CES (HU-019)',
    '#10B981',
    '#6EE7B7',
    texturas,
    materiales,
  );
  etiquetaExit.position.set(exitX, 2.2, exitZ);
  escena.add(etiquetaExit);

  // 5. Las 6 Oficinas / Áreas de la Corporación con mobiliario ejecutivo completo
  const matMaderaMesa = regMat(
    new MeshStandardMaterial({ color: '#D97706', roughness: 0.45, metalness: 0.08 }),
  );
  const matPatasMesa = regMat(
    new MeshStandardMaterial({ color: '#1E293B', roughness: 0.4, metalness: 0.6 }),
  );
  const matSilla = regMat(
    new MeshStandardMaterial({ color: '#334155', roughness: 0.5 }),
  );
  const matMonitorCarcasa = regMat(
    new MeshStandardMaterial({ color: '#0F172A', roughness: 0.3, metalness: 0.5 }),
  );
  const matCabeza = regMat(new MeshStandardMaterial({ color: '#FDE68A', roughness: 0.55 }));
  const matCabello = regMat(new MeshStandardMaterial({ color: '#1E293B', roughness: 0.7 }));
  const matEstante = regMat(new MeshStandardMaterial({ color: '#475569', roughness: 0.6 }));

  for (const r of SALAS_OFICINA) {
    const cx = r.x + r.w / 2;
    const cz = r.y + r.d / 2;
    const estilo = ESTILO_SALA[r.k] ?? {
      suelo: '#E0F2FE',
      acento: '#0284C7',
      chaqueta: '#0369A1',
    };

    const matSuelo = regMat(new MeshStandardMaterial({ color: estilo.suelo, roughness: 0.8 }));
    const suelo = new Mesh(geoCaja, matSuelo);
    suelo.position.set(cx, 0.07, cz);
    suelo.scale.set(r.w, 0.03, r.d);
    suelo.receiveShadow = true;
    suelo.userData = { tipoHit: 'area', id: r.k };
    escena.add(suelo);
    interactivos.push(suelo);
    suelosSala.set(r.k, { mat: matSuelo, colorBase: estilo.suelo });

    // Franja de color identificadora del departamento en la entrada de la sala
    const franja = new Mesh(
      geoCaja,
      regMat(new MeshStandardMaterial({ color: estilo.acento, roughness: 0.35 })),
    );
    franja.position.set(cx, 0.086, r.y + r.d - 0.08);
    franja.scale.set(r.w - 0.2, 0.015, 0.12);
    escena.add(franja);

    // Muros de vidrio templado
    crearMuroCristal(cx, r.y, r.w, 0.05, 1.02);
    crearMuroCristal(r.x, cz, 0.05, r.d, 1.02);
    crearMuroCristal(r.x + r.w, cz, 0.05, r.d, 0.36);
    crearMuroCristal(cx, r.y + r.d, r.w, 0.05, 0.36);

    // Estantería / credenza al fondo de la oficina y planta interior
    const credenza = new Mesh(geoCaja, matEstante);
    credenza.position.set(r.x + r.w - 0.42, 0.09, r.y + 0.25);
    credenza.scale.set(0.55, 0.68, 0.26);
    credenza.castShadow = true;
    escena.add(credenza);
    crearPlantaOficina(r.x + 0.28, r.y + r.d - 0.28, 0.85);

    const listaGestores: GestorAnimado[] = [];
    r.gestores.forEach((_nombre, idx) => {
      const dx = r.x + 0.76 + idx * 1.05;
      const dz = r.y + 0.82;

      // Tablero de madera cálida del escritorio + faldón metálico
      const tablero = new Mesh(geoCaja, matMaderaMesa);
      tablero.position.set(dx, 0.38, dz);
      tablero.scale.set(0.92, 0.06, 0.52);
      tablero.castShadow = true;
      tablero.receiveShadow = true;
      tablero.userData = { tipoHit: 'area', id: r.k };
      escena.add(tablero);
      interactivos.push(tablero);

      const baseMesa = new Mesh(geoCaja, matPatasMesa);
      baseMesa.position.set(dx, 0.09, dz);
      baseMesa.scale.set(0.84, 0.29, 0.42);
      baseMesa.castShadow = true;
      escena.add(baseMesa);

      // Doble monitor con pantalla luminosa
      const monitor1 = new Mesh(geoCaja, matMonitorCarcasa);
      monitor1.position.set(dx - 0.16, 0.44, dz - 0.12);
      monitor1.scale.set(0.3, 0.22, 0.04);
      monitor1.rotation.y = 0.15;
      const monitor2 = new Mesh(geoCaja, matMonitorCarcasa);
      monitor2.position.set(dx + 0.16, 0.44, dz - 0.12);
      monitor2.scale.set(0.3, 0.22, 0.04);
      monitor2.rotation.y = -0.15;
      escena.add(monitor1, monitor2);

      const pantallaMat = regMat(
        new MeshStandardMaterial({
          color: estilo.acento,
          emissive: estilo.acento,
          emissiveIntensity: 0.4,
          roughness: 0.2,
        }),
      );
      const luzMonitor = new Mesh(geoCaja, pantallaMat);
      luzMonitor.position.set(dx, 0.46, dz - 0.09);
      luzMonitor.scale.set(0.56, 0.16, 0.02);
      escena.add(luzMonitor);

      // Silla ergonómica
      const asiento = new Mesh(geoCaja, matSilla);
      asiento.position.set(dx, 0.22, dz + 0.54);
      asiento.scale.set(0.34, 0.06, 0.34);
      const respaldo = new Mesh(geoCaja, matSilla);
      respaldo.position.set(dx, 0.28, dz + 0.69);
      respaldo.scale.set(0.32, 0.38, 0.06);
      escena.add(asiento, respaldo);

      // Figura 3D animada del gestor
      const grupoFigura = new Group();
      grupoFigura.position.set(dx, 0.09, dz + 0.52);

      const torsoMat = regMat(
        new MeshStandardMaterial({ color: estilo.chaqueta, roughness: 0.45 }),
      );
      const torso = new Mesh(geoCilindro, torsoMat);
      torso.scale.set(0.19, 0.46, 0.15);
      torso.castShadow = true;
      grupoFigura.add(torso);

      const cabeza = new Mesh(geoEsfera, matCabeza);
      cabeza.position.set(0, 0.6, 0);
      cabeza.scale.setScalar(0.145);
      cabeza.castShadow = true;
      grupoFigura.add(cabeza);

      const cabello = new Mesh(geoEsfera, matCabello);
      cabello.position.set(0, 0.65, -0.02);
      cabello.scale.set(0.15, 0.11, 0.15);
      grupoFigura.add(cabello);

      escena.add(grupoFigura);

      // Aro holográfico de progreso sobre el gestor cuando atiende un ticket
      const aroMat = regMat(
        new MeshBasicMaterial({
          color: '#F59E0B',
          transparent: true,
          opacity: 0,
          side: DoubleSide,
        }),
      );
      const aroMesh = new Mesh(geoAnillo, aroMat);
      aroMesh.position.set(dx, 1.02, dz + 0.52);
      aroMesh.scale.setScalar(0.34);
      escena.add(aroMesh);

      listaGestores.push({
        grupoFigura,
        torsoMat,
        aroMesh,
        aroMat,
        pantallaMat,
        ocupado: false,
        progreso: 0,
        fase: idx * 1.3 + r.x,
      });
    });
    gestoresVisuales.set(r.k, listaGestores);

    const grupoCola = new Group();
    grupoCola.position.set(r.x + r.w - 0.58, 0.09, r.y + r.d - 0.58);
    escena.add(grupoCola);
    carpetasSala.set(r.k, grupoCola);

    const sp = crearEtiquetaSprite(
      r.nombre,
      `${r.gestores.length} asesor${r.gestores.length > 1 ? 'es' : ''} en línea`,
      estilo.acento,
      '#E2E8F0',
      texturas,
      materiales,
    );
    sp.position.set(cx, 1.92, cz);
    escena.add(sp);
  }

  // Contenedor persistente de agentes-ticket y drones con interpolación suave a 60 FPS
  const grupoTickets = new Group();
  escena.add(grupoTickets);
  const mapaTicketsAnimados = new Map<string, NodoTicketAnimado>();

  const crearNodoTicketAnimado = (tk: TicketSimuladoVista): NodoTicketAnimado => {
    const grupo = new Group();
    const alturaInicial = tk.drone ? 1.55 : 0.1;
    grupo.position.set(tk.x, alturaInicial, tk.y);
    grupo.userData = { tipoHit: 'ticket', id: tk.id };

    // Cuerpo tipo cápsula/mensajero 3D con bordes suaves
    const cuerpoMat = regMat(
      new MeshStandardMaterial({
        color: tk.drone ? '#EF4444' : tk.colorTipo,
        emissive: tk.drone ? '#B91C1C' : tk.colorTipo,
        emissiveIntensity: 0.25,
        roughness: 0.25,
        metalness: 0.2,
      }),
    );
    const cuerpoMesh = new Mesh(geoCaja, cuerpoMat);
    cuerpoMesh.scale.set(0.38, 0.34, 0.38);
    cuerpoMesh.castShadow = true;
    cuerpoMesh.userData = grupo.userData;
    grupo.add(cuerpoMesh);

    // Tapa superior luminosa del expediente
    const tapa = new Mesh(
      geoCaja,
      regMat(new MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.3 })),
    );
    tapa.position.set(0, 0.35, 0);
    tapa.scale.set(0.32, 0.05, 0.32);
    tapa.userData = grupo.userData;
    grupo.add(tapa);

    // Aro de SLA en el piso
    const aroMat = regMat(
      new MeshBasicMaterial({
        color: tk.colorSla,
        transparent: true,
        opacity: 0.82,
        side: DoubleSide,
      }),
    );
    const aroMesh = new Mesh(geoAnillo, aroMat);
    aroMesh.position.set(0, 0.015, 0);
    aroMesh.scale.setScalar(0.38);
    grupo.add(aroMesh);

    // Insignia Rayo 3D dorado (HU-ATC-045)
    const rayoGrupo = new Group();
    rayoGrupo.position.set(0, 0.62, 0);
    const matRayo = regMat(
      new MeshStandardMaterial({
        color: '#FACC15',
        emissive: '#EAB308',
        emissiveIntensity: 0.95,
        roughness: 0.15,
        metalness: 0.5,
      }),
    );
    const conoSup = new Mesh(geoCono, matRayo);
    conoSup.scale.set(0.14, 0.24, 0.14);
    conoSup.rotation.z = 0.22;
    const conoInf = new Mesh(geoCono, matRayo);
    conoInf.position.set(0.04, 0.18, 0);
    conoInf.scale.set(0.14, 0.24, 0.14);
    conoInf.rotation.x = Math.PI;
    conoInf.rotation.z = -0.22;
    rayoGrupo.add(conoSup, conoInf);
    rayoGrupo.visible = tk.rayo && !tk.drone;
    grupo.add(rayoGrupo);

    // Cuadricóptero Dron 3D con 4 hélices giratorias (HU-ATC-023)
    const dronGrupo = new Group();
    dronGrupo.position.set(0, 0.42, 0);
    const matChasis = regMat(
      new MeshStandardMaterial({ color: '#1E293B', roughness: 0.3, metalness: 0.7 }),
    );
    const brazo1 = new Mesh(geoCaja, matChasis);
    brazo1.scale.set(0.78, 0.04, 0.07);
    brazo1.rotation.y = Math.PI / 4;
    const brazo2 = new Mesh(geoCaja, matChasis);
    brazo2.scale.set(0.78, 0.04, 0.07);
    brazo2.rotation.y = -Math.PI / 4;
    dronGrupo.add(brazo1, brazo2);

    const baliza = new Mesh(
      geoEsfera,
      regMat(new MeshBasicMaterial({ color: '#FF2E4C' })),
    );
    baliza.position.set(0, 0.08, 0);
    baliza.scale.setScalar(0.09);
    dronGrupo.add(baliza);

    const helices: Mesh[] = [];
    const matHelice = regMat(
      new MeshBasicMaterial({
        color: '#38BDF8',
        transparent: true,
        opacity: 0.75,
        side: DoubleSide,
      }),
    );
    const offsetsRotor: readonly [number, number][] = [
      [0.24, 0.24],
      [-0.24, 0.24],
      [0.24, -0.24],
      [-0.24, -0.24],
    ];
    for (const [rx, rz] of offsetsRotor) {
      const hMesh = new Mesh(geoCaja, matHelice);
      hMesh.position.set(rx, 0.06, rz);
      hMesh.scale.set(0.24, 0.015, 0.045);
      dronGrupo.add(hMesh);
      helices.push(hMesh);
    }
    dronGrupo.visible = Boolean(tk.drone);
    grupo.add(dronGrupo);

    grupoTickets.add(grupo);
    return {
      id: tk.id,
      grupo,
      cuerpoMesh,
      cuerpoMat,
      aroMesh,
      aroMat,
      rayoGrupo,
      dronGrupo,
      helices,
      posActual: new Vector3(tk.x, alturaInicial, tk.y),
      posMeta: new Vector3(tk.x, alturaInicial, tk.y),
      fase: Math.random() * Math.PI * 2,
      esDrone: Boolean(tk.drone),
      tieneRayo: tk.rayo,
      seleccionado: false,
    };
  };

  const actualizarPilaCarpetas = (grupo: Group, cantidad: number, colorHex: string): void => {
    while (grupo.children.length > 0) {
      grupo.remove(grupo.children[0]);
    }
    const tope = Math.min(12, cantidad);
    const mat = regMat(new MeshStandardMaterial({ color: colorHex, roughness: 0.45 }));
    for (let i = 0; i < tope; i++) {
      const lv = Math.floor(i / 4);
      const fila = Math.floor((i % 4) / 2);
      const col = i % 2;
      const m = new Mesh(geoCaja, mat);
      m.position.set(col * 0.26, lv * 0.12, fila * 0.26);
      m.scale.set(0.22, 0.09, 0.22);
      grupo.add(m);
    }
  };

  const sincronizar = (estado: EstadoEscenaOficina): void => {
    // 1. Suelos resaltados según área seleccionada
    for (const [k, info] of suelosSala.entries()) {
      const elegida = estado.areaSeleccionada === k;
      if (elegida) {
        info.mat.color.set('#FEF08A');
      } else if (k === 'com' && estado.escaladosComite > 0) {
        info.mat.color.set('#FECDD3');
      } else {
        info.mat.color.set(info.colorBase);
      }
    }

    // 2. Carpetas en el Atrio
    const hubGroup = carpetasSala.get('hub');
    if (hubGroup) actualizarPilaCarpetas(hubGroup, estado.enBandeja, '#F59E0B');

    // 3. Salas: gestores y colas
    for (const sala of estado.salas) {
      const gVis = gestoresVisuales.get(sala.k) ?? [];
      const estilo = ESTILO_SALA[sala.k] ?? {
        suelo: '#E0F2FE',
        acento: '#0284C7',
        chaqueta: '#0369A1',
      };
      sala.gestores.forEach((gv, idx) => {
        const item = gVis[idx];
        if (!item) return;
        item.ocupado = gv.ocupado;
        item.progreso = gv.progreso;
        item.torsoMat.color.set(gv.ocupado ? '#F59E0B' : estilo.chaqueta);
        item.aroMat.opacity = gv.ocupado ? 0.92 : 0;
        item.pantallaMat.emissiveIntensity = gv.ocupado ? 0.95 : 0.35;
      });
      const cGroup = carpetasSala.get(sala.k);
      if (cGroup) {
        actualizarPilaCarpetas(cGroup, sala.enCola, sala.enRiesgo ? '#EF4444' : estilo.acento);
      }
    }

    // 4. Sincronizar objetivos de los tickets sin destruir sus nodos 3D (interpolación suave)
    const idsPresentes = new Set<string>();
    for (const tk of estado.tickets) {
      if (!tk.vis) continue;
      idsPresentes.add(tk.id);

      let nodoAnim = mapaTicketsAnimados.get(tk.id);
      if (!nodoAnim) {
        nodoAnim = crearNodoTicketAnimado(tk);
        mapaTicketsAnimados.set(tk.id, nodoAnim);
      }

      const alturaMeta = tk.drone ? 1.65 : 0.1;
      nodoAnim.posMeta.set(tk.x, alturaMeta, tk.y);
      nodoAnim.esDrone = Boolean(tk.drone);
      nodoAnim.tieneRayo = tk.rayo;
      nodoAnim.seleccionado = tk.id === estado.ticketSeleccionadoId;

      const colCuerpo = tk.drone ? '#EF4444' : tk.colorTipo;
      nodoAnim.cuerpoMat.color.set(colCuerpo);
      nodoAnim.cuerpoMat.emissive.set(colCuerpo);
      nodoAnim.cuerpoMat.emissiveIntensity = nodoAnim.seleccionado ? 0.65 : 0.25;

      nodoAnim.aroMat.color.set(tk.colorSla);
      nodoAnim.aroMat.opacity = tk.drone ? 0 : nodoAnim.seleccionado ? 0.98 : 0.78;
      nodoAnim.aroMesh.scale.setScalar(nodoAnim.seleccionado ? 0.52 : 0.36);

      nodoAnim.rayoGrupo.visible = tk.rayo && !tk.drone;
      nodoAnim.dronGrupo.visible = Boolean(tk.drone);
    }

    // Retirar tickets que ya salieron de la simulación
    for (const [id, nodoAnim] of mapaTicketsAnimados.entries()) {
      if (!idsPresentes.has(id)) {
        grupoTickets.remove(nodoAnim.grupo);
        mapaTicketsAnimados.delete(id);
      }
    }
  };

  const centrarEnArea = (areaKey: string): void => {
    if (areaKey === 'hub' || areaKey === 'bandeja') {
      metaCamaraTarget.set(hubX, 0.4, hubZ);
    } else if (areaKey === 'com' || areaKey === 'comite') {
      metaCamaraTarget.set(comX, 0.4, comZ);
    } else if (areaKey === 'exit') {
      metaCamaraTarget.set(exitX, 0.4, exitZ);
    } else {
      const r = SALAS_OFICINA.find((s) => s.k === areaKey);
      if (r) metaCamaraTarget.set(r.x + r.w / 2, 0.4, r.y + r.d / 2);
    }
  };

  // Raycasting para seleccionar cubos-ticket, oficinas o canales de entrada
  const raycaster = new Raycaster();
  const puntero = new Vector2();
  let inicioPuntero: { x: number; y: number } | null = null;

  const alBajarPuntero = (e: PointerEvent): void => {
    inicioPuntero = { x: e.clientX, y: e.clientY };
  };

  const alSubirPuntero = (e: PointerEvent): void => {
    if (!inicioPuntero) return;
    if (Math.hypot(e.clientX - inicioPuntero.x, e.clientY - inicioPuntero.y) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    puntero.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    puntero.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(puntero, camara);

    const hitsTicket = raycaster.intersectObjects(grupoTickets.children, true);
    if (hitsTicket.length > 0) {
      let obj: Object3D | null = hitsTicket[0].object;
      while (obj && !obj.userData?.['tipoHit']) obj = obj.parent;
      if (obj?.userData?.['tipoHit'] === 'ticket') {
        eventos.alSeleccionarTicket(String(obj.userData['id']));
        return;
      }
    }

    const hits = raycaster.intersectObjects(interactivos, true);
    if (hits.length > 0) {
      const data = hits[0].object.userData;
      if (data?.['tipoHit'] === 'gate') {
        eventos.alCrearPorCanal(String(data['id']));
      } else if (data?.['tipoHit'] === 'area') {
        eventos.alSeleccionarArea(String(data['id']));
      }
    }
  };

  renderer.domElement.addEventListener('pointerdown', alBajarPuntero);
  renderer.domElement.addEventListener('pointerup', alSubirPuntero);

  const redimensionar = (): void => {
    const w = Math.max(300, contenedor.clientWidth);
    const h = Math.max(420, contenedor.clientHeight || 560);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  redimensionar();
  const obsResize = new ResizeObserver(redimensionar);
  obsResize.observe(contenedor);

  const reloj = new Clock();
  let rafId = 0;
  let destruido = false;

  const animar = (): void => {
    if (destruido) return;
    rafId = requestAnimationFrame(animar);

    const dt = Math.min(reloj.getDelta(), 0.05);
    const t = reloj.getElapsedTime();

    // 1. Rotación suave del holograma central de la Bandeja Orquestadora
    holoCristal.rotation.y += dt * 0.95;
    holoCristal.rotation.x += dt * 0.45;
    holoAnillo.rotation.z -= dt * 1.25;
    holoGrupo.position.y = 1.15 + Math.sin(t * 2.2) * 0.08;

    // 2. Animación orgánica a 60 FPS de los asesores en sus escritorios
    for (const lista of gestoresVisuales.values()) {
      for (const g of lista) {
        if (g.ocupado) {
          g.grupoFigura.rotation.y = Math.sin(t * 3.2 + g.fase) * 0.16;
          g.grupoFigura.position.y = 0.09 + Math.abs(Math.sin(t * 4.5 + g.fase)) * 0.025;
          g.aroMesh.rotation.z += dt * 1.8;
        } else {
          g.grupoFigura.rotation.y = Math.sin(t * 1.1 + g.fase) * 0.05;
          g.grupoFigura.position.y = 0.09;
        }
      }
    }

    // 3. Interpolación continua a 60 FPS de todos los tickets, rayos y drones
    const factorLerp = Math.min(1, dt * 8.5);
    for (const nodo of mapaTicketsAnimados.values()) {
      const dx = nodo.posMeta.x - nodo.posActual.x;
      const dz = nodo.posMeta.z - nodo.posActual.z;
      const dist = Math.hypot(dx, dz);

      nodo.posActual.lerp(nodo.posMeta, factorLerp);

      // Movimiento vertical orgánico: zancada suave al desplazarse o vuelo de dron
      const bobbing = nodo.esDrone
        ? Math.sin(t * 5.5 + nodo.fase) * 0.14
        : dist > 0.04
          ? Math.abs(Math.sin(t * 9.5 + nodo.fase)) * 0.08
          : Math.sin(t * 2.6 + nodo.fase) * 0.02;

      nodo.grupo.position.set(
        nodo.posActual.x,
        nodo.posActual.y + bobbing,
        nodo.posActual.z,
      );

      // Orientación suave hacia la dirección de avance
      if (dist > 0.03) {
        const anguloMeta = Math.atan2(dx, dz);
        nodo.cuerpoMesh.rotation.y = anguloMeta;
      }

      // Rotación del Rayo de prioridad 3D
      if (nodo.tieneRayo && !nodo.esDrone) {
        nodo.rayoGrupo.rotation.y += dt * 3.4;
        nodo.rayoGrupo.position.y = 0.62 + Math.sin(t * 5 + nodo.fase) * 0.05;
      }

      // Giro de alta velocidad de las 4 hélices del Dron de escalamiento
      if (nodo.esDrone) {
        for (const h of nodo.helices) {
          h.rotation.y += dt * 28;
        }
      }
    }

    // 4. Transición suave del foco de cámara
    controles.target.lerp(metaCamaraTarget, Math.min(1, dt * 5.0));
    controles.update();
    renderer.render(escena, camara);
  };
  animar();

  return {
    sincronizar,
    centrarEnArea,
    dispose(): void {
      destruido = true;
      cancelAnimationFrame(rafId);
      obsResize.disconnect();
      renderer.domElement.removeEventListener('pointerdown', alBajarPuntero);
      renderer.domElement.removeEventListener('pointerup', alSubirPuntero);
      controles.dispose();
      for (const g of geometrias) g.dispose();
      for (const m of materiales) m.dispose();
      for (const t of texturas) t.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
