"""Tigo con boca (ola 4, frente D2): public/media/tigo/modelos/tigo-propuesta.glb a partir del tigo.glb aprobado.

No vuelve a modelar a Tigo: abre el tigo.glb aprobado (la misma malla, la misma textura de 1024 px, los mismos 53
huesos y los 4 clips) y le agrega solo lo que hace falta para que hable y parpadee:

- Hueso `DEF-jaw` (hijo de `DEF-head`), con su pivote dentro del hocico, detrás de la boca. Girarlo sobre su eje X
  local en sentido positivo ABRE la boca (guia.js: `quaternion = reposo · eje(X, 0.32 · apertura)`).
- Un corte en la piel justo sobre la «w» pintada de la boca (la misma curva de modelo-tigo.py → mapa_cara): el labio
  de arriba se queda con `DEF-head` y el de abajo, la barbilla y el hocico bajo pasan a `DEF-jaw` (con un degradé a
  los cachetes y bajo la barbilla). Los bordes del corte se doblan hacia adentro (5 mm) para que el labio tenga
  grosor, y llevan el trazo oscuro de la «w», así que con la boca cerrada no se nota el corte.
- Malla `boca_interior` (otro nodo, con piel): el fondo de la boca (rojo oscuro, #4A1512) y la lengua (#E66F68), en
  colores de vértice y un solo material `tigo-boca`. Queda dentro de la cabeza: con la boca cerrada no se ve (guia.js
  igual la oculta hasta que la boca abre).
- Shape key `parpadeo` en `tigo-malla` (se exporta como morph target): dos párpados de pelaje (con la textura de
  arriba del ojo y una línea oscura de pestañas abajo) que bajan sobre los ojos mientras los ojos se aplanan.
  0 = ojos abiertos, 1 = cerrados.

No agrega clips: si un clip animara `DEF-jaw`, guia.js compondría su apertura sobre ese clip (mandibulaAnimada) y los
clips que no la animan la dejarían girar sin control. La boca y el parpadeo los mueve el código (voz.js / guia.js).

Uso (desde la raíz del repo; Blender 5.2 sin interfaz):
    blender -b --factory-startup --python scripts/tigo/modelo-tigo-boca.py
    blender -b --factory-startup --python scripts/tigo/modelo-tigo-boca.py -- --render docs/superpowers/plans/progreso/capturas
    opciones:  --entrada RUTA    GLB de partida (por defecto public/media/tigo/modelos/tigo.glb)
               --salida RUTA     GLB de salida (por defecto public/media/tigo/modelos/tigo-propuesta.glb)
               --render DIR      además saca las capturas ola4-D2-*.png en DIR
               --tmp DIR         carpeta de trabajo (por defecto <tmp>/tigo-boca-d2; los .blend se llaman tigo-boca-*.blend)
               --sin-optimizar   deja solo el GLB crudo de Blender en la carpeta de trabajo
Requiere Node y @gltf-transform/cli@4 (con @gltf-transform/core, extensions, functions y meshoptimizer) en la caché
de npx (~/.npm/_npx): no descarga nada. Determinista (no hay azar).
NO escribe tigo.glb: la página lo carga solo; se renombra cuando el usuario aprueba la propuesta (decisión D3).
Todo lo agregado es propio de Aybar (todos los derechos reservados); no usa assets de terceros.
"""
import argparse
import glob
import math
import os
import subprocess
import sys
import tempfile

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree
from mathutils.interpolate import poly_3d_calc

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MODELOS = os.path.join(RAIZ, 'public', 'media', 'tigo', 'modelos')
ENTRADA = os.path.join(MODELOS, 'tigo.glb')
SALIDA = os.path.join(MODELOS, 'tigo-propuesta.glb')
CLIPS = ['Idle_Loop', 'Walk_Loop', 'Idle_Talking_Loop', 'Jog_Fwd_Loop']

# Medidas de modelo-tigo.py (no cambian: la textura se horneó con ellas).
CABEZA_C = Vector((0.0, -0.012, 0.755))
R0 = 0.18                                  # «metros de cara» = ángulo desde el centro de la cabeza × R0
OJO_AZ, OJO_EL, OJO_RX, OJO_RY, OJO_Z = 21.0, 1.5, 0.0285, 0.037, 0.0125
# La «w» de la boca en metros de cara (mapa_cara): del centro (0, −0.081) a la comisura (±0.047, −0.085).
W_BEZIER = [(0.0, -0.081), (0.012, -0.097), (0.036, -0.098), (0.047, -0.085)]
COMISURA_U = 0.047

GIRO_PRUEBA = 0.32        # rad: el GIRO_MANDIBULA de guia.js (boca del todo abierta) para las capturas
LABIO_GROSOR = 0.0025     # m: cuánto se doblan hacia adentro los bordes del corte
COLOR_BOCA, COLOR_FONDO, COLOR_LENGUA = '#8E2B2B', '#3A0E0D', '#E66F68'


