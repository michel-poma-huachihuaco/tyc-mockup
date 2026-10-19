import assert from 'node:assert/strict'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

/**
 * `npm run demo:quitar` (scripts/quitar-demo.mjs) sobre copias temporales de un proyecto
 * React y uno Angular con regiones de ejemplo: qué recorta, qué borra, qué edita en
 * angular.json y package.json, cuándo se niega y que una segunda vez no falla. Ni git ni npm
 * se ejecutan de verdad: el script recibe un ejecutor falso. La última prueba solo lee: que
 * las regiones de ESTE proyecto están bien puestas. El script borra este archivo con la
 * galería.
 */

interface Resto {
  readonly archivo: string
  readonly linea: number
  readonly que: string
}

interface OpcionesEjecutar {
  readonly cwd: string
  readonly heredar?: boolean
  readonly shell?: boolean
}

type Ejecutar = (comando: string, args: string[], opciones: OpcionesEjecutar) => string

interface Plan {
  readonly perfil: 'react' | 'angular'
  readonly regiones: readonly { readonly archivo: string; readonly regiones: number }[]
  readonly borrar: readonly string[]
  readonly script: string | null
  readonly comando: boolean
}

interface ModuloQuitar {
  DEPENDENCIAS: readonly string[]
  ErrorQuitar: new (mensaje: string) => Error
  quitarDemo(opciones: {
    raiz: string
    si?: boolean
    forzar?: boolean
    ejecutar?: Ejecutar
    preguntar?: (texto: string) => Promise<boolean>
    escribir?: (texto: string) => void
    entorno?: Record<string, string | undefined>
    plataforma?: string
  }): Promise<{ estado: 'quitada' | 'nada' | 'cancelado'; restos: readonly Resto[] }>
  quitarRegiones(texto: string, archivo?: string): { texto: string; regiones: number }
  planificar(raiz: string): Plan
  comandoNpm(args: string[], entorno: Record<string, string | undefined>, plataforma: string): { comando: string; args: string[]; shell: boolean }
}

const SCRIPT = fileURLToPath(new URL('../scripts/quitar-demo.mjs', import.meta.url))
const PROYECTO = fileURLToPath(new URL('..', import.meta.url))
const cargar = async (): Promise<ModuloQuitar> => (await import(new URL('../scripts/quitar-demo.mjs', import.meta.url).href)) as ModuloQuitar

// Las marcas se arman por partes: este archivo no tiene regiones que el script deba recortar.
const I = ['aybar', 'demo', 'inicio'].join(':')
const F = ['aybar', 'demo', 'fin'].join(':')

const json = (valor: unknown) => `${JSON.stringify(valor, null, 2)}\n`

/** Un proyecto temporal con esos archivos y una copia del script en scripts/. */
function proyecto(archivos: Record<string, string>): { raiz: string; leer: (r: string) => string; existe: (r: string) => boolean } {
  const raiz = mkdtempSync(path.join(tmpdir(), 'quitar-demo-'))
  for (const [ruta, contenido] of Object.entries(archivos)) {
    const destino = path.join(raiz, ...ruta.split('/'))
    mkdirSync(path.dirname(destino), { recursive: true })
    writeFileSync(destino, contenido)
  }
  mkdirSync(path.join(raiz, 'scripts'), { recursive: true })
  copyFileSync(SCRIPT, path.join(raiz, 'scripts', 'quitar-demo.mjs'))
  return {
    raiz,
    leer: (r) => readFileSync(path.join(raiz, ...r.split('/')), 'utf8'),
    existe: (r) => existsSync(path.join(raiz, ...r.split('/'))),
  }
}

/** git status responde `porcelana`; npm uninstall quita las dependencias de package.json, como npm. */
function ejecutorFalso(porcelana = '') {
  const llamadas: string[] = []
  const ejecutar: Ejecutar = (comando, args, { cwd }) => {
    llamadas.push([comando, ...args].join(' '))
    if (comando === 'git') return porcelana
    if (args[0] === 'uninstall') {
      const archivo = path.join(cwd, 'package.json')
      const paquete = JSON.parse(readFileSync(archivo, 'utf8')) as Record<string, Record<string, string> | undefined>
      for (const grupo of [paquete['dependencies'], paquete['devDependencies']]) {
        for (const nombre of args.slice(1)) if (grupo) delete grupo[nombre]
      }
      writeFileSync(archivo, json(paquete))
    }
    return ''
  }
  return { ejecutar, llamadas }
}

