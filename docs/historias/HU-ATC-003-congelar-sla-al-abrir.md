---
id: "HU-ATC-003"
tipo: hu
titulo: "Congelar el SLA del ticket al abrirlo"
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

Va en `docs/historias/HU-ATC-003-congelar-sla-al-abrir.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero que al abrir un ticket se elija la política SLA correcta y se congelen sus vencimientos en tiempo hábil para tener un compromiso estable que no cambie si la política se actualiza después.
- Requerimiento origen (RF-SVC-003 — Congelar el SLA al abrir): El sistema debe elegir la política SLA vigente por precedencia y congelar los vencimientos de 1.ª respuesta y resolución al abrir el ticket. · Proceso: PROC-SVC-001 (Registro multicanal del ticket) · Fuente: PLT-04 · HU-ATC-003 · traza RF-SVC-003
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **6 h** · Asignado: **Dev 2** (2026-10-21 → 2026-10-21) · Dependencias externas: DEP-03 (Decisión de negocio: matriz SLA por tipo y prioridad y plazos de línea de la Mesa SGD (RNF-REN-003)); DEP-04 (Calendario MAE_TIME + MAE_HOLIDAY por geografía)
- Observaciones de alcance: Fuera de alcance: Definición de los tiempos de la matriz (DEP-03).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · compromiso SLA del ciclo | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · congelamiento y alerta de SLA | 6.5 Diagrama entidad-relación · política y alertas
- Referencia visual / plantilla en prototipo: Prototipo › Nuevo ticket (panel «SLA que se congelará») [P-02 "Nuevo ticket"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Congelar el SLA del ticket al abrirlo

Escenario: CA-01 · Precedencia
  Dado un tipo con política específica (tipo+prioridad) y otra genérica activas
  Cuando se abre un ticket de esa prioridad
  Entonces se aplica la específica; si no existe, la genérica.

Escenario: CA-02 · Feriado
  Dado un ticket abierto el viernes a las 18:00 antes de un feriado, con base BUSINESS_HOURS
  Cuando se congela el SLA
  Entonces el vencimiento cae en horas hábiles posteriores y el ticket no nace incumplido.

Escenario: CA-03 · Cambio de política (agregado por el PO)
  Dado un ticket abierto con su SLA congelado
  Cuando se modifica la política
  Entonces los vencimientos del ticket no cambian.

Escenario: CA-04 · Sin política (agregado por el PO)
  Dado un tipo sin política activa
  Cuando se abre un ticket
  Entonces el sistema aplica la genérica global y registra una alerta de configuración.
```

- Evidencia / prueba esperada (PLT-04): `Evento sla_congelado {política, fr_due, res_due}`

## Reglas de negocio

- RN-SVC-001 (Precedencia SLA): Fila especifica (tipo+prioridad) precede a la generica (PriorityID NULL); maximo una generica activa por tipo (UNIQUEs parciales).
- RN-SVC-002 (Compromisos congelados): FirstResponseDueDateTime y ResolutionDueDateTime se calculan al abrir y NO se recalculan si la politica cambia despues.
- RN-SVC-003 (Dias habiles unicos): BUSINESS_HOURS/BUSINESS_DAYS se resuelven contra MAE_TIME.IsWeekend + MAE_HOLIDAY por geografia del establecimiento, nunca con formula propia del job.

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-008 MAE_SLA_POLICY, ENT-SVC-001 SVC_TICKET, ENT-REF-002 MAE_TIME
- Entidades y dependencias declaradas en PLT-04: MAE_SLA_POLICY, MAE_TIME, MAE_HOLIDAY · DEP-03, DEP-04
- Entidades/campos que LEE: política SLA vigente, MAE_TIME, MAE_HOLIDAY
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.FirstResponseDueDateTime, SVC_TICKET.ResolutionDueDateTime
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
