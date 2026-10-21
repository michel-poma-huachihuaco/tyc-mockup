---
id: "HU-ATC-063"
tipo: hu
titulo: "Mostrar la propuesta comercial de DAEDALUS en la consulta 360"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-24", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-063-mostrar-propuesta-comercial-daedalus-consulta-360.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets (integrado con ACT-051 DAEDALUS) quiero ver en la consulta 360 del cliente la propuesta comercial y la reserva registradas en DAEDALUS (proyecto, lote, precio y estado), consultadas en línea por API, para responder consultas comerciales sin pedir el dato a otra área.
- Requerimiento origen (RF-SVC-063 — Mostrar la propuesta comercial de DAEDALUS en la consulta 360): El sistema debe mostrar en la consulta 360 del cliente la propuesta comercial y la reserva registradas en DAEDALUS (proyecto, lote, precio y estado), consultadas en línea por API para el gestor de tickets permitiendo responder consultas comerciales sin pedir el dato a otra área. Decisión PO · división por etapas oct-2026 · ítem 3 · Capacidad: CAP-SVC-018 (Integración con plataformas corporativas en construcción — Etapa 2) · Proceso: PROC-SVC-023 (Integraciones de plataforma: NEXUS y DAEDALUS — Etapa 2) · Objetivo: OBJ-SVC-001 · Necesidad: NEC-SVC-007 · Fuente: ATC_requerimientos.xlsx.ods · HU-ATC-063 · traza RF-SVC-063
- Etapa del proyecto (RN-SVC-043): **Etapa 2** — Integración con UrbeMind / NEXUS / DAEDALUS · tecnología de terceros en construcción · cierre estimado 15-dic-2026.
- Planificación (Etapa 2): Prioridad: **DEBERIA** · Iteración: **Etapa 2 (cierre estimado 15-dic-2026)** · Estimación: **4 h** · Asignado: **Dev 4** · Depende de HU: HU-ATC-050, HU-ATC-051 · Dependencias externas: DEP-16 (DAEDALUS: API de consulta en línea de propuestas comerciales y reservas 1:1)
- Observaciones de alcance: DAEDALUS lo implementa un tercero y está en construcción; en la Etapa 1 (salida 30-oct-2026) la consulta 360 (`HU-ATC-050`) opera sin esta sección sin bloquear la atención (RN-SVC-043).
- Preguntas abiertas (.ods): ¿Qué datos de la propuesta necesita ATC? ¿DAEDALUS expone API de consulta o solo eventos? ¿Fecha comprometida (estimado 15-dic-2026)?

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Mostrar la propuesta comercial de DAEDALUS en la consulta 360

Escenario: CA-01 · Visualización en línea de propuesta comercial y reserva desde DAEDALUS
  Dado un cliente con propuesta en DAEDALUS
  Cuando el gestor abre la consulta 360
  Entonces ve proyecto, lote, precio y estado de la propuesta sin copiarlos.

Escenario: CA-02 · Degradación elegante ante DAEDALUS no disponible
  Dado DAEDALUS no disponible
  Cuando se consulta
  Entonces la sección muestra «no disponible» y el resto de la ficha carga.
```

- Evidencia / prueba esperada: `Sección Propuesta Comercial DAEDALUS en Consulta 360 mostrando proyecto, lote, precio y estado sin persistencia paralela (RN-SVC-026) y estado «no disponible» ante fallo de red`

## Reglas de negocio

- RN-SVC-026 (Cero registros paralelos del dato de cliente): El dato comercial de DAEDALUS se consulta en línea por API y nunca se duplica como tabla maestra local en ATC.
- RN-SVC-036 (Búsqueda respeta permisos): La visualización de la propuesta comercial y su indexación respetan los permisos del rol del gestor.
- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind ni DAEDALUS. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Consulta 360 ASTRA › Tarjeta Propuesta Comercial DAEDALUS (Etapa 2)
- Estados que aplican: vacío, carga, error («no disponible» sin bloquear el resto de la ficha 360), sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/clientes/{partyId}/propuestas-daedalus` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en .ods: ENT-SVC-017 SVC_SEARCH_INDEX
- Entidades/campos que LEE: propuesta comercial y reserva (proyecto, lote, precio, estado) en línea desde DAEDALUS (ACT-051); índice de consulta en `SVC_SEARCH_INDEX`
- Entidades/campos que ESCRIBE o modifica: ninguno en tablas de negocio (solo lectura en línea según RN-SVC-026)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado — cumple RN-SVC-026 (cero registros paralelos) y usa `ENT-SVC-017` (`SVC_SEARCH_INDEX`)

## DoR (G4) - no entra al sprint sin esto

- [x] Valor claro - [x] Gherkin verificable - [x] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas (DAEDALUS en construcción · Etapa 2, cierre estimado 15-dic-2026) - [x] Casos iniciales de QA
- [ ] Estimada por el equipo - [x] Cabe en un sprint

Generado por IA: incorporado desde `ATC_requerimientos.xlsx.ods` (`RF-SVC-063`, `PROC-SVC-023`, Etapa 2) — Revisado por: pendiente