const silencio = () => undefined
const sinPreguntar = () => Promise.reject(new Error('no debía preguntar'))

const PAQUETE_REACT = json({
  name: 'prueba-frontend',
  type: 'module',
  scripts: { dev: 'vite', build: 'tsc -b && vite build', 'demo:quitar': 'node scripts/quitar-demo.mjs' },
  dependencies: { react: '19.3.0' },
  devDependencies: { 'axe-core': '4.13.0', three: '0.186.0', typescript: '6.0.3' },
})

function proyectoReact() {
  return proyecto({
    'package.json': PAQUETE_REACT,
    'vite.config.ts': [
      "import react from '@vitejs/plugin-react'",
      "import { defineConfig } from 'vite'",
      '',
      `// ${I} — la guarda de la galería`,
      'function sinGaleria() {',
      "  return { name: 'sin-galeria' }",
      '}',
      `// ${F}`,
      '',
      'export default defineConfig({',
      '  plugins: [',
      '    react(),',
      `    // ${I}`,
      '    sinGaleria(),',
      `    // ${F}`,
      '  ],',
      '})',
      '',
    ].join('\n'),
    'src/App.tsx': [
      "import { Inicio } from './Inicio'",
      `// ${I} — galería de demostración, solo en desarrollo`,
      "import { lazy } from 'react'",
      "const Galeria = import.meta.env.DEV ? lazy(() => import('./demo/Galeria')) : null",
      `// ${F}`,
      '',
      'export function App() {',
      '  return (',
      '    <main>',
      '      <Inicio />',
      `      {/* ${I} */}`,
      '      {Galeria ? <a href="/demo">Galería</a> : null}',
      `      {/* ${F} */}`,
      '    </main>',
      '  )',
      '}',
      '',
    ].join('\n'),
    'src/Inicio.tsx': 'export function Inicio() {\r\n  return null\r\n}\r\n',
    'src/plantilla.css': `.pl-a {\n  color: red;\n}\n\n/* ${I} — la tarjeta de la galería */\n.pl-galeria {\n  display: grid;\n}\n/* ${F} */\n\n.pl-b {\n  color: blue;\n}\n`,
    'src/crlf.ts': `export const a = 1\r\n// ${I}\r\nexport const b = 2\r\n// ${F}\r\nexport const c = 3\r\n`,
    '.env.development': `VITE_AYBAR=1\n# ${I}\nVITE_GALERIA=1\n# ${F}\n`,
    'README.md': `# Proyecto\n\n<!-- ${I} — la galería -->\n## Galería de demostración\n\nSe quita con npm run demo:quitar.\n<!-- ${F} -->\n\n## Despliegue\n`,
    'index.html': `<body>\n  <!-- ${I} -->\n  <div id="galeria"></div>\n  <!-- ${F} -->\n  <div id="raiz"></div>\n</body>\n`,
    'src/demo/Galeria.tsx': "import three from 'three'\nexport default function Galeria() { return three }\n",
    'src/demo/datos/personas.ts': 'export const PERSONAS = []\n',
    'pruebas/demo-rutas.test.ts': "import '../src/demo/Galeria.tsx'\n",
    'pruebas/plantilla.test.ts': "import { test } from 'node:test'\ntest('sigue', () => {})\n",
  })
}

/** El tsconfig.app.json de Angular: JSONC, con la galería fuera del programa de producción. */
const TSCONFIG_APP = [
  '/* Opciones de TypeScript */',
  '{',
  '  "include": ["src/**/*.ts"],',
  '  "exclude": [',
  `    // ${I} — la galería entra al programa solo por lo que importa galeria.development.ts`,
  '    "src/app/demo/**",',
  '    "src/app/galeria.development.ts",',
  `    // ${F}`,
  '    "src/**/*.spec.ts"',
  '  ]',
  '}',
  '',
].join('\n')

