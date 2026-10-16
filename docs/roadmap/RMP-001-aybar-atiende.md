---
id: "RMP-001"
tipo: roadmap
titulo: "Roadmap de producto - Aybar Atiende"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamani (Product Owner)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001"]
tags: [roadmap, plt-01]
---

# PLT-01 - Roadmap de producto

Va en `docs/roadmap/`. Dependencias, riesgos e hitos del producto. Fuente:
`01_Plan_Maestro_de_Trabajo_Plataforma_ATC_AYBARCORP.pdf` v1.2 (14-oct-2026) +
artefacto de planificacion "Aybar Atiende" compartido por el usuario.

| Producto | Product Owner | Version / Fecha |
|---|---|---|
| Aybar Atiende - Plataforma de Atencion al Cliente | Eddie Huamani | v0.1 - 2026-10-15 |
| **Horizonte** | **Vision del producto** | **Estado** |
| 2 semanas: lun 19-oct a vie 30-oct-2026 (10 dias habiles) | Toda solicitud del cliente se registra una sola vez, se atiende con un plazo trazable y se cierra con evidencia, sin exposicion ante INDECOPI | Borrador — fuente (PLT-01 v1.2) en revision, comite DoR vie 16-oct-2026 |

> Fuente de verdad: `docs/analisis/decisiones.md`. Si este roadmap la
> contradice, manda el registro y el roadmap se corrige.
>
> Nota de alcance: este roadmap cubre el horizonte comprometido en PLT-01
> v1.2 (2 semanas, 11 epicas, 227 h de 240 h de capacidad). No incluye
> fechas por historia (eso vive en PLT-04 / `docs/historias/`).

## 1 Roadmap por trimestre

Horizonte corto (2 semanas) sin trimestres: se usa el campo T1 como
"iteracion 1" (19-23 oct) y T2 como "iteracion 2" (26-30 oct).

| Epica | Nombre | Prioridad (MoSCoW) | Iter. 1 (19-23 oct) | Iter. 2 (26-30 oct) | Horas | Dev | Horizonte |
|---|---|---|---|---|---|---|---|
| EP-ATC-01 | Nucleo de tickets omnicanal | Debe | 19→22 oct | | 22 | Dev 1 | Ahora |
| EP-ATC-02 | Enrutamiento, SLA y alertas | Debe | 19→23 oct | | 28 | Dev 2 | Ahora |
| EP-ATC-03 | Libro de Reclamaciones y apelaciones | Debe | 22→27 oct (cruza) | x | 21 | Dev 1 | Ahora |
| EP-ATC-04 | Gate legal Eje 3 y Mesa de Casos sensibles | Debe | 23→29 oct (cruza) | x | 32 | Dev 2 | Ahora |
| EP-ATC-05 | Postventa: reclamos de garantia | Deberia | | 27→29 oct | 12 | Dev 1 | Ahora |
| EP-ATC-06 | Integracion UrbeMind | Deberia | | 28→29 oct | 7 | Dev 4 | Ahora |
| EP-ATC-07 | Calidad de atencion y Torre de Control CX | Deberia | | 26→28 oct | 16 | Dev 3 | Ahora |
| EP-ATC-08 | EntregaFest: contencion y derivacion en vivo | Podria | | 28→29 oct | 6 | Dev 3 | Ahora |
| EP-ATC-09 | Bandeja orquestadora y asistencia al gestor | Debe | 19→23 oct | | 32 | Dev 3 | Ahora |
| EP-ATC-10 | Consulta 360 e integraciones operativas | Debe | 19→26 oct (cruza) | x | 34 | Dev 4 | Ahora |
| EP-ATC-11 | Resolucion por morosidad y formularios simples | Debe | | 26→28 oct | 17 | Dev 4 | Ahora |

Total: 11 epicas, 22 funcionalidades (`FT-01`..`FT-23`, sin `FT-12`), 60 HU,
227 h comprometidas de 240 h de capacidad del equipo (95%), 4 desarrolladores
asistidos por IA.

Patrocinadores por epica (por confirmar segun PLT-01): EP-ATC-01/02/09
Gerencia de Experiencia del Cliente; EP-ATC-03 Gerencia Legal; EP-ATC-04
Gerencia Legal / Direccion UX; EP-ATC-05 Gerencia de Postventa; EP-ATC-06
Gerencia de TI / Producto UrbeMind; EP-ATC-07/08 Direccion UX; EP-ATC-10
Gerencia de TI / Gerencia Legal; EP-ATC-11 Gerencia de Cobranza / Gerencia
Comercial.

Hitos:

