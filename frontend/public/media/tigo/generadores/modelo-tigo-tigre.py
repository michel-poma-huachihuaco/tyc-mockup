"""Tigo «más tigre»: parte de tigo.glb (decodificado en plano.glb), retoca la malla de la cabeza (orejas redondas,
hocico y nariz más anchos, patillas) y repinta la textura (rayas negras en cuña, blanco de tigre, pelaje más intenso).
Exporta crudo.glb (sin optimizar) en esta carpeta. No toca nada del repo."""
import bpy, math, os, sys, colorsys
import numpy as np
from mathutils import Matrix, Vector

D = os.path.dirname(os.path.abspath(__file__))
C = np.array((0.0, -0.012, 0.755))
R0 = 0.18
TEXN = 2048          # resolución de trabajo (se baja a 1024)

# ------------------------------------------------------------------ parámetros (iterar aquí)
P_ = dict(
    oreja_A=0.074, oreja_B=0.096,         # semiejes de la oreja nueva (ancho/2, alto)
    hocico_x=0.16, hocico_y=0.012, patilla=0.014, nariz_x=1.32, nariz_z=1.12,
    raya_col='#24150D', crema='#FFF8EC', nariz_col='#B8685C', oreja_dorso='#2A1A10',
)


def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def suave(x, a, b):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def direccion(az, el):
    a, e = math.radians(az), math.radians(el)
    return np.array((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))


def base_de(z):
    z = Vector(z).normalized()
    x = Vector((1, 0, 0)) if abs(z.x) < 0.9 else Vector((0, 1, 0))
    x = (x - z * x.dot(z)).normalized()
    y = z.cross(x)
    return np.array([[x[i], y[i], z[i]] for i in range(3)])


OREJAS = []
for s in (1, -1):
    b = C + direccion(40 * s, 42) * 0.162
    zloc = Vector((0.0, -1.0, 0.25)).normalized()
    arriba = Vector((0.52 * s, 0.12, 1.0)).normalized()
    R = base_de(Matrix.Rotation(math.radians(-14 * s), 3, arriba) @ zloc)
    zl = Vector(R[:, 2])
    yl = (arriba - zl * arriba.dot(zl)).normalized()
    xl = yl.cross(zl)
    R = np.array([[xl[i], yl[i], zl[i]] for i in range(3)])
    OREJAS.append((b, R, s))
O_ANCHO, O_ALTO, O_PUNTA = 0.15, 0.165, 0.016


def a_local(P, b, R):
    return (P - b) @ R          # columnas = ejes locales


def r_triangulo(phi, s):
    """Distancia desde (0,-0.01) al borde del triángulo de la oreja vieja en el ángulo phi (desde +y)."""
    o = np.array((0.0, -0.01))
    d = np.stack([np.sin(phi), np.cos(phi)], -1)
    best = np.full(phi.shape, 1e9)
    A, B, T = np.array((-O_ANCHO / 2, -0.01)), np.array((O_ANCHO / 2, -0.01)), np.array((O_PUNTA * s, O_ALTO))
    for p, q in ((A, T), (B, T)):
        e = q - p
        # o + t d = p + u e
        den = d[:, 0] * (-e[1]) - d[:, 1] * (-e[0])
        rx, ry = p[0] - o[0], p[1] - o[1]
        t = (rx * (-e[1]) - ry * (-e[0])) / np.where(np.abs(den) < 1e-9, 1e-9, den)
        u = (d[:, 0] * ry - d[:, 1] * rx) / np.where(np.abs(den) < 1e-9, 1e-9, den)
        ok = (t > 0) & (u >= -0.05) & (u <= 1.05)
        best = np.where(ok & (t < best), t, best)
    return np.where(best > 1.0, O_ANCHO / 2, best)


def r_nueva(phi):
    A, B = P_['oreja_A'], P_['oreja_B']
    return 1.0 / np.sqrt((np.sin(phi) / A) ** 2 + (np.cos(phi) / B) ** 2)


# ================================================================== carga
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(D, 'plano.glb'))
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
malla = bpy.data.objects['tigo-malla']
for o in list(bpy.data.objects):
    if o not in (arm, malla):
        bpy.data.objects.remove(o, do_unlink=True)