function proyectoAngular() {
  const reemplazoEntorno = { replace: 'src/environments/environment.ts', with: 'src/environments/environment.development.ts' }
  return proyecto({
    'package.json': json({
      name: 'prueba-frontend',
      scripts: { build: 'ng build', test: 'node --test', 'demo:quitar': 'node scripts/quitar-demo.mjs' },
      dependencies: { '@angular/core': '22.2.1' },
      devDependencies: { '@types/three': '0.186.0', 'axe-core': '4.13.0', three: '0.186.1' },
    }),
    'angular.json': json({
      version: 1,
      projects: {
        prueba: {
          architect: {
            build: {
              options: { allowedCommonJsDependencies: ['axe-core'] },
              configurations: {
                production: { outputHashing: 'all' },
                development: {
                  optimization: false,
                  fileReplacements: [reemplazoEntorno, { replace: 'src/app/galeria.ts', with: 'src/app/galeria.development.ts' }],
                },
              },
            },
          },
        },
      },
    }),
    'tsconfig.app.json': TSCONFIG_APP,
    'src/app/galeria.ts': 'export const RUTAS_GALERIA = []\n',
    'src/app/galeria.development.ts': "export const RUTAS_GALERIA = [{ path: 'demo', loadChildren: () => import('./demo/rutas') }]\n",
    'src/app/demo/rutas.ts': 'export const RUTAS_DEMO = []\n',
    'src/app/app.routes.ts': [
      "import { Routes } from '@angular/router';",
      `// ${I} — galería de demostración`,
      "import { RUTAS_GALERIA } from './galeria';",
      `// ${F}`,
      '',
      'export const routes: Routes = [',
      "  { path: '', loadComponent: () => import('./pantallas/inicio').then((m) => m.Inicio) },",
      `  // ${I} — /demo: la declara galeria.development.ts; en producción galeria.ts la deja vacía.`,
      '  // Va antes del comodín.',
      '  ...RUTAS_GALERIA,',
      `  // ${F}`,
      "  { path: '**', loadComponent: () => import('./pantallas/no-encontrada').then((m) => m.NoEncontrada) },",
      '];',
      '',
    ].join('\n'),
    'src/app/pantallas/inicio.ts': [
      "import { Component } from '@angular/core';",
      `// ${I}`,
      "import { ENLACES_GALERIA } from '../galeria';",
      `// ${F}`,
      '',
      '@Component({',
      "  selector: 'app-inicio',",
      '  template: `',
      '    <h1>Inicio</h1>',
      `    <!-- ${I} — la galería de demostración (/demo): la vitrina y el resto de ejemplos.`,
      '         Solo con ng serve. -->',
      '    @if (galeria; as enlaces) {',
      '      <a [href]="enlaces.portada">Galería</a>',
      '    }',
      `    <!-- ${F} -->`,
      '  `,',
      '})',
      'export class Inicio {',
      `  // ${I}`,
      '  protected readonly galeria = ENLACES_GALERIA;',
      `  // ${F}`,
      '}',
      '',
    ].join('\n'),
    'pruebas/demo-navegacion.test.ts': "import '../src/app/demo/rutas.ts';\n",
    'pruebas/demo-soporte.ts': 'export {};\n',
    'pruebas/rutas.test.ts': "import { test } from 'node:test';\ntest('sigue', () => {});\n",
  })
}

test('React: recorta las regiones en cada formato, borra la galería, su prueba y el script, y desinstala', async () => {
  const { quitarDemo } = await cargar()
  const p = proyectoReact()
  try {
    const { ejecutar, llamadas } = ejecutorFalso()
    const resultado = await quitarDemo({ raiz: p.raiz, si: true, ejecutar, preguntar: sinPreguntar, escribir: silencio, entorno: {}, plataforma: 'linux' })

    assert.equal(resultado.estado, 'quitada')
    assert.deepEqual(resultado.restos, [], 'la verificación final no encuentra nada')
    assert.equal(
      p.leer('vite.config.ts'),
      "import react from '@vitejs/plugin-react'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig({\n  plugins: [\n    react(),\n  ],\n})\n",
    )
    assert.equal(
      p.leer('src/App.tsx'),
      "import { Inicio } from './Inicio'\n\nexport function App() {\n  return (\n    <main>\n      <Inicio />\n    </main>\n  )\n}\n",
    )
    assert.equal(p.leer('src/plantilla.css'), '.pl-a {\n  color: red;\n}\n\n.pl-b {\n  color: blue;\n}\n', 'sin dos líneas en blanco seguidas')
    assert.equal(p.leer('src/crlf.ts'), 'export const a = 1\r\nexport const c = 3\r\n', 'respeta CRLF')
    assert.equal(p.leer('src/Inicio.tsx'), 'export function Inicio() {\r\n  return null\r\n}\r\n', 'un archivo sin regiones no se reescribe')
    assert.equal(p.leer('.env.development'), 'VITE_AYBAR=1\n')
    assert.equal(p.leer('README.md'), '# Proyecto\n\n## Despliegue\n')
    assert.equal(p.leer('index.html'), '<body>\n  <div id="raiz"></div>\n</body>\n')

    assert.equal(p.existe('src/demo'), false)
    assert.equal(p.existe('pruebas/demo-rutas.test.ts'), false)
    assert.equal(p.existe('pruebas/plantilla.test.ts'), true, 'las demás pruebas se quedan')
    assert.equal(p.existe('scripts'), false, 'se borra a sí mismo, y la carpeta vacía')

    const paquete = JSON.parse(p.leer('package.json')) as { scripts: Record<string, string>; devDependencies: Record<string, string> }
    assert.deepEqual(Object.keys(paquete.scripts), ['dev', 'build'])
    assert.deepEqual(paquete.devDependencies, { typescript: '6.0.3' })
    assert.deepEqual(llamadas, ['git status --porcelain -- .', 'npm uninstall three axe-core'], 'solo las dependencias que estaban')
  } finally {
    rmSync(p.raiz, { recursive: true, force: true })
  }
})