| Hito | Fecha | Criterio de cumplimiento (observable) | Epicas |
|---|---|---|---|
| H-01 | 2026-10-19 | Kick-off y base tecnica arrancada | Todas |
| H-02 | 2026-10-23 | Demo de iteracion 1 | EP-ATC-01, 02, 09, parte de 03/04/10 |
| H-03 | 2026-10-27 | Control de alcance (decide si se activa el alcance "Flexible") | Todas |
| H-04 | 2026-10-29 (18:00) | Congelamiento de codigo | Todas |
| H-05 | 2026-10-30 | UAT, demo final y decision Go/No-Go | Todas |

- **Ahora**: las 11 epicas / 60 HU del plan vigente, todas con fecha.
- **Flexible**: RF-048, RF-053, RF-037 a RF-039 — primero que sale si el
  control de alcance del 27-oct muestra atraso, sin afectar la v1.0.
- **Despues**: conectores automaticos de WhatsApp y correo (propuesta del PO
  para v1.1, fuera de este roadmap).

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida | Estado |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (unica fuente del dato) | Interna | EP-ATC-01, 04, 10 | CDO / Equipo Datos | 2026-10-19 | Pendiente |
| DEP-02 | NEXUS (tercero): identidad de colaboradores, SSO y roles | Externa | EP-ATC-01, 02, 09 | TI / proveedor NEXUS | 2026-10-19 | Pendiente |
| DEP-03 | Decision de negocio: matriz SLA por tipo y prioridad, plazos de linea de la Mesa SGD (RNF-REN-003) | Interna | EP-ATC-02, 04 | Gerencia ATC / Mesa SGD | 2026-10-21 | Pendiente |
| DEP-04 | Calendario MAE_TIME + MAE_HOLIDAY por geografia | Tecnica | EP-ATC-02, 03 | Equipo Datos | 2026-10-21 | En curso |
| DEP-05 | Validacion legal: formato del asiento, textos y plazos del Libro Legal | Legal | EP-ATC-03, 11 | Gerencia Legal | 2026-10-23 | Pendiente |
| DEP-06 | Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI | Tecnica | EP-ATC-01, 03, 04, 10 | Arquitectura / Legal | 2026-10-21 | En curso |
| DEP-07 | Contratos y Activos: API de contrato, unidad, Acta de Entrega y cobertura | Interna | EP-ATC-05 | Equipo Contratos | 2026-10-27 | Pendiente |
| DEP-08 | Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h) | Interna | EP-ATC-04, 10, 11 | Cobranza | 2026-10-20 | Pendiente |
| DEP-09 | UrbeMind: contrato de API/eventos + decision de alcance | Externa | EP-ATC-06 | Patrocinador / Producto UrbeMind | 2026-10-28 | Bloqueada (alcance) |
| DEP-10 | KPI Engine + SVY_SURVEY_RESPONSE (encuestas) | Interna | EP-ATC-07 | Equipo Datos / BI | 2026-10-26 | Pendiente |
| DEP-11 | Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabacion y click-to-call | Externa | EP-ATC-10 | TI / proveedor de call center | 2026-10-19 | Por evaluar |
| DEP-12 | Herramienta de Legal (responsable: Rosario): API o intercambio para sincronizar casos de Eje 3 | Interna | EP-ATC-10 | Gerencia Legal / TI | 2026-10-23 | Por evaluar |
| DEP-13 | Motor de consultas de Jose: contrato de API y responsable de mantenimiento | Interna | EP-ATC-10 | Jose / TI | 2026-10-21 | Por evaluar |
| DEP-14 | Proveedor de IA aprobado por TI y Seguridad, con politica de datos personales | Tecnica | EP-ATC-09, 10 | TI / Seguridad | 2026-10-21 | Por evaluar |
| DEP-15 | Maestro de responsables de proyecto y supervisores (fuente unica) | Interna | EP-ATC-11 | Gerencia Comercial / Datos | 2026-10-27 | Pendiente |

Una dependencia sin fecha comprometida deja en NO READY (G4) lo que bloquea.
Fecha requerida = inicio de la primera historia que bloquea: ese dia debe
existir el contrato de interfaz (o la decision); se construye contra un
simulador hasta que la API real este disponible.

## 3 Riesgos

