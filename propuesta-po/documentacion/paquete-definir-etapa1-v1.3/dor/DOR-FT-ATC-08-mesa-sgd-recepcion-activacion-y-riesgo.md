---
id: "DOR-FT-ATC-08"
tipo: dor
titulo: "Definition of Ready - FT-ATC-08 Mesa SGD: recepción, activación y riesgo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-26"
relacionados: ["FT-ATC-08", "EP-ATC-04", "HU-ATC-020", "HU-ATC-021", "HU-ATC-022"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-08 Mesa SGD: recepción, activación y riesgo

| Ítem evaluado | Product Owner | Líder técnico |
|---|---|---|
| EP-ATC-04 / FT-ATC-08 Mesa SGD: recepción, activación y riesgo | Eddie Huamaní (PO) | (por asignar: PLT-05) |
| **Fecha de revisión** | **Sprint / release destino** | **Resultado** |
| 2026-10-20 (comité DoR · cierre de la etapa de diseño) | v1.0 · Etapa 1 · 03-nov-2026 · Dev 2 · mié 28-oct | READY / NO READY: lo decide quien aprueba el DoR |

Resultado en el PLT-05 (v1.3): **CON CONDICIONES** · condición: Plazos de línea SGD (DEP-03).

## 1 Checklist de G4

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro para el usuario | [ ] | HU-ATC-020, HU-ATC-021, HU-ATC-022: «Como … quiero … para …» (PLT-04) |
| 2 | Criterios de aceptación verificables en Gherkin | [ ] | 7 criterios CA en 3 HU (PLT-04) |
| 3 | Reglas de negocio explícitas | [ ] | FT-ATC-08 sección 4 (3 reglas) |
| 4 | Diseño UX aprobado si hay UI (G2 cerrado) | [ ] | 3 HU con `ui: true`: `docs/gates/<AYB>/G2.md` pendiente |
| 5 | ADR aprobado si aplica (G3 cerrado) | [ ] | Pendiente: `docs/gates/<AYB>/G3.md` (líder técnico) |
| 6 | Dependencias identificadas y desbloqueadas | [ ] | Sección 2: DEP-03 (añadida el 26-oct desde PLT-03/PLT-04/PLT-05) |
| 7 | Consideraciones técnicas y de datos | [ ] | Secciones 3 y 4 (`datos/` y `arquitectura/` del paquete, listos para la firma del Líder Técnico y del Data Chief) |
| 8 | Casos de prueba iniciales definidos por QA | [ ] | Pendiente: `docs/pruebas/test-plan.md`, un TC por criterio |
| 9 | Estimada por el equipo | [ ] | PLT-04: 11 h estimadas por el PO (PLT-05, acuerdo 1); las tareas están en `docs/backlog/tareas/` y las horas quedan cerradas por P-025 (decidida por el equipo el 26-oct-2026, `analisis/decisiones.md` v0.8) |
| 10 | Cabe en un sprint | [ ] | 11 h dentro de la ventana 28-oct-2026 → 29-oct-2026 (PLT-01) |
| IA | Si hubo IA: revisión humana registrada | [ ] | Línea «Revisado por» de cada documento: pendiente |

## 2 Dependencias

La sección de dependencias del PLT-05 no lista ninguna; las de las historias de esta funcionalidad son:

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-03 | Decisión de negocio: matriz SLA por tipo y prioridad y plazos de línea de la Mesa SGD (RNF-REN-003) (añadida el 26-oct desde PLT-03/PLT-04/PLT-05). En esta funcionalidad: HU-ATC-020 (plazos de línea de la Mesa SGD; PLT-05); HU-ATC-021 (plazos de línea de la Mesa SGD; PLT-05); HU-ATC-022 (plazos de línea de la Mesa SGD; PLT-05) | Interna | EP-ATC-02, EP-ATC-04 | Gerencia ATC · Mesa SGD | 22-oct-2026 | Pendiente |

Una dependencia sin desbloquear deja el criterio 6 sin cumplir. Si su responsable no compromete fecha, se registra como riesgo con su mitigación (R-02: contrato de interfaz y simulador; R-11 para la DEP-16), según `analisis/decisiones.md` v0.7 (ED-08).

## 3 Modelado (datos y proceso)

- Entidades citadas en el PLT-04: —
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
| R-06 | Ítems con alcance ambiguo (8 % de interés, rayo, «llamar la cuenta», cancelación del servicio, buses, acceso del cliente a Mi Portal) | Alta | Medio | Cerrarlos en el cierre funcional del 19-oct; lo no resuelto se construye parametrizable | PO | Abierto |
| R-08 | Textos legales (Libro, alerta de cancelación, carta al proyecto) sin validar al pase | Media | Alto | Plantillas configurables; validación de Legal antes del lun 26-oct (Libro) y del mié 28-oct (morosidad) | Gerencia Legal |  |

## 6 Decisión y aprobación

Decision: NO READY

Propuesta IA: el PLT-05 (v1.3) la evalúa «Listo con condiciones» (Plazos de línea SGD (DEP-03)). El marco solo admite READY o NO READY: lo decide quien aprueba el DoR.

Condiciones pendientes (solo si NO READY):
- [ ] Plazos de línea SGD (DEP-03) (PLT-05) — decisión del equipo: Indecopi 10, Libro 15, Cartas notariales 10, Legal Atiende 5 y Backlog 20 días hábiles, parametrizables (FT-08 en `analisis/decisiones.md` v0.7; R-03)
- [ ] DEP-03 matriz SLA y plazos de línea de la Mesa SGD (añadida el 26-oct desde PLT-03/PLT-04/PLT-05)
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

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Añade a la sección 2 las DEP de sus historias que faltaban (DEP-03), con la nota de origen, en el criterio 6 y en las condiciones. No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.2 · 2026-10-26 · Brayan Hurtado, con IA · Decisiones del equipo de `analisis/decisiones.md` v0.7: el criterio 9 remite el cierre de horas al coordinador (P-025); ADR aplicables: las de `adr/` v0.5; regla del criterio 6 con riesgos mitigados; condiciones del PLT-05 anotadas con la decisión del equipo, sin borrar su texto. Modelado y arquitectura (secciones 3 y 4, criterio 7) citan los documentos de `datos/` y `arquitectura/` del paquete. No se borra texto del PO. — Revisado por: (pendiente)

Historial: 1.3.3 · 2026-10-26 · Brayan Hurtado, con IA · P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): el criterio 9 ya no remite el cierre de horas al coordinador. No se borra texto del PO. — Revisado por: (pendiente)