def args():
    p = argparse.ArgumentParser()
    p.add_argument('--entrada', default=ENTRADA)
    p.add_argument('--salida', default=SALIDA)
    p.add_argument('--render', default=None)
    p.add_argument('--tmp', default=os.path.join(tempfile.gettempdir(), 'tigo-boca-d2'))
    p.add_argument('--sin-optimizar', action='store_true')
    a = p.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    if os.path.basename(a.salida) == 'tigo.glb':
        sys.exit('No escribo tigo.glb: la página lo cargaría sola. Usa tigo-propuesta.glb y renómbralo al aprobarlo.')
    os.makedirs(a.tmp, exist_ok=True)
    return a


def log(*m):
    print('[tigo-boca]', *m, flush=True)


def hex_lineal(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def suave(x, a, b):
    """smoothstep de a a b (a > b vale: baja)."""
    t = np.clip((np.asarray(x, dtype=float) - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


# ================================================================================================ node / gltf-transform
def modulos_npx():
    for d in sorted(glob.glob(os.path.expanduser('~/.npm/_npx/*/node_modules'))):
        if all(os.path.isdir(os.path.join(d, x)) for x in ('@gltf-transform/core', '@gltf-transform/extensions',
                                                              '@gltf-transform/functions', 'meshoptimizer')):
            return d
    sys.exit('Falta @gltf-transform/cli@4 en la caché de npx (npx -y @gltf-transform/cli@4 --version una vez).')


DECODIFICAR_JS = r"""
const NM = process.argv[2];
const { NodeIO } = await import(NM + '/@gltf-transform/core/dist/index.js');
const { ALL_EXTENSIONS } = await import(NM + '/@gltf-transform/extensions/dist/index.js');
const { dequantize } = await import(NM + '/@gltf-transform/functions/dist/index.js');
const { MeshoptDecoder } = await import(NM + '/meshoptimizer/index.js');
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[3]);
for (const e of doc.getRoot().listExtensionsUsed()) if (e.extensionName === 'EXT_meshopt_compression') e.dispose();
await doc.transform(dequantize());
for (const e of doc.getRoot().listExtensionsUsed()) if (e.extensionName === 'KHR_mesh_quantization') e.dispose();
await io.write(process.argv[4], doc);
"""

# Vuelve a poner la textura JPEG original (Blender la recodificaría) en el GLB crudo exportado y quita DEF-jaw de los clips.
TEXTURA_JS = r"""
const NM = process.argv[2];
const { NodeIO } = await import(NM + '/@gltf-transform/core/dist/index.js');
const { ALL_EXTENSIONS } = await import(NM + '/@gltf-transform/extensions/dist/index.js');
const { MeshoptDecoder } = await import(NM + '/meshoptimizer/index.js');
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const original = await io.read(process.argv[3]);
const doc = await io.read(process.argv[4]);
const t0 = original.getRoot().listTextures()[0];
for (const t of doc.getRoot().listTextures()) if (t.getName() === t0.getName()) { t.setImage(t0.getImage()); t.setMimeType(t0.getMimeType()); }
// export_force_sampling mete canales de DEF-jaw (constantes) en los 4 clips: se quitan, la mandíbula la mueve el código
for (const a of doc.getRoot().listAnimations())
    for (const c of a.listChannels())
        if (c.getTargetNode() && c.getTargetNode().getName() === 'DEF-jaw') { const s = c.getSampler(); c.dispose(); if (s && !s.listParents().some((p) => p.propertyType === 'AnimationChannel')) s.dispose(); }
await io.write(process.argv[4], doc);
"""


def node(js, carpeta, *argumentos):
    ruta = os.path.join(carpeta, 'tigo-boca-%x.mjs' % (abs(hash(js)) & 0xffff))
    with open(ruta, 'w') as f:
        f.write(js)
    r = subprocess.run(['node', ruta, modulos_npx(), *argumentos], capture_output=True, text=True)
    if r.returncode:
        sys.exit('node falló: %s' % r.stderr[-800:])


def gltf_transform():
    for b in sorted(glob.glob(os.path.expanduser('~/.npm/_npx/*/node_modules/.bin/gltf-transform'))):
        try:
            v = subprocess.run([b, '--version'], capture_output=True, text=True, timeout=60).stdout.strip()
        except Exception:
            continue
        if v.startswith('4'):
            return [b]
    return ['npx', '--offline', '-y', '@gltf-transform/cli@4']


def optimizar(crudo, final, carpeta):
    """weld + dedup + prune + meshopt (EXT_meshopt_compression + cuantización), como modelo-tigo.py."""
    gt = gltf_transform()
    env = dict(os.environ, npm_config_prefer_offline='true')
    o = lambda n: os.path.join(carpeta, 'tigo-boca-o%d.glb' % n)  # noqa: E731
    pasos = [['weld', crudo, o(1)], ['dedup', o(1), o(2)], ['prune', o(2), o(3)],
             ['meshopt', o(3), final, '--level', 'medium']]
    for p in pasos:
        r = subprocess.run(gt + p, env=env, capture_output=True, text=True)
        if r.returncode:
            sys.exit('gltf-transform falló en %s: %s' % (p[0], r.stderr[-600:]))
    log('optimizado: %d KB → %d KB (%s)' % (os.path.getsize(crudo) // 1024, os.path.getsize(final) // 1024, final))


# ================================================================================================ carga
def cargar(ruta_plana):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=ruta_plana)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    malla = bpy.data.objects['tigo-malla']
    for o in list(bpy.data.objects):          # la esfera que el importador crea para dibujar los huesos
        if o not in (arm, malla):
            bpy.data.objects.remove(o, do_unlink=True)
    ad = arm.animation_data
    ad.action = None
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix()
    bpy.context.view_layer.update()
    return arm, malla


# ================================================================================================ coordenadas de cara
def uv_cara(P):
    """(U, V) en metros de cara de un punto (en reposo): ángulos desde el centro de la cabeza × R0."""
    d = Vector(P) - CABEZA_C
    az = math.atan2(d.x, -d.y)
    el = math.atan2(d.z, math.hypot(d.x, d.y))
    return az * math.cos(el) * R0, el * R0


def direccion_cara(U, V):
    el = V / R0
    az = U / (R0 * math.cos(el))
    return Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))


def bezier(p, n):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = (np.array(x) for x in p)
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3


def curva_boca(n=9):
    """La «w» de la comisura izquierda (−U) a la derecha (+U), pasando por el centro."""
    medio = bezier(W_BEZIER, n)                   # de 0 a +0.047
    izq = medio[::-1] * (-1, 1)
    return np.vstack([izq[:-1], medio])


CURVA = curva_boca()


def v_linea(U):
    """V de la línea de la boca bajo U (más allá de las comisuras, horizontal a la altura de la comisura)."""
    U = np.clip(np.abs(U), 0, COMISURA_U)
    m = CURVA[CURVA[:, 0] >= -1e-9]
    return np.interp(U, m[:, 0], m[:, 1])


# ================================================================================================ mandíbula
def puntos_cabeza(malla):
    """Índices de los vértices de la cabeza (rígidos a DEF-head) y BVH solo con el pelaje de la cabeza."""
    gi = malla.vertex_groups['DEF-head'].index
    cab = np.zeros(len(malla.data.vertices), bool)
    for v in malla.data.vertices:
        for g in v.groups:
            if g.group == gi and g.weight > 0.999:
                cab[v.index] = True
    return cab


def bvh_pelaje_cabeza(malla, cab):
    bm = bmesh.new()
    bm.from_mesh(malla.data)
    quitar = [f for f in bm.faces if f.material_index != 0 or not all(cab[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=quitar, context='FACES')
    bm.faces.ensure_lookup_table()
    return BVHTree.FromBMesh(bm), bm


def golpe(bvh, origen, d):
    hit, n, i, _ = bvh.ray_cast(Vector(origen), Vector(d).normalized())
    if hit is None:
        raise RuntimeError('el rayo no toca la cabeza: %s' % (tuple(d),))
    return hit, n.normalized(), i


def agregar_mandibula(arm, bvh):
    """DEF-jaw: pivote 6.5 cm detrás del centro de la boca y 1.2 cm más arriba, apuntando a la barbilla; su eje X
    local es +X del mundo (izquierda de Tigo), así un giro positivo baja la barbilla."""
    boca, n, _ = golpe(bvh, CABEZA_C, direccion_cara(0.0, -0.09))
    atras = Vector((0, 1, 0))
    pivote = boca + atras * 0.065 + Vector((0, 0, 0.012))
    barbilla, _, _ = golpe(bvh, CABEZA_C, direccion_cara(0.0, -0.13))
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones.new('DEF-jaw')
    eb.head = pivote
    eb.tail = barbilla - n * 0.01
    eb.parent = arm.data.edit_bones['DEF-head']
    eb.use_connect = False
    eb.use_deform = True
    eb.roll = 0.0
    if eb.matrix.to_3x3().col[0].x < 0:
        eb.roll = math.pi
    x = eb.matrix.to_3x3().col[0]
    bpy.ops.object.mode_set(mode='OBJECT')
    if x.x < 0.99:
        raise RuntimeError('DEF-jaw: el eje X local no quedó en +X (%s)' % (tuple(x),))
    log('DEF-jaw: pivote %s, eje X %s' % (tuple(round(c, 4) for c in pivote), tuple(round(c, 3) for c in x)))
    return pivote


def cortar_boca(malla, cab):
    """Corta la piel sobre la «w» (planos por el centro de la cabeza entre puntos seguidos de la curva), abre el corte
    y devuelve el bmesh con las listas de vértices de cada labio."""
    me = malla.data
    bm = bmesh.new()
    bm.from_mesh(me)
    capa_cab = bm.verts.layers.int.new('cabeza')
    for v in bm.verts:
        v[capa_cab] = int(cab[v.index])
    C = CABEZA_C

    def es_cabeza(f):
        return f.material_index == 0 and all(v[capa_cab] for v in f.verts)

    dirs = [direccion_cara(u, v) for u, v in CURVA]
    for i in range(len(CURVA) - 1):
        u0, u1 = CURVA[i][0], CURVA[i + 1][0]
        normal = dirs[i].cross(dirs[i + 1]).normalized()
        caras = []
        for f in bm.faces:
            if not es_cabeza(f):
                continue
            c = f.calc_center_median()
            if c.y > C.y - 0.05:
                continue
            U, V = uv_cara(c)
            if min(u0, u1) - 0.004 <= U <= max(u0, u1) + 0.004 and abs(V - v_linea(U)) < 0.012:
                caras.append(f)
        if not caras:
            raise RuntimeError('no hay caras para el tramo %d de la boca' % i)
        geom = list({e for f in caras for e in f.edges}) + list({v for f in caras for v in f.verts}) + caras
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=C, plane_no=normal, dist=1e-6)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
    for v in bm.verts:   # los vértices nuevos del corte heredan la marca de cabeza de su arista
        if not v[capa_cab] and v.link_faces and all(es_cabeza_parcial(f, capa_cab) for f in v.link_faces):
            v[capa_cab] = 1
    bm.verts.ensure_lookup_table()

    # camino de aristas sobre la curva, de comisura a comisura
    def cerca(v):
        U, V = uv_cara(v.co)
        return abs(U) <= COMISURA_U + 0.0006 and abs(V - v_linea(U)) < 0.0012 and v.co.y < C.y - 0.05
    cand = {v for v in bm.verts if v[capa_cab] and cerca(v)}
    ady = {v: [] for v in cand}
    for e in bm.edges:
        a, b = e.verts
        if a in cand and b in cand:
            m = (a.co + b.co) / 2
            U, V = uv_cara(m)
            if abs(V - v_linea(U)) < 0.0012:
                ady[a].append((b, e))
                ady[b].append((a, e))

    def mas_cerca(U, V):
        return min(cand, key=lambda v: (Vector(uv_cara(v.co)) - Vector((U, V))).length)
    ini, fin = mas_cerca(*CURVA[0]), mas_cerca(*CURVA[-1])
    import heapq
    dist, prev, cola = {ini: 0.0}, {}, [(0.0, id(ini), ini)]
    while cola:
        d, _, v = heapq.heappop(cola)
        if v is fin:
            break
        if d > dist.get(v, 1e9):
            continue
        for w, e in ady[v]:
            nd = d + e.calc_length()
            if nd < dist.get(w, 1e9):
                dist[w], prev[w] = nd, (v, e)
                heapq.heappush(cola, (nd, id(w), w))
    if fin not in prev:
        raise RuntimeError('el corte de la boca no une las comisuras')
    camino, v = [], fin
    while v is not ini:
        v, e = prev[v]
        camino.append(e)
    largo = sum(e.calc_length() for e in camino)
    log('corte de la boca: %d aristas, %.1f cm' % (len(camino), largo * 100))
    r = bmesh.ops.split_edges(bm, edges=camino)
    borde = [e for e in r['edges'] if e.is_boundary]
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    # labios: el borde del corte es un lazo de comisura a comisura; se recorre por los dos lados
    sale = {}
    for e in borde:
        for v in e.verts:
            sale.setdefault(v, []).append(e)
    cadenas = []
    for e0 in sale[ini]:
        cadena, v, e = [e0], e0.other_vert(ini), e0
        while v is not fin:
            e = next(x for x in sale[v] if x is not e)
            cadena.append(e)
            v = e.other_vert(v)
        cadenas.append(cadena)
    if len(cadenas) != 2:
        raise RuntimeError('el corte no dejó dos labios (%d)' % len(cadenas))

    def altura(cadena):   # V medio del vértice opuesto de cada cara del labio
        vs = []
        for e in cadena:
            f = e.link_faces[0]
            o = next(v for v in f.verts if v not in e.verts)
            U, V = uv_cara(o.co)
            vs.append(V - v_linea(U))
        return np.mean(vs)
    labio_arriba, labio_abajo = sorted(cadenas, key=altura, reverse=True)
    log('labios: %d aristas arriba, %d abajo' % (len(labio_arriba), len(labio_abajo)))
    return bm, capa_cab, labio_arriba, labio_abajo, ini, fin



def es_cabeza_parcial(f, capa):
    return f.material_index == 0 and sum(v[capa] for v in f.verts) >= 2


def engrosar_labios(bm, labios, uv_oscuro):
    """Dobla los bordes del corte hacia adentro (LABIO_GROSOR): el labio tiene grosor y el color del trazo oscuro de
    la «w» (todo el borde con la UV de un punto del trazo)."""
    bm.normal_update()
    uvl = bm.loops.layers.uv.active
    for aristas in labios:
        r = bmesh.ops.extrude_edge_only(bm, edges=aristas)
        for f in r['geom']:
            if isinstance(f, bmesh.types.BMFace):
                for l in f.loops:
                    l[uvl].uv = uv_oscuro
        nuevos = [g for g in r['geom'] if isinstance(g, bmesh.types.BMVert)]
        for v in nuevos:
            viejo = next(e.other_vert(v) for e in v.link_edges if e.other_vert(v) not in nuevos)
            n = viejo.normal if viejo.normal.length > 0.5 else (viejo.co - CABEZA_C).normalized()
            v.co = viejo.co - n * LABIO_GROSOR
    bm.normal_update()


def pesos_mandibula(bm, capa_cab, labio_arriba, labio_abajo):
    """Peso de DEF-jaw en la cabeza: 1 en el labio de abajo, la barbilla y el hocico bajo; degradé hacia los
    cachetes (|U| 0.03 → 0.085) y bajo la barbilla; 0 en todo lo que está arriba de la boca."""
    dl = bm.verts.layers.deform.verify()
    grupos = {g.name: g.index for g in bpy.data.objects['tigo-malla'].vertex_groups}
    gi_cab, gi_jaw = grupos['DEF-head'], grupos['DEF-jaw']
    arriba = {v for e in labio_arriba for v in e.verts}
    abajo_l = {v for e in labio_abajo for v in e.verts} - arriba      # sin las comisuras
    total = 0
    for v in bm.verts:
        if not v[capa_cab]:
            continue
        U, V = uv_cara(v.co)
        if v in arriba:
            abajo = 0.0
        elif v in abajo_l:
            abajo = 1.0
        elif abs(U) <= COMISURA_U:
            abajo = 1.0 if V < v_linea(U) else 0.0
        else:
            abajo = float(suave(v_linea(U) - V, 0.003, 0.02))
        d = v.co - CABEZA_C
        el = math.degrees(math.atan2(d.z, math.hypot(d.x, d.y)))
        w = abajo * float(1 - suave(abs(U), 0.03, 0.085)) * float(suave(el, -78, -52)) * float(suave(v.co.y, CABEZA_C.y + 0.01, CABEZA_C.y - 0.06))
        if w < 0.004:
            continue
        dv = v[dl]
        dv[gi_cab] = 1.0 - w
        dv[gi_jaw] = w
        total += 1
    log('vértices con peso de mandíbula: %d' % total)


# ================================================================================================ boca interior
def boca_interior(bvh, arm, pivote):
    """Fondo de la boca (cuenco abierto hacia el frente, caras hacia adentro) + lengua, dentro de la cabeza."""
    centro_sup, n, _ = golpe(bvh, CABEZA_C, direccion_cara(0.0, -0.092))
    fr = Vector((0, -1, 0))                       # frente de Tigo
    ar = Vector((0, 0, 1))
    lat = Vector((1, 0, 0))
    B = centro_sup - fr * 0.006
    bm = bmesh.new()
    col = bm.loops.layers.color.new('Color')
    tipo = {}
    # cuenco: anillos desde el borde (frente) al fondo; 12 por vuelta
    RX, RZ, PROF = 0.07, 0.042, 0.05
    anillos, vuelta = 3, 8
    filas = []
    for k in range(anillos + 1):
        t = k / anillos                            # 0 = borde, 1 = fondo
        ang = t * math.pi / 2                     # del ecuador (el borde, que abraza la boca) al polo de atrás
        f = []
        if k == anillos:
            v = bm.verts.new(B - fr * PROF)
            f = [v] * vuelta
        else:
            for j in range(vuelta):
                a = 2 * math.pi * j / vuelta
                r = math.cos(ang)
                p = B + lat * (RX * r * math.cos(a)) + ar * (RZ * r * math.sin(a)) - fr * (PROF * math.sin(ang) - 0.02)
                f.append(bm.verts.new(p))
        filas.append(f)
    for k in range(anillos):
        for j in range(vuelta):
            a, b = filas[k][j], filas[k][(j + 1) % vuelta]
            c, d = filas[k + 1][(j + 1) % vuelta], filas[k + 1][j]
            vs = [a, d, c, b] if k + 1 < anillos else [a, d, b]
            vs = list(dict.fromkeys(vs))
            cara = bm.faces.new(vs)
            tipo[cara] = 'fondo'
    # que el cuenco no salga de la cabeza: cada vértice al menos 2.5 mm por dentro de la piel
    for v in bm.verts:
        for _ in range(12):
            q, nq, _, _ = bvh.find_nearest(v.co)
            if q is None or (v.co - q).dot(nq) < -0.0025:
                break
            v.co = q - nq * 0.003
    # lengua: elipsoide aplastado sobre el piso del cuenco, la punta hacia la boca
    L0 = B - ar * 0.013 - fr * 0.008
    lb = bmesh.ops.create_uvsphere(bm, u_segments=6, v_segments=4, radius=1.0)
    for v in lb['verts']:
        p = v.co.copy()
        v.co = L0 + lat * (p.x * 0.03) + fr * (p.y * 0.03) + ar * (p.z * 0.009 + (0.004 if p.z > 0 else 0))
    lengua_v = set(lb['verts'])
    for v in lengua_v:
        for _ in range(16):
            q, nq, _, _ = bvh.find_nearest(v.co)
            if q is None or (v.co - q).dot(nq) < -0.004:
                break
            v.co = q - nq * 0.0045
    for f in bm.faces:
        if f not in tipo:
            tipo[f] = 'lengua'
    bm.normal_update()
    for f, t in tipo.items():       # el cuenco mira hacia adentro
        if t == 'fondo' and f.normal.dot(B - fr * 0.02 - f.calc_center_median()) < 0:
            f.normal_flip()
    fondo, boca, lengua = hex_lineal(COLOR_FONDO), hex_lineal(COLOR_BOCA), hex_lineal(COLOR_LENGUA)
    for f, t in tipo.items():
        for l in f.loops:
            if t == 'lengua':
                c = lengua
            else:
                k = min(1.0, max(0.0, (B - l.vert.co).dot(fr) / PROF))
                c = tuple(boca[i] * (1 - k) + fondo[i] * k for i in range(3))
            l[col] = (*c, 1.0)
    me = bpy.data.meshes.new('boca_interior')
    bm.to_mesh(me)
    vs_lengua = [v.index for v in bm.verts if v in lengua_v]
    alturas = [(v.index, (v.co - B).dot(ar)) for v in bm.verts]
    bm.free()
    me.shade_smooth()
    ob = bpy.data.objects.new('boca_interior', me)
    bpy.context.scene.collection.objects.link(ob)
    mat = bpy.data.materials.new('tigo-boca')
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Color'
    nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.55
    bsdf.inputs['Specular IOR Level'].default_value = 0.35
    mat.use_backface_culling = True
    me.materials.append(mat)
    gc, gj = ob.vertex_groups.new(name='DEF-head'), ob.vertex_groups.new(name='DEF-jaw')
    lset = set(vs_lengua)
    for i, h in alturas:
        w = 1.0 if i in lset else float(suave(h, 0.004, -0.01))
        if w < 1:
            gc.add([i], 1 - w, 'REPLACE')
        if w > 0:
            gj.add([i], w, 'REPLACE')
    ob.parent = arm
    m = ob.modifiers.new('esqueleto', 'ARMATURE')
    m.object = arm
    log('boca_interior: %d triángulos' % sum(len(p.vertices) - 2 for p in me.polygons))
    return ob


# ================================================================================================ párpados
def marco(n, arriba=Vector((0, 0, 1))):
    z = Vector(n).normalized()
    y = (arriba - z * arriba.dot(z)).normalized()
    return y.cross(z), y, z


def uv_en(bvh_bm, bvh, uv_capa, P, n):
    """UV de la piel de la cabeza bajo el punto P (rayo desde afuera en −n)."""
    hit, _, i, _ = bvh.ray_cast(P + n * 0.03, -n)
    if hit is None:
        raise RuntimeError('sin piel bajo %s' % (tuple(P),))
    f = bvh_bm.faces[i]
    pesos = poly_3d_calc([l.vert.co for l in f.loops], hit)
    u = sum((l[uv_capa].uv * w for l, w in zip(f.loops, pesos)), Vector((0, 0)))
    return u


def parpados(malla, bvh, bvh_bm):
    """Agrega los párpados a `tigo-malla` y devuelve, por vértice nuevo, su posición con el ojo cerrado. También
    devuelve los vértices de cada ojo con su posición aplanada (cerrados)."""
    uv_capa = bvh_bm.loops.layers.uv.active
    me = malla.data
    bm = bmesh.new()
    bm.from_mesh(me)
    uvl = bm.loops.layers.uv.active
    dl = bm.verts.layers.deform.verify()
    gi_cab = malla.vertex_groups['DEF-head'].index
    cerrado = {}
    nuevos, cerrado_v = [], {}
    bm.verts.ensure_lookup_table()
    ojos_v = [v for v in bm.verts if any(f.material_index == 2 for f in v.link_faces) and v.co.z > CABEZA_C.z - 0.03]
    for s in (1, -1):
        az, el = math.radians(OJO_AZ * s), math.radians(OJO_EL)
        d = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
        hit, n, _ = golpe(bvh, CABEZA_C, d)
        x, y, z = marco(n)
        c = hit - n * 0.004
        # ojo: se aplana hacia su plano base (queda bajo la piel) al cerrar
        for v in ojos_v:
            if (v.co.x > 0) == (s > 0):
                p = v.co - c
                cerrado[v.index] = c + x * p.dot(x) + y * p.dot(y) + z * min(p.dot(z), 0.0) * 0.5 - z * 0.0015
        # párpado: una cúpula sobre la piel, más grande que el ojo (le tapa también el borde oscuro pintado), que se
        # funde con la piel en su borde; filas de arriba (k=0) a abajo, columnas de lado a lado
        RX, RY, ALTO = OJO_RX + 0.0045, OJO_RY + 0.0045, 0.012
        cols, filas = 7, 7
        ys = np.linspace(1.05, -1.05, filas)
        xs = np.linspace(-1.05, 1.05, cols)
        # textura: cada vértice copia la piel que tiene debajo (así el borde del párpado no se nota); si esa piel es el
        # ojo pintado, toma un mismo punto de pelaje liso justo encima del ojo. La penúltima fila toma el
        # borde oscuro de arriba del ojo: es la línea de las pestañas con el ojo cerrado.
        def muestra(xx, yy, k):
            xo, yo = xx * RX / OJO_RX, yy * RY / OJO_RY             # en unidades del ojo
            if math.hypot(xo, yo) >= 1.32 and yo > -0.2:            # fuera del ojo y de su borde oscuro: su piel
                return xx * RX, yy * RY
            if k == filas - 2:                                      # pestañas: el borde oscuro de arriba del ojo
                return 0.0, OJO_RY * 1.02
            return 0.0, OJO_RY + 0.012                              # pelaje liso, el mismo para todo el párpado
        vs = []
        for k, yy in enumerate(ys):
            fila = []
            for xx in xs:
                r2 = xx * xx + yy * yy
                piel, _, _ = golpe(bvh, c + n * 0.03 + x * (xx * RX) + y * (yy * RY), -n)
                alto = ALTO * (1 - r2) ** 1.4 if r2 < 1 else -0.0008
                pc = piel + n * alto                                        # cerrado
                y_ab = 1.08 + (1.05 - yy) * 0.03                            # abierto: todo arriba del ojo
                piel_ab, _, _ = golpe(bvh, c + n * 0.03 + x * (xx * RX * 0.9) + y * (y_ab * RY), -n)
                po = piel_ab - n * 0.0018                                   # y metido bajo la piel
                v = bm.verts.new(po)
                v[dl][gi_cab] = 1.0
                fila.append((v, pc, xx, k))
                nuevos.append(v)
            vs.append(fila)
        bm.verts.ensure_lookup_table()
        for k in range(filas - 1):
            for j in range(cols - 1):
                a, b = vs[k][j], vs[k][j + 1]
                cc, dd = vs[k + 1][j + 1], vs[k + 1][j]
                for tri in ((a, dd, cc), (a, cc, b)):
                    f = bm.faces.new([t[0] for t in tri])
                    f.material_index = 0
                    f.smooth = True
                    # que mire hacia afuera (en la pose cerrada)
                    cen = sum((t[1] for t in tri), Vector()) / 3
                    nn = (tri[1][1] - tri[0][1]).cross(tri[2][1] - tri[0][1])
                    if nn.dot(cen - c) < 0:
                        f.normal_flip()
                    for l in f.loops:
                        t = next(t for t in tri if t[0] is l.vert)
                        mx, my = muestra(t[2], ys[t[3]], t[3])
                        P = c + n * 0.004 + x * mx + y * my
                        l[uvl].uv = uv_en(bvh_bm, bvh, uv_capa, P, n)
        for fila in vs:
            for v, pc, xx, k in fila:
                cerrado_v[v] = pc
        # abierto: ningún vértice del párpado puede asomar
        for fila in vs:
            for v, pc, xx, k in fila:
                for _ in range(6):
                    q, nq, _, _ = bvh.find_nearest(v.co)
                    dist = (v.co - q).dot(nq)
                    if dist < -0.0012:
                        break
                    v.co = v.co - nq * (dist + 0.0015)
    bm.verts.index_update()
    for v, pc in cerrado_v.items():
        cerrado[v.index] = pc
    bm.to_mesh(me)
    bm.free()
    return cerrado


def clave_parpadeo(malla, cerrado):
    if not malla.data.shape_keys:
        malla.shape_key_add(name='Basis', from_mix=False)
    k = malla.shape_key_add(name='parpadeo', from_mix=False)
    for i, p in cerrado.items():
        k.data[i].co = p
    k.value = 0.0
    log('parpadeo: %d vértices se mueven' % len(cerrado))
    return k


# ================================================================================================ exportar
def exportar(arm, objetos, ruta):
    ad = arm.animation_data
    ad.action = None
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix()
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    for o in objetos:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=ruta, export_format='GLB', use_selection=True, export_yup=True, export_apply=False,
        export_texcoords=True, export_normals=True, export_tangents=False, export_materials='EXPORT',
        export_image_format='AUTO', export_vertex_color='MATERIAL', export_attributes=False, export_skins=True,
        export_all_influences=False, export_def_bones=False, export_animations=True, export_animation_mode='ACTIONS',
        export_force_sampling=True, export_frame_step=1, export_optimize_animation_size=True, export_morph=True,
        export_morph_normal=True, export_morph_animation=False, export_cameras=False, export_lights=False,
        export_extras=False)
    log('GLB crudo: %s (%d KB)' % (ruta, os.path.getsize(ruta) // 1024))


# ================================================================================================ capturas
def escena_render(sc):
    for motor in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):
        try:
            sc.render.engine = motor
            break
        except TypeError:
            continue
    if hasattr(sc, 'eevee') and hasattr(sc.eevee, 'taa_render_samples'):
        sc.eevee.taa_render_samples = 48
    for vt in ('Khronos PBR Neutral', 'Standard'):
        try:
            sc.view_settings.view_transform = vt
            break
        except TypeError:
            continue
    sc.render.image_settings.file_format = 'PNG'
    sc.world = sc.world or bpy.data.worlds.new('mundo')
    sc.world.use_nodes = True
    bg = next(n for n in sc.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Color'].default_value = (*hex_lineal('#E9EFEA'), 1)
    bg.inputs['Strength'].default_value = 0.9
    for nombre, energia, rot, color in (('sol', 3.2, (52, 0, -28), (1, 1, 1)), ('contra', 2.2, (60, 0, 150), (1, 0.9, 0.78)),
                                        ('relleno', 0.9, (75, 0, 60), (0.9, 0.95, 1))):
        l = bpy.data.lights.new(nombre, 'SUN')
        l.energy, l.color, l.angle = energia, color, math.radians(8)
        o = bpy.data.objects.new(nombre, l)
        o.rotation_euler = [math.radians(a) for a in rot]
        sc.collection.objects.link(o)


def foto(sc, ruta, az, el, centro, escala, res=(900, 900)):
    cam = bpy.data.objects.get('cam') or bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    if cam.name not in sc.collection.objects:
        sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = escala
    sc.render.resolution_x, sc.render.resolution_y = res
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    cam.location = Vector(centro) + d * 4
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = ruta
    bpy.ops.render.render(write_still=True)
    log('captura', ruta)


def posar(arm, malla, apertura=0.0, parpadeo=0.0, clip=None, cuadro=1):
    ad = arm.animation_data
    ad.action = None
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix()
    if clip:
        act = bpy.data.actions[clip]
        ad.action = act
        if ad.action_slot is None and act.slots:
            ad.action_slot = act.slots[0]
        bpy.context.scene.frame_set(int(cuadro))
    pb = arm.pose.bones.get('DEF-jaw')
    if pb:
        pb.rotation_mode = 'QUATERNION'
        pb.rotation_quaternion = Matrix.Rotation(GIRO_PRUEBA * apertura, 3, 'X').to_quaternion()
    if malla.data.shape_keys and 'parpadeo' in malla.data.shape_keys.key_blocks:
        malla.data.shape_keys.key_blocks['parpadeo'].value = parpadeo
    bpy.context.view_layer.update()


def capturas(carpeta, plano_actual, ruta_blend):
    """Actual (tigo.glb) frente a la propuesta: cara con la boca cerrada, abierta a medias y del todo, parpadeo."""
    os.makedirs(carpeta, exist_ok=True)
    R = lambda n: os.path.join(carpeta, 'ola4-D2-%s.png' % n)  # noqa: E731
    cara = (0, 0, CABEZA_C.z - 0.02)
    # 1) el actual
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=plano_actual)
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name != 'tigo-malla':
            bpy.data.objects.remove(o, do_unlink=True)
    sc = bpy.context.scene
    escena_render(sc)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    posar(arm, bpy.data.objects['tigo-malla'])
    foto(sc, R('actual-cara'), 15, 4, cara, 0.5)
    foto(sc, R('actual-cuerpo'), 25, 8, (0, 0, 0.5), 1.25, (900, 1000))
    # 2) la propuesta
    bpy.ops.wm.open_mainfile(filepath=ruta_blend)
    sc = bpy.context.scene
    escena_render(sc)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    malla = bpy.data.objects['tigo-malla']
    for n, ap, pa in (('cerrada', 0, 0), ('media', 0.5, 0), ('abierta', 1, 0), ('parpadeo-medio', 0, 0.5),
                      ('parpadeo', 0, 1)):
        posar(arm, malla, ap, pa)
        foto(sc, R('propuesta-' + n), 15, 4, cara, 0.5)
    posar(arm, malla, 1, 0)
    foto(sc, R('propuesta-abierta-costado'), 70, 0, cara, 0.5)
    foto(sc, R('propuesta-abierta-abajo'), 10, -25, cara, 0.5)
    posar(arm, malla, 0.7, 0, 'Idle_Talking_Loop', 20)
    foto(sc, R('propuesta-cuerpo-hablando'), 25, 8, (0, 0, 0.5), 1.25, (900, 1000))


# ================================================================================================ main
def main():
    a = args()
    plano = os.path.join(a.tmp, 'tigo-boca-entrada.glb')
    node(DECODIFICAR_JS, a.tmp, a.entrada, plano)
    arm, malla = cargar(plano)
    tris0 = sum(len(p.vertices) - 2 for p in malla.data.polygons)
    cab = puntos_cabeza(malla)
    bvh, bvh_bm = bvh_pelaje_cabeza(malla, cab)
    pivote = agregar_mandibula(arm, bvh)
    malla.vertex_groups.new(name='DEF-jaw')
    bm, capa_cab, arriba, abajo, ini, fin = cortar_boca(malla, cab)
    pesos_mandibula(bm, capa_cab, arriba, abajo)
    trazo, nt, _ = golpe(bvh, CABEZA_C, direccion_cara(0.0, -0.074))
    engrosar_labios(bm, [arriba, abajo], uv_en(bvh_bm, bvh, bvh_bm.loops.layers.uv.active, trazo, nt))
    bm.verts.layers.int.remove(capa_cab)
    bm.to_mesh(malla.data)
    bm.free()
    malla.data.shade_smooth()
    cerrado = parpados(malla, bvh, bvh_bm)
    malla.data.shade_smooth()
    clave_parpadeo(malla, cerrado)
    boca = boca_interior(bvh, arm, pivote)
    tris1 = sum(len(p.vertices) - 2 for p in malla.data.polygons) + sum(len(p.vertices) - 2 for p in boca.data.polygons)
    log('triángulos: %d → %d (+%d)' % (tris0, tris1, tris1 - tris0))
    blend = os.path.join(a.tmp, 'tigo-boca-propuesta.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    crudo = os.path.join(a.tmp, 'tigo-boca-crudo.glb')
    exportar(arm, [malla, boca], crudo)
    node(TEXTURA_JS, a.tmp, a.entrada, crudo)
    if a.sin_optimizar:
        log('sin optimizar: queda %s' % crudo)
    else:
        optimizar(crudo, a.salida, a.tmp)
    if a.render:
        capturas(a.render, plano, blend)


main()
