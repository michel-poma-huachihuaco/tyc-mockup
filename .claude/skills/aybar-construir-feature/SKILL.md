---
name: aybar-construir-feature
description: Coreografía F7–F8 para construir una feature desde un paquete Definir aprobado — precondiciones (G2 si tiene pantallas), fundación secuencial, orden por depende_de, reparto por capa entre backend y frontend, una rama y un PR pequeño por HU, worktree por feature, definición de terminado por tipo y firmas humanas. Usar cuando pidan construir, implementar o "empezar" una feature, épica o HU de docs/, o al repartir trabajo en paralelo entre agentes.
---

# Construir una feature

Máquina de estados completa, en el repo del SDK:
`docs/especificaciones/orquestacion-por-feature.md`. Coordina `orquestador-feature`;
programan `desarrollador-backend` (raíz del repositorio) y `desarrollador-frontend`
(`frontend/`). Cómo leer el paquete: skill `aybar-paquete-definir`.

## Precondiciones

Si falla una, te detienes y la reportas. No hay "lo empiezo mientras lo aprueban":
un gate pendiente es un alto, no un aviso.

- G4 del ticket con `estado: approved` **en `origin/main`**, y G3 también. Si `G3.md` no existe, se reporta para que una persona confirme que no aplica. El DoR de la feature, approved y con la decisión READY humana (o, con sello, aprobado en la fuente documental).
- Si alguna HU de la feature tiene pantalla (`ui: true` o el tag `ui` en su frontmatter), G2 también, approved en `origin/main`: el diseño de todos sus estados (skill `aybar-estados-ui`). Si el ticket tiene `G2.md` aunque la feature no tenga pantallas, también tiene que estar approved.
- `aybar paquete validar --json` sin errores (`"valido": true`), y la feature con `"lista": true`.
- Si las tareas de la épica dicen `generado_por_ia: true`, `revisado_por` no es `null`.
- Si `docs/.origen-documental.json` existe, la aprobación de los documentos que cita sale del sello (fuente externa, p. ej. Nexora; ADR-007): `aybar paquete validar --json` ya lo aplica en `lista` y `motivos`. Con Nexora, el flujo completo es la skill `aybar-nexora-implementar` (cada commit lleva en el cuerpo `[nexora:<8 hex>]`, los 8 primeros caracteres del UUID de la actividad sin guiones).
- Worktree limpio, creado desde `origin/main` actualizado.

## Fundación, antes de paralelizar

Lo que comparten varias HU se construye primero, en secuencia y en un PR propio.
Un humano lo aprueba y lo mergea antes de abrir ninguna ola:

1. **Modelo de dominio compartido**: entidades, value objects, errores de dominio y puertos de `domain.port.out` que tocan dos o más HU.
2. **Migraciones Flyway** de las tablas de la ola (skill `aybar-modelo-a-flyway`).
3. **Esqueleto de módulos**: paquetes, controladores del contrato sin lógica y adaptadores mínimos que implementan los puertos.

Sin la fundación mergeada, dos agentes en paralelo crean dos versiones de la misma
entidad y el segundo PR no compila contra el primero.

`aybar paquete plan` llama "fundación" a su ola 0: las features sin dependencias
más las tareas de dominio o datos que se pueden adelantar. De esa ola, las tareas
de capa `domain` o `modelo` son la fundación secuencial; el resto de sus features
se construye después, en paralelo, como primera ola. Una tarea de capa
`frontend` nunca es fundación.

## Orden y paralelismo

- El orden lo da `depende_de` en `docs/backlog/tareas/<EPICA>.json`. `aybar paquete plan --json` lo agrupa en olas. Una tarea no empieza hasta que sus dependencias están mergeadas en `origin/main`.
- Las features de una misma ola van en paralelo, **un worktree por feature**. Nunca dos agentes en el mismo árbol:

  ```bash
  git fetch origin
  git worktree add ../<servicio>-<ft-id> -b feature/AYB-NNNN-<slug> origin/main
  ```

- **Una rama y un PR por HU** (o uno por capa si la HU tiene backend y frontend, ver abajo): `feature/<TICKET>-<slug>`, con el slug en minúsculas y guiones; el guardián rechaza otra forma. PR pequeño, un propósito, ≤400 líneas netas o justificación escrita.
- Una HU que depende de otra sin mergear espera. No se apilan ramas.

## Reparto por capa

`aybar paquete plan --json` trae, por feature, `reparto`: los ids de sus tareas
en `backend`, `frontend` y `otras`, cada lista en orden de `depende_de`.

| Capa de la tarea | Agente | Dónde |
|---|---|---|
| `domain`, `application`, `adapters`, `infrastructure`, `boot`, `modelo`, `datos` | `desarrollador-backend` | raíz del repositorio (reactor Maven) |
| `frontend` | `desarrollador-frontend` | `frontend/` |
| `docs`, `ux` u otra | la asigna el orquestador o una persona | — |

