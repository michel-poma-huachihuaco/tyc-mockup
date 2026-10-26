---
id: "DOR-FT-ATC-22"
tipo: dor
titulo: "Definition of Ready - FT-ATC-22 Resolución de contrato por morosidad"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-26"
relacionados: ["FT-ATC-22", "EP-ATC-11", "HU-ATC-056", "HU-ATC-057", "HU-ATC-058"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-22 Resolución de contrato por morosidad

| Ítem evaluado | Product Owner | Líder técnico |
|---|---|---|
| EP-ATC-11 / FT-ATC-22 Resolución de contrato por morosidad | Eddie Huamaní (PO) | (por asignar: PLT-05) |
| **Fecha de revisión** | **Sprint / release destino** | **Resultado** |
| 2026-10-20 (comité DoR · cierre de la etapa de diseño) | v1.0 · Etapa 1 · 03-nov-2026 · Dev 4 · mié 28-oct | READY / NO READY: lo decide quien aprueba el DoR |

Resultado en el PLT-05 (v1.3): **CON CONDICIONES** · condición: DEP-08 · DEP-15 · causal legal.

## 1 Checklist de G4

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro para el usuario | [ ] | HU-ATC-056, HU-ATC-057, HU-ATC-058: «Como … quiero … para …» (PLT-04) |
| 2 | Criterios de aceptación verificables en Gherkin | [ ] | 9 criterios CA en 3 HU (PLT-04) |
| 3 | Reglas de negocio explícitas | [ ] | FT-ATC-22 sección 4 (3 reglas) |
| 4 | Diseño UX aprobado si hay UI (G2 cerrado) | [ ] | 3 HU con `ui: true`: `docs/gates/<AYB>/G2.md` pendiente |
| 5 | ADR aprobado si aplica (G3 cerrado) | [ ] | Pendiente: `docs/gates/<AYB>/G3.md` (líder técnico) |
| 6 | Dependencias identificadas y desbloqueadas | [ ] | Sección 2: DEP-08, DEP-15; y DEP-05, DEP-16 (añadida el 26-oct desde PLT-03/PLT-04/PLT-05) |
| 7 | Consideraciones técnicas y de datos | [ ] | Secciones 3 y 4 (pendiente `docs/datos/` y `docs/arquitectura/`) |
| 8 | Casos de prueba iniciales definidos por QA | [ ] | Pendiente: `docs/pruebas/test-plan.md`, un TC por criterio |
| 9 | Estimada por el equipo | [ ] | PLT-04: 10 h estimadas por el PO, a confirmar en el cierre funcional del 19-oct (PLT-05, acuerdo 1; `docs/backlog/tareas/` pendiente) |
| 10 | Cabe en un sprint | [ ] | 10 h dentro de la ventana 28-oct-2026 → 29-oct-2026 (PLT-01) |
| IA | Si hubo IA: revisión humana registrada | [ ] | Línea «Revisado por» de cada documento: pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-08 | Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h) | Interna | EP-ATC-04, EP-ATC-10, EP-ATC-11 | Cobranza | 21-oct-2026 | Pendiente |
| DEP-15 | Maestro de responsables de proyecto y supervisores (fuente única) | Interna | EP-ATC-11 | Gerencia Comercial · Datos | 29-oct-2026 | Pendiente |
| DEP-05 | Validación legal: formato del asiento, textos y plazos del Libro (añadida el 26-oct desde PLT-03/PLT-04/PLT-05). En esta funcionalidad: HU-ATC-056 (validación legal de la causal de RN-SVC-037; PLT-05); HU-ATC-057 (validación legal del texto de la alerta de cancelación; PLT-05); HU-ATC-058 (validación legal del texto de la carta al proyecto; PLT-05) | Legal | EP-ATC-03, EP-ATC-11 | Gerencia Legal | 26-oct-2026 | Pendiente |
| DEP-16 | Control de acceso disponible en DEV: emisor, clientes OAuth de ATC, catálogo de ATC aprobado y gestores invitados (C-12 del Líder Técnico) (añadida el 26-oct desde PLT-03/PLT-04/PLT-05). Reemplaza a la DEP-02 (maestro local con carga de RR. HH.) por DT-03. En local, el emisor de pruebas `herramientas/emisor-local.mjs` del repositorio `AybarCorp/aybar-access-control-deus`. En esta funcionalidad: HU-ATC-058 (supervisor del responsable del proyecto cuando es una jefatura interna, CA-01 y CA-02; el maestro de proyectos es la DEP-15) | Interna | EP-ATC-01, EP-ATC-02, EP-ATC-04, EP-ATC-06, EP-ATC-09, EP-ATC-10, EP-ATC-11 | Área de Roles y Permisos (Sony Montoya) | 21-oct-2026 | Pendiente · en riesgo: sin fecha comprometida (PJ-05 no la tiene, P-040) |

Una dependencia sin fecha comprometida, o sin desbloquear, deja el criterio 6 sin cumplir.

## 3 Modelado (datos y proceso)

- Entidades citadas en el PLT-04: ENT-GOV-004, ENT-SVC-001, ENT-SVC-004, ENT-SVC-014, ENT-SVC-018, GOV_DOCUMENT_REPOSITORY, SVC_CONTRACT_DEFAULT_ALERT, SVC_TICKET, SVC_TICKET_INTERACTION, SVC_WORKFLOW_DEFINITION
- ER, estados y diccionario: (pendiente: `docs/datos/`)
- Puerta F4 de Gobierno de Datos: (pendiente, si toca datos)

## 4 Arquitectura

- Diagrama C4 y contrato: (pendiente: `docs/arquitectura/`)
- Registro de ADR de la Etapa 1 (PLT-01 §1 y PLT-05 §4.4; se aprueban en el comité del 20-oct). Cuáles aplican a esta funcionalidad lo confirma el líder técnico:

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
| R-06 | Ítems con alcance ambiguo (8 % de interés, rayo, «llamar la cuenta», cancelación del servicio, buses, acceso del cliente a Mi Portal) | Alta | Medio | Cerrarlos en el cierre funcional del 19-oct; lo no resuelto se construye parametrizable | PO | Abierto |

## 6 Decisión y aprobación

Decision: NO READY

Propuesta IA: el PLT-05 (v1.3) la evalúa «Listo con condiciones» (DEP-08 · DEP-15 · causal legal). El marco solo admite READY o NO READY: lo decide quien aprueba el DoR.

Condiciones pendientes (solo si NO READY):
- [ ] DEP-08 · DEP-15 · causal legal (PLT-05)
- [ ] DEP-05 validación legal (añadida el 26-oct desde PLT-03/PLT-04/PLT-05)
- [ ] DEP-16 Control de acceso disponible en DEV (añadida el 26-oct desde PLT-03/PLT-04/PLT-05); sin fecha comprometida (P-040)
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

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Añade a la sección 2 las DEP de sus historias que faltaban (DEP-05, DEP-16), con la nota de origen, en el criterio 6 y en las condiciones. No se borra texto del PO. — Revisado por: (pendiente)
