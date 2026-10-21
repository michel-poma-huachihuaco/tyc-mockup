# aybar-atc - frontend

Frontend **Angular 22** (componentes standalone, sin zone.js, builder
`@angular/build:application`) de `aybar-atc`, generado con el Aybar SDK
`0.7.1` sobre el framework `@aybarcorp/*` `0.3.0`.
Vive en `frontend/` del repositorio; el contexto completo (reglas, gates,
guardianes) esta en el `AGENTS.md` de la raiz.

**Papel: app.** Aplicacion autonoma, sin federacion: consume el sistema de
diseño como componentes standalone (`@aybarcorp/ui-angular`) y gestiona su
propia sesion con `@aybarcorp/auth`.

## Comandos

```bash
npm install          # la primera vez, sin credenciales (o: aybar install desde la raiz)
npm run dev          # ng serve en http://localhost:4200 (o: aybar run --frontend desde la raiz)
npm run build        # ng build -> dist/
npm test             # reglas sin Angular (pruebas/): destino tras el login, usuarios demo, tema, terminal
npm run lint         # oxlint
```

El puerto es fijo: el CORS del backend en local autoriza
`http://localhost:4200` y ningun otro (y el redirect URI que registre
el emisor real, el mismo).

Figtree y Montserrat 600-800 se sirven desde la aplicacion (ver «Avisos de
terceros»). El build de produccion no incrusta hojas de fuentes externas
(`optimization.fonts: false` en `angular.json`): incrustarlas obliga a
`ng build` a descargarlas de internet y el build se cae en un CI sin salida a
ese dominio.

Tampoco incrusta los estilos criticos (`optimization.styles.inlineCritical:
false`): la hoja va en el `<head>` y bloquea el primer pintado, como en Vite.
Con los criticos en linea solo entraban los del tema claro —`<html>` no tiene
`data-theme` al construir— y la aplicacion se pintaba sin estilos ni tema oscuro
hasta que llegaba la hoja; ademas, la cargaba un script en linea que la CSP de
`nginx.conf` bloquea.

## Entrar en local

`npm run dev` arranca en modo demo: la bienvenida publica lleva a `/ingresar`,
el Login Form del sistema de diseño, y se entra con uno de los usuarios de
prueba de `src/environments/environment.development.ts` (la pantalla de ingreso
los muestra mientras corre `npm run dev`). Las claves son de demo a proposito:
solo valen en localhost.

| Usuario | Contraseña | Nombre | Roles |
|---|---|---|---|
| `admin` | `demo-admin` | Administrador Aybar | `ADMIN`, `USER` |
| `usuario` | `demo-usuario` | Usuario Aybar | `USER` |

`demo` es una lista (o un solo usuario, como antes): cada uno con `usuario` y
`clave`, y `nombre` y `roles` opcionales (sin roles, `USER`).

Es una sesion simulada (`crearAutenticacionDemo` de `@aybarcorp/auth`): la
contraseña se compara en el navegador, no hay emisor ni token y solo se abre en
localhost. Por eso el backend de este repositorio (`aybar run`) responde 401
a la seccion «Backend» del inicio, que lo explica en lugar de mandarte al login, y
no sirve para nada mas que recorrer la aplicacion. Solo existe en desarrollo:
`environment.development.ts` entra por el `fileReplacements` de la
configuracion development de `angular.json`, y `ng build` (produccion) usa
`environment.ts`, que lleva `demo: null`. Compruebalo: las claves no aparecen
en `dist/` (`grep -r demo-admin dist/` no encuentra nada).

Tras entrar, la Navbar lleva el selector de tema y el menu de la cuenta (nombre,
roles y **Salir**), y el inicio muestra tu sesion, la llamada al backend
(`/recursos-ejemplo/quien-soy`).
<!-- aybar:demo:inicio -->
Con `npm run dev` suma una tarjeta a la galeria de demostracion (`/demo`,
seccion «Galeria de demostracion»), donde esta la vitrina del sistema de diseño.
<!-- aybar:demo:fin -->

## Tema

El selector de tema (en la bienvenida y en la Navbar) ofrece **Claro**, **Oscuro** y **Segun el sistema**. Lo
elegido se recuerda en este navegador (`localStorage`, clave `aybar:apariencia`,
del nucleo de apariencia de `@aybarcorp/tokens`, que `AyAppearanceService` expone
como señales) y llega a las demas pestañas; **Segun el sistema** lo olvida y la
pagina vuelve a seguir a `prefers-color-scheme`. Todos los selectores leen el
mismo estado: siempre dicen lo mismo. Para no recordarlo,
`provideAyApariencia({ persistir: false })` en `app.config.ts`; para otra clave,
`provideAyApariencia({ clave: '…' })` y la misma en `data-storage-key` del
`<script>` de `src/index.html`.

