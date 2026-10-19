---
id: "HU-ATC-032"
tipo: hu
titulo: "Auditar registros paralelos del dato de cliente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-14", "EP-ATC-07", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-032-prevencion-registros-paralelos-dato-cliente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como CDO o coordinador CX quiero una auditoría quincenal de registros paralelos del dato de cliente para mantener una única fuente del cliente.
- Requerimiento origen (RF-SVC-032 — Prevencion de registros paralelos del dato de cliente): El sistema debe auditar quincenalmente la existencia de registros paralelos del dato de cliente fuera de SIGDA/TAXON. · Proceso: PROC-SVC-012 (Monitoreo en tiempo real y reporting desde la Torre de Control) · Fuente: PLT-04 · HU-ATC-032 · traza RF-SVC-032
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 3** (2026-10-27 → 2026-10-28) · Dependencias externas: DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato))
- Observaciones de alcance: Fuera de alcance: Limpieza de datos en otros sistemas.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket monitoreado en la Torre de Control | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · tablero e informes | 6.5 Diagrama entidad-relación · analítica
- Referencia visual / plantilla en prototipo: Prototipo › Torre de Control (auditoría) [P-08 "Torre de Control CX"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Auditar registros paralelos del dato de cliente

Escenario: CA-01 · Corte
  Dado el corte quincenal
  Cuando se ejecuta la auditoría
  Entonces el número de registros paralelos detectados debe ser cero.

Escenario: CA-02 · Hallazgo
  Dado un registro paralelo detectado
  Cuando se reporta
  Entonces se eleva como gate no compensable, no como observación menor.
```

- Evidencia / prueba esperada (PLT-04): `Métrica registros_paralelos`

## Reglas de negocio

- RN-SVC-026 (Cero registros paralelos del dato de cliente): No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoria quincenal debe arrojar cero casos y crear uno es gate no compensable.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: DEP-01 SIGDA/TAXON
- Entidades/campos que LEE: SVC_TICKET y demás tablas que referencian datos de cliente
- Entidades/campos que ESCRIBE o modifica: reporte de auditoría de registros paralelos
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
