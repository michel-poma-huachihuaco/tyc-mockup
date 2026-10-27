---
id: "BRD-001"
tipo: brd
titulo: "BRD - Aybar Atiende (plataforma de atención al cliente) · Etapa 1"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.7"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-26"
relacionados: ["AYB-0001", "RMP-001"]
tags: [brd, intake, plt-01]
---

# BRD - Aybar Atiende

Va en `docs/analisis/BRD.md`. Es el documento 1 (F1/G1) del paquete Definir. El SDK no trae
plantilla de BRD: este documento usa el frontmatter del contrato y cubre los criterios de G1
(BRD aprobado por el stakeholder, objetivos medibles, alcance y fuera de alcance, riesgos y
supuestos registrados).

Fuente: documentos del PO v1.3 del 16-oct-2026 (PLT-01 a PLT-05) y el Excel
`ATC_requerimientos (3).xlsx`, con la división por etapas. Cubre **solo la Etapa 1**.

> Fuente de verdad: `docs/analisis/decisiones.md`. Si este BRD la contradice,
> manda el registro y el BRD se corrige.

## 1 Resumen y problema

**Producto**: Aybar Atiende, la Plataforma de Atención al Cliente (servicio `aybar-atc`, DOM-SVC-001).
**Dueño de Producto**: Eddie Huamaní.

**Problema**: hoy la atención al cliente se gestiona sin un sistema único. Eso incluye los reclamos,
las consultas, la postventa, los casos sensibles, la morosidad y los formularios de eventos. Hay
canales y registros sueltos (Excel, WhatsApp), no hay número de ticket correlativo confiable ni SLA
trazable, el plazo legal del Libro de Reclamaciones no está controlado y no hay evidencia auditable
ante una fiscalización de INDECOPI.

**Visión del producto** (PLT-01 v1.3): "Toda solicitud del cliente se registra una sola vez, se
atiende con un plazo trazable y se cierra con evidencia, sin exposición ante INDECOPI."

**Horizonte de este BRD** (PLT-01 v1.3): Etapa 1. Diseño del jue 08-oct al mar 20-oct-2026.
Desarrollo del mié 21-oct al mar 03-nov-2026, en dos iteraciones (21–27-oct y 28-oct–03-nov). El
mar 03-nov es el día de UAT, demo final y Go/No-Go de la v1.0.

## 2 Objetivos medibles

> **Propuesta IA**, heredada de la versión base. Las fuentes no traen una lista explícita de
> `OBJ-NN`. Estos objetivos se derivan de la visión del producto y de los RNF del Excel. Las
> métricas y umbrales son los del Excel. **El paquete los adopta como decisión del equipo** (26-oct,
> `analisis/decisiones.md`); el PO los formaliza con su firma del BRD (G1).

| ID | Objetivo | Métrica | Valor objetivo | Fuente |
|---|---|---|---|---|
| OBJ-01 | Cerrar tickets dentro de un plazo trazable sin escalamiento | Cierre end-to-end del ticket | ≤ 72 horas hábiles sin escalamiento | RNF-REN-005 · OBJ-SVC-001 |
| OBJ-02 | Cumplir el plazo legal del Libro de Reclamaciones | Respuestas fuera del plazo legal (15 días hábiles improrrogables desde el registro: Ley 31435; ED-28) | 0 | RNF-CUM-006 · OBJ-SVC-002 |
| OBJ-03 | Eliminar el riesgo de doble registro del dato de cliente | Registros paralelos del dato de cliente fuera de SIGDA/TAXON | 0 | RNF-INT-007 · RN-SVC-026 |
| OBJ-04 | Medir la experiencia del cliente de forma unificada | NPS-C = (JOU × 0,45) + (POS × 0,35) + (EVT × 0,20) | Línea base: la primera medición en la UAT (decisión del equipo, 26-oct); meta: mantenerla o mejorarla en el primer mes de operación, con la ponderación de RNF-USA-001 | RNF-USA-001 |
| OBJ-05 | Sostener evidencia probatoria íntegra ante fiscalización | Documentos probatorios sin checksum | 0 | RNF-CUM-007 |
| OBJ-06 | Resolver con ayuda de IA sin perder el control humano | Sugerencias de IA con datos personales · sugerencias registradas | 0 · 100 % | RNF-SEC-009 · RN-SVC-032. **Sin IA en la Etapa 1:** HU-048 y HU-053 salen por P-025 (`analisis/decisiones.md`); se mide cuando entren |