arm.animation_data.action = None
for pb in arm.pose.bones:
    pb.matrix_basis = Matrix()
bpy.context.view_layer.update()
me = malla.data
nv = len(me.vertices)
tris0 = sum(len(p.vertices) - 2 for p in me.polygons)
co = np.zeros(nv * 3, np.float32)
me.vertices.foreach_get('co', co)
co = co.reshape(-1, 3).astype(np.float64)
co0 = co.copy()

def pesos(nombres):
    w = np.zeros(nv)
    idx = {malla.vertex_groups[n].index for n in nombres if n in malla.vertex_groups}
    for v in me.vertices:
        for g in v.groups:
            if g.group in idx:
                w[v.index] += g.weight
    return w

w_cab = pesos(['DEF-head'])
lados = ('L', 'R')
w_brazo = pesos([f'DEF-{b}.{l}' for l in lados for b in ('upper_arm', 'forearm', 'hand')] +
                [g.name for g in malla.vertex_groups if g.name.startswith(('DEF-f_', 'DEF-thumb'))])
w_pierna = pesos([f'DEF-{b}.{l}' for l in lados for b in ('thigh', 'shin', 'foot', 'toe')])
mat_v = np.zeros(nv, int)
for p in me.polygons:
    for v in p.vertices:
        mat_v[v] = max(mat_v[v], p.material_index)

nariz_v = (mat_v == 2) & (np.abs(co[:, 0]) < 0.032) & (co[:, 2] < 0.74)
print('NARIZ', nariz_v.sum(), co[nariz_v].min(0).round(3), co[nariz_v].max(0).round(3))
assert nariz_v is not None

# ================================================================== malla
cab = (w_cab > 0.5) | (co[:, 2] > 0.62) & (mat_v != 1)
# 1) orejas: triángulo → media elipse
for b, R, s in OREJAS:
    L = a_local(co, b, R)
    lado = (co[:, 0] * s > 0.02) & cab
    sel = lado & (L[:, 1] > 0.0) & (np.abs(L[:, 2]) < 0.05) & (np.abs(L[:, 0]) < 0.11)
    Ls = L[sel]
    q = np.sqrt((((co[sel] - (C + np.array((0, 0.012, 0.015)))) / np.array((0.188, 0.172, 0.172))) ** 2).sum(1))
    w = suave(Ls[:, 1], 0.004, 0.04) * suave(q, 1.0, 1.07) * (1 - suave(np.abs(Ls[:, 0]), 0.085, 0.11))
    rel = Ls[:, :2] - np.array((0.0, -0.01))
    phi = np.arctan2(rel[:, 0], rel[:, 1])
    f = r_nueva(phi) / r_triangulo(phi, s)
    f = 1 + (f - 1) * w
    Ls[:, :2] = np.array((0.0, -0.01)) + rel * f[:, None]
    Ls[:, 2] *= 1 - 0.15 * w            # un poco más finas
    co[sel] = Ls @ R.T + b
    print('OREJA', s, sel.sum())

# 2) hocico más ancho y saliente; patillas (mejillas) hacia afuera
M = np.array((0.0, -0.14, 0.687))
d = np.sqrt((((co - M) / np.array((0.11, 0.09, 0.075))) ** 2).sum(1))
w = (1 - suave(d, 0.45, 1.0)) * (co[:, 1] < -0.04) * cab
co[:, 0] *= 1 + P_['hocico_x'] * w
co[:, 1] -= P_['hocico_y'] * w
co[:, 2] -= 0.003 * w
dd = co - C
az = np.degrees(np.arctan2(dd[:, 0], -dd[:, 1]))
el = np.degrees(np.arctan2(dd[:, 2], np.hypot(dd[:, 0], dd[:, 1])))
w2 = np.exp(-(((np.abs(az) - 78) / 24) ** 2) - ((el + 16) / 14) ** 2) * cab * (mat_v != 2)
co[:, 0] += np.sign(co[:, 0]) * P_['patilla'] * w2
co[:, 2] -= 0.004 * w2
# 3) nariz más ancha
cn = co[nariz_v].mean(0)
co[nariz_v, 0] = cn[0] + (co[nariz_v, 0] - cn[0]) * P_['nariz_x']
co[nariz_v, 2] = cn[2] + (co[nariz_v, 2] - cn[2]) * P_['nariz_z']
co[nariz_v, 1] -= 0.002

