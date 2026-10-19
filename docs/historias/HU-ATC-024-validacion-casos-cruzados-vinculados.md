---
id: "HU-ATC-024"
tipo: hu
titulo: "Validar casos cruzados o vinculados antes de registrar"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-09", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-024-validacion-casos-cruzados-vinculados.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de la Mesa de Casos (SGD) quiero que el sistema me advierta si un caso nuevo coincide con uno existente para gestionarlos en un solo hilo de evidencia y evitar duplicados.
- Requerimiento origen (RF-SVC-024 — Validacion de casos cruzados y vinculados): El sistema debe validar si un caso nuevo está vinculado a uno existente antes de registrarlo como independiente. · Proceso: PROC-SVC-010 (Escalamiento institucional, vinculacion y cierre tipificado de casos sensibles) · Fuente: PLT-04 · HU-ATC-024 · traza RF-SVC-024
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 2** (2026-10-29 → 2026-10-29)
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · escalamiento en cadena | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · escalamiento y cierre | 6.5 Diagrama entidad-relación · escalamiento y cierre (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Validar casos cruzados o vinculados antes de registrar

Escenario: CA-01 · Coincidencia
  Dado un caso nuevo con el mismo cliente y hechos que uno abierto
  Cuando intento registrarlo
  Entonces el sistema propone vincularlo y no lo registra como independiente.

Escenario: CA-02 · Hilo único
  Dado dos casos vinculados
  Cuando los gestiono
  Entonces comparten un único hilo de evidencia trazable.
```

- Evidencia / prueba esperada (PLT-04): `Evento caso_vinculado`

## Reglas de negocio

- RN-SVC-018 (Caso vinculado no se duplica): Un caso cruzado o vinculado con otro no se registra como caso independiente; se gestiona con un solo hilo de evidencia.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Por diseñar — Mockups: P-06 "Mesa de Casos SGD" (Caso sensible con matriz de riesgo, escalamiento, vinculados y cierre)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles/{id}/vinculacion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Criterio de coincidencia por definir (pregunta abierta)
- Entidades/campos que LEE: SVC_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE_LINK (caso origen, caso vinculado)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