Además, cada épica del PLT-02 v1.3 tiene una meta de negocio del PO. Estas metas sí vienen de las
fuentes:

| Épica | Meta de negocio (PLT-02 v1.3) |
|---|---|
| EP-ATC-01 | Registrar el 100 % de las solicitudes de los canales telefónicos, WhatsApp y correo en la plataforma, con número por RUC, dentro de los 3 meses siguientes al pase a producción. |
| EP-ATC-02 | Llegar al 90 % de cumplimiento de SLA de resolución por tipo y prioridad en los 3 meses siguientes al puesta en marcha, y cerrar sin escalamiento en ≤ 72 horas hábiles. |
| EP-ATC-03 | Cero respuestas fuera del plazo legal (o prorrogado) y cero reclamos sin asiento desde el pase a producción. |
| EP-ATC-04 | El 100 % de los tickets con señal de conflicto llega a Eje 3 con el paquete mínimo completo, y ningún caso sensible vence su SLA de línea sin escalar, desde el pase a producción. |
| EP-ATC-05 | Resolver el 100 % de los reclamos de garantía con inspección documentada y rechazar automáticamente los que están fuera de cobertura, desde el pase a producción. |
| EP-ATC-06 | Que el 30 % de los tickets nuevos se registre en Mi Portal y que bajen en 40 % las consultas de seguimiento por teléfono y WhatsApp en los 3 meses siguientes al pase. |
| EP-ATC-07 | Disparar la encuesta en el 100 % de los tickets cerrados y emitir el informe diario de la Torre de Control desde el pase a producción. |
| EP-ATC-08 (fuera de la Etapa 1, P-025) | Registrar y derivar a la Estación 4 el 100 % de los casos sensibles de cada EntregaFest, con post-mortem en ≤ 3 días hábiles. |
| EP-ATC-09 | Reducir a 0 los tickets sin responsable por más de 1 día hábil y mantener la diferencia de carga entre gestores del mismo área por debajo del 20 % durante el piloto. |
| EP-ATC-10 | Ningún reclamo del piloto llega a denuncia y el 70 % de las consultas se resuelve en el primer contacto, en los 3 meses siguientes al pase a producción. |
| EP-ATC-11 | El 100 % de los contratos con 3 meses impagos tiene caso, alerta al cliente y carta al proyecto en 24 h, y el 100 % de ingresos al proyecto queda registrado, desde el piloto. |

Nota del equipo (ED-28): con la Ley 31435 el plazo del Libro es de 15 días hábiles improrrogables; el «(o prorrogado)» de la meta de EP-ATC-03 no se aplica. El texto del PO no cambia.

## 3 Alcance

### Dentro (IN) — "Ahora"

El plan del PO v1.3 trae **62 historias de usuario**, todas con fecha, en **11 épicas** y
**23 funcionalidades** (FT-ATC-01 a 10 y 13 a 25): 58 RF del Excel más 4 propuestos por el PO en la
v1.3 (RF-SVC-064 a 067), con **243 h** de desarrollo sobre una capacidad de **252 h** (96 %).

