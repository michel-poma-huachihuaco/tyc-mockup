Documentacion del proyecto
==========================

Aqui vive el **paquete Definir** del marco de entrega: lo que se decide antes de
construir y la evidencia de cada gate. El codigo no se escribe hasta que su
ticket tiene el gate que le toca en `estado: approved` **en `origin/main`**; una
copia local aprobada no cuenta (los guardianes leen `origin/main`).

| Carpeta | Que va |
|---|---|
| `analisis/` | Intake, BRD y `decisiones.md`, que es la fuente de verdad |
| `roadmap/`, `epicas/`, `features/`, `historias/` | El alcance. Una HU con pantalla lleva `ui: true` en su frontmatter: su feature exige G2 (diseno UX/UI) |
| `dor/`, `backlog/tareas/` | Definition of Ready y tareas (`tareas.json`: su `capa` separa backend de frontend) |
| `adr/` | Las decisiones de arquitectura del proyecto: nube, emisor de tokens, origenes CORS... Mandan sobre los valores por defecto del SDK |
| `arquitectura/`, `datos/`, `pruebas/` | Contrato OpenAPI, impacto en datos y plan de pruebas |
| `gates/<TICKET>/G<n>.md` | La evidencia de cada gate (plantillas en `.agents/templates/`) |

En un proyecto con backend, aqui estan tambien `docs/skills/` (el contrato de
cada starter, copia sellada del SDK que no se edita) y `docs/VARIABLES.md` (las
variables de entorno del servicio).

Para validar el paquete antes de construir: `aybar paquete validar`. Para
leerlo: `docs/explorador.html`, el mapa navegable que genera `aybar paquete
explorador` (se commitea y se regenera cuando cambia el paquete). Al abrir el
repositorio, `.agents/scripts/arranque.sh` dice si el paquete esta certificado
(sin errores y con el explorador al dia) y que falta.
