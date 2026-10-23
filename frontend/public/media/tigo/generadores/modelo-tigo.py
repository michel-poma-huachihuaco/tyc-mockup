"""Tigo 3D propio (propuesta) para la guía de la compra (public/media/tigo/modelos/tigo-propuesta.glb).

Un tigre mascota estilizado (tipo película animada) hecho en Blender sin interfaz, que guia.js puede cargar en lugar
del Tigo provisional. Se parece a la carita SVG `#tigo` (resources/views/tigo/partials/iconos-compra.blade.php):
pelaje #F09A3E con rayas #B85F1E (las tres de la frente como en la carita), ojos negros ovalados con su brillo, nariz
roja #E8503A, boca en «w» y bigotes pintados, orejas puntiagudas, hocico crema, polo liso azul petróleo #02424E con
la marca de Aybar (Λ blanca con la Λ ámbar #F6A42C) en el pecho, manos de cuatro dedos con el índice separado, pies
de peluche y cola corta.

Esqueleto: el de persona.glb (Quaternius UAL, CC0): los mismos 53 huesos `DEF-*` con los mismos nombres, jerarquía y
orientaciones, y sus clips (Idle_Loop, Walk_Loop, Idle_Talking_Loop y Jog_Fwd_Loop). Solo cambian los LARGOS y la
posición de los huesos en reposo (piernas y tronco cortos, cabeza grande): como cada hueso conserva su dirección y
su «roll», una rotación de un clip significa lo mismo que en persona.glb. La traslación de la cadera de cada clip se
escala con el largo de las piernas para que los pies sigan apoyados. Los dedos no los anima ningún clip: se dejan
un poco doblados (mano relajada).

Se modela con campos de distancia (SDF) en numpy, uniones suaves y openvdb (viene con Blender) para sacar la malla;
luego se reduce con Decimate simétrico, se pesa con pesos automáticos (calor) limitados a 4 huesos y normalizados,
se pinta con nodos procedurales + máscaras dibujadas por este script (cara y logo) y se hornea con Cycles en UNA
textura de 1024 px. Al final se exporta a glTF y se comprime con @gltf-transform/cli 4 (meshopt EXT +
cuantización), igual que los otros .glb del proyecto.

Ejes: metros, ~1 m de alto, frente hacia −Y en Blender (+Z en three), pies en Z=0.

Uso (desde la raíz del repo):
    blender -b --python scripts/tigo/modelo-tigo.py
    blender -b --python scripts/tigo/modelo-tigo.py -- --render docs/superpowers/plans/progreso/capturas
    opciones:  --salida RUTA     otro .glb de salida (por defecto public/media/tigo/modelos/tigo-propuesta.glb)
               --render DIR      además saca las capturas T-*.png en DIR
               --tmp DIR         carpeta de trabajo (por defecto <tmp>/tigo-modelo-tigo)
               --sin-optimizar   deja solo el GLB crudo de Blender en la carpeta de trabajo
               --sin-fortachon   no aplica el físico «fortachón» (por defecto sí, ver abajo)
               --etapa malla     se detiene después de modelar (vistas de prueba en --tmp)
Requiere Node y @gltf-transform/cli@4 en la caché de npx (no descarga nada: lo busca en ~/.npm/_npx).
Determinista: no hay azar en numpy (semilla fija por si se agrega) y el ruido de los nodos es procedural.
NO escribe tigo.glb: ese nombre lo carga la página sola; se renombra cuando el usuario aprueba la propuesta.

Físico «fortachón» (pedido 9 del cliente, 16 de octubre de 2026: menos panza y cintura, pecho, hombros y brazos un
poco más fuertes): el modelado de abajo es el de octubre 9 y, al final, después de optimizar, se le pasa
scripts/tigo/modelo-tigo-fortachon.mjs, que solo mueve los vértices del cuerpo en reposo (no la cabeza, los huesos,
los pesos, las UV, la textura ni los clips). Así tigo.glb y tigo-propuesta.glb (que modelo-tigo-boca.py hace a partir
de tigo.glb) salen con el mismo físico. --sin-fortachon deja el físico anterior.
"""
import argparse
import glob
import math
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import zlib

import bmesh
import bpy
import numpy as np
import openvdb
from bpy_extras.anim_utils import action_get_channelbag_for_slot
from mathutils import Matrix, Quaternion, Vector

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PERSONA = os.path.join(RAIZ, 'public', 'media', 'tigo', 'modelos', 'persona.glb')
SALIDA = os.path.join(RAIZ, 'public', 'media', 'tigo', 'modelos', 'tigo-propuesta.glb')
SEMILLA = 7
np.random.seed(SEMILLA)

# Clips de persona.glb que se conservan (guia.js: quieto, caminar, hablar, correr).
CLIPS = ['Idle_Loop', 'Walk_Loop', 'Idle_Talking_Loop', 'Jog_Fwd_Loop']


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def lineal(c):
    """sRGB → lineal (Blender trabaja en lineal)."""
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


COLOR = {k: hex_rgb(v) for k, v in {
    'pelaje': '#F09A3E', 'lomo': '#DE7E2E', 'raya': '#B85F1E', 'crema': '#FFF1DC', 'oscuro': '#1B1A18',
    'nariz': '#E8503A', 'oreja': '#F7B97E', 'polo': '#02424E', 'ambar': '#F6A42C', 'blanco': '#F4F1EA',
}.items()}

# ------------------------------------------------------------------------------------------------- medidas
# Todo en metros, en la pose de reposo (en T, mirando a −Y). Lado izquierdo del personaje = +X.
CADERA_Z = 0.30          # cabeza del muslo (articulación de la cadera)
CADERA_X = 0.08
MUSLO, CANILLA, PIE, DEDO_PIE = 0.12, 0.125, 0.08, 0.06
HOMBRO = Vector((0.165, 0.015, 0.535))   # cabeza de DEF-upper_arm.L
BRAZO, ANTEBRAZO, MANO = 0.12, 0.11, 0.035
CUELLO = 0.15            # largo de DEF-neck: el pivote de la cabeza queda dentro de la cabeza
ABRIR_BRAZOS = 0.0       # grados: separa los brazos del cuerpo en todos los clips (reposo rotado)
CABEZA_C = Vector((0.0, -0.012, 0.755))  # centro de la cabeza
CABEZA_R = (0.188, 0.172, 0.172)
DOBLADILLO_Z = 0.255     # borde de abajo del polo
MANGA_X = 0.245          # fin de la manga corta


def args():
    p = argparse.ArgumentParser()
    p.add_argument('--salida', default=SALIDA)
    p.add_argument('--render', default=None)
    p.add_argument('--tmp', default=os.path.join(tempfile.gettempdir(), 'tigo-modelo-tigo'))
    p.add_argument('--sin-optimizar', action='store_true')
    p.add_argument('--sin-fortachon', action='store_true')
    p.add_argument('--etapa', default='todo', choices=['malla', 'todo'])
    a = p.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    if os.path.basename(a.salida) == 'tigo.glb':
        sys.exit('No escribo tigo.glb: la página lo cargaría sola. Usa tigo-propuesta.glb y renómbralo al aprobarlo.')
    os.makedirs(a.tmp, exist_ok=True)
    return a


def log(*m):
    print('[tigo]', *m, flush=True)


# ================================================================================================ esqueleto
def cargar_persona():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=PERSONA)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    for o in list(bpy.data.objects):
        if o is not arm:
            bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m)
    arm.name = 'tigo'
    arm.data.name = 'tigo-esqueleto'
    ad = arm.animation_data
    ad.action = None
    for t in list(ad.nla_tracks):
        if not t.strips or t.strips[0].action.name not in CLIPS:
            ad.nla_tracks.remove(t)
    for a in list(bpy.data.actions):
        if a.name not in CLIPS:
            bpy.data.actions.remove(a)
    return arm


def rotar_en(m_pivote, eje, grados):
    """Matriz 4×4 que rota `grados` alrededor de `eje` pasando por el punto `m_pivote`."""
    return Matrix.Translation(m_pivote) @ Matrix.Rotation(math.radians(grados), 4, eje) @ Matrix.Translation(-m_pivote)


# Dedos (mano izquierda; la derecha es el espejo en X). Base respecto de la muñeca, dirección, largos de las tres
# falanges y cuánto se dobla cada una (mano relajada). El meñique no tiene malla: el anular lleva los dos.
DEDOS = {
    'f_index': ((0.052, -0.025, 0.003), (1, -0.10, -0.02), (0.016, 0.013, 0.011), (4, 8, 6)),
    'f_middle': ((0.056, 0.001, 0.004), (1, 0.0, -0.02), (0.017, 0.014, 0.011), (7, 12, 9)),
    'f_ring': ((0.051, 0.026, 0.002), (1, 0.11, -0.03), (0.015, 0.013, 0.010), (9, 14, 10)),
    'f_pinky': ((0.049, 0.029, 0.000), (1, 0.13, -0.03), (0.014, 0.012, 0.010), (9, 14, 10)),
    'thumb': ((0.016, -0.03, -0.006), (0.5, -0.82, -0.2), (0.016, 0.014, 0.011), (4, 9, 7)),
}


def proporciones(arm):
    """Cambia el largo y la posición de los huesos en reposo; conserva dirección y roll (salvo los dedos)."""
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones
    viejo = {b.name: (b.head.copy(), b.tail.copy(), b.roll) for b in eb}
    dir_ = {n: (t - h).normalized() for n, (h, t, _) in viejo.items()}
    P, L = {}, {}
    P['root'], L['root'] = Vector((0, 0, 0)), 0.25
    P['DEF-hips'], L['DEF-hips'] = Vector((0, 0.03, 0.292)), 0.06
    P['DEF-spine.001'] = Vector((0, 0.012, 0.33))
    P['DEF-spine.002'] = Vector((0, 0.004, 0.39))
    P['DEF-spine.003'] = Vector((0, 0.004, 0.45))
    P['DEF-neck'] = Vector((0, 0.008, 0.545))
    L['DEF-spine.001'] = (P['DEF-spine.002'] - P['DEF-spine.001']).length
    L['DEF-spine.002'] = (P['DEF-spine.003'] - P['DEF-spine.002']).length
    L['DEF-spine.003'] = (P['DEF-neck'] - P['DEF-spine.003']).length
    L['DEF-neck'] = CUELLO
    P['DEF-head'] = P['DEF-neck'] + dir_['DEF-neck'] * CUELLO
    L['DEF-head'] = 0.2
    for lado, s in (('L', 1), ('R', -1)):
        P['DEF-shoulder.' + lado], L['DEF-shoulder.' + lado] = Vector((0.03 * s, -0.01, 0.52)), 0.12
        ua = 'DEF-upper_arm.' + lado
        P[ua], L[ua] = Vector((HOMBRO.x * s, HOMBRO.y, HOMBRO.z)), BRAZO
        P['DEF-forearm.' + lado] = P[ua] + dir_[ua] * BRAZO
        L['DEF-forearm.' + lado] = ANTEBRAZO
        P['DEF-hand.' + lado] = P['DEF-forearm.' + lado] + dir_['DEF-forearm.' + lado] * ANTEBRAZO
        L['DEF-hand.' + lado] = MANO
        th = 'DEF-thigh.' + lado
        P[th], L[th] = Vector((CADERA_X * s, 0.0, CADERA_Z)), MUSLO
        P['DEF-shin.' + lado], L['DEF-shin.' + lado] = P[th] + dir_[th] * MUSLO, CANILLA
        P['DEF-foot.' + lado] = P['DEF-shin.' + lado] + dir_['DEF-shin.' + lado] * CANILLA
        L['DEF-foot.' + lado] = PIE
        P['DEF-toe.' + lado] = P['DEF-foot.' + lado] + dir_['DEF-foot.' + lado] * PIE
        L['DEF-toe.' + lado] = DEDO_PIE
    for b in eb:
        b.use_connect = False
    for n, h in P.items():
        b = eb[n]
        b.head = h
        b.tail = h + dir_[n] * L[n]
        b.roll = viejo[n][2]
    # Dedos: libres (ningún clip los anima). Z local hacia el dorso de la mano: doblar = girar en su X local.
    for lado, s in (('L', 1), ('R', -1)):
        muneca = eb['DEF-hand.' + lado].head.copy()
        for dedo, (base, d, largos, doblez) in DEDOS.items():
            pos = muneca + Vector((base[0] * s, base[1], base[2]))
            dd = Vector((d[0] * s, d[1], d[2])).normalized()
            eje = Vector((0, s, 0)) if dedo != 'thumb' else Vector((0.5 * s, 0.6, -0.3)).normalized()
            for i, (largo, g) in enumerate(zip(largos, doblez)):
                dd = (Matrix.Rotation(math.radians(g), 3, eje) @ dd).normalized()
                b = eb['DEF-%s.%02d.%s' % (dedo, i + 1, lado)]
                b.head = pos
                b.tail = pos + dd * largo
                b.align_roll(Vector((0, 0, 1)) if dedo != 'thumb' else Vector((0.3 * s, 0.3, 1)))
                pos = b.tail.copy()
    if ABRIR_BRAZOS:
        for lado, s in (('L', 1), ('R', -1)):
            piv = eb['DEF-upper_arm.' + lado].head.copy()
            m = rotar_en(piv, Vector((0, -s, 0)), ABRIR_BRAZOS)
            for b in eb:
                if b.name.endswith('.' + lado) and any(k in b.name for k in ('upper_arm', 'forearm', 'hand', 'f_', 'thumb')):
                    b.transform(m)
    huesos = {b.name: (b.head.copy(), b.tail.copy()) for b in eb}
    bpy.ops.object.mode_set(mode='OBJECT')
    return huesos