**Etapa 1 tras P-025** (decidida por el equipo, Brayan Hurtado, 26-oct-2026; `analisis/decisiones.md` v0.8): entran
**57 historias** en **10 épicas** y **22 funcionalidades**, con **227 h** de historias (Dev 1 Brayan 55 h, Dev 2 Jesús 60 h,
Dev 3 Michel 55 h y Dev 4 Daniel 57 h). Las 28 h nuevas de DT-02 (outbox 6, publicador 6, proyector 10 y bus 6; ADR-012
) entran como trabajo técnico de la fundación (`backlog/tareas/EP-ATC-01.json`, tareas DT02-T01 a DT02-T06): **255 h**
(64, 64, 64 y 63 h por persona). Para hacerles sitio, el equipo activó el recorte que el PO previó en su R-01: salen de la
Etapa 1 HU-ATC-037, 038 y 039 (EP-ATC-08 y FT-ATC-15 completas), HU-ATC-048 y HU-ATC-053, 16 h; el PO conserva la decisión de
revertirlo. **Sobrecosto real: 7 h** sobre una capacidad de 252 h (63 h por persona), con dueño el PO (`decisiones.md`,
P-025, punto 7). Las 5 siguen documentadas en el paquete y se retoman en una etapa posterior.

| Épica | Nombre | MoSCoW | Funcionalidades | HU | Horas | Dev |
|---|---|---|---|---|---|---|
| EP-ATC-01 | Núcleo de tickets omnicanal | Debe | FT-01, FT-02 | 5 | 22 | Dev 1 (Brayan) |
| EP-ATC-02 | Enrutamiento, SLA y alertas | Debe | FT-03, FT-04 | 7 | 28 | Dev 2 (Jesús) |
| EP-ATC-03 | Libro de Reclamaciones y apelaciones | Debe | FT-05, FT-06 | 5 | 21 | Dev 1 (Brayan) |
| EP-ATC-04 | Gate legal Eje 3 y Mesa de Casos sensibles | Debe | FT-07, FT-08, FT-09 | 9 | 32 | Dev 2 (Jesús) |
| EP-ATC-05 | Postventa: reclamos de garantía | Debería | FT-10 | 4 | 12 | Dev 1 (Brayan) |
| EP-ATC-06 | Autogestión del cliente y trazabilidad (Mi Portal) | Debe | FT-24 | 3 | 9 | Dev 4 (Daniel) |
| EP-ATC-07 | Calidad de atención y Torre de Control CX | Debería | FT-13, FT-14 | 4 | 16 | Dev 3 (Michel) |
| EP-ATC-08 | EntregaFest: contención y derivación en vivo | Podría | FT-15 | 3 · **fuera de la Etapa 1 (P-025)** | 6 · 0 en la Etapa 1 | Dev 1 (Brayan) |
| EP-ATC-09 | Bandeja orquestadora y asistencia al gestor | Debe | FT-18, FT-25, FT-19, FT-21 | 9 · 8 en la Etapa 1 (HU-048 fuera) | 44 · 39 en la Etapa 1 | Dev 3 (Michel) |
| EP-ATC-10 | Consulta 360 e integraciones operativas | Debe | FT-20, FT-17, FT-16 | 8 · 7 en la Etapa 1 (HU-053 fuera) | 36 · 31 en la Etapa 1 | Dev 4 (Daniel) |
| EP-ATC-11 | Resolución por morosidad y formularios simples | Debe | FT-22, FT-23 | 5 | 17 | Dev 4 (Daniel) |
| **Total del plan del PO** | | | **23** | **62** | **243** | |
| **Total de la Etapa 1 (P-025)** | | | **22** | **57** | **227** | |
| Fundación técnica de DT-02 (P-025; no es una HU del PO) | Outbox, publicador, proyector y bus | Debe | FT-01 (tareas sobre HU-ATC-001) | — | 28 | Brayan 9 · Jesús 4 · Michel 9 · Daniel 6 |
| **Total de horas de la Etapa 1** | | | | | **255** | 64 · 64 · 64 · 63 |

En resumen, la Etapa 1 cubre:

