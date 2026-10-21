---
id: "HU-ATC-041"
tipo: hu
titulo: "Priorizar los reclamos con riesgo de denuncia por su exposición"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-16", "EP-ATC-10"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-041 — Priorizar los reclamos con riesgo de denuncia por su exposición

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-16
- Como coordinador CX quiero ver la exposición económica de cada reclamo con riesgo de denuncia y recibir una alerta antes del plazo para actuar antes de que el caso llegue a denuncia.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-041 | Debe | 4 h con IA | Dev 4 (Daniel) | 2 | 27-oct-2026 → 28-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe identificar los tickets con riesgo de escalar a denuncia o INDECOPI y calcular su exposición económica (monto reclamado + interés legal referencial del 8 %) para priorizarlos y alertar a Legal. Feedback presentación · ítem 16

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Cálculo de exposición
  Dado un reclamo con monto
  Cuando se registra o cambia
  Entonces el sistema calcula la exposición (monto + interés legal al día) y la muestra en el ticket y en la Torre de Control.

Escenario: CA-02 · Alerta a Legal
  Dado un ticket que supera el umbral de riesgo de denuncia
  Cuando se evalúa
  Entonces se marca como prioritario y se alerta a Legal antes del vencimiento del plazo.

Escenario: CA-03 · Sin monto (agregado por el PO)
  Dado un reclamo sin monto registrado
  Cuando se evalúa el riesgo
  Entonces la exposición se muestra como «por estimar» y el caso no se descarta de la priorización.
```

## Reglas de negocio

- RN-SVC-034 Exposición económica por denuncia
- RN-SVC-016 Clasificación de riesgo objetiva y recalibrable

**Fuera de alcance:** Cálculo de costas procesales.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Torre de Control (columna «exposición»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY · DEP-12
- Datos de prueba / analítica (PLT-04): Evento riesgo_denuncia {exposicion} Preguntas abiertas ¿El 8 % es la tasa de interés legal que Legal quiere usar o un referencial? ¿Qué señales definen riesgo de denuncia (reincidencia, monto, palabras, abogado)? ¿Umbral de alerta?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso legal y riesgo de denuncia
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · sincronización con Legal
- 6.5 Diagrama entidad-relación · caso legal y exposición

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
