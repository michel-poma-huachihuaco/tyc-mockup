---
id: "HU-ATC-037"
tipo: hu
titulo: "Registrar el riesgo verbal y la secuencia de Frases Ancla"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-15", "EP-ATC-08", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-037-clasificacion-riesgo-verbal-frases-ancla.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-08 / docs/analisis/BRD.md
- Como moderador de evento quiero registrar la clasificación de riesgo y qué Frases Ancla apliqué para contener la insistencia antes de derivar formalmente.
- Requerimiento origen (RF-SVC-037 — Clasificacion de riesgo verbal y secuencia de Frases Ancla): El sistema debe registrar la clasificación de riesgo de la intervención en vivo y la secuencia de Frases Ancla (4, 5, 6) aplicada. · Proceso: PROC-SVC-014 (Contencion verbal y derivacion a Legal ante imputaciones en vivo (EntregaFest)) · Fuente: PLT-04 · HU-ATC-037 · traza RF-SVC-037
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **PODRIA** · Iteración: **I2** · Estimación: **2 h** · Asignado: **Dev 3** (2026-10-28 → 2026-10-28) · *Flexible* · Depende de HU: HU-ATC-025
- Observaciones de alcance: Fuera de alcance: Guion completo del moderador.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · intervención en vivo (EntregaFest) | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · derivación a Estación 4 | 6.5 Diagrama entidad-relación · casos del evento (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar el riesgo verbal y la secuencia de Frases Ancla

Escenario: CA-01 · Frase 4
  Dado un propietario que divaga
  Cuando aplico la Frase 4
  Entonces queda registrado el intento de concreción.

Escenario: CA-02 · Frase 6
  Dado un propietario que persiste tras la Frase 5
  Cuando aplico la Frase 6
  Entonces el sistema exige registrar el caso para cerrar el tema en sala.
```

- Evidencia / prueba esperada (PLT-04): `Evento frase_ancla {n}`

## Reglas de negocio

- RN-SVC-030 (Secuencia de contencion verbal 4-5-6): Ante insistencia de un propietario se aplica la secuencia Frase 4 (concrecion), Frase 5 (invocacion de reglas), Frase 6 (compromiso formal y registro del caso), en ese orden, antes de derivar.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › EntregaFest en vivo — Mockups: P-09 "EntregaFest en vivo" (Intervención en vivo y casos del bloque (tablet))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/entregafest/casos` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Entidad por modelar (R-06)
- Entidades/campos que LEE: catálogo de Frases Ancla
- Entidades/campos que ESCRIBE o modifica: SVC_EVENT_SENSITIVE_CASE (clasificación de riesgo, secuencia aplicada)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
