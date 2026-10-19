# Orquestacion: como fluye la chamba (F0 -> F10)

Este documento es el mapa de operacion del servicio bajo el marco de entrega
Aybar: que fase toca, que agente prepara, que humano firma y que gate corta.
Los criterios completos estan en `references/fases-y-gates.md`; esto es la
coreografia.

## Las cuatro reglas que gobiernan a todo agente

1. La IA propone; el humano aprueba. Ningun artefacto pasa un gate solo con
   firma de IA. La IA no cierra gates ni aprueba pull requests.
2. Trazabilidad: todo artefacto registra que genero la IA y quien lo reviso.
3. Sin datos de clientes ni credenciales en prompts. Datos de prueba
   sinteticos; PII enmascarada fuera de produccion.
4. Lo generado por IA pasa exactamente los mismos gates que lo manual.

## El flujo, fase a fase

| Fase | Agente que prepara | Humano que decide | Gate |
|---|---|---|---|
| F0 Intake | tipificador | PO (tipo: PO+TL juntos) | G0 |
| F1 Discovery | tipificador (borrador BRD) | PO; stakeholder firma BRD | G1 |
| F2 Requirements | - (PO ejecuta; NFR con numero) | PO | - |
| F3 UX/UI | disenador-ux (evidencia G2) | PO + UX (mockup Figma versionado) | G2 |
| F4 Arquitectura | arquitecto-adr + gobierno-datos | TL; datos: Gobierno de Datos | G3 + puerta datos |
| F5 Refinement | gobierno-datos (CAD-F5), analista-paquete | PO (DoR); datos: 1 dia habil SLA | G4 |
| F6 Planning | orquestador-feature (plan por olas) | equipo + PO | - |
| F7 Development | orquestador-feature -> desarrollador-backend / desarrollador-frontend, revisor-codigo | revisor humano != autor (2 en T3) | G5 |
| F8 QA + Security | qa-engineer (ciclos 0-2), security-reviewer, gobierno-datos | QA aprueba G6; DevOps+TL G7; datos: informe conformidad | G6 + G7 + puerta datos |
| F9 Release | release-engineer + gobierno-datos (Release Data Gate) | TL + PO; datos: Gobierno de Datos D-3..D-1 | G8 + Release Data Gate |
| F10 Operacion | release-engineer (G9) + gobierno-datos (monitoreo) | TL cierra; dueño del dato decide rollback de datos | G9 |

## Pipeline tecnico (la parte que corre sola)

```
Developer -> feature/<ID>-<slug> -> Pull Request
[hooks de agente] guardianes PreToolUse     (.claude/settings.json + .guardianes/agente/)
[hooks locales] pre-commit (gate listo) + commit-msg + pre-push   (.guardianes/, cortesia local)
[CI etapa 1: estructura]  rama + commits + gates listos (G4/G3 approved en main;
                          G2 tambien si alguna HU de la feature es ui)
Gates G0-G4 por PR a docs/gates/<TICKET>/, aprobado por su CODEOWNER
[CI etapa 2]  build -> unit tests            (./mvnw verify, IT con Docker;
                                              frontend/: npm ci, lint, test, build)
[CI etapa 3]  estatico / deps               (sonar-check.sh; dependencias-check.sh -Pseguridad;
                                              frontend/: npm audit --audit-level=high)
Code review humano (1 aprobador; 2 en T3)  = G5
[CD] deploy DESARROLLO -> QA -> integration/E2E
Ciclos QA 0-2 + G6 + G7 (+ conformidad de datos F8)
release/vX.Y.Z -> PRE-PRODUCCION -> smoke + validacion de negocio
G8 + Release Data Gate (aprobacion manual)
PRODUCCION por tag -> health -> smoke -> monitoreo 72 h -> G9
```

## Coreografias multiagente

Cambio tipico (T2 con datos):
1. `tipificador` arma ficha y propone T2; PO+TL fijan el tipo (G0).
2. `arquitecto-adr` redacta el ADR; `gobierno-datos` prepara la puerta F4
   con DER, linaje y dueños; TL aprueba G3; Gobierno de Datos emite acta.
