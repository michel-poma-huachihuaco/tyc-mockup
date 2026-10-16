---
id: "HU-ATC-056"
tipo: hu
titulo: "Generar el caso de resolución de contrato por 3 meses impagos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-22", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-056-generar-caso-resolucion-contrato-3-meses-impagos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como job batch de ATC quiero generar automáticamente un ticket de resolución de contrato cuando un cliente acumula 3 meses (cuotas) sin pagar, o cuando se registra un reclamo con 3 meses de no pago, y derivarlo al flujo de resolución con Cobranza y Legal, para aplicar la cláusula resolutoria a tiempo y de forma trazable, sin depender de revisiones manuales.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Generar el caso por morosidad
  Dado un contrato con 3 cuotas vencidas e impagas
  Cuando el job diario corre
  Entonces el sistema crea un ticket de resolución de contrato y lo deriva a Cobranza y Legal
```

## Reglas de negocio

- RN-SVC-037: causal de resolución por 3 meses impagos; umbral parametrizable; causal validada por Legal.

## Datos (CAD-F5)

- Entidades/campos que LEE: estado de cuotas (Cobranza), reclamos con evidencia de no pago
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (tipo resolución de contrato)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
