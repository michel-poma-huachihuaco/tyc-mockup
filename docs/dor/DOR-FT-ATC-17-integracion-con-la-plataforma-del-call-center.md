---
id: "DOR-FT-ATC-17"
tipo: dor
titulo: "Definition of Ready - FT-ATC-17 Integración con la plataforma del call center"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.7"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-29"
relacionados: ["FT-ATC-17", "EP-ATC-10", "HU-ATC-042"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-17 Integración con la plataforma del call center

| Ítem evaluado | Product Owner | Líder técnico |
|---|---|---|
| EP-ATC-10 / FT-ATC-17 Integración con la plataforma del call center | Eddie Huamaní (PO) | (por asignar: PLT-05) |
| **Fecha de revisión** | **Sprint / release destino** | **Resultado** |
| 2026-10-20 (comité DoR · cierre de la etapa de diseño) | v1.0 · Etapa 1 · 03-nov-2026 · Dev 4 · lun 26-oct | READY / NO READY: lo decide quien aprueba el DoR |

Resultado en el PLT-05 (v1.3): **CON CONDICIONES** · condición: DEP-11 call center (por evaluar).

## 1 Checklist de G4

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro para el usuario | [ ] | HU-ATC-042: «Como … quiero … para …» (PLT-04) |
| 2 | Criterios de aceptación verificables en Gherkin | [ ] | 3 criterios CA en 1 HU (PLT-04) |
| 3 | Reglas de negocio explícitas | [ ] | FT-ATC-17 sección 4 (1 regla) |
| 4 | Diseño UX aprobado si hay UI (G2 cerrado) | [ ] | 1 HU con `ui: true`: `docs/gates/<AYB>/G2.md` pendiente |
| 5 | ADR aprobado si aplica (G3 cerrado) | [ ] | Pendiente: `docs/gates/<AYB>/G3.md` (líder técnico) |
| 6 | Dependencias identificadas y desbloqueadas | [ ] | Sección 2: DEP-11; y DEP-16 (añadida el 28-oct-2026 al revisar las operaciones con `x-roles`); la DEP-16, como riesgo con mitigación (R-11 y R-12; ED-08), cuya aceptación firman el PO y el Líder Técnico *Cruce del Líder Técnico del 28-oct (C-12): el emisor de pruebas solo vale en local; la UAT del 03-nov exige Control de acceso en PRE (el «DEV» de este cruce estaba mal, según la revisión del Líder Técnico del 29-oct, puntos 2 y 6). R-11 y R-12 quedan en revisión; no son un riesgo aceptado por el Líder Técnico.* |
| 7 | Consideraciones técnicas y de datos | [ ] | Secciones 3 y 4 (`datos/` y `arquitectura/` del paquete, listos para la firma del Líder Técnico y del Data Chief) |
| 8 | Casos de prueba iniciales definidos por QA | [ ] | Pendiente: `docs/pruebas/test-plan.md`, un TC por criterio |
| 9 | Estimada por el equipo | [ ] | PLT-04: 5 h estimadas por el PO (PLT-05, acuerdo 1); las tareas están en `docs/backlog/tareas/` y las horas quedan cerradas por P-025 (decidida por el equipo el 26-oct-2026, `analisis/decisiones.md`) |
| 10 | Cabe en un sprint | [ ] | 5 h dentro de la ventana 26-oct-2026 → 26-oct-2026 (PLT-01) |
| IA | Si hubo IA: revisión humana registrada | [ ] | Línea «Revisado por» de cada documento: pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-11 | Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call | Externa | EP-ATC-10 | TI / proveedor de call center | 21-oct-2026 | Por evaluar |
| DEP-16 | Control de acceso disponible en DEV, QA y PRE: emisor, clientes OAuth de ATC, catálogo de ATC aprobado y gestores invitados (C-12 del Líder Técnico) (añadida el 28-oct-2026 al revisar las operaciones con `x-roles`). Reemplaza a la DEP-02 (maestro local con carga de RR. HH.) por DT-03. En local, el emisor de pruebas `herramientas/emisor-local.mjs` del repositorio `AybarCorp/aybar-access-control-deus`. En esta funcionalidad: HU-ATC-042 (operaciones `registrarInteraccion`, `obtenerFichaLlamada` con `x-roles`) | Interna | EP-ATC-01, EP-ATC-02, EP-ATC-04, EP-ATC-06, EP-ATC-09, EP-ATC-10, EP-ATC-11 | Área de Roles y Permisos (Sony Montoya) | 21-oct-2026 | Pendiente · riesgo con mitigación (R-11 y R-12 del roadmap; ED-08 de `analisis/decisiones.md`), cuya aceptación firman el PO y el Líder Técnico: emisor de pruebas en local, DEV y QA, tokens de prueba, simulador de `CuentaPersonaPort` y personas sintéticas; *Texto del 28-oct, superado por la revisión del Líder Técnico del 29-oct, punto 2: «para la UAT en PRE, criterio de corte del lun 02-nov a mediodía (R-12)».* Si Control de acceso no está en PRE para la UAT, la UAT se reprograma; no se hace con el emisor de pruebas (Líder Técnico, 29-oct); el emisor de pruebas queda solo para desarrollo local (ED-08). Catálogo y adaptador, según la copia sellada de PJ-05 del 22-oct (no se afirma que estén construidos): ATC deja los lotes del catálogo listos y versionados y la carga real es cuando exista el rol `CATALOG_REGISTRAR`, cuya ruta de otorgamiento está `x-estado: propuesta` (D-171; ADR-021:98-106); en local, DEV y QA se sigue con el emisor de pruebas (ED-08). `CuentaPersonaPort` es un puerto de ATC: su adaptador real no está definido en PJ-05 y hoy se usa el simulador (supuesto de diseño de ATC; *texto superado (v0.9): «sin plazo y sin depender de nadie»*; hoy el claim `party_id` se pide en S28-4, sin fecha comprometida y sin plan B de emisor de pruebas en PRE: revisión del Líder Técnico del 29-oct, punto 5). *Cruce del Líder Técnico del 28-oct (C-12): el emisor de pruebas solo vale en local; la UAT del 03-nov exige Control de acceso en PRE (el «DEV» de este cruce estaba mal, según la revisión del Líder Técnico del 29-oct, puntos 2 y 6). R-11 y R-12 quedan en revisión; no son un riesgo aceptado por el Líder Técnico.* *Cruce del Líder Técnico del 28-oct (C14): se retira ED-01 como lectura de `IDN_USER_ACCOUNT` (sin `SELECT`, `GRANT` ni rol); el adaptador definitivo de `CuentaPersonaPort` lee el claim `party_id` que el área debe agregar (solicitud S28-4); hasta entonces, simulador. La DEP-16 se enlaza con S28-1 a S28-8 (`arquitectura/roles-y-permisos-atc.md` §13, enviada el 29-oct); los clientes OAuth de ATC los crea TI/el área a pedido (S28-2).* |

Una dependencia sin desbloquear deja el criterio 6 sin cumplir. Si su responsable no compromete fecha, se registra como riesgo con su mitigación (R-02: contrato de interfaz y simulador; R-11 y R-12 para la DEP-16), según `analisis/decisiones.md` (ED-08).

## 3 Modelado (datos y proceso)

- Entidades citadas en el PLT-04: ENT-REF-001, ENT-SVC-001, ENT-SVC-004, MAE_CHANNEL, SVC_TICKET, SVC_TICKET_INTERACTION
- ER, estados y diccionario: `datos/er.md`, `datos/estados.md` y `datos/diccionario.md` (tipos y tablas de ATC decididos por el equipo, ED-15 y ED-16)
- Puerta F4 de Gobierno de Datos: `datos/acta-validacion-arquitectura-datos.md` y `datos/registro-de-tablas.md`, listos para la firma del Data Chief

## 4 Arquitectura

- Diagrama C4 y contrato: `arquitectura/c4-contenedores.mmd` y `arquitectura/aybar-atc.openapi.yaml`
- Registro de ADR de la Etapa 1 (PLT-01 §1 y PLT-05 §4.4; se aprueban en el comité del 20-oct). Las que aplican a esta funcionalidad son las de `adr/`, listas para la firma del líder técnico:

| ID | Decisión | Motivo / historias | Alcance | Estado (PLT-05) |
|---|---|---|---|---|
| ADR-01 | Monolito modular por capacidad (NestJS) sobre la infraestructura vigente | Equipo pequeño y plazo corto: un despliegue, módulos separables a futuro | Técnico | Propuesta |
| ADR-02 | Bitácoras append-only con IntegrityHash HMAC-SHA256 | Evidencia ante INDECOPI y auditoría (RNF-AUD-004) | Técnico | Propuesta |
| ADR-03 | El dato del cliente no se copia: consulta 360 federada en línea, con caché corta y degradación por fuente | RN-SVC-026 · HU-050 (prioridad 2) | Funcional y técnico | Propuesta |
| ADR-04 | Integraciones contract-first: adaptador + simulador; la API real se activa cuando existe | APIs externas sin fecha (R-02) | Técnico | Propuesta |
| ADR-05 | Jobs batch idempotentes para SLA y plazo legal con calendario MAE_TIME/MAE_HOLIDAY | Plazos en días hábiles y feriados | Técnico | Propuesta |
| ADR-06 | Evidencia probatoria en S3 con Object Lock y checksum | Libro de Reclamaciones y casos sensibles | Técnico | Propuesta |
| ADR-07 | IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide | RN-SVC-032 · RNF-SEC-009 | Funcional y técnico | Propuesta |
| ADR-08 | Motor de flujos configurable por tipo + subtipo + área, versionado; el ticket congela su versión | HU-043 (prioridad 1) · RN-SVC-045 | Funcional y técnico | Propuesta |
| ADR-09 | Usuarios, roles y líderes locales en Etapa 1 detrás de una interfaz de identidad | — | Técnico | Propuesta |
| ADR-10 | Visor 3D en el navegador (canvas isométrico) alimentado por eventos en tiempo real (WebSocket), con vista 2D alternativa | HU-067 (prioridad 3) · sin plugins ni GPU dedicada | Técnico | Propuesta |
| ADR-11 | Mi Portal: acceso del cliente con DNI + código de un solo uso al contacto registrado en SIGDA/TAXON | HU-064 a 066 · Ley 29733 | Funcional y técnico | Propuesta |

**Nota del 22-oct-2026:** este registro es el del PO (PLT-05 §4.4). El Líder Técnico lo cambió en `analisis/decisiones.md` v0.3 y en la carpeta `adr/` (hoy 14 ADR): ADR-01 usa el stack del SDK (Java y Angular, no NestJS), ADR-06 usa Azure Blob con inmutabilidad (no S3), ADR-09 pasa a Control de acceso (no hay maestro local) y ADR-11 usa el login de Control de acceso (no hay código propio de un solo uso).

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 | APIs externas no disponibles en el plazo (SIGDA/TAXON, call center, Legal, Cobranza, motor de José) | Alta | Alto | Contratos de interfaz y simuladores cerrados en la etapa de diseño (20-oct); pase a producción de cada integración condicionado a su API real | Líder técnico | Abierto |

## 6 Decisión y aprobación

Decision: NO READY

Propuesta IA: el PLT-05 (v1.3) la evalúa «Listo con condiciones» (DEP-11 call center (por evaluar)). El marco solo admite READY o NO READY: lo decide quien aprueba el DoR.

Condiciones pendientes (solo si NO READY):
- [ ] DEP-11 call center (por evaluar) (PLT-05) — riesgo R-02 con mitigación: contrato y simulador (Q-042-1)
- [ ] DEP-16 Control de acceso disponible en DEV, QA y PRE (añadida el 28-oct-2026 al revisar las operaciones con `x-roles`): riesgo con mitigación (R-11 y R-12 del roadmap; ED-08 de `analisis/decisiones.md`), cuya aceptación firman el PO y el Líder Técnico: emisor de pruebas en local, DEV y QA, tokens de prueba, simulador de `CuentaPersonaPort` y personas sintéticas; *Texto del 28-oct, superado por la revisión del Líder Técnico del 29-oct, punto 2: «para la UAT en PRE, criterio de corte del lun 02-nov a mediodía (R-12)».* Si Control de acceso no está en PRE para la UAT, la UAT se reprograma; no se hace con el emisor de pruebas (Líder Técnico, 29-oct); el emisor de pruebas queda solo para desarrollo local (ED-08) *Cruce del Líder Técnico del 28-oct (C-12): el emisor de pruebas solo vale en local; la UAT del 03-nov exige Control de acceso en PRE (el «DEV» de este cruce estaba mal, según la revisión del Líder Técnico del 29-oct, puntos 2 y 6). R-11 y R-12 quedan en revisión; no son un riesgo aceptado por el Líder Técnico.*
- [ ] Criterios 4, 5, 7, 8 y 9 de la sección 1

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | Eddie Huamaní |  |  |
| Líder técnico (consultivo) |  |  |  |
| QA (consultivo) |  |  |  |
| UX (consultivo) |  |  |  |

El DoR cuenta como READY solo con `Decision: READY` y `estado: approved` en `origin/main`, o aprobado en Nexora.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-05 y PLT-01/03/04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 23-oct-2026 por Brayan Hurtado con IA (Claude): se añade la nota de la revisión del Líder Técnico (DT-01, DT-03, DT-04 y DT-07 de `analisis/decisiones.md`), igual a la de los DoR de FT-ATC-02, 03, 18 y 21. — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Decisiones del equipo de `analisis/decisiones.md` v0.7: el criterio 9 remite el cierre de horas al coordinador (P-025); ADR aplicables: las de `adr/` v0.5; regla del criterio 6 con riesgos mitigados; condiciones del PLT-05 anotadas con la decisión del equipo, sin borrar su texto. Modelado y arquitectura (secciones 3 y 4, criterio 7) citan los documentos de `datos/` y `arquitectura/` del paquete. No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.2 · 2026-10-26 · Brayan Hurtado, con IA · P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): el criterio 9 ya no remite el cierre de horas al coordinador. No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.3 · 2026-10-26 · Brayan Hurtado, con IA · Revisión interna del equipo: citas sin versión (la fija Nexora); DEP-16 en DEV, QA y PRE con el criterio de corte de la UAT (R-12). No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.4 · 2026-10-28 · Jesús Chávez Elías, con IA · añade la fila DEP-16 (HU-ATC-042), su evidencia en el criterio 6 y su condición. No cambian criterios, horas ni la decisión del DoR; no se borra texto del PO. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.4) por Jesús Chávez Elías con IA (Claude): añade la fila DEP-16 (HU-ATC-042), su evidencia en el criterio 6 y su condición. — Revisado por: (pendiente)