def escalar_cadera(arm):
    """La traslación de la cadera de cada clip se escala como las piernas: los pies siguen en el piso."""
    k = (MUSLO + CANILLA) / (0.4 + 0.4294)
    for a in bpy.data.actions:
        cb = action_get_channelbag_for_slot(a, a.slots[0])
        for fc in cb.fcurves:
            if fc.data_path.endswith('.location'):
                for kp in fc.keyframe_points:
                    kp.co[1] *= k
                    kp.handle_left[1] *= k
                    kp.handle_right[1] *= k
    log('cadera de los clips ×%.3f' % k)


# ================================================================================================ SDF
GRANDE = 1.0


def smin(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def smax(a, b, k):
    return -smin(-a, -b, k)


def base_de(z, x=None):
    """Matriz 3×3 (columnas = ejes locales x, y, z en el mundo) con su z local en la dirección `z`."""
    z = Vector(z).normalized()
    x = Vector(x) if x is not None else (Vector((1, 0, 0)) if abs(z.x) < 0.9 else Vector((0, 1, 0)))
    x = (x - z * x.dot(z)).normalized()
    y = z.cross(x)
    return np.array([[x[i], y[i], z[i]] for i in range(3)], dtype=np.float64)


class Prim:
    """Primitiva SDF. `c` centro, `R` base local (3×3) o None, `caja` (mín, máx) en el mundo."""
    def __init__(self, f, cmin, cmax):
        self.f, self.cmin, self.cmax = f, np.array(cmin, float), np.array(cmax, float)


def _loc(X, Y, Z, c, R):
    dx, dy, dz = X - c[0], Y - c[1], Z - c[2]
    if R is None:
        return dx, dy, dz
    return (R[0, 0] * dx + R[1, 0] * dy + R[2, 0] * dz, R[0, 1] * dx + R[1, 1] * dy + R[2, 1] * dz,
            R[0, 2] * dx + R[1, 2] * dy + R[2, 2] * dz)


def esfera(c, r):
    c = np.array(c, float)
    return Prim(lambda X, Y, Z: np.sqrt((X - c[0]) ** 2 + (Y - c[1]) ** 2 + (Z - c[2]) ** 2) - r, c - r, c + r)


def elipsoide(c, r, R=None):
    c, r = np.array(c, float), np.array(r, float)

    def f(X, Y, Z):
        x, y, z = _loc(X, Y, Z, c, R)
        k0 = np.sqrt((x / r[0]) ** 2 + (y / r[1]) ** 2 + (z / r[2]) ** 2)
        k1 = np.sqrt((x / r[0] ** 2) ** 2 + (y / r[1] ** 2) ** 2 + (z / r[2] ** 2) ** 2)
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)
    m = r.max()
    return Prim(f, c - m, c + m)


def cono_redondo(a, b, ra, rb):
    """Cápsula de radio variable entre a (ra) y b (rb). SDF exacto de Inigo Quilez."""
    a, b = np.array(a, float), np.array(b, float)
    ba = b - a
    l2 = ba.dot(ba)
    rr = ra - rb
    a2 = l2 - rr * rr
    il2 = 1.0 / l2

    def f(X, Y, Z):
        px, py, pz = X - a[0], Y - a[1], Z - a[2]
        y = px * ba[0] + py * ba[1] + pz * ba[2]
        z = y - l2
        qx, qy, qz = px * l2 - ba[0] * y, py * l2 - ba[1] * y, pz * l2 - ba[2] * y
        x2 = qx * qx + qy * qy + qz * qz
        y2 = y * y * l2
        z2 = z * z * l2
        k = np.sign(rr) * rr * rr * x2
        d1 = np.sqrt(x2 + z2) * il2 - rb
        d2 = np.sqrt(x2 + y2) * il2 - ra
        d3 = (np.sqrt(np.maximum(x2 * a2 * il2, 0)) + y * rr) * il2 - ra
        return np.where(np.sign(z) * a2 * z2 > k, d1, np.where(np.sign(y) * a2 * y2 < k, d2, d3))
    m = max(ra, rb)
    return Prim(f, np.minimum(a, b) - m, np.maximum(a, b) + m)


def caja_redonda(c, medio, r, R=None):
    c, medio = np.array(c, float), np.array(medio, float)

    def f(X, Y, Z):
        x, y, z = _loc(X, Y, Z, c, R)
        qx, qy, qz = np.abs(x) - medio[0] + r, np.abs(y) - medio[1] + r, np.abs(z) - medio[2] + r
        fuera = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2 + np.maximum(qz, 0) ** 2)
        return fuera + np.minimum(np.maximum(qx, np.maximum(qy, qz)), 0) - r
    m = np.linalg.norm(medio)
    return Prim(f, c - m, c + m)


def cilindro(a, b, r, borde):
    """Cilindro con tapas planas (redondeadas con `borde`) entre a y b."""
    a, b = np.array(a, float), np.array(b, float)
    eje = b - a
    h = np.linalg.norm(eje) / 2
    eje = eje / (2 * h)
    c = (a + b) / 2

    def f(X, Y, Z):
        px, py, pz = X - c[0], Y - c[1], Z - c[2]
        t = px * eje[0] + py * eje[1] + pz * eje[2]
        rx, ry, rz = px - eje[0] * t, py - eje[1] * t, pz - eje[2] * t
        dr = np.sqrt(rx * rx + ry * ry + rz * rz) - (r - borde)
        dh = np.abs(t) - (h - borde)
        return np.minimum(np.maximum(dr, dh), 0) + np.sqrt(np.maximum(dr, 0) ** 2 + np.maximum(dh, 0) ** 2) - borde
    m = max(r, h)
    return Prim(f, np.minimum(a, b) - m, np.maximum(a, b) + m)


def toro(c, R_, r, Rb=None):
    c = np.array(c, float)

    def f(X, Y, Z):
        x, y, z = _loc(X, Y, Z, c, Rb)
        q = np.sqrt(x * x + y * y) - R_
        return np.sqrt(q * q + z * z) - r
    m = R_ + r
    return Prim(f, c - m, c + m)


def triangulo2d(px, py, A, B, C):
    """SDF 2D de un triángulo (Inigo Quilez)."""
    def seg(ax, ay, bx, by):
        ex, ey = bx - ax, by - ay
        wx, wy = px - ax, py - ay
        t = np.clip((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1)
        dx, dy = wx - ex * t, wy - ey * t
        return dx * dx + dy * dy, ex * wy - ey * wx
    d0, s0 = seg(*A, *B)
    d1, s1 = seg(*B, *C)
    d2, s2 = seg(*C, *A)
    d = np.sqrt(np.minimum(np.minimum(d0, d1), d2))
    signo = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])
    dentro = (np.sign(signo) * s0 >= 0) & (np.sign(signo) * s1 >= 0) & (np.sign(signo) * s2 >= 0)
    return np.where(dentro, -d, d)


def oreja(base, R, ancho, alto, punta_x, grosor, redondeo, cuenco):
    """Oreja puntiaguda: triángulo con bordes suaves, más gruesa en la base que en la punta, con un cuenco poco
    profundo en el frente. Base local: x a lo ancho, y hacia la punta, z hacia el frente de la oreja."""
    base = np.array(base, float)

    def f(X, Y, Z):
        x, y, z = _loc(X, Y, Z, base, R)
        d2 = triangulo2d(x, y, (-ancho / 2, -0.01), (ancho / 2, -0.01), (punta_x, alto))
        medio = grosor / 2 * (1 - 0.6 * np.clip(y / alto, 0, 1))
        a, b = d2 + redondeo, np.abs(z) - medio + redondeo
        d = np.minimum(np.maximum(a, b), 0) + np.sqrt(np.maximum(a, 0) ** 2 + np.maximum(b, 0) ** 2) - redondeo
        cx, cy = punta_x * 0.3, alto * 0.43   # el cuenco no llega a la base (dejaría una ranura junto a la cabeza)
        rx, ry = ancho * 0.26, alto * 0.3
        cz = medio + 0.002
        k0 = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / cuenco) ** 2)
        k1 = np.sqrt(((x - cx) / rx ** 2) ** 2 + ((y - cy) / ry ** 2) ** 2 + ((z - cz) / cuenco ** 2) ** 2)
        hueco = k0 * (k0 - 1) / np.maximum(k1, 1e-9)
        return smax(d, -hueco, 0.01)
    m = max(ancho, alto) + grosor
    return Prim(f, base - m, base + m)


class Rejilla:
    """Campo de distancia en una rejilla regular. `margen`: hasta dónde se calcula cada primitiva fuera de su caja;
    debe ser al menos el radio de mezcla más grande que se use después en esta rejilla (si no, la mezcla suave
    encuentra valores «lejanos» sin calcular y deja parches planos)."""
    def __init__(self, lo, hi, vox, padre=None, margen=0.06):
        self.vox, self.margen = vox, margen
        if padre is not None:  # alineada con la rejilla del padre
            i0 = np.floor((np.array(lo) - padre.lo) / vox).astype(int)
            lo = padre.lo + i0 * vox
        self.lo = np.array(lo, float)
        self.n = (np.ceil((np.array(hi, float) - self.lo) / vox).astype(int) + 1)
        self.F = np.full(tuple(self.n), GRANDE, np.float32)

    def _sub(self, cmin, cmax):
        i0 = np.clip(np.floor((cmin - self.lo) / self.vox).astype(int), 0, self.n)
        i1 = np.clip(np.ceil((cmax - self.lo) / self.vox).astype(int) + 1, 0, self.n)
        if np.any(i1 <= i0):
            return None
        sl = tuple(slice(a, b) for a, b in zip(i0, i1))
        ejes = [(self.lo[k] + np.arange(i0[k], i1[k]) * self.vox).astype(np.float32) for k in range(3)]
        return sl, ejes[0][:, None, None], ejes[1][None, :, None], ejes[2][None, None, :]

    def unir(self, p, k=0.0, modo='union'):
        m = max(k, self.margen) + 3 * self.vox
        r = self._sub(p.cmin - m, p.cmax + m)
        if r is None:
            return
        sl, X, Y, Z = r
        d = np.broadcast_to(p.f(X, Y, Z), self.F[sl].shape).astype(np.float32)
        if modo == 'union':
            self.F[sl] = smin(self.F[sl], d, k)
        else:  # resta
            self.F[sl] = smax(self.F[sl], -d, k)

    def plano_z(self, z0, k, arriba=True):
        """Corta con el semiespacio z > z0 (o z < z0), con borde redondeado k."""
        zs = (self.lo[2] + np.arange(self.n[2]) * self.vox).astype(np.float32)[None, None, :]
        d = (z0 - zs) if arriba else (zs - z0)
        self.F = smax(self.F, np.broadcast_to(d, self.F.shape), k).astype(np.float32)

    def juntar(self, otra, k):
        i0 = np.round((otra.lo - self.lo) / self.vox).astype(int)
        a = np.maximum(i0, 0)
        b = np.minimum(i0 + otra.n, self.n)
        mio = tuple(slice(x, y) for x, y in zip(a, b))
        suyo = tuple(slice(x - o, y - o) for x, y, o in zip(a, b, i0))
        self.F[mio] = smin(self.F[mio], otra.F[suyo], k)

    def muestrear(self, P):
        """Valor del campo en los puntos P (n×3), el vóxel más cercano; fuera de la rejilla, GRANDE."""
        i = np.round((np.asarray(P) - self.lo) / self.vox).astype(int)
        fuera = np.any((i < 0) | (i >= self.n), axis=1)
        i = np.clip(i, 0, self.n - 1)
        v = self.F[i[:, 0], i[:, 1], i[:, 2]]
        v[fuera] = GRANDE
        return v

    def malla(self, nombre):
        g = openvdb.FloatGrid(GRANDE)
        g.copyFromArray(np.clip(self.F, -GRANDE, GRANDE), (0, 0, 0), 0.0)
        g.transform = openvdb.createLinearTransform(voxelSize=self.vox)
        pts, quads = g.convertToQuads(0.0)
        pts = pts + self.lo
        me = bpy.data.meshes.new(nombre)
        me.from_pydata([tuple(p) for p in pts], [], [tuple(q) for q in quads])
        me.update()
        ob = bpy.data.objects.new(nombre, me)
        bpy.context.scene.collection.objects.link(ob)
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=self.vox * 0.05)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
        log('malla %s: %d caras (vóxel %.1f mm)' % (nombre, len(me.polygons), self.vox * 1000))
        return ob