| ID | Riesgo | Prob. | Impacto | Nivel | Mitigacion / contingencia | Dueño |
|---|---|---|---|---|---|---|
| R-01 | Plan sin holgura: 227 h comprometidas de 240 h de capacidad (95%), Dev 2 al 100% | Alta | Alto | ALTO | Alcance flexible (RF-048, 053, 037-039) definido de antemano; control de alcance el 27-oct; Dev 1 y Dev 3 apoyan a Dev 2 el 29-oct | PO |
| R-02 | APIs externas no disponibles en 2 semanas (SIGDA/TAXON, NEXUS, call center, Legal, Cobranza, motor de Jose) | Alta | Alto | ALTO | Contratos de interfaz y simuladores el dia 1; pase a produccion de cada integracion condicionado a su API real | Lider tecnico |
| R-03 | Matriz SLA y plazos de linea de la Mesa SGD sin definir al iniciar el motor SLA (21-oct) | Alta | Alto | ALTO | Matriz provisional parametrizable firmada por Gerencia ATC antes del 21-oct | Gerencia ATC |
| R-04 | Calidad del codigo generado con IA (errores sutiles, seguridad, deuda tecnica) | Media | Alto | ALTO | Revision de pares obligatoria, pruebas automatizadas revisadas por el desarrollador, analisis SAST y guia de prompts del equipo | Lider tecnico |
| R-05 | Sin QA dedicado y UAT concentrada en un dia (30-oct) | Media | Alto | ALTO | Aceptacion diaria del PO a las 17:00, pruebas E2E automatizadas desde el dia 3, usuarios clave citados para el 30-oct | PO / Jefe Operaciones UX |
| R-06 | Items del feedback con alcance ambiguo (8% de interes, rayo, "llamar la cuenta", cancelacion del servicio, buses, UrbeMind) | Alta | Medio | ALTO | Resolver preguntas abiertas en el refinamiento del 16-oct; lo no resuelto se construye parametrizable | PO |
| R-07 | Datos personales expuestos en bitacoras, busqueda o prompts de IA (Ley 29733) | Media | Alto | ALTO | DLP (RNF-SEC-008), anonimizacion antes de la IA (RNF-SEC-009), permisos del origen en la busqueda (RNF-SEC-010) | Seguridad TI |
| R-08 | Textos legales (Libro, alerta de cancelacion, carta al proyecto) sin validar al pase | Media | Alto | ALTO | Plantillas configurables; validacion de Legal antes del 23-oct (Libro) y 27-oct (morosidad) | Gerencia Legal |
| R-09 | Ausencia de un desarrollador (bus factor de 1 por epica) | Baja | Alto | MEDIO | Documentacion viva generada con IA, revision cruzada diaria y repositorio comun; replanificar con el flexible | Lider tecnico |
| R-10 | Adopcion: el equipo sigue en Excel/WhatsApp y el termino "agente" persiste | Media | Medio | MEDIO | Capacitacion el 30-oct, termino "Gestor de tickets" en toda la interfaz (RNF-USA-003), retiro de herramientas paralelas | Jefe Operaciones UX |

Matriz de probabilidad por impacto:

| Prob. \ Impacto | Bajo | Medio | Alto |
|---|---|---|---|
| **Alta** | | R-06 | R-01, R-02, R-03 |
| **Media** | | R-10 | R-04, R-05, R-07, R-08 |
| **Baja** | | | R-09 |

Supuestos:
- S-01: 4 desarrolladores dedicados al 100% del 19 al 30-oct, con asistentes
  de IA para codigo, pruebas y documentacion — confirmar con Lider tecnico.
- S-02: el PO acepta historias a diario (17:00) — confirmar con PO.
- S-03: PostgreSQL Multi-AZ y S3 ya existen en la arquitectura vigente —
  confirmar con Arquitectura/ADR del proyecto (fuera del alcance de este
  roadmap, se verifica en G3).
- S-04: este repositorio (`aybar-atc`) no tenia ningun paquete Definir ni
  commit antes de este borrador (ver `decisiones.md` D-01 y D-07) — confirmar
  que no existe trabajo previo en otra fuente (p. ej. Nexora) antes de
  publicar.

Restricciones:
- RES-01: plazo fijo de 10 dias habiles, 2026-10-19 a 2026-10-30 (PLT-01 v1.2).
- RES-02: sin QA dedicado durante el horizonte de este plan.
- RES-03: Ley 29571 art. 24 (Libro de Reclamaciones) y Ley 29733 (datos
  personales).
- RES-04: UrbeMind solo se integra por API/evento, nunca por acceso fisico a
  base de datos (ADR-04 del artefacto de planificacion).
- RES-05: la IA solo sugiere, nunca decide por si sola (RN-SVC-032).

## 4 Control de versiones y aprobacion

| Version | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| v0.1 | 2026-10-15 | IA (borrador, a partir de PLT-01 v1.2 y el artefacto de planificacion) | Version inicial del roadmap en `docs/` | [pendiente] |

Aprueba: PO. Solo `estado: approved` en `origin/main` es evidencia.

Generado por IA: contenido completo — Revisado por: [pendiente, nombre y fecha]
