---
id: "HU-ATC-029"
tipo: hu
titulo: "Medir el cierre end-to-end de la experiencia"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-04", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-029-sla-cierre-end-to-end-experiencia.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como coordinador CX quiero ver cuánto lleva cada ticket de punta a punta y recibir alerta antes de las 72 horas hábiles para cerrar la experiencia a tiempo.
- Requerimiento origen (RF-SVC-029 — SLA de cierre end-to-end de la experiencia): El sistema debe medir el cierre end-to-end y alertar al acercarse a 72 horas hábiles sin escalamiento o al plazo del eje si hay escalamiento. · Proceso: PROC-SVC-011 (Derivacion obligatoria a Legal ante caso de conflicto (gate Eje 3)) · Fuente: PLT-04 · HU-ATC-029 · traza RF-SVC-029
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 2** (2026-10-23 → 2026-10-23) · Depende de HU: HU-ATC-003
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · compromiso SLA del ciclo | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · congelamiento y alerta de SLA | 6.5 Diagrama entidad-relación · política y alertas
- Referencia visual / plantilla en prototipo: Prototipo › Torre de Control [P-08 "Torre de Control CX"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Medir el cierre end-to-end de la experiencia

Escenario: CA-01 · Sin escalamiento
  Dado un ticket en Eje 2 sin escalar
  Cuando transcurren 72 horas hábiles sin cierre
  Entonces se marca en riesgo de incumplimiento.

Escenario: CA-02 · Con escalamiento
  Dado un ticket escalado a Eje 3
  Cuando se mide su cierre
  Entonces se compara contra el plazo del eje y no contra las 72 horas.
```

- Evidencia / prueba esperada (PLT-04): `Métrica tiempo_cierre_e2e`

## Reglas de negocio

- RN-SVC-025 (Cierre end-to-end en 72 horas habiles): El cierre end-to-end del ticket sin escalamiento debe completarse en 72 horas habiles; si hay escalamiento, aplica el plazo propio del eje correspondiente.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: SVC_TICKET, MAE_SLA_POLICY
- Entidades/campos que LEE: SVC_TICKET (apertura, escalamiento)
- Entidades/campos que ESCRIBE o modifica: marca de riesgo de cierre E2E
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