# ================================================================================================ cuerpo
def modelar_cuerpo(H, vox=0.002):
    """Tronco con polo, brazos, manos, piernas, pies y cola, sobre los huesos en reposo H."""
    V = lambda n, i=0: np.array(H[n][i])  # noqa: E731
    t0 = time.time()
    raiz = Rejilla((-0.64, -0.27, -0.012), (0.64, 0.30, 0.74), vox)

    # --- el polo: tronco con panza, hombros, mangas cortas y cuello; abajo, un dobladillo
    polo = Rejilla((-0.33, -0.25, DOBLADILLO_Z - 0.03), (0.33, 0.23, 0.72), vox, raiz, margen=0.1)
    polo.unir(cono_redondo((0, 0.012, 0.29), (0, 0.004, 0.47), 0.158, 0.138))
    polo.unir(elipsoide((0, -0.012, 0.36), (0.155, 0.15, 0.135)), 0.09)        # panza
    polo.unir(elipsoide((0, 0.0, 0.47), (0.148, 0.12, 0.095)), 0.07)            # pecho
    for s in (1, -1):
        polo.unir(elipsoide((0.128 * s, 0.012, 0.512), (0.072, 0.066, 0.058)), 0.05)  # hombro
        a = V('DEF-upper_arm.' + ('L' if s > 0 else 'R'))
        d = V('DEF-upper_arm.' + ('L' if s > 0 else 'R'), 1) - a
        d = d / np.linalg.norm(d)
        polo.unir(cilindro(a - d * 0.04, a + d * (MANGA_X - abs(a[0])), 0.054, 0.009), 0.035)  # manga
    polo.unir(cono_redondo((0, 0.008, 0.5), (0, -0.01, 0.66), 0.074, 0.07), 0.04)   # cuello (queda en la cabeza)
    polo.plano_z(DOBLADILLO_Z, 0.012)
    polo.unir(toro((0, 0.0, 0.552), 0.083, 0.014, base_de((0, 0.18, 1))), 0.006)  # cuello del polo

    # --- lo que no lleva polo
    raiz.unir(elipsoide((0, 0.03, 0.283), (0.142, 0.128, 0.072)))                   # trasero
    for lado, s in (('L', 1), ('R', -1)):
        cad, rod = V('DEF-thigh.' + lado), V('DEF-shin.' + lado)
        tob, pun = V('DEF-foot.' + lado), V('DEF-toe.' + lado)
        raiz.unir(cono_redondo(cad, rod, 0.07, 0.054), 0.04)                        # muslo
        raiz.unir(cono_redondo(rod, tob, 0.054, 0.045), 0.02)                       # canilla
        # pie de peluche: planta plana, talón y tres deditos
        pie = Rejilla((s * CADERA_X - 0.1, -0.22, -0.01), (s * CADERA_X + 0.1, 0.11, 0.17), vox, raiz, margen=0.04)
        pie.unir(elipsoide((tob[0], -0.035, 0.034), (0.05, 0.088, 0.04)))
        pie.unir(esfera((tob[0], 0.018, 0.038), 0.04), 0.03)
        for i, dx in enumerate((-0.027, 0.0, 0.027)):
            pie.unir(esfera((tob[0] + dx * s, -0.103 + abs(dx) * 0.35, 0.026), 0.024), 0.012)
        pie.unir(cono_redondo(tob + np.array((0, 0, 0.01)), tob + np.array((0, -0.03, -0.02)), 0.045, 0.045), 0.03)
        pie.plano_z(0.0, 0.01)
        raiz.juntar(pie, 0.02)
        # brazo
        ua, fa, ma = V('DEF-upper_arm.' + lado), V('DEF-forearm.' + lado), V('DEF-hand.' + lado)
        raiz.unir(cono_redondo(ua, fa, 0.047, 0.043), 0.02)
        raiz.unir(cono_redondo(fa, ma, 0.043, 0.037), 0.015)
        # mano: palma y cuatro dedos (el anular lleva también al meñique)
        dm = (V('DEF-hand.' + lado, 1) - ma)
        dm = dm / np.linalg.norm(dm)
        Rm = base_de((0, 0, 1), dm)  # x local = a lo largo de la mano, z = dorso
        mano = Rejilla(ma + np.array((min(0, 0.14 * s) - 0.05, -0.1, -0.08)),
                       ma + np.array((max(0, 0.14 * s) + 0.05, 0.1, 0.07)), vox, raiz, margen=0.025)
        mano.unir(caja_redonda(ma + dm * 0.033 + np.array((0, 0.0, 0.002)), (0.034, 0.04, 0.018), 0.016, Rm))
        mano.unir(cono_redondo(fa + (ma - fa) * 0.6, ma + dm * 0.01, 0.034, 0.03), 0.02)  # muñeca
        for dedo, r0 in (('f_index', 0.0122), ('f_middle', 0.0126), ('f_ring', 0.0122), ('thumb', 0.013)):
            pts = [V('DEF-%s.01.%s' % (dedo, lado))] + [V('DEF-%s.%02d.%s' % (dedo, i, lado), 1) for i in (1, 2, 3)]
            for i in range(3):
                ra, rb = r0 * (1 - 0.06 * i), r0 * (1 - 0.06 * (i + 1))
                mano.unir(cono_redondo(pts[i], pts[i + 1], ra, rb), 0.004 if i else 0.012)
        raiz.juntar(mano, 0.012)
    # cola corta, hacia atrás y arriba
    cola = [(0, 0.10, 0.235), (0, 0.155, 0.243), (0, 0.197, 0.272), (0, 0.218, 0.318), (0, 0.222, 0.352)]
    radios = [0.03, 0.028, 0.025, 0.022, 0.02]
    for i in range(len(cola) - 1):
        raiz.unir(cono_redondo(cola[i], cola[i + 1], radios[i], radios[i + 1]), 0.02 if i == 0 else 0.0)
    raiz.juntar(polo, 0.005)
    ob = raiz.malla('tigo-cuerpo')
    log('cuerpo modelado en %.1f s' % (time.time() - t0))
    return ob, polo


# ================================================================================================ cabeza
# Ángulos de la cara (desde el centro de la cabeza; acimut 0 = frente, positivo hacia +X = izquierda del personaje)
OJO_AZ, OJO_EL, OJO_RX, OJO_RY = 21.0, 1.5, 0.0285, 0.037
NARIZ_EL = -17.0


def direccion(az, el):
    a, e = math.radians(az), math.radians(el)
    return Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))


OREJA = {'ancho': 0.15, 'alto': 0.165, 'punta': 0.016}
OREJAS = []  # (base, R, lado) de cada oreja, para pintarlas


def modelar_cabeza(vox=0.002):
    t0 = time.time()
    C = np.array(CABEZA_C)
    r = Rejilla(C + (-0.32, -0.28, -0.24), C + (0.32, 0.24, 0.32), vox, margen=0.12)
    r.unir(elipsoide(C + (0, 0.012, 0.015), CABEZA_R))                                 # cráneo
    r.unir(elipsoide(C + (0, -0.015, -0.045), (0.198, 0.15, 0.12)), 0.1)              # cachetes (mejillas anchas)
    r.unir(elipsoide(C + (0, -0.06, -0.092), (0.11, 0.1, 0.07)), 0.07)                 # mandíbula
    r.unir(elipsoide(C + (0, -0.128, -0.068), (0.08, 0.055, 0.052)), 0.06)              # hocico
    for s in (1, -1):
        r.unir(elipsoide(C + (0.029 * s, -0.163, -0.07), (0.034, 0.024, 0.027)), 0.03)   # almohadillas (la «w»)
    r.unir(elipsoide(C + (0, -0.148, -0.108), (0.03, 0.024, 0.02)), 0.03)                # barbilla
    for s in (1, -1):
        b = Vector(C) + direccion(40 * s, 42) * 0.162
        zloc = Vector((0.0, -1.0, 0.25)).normalized()                 # el frente de la oreja
        arriba = Vector((0.52 * s, 0.12, 1.0)).normalized()
        R = base_de(Matrix.Rotation(math.radians(-14 * s), 3, arriba) @ zloc, None)
        # base local: y hacia la punta (arriba), z al frente
        zl = Vector(R[:, 2])
        yl = (arriba - zl * arriba.dot(zl)).normalized()
        xl = yl.cross(zl)
        R = np.array([[xl[i], yl[i], zl[i]] for i in range(3)])
        r.unir(oreja(b, R, OREJA['ancho'], OREJA['alto'], OREJA['punta'] * s, 0.06, 0.008, 0.008), 0.03)
        OREJAS.append((np.array(b), R, s))
    ob = r.malla('tigo-cabeza')
    log('cabeza modelada en %.1f s' % (time.time() - t0))
    return ob


# ================================================================================================ piezas de la cara
def golpe(bvh, origen, d):
    hit, n, _, _ = bvh.ray_cast(Vector(origen), Vector(d).normalized())
    if hit is None:
        raise RuntimeError('el rayo no toca la cabeza: %s' % (d,))
    return hit, n.normalized()


def marco(n, arriba=Vector((0, 0, 1))):
    """Base ortonormal (x, y, z) con z = n e y lo más «arriba» posible."""
    z = Vector(n).normalized()
    y = (arriba - z * arriba.dot(z)).normalized()
    return y.cross(z), y, z


