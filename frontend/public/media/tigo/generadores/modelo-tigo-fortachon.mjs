#!/usr/bin/env node
/* Tigo un poquito más fortachón (pedido 9 del cliente, 16 de octubre de 2026).

   «Tigo, ¿no puede ser un poquito más fortachón? Está un poquito gordito.» Menos panza y cintura, pecho y hombros
   un poco más anchos y brazos un poco más fuertes, sin tocar la cara ni la identidad. Es un cambio moderado.

   No vuelve a modelar a Tigo. Abre el GLB aprobado y mueve solo los vértices del cuerpo en la pose de reposo, con un
   campo de deformación suave. El campo depende de la posición en reposo y de los pesos de piel de cada vértice, así que
   los vértices duplicados en las costuras (UV y material) se mueven igual. Todo lo demás queda idéntico, byte por byte:
   - el esqueleto (los 53 huesos `DEF-*`, o 54 con `DEF-jaw`, sus posiciones de reposo y las matrices de enlace);
   - los pesos, las UV, la textura de 1024 px y los materiales;
   - los clips (Idle_Loop, Walk_Loop, Idle_Talking_Loop y Jog_Fwd_Loop): traen traslación en los 53 huesos, así que
     mover un hueso de reposo rompería la malla en cada cuadro. Por eso se mueve la malla y no los huesos. Los clips de
     tigo-baile.glb (solo esqueleto y clips, sin malla) siguen enlazando igual: no hay que regenerarlo;
   - la cabeza (rígida a `DEF-head`, y a `DEF-jaw` en la versión con boca), los ojos, la nariz, la boca, el morph
     `parpadeo` y la malla `boca_interior`: el campo vale 0 allí (se comprueba al correr);
   - las piernas, las manos y la cola.
   Las normales se transforman con el jacobiano del mismo campo (n' ∝ J⁻ᵀ·n): quedan suaves, iguales a los dos lados
   de cada costura, y se conserva el suavizado del original. La cuantización y la compresión (KHR_mesh_quantization +
   EXT_meshopt_compression, método «quantize») son las del GLB de entrada: se reescriben en el mismo formato.

   Qué cambia (ejes de Blender: x = izquierda de Tigo, y = atrás, z = arriba; metros; Tigo mide ~1 m):
   - panza: el frente del vientre entra hacia la columna (z 0.20–0.52, el máximo entre 0.33 y 0.37);
   - cintura: el tronco se angosta a los lados, también el dobladillo del polo (z 0.20–0.50); con los brazos abajo, a
     esa altura cuelgan las manos y les queda más aire;
   - pecho y hombros: el tronco se ensancha arriba (z 0.44–0.56), el pecho sale apenas hacia adelante y el deltoide se
     marca (una joroba en el engrosado del brazo, cerca del hombro);
   - brazos: brazo y antebrazo más gruesos alrededor de su eje, menos por debajo (el lado que mira al tronco cuando los
     brazos cuelgan) y más por encima; llega a 0 en la muñeca: las manos no cambian.
   Las transiciones son anchas a propósito: con una transición corta, las caras largas de la malla decimada dibujan
   cuñas de sombra (se vio en gris, sin textura).
   Determinista: no hay azar. Marca la malla (extras.fisico) y no se aplica dos veces.

   Uso (desde la raíz del repo; Node 20+ y @gltf-transform 4 + meshoptimizer en la caché de npx, como los otros
   scripts de Tigo: no descarga nada):
     node scripts/tigo/modelo-tigo-fortachon.mjs ENTRADA.glb SALIDA.glb       aplica el cambio
     node scripts/tigo/modelo-tigo-fortachon.mjs --medir A.glb [B.glb ...]     solo imprime las medidas (reposo e Idle)
   Lo usan public/media/tigo/modelos/tigo.glb y tigo-propuesta.glb (ver public/media/tigo/LICENCIAS.md). modelo-tigo.py
   lo corre al final si se regenera a Tigo desde cero (salvo con --sin-fortachon). modelo-tigo-boca.py parte de
   tigo.glb, que ya trae este físico.
   Los originales del 16 de octubre de 2026 están en docs/tigo/respaldo-modelos/2026-10-16/.
*/
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const FISICO = 'fortachon-1';

