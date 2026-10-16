# Ciclos de validacion QA

Modelo progresivo de validacion de Historias de Usuario: cada ciclo sube el
nivel de confianza exigido. La IA ejecuta la primera pasada de cada ciclo;
la aprobacion es siempre de una persona (QA, PO o cliente). Instrumenta el
G6 del marco y alimenta el G8.

## Los cuatro ciclos y el Release Gate

| Ciclo | Participantes | Valida | Criterio de salida |
|---|---|---|---|
| 0 | IA -> QA | Performance y security segun riesgo | <=20% no conforme + matriz Severidad x Impacto |
| 1 | IA -> PO | Funcional + E2E + negocio + adversarial | <=20% fallidos + matriz Severidad x Impacto |
| 2 | IA + PO + QA | Integral: funcional, E2E, API, integracion, regresion | <=10% fallidos + matriz Severidad x Impacto |
| 3 | Cliente / usuario final | UAT sobre procesos reales | Aceptado / No aceptado |
| Release Gate | TL + PO | Decision de liberacion, no un ciclo mas de pruebas | Release / No release |

El porcentaje nunca decide solo: se lee junto a la severidad de lo fallado y
su impacto de negocio. Un 5% de fallos criticos no pasa; un 15% de cosmeticos
en T1 puede pasar con plan.

## Ciclo 0 - Performance y security (IA -> QA)

Se ejecuta ANTES de la validacion funcional. La IA evalua segun criticidad de
la HU y QA verifica los resultados y consolida evidencias.

- Performance: tiempos de respuesta, carga y concurrencia, consumo de
  recursos, cuellos de botella, comportamiento bajo carga, capacidad esperada.
- Security: autenticacion, autorizacion, roles y permisos, control de acceso,
  validacion de entradas, exposicion de informacion, sesiones y tokens,
  seguridad de APIs, accesos no autorizados, pruebas adversariales.

## Ciclo 1 - Funcional temprana (IA -> PO)

La IA valida contra la HU: criterios de aceptacion, reglas de negocio, casos
funcionales, flujos E2E, escenarios positivos y negativos, casos limite,
pruebas adversariales, inconsistencias. El PO valida el resultado desde la
perspectiva funcional y de negocio.

## Ciclo 2 - Integral (IA + PO + QA)

Previo a la entrega a UAT: funcionales, E2E, API, integracion, regresion,
revalidacion de defectos, adversariales, y performance/security segun
criticidad. Evidencias de ejecucion adjuntas y enlazadas (criterio G6).

## Ciclo 3 - UAT (cliente)

Procesos reales, flujos E2E, resultados esperados, reglas de negocio,
operabilidad, cumplimiento de la necesidad. ACEPTADO avanza al Release Gate;
NO ACEPTADO retorna al ciclo que corresponda. La aceptacion del cliente NO
sustituye las validaciones tecnicas de performance, security ni QA.

## Que exige el Release Gate de esta cadena

Evidencias de los ciclos ejecutados, resultados de la IA, validacion de QA,
validacion del PO, registro y estado de defectos, resultado de UAT y
cumplimiento de los criterios. RELEASE autoriza; NO RELEASE devuelve a
correccion y revalidacion.

## Reglas para el agente que prepara ciclos

- La IA propone casos, los ejecuta donde sea automatizable y arma el paquete
  de evidencias; no declara aprobado ningun ciclo.
- Todo resultado de IA queda registrado como tal, con quien lo reviso.
- Los defectos se registran con severidad e impacto de negocio, no solo conteo.
