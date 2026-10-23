"""Oficina de Cobranzas con los Tigo (Blender 5.2, sin interfaz).

Uso:  blender -b --factory-startup --python oficina.py -- MODO [opciones]
MODO: construir | prueba | final | movil | retratos [ids...]
  construir  arma la escena y guarda oficina.blend (no renderiza)
  prueba     render 320x200, 4 muestras (o --res WxH --muestras N)
  final      render 2400x1400 + hotspots.json
  movil      render 1200x1600
  retratos   tigo-<id>.png 600x600 fondo transparente
Opciones: --cpu  (Cycles en CPU)  --res WxH  --muestras N
"""
import bpy, bmesh, math, json, os, sys
from mathutils import Vector, Matrix, Euler
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

D = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(D, 'tex')
GLB = '/home/jp_admin/Documentos/dev/aybar-front-web/public/media/tigo/modelos/tigo.glb'
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['construir']
MODO = ARGS[0]
CPU = '--cpu' in ARGS


def opt(nombre, defecto=None):
    return ARGS[ARGS.index(nombre) + 1] if nombre in ARGS else defecto


S = 1.6  # escala de Tigo (0.93 m -> 1.49 m)

# ------------------------------------------------------------------ escena limpia
bpy.ops.wm.read_factory_settings(use_empty=True)
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
VL = bpy.context.view_layer


def upd():
    VL.update()


def hexrgb(h, a=1.0):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*c, a)


def coleccion(nombre, padre=None):
    c = bpy.data.collections.get(nombre) or bpy.data.collections.new(nombre)
    if c.name not in [x.name for x in (padre or sc.collection).children]:
        (padre or sc.collection).children.link(c)
    return c


C_OFI = coleccion('oficina')
C_LUZ = coleccion('luces-oficina')
C_EST = coleccion('luces-estudio')
COL_ACTUAL = [C_OFI]


def enlazar(o):
    COL_ACTUAL[-1].objects.link(o)
    return o


# ------------------------------------------------------------------ materiales
MATS = {}


def mat(nombre, color, rough=0.5, metal=0.0, emit=None, emit_f=0.0, trans=0.0, alpha=1.0, coat=0.0):
    if nombre in MATS:
        return MATS[nombre]
    m = bpy.data.materials.new(nombre)
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = hexrgb(color) if isinstance(color, str) else color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if trans:
        b.inputs['Transmission Weight'].default_value = trans
        b.inputs['IOR'].default_value = 1.45
    if coat and b.inputs.get('Coat Weight'):
        b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = hexrgb(emit)
        b.inputs['Emission Strength'].default_value = emit_f
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
    MATS[nombre] = m
    return m


def mat_tex(nombre, archivo, emit=0.0, rough=0.5, alpha=False):
    if nombre in MATS:
        return MATS[nombre]
    m = bpy.data.materials.new(nombre)
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = bpy.data.images.load(os.path.join(TEX, archivo), check_existing=True)
    t.interpolation = 'Cubic'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    if alpha:
        nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
    b.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = emit
    MATS[nombre] = m
    return m