movido = np.linalg.norm(co - co0, axis=1) > 1e-6
print('VERTICES MOVIDOS', movido.sum())
# normales: guardar las de antes, recalcular donde se movió
n_viejas = np.array([l.vector[:] for l in me.corner_normals])
me.vertices.foreach_set('co', co.astype(np.float32).ravel())
if 'custom_normal' in me.attributes:
    me.attributes.remove(me.attributes['custom_normal'])
me.shade_smooth()
me.update()
n_nuevas = np.array([l.vector[:] for l in me.corner_normals])
cv = np.zeros(len(me.loops), int)
me.loops.foreach_get('vertex_index', cv)
mezcla = movido[cv][:, None]
me.normals_split_custom_set(np.where(mezcla, n_nuevas, n_viejas).tolist())
me.update()

# ================================================================== hornear posición, normal e info
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
try:
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'OPTIX'; pr.get_devices()
    for dv in pr.devices: dv.use = True
    sc.cycles.device = 'GPU'
except Exception as e:
    print('GPU', e)
sc.cycles.samples = 1
copia = malla.copy(); copia.data = me.copy(); copia.modifiers.clear(); copia.parent = None
copia.matrix_world = malla.matrix_world.copy()
sc.collection.objects.link(copia)
cm = copia.data
inf1 = cm.color_attributes.new('info1', 'FLOAT_COLOR', 'CORNER')
inf2 = cm.color_attributes.new('info2', 'FLOAT_COLOR', 'CORNER')
mat_l = np.zeros(len(cm.loops))
for p in cm.polygons:
    for li in p.loop_indices:
        mat_l[li] = p.material_index
a1 = np.stack([w_cab[cv], w_brazo[cv], w_pierna[cv], np.ones(len(cv))], 1)
a2 = np.stack([mat_l / 2, nariz_v[cv].astype(float), np.zeros(len(cv)), np.ones(len(cv))], 1)
inf1.data.foreach_set('color', a1.astype(np.float32).ravel())
inf2.data.foreach_set('color', a2.astype(np.float32).ravel())
bmat = bpy.data.materials.new('hornear'); bmat.use_nodes = True
nt = bmat.node_tree; nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
nt.links.new(em.outputs[0], out.inputs[0])
geo = nt.nodes.new('ShaderNodeNewGeometry'); at1 = nt.nodes.new('ShaderNodeAttribute'); at1.attribute_name = 'info1'
at2 = nt.nodes.new('ShaderNodeAttribute'); at2.attribute_name = 'info2'
tex = nt.nodes.new('ShaderNodeTexImage'); nt.nodes.active = tex
cm.materials.clear(); cm.materials.append(bmat)
for p in cm.polygons: p.material_index = 0
bpy.ops.object.select_all(action='DESELECT')
copia.select_set(True); bpy.context.view_layer.objects.active = copia
sc.render.bake.margin = 10; sc.render.bake.margin_type = 'EXTEND'; sc.render.bake.use_clear = True
mapas = {}
for nombre, sock in (('P', geo.outputs['Position']), ('N', geo.outputs['Normal']), ('I1', at1.outputs['Color']), ('I2', at2.outputs['Color'])):
    img = bpy.data.images.new('b_' + nombre, TEXN, TEXN, alpha=True, float_buffer=True)
    img.colorspace_settings.name = 'Non-Color'
    img.generated_color = (0, 0, 0, 0)
    tex.image = img
    for l in list(em.inputs[0].links): nt.links.remove(l)
    nt.links.new(sock, em.inputs[0])
    bpy.ops.object.bake(type='EMIT')
    a = np.zeros(TEXN * TEXN * 4, np.float32); img.pixels.foreach_get(a)
    mapas[nombre] = a.reshape(TEXN, TEXN, 4)
    print('HORNEADO', nombre)
bpy.data.objects.remove(copia, do_unlink=True)