Historial: 1.3.5 · 2026-10-28 · Jesús Chávez Elías, con IA · cruce del Líder Técnico del 28-oct (C14, C20): se retira ED-01 como lectura de `IDN_USER_ACCOUNT` (`PartyID` por el claim `party_id`, S28-4); nota sobre R-11 y R-12 en la DEP-16 (en revisión, no riesgo aceptado). No cambian criterios, horas ni la decisión del DoR; no se borra texto del PO. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.5) por Jesús Chávez Elías con IA (Claude): cruce del Líder Técnico del 28-oct (C14, C20) en la DEP-16 y en `CuentaPersonaPort`. — Revisado por: (pendiente)

Historial: 1.3.6 · 2026-10-29 · Jesús Chávez Elías, con IA · revisión del Líder Técnico del 29-oct (puntos 2, 5, 6 y 8): se retira el plan B del emisor de pruebas en PRE (si Control de acceso no está en PRE para la UAT, la UAT se reprograma); la UAT exige Control de acceso en PRE, no en DEV; texto del 28-oct marcado superado en la fila DEP-16 y en el criterio 6. No cambian criterios, horas ni estados; no se borra texto del PO; ninguna historia se integra sin G3 y G4 aprobados. — Revisado por: (pendiente)

Actualizado el 29-oct-2026 (v1.3.6) por Jesús Chávez Elías con IA (Claude): revisión del Líder Técnico del 29-oct en la DEP-16 y el criterio 6. — Revisado por: (pendiente)

Historial: 1.3.7 · 2026-10-29 · Jesús Chávez Elías, con IA · Registrado el envío de la solicitud S28 a Sony Montoya el 29-oct. — Revisado por: (pendiente)

Actualizado el 29-oct-2026 (v1.3.7) por Jesús Chávez Elías con IA (Claude): registro del envío de la solicitud S28 a Sony Montoya el 29-oct, con copia al Líder Técnico. — Revisado por: (pendiente)