def mat_madera(nombre='madera', base='#D8B98E', veta='#C49E70'):
    if nombre in MATS:
        return MATS[nombre]
    m = bpy.data.materials.new(nombre)
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    w = nt.nodes.new('ShaderNodeTexWave')
    w.inputs['Scale'].default_value = 3.5
    w.inputs['Distortion'].default_value = 4.0
    w.inputs['Detail'].default_value = 3.0
    r = nt.nodes.new('ShaderNodeValToRGB')
    r.color_ramp.elements[0].color = hexrgb(veta)
    r.color_ramp.elements[1].color = hexrgb(base)
    r.color_ramp.elements[0].position = 0.15
    r.color_ramp.elements[1].position = 0.75
    nt.links.new(w.outputs['Fac'], r.inputs['Fac'])
    nt.links.new(r.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.45
    if b.inputs.get('Coat Weight'):
        b.inputs['Coat Weight'].default_value = 0.15
    MATS[nombre] = m
    return m


M_MADERA = mat_madera('madera', '#DDBF94', '#CFAE80')
M_PISO = mat_madera('piso', '#F3E7D3', '#E6D5BA')
M_LOSA = mat('losa', '#02424E', 0.6)
M_PARED = mat('pared', '#F4F1EC', 0.85)
M_ACENTO = mat('pared-acento', '#02424E', 0.8)
M_ZOCALO = mat('zocalo', '#03677A', 0.6)
M_PATA = mat('pata', '#2B3A3E', 0.35, 0.6)
M_ALU = mat('aluminio', '#C9D1D3', 0.3, 0.9)
M_VIDRIO = mat('vidrio', (0.86, 0.95, 0.95, 1), 0.02, trans=1.0)
M_ESMER = mat('esmerilado', (0.92, 0.96, 0.96, 1), 0.38, trans=1.0)
M_NEGRO = mat('negro', '#1A1E20', 0.35)
M_BLANCO = mat('blanco', '#F7F7F5', 0.5)
M_PAPEL = mat('papel', '#FFFDF6', 0.7)
M_TELA = mat('tela-silla', '#02424E', 0.85)
M_ALFOMBRA = mat('alfombra', '#03677A', 0.95)
M_ALFOMBRA2 = mat('alfombra-clara', '#D3E3E5', 0.95)
M_HOJA = mat('hoja', '#3E8A55', 0.6)
M_HOJA2 = mat('hoja-osc', '#2D6B45', 0.6)
M_MACETA = mat('maceta', '#EFE9E1', 0.6)
M_MACETA2 = mat('maceta-terracota', '#C77A55', 0.7)
M_ORO = mat('oro', '#E4B54D', 0.28, 1.0)
M_AMBAR = mat('ambar', '#F6A42C', 0.5)
M_ROJO = mat('rojo', '#C8443A', 0.5)
M_VERDE = mat('verde', '#1F6B4A', 0.5)
M_LED = mat('led-base', '#2A3236', 0.25)
M_LED_ON = mat('led-on', '#7FD3A8', 0.3, emit='#7FD3A8', emit_f=6)
M_CABLE = mat('cable', '#22313A', 0.5)
M_CABLE2 = mat('cable-ambar', '#F6A42C', 0.5)
M_CABLE3 = mat('cable-teal', '#03677A', 0.5)


# ------------------------------------------------------------------ geometría
def _obj(nombre, me, mat_=None):
    o = bpy.data.objects.new(nombre, me)
    enlazar(o)
    if mat_:
        o.data.materials.append(mat_)
    return o


def caja(nombre, dx, dy, dz, loc=(0, 0, 0), m=None, bisel=0.012, rot=(0, 0, 0), padre=None):
    """Caja con la base en loc.z (centrada en x,y)."""
    me = bpy.data.meshes.new(nombre)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(dx, dy, dz), verts=bm.verts)
    bmesh.ops.translate(bm, vec=(0, 0, dz / 2), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    o = _obj(nombre, me, m)
    o.location = loc
    o.rotation_euler = rot
    if bisel and min(dx, dy, dz) > bisel * 2.5:
        md = o.modifiers.new('bisel', 'BEVEL')
        md.width = bisel
        md.segments = 2
        md.limit_method = 'ANGLE'
    if padre:
        o.parent = padre
    return o


def cilindro(nombre, r, h, loc=(0, 0, 0), m=None, verts=32, rot=(0, 0, 0), padre=None, r2=None):
    me = bpy.data.meshes.new(nombre)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bmesh.ops.translate(bm, vec=(0, 0, h / 2), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = len(p.vertices) == 4
    o = _obj(nombre, me, m)
    o.location = loc
    o.rotation_euler = rot
    if padre:
        o.parent = padre
    return o


def esfera(nombre, r, loc=(0, 0, 0), m=None, escala=(1, 1, 1), padre=None, sub=2):
    me = bpy.data.meshes.new(nombre)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = _obj(nombre, me, m)
    o.location = loc
    o.scale = escala
    if padre:
        o.parent = padre
    return o


def toro(nombre, R, r, loc=(0, 0, 0), m=None, rot=(0, 0, 0), padre=None, seg=40, segm=12):
    me = bpy.data.meshes.new(nombre)
    bm = bmesh.new()
    vs = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        fila = []
        for j in range(segm):
            b = 2 * math.pi * j / segm
            x = (R + r * math.cos(b)) * math.cos(a)
            y = (R + r * math.cos(b)) * math.sin(a)
            z = r * math.sin(b)
            fila.append(bm.verts.new((x, y, z)))
        vs.append(fila)
    for i in range(seg):
        for j in range(segm):
            bm.faces.new((vs[i][j], vs[(i + 1) % seg][j], vs[(i + 1) % seg][(j + 1) % segm], vs[i][(j + 1) % segm]))
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = _obj(nombre, me, m)
    o.location = loc
    o.rotation_euler = rot
    if padre:
        o.parent = padre
    return o


def plano(nombre, w, h, loc=(0, 0, 0), m=None, rot=(math.pi / 2, 0, 0), padre=None):
    """Plano w x h; por defecto vertical mirando a -Y (con UV completas)."""
    me = bpy.data.meshes.new(nombre)
    me.from_pydata([(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv.data[i].uv = c
    o = _obj(nombre, me, m)
    o.location = loc
    o.rotation_euler = rot
    if padre:
        o.parent = padre
    return o


def curva(nombre, puntos, grosor, m, padre=None):
    cu = bpy.data.curves.new(nombre, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = grosor
    cu.bevel_resolution = 3
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(puntos) - 1)
    for bp, p in zip(sp.bezier_points, puntos):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(nombre, cu)
    enlazar(o)
    o.data.materials.append(m)
    if padre:
        o.parent = padre
    return o


def vacio(nombre, loc=(0, 0, 0), yaw=0.0, padre=None):
    e = bpy.data.objects.new(nombre, None)
    enlazar(e)
    e.location = loc
    e.rotation_euler = (0, 0, yaw)
    if padre:
        e.parent = padre
    return e


# ------------------------------------------------------------------ Tigo
bpy.ops.import_scene.gltf(filepath=GLB)
T_ARM = bpy.data.objects['tigo']
T_MESH = bpy.data.objects['tigo-malla']
for o in (T_ARM, T_MESH):
    for c in list(o.users_collection):
        c.objects.unlink(o)
T_ARM.animation_data_clear()
POLO = bpy.data.materials['tigo-polo']


def polo_rol(rid, color):
    """Polo teñido con el color del rol, conservando el sombreado de la textura."""
    m = POLO.copy()
    m.name = 'tigo-polo-' + rid
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    t = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
    bw = nt.nodes.new('ShaderNodeRGBToBW')
    k = nt.nodes.new('ShaderNodeMath')
    k.operation = 'MULTIPLY'
    k.inputs[1].default_value = 1 / 0.115
    k.use_clamp = False
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 1.0
    nt.links.new(t.outputs['Color'], bw.inputs['Color'])
    nt.links.new(bw.outputs['Val'], k.inputs[0])
    nt.links.new(k.outputs['Value'], mix.inputs[6])
    mix.inputs[7].default_value = hexrgb(color)
    nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    return m


def aim(arm, bname, d):
    pb = arm.pose.bones[bname]
    upd()
    M = pb.matrix.copy()
    y = (M.to_3x3() @ Vector((0, 1, 0))).normalized()
    q = y.rotation_difference(Vector(d).normalized())
    t = M.translation.copy()
    pb.matrix = Matrix.Translation(t) @ q.to_matrix().to_4x4() @ Matrix.Translation(-t) @ M
    upd()


def espejo(v):
    return (-v[0], v[1], v[2])


BRAZOS = {
    'abajo': ((0.28, 0.02, -1), (0.15, -0.3, -1)),
    'teclear': ((0.3, -0.6, -0.75), (-0.2, -1, -0.08)),
    'sostener': ((0.25, -0.5, -0.85), (-0.45, -0.85, 0.35)),
    'sostener_bajo': ((0.25, -0.35, -0.9), (-0.35, -1, 0.05)),
    'senalar': ((0.75, -0.45, 0.45), (0.8, -0.5, 0.35)),
    'arriba': ((0.45, -0.45, -0.55), (0.1, -0.55, 0.9)),
    'lado': ((0.95, -0.15, -0.35), (0.85, -0.45, -0.05)),
    'cadera': ((0.6, 0.25, -0.75), (-0.5, -0.2, -0.3)),
}


def tigo(nombre, rid, color, loc, yaw, brazos=('abajo', 'abajo'), sentado=False, cabeza=(0, -0.05, 1), espina=None,
         polo=None):
    """brazos = (izquierdo, derecho) por nombre de BRAZOS (definidos para el lado L y espejados para R)."""
    a = T_ARM.copy()
    a.name = nombre
    a.data = T_ARM.data  # compartido; la pose vive en el objeto
    enlazar(a)
    a.animation_data_clear()
    m = T_MESH.copy()
    m.name = nombre + '-malla'
    enlazar(m)
    m.parent = a
    for md in m.modifiers:
        if md.type == 'ARMATURE':
            md.object = a
    for i, ms in enumerate(m.material_slots):
        if ms.material and ms.material.name.startswith('tigo-polo'):
            ms.link = 'OBJECT'
            ms.material = polo or polo_rol(rid, color)
    a.location = (loc[0], loc[1], 0)
    a.rotation_mode = 'XYZ'  # el glb trae QUATERNION: sin esto el yaw se ignoraba
    a.rotation_euler = (0, 0, yaw)
    a.scale = (S, S, S)
    upd()
    for pb in a.pose.bones:
        pb.rotation_mode = 'QUATERNION'
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    upd()
    if espina:
        aim(a, 'DEF-spine.003', espina)
    if sentado:
        for lado, sx in (('L', 1), ('R', -1)):
            aim(a, f'DEF-thigh.{lado}', (0.12 * sx, -1, -0.05))
            aim(a, f'DEF-shin.{lado}', (0.02 * sx, -0.08, -1))
            aim(a, f'DEF-foot.{lado}', (0.05 * sx, -1, -0.4))
    bl, br = brazos
    for lado, nombre_b in (('L', bl), ('R', br)):
        if isinstance(nombre_b, tuple):
            ua, fa = nombre_b
        else:
            ua, fa = BRAZOS[nombre_b]
            if lado == 'R':
                ua, fa = espejo(ua), espejo(fa)
        aim(a, f'DEF-upper_arm.{lado}', ua)
        aim(a, f'DEF-forearm.{lado}', fa)
    aim(a, 'DEF-head', cabeza)
    upd()
    pts = verts_mundo(m)
    zmin = min(p.z for p in pts)
    a.location.z -= zmin
    upd()
    return a, m


def verts_mundo(o):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = o.evaluated_get(dg)
    me = ev.to_mesh()
    mw = ev.matrix_world.copy()
    pts = [mw @ v.co for v in me.vertices]
    ev.to_mesh_clear()
    return pts


def hueso(a, nombre, cola=True):
    pb = a.pose.bones[nombre]
    return a.matrix_world @ (pb.tail if cola else pb.head)


def mano(a, lado):
    """Centro de la palma: entre la cabeza y la cola del hueso de la mano, un poco hacia adelante."""
    pb = a.pose.bones[f'DEF-hand.{lado}']
    return a.matrix_world @ (pb.head * 0.3 + pb.tail * 0.7)


def asiento(a, m):
    """Altura de la cara inferior del muslo (rayo hacia abajo desde el centro del muslo)."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = m.evaluated_get(dg)
    bvh = BVHTree.FromObject(ev, dg)
    inv = ev.matrix_world.inverted()
    zs = []
    for lado in 'LR':
        pb = a.pose.bones[f'DEF-thigh.{lado}']
        c = a.matrix_world @ ((pb.head + pb.tail) / 2)
        hit = bvh.ray_cast(inv @ c, Vector((0, 0, -1)))
        if hit[0]:
            zs.append((ev.matrix_world @ hit[0]).z)
    return min(zs) if zs else hueso(a, 'DEF-hips', False).z - 0.06 * S


def frente(yaw):
    return Vector((math.sin(yaw), -math.cos(yaw), 0))


# ------------------------------------------------------------------ muebles
def escritorio(nombre, ancho, fondo, alto, loc, yaw, padre=None, m=M_MADERA):
    e = vacio(nombre, loc, yaw, padre)
    caja(nombre + '-tablero', ancho, fondo, 0.04, (0, 0, alto - 0.04), m, 0.008, padre=e)
    for sx in (-1, 1):
        caja(nombre + f'-pata{sx}', 0.05, fondo * 0.85, alto - 0.04, (sx * (ancho / 2 - 0.07), 0, 0), M_PATA, 0.006, padre=e)
    caja(nombre + '-faldon', ancho - 0.2, 0.02, 0.28, (0, -fondo * 0.38, alto - 0.34), M_PATA, 0, padre=e)
    return e


def silla(nombre, loc, yaw, alto_asiento, padre=None):
    e = vacio(nombre, loc, yaw, padre)
    s = 0.48
    caja(nombre + '-asiento', s, s, 0.08, (0, 0, alto_asiento - 0.08), M_TELA, 0.025, padre=e)
    caja(nombre + '-respaldo', s * 0.95, 0.07, 0.5, (0, s / 2 + 0.02, alto_asiento + 0.05), M_TELA, 0.025, padre=e)
    caja(nombre + '-barra', 0.04, 0.04, 0.2, (0, s / 2 + 0.02, alto_asiento - 0.12), M_PATA, 0, padre=e)
    cilindro(nombre + '-poste', 0.03, alto_asiento - 0.16, (0, 0, 0.06), M_PATA, 12, padre=e)
    for i in range(5):
        ang = i * 2 * math.pi / 5
        caja(nombre + f'-pie{i}', 0.04, 0.3, 0.035, (0.15 * math.sin(ang), -0.15 * math.cos(ang), 0.03), M_PATA, 0,
             rot=(0, 0, ang), padre=e)
        esfera(nombre + f'-rueda{i}', 0.03, (0.29 * math.sin(ang), -0.29 * math.cos(ang), 0.03), M_NEGRO, padre=e, sub=1)
    return e


PANTALLAS = ['pantalla-a.png', 'pantalla-b.png', 'pantalla-c.png']


def monitor(nombre, loc, yaw, padre=None, pantalla=0, ancho=0.56):
    """Monitor; devuelve (empty, objeto LED). loc = punto de apoyo sobre la mesa."""
    e = vacio(nombre, loc, yaw, padre)
    alto = ancho * 0.62
    caja(nombre + '-base', 0.2, 0.15, 0.015, (0, 0.03, 0), M_PATA, 0, padre=e)
    caja(nombre + '-cuello', 0.04, 0.03, 0.14, (0, 0.05, 0.01), M_PATA, 0, padre=e)
    caja(nombre + '-marco', ancho, 0.03, alto, (0, 0.03, 0.1), M_NEGRO, 0.006, padre=e)
    plano(nombre + '-pantalla', ancho - 0.03, alto - 0.03, (0, 0.014, 0.1 + alto / 2),
          mat_tex('mat-' + PANTALLAS[pantalla % 3], PANTALLAS[pantalla % 3], emit=1.6, rough=0.2), padre=e)
    led = esfera(nombre + '-led', 0.022, (ancho / 2 - 0.035, 0.0, 0.1 + alto + 0.025), M_LED, padre=e, sub=2)
    return e, led


def planta(nombre, loc, alto=1.1, padre=None, m_maceta=None, r=0.22):
    e = vacio(nombre, loc, 0, padre)
    cilindro(nombre + '-maceta', r, 0.38, (0, 0, 0), m_maceta or M_MACETA, 32, padre=e, r2=r * 0.8)
    import random
    rnd = random.Random(hash(nombre) & 0xffff)
    for i in range(9):
        ang = rnd.uniform(0, 2 * math.pi)
        rr = rnd.uniform(0.0, r * 0.9)
        z = 0.38 + rnd.uniform(0.15, alto - 0.35)
        esfera(nombre + f'-hoja{i}', rnd.uniform(0.16, 0.26) * (alto / 1.1) ** 0.5,
               (rr * math.cos(ang), rr * math.sin(ang), z), M_HOJA if i % 2 else M_HOJA2,
               escala=(1, 1, 1.25), padre=e, sub=1)
    return e


# ------------------------------------------------------------------ accesorios (todos con origen en su apoyo)
def calculadora(n, loc, yaw=0, padre=None, rot=(0, 0, 0), k=1.0):
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-cuerpo', 0.16 * k, 0.22 * k, 0.025 * k, (0, 0, 0), mat('calc', '#E9ECEC', 0.4), 0.006, padre=e)
    plano(n + '-display', 0.12 * k, 0.045 * k, (0, -0.07 * k, 0.026 * k), mat('display', '#BFD9C8', 0.3, emit='#BFD9C8', emit_f=0.6),
          rot=(0, 0, 0), padre=e)
    for i in range(4):
        for j in range(4):
            mm = M_AMBAR if (i == 3) else mat('tecla', '#2E3B40', 0.5)
            caja(n + f'-t{i}{j}', 0.026 * k, 0.022 * k, 0.012 * k, ((-0.045 + i * 0.03) * k, (-0.02 + j * 0.03) * k, 0.025 * k), mm, 0,
                 padre=e)
    return e


def monedas(n, loc, padre=None):
    e = vacio(n, loc, 0, padre)
    for pila, (x, y, h) in enumerate([(0, 0, 6), (0.07, 0.03, 4), (0.03, 0.08, 8)]):
        for i in range(h):
            cilindro(n + f'-{pila}-{i}', 0.03, 0.009, (x + 0.002 * (i % 2), y, i * 0.0095), M_ORO, 20, padre=e)
    return e


def portapapeles(n, loc, yaw=0, padre=None, rot=(0, 0, 0)):
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-tabla', 0.24, 0.012, 0.32, (0, 0, -0.16), mat('masonite', '#8A5A35', 0.6), 0.003, padre=e)
    plano(n + '-hoja', 0.2, 0.26, (0, -0.008, -0.01 - 0.13), mat_tex('mat-papel', 'papel.png', rough=0.7), padre=e)
    caja(n + '-pinza', 0.1, 0.02, 0.035, (0, -0.006, 0.0), M_ALU, 0.004, padre=e)
    return e


def silbato(n, loc, padre=None):
    e = vacio(n, loc, 0, padre)
    cilindro(n + '-cuerpo', 0.022, 0.06, (0, 0, 0), M_ALU, 16, rot=(math.pi / 2, 0, 0), padre=e)
    return e


def balanza(n, loc, yaw=0, padre=None, k=1.0):
    e = vacio(n, loc, yaw, padre)
    mo = M_ORO
    cilindro(n + '-base', 0.07 * k, 0.02 * k, (0, 0, 0), mo, 24, padre=e)
    cilindro(n + '-poste', 0.012 * k, 0.32 * k, (0, 0, 0.02 * k), mo, 12, padre=e)
    caja(n + '-brazo', 0.36 * k, 0.014 * k, 0.014 * k, (0, 0, 0.33 * k), mo, 0, padre=e)
    esfera(n + '-remate', 0.02 * k, (0, 0, 0.36 * k), mo, padre=e)
    for sx in (-1, 1):
        for i in range(3):
            ang = i * 2 * math.pi / 3
            p0 = Vector((sx * 0.17 * k, 0, 0.335 * k))
            p1 = Vector((sx * 0.17 * k + 0.05 * k * math.cos(ang), 0.05 * k * math.sin(ang), 0.2 * k))
            curva(n + f'-cuerda{sx}{i}', [p0, p1], 0.002 * k, mo, padre=e)
        cilindro(n + f'-plato{sx}', 0.065 * k, 0.012 * k, (sx * 0.17 * k, 0, 0.19 * k), mo, 24, padre=e, r2=0.05 * k)
    return e


def deform(a, bone):
    pb = a.pose.bones[bone]
    return a.matrix_world @ pb.matrix @ pb.bone.matrix_local.inverted()


def frente_pecho(a, m, z=0.45, x=0.0):
    """Y (en coordenadas de reposo del Tigo) de la superficie del pecho a la altura z."""
    Md = deform(a, 'DEF-spine.003')
    dg = bpy.context.evaluated_depsgraph_get()
    ev = m.evaluated_get(dg)
    bvh = BVHTree.FromObject(ev, dg)
    inv = ev.matrix_world.inverted()
    o = Md @ Vector((x, -0.6, z))
    d = (Md.to_3x3() @ Vector((0, 1, 0))).normalized()
    hit = bvh.ray_cast(inv @ o, (inv.to_3x3() @ d).normalized())
    if not hit[0]:
        return -0.2
    return (Md.inverted() @ (ev.matrix_world @ hit[0])).y


def frente_torso(a, m, pt, yaw):
    """Cuánto sobresale el torso (sin brazos) hacia adelante desde el origen del Tigo."""
    f = frente(yaw)
    lado = Vector((math.cos(yaw), math.sin(yaw), 0))
    hz = hueso(a, 'DEF-hips', False).z
    mejor = 0
    for p in verts_mundo(m):
        d = p - Vector((pt.x, pt.y, 0))
        if abs(d.dot(lado)) < 0.17 * S and hz - 0.02 < p.z < hz + 0.3 * S:
            mejor = max(mejor, d.dot(f))
    return mejor


def corbata(n, a, m, color='#7A2235'):
    yf = frente_pecho(a, m, 0.46)
    e = vacio(n)
    mc = mat('corbata-' + color, color, 0.45, coat=0.3)
    me = bpy.data.meshes.new(n + '-hoja')
    y = yf - 0.006
    me.from_pydata([(-0.022, y, 0.52), (0.022, y, 0.52), (0.04, y - 0.004, 0.38), (0, y - 0.008, 0.34), (-0.04, y - 0.004, 0.38)], [],
                   [(0, 1, 2, 3, 4)])
    o = _obj(n + '-hoja', me, mc)
    o.parent = e
    o.modifiers.new('grosor', 'SOLIDIFY').thickness = 0.01
    esfera(n + '-nudo', 0.028, (0, y - 0.004, 0.535), mc, escala=(1, 0.6, 0.8), padre=e)
    for sx in (-1, 1):
        me2 = bpy.data.meshes.new(n + f'-cuello{sx}')
        me2.from_pydata([(0.0, y + 0.004, 0.555), (sx * 0.09, y + 0.02, 0.56), (sx * 0.05, y - 0.002, 0.49)], [], [(0, 1, 2)])
        o2 = _obj(n + f'-cuello{sx}', me2, M_BLANCO)
        o2.parent = e
        o2.modifiers.new('g', 'SOLIDIFY').thickness = 0.008
    e.matrix_world = deform(a, 'DEF-spine.003')
    return e


def gorra(n, a, color='#F6A42C'):
    e = vacio(n)
    mc = mat('gorra-' + color, color, 0.6)
    cen = (0, -0.012, 0.80)
    domo = esfera(n + '-domo', 0.2, cen, mc, escala=(1, 1, 0.74), padre=e, sub=3)
    bm = bmesh.new()
    bm.from_mesh(domo.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.002], context='VERTS')
    bm.to_mesh(domo.data)
    bm.free()
    domo.modifiers.new('g', 'SOLIDIFY').thickness = 0.01
    visera = cilindro(n + '-visera', 0.13, 0.014, (0, -0.19, 0.795), mc, 32, padre=e)
    visera.scale = (1.0, 0.75, 1)
    visera.rotation_euler = (math.radians(-8), 0, 0)
    esfera(n + '-boton', 0.02, (0, -0.012, 0.80 + 0.2 * 0.74), mc, padre=e, sub=1)
    e.matrix_world = deform(a, 'DEF-head')
    return e


def silbato_cuello(n, a, m):
    yf = frente_pecho(a, m, 0.44)
    e = vacio(n)
    y = yf - 0.012
    curva(n + '-cordon', [Vector((-0.08, y + 0.03, 0.54)), Vector((-0.03, y - 0.005, 0.47)), Vector((0.0, y - 0.01, 0.44)),
                          Vector((0.03, y - 0.005, 0.47)), Vector((0.08, y + 0.03, 0.54))], 0.004, M_ROJO, padre=e)
    cilindro(n + '-silbato', 0.024, 0.07, (0.0, y - 0.025, 0.415), M_AMBAR, 20, rot=(math.pi / 2, 0, 0), padre=e)
    esfera(n + '-bola', 0.03, (0.0, y - 0.005, 0.40), M_AMBAR, padre=e)
    e.matrix_world = deform(a, 'DEF-spine.003')
    return e


def insignia(n, a, m, color):
    yf = frente_pecho(a, m, 0.47, 0.075)
    e = vacio(n)
    cilindro(n + '-disco', 0.028, 0.008, (0.075, yf - 0.002, 0.47), mat('insig-' + color, color, 0.3, 0.6), 24,
             rot=(math.pi / 2, 0, 0), padre=e)
    e.matrix_world = deform(a, 'DEF-spine.003')
    return e


def reloj_grande(n, loc, yaw=0, padre=None, r=0.42, h=1.55):
    e = vacio(n, loc, yaw, padre)
    cilindro(n + '-pie', 0.22, 0.03, (0, 0, 0), M_PATA, 24, padre=e)
    cilindro(n + '-poste', 0.025, h - r, (0, 0, 0.03), M_PATA, 12, padre=e)
    cara = vacio(n + '-cara', (0, 0, h), 0, e)
    toro(n + '-aro', r, 0.035, (0, 0, 0), M_ZOCALO, rot=(math.pi / 2, 0, 0), padre=cara)
    cilindro(n + '-fondo', r, 0.05, (0, 0.03, 0), M_BLANCO, 48, rot=(math.pi / 2, 0, 0), padre=cara)
    plano(n + '-esfera', r * 2 * 0.98, r * 2 * 0.98, (0, -0.025, 0), mat_tex('mat-reloj', 'reloj.png', rough=0.5, alpha=True), padre=cara)
    caja(n + '-aguja-h', 0.025, 0.01, r * 0.5, (0, -0.035, 0), M_NEGRO, 0, rot=(0, math.radians(-60), 0), padre=cara)
    caja(n + '-aguja-m', 0.018, 0.01, r * 0.78, (0, -0.04, 0), M_NEGRO, 0, rot=(0, math.radians(30), 0), padre=cara)
    cilindro(n + '-eje', 0.025, 0.02, (0, -0.05, 0), M_AMBAR, 16, rot=(math.pi / 2, 0, 0), padre=cara)
    return e


def despertador(n, loc, yaw=0, padre=None, k=1.0):
    e = vacio(n, loc, yaw, padre)
    cilindro(n + '-cuerpo', 0.075 * k, 0.05 * k, (0, 0.025 * k, 0.085 * k), M_AMBAR, 32, rot=(math.pi / 2, 0, 0), padre=e)
    plano(n + '-esfera', 0.13 * k, 0.13 * k, (0, -0.026 * k, 0.085 * k), mat_tex('mat-reloj', 'reloj.png', alpha=True), padre=e)
    for sx in (-1, 1):
        esfera(n + f'-campana{sx}', 0.035 * k, (sx * 0.055 * k, 0, 0.165 * k), M_ALU, padre=e)
        cilindro(n + f'-pata{sx}', 0.008 * k, 0.03 * k, (sx * 0.045 * k, 0, 0.0), M_PATA, 8, padre=e)
    return e


def servidor(n, loc, yaw=0, padre=None, h=1.5):
    e = vacio(n, loc, yaw, padre)
    caja(n + '-gabinete', 0.62, 0.62, h, (0, 0, 0), mat('rack', '#24343A', 0.4, 0.3), 0.015, padre=e)
    ms = [mat('led-v', '#7FD3A8', 0.3, emit='#7FD3A8', emit_f=5), mat('led-a', '#F6A42C', 0.3, emit='#F6A42C', emit_f=5),
          mat('led-t', '#4FC3D9', 0.3, emit='#4FC3D9', emit_f=5)]
    for i in range(7):
        z = 0.12 + i * (h - 0.25) / 7
        caja(n + f'-bandeja{i}', 0.54, 0.02, (h - 0.25) / 7 - 0.035, (0, -0.31, z), mat('bandeja', '#3A4E55', 0.35, 0.4), 0.004, padre=e)
        for j in range(4):
            caja(n + f'-led{i}{j}', 0.022, 0.012, 0.022, (0.18 + j * 0.03, -0.322, z + 0.05), ms[(i + j) % 3], 0, padre=e)
        for j in range(5):
            caja(n + f'-ranura{i}{j}', 0.05, 0.01, 0.07, (-0.22 + j * 0.065, -0.322, z + 0.03), M_NEGRO, 0, padre=e)
    return e


def calendario(n, loc, yaw=0, padre=None, k=1.0):
    e = vacio(n, loc, yaw, padre)
    inc = math.radians(-14)
    hoja = vacio(n + '-h', (0, 0, 0), 0, e)
    hoja.rotation_euler = (inc, 0, 0)
    caja(n + '-tapa', 0.36 * k, 0.012 * k, 0.42 * k, (0, 0.008 * k, 0), M_ZOCALO, 0.003, padre=hoja)
    plano(n + '-hoja', 0.34 * k, 0.39 * k, (0, -0.0 * k, 0.21 * k), mat_tex('mat-calendario', 'calendario.png'), padre=hoja)
    for i in range(6):
        toro(n + f'-anillo{i}', 0.012 * k, 0.003 * k, ((-0.12 + i * 0.048) * k, 0.0, 0.42 * k), M_ALU, rot=(0, math.pi / 2, 0),
             padre=hoja, seg=16, segm=6)
    soporte = caja(n + '-soporte', 0.34 * k, 0.012 * k, 0.4 * k, (0, 0.03 * k, 0), M_ZOCALO, 0.003, padre=e)
    soporte.rotation_euler = (math.radians(14), 0, 0)
    return e


def caballete(n, loc, yaw, archivo, ancho=1.2, alto=0.8, base=0.75, padre=None, marco=M_ZOCALO):
    e = vacio(n, loc, yaw, padre)
    tabla = vacio(n + '-t', (0, 0, base), 0, e)
    tabla.rotation_euler = (math.radians(-8), 0, 0)
    caja(n + '-marco', ancho + 0.06, 0.04, alto + 0.06, (0, 0.02, -0.03), marco, 0.01, padre=tabla)
    plano(n + '-lamina', ancho, alto, (0, -0.002, alto / 2), mat_tex('mat-' + archivo, archivo, rough=0.6), padre=tabla)
    for sx in (-1, 1):
        caja(n + f'-pata{sx}', 0.04, 0.04, base + alto * 0.6, (sx * ancho * 0.38, 0.06, 0), M_PATA, 0.006, padre=e)
    caja(n + '-pata-atras', 0.04, 0.04, base + alto * 0.5, (0, 0.35, 0), M_PATA, 0.006, rot=(math.radians(-25), 0, 0), padre=e)
    caja(n + '-repisa', ancho * 0.9, 0.08, 0.025, (0, -0.02, base - 0.03), M_PATA, 0.004, padre=e)
    return e, tabla


def banderin(n, loc, color, padre=None, h=0.16):
    e = vacio(n, loc, 0, padre)
    cilindro(n + '-asta', 0.005, h, (0, 0, 0), M_PATA, 8, padre=e)
    me = bpy.data.meshes.new(n + '-tela')
    me.from_pydata([(0, 0, h), (0.08, 0, h - 0.025), (0, 0, h - 0.05)], [], [(0, 1, 2)])
    o = _obj(n + '-tela', me, mat('band-' + color, color, 0.6))
    o.parent = e
    esfera(n + '-cabeza', 0.012, (0, 0, h), mat('band-' + color, color, 0.6), padre=e, sub=1)
    return e


def sobre(n, loc, yaw=0, padre=None, color='#F7F2E6', k=1.0, rot=(0, 0, 0)):
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-cuerpo', 0.22 * k, 0.15 * k, 0.012 * k, (0, 0, 0), mat('sobre-' + color, color, 0.7), 0.002, padre=e)
    me = bpy.data.meshes.new(n + '-solapa')
    me.from_pydata([(-0.11 * k, 0.075 * k, 0.0125 * k), (0.11 * k, 0.075 * k, 0.0125 * k), (0, -0.01 * k, 0.0125 * k)], [], [(0, 1, 2)])
    o = _obj(n + '-solapa', me, mat('solapa', '#E2D6BC', 0.7))
    o.parent = e
    cilindro(n + '-sello', 0.014 * k, 0.003 * k, (0, -0.005 * k, 0.012 * k), M_ROJO, 16, padre=e)
    return e


def celular(n, loc, yaw=0, padre=None, rot=(0, 0, 0), k=1.0):
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-cuerpo', 0.085 * k, 0.012 * k, 0.17 * k, (0, 0, -0.085 * k), M_NEGRO, 0.004, padre=e)
    plano(n + '-pantalla', 0.075 * k, 0.15 * k, (0, -0.0065 * k, 0), mat_tex('mat-pantalla-c.png', 'pantalla-c.png', emit=1.6), padre=e,
          rot=(math.pi / 2, 0, math.pi / 2)) if False else \
        plano(n + '-pantalla', 0.075 * k, 0.15 * k, (0, -0.0065 * k, 0), mat('cel-pant', '#3FB59A', 0.2, emit='#7FD3A8', emit_f=1.5), padre=e)
    return e


def pluma(n, loc, padre=None, rot=(0, 0, 0), k=1.0):
    e = vacio(n, loc, 0, padre)
    e.rotation_euler = rot
    cilindro(n + '-punta', 0.006 * k, 0.05 * k, (0, 0, -0.05 * k), M_ORO, 10, padre=e, r2=0.0001) if False else None
    cilindro(n + '-punta', 0.0001, 0.05 * k, (0, 0, -0.05 * k), M_ORO, 10, padre=e, r2=0.007 * k)
    cilindro(n + '-cana', 0.004 * k, 0.26 * k, (0, 0, 0), mat('cana', '#F3EEE4', 0.5), 10, padre=e)
    # pluma: elipsoide aplanado
    esfera(n + '-pluma', 0.1 * k, (0.012 * k, 0, 0.18 * k), mat('pluma-ave', '#F5F1EA', 0.6), escala=(0.32, 0.06, 1.0), padre=e)
    return e


def lupa(n, loc, padre=None, rot=(0, 0, 0), k=1.0):
    e = vacio(n, loc, 0, padre)
    e.rotation_euler = rot
    cilindro(n + '-mango', 0.016 * k, 0.15 * k, (0, 0, 0), mat('mango', '#5B3A24', 0.5), 16, padre=e)
    toro(n + '-aro', 0.085 * k, 0.012 * k, (0, 0, 0.15 * k + 0.085 * k), M_ORO, rot=(math.pi / 2, 0, 0), padre=e)
    cilindro(n + '-lente', 0.082 * k, 0.008 * k, (0, 0.004 * k, 0.15 * k + 0.085 * k), M_VIDRIO, 32, rot=(math.pi / 2, 0, 0), padre=e)
    return e


def bandeja_correo(n, loc, yaw=0, padre=None):
    e = vacio(n, loc, yaw, padre)
    for piso in range(2):
        z = piso * 0.09
        caja(n + f'-base{piso}', 0.34, 0.26, 0.012, (0, 0, z), M_ZOCALO, 0.003, padre=e)
        for sx in (-1, 1):
            caja(n + f'-lado{piso}{sx}', 0.012, 0.26, 0.06, (sx * 0.165, 0, z), M_ZOCALO, 0, padre=e)
        for i in range(3):
            sobre(n + f'-s{piso}{i}', (0.0 + 0.01 * i, 0.0, z + 0.014 + i * 0.013), 0.05 * (i - 1), e, k=1.25)
    for sx in (-1, 1):
        cilindro(n + f'-col{sx}', 0.008, 0.1, (sx * 0.15, 0.11, 0), M_ALU, 8, padre=e)
    return e


def archivador(n, loc, yaw=0, padre=None, cajones=4, color='#E9ECEC'):
    e = vacio(n, loc, yaw, padre)
    h = 0.34 * cajones + 0.06
    caja(n + '-cuerpo', 0.5, 0.6, h, (0, 0, 0), mat('archivador-' + color, color, 0.45, 0.2), 0.012, padre=e)
    for i in range(cajones):
        z = 0.05 + i * 0.34
        caja(n + f'-frente{i}', 0.46, 0.02, 0.31, (0, -0.305, z), mat('cajon', '#F6F7F7', 0.4, 0.1), 0.006, padre=e)
        caja(n + f'-tirador{i}', 0.16, 0.03, 0.025, (0, -0.325, z + 0.22), M_ALU, 0.004, padre=e)
        plano(n + f'-etiqueta{i}', 0.09, 0.04, (0, -0.317, z + 0.15), M_AMBAR if i % 2 else mat('etq', '#7FB3BC', 0.6), padre=e)
    return e


def carpeta(n, loc, yaw=0, padre=None, color='#03677A', rot=(0, 0, 0), k=1.0):
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-tapa', 0.24 * k, 0.05 * k, 0.32 * k, (0, 0, -0.16 * k), mat('carpeta-' + color, color, 0.6), 0.006, padre=e)
    caja(n + '-hojas', 0.22 * k, 0.04 * k, 0.3 * k, (0.012 * k, 0, -0.15 * k), M_PAPEL, 0.003, padre=e)
    caja(n + '-lomo', 0.02 * k, 0.052 * k, 0.32 * k, (-0.115 * k, 0, -0.16 * k), mat('lomo', '#02424E', 0.5), 0.003, padre=e)
    plano(n + '-etq', 0.12 * k, 0.05 * k, (0, -0.0262 * k, -0.08 * k), M_BLANCO, padre=e)
    return e


def tablet(n, loc, yaw=0, padre=None, rot=(0, 0, 0), archivo='grafico.png', k=1.0):
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-cuerpo', 0.3 * k, 0.012 * k, 0.21 * k, (0, 0, -0.105 * k), M_NEGRO, 0.004, padre=e)
    plano(n + '-pant', 0.28 * k, 0.19 * k, (0, -0.0065 * k, 0), mat_tex('mat-tab-' + archivo, archivo, emit=0.8), padre=e)
    return e


def blade(n, loc, yaw=0, padre=None, rot=(0, 0, 0), k=1.0):
    """Unidad de servidor en la mano con cables colgando."""
    e = vacio(n, loc, yaw, padre)
    e.rotation_euler = (rot[0], rot[1], yaw)
    caja(n + '-cuerpo', 0.34 * k, 0.2 * k, 0.07 * k, (0, 0, -0.035 * k), mat('rack', '#24343A', 0.4, 0.3), 0.006, padre=e)
    for j in range(4):
        caja(n + f'-led{j}', 0.02 * k, 0.01 * k, 0.015 * k, ((0.07 + j * 0.03) * k, -0.102 * k, 0), MATS.get('led-v') or mat('led-v', '#7FD3A8', 0.3, emit='#7FD3A8', emit_f=5), 0, padre=e)
    curva(n + '-cable1', [Vector((-0.12 * k, -0.1 * k, -0.01 * k)), Vector((-0.16 * k, -0.15 * k, -0.15 * k)), Vector((-0.1 * k, -0.12 * k, -0.3 * k))], 0.008 * k, M_CABLE2, padre=e)
    curva(n + '-cable2', [Vector((-0.08 * k, -0.1 * k, -0.01 * k)), Vector((-0.07 * k, -0.16 * k, -0.18 * k)), Vector((-0.02 * k, -0.12 * k, -0.26 * k))], 0.008 * k, M_CABLE3, padre=e)
    return e


# ------------------------------------------------------------------ roles
ROLES = {
    'orquestador': '#03677A', 'sincronizador': '#2F7FB0', 'vigia': '#7A5BA6', 'contador': '#1F6B4A',
    'evaluador': '#D9781F', 'analista': '#3B5BA9', 'estratega': '#B4532A', 'mensajero': '#D6A12A',
    'redactor': '#8E6C4A', 'archivista': '#5E7A82', 'lector': '#C2507A', 'abogado': '#1E2226',
}
GRUPOS = {}       # rol -> lista de objetos que forman su puesto (para el hotspot)
TIGOS = {}        # rol -> (arm, malla)
MANO = {}         # rol -> objetos que viajan con Tigo en el retrato
LEDS = {}


def puesto(rid):
    c = coleccion('rol-' + rid, C_OFI)
    COL_ACTUAL.append(c)
    return c


def fin_puesto():
    COL_ACTUAL.pop()


def en_local(base, yaw, p):
    """Punto local (x, y, z) de un puesto girado yaw sobre base -> mundo."""
    v = Matrix.Rotation(yaw, 4, 'Z') @ Vector(p)
    return Vector((base[0] + v.x, base[1] + v.y, v.z))


def tigo_mano(rid, objs):
    MANO.setdefault(rid, []).extend(objs)


def unidad(rid, base, yaw, sentado, brazos, extra, cabeza=(0, -0.05, 1), espina=None, tigo_off=(0, 0.62)):
    """Escritorio + silla (si sentado) + monitor + Tigo + extras(rid, base, yaw, arm, malla, alto_mesa)."""
    puesto(rid)
    color = ROLES[rid]
    pt = en_local(base, yaw, (tigo_off[0], tigo_off[1], 0))
    a, m = tigo('tigo-' + rid, rid, color, pt, yaw, brazos, sentado, cabeza, espina)
    fr = frente_torso(a, m, pt, yaw)
    oy = max(tigo_off[1], 0.375 + fr + 0.04)
    pt = en_local(base, yaw, (tigo_off[0], oy, 0))
    a.location.x, a.location.y = pt.x, pt.y
    upd()
    TIGOS[rid] = (a, m)
    tigo_mano(rid, [insignia('insignia-' + rid, a, m, '#F6A42C')])
    if sentado:
        zm0 = min(mano(a, 'L').z, mano(a, 'R').z) - 0.035 * S
        a.location.z += max(0.0, 0.64 - zm0)  # silla alta: los pies cuelgan, la mesa queda a la altura de las de pie
        upd()
        zs = asiento(a, m)
        silla('silla-' + rid, (pt.x, pt.y, 0), yaw, zs + 0.005)
        # mesa: un poco bajo las manos
        zm = min(mano(a, 'L').z, mano(a, 'R').z) - 0.035 * S
        zm = max(zm, zs + 0.24)
    else:
        zm = 0.72
    ALTO_MESA[rid] = zm
    BASES[rid] = (base, yaw, 0.95)
    d = escritorio('mesa-' + rid, 1.5, 0.75, zm, en_local(base, yaw, (0, 0, 0)), yaw)
    mx = -0.56 if tigo_off[0] >= 0 else 0.56
    _, led = monitor('monitor-' + rid, en_local(base, yaw, (mx, -0.08, zm)), yaw + math.radians(25), pantalla=len(LEDS), ancho=0.5)
    LEDS[rid] = led
    extra(rid, base, yaw, a, m, zm)
    fin_puesto()


ALTO_MESA = {}
BASES = {}  # rid -> (base, yaw, distancia del frente)

# ---------- extras por rol (accesorios del puesto y en la mano)
def x_sincronizador(rid, base, yaw, a, m, zm):
    servidor('rack-sinc', en_local(base, yaw, (1.45, 0.45, 0)), yaw - math.radians(15))
    servidor('rack-sinc2', en_local(base, yaw, (1.45, 1.12, 0)), yaw - math.radians(15), h=1.2)
    p0 = en_local(base, yaw, (1.15, 0.2, 0.9))
    p1 = en_local(base, yaw, (0.05, -0.1, zm + 0.02))
    for i, mm in enumerate((M_CABLE2, M_CABLE3, M_CABLE)):
        q0 = p0 + Vector((0, 0, -0.1 * i))
        mid = (q0 + p1) / 2 + Vector((0, 0, -0.35))
        curva(f'cable-sinc{i}', [q0, mid, p1 + Vector((0.04 * i, 0, 0))], 0.012, mm)
    pm = (mano(a, 'L') + mano(a, 'R')) / 2
    tigo_mano(rid, [blade('blade-sinc', pm + Vector((0, 0, 0.05)), yaw, rot=(0, 0, 0))])


def x_vigia(rid, base, yaw, a, m, zm):
    reloj_grande('reloj-vigia', en_local(base, yaw, (1.35, 0.5, 0)), yaw - math.radians(10), h=1.75)
    pr = mano(a, 'R')
    tigo_mano(rid, [despertador('desp-vigia', pr + Vector((0, 0, -0.04)), yaw, k=1.2)])
    calendario('cal-vigia', en_local(base, yaw, (-0.1, -0.1, zm)), yaw, k=0.7)


def x_contador(rid, base, yaw, a, m, zm):
    pm = (mano(a, 'L') + mano(a, 'R')) / 2
    c = calculadora('calc-contador', (pm.x, pm.y, zm + 0.002), yaw, k=1.6)
    tigo_mano(rid, [c])
    monedas('monedas-contador', en_local(base, yaw, (0.45, -0.15, zm)))
    monedas('monedas-contador2', en_local(base, yaw, (0.6, 0.05, zm)))


def x_evaluador(rid, base, yaw, a, m, zm):
    calendario('cal-evaluador', en_local(base, yaw, (0.42, -0.12, zm)), yaw - math.radians(15), k=1.3)
    pm = (mano(a, 'L') + mano(a, 'R')) / 2
    tigo_mano(rid, [tablet('tab-evaluador', pm + Vector((0, 0, 0.13)), yaw, rot=(math.radians(-30), 0, 0), archivo='calendario.png', k=1.1)])


def x_analista(rid, base, yaw, a, m, zm):
    caballete('tablero-analista', en_local(base, yaw, (-1.55, 0.7, 0)), yaw + math.radians(25), 'grafico.png', 1.2, 0.8, 0.85)
    pl = mano(a, 'L')
    tigo_mano(rid, [tablet('tab-analista', pl + Vector((0, 0, 0.08)), yaw + math.radians(10), rot=(math.radians(-15), 0, 0), k=1.0)])


def x_estratega(rid, base, yaw, a, m, zm):
    e, tabla = caballete('mapa-estratega', en_local(base, yaw, (-1.6, 0.7, 0)), yaw + math.radians(25), 'mapa.png', 1.3, 0.95, 0.75)
    for i, (u, v, col) in enumerate([(-0.35, 0.65, '#F6A42C'), (0.3, 0.6, '#1F6B4A'), (-0.1, 0.25, '#B4532A'), (0.4, 0.2, '#03677A')]):
        b = banderin(f'band-{i}', (u, -0.01, v), col, tabla, h=0.14)
        b.rotation_euler = (math.radians(-90), 0, 0)
    pl = mano(a, 'L')
    tigo_mano(rid, [banderin('band-mano', pl + Vector((0, 0, -0.05)), '#F6A42C', h=0.28)])


def x_mensajero(rid, base, yaw, a, m, zm):
    pr = mano(a, 'R')
    tigo_mano(rid, [celular('cel-mensajero', pr + Vector((0, 0, 0.1)), yaw + math.radians(20), k=1.2)])
    pl = mano(a, 'L')
    tigo_mano(rid, [sobre('sobre-mano', pl + Vector((0, 0, 0.005)), yaw, k=1.3, rot=(0, 0, 0))])
    for i in range(5):
        sobre(f'sobre-msj{i}', en_local(base, yaw, (0.45 + 0.01 * i, -0.1, zm + i * 0.014)), yaw + 0.08 * i)
    for i in range(3):
        sobre(f'sobre-msj-b{i}', en_local(base, yaw, (0.2, -0.2, zm + i * 0.014)), yaw - 0.1 * i, color='#DCEBEE')


def x_redactor(rid, base, yaw, a, m, zm):
    pr = mano(a, 'R')
    tigo_mano(rid, [pluma('pluma-redactor', pr + Vector((0, 0, 0.02)), rot=(math.radians(-20), math.radians(25), yaw), k=1.3)])
    pm = (mano(a, 'L') + mano(a, 'R')) / 2
    hoja = plano('hoja-redactor', 0.3, 0.4, (pm.x, pm.y, zm + 0.003), mat_tex('mat-papel', 'papel.png', rough=0.7), rot=(0, 0, yaw + 0.15))
    tigo_mano(rid, [hoja])
    for i in range(4):
        plano(f'pila-redactor{i}', 0.3, 0.4, en_local(base, yaw, (0.5, -0.1, zm + 0.003 + i * 0.004)), M_PAPEL, rot=(0, 0, yaw - 0.1 * i))
    tintero = cilindro('tintero', 0.045, 0.07, en_local(base, yaw, (0.32, 0.05, zm)), mat('tinta', '#1B2C4A', 0.2, coat=1), 24)


def x_archivista(rid, base, yaw, a, m, zm):
    for i in range(2):
        archivador(f'arch-{i}', en_local(base, yaw, (1.25 + i * 0.52, 0.6, 0)), yaw, cajones=4 if i != 1 else 3)
    pm = (mano(a, 'L') + mano(a, 'R')) / 2
    tigo_mano(rid, [carpeta('carp-mano', pm + Vector((0, 0, 0.14)), yaw, color='#F6A42C', k=1.2),
                    carpeta('carp-mano2', pm + Vector((0.0, 0.06, 0.16)), yaw, color='#03677A', k=1.2)])
    for i in range(3):
        carpeta(f'carp-mesa{i}', en_local(base, yaw, (0.45, -0.1, zm + 0.025 + i * 0.05)), yaw + 0.1 * i, rot=(math.pi / 2, 0, 0),
                color=['#03677A', '#F6A42C', '#1F6B4A'][i])


def x_lector(rid, base, yaw, a, m, zm):
    pr = mano(a, 'R')
    tigo_mano(rid, [lupa('lupa-lector', pr + Vector((0, 0, -0.02)), rot=(math.radians(-15), math.radians(-10), yaw), k=1.4)])
    pl = mano(a, 'L')
    tigo_mano(rid, [sobre('sobre-lector', pl + Vector((0, 0, 0.01)), yaw, k=1.3, color='#DCEBEE')])
    bandeja_correo('bandeja-lector', en_local(base, yaw, (0.42, -0.08, zm)), yaw - 0.2)


ORDEN = ['sincronizador', 'vigia', 'contador', 'evaluador', 'analista',
         'estratega', 'mensajero', 'redactor', 'archivista', 'lector']
APUNTA_R = ((-0.85, 0.05, 0.5), (-0.9, 0.0, 0.42))
CONF = {
    # rid: (sentado, (brazo L, brazo R), cabeza, posición local de Tigo respecto del escritorio)
    'sincronizador': (False, ('sostener', 'sostener'), (0.0, -0.15, 1), (0.42, 0.62)),
    'vigia': (False, ('cadera', 'sostener'), (0.3, -0.05, 1), (0.42, 0.62)),
    'contador': (True, ('teclear', 'teclear'), (0, -0.25, 1), (0.0, 0.62)),
    'evaluador': (True, ('sostener', 'sostener'), (0, -0.2, 1), (0.0, 0.62)),
    'analista': (False, ('sostener', APUNTA_R), (-0.3, -0.05, 1), (-0.4, 0.62)),
    'estratega': (False, ('sostener', APUNTA_R), (-0.3, -0.05, 1), (-0.4, 0.62)),
    'mensajero': (True, ('teclear', 'arriba'), (0.1, -0.15, 1), (0.0, 0.62)),
    'redactor': (True, ('teclear', 'teclear'), (0, -0.35, 1), (0.0, 0.62)),
    'archivista': (False, ('sostener', 'sostener'), (0.1, -0.1, 1), (0.42, 0.62)),
    'lector': (True, ('teclear', 'arriba'), (-0.12, -0.2, 1), (0.0, 0.62)),
}
EXTRAS = {'sincronizador': x_sincronizador, 'vigia': x_vigia, 'contador': x_contador, 'evaluador': x_evaluador,
          'analista': x_analista, 'estratega': x_estratega, 'mensajero': x_mensajero, 'redactor': x_redactor,
          'archivista': x_archivista, 'lector': x_lector}

# ------------------------------------------------------------------ edificio
X0, X1, Y0, Y1 = -8.6, 8.6, -6.2, 8.0
H_PARED = 2.9
COL_ACTUAL.append(coleccion('edificio', C_OFI))
caja('losa', X1 - X0 + 0.3, Y1 - Y0 + 0.3, 0.35, ((X0 + X1) / 2, (Y0 + Y1) / 2 - 0.0, -0.37), M_LOSA, 0.03)
piso = caja('piso', X1 - X0, Y1 - Y0, 0.02, ((X0 + X1) / 2, (Y0 + Y1) / 2, -0.02), M_PISO, 0)
# pared del fondo (+Y) y pared izquierda (-X)
caja('pared-fondo', X1 - X0 + 0.25, 0.22, H_PARED, ((X0 + X1) / 2 - 0.125, Y1 + 0.11, 0), M_PARED, 0.01)
caja('pared-izq', 0.22, Y1 - Y0, H_PARED, (X0 - 0.11, (Y0 + Y1) / 2, 0), M_PARED, 0.01)
caja('zocalo-fondo', X1 - X0, 0.03, 0.12, ((X0 + X1) / 2, Y1 - 0.015, 0), M_ZOCALO, 0)
caja('zocalo-izq', 0.03, Y1 - Y0, 0.12, (X0 + 0.015, (Y0 + Y1) / 2, 0), M_ZOCALO, 0)
# ventanales en la pared del fondo
for i, xv in enumerate([-2.0, 3.25]):
    caja(f'ventana-marco{i}', 2.1, 0.06, 1.7, (xv, Y1 - 0.02, 0.9), M_PATA, 0.01)
    plano(f'ventana-cielo{i}', 1.95, 1.55, (xv, Y1 - 0.06, 1.75), mat('cielo-ventana', '#CFE8EE', 0.2, emit='#DDF1F5', emit_f=1.2))
    caja(f'ventana-parteluz{i}', 0.05, 0.08, 1.55, (xv, Y1 - 0.08, 0.97), M_PATA, 0)
# franja de acento y rótulo en la pared izquierda
caja('acento-izq', 0.02, 7.5, 1.0, (X0 + 0.01, -1.2, 1.2), M_ACENTO, 0)
plano('rotulo-oficina', 4.2, 0.58, (X0 + 0.03, -1.2, 2.45), mat_tex('mat-logo', 'logo.png', rough=0.6, alpha=True), rot=(math.pi / 2, 0, math.pi / 2))
# cuadros en la pared izquierda
for i, (yy, col) in enumerate([(3.6, '#F6A42C'), (5.2, '#7FB3BC')]):
    caja(f'cuadro{i}', 0.04, 1.0, 0.7, (X0 + 0.04, yy, 1.25), mat('cuadro-marco', '#F7F7F5', 0.5), 0.005)
    plano(f'cuadro-arte{i}', 0.85, 0.55, (X0 + 0.065, yy, 1.6), mat('arte' + str(i), col, 0.7), rot=(math.pi / 2, 0, math.pi / 2))
# alfombras

# mampara esmerilada (separa la zona humana)
YM = 4.3
for i in range(8):
    xm = X0 + 1.0 + i * 1.95
    if 3 <= i <= 4:
        continue  # vano de paso en el centro (entre -0.9 y 2.9 aprox)
    caja(f'mampara-vidrio{i}', 1.9, 0.03, 1.75, (xm + 0.975, YM, 0.06), M_ESMER, 0)
    caja(f'mampara-perfil{i}', 0.05, 0.06, 1.85, (xm, YM, 0), M_ALU, 0)
caja('mampara-perfil-fin', 0.05, 0.06, 1.85, (X0 + 1.0 + 8 * 1.95, YM, 0), M_ALU, 0)
caja('mampara-perfil-a', 0.05, 0.06, 1.85, (X0 + 1.0 + 3 * 1.95, YM, 0), M_ALU, 0)
caja('mampara-zocalo', X1 - X0 - 1.0, 0.07, 0.06, ((X0 + 1.0 + X1) / 2, YM, 0), M_ALU, 0)
COL_ACTUAL.pop()

# ------------------------------------------------------------------ 10 puestos (orden del ciclo, en S)
FILA1, FILA2 = -0.8, 2.1
XS = [-6.3, -3.0, 0.3, 3.6, 6.9]
YAW = math.radians(22)
for i, rid in enumerate(ORDEN):
    fila = FILA1 if i < 5 else FILA2
    x = XS[i] if i < 5 else XS[9 - i]
    sentado, brazos, cabeza, off = CONF[rid]
    unidad(rid, (x, fila), YAW, sentado, brazos, EXTRAS[rid], cabeza, tigo_off=off)

# ------------------------------------------------------------------ Orquestador (al frente)
puesto('orquestador')
OB = (3.0, -5.0)
BASES['orquestador'] = (OB, YAW, 0.95)  # primera línea: frente y centro, lo más cerca de la cámara
caja('alfombra-orq', 5.0, 3.3, 0.012, en_local(OB, YAW, (-0.2, 0.7, 0)), M_ALFOMBRA, 0, rot=(0, 0, YAW))
d = vacio('mesa-orq', (OB[0], OB[1], 0), YAW)
caja('mesa-orq-tablero', 3.0, 1.0, 0.05, en_local((0, 0), 0, (0, 0, 0.7)), M_MADERA, 0.01, padre=d)
caja('mesa-orq-ala', 1.0, 1.2, 0.05, (1.0, 1.1, 0.7), M_MADERA, 0.01, padre=d)
caja('mesa-orq-frente', 2.9, 0.06, 0.68, (0, -0.42, 0.02), M_ACENTO, 0.01, padre=d)
caja('mesa-orq-lado', 0.06, 1.1, 0.68, (1.47, 1.1, 0.02), M_ACENTO, 0.01, padre=d)
caja('mesa-orq-pata', 0.06, 0.9, 0.7, (-1.45, 0, 0), M_PATA, 0.006, padre=d)
_, LEDS['orquestador'] = monitor('monitor-orq', en_local(OB, YAW, (-1.15, 0.15, 0.75)), YAW + math.radians(20), pantalla=2, ancho=0.7)
monitor('monitor-orq2', en_local(OB, YAW, (-0.5, 0.25, 0.75)), YAW + math.radians(5), pantalla=0, ancho=0.7)
planta('planta-orq', en_local(OB, YAW, (-2.3, 0.2, 0)), 1.0, m_maceta=M_MACETA2)
pz, tabla = caballete('pizarra-orq', en_local(OB, YAW, (-1.1, 2.05, 0)), YAW + math.radians(8), 'pizarra.png', 1.75, 1.1, 0.75,
                      marco=M_ALU)
pt = en_local(OB, YAW, (0.2, 1.0, 0))
a, m = tigo('tigo-orquestador', 'orquestador', ROLES['orquestador'], pt, YAW + math.radians(15),
            (((0.85, 0.0, 0.5), (0.9, 0.05, 0.42)), 'sostener_bajo'), False, (0.3, -0.1, 1))
TIGOS['orquestador'] = (a, m)
pr = mano(a, 'R')
tigo_mano('orquestador', [portapapeles('clip-orq', pr + Vector((0, 0, 0.17)), YAW + math.radians(15), rot=(math.radians(-25), 0, 0)),
                          silbato_cuello('silbato-orq', a, m)])
fin_puesto()

# ------------------------------------------------------------------ Abogado guardián (oficina de vidrio, salida a clientes)
puesto('abogado')
AX0, AX1, AY0, AY1 = 5.4, 8.6, -6.2, -3.1
HV = 2.3
PX = AX0 + 1.75  # centro de la puerta
for nombre, (cx, cy, dx, dy) in {
    'vid-n': ((AX0 + AX1) / 2, AY1, AX1 - AX0, 0.03),
    'vid-o': (AX0, (AY0 + AY1) / 2 + 0.7, 0.03, AY1 - AY0 - 1.4),
}.items():
    caja('abog-' + nombre, dx, dy, HV, (cx, cy, 0.0), M_VIDRIO, 0)
# frente (hacia los clientes) con la puerta de salida
caja('abog-vid-s1', PX - 0.6 - AX0, 0.03, HV, ((AX0 + PX - 0.6) / 2, AY0, 0), M_VIDRIO, 0)
caja('abog-vid-s2', AX1 - PX - 0.6, 0.03, HV, ((AX1 + PX + 0.6) / 2, AY0, 0), M_VIDRIO, 0)
caja('puerta-marco-a', 0.08, 0.1, 2.2, (PX - 0.55, AY0, 0), M_PATA, 0.006)
caja('puerta-marco-b', 0.08, 0.1, 2.2, (PX + 0.55, AY0, 0), M_PATA, 0.006)
caja('puerta-dintel', 1.18, 0.1, HV - 2.2, (PX, AY0, 2.2), M_PATA, 0.006)
puerta = caja('puerta-hoja', 1.02, 0.04, 2.15, (0, 0, 0), M_VIDRIO, 0)
puerta.location = (PX - 0.5, AY0, 0.02)
puerta.data.transform(Matrix.Translation((0.51, 0, 0)))
puerta.rotation_euler = (0, 0, math.radians(-35))
caja('puerta-tirador', 0.03, 0.05, 0.5, (PX + 0.35, AY0 - 0.32, 0.8), M_ALU, 0.005)
caja('felpudo', 1.3, 0.7, 0.015, (PX, AY0 + 0.45, 0), mat('felpudo', '#02232A', 0.95), 0.004)
# puerta hacia la oficina (vano en la pared oeste: lo deja el hueco de 1.4 m)
for x_ in (AX0, AX1):
    caja(f'abog-perfil{x_}', 0.06, 0.06, HV, (x_, AY1, 0), M_ALU, 0)
caja('abog-perfil-sup', AX1 - AX0, 0.06, 0.06, ((AX0 + AX1) / 2, AY1, HV), M_ALU, 0)
caja('abog-perfil-sup2', 0.06, AY1 - AY0, 0.06, (AX0, (AY0 + AY1) / 2, HV), M_ALU, 0)
caja('abog-perfil-sup3', AX1 - AX0, 0.06, 0.06, ((AX0 + AX1) / 2, AY0, HV), M_ALU, 0)
caja('abog-alfombra', 2.6, 2.4, 0.01, ((AX0 + AX1) / 2 + 0.2, (AY0 + AY1) / 2 + 0.2, 0), mat('alf-abog', '#5B2A33', 0.95), 0)
plano('rotulo-abogado', 1.6, 0.35, ((AX0 + AX1) / 2 + 0.3, AY1 - 0.02, HV - 0.32), mat_tex('mat-rot-abog', 'rotulo-abogado.png', rough=0.5),
      rot=(math.pi / 2, 0, 0))
plano('rotulo-salida', 1.1, 0.24, (PX, AY0 - 0.06, 2.42), mat_tex('mat-rot-salida', 'rotulo-salida.png', rough=0.5, emit=0.6),
      rot=(math.pi / 2, 0, 0))
AB = (7.2, -4.35)
ayaw = math.radians(35)
BASES["abogado"] = (AB, ayaw, 1.0)
escritorio('mesa-abogado', 1.6, 0.8, 0.74, en_local(AB, ayaw, (0, 0, 0)), ayaw, m=mat_madera('madera-osc', '#9B6B45', '#86593A'))
_, LEDS['abogado'] = monitor('monitor-abogado', en_local(AB, ayaw, (0.58, 0.05, 0.74)), ayaw + math.radians(10), pantalla=1, ancho=0.46)
balanza('balanza-mesa', en_local(AB, ayaw, (-0.5, -0.05, 0.74)), ayaw, k=1.2)
for i in range(3):
    carpeta(f'expediente{i}', en_local(AB, ayaw, (0.0, -0.15, 0.765 + i * 0.05)), ayaw + 0.12 * i, rot=(math.pi / 2, 0, 0),
            color=['#5B2A33', '#02424E', '#F6A42C'][i])
archivador('arch-abog', (AX1 - 0.45, AY1 - 0.5, 0), 0, cajones=4, color='#D9DEDF')
planta('planta-abog', (AX0 + 0.45, AY1 - 0.5, 0), 1.2)
pt = en_local(AB, ayaw, (-0.15, 0.7, 0))
a, m = tigo('tigo-abogado', 'abogado', ROLES['abogado'], pt, ayaw - math.radians(10),
            ('cadera', 'arriba'), False, (0.1, -0.1, 1))
TIGOS['abogado'] = (a, m)
tigo_mano('abogado', [corbata('corbata-abog', a, m, '#03677A')])
pr = mano(a, 'R')
tigo_mano('abogado', [balanza('balanza-mano', pr + Vector((0, 0, -0.33)), ayaw, k=0.9)])
fin_puesto()

# ------------------------------------------------------------------ zona humana (tras la mampara)
for hid, xh, rotulo in [('gestor', -4.8, 'rotulo-gestor.png'), ('legal', 0.9, 'rotulo-legal.png'), ('finanzas', 5.6, 'rotulo-finanzas.png')]:
    puesto(hid)
    hy = 6.5
    BASES[hid] = ((xh, hy), 0.0, 1.45)
    escritorio('mesa-' + hid, 1.8, 0.85, 0.74, (xh, hy, 0), 0)
    silla('silla-' + hid, (xh + 0.1, hy - 0.75, 0), math.radians(180 + 10), 0.47)
    _, LEDS[hid] = monitor('monitor-' + hid, (xh - 0.38, hy + 0.12, 0.74), math.radians(8), pantalla=len(LEDS))
    monitor('monitor2-' + hid, (xh + 0.38, hy + 0.12, 0.74), math.radians(-12), pantalla=len(LEDS) + 1)
    caja('teclado-' + hid, 0.45, 0.15, 0.02, (xh, hy - 0.2, 0.74), M_BLANCO, 0.004)
    caja('taza-' + hid, 0.08, 0.08, 0.1, (xh + 0.7, hy + 0.2, 0.74), M_AMBAR, 0.01) if False else \
        cilindro('taza-' + hid, 0.04, 0.1, (xh + 0.72, hy + 0.2, 0.74), M_AMBAR, 20)
    plano('rotulo-' + hid, 2.0 if hid != 'finanzas' else 2.4, 0.62, (xh, Y1 - 0.04, 1.95),
          mat_tex('mat-' + rotulo, rotulo, rough=0.5, emit=0.25), rot=(math.pi / 2, 0, 0))
    planta('planta-' + hid, (xh + 1.4, Y1 - 0.5, 0), 0.9, m_maceta=M_MACETA if hid != 'legal' else M_MACETA2, r=0.18)
    fin_puesto()

# plantas y detalles generales
COL_ACTUAL.append(coleccion('deco', C_OFI))
planta('planta-esq1', (X0 + 0.5, Y1 - 0.5, 0), 1.6, r=0.3)
planta('planta-esq2', (X0 + 0.5, -6.2, 0), 1.3, m_maceta=M_MACETA2)
planta('planta-pas1', (X0 + 0.5, -4.4, 0), 1.0)
planta('planta-mamp', (X0 + 0.55, YM - 0.5, 0), 1.0)
caja('dispensador', 0.35, 0.35, 1.1, (X0 + 0.45, 3.4, 0), M_BLANCO, 0.02)
cilindro('bidon', 0.14, 0.38, (X0 + 0.45, 3.4, 1.1), mat('bidon', (0.6, 0.85, 0.95, 1), 0.05, trans=0.8), 24)
COL_ACTUAL.pop()

# ------------------------------------------------------------------ luz y render
w = bpy.data.worlds.new('mundo')
sc.world = w
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = hexrgb('#E4ECEC')
bg.inputs['Strength'].default_value = 0.85

COL_ACTUAL.append(C_LUZ)
sd = bpy.data.lights.new('sol', 'SUN')
sd.energy = 4.0
sd.angle = math.radians(4)
sd.color = (1.0, 0.92, 0.82)
sol = bpy.data.objects.new('sol', sd)
enlazar(sol)
dir_sol = Vector((0.45, -1.0, 1.25)).normalized()
sol.rotation_euler = dir_sol.to_track_quat('Z', 'Y').to_euler()
ad = bpy.data.lights.new('relleno', 'AREA')
ad.energy = 2500
ad.size = 12
ad.color = (0.92, 0.97, 1.0)
rel = bpy.data.objects.new('relleno', ad)
enlazar(rel)
rel.location = (6, -12, 14)
rel.rotation_euler = (Vector((0, 0, 0)) - rel.location).to_track_quat('-Z', 'Y').to_euler()
COL_ACTUAL.pop()

sc.render.engine = 'CYCLES'
cy = sc.cycles
if not CPU:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    try:
        prefs.compute_device_type = 'OPTIX'
    except TypeError:
        prefs.compute_device_type = 'CUDA'
    prefs.get_devices()
    for dv in prefs.devices:
        dv.use = dv.type != 'CPU'
    cy.device = 'GPU'
else:
    cy.device = 'CPU'
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 8
cy.use_denoising = True
cy.max_bounces = 8
cy.transmission_bounces = 8
cy.caustics_reflective = False
cy.caustics_refractive = False
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
try:
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
except TypeError as e:
    print('look:', e)
sc.view_settings.exposure = 0.15

# ------------------------------------------------------------------ cámara isométrica
cam_d = bpy.data.cameras.new('cam')
cam_d.type = 'ORTHO'
cam = bpy.data.objects.new('cam', cam_d)
sc.collection.objects.link(cam)
sc.camera = cam
ELEV = math.radians(float(opt('--elev', '35')))


def objetos_malla(col=None, excluir=()):
    objs = []
    cols = [col] if col else [C_OFI]
    for c in cols:
        for o in c.all_objects:
            if o.type in ('MESH', 'CURVE') and o.name not in excluir:
                objs.append(o)
    return objs


def esquinas(o):
    if o.type == 'MESH' and o.parent and o.parent.type == 'ARMATURE':
        pts = verts_mundo(o)
        xs, ys, zs = [p.x for p in pts], [p.y for p in pts], [p.z for p in pts]
        return [Vector((x, y, z)) for x in (min(xs), max(xs)) for y in (min(ys), max(ys)) for z in (min(zs), max(zs))]
    return [o.matrix_world @ Vector(c) for c in o.bound_box]


def iso(azim_deg, res, margen=0.02, objs=None, desplaz=(0, 0)):
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    az = math.radians(azim_deg)
    cam.rotation_euler = (math.pi / 2 - ELEV, 0, az)
    upd()
    objs = objs or objetos_malla()
    pts = []
    for o in objs:
        if o.name.startswith(('losa',)) or not o.visible_get():
            pass
        pts.extend(esquinas(o))
    R = cam.rotation_euler.to_matrix()
    right, up, fwd = R @ Vector((1, 0, 0)), R @ Vector((0, 1, 0)), R @ Vector((0, 0, -1))
    us = [p.dot(right) for p in pts]
    vs = [p.dot(up) for p in pts]
    ws = [p.dot(fwd) for p in pts]
    cu, cv = (min(us) + max(us)) / 2, (min(vs) + max(vs)) / 2
    ancho, alto = max(us) - min(us), max(vs) - min(vs)
    asp = res[0] / res[1]
    escala = max(ancho, alto * asp) * (1 + 2 * margen)
    cam_d.ortho_scale = escala
    centro = right * (cu + desplaz[0] * escala) + up * (cv + desplaz[1] * escala / asp)
    cam.location = centro + fwd * (min(ws) - 30)
    cam_d.clip_start = 0.1
    cam_d.clip_end = 400
    upd()


def rect(objs):
    pts = []
    for o in objs:
        pts.extend(esquinas(o))
    cs = [world_to_camera_view(sc, cam, p) for p in pts]
    x0, x1 = min(c.x for c in cs), max(c.x for c in cs)
    y0, y1 = min(c.y for c in cs), max(c.y for c in cs)
    return {'x': round(x0 * 100, 2), 'y': round((1 - y1) * 100, 2), 'w': round((x1 - x0) * 100, 2), 'h': round((y1 - y0) * 100, 2)}


def punto(p):
    c = world_to_camera_view(sc, cam, p)
    return {'x': round(c.x * 100, 2), 'y': round((1 - c.y) * 100, 2)}


# ------------------------------------------------------------------ pasillos (grafo de caminos libres sobre el suelo)
PAS_EXCL = ('losa', 'piso', 'alfombra', 'abog-alfombra', 'felpudo', 'rotulo', 'acento', 'cuadro', 'ventana', 'zocalo', 'mampara-zocalo')
GR = 0.1


def ocupacion():
    nx, ny = int((X1 - X0) / GR) + 1, int((Y1 - Y0) / GR) + 1
    occ = [[False] * ny for _ in range(nx)]
    for o in C_OFI.all_objects:
        if o.type not in ('MESH', 'CURVE') or o.name.startswith(PAS_EXCL):
            continue
        pts = esquinas(o)
        if min(p.z for p in pts) > 1.3:
            continue
        P = [(p.x, p.y) for p in pts]
        P = sorted(set(P))
        def cr(o_, a_, b_):
            return (a_[0] - o_[0]) * (b_[1] - o_[1]) - (a_[1] - o_[1]) * (b_[0] - o_[0])
        lo, up_ = [], []
        for q in P:
            while len(lo) >= 2 and cr(lo[-2], lo[-1], q) <= 0:
                lo.pop()
            lo.append(q)
        for q in reversed(P):
            while len(up_) >= 2 and cr(up_[-2], up_[-1], q) <= 0:
                up_.pop()
            up_.append(q)
        H = lo[:-1] + up_[:-1]
        xs, ys = [q[0] for q in P], [q[1] for q in P]
        for i in range(max(0, int((min(xs) - X0) / GR)), min(nx, int((max(xs) - X0) / GR) + 2)):
            for j in range(max(0, int((min(ys) - Y0) / GR)), min(ny, int((max(ys) - Y0) / GR) + 2)):
                c = (X0 + i * GR, Y0 + j * GR)
                if len(H) < 3 or all(cr(H[k], H[(k + 1) % len(H)], c) >= -1e-9 for k in range(len(H))):
                    occ[i][j] = True
    return occ


def libre(occ, x, y, cl=0.28):
    if not (X0 + cl <= x <= X1 - cl and Y0 + 0.15 <= y <= Y1 - cl):
        return False
    r = int(cl / GR)
    i0, j0 = int(round((x - X0) / GR)), int(round((y - Y0) / GR))
    for i in range(i0 - r, i0 + r + 1):
        for j in range(j0 - r, j0 + r + 1):
            if (i - i0) ** 2 + (j - j0) ** 2 <= r * r and 0 <= i < len(occ) and 0 <= j < len(occ[0]) and occ[i][j]:
                return False
    return True


def ajustar(occ, x, y):
    if libre(occ, x, y):
        return (x, y)
    for rr in range(1, 9):
        cands = [(x + dx * GR, y + dy * GR) for dx in range(-rr, rr + 1) for dy in range(-rr, rr + 1) if max(abs(dx), abs(dy)) == rr]
        cands.sort(key=lambda c: (c[0] - x) ** 2 + (c[1] - y) ** 2)
        for c in cands:
            if libre(occ, *c):
                return c
    return None


def visible(occ, a_, b_):
    d = math.hypot(b_[0] - a_[0], b_[1] - a_[1])
    n = max(2, int(d / 0.05))
    return all(libre(occ, a_[0] + (b_[0] - a_[0]) * t / n, a_[1] + (b_[1] - a_[1]) * t / n, 0.24) for t in range(n + 1))


PASILLOS = None


def calcular_pasillos():
    global PASILLOS
    occ = ocupacion()
    crudos = [(-7.7, -2.2), (-4.6, -2.2), (-1.3, -2.25), (2.0, -2.25), (4.95, -2.2), (8.0, -2.2),
              (-7.6, 0.95), (-4.6, 0.95), (-1.3, 0.95), (2.0, 0.95), (5.2, 0.95), (8.0, 0.95),
              (0.0, -4.4), (4.95, -4.4), (4.95, -5.6), (6.1, -5.6), (6.9, -5.75), (8.0, 3.6), (-0.9, 3.7), (-0.9, 4.9), (-4.8, 5.1), (0.9, 5.1), (5.6, 5.1),
              (-7.7, 3.6)]
    nodos = {}
    k = 1
    for c in crudos:
        a_ = ajustar(occ, *c)
        if a_ is None:
            print('PASILLO descartado', c)
            continue
        nodos[f'p{k}'] = a_
        k += 1
    ids = list(nodos)
    aristas = []
    for i, u in enumerate(ids):
        for v in ids[i + 1:]:
            if math.dist(nodos[u], nodos[v]) <= 4.3 and visible(occ, nodos[u], nodos[v]):
                aristas.append([u, v])
    # frente de cada escritorio
    for rid, (base, yaw, dist) in BASES.items():
        q = en_local(base, yaw, (0, -dist, 0))
        a_ = ajustar(occ, q.x, q.y)
        if a_ is None:
            print('FRENTE sin lugar', rid)
            continue
        fid = 'frente_' + rid
        nodos[fid] = a_
        cer = sorted(ids, key=lambda v: math.dist(a_, nodos[v]))
        n = 0
        for v in cer:
            if visible(occ, a_, nodos[v]):
                aristas.append([fid, v])
                n += 1
                if n == 2:
                    break
        if n == 0:
            print('FRENTE aislado', rid, a_)
    # conectividad
    vis, pila = set(), ['p1']
    while pila:
        u = pila.pop()
        if u in vis:
            continue
        vis.add(u)
        pila += [b for a2, b in aristas if a2 == u] + [a2 for a2, b in aristas if b == u]
    print('PASILLOS nodos', len(nodos), 'aristas', len(aristas), 'desconectados', sorted(set(nodos) - vis))
    PASILLOS = (nodos, aristas)
    return PASILLOS


def hotspots(archivo):
    datos = {'imagen': os.path.basename(archivo).replace('.json', '.png'), 'resolucion': [sc.render.resolution_x, sc.render.resolution_y],
             'unidad': 'porcentaje del ancho (x, w) y del alto (y, h), origen arriba a la izquierda', 'roles': {}}
    for rid in ['orquestador', 'sincronizador', 'contador', 'evaluador', 'analista', 'estratega', 'abogado', 'mensajero',
                'lector', 'redactor', 'vigia', 'archivista', 'gestor', 'legal', 'finanzas']:
        c = bpy.data.collections['rol-' + rid]
        objs = [o for o in c.all_objects if o.type in ('MESH', 'CURVE')]
        if rid == 'abogado':  # escritorio + Tigo (la oficina de vidrio es más grande)
            objs = [o for o in objs if not o.name.startswith(('abog-', 'puerta', 'felpudo', 'rotulo', 'arch-abog', 'planta-abog'))]
        if rid == 'orquestador':
            objs = [o for o in objs if not o.name.startswith('planta')]
        r = rect(objs)
        led = LEDS[rid]
        r['led'] = punto(led.matrix_world.translation)
        datos['roles'][rid] = r
    nodos, aristas = PASILLOS or calcular_pasillos()
    datos['pasillos'] = {'unidad': 'porcentaje, punto en el suelo (z=0)',
                         'nodos': [dict(id=k_, **punto(Vector((v[0], v[1], 0.0)))) for k_, v in nodos.items()],
                         'aristas': aristas}
    with open(archivo, 'w') as f:
        json.dump(datos, f, indent=2, ensure_ascii=False)
    print('hotspots ->', archivo)


def render(ruta, muestras):
    cy.samples = muestras
    sc.render.filepath = ruta
    bpy.ops.render.render(write_still=True)
    print('render ->', ruta)


upd()
for rid, (a, m) in TIGOS.items():
    zmin = min(p.z for p in verts_mundo(m))
    print(f'TIGO {rid}: pies z={zmin:.3f} mesa={ALTO_MESA.get(rid, 0):.2f} cadera={hueso(a, "DEF-hips", False).z:.2f}')

res_txt = opt('--res')
mu = int(opt('--muestras', '4'))
# ------------------------------------------------------------------ modos
if MODO in ('construir', 'prueba', 'final'):
    res = tuple(map(int, res_txt.split('x'))) if res_txt else ((320, 200) if MODO in ('prueba', 'construir') else (2400, 1400))
    iso(45, res, 0.015)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'oficina.blend'), compress=True)
    if MODO == 'prueba':
        if opt('--recorte'):
            r = [float(v) for v in opt('--recorte').split(',')]
            sc.render.use_border = True
            sc.render.use_crop_to_border = True
            sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = r
        render(os.path.join(D, 'prueba.png'), mu)
        hotspots(os.path.join(D, 'prueba-hotspots.json'))
    if MODO == 'final':
        render(os.path.join(D, 'render', 'oficina-raw.png'), int(opt('--muestras', '256')))
        hotspots(os.path.join(D, 'hotspots.json'))

if MODO == 'movil':
    res = tuple(map(int, res_txt.split('x'))) if res_txt else (1200, 1600)
    iso(float(opt('--azim', '20')), res, 0.02)
    render(os.path.join(D, 'render', opt('--salida', 'oficina-movil-raw.png')), int(opt('--muestras', '200')))
    hotspots(os.path.join(D, 'hotspots-movil.json'))

if MODO == 'retratos':
    ids = [x for x in ARGS[1:] if x in ROLES] or list(ROLES)
    res = tuple(map(int, res_txt.split('x'))) if res_txt else (600, 600)
    sc.render.resolution_x, sc.render.resolution_y = res
    cam_d.type = 'PERSP'
    cam_d.lens = 85
    cam_d.sensor_width = 36
    # luz de estudio
    for o in C_LUZ.objects:
        o.hide_render = True
    COL_ACTUAL.append(C_EST)
    luces = []
    for nombre, energia, tam, col in [('clave', 260, 1.4, (1.0, 0.95, 0.88)), ('relleno-e', 90, 2.5, (0.9, 0.96, 1.0)),
                                      ('contra', 220, 1.0, (1.0, 0.9, 0.75))]:
        ld = bpy.data.lights.new(nombre, 'AREA')
        ld.energy = energia
        ld.size = tam
        ld.color = col
        lo = bpy.data.objects.new(nombre, ld)
        enlazar(lo)
        luces.append(lo)
    COL_ACTUAL.pop()
    bg.inputs['Color'].default_value = hexrgb('#E8EEF0')
    bg.inputs['Strength'].default_value = 0.6
    todos = [o for o in C_OFI.all_objects]
    os.makedirs(os.path.join(D, 'render'), exist_ok=True)
    for rid in ids:
        a, m = TIGOS[rid]
        visibles = {m.name} | {o.name for o in MANO.get(rid, [])}
        for x in MANO.get(rid, []):
            for ch in x.children_recursive:
                visibles.add(ch.name)
        for o in todos:
            o.hide_render = o.name not in visibles
        a.hide_render = False
        # objetivo: medio cuerpo (de la cadera a la punta de las orejas)
        pts = [p for p in verts_mundo(m)]
        zc = hueso(a, 'DEF-hips', False).z
        ztop = max(p.z for p in pts)
        z0 = zc - 0.01 * S
        sel = [p for p in pts if p.z >= z0]
        for x in MANO.get(rid, []):
            objs = [x] + list(x.children_recursive)
            for o in objs:
                if o.type in ('MESH', 'CURVE'):
                    sel.extend(esquinas(o))
        cx = sum(p.x for p in sel) / len(sel)
        cyy = sum(p.y for p in sel) / len(sel)
        objetivo = Vector((cx, cyy, (z0 + ztop) / 2 + 0.02))
        yaw = a.rotation_euler.z
        f = frente(yaw)
        lado = Vector((math.cos(yaw), math.sin(yaw), 0))
        dirc = (f * math.cos(math.radians(26)) - lado * math.sin(math.radians(26))).normalized()
        dirc.z = math.tan(math.radians(8))
        dirc.normalize()
        dist = 3.0
        for _ in range(30):
            cam.location = objetivo + dirc * dist
            cam.rotation_euler = (-dirc).to_track_quat('-Z', 'Y').to_euler()
            upd()
            cs = [world_to_camera_view(sc, cam, p) for p in sel]
            ext = max(max(abs(c.x - 0.5), abs(c.y - 0.5)) for c in cs)
            dist *= ext / 0.45
        # recentra (ligeramente arriba)
        cs = [world_to_camera_view(sc, cam, p) for p in sel]
        du = ((min(c.x for c in cs) + max(c.x for c in cs)) / 2 - 0.5)
        dv = ((min(c.y for c in cs) + max(c.y for c in cs)) / 2 - 0.5)
        Rm = cam.rotation_euler.to_matrix()
        anchura = 2 * dist * math.tan(math.atan(18 / 85))
        cam.location += Rm @ Vector((du * anchura, dv * anchura, 0))
        cam_d.clip_start = 0.05
        # luces relativas a la cámara
        izq = Vector((-dirc.y, dirc.x, 0)).normalized()
        posiciones = [objetivo + dirc * 2.2 + izq * 1.8 + Vector((0, 0, 1.6)),
                      objetivo + dirc * 2.6 - izq * 2.2 + Vector((0, 0, 0.4)),
                      objetivo - dirc * 1.8 - izq * 1.0 + Vector((0, 0, 1.4))]
        for lo, p in zip(luces, posiciones):
            lo.location = p
            lo.rotation_euler = (objetivo - p).to_track_quat('-Z', 'Y').to_euler()
        upd()
        render(os.path.join(D, 'render', f'tigo-{rid}-raw.png'), int(opt('--muestras', '160')))

if MODO == 'sprites':
    # misma cámara ortográfica que la vista general (2400x1400): misma escala aparente
    iso(45, (2400, 1400), 0.015)
    PPM = 2400 / cam_d.ortho_scale
    R = cam.rotation_euler.to_matrix()
    right, up, fwd = R @ Vector((1, 0, 0)), R @ Vector((0, 1, 0)), R @ Vector((0, 0, -1))
    print(f'SPRITE escala {PPM:.2f} px/m ortho={cam_d.ortho_scale:.3f}')
    O = Vector((0.0, -2.2, 0.0))
    COL_ACTUAL.append(coleccion('sprite'))
    a, m = tigo('tigo-sprite', 'mensajero', ROLES['mensajero'], O, 0.0)
    print('SPRITE rotation_mode', a.rotation_mode)
    a.rotation_mode = 'XYZ'
    for md in m.modifiers:
        if md.type == 'ARMATURE':
            md.object = a
    a.location.z = 0
    hand = 'DEF-hand.R'
    car = carpeta('carp-sprite', (0, 0, 0), 0, color='#F6A42C', k=0.85)
    COL_ACTUAL.pop()
    vis = {m.name} | {o.name for o in car.children_recursive}
    for o in bpy.data.objects:
        if o.type in ('MESH', 'CURVE'):
            o.hide_render = o.name not in vis
    a.animation_data_create()

    def usar(nombre):
        act = bpy.data.actions[nombre]
        a.animation_data.action = act
        if a.animation_data.action_slot is None and len(act.slots):
            a.animation_data.action_slot = act.slots[0]
        from bpy_extras.anim_utils import action_get_channelbag_for_slot
        cb = action_get_channelbag_for_slot(act, a.animation_data.action_slot)
        for fc in list(cb.fcurves):
            if not fc.data_path.startswith('pose.bones') or (fc.data_path.startswith('pose.bones["root"]') and 'location' in fc.data_path):
                print('SPRITE quito canal', act.name, fc.data_path, fc.array_index)
                cb.fcurves.remove(fc)
        return act

    def fijar_carpeta():
        car.parent = None
        sc.frame_set(0)
        upd()
        pb = a.pose.bones[hand]
        M = a.matrix_world @ pb.matrix
        car.parent = a
        car.parent_type = 'BONE'
        car.parent_bone = hand
        upd()
        hp = mano(a, 'R')
        des = Matrix.Translation(hp + Vector((0, 0, 0.03))) @ Euler((0, 0, a.rotation_euler.z + math.pi / 2)).to_matrix().to_4x4()
        car.matrix_world = des
        upd()

    DIRS = {'ne': math.pi, 'nw': -math.pi / 2, 'se': math.pi / 2, 'sw': 0.0}
    TRABAJOS = []
    for dn, yaw in DIRS.items():
        TRABAJOS.append(('camina-' + dn, 'Walk_Loop', yaw, 8, True))
    TRABAJOS.append(('habla-sw', 'Idle_Talking_Loop', 0.0, 6, False))

    def pts_frame():
        P = verts_mundo(m)
        if not car.hide_render:
            for o in car.children_recursive:
                if o.type in ('MESH', 'CURVE'):
                    P += esquinas(o)
        return P

    # 1) medidas: zmin por animación y caja en px respecto del ancla
    info = {}
    ext = [0, 0, 0, 0]  # izquierda, derecha, arriba, abajo (px desde el ancla)
    for nombre, accion, yaw, n, lleva in TRABAJOS:
        a.rotation_euler.z = yaw
        a.location = O
        act = usar(accion)
        f0, f1 = act.frame_range
        frames = [f0 + (f1 - f0) * i / n for i in range(n)]
        car.hide_render = not lleva
        for o in car.children_recursive:
            o.hide_render = not lleva
        if lleva:
            fijar_carpeta()
        zs, hips = [], []
        for f in frames:
            sc.frame_set(int(f), subframe=f - int(f))
            upd()
            zs.append(min(p.z for p in verts_mundo(m)))
            hips.append(hueso(a, 'DEF-hips', False))
        zmin = min(zs)
        print(f'SPRITE {nombre}: zmin={zmin:.3f} rango_z={max(zs)-zmin:.3f} deriva_xy={(hips[-1]-hips[0]).xy.length:.3f}')
        info[nombre] = (frames, -zmin, lleva, accion, yaw)
        a.location.z = -zmin
        for f in frames:
            sc.frame_set(int(f), subframe=f - int(f))
            upd()
            for p in pts_frame():
                d = p - O
                u, v = d.dot(right) * PPM, d.dot(up) * PPM
                ext[0], ext[1] = min(ext[0], u), max(ext[1], u)
                ext[2], ext[3] = max(ext[2], v), min(ext[3], v)
    mg = 3
    ax = math.ceil(max(-ext[0], ext[1]) + mg)
    FW = 2 * ax
    top = math.ceil(ext[2] + mg)
    bot = math.ceil(-ext[3] + mg)
    FH = top + bot
    FW += FW % 2
    FH += FH % 2
    ancla = (FW / 2, top)
    print('SPRITE cuadro', FW, FH, 'ancla', ancla, ext)
    sc.render.resolution_x, sc.render.resolution_y = FW, FH
    sc.render.resolution_percentage = 100
    cam_d.ortho_scale = max(FW, FH) / PPM
    # centro de la imagen = ancla desplazada
    centro = O + right * (0) + up * ((top - FH / 2) / PPM)
    cam.location = centro - fwd * 30
    cam_d.clip_start, cam_d.clip_end = 0.1, 100
    upd()
    cy.samples = int(opt('--muestras', '96'))
    os.makedirs(os.path.join(D, 'render', 'sprites'), exist_ok=True)
    meta = {'escala_px_por_m': round(PPM, 3), 'cuadro': [FW, FH], 'ancla': [ancla[0], ancla[1]], 'tiras': {}}
    for nombre, accion, yaw, n, lleva in TRABAJOS:
        frames, dz, lleva, accion, yaw = info[nombre]
        a.rotation_euler.z = yaw
        a.location = (O.x, O.y, dz)
        usar(accion)
        car.hide_render = not lleva
        for o in car.children_recursive:
            o.hide_render = not lleva
        if lleva:
            fijar_carpeta()
        for i, f in enumerate(frames):
            sc.frame_set(int(f), subframe=f - int(f))
            upd()
            render(os.path.join(D, 'render', 'sprites', f'{nombre}-{i}.png'), cy.samples)
        meta['tiras'][nombre] = {'cuadros': n, 'accion': accion}
    with open(os.path.join(D, 'render', 'sprites', 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=2)
