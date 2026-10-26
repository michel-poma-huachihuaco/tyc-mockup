---
id: "DOR-FT-ATC-20"
tipo: dor
titulo: "Definition of Ready - FT-ATC-20 Búsqueda y consulta 360 del cliente"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.4"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-26"
relacionados: ["FT-ATC-20", "EP-ATC-10", "HU-ATC-049", "HU-ATC-050", "HU-ATC-051", "HU-ATC-052", "HU-ATC-053"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-20 Búsqueda y consulta 360 del cliente

**Alcance en la Etapa 1:** la Etapa 1 no incluye HU-053 (fuera por decisión del equipo del 26-oct-2026, P-025: alcance flexible R-01 del PO; se retoma en una etapa posterior). Para la Etapa 1 este DoR se evalúa con las HU-049 a 052 (17 h); la DEP-06 y la DEP-14 solo las traía HU-053 y no aplican en la Etapa 1.

| Ítem evaluado | Product Owner | Líder técnico |
|---|---|---|
| EP-ATC-10 / FT-ATC-20 Búsqueda y consulta 360 del cliente | Eddie Huamaní (PO) | (por asignar: PLT-05) |
| **Fecha de revisión** | **Sprint / release destino** | **Resultado** |
| 2026-10-20 (comité DoR · cierre de la etapa de diseño) | v1.0 · Etapa 1 · 03-nov-2026 · Dev 4 · mié 21-oct | READY / NO READY: lo decide quien aprueba el DoR |

Resultado en el PLT-05 (v1.3): **CON CONDICIONES** · condición: DEP-01 · DEP-13 · «llamar la cuenta».

## 1 Checklist de G4

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro para el usuario | [ ] | HU-ATC-049, HU-ATC-050, HU-ATC-051, HU-ATC-052, HU-ATC-053: «Como … quiero … para …» (PLT-04) |
| 2 | Criterios de aceptación verificables en Gherkin | [ ] | 22 criterios CA en 5 HU (PLT-04) |
| 3 | Reglas de negocio explícitas | [ ] | FT-ATC-20 sección 4 (3 reglas) |
| 4 | Diseño UX aprobado si hay UI (G2 cerrado) | [ ] | 5 HU con `ui: true`: `docs/gates/<AYB>/G2.md` pendiente |
| 5 | ADR aprobado si aplica (G3 cerrado) | [ ] | Pendiente: `docs/gates/<AYB>/G3.md` (líder técnico) |
| 6 | Dependencias identificadas y desbloqueadas | [ ] | Sección 2: DEP-01, DEP-06, DEP-08, DEP-11, DEP-13, DEP-14; y DEP-16 (añadida el 26-oct desde PLT-03/PLT-04/PLT-05); la DEP-16, como riesgo aceptado con mitigación (R-11; ED-08) |
| 7 | Consideraciones técnicas y de datos | [ ] | Secciones 3 y 4 (`datos/` y `arquitectura/` del paquete, listos para la firma del Líder Técnico y del Data Chief) |
| 8 | Casos de prueba iniciales definidos por QA | [ ] | Pendiente: `docs/pruebas/test-plan.md`, un TC por criterio |
| 9 | Estimada por el equipo | [ ] | PLT-04: 22 h estimadas por el PO (PLT-05, acuerdo 1); las tareas están en `docs/backlog/tareas/` y las horas quedan cerradas por P-025 (decidida por el equipo el 26-oct-2026, `analisis/decisiones.md` v0.8): en la Etapa 1, 17 h (HU-049 a 052); HU-053 (5 h) queda fuera y sus tareas están en `docs/roadmap/alcance-diferido.md` |
| 10 | Cabe en un sprint | [ ] | 22 h dentro de la ventana 21-oct-2026 → 26-oct-2026 (PLT-01) |
| IA | Si hubo IA: revisión humana registrada | [ ] | Línea «Revisado por» de cada documento: pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato) | Interna | EP-ATC-01, EP-ATC-04, EP-ATC-06, EP-ATC-10 | CDO / Equipo Datos | 21-oct-2026 | Pendiente |
| DEP-06 | Repositorio documental S3 (con DT-07, Azure Blob Storage con inmutabilidad, ADR-006) + GOV_DOCUMENT_REPOSITORY y GLI | Técnica | EP-ATC-01, EP-ATC-03, EP-ATC-04, EP-ATC-10 | Arquitectura / Legal | 23-oct-2026 | En curso |
| DEP-08 | Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h) | Interna | EP-ATC-04, EP-ATC-10, EP-ATC-11 | Cobranza | 21-oct-2026 | Pendiente |
| DEP-11 | Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call | Externa | EP-ATC-10 | TI / proveedor de call center | 21-oct-2026 | Por evaluar |
| DEP-13 | Motor de consultas de José: contrato de API y responsable de mantenimiento | Interna | EP-ATC-10 | José · TI | 23-oct-2026 | Por evaluar |
| DEP-14 | Proveedor de IA aprobado por TI y Seguridad, con política de datos personales | Técnica | EP-ATC-09, EP-ATC-10 | TI · Seguridad | 23-oct-2026 | Por evaluar |
| DEP-16 | Control de acceso disponible en DEV: emisor, clientes OAuth de ATC, catálogo de ATC aprobado y gestores invitados (C-12 del Líder Técnico) (añadida el 26-oct desde PLT-03/PLT-04/PLT-05). Reemplaza a la DEP-02 (maestro local con carga de RR. HH.) por DT-03. En local, el emisor de pruebas `herramientas/emisor-local.mjs` del repositorio `AybarCorp/aybar-access-control-deus`. En esta funcionalidad: HU-ATC-049 (la búsqueda respeta los permisos del rol, RN-SVC-036; P-034); HU-ATC-050 (datos por rol, CA-02 y CA-07, RN-SVC-036); HU-ATC-052 (datos según el rol, CA-03); HU-ATC-053 (documentos según el rol del gestor, CA-02) | Interna | EP-ATC-01, EP-ATC-02, EP-ATC-04, EP-ATC-06, EP-ATC-09, EP-ATC-10, EP-ATC-11 | Área de Roles y Permisos (Sony Montoya) | 21-oct-2026 | Pendiente · riesgo aceptado con mitigación (R-11 del roadmap; ED-08 de `analisis/decisiones.md` v0.7): emisor de pruebas local, tokens de prueba y personas sintéticas |