def malla_desde(bm, nombre):
    me = bpy.data.meshes.new(nombre)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(nombre, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def piezas_cara(cabeza):
    """Ojos (lentes negras con brillo) y nariz (triángulo redondeado): piezas aparte, con material brillante."""
    from mathutils.bvhtree import BVHTree
    bvh = BVHTree.FromObject(cabeza, bpy.context.evaluated_depsgraph_get())
    C = Vector(CABEZA_C)
    piezas = []
    for s in (1, -1):
        hit, n = golpe(bvh, C, direccion(OJO_AZ * s, OJO_EL))
        x, y, z = marco(n)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=14, radius=1.0)
        for v in [v for v in bm.verts if v.co.z < -0.3]:
            bm.verts.remove(v)
        c = hit - n * 0.004
        for v in bm.verts:
            p = v.co
            v.co = c + x * (p.x * OJO_RX) + y * (p.y * OJO_RY) + z * (p.z * 0.0125)
        piezas.append(malla_desde(bm, 'ojo.' + ('L' if s > 0 else 'R')))
    hit, n = golpe(bvh, C, direccion(0, NARIZ_EL))
    x, y, z = marco(n)
    R = np.array([[x[i], y[i], z[i]] for i in range(3)])
    c = np.array(hit - n * 0.003)

    def f(X, Y, Z):
        lx, ly, lz = _loc(X, Y, Z, c, R)
        a = triangulo2d(lx, ly, (-0.017, 0.006), (0.017, 0.006), (0.0, -0.009)) - 0.0075 + 0.006
        b = np.abs(lz) - 0.011 + 0.006
        return np.minimum(np.maximum(a, b), 0) + np.sqrt(np.maximum(a, 0) ** 2 + np.maximum(b, 0) ** 2) - 0.006
    r = Rejilla(c - 0.05, c + 0.05, 0.0008, margen=0.01)
    r.unir(Prim(f, c - 0.04, c + 0.04))
    nariz = r.malla('nariz')
    piezas.append(nariz)
    return piezas


def reducir(ob, triangulos):
    me = ob.data
    actuales = sum(len(p.vertices) - 2 for p in me.polygons)
    mod = ob.modifiers.new('reducir', 'DECIMATE')
    mod.ratio = min(1.0, triangulos / actuales)
    mod.use_collapse_triangulate = True
    mod.use_symmetry = False  # con simetría deja pliegues (caras al revés) en la línea media
    mod.symmetry_axis = 'X'
    dg = bpy.context.evaluated_depsgraph_get()
    nuevo = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    ob.modifiers.remove(mod)
    ob.data = nuevo
    bpy.data.meshes.remove(me)
    nuevo.name = ob.name
    nuevo.shade_smooth()
    log('%s: %d → %d triángulos' % (ob.name, actuales, sum(len(p.vertices) - 2 for p in nuevo.polygons)))