Para que al recargar no destelle el tema por defecto, `src/index.html` carga en
el `<head>`, tras `<base>`, `apariencia-arranque.js`: el arranque de
`@aybarcorp/tokens/apariencia/arranque`, que aplica lo recordado antes del primer
pintado. Lo copia de `node_modules/@aybarcorp/tokens/dist` el bloque `assets` de
`angular.json`; es del mismo origen, asi que la CSP de `nginx.conf` lo admite con
`script-src 'self'`.

<!-- aybar:demo:inicio -->
## Galeria de demostracion

Con `npm run dev` el proyecto trae una galeria en `/demo`: el sistema de
diseño en uso, con datos sinteticos (`src/app/demo/datos/`) y sin llamar a
ningun backend. Solo existe en desarrollo: `src/app/galeria.ts` no declara
rutas y la configuracion development de `angular.json` lo sustituye por
`src/app/galeria.development.ts` (`fileReplacements`, como el environment).
`ng build` no lleva nada de `src/app/demo/`, ni `three` ni `axe-core`, que son
devDependencies.

| Ruta | Que hay |
|---|---|
| `/demo` | Portada con profundidad, accesos a cada seccion y combinaciones de apariencia |
| `/demo/vitrina[/familia[/componente]]` | La vitrina del framework en modo pagina: una URL por componente, busqueda con sinonimos, codigo con Copiar; `…/caso/:n` abre un caso a pantalla completa |
| `/demo/ingreso[/variante]` | Once pantallas de ingreso, publicas: son maquetas y no inician sesion |
| `/demo/cuenta/:seccion` | Perfil, preferencias, notificaciones, seguridad y sesiones |
| `/demo/admin/:seccion` | Resumen, usuarios, roles y auditoria; solo con `ADMIN` (si no, el 403) |
| `/demo/personalizacion` | El panel de apariencia con la vista previa en claro y en oscuro |
| `/demo/profundidad` | Tilt, Parallax y vidrio |
| `/demo/3d` | Visor 3D de lotes con three.js, y su plano en 2D |
| `/demo/redimensionado` | Splitter, container queries y la galeria a varios anchos |
| `/demo/accesibilidad` | Analisis con axe-core de cualquier pantalla |

Lo demas de `/demo` pide sesion: los usuarios demo de arriba. **Ver como**, en
la Navbar, baja los roles a Usuario solo dentro de la galeria (nunca los sube) y
se recuerda en la pestaña (`sessionStorage`). Ctrl K o Cmd K abre la busqueda
global; **Personalizar** abre el panel de apariencia, que sigue abierto al
navegar. `?embebido=1` pinta cualquier pantalla sin el marco. La galeria no
importa `@aybarcorp/auth`: recibe la sesion visible y «Salir» por
`SESION_GALERIA`, como un remoto.

Para quitarla:

```bash
npm run demo:quitar                  # pide confirmacion; se niega si hay cambios sin commitear
npm run demo:quitar -- --si --forzar
```

Borra `src/app/demo/`, los dos `galeria*.ts`, `pruebas/demo-*` y las regiones
`aybar:demo` del codigo y de este README; quita de `angular.json` la entrada de
`fileReplacements` y de `package.json` el script y las devDependencies `three`,
`@types/three` y `axe-core`, y se borra a si mismo. Despues `npm run build`,
`npm run lint` y `npm test` siguen en verde.
<!-- aybar:demo:fin -->

## Pasar al emisor real

El emisor lo decide el ADR del proyecto; el SDK no trae ninguno cableado.

1. En `src/environments/environment.development.ts`, pon `demo: null` y en
   `autenticacion` el emisor (issuer), el `clienteId` publico (PKCE, sin
   secreto) y la `audiencia` que valida el backend, los del emisor que fija el
   ADR del proyecto.
2. Para produccion, los mismos campos en `src/environments/environment.ts` (o
   en un environment por ambiente con su `fileReplacements`), junto con
   `api.baseUrl`.
3. Sin modo demo, `/ingresar` redirige al emisor (Authorization Code con PKCE)
   y vuelve a la pantalla de origen; el token vive en memoria y
   `@aybarcorp/http` lo envia como Bearer. Un 401 del backend vuelve a pedir
   sesion.

`aybar framework cli doctor` avisa mientras `aybar.config.json` siga con las
URLs de plantilla (`*.aybar.local`).

## El framework @aybarcorp