test('Angular: limpia angular.json y la región del tsconfig.app.json, y deja el reemplazo del entorno', async () => {
  const { quitarDemo } = await cargar()
  const p = proyectoAngular()
  try {
    const { ejecutar, llamadas } = ejecutorFalso()
    const resultado = await quitarDemo({ raiz: p.raiz, si: true, ejecutar, preguntar: sinPreguntar, escribir: silencio, entorno: {}, plataforma: 'linux' })

    assert.equal(resultado.estado, 'quitada')
    assert.deepEqual(resultado.restos, [])
    const angular = JSON.parse(p.leer('angular.json')) as {
      projects: { prueba: { architect: { build: { configurations: { development: { fileReplacements: unknown[] } } } } } }
    }
    assert.equal(
      p.leer('tsconfig.app.json'),
      '/* Opciones de TypeScript */\n{\n  "include": ["src/**/*.ts"],\n  "exclude": [\n    "src/**/*.spec.ts"\n  ]\n}\n',
      'la región del exclude (los tsconfig admiten comentarios)',
    )
    assert.equal('options' in angular.projects.prueba.architect.build, true)
    assert.deepEqual(
      (angular.projects.prueba.architect.build as { options?: Record<string, unknown> }).options,
      {},
      'axe-core fuera de allowedCommonJsDependencies, y la lista vacía fuera',
    )
    assert.deepEqual(angular.projects.prueba.architect.build.configurations.development.fileReplacements, [
      { replace: 'src/environments/environment.ts', with: 'src/environments/environment.development.ts' },
    ])
    for (const borrado of ['src/app/demo', 'src/app/galeria.ts', 'src/app/galeria.development.ts', 'pruebas/demo-navegacion.test.ts', 'pruebas/demo-soporte.ts', 'scripts']) {
      assert.equal(p.existe(borrado), false, `${borrado} sigue ahí`)
    }
    assert.equal(p.existe('pruebas/rutas.test.ts'), true)
    assert.equal(
      p.leer('src/app/app.routes.ts'),
      "import { Routes } from '@angular/router';\n\nexport const routes: Routes = [\n" +
        "  { path: '', loadComponent: () => import('./pantallas/inicio').then((m) => m.Inicio) },\n" +
        "  { path: '**', loadComponent: () => import('./pantallas/no-encontrada').then((m) => m.NoEncontrada) },\n];\n",
    )
    assert.equal(
      p.leer('src/app/pantallas/inicio.ts'),
      "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-inicio',\n  template: `\n    <h1>Inicio</h1>\n  `,\n})\nexport class Inicio {\n}\n",
      'la región HTML de la plantilla, aunque el comentario siga en la línea de abajo',
    )
    const paquete = JSON.parse(p.leer('package.json')) as { scripts: Record<string, string>; devDependencies?: Record<string, string> }
    assert.equal('demo:quitar' in paquete.scripts, false)
    assert.deepEqual(paquete.devDependencies, {})
    assert.deepEqual(llamadas, ['git status --porcelain -- .', 'npm uninstall three @types/three axe-core'])
  } finally {
    rmSync(p.raiz, { recursive: true, force: true })
  }
})