def cortar_polo(ob):
    """Corta la malla justo en el dobladillo y en el fin de las mangas: el cambio de material cae en una arista."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    for co, no in (((0, 0, DOBLADILLO_Z - 0.002), (0, 0, 1)), ((MANGA_X + 0.002, 0, 0), (1, 0, 0)),
                   ((-MANGA_X - 0.002, 0, 0), (1, 0, 0))):
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no, dist=1e-5)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
    bm.to_mesh(ob.data)
    bm.free()
    ob.data.shade_smooth()


def caras_polo(ob, campo_polo):
    """Caras del polo: sobre la superficie del polo (su campo ≈ 0), arriba del dobladillo y antes del fin de manga."""
    C = np.array([tuple(p.center) for p in ob.data.polygons])
    d = campo_polo.muestrear(C)
    return (d < 0.0025) & (C[:, 2] > DOBLADILLO_Z - 0.002) & (np.abs(C[:, 0]) < MANGA_X + 0.002)


MATERIALES = ['tigo-pelaje', 'tigo-polo', 'tigo-brillo']


def unir_todo(arm, cuerpo, cabeza, piezas, campo_polo, H):
    """Una sola malla con piel: cuerpo (pesos de calor) + cabeza, ojos y nariz (todo al hueso de la cabeza)."""
    for n in MATERIALES:
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        for ob in [cuerpo, cabeza] + piezas:
            if n not in [s.name for s in ob.data.materials]:
                ob.data.materials.append(m)
    polo = caras_polo(cuerpo, campo_polo)
    for p, es in zip(cuerpo.data.polygons, polo):
        p.material_index = 1 if es else 0
    for p in cabeza.data.polygons:
        p.material_index = 0
    for ob in piezas:
        for p in ob.data.polygons:
            p.material_index = 2
    V = np.array([tuple(v.co) for v in cuerpo.data.vertices])
    en_polo = (campo_polo.muestrear(V) < 0.003) & (V[:, 2] > DOBLADILLO_Z - 0.004)
    pesar_cuerpo(cuerpo, H, en_polo)
    atributos(cuerpo, cabeza, piezas)
    # la cabeza y sus piezas, rígidas al hueso de la cabeza
    for ob in [cabeza] + piezas:
        g = ob.vertex_groups.new(name='DEF-head')
        g.add(list(range(len(ob.data.vertices))), 1.0, 'REPLACE')
    bpy.ops.object.select_all(action='DESELECT')
    for ob in [cabeza] + piezas:
        ob.select_set(True)
    cuerpo.select_set(True)
    bpy.context.view_layer.objects.active = cuerpo
    bpy.ops.object.join()
    cuerpo.name = cuerpo.data.name = 'tigo-malla'
    cuerpo.parent = arm
    mod = cuerpo.modifiers.new('esqueleto', 'ARMATURE')
    mod.object = arm
    return cuerpo


def suave(x, a, b):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def pesar_cuerpo(ob, H, en_polo):
    """Pesos analíticos (como el provisional de guia.js, con dedos y pies): tronco por la altura a lo largo de la
    columna; brazos, piernas y pies por tramos con transiciones suaves en hombro, codo, muñeca, cadera, rodilla,
    tobillo y dedos; la cola a la cadera. Luego se suavizan sobre la malla, se dejan 4 por vértice y se normalizan."""
    P = np.array([tuple(v.co) for v in ob.data.vertices])
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    ax = np.abs(x)
    izq = x >= 0
    W = {}

    def sumar(nombre, w):
        W[nombre] = W.get(nombre, 0) + w
    hz = lambda n: H[n][0][2]  # noqa: E731
    # columna: cada hueso pesa alrededor del centro de su tramo
    columna = [('DEF-hips', 0.27), ('DEF-spine.001', 0.35), ('DEF-spine.002', 0.415), ('DEF-spine.003', 0.48),
               ('DEF-neck', 0.565)]

    G = np.array([np.exp(-((z - c) / 0.05) ** 2) for _, c in columna])
    G[0] = np.where(z < columna[0][1], 1.0, G[0])
    G[-1] = np.where(z > columna[-1][1], 1.0, G[-1])
    G = G / G.sum(axis=0)

    def tronco(f):
        for (n, _), w in zip(columna, G):
            sumar(n, f * w)
    hombro, codo, muneca = H['DEF-upper_arm.L'][0][0], H['DEF-forearm.L'][0][0], H['DEF-hand.L'][0][0]
    brazo_z, brazo_y = H['DEF-upper_arm.L'][0][2], H['DEF-upper_arm.L'][0][1]
    # cuánto es brazo: lejos del eje del cuerpo y a la altura del brazo (debajo de la axila es tronco)
    es_brazo = np.maximum(suave(ax, hombro + 0.02, hombro + 0.06), suave(z, brazo_z - 0.07, brazo_z - 0.035)) \
        * suave(ax, 0.08, 0.12)
    cola = (y > 0.1) & (z > 0.19) & (z < 0.4) & (ax < 0.055) & (es_brazo < 0.01)
    rodilla, tobillo = hz('DEF-shin.L'), hz('DEF-foot.L')
    punta_y = H['DEF-toe.L'][0][1]
    es_pierna = (1 - suave(z, 0.27, 0.325)) * (1 - es_brazo) * (~cola) * (~en_polo)
    resto = (1 - es_brazo) * (1 - es_pierna) * (~cola)
    tronco(resto)
    sumar('DEF-hips', cola * 1.0)
    # piernas
    for lado, m in (('L', suave(x, -0.035, 0.035)), ('R', 1 - suave(x, -0.035, 0.035))):
        f = es_pierna * m
        c = suave(z, rodilla + 0.025, rodilla - 0.025)
        e = np.maximum(suave(z, tobillo + 0.03, tobillo - 0.002), suave(y, -0.02, -0.05) * suave(z, 0.1, 0.075))
        g = suave(y, punta_y + 0.012, punta_y - 0.014)
        sumar('DEF-thigh.' + lado, f * (1 - c))
        sumar('DEF-shin.' + lado, f * c * (1 - e))
        sumar('DEF-foot.' + lado, f * c * e * (1 - g))
        sumar('DEF-toe.' + lado, f * c * e * g)
    # brazos
    a1 = suave(ax, 0.10, hombro - 0.01)
    a2 = suave(ax, hombro - 0.035, hombro + 0.035)
    a3 = suave(ax, codo - 0.025, codo + 0.025)
    a4 = suave(ax, muneca - 0.012, muneca + 0.016)
    fb = es_brazo * (~cola)
    tronco(fb * (1 - a1))
    for lado, m in (('L', izq), ('R', ~izq)):
        f = fb * m
        sumar('DEF-shoulder.' + lado, f * a1 * (1 - a2))
        sumar('DEF-upper_arm.' + lado, f * a2 * (1 - a3))
        sumar('DEF-forearm.' + lado, f * a3 * (1 - a4))
        # mano: palma y dedos por cercanía a cada falange (gaussiana), repartiendo el peso de la mano
        segs = [('DEF-hand.' + lado, np.array(H['DEF-hand.' + lado][0]),
                 np.array(H['DEF-hand.' + lado][0]) + (np.array(H['DEF-hand.' + lado][1]) - np.array(H['DEF-hand.' + lado][0])) / MANO * 0.05)]
        for dedo in ('f_index', 'f_middle', 'f_ring', 'thumb'):
            for i in (1, 2, 3):
                n = 'DEF-%s.%02d.%s' % (dedo, i, lado)
                cab, col = np.array(H[n][0]), np.array(H[n][1])
                if i == 3:
                    col = cab + (col - cab) * 1.6
                segs.append((n, cab, col))
        dist = []
        for n, a, b in segs:
            ab = b - a
            t = np.clip(((P - a) @ ab) / ab.dot(ab), 0, 1)
            dist.append(np.linalg.norm(P - (a + t[:, None] * ab), axis=1))
        dist = np.array(dist)
        g = np.exp(-((dist - dist.min(axis=0)) / 0.006) ** 2)
        g[0] = np.maximum(g[0], 1e-3)
        g = g / g.sum(axis=0)
        for (n, _, _), gi in zip(segs, g):
            sumar(n, f * a4 * gi)
    # suavizar sobre la malla (sin mezclar entre dedos vecinos: solo por aristas)
    E = np.array([tuple(e.vertices) for e in ob.data.edges])
    nombres = list(W)
    M = np.array([np.broadcast_to(W[n], z.shape) for n in nombres], dtype=np.float64)
    grado = np.zeros(len(P))
    np.add.at(grado, E[:, 0], 1)
    np.add.at(grado, E[:, 1], 1)
    for _ in range(6):
        S = np.zeros_like(M)
        np.add.at(S.T, E[:, 0], M[:, E[:, 1]].T)
        np.add.at(S.T, E[:, 1], M[:, E[:, 0]].T)
        M = 0.5 * M + 0.5 * S / np.maximum(grado, 1)
    # 4 por vértice como máximo, normalizados
    orden = np.argsort(-M, axis=0)
    fuera = orden[4:]
    np.put_along_axis(M, fuera, 0.0, axis=0)
    M[M < 1e-3] = 0
    M = M / np.maximum(M.sum(axis=0), 1e-9)
    for n in [b for b in H]:
        if n not in ob.vertex_groups:
            ob.vertex_groups.new(name=n)
    for k, n in enumerate(nombres):
        g = ob.vertex_groups[n]
        idx = np.nonzero(M[k] > 0)[0]
        for i in idx:
            g.add([int(i)], float(M[k, i]), 'REPLACE')
    sin = int(np.sum(M.sum(axis=0) < 0.99))
    log('pesos: %d huesos con peso, %d vértices sin peso, máx. %d por vértice' % (
        int(np.sum(M.max(axis=1) > 0)), sin, int((M > 0).sum(axis=0).max())))


# ================================================================================================ textura
R0 = 0.18          # radio de referencia de la cara: «metros de cara» = ángulo desde el centro × R0
TEX = 1024         # la única textura del modelo
LOGO_Z, LOGO_LADO = 0.43, 0.105   # centro y lado del cuadro donde va la marca (en el pecho)


def atributos(cuerpo, cabeza, piezas):
    """Atributos para pintar: «parte» (0 cuerpo, 1 cabeza, 2 ojo, 3 nariz) y «oreja» (coordenadas locales de la
    oreja más cercana: x a lo ancho, y hacia la punta, z hacia el frente; lineales, así que se interpolan exactas)."""
    def poner(ob, parte, oreja=None):
        n = len(ob.data.vertices)
        a = ob.data.attributes.new('parte', 'FLOAT', 'POINT')
        a.data.foreach_set('value', np.full(n, parte, np.float32))
        o = ob.data.attributes.new('oreja', 'FLOAT_VECTOR', 'POINT')
        if oreja is None:
            oreja = np.tile((0.0, -1.0, 0.0), (n, 1))
        o.data.foreach_set('vector', oreja.astype(np.float32).ravel())
    poner(cuerpo, 0)
    P = np.array([tuple(v.co) for v in cabeza.data.vertices])
    loc = np.zeros_like(P)
    loc[:] = (0.0, -1.0, 0.0)
    C = np.array(CABEZA_C)
    craneo = elipsoide(C + (0, 0.012, 0.015), CABEZA_R)
    d_craneo = craneo.f(P[:, 0], P[:, 1], P[:, 2])
    for base, R, lado in OREJAS:
        o = oreja(base, R, OREJA['ancho'], OREJA['alto'], OREJA['punta'] * lado, 0.06, 0.008, 0.008)
        # solo los vértices que son de la oreja (más cerca de ella que del cráneo), no la frente de al lado
        m = ((P[:, 0] * lado) > 0) & (o.f(P[:, 0], P[:, 1], P[:, 2]) < d_craneo - 0.004)
        l = (P[m] - base) @ R
        l[:, 0] *= lado
        loc[m] = l
    poner(cabeza, 1, loc)
    for ob in piezas:
        poner(ob, 2 if ob.name.startswith('ojo') else 3)


def caras_de_islas(bm, uv):
    """Islas UV (caras unidas por aristas que comparten UV): lista de listas de caras."""
    padre = list(range(len(bm.faces)))

    def raiz(i):
        while padre[i] != i:
            padre[i] = padre[padre[i]]
            i = padre[i]
        return i
    bm.faces.ensure_lookup_table()
    for e in bm.edges:
        if len(e.link_loops) != 2:
            continue
        l1, l2 = e.link_loops
        a1, b1 = l1[uv].uv, l1.link_loop_next[uv].uv
        a2, b2 = l2[uv].uv, l2.link_loop_next[uv].uv
        if l1.vert == l2.vert:
            ok = (a1 - a2).length < 1e-6 and (b1 - b2).length < 1e-6
        else:
            ok = (a1 - b2).length < 1e-6 and (b1 - a2).length < 1e-6
        if ok:
            ra, rb = raiz(l1.face.index), raiz(l2.face.index)
            if ra != rb:
                padre[ra] = rb
    islas = {}
    for f in bm.faces:
        islas.setdefault(raiz(f.index), []).append(f)
    return list(islas.values())


def desplegar(ob):
    """UV automáticas (Smart UV Project) con más resolución donde se mira: la cara, los ojos, la nariz y el logo."""
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, correct_aspect=True,
                             scale_to_bounds=False)
    bpy.ops.uv.average_islands_scale()
    bpy.ops.object.mode_set(mode='OBJECT')
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    uv = bm.loops.layers.uv.active
    parte = bm.verts.layers.float.get('parte')
    C = Vector(CABEZA_C)
    islas = caras_de_islas(bm, uv)
    for caras in islas:
        cen = sum((f.calc_center_median() for f in caras), Vector()) / len(caras)
        nor = sum((f.normal for f in caras), Vector()).normalized()
        pt = caras[0].verts[0][parte]
        polo = caras[0].material_index == 1
        if pt >= 1.5:
            k = 2.4                                                # ojos y nariz
        elif pt >= 0.5:
            frente = cen.y < C.y - 0.07 and cen.z > C.z - 0.15 and abs(cen.x) < 0.16
            k = 2.1 if frente else 1.15                             # la cara / el resto de la cabeza
        elif polo:
            k = 1.5 if (cen.y < -0.06 and 0.34 < cen.z < 0.53 and abs(cen.x) < 0.12) else 0.75
        elif nor.z < -0.7 and cen.z < 0.02:
            k = 0.35                                               # plantas de los pies
        else:
            k = 1.0
        if k == 1.0:
            continue
        uvs = [l[uv] for f in caras for l in f.loops]
        c = sum((u.uv for u in uvs), Vector((0, 0))) / len(uvs)
        for u in uvs:
            u.uv = c + (u.uv - c) * k
    bm.to_mesh(ob.data)
    bm.free()
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=True, scale=True, margin_method='FRACTION', margin=0.006, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')
    log('UV: %d islas' % len(islas))


# ---------------------------------------------------------------- dibujos 2D en numpy (máscaras de la cara y logo)
def bezier(p0, p1, p2, p3, n=28):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = map(np.array, (p0, p1, p2, p3))
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3


def trazo(U, V, pts, w0, w1, aa):
    """Trazo con puntas redondas a lo largo de una polilínea; el ancho va de w0 a w1."""
    pts = np.asarray(pts, float)
    largos = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    acum = np.concatenate([[0], np.cumsum(largos)])
    total = acum[-1]
    dmin = np.full(U.shape, np.inf)
    tmin = np.zeros(U.shape)
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        ab = b - a
        t = np.clip(((U - a[0]) * ab[0] + (V - a[1]) * ab[1]) / max(ab.dot(ab), 1e-12), 0, 1)
        d = np.hypot(U - (a[0] + t * ab[0]), V - (a[1] + t * ab[1]))
        m = d < dmin
        dmin = np.where(m, d, dmin)
        tmin = np.where(m, (acum[i] + t * largos[i]) / total, tmin)
    medio = (w0 + (w1 - w0) * tmin) / 2
    return 1 - suave(dmin - medio, -aa, aa)


def elipse(U, V, c, r, aa, crecer=0.0):
    q = np.sqrt(((U - c[0]) / (r[0] + crecer)) ** 2 + ((V - c[1]) / (r[1] + crecer)) ** 2)
    return 1 - suave((q - 1) * min(r) , -aa, aa)


def guardar_png(ruta, rgba):
    """Guarda un arreglo (alto, ancho, 4) en 0..1 como PNG de 8 bits (fila 0 = abajo, como Blender)."""
    h, w, _ = rgba.shape
    img = bpy.data.images.new(os.path.basename(ruta), w, h, alpha=True)
    img.pixels.foreach_set(np.clip(rgba, 0, 1).astype(np.float32).ravel())
    img.filepath_raw = ruta
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)
    return ruta


def mapa_cara(ojos, nariz, carpeta, W=2048, H=1024):
    """Máscaras de la cabeza en coordenadas de ángulo (acimut × elevación, como un mapa del mundo). Los rasgos del
    frente se dibujan en «metros de cara» (U, V) = (acimut·cos(elevación), elevación) × R0, copiando la carita SVG
    (1 unidad del SVG = R0/22 m). Devuelve dos PNG: A = (rayas, crema, trazos oscuros), B = (ojo, brillo, nariz)."""
    az = np.radians((np.arange(W) + 0.5) / W * 360 - 180)
    el = np.radians((np.arange(H) + 0.5) / H * 180 - 90)
    AZ, EL = np.meshgrid(az, el)
    U, V = AZ * np.cos(EL) * R0, EL * R0
    aa = R0 * math.radians(360 / W) * 0.8
    azd, eld = np.degrees(np.abs(AZ)), np.degrees(EL)
    raya = np.zeros((H, W))
    crema = np.zeros((H, W))
    oscuro = np.zeros((H, W))
    ojo = np.zeros((H, W))
    brillo = np.zeros((H, W))
    rojo = np.zeros((H, W))
    # las tres rayas de la frente (la del centro recta, las de los lados curvas, como en la carita)
    raya = np.maximum(raya, trazo(U, V, [(0, 0.172), (0, 0.084)], 0.024, 0.018, aa))
    for s in (1, -1):
        raya = np.maximum(raya, trazo(U, V, bezier((s * 0.0818, 0.134), (s * 0.0655, 0.095), (s * 0.0655, 0.077),
                                                    (s * 0.0795, 0.058)), 0.023, 0.015, aa))
    # rayas de los costados de la cabeza (cuñas que apuntan a los ojos) y de la nuca
    for e0, w0 in ((30, 4.0), (11, 4.6), (-8, 3.6)):
        c = e0 + 0.22 * (azd - 95)
        w = w0 * suave(azd, 64, 100) * (1 - suave(azd, 124, 136))
        raya = np.maximum(raya, (1 - suave(np.abs(eld - c) - w, -0.25, 0.25)) * (w > 0.2))
    for e0 in (14, 29, 44, 59):
        c = e0 + 0.28 * (180 - azd)
        w = 3.3 * suave(azd, 128, 152)
        raya = np.maximum(raya, (1 - suave(np.abs(eld - c) - w, -0.25, 0.25)) * (w > 0.2))
    # hocico y barbilla crema; mejillas más claras; debajo de la mandíbula, crema
    crema = np.maximum(crema, elipse(U, V, (0, -0.086), (0.058, 0.034), 0.006))
    crema = np.maximum(crema, elipse(U, V, (0, -0.122), (0.044, 0.03), 0.006))
    crema = np.maximum(crema, suave(eld, -36, -52))
    crema = np.maximum(crema, 0.2 * suave(azd, 38, 62) * (1 - suave(azd, 96, 112)) * suave(eld, 2, -14)
                       * (1 - suave(eld, -34, -48)))
    # boca en «w», bigotes (pintados) y sus puntitos
    oscuro = np.maximum(oscuro, trazo(U, V, [(0, -0.067), (0, -0.081)], 0.0064, 0.0064, aa))
    for s in (1, -1):
        oscuro = np.maximum(oscuro, trazo(U, V, bezier((0, -0.081), (s * 0.012, -0.097), (s * 0.036, -0.098),
                                                        (s * 0.047, -0.085)), 0.0064, 0.0052, aa))
        oscuro = np.maximum(oscuro, trazo(U, V, [(s * 0.066, -0.05), (s * 0.155, -0.047)], 0.005, 0.0028, aa))
        oscuro = np.maximum(oscuro, trazo(U, V, [(s * 0.066, -0.066), (s * 0.15, -0.054)], 0.005, 0.0028, aa))
        for du, dv in ((0.022, -0.071), (0.035, -0.074), (0.029, -0.083)):
            oscuro = np.maximum(oscuro, elipse(U, V, (s * du, dv), (0.0021, 0.0021), aa))
    # ojos: óvalo negro (con un borde oscuro que tapa la unión con la cabeza) y los dos brillos
    for (u0, v0, rx, ry) in ojos:
        ojo = np.maximum(ojo, elipse(U, V, (u0, v0), (rx, ry), aa))
        oscuro = np.maximum(oscuro, elipse(U, V, (u0, v0), (rx, ry), aa, crecer=0.0016))
        brillo = np.maximum(brillo, elipse(U, V, (u0 + 0.33 * rx, v0 + 0.36 * ry), (0.30 * rx, 0.30 * rx), aa))
        brillo = np.maximum(brillo, 0.85 * elipse(U, V, (u0 - 0.33 * rx, v0 - 0.42 * ry), (0.12 * rx, 0.12 * rx), aa))
    # nariz: triángulo redondeado rojo con contorno oscuro (como el trazo de la carita) y un brillo arriba
    u0, v0, k, tri, redondeo = nariz
    d = triangulo2d(U - u0, V - v0, *[(x * k, y * k) for x, y in tri]) - redondeo * k
    rojo = 1 - suave(d, -aa, aa)
    oscuro = np.maximum(oscuro, 1 - suave(d - 0.0028, -aa, aa))
    brillo = np.maximum(brillo, 0.55 * elipse(U, V, (u0 - 0.008, v0 + 0.0045), (0.0075, 0.0038), aa))
    uno = np.ones((H, W))
    a = guardar_png(os.path.join(carpeta, 'mapa-cara-a.png'), np.dstack([raya, crema, oscuro, uno]))
    b = guardar_png(os.path.join(carpeta, 'mapa-cara-b.png'), np.dstack([ojo, brillo, rojo, uno]))
    return a, b


# La marca de Aybar (las dos Λ), en coordenadas del SVG del logo (y hacia abajo); la misma de modelo-helicoptero.py.
MARCA_EXT = [(126.1, 41.2), (139.9, 48.8), (200.2, 153.4), (189.8, 160.8), (126.1, 56.8), (62.4, 160.8),
             (52.0, 153.4), (112.3, 48.8)]
MARCA_AMBAR = [(126.1, 70.4), (173.98, 152.13), (173.0, 153.1), (162.67, 147.13), (126.1, 85.0),
               (89.58, 147.13), (79.25, 153.1), (78.28, 152.13)]


def imagen_logo(carpeta, n=512, sub=4):
    """La marca en un cuadro de 160 unidades del SVG centrado en la marca: Λ blanca por fuera y Λ ámbar adentro."""
    m = n * sub
    t = (np.arange(m) + 0.5) / m
    X, Y = np.meshgrid(126.1 - 80 + t * 160, 101.0 + 80 - t * 160)  # fila 0 = abajo

    def dentro(pts):
        r = np.zeros(X.shape, bool)
        for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
            cruza = ((y1 > Y) != (y2 > Y)) & (X < (x2 - x1) * (Y - y1) / (y2 - y1 + 1e-12) + x1)
            r ^= cruza
        return r.astype(np.float32).reshape(n, sub, n, sub).mean(axis=(1, 3))
    ext, amb = dentro(MARCA_EXT), dentro(MARCA_AMBAR)
    blanco, ambar = np.array(COLOR['blanco']), np.array(COLOR['ambar'])
    rgb = blanco[None, None] * ext[..., None] + ambar[None, None] * amb[..., None]
    alfa = np.clip(ext + amb, 0, 1)
    rgb = rgb / np.maximum(alfa[..., None], 1e-6)
    return guardar_png(os.path.join(carpeta, 'logo.png'), np.dstack([rgb, alfa]))


# ---------------------------------------------------------------- nodos
class Arbol:
    """Ayuda para armar árboles de nodos de sombreado desde Python."""
    def __init__(self, mat):
        self.nt = mat.node_tree
        self.nt.nodes.clear()
        tc = self.nodo('ShaderNodeTexCoord')
        geo = self.nodo('ShaderNodeNewGeometry')
        self.P, self.N = tc.outputs['Object'], geo.outputs['Normal']
        self.x, self.y, self.z = self.separar(self.P)
        self.nx, self.ny, self.nz = self.separar(self.N)

    def nodo(self, tipo, **kw):
        n = self.nt.nodes.new(tipo)
        for k, v in kw.items():
            setattr(n, k, v)
        return n

    def _a(self, sock, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.nt.links.new(v, sock)
        elif isinstance(v, (tuple, list)) and len(v) == 3 and sock.type == 'RGBA':
            sock.default_value = (*v, 1.0)
        else:
            sock.default_value = v

    def m(self, op, a, b=0.0, c=0.0, limitar=False):
        n = self.nodo('ShaderNodeMath', operation=op, use_clamp=limitar)
        for i, v in enumerate((a, b, c)):
            self._a(n.inputs[i], v)
        return n.outputs[0]

    def v(self, op, a, b=(0, 0, 0), escala=None):
        n = self.nodo('ShaderNodeVectorMath', operation=op)
        self._a(n.inputs[0], a)
        self._a(n.inputs[1], b)
        if escala is not None:
            self._a(n.inputs[3], escala)
        return n.outputs['Value'] if op in ('DOT_PRODUCT', 'LENGTH', 'DISTANCE') else n.outputs['Vector']

    def separar(self, v):
        n = self.nodo('ShaderNodeSeparateXYZ')
        self._a(n.inputs[0], v)
        return n.outputs[0], n.outputs[1], n.outputs[2]

    def juntar(self, x, y, z):
        n = self.nodo('ShaderNodeCombineXYZ')
        for i, v in enumerate((x, y, z)):
            self._a(n.inputs[i], v)
        return n.outputs[0]

    def suave(self, x, a, b):
        n = self.nodo('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP')
        for i, v in enumerate((x, a, b, 0.0, 1.0)):
            self._a(n.inputs[i], v)
        return n.outputs['Result']

    @staticmethod
    def _id(socks, ident):
        """Socket por identificador (los del nodo Mix comparten nombre: «A», «B», «Result» por cada tipo)."""
        return next(x for x in socks if x.identifier == ident)

    def mezcla(self, f, a, b, modo='MIX'):
        n = self.nodo('ShaderNodeMix', data_type='RGBA', blend_type=modo, clamp_factor=True)
        self._a(self._id(n.inputs, 'Factor_Float'), f)
        self._a(self._id(n.inputs, 'A_Color'), a)
        self._a(self._id(n.inputs, 'B_Color'), b)
        return self._id(n.outputs, 'Result_Color')

    def por(self, color, f):
        return self.mezcla(1.0, color, self.juntar(f, f, f), 'MULTIPLY')

    def ruido(self, v, escala, detalle=6.0, aspereza=0.55):
        n = self.nodo('ShaderNodeTexNoise', noise_dimensions='3D')
        self._a(n.inputs['Vector'], v)
        self._a(n.inputs['Scale'], escala)
        self._a(n.inputs['Detail'], detalle)
        self._a(n.inputs['Roughness'], aspereza)
        return n.outputs['Fac']

    def azar(self, w):
        n = self.nodo('ShaderNodeTexWhiteNoise', noise_dimensions='1D')
        self._a(n.inputs['W'], w)
        return n.outputs['Value']

    def atributo(self, nombre, salida='Fac'):
        return self.nodo('ShaderNodeAttribute', attribute_name=nombre).outputs[salida]

    def imagen(self, img, vector, interp='Linear', ext='REPEAT', salida='Color'):
        n = self.nodo('ShaderNodeTexImage', image=img, interpolation=interp, extension=ext)
        self._a(n.inputs['Vector'], vector)
        return n.outputs[salida]

    def canal(self, color, i):
        n = self.nodo('ShaderNodeSeparateColor')
        self._a(n.inputs[0], color)
        return n.outputs[i]

    def emitir(self, color):
        e = self.nodo('ShaderNodeEmission')
        self._a(e.inputs['Color'], color)
        o = self.nodo('ShaderNodeOutputMaterial')
        self.nt.links.new(e.outputs[0], o.inputs['Surface'])

    def raya(self, s, lomo, semilla, aa=0.03):
        """Una raya de tigre por cada unidad de s, más ancha en el lomo (como tgRayas de guia.js)."""
        i = self.m('ROUND', s)
        h = self.azar(self.m('ADD', self.m('MULTIPLY', i, 1.71), semilla))
        d = self.m('ABSOLUTE', self.m('SUBTRACT', self.m('SUBTRACT', s, i), self.m('MULTIPLY', self.m('SUBTRACT', h, 0.5), 0.3)))
        ancho = self.m('MULTIPLY', self.m('MULTIPLY_ADD', h, 0.11, 0.08),
                       self.suave(lomo, self.m('MULTIPLY_ADD', h, 0.25, 0.12), 0.85))
        borde = self.suave(d, self.m('SUBTRACT', ancho, aa), self.m('ADD', ancho, aa))
        return self.m('MULTIPLY', self.m('SUBTRACT', 1.0, borde), self.suave(ancho, 0.0, aa))


def col(n):
    return lineal(COLOR[n])


def angulos_cabeza(t):
    """(u, v) del mapa de la cara a partir de la posición: acimut y elevación desde el centro de la cabeza."""
    d = t.v('SUBTRACT', t.P, tuple(CABEZA_C))
    dx, dy, dz = t.separar(d)
    az = t.m('ARCTAN2', dx, t.m('MULTIPLY', dy, -1.0))
    el = t.m('ARCTAN2', dz, t.m('SQRT', t.m('ADD', t.m('MULTIPLY', dx, dx), t.m('MULTIPLY', dy, dy))))
    return t.juntar(t.m('MULTIPLY_ADD', az, 1 / (2 * math.pi), 0.5), t.m('MULTIPLY_ADD', el, 1 / math.pi, 0.5), 0.0), el


def sombreador_pelaje(mat, mapa_a, H):
    """Pelaje del cuerpo (rayas en brazos, piernas y cola; crema por debajo) y de la cabeza (mapa de la cara, orejas)."""
    t = Arbol(mat)
    ax = t.m('ABSOLUTE', t.x)
    lado = t.m('SIGN', t.x)
    ruido = t.ruido(t.P, 55.0, 7.0, 0.6)
    vetas = t.ruido(t.v('MULTIPLY', t.P, (90.0, 90.0, 30.0)), 1.0, 3.0, 0.5)
    lomo_n = t.m('MULTIPLY_ADD', t.v('DOT_PRODUCT', t.N, (0, 0.42, 0.9)), 0.5, 0.5)
    base = t.mezcla(t.m('MULTIPLY', t.suave(lomo_n, 0.55, 1.0), 0.75), col('pelaje'), col('lomo'))
    vientre = t.suave(t.m('MULTIPLY', t.nz, -1.0), 0.3, 0.85)
    # --- cuerpo: brazos (más allá de la manga), piernas y cola
    muneca = H['DEF-hand.L'][0][0]
    tobillo = H['DEF-foot.L'][0][2]
    ondula = t.m('MULTIPLY', t.m('SUBTRACT', t.ruido(t.P, 9.0, 2.0, 0.5), 0.5), 0.9)
    s_b = t.m('ADD', t.m('MULTIPLY', t.m('SUBTRACT', ax, MANGA_X), 30.0), ondula)
    lomo_b = t.m('MULTIPLY_ADD', t.v('DOT_PRODUCT', t.N, (0, 0.55, 0.83)), 0.6, 0.5, limitar=True)
    brazo = t.m('MULTIPLY', t.suave(ax, MANGA_X + 0.004, MANGA_X + 0.012),
                t.m('SUBTRACT', 1.0, t.suave(ax, muneca - 0.012, muneca + 0.004)))
    n_lado = t.juntar(t.m('MULTIPLY', lado, 0.75), 0.66, 0.0)
    s_p = t.m('ADD', t.m('MULTIPLY', t.m('SUBTRACT', 0.268, t.z), 28.0), ondula)
    lomo_p = t.m('MULTIPLY_ADD', t.v('DOT_PRODUCT', t.N, n_lado), 0.6, 0.5, limitar=True)
    cola = t.m('MULTIPLY', t.m('MULTIPLY', t.suave(t.y, 0.105, 0.125), t.suave(t.z, 0.2, 0.215)),
               t.m('SUBTRACT', 1.0, t.suave(ax, 0.05, 0.06)))
    pierna = t.m('MULTIPLY', t.m('MULTIPLY', t.m('SUBTRACT', 1.0, t.suave(t.z, 0.262, 0.285)),
                                 t.suave(t.z, tobillo + 0.012, tobillo + 0.035)), t.m('SUBTRACT', 1.0, cola))
    s_c = t.m('MULTIPLY', t.m('ADD', t.m('SUBTRACT', t.y, 0.1), t.m('SUBTRACT', t.z, 0.235)), 17.0)
    adentro = t.m('MULTIPLY', t.suave(t.v('DOT_PRODUCT', t.N, t.juntar(t.m('MULTIPLY', lado, -1.0), 0.0, 0.0)), 0.35, 0.85),
                  t.m('SUBTRACT', 1.0, t.suave(t.z, 0.25, 0.3)))
    c = t.mezcla(t.m('MAXIMUM', t.m('MULTIPLY', vientre, 0.85), t.m('MULTIPLY', adentro, 0.45)), base, col('crema'))
    rayas = t.m('MAXIMUM', t.m('MULTIPLY', brazo, t.raya(s_b, lomo_b, 5.0)),
                t.m('MAXIMUM', t.m('MULTIPLY', pierna, t.raya(s_p, lomo_p, 13.0)),
                    t.m('MULTIPLY', cola, t.raya(s_c, 0.95, 21.0))))
    c = t.mezcla(rayas, c, col('raya'))
    punta = t.m('MULTIPLY', cola, t.suave(t.z, 0.322, 0.334))
    c = t.mezcla(punta, c, lineal(hex_rgb('#5C2C10')))
    cuerpo = c
    # --- cabeza: mapa de la cara (rayas, crema, trazos) y orejas
    uv, _ = angulos_cabeza(t)
    A = t.imagen(mapa_a, uv)
    h = t.mezcla(t.m('MULTIPLY', t.suave(lomo_n, 0.62, 1.0), 0.45), col('pelaje'), col('lomo'))
    bajo = t.m('SUBTRACT', 1.0, t.suave(t.z, CABEZA_C.z - 0.06, CABEZA_C.z - 0.02))  # crema por debajo solo en la quijada
    h = t.mezcla(t.m('MAXIMUM', t.canal(A, 1), t.m('MULTIPLY', t.m('MULTIPLY', vientre, bajo), 0.7)), h, col('crema'))
    h = t.mezcla(t.canal(A, 0), h, col('raya'))
    h = t.mezcla(t.canal(A, 2), h, col('oscuro'))
    ox, oy, oz = t.separar(t.atributo('oreja', 'Vector'))
    # oreja: arriba de su base y cerca de su plano medio (si no, el color se corre a la cabeza junto a la oreja)
    es_oreja = t.m('MULTIPLY', t.suave(oy, 0.012, 0.022), t.m('SUBTRACT', 1.0, t.suave(t.m('ABSOLUTE', oz), 0.034, 0.046)))
    frente = t.suave(oz, -0.002, 0.003)
    a_, b_ = OREJA['ancho'], OREJA['alto']
    cx, cy, rx, ry = OREJA['punta'] * 0.3, b_ * 0.43, a_ * 0.26 + 0.007, b_ * 0.3 + 0.012
    q = t.m('SQRT', t.m('ADD', t.m('POWER', t.m('DIVIDE', t.m('SUBTRACT', ox, cx), rx), 2.0),
                        t.m('POWER', t.m('DIVIDE', t.m('SUBTRACT', oy, cy), ry), 2.0)))
    interior = t.m('MULTIPLY', t.m('SUBTRACT', 1.0, t.suave(q, 0.85, 1.0)), frente)
    o = t.mezcla(interior, col('pelaje'), col('oreja'))
    o = t.mezcla(t.m('MAXIMUM', t.m('MULTIPLY', t.m('SUBTRACT', 1.0, frente), t.m('MULTIPLY', t.suave(oy, 0.05, 0.12), 0.8)),
                     t.m('MULTIPLY', t.suave(oy, 0.118, 0.14), 0.9)), o, lineal(hex_rgb('#5C2C10')))
    h = t.mezcla(es_oreja, h, o)
    es_cabeza = t.m('COMPARE', t.atributo('parte'), 1.0, 0.5)
    c = t.mezcla(es_cabeza, cuerpo, h)
    # textura de pelo: un poco de ruido y vetas
    c = t.por(c, t.m('MULTIPLY_ADD', t.m('ADD', ruido, t.m('MULTIPLY', vetas, 0.5)), 0.16, 0.86))
    t.emitir(c)


def sombreador_polo(mat, logo):
    t = Arbol(mat)
    ax = t.m('ABSOLUTE', t.x)
    c = col('polo')
    luz = t.m('MULTIPLY_ADD', t.ruido(t.P, 260.0, 4.0, 0.6), 0.12, 0.94)
    luz = t.m('MULTIPLY', luz, t.m('MULTIPLY_ADD', t.suave(t.z, 0.26, 0.55), 0.1, 0.95))
    costura = t.m('MAXIMUM',
                  t.m('SUBTRACT', 1.0, t.suave(t.m('ABSOLUTE', t.m('SUBTRACT', t.z, DOBLADILLO_Z + 0.012)), 0.0008, 0.0018)),
                  t.m('MULTIPLY', t.m('SUBTRACT', 1.0, t.suave(t.m('ABSOLUTE', t.m('SUBTRACT', ax, MANGA_X - 0.012)), 0.0008, 0.0018)),
                      t.suave(t.z, 0.47, 0.48)))
    luz = t.m('MULTIPLY', luz, t.m('SUBTRACT', 1.0, t.m('MULTIPLY', costura, 0.3)))
    cuello = t.m('MULTIPLY', t.suave(t.z, 0.536, 0.545), t.m('SUBTRACT', 1.0, t.suave(ax, 0.11, 0.12)))
    c = t.mezcla(cuello, c, lineal(hex_rgb('#01323B')))
    c = t.por(c, luz)
    uv = t.juntar(t.m('MULTIPLY_ADD', t.x, 1 / LOGO_LADO, 0.5), t.m('MULTIPLY_ADD', t.m('SUBTRACT', t.z, LOGO_Z), 1 / LOGO_LADO, 0.5), 0.0)
    marca = t.imagen(logo, uv, ext='CLIP')
    alfa = t.imagen(logo, uv, ext='CLIP', salida='Alpha')
    frente = t.m('MULTIPLY', t.suave(t.m('MULTIPLY', t.ny, -1.0), 0.25, 0.5), t.m('LESS_THAN', t.y, 0.0))
    c = t.mezcla(t.m('MULTIPLY', alfa, frente), c, marca)
    t.emitir(c)


def sombreador_brillo(mat, mapa_b):
    """Ojos (negros con su brillo) y nariz (roja): piezas aparte con material brillante."""
    t = Arbol(mat)
    uv, el = angulos_cabeza(t)
    B = t.imagen(mapa_b, uv)
    ojo = t.mezcla(t.m('MULTIPLY', t.suave(el, math.radians(OJO_EL - 2), math.radians(OJO_EL - 12)), 0.5),
                   lineal(hex_rgb('#1A1411')), lineal(hex_rgb('#3B2416')))
    nariz = t.mezcla(t.suave(el, math.radians(NARIZ_EL + 1), math.radians(NARIZ_EL - 5)), col('nariz'),
                     lineal(hex_rgb('#B8352A')))
    c = t.mezcla(t.m('COMPARE', t.atributo('parte'), 3.0, 0.5), ojo, nariz)
    c = t.mezcla(t.canal(B, 1), c, (1.0, 1.0, 1.0))
    t.emitir(c)


def preparar_gpu(sc, muestras):
    sc.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for tipo in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = tipo
            prefs.get_devices()
            usar = [d for d in prefs.devices if d.type == tipo]
            if usar:
                for d in prefs.devices:
                    d.use = d.type == tipo
                sc.cycles.device = 'GPU'
                break
        except TypeError:
            continue
    else:
        sc.cycles.device = 'CPU'
    sc.cycles.samples = muestras
    log('Cycles en %s (%s)' % (sc.cycles.device, prefs.compute_device_type))


def hornear(malla, arm, H, carpeta, ojos, nariz):
    """Hornea el color (nodos → emisión) y la oclusión ambiental, y los junta en una sola textura de TEX px."""
    sc = bpy.context.scene
    arm.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    ra, rb = mapa_cara(ojos, nariz, carpeta)
    img_a = bpy.data.images.load(ra)
    img_b = bpy.data.images.load(rb)
    for im in (img_a, img_b):
        im.colorspace_settings.name = 'Non-Color'
    logo = bpy.data.images.load(imagen_logo(carpeta))
    m = {n: bpy.data.materials[n] for n in MATERIALES}
    sombreador_pelaje(m['tigo-pelaje'], img_a, H)
    sombreador_polo(m['tigo-polo'], logo)
    sombreador_brillo(m['tigo-brillo'], img_b)
    preparar_gpu(sc, 24)
    sc.render.bake.margin = 6
    sc.render.bake.margin_type = 'EXTEND'
    sc.render.bake.use_clear = True
    resultados = {}
    for nombre, tipo in (('color', 'EMIT'), ('oclusion', 'AO')):
        img = bpy.data.images.new('tigo-' + nombre, TEX, TEX, alpha=False, float_buffer=True)
        img.colorspace_settings.name = 'Linear Rec.709'
        for mat in m.values():
            n = mat.node_tree.nodes.new('ShaderNodeTexImage')
            n.image = img
            mat.node_tree.nodes.active = n
        if tipo == 'AO':
            if sc.world is None:
                sc.world = bpy.data.worlds.new('mundo')
            sc.world.light_settings.distance = 0.07
            sc.cycles.samples = 96
        bpy.ops.object.select_all(action='DESELECT')
        malla.select_set(True)
        bpy.context.view_layer.objects.active = malla
        t0 = time.time()
        bpy.ops.object.bake(type=tipo)
        log('horneado %s en %.1f s' % (nombre, time.time() - t0))
        resultados[nombre] = np.array(img.pixels[:], np.float32).reshape(TEX, TEX, 4)
        for mat in m.values():
            mat.node_tree.nodes.remove(mat.node_tree.nodes.active)
    color = resultados['color'][..., :3]
    ao = resultados['oclusion'][..., :1]
    final = color * (0.55 + 0.45 * np.clip(ao, 0, 1) ** 0.8)
    srgb = np.where(final <= 0.0031308, final * 12.92, 1.055 * np.power(np.clip(final, 0, None), 1 / 2.4) - 0.055)
    png = guardar_png(os.path.join(carpeta, 'tigo-textura.png'), np.dstack([srgb, np.ones((TEX, TEX))]))
    # en el GLB va como JPEG (sin alfa): pesa ~4 veces menos que el PNG
    img = bpy.data.images.load(png)
    ruta = os.path.join(carpeta, 'tigo-textura.jpg')
    img.file_format = 'JPEG'
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 90
    img.save_render(ruta, scene=sc)
    bpy.data.images.remove(img)
    sc.render.image_settings.file_format = 'PNG'
    arm.data.pose_position = 'POSE'
    return ruta


def materiales_finales(ruta_tex):
    img = bpy.data.images.load(ruta_tex)
    img.name = 'tigo-textura'
    ajustes = {
        # el exportador de glTF solo lleva el «Sheen Tint» (no el peso): el tinte ya va escalado. En three el brillo
        # de terciopelo resta difuso (1 − 0.157·máx(tinte)); con tinte 1 el pelaje sale ~15 % más oscuro.
        'tigo-pelaje': {'Roughness': 0.78, 'Specular IOR Level': 0.3, 'Sheen Weight': 1.0, 'Sheen Roughness': 0.42,
                        'Sheen Tint': (0.5, 0.41, 0.3, 1.0)},
        'tigo-polo': {'Roughness': 0.88, 'Specular IOR Level': 0.25, 'Sheen Weight': 1.0, 'Sheen Roughness': 0.6,
                      'Sheen Tint': (0.18, 0.23, 0.24, 1.0)},
        'tigo-brillo': {'Roughness': 0.22, 'Specular IOR Level': 0.6, 'Coat Weight': 0.7, 'Coat Roughness': 0.06},
    }
    for nombre, valores in ajustes.items():
        mat = bpy.data.materials[nombre]
        nt = mat.node_tree
        nt.nodes.clear()
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = img
        nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        nt.links.new(bsdf.outputs[0], out.inputs['Surface'])
        bsdf.inputs['Metallic'].default_value = 0.0
        for k, v in valores.items():
            bsdf.inputs[k].default_value = v
        mat.use_backface_culling = True
    return img


# ================================================================================================ poses
def poner_clip(arm, nombre, cuadro):
    ad = arm.animation_data
    for t in ad.nla_tracks:
        t.mute = True
    act = bpy.data.actions[nombre]
    ad.action = act
    if ad.action_slot is None and act.slots:
        ad.action_slot = act.slots[0]
    bpy.context.scene.frame_set(int(cuadro))
    bpy.context.view_layer.update()


def congelar(arm):
    """Deja la pose del cuadro actual sin acción activa (para retocarla a mano sin que el clip la pise)."""
    poses = {pb.name: pb.matrix_basis.copy() for pb in arm.pose.bones}
    arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.matrix_basis = poses[pb.name]
    bpy.context.view_layer.update()


def quitar_clip(arm):
    ad = arm.animation_data
    ad.action = None
    for t in ad.nla_tracks:
        t.mute = False
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix()
    bpy.context.view_layer.update()


def orientar(arm, hueso, hijo, d, cabeza_hijo=True):
    """Como orientar() de guia.js: gira `hueso` para que (su cabeza → la cabeza de `hijo`) apunte a `d` (mundo)."""
    pb, ph = arm.pose.bones[hueso], arm.pose.bones[hijo]
    mw = arm.matrix_world
    a, b = mw @ pb.head, mw @ ph.head
    q = (b - a).normalized().rotation_difference(Vector(d).normalized())
    m = mw @ pb.matrix
    t = Matrix.Translation(a) @ q.to_matrix().to_4x4() @ Matrix.Translation(-a)
    pb.matrix = mw.inverted() @ (t @ m)
    bpy.context.view_layer.update()


def pose_senalar(arm, lado='R', d=(-0.35, -1.0, 0.15)):
    """Señalar al frente con el brazo derecho (como guia.instancia().animar('senalar')): brazo y antebrazo por
    código; en la mano, el índice estirado y los otros dedos doblados (eso lo haría un clip `senalar`)."""
    s = -1 if lado == 'R' else 1
    d = Vector((d[0] if s < 0 else -d[0], d[1], d[2])).normalized()
    orientar(arm, 'DEF-upper_arm.' + lado, 'DEF-forearm.' + lado, d)
    orientar(arm, 'DEF-forearm.' + lado, 'DEF-hand.' + lado, d)
    orientar(arm, 'DEF-hand.' + lado, 'DEF-f_middle.01.' + lado, d)
    doblar_dedos(arm, lado)


def doblar_dedos(arm, lado, indice=(-4, -8, -6), otros=(70, 85, 60), pulgar=(20, 35, 25)):
    """Dobla los dedos (grados por falange; negativo = estirar). Por defecto: el índice estirado, los demás cerrados."""
    for dedo in ('f_index', 'f_middle', 'f_ring', 'f_pinky', 'thumb'):
        ang = indice if dedo == 'f_index' else pulgar if dedo == 'thumb' else otros
        for i in (1, 2, 3):
            pb = arm.pose.bones['DEF-%s.%02d.%s' % (dedo, i, lado)]
            pb.rotation_mode = 'XYZ'
            pb.rotation_euler = (math.radians(-ang[i - 1]), 0, 0)
    bpy.context.view_layer.update()


# ================================================================================================ vistas
def vista_previa(objs, ruta, vistas, res=(900, 900), centro=(0, 0, 0.5), escala=1.25):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.light = 'STUDIO'
    sc.display.shading.color_type = 'SINGLE'
    sc.display.shading.single_color = (0.95, 0.62, 0.36)
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.film_transparent = False
    cam = bpy.data.objects.get('cam') or bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    if cam.name not in sc.collection.objects:
        sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = escala
    salidas = []
    for nombre, (az, el) in vistas.items():
        d = direccion(az, el)
        cam.location = Vector(centro) + d * 4
        cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = ruta.replace('.png', '-%s.png' % nombre)
        bpy.ops.render.render(write_still=True)
        salidas.append(sc.render.filepath)
    return salidas


def parametros_cara(cabeza):
    """Ojos y nariz en «metros de cara» (U, V) para mapa_cara: donde caen las piezas sobre la cabeza."""
    from mathutils.bvhtree import BVHTree
    bvh = BVHTree.FromObject(cabeza, bpy.context.evaluated_depsgraph_get())
    C = Vector(CABEZA_C)
    ojos = []
    for s in (1, -1):
        hit, _ = golpe(bvh, C, direccion(OJO_AZ * s, OJO_EL))
        d = (hit - C).length
        el = math.radians(OJO_EL)
        ojos.append((math.radians(OJO_AZ * s) * math.cos(el) * R0, el * R0, OJO_RX * R0 / d, OJO_RY * R0 / d))
    hit, _ = golpe(bvh, C, direccion(0, NARIZ_EL))
    d = (hit - C).length
    nariz = (0.0, math.radians(NARIZ_EL) * R0, R0 / d, [(-0.017, 0.006), (0.017, 0.006), (0.0, -0.009)], 0.0075)
    return ojos, nariz


# ================================================================================================ exportar
def exportar(arm, malla, ruta):
    quitar_clip(arm)
    for t in list(arm.animation_data.nla_tracks):
        arm.animation_data.nla_tracks.remove(t)
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    malla.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=ruta, export_format='GLB', use_selection=True, export_yup=True, export_apply=False,
        export_texcoords=True, export_normals=True, export_tangents=False, export_materials='EXPORT',
        export_image_format='AUTO', export_attributes=False, export_skins=True, export_all_influences=False,
        export_def_bones=False, export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True,
        export_frame_step=1, export_optimize_animation_size=True, export_morph=False, export_cameras=False,
        export_lights=False, export_extras=False)
    log('GLB crudo: %s (%d KB)' % (ruta, os.path.getsize(ruta) // 1024))


def buscar_gltf_transform():
    """@gltf-transform/cli@4 de la caché de npx (no descarga nada)."""
    for b in sorted(glob.glob(os.path.expanduser('~/.npm/_npx/*/node_modules/.bin/gltf-transform'))):
        try:
            v = subprocess.run([b, '--version'], capture_output=True, text=True, timeout=60).stdout.strip()
        except Exception:
            continue
        if v.startswith('4'):
            return [b]
    return ['npx', '--offline', '-y', '@gltf-transform/cli@4']


def fortachon(ruta):
    """El físico «fortachón» (16 de octubre de 2026) sobre el GLB ya optimizado, en el mismo archivo."""
    script = os.path.join(RAIZ, 'scripts', 'tigo', 'modelo-tigo-fortachon.mjs')
    r = subprocess.run(['node', script, ruta, ruta], capture_output=True, text=True)
    if r.returncode:
        sys.exit('modelo-tigo-fortachon.mjs falló: %s' % (r.stderr or r.stdout)[-800:])
    for linea in r.stdout.strip().splitlines():
        log('fortachón:', linea.strip())


def optimizar(crudo, final, carpeta):
    """weld + dedup + prune + meshopt (EXT_meshopt_compression + cuantización), como optimizar_glb.sh."""
    gt = buscar_gltf_transform()
    env = dict(os.environ, npm_config_prefer_offline='true')
    pasos = [['weld', crudo, os.path.join(carpeta, 'o1.glb')],
             ['dedup', os.path.join(carpeta, 'o1.glb'), os.path.join(carpeta, 'o2.glb')],
             ['prune', os.path.join(carpeta, 'o2.glb'), os.path.join(carpeta, 'o3.glb')],
             ['meshopt', os.path.join(carpeta, 'o3.glb'), final, '--level', 'medium']]
    for p in pasos:
        r = subprocess.run(gt + p, env=env, capture_output=True, text=True)
        if r.returncode:
            sys.exit('gltf-transform falló en %s: %s' % (p[0], r.stderr[-600:]))
    log('optimizado: %d KB → %d KB (%s)' % (os.path.getsize(crudo) // 1024, os.path.getsize(final) // 1024, final))


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
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'PNG'
    sc.world = sc.world or bpy.data.worlds.new('mundo')
    bg = next(n for n in sc.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Color'].default_value = (*lineal(hex_rgb('#E9EFEA')), 1)
    bg.inputs['Strength'].default_value = 0.9
    for nombre, energia, rot, color in (('sol', 3.2, (52, 0, -28), (1, 1, 1)), ('contra', 2.2, (60, 0, 150), (1, 0.9, 0.78)),
                                        ('relleno', 0.9, (75, 0, 60), (0.9, 0.95, 1))):
        l = bpy.data.lights.new(nombre, 'SUN')
        l.energy = energia
        l.color = color
        l.angle = math.radians(8)
        o = bpy.data.objects.new(nombre, l)
        o.rotation_euler = [math.radians(a) for a in rot]
        sc.collection.objects.link(o)
    # piso claro para la sombra
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=3)
    piso = malla_desde(bm, 'piso')
    m = bpy.data.materials.new('piso')
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*lineal(hex_rgb('#DCE5DD')), 1)
    b.inputs['Roughness'].default_value = 0.9
    piso.data.materials.append(m)


def foto(sc, ruta, az, el, centro, escala, res=(900, 1000)):
    cam = bpy.data.objects.get('cam') or bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    if cam.name not in sc.collection.objects:
        sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = escala
    sc.render.resolution_x, sc.render.resolution_y = res
    d = direccion(az, el)
    cam.location = Vector(centro) + d * 4
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = ruta
    bpy.ops.render.render(write_still=True)
    log('captura', ruta)


def capturas(arm, carpeta):
    sc = bpy.context.scene
    escena_render(sc)
    os.makedirs(carpeta, exist_ok=True)
    R = lambda n: os.path.join(carpeta, 'T-%s.png' % n)  # noqa: E731
    quitar_clip(arm)
    poner_clip(arm, 'Idle_Loop', 1)
    for n, az, el in (('frente', 0, 6), ('tres-cuartos', 35, 10), ('costado', 90, 5), ('atras', 180, 10)):
        foto(sc, R(n), az, el, (0, 0, 0.5), 1.2)
    foto(sc, R('cara'), 18, 6, tuple(CABEZA_C + Vector((0, 0, 0.03))), 0.55, (900, 900))
    quitar_clip(arm)
    foto(sc, R('reposo'), 0, 4, (0, 0, 0.5), 1.45, (1100, 1000))
    for clip, cuadro, n in (('Walk_Loop', 6, 'caminar'), ('Jog_Fwd_Loop', 5, 'correr'), ('Idle_Talking_Loop', 20, 'hablar')):
        quitar_clip(arm)
        poner_clip(arm, clip, cuadro)
        foto(sc, R(n), 40, 8, (0, 0, 0.5), 1.25)
    quitar_clip(arm)
    poner_clip(arm, 'Idle_Loop', 1)
    congelar(arm)
    pose_senalar(arm)
    foto(sc, R('senalar'), 25, 8, (0, 0, 0.5), 1.35)
    foto(sc, R('mano'), -55, 12, tuple(arm.matrix_world @ arm.pose.bones['DEF-hand.R'].head), 0.32, (800, 800))
    quitar_clip(arm)


def main():
    a = args()
    arm = cargar_persona()
    H = proporciones(arm)
    escalar_cadera(arm)
    cuerpo, campo_polo = modelar_cuerpo(H)
    cabeza = modelar_cabeza()
    piezas = piezas_cara(cabeza)
    if a.etapa == 'malla':
        vista_previa([cuerpo, cabeza], os.path.join(a.tmp, 'malla.png'),
                     {'frente': (0, 5), 'costado': (90, 5), 'tres-cuartos': (35, 12), 'atras': (180, 10)})
        vista_previa([cuerpo, cabeza], os.path.join(a.tmp, 'cara.png'),
                     {'frente': (0, 3), 'costado': (90, 3), 'tres-cuartos': (35, 10), 'arriba': (20, 45)},
                     res=(700, 700), centro=tuple(CABEZA_C + Vector((0, 0, 0.05))), escala=0.62)
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(a.tmp, 'malla.blend'))
        return
    reducir(cuerpo, 9000)
    reducir(cabeza, 4200)
    reducir(piezas[-1], 260)
    cortar_polo(cuerpo)
    ojos, nariz = parametros_cara(cabeza)
    malla = unir_todo(arm, cuerpo, cabeza, piezas, campo_polo, H)
    log('malla final: %d triángulos, %d vértices' % (sum(len(p.vertices) - 2 for p in malla.data.polygons), len(malla.data.vertices)))
    desplegar(malla)
    ruta = hornear(malla, arm, H, a.tmp, ojos, nariz)
    materiales_finales(ruta)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(a.tmp, 'tigo.blend'))
    crudo = os.path.join(a.tmp, 'tigo-crudo.glb')
    exportar(arm, malla, crudo)
    if a.sin_optimizar:
        log('sin optimizar: queda %s' % crudo)
    else:
        optimizar(crudo, a.salida, a.tmp)
        if not a.sin_fortachon:
            fortachon(a.salida)
    if a.render:
        capturas(arm, a.render)


main()