- el registro multicanal de tickets con número por razón social;
- el SLA congelado al abrir, con alertas y reapertura;
- la derivación y la reasignación entre áreas;
- el Libro de Reclamaciones y las apelaciones ante INDECOPI;
- el gate legal obligatorio a Eje 3 y la Mesa de Casos sensibles;
- los reclamos de garantía de postventa;
- la encuesta post-atención y la Torre de Control CX;
- la bandeja orquestadora con flujos por tipo, subtipo y área;
- la guía de solución al gestor (la retroalimentación de IA, HU-048, sale de la Etapa 1 por P-025);
- el visor del proceso 3D;
- la consulta 360 del cliente y las integraciones operativas (call center, Legal y motor de consultas), sin la búsqueda por significado (HU-053, fuera por P-025);
- la fundación técnica de CQRS de DT-02: outbox, publicador, proyector y bus (28 h, P-025).
- la resolución de contrato por morosidad de 3 meses;
- los formularios simples (ingreso al proyecto y buses del Entrega Fest);
- la autogestión del cliente en Mi Portal.

En la Etapa 1, los usuarios, los roles y los líderes los administra Control de acceso (PJ-05) y ATC solo los consume (DEP-16, ADR-009), según el Líder Técnico (DT-03 y C-12). La DEP-16 es un riesgo aceptado con mitigación (R-11 en local, DEV y QA; R-12, corte de la UAT en PRE; ED-08 de `analisis/decisiones.md`). El plan del PO tenía un maestro local con carga de RR. HH. (DEP-02).

**Prospectos, en la Etapa 1 (P-041, ED-09; decisión del coordinador, 26-oct).** Control de acceso deriva a Atención al cliente los casos de identidad de los prospectos. Entran como el tipo de ticket «Validación de identidad (prospecto)», con 4 subtipos («Correo distinto», «DNI ya registrado por otra persona», «Posible suplantación» y «Otro caso de identidad»), en el área ATC, y se resuelven en la consola de Control de acceso: valida un supervisor de la cola `ATC` con `PROSPECT_VALIDATOR` y suspende al impostor `IT_ADMIN` (ED-20). Es semilla del catálogo (tipificación de HU-001 y flujos de HU-043): sin historias ni horas nuevas. El proceso está en `analisis/proceso-atencion-prospectos.md`.

**Orden de prioridad 1-3** (PLT-01 v1.3). Estas historias se construyen primero, cada una con su
desarrollador:

1. HU-ATC-043, el flujo por tipo, subtipo y área (Dev 3).
2. HU-ATC-050, la consulta 360 en el ticket (Dev 4).
3. HU-ATC-067, el visor del proceso 3D (Dev 3).

### Flexible — fuera de la Etapa 1 desde el 26-oct (P-025)

El PO los definió como lo primero que sale si el control de alcance (jue 29-oct) muestra atraso:

- RF-SVC-037 a 039 (HU-ATC-037 a 039): contención verbal en EntregaFest.
- RF-SVC-048 (HU-ATC-048): retroalimentación de IA al gestor durante la atención.
- RF-SVC-053 (HU-ATC-053): búsqueda inteligente en archivos y documentos del cliente.

Recortarlos no afecta la v1.0 (PLT-01 v1.3, R-01). **El equipo los sacó de la Etapa 1 el 26-oct-2026** (P-025, decidida
por el equipo, Brayan Hurtado; `analisis/decisiones.md`) para hacer sitio a las 28 h de DT-02: activó el R-01 del PO, que
conserva la decisión de revertirlo. Se retoman en una etapa posterior. Sus documentos siguen en el paquete con la nota «Alcance» y el desglose de sus tareas está sin cambios en
`roadmap/alcance-diferido.md`.

### Fuera (OUT) — "Después"

- Los conectores automáticos de WhatsApp y correo, que son pendientes de producto. En la Etapa 1 el
  ticket se registra a mano o por API contra un simulador (HU-ATC-001, fuera de alcance).
- Los requisitos del Excel que la columna «etapa» deja fuera de la Etapa 1 (RN-SVC-043): **5 RF y
  2 RNF**. No tienen historia ni fecha en este plan.
- Las 5 historias de alcance flexible (HU-ATC-037, 038, 039, 048 y 053; EP-ATC-08 y FT-ATC-15 completas), que salen
  de la Etapa 1 por P-025 y se retoman en una etapa posterior.
- Lo que cada épica declara fuera de alcance en su sección 3 (PLT-02 v1.3), y cualquier
  funcionalidad que no esté en las 57 historias de la Etapa 1.