test('una segunda vez no falla: dice que no hay nada que quitar, sin git ni npm', async () => {
  const { quitarDemo } = await cargar()
  for (const crear of [proyectoReact, proyectoAngular]) {
    const p = crear()
    try {
      await quitarDemo({ raiz: p.raiz, si: true, ejecutar: ejecutorFalso().ejecutar, escribir: silencio, entorno: {}, plataforma: 'linux' })
      const antes = p.leer('package.json')
      const { ejecutar, llamadas } = ejecutorFalso(' M src/sucio.ts')
      const mensajes: string[] = []
      const otra = await quitarDemo({ raiz: p.raiz, ejecutar, preguntar: sinPreguntar, escribir: (t) => mensajes.push(t) })
      assert.equal(otra.estado, 'nada')
      assert.deepEqual(otra.restos, [])
      assert.deepEqual(llamadas, [], 'ni git (aunque haya cambios) ni npm')
      assert.match(mensajes.join('\n'), /no hay nada que quitar/)
      assert.equal(p.leer('package.json'), antes)
    } finally {
      rmSync(p.raiz, { recursive: true, force: true })
    }
  }
})

test('con cambios sin commitear, o sin git, se niega sin tocar nada; --forzar sigue sin preguntar a git', async () => {
  const { quitarDemo, ErrorQuitar } = await cargar()
  const p = proyectoReact()
  try {
    const sucio = ejecutorFalso(' M src/App.tsx\n?? src/nuevo.ts\n')
    await assert.rejects(
      quitarDemo({ raiz: p.raiz, si: true, ejecutar: sucio.ejecutar, escribir: silencio }),
      (error: unknown) => error instanceof ErrorQuitar && /2 cambios sin commitear/.test(error.message) && /src\/nuevo\.ts/.test(error.message),
    )
    const sinGit: Ejecutar = () => {
      throw new Error('fatal: not a git repository')
    }
    await assert.rejects(
      quitarDemo({ raiz: p.raiz, si: true, ejecutar: sinGit, escribir: silencio }),
      (error: unknown) => error instanceof ErrorQuitar && /repositorio de git/.test(error.message) && /--forzar/.test(error.message),
    )
    assert.equal(p.existe('src/demo/Galeria.tsx'), true, 'no tocó nada')
    assert.match(p.leer('src/App.tsx'), /demo\/Galeria/)

    const forzado = ejecutorFalso(' M src/App.tsx')
    const resultado = await quitarDemo({ raiz: p.raiz, si: true, forzar: true, ejecutar: forzado.ejecutar, escribir: silencio, entorno: {}, plataforma: 'linux' })
    assert.equal(resultado.estado, 'quitada')
    assert.deepEqual(forzado.llamadas, ['npm uninstall three axe-core'])
  } finally {
    rmSync(p.raiz, { recursive: true, force: true })
  }
})

test('sin --si pregunta; «no» deja todo como estaba', async () => {
  const { quitarDemo } = await cargar()
  const p = proyectoReact()
  try {
    const preguntas: string[] = []
    const cancelado = await quitarDemo({
      raiz: p.raiz,
      ejecutar: ejecutorFalso().ejecutar,
      preguntar: async (texto) => {
        preguntas.push(texto)
        return false
      },
      escribir: silencio,
    })
    assert.equal(cancelado.estado, 'cancelado')
    assert.equal(preguntas.length, 1)
    assert.equal(p.existe('src/demo'), true)
    assert.equal(p.existe('scripts/quitar-demo.mjs'), true)
    assert.equal(p.leer('package.json'), PAQUETE_REACT)

    const aceptado = await quitarDemo({ raiz: p.raiz, ejecutar: ejecutorFalso().ejecutar, preguntar: async () => true, escribir: silencio, entorno: {}, plataforma: 'linux' })
    assert.equal(aceptado.estado, 'quitada')
  } finally {
    rmSync(p.raiz, { recursive: true, force: true })
  }
})

test('una región mal puesta detiene el script antes de cambiar ningún archivo', async () => {
  const { quitarDemo, ErrorQuitar } = await cargar()
  const p = proyectoReact()
  try {
    writeFileSync(path.join(p.raiz, 'src', 'zz-roto.ts'), `export const a = 1\n// ${I}\nexport const b = 2\n`)
    const antes = p.leer('src/App.tsx')
    await assert.rejects(
      quitarDemo({ raiz: p.raiz, si: true, ejecutar: ejecutorFalso().ejecutar, escribir: silencio }),
      (error: unknown) => error instanceof ErrorQuitar && /src\/zz-roto\.ts:2: región sin cerrar/.test(error.message),
    )
    assert.equal(p.leer('src/App.tsx'), antes, 'tampoco los archivos bien marcados')
    assert.equal(p.existe('src/demo'), true)
  } finally {
    rmSync(p.raiz, { recursive: true, force: true })
  }
})