Una dependencia sin desbloquear deja el criterio 6 sin cumplir. Si su responsable no compromete fecha, se registra como riesgo con su mitigación (R-02: contrato de interfaz y simulador; R-11 para la DEP-16), según `analisis/decisiones.md` v0.7 (ED-08).

## 3 Modelado (datos y proceso)

- Entidades citadas en el PLT-04: ENT-GOV-004, ENT-SVC-001, ENT-SVC-004, ENT-SVC-017, GOV_DOCUMENT_REPOSITORY, SVC_SEARCH_INDEX, SVC_TICKET, SVC_TICKET_INTERACTION
- ER, estados y diccionario: `datos/er.md`, `datos/estados.md` y `datos/diccionario.md` (tipos y tablas de ATC decididos por el equipo, ED-15 y ED-16)
- Puerta F4 de Gobierno de Datos: `datos/acta-validacion-arquitectura-datos.md` v0.4 y `datos/registro-de-tablas.md` v0.3, listos para la firma del Data Chief

## 4 Arquitectura

- Diagrama C4 y contrato: `arquitectura/c4-contenedores.mmd` y `arquitectura/aybar-atc.openapi.yaml` (`0.6.0-borrador`)
- Registro de ADR de la Etapa 1 (PLT-01 §1 y PLT-05 §4.4; se aprueban en el comité del 20-oct). Las que aplican a esta funcionalidad son las de `adr/` (v0.5), listas para la firma del líder técnico:

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
| R-07 | Datos personales expuestos en bitácoras, búsqueda, Mi Portal o prompts de IA (Ley 29733) | Media | Alto | DLP (RNF-SEC-008), anonimización antes de la IA (RNF-SEC-009), permisos del origen (RNF-SEC-010) y visibilidad del cliente (RN-SVC-044) | Seguridad TI |  |

## 6 Decisión y aprobación

Decision: NO READY

Propuesta IA: el PLT-05 (v1.3) la evalúa «Listo con condiciones» (DEP-01 · DEP-13 · «llamar la cuenta»). El marco solo admite READY o NO READY: lo decide quien aprueba el DoR.

Condiciones pendientes (solo si NO READY):
- [ ] DEP-01 · DEP-13 · «llamar la cuenta» (PLT-05) — decisión del equipo: contrato y simulador de DEP-01 y DEP-13 (R-02); «llamar la cuenta» es la llamada telefónica por la plataforma de call center (Q-049-1); DEP-14 con proveedor decidido (ED-17)
- [ ] DEP-16 Control de acceso disponible en DEV (añadida el 26-oct desde PLT-03/PLT-04/PLT-05): riesgo aceptado con mitigación (R-11 del roadmap; ED-08 de `analisis/decisiones.md` v0.7): emisor de pruebas local, tokens de prueba y personas sintéticas
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

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Añade a la sección 2 las DEP de sus historias que faltaban (DEP-16), con la nota de origen, en el criterio 6 y en las condiciones; la DEP-06 anota Azure Blob Storage (DT-07). No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.2 · 2026-10-26 · Brayan Hurtado, con IA · La DEP-16 suma HU-ATC-049 (RN-SVC-036 «Búsqueda respeta permisos», con el mismo criterio que HU-050, 052 y 053; P-034): la llevan 4 de sus 5 HU (todas menos HU-051, que no autoriza por rol). No cambian las DEP de la sección 2 ni el criterio 6. No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.3 · 2026-10-26 · Brayan Hurtado, con IA · Decisiones del equipo de `analisis/decisiones.md` v0.7: el criterio 9 remite el cierre de horas al coordinador (P-025); ADR aplicables: las de `adr/` v0.5; regla del criterio 6 con riesgos mitigados; DEP-16 como riesgo aceptado con mitigación (R-11); condiciones del PLT-05 anotadas con la decisión del equipo, sin borrar su texto. Modelado y arquitectura (secciones 3 y 4, criterio 7) citan los documentos de `datos/` y `arquitectura/` del paquete. No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.4 · 2026-10-26 · Brayan Hurtado, con IA · P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): el criterio 9 ya no remite el cierre de horas al coordinador. Nota de alcance al inicio: la Etapa 1 no incluye HU-053; DEP-06 y DEP-14 no aplican en la Etapa 1. No se borra texto del PO. — Revisado por: (pendiente)
