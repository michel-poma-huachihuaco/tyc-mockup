#!/usr/bin/env node
/**
 * `npm run demo:quitar`: borra del proyecto la galería de demostración (/demo).
 *
 * La galería es solo de desarrollo —producción nunca la lleva— y sirve para ver el sistema de
 * diseño mientras se arranca. Cuando ya no hace falta, este script la quita entera:
 *
 *  1. Comprueba con `git status --porcelain` que el proyecto no tenga cambios sin commitear,
 *     para que lo que se borra se revise con `git diff` y se deshaga con git. `--forzar` se
 *     salta la comprobación.
 *  2. Dice qué va a borrar y pide confirmación. `--si` no pregunta.
 *  3. Recorta las regiones marcadas con `aybar:demo` (de la marca de inicio a la de fin, las
 *     dos incluidas) en todos los formatos: `//` y `/* … *\/` (TS, CSS), `{/* … *\/}` (JSX),
 *     `<!-- … -->` (HTML, Markdown, plantillas de Angular) y `#` (.env). Busca en src/,
 *     pruebas/, scripts/ y los archivos sueltos de la raíz (README.md, index.html,
 *     vite.config.ts, .env*, y los tsconfig*.json, que admiten comentarios).
 *  4. Borra la galería: src/demo/ en React; src/app/demo/, galeria.ts y galeria.development.ts
 *     en Angular (lo que los usa está dentro de regiones). Y las pruebas pruebas/demo-*.
 *  5. Corre `npm uninstall three @types/three axe-core` con los que estén en package.json.
 *  6. Edita por estructura lo que es JSON, que no admite comentarios: en angular.json, el
 *     `fileReplacements` de galeria.ts (y three o axe-core en `allowedCommonJsDependencies`,
 *     si alguien los añadió); en package.json, el script `demo:quitar`.
 *  7. Se borra a sí mismo y comprueba que no quede ninguna referencia a la galería.
 *
 * Antes de tocar nada lee y valida todas las regiones: una marca suelta, anidada o con código
 * delante en la misma línea detiene el script sin cambiar ningún archivo.
 *
 * Es idempotente: si la galería ya no está, lo dice, verifica y termina sin error (por
 * ejemplo, `node ruta/a/una/copia/quitar-demo.mjs` en un proyecto ya limpio). Si algo falla a
 * mitad, volver a correrlo retoma lo que falte.
 *
 * Node ≥ 22, sin dependencias. Funciona igual en Windows: las rutas van con node:path y los
 * únicos procesos que lanza son git y npm. Para las pruebas, `quitarDemo()` recibe el
 * ejecutor de procesos y la pregunta de confirmación (pruebas/demo-quitar.test.ts).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { pathToFileURL } from 'node:url'

/** La marca de las regiones. Se arma por partes: este archivo no tiene regiones propias. */
const MARCA = 'aybar:demo'
const INICIO = `${MARCA}:inicio`
const FIN = `${MARCA}:fin`

/** Lo que solo usa la galería: el visor 3D (three) y el análisis de accesibilidad (axe-core). */
export const DEPENDENCIAS = ['three', '@types/three', 'axe-core']

/** Este script, relativo a la raíz del proyecto. */
const ESTE_SCRIPT = path.join('scripts', 'quitar-demo.mjs')

/** Qué se borra en cada plantilla. */
const PERFILES = {
  react: { nombre: 'React', borrar: [path.join('src', 'demo')] },
  angular: {
    nombre: 'Angular',
    borrar: [path.join('src', 'app', 'demo'), path.join('src', 'app', 'galeria.development.ts'), path.join('src', 'app', 'galeria.ts')],
  },
}

/** Carpetas que nunca se recorren: dependencias, salidas y cachés. */
const IGNORADAS = new Set(['node_modules', 'dist', '.angular', '.git', '.vite', 'coverage', 'paquetes'])

/** Las carpetas con código del proyecto; de la raíz, solo sus archivos sueltos. */
const CARPETAS = ['src', 'pruebas', 'scripts']

const EXTENSIONES = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.html', '.css', '.scss', '.md'])

