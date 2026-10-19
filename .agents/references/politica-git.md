<!-- Renderizado desde datos/marco.json del repositorio aybar-estrategia-tecnica.
     Ese JSON es la fuente; si el marco cambia, esto se regenera, no se edita a mano. -->

# Politica de git: ramas, commits, PRs y tags

Es lo que los guardianes de `.guardianes/` validan en local y la etapa de estructura del pipeline repite en CI. Referencia completa: capitulo 03 del repositorio aybar-estrategia-tecnica.

## Ramas

| Rama | Proposito | Protegida | Despliega a |
|---|---|---|---|
| `main` | Estado liberable y producción | Sí | Producción, por tag |
| `release/vX.Y.Z` | Estabilización del release candidate | Sí | Pre-Producción |
| `develop (opcional)` | Integración continua del equipo | Sí | Desarrollo y QA |
| `feature/<ID>-<slug>` | Trabajo de una historia | No | Ambiente efímero o QA |
| `bugfix/<ID>-<slug>` | Corrección planificada | No | QA |
| `hotfix/<ID>-<slug>` | Corrección urgente desde main | No | Pre-Producción y Producción |

## Commits

Forma: `tipo(alcance): asunto (TICKET)` - tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `build`, `ci` - alcance: minúsculas y guiones: el dominio que toca (ventas, cobranza) - ticket: `AYB-NNNN` (en el asunto o en el cuerpo). Asunto en ingles y en imperativo.

Validos:

```
feat(ventas): add lot reservation to the sales portal (AYB-1042)
```
```
fix(cobranza): round the installment amount before printing the receipt

AYB-1187
```
```
chore(mantenimiento): raise the Concar read timeout (AYB-1203)
```
```
refactor(clientes): extract the party projection into its own use case

AYB-1250
```
```
docs(ventas): document the lot availability contract (AYB-1266)
```

## Pull requests

- Un solo proposito por PR.
- Hasta 400 lineas de cambio neto; excederlas no bloquea, obliga a justificarlo por escrito en la descripcion.
- Revisor distinto del autor; 2 revisores en T3. El autor nunca aprueba el suyo.
- Commits de rama protegida: autor humano con firma verificada; el pipeline rechaza autores de tipo bot.

## Proteccion de rama (3.4)

PR obligatorio, aprobacion de revisor distinto del autor (2 en T3), checks en verde, historia lineal, sin force-push, sin borrado, y sin excepcion administrativa para nadie.

## Pipeline de referencia

```
Developer -> feature branch -> Pull Request
[CI] lint -> build -> unit tests -> SAST -> dependency scan -> secret scan
Code review (1 aprobador; 2 en T3)
Merge a rama protegida
[CD] deploy automatico a DESARROLLO -> deploy a QA
Integration tests -> E2E tests
G6 QA Gate + G7 Security Gate
release/vX.Y.Z -> PRE-PRODUCCION
Smoke + validacion de negocio + G8 Release Gate (aprobacion manual)
PRODUCCION (deploy por tag)
Health check -> smoke -> monitoreo -> G9
```