`aybar new project` cablea el framework con la CLI del framework
(`aybar-front init --con-auth --con-http`), en la version que fija el SDK: los
tokens, las fuentes y `ui.css` de `@aybarcorp/ui-angular` en `angular.json`;
`src/environments/environment.ts`; y en `src/app/aybar/` la autenticacion, el
cliente HTTP, con sus providers en
`app.config.ts`. Los `.tgz` de los `@aybarcorp/*` que usa este proyecto quedan
en `paquetes/`; `package.json` los toma de ahi
(`"@aybarcorp/ui-angular": "file:paquetes/aybarcorp-ui-angular-0.3.0.tgz"`)
y el lockfile fija su integridad. Desde la raiz o desde `frontend/`:

```bash
aybar framework                       # version que fija el SDK, las descargadas y la de este proyecto
aybar framework cli doctor            # doctor del framework: sale con 1 si hay errores
aybar framework cli -- doctor --json  # las opciones de aybar-front van despues de --
aybar framework actualizar            # lleva el proyecto a la version que fija el SDK
```

`aybar framework cli <args>` corre `aybar-front` en `frontend/` sin `npx` ni
tokens.

- `paquetes/` **se commitea**. Por eso `npm ci`, `npm install`, `aybar install`,
  la imagen Docker y el CI instalan sin ninguna credencial: no hablan con GitHub
  Packages.
- Los `.tgz` salen del release del framework en GitHub, que la CLI `aybar`
  descarga una vez por version con tu sesion de `gh` y verifica (SHA-512). Basta
  con acceso de lectura al repositorio del framework.
- `.npmrc` solo apunta el scope `@aybarcorp` a GitHub Packages. No es para
  instalar: es para que un `npm install @aybarcorp/x` por nombre falle a la vista
  (GitHub Packages lo rechaza sin token) en vez de resolverse en npmjs.org, donde
  cualquiera podria publicar un `@aybarcorp/x`. Para cambiar de version, `aybar
  framework actualizar`: cambia `paquetes/`, `package.json` y el lockfile juntos.
- Versiones exactas (`save-exact`): todos los `@aybarcorp/*` en la misma version.
- Sistema de diseño: componentes standalone `<ay-*>` de
  `@aybarcorp/ui-angular`, importados en el componente que los usa
  (`imports: [AyButton]`), con `strictTemplates` sobre sus entradas; sin
  `CUSTOM_ELEMENTS_SCHEMA`. `<ay-vitrina />` los muestra todos.
- Sesion: `@aybarcorp/auth` (OIDC Authorization Code + PKCE contra el emisor
  que decide el ADR del proyecto; token solo en memoria), o la del modo demo
  en desarrollo. Las pantallas la leen de `src/app/acceso.ts`. En un remoto,
  la sesion llega del anfitrion.
- APIs: `@aybarcorp/http` (Bearer, `X-Correlation-Id`, errores RFC 7807 como
  `ErrorAybar`), envuelto en un servicio inyectable. Un componente no llama a
  la red: `HttpClient`, `fetch` o `axios` dentro de un componente lo corta el
  guardian de arquitectura (`.guardianes/agente/guardian-arquitectura.sh`).

## Reglas que vigilan los guardianes

- El codigo de `frontend/` no importa nada de fuera de `frontend/`.
- Ningun modulo se importa por URL: los remotos se montan por el registro del shell.
- En una rama `feature/<TICKET>-*`, `frontend/src/`, `package.json`, el
  lockfile y la configuracion de build son codigo: esperan al G4 aprobado
  (y al G2 si la feature tiene pantallas).
- Ni secretos ni datos reales: lo que compila Angular lo descarga cualquiera,
  asi que en el front no hay secretos.

## Docker

```bash
docker build -t aybar-atc-frontend .
docker run --rm -p 8080:8080 aybar-atc-frontend
```

La imagen copia `paquetes/` antes de `npm ci`, asi que el build no necesita
ningun secreto ni credencial. Build con Node 22 y servido por nginx sin root (puerto 8080), con fallback de
SPA y cabeceras de seguridad basicas. La CSP va comentada en `nginx.conf` con
lo que hay que decidir antes de activarla.

## Avisos de terceros

La aplicacion sirve, sin modificarlas, dos tipografias con licencia SIL Open
Font License 1.1 (OFL-1.1), solo el subconjunto latin:

- **Figtree** 400-700 (`@fontsource/figtree`), para el cuerpo.
- **Montserrat** 600-800 (`@fontsource/montserrat`), para los titulos.

Las importa `src/styles.css` y `ng build` las copia a `dist/media/`: ninguna
peticion a un CDN de fuentes. Como `package.json` declara `@fontsource/*`,
`aybar-front init` tampoco agrega a `angular.json` la hoja de fuentes por CDN de
`@aybarcorp/tokens`. El texto de cada licencia viaja en
`node_modules/@fontsource/<familia>/LICENSE`.