/** Cómo empieza la línea de una marca: el comentario de cada formato. */
const APERTURA = /^(\/\/|\{\/\*|\/\*|<!--|#)\s*/
const CIERRE = { '//': '', '#': '', '/*': '*/', '{/*': '*/}', '<!--': '-->' }

/** Un error que se explica solo: el script lo imprime y sale con código 1, sin traza. */
export class ErrorQuitar extends Error {
  constructor(mensaje) {
    super(mensaje)
    this.name = 'ErrorQuitar'
  }
}

const relativa = (raiz, archivo) => path.relative(raiz, archivo).split(path.sep).join('/')

const esTexto = (nombre) => nombre.startsWith('.env') || EXTENSIONES.has(path.extname(nombre))

/** Los tsconfig admiten comentarios (JSONC): pueden llevar regiones, como el exclude de Angular. */
const esTsconfig = (nombre) => /^tsconfig.*\.json$/.test(nombre)

/** React o Angular, por los archivos de configuración; `null` si no es ninguno. */
export function detectarPerfil(raiz) {
  if (existsSync(path.join(raiz, 'angular.json'))) return 'angular'
  if (['vite.config.ts', 'vite.config.mts', 'vite.config.js'].some((f) => existsSync(path.join(raiz, f)))) return 'react'
  return null
}

/** Los archivos de texto del proyecto donde puede haber regiones o restos de la galería. */
function archivosDelProyecto(raiz) {
  const archivos = []
  for (const entrada of readdirSync(raiz, { withFileTypes: true })) {
    if (entrada.isFile() && (esTexto(entrada.name) || esTsconfig(entrada.name))) archivos.push(path.join(raiz, entrada.name))
  }
  const recorrer = (carpeta) => {
    for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
      if (IGNORADAS.has(entrada.name)) continue
      const ruta = path.join(carpeta, entrada.name)
      if (entrada.isDirectory()) recorrer(ruta)
      else if (entrada.isFile() && esTexto(entrada.name)) archivos.push(ruta)
    }
  }
  for (const carpeta of CARPETAS) {
    const ruta = path.join(raiz, carpeta)
    if (existsSync(ruta)) recorrer(ruta)
  }
  return archivos
}

/** La marca va sola: como primer contenido de la línea, dentro de un comentario. */
function aperturaDeMarca(linea, marca) {
  const recortada = linea.trim()
  const apertura = APERTURA.exec(recortada)
  if (!apertura || !recortada.slice(apertura[0].length).startsWith(marca)) return null
  return { comentario: apertura[1], recortada }
}

/**
 * El texto sin las regiones de la galería y cuántas había. Lanza `ErrorQuitar` si una marca
 * no está bien puesta: sin pareja, anidada, con código delante o con la de fin abriendo un
 * comentario que sigue en la línea de abajo. Respeta los saltos de línea del archivo (LF o
 * CRLF) y no deja dos líneas en blanco seguidas donde había una región.
 */
export function quitarRegiones(texto, archivo = 'el archivo') {
  const salto = texto.includes('\r\n') ? '\r\n' : '\n'
  const lineas = texto.split(/\r?\n/)
  const quedan = []
  let abierta = 0
  let regiones = 0
  let recienCerrada = false
  const fallo = (numero, motivo) => new ErrorQuitar(`${archivo}:${numero}: ${motivo}. No se cambió ningún archivo.`)

  lineas.forEach((linea, indice) => {
    const numero = indice + 1
    const conInicio = linea.includes(INICIO)
    const conFin = linea.includes(FIN)
    if (conInicio && conFin) throw fallo(numero, 'las marcas de inicio y de fin van en líneas distintas')
    if (conInicio) {
      if (abierta) throw fallo(numero, `región anidada: la de la línea ${abierta} sigue abierta`)
      if (!aperturaDeMarca(linea, INICIO)) throw fallo(numero, 'la marca de inicio va sola, como comentario al principio de la línea')
      abierta = numero
      return
    }
    if (conFin) {
      if (!abierta) throw fallo(numero, 'marca de fin sin su inicio')
      const marca = aperturaDeMarca(linea, FIN)
      if (!marca || !marca.recortada.endsWith(CIERRE[marca.comentario])) {
        throw fallo(numero, 'la marca de fin va sola en su línea, con su comentario cerrado')
      }
      abierta = 0
      regiones++
      recienCerrada = true
      return
    }
    if (abierta) return
    // Donde estaba la región no quedan dos líneas en blanco seguidas.
    if (recienCerrada && linea.trim() === '' && quedan.length > 0 && quedan[quedan.length - 1].trim() === '') {
      recienCerrada = false
      return
    }
    recienCerrada = false
    quedan.push(linea)
  })
  if (abierta) throw fallo(abierta, 'región sin cerrar')
  return { texto: quedan.join(salto), regiones }
}

const leerJson = (archivo) => JSON.parse(readFileSync(archivo, 'utf8'))

/** Escribe JSON con la sangría y el salto de línea final que tenía el archivo. */
function escribirJson(archivo, valor) {
  const original = readFileSync(archivo, 'utf8')
  const sangria = /^[ \t]+(?=")/m.exec(original)?.[0] ?? '  '
  const salto = original.includes('\r\n') ? '\r\n' : '\n'
  writeFileSync(archivo, `${JSON.stringify(valor, null, sangria).replace(/\n/g, salto)}${salto}`)
}

/** Una entrada de `fileReplacements` de la galería: la que cambia galeria.ts por la de desarrollo. */
const esReemplazoDeGaleria = (r) =>
  r !== null &&
  typeof r === 'object' &&
  [r.replace, r.with].some((ruta) => typeof ruta === 'string' && /(^|[\\/])galeria(\.development)?\.ts$/.test(ruta))

/**
 * Quita de angular.json, en cualquier configuración de cualquier proyecto, las entradas de
 * `fileReplacements` de la galería y las dependencias de la galería de
 * `allowedCommonJsDependencies`; una lista que se queda vacía desaparece. Devuelve cuántas
 * entradas quitó (sin escribir si `escribir` es falso).
 */
function editarAngularJson(raiz, escribir) {
  const archivo = path.join(raiz, 'angular.json')
  if (!existsSync(archivo)) return 0
  const json = leerJson(archivo)
  let quitadas = 0
  const recorrer = (nodo) => {
    if (Array.isArray(nodo)) return nodo.forEach(recorrer)
    if (nodo === null || typeof nodo !== 'object') return
    for (const [clave, valor] of Object.entries(nodo)) {
      const deGaleria =
        clave === 'fileReplacements' ? esReemplazoDeGaleria : clave === 'allowedCommonJsDependencies' ? (d) => DEPENDENCIAS.includes(d) : null
      if (deGaleria && Array.isArray(valor)) {
        const quedan = valor.filter((r) => !deGaleria(r))
        quitadas += valor.length - quedan.length
        if (quedan.length === 0) delete nodo[clave]
        else nodo[clave] = quedan
      } else recorrer(valor)
    }
  }
  recorrer(json)
  if (quitadas > 0 && escribir) escribirJson(archivo, json)
  return quitadas
}

/** Las dependencias de la galería que package.json todavía declara. */
function dependenciasPresentes(paquete) {
  return DEPENDENCIAS.filter((nombre) => [paquete.dependencies, paquete.devDependencies].some((grupo) => grupo && nombre in grupo))
}

/**
 * Qué falta por quitar, sin tocar nada: regiones por archivo (ya recortadas), lo que se
 * borra, el angular.json, el script de package.json y las dependencias.
 */
export function planificar(raiz, perfil = detectarPerfil(raiz)) {
  if (!perfil) throw new ErrorQuitar(`${raiz} no parece un frontend de Aybar: no hay angular.json ni vite.config.ts.`)
  const borrar = PERFILES[perfil].borrar.map((r) => path.join(raiz, r)).filter((r) => existsSync(r))
  const pruebas = path.join(raiz, 'pruebas')
  if (existsSync(pruebas)) {
    for (const nombre of readdirSync(pruebas)) {
      if (nombre.startsWith('demo-')) borrar.push(path.join(pruebas, nombre))
    }
  }
  const script = path.join(raiz, ESTE_SCRIPT)
  const dentroDeLoQueSeBorra = (archivo) => borrar.some((b) => archivo === b || archivo.startsWith(`${b}${path.sep}`)) || archivo === script

  const regiones = []
  for (const archivo of archivosDelProyecto(raiz)) {
    if (dentroDeLoQueSeBorra(archivo)) continue
    const texto = readFileSync(archivo, 'utf8')
    if (!texto.includes(MARCA)) continue
    const resultado = quitarRegiones(texto, relativa(raiz, archivo))
    if (resultado.regiones > 0) regiones.push({ archivo, ...resultado })
  }

  const archivoPaquete = path.join(raiz, 'package.json')
  const paquete = existsSync(archivoPaquete) ? leerJson(archivoPaquete) : {}
  return {
    perfil,
    raiz,
    regiones,
    borrar,
    script: existsSync(script) ? script : null,
    reemplazos: editarAngularJson(raiz, false),
    comando: Boolean(paquete.scripts && 'demo:quitar' in paquete.scripts),
    dependencias: dependenciasPresentes(paquete),
  }
}

const planVacio = (plan) =>
  plan.regiones.length === 0 && plan.borrar.length === 0 && !plan.script && plan.reemplazos === 0 && !plan.comando && plan.dependencias.length === 0

/** El plan en palabras, para confirmarlo. */
function describir(plan) {
  const lineas = [`Se va a quitar la galería de demostración de este proyecto ${PERFILES[plan.perfil].nombre}:`]
  if (plan.regiones.length > 0) {
    const lista = plan.regiones.map((r) => `${relativa(plan.raiz, r.archivo)} (${r.regiones})`).join(', ')
    lineas.push(`  · regiones ${MARCA} en ${plan.regiones.length} archivos: ${lista}`)
  }
  const borrar = [...plan.borrar, ...(plan.script ? [plan.script] : [])]
  if (borrar.length > 0) lineas.push(`  · se borran: ${borrar.map((b) => relativa(plan.raiz, b)).join(', ')}`)
  if (plan.reemplazos > 0) lineas.push('  · angular.json: las entradas de la galería (el fileReplacements de galeria.ts)')
  if (plan.comando) lineas.push('  · package.json: el script demo:quitar')
  if (plan.dependencias.length > 0) lineas.push(`  · npm uninstall ${plan.dependencias.join(' ')}`)
  return lineas.join('\n')
}

/** Ejecuta un proceso y devuelve su salida; `heredar` lo deja escribir en esta terminal. */
function ejecutarProceso(comando, args, { cwd, heredar = false, shell = false } = {}) {
  const salida = execFileSync(comando, args, {
    cwd,
    encoding: 'utf8',
    shell,
    windowsHide: true,
    stdio: heredar ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  })
  return salida ?? ''
}

/**
 * Cómo lanzar npm. Desde `npm run`, `npm_execpath` es el npm-cli.js que lo corre: se ejecuta
 * con este mismo Node, sin shell, en cualquier sistema. Si no (el script a mano), `npm`; en
 * Windows es npm.cmd, que Node solo lanza con shell, así que va como una sola orden (los
 * argumentos son nombres de paquete fijos).
 */
export function comandoNpm(args, entorno = process.env, plataforma = process.platform) {
  const cli = entorno.npm_execpath
  if (cli && /npm-cli\.c?js$/.test(cli)) return { comando: process.execPath, args: [cli, ...args], shell: false }
  if (plataforma === 'win32') return { comando: ['npm', ...args].join(' '), args: [], shell: true }
  return { comando: 'npm', args, shell: false }
}

/** Corta si hay cambios sin commitear en el proyecto, o si git no puede decirlo. */
function comprobarGit(raiz, ejecutar) {
  let salida
  try {
    salida = ejecutar('git', ['status', '--porcelain', '--', '.'], { cwd: raiz })
  } catch {
    throw new ErrorQuitar(
      'No se pudo comprobar con git que no haya cambios sin commitear (¿el proyecto está en un repositorio de git?). ' +
        'Sin git no hay forma de revisar ni deshacer lo que se borra. Para seguir de todos modos: npm run demo:quitar -- --forzar',
    )
  }
  const cambios = String(salida)
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
  if (cambios.length === 0) return
  const muestra = cambios.slice(0, 10).map((l) => `  ${l}`)
  if (cambios.length > 10) muestra.push(`  … y ${cambios.length - 10} más`)
  throw new ErrorQuitar(
    [
      `Hay ${cambios.length === 1 ? 'un cambio' : `${cambios.length} cambios`} sin commitear en el proyecto:`,
      ...muestra,
      'Commitéalos o guárdalos (git stash) antes: así revisas con git diff lo que borra la galería y lo deshaces si hace falta.',
      'Para seguir de todos modos: npm run demo:quitar -- --forzar',
    ].join('\n'),
  )
}

/** Restos de la galería que no deberían quedar en el código del proyecto. */
const RESTOS = [
  { patron: new RegExp(MARCA), que: 'una marca de región' },
  { patron: /\bdemo\//, que: 'una ruta de la galería (demo/)' },
  { patron: /galeria\.development|\bRUTAS_GALERIA\b|\bENLACES_GALERIA\b|__aybarGaleria/, que: 'la galería' },
  { patron: /\bfrom\s+['"](?:three|axe-core)(?:\/[^'"]*)?['"]|\bimport\(\s*['"](?:three|axe-core)\b/, que: 'three o axe-core' },
  { patron: /demo:quitar|quitar-demo/, que: 'el comando que quita la galería' },
]

/**
 * Lo que queda de la galería: líneas del código (src/, pruebas/, scripts/ y archivos de la
 * raíz) con una referencia, el fileReplacements de angular.json, el script y las
 * dependencias de package.json. Vacío si se fue entera.
 */
export function verificar(raiz) {
  const restos = []
  for (const archivo of archivosDelProyecto(raiz)) {
    readFileSync(archivo, 'utf8')
      .split(/\r?\n/)
      .forEach((linea, indice) => {
        const resto = RESTOS.find((r) => r.patron.test(linea))
        if (resto) restos.push({ archivo: relativa(raiz, archivo), linea: indice + 1, que: resto.que, texto: linea.trim().slice(0, 120) })
      })
  }
  for (const r of PERFILES.angular.borrar.concat(PERFILES.react.borrar)) {
    if (existsSync(path.join(raiz, r))) restos.push({ archivo: r.split(path.sep).join('/'), linea: 0, que: 'la carpeta o el archivo de la galería', texto: '' })
  }
  if (editarAngularJson(raiz, false) > 0) {
    restos.push({ archivo: 'angular.json', linea: 0, que: 'una entrada de la galería (fileReplacements o allowedCommonJsDependencies)', texto: '' })
  }
  const archivoPaquete = path.join(raiz, 'package.json')
  if (existsSync(archivoPaquete)) {
    const paquete = leerJson(archivoPaquete)
    if (paquete.scripts && 'demo:quitar' in paquete.scripts) restos.push({ archivo: 'package.json', linea: 0, que: 'el script demo:quitar', texto: '' })
    for (const nombre of dependenciasPresentes(paquete)) {
      restos.push({ archivo: 'package.json', linea: 0, que: `la dependencia ${nombre}`, texto: '' })
    }
  }
  return restos
}

function informarRestos(restos, escribir) {
  if (restos.length === 0) {
    escribir('Verificado: no queda ningún import ni referencia a la galería (demo/, three, axe-core, demo:quitar).')
    return
  }
  escribir(`Quedan ${restos.length} referencias a la galería; revísalas a mano:`)
  for (const r of restos) {
    escribir(`  ${r.archivo}${r.linea ? `:${r.linea}` : ''}  ${r.que}${r.texto ? `  ·  ${r.texto}` : ''}`)
  }
}

async function preguntarEnTerminal(pregunta) {
  if (!process.stdin.isTTY) {
    throw new ErrorQuitar('No hay una terminal donde confirmar. Para no preguntar: npm run demo:quitar -- --si')
  }
  const lector = createInterface({ input: process.stdin, output: process.stdout })
  try {
    return /^s[ií]?$/i.test((await lector.question(pregunta)).trim())
  } finally {
    lector.close()
  }
}

/**
 * Quita la galería del proyecto en `raiz`. Devuelve `{ estado, restos }`: `quitada`, `nada`
 * (ya no estaba) o `cancelado`; `restos` es lo que la verificación encontró.
 *
 * `ejecutar(comando, args, { cwd, heredar, shell })` lanza git y npm, y `preguntar(texto)`
 * confirma: las pruebas pasan los suyos para no tocar git, npm ni la terminal.
 */
export async function quitarDemo({
  raiz = process.cwd(),
  si = false,
  forzar = false,
  ejecutar = ejecutarProceso,
  preguntar = preguntarEnTerminal,
  escribir = (texto) => console.log(texto),
  entorno = process.env,
  plataforma = process.platform,
} = {}) {
  const plan = planificar(raiz)
  if (planVacio(plan)) {
    escribir('La galería de demostración ya no está en este proyecto: no hay nada que quitar.')
    const restos = verificar(raiz)
    informarRestos(restos, escribir)
    return { estado: 'nada', restos }
  }

  if (!forzar) comprobarGit(raiz, ejecutar)
  escribir(describir(plan))
  if (!si && !(await preguntar('¿Quitar la galería? [s/N] '))) {
    escribir('Cancelado: no se tocó nada.')
    return { estado: 'cancelado', restos: [] }
  }

  for (const { archivo, texto } of plan.regiones) writeFileSync(archivo, texto)
  for (const ruta of plan.borrar) rmSync(ruta, { recursive: true, force: true })

  // npm antes de quitar el script de package.json: si falla, `npm run demo:quitar` lo reintenta.
  if (plan.dependencias.length > 0) {
    const npm = comandoNpm(['uninstall', ...plan.dependencias], entorno, plataforma)
    try {
      ejecutar(npm.comando, npm.args, { cwd: raiz, heredar: true, shell: npm.shell })
    } catch {
      throw new ErrorQuitar(
        `Falló npm uninstall ${plan.dependencias.join(' ')}. Lo demás ya se quitó; corrige el problema de npm y vuelve a ` +
          'correr npm run demo:quitar -- --forzar (retoma lo que falta).',
      )
    }
  }

  editarAngularJson(raiz, true)
  const archivoPaquete = path.join(raiz, 'package.json')
  if (plan.comando && existsSync(archivoPaquete)) {
    const paquete = leerJson(archivoPaquete)
    delete paquete.scripts['demo:quitar']
    escribirJson(archivoPaquete, paquete)
  }

  if (plan.script) {
    rmSync(plan.script, { force: true })
    const carpeta = path.dirname(plan.script)
    if (existsSync(carpeta) && readdirSync(carpeta).length === 0) rmSync(carpeta, { recursive: true, force: true })
  }

  escribir('Galería de demostración quitada.')
  const restos = verificar(raiz)
  informarRestos(restos, escribir)
  return { estado: 'quitada', restos }
}

const AYUDA = `Uso: npm run demo:quitar [-- --si] [-- --forzar]

Borra la galería de demostración (/demo) del proyecto: sus archivos, las regiones
${MARCA} del código, su script y sus dependencias (three, @types/three, axe-core).

  --si       no pide confirmación
  --forzar   sigue aunque haya cambios sin commitear o el proyecto no esté en git`

async function principal(argumentos) {
  const desconocidos = argumentos.filter((a) => !['--si', '--forzar', '--ayuda', '-h', '--help'].includes(a))
  if (argumentos.some((a) => ['--ayuda', '-h', '--help'].includes(a)) || desconocidos.length > 0) {
    if (desconocidos.length > 0) console.error(`No conozco ${desconocidos.join(' ')}.\n`)
    console.log(AYUDA)
    process.exitCode = desconocidos.length > 0 ? 1 : 0
    return
  }
  try {
    const { estado, restos } = await quitarDemo({ si: argumentos.includes('--si'), forzar: argumentos.includes('--forzar') })
    process.exitCode = estado === 'cancelado' || restos.length > 0 ? 1 : 0
  } catch (error) {
    if (!(error instanceof ErrorQuitar)) throw error
    console.error(error.message)
    process.exitCode = 1
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await principal(process.argv.slice(2))
}