# ================================================================== pintar
img0 = next(n.image for n in bpy.data.materials['tigo-pelaje'].node_tree.nodes if n.type == 'TEX_IMAGE')
W0 = img0.size[0]
a = np.zeros(W0 * W0 * 4, np.float32); img0.pixels.foreach_get(a)
orig = a.reshape(W0, W0, 4)[:, :, :3].astype(np.float64)
f_ = TEXN // W0
o2 = np.repeat(np.repeat(orig, f_, 0), f_, 1)
P = mapas['P'][:, :, :3].astype(np.float64)
N = mapas['N'][:, :, :3].astype(np.float64)
valido = mapas['P'][:, :, 3] > 0.5
mid = np.rint(mapas['I2'][:, :, 0] * 2)
es_nariz = (mapas['I2'][:, :, 1] > 0.5) & valido
wc, wb, wp = mapas['I1'][:, :, 0], mapas['I1'][:, :, 1], mapas['I1'][:, :, 2]
pel = valido & (mid == 0)
X, Y, Z = P[..., 0], P[..., 1], P[..., 2]


def blur(a, r):
    """caja (2r+1) con sumas acumuladas, separable."""
    p = np.pad(a, ((r + 1, r), (0, 0)), mode='edge'); c = np.cumsum(p, 0); a = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
    p = np.pad(a, ((0, 0), (r + 1, r)), mode='edge'); c = np.cumsum(p, 1); return (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)