- La pantalla que consume un endpoint va **después** de él: su tarea lo declara en `depende_de` y espera a que el endpoint esté mergeado. Sin esa dependencia, las dos capas pueden ir en paralelo contra el contrato de G3, nunca contra el código de la otra rama.
- Una HU con tareas de las dos capas puede ir en un PR por capa (backend primero), siempre ≤400 líneas netas cada uno.
- Una HU con tareas de `frontend` y sin `ui: true` es un hueco: nadie exigió G2 (advertencia `hu-frontend-sin-ui` de `aybar paquete validar`). Se reporta antes de construir.

## Definición de terminado (antes de pedir el PR)

Común a toda HU:

- [ ] Un test por cada caso del test plan de la HU, uno por criterio de aceptación, con el id `TC-…` en el nombre (o en `@DisplayName` / la descripción del test).
- [ ] El contrato OpenAPI del paquete se cumple: del lado del servidor, rutas, métodos, códigos y esquemas (skill `aybar-contrato-api`); del lado del cliente, solo lo que el YAML declara (skill `aybar-contrato-api-cliente`).
- [ ] `.agents/scripts/sonar-check.sh` y `.agents/scripts/dependencias-check.sh` sin bloqueantes. El código `2` significa "no configurado": queda pendiente para CI, se declara en el PR y no se da por bueno.

Backend (tareas en la raíz):

- [ ] `./mvnw verify` en verde. Incluye `NormaHexagonalTest` (ArchUnit) y el test de arranque. Si moviste clases: `aybar verify arquitectura`.

Frontend (tareas en `frontend/`):

- [ ] `npm run build` y `npm run lint` en verde, y `npm test` si el proyecto lo declara. Si no lo declara, sus pruebas quedan **sin verificar** y se dice en el PR (`.agents/scripts/pruebas.sh` lo avisa).
- [ ] `aybar framework cli doctor` sin errores (sale con `1` si los hay).
- [ ] Los `@aybarcorp/*` siguen saliendo de `frontend/paquetes/` (`file:` en `package.json`), sin uno instalado por nombre ni un token añadido a `.npmrc`; si la HU cambió la versión del framework, fue con `aybar framework actualizar` y van juntos `frontend/paquetes/`, `package.json`, el lockfile, `aybar.config.json` y `.aybar/proyecto.properties`.
- [ ] La pantalla es la de G2 en todos sus estados (vacío, carga, error, sin permisos, responsive, accesibilidad), cada uno con su prueba (skill `aybar-estados-ui`).
- [ ] Sesión y llamadas con `@aybarcorp/auth` y `@aybarcorp/http`, sin reimplementarlos; ningún token en `localStorage`; ninguna llamada a la red en un componente (skills `aybar-frontend`, `aybar-auth-spa`).
- [ ] `dependencias-check.sh --frontend` (npm audit) sin vulnerabilidades altas ni críticas y `package-lock.json` commiteado.
- [ ] Guardianes en verde: nombre de rama y commits `tipo(alcance): asunto (AYB-NNNN)`, sin `--no-verify`.
- [ ] Si toca esquema, migraciones reversibles. Si toca datos, CAD-F5 registrado en la HU.
- [ ] Sin credenciales, endpoints reales, tokens ni datos personales: datos sintéticos, también en capturas y fixtures del front.
- [ ] Descripción con `.agents/templates/pr-descripcion.md`, incluida la sección IA: qué generó y quién lo revisó.

`.agents/scripts/verificar.sh` corre estructura, pruebas y estático en el orden del pipeline.

## Firmas humanas

- El agente deja la rama lista y la descripción del PR redactada. El push y la apertura del PR los hace la persona que lanzó al agente, con sus credenciales.
- **G5 lo aprueba un humano distinto del autor**, y dos en T3. El autor es quien lanzó al agente y firma los commits, así que no puede ser también quien aprueba.
- Ningún agente aprueba, mergea ni cierra un gate. Tampoco escribe `approved` en un archivo de gate.
- F8: `qa-engineer`, `security-reviewer` y `gobierno-datos` preparan G6, G7 y la conformidad de datos. Las firmas son de QA, de DevOps+TL y de Gobierno de Datos.

## Te detienes y reportas si

- G3 o G4 no están approved en `origin/main`, o el DoR no está READY; o la feature tiene pantallas y G2 no está approved;
- aparece una contradicción que bloquea (skill `aybar-paquete-definir`);
- el cambio necesita una decisión que no está en el paquete: nueva entidad, nuevo endpoint, nueva dependencia o cambio de contrato. Eso es G3, no una tarea. La pantalla que no coincide con G2 o necesita un estado que G2 no diseñó, vuelve a G2;
- se agota el presupuesto de reintentos que fijó el humano.