3. En refinement, `gobierno-datos` corre el CAD-F5 sobre la HU; una
   desviacion mayor la regresa a F4, tres menores abiertas bloquean (G4).
4. `desarrollador-backend` implementa en `feature/<ID>-<slug>`; los
   guardianes validan cada commit; `revisor-codigo` pre-revisa; un humano
   distinto aprueba (G5).
5. `qa-engineer` + `security-reviewer` corren el Ciclo 0; luego Ciclo 1
   (valida PO) y Ciclo 2 (validan QA+PO); `gobierno-datos` contrasta el
   esquema implementado (F8). G6 y G7 se firman con evidencia enlazada.
6. `release-engineer` arma G8; `gobierno-datos` corre el Release Data Gate
   D-3/D-2/D-1; el cliente ejecuta UAT (Ciclo 3); TL+PO deciden RELEASE.
7. Post-deploy: monitoreo etiquetado por release; a las 72 h,
   `gobierno-datos` redacta el Reporte de Estabilizacion y
   `release-engineer` el cierre G9 con la pregunta del marco: que gate debio
   detectar lo que fallo.

Feature con pantallas (frontend en `frontend/`):
1. El PO marca con `ui: true` (o el tag `ui`) cada HU que tiene pantalla. Con
   una sola, la feature exige G2: lo cortan el guardian de G4 y
   `aybar paquete validar` (advertencia `ui-sin-g2` mientras falte).
2. F3: UX disena en Figma; `disenador-ux` arma `docs/gates/<TICKET>/G2.md`
   con `.agents/templates/g2-diseno.md` (Figma versionado, user flow, estados
   vacio/carga/error/sin permisos/responsive, accesibilidad, consistencia con
   el design system `@aybarcorp/*`). PO + UX aprueban G2 por PR; el agente no.
3. F4: el contrato OpenAPI (G3) tiene todo lo que la pantalla muestra o
   envia; si G2 pide un dato que no esta, vuelve a G3.
4. F7: `desarrollador-backend` construye el endpoint; `desarrollador-frontend`
   construye la pantalla en `frontend/` con `@aybarcorp/auth` y
   `@aybarcorp/http` despues de su endpoint (`depende_de`), o en paralelo
   contra el contrato si la tarea no depende de el. DoD de front: build,
   lint, test, `aybar framework cli doctor` y los estados de G2 probados.
5. F8: `qa-engineer` cubre los flujos criticos con E2E (Playwright);
   `security-reviewer` revisa CORS del backend, CSP del front, almacenamiento
   del token y dependencias npm.

Hotfix (Sev1/Sev2): rama `hotfix/<ID>-<slug>` desde main; el camino corto
esta definido en `references/operacion.md`; la proteccion de rama NO se
desactiva ni el dia del incidente.

## Construir desde un paquete Definir

El pedido "revisa esta documentacion y empieza a trabajarla" sobre el paquete
Definir de `docs/` (G0-G4) sigue siempre este camino. Cada paso tiene su firma
humana y ninguno se salta.

1. `analista-paquete` lee y valida el paquete (`aybar paquete validar --json`),
   lista las contradicciones con ruta:linea y las divergencias de los ADR con
   la estrategia corporativa, y entrega un informe de preparacion por feature.
   Las divergencias van al envio de G3 para el TL: se informan, no bloquean.
   Humano: el dueño de cada documento lo corrige por PR; PO y TL deciden.
2. Compuerta: G4 del ticket con `estado: approved` en `origin/main`, G3
   tambien (sin `G3.md`, una persona confirma que no aplica), el DoR de la
   feature en READY y G2 approved si alguna HU de la feature lleva `ui: true`
   (o el tag `ui`). Lo corta ademas el guardian
   `.guardianes/validar-gate-listo.sh`. Si falta algo, alto: nadie "empieza
   mientras se aprueba".
3. `orquestador-feature` arma el plan por olas (`aybar paquete plan --json`,
   cuya ola 0 se llama fundacion), la fundacion y el presupuesto (features en
   paralelo, reintentos por HU, limite de la sesion). Humano: aprueba el plan
   y el presupuesto.
4. Fundacion, secuencial y en su propio PR: modelo de dominio compartido,
   migraciones Flyway de la ola y esqueleto de modulos. Humano: G5 (revisor
   distinto del autor) y merge. Ninguna ola arranca antes.
