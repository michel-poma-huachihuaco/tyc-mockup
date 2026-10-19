---
id: "HU-ATC-020"
tipo: hu
titulo: "Registrar un caso sensible con Código Único"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-08", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-020-registro-multilinea-codigo-unico-caso.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de la Mesa de Casos (SGD) quiero registrar cada caso sensible indicando su línea de ingreso y obtener un Código Único para rastrearlo de punta a punta sin importar el canal.
- Requerimiento origen (RF-SVC-020 — Registro multilinea con Codigo Unico de Caso): El sistema debe registrar todo caso sensible por su línea de origen (5 líneas) con un Código Único Estandarizado. · Proceso: PROC-SVC-009 (Recepcion multilinea y activacion de casos sensibles (Mesa SGD)) · Fuente: PLT-04 · HU-ATC-020 · traza RF-SVC-020
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 2** (2026-10-26 → 2026-10-27) · Depende de HU: HU-ATC-028
- Observaciones de alcance: Fuera de alcance: Digitalización del pendientes de producto en papel.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso sensible en la Mesa SGD | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · recepción y activación | 6.5 Diagrama entidad-relación · casos sensibles (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar un caso sensible con Código Único

Escenario: CA-01 · Código único
  Dado un caso detectado por cualquiera de las 5 líneas
  Cuando lo registro
  Entonces recibe un Código Único que nunca se reutiliza.

Escenario: CA-02 · Reclasificación
  Dado un caso de Legal Atiende (preventivo) que no se resuelve
  Cuando lo reclasifico
  Entonces se re-registra como reclamo formal (línea 2) conservando la trazabilidad del origen.
```

- Evidencia / prueba esperada (PLT-04): `Evento caso_sensible_registrado {línea}`

## Reglas de negocio

- RN-SVC-014 (Cinco lineas de ingreso de casos sensibles): Los casos sensibles ingresan por 5 lineas: Indecopi (procedimientos administrativos directos), Libro de Reclamaciones (canales regulados), Cartas Notariales (valor probatorio), Legal Atiende (preventivo, antes de escalar a reclamo formal) y Backlog Historico (casos previos sin cierre formal).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Mesa de Casos SGD — Mockups: P-06 "Mesa de Casos SGD" (Caso sensible con matriz de riesgo, escalamiento, vinculados y cierre)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Entidad por modelar (R-06)
- Entidades/campos que LEE: catálogo de líneas de ingreso
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE (línea de origen, Código Único)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