// ---------------------------------------------------------------------------------------------- parámetros
// Perfiles por altura (z en metros): meseta(z, sube desde, llega a, se mantiene hasta, baja a 0 en).
const P = {
    cintura: { k: 0.085, perfil: [0.20, 0.33, 0.38, 0.50] },   // x × (1 − k): los costados entran
    panza: { k: 0.11, perfil: [0.20, 0.33, 0.37, 0.52] },       // frente del vientre × (1 − k) hacia la columna
    pecho: { k: 0.08, perfil: [0.44, 0.515, 0.53, 0.56] },     // x × (1 + k): el tronco se ensancha arriba
    pectoral: { k: 0.03, perfil: [0.40, 0.50, 0.50, 0.555] },   // frente del pecho × (1 + k)
    brazo: { k: 0.15, antebrazo: 0.13, deltoide: 0.07, abajo: 0.6, arriba: 0.3 }, // radio × (1 + k); el deltoide suma
    ejeY: 0.0,                                                   // y de la columna (frente: y < ejeY)
};

// ---------------------------------------------------------------------------------------------- utilidades
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const suave = (x, a, b) => { const t = limitar((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const meseta = (z, [z0, z1, z2, z3]) => suave(z, z0, z1) * (1 - suave(z, z2, z3));
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const largo = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => { const l = largo(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mul4 = (a, b) => { const r = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return r; };
const aplicar4 = (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]];
// glTF (Y arriba, frente +Z) ↔ Blender (Z arriba, frente −Y)
const aBlender = (g) => [g[0], -g[2], g[1]];
const aGltf = (b) => [b[0], b[2], -b[1]];

function modulosNpx() {
    const raiz = join(homedir(), '.npm', '_npx');
    const lista = existsSync(raiz) ? readdirSync(raiz).sort() : [];
    for (const d of lista) {
        const nm = join(raiz, d, 'node_modules');
        if (['@gltf-transform/core', '@gltf-transform/extensions', 'meshoptimizer'].every((x) => existsSync(join(nm, x)))) return nm;
    }
    throw new Error('Falta @gltf-transform 4 en la caché de npx (corre una vez: npx -y @gltf-transform/cli@4 --version).');
}

const NM = modulosNpx();
const { NodeIO } = await import(join(NM, '@gltf-transform/core/dist/index.js'));
const { ALL_EXTENSIONS } = await import(join(NM, '@gltf-transform/extensions/dist/index.js'));
const { MeshoptDecoder, MeshoptEncoder } = await import(join(NM, 'meshoptimizer/index.js'));
await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

// ---------------------------------------------------------------------------------------------- lectura
/** Vértices de tigo-malla en reposo, en ejes de Blender, con sus pesos por nombre de hueso. */
function leerMalla(doc) {
    const nodo = doc.getRoot().listNodes().find((n) => n.getName() === 'tigo-malla');
    if (!nodo || !nodo.getSkin()) throw new Error('No encuentro el nodo «tigo-malla» con piel.');
    const skin = nodo.getSkin();
    const huesos = skin.listJoints();
    const ibm = skin.getInverseBindMatrices();
    // Matriz de enlace: mundo del hueso en reposo × su inversa de enlace. Es la misma para todos los huesos (incluye la
    // escala de la cuantización, KHR_mesh_quantization la pone en las matrices de enlace de una malla con piel).
    const S = mul4(huesos[0].getWorldMatrix(), ibm.getElement(0, []));
    for (let j = 1; j < huesos.length; j++) {
        const Sj = mul4(huesos[j].getWorldMatrix(), ibm.getElement(j, []));
        if (Sj.some((x, k) => Math.abs(x - S[k]) > 1e-4)) throw new Error('Las matrices de enlace no coinciden: ' + huesos[j].getName());
    }
    if (Math.abs(S[1]) + Math.abs(S[2]) + Math.abs(S[4]) + Math.abs(S[6]) + Math.abs(S[8]) + Math.abs(S[9]) > 1e-6
        || Math.abs(S[0] - S[5]) > 1e-6 || Math.abs(S[0] - S[10]) > 1e-6) throw new Error('La matriz de enlace no es escala uniforme + traslación.');
    const Si = [1 / S[0], 0, 0, 0, 0, 1 / S[5], 0, 0, 0, 0, 1 / S[10], 0, -S[12] / S[0], -S[13] / S[5], -S[14] / S[10], 1];
    const reposo = Object.fromEntries(huesos.map((h) => [h.getName(), aBlender(h.getWorldTranslation())]));
    const prims = nodo.getMesh().listPrimitives().map((p) => {
        const pos = p.getAttribute('POSITION'), J = p.getAttribute('JOINTS_0'), W = p.getAttribute('WEIGHTS_0');
        const v = [], w = [];
        for (let i = 0; i < pos.getCount(); i++) {
            v.push(aBlender(aplicar4(S, pos.getElement(i, []))));
            const jj = J.getElement(i, []), ww = W.getElement(i, []), o = {};
            for (let k = 0; k < 4; k++) if (ww[k] > 0) { const n = huesos[jj[k]].getName(); o[n] = (o[n] || 0) + ww[k]; }
            w.push(o);
        }
        return { p, v, w };
    });
    return { nodo, S, Si, reposo, prims };
}

// ---------------------------------------------------------------------------------------------- el campo
const sumaPesos = (w, re) => Object.entries(w).reduce((s, [n, x]) => s + (re.test(n) ? x : 0), 0);

/** Desplazamiento (ejes de Blender) de un vértice en reposo `v` con pesos `w`. */
function desplazar(v, w, reposo) {
    const [x, y, z] = v;
    const cabeza = (w['DEF-head'] || 0) + (w['DEF-jaw'] || 0);
    if (cabeza > 0.999) return [0, 0, 0];
    const brazo = sumaPesos(w, /^DEF-(upper_arm|forearm|hand|f_|thumb)/);
    const pierna = sumaPesos(w, /^DEF-(thigh|shin|foot|toe)/);
    const tronco = limitar(1 - brazo - pierna - cabeza, 0, 1);
    const d = [0, 0, 0];
    // --- tronco: cintura y pecho (a los lados), panza y pectorales (al frente)
    if (tronco > 0) {
        const kx = -P.cintura.k * meseta(z, P.cintura.perfil) + P.pecho.k * meseta(z, P.pecho.perfil);
        d[0] += x * kx * tronco;
        const frente = suave(y, P.ejeY, P.ejeY - 0.05);            // 0 detrás de la columna, 1 al frente
        const ky = -P.panza.k * meseta(z, P.panza.perfil) + P.pectoral.k * meseta(z, P.pectoral.perfil);
        d[1] += (y - P.ejeY) * ky * frente * tronco;
    }
    // --- brazos: más gruesos alrededor de su eje, del hombro a la muñeca, con el deltoide más marcado
    for (const [lado, s] of [['L', 1], ['R', -1]]) {
        // brazo, antebrazo y la parte del hueso del hombro que forma el deltoide
        const masa = sumaPesos(w, new RegExp('^DEF-(shoulder|upper_arm|forearm)\\.' + lado + '$'));
        if (masa <= 0 || x * s <= 0) continue;
        const A = reposo['DEF-upper_arm.' + lado], B = reposo['DEF-hand.' + lado];
        const AB = sub(B, A), L = largo(AB), u = unit(AB);
        const q = sub(v, A), t = dot(q, u) / L;                    // 0 en el hombro, 1 en la muñeca
        const r = sub(q, [u[0] * t * L, u[1] * t * L, u[2] * t * L]);
        const g = suave(t, -0.15, 0.1) * (1 - suave(t, 0.86, 0.99));
        const k = P.brazo.k + (P.brazo.antebrazo - P.brazo.k) * suave(t, 0.45, 0.6)
            + P.brazo.deltoide * Math.exp(-(((t - 0.1) / 0.14) ** 2));
        // Con el brazo abajo, lo de abajo en reposo mira al tronco (se engrosa menos) y lo de arriba queda afuera (más).
        const rz = unit(r)[2];
        const f = k * g * (1 - P.brazo.abajo * Math.max(0, -rz) + P.brazo.arriba * Math.max(0, rz)) * masa;
        for (let i = 0; i < 3; i++) d[i] += r[i] * f;
    }
    return d;
}

// ---------------------------------------------------------------------------------------------- normales
/** La normal después de deformar: n' ∝ J⁻ᵀ·n, con J = I + ∂d/∂p (diferencias centrales del campo, con los pesos del
 *  vértice). Sale del campo y no de los triángulos, así que es suave aunque la malla decimada tenga caras largas, y
 *  conserva el suavizado del original. Devuelve null si el campo no cambia alrededor del vértice. */
function normalNueva(pv, w, reposo, nGl) {
    const h = 1e-4;
    const col = [0, 1, 2].map((k) => {
        const a = pv.slice(), b = pv.slice();
        a[k] += h; b[k] -= h;
        const da = desplazar(a, w, reposo), db = desplazar(b, w, reposo);
        const c = [(da[0] - db[0]) / (2 * h), (da[1] - db[1]) / (2 * h), (da[2] - db[2]) / (2 * h)];
        return c;
    });
    if (col.every((c) => c[0] === 0 && c[1] === 0 && c[2] === 0)) return null;
    col.forEach((c, k) => { c[k] += 1; });
    const n = aBlender(nGl), c12 = cruz(col[1], col[2]), c20 = cruz(col[2], col[0]), c01 = cruz(col[0], col[1]);
    return aGltf(unit([0, 1, 2].map((i) => n[0] * c12[i] + n[1] * c20[i] + n[2] * c01[i])));
}

// ---------------------------------------------------------------------------------------------- medidas
/** Pose de un clip en el instante `t` (con piel, sin three.js): pone el TRS de cada canal en los nodos del documento
 *  (que se descarta) y devuelve los vértices de tigo-malla en el mundo, en ejes de Blender. */
function posar(doc, malla, clip, t) {
    const anim = doc.getRoot().listAnimations().find((a) => a.getName() === clip);
    if (!anim) throw new Error('No hay clip ' + clip);
    for (const c of anim.listChannels()) {
        const smp = c.getSampler(), ent = smp.getInput().getArray(), sal = smp.getOutput(), nodo = c.getTargetNode();
        let k = 0;
        while (k < ent.length - 2 && ent[k + 1] < t) k++;
        const k1 = Math.min(k + 1, ent.length - 1), u = ent[k1] > ent[k] ? limitar((t - ent[k]) / (ent[k1] - ent[k]), 0, 1) : 0;
        const a = sal.getElement(k, []), b = sal.getElement(k1, []);
        let val;
        if (smp.getInterpolation() === 'STEP') val = a;
        else if (c.getTargetPath() === 'rotation') {
            let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
            const bb = d < 0 ? b.map((x) => -x) : b; d = Math.abs(d);
            const w = d > 0.9995 ? [1 - u, u] : (() => { const th = Math.acos(d), sn = Math.sin(th); return [Math.sin((1 - u) * th) / sn, Math.sin(u * th) / sn]; })();
            val = unit4(a.map((x, i) => x * w[0] + bb[i] * w[1]));
        } else val = a.map((x, i) => x + (b[i] - x) * u);
        if (c.getTargetPath() === 'translation') nodo.setTranslation(val);
        else if (c.getTargetPath() === 'rotation') nodo.setRotation(val);
        else if (c.getTargetPath() === 'scale') nodo.setScale(val);
    }
    const skin = malla.nodo.getSkin(), ibm = skin.getInverseBindMatrices();
    const J = skin.listJoints().map((h, j) => mul4(h.getWorldMatrix(), ibm.getElement(j, [])));
    return malla.prims.map(({ p }) => {
        const pos = p.getAttribute('POSITION'), JJ = p.getAttribute('JOINTS_0'), W = p.getAttribute('WEIGHTS_0');
        return Array.from({ length: pos.getCount() }, (_, i) => {
            const v = pos.getElement(i, []), jj = JJ.getElement(i, []), ww = W.getElement(i, []), r = [0, 0, 0];
            for (let k = 0; k < 4; k++) if (ww[k] > 0) { const q = aplicar4(J[jj[k]], v); r[0] += q[0] * ww[k]; r[1] += q[1] * ww[k]; r[2] += q[2] * ww[k]; }
            return aBlender(r);
        });
    });
}
const unit4 = (q) => { const l = Math.hypot(...q) || 1; return q.map((x) => x / l); };

/** Medidas en metros: en reposo (en T) y en Idle_Loop a los 0.5 s (brazos abajo, como se ve en la página). */
function medir(malla, doc) {
    const Wt = malla.prims.flatMap(({ w }) => w);
    const esCabeza = (w) => (w['DEF-head'] || 0) + (w['DEF-jaw'] || 0) > 0.999;
    const esBrazo = (w) => sumaPesos(w, /^DEF-(upper_arm|forearm|hand|f_|thumb)/) > 0.3;
    const esCola = (p) => p[1] > 0.1 && Math.abs(p[0]) < 0.06 && p[2] < 0.4;
    const ancho = (ps) => Math.max(...ps.map((p) => p[0])) - Math.min(...ps.map((p) => p[0]));
    const frente = (ps) => -Math.min(...ps.map((p) => p[1]));
    const z = (p) => p.toFixed(3);
    const V = malla.prims.flatMap(({ v }) => v);
    const tronco = (P, z0, z1) => P.filter((p, i) => p[2] >= z0 && p[2] <= z1 && !esCabeza(Wt[i]) && !esBrazo(Wt[i]) && !esCola(p));
    const radioBrazo = (x0) => {
        const A = malla.reposo['DEF-upper_arm.L'], B = malla.reposo['DEF-hand.L'], u = unit(sub(B, A));
        const rs = V.filter((p, i) => Math.abs(p[0] - x0) < 0.008 && !esCabeza(Wt[i])).map((p) => {
            const q = sub(p, A), t = dot(q, u); return largo(sub(q, [u[0] * t, u[1] * t, u[2] * t]));
        }).filter((r) => r < 0.09);
        return rs.length ? Math.max(...rs) : 0;
    };
    const I = posar(doc, malla, 'Idle_Loop', 0.5).flat();
    return {
        'Idle: hombros, de deltoide a deltoide (z 0.45–0.60)': z(ancho(I.filter((p, i) => p[2] > 0.45 && p[2] < 0.6 && !esCabeza(Wt[i])))),
        'Idle: cintura, ancho del tronco (z 0.36–0.42)': z(ancho(tronco(I, 0.36, 0.42))),
        'Idle: panza, frente (z 0.28–0.42)': z(frente(tronco(I, 0.28, 0.42))),
        'Idle: pecho, frente (z 0.45–0.52)': z(frente(tronco(I, 0.45, 0.52))),
        'reposo: pecho, ancho (z 0.49–0.53)': z(ancho(tronco(V, 0.49, 0.53))),
        'reposo: cintura, ancho (z 0.37–0.43)': z(ancho(tronco(V, 0.37, 0.43))),
        'reposo: panza, ancho (z 0.32–0.38)': z(ancho(tronco(V, 0.32, 0.38))),
        'reposo: panza, frente desde la columna (z 0.30–0.42)': z(frente(tronco(V, 0.30, 0.42))),
        'reposo: pecho, frente desde la columna (z 0.46–0.50)': z(frente(tronco(V, 0.46, 0.5))),
        'reposo: radio de la manga (x 0.21)': z(radioBrazo(0.21)),
        'reposo: radio del antebrazo (x 0.34)': z(radioBrazo(0.34)),
    };
}
const medirArchivo = async (f) => { const d = await io.read(f); return medir(leerMalla(d), d); };

// ---------------------------------------------------------------------------------------------- aplicar
async function fortalecer(entrada, salida) {
    const doc = await io.read(entrada);
    const malla = leerMalla(doc);
    const mesh = malla.nodo.getMesh();
    if ((mesh.getExtras() || {}).fisico === FISICO) throw new Error(entrada + ' ya es «' + FISICO + '»: no se aplica dos veces.');
    const antes = await medirArchivo(entrada);
    const viejasGl = malla.prims.map(({ p }) => { const a = p.getAttribute('POSITION'); return Array.from({ length: a.getCount() }, (_, i) => aplicar4(malla.S, a.getElement(i, []))); });
    let movidos = 0, maximo = 0;
    const nuevasGl = malla.prims.map(({ v, w, p }, pi) => v.map((pv, i) => {
        const d = desplazar(pv, w[i], malla.reposo);
        const m = largo(d);
        if (m === 0) return viejasGl[pi][i];
        movidos++; maximo = Math.max(maximo, m);
        return aGltf([pv[0] + d[0], pv[1] + d[1], pv[2] + d[2]]);
    }));
    // nada de la cara ni del parpadeo se mueve
    malla.prims.forEach(({ p }, pi) => {
        for (const t of p.listTargets()) {
            const dp = t.getAttribute('POSITION');
            for (let i = 0; i < dp.getCount(); i++) {
                const e = dp.getElement(i, []);
                if (Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) > 0 && nuevasGl[pi][i] !== viejasGl[pi][i]) throw new Error('El campo movería un vértice del morph «parpadeo».');
            }
        }
    });
    let giradas = 0;
    malla.prims.forEach(({ p, v, w }, pi) => {
        const pos = p.getAttribute('POSITION'), nor = p.getAttribute('NORMAL');
        for (let i = 0; i < pos.getCount(); i++) {
            if (nuevasGl[pi][i] !== viejasGl[pi][i]) {
                const q = aplicar4(malla.Si, nuevasGl[pi][i]);
                if (q.some((c) => Math.abs(c) > 1)) throw new Error('Un vértice queda fuera del volumen de cuantización.');
                pos.setElement(i, q);
            }
            const n = normalNueva(v[i], w[i], malla.reposo, nor.getElement(i, []));
            if (n) { nor.setElement(i, n); giradas++; }
        }
    });
    mesh.setExtras({ ...(mesh.getExtras() || {}), fisico: FISICO });
    await io.write(salida, doc);
    const despues = await medirArchivo(salida);
    console.log(`${entrada} → ${salida}\n  ${movidos} vértices movidos (máx. ${(maximo * 1000).toFixed(1)} mm), ${giradas} normales giradas`);
    console.log('  medida (m)'.padEnd(58) + 'antes   después');
    for (const k of Object.keys(antes)) console.log('  ' + k.padEnd(56) + antes[k] + '   ' + despues[k]);
}

const args = process.argv.slice(2);
if (args[0] === '--medir') {
    for (const f of args.slice(1)) { console.log(f); for (const [k, v] of Object.entries(await medirArchivo(f))) console.log('  ' + k.padEnd(56) + v); }
} else if (args.length === 2) {
    try { await fortalecer(args[0], args[1]); } catch (e) { console.error('No se aplicó: ' + e.message); process.exit(1); }
} else {
    console.error('Uso: node scripts/tigo/modelo-tigo-fortachon.mjs ENTRADA.glb SALIDA.glb  |  --medir A.glb [B.glb ...]');
    process.exit(2);
}