def rgb_hsv(c):
    mx = c.max(-1); mn = c.min(-1); df = mx - mn + 1e-9
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    h = np.where(mx == r, ((g - b) / df) % 6, np.where(mx == g, (b - r) / df + 2, (r - g) / df + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx


def hsv_rgb(h, s, v):
    h = (h % 360) / 60; i = np.floor(h).astype(int) % 6; f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    r = np.choose(i, [v, q, p, p, t, v]); g = np.choose(i, [t, v, v, q, p, p]); b = np.choose(i, [p, p, t, v, v, q])
    return np.stack([r, g, b], -1)


col = o2.copy()
h, s_, v = rgb_hsv(o2)
lum = o2 @ np.array((0.2126, 0.7152, 0.0722))
lum_b = blur(lum, 10)
detalle = np.clip(lum / np.maximum(lum_b, 1e-3), 0.85, 1.12)[..., None]
naranja = pel & (h > 12) & (h < 48) & (s_ > 0.4) & (v > 0.3)
# rayas viejas (más oscuras que su entorno): a marrón oscuro
v_b = blur(v, 14)
vieja = naranja & (v < v_b * 0.9)
fuerza_vieja = suave(v / np.maximum(v_b, 1e-3), 0.92, 0.78) * vieja
# 5) pelaje más intenso
hn = h - 2.5; sn = np.clip(s_ * 1.16, 0, 1); vn = v * 0.975
col = np.where(naranja[..., None], hsv_rgb(hn, sn, vn), col)
RAYA = hexc(P_['raya_col']); CREMA = hexc(P_['crema'])

def pintar(mask, color, mod=True):
    global col
    m = np.clip(mask, 0, 1)[..., None]
    c = color * (detalle if mod else 1.0)
    col = col * (1 - m) + c * m

pintar(fuerza_vieja * 0.92, RAYA)

# ---------- cabeza: coordenadas de cara
dd = P - C
AZ = np.arctan2(dd[..., 0], -dd[..., 1]); EL = np.arctan2(dd[..., 2], np.hypot(dd[..., 0], dd[..., 1]))
U, V = AZ * np.cos(EL) * R0, EL * R0
azd, eld = np.degrees(np.abs(AZ)), np.degrees(EL)
es_cab = pel & (wc > 0.5) & (Z > 0.6)
# oreja (coordenadas locales con la forma nueva)
es_oreja = np.zeros(Z.shape, bool); OL = np.zeros(P.shape); rn = np.zeros(Z.shape)
for b, R, s in OREJAS:
    L = a_local(P.reshape(-1, 3), b, R).reshape(P.shape)
    rel_x, rel_y = L[..., 0], L[..., 1] + 0.01
    phi = np.arctan2(rel_x, rel_y)
    r = np.hypot(rel_x, rel_y) / r_nueva(phi.ravel()).reshape(phi.shape)
    m = es_cab & (X * s > 0.02) & (L[..., 1] > 0.012) & (np.abs(L[..., 2]) < 0.05) & (r < 1.35)
    es_oreja |= m; OL = np.where(m[..., None], L, OL); rn = np.where(m, r, rn)
cara = es_cab & ~es_oreja

def elipse(c, r, aa=0.004):
    q = np.sqrt(((U - c[0]) / r[0]) ** 2 + ((V - c[1]) / r[1]) ** 2)
    return 1 - suave((q - 1) * min(r), -aa, aa)


def trazo(pts, w0, w1, aa=0.0015):
    pts = np.asarray(pts, float)
    largos = np.linalg.norm(np.diff(pts, axis=0), axis=1); acum = np.concatenate([[0], np.cumsum(largos)]); total = acum[-1]
    dmin = np.full(U.shape, np.inf); tmin = np.zeros(U.shape)
    for i in range(len(pts) - 1):
        a_, b_ = pts[i], pts[i + 1]; ab = b_ - a_
        t = np.clip(((U - a_[0]) * ab[0] + (V - a_[1]) * ab[1]) / max(ab.dot(ab), 1e-12), 0, 1)
        d = np.hypot(U - (a_[0] + t * ab[0]), V - (a_[1] + t * ab[1]))
        mm = d < dmin; dmin = np.where(mm, d, dmin); tmin = np.where(mm, (acum[i] + t * largos[i]) / total, tmin)
    medio = (w0 + (w1 - w0) * tmin) / 2
    return 1 - suave(dmin - medio, -aa, aa)


def cuna(azd, eld, az0, az1, e0, pend, wmax, curva=0.0):
    """Raya en cuña en (acimut, elevación): fina en az0, gruesa en az1."""
    t = (azd - az0) / (az1 - az0)
    c = e0 + pend * (azd - az0) + curva * ((azd - az0) / 10) ** 2
    w = wmax * np.sqrt(np.clip(t, 0, 1)) * (1 - suave(t, 0.92, 1.05))
    return (1 - suave(np.abs(eld - c) - w, -0.35, 0.35)) * (t > 0) * (w > 0.15)

# 3,4) blanco del tigre: hocico ancho, barbilla, patillas, cejas, garganta
no_oscuro = suave(lum, 0.18, 0.32)
blanco = np.maximum.reduce([
    elipse((0, -0.088), (0.08, 0.052)),
    elipse((0, -0.128), (0.06, 0.036)),
    suave(eld - (-15 + 11 * suave(azd, 18, 62)), 2.5, -2.5) * (1 - suave(azd, 92, 108)),
    elipse((0.07, 0.054), (0.026, 0.011), 0.0015), elipse((-0.07, 0.054), (0.026, 0.011), 0.0015),
    suave(eld, -26, -38),
])
pintar(cara * blanco * no_oscuro, CREMA)
# quitar los bigotes pintados de gato (quedan los puntitos)
bigote = np.zeros(U.shape)
for sg in (1, -1):
    bigote = np.maximum(bigote, trazo([(sg * 0.062, -0.05), (sg * 0.16, -0.047)], 0.011, 0.008))
    bigote = np.maximum(bigote, trazo([(sg * 0.062, -0.066), (sg * 0.155, -0.054)], 0.011, 0.008))
pintar(cara * bigote, CREMA, mod=False)
# borrar las dos rayas curvas viejas de la frente (quedan el «王» y la vertical)
viejas = np.zeros(U.shape)
for sg in (1, -1):
    pts = []
    tt = np.linspace(0, 1, 28)[:, None]
    p0, p1, p2, p3 = map(np.array, ((sg * 0.0818, 0.134), (sg * 0.0655, 0.095), (sg * 0.0655, 0.077), (sg * 0.0795, 0.058)))
    pts = (1 - tt) ** 3 * p0 + 3 * (1 - tt) ** 2 * tt * p1 + 3 * (1 - tt) * tt * tt * p2 + tt ** 3 * p3
    viejas = np.maximum(viejas, trazo(pts, 0.05, 0.042, 0.004))
mv = np.clip(cara * viejas * (1 - blanco), 0, 1)
k_ = (1 - suave(mv, 0.02, 0.2)) * cara * naranja * (rgb_hsv(col)[2] > 0.55) * (1 - blanco)
bk = blur(k_, 30)
relleno = np.stack([blur(col[..., i] * k_, 30) for i in range(3)], -1) / np.maximum(bk, 1e-3)[..., None]
sel_m = (k_ > 0.5) & (Z > 0.8)
mediana = np.median(col[sel_m], 0) if sel_m.sum() > 100 else hexc('#E8862A')
print('MEDIANA', mediana, sel_m.sum())
wk = suave(bk, 0.03, 0.15)[..., None]
relleno = relleno * wk + mediana * (1 - wk)
col = col * (1 - mv[..., None]) + relleno * mv[..., None]
# 2) rayas de la cara
r_cara = np.zeros(U.shape)
# frente «王»: tres barras horizontales que se afinan a los lados + la vertical del medio
for V0, hw, th in ((0.09, 0.05, 0.015), (0.118, 0.044, 0.0135), (0.146, 0.034, 0.012)):
    t = np.clip(np.abs(U) / hw, 0, 1.2)
    c = V0 - 0.5 * U ** 2 / hw
    grosor = th * (1 - t ** 2.2)
    r_cara = np.maximum(r_cara, (1 - suave(np.abs(V - c) - grosor / 2, -0.0012, 0.0012)) * (t < 1))
r_cara = np.maximum(r_cara, trazo([(0, 0.172), (0, 0.08)], 0.022, 0.009))
# mejillas: cuñas que apuntan al hocico, sobre el blanco
for az0, az1, e0, pend, wm in ((50, 100, -14, 0.06, 4.2), (56, 102, -27, -0.04, 3.6), (64, 104, 4, 0.10, 3.4)):
    r_cara = np.maximum(r_cara, cuna(azd, eld, az0, az1, e0, pend, wm))
# coronilla: rayas que bajan de la nuca hacia la frente entre las orejas
for ac in (13, 30):
    t = (eld - 50) / 30
    w = 4.0 * np.sqrt(np.clip(t, 0, 1)) * (eld < 86)
    r_cara = np.maximum(r_cara, (1 - suave(np.abs(azd - ac - 0.25 * (eld - 50)) - w, -0.5, 0.5)) * (t > 0) * (w > 0.2))
# costados y nuca, más gruesas
for e0, w0 in ((34, 4.6), (16, 5.2), (-2, 4.4)):
    c = e0 + 0.22 * (azd - 100)
    w = w0 * suave(azd, 96, 116) * (1 - suave(azd, 128, 140))
    r_cara = np.maximum(r_cara, (1 - suave(np.abs(eld - c) - w, -0.35, 0.35)) * (w > 0.2))
for e0 in (6, 22, 38, 54, 70):
    c = e0 + 0.28 * (180 - azd)
    w = 3.8 * suave(azd, 132, 152)
    r_cara = np.maximum(r_cara, (1 - suave(np.abs(eld - c) - w, -0.35, 0.35)) * (w > 0.2))
r_cara *= no_oscuro * (1 - elipse((0, -0.075), (0.05, 0.04)))      # nunca sobre la boca ni la nariz
pintar(cara * r_cara, RAYA)

# 1) orejas: borde oscuro, dorso oscuro con ocelo blanco, adentro crema
OSC = hexc(P_['oreja_dorso'])
frente = suave(OL[..., 2], -0.003, 0.004)
borde = suave(rn, 0.72, 0.84)
ocelo = 1 - suave(np.hypot(OL[..., 0] / 0.03, (OL[..., 1] - 0.042) / 0.026), 0.85, 1.0)
interior = (1 - suave(np.hypot(OL[..., 0] / 0.032, (OL[..., 1] - 0.03) / 0.03), 0.75, 1.0)) * frente
pintar(es_oreja * (1 - frente) * suave(OL[..., 1], 0.012, 0.03), OSC)
pintar(es_oreja * (1 - frente) * ocelo, CREMA)
pintar(es_oreja * interior * (1 - borde) * 0.85, hexc('#F2DCC2'))
pintar(es_oreja * borde * suave(OL[..., 1], 0.02, 0.035), OSC)

# ---------- cuerpo: brazos, piernas, cola
hand_x = arm.data.bones['DEF-hand.L'].head_local.x
ax = np.abs(X)
cuerpo = pel & ~es_cab


def anillos(s, ancho, aa=0.05):
    d = np.abs(s - np.rint(s))
    return 1 - suave(d - ancho / 2, -aa, aa)

ond = 0.12 * np.sin(Y * 90 + Z * 70)
brazo = cuerpo & (wb > 0.5) & (ax < hand_x - 0.004)
tope = np.clip(N[..., 2] * 0.85 + N[..., 1] * 0.35, -1, 1)
s_b = (ax - 0.262) / 0.036 + ond + 0.25 * N[..., 1]
pintar(brazo * anillos(s_b, 0.42 * suave(tope, -0.2, 0.8)), RAYA)
pie_z = arm.data.bones['DEF-foot.L'].head_local.z
pierna = cuerpo & (wp > 0.5) & (Z > pie_z + 0.012) & (Z < 0.262)
fuera = np.clip(N[..., 0] * np.sign(X) * 0.8 + N[..., 1] * 0.55, -1, 1)
s_p = (0.252 - Z) / 0.036 + ond + 0.2 * N[..., 1]
pintar(pierna * anillos(s_p, 0.44 * suave(fuera, -0.3, 0.75)), RAYA)
cola = cuerpo & (Y > 0.1) & (Z > 0.19) & (Z < 0.36) & (ax < 0.07)
s_c = ((Y - 0.1) + (Z - 0.235)) * 17.0 + 0.5
pintar(cola * anillos(s_c, 0.34), RAYA)

# nariz: rojo → rosado marrón (conserva contorno y brillo)
roja = es_nariz & ((h < 20) | (h > 340)) & (s_ > 0.4)
NC = hexc(P_['nariz_col'])
col = np.where(roja[..., None], NC * np.clip(v / 0.91, 0.6, 1.1)[..., None], col)

col = np.where(valido[..., None], col, o2)
# bajar a 1024
nuevo = col.reshape(W0, f_, W0, f_, 3).mean((1, 3))
img = bpy.data.images.new('tigo-textura', W0, W0, alpha=False)
img.pixels.foreach_set(np.concatenate([np.clip(nuevo, 0, 1), np.ones((W0, W0, 1))], -1).astype(np.float32).ravel())
img.filepath_raw = os.path.join(D, 'tigo-tigre-textura.png'); img.file_format = 'PNG'; img.save()
img.file_format = 'JPEG'
img.pack()
for mname in ('tigo-pelaje', 'tigo-polo', 'tigo-brillo'):
    for n in bpy.data.materials[mname].node_tree.nodes:
        if n.type == 'TEX_IMAGE':
            n.image = img
bpy.data.images.remove(img0)
for nm in list(bpy.data.images):
    if nm.name.startswith('b_'):
        bpy.data.images.remove(nm)
bpy.data.materials.remove(bmat)

tris1 = sum(len(p.vertices) - 2 for p in me.polygons)
print('TRIANGULOS', tris0, '->', tris1)
# ================================================================== exportar
arm.animation_data.action = None
for pb in arm.pose.bones:
    pb.matrix_basis = Matrix()
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True); malla.select_set(True); bpy.context.view_layer.objects.active = arm
crudo = os.path.join(D, 'crudo.glb')
bpy.ops.export_scene.gltf(
    filepath=crudo, export_format='GLB', use_selection=True, export_yup=True, export_apply=False,
    export_texcoords=True, export_normals=True, export_tangents=False, export_materials='EXPORT',
    export_image_format='JPEG', export_jpeg_quality=90, export_vertex_color='MATERIAL', export_attributes=False,
    export_skins=True, export_all_influences=False, export_def_bones=False, export_animations=True,
    export_animation_mode='ACTIONS', export_force_sampling=True, export_frame_step=1,
    export_optimize_animation_size=True, export_morph=False, export_cameras=False, export_lights=False,
    export_extras=False)
print('CRUDO', os.path.getsize(crudo) // 1024, 'KB')