5. Olas: un worktree por feature, en paralelo. Por HU, en orden de
   `depende_de`, reparto por capa (`reparto` de `aybar paquete plan --json`):
   las tareas `backend` (domain, application, adapters, infrastructure, boot,
   modelo, datos) las construye `desarrollador-backend` en la raiz, y las
   `frontend`, `desarrollador-frontend` en `frontend/`, despues del endpoint
   que consumen. Cada uno en `feature/<TICKET>-<slug>`. `qa-engineer` prepara
   los TC del test plan, `revisor-codigo` pre-revisa, `security-reviewer` y
   `gobierno-datos` entran si la HU toca seguridad o datos. La definicion de
   terminado, por capa (backend: `./mvnw verify`; frontend: build, lint,
   test y `aybar framework cli doctor`), esta en la skill
   aybar-construir-feature.
6. Un PR por HU: el agente deja la rama y la descripcion listas; la persona
   que lo lanzo hace push y abre el PR con sus credenciales; un humano
   distinto aprueba G5 y mergea. La HU que depende de esta espera el merge.
7. Al cerrar cada ola: el humano decide continuar, ajustar o parar. Despues,
   F8 (G6, G7 y conformidad de datos) con sus propias firmas.

Estados, por feature y por HU dentro de ella:

```
PLAN -> FUNDACION -> OLA n -> por feature:
  VERIFICAR_LISTA -> CONSTRUIR -> VERIFICAR_DOD -> PR_ABIERTO
  -> ESPERA_FIRMA_HUMANA -> MERGEADO
cualquier estado -> DETENIDO (gate sin aprobar, contradiccion que bloquea,
                              presupuesto agotado)
```

El estado se deduce de hechos (ramas, PR abiertos o mergeados, archivos de
gate en `origin/main`), no de la memoria del agente: una sesion nueva retoma
donde quedo la anterior.

Precedencia para todo agente: defaults del SDK < ADR approved del proyecto
(`docs/adr/`); `docs/analisis/decisiones.md` manda sobre el resto del
paquete. La nube, el emisor de tokens y el negocio los decide el proyecto.

## Donde vive cada cosa

- Arranque de cada sesion (cualquier agente): `.agents/scripts/arranque.sh`;
  mapa del paquete en `docs/explorador.html`.
- Skills del SDK (tecnica y marco): `.agents/skills/` (todas las herramientas)
  y `.claude/skills/` (Claude Code).
- Agentes de rol: `.agents/agents/` (copias por herramienta en `.claude/agents/`,
  `.opencode/agents/`, `.gemini/agents/`, `.codex/agents/` y `.github/agents/`;
  las rehace `aybar skills sync`).
- Referencias del marco: `.agents/references/` (renderizadas de marco.json).
- Plantillas de artefactos: `.agents/templates/`.
- Guardianes de git: `.guardianes/` (activos via core.hooksPath; tras clonar,
  `./.guardianes/activar.sh`).
- Paquete Definir: `docs/` (`analisis/`, `roadmap/`, `epicas/`, `features/`,
  `historias/`, `dor/`, `backlog/tareas/`, `adr/`, `arquitectura/`, `datos/`,
  `pruebas/`). Plantillas en `.agents/templates/` (roadmap, epica, feature,
  dor, gate, tareas.json).
- Evidencias de gates: `docs/gates/<TICKET>/G<n>.md` (`TICKET` = `AYB-NNNN`,
  plantilla `.agents/templates/gate.md`; G2, `.agents/templates/g2-diseno.md`). Un gate cuenta como aprobado solo con
  `estado: approved` en `origin/main`, por PR aprobado por el CODEOWNER del rol.
- ADRs: `docs/adr/ADR-NNN-<slug>.md` (plantilla `.agents/templates/adr.md`).
- Frontend, si el proyecto lo tiene: `frontend/` (framework `@aybarcorp/*`;
  ui y papel en `.aybar/proyecto.properties` y `frontend/aybar.config.json`).
  Skills: aybar-frontend, aybar-auth-spa, aybar-contrato-api-cliente,
  aybar-estados-ui.
