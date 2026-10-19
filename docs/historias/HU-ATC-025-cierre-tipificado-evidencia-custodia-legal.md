---
id: "HU-ATC-025"
tipo: hu
titulo: "Cerrar el caso con estado homologado y evidencia"
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

Va en `docs/historias/HU-ATC-025-cierre-tipificado-evidencia-custodia-legal.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de la Mesa de Casos (SGD) quiero cerrar el caso eligiendo uno de los 8 estados homologados y adjuntando la evidencia para que los cierres sean comparables y los originales queden custodiados en el GLI.
- Requerimiento origen (RF-SVC-025 — Cierre tipificado con evidencia y custodia legal separada): El sistema debe cerrar cada caso en uno de los 8 estados homologados, con evidencia, y referenciar la custodia en el GLI. · Proceso: PROC-SVC-010 (Escalamiento institucional, vinculacion y cierre tipificado de casos sensibles) · Fuente: PLT-04 · HU-ATC-025 · traza RF-SVC-025
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 2** (2026-10-29 → 2026-10-29) · Depende de HU: HU-ATC-023, HU-ATC-024 · Dependencias externas: DEP-06 (Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI)
- Observaciones de alcance: Fuera de alcance: Custodia física de originales.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · escalamiento en cadena | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · escalamiento y cierre | 6.5 Diagrama entidad-relación · escalamiento y cierre (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Cerrar el caso con estado homologado y evidencia

Escenario: CA-01 · Estado homologado
  Dado un caso listo para cerrar
  Cuando lo cierro
  Entonces debo elegir uno de los 8 estados y no puedo cerrar sin evidencia.

Escenario: CA-02 · Custodia
  Dado un original probatorio crítico
  Cuando lo registro
  Entonces la plataforma guarda la referencia al Repositorio Legal GLI y no reemplaza la custodia.
```

- Evidencia / prueba esperada (PLT-04): `Evento caso_cerrado {estado}`

## Reglas de negocio

- RN-SVC-019 (Cierre tipificado por ocho estados homologados): Todo cierre de caso se tipifica en uno de ocho estados homologados (conforme, con observacion, con riesgo mitigado, con contingencia, por desistimiento, por derivacion legal, por regularizacion documentaria, por acuerdo con cliente) o se reabre; un cierre sin evidencia no es cierre.
- RN-SVC-020 (Custodia legal separada de la plataforma operativa): Los originales probatorios criticos se custodian en el Repositorio Legal Controlado (GLI); la plataforma de trazabilidad operativa nunca reemplaza esa custodia.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Mesa SGD (cierre tipificado) — Mockups: P-06 "Mesa de Casos SGD" (Caso sensible con matriz de riesgo, escalamiento, vinculados y cierre)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles/{id}/cierre` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: DEP-06 GLI · RNF-CUM-007 · nota: el CA-2 del Excel está truncado
- Entidades/campos que LEE: SVC_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE.ClosureState, referencia a GLI
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