## 4 Riesgos y supuestos

Los riesgos y las dependencias viven en `docs/roadmap/RMP-001-roadmap-aybar-atiende.md` y el
análisis completo en `docs/roadmap/analisis-dependencias.md`. Son los riesgos R-01 a R-10 del PLT-01
v1.3, con dueño y mitigación, más el R-11 que suma el equipo (DEP-16, riesgo aceptado con mitigación), y las 14 dependencias vigentes: DEP-01, DEP-03 a DEP-08 y DEP-10 a DEP-16 (la numeración del PLT-01 salta
la DEP-09 y la DEP-02 se cambió por la DEP-16). El BRD no los duplica, solo los referencia. Los más urgentes son:

- **R-01**: el plan del PO tenía 243 h de 252 h (96 %), con Dev 4 al 98 %. El equipo activó su mitigación el 26-oct (P-025): sale el alcance flexible (16 h) y entran las 28 h de DT-02; el R-01 es del PO, que puede revertirlo. Quedan 255 h (64, 64, 64 y 63 h por persona) y un sobrecosto real de 7 h sobre 252 h de capacidad (con las 4 h de la reestimación de ADR-009), con dueño el PO.
- **R-02**: APIs externas sin fecha.
- **R-03**: matriz SLA sin definir (mitigación del PO: matriz provisional parametrizable).
- **R-11**: Control de acceso sin fecha en DEV (DEP-16); mitigado con el emisor de pruebas local, tokens de prueba y personas sintéticas (ED-08).

**Supuestos** (PLT-01 v1.3):

- La etapa de diseño (08 al 20-oct) cierra los requerimientos funcionales, los técnicos y las ADR.
- Los 4 desarrolladores están dedicados al 100 % del 21-oct al 03-nov, con asistentes de IA.
- El PO acepta historias a diario, a las 17:00.
- Las integraciones externas se construyen contra simuladores.
- La plataforma es Azure (PostgreSQL con alta disponibilidad entre zonas y Blob Storage con inmutabilidad), según el Líder Técnico (ADR-014, DT-07).

**Restricciones** (PLT-01 v1.3):

- La Etapa 1 tiene un plazo fijo de 10 días hábiles de desarrollo (21-oct → 03-nov-2026).
- No hay QA dedicado.
- Rigen la Ley 29571, art. 24 (Libro de Reclamaciones), y la Ley 29733 (datos personales).
- La IA solo sugiere, nunca decide (RN-SVC-032).

Nota del equipo (ED-28): el art. 24 de la Ley 29571, con el texto de la Ley 31435, fija 15 días hábiles **improrrogables** para responder un reclamo; la prórroga única de HU-013 no se aplica y queda deshabilitada por parámetro.

**Decidido en `decisiones.md`** (Líder Técnico y equipo) que afecta a este BRD:

- **DT-01**: el stack de la Etapa 1 lo decidió el Líder Técnico (Java y Angular del SDK). Las diferencias con el PLT-01 y el PLT-05 del PO están listadas en ED-19 (P-027).
- **P-021** (cerrada por DT-06): el Líder Técnico fijó `PARTY` de la base única como fuente viva. Las diferencias con el ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01 del PO están en ED-19, y la relación de `PARTY` con SIGDA/TAXON la fija ED-05 (P-027).
- **P-026**: Control de acceso en DEV, QA y PRE (DEP-16), riesgo aceptado con mitigación (R-11 y R-12, ED-08).
- **P-041**: entra en la Etapa 1 el tipo de ticket «Validación de identidad (prospecto)», sin horas nuevas (ED-09).
- **ED-28**: plazo del Libro de Reclamaciones de 15 días hábiles improrrogables (Ley 31435).
- **P-022**: el Excel y los PDF quedan como los publicó el PO; las diferencias están en `correcciones-excel-v1.3.md` y en el registro (ED-18).
- **P-024**: cada documento queda listo para la firma de su rol (ED-21).
- **P-025** (horas): decidida por el equipo (Brayan Hurtado), 26-oct-2026, opción A. Las 28 h de DT-02 entran como fundación técnica y salen de la Etapa 1 las 5 historias de alcance flexible (16 h). Sobrecosto real: 7 h (punto 7 de P-025). Etapa 1: 57 historias, 227 h de historias más 28 h técnicas. El recorte es el R-01 del PO, que el equipo activó: el PO conserva la decisión de revertirlo. El proveedor de IA (ED-17) queda decidido, sin consumo en la Etapa 1.