test('las marcas: anidadas, sueltas, con código delante o con el comentario abierto, no valen', async () => {
  const { quitarRegiones } = await cargar()
  const casos: [string, RegExp][] = [
    [`// ${I}\n// ${I}\n// ${F}\n`, /:2: región anidada: la de la línea 1/],
    [`a\n// ${F}\n`, /:2: marca de fin sin su inicio/],
    [`// ${I}\nb\n`, /:1: región sin cerrar/],
    [`const x = 1 // ${I}\n// ${F}\n`, /:1: la marca de inicio va sola/],
    [`// ${I}\n<!-- ${F}\n-->\n`, /:2: la marca de fin va sola/],
    [`/* ${I} */ /* ${F} */\n`, /:1: las marcas de inicio y de fin van en líneas distintas/],
  ]
  for (const [texto, error] of casos) assert.throws(() => quitarRegiones(texto, 'x.ts'), error)
  assert.deepEqual(quitarRegiones('sin regiones\n'), { texto: 'sin regiones\n', regiones: 0 })
  assert.deepEqual(quitarRegiones(`a\n  # ${I}\nb\n  # ${F}\nc`), { texto: 'a\nc', regiones: 1 })
})

test('la verificación final señala lo que siga apuntando a la galería fuera de una región', async () => {
  const { quitarDemo } = await cargar()
  const p = proyectoReact()
  try {
    writeFileSync(path.join(p.raiz, 'src', 'Olvidado.tsx'), "import { PERSONAS } from './demo/datos'\nexport const n = PERSONAS.length\n")
    const mensajes: string[] = []
    const resultado = await quitarDemo({ raiz: p.raiz, si: true, ejecutar: ejecutorFalso().ejecutar, escribir: (t) => mensajes.push(t), entorno: {}, plataforma: 'linux' })
    assert.equal(resultado.estado, 'quitada')
    assert.deepEqual(
      resultado.restos.map((r) => `${r.archivo}:${r.linea}`),
      ['src/Olvidado.tsx:1'],
    )
    assert.match(mensajes.join('\n'), /src\/Olvidado\.tsx:1/)
  } finally {
    rmSync(p.raiz, { recursive: true, force: true })
  }
})

test('npm: con el npm-cli.js de `npm run`, sin shell; a mano en Windows, npm.cmd con shell', async () => {
  const { comandoNpm, DEPENDENCIAS } = await cargar()
  assert.deepEqual(DEPENDENCIAS, ['three', '@types/three', 'axe-core'])
  const cli = path.join('opt', 'node', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')
  assert.deepEqual(comandoNpm(['uninstall', 'three'], { npm_execpath: cli }, 'win32'), {
    comando: process.execPath,
    args: [cli, 'uninstall', 'three'],
    shell: false,
  })
  assert.deepEqual(comandoNpm(['uninstall', 'three'], {}, 'win32'), { comando: 'npm uninstall three', args: [], shell: true })
  assert.deepEqual(comandoNpm(['uninstall', 'three'], {}, 'linux'), { comando: 'npm', args: ['uninstall', 'three'], shell: false })
  assert.deepEqual(comandoNpm(['uninstall'], { npm_execpath: '/usr/lib/pnpm/bin/pnpm.cjs' }, 'linux').comando, 'npm', 'otro gestor: npm')
})

test('las regiones de este proyecto están bien puestas y el plan quita la galería entera (solo lee)', async () => {
  const { planificar } = await cargar()
  const plan = planificar(PROYECTO)
  assert.equal(plan.perfil, 'react')
  const regiones = new Set(plan.regiones.map((r) => path.relative(PROYECTO, r.archivo).split(path.sep).join('/')))
  // El montaje: en app y shell, App.tsx; en un remoto, su anfitrión de desarrollo.
  assert.ok(
    regiones.has('src/App.tsx') || regiones.has('src/desarrollo/AnfitrionLocal.tsx'),
    'ni App.tsx ni AnfitrionLocal.tsx tienen la región que monta la galería',
  )
  assert.ok(regiones.has('vite.config.ts'), 'vite.config.ts sin la guarda de la galería')
  const borrar = plan.borrar.map((b) => path.relative(PROYECTO, b).split(path.sep).join('/'))
  assert.ok(borrar.includes('src/demo'))
  assert.ok(borrar.includes('pruebas/demo-quitar.test.ts'))
  assert.ok(plan.script, 'el script se borra a sí mismo')
  assert.equal(plan.comando, true, 'package.json tiene el script demo:quitar')
})