**No queda ninguna pendiente abierta en el registro**: lo que falta son firmas.

## 5 Aprobación

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Stakeholder (patrocinador) | (pendiente) | | [pendiente] |
| Product Owner | Eddie Huamaní | | [pendiente] |

Solo cuenta como evidencia la aprobación registrada en Nexora o `estado: approved` en `origin/main`.

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-15 | Daniel (Dev 4), con IA | Versión inicial publicada en Nexora (v1), sobre el plan v1.2 |
| 0.2 | 2026-10-21 | Brayan (Dev 1), con IA | Actualización a la v1.3 del PO, solo Etapa 1. Pasa a 62 HU, 23 funcionalidades y 243 h de 252 h, con desarrollo del 21-oct al 03-nov y control de alcance el 29-oct. Se ajustan el alcance flexible y el fuera de alcance, las metas por épica y las rutas del roadmap |
| 0.3 | 2026-10-22 | Jesús Chávez Elías, con IA | Cambios de la revisión del Líder Técnico: identidad y roles de Control de acceso (DEP-16 en lugar de DEP-02), plataforma Azure, y el estado de D-001, P-021 y P-025 |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | La DEP-16 ya no es propuesta (C-12); P-021 cerrada por DT-06; alcance nuevo del proceso de prospectos (C-06, P-041) |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: objetivos adoptados (OBJ-04 con la línea base en la primera medición de la UAT); proceso de prospectos fuera de la Etapa 1 (ED-09); DEP-16 como riesgo R-11 con mitigación; la lista de puntos del registro pasa a decisiones y solo queda P-025 (28 h nuevas, brecha de 19 h; la cierra el coordinador) |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): alcance de la Etapa 1 en 57 historias, 22 funcionalidades y 10 épicas, con 227 h de historias (55, 60, 55 y 57) más 28 h técnicas de DT-02 = 255 h; HU-ATC-037, 038, 039, 048 y 053 fuera (alcance flexible R-01), en «Flexible» y «Fuera»; R-01 con la mitigación aplicada; OBJ-06 sin IA en la Etapa 1; no queda ninguna pendiente abierta. Sin cambiar texto del PO |
| 0.7 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: OBJ-02 con el plazo de 15 días hábiles improrrogables (ED-28) y nota sobre la meta de EP-ATC-03 y RES-03, sin cambiar texto del PO; el tipo de ticket de prospectos entra en la Etapa 1 (P-041, ED-09); DEP-16 con R-11 y R-12; P-025 como R-01 del PO; citas sin versión |

Generado por IA: contenido completo. Versión base de Nexora (v1, de Daniel, 15-oct, sobre el plan v1.2), actualizada a la v1.3 del PO (Etapa 1) por Brayan con IA (Claude, 21-oct-2026). Texto adaptado al alcance de la Etapa 1 (se omiten las frases de los documentos del PO que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-01 a DT-10 de `analisis/decisiones.md` v5). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (C-06 y C-12; P-021). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.6) por Brayan Hurtado con IA (Claude) a partir de P-025, decidida por el equipo el 26-oct (`analisis/decisiones.md` v0.8): alcance de la Etapa 1 y horas. — Revisado por: (pendiente)

Historial: 0.7 · 2026-10-26 · Brayan Hurtado, con IA · Segunda revisión del Líder Técnico: plazo del Libro sin prórroga (ED-28), tipo de ticket de prospectos en la Etapa 1 (ED-09), R-12 y R-01 del PO. — Revisado por: (pendiente)
